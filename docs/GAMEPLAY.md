# CivIdle Enhanced

A small incremental civilization game with a progressive interface.

## Run

Requires Node.js 18 or newer. No dependency installation or build step.

```sh
node server.mjs
```

Open http://127.0.0.1:4173.

## Opening progression

1. Start at zero wheat. Harvest one wheat per click. There are no buildings, map, passive production, or extra resources at the start.
2. At ten wheat earned, unlock wheat-field construction. The first field costs ten wheat and produces 0.2 wheat per second. Six founders consume 0.3 food per second, so harvesting bridges the opening until two fields are established. Additional field costs grow by 1.65 times, rounded up. Other repeatable buildings also have increasing costs.
3. Cultivation requires two fields, costs 80 wheat, and takes 90 seconds. It improves every existing and future field by 40%.
4. Barns research unlocks barns, which add 400 wheat storage each and enable larger food purchases. Woodcutting unlocks logging camps and worker assignments. Shelter unlocks houses, while Stone tools unlocks quarries. Stockpiles expand material storage. All of this works before the map, with automatic building placement.
5. Writing requires two houses and a quarry and unlocks the town hall. The town hall produces knowledge. Record keeping unlocks libraries.
6. Mapping appears after Record keeping, Warehouses and Archives. It requires six fields, three houses, a town hall and a library; costs 180 knowledge, 300 wood and 600 wheat; and takes 15 minutes to complete. Only completing Mapping reveals the map, retaining the positions of all existing buildings.
7. Later research adds irrigation, brick making, improved logging, currency and engineering. Currency follows Mapping and unlocks coins and income of 0.01 coins per resident per second. Markets is a separate research project, costing 150 knowledge, 150 wood and 25 coins and taking eight minutes. It unlocks buying and selling in the Market menu.

One research project runs at a time. Costs are paid upfront; benefits apply on completion. Clicking the active research row removes exactly one second from its displayed remaining time, including when researchers are assigned, with no resource cost or extra production. Enter and Space also work. Production and construction continue during research. Pause freezes production, research and click speedups together.

Research has its own menu tab after the first field is built, including before Mapping. The Hide researched toggle filters completed technologies while leaving active and available projects visible. Its setting is remembered in this browser.

The complete reference route starts with 55 harvest clicks spent on three fields as they are gathered, then pays for purchases from production. It reaches Cultivation at about 6 minutes, Woodcutting at 17, Stone tools at 32 and Mapping at 123. This is a reference route, not a fixed unlock timer. Choices, clicking, staffing and building mix affect actual progression. See `PACING.md` for the wider first-run audit.

## Storage and workers

Each resource has its own visible storage cap. Starting capacity is 50 wheat and 25 for other resources. Fields add 15 wheat space, logging camps 25 wood, quarries 25 stone, brickworks 25 bricks, workshops 10 tools and fishing docks 25 fish. The town hall adds 75 knowledge space, libraries 50 each and academies 100 each. These small storage contributions apply even without staff and appear beside the building’s output.

Barns research (80 wheat, two minutes after Cultivation) unlocks barns: the first costs 20 wheat and adds 400 wheat space. Stockpiles adds 200 space for wood, stone, brick, tool, fish and coin storage. Warehouses research unlocks warehouses: the first costs 150 wood and 100 stone and adds 500 space for every good except knowledge. Barn and warehouse construction prices grow by 1.6, rounded up. Archives raises base knowledge capacity to 500. Organized storage triples existing and future barn/warehouse capacity and raises base knowledge capacity to 4,000. Newly built storage also costs three times its original base price: barns start at 60 wheat, and warehouses at 450 wood, 300 stone and 60 bricks, before repeat-building increases. Existing stores receive the capacity bonus without being charged again. The building row states its research unlock and applied research/legacy bonuses; a locked warehouse preview links directly to Warehouses research once its prerequisites are complete. Storage traditions applies its +25% per level to the resulting total. Barns and warehouses need no workers, are placed automatically, have their own collapsible Storage group, and use global research rather than individual upgrades.

