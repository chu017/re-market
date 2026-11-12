// Generates a synthetic dataset so the dashboard can be previewed without an API key.
//   npm run mock

import { DAY_MS, loadZips, windows, writeDataset } from './lib.mjs';

// Deterministic PRNG so the demo looks the same between runs.
let seed = 42;
const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const gauss = () => Math.sqrt(-2 * Math.log(rand() || 1e-9)) * Math.cos(2 * Math.PI * rand());

const COUNTY_MEDIAN = {
  'San Francisco': 1_450_000,
  'San Mateo': 1_900_000,
  'Santa Clara': 1_850_000,
  Alameda: 1_250_000,
  'Contra Costa': 950_000,
  Marin: 1_600_000,
};
const TYPES = [['Single Family', 0.68, 1], ['Condo', 0.2, 0.55], ['Townhouse', 0.1, 0.75], ['Multi-Family', 0.02, 1.2]];

function pickType() {
  let r = rand();
  for (const t of TYPES) if ((r -= t[1]) <= 0) return t;
  return TYPES[0];
}

const zips = loadZips();
const win = windows();
const sales = [];

for (const [zip, { county }] of Object.entries(zips)) {
  const zipMedian = COUNTY_MEDIAN[county] * Math.exp(gauss() * 0.35);
  const volume = Math.round(15 + rand() * 60);
  const volumeYoY = 1 + gauss() * 0.18;
  const priceYoY = 1 + 0.03 + gauss() * 0.05;

  // ~volume sales per 90 days this year; last year scaled by volumeYoY / priceYoY. Spring peaks.
  const start = Date.parse(win.fetch.start);
  const days = (Date.parse(win.fetch.end) - start) / DAY_MS + 1;
  const thisYear = win.fetch.end.slice(0, 4);
  for (let d = 0; d < days; d++) {
    const date = new Date(start + d * DAY_MS).toISOString().slice(0, 10);
    const isThisYear = date.startsWith(thisYear);
    const season = 1 + 0.25 * Math.sin(((+date.slice(5, 7) - 2) / 12) * 2 * Math.PI);
    const perDay = ((isThisYear ? volume : volume / volumeYoY) / 90) * season;
    const priceMult = isThisYear ? 1 : 1 / priceYoY;
    for (let i = 0; i < Math.floor(perDay + rand()); i++) {
      const [type, , typeMult] = pickType();
      const price = Math.round((zipMedian * typeMult * priceMult * Math.exp(gauss() * 0.28)) / 1000) * 1000;
      const sqft = Math.round((price / (900 + rand() * 600)) / 10) * 10;
      sales.push([zip, price, date, type, sqft]);
    }
  }
}

const out = writeDataset({
  source: 'mock',
  zips,
  sales,
  win,
  notes: ['SYNTHETIC DEMO DATA - run `npm run fetch` with a RentCast API key for real sales.'],
});
console.log(`${sales.length} synthetic sales written to ${out}`);
