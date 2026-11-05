# Bad Cat Adventures v0.10

Dylan’s imagination-powered, child-friendly adventure console. A static web game with no accounts, advertising, purchases, backend, API keys or paid services.

## Parent development controls

The small Dylan logo stays at the top right, including inside surprise games. Hold it for five seconds to leave a task without completing it or changing treats. Tap it five times quickly to open parent controls. Reset treats sets the balance to zero; resetting the whole game requires a second confirmation and clears this game’s saved progress on this device. These are development shortcuts, not a security lock.

Choose a launcher, then tap anywhere in the playfield to fire. Nearby cats can be hit; empty-space shots miss. Dragging the map does not fire. Routine shots use effects and the story strip instead of notification popups.

## Play locally

From the repository directory:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open the local server in Chrome. No dependency installation or build step is required. The address opens with an animated Odyssey chase and a **Let’s ride, Dylan!** launch button. **Play quietly** or **Skip intro** starts without sound. Audio only starts after a gesture. Starting the game automatically requests this tablet’s GPS through Chrome’s normal location permission. Test Drive never starts by itself, including after a GPS error.

## The game

- **Heading-up navigation:** roads turn with the direction of travel, like sat-nav. GPS course takes priority while moving; sufficiently clear movement supplies a missing course. Stopping holds the last direction. Zoom and geographic targets stay aligned. The bundled leaflet-rotate 0.5.3 dependency is distributed with its GPL-3.0 license in `assets/leaflet/ROTATE-LICENSE`.

- **GPS-first, map-first cockpit:** the game starts at the tablet’s real position, at close zoom 20. Chrome must allow location. While waiting for a fix, it shows a location screen—not a made-up position or a running demo. If location fails, choose Retry GPS, HQ or Test Drive explicitly. New fixes preserve a manual zoom adjustment. The simulation remains an optional Journey-controls button.
- **Illustrated roads:** a custom vector style draws real roads as broad cream lanes over soft green terrain and blue water, with no road-name labels, business icons, building footprints, transit clutter or text. OpenFreeMap treats the underlying OpenStreetMap geometry; MapLibre renders it locally under Leaflet’s character overlays. On devices that cannot render WebGL, a muted CARTO map without labels is the fallback; that fallback can retain building outlines. If map data is unavailable, the labelled imaginary terrain still supports GPS-relative characters and offline games.

- **Net catches and arsenal:** fictional supply drops appear near the car after a short foreground drive, then after further travel. Select the Net and tap a parcel within 25 m; long-net upgrades extend this by 10 m per level. Later drops appear ahead so the car must approach them. Drops contain net extensions, bubble amplifiers, forcefield cells, rainbow packs, sonar lenses, snacks or repair kits. Bubble upgrades clear nearby kittens too, forcefield cells extend shields, and laser/sonar upgrades extend targeted effects. Levels (maximum three each) and catch counts save locally; drop positions do not. The HQ arsenal shows current inventory.
- **The family car:** an original white Honda Odyssey illustration is used in the map, opening and story scenes. It transforms into the Doggy Plane with a cloud world or a submarine with an underwater world. Each has three special tools, hazards and stability consequences. The plane captain announces the Honda Odyssey flight, with a varied follow-up.
- **BC and M:** original illustrated faces and letter badges identify Bad Cat and Metro. They do more than chase: Metro fires bubble traps, Bad Cat borrows the booster, and both can use pretend tunnels and pipes. Those actions temporarily slow Test Drive. Matching gadgets undo the effect; hazards also expire gently. Real GPS movement is never slowed or changed by game mechanics.
- **Aim at characters:** choose a gadget, then tap BC, M or a kitten. You can also select BC/M first and then choose a gadget. The action has a visible impact and affects that character. Number keys 1–5 arm the corresponding gadget; 6 opens a surprise.
- **Kitten attack:** 20 kitten emojis drift around the screen inside circular forcefield bubbles. Aim a gadget and tap each moving bubble. The first round allows 45 seconds; the cats’ advantage reduces future rounds to as little as 35 seconds. Normal motion moves targets; reduced-motion mode keeps them stationary for accessibility. Escaped kittens damage the Odyssey, steal treats, increase the cats’ advantage and jam the forcefield. Retry does not reset those setbacks. Puppy sorties consume one treat per five kittens; every five confetti shots increases cat pressure, so gadget choice matters.
- **Giant Puppy:** an original giant puppy actually falls through the sky. Ten landing plans each have a good and bad animated outcome (bubbles, BC, treats, parachute, hammock, trampoline, sky fan, blanket, cloud or rainbow slide). Two distinct plans are drawn each time, and exactly one is randomly assigned success while the other is assigned failure. This is locked when the encounter opens, not rerolled after the click. The assignment is hidden from Dylan; the landing and persistent result are shown after his choice.
- **Lasting consequences:** car condition, treats, cats’ advantage and gadget jams are saved locally across encounters, retries and reloads. Damaged cars cruise more slowly in Test Drive; GPS positions remain accurate. Higher cat advantage means more frequent attacks and shorter kitten rounds. Jammed tools fizzle for a limited number of attempts, and puppy sorties need treats. The HUD shows current status. Repair and resupply explicitly at the offline HQ workshop—there is still no game-over screen.

