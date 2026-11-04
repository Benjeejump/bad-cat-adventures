# Bad Cat Adventures v0.2

Dylan’s imagination-powered, child-friendly adventure console. A static web game with no accounts, advertising, purchases, backend, API keys or paid services.

## Play locally

From the repository directory:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open the local server in Chrome. No dependency installation or build step is required. The address opens with an animated Odyssey chase and a **Let’s ride, Dylan!** launch button. **Play quietly** or **Skip intro** starts without sound. Audio only starts after a gesture.

## The game

- **Map-first cockpit:** the road map fills the screen, with a chunky gadget rail on one side. It starts at zoom 18, keeps manual zoom during GPS updates, and hides the old fictional building clutter and radar rings. Road labels remain those in OpenStreetMap’s standard tiles. Journey controls open from the lower-left corner; GPS remains optional.
- **The family car:** an original white Honda Odyssey illustration is used in the map, opening and story scenes. It still transforms into a plane or submarine.
- **BC and M:** original illustrated faces and letter badges identify Bad Cat and Metro. They do more than chase: Metro fires bubble traps, Bad Cat borrows the booster, and both can use pretend tunnels and pipes. Those actions temporarily slow Test Drive. Matching gadgets undo the effect; hazards also expire gently. Real GPS movement is never slowed or changed by game mechanics.
- **Aim at characters:** choose a gadget, then tap BC, M or a kitten. You can also select BC/M first and then choose a gadget. The action has a visible impact and affects that character. Number keys 1–5 arm the corresponding gadget; 6 opens a surprise.
- **Kitten attack:** 20 kittens arrive through the cats’ pipe. Choose a gadget and tap each kitten within 45 seconds to send them safely home. Clear all 20 to win; if time runs out, puppies rescue the remaining kittens and Dylan can retry. The small paw button also starts this round anytime.
- **Dylan decides:** random large scenes offer two or three choices. Choices produce animated outcomes, including the vacuum sneezing out houses, puppy rescues, tunnel escapes and Amy’s imaginary secret homes. The first automatic decision arrives after about 45 seconds of foreground map play; later events are spaced out. Manual surprises are always available. There is no game-over screen.
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

Inventions, equipment and aggregate game counters are saved only in browser local storage. The two fixed Lakeline address results are also cached locally; these are the configured places, not user GPS positions. Location coordinates/history are never saved, included in diagnostics, or sent to an application server. The current fix is held in memory to draw the car and estimate distance; the browser watch is cleared when returning to Test Drive or leaving the page. Storage failure is reported and play continues for that visit.

When the road map is online, the browser requests viewport tiles directly from `tile.openstreetmap.org`. Those requests reveal the viewed area and normal connection metadata to OpenStreetMap. Its attribution stays visible on the map. The only additional external request is the exact fixed-address lookup to `nominatim.openstreetmap.org`; no live GPS coordinates are sent to that service. No analytics or third-party fonts are used. Leaflet is bundled locally.

A Samsung Galaxy S25 hotspot supplies Internet access, **not** its GPS location. The tablet must provide its own position, which may be imprecise on a Wi-Fi-only device. Permission denial, timeouts and unavailable fixes return to Test Drive with an explanation. The small location-source adapter in `app.js` leaves room for a future securely paired phone source; no location-sharing endpoint is implemented.

## Validation

Syntax checks:

```sh
node --check app.js
node --check sw.js
node --check adventure.js
node --check site-config.js
node --check targeting.js
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
```

`GAME_URL` overrides the browser suite’s base URL. The suite covers desktop load, car/cat movement, pause/speed, transformations, gadget effects, audio-context activation, both encounters, safe invention rendering and persistence, puppy play, squid completion, missions, service-worker caching, offline reload, responsive sizes and browser-emulated GPS denial/accuracy. It checks 1280×800 and 1024×600 landscape, 800×1280 portrait and 390×844 phone widths. `pages_smoke.py` checks project-subdirectory installation and offline HQ. `adventure_smoke.py` exercises active cat hazards, decisions, windscreen controls, fixed-pin fixtures and GPS proximity. `launch_smoke.py` checks real animation and audio activation. `update_smoke.py` installs the original v0.1 shell and verifies an upgrade preserves inventions and reaches the new launch screen. Geocoder fixtures validate application behaviour, not real address accuracy.

Current implementation-session results are in [TESTING.md](TESTING.md). Real tile delivery, audible output and physical GPS need connected-device testing; emulation is not a physical tablet test.

## Samsung tablet checklist

- Load the deployed HTTPS URL in landscape Chrome. Watch the opening, start with sound or quietly, then confirm real roads, attribution and the side-mounted controls. Check the normal reload upgrades an existing installation.
- Check pause, resume, speed, follow mode, both cats, every gadget and all transformations. Scroll on shorter displays to reach the deck.
- Enable sound, adjust volume, mute, and confirm comfortable audible effects. Install to the home screen; check standalone/fullscreen and landscape behaviour.
- Create an invention and equip an upgrade. Wait for OFFLINE READY, enable airplane mode, reopen the installed app and play the HQ squid and puppy activities. Confirm progress survives closing/reopening.
- As a passenger, test GPS allow/deny, manual zoom, accuracy in a moving car, poor signal, hotspot disconnection and switching back to Test Drive. At GO Car Wash, verify the real pin and arrival prompt; decline it and confirm it stays quiet. Check Puppy Base’s actual pin. GPS may be unavailable on the tablet.

## Project layout and licences

`app.js` manages map/GPS and saved HQ progress; `adventure.js` manages decisions, launch and windscreen gameplay; `targeting.js` manages aiming and the timed kitten round; `site-config.js` handles the fixed places. `map-mode.css` styles the game cockpit and animations, while `styles.css` contains shared/HQ styling. `sw.js` handles the offline shell and `index.html` reloads old installed shells once after an update takes over. The Odyssey, BC, Metro and Amy cameo SVGs and app icon are original artwork; supporting characters also use system emoji, whose appearance varies by platform. Synthesised sound uses Web Audio. The app uses the system font stack.

Leaflet 1.9.4 is vendored in `assets/leaflet/` under its [BSD-2-Clause licence](assets/leaflet/LICENSE). It was obtained from the npm registry and checked against the published SHA-512 integrity digest. Road tiles are © OpenStreetMap contributors; see [OpenStreetMap copyright](https://www.openstreetmap.org/copyright) and [tile usage policy](https://operations.osmfoundation.org/policies/tiles/). No prefetch, bulk download or offline tile pack is implemented.
