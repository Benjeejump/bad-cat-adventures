# Bad Cat Adventures v0.1

Dylan’s imagination-powered, child-friendly adventure console. A static web game with no accounts, advertising, purchases, backend, API keys or paid services.

## Play locally

From the repository directory:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open the local server in Chrome. No dependency installation or build step is required. Test Drive starts automatically without GPS permission. Use the large gadget buttons (or keys **1–6**), choose a car, plane or submarine, and explore Mission HQ. Nothing ends in a game-over screen.

- **Test Drive:** a looping simulated Cambridge route, pause/resume, speed choices and independently moving cats that approach, overtake and retreat. This is imaginative play, not turn-by-turn navigation; route interpolation is approximate.
- **GPS:** optional browser geolocation, accuracy display, moving crew and follow control. Drag the road map to stop following; press Follow car to resume. GPS requires HTTPS or localhost. Only use the game as a passenger.
- **Gadgets:** temporary forcefield, confetti laser, sonar, bubbles and heroic puppies. Puppy deployment can turn Bad Cat into an ally. All gadgets have visible feedback; sound starts only when the sound button is tapped.
- **Encounters:** help the car-wash squid or stop Metro’s Mega House Vacuum. Fictional buildings are clickable and clearly distinguished from real map information.
- **Offline HQ:** invent and name gadgets, deploy or delete inventions, equip vehicle upgrades, play with puppies, complete the three-tickle squid challenge and generate surprise missions.

## Deploy to GitHub Pages

1. Commit these project files and push to `main` in `Benjeejump/bad-cat-adventures`.
2. In the repository’s **Settings → Pages**, set **Source** to **GitHub Actions**.
3. The included `.github/workflows/pages.yml` stages only public game files and deploys them. You can also run it using **Actions → Deploy to GitHub Pages → Run workflow**.
4. After a successful deployment, use the URL reported by the deployment. The expected project address is `https://benjeejump.github.io/bad-cat-adventures/` (this address has not been deployed or verified by this implementation session).

All app, manifest, service-worker and asset paths are relative, so project subdirectories work. GitHub Pages provides HTTPS for GPS and service workers. No server runtime is needed. If using branch-based Pages instead, publish the repository root on `main`; do not enable both deployment methods at once.

## Install and play offline

Load the app once while connected and wait for **OFFLINE READY** beside Mission HQ. In Android Chrome, use the browser menu’s **Install app** or **Add to Home screen** action when available. The manifest requests standalone, landscape presentation and includes 192/512-pixel icons. Browser installation prompts and orientation locking vary by device.

The service worker caches only the local app shell, graphics and bundled Leaflet files. HQ, gadgets and Test Drive’s clearly labelled fictional fallback remain usable after an offline reload. It never intercepts or bulk-caches OpenStreetMap tiles. Live road maps require connectivity; the browser may independently use its ordinary HTTP cache. No claim of offline road-map coverage is made.

For a release that changes shell files, increment the cache version in `sw.js`. The new shell is installed atomically and older game caches are removed. Reload after an update. Clearing site data removes inventions and progress.

## Privacy and location

Inventions, equipment and aggregate game counters are saved only in browser local storage. Location coordinates/history are never saved, included in diagnostics, or sent to an application server. The current fix is held in memory to draw the car and estimate distance; the browser watch is cleared when returning to Test Drive or leaving the page. Storage failure is reported and play continues for that visit.

When the road map is online, the browser requests viewport tiles directly from `tile.openstreetmap.org`. Those requests reveal the viewed area and normal connection metadata to OpenStreetMap. Its attribution stays visible on the map. No analytics or third-party fonts are used. Leaflet is bundled locally.

A Samsung Galaxy S25 hotspot supplies Internet access, **not** its GPS location. The tablet must provide its own position, which may be imprecise on a Wi-Fi-only device. Permission denial, timeouts and unavailable fixes return to Test Drive with an explanation. The small location-source adapter in `app.js` leaves room for a future securely paired phone source; no location-sharing endpoint is implemented.

## Validation

Syntax checks:

```sh
node --check app.js
node --check sw.js
```

Browser integration checks (optional development tools, not game dependencies):

```sh
python3 -m pip install playwright
# With the local server running and Chromium at /usr/bin/chromium:
python3 tests/browser_smoke.py
python3 tests/pages_smoke.py
```

`GAME_URL` overrides the browser suite’s base URL. The suite covers desktop load, car/cat movement, pause/speed, transformations, gadget effects, audio-context activation, both encounters, safe invention rendering and persistence, puppy play, squid completion, missions, service-worker caching, offline reload, responsive sizes and browser-emulated GPS denial/accuracy. It checks 1280×800 and 1024×600 landscape, 800×1280 portrait and 390×844 phone widths. `pages_smoke.py` checks the project-subdirectory installation and offline HQ.

Current implementation-session results are in [TESTING.md](TESTING.md). Real tile delivery, audible output and physical GPS need connected-device testing; emulation is not a physical tablet test.

## Samsung tablet checklist

- Load the deployed HTTPS URL in landscape Chrome, confirm real roads and OpenStreetMap attribution, then start Test Drive without granting GPS.
- Check pause, resume, speed, follow mode, both cats, every gadget and all transformations. Scroll on shorter displays to reach the deck.
- Enable sound, adjust volume, mute, and confirm comfortable audible effects. Install to the home screen; check standalone/fullscreen and landscape behaviour.
- Create an invention and equip an upgrade. Wait for OFFLINE READY, enable airplane mode, reopen the installed app and play the HQ squid and puppy activities. Confirm progress survives closing/reopening.
- As a passenger, test GPS allow/deny, accuracy in a moving car, poor signal, hotspot disconnection and switching back to Test Drive. GPS may be unavailable on the tablet.

## Project layout and licences

`index.html`, `styles.css` and `app.js` implement the game; `sw.js` handles the offline shell. `assets/icon.svg` and the vehicle SVGs are original artwork; characters also use system emoji, whose appearance varies by platform. Synthesised sound uses Web Audio. The app uses the system font stack.

Leaflet 1.9.4 is vendored in `assets/leaflet/` under its [BSD-2-Clause licence](assets/leaflet/LICENSE). It was obtained from the npm registry and checked against the published SHA-512 integrity digest. Road tiles are © OpenStreetMap contributors; see [OpenStreetMap copyright](https://www.openstreetmap.org/copyright) and [tile usage policy](https://operations.osmfoundation.org/policies/tiles/). No prefetch, bulk download or offline tile pack is implemented.