- **Full-screen surprise animation:** Giant Puppy stays centred in the sky while clouds rise perpetually behind it. After a choice, the landing object appears and the puppy lands on it. Bubbles, Bad Cat and treat piles are illustrated objects rather than emoji props. Tornado scenes contain 24 orbiting illustrated kittens; the old car-at-the-bottom scene is removed for these events. Reduced-motion alternatives are supported.
- **Spelling bees:** Bad Cat’s untimed word trap uses a local bank of 288 grade 2–3 words. Hear and repeat the word, fill exactly one blank per letter, and choose from the word’s letters plus ten distinct distractors. The bees swarm; Calm the bees stops their motion. Undo and clear never spend an attempt. Random traps require solving the word or completing three attempts, with a hidden parent override. The last correct letter automatically celebrates, stops speech and sends the bees flying away. Wrong-answer feedback leaves Try Again as the only answer action. Three unsuccessful submissions trigger rescue and a loss of up to two treats. Every wrong answer shows the correct spelling. Later tries fill one/two starting letters and highlight a helpful bee. A look-and-spell hint always makes play possible if audio is unavailable.
- **Word collection and sentence codes:** correct words are collected on the device. A new word earns up to three puppy treats, assisted spelling earns one, and repeat practice earns one. Three collected words unlock a sentence activity using two of three code words, a capital, ending punctuation and at least four words. A new sentence code earns two treats. This is a word/format code checker, not a grammar assessment. Attempts and unfinished traps resume after reload.
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

A Samsung Galaxy S25 hotspot treats Internet access, **not** its GPS location. The tablet must provide its own position, which may be imprecise on a Wi-Fi-only device. Permission denial, timeouts and unavailable fixes show an explanation and wait for an explicit choice. They never switch into Test Drive automatically. A temporary unavailable/timeout error keeps the GPS watch alive to recover from the next fix; permission denial stops it until the player retries. A generation guard ignores delayed callbacks from a GPS request that the user has cancelled by choosing Test Drive. The small location-source adapter in `app.js` leaves room for a future securely paired phone source; no location-sharing endpoint is implemented.

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
node --check cinematics.js
node --check spelling.js
node --check word-bank.js
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
python3 tests/spelling_smoke.py
python3 tests/cinematics_smoke.py
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

`app.js` manages map/GPS and saved HQ progress; `adventure.js` manages decisions, launch and windscreen gameplay; `targeting.js` manages aiming and the moving kitten round; `campaign.js` owns saved consequences and recovery; `puppy-options.js` draws paired puppy plans; `site-config.js` handles the fixed places. `game-map.js` and `game-map-style.json` manage the simplified map renderer and no-label fallback. `loot.js` manages proximity-limited drops and the saved arsenal. `cinematics.js` supplies full-screen scene art; `spelling.js` manages spelling/word collection/sentence codes and `word-bank.js` holds the curated vocabulary. `learning.css` styles those scenes. `map-mode.css` styles the game cockpit and animations, while `styles.css` contains shared/HQ styling. `sw.js` handles the offline shell and `index.html` reloads old installed shells once after an update takes over. Original illustrated portraits give Bad Cat a large evil-genius design and Metro a mechanic/inventor identity; kittens and Giant Puppy share that illustrated style. Vehicles, the Amy cameo and app icon use original SVG artwork. Supporting decorations use system emoji. Synthesised sound uses Web Audio. The app uses the system font stack.

