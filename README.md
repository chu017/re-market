# Bay Area Market Monitor

Local dashboard tracking Bay Area closed residential sales:

- **KPI tiles** (last 90 days vs the same 90 days last year): closed sales, average, median, $/sqft
- **Listing activity tiles**: active listings and pending sales today vs. the same day last year, months of supply,
  new listings, cancelled listings (canceled + withdrawn + expired, by off-market date), average days on market,
  % sold over list (with sale-to-list ratio) and price reductions (share of active listings below their original
  price). Last year's inventory is rebuilt from each listing's on-market → under-contract / off-market dates
- **Monthly sales volume** and **monthly average sale price**, Jan–Dec, this year vs last year, each with a
  **30-yr mortgage rate** strip (monthly average and month-over-month change) aligned underneath
- **Market summary**: auto-generated takeaways from the current selection
- **Monthly comparison table**: last 3 months + month-to-date, sales and average price YoY and month over month
  (the running month is compared with the same days of the previous month)
- **Weekly trend**: median sale price, last 12 weeks vs the same weeks last year
- **Sales distribution**: price bands (<$1M … >$5M) or a $1M–$10M+ histogram in $250K bins
- **By zip code**: volume and average price YoY, avg days on market, % over list, cancelled and active listings (sortable,
  searchable, click to drill in)
- Filters by county, city, zip, and property type
- The two local-only sections below are hidden by default; open the dashboard with `?extras` (e.g.
  `index.html?extras`) to show them
- **Homes vs. S&P 500 (local only)**: *Market price comparison* (home average / median sale price or FHFA
  repeat-sales HPI vs. SPY price, 2015 = 100, yearly averages; YTD compared with the same months last year and
  chain-linked as provisional) and *Investment returns* (SPY total return, Dec-to-Dec, plus an editable buyer-owner real
  estate estimate: leverage at the purchase-year mortgage rate, ownership costs, rent saved, IRR on cash). Run `npm run fetch:history`; `data/history.js` is git-ignored, never copied into
  `dist/`, and only loaded from `file://` or `localhost`, so it never appears online
- **Rentals (local only)**: closed MLS leases since 2015 — median rent, rent per sqft and gross rent yield (rent × 12 ÷
  sale price, per property type, weighted by sales mix) by year and bedroom count, last-12-month tiles, and a
  city/zip table of where renting is cheap vs. buying. The buyer-owner estimate uses these measured yields by default