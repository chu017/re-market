// Pulls closed residential sales, cancelled/withdrawn/expired listings and today's active and
// pending inventory from the MLSListings RESO Web API (OData), and writes data/sales.js for the dashboard.
//
//   npm run fetch                                   default Bay Area counties
//   npm run fetch -- --counties "SantaClara,SanMateo,SantaCruz"
//   npm run fetch -- --refresh                      re-download every month
//   npm run fetch -- --concurrency 1                one request at a time (default 6, or MLS_CONCURRENCY)
//
// Fetches month by month from Jan 1 of last year through today. Finished months are cached in
// data/raw/ for --cache-days (default 7); the current month is re-fetched once a day.
//
// Needs MLS_API_BASE and MLS_ACCESS_TOKEN in .env.

import { parseArgs } from 'node:util';
import { mapLimit, monthsBetween, windows, writeDataset } from './lib.mjs';
import { MIN_PRICE, createMlsClient, credentials, parseCounties, pretty, propertyType } from './mls.mjs';

const { values: args } = parseArgs({
  options: {
    counties: { type: 'string' },
    refresh: { type: 'boolean', default: false },
    'cache-days': { type: 'string', default: '7' },
    // Parallel downloads. MLS_CONCURRENCY in the environment (e.g. on Cloudflare) overrides the default.
    concurrency: { type: 'string', default: process.env.MLS_CONCURRENCY || '6' },
  },
});

const { base, token } = credentials();
const counties = parseCounties(args.counties);
const win = windows();
const concurrency = Math.max(1, Number(args.concurrency) || 1);
const mls = createMlsClient({ base, token, counties, today: win.fetch.end, refresh: args.refresh, cacheDays: Number(args['cache-days']), progress: concurrency === 1 });

console.log(`Counties: ${counties.join(', ')}`);
console.log(`Fetching ${win.fetch.start}..${win.fetch.end}`);

const zips = {};
const zipVotes = {};
const sales = [];
const cancels = [];
const active = [];
const perCounty = {};
const dom = (r) => (r.DaysOnMarket >= 0 ? r.DaysOnMarket : null);
const day = (v) => v?.slice(0, 10) ?? null;
const price = (v) => (v >= MIN_PRICE ? Math.round(v) : null);
/** 5-digit zip of a row, counting its city toward the zip's label; null if unusable. */
function zipOf(r) {
  const zip = String(r.PostalCode ?? '').slice(0, 5);
  if (!/^\d{5}$/.test(zip)) return null;
  // A zip can straddle cities; label it with the city most of its listings report.
  const votes = (zipVotes[zip] ??= {});
  const vk = `${pretty(r.City)}|${pretty(r.CountyOrParish)}`;
  votes[vk] = (votes[vk] ?? 0) + 1;
  return zip;
}
const STATUS = { Canceled: 'C', Withdrawn: 'W', Expired: 'X', Active: 'A', ActiveUnderContract: 'U', Pending: 'P' };
// Download everything first, several requests at a time (the API is slow per call, not per volume),
// then process in month order so the output is the same as a sequential run.
const months = monthsBetween(win.fetch.start, win.fetch.end);
const jobs = [['active'], ...months.flatMap((m) => [[m, 'cancels'], [m, 'sales']])];
const t0 = Date.now();
const results = await mapLimit(jobs, concurrency, ([m, kind]) => (m === 'active' ? mls.fetchActive() : mls.fetchMonth(m, kind)));
const got = (m, kind) => results[jobs.findIndex(([jm, jk]) => jm === m && jk === kind)];
console.log(`Downloaded in ${Math.round((Date.now() - t0) / 1000)}s`);
for (const month of months) {
  for (const r of got(month, 'sales')) {
    if (!(r.ClosePrice >= MIN_PRICE)) continue;
    const zip = zipOf(r);
    if (!zip) continue;
    const county = pretty(r.CountyOrParish);
    if (r.CloseDate.slice(0, 10) >= win.current.start) perCounty[county] = (perCounty[county] ?? 0) + 1;
    sales.push([zip, Math.round(r.ClosePrice), r.CloseDate.slice(0, 10), propertyType(r), r.LivingArea > 0 ? Math.round(r.LivingArea) : null, dom(r),
      price(r.ListPrice), price(r.OriginalListPrice), day(r.OnMarketDate), day(r.PurchaseContractDate)]);
  }
  for (const r of got(month, 'cancels')) {
    // 0-day records are almost all same-day cancel-and-relist corrections, not real cancellations.
    if (!r.OffMarketDate || r.DaysOnMarket === 0 || !(r.ListPrice >= MIN_PRICE)) continue;
    const zip = zipOf(r);
    if (zip) cancels.push([zip, Math.round(r.ListPrice), day(r.OffMarketDate), propertyType(r), dom(r), STATUS[r.StandardStatus], day(r.OnMarketDate), price(r.OriginalListPrice)]);
  }
}
for (const r of got('active')) {
  if (!(r.ListPrice >= MIN_PRICE)) continue;
  const zip = zipOf(r);
  if (zip) active.push([zip, Math.round(r.ListPrice), day(r.OnMarketDate), propertyType(r), dom(r), STATUS[r.StandardStatus], price(r.OriginalListPrice), day(r.PurchaseContractDate)]);
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
  'Source: MLSListings RESO Web API (residential and residential-income listings).',
  'Active listings are a snapshot as of the last update; pending includes active-under-contract. Cancelled counts canceled, withdrawn and expired listings by the day they came off the market, excluding same-day cancel-and-relist records. Days on market is the MLS DaysOnMarket of each closed sale. Over list and sale-to-list use the final list price; price reductions compare it with the original list price. Last year\'s active and pending counts are rebuilt from listing on-market, contract and off-market dates.',
  `Sales in last 90 days by county: ${coverage}.`,
  'MLSListings mainly covers Santa Clara, San Mateo and Santa Cruz. SF, East Bay and North Bay sales listed only on SFAR, bridgeMLS or BAREIS are not included, so those counties are undercounted.',
];

const out = writeDataset({ source: 'MLSListings', zips, sales, cancels, active, win, notes });
console.log(`\n${sales.length} sales in ${Object.keys(zips).length} zips written to ${out} (${mls.calls()} API calls)`);
console.log(`By county (last 90 days): ${coverage}`);
