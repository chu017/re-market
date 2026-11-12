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

import { parseArgs } from 'node:util';
import { monthsBetween, windows, writeDataset } from './lib.mjs';
import { MIN_PRICE, createMlsClient, credentials, parseCounties, pretty, propertyType } from './mls.mjs';

const { values: args } = parseArgs({
  options: {
    counties: { type: 'string' },
    refresh: { type: 'boolean', default: false },
    'cache-days': { type: 'string', default: '7' },
  },
});

const { base, token } = credentials();
const counties = parseCounties(args.counties);
const win = windows();
const mls = createMlsClient({ base, token, counties, today: win.fetch.end, refresh: args.refresh, cacheDays: Number(args['cache-days']) });

console.log(`Counties: ${counties.join(', ')}`);
console.log(`Fetching ${win.fetch.start}..${win.fetch.end}`);

const zips = {};
const zipVotes = {};
const sales = [];
const perCounty = {};
for (const month of monthsBetween(win.fetch.start, win.fetch.end)) {
  for (const r of await mls.fetchMonth(month)) {
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
console.log(`\n${sales.length} sales in ${Object.keys(zips).length} zips written to ${out} (${mls.calls()} API calls)`);
console.log(`By county (last 90 days): ${coverage}`);
