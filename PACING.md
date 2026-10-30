# First RE-Evolution pacing audit

Reproduce with `node scripts/pacing-audit.mjs`. Detailed route output is retained in `pacing-audit-results.jsonl`. This is a deterministic simulation of several purchase strategies, supported by browser checks of the new guidance, return report and Observatory finale. It is not a human usability study.

## Results

| Route | Mapping | City | First RE-Evolution |
| --- | ---: | ---: | ---: |
| Reference, actions as soon as ready | 123 min | 300 min | 7.61 h |
| Harvesting at one click per 0.35 seconds | 123 min | 300 min | 7.62 h |
| Early Study and researchers | 125 min | 292 min | 7.59 h |
| Optional Managed forests | 123 min | 308 min | 7.75 h |
| Optional fishing research, wharf and fishing ship | 123 min | 315 min | 7.95 h |
| Purchase affordable Observatory supply boosts | 123 min | 300 min | 7.23 h |
| Decisions at 15-minute check-ins | 285 min | 510 min | 11.26 h |

The core attentive route meets the 6–8 hour target. Optional branches and infrequent check-ins can take longer. No production, food, prices, construction durations or research durations were silently shortened for this audit.

## Method and limits

- Starts with zero goods, six founders, unmodified permanent upgrades and no researched technologies. Harvests are spent on the first three fields as gathered. Human-paced variants need 56 clicks, compared with 55 instantaneous clicks in the reference.
- Every subsequent purchase is paid from produced resources. There are no research clicks, free goods, market shortcuts or instant population grants. The supply variant buys only the bundles affordable immediately after funding each stage; it does not wait to buy every possible boost.
- Barns and warehouses are physically constructed. Each purchase is checked against storage capacity, production, workers and suitable explored terrain. The reference builds six fields, two townhouses, two academies, three workshops, and expands stone/brick output before the Observatory.
- Production and researcher jobs are filled from existing residents only. Attentive routes reassign arriving workers promptly. The check-in route leaves arrivals idle until the next visit. Fishing explicitly releases explorers before assigning sailors when there are insufficient idle residents.
- Fifteen-minute visits batch affordable actions, wait until the next visit to start another research project or wonder stage, and never automatically buy while away. This is a deliberately slower intermittent-play case, not a prediction for every casual player.
- Reported times measure simulated unpaused run time. Closing the game for more than eight hours adds at most eight hours of progress. Unfunded research, buildings and wonder stages cannot begin offline.

## Findings

1. The largest individual material wait on the core route is the second Academy, approximately 20 minutes. The other five largest waits are about 8–10 minutes. Observatory construction adds 140 minutes before optional supply boosts; its four stages give clear return points.
2. Early researchers reach City about eight minutes earlier but improve the final finish by only about two minutes on this fixed building strategy. Tools, bricks and Academy materials remain bottlenecks. Buying the early Study also competes with early wood spending. Research speed is useful but does not accelerate material production.
3. All seven routes finish without food-blocked population growth. This assumes sensible farming and Irrigation; it is not evidence that arbitrary housing growth is safe. Separate shortage checks verify that empty food pauses arrivals without deleting citizens, and the return report identifies the delay.
4. Capped goods are common during long projects. The reference spends approximately 246 minutes with wheat at capacity and 167 with knowledge at capacity. This is a reason to spend goods or choose optional branches, rather than proof that every stock needs a larger cap. The audit's full-storage counters sample end-of-step stocks; the player return report additionally catches production limited by storage within a step.
5. Coastal availability matters. Automatic construction after Mapping now prefers inland tiles when available. The optional first-run fleet route can use a preserved wharf site and completes in 7.95 hours. Shipping remains optional for the first RE-Evolution; later civilizations require a ship for Celestial navigation. Older occupied coastline can still be recovered by Frontier surveying.
6. Fifteen-minute check-ins take 11.26 hours because short research projects and ready purchases wait for the next visit. The 6–8 hour claim should remain scoped to an attentive route. Making every intermittent route fit that target would require a separate design change, such as a deliberate research queue, rather than reducing every timer.

## Changes made during this check

Next-milestone guidance now catches a genuine opening obstacle: Woodcutting's wheat cost exceeds early field-only capacity, so it directs players to construct a barn before returning to research. The return report explains full stores and food-blocked arrivals. The audit also enforces storage feasibility instead of relying on a long unexplained wait, and the obsolete opening timings in the README were corrected.

Existing save stocks, research progress, population and Observatory construction remain intact. No optional branch or achievement was made mandatory for RE-Evolution.

## Constellations and the second civilization (0.2)

The first-civilization reference remains 7.61 hours and now earns 35 EP: 12 for completion, 18 from new collection tiers, and 5 mementos. This is a deterministic reference, not a fixed reward for every player.

The extended second-civilization route buys Seed, Chisel and Thought for 15 EP, repeats the early economy, then funds Guild charters, a guildhall, Waterpower, Renaissance, Printing press, frontier expansion, two grand archives, eight fields, four townhouses, Shipping, a wharf and a completed ship, Celestial navigation and both additional wonder stages. It reaches the Celestial Atlas in approximately **11.99 hours**, including the repeated Observatory. Its larger scope intentionally lasts beyond the first run. Every purchase uses produced goods, valid storage, gradually arriving residents and explored terrain; no starting goods or technology are injected. No guild specialization, research clicks or supply boosts are assumed.

The repeat route reaches Mapping at about 106 minutes and the first observation at 434 minutes. Exploration for an available wharf is a visible later bottleneck. The route stops exploring for a wharf as soon as one becomes available; it does not wait unnecessarily for the entire expanded map. After Mapping, automatic inland construction prefers non-coastal terrain when available, preserving coast for later wharves. Existing buildings are never moved.

Reproduce the second route with the produced-resource test in tests/evolution.test.mjs. It validates all six paid stages, the ship, new research, 84 residents, archive storage, new mementos and the next reset. Separate checks cover old-save credit, permanent star effects, claimed-tier duplication, paused/offline progress, active-timer stability and the skippable reward receipt.