Full storage stops production of that resource. Refiners stop consuming inputs when output storage is full, and use only the input matching available output space. Harvesting and offline production obey the same limits. Trades are refused if their coins will not fit. Existing stocks above the reduced caps are preserved on import, reload and offline simulation. The interface marks them Over capacity; they can be spent or consumed normally, and production resumes once there is room. No free storage buildings are granted and no saved goods are discarded.

The Workers menu appears with Woodcutting. The settlement starts with six residents. Each house adds six housing spaces, without instantly adding people. A new resident arrives every 60 seconds while space is available, including offline. Growth stops at capacity and cannot bank time while full. Pausing freezes growth. At Hamlet stage, a priority job can be chosen for new arrivals; they fill vacancies in that job or remain idle. Only existing residents can be assigned to jobs.

Logging, quarrying, libraries and brickworks need two workers per building. Wheat fields and the town hall operate without assignments. Workers are assigned globally by job type, using −/+, or by entering an exact count. Release workers from one job before assigning them to another.

Construction is always allowed if its materials and terrain requirements are met. New production buildings use idle workers automatically, without taking workers from another job. Buildings without staff wait idle; partial staffing scales production and input consumption proportionally. New workers follow the selected arrival priority. Assignments persist through saves and control offline production.

Every resident consumes 0.05 food per second, including founders, idle workers, explorers and researchers. Fish is eaten before wheat, at one food per resource unit. Resource rates and waiting estimates include consumption, including the point when stored fish runs out. The interface shows Food balance: Positive or Negative (Balanced at exactly zero), based on total food production minus consumption, including when storage is full or empty. Producers can replace eaten food even while storage is full. Empty food storage pauses arrival progress if producers cannot feed the current population; existing residents remain and arrival progress resumes when food is available. Consumption works offline, stops during pause, and never creates negative resources.

Shelter also unlocks the Study building, costing 120 wheat and 80 wood for the first one. Studies provide two researcher slots each; academies later provide four each. Researchers are assigned from the same population pool in Workers and may also be selected as an arrival priority. Each adds 5% research speed, without producing knowledge or speeding wonder construction. For example, four researchers change a 480-second project to 400 seconds. Reassigning them preserves completed research work and immediately updates remaining time. Knowledge-producing library and academy workers remain separate jobs.

## Market and waiting estimates

The market uses fixed buy/sell prices per unit: wheat and fish 1/0.3 coins, wood 2/0.5, stone 3/0.75, bricks 5/2 and tools 8/3. Trade in quantities of 10, 50 or 100. Purchases and sales are atomic and require enough storage for the received goods or coins. Buying and reselling the same amount loses coins. Currency alone generates income; Markets must also be completed to trade.

Building, research and market costs show approximate waiting times based on current net production. Research estimates include the current project's remaining time when the research queue is occupied. Estimates do not assume manual clicks, future purchases, new worker assignments, or future production upgrades. Missing production, input shortages, storage restrictions, unmet prerequisites and pause are shown explicitly. Brick estimates account for finite stone reserves and ongoing quarry supply.

Buildings have no individual levels or upgrade controls. Improvements are shared through research. The interface uses plain labels, resource counts, and action buttons. Settlement stages appear as a small label and a separate Progress menu. Once six building types are unlocked, the construction list groups into Food, Materials, Housing, Storage, Knowledge and Harbour. Each group opens and closes independently, shows its built count, and remembers its state in this browser across redraws, imports and reloads. The wheat-only opening remains a flat list.

All housing rows include Demolish, which selects the newest home of that type. Clicking a home on the map selects that exact building instead. A confirmation preview shows the returned materials and remaining housing. Demolition refunds exactly 25% of that home's original, rounded construction price, including fractional materials and coins, without counting refunds as newly earned resources. Each home retains its purchase cost index through saves, even when earlier homes are removed or cheaper replacements are built. Demolition frees its tile and removes six, nine or twelve housing spaces without deleting residents or changing worker assignments. It is blocked while paused, when the remaining housing is insufficient, when the home is required by active research or a started wonder, or when storage cannot hold the full refund. The final action rechecks these conditions. Stone houses and townhouses contribute their housing capacity toward earlier housing requirements, allowing basic homes to be replaced without losing settlement stages.

