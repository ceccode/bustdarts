# Bust! 🎯

**Offline-first darts scoreboard for X01, built as an installable PWA.**

No accounts, no cloud, no tracking. Your matches, players and stats live entirely on your device (IndexedDB) — pick up a phone at the pub with no signal and keep scoring.

## Philosophy

Most darts apps ask you to sign up, sync to the cloud, or watch ads between legs. Bust! is the opposite: install it once, and it works forever, fully offline, with your data staying private and local. No backend, no account, no bullshit.

## Features

- **X01 scoring** — 301 / 501 / 701, with sets & legs, double-out or straight-out
- **Up to 4 players** — local multiplayer, one device passed around
- **Two input modes** — quick total-score entry, or detailed per-dart input
- **Checkout suggestions** — standard 2/3-dart finishing combinations, live as you close in on zero
- **Undo** — fix a mis-tap without restarting the leg
- **Player profiles & stats** — 3-dart average, first-9 average, best leg, best checkout, 100+/140+/180 counts, double %, all saved locally and reused across matches
- **Match history** — review past matches, per-leg breakdown
- **Post-match roast** — a bit of trash talk generated from how the match went, because darts should be fun
- **Fully offline PWA** — installable on iOS/Android/desktop, works with zero connectivity
- **i18n** — Italian and English, more languages welcome via PR

## Stack

- React 19 + TypeScript + Vite
- Zustand (state), Dexie (IndexedDB)
- Tailwind CSS
- react-i18next (IT/EN)
- vite-plugin-pwa

## Development

```bash
npm install
npm run dev
```

Other commands: `npm run build`, `npm run lint`, `npm run preview`.

## Contributing

Issues and PRs are welcome — especially new languages, checkout tables for other rulesets, or UI polish.

## License

MIT, see [LICENSE](./LICENSE).
