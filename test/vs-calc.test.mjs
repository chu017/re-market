// Tests for the Homes vs. S&P 500 calculations (dashboard/vs-calc.js). Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../dashboard/vs-calc.js';

const C = globalThis.VsCalc;
const close = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);
const monthsOf = (y, n = 12) => Array.from({ length: n }, (_, i) => `${y}-${String(i + 1).padStart(2, '0')}`);

test('lastCompleteMonth drops a running month and keeps a finished one', () => {
  assert.equal(C.lastCompleteMonth('2026-11-12'), '2026-10');
  assert.equal(C.lastCompleteMonth('2026-11-30'), '2026-11');
  assert.equal(C.lastCompleteMonth('2026-01-05'), '2025-12');
  assert.equal(C.lastCompleteMonth('2024-02-29'), '2024-02'); // leap day is the last day
});

test('yearWindows flags partial years', () => {
  const w = C.yearWindows([...monthsOf('2025'), ...monthsOf('2026', 10)]);
  assert.deepEqual(w.map((x) => [x.year, x.months.length, x.partial]), [['2025', 12, false], ['2026', 10, true]]);
});

test('index is value / base × 100 and the base year is 100', () => {
  assert.equal(C.indexOf(150, 100), 150);
  assert.equal(C.indexOf(null, 100), null);
  assert.equal(C.indexOf(5, 0), null);
  const months = [...monthsOf('2015'), ...monthsOf('2016')];
  const { rows } = C.annualLevels(months, (ms) => (ms[0].startsWith('2015') ? 200 : 250));
  assert.equal(rows[0].index, 100);
  assert.equal(rows[1].index, 125);
  close(rows[1].yoy, 0.25);
});

test('CAGR matches the compound formula and rejects undefined periods', () => {
  close(C.cagr(100, 200, 10), Math.pow(2, 0.1) - 1);
  close(C.cagr(100, 121, 2), 0.1);
  assert.equal(C.cagr(0, 100, 10), null);
  assert.equal(C.cagr(100, 200, 0), null);
  assert.equal(C.cagr(null, 200, 5), null);
});

test('YTD compares the same months of the prior year, not the full year', () => {
  // Monthly level = month number (Jan=1 .. Dec=12) + 100 * (year - 2015): strong seasonality.
  const level = (m) => +m.slice(5, 7) + 100 * (+m.slice(0, 4) - 2015);
  const valueFor = (ms) => C.mean(ms.map(level));
  const months = [...monthsOf('2015'), ...monthsOf('2016'), ...monthsOf('2017', 10)];
  const { rows } = C.annualLevels(months, valueFor);
  const ytd = rows.at(-1);
  assert.equal(ytd.partial, true);
  assert.deepEqual(ytd.compare.months, monthsOf('2016', 10));
  // Jan–Oct 2017 avg = 205.5, Jan–Oct 2016 avg = 105.5
  close(ytd.yoy, 205.5 / 105.5 - 1);
  // Comparing to full-year 2016 (106.5) would give a different, wrong answer
  assert.ok(Math.abs(ytd.yoy - (205.5 / 106.5 - 1)) > 1e-6);
  // Chain-linked provisional index = index(2016) × (1 + YTD YoY)
  close(ytd.index, rows[1].index * (205.5 / 105.5));
  assert.equal(ytd.provisional, true);
});

test('a partial first year is never used as the baseline', () => {
  const months = [...monthsOf('2014').slice(6), ...monthsOf('2015')]; // Jul–Dec 2014, then all of 2015
  const { baseYear, rows } = C.annualLevels(months, () => 10);
  assert.equal(baseYear, '2015');
  assert.equal(rows[0].year, '2015');
});

test('missing data yields null index and null YoY, not zero', () => {
  const months = [...monthsOf('2015'), ...monthsOf('2016')];
  const { rows } = C.annualLevels(months, (ms) => (ms[0].startsWith('2016') ? null : 10));
  assert.equal(rows[1].index, null);
  assert.equal(rows[1].yoy, null);
});

