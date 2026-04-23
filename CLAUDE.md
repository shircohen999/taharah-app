# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**לוח הטהרה שלי** — a Hebrew RTL Jewish tahara (family purity) calendar app. Single-page app deployed via GitHub → Vercel auto-deploy. Firebase handles auth + Firestore data sync.

**Live deploy:** push to `main` → Vercel redeploys automatically. Always commit and push after every change.

## No Build Step

There is no build tool, bundler, or package manager. The app is plain HTML + JS files served statically. To "run" the app, open `index.html` in a browser or use the Vercel preview URL. There are no tests, no lint commands, no `npm install`.

## Architecture

### Script loading order (matters — all share `window` scope)

```
index.html
  ├── css/design.css         (loaded via <link>)
  ├── js/firebase.js         (<script type="module"> → exposes window.__fb)
  ├── js/logic.js            (<script type="text/babel">)
  ├── js/calendar.js         (depends on logic.js globals)
  ├── js/screens.js          (depends on logic.js globals)
  ├── js/settings.js         (depends on Toggle from screens.js)
  ├── js/onboarding.js
  ├── js/auth.js
  └── js/app.js              (depends on all above; calls ReactDOM.createRoot)
```

All `text/babel` scripts share `window` scope — functions/components from earlier scripts are available in later ones without imports. Babel standalone (CDN) transforms JSX at runtime.

### Key globals defined in `js/logic.js`
- `ad(date, n)` — add n days to a date
- `iso(date)` — format date as YYYY-MM-DD
- `diff(a, b)` — days between two dates
- `fheb(date)` — format date as Hebrew gematria string
- `buildMap(cycles)` — core: returns `{[isoDate]: {types: Set, labels: []}}` used by Calendar
- `getDayPhase(types)` — phase priority: veset > dam > tvila > hpst > sefirah > tahora > fertile
- `computeStats(cycles)` — returns cycle stats + next veset prediction
- `PKEY` — localStorage key for notification preferences (`'niddah_notif_v1'`)
- `GREG_M`, `DAY_FULL` — Hebrew month/day name arrays

### Data model
Cycles stored in localStorage key `niddah_v4` and mirrored to Firestore `users/{uid}/cycles/{id}`:
```js
{ id: timestamp, date: 'YYYY-MM-DD', time: 'day'|'night', hpst: 'YYYY-MM-DD'|null }
```

### App stages (routing)
`App` manages a `stage` state: `'intro'` → `'auth'` → `'app'`. Persisted to `localStorage('tahara_stage_v1')`. If `tahara_user_v1` exists in localStorage, boots directly to `'app'`.

### Firebase (`js/firebase.js`)
Loaded as ES module, exposes `window.__fb` with: `signIn`, `register`, `logout`, `onAuthStateChanged`, `loadCycles`, `saveCycles`. App polls `window.__fb` with `setTimeout` until Firebase module finishes loading.

### Tahara phase logic (in `buildMap`)
For each veset cycle entry, `buildMap` marks:
- Day 0: `veset`
- Days 1–4: `dam`
- hpst day (default: day 4): `hpst`
- hpst+1 through hpst+7: `sefirah` (7 clean days)
- hpst+7: `tvila`
- Up to 45 days post-tvila: `tahora`
- Three prisha dates: haflagah (gap from previous), 30-day average, Hebrew same-day-next-month
- Fertile window: ~14 days before predicted next veset

### CSS design system (`css/design.css`)
CSS custom properties on `:root` for all colors/spacing. Four palettes via `data-palette` attribute on `<html>`: `rose` (default), `sage`, `wine`, `plum`. Phase colors: `--phase-veset`, `--phase-dam`, `--phase-hpst`, `--phase-sefirah`, `--phase-tvila`, `--phase-tahora`, `--phase-fertile`, `--phase-prisha`.

## Deployment

```bash
git add <files>
git commit -m "description"
git push origin main   # triggers Vercel redeploy
```

Git identity is configured locally: `user.name = Shir Cohen`, `user.email = shircohen999@gmail.com`.
