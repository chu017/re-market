// Assembles the static site in dist/ for Cloudflare Pages (or any static host):
//   dist/dashboard/...   the dashboard
//   dist/data/*.js       generated sales + rate data (dashboard loads ../data/*.js)
//   dist/_redirects      "/" -> /dashboard/
//   dist/_headers        data files are always revalidated so a new build shows up immediately
//
//   npm run build        fetch fresh data, then assemble (what Cloudflare runs)
//   npm run build:site   assemble only, from the data already in data/

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './lib.mjs';

const dist = join(ROOT, 'dist');
const dataFiles = ['sales.js', 'rates.js'];
const missing = dataFiles.filter((f) => !existsSync(join(ROOT, 'data', f)));
if (missing.includes('sales.js')) {
  console.error('data/sales.js is missing - run `npm run fetch` first.');
  process.exit(1);
}

rmSync(dist, { recursive: true, force: true });
mkdirSync(join(dist, 'data'), { recursive: true });
cpSync(join(ROOT, 'dashboard'), join(dist, 'dashboard'), { recursive: true });
for (const f of dataFiles) if (!missing.includes(f)) cpSync(join(ROOT, 'data', f), join(dist, 'data', f));

writeFileSync(join(dist, '_redirects'), '/ /dashboard/ 302\n');
writeFileSync(join(dist, '_headers'), '/data/*\n  Cache-Control: no-cache\n');

console.log(`Site assembled in ${dist}${missing.length ? ` (skipped missing: ${missing.join(', ')})` : ''}`);
