/* global Chart */
(() => {
  const $ = (sel) => document.querySelector(sel);

  // ---------- icons (Lucide-style, stroke = currentColor) ----------
  const ICONS = {
    house: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r="1.2" fill="currentColor"/>',
    bars: '<path d="M6 20v-6"/><path d="M12 20V10"/><path d="M18 20V4"/>',
    layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    reset: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14a8 3 0 0 0 16 0V5"/><path d="M4 12a8 3 0 0 0 16 0"/>',
    sparkle: '<path d="M12 3c.4 4.6 2.4 6.6 7 7-4.6.4-6.6 2.4-7 7-.4-4.6-2.4-6.6-7-7 4.6-.4 6.6-2.4 7-7z"/>',
    table: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 9v12"/>',
    trend: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    pin: '<path d="M20 10c0 5-5.5 10.2-7.4 11.8a1 1 0 0 1-1.2 0C9.5 20.2 4 15 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    tv: '<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>',
    exit: '<path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3.5 2"/>',
    key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>',
    list: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
    pending: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="m9 15 2 2 4-4"/>',
    ban: '<circle cx="12" cy="12" r="9"/><path d="m5.7 5.7 12.6 12.6"/>',
    hourglass: '<path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.17a2 2 0 0 0-.59-1.41L12 12l-4.41 4.42A2 2 0 0 0 7 17.83V22"/><path d="M7 2v4.17a2 2 0 0 0 .59 1.41L12 12l4.41-4.42A2 2 0 0 0 17 6.17V2"/>',
    calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
    plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
    clipboard: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    percent: '<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    down: '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
    bolt: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
    check: '<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="m8 12.5 2.8 2.8L16.5 9.5" stroke="#fff" stroke-width="2.4"/>',
  };
  const icon = (name) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
  document.querySelectorAll('[data-icon]').forEach((el) => (el.innerHTML = icon(el.dataset.icon)));

  const DATA = window.MARKET_DATA;
  if (!DATA) {
    $('#banner').hidden = false;
    $('#banner').textContent = 'No data found. Run `npm run fetch` (MLS) or `npm run mock` for demo data, then reload.';
    return;
  }
  if (!DATA.windows.fetch) {
    $('#banner').hidden = false;
    $('#banner').textContent = 'This dataset is from an older version. Run `npm run fetch` again, then reload.';
    return;
  }

  // ---------- dates ----------
  const DAY = 86_400_000;
  const win = DATA.windows;
  const END = win.current.end;
  const YEAR = +END.slice(0, 4);
  const END_MONTH = END.slice(0, 7);
  const END_DAY = +END.slice(8);
  const iso = (t) => new Date(t).toISOString().slice(0, 10);
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monName = (ym) => MON[+ym.slice(5, 7) - 1];
  const shortDate = (d) => `${MON[+d.slice(5, 7) - 1]} ${+d.slice(8)}`;
  const between = (a, b) => (r) => r.date >= a && r.date <= b;
  // Comparison period for tiles, summary, price ranges and the zip table. Both periods end today and
  // compare against the same dates one year earlier.
  const PERIODS = {
    '90d': { name: 'Last 90 days', phrase: 'in the last 90 days', cur: [win.current.start, END], prior: [win.prior.start, win.prior.end] },
    ytd: { name: 'Year to date', phrase: 'year to date', cur: [`${YEAR}-01-01`, END], prior: [`${YEAR - 1}-01-01`, win.prior.end] },
  };
  let period = PERIODS['90d'];
  let isCur = between(...period.cur);
  let isPrior = between(...period.prior);
  const longDate = (d) => `${MON[+d.slice(5, 7) - 1]} ${+d.slice(8)}, ${d.slice(0, 4)}`;
  const rangeText = ([a, b]) => `${longDate(a)} – ${longDate(b)}`;

  // Every row carries its on-market span: `on` (listed) to `off` (went under contract or came off unsold;
  // null = still for sale). From these, the homes for sale and under contract on any past day can be rebuilt.
  const sales = DATA.sales.map(([zip, price, date, type, sqft, dom, list, orig, on, contract]) =>
    ({ zip, price, date, type, sqft, dom, list, orig, on, contract, off: contract && contract < date ? contract : date, ...DATA.zips[zip] }));
  // Listings that came off the market unsold (dated by the day they came off), and today's inventory.
  const cancels = (DATA.cancels ?? []).map(([zip, price, date, type, dom, status, on, orig]) =>
    ({ zip, price, date, type, dom, status, on, orig, off: date, ...DATA.zips[zip] }));
  const active = (DATA.active ?? []).map(([zip, price, on, type, dom, status, orig, contract]) =>
    ({ zip, price, list: price, on, type, dom, status, orig, contract, off: status === 'A' ? null : contract ?? END, ...DATA.zips[zip] }));
  const HAS_LISTINGS = !!(DATA.active?.length || DATA.cancels?.length);
  // List prices and on-market dates arrived in a later data version; older datasets hide what needs them.
  const HAS_MARKET = sales.some((s) => s.list != null);
  const forSale = (r) => r.status === 'A';
  const cut = (r) => r.orig != null && r.list != null && r.list < r.orig;

  const state = { county: '', city: '', zip: '', type: '', dist: 'bands', groupBy: 'zip', sortKey: 'n', sortDir: -1, search: '' };

  // ---------- formatting ----------
  const money = (v) => {
    if (v == null || !isFinite(v)) return '–';
    if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
    if (v >= 1e3) return `$${Math.round(v / 1e3)}K`;
    return `$${Math.round(v)}`;
  };
  // Axis ticks drop trailing zeros ($1.5M, $2M).
  const tick = (v) => (v >= 1e6 ? `$${+(v / 1e6).toFixed(2)}M` : v >= 1e3 ? `$${Math.round(v / 1e3)}K` : `$${v}`);
  const num = (v) => (v == null ? '–' : Math.round(v).toLocaleString());
  const pctText = (v) => `${v > 0 ? '+' : ''}${(v * 100).toFixed(1)}%`;
  const pill = (v) => {
    if (v == null || !isFinite(v)) return '<span class="pill flat">–</span>';
    const dir = Math.abs(v) < 0.0005 ? 'flat' : v > 0 ? 'up' : 'down';
    return `<span class="pill ${dir}">${pctText(v)}</span>`;
  };
  // A change in a share (0.54 -> 0.49) reads better in percentage points than as a relative change.
  const signed = (v, digits, unit) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(digits)}${unit}`;
  const ptText = (v) => signed(v * 100, 1, ' pt');
  /** A pill for an absolute change, labelled by `text(v)`. */
  const changePill = (v, text, flatBelow = 0.0005) => {
    if (v == null || !isFinite(v)) return '<span class="pill flat">–</span>';
    return `<span class="pill ${Math.abs(v) < flatBelow ? 'flat' : v > 0 ? 'up' : 'down'}">${text(v)}</span>`;
  };
  const ptPill = (v) => changePill(v, ptText);
  const share = (v) => (v == null ? '–' : `${(v * 100).toFixed(0)}%`);

  // ---------- stats ----------
  const median = (arr) => {
    if (!arr.length) return null;
    const s = [...arr].sort((a, b) => a - b);
    const m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  };
  const mean = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
  const yoy = (cur, prior) => (cur != null && prior ? cur / prior - 1 : null);
  function summarize(rows) {
    const prices = rows.map((r) => r.price);
    const withSqft = rows.filter((r) => r.sqft > 200);
    const doms = rows.map((r) => r.dom).filter((d) => d != null);
    // Sale-to-list uses the final list price; ratios outside 0.5–2 are data-entry errors.
    const listed = rows.filter((r) => r.list > 0 && r.price / r.list > 0.5 && r.price / r.list < 2);
    const withOrig = rows.filter((r) => r.orig != null && r.list != null);
    return {
      n: rows.length,
      dom: mean(doms),
      domMedian: median(doms),
      overList: listed.length ? listed.filter((r) => r.price > r.list).length / listed.length : null,
      toList: mean(listed.map((r) => r.price / r.list)),
      soldAfterCut: withOrig.length ? withOrig.filter(cut).length / withOrig.length : null,
      median: median(prices),
      avg: mean(prices),
      ppsf: withSqft.length ? withSqft.reduce((a, r) => a + r.price, 0) / withSqft.reduce((a, r) => a + r.sqft, 0) : null,
    };
  }

  // ---------- mortgage rates (30-yr fixed, weekly) ----------
  const RATES = window.RATE_DATA?.weekly ?? [];
  const prevMonth = (ym) => { const d = new Date(`${ym}-01T00:00:00Z`); d.setUTCMonth(d.getUTCMonth() - 1); return d.toISOString().slice(0, 7); };
  /** Average of the weekly readings published in a month (month-to-date for the running month). */
  const monthRate = (ym) => mean(RATES.filter(([d]) => d.startsWith(ym)).map(([, v]) => v));
  const rateMoM = (ym) => { const a = monthRate(ym), b = monthRate(prevMonth(ym)); return a != null && b != null ? a - b : null; };
  /** Latest reading published within [start, end]. */
  const weekRate = (start, end) => RATES.filter(([d]) => d >= start && d <= end).at(-1)?.[1] ?? null;
  const rate = (v) => (v == null ? '–' : `${v.toFixed(2)}%`);
  const pts = (v) => (v == null ? '–' : `${v > 0 ? '▲ +' : v < 0 ? '▼ −' : ''}${Math.abs(v).toFixed(2)} pt`);

  /** Sales (or other listing rows) matching the type filter and (unless ignoreGeo) the county/city/zip filters. */
  function filtered({ ignoreGeo = false } = {}, list = sales) {
    return list.filter(
      (s) =>
        (!state.type || state.type.split('|').includes(s.type)) &&
        (ignoreGeo || ((!state.county || s.county === state.county) && (!state.city || s.city === state.city) && (!state.zip || s.zip === state.zip))),
    );
  }

  // ---------- chart theme ----------
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const FONT = 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif';
  const isTV = () => document.body.classList.contains('tv');
  function applyChartDefaults() {
    Chart.defaults.font.family = FONT;
    Chart.defaults.font.size = isTV() ? 18 : 12;
    Chart.defaults.color = css('--muted');
    Chart.defaults.borderColor = css('--grid');
  }
  const tooltipStyle = () => ({
    backgroundColor: css('--surface'),
    titleColor: css('--text'),
    bodyColor: css('--text-2'),
    footerColor: css('--text-2'),
    borderColor: css('--border'),
    borderWidth: 1,
    padding: 8,
    cornerRadius: 8,
    boxPadding: 4,
    usePointStyle: true,
    titleFont: { size: 12, weight: '600' },
    bodyFont: { size: 12 },
    footerFont: { size: 12, weight: '500' },
  });
  // Vertical hairline at the hovered index on line charts.
  const crosshair = {
    id: 'crosshair',
    afterDatasetsDraw(chart) {
      const active = chart.tooltip?.getActiveElements?.();
      if (!active?.length) return;
      const { ctx, chartArea } = chart;
      const x = active[0].element.x;
      ctx.save();
      ctx.strokeStyle = css('--axis');
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, chartArea.top);
      ctx.lineTo(x, chartArea.bottom);
      ctx.stroke();
      ctx.restore();
    },
  };
  // Value above each bar.
  const barTopLabels = {
    id: 'barTopLabels',
    afterDatasetsDraw(chart, _args, opts) {
      const { ctx } = chart;
      ctx.save();
      ctx.font = `600 12px ${FONT}`;
      ctx.fillStyle = css('--text');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      chart.getDatasetMeta(0).data.forEach((bar, i) => {
        const v = chart.data.datasets[0].data[i];
        if (v && (!opts.every || i % opts.every === 0 || i === chart.data.labels.length - 1)) ctx.fillText((opts.fmt ?? num)(v), bar.x, bar.y - 4);
      });
      ctx.restore();
    },
  };
  const legendKey = (color, label) =>
    `<span><svg viewBox="0 0 26 10"><path d="M1 5h24" stroke="${color}" stroke-width="2" stroke-linecap="round"/><circle cx="13" cy="5" r="3.5" fill="${color}" stroke="${css('--surface')}" stroke-width="1.5"/></svg>${label}</span>`;

  const charts = {};
  function draw(id, cfg) {
    charts[id]?.destroy();
    charts[id] = new Chart($(`#${id}`), cfg);
  }

  /**
   * Hover readout. Line charts don't float a tooltip over the plot; the hovered point's details render in
   * a fixed bar above the chart instead. Charts in one group (a monthly chart and its rate strip) hover
   * together. With nothing hovered, the readout shows the group's default (latest) point.
   */
  let syncing = false;
  const readoutGroup = (el, describe, defaultIndex) => ({ el, describe, defaultIndex, ids: new Set() });
  function showReadout(group, source, index) {
    group.el.innerHTML = group.describe(index ?? group.defaultIndex, index == null);
    if (syncing) return;
    syncing = true;
    for (const id of group.ids) {
      const c = charts[id];
      if (!c || c === source) continue;
      const active = index == null ? [] : c.data.datasets.map((_, di) => ({ datasetIndex: di, index })).filter((a) => c.data.datasets[a.datasetIndex].data[index] != null);
      c.setActiveElements(active);
      c.tooltip.setActiveElements(active, { x: 0, y: 0 });
      c.update('none');
    }
    syncing = false;
  }
  const roKey = (color, label, value) => `<span class="ro-key"><i style="background:${color}"></i>${label} <b>${value}</b></span>`;
  const roHint = (isDefault) => (isDefault ? '<span class="ro-hint">Hover the chart to explore</span>' : '');

  /** Two-line chart: this year (blue, area wash) vs last year (gray). */
  // Value labels above this-year points (used on the mortgage-rate strip).
  const pointLabels = {
    id: 'pointLabels',
    afterDatasetsDraw(chart, _args, opts) {
      if (!opts.fmt) return;
      const { ctx } = chart;
      ctx.save();
      ctx.font = `600 ${isTV() ? 16 : 10.5}px ${FONT}`;
      ctx.fillStyle = css('--text');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      chart.getDatasetMeta(0).data.forEach((pt, i) => {
        const v = chart.data.datasets[0].data[i];
        if (v != null) ctx.fillText(opts.fmt(v), pt.x, pt.y - 6);
      });
      ctx.restore();
    },
  };
  const yAxisWidth = () => (isTV() ? 86 : 58);

  function lineChart(id, labels, cur, prior, { curLabel, priorLabel, axisFmt, group, strip = false, countScale = false, labelFmt, dense = false, xTick, xOffset = false, colors, hollow }) {
    group.ids.add(id);
    const vals = [...cur, ...prior].filter((v) => v != null);
    // Rate strips snap to whole percents; count strips (inventory) get a padded automatic range.
    const rateStrip = strip && !countScale;
    const lo = Math.min(...vals), hi = Math.max(...vals), span = hi - lo || hi || 1;
    const stripRange = !strip || !vals.length ? {}
      : rateStrip ? { min: Math.floor(lo - 0.1), max: Math.ceil(hi + 0.3) }
        // Counts: fit the data (headroom on top for the point labels) instead of starting at zero.
        : { min: Math.max(0, lo - span * 0.15), max: hi + span * 0.45 };
    const [blue, gray] = colors ?? [css('--series-1'), css('--series-prior')];
    const surface = css('--surface');
    const line = (label, data, color, fill) => ({
      label, data, borderColor: color, backgroundColor: color, borderWidth: isTV() ? 3.5 : 2, tension: 0.3, spanGaps: false,
      pointRadius: dense ? 0 : (strip ? 3 : 4) * (isTV() ? 1.6 : 1), pointHoverRadius: (strip ? 5 : 6) * (isTV() ? 1.5 : 1), pointBackgroundColor: hollow ? (c) => (hollow.has(c.dataIndex) ? surface : color) : color, pointBorderColor: hollow ? (c) => (hollow.has(c.dataIndex) ? color : surface) : surface, pointBorderWidth: 2,
      pointHoverBorderWidth: 2, borderCapStyle: 'round', borderJoinStyle: 'round',
      fill: fill && !strip ? 'origin' : false,
      ...(fill && !strip && {
        backgroundColor: (ctx) => {
          const area = ctx.chart.chartArea;
          if (!area) return 'transparent';
          const g = ctx.chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
          g.addColorStop(0, `${blue}2e`);
          g.addColorStop(1, `${blue}00`);
          return g;
        },
      }),
    });
    draw(id, {
      type: 'line',
      data: { labels, datasets: [line(curLabel, cur, blue, true), line(priorLabel, prior, gray, false)] },
      plugins: [crosshair, pointLabels],
      options: {
        maintainAspectRatio: false,
        animation: false,
        layout: { padding: { top: strip ? 16 : 0 } },
        interaction: { mode: 'index', intersect: false },
        scales: {
          // The strip sits under a chart with the same months, so it skips its own month labels.
          x: { offset: xOffset, grid: { display: false }, border: { color: css('--axis') }, ticks: { display: !strip, maxRotation: 0, autoSkipPadding: 10, ...(xTick && { autoSkip: false, callback: xTick }) } },
          y: {
            grace: strip ? 0 : '8%', border: { display: false }, ...stripRange,
            ticks: { callback: axisFmt, maxTicksLimit: strip ? (countScale ? 3 : 5) : 7, ...(rateStrip && { stepSize: 1 }) },
            afterFit: (scale) => { scale.width = yAxisWidth(); },
          },
        },
        plugins: {
          legend: { display: false },
          pointLabels: { fmt: labelFmt },
          tooltip: {
            enabled: false,
            external: ({ chart, tooltip }) =>
              showReadout(group, chart, tooltip.opacity === 0 || !tooltip.dataPoints?.length ? null : tooltip.dataPoints[0].dataIndex),
          },
        },
      },
    });
  }

  // ---------- filters ----------
  const countySales = {};
  // County order and counts use the last 90 days regardless of the period toggle, so the list stays stable.
  const isLast90 = between(win.current.start, END);
  for (const s of sales) if (isLast90(s)) countySales[s.county] = (countySales[s.county] ?? 0) + 1;
  // Largest coverage first; the count makes thin MLS coverage obvious.
  const counties = [...new Set(Object.values(DATA.zips).map((z) => z.county))].sort((a, b) => (countySales[b] ?? 0) - (countySales[a] ?? 0));
  function fillSelect(el, items, allLabel, value) {
    el.innerHTML = `<option value="">${allLabel}</option>` + items.map(([v, l]) => `<option value="${v}">${l}</option>`).join('');
    el.value = items.some(([v]) => v === value) ? value : '';
    return el.value;
  }
  function syncFilters() {
    state.county = fillSelect($('#f-county'), counties.map((c) => [c, `${c} (${num(countySales[c] ?? 0)})`]), 'All Counties', state.county);
    const zipEntries = Object.entries(DATA.zips).filter(([, z]) => !state.county || z.county === state.county);
    const cities = [...new Set(zipEntries.map(([, z]) => z.city))].sort();
    state.city = fillSelect($('#f-city'), cities.map((c) => [c, c]), 'All Cities', state.city);
    const zips = zipEntries.filter(([, z]) => !state.city || z.city === state.city).sort(([a], [b]) => a.localeCompare(b));
    state.zip = fillSelect($('#f-zip'), zips.map(([zip, z]) => [zip, `${zip} · ${z.city}`]), 'All Zip Codes', state.zip);
    $('#f-type').value = state.type;
  }
  $('#f-county').addEventListener('change', (e) => { state.county = e.target.value; state.city = ''; state.zip = ''; render(); });
  $('#f-city').addEventListener('change', (e) => { state.city = e.target.value; state.zip = ''; render(); });
  $('#f-zip').addEventListener('change', (e) => {
    state.zip = e.target.value;
    if (state.zip) ({ county: state.county, city: state.city } = DATA.zips[state.zip]);
    render();
  });
  $('#f-type').addEventListener('change', (e) => { state.type = e.target.value; render(); });
  $('#f-reset').addEventListener('click', () => { Object.assign(state, { county: '', city: '', zip: '', type: '' }); render(); });
  document.querySelectorAll('[data-dist]').forEach((btn) =>
    btn.addEventListener('click', () => {
      state.dist = btn.dataset.dist;
      document.querySelectorAll('[data-dist]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      renderDist(filtered());
    }),
  );

  // ---------- KPI tiles (selected period) ----------
  function renderTiles(rows) {
    const c = summarize(rows.filter(isCur));
    const p = summarize(rows.filter(isPrior));
    const sqft = (v) => (v ? `$${num(v)}` : '–');
    const tiles = [
      ['house', 'Closed Sales', num(c.n), yoy(c.n, p.n), num(p.n)],
      ['tag', 'Average Sale Price', money(c.avg), yoy(c.avg, p.avg), money(p.avg)],
      ['database', 'Median Sale Price', money(c.median), yoy(c.median, p.median), money(p.median)],
      ['bars', 'Price per Sqft', sqft(c.ppsf), yoy(c.ppsf, p.ppsf), sqft(p.ppsf)],
    ];
    $('#tiles').innerHTML = tiles
      .map(([ic, label, value, d, ly]) => `<div class="tile"><span class="icon-tile">${icon(ic)}</span><div>
        <div class="label">${label}</div><div class="value">${value}</div>
        <div class="delta">${pill(d)}<span>YoY (vs. ${ly})</span></div></div></div>`)
      .join('');
  }

  // ---------- listing activity tiles: inventory today, cancellations and days on market ----------
  const days = (v) => (v == null ? '–' : `${Math.round(v)} days`);
  /** Homes for sale (listed, not yet under contract or pulled) at the end of `day`, from listing spans. */
  const forSaleOn = (lists, day) => lists.reduce((n, list) => n + list.filter((r) => r.on && r.on <= day && (!r.off || r.off > day)).length, 0);
  /** Homes under contract but not yet closed at the end of `day`. */
  const pendingOn = (rows, act, day) =>
    rows.filter((r) => r.contract && r.contract <= day && r.date > day).length + act.filter((r) => !forSale(r) && (r.contract ?? END) <= day).length;
  /** Inventory and new-listing numbers for the current filters: today vs. the same day last year. */
  function inventory(rows, can, act) {
    const LY = win.prior.end;
    const lists = [rows, can, act];
    const forNow = act.filter(forSale).length;
    const forLY = forSaleOn(lists, LY);
    // Months of supply: homes for sale / average monthly closed sales over the 90 days before.
    const perMonth = (a, b) => rows.filter(between(a, b)).length / 3;
    const sup = (n, m) => (m ? n / m : null);
    const listedIn = ([a, b]) => lists.reduce((n, list) => n + list.filter((r) => r.on && r.on >= a && r.on <= b).length, 0);
    const actCut = act.filter(forSale).filter((r) => r.orig != null);
    return {
      forNow, forLY,
      pendNow: act.length - forNow, pendLY: pendingOn(rows, act, LY),
      supply: sup(forNow, perMonth(win.current.start, END)), supplyLY: sup(forLY, perMonth(win.prior.start, LY)),
      newCur: listedIn(period.cur), newPrior: listedIn(period.prior),
      cuts: actCut.filter(cut).length, cutRate: actCut.length ? actCut.filter(cut).length / actCut.length : null,
    };
  }
  function renderListingTiles(rows, can, act) {
    const c = summarize(rows.filter(isCur)), p = summarize(rows.filter(isPrior));
    const cc = can.filter(isCur).length, cp = can.filter(isPrior).length;
    const inv = inventory(rows, can, act);
    // Of everything that left the market this period, the share pulled rather than sold.
    const pulled = cc + c.n ? cc / (cc + c.n) : null;
    const tile = (ic, label, value, delta, title = '') => `<div class="tile"${title ? ` title="${title}"` : ''}><span class="icon-tile">${icon(ic)}</span><div>
        <div class="label">${label}</div><div class="value">${value}</div><div class="delta">${delta}</div></div></div>`;
    const yoyLine = (d, ly) => `${pill(d)}<span>YoY (vs. ${ly})</span>`;
    const ptLine = (cur, prior, fmt) => `${ptPill(cur != null && prior != null ? cur - prior : null)}<span>YoY (vs. ${fmt(prior)})</span>`;
    const supplyTiles = [], tiles = [];
    if (HAS_LISTINGS) {
      const supply = (v) => (v == null ? '–' : `${v.toFixed(1)} mo.`);
      supplyTiles.push(
        tile('house', 'Active Listings', num(inv.forNow), HAS_MARKET ? yoyLine(yoy(inv.forNow, inv.forLY), num(inv.forLY)) : '<span>For sale today</span>',
          `For sale today, not under contract (vs. ${longDate(win.prior.end)}). Months of supply: ${supply(inv.supply)} (last year ${supply(inv.supplyLY)}) = active listings / average monthly closed sales over the prior 90 days.`),
        tile('calendar', 'Months of Supply', supply(inv.supply),
          HAS_MARKET && inv.supply != null && inv.supplyLY != null
            ? `${changePill(inv.supply - inv.supplyLY, (v) => signed(v, 1, ' mo.'), 0.05)}<span>YoY (vs. ${supply(inv.supplyLY)})</span>`
            : '<span>at the current sales pace</span>',
          'Active listings / average monthly closed sales over the prior 90 days. Under ~3 months favors sellers; over ~6 favors buyers.'),
      );
      if (HAS_MARKET) supplyTiles.push(tile('plus', 'New Listings', num(inv.newCur), yoyLine(yoy(inv.newCur, inv.newPrior), num(inv.newPrior)),
        `Homes that came on the market ${period.phrase}, whatever happened to them since.`));
      supplyTiles.push(tile('clipboard', 'Pending Sales', num(inv.pendNow), HAS_MARKET ? yoyLine(yoy(inv.pendNow, inv.pendLY), num(inv.pendLY)) : '<span>Under contract today</span>',
        'Under contract today and not yet closed, vs. the same day last year.'));
      tiles.push(
        tile('x', 'Cancelled Listings', num(cc), yoyLine(yoy(cc, cp), num(cp)),
          `Canceled, withdrawn or expired ${period.phrase}${pulled != null ? ` - ${(pulled * 100).toFixed(1)}% of listings that left the market` : ''}.`),
      );
    }
    tiles.push(tile('clock', 'Avg Days on Market', days(c.dom), yoyLine(yoy(c.dom, p.dom), days(p.dom)),
      `Closed sales ${period.phrase}. Median ${c.domMedian == null ? '–' : Math.round(c.domMedian)} days.`));
    if (HAS_MARKET) {
      tiles.push(
        tile('percent', 'Sold Over List', share(c.overList), ptLine(c.overList, p.overList, share),
          `Share of closed sales ${period.phrase} that sold above the final list price. Average sale-to-list ratio ${share(c.toList)} (last year ${share(p.toList)}).`),
        tile('down', 'Price Reductions', share(inv.cutRate), `<span>${num(inv.cuts)} of ${num(inv.forNow)} active listings</span>`,
          `Share of homes for sale today listed below their original list price. ${share(c.soldAfterCut)} of homes sold ${period.phrase} had a price cut first (last year ${share(p.soldAfterCut)}).`),
      );
    }
    $('#supply-group').hidden = !supplyTiles.length;
    $('#supply-tiles').innerHTML = supplyTiles.join('');
    $('#behavior-group').hidden = !rows.some((r) => r.dom != null) && !tiles.length;
    $('#behavior-tiles').innerHTML = tiles.join('');
  }

  // ---------- monthly line charts: Jan–Dec, this year vs last year ----------
  function renderYearCharts(rows) {
    const py = YEAR - 1;
    const byMonth = (year) => MON.map((_, i) => rows.filter((r) => r.date.startsWith(`${year}-${String(i + 1).padStart(2, '0')}`)));
    const curM = byMonth(YEAR), priorM = byMonth(py);
    const curMonthIdx = +END.slice(5, 7) - 1;
    // This year's line stops at the last complete month; the running month is in the table.
    const done = (i) => i < curMonthIdx;
    const lastDone = curMonthIdx > 0 ? MON[curMonthIdx - 1] : null;
    // The running month isn't drawn; it's in the monthly table (month-to-date).
    const note = lastDone && !isTV() ? ` ${MON[curMonthIdx]} MTD in the table.` : '';

    $('#vol-title').textContent = `Monthly Sales Volume — ${py} vs ${YEAR}`;
    $('#vol-sub').textContent = `Closed residential sales by month.${note}`;
    $('#avg-title').textContent = `Monthly Average Sale Price — ${py} vs ${YEAR}`;
    $('#avg-sub').textContent = `Average closed sale price by month.${note}`;

    const volCur = curM.map((r, i) => (done(i) ? r.length : null));
    const volPrior = priorM.map((r) => r.length || null);
    const avgCur = curM.map((r, i) => (done(i) && r.length ? mean(r.map((x) => x.price)) : null));
    const avgPrior = priorM.map((r) => (r.length ? mean(r.map((x) => x.price)) : null));
    const ym = (year, i) => `${year}-${String(i + 1).padStart(2, '0')}`;
    const blue = css('--series-1'), gray = css('--series-prior');
    // Inventory: homes for sale at the end of each month (today, for the running month), rebuilt from listing spans.
    const hasInv = HAS_LISTINGS && HAS_MARKET;
    const lists = hasInv ? [rows, filtered({}, cancels), filtered({}, active)] : [];
    const monthEnd = (year, i) => iso(Date.UTC(year, i + 1, 0));
    const invCur = MON.map((_, i) => (hasInv && i <= curMonthIdx ? forSaleOn(lists, i === curMonthIdx ? END : monthEnd(YEAR, i)) : null));
    const invPrior = MON.map((_, i) => (hasInv && monthEnd(py, i) >= win.fetch.start ? forSaleOn(lists, monthEnd(py, i)) : null));
    const compact = (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(Math.round(v)));
    // Up to three stat columns for the hovered month: the chart's value, active listings and the 30-yr rate,
    // each with its change (YoY for the value and inventory, MoM for the rate). Hover a column for last year's figure.
    const describe = (curArr, priorArr, fmt, what) => (i) => {
      const r = monthRate(ym(YEAR, i)), mom = rateMoM(ym(YEAR, i));
      const stat = (ic, label, value, change, title) =>
        `<div class="ro-stat" title="${title}"><span class="ro-icon">${icon(ic)}</span><div><span class="ro-label">${label}</span><span class="ro-line"><b class="ro-value">${value}</b>${change}</span></div></div>`;
      const cols = [stat('calendar', `${MON[i]} ${YEAR} ${what}`, curArr[i] != null ? fmt(curArr[i]) : i === curMonthIdx ? 'MTD' : '–',
        curArr[i] != null ? pill(yoy(curArr[i], priorArr[i])) : '', `${MON[i]} ${py}: ${priorArr[i] != null ? fmt(priorArr[i]) : '–'}`)];
      if (hasInv) cols.push(stat('house', 'Active listings', num(invCur[i]),
        invCur[i] != null ? pill(yoy(invCur[i], invPrior[i])) : '', `${i === curMonthIdx ? 'Today' : 'End of month'}; ${MON[i]} ${py}: ${num(invPrior[i])}`));
      if (r != null) cols.push(stat('percent', '30-yr rate', rate(r), mom != null ? changePill(mom / 100, (v) => signed(v * 100, 2, ' pt'), 0.00005) : '',
        `${MON[i]} ${py}: ${rate(monthRate(ym(py, i)))}; change shown is vs. the month before`));
      return cols.join('');
    };
    const latest = Math.max(0, curMonthIdx - 1);
    const volGroup = readoutGroup($('#vol-readout'), describe(volCur, volPrior, num, 'sales'), latest);
    const avgGroup = readoutGroup($('#avg-readout'), describe(avgCur, avgPrior, money, 'avg'), latest);

    lineChart('vol-chart', MON, volCur, volPrior, { curLabel: String(YEAR), priorLabel: String(py), axisFmt: (v) => num(v), group: volGroup });
    lineChart('avg-chart', MON, avgCur, avgPrior, { curLabel: String(YEAR), priorLabel: String(py), axisFmt: tick, group: avgGroup });
    // Mortgage-rate strips, x-aligned under each chart. This year runs through the current month.
    const hasRates = RATES.length > 0;
    document.querySelectorAll('[data-rate-strip]').forEach((el) => (el.hidden = !hasRates));
    if (hasRates) {
      const rCur = MON.map((_, i) => (i <= curMonthIdx ? monthRate(ym(YEAR, i)) : null));
      const rPrior = MON.map((_, i) => monthRate(ym(py, i)));
      for (const [id, group] of [['vol-rate', volGroup], ['avg-rate', avgGroup]]) {
        lineChart(id, MON, rCur, rPrior, {
          curLabel: String(YEAR), priorLabel: String(py), axisFmt: (v) => `${+v}%`, group, strip: true, labelFmt: (v) => v.toFixed(2),
        });
      }
    }
    document.querySelectorAll('[data-inv-strip]').forEach((el) => (el.hidden = !hasInv));
    if (hasInv) {
      for (const [id, group] of [['vol-inv', volGroup], ['avg-inv', avgGroup]]) {
        lineChart(id, MON, invCur, invPrior, {
          curLabel: String(YEAR), priorLabel: String(py), axisFmt: compact, group, strip: true, countScale: true, labelFmt: compact,
        });
      }
    }
    showReadout(volGroup, null, null);
    showReadout(avgGroup, null, null);
    const legend = legendKey(css('--series-prior'), py) + legendKey(css('--series-1'), YEAR);
    $('#vol-legend').innerHTML = legend;
    $('#avg-legend').innerHTML = legend;
  }

  // ---------- monthly comparison table: last 3 months + month-to-date ----------
  const TABLE_MONTHS = (() => {
    const out = [];
    for (let d = new Date(`${win.current.monthStart}T00:00:00Z`); iso(d) <= END; d.setUTCMonth(d.getUTCMonth() + 1)) {
      const key = iso(d).slice(0, 7);
      const prevKey = `${+key.slice(0, 4) - 1}${key.slice(4)}`;
      out.push({ key, prevKey, partial: key === END_MONTH });
    }
    return out;
  })();
  function monthRows(rows) {
    return TABLE_MONTHS.map((m) => {
      const cur = rows.filter((r) => r.date.startsWith(m.key));
      // For the running month, compare against the same days last year only.
      const prior = rows.filter((r) => r.date.startsWith(m.prevKey) && (!m.partial || +r.date.slice(8) <= END_DAY));
      // Month over month: the previous calendar month (same days of it, for the running month).
      const lastMonth = rows.filter((r) => r.date.startsWith(prevMonth(m.key)) && (!m.partial || +r.date.slice(8) <= END_DAY));
      const c = summarize(cur), p = summarize(prior), lm = summarize(lastMonth);
      return { ...m, c, p, lm };
    });
  }
  function renderMonthTable(rows) {
    const data = monthRows(rows);
    const years = new Set(TABLE_MONTHS.map((m) => m.key.slice(0, 4)));
    const [ly, ty] = years.size === 1 ? [YEAR - 1, YEAR] : ['Last Yr', 'This Yr'];
    // Two header rows: a group label over each block of columns, then the columns themselves.
    const groups = [['Closed sales', 4], ['Average sale price', 4], ...(RATES.length ? [['30-yr mortgage rate', 2]] : [])];
    const cols = [ly, ty, 'Sales YoY', 'Sales MoM', ly, ty, 'Price YoY', 'Price MoM', ...(RATES.length ? ['Avg', 'Mortgage MoM'] : [])];
    const starts = new Set([0, 4, 8]);
    $('#month-head').innerHTML =
      `<tr><th rowspan="2" class="month-col">Month</th>${groups.map(([g, n]) => `<th colspan="${n}" class="grp">${g}</th>`).join('')}</tr>`
      + `<tr class="sub">${cols.map((h, i) => `<th${starts.has(i) ? ' class="grp-start"' : ''}>${h}</th>`).join('')}</tr>`;
    const vsLast = (m) => `vs. ${monName(prevMonth(m.key))}${m.partial ? ` 1–${END_DAY}` : ''}`;
    $('#month-table tbody').innerHTML = data
      .map((m) => `<tr${m.partial ? ' class="mtd"' : ''}><td class="month-col">${m.partial ? `<span class="chip" title="${monName(m.key)} 1–${END_DAY}">${monName(m.key)} MTD</span>` : monName(m.key)}</td>
        <td class="grp-start muted">${num(m.p.n)}</td><td><b>${num(m.c.n)}</b></td><td>${pill(yoy(m.c.n, m.p.n))}</td>
        <td title="${vsLast(m)}: ${num(m.lm.n)}">${pill(yoy(m.c.n, m.lm.n))}</td>
        <td class="grp-start muted">${money(m.p.avg)}</td><td><b>${money(m.c.avg)}</b></td><td>${pill(yoy(m.c.avg, m.p.avg))}</td>
        <td title="${vsLast(m)}: ${money(m.lm.avg)}">${pill(yoy(m.c.avg, m.lm.avg))}</td>
        ${RATES.length ? `<td class="grp-start" title="${monName(m.prevKey)} ${m.prevKey.slice(0, 4)}: ${rate(monthRate(m.prevKey))}">${rate(monthRate(m.key))}</td><td>${changePill(rateMoM(m.key) == null ? null : rateMoM(m.key) / 100, (v) => signed(v * 100, 2, ' pt'), 0.00005)}</td>` : ''}</tr>`)
      .join('');
    return data;
  }

  // ---------- market summary ----------
  function renderSummary(rows, months) {
    const c = summarize(rows.filter(isCur)), p = summarize(rows.filter(isPrior));
    // Each insight: an icon, a topic and one or two short sentences, key numbers bold and changes coloured.
    const items = [];
    const add = (ic, title, text) => text && items.push([ic, title, text]);
    const b = (v) => `<b>${v}</b>`;
    const arrow = (v) => (Math.abs(v) < 0.0005 ? '' : v > 0 ? '▲ ' : '▼ ');
    const tone = (v, text) => (v == null || !isFinite(v) ? '' : `<span class="chg ${Math.abs(v) < 0.0005 ? 'flat' : v > 0 ? 'up' : 'down'}">${arrow(v)}${text}</span>`);
    const rel = (cur, prior) => { const v = yoy(cur, prior); return tone(v, pctText(v)); };
    const pt = (cur, prior) => (cur == null || prior == null ? '' : tone(cur - prior, ptText(cur - prior)));
    const yy = (t) => (t ? `, ${t} YoY` : '');

    const vol = yoy(c.n, p.n);
    if (c.n) {
      const read = vol == null ? '' : Math.abs(vol) < 0.02 ? ', about the same pace as last year' : `, indicating ${Math.abs(vol) < 0.07 ? 'slightly ' : ''}${vol > 0 ? 'stronger' : 'softer'} demand than last year`;
      add('bars', 'Sales', `${b(num(c.n))} homes sold${yy(rel(c.n, p.n))}${read}.`);
    }
    if (c.avg != null) add('tag', 'Prices', `Average sale price ${b(money(c.avg))}${yy(rel(c.avg, p.avg))}, and median price ${b(money(c.median))}${rel(c.median, p.median) ? `, ${rel(c.median, p.median)}` : ''}.`);
    if (c.dom != null) {
      const d = p.dom != null ? c.dom - p.dom : null;
      // Faster is good news for sellers; colour it green.
      const vs = d == null ? '' : Math.abs(d) < 0.5 ? ', about the same as last year' : `, ${tone(-yoy(c.dom, p.dom), `${Math.abs(yoy(c.dom, p.dom) * 100).toFixed(1)}%`)} ${d > 0 ? 'slower' : 'faster'} than last year (${days(p.dom)})`;
      add('bolt', 'Speed', `Homes sold in ${b(days(c.dom))} on average${vs}.`);
    }
    if (HAS_MARKET && c.overList != null) {
      const read = c.overList >= 0.5 ? 'showing continued buyer competition' : c.overList >= 0.3 ? 'a balanced level of bidding' : 'most homes selling at or below list';
      add('layers', 'Competition', `${b(share(c.overList))} of homes sold over list price${p.overList != null ? `, ${c.overList >= p.overList ? 'up' : 'down'} ${pt(c.overList, p.overList)} YoY` : ''}, ${read}.`);
    }
    if (HAS_LISTINGS && HAS_MARKET) {
      const inv = inventory(rows, filtered({}, cancels), filtered({}, active));
      const supMo = inv.supply != null ? `, or ${b(`${inv.supply.toFixed(1)} months`)} of supply${inv.supplyLY != null ? ` (${tone(inv.supply - inv.supplyLY, signed(inv.supply - inv.supplyLY, 1, ' mo.'))} YoY)` : ''}` : '';
      add('house', 'Inventory', `${b(num(inv.forNow))} active listings${yy(rel(inv.forNow, inv.forLY))}${supMo}.`);
    }
    const lastFull = [...months].reverse().find((m) => !m.partial);
    if (lastFull && monthRate(lastFull.key) != null) {
      const r = monthRate(lastFull.key), mom = rateMoM(lastFull.key), ly = monthRate(lastFull.prevKey);
      const rpt = (d) => (d == null ? '' : tone(d / 100, signed(d, 2, ' pt')));
      add('percent', 'Mortgage Rate', `30-yr rate averaged ${b(rate(r))} in ${monName(lastFull.key)}${mom != null ? `, ${rpt(mom)} MoM` : ''}${ly != null ? ` and ${rpt(r - ly)} YoY` : ''}.`);
    }
    if (!items.length) add('sparkle', 'Not enough data', 'Not enough sales in this selection to compare with last year.');
    $('#insights-sub').textContent = `Key takeaways for ${state.zip || state.city || state.county || 'the Bay Area'} (${period.name.toLowerCase()} vs. same period last year).`;
    $('#insights').innerHTML = items.map(([ic, title, text]) =>
      `<li><span class="icon-tile">${icon(ic)}</span><div><span class="ins-title">${title}</span><span class="ins-text">${text}</span></div></li>`).join('');
    const mtd = months.find((m) => m.partial);
    $('#insights-note').textContent = `${period.name}: ${rangeText(period.cur)} vs. the same dates last year.${mtd ? ` ${monName(mtd.key)} in the table is month-to-date (${monName(mtd.key)} 1–${END_DAY}).` : ''}`;
  }

  // ---------- weekly trend: last 12 weeks ----------
  function renderWeekly(rows) {
    const endT = Date.parse(END);
    const weeks = Array.from({ length: 12 }, (_, i) => {
      const start = iso(endT - ((11 - i) * 7 + 6) * DAY), end = iso(endT - (11 - i) * 7 * DAY);
      const pStart = iso(Date.parse(start) - 365 * DAY), pEnd = iso(Date.parse(end) - 365 * DAY);
      const cur = rows.filter(between(start, end)).map((r) => r.price);
      const prior = rows.filter(between(pStart, pEnd)).map((r) => r.price);
      return { start, end, cur, prior };
    });
    const cur = weeks.map((w) => median(w.cur)), prior = weeks.map((w) => median(w.prior));
    const group = readoutGroup($('#week-readout'), (i, isDefault) => {
      const w = weeks[i];
      const r = weekRate(w.start, w.end);
      return `<span class="ro-title">${shortDate(w.start)} – ${shortDate(w.end)}</span>`
        + roKey(css('--series-1'), YEAR, `${money(cur[i])}`) + roKey(css('--series-prior'), YEAR - 1, money(prior[i]))
        + (yoy(cur[i], prior[i]) != null ? pill(yoy(cur[i], prior[i])) : '')
        + `<span class="ro-rate">${num(w.cur.length)} sales${r != null ? ` · 30-yr rate <b>${rate(r)}</b>` : ''}</span>`
        + roHint(isDefault);
    }, weeks.length - 1);
    lineChart('week-chart', weeks.map((w) => shortDate(w.start)), cur, prior, {
      curLabel: `${YEAR} (this year)`, priorLabel: `${YEAR - 1} (same weeks last year)`, axisFmt: tick, group,
    });
    showReadout(group, null, null);
    $('#week-legend').innerHTML = legendKey(css('--series-prior'), `${YEAR - 1} (same weeks last year)`) + legendKey(css('--series-1'), `${YEAR} (this year)`);
  }

  // ---------- sales distribution (selected period) ----------
  const BANDS = [
    [0, 1e6, '<$1M'], [1e6, 1.5e6, '$1–1.5M'], [1.5e6, 2e6, '$1.5–2M'], [2e6, 2.5e6, '$2–2.5M'],
    [2.5e6, 3e6, '$2.5–3M'], [3e6, 4e6, '$3–4M'], [4e6, 5e6, '$4–5M'], [5e6, Infinity, '>$5M'],
  ];
  function renderDist(rows) {
    const cur = rows.filter(isCur).map((r) => r.price);
    let bands;
    if (state.dist === 'bands') {
      bands = BANDS;
      $('#dist-sub').textContent = `Closed sales ${period.phrase} (${num(cur.length)} total).`;
    } else {
      // $250K bins from $1M to $10M plus one "$10M+" bin.
      bands = Array.from({ length: 36 }, (_, i) => [1e6 + i * 25e4, 1e6 + (i + 1) * 25e4, tick(1e6 + i * 25e4)]);
      bands.push([1e7, Infinity, '$10M+']);
      const under = cur.filter((p) => p < 1e6).length;
      $('#dist-sub').textContent = `Closed sales ${period.phrase}, $250K bins · ${num(under)} under $1M not shown.`;
    }
    const counts = bands.map(([lo, hi]) => cur.filter((p) => p >= lo && p < hi).length);
    const shown = counts.reduce((a, b) => a + b, 0);
    const detail = state.dist === 'detail';
    draw('dist-chart', {
      type: 'bar',
      data: {
        labels: bands.map((b) => b[2]),
        datasets: [{
          data: counts,
          backgroundColor: (ctx) => {
            const area = ctx.chart.chartArea;
            if (!area) return css('--series-1');
            const g = ctx.chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
            g.addColorStop(0, css('--blue-2'));
            g.addColorStop(1, css('--blue'));
            return g;
          },
          borderRadius: { topLeft: 4, topRight: 4 },
          borderSkipped: 'bottom',
          barPercentage: detail ? 0.9 : 0.78,
          categoryPercentage: 1,
          maxBarThickness: 56,
        }],
      },
      plugins: [barTopLabels],
      options: {
        maintainAspectRatio: false,
        animation: false,
        layout: { padding: { top: 22 } },
        scales: {
          x: {
            grid: { display: false }, border: { color: css('--axis') },
            ticks: { maxRotation: detail ? 0 : 45, autoSkip: false, callback: (_, i) => (!detail || i % 4 === 0 || i === bands.length - 1 ? bands[i][2] : '') },
          },
          y: { beginAtZero: true, border: { display: false }, ticks: { precision: 0, maxTicksLimit: 8 } },
        },
        plugins: {
          legend: { display: false },
          barTopLabels: { every: detail ? 4 : 0 },
          tooltip: {
            ...tooltipStyle(),
            displayColors: false,
            callbacks: {
              title: (items) => {
                const [lo, hi] = bands[items[0].dataIndex];
                return hi === Infinity ? `${money(lo)} and over` : lo === 0 ? `Under ${money(hi)}` : `${money(lo)} – ${money(hi)}`;
              },
              label: (ctx) => `${num(ctx.raw)} sales (${shown ? ((ctx.raw / shown) * 100).toFixed(1) : 0}%)`,
            },
          },
        },
      },
    });
  }

  // ---------- zip / city table (selected period vs same dates last year) ----------
  const LEFT_COLS = {
    zip: [['zip', 'Zip'], ['city', 'City'], ['county', 'County']],
    city: [['city', 'City'], ['county', 'County'], ['zips', 'Zips']],
  };
  const NUM_COLS = [
    ['n', 'Sales'], ['nPrior', 'Sales LY'], ['nYoY', 'Volume YoY'], ['avg', 'Avg Price'], ['avgPrior', 'Avg LY'],
    ['avgYoY', 'Avg YoY'], ['median', 'Median'], ['ppsf', '$/Sqft'], ['dom', 'Avg DOM'],
    ...(HAS_MARKET ? [['overList', 'Over List']] : []),
    ...(HAS_LISTINGS ? [['cancels', 'Cancelled'], ['active', 'Active']] : []),
  ];
  const TEXT_KEYS = ['zip', 'city', 'county'];

  function renderZipTable() {
    const byCity = state.groupBy === 'city';
    $('#zip-title').textContent = byCity ? 'By city — year over year' : 'By zip code — year over year';
    $('#zip-hint').textContent = `Click a row to focus the dashboard on that ${byCity ? 'city' : 'zip'}.`;
    $('#t-search').placeholder = byCity ? 'Search city' : 'Search zip or city';
    const cols = [...LEFT_COLS[state.groupBy], ...NUM_COLS];
    $('#zip-head').innerHTML = cols.map(([k, label]) => `<th data-key="${k}">${label}</th>`).join('');

    // Respects the county + type filters (and the city filter in zip mode), but lists every
    // row at that level so the selected zip or city stays visible.
    const rows = filtered({ ignoreGeo: true }).filter((r) => (!state.county || r.county === state.county) && (byCity || !state.city || r.city === state.city));
    const groups = new Map();
    for (const r of rows) {
      const bucket = isCur(r) ? 'cur' : isPrior(r) ? 'prior' : null;
      if (!bucket) continue;
      const key = byCity ? `${r.city}|${r.county}` : r.zip;
      if (!groups.has(key)) groups.set(key, { cur: [], prior: [], zips: new Set() });
      const g = groups.get(key);
      g[bucket].push(r);
      g.zips.add(r.zip);
    }
    // Cancelled (this period) and for-sale counts, for rows that also had sales.
    const geo = (r) => (!state.county || r.county === state.county) && (byCity || !state.city || r.city === state.city);
    const tally = (list, keep, field) => {
      for (const r of filtered({ ignoreGeo: true }, list)) {
        if (!geo(r) || !keep(r)) continue;
        const g = groups.get(byCity ? `${r.city}|${r.county}` : r.zip);
        if (g) g[field] = (g[field] ?? 0) + 1;
      }
    };
    tally(cancels, isCur, 'cancels');
    tally(active, forSale, 'active');
    const q = state.search.toLowerCase();
    const data = [...groups.entries()]
      .map(([key, g]) => {
        const c = summarize(g.cur), p = summarize(g.prior);
        const ok = c.n >= 3 && p.n >= 3;
        const id = byCity ? { key, city: key.split('|')[0], county: key.split('|')[1], zips: g.zips.size } : { key, zip: key, ...DATA.zips[key] };
        return {
          ...id,
          n: c.n, nPrior: p.n, nYoY: ok ? yoy(c.n, p.n) : null,
          avg: c.avg, avgPrior: p.avg, avgYoY: ok ? yoy(c.avg, p.avg) : null,
          median: c.median, ppsf: c.ppsf, dom: c.dom, overList: c.n >= 3 ? c.overList : null,
          cancels: g.cancels ?? 0, active: g.active ?? 0,
        };
      })
      .filter((r) => !q || r.city.toLowerCase().includes(q) || (!byCity && r.zip.includes(q)))
      .sort((a, b) => {
        const x = a[state.sortKey], y = b[state.sortKey];
        if (x == null) return 1;
        if (y == null) return -1;
        return (typeof x === 'string' ? x.localeCompare(y) : x - y) * state.sortDir;
      });

    const cell = (v, fmt) => (v == null ? '<td class="na">–</td>' : `<td>${fmt(v)}</td>`);
    const selected = (r) => (byCity ? !state.zip && r.city === state.city && r.county === state.county : r.zip === state.zip);
    $('#zip-table tbody').innerHTML = data
      .map((r) => `<tr data-key="${r.key}" class="${selected(r) ? 'selected' : ''}">
        ${byCity ? `<td>${r.city}</td><td>${r.county}</td><td>${r.zips}</td>` : `<td>${r.zip}</td><td>${r.city}</td><td>${r.county}</td>`}
        <td>${num(r.n)}</td><td>${num(r.nPrior)}</td><td>${pill(r.nYoY)}</td>
        ${cell(r.avg, money)}${cell(r.avgPrior, money)}<td>${pill(r.avgYoY)}</td>
        ${cell(r.median, money)}${cell(r.ppsf, (v) => `$${num(v)}`)}${cell(r.dom, num)}${HAS_MARKET ? cell(r.overList, share) : ''}
        ${HAS_LISTINGS ? `<td>${num(r.cancels)}</td><td>${num(r.active)}</td>` : ''}</tr>`)
      .join('');
    document.querySelectorAll('#zip-table th').forEach((th) =>
      th.setAttribute('aria-sort', th.dataset.key === state.sortKey ? (state.sortDir > 0 ? 'ascending' : 'descending') : 'none'));
  }
  $('#zip-table thead').addEventListener('click', (e) => {
    const key = e.target.closest('th')?.dataset.key;
    if (!key) return;
    state.sortDir = state.sortKey === key ? -state.sortDir : TEXT_KEYS.includes(key) ? 1 : -1;
    state.sortKey = key;
    renderZipTable();
  });
  $('#zip-table tbody').addEventListener('click', (e) => {
    const key = e.target.closest('tr')?.dataset.key;
    if (!key) return;
    if (state.groupBy === 'city') {
      const [city, county] = key.split('|');
      const same = !state.zip && state.city === city && state.county === county;
      Object.assign(state, same ? { city: '', zip: '' } : { county, city, zip: '' });
    } else {
      state.zip = state.zip === key ? '' : key;
      if (state.zip) ({ county: state.county, city: state.city } = DATA.zips[key]);
    }
    render();
  });
  document.querySelectorAll('[data-group]').forEach((btn) =>
    btn.addEventListener('click', () => {
      state.groupBy = btn.dataset.group;
      document.querySelectorAll('[data-group]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      // A sort on a column the other view doesn't have falls back to sales.
      if (!LEFT_COLS[state.groupBy].concat(NUM_COLS).some(([k]) => k === state.sortKey)) Object.assign(state, { sortKey: 'n', sortDir: -1 });
      renderZipTable();
    }),
  );
  $('#t-search').addEventListener('input', (e) => { state.search = e.target.value; renderZipTable(); });

  // ---------- homes vs. S&P 500 (local only) ----------
  // data/history.js is never deployed: build-site.mjs doesn't copy it, and it's only requested when the
  // page is opened from this computer. The math lives in vs-calc.js (unit-tested in test/vs-calc.test.mjs).
  const IS_LOCAL = location.protocol === 'file:' || ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  // Hidden by default even locally; open the dashboard with ?extras to show these two sections.
  const SHOW_EXTRAS = IS_LOCAL && new URLSearchParams(location.search).has('extras');
  const V = window.VsCalc;
  const hstate = { mode: 'price', home: 'avg', spy: 'price', grain: 'year' };
  // Buyer-owner assumptions, in percent. Defaults: 20% down, Bay Area-ish rent yield, CA Prop 13 tax.
  const ASSUME_DEFAULTS = { measuredRent: true, down: 20, rentYield: 3, taxRate: 1.15, taxGrowth: 2, insRate: 0.25, maintRate: 1, buyCost: 1, sellCost: 5 };
  let assume = { ...ASSUME_DEFAULTS };
  try { assume = { ...ASSUME_DEFAULTS, ...JSON.parse(localStorage.getItem('re-market:assume') || '{}') }; } catch { /* storage unavailable */ }
  const saveAssume = () => { try { localStorage.setItem('re-market:assume', JSON.stringify(assume)); } catch { /* ignore */ } };
  let H = null;
  if (SHOW_EXTRAS) {
    const tag = document.createElement('script');
    tag.src = '../data/history.js';
    tag.onload = () => { H = window.HISTORY_DATA ?? null; renderHistory(); renderRentals(); };
    tag.onerror = () => { renderHistory(); renderRentals(); };
    document.head.appendChild(tag);
  }
  const MON_LONG = (ym) => `${MON[+ym.slice(5, 7) - 1]} ${ym.slice(0, 4)}`;
  const monthEndText = (ym) => { const d = new Date(Date.UTC(+ym.slice(0, 4), +ym.slice(5, 7), 0)); return `${MON[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`; };
  const idxText = (v) => (v == null ? '–' : v.toFixed(1));
  const cumText = (idx) => (idx == null ? '–' : `${idx >= 100 ? '+' : ''}${(idx - 100).toFixed(1)}%`);
  const pctN = (v, d = 1) => (v == null ? '–' : `${v >= 0 ? '+' : ''}${(v * 100).toFixed(d)}%`);
  const spanText = (ms) => (ms.length === 12 ? 'Full year' : `${MON[+ms[0].slice(5, 7) - 1]}–${MON[+ms.at(-1).slice(5, 7) - 1]}`);

  function renderHistory() {
    if (!SHOW_EXTRAS) return;
    $('#history-card').hidden = false;
    const ready = !!(H && H.spy && Object.keys(H.spy).length && V);
    $('#hist-body').hidden = !ready;
    $('#hist-empty').hidden = ready;
    if (!ready) return;
    const invest = hstate.mode === 'invest';
    $('#hist-home-seg').hidden = invest;
    $('#hist-owner').hidden = !invest;
    $('#hist-spy-seg').hidden = invest;
    const blue = css('--series-1'), orange = css('--series-2');
    const notices = [];

    // Complete months only, on both sides.
    const lastMonth = V.lastCompleteMonth(H.through);
    const months = H.months.filter((m) => m <= lastMonth);
    const years = V.yearWindows(months);
    const ytdWin = years.at(-1)?.partial ? years.at(-1) : null;

    // Home sale prices per month for the dashboard filters ([zip, month, type, $K] quads).
    const okZip = H.zips.map(([zip, city, county]) =>
      (!state.county || county === state.county) && (!state.city || city === state.city) && (!state.zip || zip === state.zip));
    const okType = H.types.map((t) => !state.type || state.type.split('|').includes(t));
    const byMonth = new Map(H.months.map((m) => [m, []]));
    const R = H.rows;
    for (let i = 0; i < R.length; i += 4) if (okZip[R[i]] && okType[R[i + 2]]) byMonth.get(H.months[R[i + 1]]).push(R[i + 3] * 1000);
    const salesIn = (ms) => ms.reduce((a, m) => a + (byMonth.get(m)?.length ?? 0), 0);

    const cutoff = `Data through ${monthEndText(lastMonth)} (last complete month; MLS refreshed ${H.through}).`
      + (ytdWin && !invest ? ` ${ytdWin.year} is year-to-date and provisional: ${spanText(ytdWin.months)} ${ytdWin.year}, compared with ${spanText(ytdWin.months)} ${+ytdWin.year - 1}.` : '')
      + (ytdWin && invest ? ` ${ytdWin.year} is year-to-date and provisional: Dec 31, ${+ytdWin.year - 1} – ${monthEndText(lastMonth)}.` : '');
    $('#hist-cutoff').textContent = cutoff;

    if (invest) return renderInvest({ months, years, ytdWin, orange, notices });

    // ----- Mode A: market price comparison -----
    let homeName, homeSource, valueFor, homeMonthly = null, homeFmt = money;
    const hpiCounty = state.county;
    if (hstate.home === 'hpi') {
      const h = hpiCounty && H.hpi?.[hpiCounty];
      homeName = 'FHFA HPI';
      homeSource = h ? `FHFA All-Transactions HPI, ${hpiCounty} County (${h.series})` : 'FHFA HPI';
      homeFmt = (v) => (v == null ? '–' : v.toFixed(1));
      if (!hpiCounty) {
        const options = counties.filter((c) => H.hpi?.[c]).map((c) => `<button type="button" class="pick" data-pick-county="${c}">${c}</button>`).join('');
        notices.push(['warn', `FHFA HPI is published per county — there is no Bay Area-wide index. Pick a county to compare: <span class="picks">${options}</span>`]);
      }
      else if (!h) notices.push(['warn', `No FHFA HPI series is available for ${hpiCounty}.`]);
      if (h) {
        const last = Math.max(...Object.keys(h.values).map(Number));
        notices.push(['info', `${homeSource}: repeat-sales index of single-family homes (includes refinance appraisals), annual, through ${last}. It measures appreciation of the same homes, not the average sale.`]);
        if (state.city || state.zip) notices.push(['warn', `FHFA HPI is county-level, so your ${state.zip ? 'ZIP' : 'city'} filter doesn't apply — this line shows all of ${hpiCounty} County.`]);
        if (state.type && state.type !== 'Single Family') notices.push(['warn', 'FHFA HPI covers single-family homes only, so your property-type filter doesn\'t apply to it.']);
        if (hstate.grain === 'month') notices.push(['warn', 'FHFA county HPI is annual only — switch to Yearly to see it.']);
        if (ytdWin) notices.push(['info', `FHFA HPI for ${ytdWin.year} isn't published yet, so there is no year-to-date housing value.`]);
      }
      // Full years only; partial-year windows have no HPI value.
      valueFor = (ms) => (h && ms.length === 12 ? h.values[ms[0].slice(0, 4)] ?? null : null);
    } else {
      const agg = hstate.home === 'avg' ? V.mean : V.median;
      homeName = hstate.home === 'avg' ? 'Average sale price' : 'Median sale price';
      homeSource = `${homeName}, MLSListings closed sales`;
      valueFor = (ms) => { const p = ms.flatMap((m) => byMonth.get(m) ?? []); return p.length ? agg(p) : null; };
      homeMonthly = (m) => { const p = byMonth.get(m) ?? []; return p.length ? agg(p) : null; };
      notices.push(['info', `${homeName} reflects the mix of homes sold each year, not the appreciation of a given home. For repeat-sales appreciation, pick a county and choose FHFA HPI.`]);
    }
    const spyCol = hstate.spy === 'price' ? 0 : 1;
    const spyName = hstate.spy === 'price' ? 'SPY price' : 'SPY total return';
    if (spyCol === 1) notices.push(['warn', 'Mixed methodologies: housing price levels vs. SPY total return (with reinvested dividends). For a like-for-like price comparison choose SPY price; for investment performance use Investment returns.']);
    const spyValueFor = (ms) => V.mean(ms.map((m) => H.spy[m]?.[spyCol]).filter((v) => v != null));

    const home = V.annualLevels(months, valueFor);
    const spy = V.annualLevels(months, spyValueFor);
    const baseYear = spy.baseYear;
    const fullRows = (lv) => lv.rows.filter((r) => !r.partial && r.index != null);
    const hEnd = fullRows(home).at(-1), sEnd = fullRows(spy).at(-1);
    const hCagr = hEnd && home.baseYear ? V.cagr(home.base, hEnd.value, +hEnd.year - +home.baseYear) : null;
    const sCagr = sEnd ? V.cagr(spy.base, sEnd.value, +sEnd.year - +baseYear) : null;
    // Compare over the same full-year window.
    const sSame = hEnd ? spy.rows.find((r) => r.year === hEnd.year) : null;
    const sCagrSame = hEnd && sSame ? V.cagr(spy.base, sSame.value, +hEnd.year - +baseYear) : null;

    $('#hist-sub').textContent = `Market price comparison — not an investment return comparison. Both indexed to ${baseYear} = 100 (yearly averages). `
      + 'Stored only on this computer and not part of the online site.';

    const tile = (label, color, value, lines) => `<div class="vs-tile"><div class="label">${color ? `<i style="background:${color}"></i>` : ''}${label}</div>
      <div class="value">${value}</div>${lines.map((l) => `<div class="delta">${l}</div>`).join('')}</div>`;
    $('#vs-tiles').innerHTML =
      (hEnd
        ? tile(`Home price change · ${home.baseYear}–${hEnd.year}`, blue, cumText(hEnd.index),
          [hCagr != null ? `${pctN(hCagr)} per year (annualized)` : 'Annualized growth: needs 2+ full years', `${homeName}${hstate.home === 'hpi' ? ` · ${hpiCounty} County` : ' · reflects sales mix'}`])
        : tile('Home price change', blue, hstate.home === 'hpi' && !hpiCounty ? 'Pick a county' : 'No data',
          [hstate.home === 'hpi' ? 'FHFA HPI is county-level' : 'No sales for the current filters', 'Use the buttons above or the County filter']))
      + tile(`SPY ${spyCol ? 'total return level' : 'price change'} · ${baseYear}–${sSame?.year ?? sEnd?.year ?? '–'}`, orange, sSame ? cumText(sSame.index) : sEnd ? cumText(sEnd.index) : 'n/a',
        [sCagrSame != null ? `${pctN(sCagrSame)} per year (annualized)` : sCagr != null ? `${pctN(sCagr)} per year` : '–', spyCol ? 'Dividends included (reinvested)' : 'Price only · dividends not included'])
      + (hCagr != null && sCagrSame != null
        ? tile('Performance gap', null, `${((sCagrSame - hCagr) * 100).toFixed(1)} pt/yr`,
          [`${sCagrSame > hCagr ? 'SPY' : 'Homes'} ahead · index ${idxText(sSame.index)} vs ${idxText(hEnd.index)} (${(sSame.index / hEnd.index).toFixed(2)}×)`, 'Price levels, yearly averages, same years'])
        : tile('Performance gap', null, '—', ['Shown once both sides have full-year data', 'Price levels, yearly averages, same years']));

    // Chart + table
    let labels, hSeries, sSeries, hollow, describe, defaultIdx;
    if (hstate.grain === 'year') {
      const rows = spy.rows;
      labels = rows.map((r) => (r.partial ? `${r.year} YTD` : r.year));
      const hByYear = new Map(home.rows.map((r) => [r.year, r]));
      hSeries = rows.map((r) => hByYear.get(r.year)?.index ?? null);
      sSeries = rows.map((r) => r.index);
      hollow = new Set(rows.map((r, i) => (r.partial ? i : -1)));
      describe = (i, isDefault) => {
        const r = rows[i], hr = hByYear.get(r.year);
        return `<span class="ro-title">${labels[i]}${r.partial ? ' <span class="ro-sub">(provisional)</span>' : ''}</span>`
          + roKey(blue, homeName, hr?.value == null ? (hstate.home === 'hpi' ? 'not yet published' : '–') : `${homeFmt(hr.value)} <span class="ro-sub">· index ${idxText(hr.index)} (${cumText(hr.index)})</span>`)
          + roKey(orange, spyName, `$${r.value?.toFixed(2) ?? '–'} <span class="ro-sub">· index ${idxText(r.index)} (${cumText(r.index)})</span>`)
          + (r.partial ? `<span class="ro-rate">${spanText(r.months)} vs ${spanText(r.months)} ${+r.year - 1}</span>` : '')
          + roHint(isDefault);
      };
      defaultIdx = rows.length - 1;
    } else {
      labels = months;
      const homeOk = !!homeMonthly;
      hSeries = months.map((m) => (homeOk ? V.indexOf(homeMonthly(m), home.base) : null));
      sSeries = months.map((m) => V.indexOf(H.spy[m]?.[spyCol] ?? null, spy.base));
      hollow = undefined;
      describe = (i, isDefault) => `<span class="ro-title">${MON_LONG(months[i])}</span>`
        + roKey(blue, homeName, homeOk ? `${homeFmt(homeMonthly(months[i]))} <span class="ro-sub">· index ${idxText(hSeries[i])}</span>` : 'n/a')
        + roKey(orange, spyName, `$${H.spy[months[i]]?.[spyCol]?.toFixed(2) ?? '–'} <span class="ro-sub">· index ${idxText(sSeries[i])}</span>`)
        + `<span class="ro-rate">${num(byMonth.get(months[i])?.length ?? 0)} sales</span>` + roHint(isDefault);
      defaultIdx = months.length - 1;
    }
    const group = readoutGroup($('#hist-readout'), describe, defaultIdx);
    lineChart('hist-chart', labels, hSeries, sSeries, {
      curLabel: homeName, priorLabel: spyName, axisFmt: (v) => `${v}`, group, colors: [blue, orange], hollow,
      dense: hstate.grain === 'month', xTick: hstate.grain === 'month' ? (_, i) => (labels[i]?.endsWith('-01') ? labels[i].slice(0, 4) : '') : undefined,
    });
    showReadout(group, null, null);
    $('#hist-legend').innerHTML = legendKey(blue, homeSource) + legendKey(orange, `${spyName} (Yahoo Finance)`);

    $('#hist-head').innerHTML = ['Year', 'Period', homeName, 'Home index', 'Home YoY', `SPY avg ${spyCol ? 'adj. close' : 'close'}`, 'SPY index', 'SPY YoY', 'Sales']
      .map((h) => `<th>${h}</th>`).join('');
    const hByYear = new Map(home.rows.map((r) => [r.year, r]));
    $('#hist-table tbody').innerHTML = [...spy.rows].reverse().map((r) => {
      const hr = hByYear.get(r.year);
      const period = r.partial ? `${spanText(r.months)} <span class="ro-sub">vs ${spanText(r.months)} ${+r.year - 1}</span>` : 'Full year';
      return `<tr><td>${r.partial ? `<span class="chip" title="Provisional">${r.year} YTD</span>` : r.year}</td><td>${period}</td>
        <td>${homeFmt(hr?.value)}</td><td><b>${idxText(hr?.index)}</b>${r.partial && hr?.index != null ? '*' : ''}</td><td>${pill(hr?.yoy ?? null)}</td>
        <td>$${r.value?.toFixed(2) ?? '–'}</td><td><b>${idxText(r.index)}</b>${r.partial ? '*' : ''}</td><td>${pill(r.yoy)}</td><td>${num(salesIn(r.months))}</td></tr>`;
    }).join('');
    if (ytdWin) $('#hist-cutoff').textContent = cutoff + ' * Provisional index, chain-linked from the previous full year using the matching months.';
    renderNotices(notices);
  }

  // ----- Mode B: investment returns -----
  function renderInvest({ months, years, ytdWin, orange, notices }) {
    const baseMonth = `${+months[0].slice(0, 4) - 1}-12`;
    const adj = Object.fromEntries(Object.entries(H.spy).map(([m, v]) => [m, v[1]]));
    const price = Object.fromEntries(Object.entries(H.spy).map(([m, v]) => [m, v[0]]));
    if (!adj[baseMonth]) { notices.push(['warn', `SPY close for ${MON_LONG(baseMonth)} is missing; re-run npm run fetch:history.`]); renderNotices(notices); return; }
    const tr = V.calendarReturns(adj, months), pr = V.calendarReturns(price, months);
    const full = years.filter((w) => !w.partial);
    const endFull = full.at(-1);
    const nYears = full.length;
    const trEnd = endFull ? V.indexOf(adj[endFull.months.at(-1)], adj[baseMonth]) : null;
    const trCagr = endFull ? V.cagr(adj[baseMonth], adj[endFull.months.at(-1)], nYears) : null;
    const ytd = ytdWin ? tr.at(-1) : null;

    const owner = ownerEstimate(years);
    notices.push(['info', 'The real estate figure is an <b>estimate</b> from the assumptions below: buy in mid-' + (owner?.baseYear ?? '') + ' with a 30-yr fixed loan at that year\'s average rate, pay tax, insurance and maintenance, count the rent you no longer pay, then sell. It ignores income-tax effects, HOA, refinancing and vacancy. Home price growth on its own is not ROI.']);
    if (owner?.pathNote) notices.push(['info', owner.pathNote]);
    $('#hist-sub').textContent = `Investment returns: SPY with dividends reinvested, month-end to month-end from ${monthEndText(baseMonth)}. `
      + 'Stored only on this computer and not part of the online site.';

    const tile = (label, color, value, lines) => `<div class="vs-tile"><div class="label">${color ? `<i style="background:${color}"></i>` : ''}${label}</div>
      <div class="value">${value}</div>${lines.map((l) => `<div class="delta">${l}</div>`).join('')}</div>`;
    $('#vs-tiles').innerHTML =
      tile(`SPY total return · ${monthEndText(baseMonth)} – ${endFull ? monthEndText(endFull.months.at(-1)) : '–'}`, orange, cumText(trEnd),
        [trCagr != null ? `${pctN(trCagr)} per year over ${nYears} full years` : '–', 'Dividends included (reinvested)'])
      + tile(`SPY ${ytdWin ? `${ytdWin.year} year-to-date` : 'latest year'}`, orange, ytd ? pctN(ytd.ret) : '–',
        [ytd ? `${monthEndText(`${+ytdWin.year - 1}-12`)} – ${monthEndText(ytd.endMonth)} · provisional` : '', 'Dividends included (reinvested)'])
      + (owner?.r?.irr != null
        ? tile(`Real estate · buyer-owner estimate · mid-${owner.baseYear} – mid-${owner.endYear}`, css('--series-1'), `${pctN(owner.r.irr)} per year`,
          [owner.spyCagr != null ? `SPY total return, same dates: ${pctN(owner.spyCagr)} per year` : 'SPY same-dates return: n/a',
            `${owner.r.multiple?.toFixed(2) ?? '–'}× on ${money(owner.r.invested)} cash put in · estimate`])
        : tile('Real estate · buyer-owner estimate', null, 'Not available', [owner?.why ?? 'Needs full-year prices and the purchase-year mortgage rate', 'Home price growth alone is not an investment return']));
    renderOwnerTable(owner);

    let labels, series, describe, defaultIdx, hollow;
    if (hstate.grain === 'year') {
      labels = years.map((w) => (w.partial ? `${w.year} YTD` : w.year));
      series = years.map((w) => V.indexOf(adj[w.months.at(-1)], adj[baseMonth]));
      hollow = new Set(years.map((w, i) => (w.partial ? i : -1)));
      describe = (i, isDefault) => `<span class="ro-title">${labels[i]}</span>`
        + roKey(orange, 'SPY total return', `index ${idxText(series[i])} <span class="ro-sub">(${cumText(series[i])} since ${MON_LONG(baseMonth)})</span>`)
        + `<span class="ro-rate">${years[i].partial ? 'year-to-date' : 'calendar year'} <b>${pctN(tr[i].ret)}</b> · price only ${pctN(pr[i].ret)}</span>` + roHint(isDefault);
      defaultIdx = years.length - 1;
    } else {
      labels = months;
      series = V.pointIndex(adj, baseMonth, months);
      describe = (i, isDefault) => `<span class="ro-title">${MON_LONG(months[i])}</span>`
        + roKey(orange, 'SPY total return', `index ${idxText(series[i])} <span class="ro-sub">(${cumText(series[i])})</span>`)
        + `<span class="ro-rate">close $${price[months[i]]?.toFixed(2) ?? '–'}</span>` + roHint(isDefault);
      defaultIdx = months.length - 1;
    }
    const group = readoutGroup($('#hist-readout'), describe, defaultIdx);
    lineChart('hist-chart', labels, series, labels.map(() => null), {
      curLabel: 'SPY total return', priorLabel: '', axisFmt: (v) => `${v}`, group, colors: [orange, css('--series-prior')], hollow,
      dense: hstate.grain === 'month', xTick: hstate.grain === 'month' ? (_, i) => (labels[i]?.endsWith('-01') ? labels[i].slice(0, 4) : '') : undefined,
    });
    showReadout(group, null, null);
    $('#hist-legend').innerHTML = legendKey(orange, `SPY total return, dividends reinvested (Yahoo Finance) · ${MON_LONG(baseMonth)} = 100`);

    $('#hist-head').innerHTML = ['Year', 'Period', 'SPY close (period end)', 'Price return', 'Total return', 'From dividends', 'Total return index'].map((h) => `<th>${h}</th>`).join('');
    $('#hist-table tbody').innerHTML = years.map((w, i) => `<tr><td>${w.partial ? `<span class="chip">${w.year} YTD</span>` : w.year}</td>
        <td>${w.partial ? `Dec 31 – ${monthEndText(w.months.at(-1))}` : 'Dec 31 – Dec 31'}</td>
        <td>$${price[w.months.at(-1)]?.toFixed(2) ?? '–'}</td><td>${pill(pr[i].ret)}</td><td>${pill(tr[i].ret)}</td>
        <td>${tr[i].ret != null && pr[i].ret != null ? pctN(tr[i].ret - pr[i].ret, 2) : '–'}</td><td><b>${idxText(V.indexOf(adj[w.months.at(-1)], adj[baseMonth]))}</b></td></tr>`).reverse().join('');
    renderNotices(notices);
  }

  /**
   * Buyer-owner estimate inputs from the data: purchase at the base year's median sale price (current
   * filters), value path from FHFA HPI when a county is selected (repeat-sales appreciation), otherwise
   * from the yearly median sale price; loan rate = purchase-year average 30-yr rate.
   */
  function ownerEstimate(years) {
    const full = years.filter((w) => !w.partial);
    if (full.length < 2) return { why: 'Needs at least two full years of data' };
    const baseYear = full[0].year, endYear = full.at(-1).year;
    const okZip = H.zips.map(([zip, city, county]) =>
      (!state.county || county === state.county) && (!state.city || city === state.city) && (!state.zip || zip === state.zip));
    const okType = H.types.map((t) => !state.type || state.type.split('|').includes(t));
    const byYear = new Map(full.map((w) => [w.year, []]));
    for (let i = 0; i < H.rows.length; i += 4) {
      if (!okZip[H.rows[i]] || !okType[H.rows[i + 2]]) continue;
      const y = H.months[H.rows[i + 1]].slice(0, 4);
      byYear.get(y)?.push(H.rows[i + 3] * 1000);
    }
    const P0 = V.median(byYear.get(baseYear) ?? []);
    if (!P0) return { baseYear, endYear, why: 'No sales for the current filters in ' + baseYear };
    const h = state.county ? H.hpi?.[state.county] : null;
    let values, pathNote;
    if (h && full.every((w) => h.values[w.year])) {
      values = full.map((w) => P0 * (h.values[w.year] / h.values[baseYear]));
      pathNote = `Home value grows with the FHFA repeat-sales HPI for ${state.county} County, starting from the ${baseYear} median sale price (${money(P0)}).`;
    } else {
      values = full.map((w) => V.median(byYear.get(w.year) ?? []));
      pathNote = `Home value follows the yearly median sale price (${money(P0)} in ${baseYear}), which moves with the mix of homes sold. Select a county to grow it with the FHFA repeat-sales HPI instead.`;
    }
    const rateVals = H.months.filter((m) => m.startsWith(baseYear)).map((m) => H.rates?.[m]).filter((v) => v != null);
    if (!rateVals.length) return { baseYear, endYear, why: `Mortgage rate for ${baseYear} is missing; re-run npm run fetch:history` };
    const rate = V.mean(rateVals) / 100;
    const a = Object.fromEntries(Object.entries(assume).filter(([k]) => k !== 'measuredRent').map(([k, v]) => [k, (Number(v) || 0) / 100]));
    // Measured rent: each holding year spans mid-(y-1) to mid-y, so use the average of those two
    // calendar years' gross yields (current filters, all bedrooms).
    let rentNote = `${assume.rentYield}% of value (manual)`;
    if (assume.measuredRent) {
      const yields = full.map((w) => rentYieldFor(w.months)?.yield ?? null);
      const perYear = yields.slice(1).map((y, k) => (y != null && yields[k] != null ? (y + yields[k]) / 2 : null));
      if (perYear.length && perYear.every((v) => v != null)) {
        a.rentYield = perYear;
        rentNote = `measured MLS yield, avg ${(V.mean(perYear) * 100).toFixed(2)}% of value`;
      } else {
        rentNote = `${assume.rentYield}% of value (manual — not enough lease data for these filters)`;
      }
    }
    const r = V.ownerReturn(values, rate, a);
    // SPY total return over the same holding window (mid-year to mid-year).
    const s0 = H.spy[`${baseYear}-06`]?.[1], s1 = H.spy[`${endYear}-06`]?.[1];
    const spyCagr = V.cagr(s0, s1, +endYear - +baseYear);
    return { baseYear, endYear, P0, rate, values, r, spyCagr, pathNote, rentNote, why: r ? null : 'Incomplete price data for the holding period' };
  }

  function renderOwnerTable(owner) {
    const form = $('#hist-assume');
    for (const [k, v] of Object.entries(assume)) {
      const el = form.elements[k];
      if (!el || document.activeElement === el) continue;
      if (el.type === 'checkbox') el.checked = !!v;
      else el.value = v;
    }
    form.elements.rentYield.disabled = !!assume.measuredRent;
    $('#hist-measured').textContent = owner?.rentNote?.startsWith('measured') ? `(${owner.rentNote.replace('measured MLS yield, ', '')})` : '';
    const r = owner?.r;
    if (!r) { $('#hist-owner-table tbody').innerHTML = `<tr><td>${owner?.why ?? 'Not enough data'}</td></tr>`; return; }
    const t = r.totals;
    const rows = [
      ['Purchase price', `${money(r.purchase)} <span class="ro-sub">(${owner.baseYear} median sale)</span>`],
      ['Cash at purchase', `${money(r.initial)} <span class="ro-sub">(down payment + buying costs)</span>`],
      ['Loan', `${money(r.loan)} at ${(owner.rate * 100).toFixed(2)}% <span class="ro-sub">(${owner.baseYear} avg 30-yr rate)</span>`],
      [`Mortgage payments, ${r.years} yrs`, `−${money(t.mortgage)}`],
      ['Property tax + insurance + maintenance', `−${money(t.tax + t.insurance + t.maintenance)}`],
      ['Rent saved', `+${money(t.rent)} <span class="ro-sub">(${owner.rentNote})</span>`],
      ['Sale price', `${money(r.sale)} <span class="ro-sub">(mid-${owner.endYear})</span>`],
      ['Net from sale', `${money(r.saleNet)} <span class="ro-sub">(after selling costs and ${money(r.balance)} loan payoff)</span>`],
      ['Annual return (IRR)', `<b>${pctN(r.irr)}</b> <span class="ro-sub">vs SPY ${pctN(owner.spyCagr)} same dates</span>`],
    ];
    $('#hist-owner-table tbody').innerHTML = rows.map(([k, v]) => `<tr><th scope="row">${k}</th><td>${v}</td></tr>`).join('');
  }
  $('#hist-assume').addEventListener('input', (e) => {
    if (!e.target.name) return;
    assume[e.target.name] = e.target.type === 'checkbox' ? e.target.checked : e.target.value === '' ? 0 : Number(e.target.value);
    saveAssume();
    renderHistory();
  });
  $('#hist-assume-reset').addEventListener('click', () => { assume = { ...ASSUME_DEFAULTS }; saveAssume(); renderHistory(); });

  // ---------- rentals (local only) ----------
  const rstate = { metric: 'rent', beds: 'all', group: 'city' };
  const bedsOk = (b) => rstate.beds === 'all' || (rstate.beds === '1' ? b >= 0 && b <= 1 : rstate.beds === '4' ? b >= 4 : b === +rstate.beds);

  /** Leases and sales matching the dashboard filters, bucketed by month. */
  function rentPools() {
    const okZip = H.zips.map(([zip, city, county]) =>
      (!state.county || county === state.county) && (!state.city || city === state.city) && (!state.zip || zip === state.zip));
    const okType = H.types.map((t) => !state.type || state.type.split('|').includes(t));
    return { okZip, okType };
  }

  /** Gross yield for a set of months (current filters, all bedrooms), weighted by property type. */
  function rentYieldFor(months, zipFilter) {
    if (!H?.leases) return null;
    const { okZip, okType } = rentPools();
    const set = new Set(months.map((m) => H.months.indexOf(m)));
    const groups = {};
    const g = (t) => (groups[H.types[t]] ??= { rents: [], prices: [] });
    const L = H.leases, R = H.rows;
    for (let i = 0; i < L.length; i += 6) {
      if (!set.has(L[i + 1]) || !okZip[L[i]] || !okType[L[i + 2]] || (zipFilter && !zipFilter(L[i]))) continue;
      g(L[i + 2]).rents.push(L[i + 3]);
    }
    for (let i = 0; i < R.length; i += 4) {
      if (!set.has(R[i + 1]) || !okZip[R[i]] || !okType[R[i + 2]] || (zipFilter && !zipFilter(R[i]))) continue;
      g(R[i + 2]).prices.push(R[i + 3] * 1000);
    }
    return V.typeWeightedYield(groups);
  }

  function renderRentals() {
    if (!SHOW_EXTRAS) return;
    $('#rent-card').hidden = false;
    const ready = !!(H?.leases?.length && V);
    $('#rent-body').hidden = !ready;
    $('#rent-empty').hidden = ready;
    if (!ready) return;
    const blue = css('--series-1');
    const { okZip, okType } = rentPools();
    const lastMonth = V.lastCompleteMonth(H.through);
    const months = H.months.filter((m) => m <= lastMonth);
    const years = V.yearWindows(months);
    const mIdx = new Map(H.months.map((m, i) => [m, i]));

    // Leases matching filters + bedrooms, by month index: [rent, sqft]
    const byMonth = new Map();
    const L = H.leases;
    for (let i = 0; i < L.length; i += 6) {
      if (!okZip[L[i]] || !okType[L[i + 2]] || !bedsOk(L[i + 4])) continue;
      (byMonth.get(L[i + 1]) ?? byMonth.set(L[i + 1], []).get(L[i + 1])).push([L[i + 3], L[i + 5]]);
    }
    const leasesIn = (ms) => ms.flatMap((m) => byMonth.get(mIdx.get(m)) ?? []);
    const stats = (ms) => {
      const l = leasesIn(ms);
      const withSqft = l.filter(([, s]) => s > 0);
      return { n: l.length, rent: V.median(l.map(([r]) => r)), psf: withSqft.length ? V.median(withSqft.map(([r, s]) => r / s)) : null };
    };
    const salesMedian = (ms) => {
      const set = new Set(ms.map((m) => mIdx.get(m)));
      const p = [];
      for (let i = 0; i < H.rows.length; i += 4) if (set.has(H.rows[i + 1]) && okZip[H.rows[i]] && okType[H.rows[i + 2]]) p.push(H.rows[i + 3] * 1000);
      return V.median(p);
    };

    const bedsLabel = { all: 'all bedrooms', 1: 'studio / 1 bd', 2: '2 bd', 3: '3 bd', 4: '4+ bd' }[rstate.beds];
    const notices = [
      ['info', 'Closed MLS leases only — mostly houses, condos and townhouses leased through agents. Apartment buildings and landlord-direct rentals are not included, so this reflects the single-family / condo rental market.'],
      ['info', `Gross yield = median rent × 12 ÷ median sale price, computed per property type and weighted by sales mix (all bedrooms, before costs). ${H.leaseDropped ? `Removed as likely mis-entries: ${num((H.leaseDropped.range ?? 0) + (H.leaseDropped.vsList ?? 0) + (H.leaseDropped.perSqft ?? 0))} leases.` : ''}`],
    ];
    if (rstate.beds !== 'all' && rstate.metric === 'yield') notices.push(['warn', 'Gross yield always uses all bedrooms, because sale records here have no bedroom count.']);
    $('#rent-notices').innerHTML = notices.map(([k, t]) => `<li class="${k}">${t}</li>`).join('');

    // Tiles: last 12 complete months vs the 12 before.
    const { cur: c12, prior: p12 } = V.trailing12(lastMonth);
    const sc = stats(c12), sp = stats(p12);
    const yc = rentYieldFor(c12), yp = rentYieldFor(p12);
    const span = `${MON_LONG(c12[0])} – ${MON_LONG(c12.at(-1))}`;
    const tile = (label, value, lines) => `<div class="vs-tile"><div class="label">${label}</div><div class="value">${value}</div>${lines.map((l) => `<div class="delta">${l}</div>`).join('')}</div>`;
    const pts2 = (a, b) => (a == null || b == null ? '–' : `${a >= b ? '+' : '−'}${Math.abs((a - b) * 100).toFixed(2)} pt`);
    $('#rent-tiles').innerHTML =
      tile(`Median rent · ${bedsLabel}`, sc.rent ? `$${num(sc.rent)}/mo` : '–', [`${pill(yoy(sc.rent, sp.rent))} vs prior 12 months ($${num(sp.rent)})`, span])
      + tile('Rent per sqft', sc.psf ? `$${sc.psf.toFixed(2)}` : '–', [`${pill(yoy(sc.psf, sp.psf))} vs prior 12 months`, 'Median, monthly'])
      + tile('Gross rent yield', yc ? `${(yc.yield * 100).toFixed(2)}%` : '–', [`${pts2(yc?.yield, yp?.yield)} vs prior 12 months`, 'Rent × 12 ÷ price, before costs'])
      + tile('Leases', num(sc.n), [`${pill(yoy(sc.n, sp.n))} vs prior 12 months`, 'Closed MLS leases']);

    // Yearly series (YTD year: same months as the YTD; YoY vs same months last year).
    const yr = years.map((w) => {
      const s = stats(w.months);
      const prev = w.partial ? stats(V.samePeriodLastYear(w.months)) : null;
      return { w, ...s, prevRent: prev?.rent, price: salesMedian(w.months), yld: rentYieldFor(w.months)?.yield ?? null };
    });
    yr.forEach((r, i) => { if (!r.w.partial && i) r.prevRent = yr[i - 1].rent; });
    const metricVal = (r) => ({ rent: r.rent, psf: r.psf, yield: r.yld != null ? r.yld * 100 : null })[rstate.metric];
    const fmtMetric = (v) => (v == null ? '–' : rstate.metric === 'rent' ? `$${num(v)}` : rstate.metric === 'psf' ? `$${v.toFixed(2)}` : `${v.toFixed(2)}%`);
    const metricName = { rent: `Median rent (${bedsLabel})`, psf: `Rent per sqft (${bedsLabel})`, yield: 'Gross rent yield' }[rstate.metric];
    const labels = yr.map((r) => (r.w.partial ? `${r.w.year} YTD` : r.w.year));
    const series = yr.map(metricVal);
    const group = readoutGroup($('#rent-readout'), (i, isDefault) => {
      const r = yr[i];
      return `<span class="ro-title">${labels[i]}${r.w.partial ? ' <span class="ro-sub">(provisional)</span>' : ''}</span>`
        + roKey(blue, metricName, fmtMetric(series[i]))
        + (rstate.metric === 'rent' && yoy(r.rent, r.prevRent) != null ? `${pill(yoy(r.rent, r.prevRent))}<span>${r.w.partial ? 'vs same months last year' : 'vs prior year'}</span>` : '')
        + `<span class="ro-rate">${num(r.n)} leases · median sale ${money(r.price)}</span>` + roHint(isDefault);
    }, yr.length - 1);
    lineChart('rent-chart', labels, series, labels.map(() => null), {
      curLabel: metricName, priorLabel: '', group, colors: [blue, css('--series-prior')],
      hollow: new Set(yr.map((r, i) => (r.w.partial ? i : -1))),
      axisFmt: (v) => (rstate.metric === 'rent' ? `$${num(v)}` : rstate.metric === 'psf' ? `$${(+v).toFixed(1)}` : `${(+v).toFixed(1)}%`),
    });
    showReadout(group, null, null);
    $('#rent-sub').textContent = `${metricName} by year since ${years[0]?.year} for the current filters. Stored only on this computer and not part of the online site.`;
    $('#rent-year-table tbody').innerHTML = [...yr].reverse().map((r) => `<tr>
      <td>${r.w.partial ? `<span class="chip">${r.w.year} YTD</span>` : r.w.year}</td>
      <td>${r.w.partial ? `${MON[0]}–${MON[r.w.months.length - 1]}` : 'Full year'}</td>
      <td>${num(r.n)}</td><td>${r.rent ? `$${num(r.rent)}` : '–'}</td><td>${pill(yoy(r.rent, r.prevRent))}</td>
      <td>${r.psf ? `$${r.psf.toFixed(2)}` : '–'}</td><td>${money(r.price)}</td><td>${r.yld != null ? `${(r.yld * 100).toFixed(2)}%` : '–'}</td></tr>`).join('');

    // Area table: last 12 months by city or zip, highest yield first; areas need 5+ leases.
    const byCity = rstate.group === 'city';
    const keyOf = (zi) => (byCity ? `${H.zips[zi][1]}|${H.zips[zi][2]}` : H.zips[zi][0]);
    const set12 = new Set(c12.map((m) => mIdx.get(m))), setP = new Set(p12.map((m) => mIdx.get(m)));
    const areas = new Map();
    const A = (k) => areas.get(k) ?? areas.set(k, { cur: [], prior: [], zips: new Set() }).get(k);
    for (let i = 0; i < L.length; i += 6) {
      if (!okZip[L[i]] || !okType[L[i + 2]] || !bedsOk(L[i + 4])) continue;
      const bucket = set12.has(L[i + 1]) ? 'cur' : setP.has(L[i + 1]) ? 'prior' : null;
      if (!bucket) continue;
      const a = A(keyOf(L[i]));
      a[bucket].push([L[i + 3], L[i + 5]]);
      a.zips.add(L[i]);
    }
    const MIN_AREA_LEASES = 20;
    const rows = [...areas].filter(([, a]) => a.cur.length >= MIN_AREA_LEASES).map(([k, a]) => {
      const rent = V.median(a.cur.map(([r]) => r)), prior = V.median(a.prior.map(([r]) => r));
      const ws = a.cur.filter(([, s]) => s > 0);
      const y = rentYieldFor(c12, (zi) => keyOf(zi) === k);
      return { k, label: byCity ? k.split('|')[0] : k, county: byCity ? k.split('|')[1] : H.zips[[...a.zips][0]][2], city: byCity ? null : H.zips[[...a.zips][0]][1],
        n: a.cur.length, rent, yoy: a.prior.length >= 5 ? yoy(rent, prior) : null, psf: ws.length ? V.median(ws.map(([r, s]) => r / s)) : null, yld: y?.yield ?? null };
    }).sort((a, b) => (b.yld ?? -1) - (a.yld ?? -1));
    $('#rent-area-head').innerHTML = [byCity ? 'City' : 'Zip', byCity ? 'County' : 'City', 'Leases (12 mo)', 'Median rent', 'Rent YoY', 'Rent / sqft', 'Gross yield']
      .map((h) => `<th>${h}</th>`).join('');
    $('#rent-area-table tbody').innerHTML = rows.map((r) => `<tr><td>${r.label}</td><td>${byCity ? r.county : r.city}</td><td>${num(r.n)}</td>
      <td>${r.rent ? `$${num(r.rent)}` : '–'}</td><td>${pill(r.yoy)}</td><td>${r.psf ? `$${r.psf.toFixed(2)}` : '–'}</td>
      <td>${r.yld != null ? `<b>${(r.yld * 100).toFixed(2)}%</b>` : '–'}</td></tr>`).join('');
    $('#rent-area-sub').textContent = `Last 12 months (${span}), ${bedsLabel}; highest gross yield first. Higher yield = rent is cheap relative to buying. Areas need ${MIN_AREA_LEASES}+ leases.`;
    $('#rent-cutoff').textContent = `Data through ${monthEndText(lastMonth)} (last complete month). ${years.at(-1)?.partial ? `${years.at(-1).year} is year-to-date and provisional.` : ''}`;
  }
  for (const [attr, key] of [['rmetric', 'metric'], ['rbeds', 'beds'], ['rgroup', 'group']]) {
    document.querySelectorAll(`[data-${attr}]`).forEach((btn) =>
      btn.addEventListener('click', () => {
        rstate[key] = btn.dataset[attr];
        document.querySelectorAll(`[data-${attr}]`).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        applyChartDefaults();
        renderRentals();
      }),
    );
  }

  function renderNotices(list) {
    $('#hist-notices').innerHTML = list.map(([kind, html]) => `<li class="${kind}">${html}</li>`).join('');
  }
  $('#hist-notices').addEventListener('click', (e) => {
    const county = e.target.closest('[data-pick-county]')?.dataset.pickCounty;
    if (!county) return;
    Object.assign(state, { county, city: '', zip: '' });
    render();
  });
  for (const [attr, key] of [['hmode', 'mode'], ['hhome', 'home'], ['hspy', 'spy'], ['hgrain', 'grain']]) {
    document.querySelectorAll(`[data-${attr}]`).forEach((btn) =>
      btn.addEventListener('click', () => {
        hstate[key] = btn.dataset[attr];
        document.querySelectorAll(`[data-${attr}]`).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        applyChartDefaults();
        renderHistory();
      }),
    );
  }

  // ---------- period toggle ----------
  function renderPeriodLabels() {
    const label = `${rangeText(period.cur)} vs. ${rangeText(period.prior)}`;
    $('#period-label').innerHTML = `<b>${period.name}:</b> ${label}`;
    $('#zip-sub').textContent = `${period.name}: ${label}.`;
  }
  document.querySelectorAll('[data-period]').forEach((btn) =>
    btn.addEventListener('click', () => {
      period = PERIODS[btn.dataset.period];
      isCur = between(...period.cur);
      isPrior = between(...period.prior);
      document.querySelectorAll('[data-period]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      render();
    }),
  );

  // ---------- page ----------
  function render() {
    syncFilters();
    renderPeriodLabels();
    applyChartDefaults();
    const rows = filtered();
    renderTiles(rows);
    renderListingTiles(rows, filtered({}, cancels), filtered({}, active));
    renderYearCharts(rows);
    const months = renderMonthTable(rows);
    renderSummary(rows, months);
    renderWeekly(rows);
    renderDist(rows);
    renderZipTable();
    if (H) { renderHistory(); renderRentals(); }
  }

  const updated = new Date(DATA.generatedAt);
  $('#updated').textContent = `Last updated: ${updated.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, ${updated.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  if (DATA.source === 'mock') {
    $('#banner').hidden = false;
    $('#banner').textContent = 'Showing synthetic demo data. Run `npm run fetch` for real MLS sales.';
  }
  $('#notes').innerHTML = (DATA.notes || []).map((n) => `<p>${n}</p>`).join('');

  // ---------- TV view: only the two monthly charts, full screen ----------
  // Open with #tv in the URL to start in TV view (e.g. on a wall display).
  let tvReload;
  function setTV(on, { fullscreen = true } = {}) {
    document.body.classList.toggle('tv', on);
    const btn = $('#tv-toggle');
    btn.setAttribute('aria-pressed', String(on));
    btn.querySelector('[data-icon]').innerHTML = icon(on ? 'exit' : 'tv');
    btn.querySelector('.tv-label').textContent = on ? 'Exit TV view' : 'TV view';
    history.replaceState(null, '', on ? '#tv' : location.pathname + location.search);
    if (fullscreen) {
      if (on && !document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
      if (!on && document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    }
    // A wall display stays up for days: reload hourly to pick up a fresh `npm run fetch`.
    clearInterval(tvReload);
    if (on) tvReload = setInterval(() => location.reload(), 60 * 60 * 1000);
    render();
  }
  $('#tv-toggle').addEventListener('click', () => setTV(!isTV()));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isTV()) setTV(false); });
  // Leaving browser full screen (Esc / F11) also leaves TV view.
  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && isTV()) setTV(false, { fullscreen: false }); });

  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', render);
  if (location.hash === '#tv') setTV(true, { fullscreen: false });
  else render();
})();
