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
- **TV view** (header button, or open `dashboard/index.html#tv`): full-screen large-type view of just the two
  monthly charts and their rate strips for a wall display; reloads hourly, Esc exits

Data comes from the **MLSListings RESO Web API** (closed Residential + ResidentialIncome listings in the
nine Bay Area counties).

## Setup

Requires Node 18+ (no npm dependencies).

```sh
cp .env.example .env          # set MLS_API_BASE and MLS_ACCESS_TOKEN
npm run fetch                 # pull closed sales since Jan 1 last year -> data/sales.js
npm run serve                 # http://localhost:5173/dashboard/
```

You can also just open `dashboard/index.html` directly. `npm run mock` writes synthetic demo data instead.

```sh
npm run fetch -- --counties "SantaClara,SanMateo,SantaCruz"   # MLS county names, no spaces
npm run fetch -- --refresh                                    # re-download every month

Sales are fetched month by month (~700 requests the first time, a few minutes). Finished months are cached
in `data/raw/` for 7 days (`--cache-days N`) and the current month once per day, so a daily refresh only
re-downloads the running month.
```

## Notes on the MLS feed

- **Coverage**: MLSListings is the MLS for Santa Clara, San Mateo and Santa Cruz, so those counties are
  complete. SF, East Bay and North Bay sales appear only when cross-listed here; most are on SFAR, bridgeMLS or
  BAREIS. The county dropdown shows each county's 90-day sales count so thin coverage is visible.
- **Paging**: the server returns at most 50 rows per request regardless of `$top`, and its `nextLink` stops
  early, so the fetcher pages by key (`ListingKeyNumeric gt <last>`) and checks the total against `$count`.
- Property types: Single Family / Condo / Townhouse from `PropertySubType`; all `ResidentialIncome` listings
  count as Multi-Family. Land, commercial and mobile homes are excluded. Sales under $50K are dropped.
- The fetcher warns when `MLS_ACCESS_TOKEN` is within 14 days of expiry.
- YoY per zip is shown only when both periods have at least 3 sales.
- `npm run fetch:rentcast` is an alternative source (county recorder data via RentCast, needs
  `RENTCAST_API_KEY`; uses `config/bayarea-zips.json`).

## Mortgage rates

`npm run fetch` also runs `fetch-rates.mjs`, which downloads the weekly Freddie Mac 30-year fixed rate
(FRED series `MORTGAGE30US`). A month's rate is the average of the weekly readings published that month
(month-to-date for the current month); MoM is the change from the previous month in percentage points.

## Layout

```
config/bayarea-zips.json    zip list for the RentCast fetcher
scripts/fetch-mls.mjs       MLSListings fetcher (keyset paging, per-month cache)
scripts/fetch-rentcast.mjs  alternative RentCast fetcher
scripts/fetch-rates.mjs     30-yr mortgage rate (Freddie Mac PMMS via FRED, no key) -> data/rates.js
scripts/mock-data.mjs       synthetic demo data
scripts/serve.mjs           static file server
dashboard/                  index.html, app.js, styles.css (Chart.js from cdnjs)
data/sales.js               generated dataset (git-ignored)
```

## Deploy (GitHub Pages, refreshed daily)

`.github/workflows/deploy.yml` runs every day at 14:00 UTC (6–7am Pacific), on every push to `main`, and on demand.
It restores the cached MLS months, runs `npm run fetch`, and publishes `dashboard/` + `data/*.js` to GitHub Pages.

One-time setup on github.com:

1. **Settings → Secrets and variables → Actions → New repository secret**: add `MLS_API_BASE` and `MLS_ACCESS_TOKEN`
   (same values as `.env`).
2. **Settings → Pages → Build and deployment → Source: GitHub Actions.** (Pages on a free account needs a public repo.)
3. **Actions → Refresh data and deploy → Run workflow.** The site appears at `https://<user>.github.io/re-market/`;
   TV view is `…/re-market/dashboard/#tv`.

The token is only used inside the workflow; the published site contains just the processed sales and rate files.
Check that your MLS data license permits public display of sold data before making the site public.
