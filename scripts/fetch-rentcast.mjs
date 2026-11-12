// Pulls closed sales per Bay Area zip from the RentCast /properties API and
// writes data/sales.js for the dashboard.
//
//   npm run fetch                              all zips in config/bayarea-zips.json
//   npm run fetch -- --counties "San Mateo,Santa Clara"
//   npm run fetch -- --zips 94301,94022 --refresh
//   npm run fetch -- --max-calls 100           hard cap on API requests this run
//
// Raw responses are cached in data/raw/ (default 7 days) so re-runs don't burn quota.

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { DAY_MS, PROPERTY_TYPES, ROOT, loadEnv, loadZips, windows, writeDataset } from './lib.mjs';

const API = 'https://api.rentcast.io/v1/properties';
const PAGE_SIZE = 500; // RentCast maximum
const MIN_PRICE = 50_000; // drops $0 / nominal transfers that aren't market sales

const { values: args } = parseArgs({
  options: {
    counties: { type: 'string' },
    zips: { type: 'string' },
    refresh: { type: 'boolean', default: false },
    'cache-days': { type: 'string', default: '7' },
    'max-calls': { type: 'string', default: '1000' },
  },
});

loadEnv();
const apiKey = process.env.RENTCAST_API_KEY;
if (!apiKey) {
  console.error('RENTCAST_API_KEY is not set. Copy .env.example to .env and add your key (or run `npm run mock`).');
  process.exit(1);
}

const allZips = loadZips();
const countyFilter = args.counties?.split(',').map((s) => s.trim().toLowerCase());
const zipFilter = args.zips?.split(',').map((s) => s.trim());
const zips = Object.fromEntries(
  Object.entries(allZips).filter(
    ([zip, { county }]) =>
      (!zipFilter || zipFilter.includes(zip)) && (!countyFilter || countyFilter.includes(county.toLowerCase())),
  ),
);
if (!Object.keys(zips).length) {
  console.error('No zips matched the --zips / --counties filter.');
  process.exit(1);
}

const win = windows();
// One days-ago range for RentCast's saleDateRange covering the whole fetch window (padded a
// day); exact date filtering happens on the returned sale dates.
const daysAgo = (iso) => Math.round((Date.parse(win.fetch.end) - Date.parse(iso)) / DAY_MS);
const queries = { all: `*:${daysAgo(win.fetch.start) + 1}` };

const cacheDir = join(ROOT, 'data', 'raw');
mkdirSync(cacheDir, { recursive: true });
const cacheMs = Number(args['cache-days']) * DAY_MS;
const maxCalls = Number(args['max-calls']);
let calls = 0;

async function request(params, attempt = 0) {
  if (calls >= maxCalls) throw new BudgetError();
  calls++;
  const res = await fetch(`${API}?${new URLSearchParams(params)}`, {
    headers: { 'X-Api-Key': apiKey, Accept: 'application/json' },
  });
  if (res.status === 429 && attempt < 4) {
    const wait = 2 ** attempt * 2000;
    console.warn(`  rate limited, retrying in ${wait / 1000}s`);
    await new Promise((r) => setTimeout(r, wait));
    calls--;
    return request(params, attempt + 1);
  }
  if (res.status === 404) return []; // RentCast returns 404 when nothing matches
  if (res.status === 401 || res.status === 403) {
    throw new Error(`RentCast rejected the API key (${res.status}): ${await res.text()}`);
  }
  if (!res.ok) throw new Error(`RentCast ${res.status}: ${await res.text()}`);
  return res.json();
}

class BudgetError extends Error {
  constructor() {
    super('max-calls budget reached');
  }
}

/** All property records for one zip + window, from cache when fresh. */
async function fetchZip(zip, windowKey) {
  const file = join(cacheDir, `${zip}-${windowKey}-${win.fetch.start}-${win.fetch.end}.json`);
  if (!args.refresh && existsSync(file) && Date.now() - statSync(file).mtimeMs < cacheMs) {
    return { records: JSON.parse(readFileSync(file, 'utf8')), cached: true };
  }
  const records = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const page = await request({
      zipCode: zip,
      saleDateRange: queries[windowKey],
      propertyType: PROPERTY_TYPES.join('|'),
      limit: String(PAGE_SIZE),
      offset: String(offset),
    });
    records.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  writeFileSync(file, JSON.stringify(records));
  return { records, cached: false };
}

/** Sale events from a record that fall inside [start, end]. Uses history + lastSale*. */
function salesInWindow(rec, { start, end }) {
  const events = [];
  if (rec.lastSaleDate && rec.lastSalePrice) events.push({ date: rec.lastSaleDate, price: rec.lastSalePrice });
  for (const h of Object.values(rec.history ?? {})) {
    if (h?.event === 'Sale' && h.price && h.date) events.push({ date: h.date, price: h.price });
  }
  const seen = new Set();
  return events
    .map((e) => ({ date: e.date.slice(0, 10), price: Math.round(e.price) }))
    .filter((e) => e.date >= start && e.date <= end && e.price >= MIN_PRICE)
    .filter((e) => !seen.has(e.date) && seen.add(e.date));
}

const sales = [];
const seenSale = new Set();
const failed = [];
const zipList = Object.keys(zips);
console.log(`Fetching ${zipList.length} zips, sales ${win.fetch.start}..${win.fetch.end}`);

outer: for (const [i, zip] of zipList.entries()) {
  for (const windowKey of ['all']) {
    try {
      const { records, cached } = await fetchZip(zip, windowKey);
      let n = 0;
      for (const rec of records) {
        if (rec.zipCode && rec.zipCode !== zip) continue;
        // `history` also recovers earlier sales of homes that have resold since.
        for (const s of salesInWindow(rec, win.fetch)) {
          const key = `${rec.id}|${s.date}`;
          if (seenSale.has(key)) continue;
          seenSale.add(key);
          sales.push([zip, s.price, s.date, rec.propertyType ?? 'Unknown', rec.squareFootage ?? null]);
          n++;
        }
      }
      console.log(`[${i + 1}/${zipList.length}] ${zip} ${zips[zip].city} ${windowKey}: ${n} sales${cached ? ' (cached)' : ''}`);
    } catch (err) {
      if (err instanceof BudgetError) {
        console.warn(`Stopped: --max-calls ${maxCalls} reached. Re-run to continue (cached zips are free).`);
        break outer;
      }
      if (/API key/.test(err.message)) {
        console.error(err.message);
        process.exit(1);
      }
      console.warn(`  ${zip} ${windowKey} failed: ${err.message}`);
      failed.push(`${zip}/${windowKey}`);
    }
  }
}

const notes = [
  'Source: RentCast property records (county recorder data). Recent weeks may be under-counted because recorder data lags closings.',
  'Prior-year counts include only properties whose most recent recorded sale history covers that window.',
];
if (failed.length) notes.push(`Fetch failed for: ${failed.join(', ')}`);

const out = writeDataset({ source: 'rentcast', zips, sales, win, notes });
console.log(`\n${sales.length} sales written to ${out} (${calls} API calls this run)`);
