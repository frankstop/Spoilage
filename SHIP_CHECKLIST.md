# Ship checklist

## Content inventory

- [x] 40 Provisioner cards, all playable and single-tier upgradeable.
- [x] 3 tokens: Fresh Bloom, King’s Fruit, Sated Burden.
- [x] 7 standards: Wasp in the Pear, Market Hound, Bruised Boar, Mold Finch, Cellar Rat, Crabapple Louse, Vinebound Stag.
- [x] 2 elites: Cider Hag, Glasshouse Bailiff.
- [x] Boss: The Orchard King — Harvest, Feast, Famine with current/next phase telegraph.
- [x] 10 relics: Coolcloth, Bee’s Wax, Blue Crock, Dinner Bell, Silver Mold, Ledger of Waste, Amber Clock, Gleaner’s Hook, White Thread, Cracked Larder.
- [x] 8 events: Wedding Pantry, Factor’s Scale, Blue Beehive, Keeper’s Well, Table’s Picnic, Mold Librarian, Fallen Dinner Bell, Last Hedge.

## Product surfaces

- [x] Main menu: New Run, Continue, Prologue, How to Play, Settings, seeded run input.
- [x] Complete eight-node route with all seven node types.
- [x] Combat forecasting, ordered intents, pile counts, log, Rot/Compost, 1–3 enemies.
- [x] Reward draft, Coin alternative, skip, upgrades, healing, market purchases/removal, relics, events.
- [x] Victory/defeat statistics and behavior-based epilogue.
- [x] Exact localStorage continuation and deterministic RNG state.
- [x] Text scaling, reduced motion, volume, extended intents, hold-to-confirm.
- [x] Mouse and keyboard input; 1280×720 primary layout; compact responsive fallback.
- [x] Generated production background/card/enemy art; material-state animation; procedural sound with visual equivalents.
- [x] SVG icon, metadata, web manifest, README, card list.
- [x] Opens from `file://` and serves unchanged on static hosting.

## Verification evidence

- JavaScript syntax: all source files pass `node --check`.
- Executable content smoke: 40 cards + 10 enemies + 24 event choices + 10 relics; zero failures.
- Determinism: same seed produced the same opening hand; exact hand and RNG state restored after save.
- Mouse-played browser path: menu → map → combat → card play → enemy damage → marked target → aging → Ripe → Perish → Rot → enemy attack.
- Balance simulation: 20 complete greedy-bot runs, 3 wins / 17 losses (15%); representative completed seeds: 1008 victory, 1000 defeat, 1001 defeat.
- Visual QA: 1440×900 desktop and 760×900 compact screenshots inspected; no clipped card names after correction.
- Local-file QA: Chrome loaded the complete title screen and all generated assets directly from `index.html`.

## Intentional scope exclusions

Additional characters, regions, Seasons, meta-progression, Pantry, Freeze/Cure/Can, controller support, localization, analytics, online services, and deployment credentials are excluded by the v1 Scope Lock.
