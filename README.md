# Bay Area Market Monitor

Local dashboard tracking Bay Area closed residential sales:

- **KPI tiles** (last 90 days vs the same 90 days last year): closed sales, average, median, $/sqft
- **Monthly sales volume** and **monthly average sale price**, Jan–Dec, this year vs last year, each with a
  **30-yr mortgage rate** strip (monthly average and month-over-month change) aligned underneath
- **Market summary**: auto-generated takeaways from the current selection
- **Monthly comparison table**: last 3 months + month-to-date, sales and average price YoY
- **Weekly trend**: median sale price, last 12 weeks vs the same weeks last year
- **Sales distribution**: price bands (<$1M … >$5M) or a $1M–$10M+ histogram in $250K bins
- **By zip code**: volume and average price YoY (sortable, searchable, click to drill in)
- Filters by county, city, zip, and property type
- **Homes vs. S&P 500 (local only)**: *Market price comparison* (home average / median sale price or FHFA
  repeat-sales HPI vs. SPY price, 2015 = 100, yearly averages; YTD compared with the same months last year and
  chain-linked as provisional) and *Investment returns* (SPY total return, Dec-to-Dec, plus an editable buyer-owner real
  estate estimate: leverage at the purchase-year mortgage rate, ownership costs, rent saved, IRR on cash). Run `npm run fetch:history`; `data/history.js` is git-ignored, never copied into
  `dist/`, and only loaded from `file://` or `localhost`, so it never appears online