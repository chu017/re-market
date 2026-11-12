// Pulls closed residential sales from the MLSListings RESO Web API (OData) and
// writes data/sales.js for the dashboard.
//
//   npm run fetch                                   default Bay Area counties
//   npm run fetch -- --counties "SantaClara,SanMateo,SantaCruz"
//   npm run fetch -- --refresh                      re-download every month
//
// Fetches month by month from Jan 1 of last year through today. Finished months are cached in
// data/raw/ for --cache-days (default 7); the current month is re-fetched once a day.
//
// Needs MLS_API_BASE and MLS_ACCESS_TOKEN in .env.

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { DAY_MS, ROOT, isoDate, loadEnv, monthsBetween, windows, writeDataset } from './lib.mjs';

// MLS enum values for CountyOrParish (no spaces). The nine Bay Area counties.
const BAY_AREA = ['SanFrancisco', 'SanMateo', 'SantaClara', 'Alameda', 'ContraCosta', 'Marin', 'Napa', 'Solano', 'Sonoma'];
const MIN_PRICE = 50_000; // drops nominal transfers that aren't market sales

const SELECT = ['ListingKeyNumeric', 'ListingId', 'ClosePrice', 'CloseDate', 'PostalCode', 'City', 'CountyOrParish', 'PropertyType', 'PropertySubType', 'LivingArea'];

const { values: args } = parseArgs({
  options: {
    counties: { type: 'string' },
    refresh: { type: 'boolean', default: false },
    'cache-days': { type: 'string', default: '7' },
  },
});

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

const counties = args.counties ? args.counties.split(',').map((s) => s.trim().replace(/\s+/g, '')) : BAY_AREA;
const win = windows();
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
 * All closed residential listings closing in [start, end]. The server caps pages at 50 rows and
 * its nextLink shrinks $top, so we page by key instead: ListingKeyNumeric gt <last seen>.
 */
async function fetchRange(start, end, label) {
  const filter = [
    "StandardStatus eq 'Closed'",
    `CloseDate ge ${start} and CloseDate le ${end}`,
    "PropertyType in ('Residential','ResidentialIncome')",
    `CountyOrParish in (${counties.map((c) => `'${c}'`).join(',')})`,
  ].join(' and ');
  const expected = (await get({ $filter: filter, $top: '0', $count: 'true' }))['@odata.count'];

  const rows = [];
  let last = 0;
  for (;;) {
    const page = await get({
      $filter: `${filter} and ListingKeyNumeric gt ${last}`,
      $orderby: 'ListingKeyNumeric',
      $select: SELECT.join(','),
      $top: '300',
    });
    if (!page.value?.length) break;
    rows.push(...page.value);
    last = page.value.at(-1).ListingKeyNumeric;
    if (process.stdout.isTTY) process.stdout.write(`\r  ${label}: ${rows.length}/${expected}`);
  }
  if (process.stdout.isTTY) process.stdout.write('\r');
  console.log(`  ${label}: ${rows.length} sales${rows.length !== expected ? ` (WARNING: server reported ${expected})` : ''}`);
  return rows;
}

/** One calendar month, from cache when fresh enough. */
async function fetchMonth(month) {
  const monthEnd = isoDate(new Date(Date.UTC(+month.slice(0, 4), +month.slice(5, 7), 0)));
  const start = `${month}-01`;
  const end = monthEnd < win.fetch.end ? monthEnd : win.fetch.end;
  const file = join(cacheDir, `mls-${counties.join('_')}-${month}.json`);
  if (!args.refresh && existsSync(file)) {
    const cached = JSON.parse(readFileSync(file, 'utf8'));
    const ageDays = (Date.now() - statSync(file).mtimeMs) / DAY_MS;
    // A finished month is good for cache-days; the running month only for the day it was fetched.
    if (cached.through === end && (end === monthEnd ? ageDays < Number(args['cache-days']) : cached.fetchedOn === win.fetch.end)) {
      console.log(`  ${month}: ${cached.rows.length} sales (cached)`);
      return cached.rows;
    }
  }
  const rows = await fetchRange(start, end, month);
  writeFileSync(file, JSON.stringify({ through: end, fetchedOn: win.fetch.end, rows }));
  return rows;
}

// "SantaClara" -> "Santa Clara", "PortolaValley" -> "Portola Valley"
const pretty = (s) => (s ?? '').replace(/([a-z])([A-Z])/g, '$1 $2').trim();

function propertyType(r) {
  if (r.PropertyType === 'ResidentialIncome') return 'Multi-Family';
  return { SingleFamilyResidence: 'Single Family', Condominium: 'Condo', Townhouse: 'Townhouse' }[r.PropertySubType] ?? 'Other';
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

console.log(`Counties: ${counties.join(', ')}`);
console.log(`Fetching ${win.fetch.start}..${win.fetch.end}`);

const zips = {};
const zipVotes = {};
const sales = [];
const perCounty = {};
for (const month of monthsBetween(win.fetch.start, win.fetch.end)) {
  for (const r of await fetchMonth(month)) {
    const zip = String(r.PostalCode ?? '').slice(0, 5);
    if (!/^\d{5}$/.test(zip) || !(r.ClosePrice >= MIN_PRICE)) continue;
    const county = pretty(r.CountyOrParish);
    const city = pretty(r.City);
    // A zip can straddle cities; label it with the city most of its sales report.
    const votes = (zipVotes[zip] ??= {});
    const vk = `${city}|${county}`;
    votes[vk] = (votes[vk] ?? 0) + 1;
    if (r.CloseDate.slice(0, 10) >= win.current.start) perCounty[county] = (perCounty[county] ?? 0) + 1;
    sales.push([zip, Math.round(r.ClosePrice), r.CloseDate.slice(0, 10), propertyType(r), r.LivingArea > 0 ? Math.round(r.LivingArea) : null]);
  }
}
for (const [zip, votes] of Object.entries(zipVotes)) {
  const [city, county] = Object.entries(votes).sort((a, b) => b[1] - a[1])[0][0].split('|');
  zips[zip] = { city, county };
}
const coverage = Object.entries(perCounty)
  .sort((a, b) => b[1] - a[1])
  .map(([c, n]) => `${c} ${n.toLocaleString()}`)
  .join(' · ');

const notes = [
  'Source: MLSListings RESO Web API (closed residential and residential-income listings).',
  `Sales in last 90 days by county: ${coverage}.`,
  'MLSListings mainly covers Santa Clara, San Mateo and Santa Cruz. SF, East Bay and North Bay sales listed only on SFAR, bridgeMLS or BAREIS are not included, so those counties are undercounted.',
];

const out = writeDataset({ source: 'MLSListings', zips, sales, win, notes });
console.log(`\n${sales.length} sales in ${Object.keys(zips).length} zips written to ${out} (${calls} API calls)`);
console.log(`By county (last 90 days): ${coverage}`);