Leaflet 1.9.4 is vendored in `assets/leaflet/` under its [BSD-2-Clause licence](assets/leaflet/LICENSE). It was obtained from the npm registry and checked against the published SHA-512 integrity digest. Road tiles are © OpenStreetMap contributors; see [OpenStreetMap copyright](https://www.openstreetmap.org/copyright) and [tile usage policy](https://operations.osmfoundation.org/policies/tiles/). No prefetch, bulk download or offline tile pack is implemented.

MapLibre GL JS 5.6.1 and `@maplibre/maplibre-gl-leaflet` 0.1.3 are pinned and vendored in `assets/maplibre/`, with their licences. Both npm archives were checked against the registry’s SHA-512 integrity digests before extraction. [OpenFreeMap](https://openfreemap.org/) treats open vector tiles without API keys. The fallback uses [CARTO basemaps](https://carto.com/attributions) for this personal non-commercial game; provider attribution is always displayed. App shell caching never intercepts either provider’s tile requests.

## Spoken words and gentle practice

Word audio uses the browser’s built-in Speech Synthesis API and an English (US) voice. No paid speech API or account is used. The installed tablet voice may require an OS voice pack or network access; test it on the Galaxy tablet. With game sound on, a word is announced on entry. In quiet mode, tap **Hear the word** explicitly. Repeating audio never consumes an attempt. If speech is unavailable, the game explains this and always offers **Look at the word** so the trap is still solvable.

Puppy **treats** are the shared currency (maximum 99). Existing saved supply balances migrate without losing their value; the internal legacy property remains named `supplies` for compatibility. Correct words and new sentence codes earn treats; puppy assistance uses them. At two or fewer treats the HUD says the crew is running low. A failed spelling round never removes collected words or causes car damage. The word collection, pending challenge, grade/calm-bee preferences and last 20 completed sentence codes are saved only on this device. No typed sentence is sent to an AI or application server.

On the tablet, check word pronunciation, repeat audio, duplicate letters (for example the three Ps in **puppy**), calm-bee controls, hints after mistakes, the displayed correct spelling, word collection and sentence-code typing. For offline speech, install an offline English voice if the tablet needs one; offline text practice still works.

## v0.10 characters and worlds

Bad Cat and Metro have speech bubbles, announced mischief plans and persistent forcefields. Attacks wear down the fields before affecting the cat; sonar reveals their remaining layers. Day, Night and Auto display choices save on this device. Story results return to play automatically. A completed kitten mission shows all twenty kittens together in a net.

`characters.js` manages cat personalities and shields; `theme.js` manages display preferences; `vehicle-world.js` provides sky and underwater play. `character-style.css` styles the illustrated cast and worlds.

## Picture invention laboratory and puppy walks

Choose from 20 launchers, 40 pictured items and 24 special features (19,200 combinations), preview the launch, then save a name or accept an automatic name. Up to twenty recipes save locally. The item, launcher and feature are saved, and the chosen item actually flies when used against BC, Metro or kittens. Catapults use a high arc; waterslides use a low swoop. Features select a familiar bubble, shield, confetti or puppy effect; flames and sparks are pretend. The map’s My inventions button opens the saved arsenal. Existing named gadgets remain usable.

Walking is a fourth travel choice: Dylan, an animated Dalmatian puppy, replaces the car on the heading-up GPS map. GPS remains real; only optional Test Drive movement slows to puppy pace. `inventions.js` owns the picture catalog, preview and projectile animation; `inventions.css` styles the builder and arsenal.

## Illustrated adventure style

Dylan is the Dalmatian puppy hero; Bad Cat and Metro remain the villains. The mechanic kittens, puppy crew, bees, squid and vehicles use bright contemporary 3D-style artwork. Plain collars and unbranded equipment avoid franchise-style tags and shield emblems. `team-style.css` gives controls a clean blue/cyan/orange equipment look with rounded moulded buttons and Day/Night palettes. Reduced-motion settings stop decorative motion. Artwork is bundled offline.

## Metro’s Pipeworks

An original optional pipe-rotation puzzle available from the map, HQ and the random surprise pool. Dylan stops Metro’s pipe prank, with help from Luna. Generated routes connect every tile from inlet to outlet. There is no countdown, failure state or treat penalty: water, slime, golden goo or sparkle juice visibly travels along the connected route at a gentle adjustable pace. Pause, unlimited Luna hints and a smaller-puzzle button support patient thinking. Repairs earn treats and save a local workshop record; no puzzle or location is sent to a server. Existing adventures pause while the workshop is open. `pipeworks.js` and `pipeworks.css` contain its original mechanics and SVG pipe art.

## Magic Pencil notes

Choose a teammate and one of fifteen two-sentence notes covering all A–Z. Both sentences stay on a two-line writing page: prompts are printed, while original curved cursive guides show the tracing route. As Dylan follows the pencil, neat connected cursive ink appears. Joined one-stroke letters support continuous finger tracing; dots and cross strokes prompt a lift. The page scrolls automatically and offers a whole-page/tracing-size toggle. There is no timer or failed attempt. Notes resume after reload, completed cursive pages become keepsakes, and a saved alphabet tracker recommends notes with unexplored letters. `cursive.js` supplies original formation paths; `handwriting.js` manages touch practice and local progress. No writing goes to an application server.

## v0.10 environments and scale

Bees are bee-shaped insects; the windscreen squid has a mantle, arms and long tentacles. Sky, sea, town surprises and the exposed-floorboard pipe game use original full-scene backgrounds. Dylan, BC, Metro and flight/dive player sprites use a consistent 80 px frame. Real GPS roads remain unchanged.

## Road Adventure and Captain Squirrel

The opening and mode bar offer **GPS map** or **Road Adventure**. GPS is still the default choice; Road Adventure never requests location and cancels an existing watch. The original simulated map remains under Journey controls as Map demo. Road Adventure is an original vertical scrolling-road arcade game: drag the overhead Odyssey or use steering buttons/arrow keys, choose a launcher and fire (hold the fire button or use Space). Collect cookies for treats. Bad Cat is now a cuter biker kitten; he, Metro and the pirate Captain Squirrel pop into formations, have attackable forcefields and announce surprise-game plans. Their appearances, shots, steering and road movement run on animation frames. Gameplay pauses during side games, HQ, menus and tab inactivity. No road position is supplied to the real GPS map. Returning to GPS requires its own live fix; stale callbacks cannot take over the road game.

## Five direct arsenal slots

**My five launchers** lets Dylan assign any saved invention or standard gadget to each main action button. A custom recipe can replace Sonar, Forcefield or another default, then be armed directly from that button or its number key (1–5). The five choices save locally; retiring an invention resets its equipped slot to the original gadget. The full invention menu remains available for other recipes.

## Puppy House and spending treats

The full-screen home game has five stages: **Dog house → Dog apartment → House → Big house → Mansion**. Each stage offers twenty distinct furnishings, for **100 items total**, with visible prices from 1 to 32 treats. The starting dog-house shell is free. Purchases place furnishings automatically; tap an object to let Dylan explore it, move it, or store/place it without paying again. All twenty furnishings must be placed before the next upgrade unlocks. Home upgrades cost 8, 15, 25 and 35 treats respectively. The new home starts empty with its own twenty-item catalogue; previous homes and their furnishings remain saved for revisiting. Purchases cannot spend more treats than the current balance. Houses, positions, ownership and upgrades stay on this device. Treats are only game currency, with no real-money purchase.

Pipeworks and Magic Pencil now fill the viewport. From workshop 3, Pipeworks adds blocked sockets and a tray of straight/bent pipe pieces to place around obstacles. Later boards add more obstacles and longer detours. Hints, slow flow and the smaller-puzzle option remain available, with no timer or failure penalty.
