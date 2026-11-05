# v0.6 validation record

Tested in Chromium 155 on Linux, including normal motion and reduced-motion settings. The browser suites cover the complete update; this is workspace evidence, not physical tablet or deployment verification.

- **Core regression (`browser_smoke.py`):** map initialisation, attribution, moving car/cats, pause/speed, transformations, gadgets, animated decisions, BC/M faces, removed building clutter, invention safety/persistence, garage, puppy and HQ squid play, offline reload, four viewport sizes, explicit Test Drive selection, GPS denial without starting a demo, and emulated accuracy, and no player coordinates in saved progress. No uncaught JavaScript errors.
- **New adventures (`adventure_smoke.py`):** full-viewport map at zoom 20; exactly two fixed place pins using explicitly synthetic geocoder fixtures; bubble/booster/tunnel hazards and gadget counters; animated decisions including Amy/Puppy Base; windscreen wipers, swipe, three bubbles, booster ordering, squid escape and replay; GPS accuracy/dwell/decline/re-entry gating; preserved manual zoom and fixed pins; offline car wash/Amy scene; responsive map sizing. No uncaught JavaScript errors.
- **Launch (`launch_smoke.py`):** opening shown on address load; Odyssey chase animation; silent before gesture; launch starts sound; quiet skip stays silent; automatic cat mischief and a random decision; actual wiper animation and squid transform; opening controls fit 1024×600 and 390×844. No uncaught JavaScript errors.
- **Pages (`pages_smoke.py`):** all public assets work below `/bad-cat-adventures/`, correct worker scope, offline HQ and invention creation. No uncaught JavaScript errors.
- **Installed upgrade (`update_smoke.py`):** installs the actual v0.1 worker from commit `6ba42fd`, replaces the staged site with v0.6, confirms the worker upgrades, the launch button works, and old inventions survive. An early controller-change listener avoids mixing a new launch page with cached v0.1 scripts.
- **Aiming and kitten raid (`targeting_smoke.py`):** action-first and character-first targeting, character impact animation, exactly 20 kittens, 45-second countdown, all-target victory, retry reset, timeout setbacks and tablet playfield size. No uncaught JavaScript errors.
- **Static checks:** `node --check` for the application scripts and service worker; `git diff --check`.

## Limits that remain

Third-party map data and Nominatim address lookup could not be verified through this cloud proxy. Real road imagery and actual business pin coordinates cannot be verified here. The fixed-address resolver checks exact house number, road and geographic bounds before creating pins; failed lookup is reported in Journey controls. Tests use synthetic address fixtures only, and do not substitute those coordinates into the shipped app. No approximate or invented business coordinates are hardcoded.

The car-wash arrival feature is a conservative GPS proximity offer, not a detector for entering the actual wash bay. Physical tablet testing must confirm the resolved entrance location, ±45 m accuracy gate, 65 m arrival radius, dwell, 180 m re-arm boundary, speaker sound, fullscreen/PWA behaviour and hotspot transitions. Weak GPS or unavailable address lookup should still permit manual car-wash play.

Tunnels/pipes, cat attacks, houses, Amy’s homes and underwater scenes are fiction. Simulation speed is affected by cat hazards; live GPS coordinates are never altered by gameplay. No user location history is retained or transmitted to an application server. The service worker caches local game assets only, never map tiles or external geocoder responses. The fixed-address cache contains only the two configured Lakeline places.

## v0.6 consequence and puppy coverage

`consequences_smoke.py` checks the ten-option pool, exactly one good/one bad plan per pair, all twenty animated landing branches, normal-motion kitten drifting and circular forcefields, a real pointer hit on a moving bubble, failed-round damage/pressure/jams, persistence across reload, retry preserving penalties, and explicit HQ repair. Reduced-motion tests keep moving targets stationary. Puppy failure is comedic property damage, never injury to the puppy or family. Higher pressure changes actual encounter cadence and raid time; low condition changes simulated driving speed only.

## GPS-first and game-map coverage

`gps_map_smoke.py` validates the real MapLibre canvas renderer against synthetic GeoJSON road geometry, no label/POI/building layers, automatic permissioned tablet GPS, accuracy display, zoom 20, manual zoom surviving a new fix, zero simulation time during GPS, permission denial leaving the game stationary, explicit Test Drive selection, and stale GPS success/error callbacks not taking over a newer selection. Rendering was inspected at 1280×800. The cloud network cannot verify OpenFreeMap/CARTO production tile delivery; synthetic renderer evidence is not a real local-road test. Physical tablet checks should verify WebGL performance and actual roads at the new close zoom.

