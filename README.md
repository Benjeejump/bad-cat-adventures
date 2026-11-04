# Bad Cat Adventures v0.4

Dylan’s imagination-powered, child-friendly adventure console. A static web game with no accounts, advertising, purchases, backend, API keys or paid services.

## Play locally

From the repository directory:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open the local server in Chrome. No dependency installation or build step is required. The address opens with an animated Odyssey chase and a **Let’s ride, Dylan!** launch button. **Play quietly** or **Skip intro** starts without sound. Audio only starts after a gesture. Starting the game automatically requests this tablet’s GPS through Chrome’s normal location permission. Test Drive never starts by itself, including after a GPS error.

## The game

- **GPS-first, map-first cockpit:** the game starts at the tablet’s real position, at close zoom 20. Chrome must allow location. While waiting for a fix, it shows a location screen—not a made-up position or a running demo. If location fails, choose Retry GPS, HQ or Test Drive explicitly. New fixes preserve a manual zoom adjustment. The simulation remains an optional Journey-controls button.
- **Illustrated roads:** a custom vector style draws real roads as broad cream lanes over soft green terrain and blue water, with no road-name labels, business icons, building footprints, transit clutter or text. OpenFreeMap supplies the underlying OpenStreetMap geometry; MapLibre renders it locally under Leaflet’s character overlays. On devices that cannot render WebGL, a muted CARTO map without labels is the fallback; that fallback can retain building outlines. If map data is unavailable, the labelled imaginary terrain still supports GPS-relative characters and offline games.

- **Net catches and arsenal:** fictional supply drops appear near the car after a short foreground drive, then after further travel. Select the Net and tap a parcel within 25 m; long-net upgrades extend this by 10 m per level. Later drops appear ahead so the car must approach them. Drops contain net extensions, bubble amplifiers, forcefield cells, rainbow packs, sonar lenses, snacks or repair kits. Bubble upgrades clear nearby kittens too, forcefield cells extend shields, and laser/sonar upgrades extend targeted effects. Levels (maximum three each) and catch counts save locally; drop positions do not. The HQ arsenal shows current inventory.
- **The family car:** an original white Honda Odyssey illustration is used in the map, opening and story scenes. It still transforms into a plane or submarine.
- **BC and M:** original illustrated faces and letter badges identify Bad Cat and Metro. They do more than chase: Metro fires bubble traps, Bad Cat borrows the booster, and both can use pretend tunnels and pipes. Those actions temporarily slow Test Drive. Matching gadgets undo the effect; hazards also expire gently. Real GPS movement is never slowed or changed by game mechanics.
- **Aim at characters:** choose a gadget, then tap BC, M or a kitten. You can also select BC/M first and then choose a gadget. The action has a visible impact and affects that character. Number keys 1–5 arm the corresponding gadget; 6 opens a surprise.
- **Kitten attack:** 20 kitten emojis drift around the screen inside circular forcefield bubbles. Aim a gadget and tap each moving bubble. The first round allows 45 seconds; the cats’ advantage reduces future rounds to as little as 35 seconds. Normal motion moves targets; reduced-motion mode keeps them stationary for accessibility. Escaped kittens damage the Odyssey, steal supplies, increase the cats’ advantage and jam the forcefield. Retry does not reset those setbacks. Puppy sorties consume one snack per five kittens; every five confetti shots increases cat pressure, so gadget choice matters.
- **Giant Puppy:** an original giant puppy actually falls through the sky. Ten landing plans each have a good and bad animated outcome (bubbles, BC, treats, parachute, hammock, trampoline, sky fan, blanket, cloud or rainbow slide). Two distinct plans are drawn each time, and exactly one is randomly assigned success while the other is assigned failure. This is locked when the encounter opens, not rerolled after the click. The assignment is hidden from Dylan; the landing and persistent result are shown after his choice.
- **Lasting consequences:** car condition, supplies, cats’ advantage and gadget jams are saved locally across encounters, retries and reloads. Damaged cars cruise more slowly in Test Drive; GPS positions remain accurate. Higher cat advantage means more frequent attacks and shorter kitten rounds. Jammed tools fizzle for a limited number of attempts, and puppy sorties need supplies. The HUD shows current status. Repair and resupply explicitly at the offline HQ workshop—there is still no game-over screen.

- **Dylan decides:** random large scenes offer two or three choices. Choices produce animated outcomes, including the vacuum sneezing out houses, puppy catches and mishaps, tunnel escapes and Amy’s imaginary secret homes. The first automatic decision arrives after about 45 seconds of foreground map play; later events are spaced out. Manual surprises are always available. There is no game-over screen.
- **Windscreen squid game:** use the small car-wash button anytime, even offline. Sweep the wipers (button or swipe), give the squid three bubble bursts, then boost it off the windscreen. The squid swims away and the game can be replayed. Boosters alone don’t win.
- **Offline Mission HQ:** inventions, vehicle equipment, puppy play, the simple HQ squid challenge and surprise missions remain available. Inventions, upgrades and aggregate counters stay on this browser.

