import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const DAY_MS = 86_400_000;

// Current window = last 90 days; prior window = the same 90 days one year earlier.
export const WINDOW_DAYS = 90;
export const PRIOR_OFFSET_DAYS = 365;

export const PROPERTY_TYPES = ['Single Family', 'Condo', 'Townhouse', 'Multi-Family'];

/** Flattens config/bayarea-zips.json into { zip: { city, county } }. */
export function loadZips() {
  const cfg = JSON.parse(readFileSync(join(ROOT, 'config', 'bayarea-zips.json'), 'utf8'));
  const zips = {};
  for (const [county, cities] of Object.entries(cfg)) {
    for (const [city, list] of Object.entries(cities)) {
      for (const zip of list) zips[zip] = { city, county };
    }
  }
  return zips;
}

export function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

/**
 * Date windows as inclusive ISO dates, anchored on `asOf`.
 * - current/prior `start..end`: the rolling 90 days and the same 90 days one year earlier.
 * - current/prior `monthStart`: 1st of the month three months back (monthly comparison table).
 * - fetch: everything the dashboard needs - from Jan 1 of last year (full-year charts) or the
 *   prior monthStart, whichever is earlier, through today.
 */
export function windows(asOf = new Date()) {
  // Local calendar date (the Bay Area), not UTC - in the evening UTC is already tomorrow.
  const end = new Date(Date.UTC(asOf.getFullYear(), asOf.getMonth(), asOf.getDate()));
  const y = end.getUTCFullYear(), m = end.getUTCMonth();
  const start = new Date(end - (WINDOW_DAYS - 1) * DAY_MS);
  const shift = PRIOR_OFFSET_DAYS * DAY_MS;
  const priorMonthStart = new Date(Date.UTC(y - 1, m - 3, 1));
  const fetchStart = new Date(Math.min(Date.UTC(y - 1, 0, 1), priorMonthStart, start - shift));
  return {
    current: { monthStart: isoDate(new Date(Date.UTC(y, m - 3, 1))), start: isoDate(start), end: isoDate(end) },
    prior: { monthStart: isoDate(priorMonthStart), start: isoDate(new Date(start - shift)), end: isoDate(new Date(end - shift)) },
    fetch: { start: isoDate(fetchStart), end: isoDate(end) },
  };
}

/** ['YYYY-MM', ...] for every month touched by [start, end]. */
export function monthsBetween(start, end) {
  const out = [];
  for (let d = new Date(`${start.slice(0, 7)}-01T00:00:00Z`); isoDate(d) <= end; d.setUTCMonth(d.getUTCMonth() + 1)) {
    out.push(isoDate(d).slice(0, 7));
  }
  return out;
}

/** Loads KEY=value pairs from .env into process.env (no dependency on dotenv). */
export function loadEnv() {
  try {
    for (const line of readFileSync(join(ROOT, '.env'), 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    // no .env file - rely on the real environment
  }
}

/**
 * Writes data/sales.js as a plain script so dashboard/index.html works from file://.
 * Compact rows:
 *   sales    [zip, closePrice, closeDate, propertyType, sqft|null, daysOnMarket|null,
 *             listPrice|null, originalListPrice|null, onMarketDate|null, contractDate|null]
 *   cancels  [zip, listPrice, offMarketDate, propertyType, daysOnMarket|null, 'C'anceled|'W'ithdrawn|'X'pired,
 *             onMarketDate|null, originalListPrice|null]
 *   active   [zip, listPrice, onMarketDate|null, propertyType, daysOnMarket|null, 'A'ctive|'U'nder contract|'P'ending,
 *             originalListPrice|null, contractDate|null]
 * Dates are 'YYYY-MM-DD'. A null in a trailing column means the MLS left it blank.
 */
export function writeDataset({ source, zips, sales, cancels = [], active = [], win, notes = [] }) {
  const payload = {
    generatedAt: new Date().toISOString(),
    source,
    windows: win,
    zips,
    notes,
    sales,
    cancels,
    active,
  };
  mkdirSync(join(ROOT, 'data'), { recursive: true });
  const out = join(ROOT, 'data', 'sales.js');
  writeFileSync(out, `window.MARKET_DATA = ${JSON.stringify(payload)};\n`);
  return out;
}