Housing progresses from wooden houses (+6 spaces, Shelter) to stone houses (+9 spaces, Stone construction) to townhouses (+12 spaces, Civil engineering and Town stage). Stone construction follows Shelter, Stone tools and Stockpiles, requires a quarry, costs 180 wood and 120 stone, and takes six minutes before research speed bonuses. The first stone house costs 100 wood and 150 stone; further stone house prices grow by 1.4, rounded up. They need no workers, occupy grass automatically, and use the same gradual arrivals and 25% original-cost demolition refund as other homes. Every six spaces built in any housing tier satisfy one basic-house prerequisite, rounded down, so replacing wooden homes with stone housing preserves early research and settlement milestones. The two-townhouse City requirement remains specific to townhouses. Existing saves retain their houses, population, prices and refunds; Stone construction is a new optional research branch without changing existing housing data.

## First civilization and RE-Evolution

The Progress menu tracks Camp → Hamlet → Village → Town → City. Stages depend on actual residents, completed research and buildings; there are no instant milestone payouts. Hamlet unlocks job priorities for new arrivals. Village leads to Toolmaking after Mapping and Brick making. Town requires 36 residents, two workshops, two libraries and Civil engineering, then unlocks townhouses and Education. City requires 60 residents, two townhouses, two academies and Astronomy.

Workshops use wood and stone to produce tools, with two workers each. Tools fund advanced research, townhouses, academies and wonder construction. Townhouses add 12 housing spaces; academies need four workers and produce 0.6 knowledge per second before shared bonuses. All improvements remain global.

City and three workshops unlock the Great Observatory. Its four separately funded stages are Foundations (30 minutes), Observation tower (40), Instruments (40) and First observation (30). While a stage is active, Fund extra supplies buys ongoing construction speed at 1.25×, 1.5×, 1.75× and 2×. Each bundle uses the current stage’s original materials: 15% of its price for the first, multiplied by 1.75 for each subsequent bundle, with each resource rounded up. The offer shows the next speed, cost, time saved and resulting remaining time before purchase. Costs are paid atomically; completed work and base duration stay unchanged. Boosts apply only to the current stage, persist online/offline and through saves, freeze during pause, and reset on completion and RE-Evolution. Unaffordable, stale, inactive and almost-complete offers cannot charge resources. Supply boosts affect neither research nor production and never fund the next stage automatically. Production and research continue during construction. Only the already-funded stage can finish offline; the next stage never buys itself.

Finishing the first Observatory enables RE-Evolution, with an explicit reward preview and confirmation. It awards 12 base Evolution Points (EP), plus unclaimed collection tiers and mementos. Resources, buildings, population, jobs, guild focus, run research, map, fleet and wonder construction reset. Settlement name, achievements, points, stars, collection records and completed-run history remain. A backup is saved before restarting. A normal Settings reset awards no points and retains permanent progress.

Collections keep the highest result reached in any single civilization: constructed buildings (10/25/50/100/200), wheat/wood/stone produced (1,000/10,000/100,000/1,000,000 each), knowledge (500/5,000/50,000/500,000), tools (100/1,000/10,000/100,000), peak population (12/24/60/120/240) and explored tiles (49/81/169/441/1,681). Successive tiers grant 1/1/2/3/5 EP as applicable. Each tier pays once across all civilizations. Spending goods, demolishing buildings and restarting cannot reduce a record. Market purchases and refunds are excluded from new production statistics; actual production and manual wheat harvesting count. Old saves seed records from their existing acquired totals, since older versions did not distinguish purchases.

Eight deterministic mementos each award 1 EP once: First grain (1,000 wheat), Stone tablet (1,000 stone), Workshop gear (100 tools), Explorer’s compass (49 tiles), Voyager’s shell (completed ship), Observatory lens (four completed stages), Guild seal (guildhall) and Celestial chart (completed Atlas). Collecting records or items does not immediately award currency: only completing RE-Evolution claims their points.