## Lakeline places

Only the two family-selected places are added as permanent pins:

- **GO Car Wash:** 1900 S Lakeline Blvd, Cedar Park, TX 78613.
- **Puppy Base:** 2000 Lakeline Blvd, Cedar Park, TX 78613.

The app resolves these fixed addresses once using OpenStreetMap Nominatim and caches their public business coordinates separately from game progress. Results must match the exact house number, Lakeline road name and Cedar Park area before a pin is added. Queries are sequential, spaced over one second apart. It does **not** guess a pin or geocode the player’s position. Journey controls show the lookup status and offer a retry. First-time lookup needs Internet; a lookup failure leaves the always-available car-wash button working.

With an accurate GPS fix (±45 m or better), staying within 65 m of the resolved car wash for about eight foreground seconds offers the squid game. It does not force the game open. Declining suppresses repeats until the device leaves the 180 m exit boundary and returns. This is approximate proximity, not proof that the car has entered the wash bay; physical arrival needs testing. Puppy Base opens its own scene when tapped. Amy’s churches, burger houses, apartments and dumpster mansions are explicitly imaginary scenes, not assertions about where Amy really lives or extra permanent map pins.

## Deploy to GitHub Pages

1. Commit these project files and push to `main` in `Benjeejump/bad-cat-adventures`.
2. In the repository’s **Settings → Pages**, set **Source** to **GitHub Actions**.
3. The included `.github/workflows/pages.yml` stages only public game files and deploys them. You can also run it using **Actions → Deploy to GitHub Pages → Run workflow**.
4. After a successful deployment, use the URL reported by the deployment. The expected project address is `https://benjeejump.github.io/bad-cat-adventures/` (the repository already uses this address; this update still needs a successful Pages workflow run).

All app, manifest, service-worker and asset paths are relative, so project subdirectories work. GitHub Pages provides HTTPS for GPS and service workers. No server runtime is needed. If using branch-based Pages instead, publish the repository root on `main`; do not enable both deployment methods at once.

## Install and play offline

Load the app once while connected and wait for **OFFLINE READY** beside Mission HQ. In Android Chrome, use the browser menu’s **Install app** or **Add to Home screen** action when available. The manifest requests standalone, landscape presentation and includes 192/512-pixel icons. Browser installation prompts and orientation locking vary by device.

The service worker caches only the local app shell, graphics and bundled Leaflet files. HQ, gadgets and Test Drive’s clearly labelled fictional fallback remain usable after an offline reload. It never intercepts or bulk-caches OpenStreetMap tiles. Live road maps require connectivity; the browser may independently use its ordinary HTTP cache. No claim of offline road-map coverage is made.

For a release that changes shell files, increment the cache version in `sw.js`. The new shell is installed atomically and older game caches are removed. Reload after an update. Clearing site data removes inventions and progress.

## Privacy and location

Inventions, equipment, aggregate counters and upgrade levels are saved only in browser local storage. Supply drops hold only their current fictional position in memory; no drop coordinates or player positions are saved in the inventory. The two fixed Lakeline address results are also cached locally; these are the configured places, not user GPS positions. Location coordinates/history are never saved, included in diagnostics, or sent to an application server. The current fix is held in memory to draw the car and estimate distance; the browser watch is cleared when returning to Test Drive or leaving the page. Storage failure is reported and play continues for that visit.

When the road map is online, the browser requests viewport vector tiles from `tiles.openfreemap.org`, or label-free fallback raster tiles from `basemaps.cartocdn.com`. Those requests reveal the viewed area and normal connection metadata to the selected map-data provider. Its attribution stays visible on the map. The only additional external request is the exact fixed-address lookup to `nominatim.openstreetmap.org`; no live GPS coordinates are sent to that service. No analytics or third-party fonts are used. Leaflet, MapLibre and their adapter are bundled locally; no map API key is needed.

A Samsung Galaxy S25 hotspot supplies Internet access, **not** its GPS location. The tablet must provide its own position, which may be imprecise on a Wi-Fi-only device. Permission denial, timeouts and unavailable fixes show an explanation and wait for an explicit choice. They never switch into Test Drive automatically. A temporary unavailable/timeout error keeps the GPS watch alive to recover from the next fix; permission denial stops it until the player retries. A generation guard ignores delayed callbacks from a GPS request that the user has cancelled by choosing Test Drive. The small location-source adapter in `app.js` leaves room for a future securely paired phone source; no location-sharing endpoint is implemented.

## Validation

Syntax checks:

