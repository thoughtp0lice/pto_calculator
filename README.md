# PTO Calculator

A small React + Vite app for projecting your paid time off balance day by day. Configure your accrual rate and workdays, click days on a two-year calendar to plan PTO or mark holidays, and see your running balance update in real time.

## Features

- Configurable accrual (hours per hour worked), workday length, and starting balance
- Per-weekday workday toggles (default Mon–Fri)
- Calendar view with running PTO balance shown on every day
- Click mode switch: tap days to either book PTO or mark them as holidays
- Holidays don't accrue PTO and don't deduct from your balance
- Negative-balance days are highlighted so you can see if you've over-planned

## Getting started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually <http://localhost:5173>).

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — build for production into `dist/`
- `npm run preview` — preview the production build locally

## How the math works

For each day between your start date and two years out:

- If it's a workday, not a holiday, and not a PTO day → accrue `accrualPerHour × hoursPerDay`
- If it's a PTO day → deduct `hoursPerDay`
- If it's a holiday → neither accrue nor deduct

The default accrual of `0.0577` hours per hour worked works out to roughly 15 days/year on an 8-hour day.

## Deployment

Cloudflare Pages. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**, pick this repo, then accept the Vite preset (`npm run build`, output `dist/`). Every push to `main` redeploys.

## Project layout

- `src/App.jsx` — top-level state and layout
- `src/Calendar.jsx` — month grid and day-cell rendering
- `src/pto.js` — date helpers and `buildBalances` calculation
- `src/styles.css` — styling