The reset awards points atomically, then opens a skippable 3.2-second tally. Closing, replaying, reloading or skipping cannot award them twice. An unacknowledged reward receipt remains available in RE-Evolution. It never automatically opens on return from being away. Reduced motion displays the total immediately; backgrounding pauses the tally. Open constellations acknowledges the receipt and shows the permanent upgrade menu.

The zodiac tree contains **147 purchasable stars** across all twelve zodiac signs, using adapted astronomical line figures. All signs branch from RE-Evolution; each sign's root can be chosen independently after the first reset. Inner stars require their preceding star. Nodes follow connected line segments within each actual constellation, with close stars spaced apart for readable targets. Patterns and the BSD license are credited in the game's Constellation pattern credits page.

The full atlas shows every sign and star, with gold purchased paths, affordable stars and locked branches. Choosing a sign opens its individual tree. Zoom, scroll/swipe and desktop mouse dragging navigate the map. The numbered star picker and prerequisite links provide direct selection for dense figures. Choosing a star only previews it; a separate purchase button spends points. Desktop has sign buttons and a side preview; phones have a native sign selector and stacked preview with large controls. Existing points, stars, collections and saves are retained.

| Sign | Upgrade stars | Focus | Automatic full-sign mastery bonus |
| --- | ---: | --- | --- |
| Aries | 4 | Wonders & momentum | +15% wonder construction speed · +5% all building and ship production |
| Taurus | 12 | Materials & industry | +15% wood and stone production |
| Gemini | 12 | Research & growth | +15% research speed · +10% population growth speed |
| Cancer | 5 | Food & reserves | +20% all resource storage · −3% resident food consumption |
| Leo | 9 | Prosperity & production | +10% all building and ship production · +10% resident coin income |
| Virgo | 13 | Harvests & abundance | +20% wheat and fish production |
| Libra | 6 | Trade & balance | +20% resident coin income · +10% all resource storage |
| Scorpio | 14 | Tools & refining | +20% brick and tool production |
| Sagittarius | 25 | Exploration & voyages | +25% exploration speed · +15% ship construction speed |
| Capricorn | 10 | Stone & construction | +20% stone production · +10% wonder construction speed |
| Aquarius | 15 | Knowledge & discovery | +20% knowledge production · +10% research speed |
| Pisces | 22 | Fishing & seafaring | +25% fishing dock production · +20% fishing ship production |

New stars cost 3–9 EP according to depth, with larger endpoint bonuses. Twelve previous upgrades keep their original 5/8/13 EP prices, IDs, prerequisites and effects: Seed/Hearth/Abundance are in Virgo, Chisel/Forge/Engine in Taurus, Thought/Memory/Vision in Aquarius, and Trail/Tide/Exchange in Sagittarius. Players keep every earlier purchase without paying again or buying newly added prerequisite stars. The complete 147-star tree costs 908 EP, intended as a long-term progression sink across many civilizations.

Completing a sign automatically activates its mastery in addition to individual bonuses. Masteries require no extra points and are derived from owned stars, so reloads cannot award duplicate currency. A permanent-bonus summary displays old effects and aggregate new effects. New bonuses within the same category add together, then multiply with other categories and the retained research/legacy bonuses. Food reduction has a minimum consumption factor of 40% before the older Hearth bonus, preventing zero or negative consumption. Storage includes separate knowledge-capacity effects.

New research/wonder speed bonuses apply to newly funded projects, preserving active duration records. Ship construction and population-growth speed affect ongoing work; their base work progress remains saved and their displayed remaining times use actual speed. Growth still requires food and housing. Pause, offline caps, per-stage wonder funding and ship-capacity restrictions remain in effect. No star discounts building costs, preserving exact housing refunds.

After the first reset, Guild charters becomes available in the Village after Mapping and Brick making. A unique guildhall enables one freely switchable specialization per civilization: Agrarian (+25% food, −10% industrial output), Artisans (+35% bricks/tools, −10% food), or Scholars (+25% research speed, −10% wood/stone). Independent has no bonus or tradeoff. Each uses the same residents and production system; no separate staffing pool is created.