## Net and inventory coverage

`loot_smoke.py` exercises a drop near an emulated GPS car, refusal to grab without a net, the catch animation, an earned net extension from 25 m to 35 m, no coordinates in saved inventory, reload persistence, a second drop revealed through travel, refusing an out-of-range cast, approaching the fixed drop using browser GPS updates, bubble amplification clearing a nearby kitten, and the HQ inventory display. Temporary GPS failures retain the live watch and recover on subsequent fixes; switching between GPS waiting and live does not relocate an existing drop.

## Spelling and cinematic coverage

`spelling_smoke.py` verifies 288 locally bundled words, exact-length blanks, ten distinct extra letters, spoken-word/repeat requests, duplicate required letters, blocking empty attempts, mandatory attempts with progressive help before rescue, displayed correct spellings, progressive letter hints, third-attempt puppy rescue and treat loss, saved correct-word collection, grade selection, reload resuming an unfinished trap, audio-unavailable look-and-spell fallback, calm bees, sentence-code checks and rewards, duplicate-sentence reward prevention, responsive layouts and offline practice. Speech is mocked in automated tests; actual voice availability, audio quality and pronunciation must be verified on the tablet. The word list is curated practice vocabulary, not a certified curriculum assessment.

`cinematics_smoke.py` checks full-screen puppy rendering, central positioning, upward cloud movement, removal of the small car layout, illustrated bubble/Bad Cat/treat landing props, actual landing animations, and 24 moving kittens in the tornado. Normal-motion screenshots were inspected.

## v0.6 worlds and celebration coverage

`worlds_smoke.py` checks character speech, Night mode, all three vehicle views, mode-specific hazards and tools, the flight welcome, contextual ribbon speech, automatic word completion, speech cancellation, flying bees, automatic return, and twenty illustrated kittens in the completion net. Speech requests are mocked; real tablet voices still need a device check. Targeting and cinematic regressions cover shields, replay, moving kittens and landing animations.

## Heading-up navigation

GPS map checks include eastbound rotation, matching vector-road/overlay bearings, holding direction while stopped, and deriving heading from movement when GPS course is absent. MapLibre renders in screen coordinates while Leaflet rotates geographic overlays and fallback tiles. Real tablet GPS course availability and turns still need a road check.

## v0.7 picture recipes and walking

`inventions_smoke.py` checks the 20/40/24 option catalog, selected preview, saved recipe/name, custom targeted projectile and shield damage, map arsenal and reload persistence, walking puppy, road-world selection and responsive HQ layouts. Browser, Pages, installed-update, GPS, targeting and world regressions also cover the changed integrations.

## v0.8 illustrated game interface

`style_smoke.py` checks illustrated walking and all three HQ puppy portraits, loaded assets, phone/tablet fit, car-wash character replacement and available spelling controls. Screenshots cover HQ, Night, walking, car wash and spelling. Gameplay, targeting, GPS, invention, installed-update, project-path and cinematic suites check the shared visual changes.

## Relaxed Metro pipe puzzle

`pipeworks_smoke.py` independently solves generated small and 25-tile boards, verifies no time limit, pauses random encounters, checks gradual slime travel before victory, paused flow, complete end-to-end filling, treat rewards, hints, responsive boards and saved offline records. The game has no countdown or loss branch.

## Finger-traced notes

`handwriting_smoke.py` uses Chromium touch input for the first letter, checks stroke order and refusal to count arbitrary taps, resumes after reload, checks phone/tablet fit, traces both sentences, verifies actual stroke paths and treat reward, and reopens saved keepsakes offline. Physical tablet testing should confirm comfortable finger tolerance and the displayed letter size for Dylan.

Modern artwork review confirms Dylan is the Dalmatian hero, BC and Metro remain villains, and active puppy/vehicle artwork has plain equipment without franchise-style tags. Walking tests now identify Dylan’s sprite.

## v0.9 two-line cursive and environments

The handwriting suite checks two full printed prompts with cursive guide glyphs, A–Z coverage across fifteen notes, actual touch input, continuous joined-letter tracing, saved position, scrolling phone/tablet fit, neat completed cursive and offline progress. `scene_scale_smoke.py` checks surprise Pipeworks, equal sprite frames, scene background delivery and the floorboard setting. Earlier monoline-note coverage describes the previous version.
