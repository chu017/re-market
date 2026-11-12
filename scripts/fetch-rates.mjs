// Downloads the weekly 30-year fixed mortgage rate (Freddie Mac PMMS, via FRED - no key needed)
// and writes data/rates.js for the dashboard.
//
//   npm run fetch:rates        (also runs as part of `npm run fetch`)

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, windows } from './lib.mjs';

const SERIES = 'MORTGAGE30US';
const win = windows();
// One extra month before the sales window so the first month has a month-over-month change.
const from = new Date(`${win.fetch.start}T00:00:00Z`);
from.setUTCMonth(from.getUTCMonth() - 1);
const url = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${SERIES}&cosd=${from.toISOString().slice(0, 10)}`;

const res = await fetch(url);
if (!res.ok) {
  console.error(`FRED ${res.status}: ${(await res.text()).slice(0, 200)}`);
  process.exit(1);
}
const weekly = (await res.text())
  .trim()
  .split(/\r?\n/)
  .slice(1)
  .map((line) => line.split(','))
  .filter(([date, v]) => /^\d{4}-\d{2}-\d{2}$/.test(date) && v && v !== '.')
  .map(([date, v]) => [date, Number(v)]);
if (!weekly.length) {
  console.error('FRED returned no observations.');
  process.exit(1);
}

const payload = {
  generatedAt: new Date().toISOString(),
  series: SERIES,
  label: '30-yr fixed mortgage rate',
  source: 'Freddie Mac Primary Mortgage Market Survey, via FRED',
  weekly,
};
mkdirSync(join(ROOT, 'data'), { recursive: true });
const out = join(ROOT, 'data', 'rates.js');
writeFileSync(out, `window.RATE_DATA = ${JSON.stringify(payload)};\n`);
const [lastDate, lastRate] = weekly.at(-1);
console.log(`${weekly.length} weekly rates (${weekly[0][0]}..${lastDate}, latest ${lastRate}%) written to ${out}`);
