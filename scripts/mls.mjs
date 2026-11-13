// Shared MLSListings RESO Web API (OData) client, used by fetch-mls.mjs and fetch-history.mjs.

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DAY_MS, ROOT, isoDate, loadEnv } from './lib.mjs';

// MLS enum values for CountyOrParish (no spaces). The nine Bay Area counties.
export const BAY_AREA = ['SanFrancisco', 'SanMateo', 'SantaClara', 'Alameda', 'ContraCosta', 'Marin', 'Napa', 'Solano', 'Sonoma'];
export const MIN_PRICE = 50_000; // drops nominal transfers that aren't market sales

const SELECT = ['ListingKeyNumeric', 'ListingId', 'ClosePrice', 'CloseDate', 'PostalCode', 'City', 'CountyOrParish', 'PropertyType', 'PropertySubType', 'LivingArea'];
const SALE_TYPES = "('Residential','ResidentialIncome')";
const LISTING = ['ListingKeyNumeric', 'ListPrice', 'PostalCode', 'City', 'CountyOrParish', 'PropertyType', 'PropertySubType', 'DaysOnMarket', 'StandardStatus'];
// List prices and market dates: overbidding, price cuts, and rebuilding past inventory from
// each listing's on-market -> under-contract (or off-market) span.
const MARKET = ['DaysOnMarket', 'ListPrice', 'OriginalListPrice', 'OnMarketDate', 'PurchaseContractDate'];
// What each kind of fetch asks for. For leases, ClosePrice is the agreed monthly rent.
// `date` is the field a month is selected by.
const KINDS = {
  sales: { types: SALE_TYPES, status: "('Closed')", date: 'CloseDate', cachePrefix: 'mls', select: [...SELECT, ...MARKET] },
  leases: { types: "('ResidentialLease')", status: "('Closed')", date: 'CloseDate', cachePrefix: 'mls-lease', select: [...SELECT, 'ListPrice', 'BedroomsTotal'] },
  // Listings taken off the market without selling, by the day they came off.
  cancels: { types: SALE_TYPES, status: "('Canceled','Withdrawn','Expired')", date: 'OffMarketDate', cachePrefix: 'mls-cancel', select: [...LISTING, 'OffMarketDate', 'OnMarketDate', 'OriginalListPrice'] },
  // Today's inventory: for sale, or under contract and not yet closed. Not date-bound.
  active: { types: SALE_TYPES, status: "('Active','ActiveUnderContract','Pending')", cachePrefix: 'mls-active', select: [...LISTING, 'OnMarketDate', 'OriginalListPrice', 'PurchaseContractDate'] },
};

// "SantaClara" -> "Santa Clara", "PortolaValley" -> "Portola Valley"
export const pretty = (s) => (s ?? '').replace(/([a-z])([A-Z])/g, '$1 $2').trim();

export function propertyType(r) {
  if (r.PropertyType === 'ResidentialIncome') return 'Multi-Family';
  return { SingleFamilyResidence: 'Single Family', Condominium: 'Condo', Townhouse: 'Townhouse' }[r.PropertySubType] ?? 'Other';
}

export const parseCounties = (arg) => (arg ? arg.split(',').map((s) => s.trim().replace(/\s+/g, '')) : BAY_AREA);

/** Reads credentials from the environment / .env, exiting with a clear message if missing. */
export function credentials() {
  loadEnv();
  const { MLS_API_BASE: base, MLS_ACCESS_TOKEN: token } = process.env;
  if (!base || !token) {
    // Report presence only - never print values.
    const state = (v) => (v ? 'set' : 'MISSING');
    console.error(`MLS_API_BASE: ${state(base)} · MLS_ACCESS_TOKEN: ${state(token)}`);
    console.error('Both must be set as environment variables (on Cloudflare: Settings -> Build -> Variables and secrets), or in .env when running locally.');
    process.exit(1);
  }
  warnIfTokenExpiring(token);
  return { base, token };
}

function warnIfTokenExpiring(jwt) {
  try {
    const { exp } = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url'));
    const days = (exp * 1000 - Date.now()) / DAY_MS;
    if (days < 0) console.warn('WARNING: MLS_ACCESS_TOKEN has expired.');
    else if (days < 14) console.warn(`WARNING: MLS_ACCESS_TOKEN expires in ${Math.floor(days)} days.`);
  } catch {
    // not a JWT - nothing to check
  }
}

/**
 * Month-by-month fetcher with an on-disk cache in data/raw/.
 * - A finished month is reused for `cacheDays`, or `oldCacheDays` once it ended more than 180 days ago
 *   (old months rarely change, so a long history doesn't re-download every week).
 * - The running month is reused only on the day it was fetched.
 * - With strictFields, a cached month missing a field the kind now selects is re-downloaded.
 */