```sh
node --check app.js
node --check sw.js
node --check adventure.js
node --check site-config.js
node --check targeting.js
node --check campaign.js
node --check puppy-options.js
node --check game-map.js
node --check loot.js
```

Browser integration checks (optional development tools, not game dependencies):

```sh
python3 -m pip install playwright
# With the local server running and Chromium at /usr/bin/chromium:
python3 tests/browser_smoke.py
python3 tests/pages_smoke.py
python3 tests/adventure_smoke.py
python3 tests/launch_smoke.py
python3 tests/update_smoke.py
python3 tests/targeting_smoke.py
python3 tests/consequences_smoke.py
python3 tests/gps_map_smoke.py
python3 tests/loot_smoke.py
```

`GAME_URL` overrides the browser suite’s base URL. The suite covers desktop load, car/cat movement, pause/speed, transformations, gadget effects, audio-context activation, both encounters, safe invention rendering and persistence, puppy play, squid completion, missions, service-worker caching, offline reload, responsive sizes and browser-emulated GPS denial/accuracy. It checks 1280×800 and 1024×600 landscape, 800×1280 portrait and 390×844 phone widths. `gps_map_smoke.py` checks GPS-first startup, native permission failure without silent simulation, zoom 20, preservation of manual zoom, stale-callback protection and the actual vector renderer with explicitly synthetic road geometry. `pages_smoke.py` checks project-subdirectory installation and offline HQ. `adventure_smoke.py` exercises active cat hazards, decisions, windscreen controls, fixed-pin fixtures and GPS proximity. `launch_smoke.py` checks real animation and audio activation. `update_smoke.py` installs the original v0.1 shell and verifies an upgrade preserves inventions and reaches the new launch screen. Geocoder fixtures validate application behaviour, not real address accuracy.

Current implementation-session results are in [TESTING.md](TESTING.md). Real tile delivery, audible output and physical GPS need connected-device testing; emulation is not a physical tablet test.

## Samsung tablet checklist

- Load the deployed HTTPS URL in landscape Chrome. Watch the opening, start with sound or quietly, allow location when Chrome asks, then confirm the car starts at the tablet’s position with simplified roads, attribution and side-mounted controls. Deny location once to confirm it waits instead of running Test Drive. Check the normal reload upgrades an existing installation.
- Check pause, resume, speed, follow mode, both cats, every gadget and all transformations. Scroll on shorter displays to reach the deck.
- Enable sound, adjust volume, mute, and confirm comfortable audible effects. Install to the home screen; check standalone/fullscreen and landscape behaviour.
- Create an invention and equip an upgrade. Wait for OFFLINE READY, enable airplane mode, reopen the installed app and play the HQ squid and puppy activities. Confirm progress survives closing/reopening.
- As a passenger, test GPS allow/deny, manual zoom, accuracy in a moving car, poor signal, hotspot disconnection and switching back to Test Drive. At GO Car Wash, verify the real pin and arrival prompt; decline it and confirm it stays quiet. Check Puppy Base’s actual pin. GPS may be unavailable on the tablet.

## Project layout and licences

`app.js` manages map/GPS and saved HQ progress; `adventure.js` manages decisions, launch and windscreen gameplay; `targeting.js` manages aiming and the moving kitten round; `campaign.js` owns saved consequences and recovery; `puppy-options.js` draws paired puppy plans; `site-config.js` handles the fixed places. `game-map.js` and `game-map-style.json` manage the simplified map renderer and no-label fallback. `loot.js` manages proximity-limited drops and the saved arsenal. `map-mode.css` styles the game cockpit and animations, while `styles.css` contains shared/HQ styling. `sw.js` handles the offline shell and `index.html` reloads old installed shells once after an update takes over. The Odyssey, BC, Metro and Amy cameo SVGs and app icon are original artwork; supporting characters also use system emoji, whose appearance varies by platform. Synthesised sound uses Web Audio. The app uses the system font stack.

Leaflet 1.9.4 is vendored in `assets/leaflet/` under its [BSD-2-Clause licence](assets/leaflet/LICENSE). It was obtained from the npm registry and checked against the published SHA-512 integrity digest. Road tiles are © OpenStreetMap contributors; see [OpenStreetMap copyright](https://www.openstreetmap.org/copyright) and [tile usage policy](https://operations.osmfoundation.org/policies/tiles/). No prefetch, bulk download or offline tile pack is implemented.

MapLibre GL JS 5.6.1 and `@maplibre/maplibre-gl-leaflet` 0.1.3 are pinned and vendored in `assets/maplibre/`, with their licences. Both npm archives were checked against the registry’s SHA-512 integrity digests before extraction. [OpenFreeMap](https://openfreemap.org/) supplies open vector tiles without API keys. The fallback uses [CARTO basemaps](https://carto.com/attributions) for this personal non-commercial game; provider attribution is always displayed. App shell caching never intercepts either provider’s tile requests.
