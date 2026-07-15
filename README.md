# Spoilage

*Spoilage* is a complete, single-player browser deck-builder where cards age while retained in hand, become Ripe, and eventually perish into Rot.

## Play

Open `index.html` directly, or serve the folder from any static host. No build step, package manager, framework, backend, or network connection is required.

For a local server:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

## Controls

- Click a card to play it; click an enemy to choose a target.
- `1`–`8`: play the corresponding card.
- `E`: end turn.
- `D`: deck ledger.
- `` ` ``: debug pantry.
- `Esc`: close a window or cancel targeting.

## Release scope

- 40-card Provisioner pool plus three combat tokens; every card has a single-tier upgrade.
- Seven standard enemies, two elites, and The Orchard King.
- Eight-row branching Orchard Verge with combat, elite, event, market, kitchen, camp, and boss nodes.
- Ten relics, eight events, three v1 statuses, Preserve, Seal, Bruise, Ripe, Perish, Rot, and Compost.
- Seeded deterministic RNG, exact mid-combat save/continue, localStorage settings, combat log, tutorial, debug tools, deck sorting, and run statistics.
- Adjustable text size, reduced motion, volume, extended intents, and hold-to-confirm End Turn.
- Generated production art, procedural Web Audio cues/ambient notes, desktop-first responsive layout, local-file and static-host support.

## Architecture

All content is authored as plain JavaScript data under `js/data/`. `engine.js` interprets generic action and intent operations, owns deterministic state, and serializes the exact run. `app.js` renders and handles input. Classic scripts are intentional so `file://` works without a development server.

Debug tools can add any card, start any encounter, grant any relic, or open any event. `?debug=combat` opens the deterministic showcase state used for visual QA.

See [CARD_LIST.md](CARD_LIST.md) and [SHIP_CHECKLIST.md](SHIP_CHECKLIST.md).
