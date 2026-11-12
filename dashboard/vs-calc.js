// Pure calculations for the Homes vs. S&P 500 comparison. No DOM access, so the same file runs in the
// browser (window.VsCalc) and in Node tests (globalThis.VsCalc via `import './vs-calc.js'`).
//
// Conventions
// - Months are 'YYYY-MM' strings; dates are 'YYYY-MM-DD'.
// - Index = value / baseline × 100.
// - Only complete months are used. A year with fewer than 12 complete months is "partial" (YTD).
(function (root) {
  const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
  function median(a) {
    if (!a.length) return null;
    const s = [...a].sort((x, y) => x - y);
    const m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }

  /** The last month fully covered by data that runs through `through` ('YYYY-MM-DD'). */
  function lastCompleteMonth(through) {
    const d = new Date(`${through}T00:00:00Z`);
    const next = new Date(d.getTime() + 86_400_000);
    if (next.getUTCDate() === 1) return through.slice(0, 7); // `through` is a month's last day
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() - 1);
    return d.toISOString().slice(0, 7);
  }

  /** Calendar years over the given (complete) months: [{ year, months, partial }]. */
  function yearWindows(months) {
    const byYear = new Map();
    for (const m of months) {
      const y = m.slice(0, 4);
      if (!byYear.has(y)) byYear.set(y, []);
      byYear.get(y).push(m);
    }
    return [...byYear].map(([year, ms]) => ({ year, months: ms, partial: ms.length < 12 }));
  }

  /** The same calendar months one year earlier (e.g. Jan–Oct 2026 -> Jan–Oct 2025). */
  const samePeriodLastYear = (months) => months.map((m) => `${+m.slice(0, 4) - 1}${m.slice(4)}`);

  const indexOf = (value, base) => (value == null || !base ? null : (value / base) * 100);

  /** Compound annual growth; null unless both endpoints are positive and years > 0. */
  function cagr(start, end, years) {
    if (!(start > 0) || !(end > 0) || !(years > 0)) return null;
    return Math.pow(end / start, 1 / years) - 1;
  }

  /**
   * Annual level comparison (Mode A). `valueFor(months)` returns the level for a set of months
   * (e.g. average sale price of those months' sales, or average SPY close).
   * - Full years: index vs the base year; YoY vs the previous full year.
   * - Partial (YTD) year: YoY compares the SAME months of the previous year; the index is
   *   provisional and chain-linked: index(prev full year) × YTD / same-period-last-year, so
   *   seasonality in a partial year doesn't distort the level.
   */
  function annualLevels(months, valueFor) {
    const windows = yearWindows(months);
    const baseWin = windows.find((w) => !w.partial);
    if (!baseWin) return { base: null, rows: [] };
    const base = valueFor(baseWin.months);
    const rows = [];
    let prev = null;
    for (const w of windows) {
      if (w.year < baseWin.year) continue;
      const value = valueFor(w.months);
      let index, yoy = null, compare = null;
      if (!w.partial) {
        index = indexOf(value, base);
        if (prev && !prev.partial && value != null && prev.value) yoy = value / prev.value - 1;
      } else {
        const prior = samePeriodLastYear(w.months);
        const priorValue = valueFor(prior);
        compare = { months: prior, value: priorValue };
        if (value != null && priorValue) yoy = value / priorValue - 1;
        index = prev && prev.index != null && yoy != null ? prev.index * (1 + yoy) : null;
      }
      const row = { year: w.year, months: w.months, partial: w.partial, value, index, yoy, compare, provisional: w.partial };
      rows.push(row);
      prev = row;
    }
    return { base, baseYear: baseWin.year, rows };
  }

  /**
   * Point-to-point index from month-end values (Mode B, total return):
   * index(m) = value(m) / value(baseMonth) × 100, e.g. base = Dec 2014 close.
   */
  function pointIndex(values, baseMonth, months) {
    const base = values[baseMonth];
    return months.map((m) => indexOf(values[m] ?? null, base));
  }

  /**
   * Calendar-year returns from month-end values: Dec(y) / Dec(y-1) − 1. A partial final year returns
   * last complete month / Dec(y-1) − 1, flagged ytd.
   */
  function calendarReturns(values, months) {
    return yearWindows(months).map((w) => {
      const prevDec = `${+w.year - 1}-12`;
      const endMonth = w.months.at(-1);
      const a = values[prevDec], b = values[endMonth];
      return { year: w.year, endMonth, ytd: w.partial, ret: a && b ? b / a - 1 : null };
    });
  }

  // ---------- buyer-owner real estate estimate ----------

  /** Monthly payment on a fixed-rate loan. `annualRate` as a fraction (0.0385). */
  function mortgagePayment(principal, annualRate, years = 30) {
    const n = years * 12, i = annualRate / 12;
    if (!(principal > 0)) return 0;
    return i === 0 ? principal / n : (principal * i) / (1 - Math.pow(1 + i, -n));
  }

  /** Remaining balance after `paid` monthly payments. */
  function loanBalance(principal, annualRate, paid, years = 30) {
    const n = years * 12, i = annualRate / 12;
    if (!(principal > 0) || paid >= n) return 0;
    if (i === 0) return principal * (1 - paid / n);
    const pmt = mortgagePayment(principal, annualRate, years);
    return principal * Math.pow(1 + i, paid) - (pmt * (Math.pow(1 + i, paid) - 1)) / i;
  }

  /** Annual internal rate of return for yearly cash flows [t0, t1, ...]; null if no sign change. */
  function irr(flows) {
    const npv = (r) => flows.reduce((a, cf, t) => a + cf / Math.pow(1 + r, t), 0);
    let lo = -0.99, hi = 1;
    while (npv(hi) > 0 && hi < 1e3) hi *= 2;
    if (npv(lo) * npv(hi) > 0) return null;
    for (let k = 0; k < 200; k++) {
      const mid = (lo + hi) / 2;
      if (npv(lo) * npv(mid) <= 0) hi = mid;
      else lo = mid;
    }
    return (lo + hi) / 2;
  }

  /**
   * Estimated return for someone who buys a home and lives in it, as an investment.
   * values: home value at purchase and at the end of each year [V0, V1, ..., VN] (N years held).
   * rate: mortgage rate at purchase (fraction). a: assumptions (fractions):
   *   down, buyCost, sellCost, taxRate (of purchase price), taxGrowth (Prop 13 cap), insRate,
   *   maintRate (of value), rentYield (rent saved, of value).
   * Year t flow = rent saved − (P&I + property tax + insurance + maintenance), using the average of
   * the start and end value for that year. At the end: sale price − selling costs − loan balance.
   * Ignores income-tax effects (mortgage interest deduction, capital-gains exclusion), HOA and
   * refinancing.
   */
  function ownerReturn(values, rate, a) {
    const N = values.length - 1;
    if (N < 1 || !(values[0] > 0) || values.some((v) => !(v > 0)) || !(rate >= 0)) return null;
    const P0 = values[0];
    const loan = P0 * (1 - a.down);
    const pi = mortgagePayment(loan, rate) * 12;
    const initial = P0 * a.down + P0 * a.buyCost;
    const flows = [-initial];
    const totals = { mortgage: 0, tax: 0, insurance: 0, maintenance: 0, rent: 0 };
    for (let t = 1; t <= N; t++) {
      const avgV = (values[t - 1] + values[t]) / 2;
      const tax = P0 * a.taxRate * Math.pow(1 + a.taxGrowth, t - 1);
      const ins = avgV * a.insRate, maint = avgV * a.maintRate, rent = avgV * a.rentYield;
      totals.mortgage += pi; totals.tax += tax; totals.insurance += ins; totals.maintenance += maint; totals.rent += rent;
      flows.push(rent - pi - tax - ins - maint);
    }
    const balance = loanBalance(loan, rate, N * 12);
    const saleNet = values[N] * (1 - a.sellCost) - balance;
    // Cash put in (down payment, buying costs, yearly shortfalls) vs cash taken out (yearly
    // surpluses, sale proceeds); before adding the sale to the last year's flow.
    const ops = flows.slice(1);
    const invested = initial + ops.reduce((s, cf) => s + Math.max(0, -cf), 0);
    const received = ops.reduce((s, cf) => s + Math.max(0, cf), 0) + saleNet;
    flows[N] += saleNet;
    return {
      years: N, purchase: P0, sale: values[N], loan, balance, initial, saleNet, flows, totals,
      irr: irr(flows), multiple: invested > 0 ? received / invested : null, invested,
    };
  }

  root.VsCalc = {
    mean, median, lastCompleteMonth, yearWindows, samePeriodLastYear, indexOf, cagr, annualLevels, pointIndex, calendarReturns,
    mortgagePayment, loanBalance, irr, ownerReturn,
  };
})(typeof window !== 'undefined' ? window : globalThis);
