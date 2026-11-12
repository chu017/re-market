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

  root.VsCalc = { mean, median, lastCompleteMonth, yearWindows, samePeriodLastYear, indexOf, cagr, annualLevels, pointIndex, calendarReturns };
})(typeof window !== 'undefined' ? window : globalThis);
