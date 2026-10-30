# CivIdle Enhanced

A browser-based incremental civilization game. Start with wheat, grow a settlement, explore the map and construct the Great Observatory before your first RE-Evolution.

**[Play CivIdle Enhanced](https://horizonan.github.io/cividle-enhanced/)** · [All Horizonan projects](https://horizonan.github.io/) · [Discord feedback](https://discord.gg/y6AtXJfcWc) · [Report a playtest issue](https://github.com/Horizonan/cividle-enhanced/issues/new/choose)

This is an early public playtest. Saves are kept in your browser. Use **Settings → Export save** to back up a run or transfer it to another device or browser. An exported save from the earlier hosted version can be imported here; the two website addresses do not share browser storage.

## What to test

- Is the wheat-only opening clear and enjoyable?
- Do food, housing, storage and worker assignments make sense?
- Does Next milestone give you a useful next step?
- Are research, exploration and production progressing at a satisfying pace?
- Can you use every important control comfortably on a phone?
- Does the Observatory and its optional animation make the first RE-Evolution feel worthwhile?

When reporting a problem, include your device/browser, the settlement stage, steps to reproduce it, and what you expected. Screenshots and an exported save can help. Save files contain your settlement name and game progress; only attach them if you want to share that information publicly.

The simulated attentive first-run route takes about **7.6 hours**; optional Observatory supply boosts can shorten it. Optional shipping and infrequent check-ins can take longer. See [PACING.md](PACING.md) for the complete audit and its limits. These are simulation results, not promised completion times.

## Included

- Gradual population growth, food consumption and shared worker allocation.
- Capped storage, barns, warehouses and research-based upgrades.
- Research, researchers, trade, tools and advanced housing.
- Mapping, explorers, expanding regions, fishing and ships.
- Settlement stages, staged Observatory construction, ten achievements and RE-Evolution.
- A phone layout with bottom navigation, expandable resources, map zoom and large touch controls.
- An eight-hour offline cap and a return report. The Observatory animation waits for an explicit click.

The game has no accounts, analytics, remote fonts or server database. New eras and distant-shore chapters shown in the finale are planned ideas, not playable unlocks in this version.

## Run locally

Install Node.js 22 or newer, then run:

```sh
npm run dev
```

Open http://127.0.0.1:4173/. There are no packages to install and no build step. The complete static application is in `dist/`, with relative asset paths suitable for a GitHub Pages project URL.

## Checks and pacing audit

```sh
npm test
npm run pacing
```

The release has 136 checks covering economy, saves, research, workers, food, storage, housing, exploration, shipping, wonder construction, achievements and prestige. Gameplay details and save compatibility are in [docs/GAMEPLAY.md](docs/GAMEPLAY.md).

## GitHub Pages

GitHub Actions runs the checks and publishes **only `dist/`**. In **Settings → Pages**, select **GitHub Actions** as the publishing source. Run **Publish CivIdle Enhanced → Run workflow** for an initial deployment if needed. Pushes to `main` publish automatically after checks pass.

No deployment secret is required. The existing local save keys are retained for compatibility with exported saves and previous versions.