The second civilization extends technology through Waterpower (+20% wood/stone), Renaissance (City and a guildhall), Printing press (grand archives and 8,000 base knowledge storage), and Celestial navigation (grand archive, wharf and a completed ship). Grand archives provide 1.2 knowledge/s with four workers and 500 additional knowledge storage. They require wood, bricks, tools and coins.

Later civilizations must complete all six wonder stages before RE-Evolution. The original four remain unchanged; stage five, Star catalogue, needs Printing press, a guildhall, a grand archive and 84 residents. It costs 2,500 stone, 4,000 knowledge, 250 tools and 1,000 coins, taking 30 minutes before bonuses. Stage six, Celestial Atlas, also requires Celestial navigation and costs 3,000 wood, 6,000 knowledge, 350 tools and 2,000 coins, taking 40 minutes. Each stage is separately funded and supports the existing supplies boosts and offline rules. The first observation animation remains replayable once stage four is finished, while the reset button waits for the Atlas. Frontier surveying opens room for additional housing and archives; automatic placement after Mapping prefers inland tiles when possible, preserving coast for wharves.

`node scripts/balance-run.mjs` reproduces a complete route with 55 initial harvests spent on three fields as they are gathered, production-funded barn/warehouse construction, early Irrigation, active explorer assignments and a sixth quarry/third brickworks before the wonder. It uses no market shortcuts, research speedup clicks or optional wonder supply boosts. It reaches Mapping at 123 minutes, Town at 228, City at 300 and first RE-Evolution at approximately **7.61 hours**. `node scripts/balance-run.mjs --researchers` adds an early Study and fills researcher vacancies, also reaching RE-Evolution within 6–8 hours. Researchers shorten research projects; material production remains a separate bottleneck. Fishing and Shipping are optional branches and are not required by this reference route. These are reference routes, not guaranteed durations for every play style. Constellation choices shorten repeated early progress; the second civilization adds a longer Renaissance and Atlas route.

## Visible wonder and first RE-Evolution achievements

After the first field, Next milestone opens a compact checklist based on the actual settlement, research and wonder requirements. It follows prerequisite research and building dependencies, accounts for higher-tier housing, points to dedicated storage when a research cost exceeds capacity, and links to the relevant building group or research row. Village guidance includes Mapping before Town. Active Observatory stages show their remaining time and link to construction. Guidance changes no resources or unlock conditions, and the wheat-only start remains unchanged.

A completed Observatory offers Show Observatory animation in Progress and RE-Evolution. Completion, loading, offline simulation and achievements never start it automatically. The player-triggered sequence opens the telescope beneath a moving star field, traces a constellation and previews the guild, Renaissance and Celestial Atlas content unlocked after the first reset. The player can close or skip at any time, view the current run summary, replay, return to the settlement, or review RE-Evolution separately. Watching never spends resources, awards extra points, resets a run or blocks prestige. Reduced-motion preferences show a static final scene; backgrounding pauses the visual animation.

While you were away appears after at least one minute away, on reload/import or return from a background tab. It lists net resource changes (including food and refining inputs), completed research/surveys, settlement stages, Observatory stages, new residents, discovered tiles, ships and earned achievements. Storage that filled during the simulation and food-blocked arrival time are reported. Paused games report no added progress; closed/background progress is capped at eight hours. No new projects are purchased. A small button reopens the latest report for that session, and an existing dialog is not interrupted when returning from a background tab. Offline Observatory completion only announces the available animation. The report is derived from simulation and requires no save-format change.

Starting the Observatory adds a dedicated landmark plot at the edge of the map, without occupying or moving existing building tiles. It grows from foundations through a scaffolded tower, dome and instruments to an open telescope after the first observation. Progress also shows a larger illustration and the current stage. Clicking the landmark opens construction progress. Artwork follows saved construction state, pause, offline completion and RE-Evolution; it requires no separate purchases or individual building upgrades.

