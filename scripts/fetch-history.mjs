// LOCAL ONLY. Downloads closed residential sales month by month since Jan 2015 (the MLS feed is
// complete from then on) plus the 30-yr mortgage rate, and writes data/history.js for the dashboard's
// "Long-term history" section.
//
//   npm run fetch:history
//   npm run fetch:history -- --from 2018-01 --counties "SantaClara,SanMateo"
//
// data/history.js is git-ignored and never copied into dist/ by build-site.mjs, and the dashboard only
// loads it when opened from file:// or localhost - so this section never appears online.
// The first run is ~3,000-4,000 requests; months that ended >180 days ago are then cached for 90 days.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { ROOT, monthsBetween, windows } from './lib.mjs';
import { MIN_PRICE, createMlsClient, credentials, parseCounties, pretty, propertyType } from './mls.mjs';

const { values: args } = parseArgs({
  options: {
    from: { type: 'string', default: '2015-01' },
    counties: { type: 'string' },
    refresh: { type: 'boolean', default: false },
  },
});
if (!/^\d{4}-\d{2}$/.test(args.from)) {
  console.error('--from must look like 2015-01');
  process.exit(1);
}

const { base, token } = credentials();
const counties = parseCounties(args.counties);
const today = windows().fetch.end;
const mls = createMlsClient({ base, token, counties, today, refresh: args.refresh });

const months = monthsBetween(`${args.from}-01`, today);
const TYPES = ['Single Family', 'Condo', 'Townhouse', 'Multi-Family', 'Other'];
console.log(`Counties: ${counties.join(', ')}`);
console.log(`Fetching history ${months[0]}..${months.at(-1)} (${months.length} months)`);

// Compact rows: a flat int array of [zipIndex, monthIndex, typeIndex, priceInThousands] quads.
const zipIndex = new Map();
const zipVotes = [];
const rows = [];
for (const [mi, month] of months.entries()) {
  for (const r of await mls.fetchMonth(month)) {
    const zip = String(r.PostalCode ?? '').slice(0, 5);
    if (!/^\d{5}$/.test(zip) || !(r.ClosePrice >= MIN_PRICE)) continue;
    if (!zipIndex.has(zip)) { zipIndex.set(zip, zipIndex.size); zipVotes.push({}); }
    const zi = zipIndex.get(zip);
    const vk = `${pretty(r.City)}|${pretty(r.CountyOrParish)}`;
    zipVotes[zi][vk] = (zipVotes[zi][vk] ?? 0) + 1;
    rows.push(zi, mi, TYPES.indexOf(propertyType(r)), Math.round(r.ClosePrice / 1000));
  }
}
// A zip can straddle cities; label it with the city most of its sales report.
const zips = [...zipIndex.keys()].map((zip, i) => {
  const [city, county] = Object.entries(zipVotes[i]).sort((a, b) => b[1] - a[1])[0][0].split('|');
  return [zip, city, county];
});

// Monthly-average 30-yr mortgage rate for the same span (Freddie Mac PMMS via FRED).
const rates = {};
try {
  const res = await fetch(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=MORTGAGE30US&cosd=${months[0]}-01`);
  if (!res.ok) throw new Error(`FRED ${res.status}`);
  const byMonth = {};
  for (const line of (await res.text()).trim().split(/\r?\n/).slice(1)) {
    const [date, v] = line.split(',');
    if (!v || v === '.') continue;
    (byMonth[date.slice(0, 7)] ??= []).push(Number(v));
  }
  for (const [m, vs] of Object.entries(byMonth)) rates[m] = Math.round((vs.reduce((a, b) => a + b, 0) / vs.length) * 1000) / 1000;
} catch (err) {
  console.warn(`Mortgage rates skipped: ${err.message}`);
}

const payload = { generatedAt: new Date().toISOString(), through: today, months, types: TYPES, zips, rows, rates };
mkdirSync(join(ROOT, 'data'), { recursive: true });
const out = join(ROOT, 'data', 'history.js');
writeFileSync(out, `window.HISTORY_DATA = ${JSON.stringify(payload)};\n`);
console.log(`\n${(rows.length / 4).toLocaleString()} sales, ${months.length} months written to ${out} (${mls.calls()} API calls) - local only`);