export function createMlsClient({ base, token, counties, today, refresh = false, cacheDays = 7, oldCacheDays = 90, strictFields = true }) {
  const cacheDir = join(ROOT, 'data', 'raw');
  mkdirSync(cacheDir, { recursive: true });
  let calls = 0;

  async function get(params, attempt = 0) {
    calls++;
    const res = await fetch(`${base.replace(/\/$/, '')}/Property?${new URLSearchParams(params)}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    if ((res.status === 429 || res.status >= 500) && attempt < 4) {
      await new Promise((r) => setTimeout(r, 2 ** attempt * 2000));
      return get(params, attempt + 1);
    }
    const body = await res.json().catch(() => ({}));
    if (res.status === 401 || res.status === 403) throw new Error(`MLS API rejected the token (${res.status}). Is MLS_ACCESS_TOKEN expired?`);
    if (!res.ok) throw new Error(`MLS API ${res.status}: ${body?.error?.message ?? JSON.stringify(body).slice(0, 300)}`);
    return body;
  }

  /**
   * All listings of `kind` whose date field falls in [start, end] (every current one for 'active').
   * The server caps pages at 50 rows and its nextLink shrinks $top, so we page by key instead:
   * ListingKeyNumeric gt <last seen>.
   */
  async function fetchRange(start, end, label, kind = 'sales') {
    const k = KINDS[kind];
    const filter = [
      `StandardStatus in ${k.status}`,
      ...(k.date ? [`${k.date} ge ${start} and ${k.date} le ${end}`] : []),
      `PropertyType in ${k.types}`,
      `CountyOrParish in (${counties.map((c) => `'${c}'`).join(',')})`,
    ].join(' and ');
    const expected = (await get({ $filter: filter, $top: '0', $count: 'true' }))['@odata.count'];

    const rows = [];
    let last = 0;
    for (;;) {
      const page = await get({
        $filter: `${filter} and ListingKeyNumeric gt ${last}`,
        $orderby: 'ListingKeyNumeric',
        $select: k.select.join(','),
        $top: '300',
      });
      if (!page.value?.length) break;
      rows.push(...page.value);
      last = page.value.at(-1).ListingKeyNumeric;
      if (process.stdout.isTTY) process.stdout.write(`\r  ${label}: ${rows.length}/${expected}`);
    }
    if (process.stdout.isTTY) process.stdout.write('\r');
    console.log(`  ${label}: ${rows.length} ${kind}${rows.length !== expected ? ` (WARNING: server reported ${expected})` : ''}`);
    return rows;
  }

  const cacheFile = (kind, suffix) => join(cacheDir, `${KINDS[kind].cachePrefix}-${counties.join('_')}-${suffix}.json`);
  const hasFields = (cached, kind) => !strictFields || KINDS[kind].select.every((f) => cached.select?.includes(f));

  /** One calendar month ('YYYY-MM') of 'sales', 'leases' or 'cancels', from cache when fresh enough. */
  async function fetchMonth(month, kind = 'sales') {
    const monthEnd = isoDate(new Date(Date.UTC(+month.slice(0, 4), +month.slice(5, 7), 0)));
    const end = monthEnd < today ? monthEnd : today;
    const file = cacheFile(kind, month);
    if (!refresh && existsSync(file)) {
      const cached = JSON.parse(readFileSync(file, 'utf8'));
      const ageDays = (Date.now() - statSync(file).mtimeMs) / DAY_MS;
      const isOld = (Date.parse(today) - Date.parse(monthEnd)) / DAY_MS > 180;
      const fresh = end === monthEnd ? ageDays < (isOld ? oldCacheDays : cacheDays) : cached.fetchedOn === today;
      if (cached.through === end && fresh && hasFields(cached, kind)) {
        console.log(`  ${month}: ${cached.rows.length} ${kind} (cached)`);
        return cached.rows;
      }
    }
    const rows = await fetchRange(`${month}-01`, end, kind === 'sales' ? month : `${month} ${kind}`, kind);
    writeFileSync(file, JSON.stringify({ through: end, fetchedOn: today, select: KINDS[kind].select, rows }));
    return rows;
  }

  /** Every listing currently for sale or under contract; cached for the day. */
  async function fetchActive() {
    const file = cacheFile('active', 'snapshot');
    if (!refresh && existsSync(file)) {
      const cached = JSON.parse(readFileSync(file, 'utf8'));
      if (cached.fetchedOn === today && hasFields(cached, 'active')) {
        console.log(`  active: ${cached.rows.length} listings (cached)`);
        return cached.rows;
      }
    }
    const rows = await fetchRange(null, null, 'active listings', 'active');
    writeFileSync(file, JSON.stringify({ fetchedOn: today, select: KINDS.active.select, rows }));
    return rows;
  }

  return { fetchMonth, fetchActive, calls: () => calls };
}