The Achievements menu appears after the first field and tracks ten permanent milestones: first field, 12 residents, 24 residents, 49 mapped tiles, 100 tools acquired in one civilization, first completed ship, City stage, completed foundations, completed Observatory and first RE-Evolution. Each has a progress bar and unlock notice. Earned badges survive normal run resets and RE-Evolution. Optional achievements can be earned on later runs; they never block prestige. Badges do not independently grant points or change the 6–8 hour reference pacing; collections award their separate milestone rewards. Existing saves recover milestones verifiable from current progress, and previous RE-Evolutions recover the mandatory progression badges without inventing optional exploration or shipping history.

## Exploration, fishing and ships

All construction automatically chooses suitable explored terrain. Tile selection and manual placement are removed. The map remains hidden until Mapping research finishes. New civilizations have a 5×5 starting area of 25 known tiles inside a 9×9 region; Mapping unlocks up to four explorer jobs. Explorers spend 600 worker-seconds to reveal one neighbouring tile: one explorer takes ten minutes, four take two and a half. Progress persists, works offline, and pauses with the game. Completing a region returns explorers and exploration ships to idle. Existing buildings always retain their positions during migration.

After every tile in the current region is discovered, Frontier surveying can expand the map through the normal research queue. It requires Village stage, Mapping, Record keeping and Currency. The first survey costs 300 knowledge, 500 wood and 100 coins and takes 20 minutes before research speed bonuses. It expands 9×9 → 13×13, adding 88 unknown tiles. Further surveys require each new region to be fully explored and expand to 17×17, 21×21 and onward up to 41×41. Each tier multiplies costs by 1.5, rounded up, and base duration by 1.25. Existing coordinates, terrain, buildings, discoveries, ships and population remain unchanged. New land has stable grass, forests, rock and water; both explorers and ships can resume discovery. Surveying accepts research click boosts and finishes offline once, without purchasing another survey. Larger regions render at their actual size, with unknown terrain hidden.

Fishing research follows Shelter and Stone tools and costs 160 wheat and 100 wood, taking five minutes. Fishing docks automatically occupy known coastal water tiles, require two workers each and produce 0.2 fish per second before shared bonuses. Fish uses the normal storage progression and becomes available in the Market after Fishing.

Shipping follows Fishing, Mapping, Toolmaking and Currency. It costs 300 knowledge, 300 wood and 20 tools and takes 15 minutes. A wharf costs 250 wood, 150 stone and 20 tools, automatically occupies a known coastal grass tile, and supports two ships. Ships cost 200 wood, 20 tools and 50 coins, with one ten-minute construction project at a time. Costs are paid once at the start. Ship completion works offline without automatically purchasing another ship.

The Fleet menu assigns completed ships to fishing or exploration. Each active ship needs two sailors from the same population pool as other jobs. Fishing ships produce 0.3 fish per second before shared bonuses. Exploration ships contribute as much exploration as two explorers each. Partial crewing scales output and discovery speed. Newly built ships start idle; building ships never steals workers from existing jobs. Removing a mission returns any excess sailors to idle. RE-Evolution resets discoveries, ships, construction and assignments.

## Saves

The game is named **CivIdle Enhanced** in its header, browser title, Site display title and exported save filenames. Existing browser storage keys and the published origin are retained so the rename does not strand earlier saves or previous-run backups.

## Phones and touch screens

The phone layout uses a compact sticky header and a bottom navigation bar for Settlement, Research, Workers and More. Sections appear only when unlocked; More contains Progress, Market, Fleet, Achievements, Collections, Guilds and RE-Evolution as appropriate. The first wheat-only screen has no navigation bar. Navigation opens the selected section at the top instead of retaining another page's scroll position.

Resources collapse into a compact panel with live values and food balance. The preview prioritizes coins in Market and knowledge in Research; Show all opens a two-column grid with all visible resource amounts, capacities and rates. Its open state survives game redraws and section changes for the session. Desktop resources remain fully visible.

After Mapping, phones switch between Buildings and Map rather than stacking a long map above construction. The map has 100–300% zoom controls and scrolls within its own frame, while browser pinch zoom remains available. Milestone building shortcuts return to the Buildings view. Desktop retains its simultaneous map/buildings layout.

