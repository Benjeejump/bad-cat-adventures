# Current release validation

The game is a static browser application. Run a local server from the repository:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Tests use Python Playwright and `/usr/bin/chromium`. The current road-only release checks are:

```sh
python3 tests/adventure_v11_smoke.py
python3 tests/spelling_smoke.py
python3 tests/handwriting_smoke.py
python3 tests/pages_smoke.py
python3 tests/update_smoke.py
python3 tests/furniture_store_smoke.py
python3 tests/parent_layout_smoke.py
python3 tests/parents_aim_smoke.py
python3 tests/combat_pause_smoke.py
python3 tests/forest_smoke.py
python3 tests/friends_smoke.py
python3 tests/vehicles_smoke.py
python3 tests/christmas_smoke.py
python3 tests/contrast_smoke.py
```

`adventure_v11_smoke.py` exercises no-GPS launch, five launcher pads, the separate HQ house, two-axis D-pad movement in every mode, removal of timed cutaways and tunnels, shooting bees, real bee contact, netted messages, large tracing, a solved 24-tile pipe puzzle with actual flow, villain defeat and device fit.

The spelling suite tests three attempts, hints, speech fallback, word collection and offline persistence. The handwriting suite traces actual paths and Chromium touch events, validates all course letters, checks resume and completes both sentences. Pages tests validate project-subpath deployment and offline invention creation. Update tests preserve existing inventions through a service-worker update.

Earlier map/GPS and four-pad suites remain in the repository as historical checks and require migration before being used for this release. They do not describe the current interface and must not be counted as current passes. Physical tablet testing is still needed for finger comfort, audio clarity and sustained engagement; see PLAYABILITY.md.

`furniture_store_smoke.py` buys and places all 150 items across the 10/20/30/40/50 home ladder, checks treat spending and insufficient funds, revisits the first home and reloads saved purchases.

`combat_pause_smoke.py` verifies the clocks stop in both HQ interfaces, independent bee movement, booster theft/recovery, enemy projectile art, real collisions, interception and protection. `forest_smoke.py` covers tables 1–12, supportive retries, a full six-question reward and offline progress. `friends_smoke.py` covers invitation spending, all five capacity limits, different breed images, autonomous item use and persisted visitors offline.

The vehicle suite checks bus/balloon targeting and mobile fit. Christmas checks the real parent toggle, seasonal artwork and learning content, custom launcher firing, home/store changes, reversible labels and offline persistence without losing purchases. Contrast checks visible button/option text in normal/Christmas and day/night across HQ, loadout, inventions and every side game.