test('total-return index includes dividends; price index does not', () => {
  // Price flat at 100; adjusted close grows 0.25%/month from reinvested dividends.
  const months = ['2014-12', ...monthsOf('2015')];
  const price = Object.fromEntries(months.map((m) => [m, 100]));
  const adj = Object.fromEntries(months.map((m, i) => [m, 100 * Math.pow(1.0025, i)]));
  const p = C.pointIndex(price, '2014-12', monthsOf('2015'));
  const t = C.pointIndex(adj, '2014-12', monthsOf('2015'));
  assert.equal(p.at(-1), 100);
  close(t.at(-1), 100 * Math.pow(1.0025, 12));
  assert.ok(t.at(-1) > p.at(-1));
});

test('calendar returns run Dec to Dec, and YTD runs to the last complete month', () => {
  const values = { '2014-12': 100, '2015-12': 110, '2016-10': 121 };
  const months = [...monthsOf('2015'), ...monthsOf('2016', 10)];
  const r = C.calendarReturns(values, months);
  close(r[0].ret, 0.1);
  assert.equal(r[0].ytd, false);
  close(r[1].ret, 0.1);
  assert.equal(r[1].ytd, true);
  assert.equal(r[1].endMonth, '2016-10');
});

test('median handles even and odd counts', () => {
  assert.equal(C.median([3, 1, 2]), 2);
  assert.equal(C.median([4, 1, 3, 2]), 2.5);
  assert.equal(C.median([]), null);
});

test('mortgage payment and balance match the standard amortization formula', () => {
  close(C.mortgagePayment(100_000, 0.06), 599.5505251527569, 1e-6); // $100k, 6%, 30y
  close(C.mortgagePayment(120_000, 0), 120_000 / 360);
  close(C.loanBalance(100_000, 0.06, 0), 100_000, 1e-6);
  close(C.loanBalance(100_000, 0.06, 360), 0, 1e-6);
  const b = C.loanBalance(100_000, 0.06, 120);
  assert.ok(b > 80_000 && b < 85_000, `balance after 10y ${b}`); // ~83,685
});

test('IRR solves NPV = 0', () => {
  close(C.irr([-100, 110]), 0.1, 1e-7);
  close(C.irr([-100, 0, 121]), 0.1, 1e-7);
  close(C.irr([-1000, 300, 300, 300, 300]), 0.07714, 1e-4);
  assert.equal(C.irr([100, 100]), null); // no sign change
});

const NO_COSTS = { down: 1, buyCost: 0, sellCost: 0, taxRate: 0, taxGrowth: 0, insRate: 0, maintRate: 0, rentYield: 0 };

test('owner return with all cash and no costs equals price growth', () => {
  const r = C.ownerReturn([100, 121], 0.05, NO_COSTS);
  close(r.irr, 0.21, 1e-7);
  close(C.ownerReturn([100, 110, 121], 0.05, NO_COSTS).irr, 0.1, 1e-7);
  close(r.multiple, 1.21, 1e-9);
});

test('rent saved raises the return; costs and selling fees lower it', () => {
  const base = C.ownerReturn([100, 110, 121], 0.05, NO_COSTS).irr;
  assert.ok(C.ownerReturn([100, 110, 121], 0.05, { ...NO_COSTS, rentYield: 0.03 }).irr > base);
  assert.ok(C.ownerReturn([100, 110, 121], 0.05, { ...NO_COSTS, maintRate: 0.01 }).irr < base);
  assert.ok(C.ownerReturn([100, 110, 121], 0.05, { ...NO_COSTS, sellCost: 0.05 }).irr < base);
});

test('leverage amplifies returns when growth beats the loan rate', () => {
  const cash = C.ownerReturn([100, 110, 121], 0.03, NO_COSTS).irr;
  const levered = C.ownerReturn([100, 110, 121], 0.03, { ...NO_COSTS, down: 0.2 });
  assert.ok(levered.irr > cash, `${levered.irr} vs ${cash}`);
  close(levered.loan, 80);
  assert.ok(levered.balance > 0 && levered.balance < 80);
});

test('owner return rejects incomplete inputs', () => {
  assert.equal(C.ownerReturn([100], 0.05, NO_COSTS), null);
  assert.equal(C.ownerReturn([100, null], 0.05, NO_COSTS), null);
  assert.equal(C.ownerReturn([0, 100], 0.05, NO_COSTS), null);
});