Building and research costs, worker assignment, trades, fleet controls, wonder supplies, achievements and legacy upgrades use readable stacked layouts. Touch controls are at least 44 pixels high, with 48-pixel worker controls, 16-pixel input text and numeric worker entry. Dialogs become scrollable sheets, with actions reachable on short landscape screens. Layouts include safe-area spacing for device insets and room below content for the fixed navigation bar. Changes apply up to 700 pixels wide, and up to 900 pixels on touch devices. Game balance and save format are unchanged.

Browser checks cover the wheat-only opening and pre-/post-Mapping settlements at phone widths of 320, 390 and 430 pixels, a 667×375 landscape layout and the 1280-pixel desktop layout. Verified interactions include building purchase, exact worker entry, market quantities/purchase, resource expansion, research filtering, map zoom, navigation, milestone linking and settings/import dialogs. No whole-page horizontal overflow was found in the checked views. These are browser viewport checks, not physical-device certification.

## Save compatibility

Save format 13 retains the browser key `everdawn-save-v2` for continuity. Format 2–12 saves migrate without resetting buildings, resources or completed unlocks. Previously populated houses retain their residents; new houses use timed growth. Existing trading is grandfathered into Markets. Existing progress is granted the storage tiers needed to retain its stockpiles, and existing production jobs keep their staff. Already-unlocked maps stay unlocked. Format 5 population and arrival progress remain intact; tools, wonder and legacy data start empty. Format 6 keeps permanent progress and wonder/research timers. Format 7 migration starts fish, fleets and new jobs empty and marks all existing building tiles as known, in addition to the starting area. Format 8 keeps discoveries, fleet, active projects and positions and initializes the current region as 9×9. Format 9 migration infers home purchase costs from their original build order; format 10 persists each home's own cost record. Format 11 adds permanent achievement IDs to legacy data and preserves all existing construction timers. Format 12 adds per-stage Observatory supply boosts; older projects keep their remaining work and start with zero boosts. Format 13 adds run production statistics, permanent collections, constellation stars, the reward receipt and guild choice. Existing points and generic upgrades remain, with 12 additional EP credited once for every previously completed civilization. Subsequent loads cannot repeat that migration credit. Existing towns and active timers remain intact. RE-Evolution returns the map to its original 9×9 size with 25 known tiles. Any original prototype save under `everdawn-save` is left untouched.

Progress saves after actions and every five seconds. Save import/export, pause, and reset are in Settings. Offline production and research are capped at eight hours, with production stopping at the current storage caps. Already-started research can finish offline; no new research or buildings are automatically purchased.

## Verify

```sh
node --test tests/*.test.mjs
```

Tests cover the wheat-only start, stronger food needs and fish consumption, storage progression, population growth, tax income, monetary and market unlocks, atomic transactions, waiting estimates, Mapping, automatic placement, connected tile discovery, coast restrictions, ship construction and crewing, the timed prestige route, research speedups, staffing, pause, migration and offline behavior.

## Files

- `dist/model.js`: simulation, unlock conditions, purchases, and save validation
- `dist/app.js`: interface and interactions
- `dist/evolution.js`: collection milestones, mementos, reward quotes and permanent stars
- `dist/evolution-ui.js`: collection, guild and point-reveal screens
- `dist/zodiac.js`: 147 upgrade definitions, prerequisite paths, mastery and bonus aggregation
- `dist/zodiac-shapes.js`: attributed astronomical line-figure coordinates
- `dist/zodiac-ui.js` and `dist/zodiac.css`: zodiac atlas, focused trees and responsive controls
- `dist/map.js`: map and building illustrations, only rendered after Mapping completes
- `dist/style.css`: interface styles
- `dist/mobile.css`: phone and touch layouts
- `dist/index.html`: application shell

The game is a single-player browser prototype with an expandable map and a complete first civilization through RE-Evolution. Cloud saves, transport simulation, additional wonders, eras beyond the Renaissance and multiplayer are not implemented.
