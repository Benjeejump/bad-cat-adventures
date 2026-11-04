# v0.4 validation record

Tested in Chromium 155 on Linux, including normal motion and reduced-motion settings. The browser suites cover the complete update; this is workspace evidence, not physical tablet or deployment verification.

- **Core regression (`browser_smoke.py`):** map initialisation, attribution, moving car/cats, pause/speed, transformations, gadgets, animated decisions, BC/M faces, removed building clutter, invention safety/persistence, garage, puppy and HQ squid play, offline reload, four viewport sizes, explicit Test Drive selection, GPS denial without starting a demo, and emulated accuracy, and no player coordinates in saved progress. No uncaught JavaScript errors.
- **New adventures (`adventure_smoke.py`):** full-viewport map at zoom 20; exactly two fixed place pins using explicitly synthetic geocoder fixtures; bubble/booster/tunnel hazards and gadget counters; animated decisions including Amy/Puppy Base; windscreen wipers, swipe, three bubbles, booster ordering, squid escape and replay; GPS accuracy/dwell/decline/re-entry gating; preserved manual zoom and fixed pins; offline car wash/Amy scene; responsive map sizing. No uncaught JavaScript errors.
- **Launch (`launch_smoke.py`):** opening shown on address load; Odyssey chase animation; silent before gesture; launch starts sound; quiet skip stays silent; automatic cat mischief and a random decision; actual wiper animation and squid transform; opening controls fit 1024×600 and 390×844. No uncaught JavaScript errors.
- **Pages (`pages_smoke.py`):** all public assets work below `/bad-cat-adventures/`, correct worker scope, offline HQ and invention creation. No uncaught JavaScript errors.
- **Installed upgrade (`update_smoke.py`):** installs the actual v0.1 worker from commit `6ba42fd`, replaces the staged site with v0.4, confirms the worker upgrades, the launch button works, and old inventions survive. An early controller-change listener avoids mixing a new launch page with cached v0.1 scripts.
- **Aiming and kitten raid (`targeting_smoke.py`):** action-first and character-first targeting, character impact animation, exactly 20 kittens, 45-second countdown, all-target victory, retry reset, timeout setbacks and tablet playfield size. No uncaught JavaScript errors.
- **Static checks:** `node --check` for the application scripts and service worker; `git diff --check`.

## Limits that remain

Third-party map data and Nominatim address lookup could not be verified through this cloud proxy. Real road imagery and actual business pin coordinates cannot be verified here. The fixed-address resolver checks exact house number, road and geographic bounds before creating pins; failed lookup is reported in Journey controls. Tests use synthetic address fixtures only, and do not substitute those coordinates into the shipped app. No approximate or invented business coordinates are hardcoded.

The car-wash arrival feature is a conservative GPS proximity offer, not a detector for entering the actual wash bay. Physical tablet testing must confirm the resolved entrance location, ±45 m accuracy gate, 65 m arrival radius, dwell, 180 m re-arm boundary, speaker sound, fullscreen/PWA behaviour and hotspot transitions. Weak GPS or unavailable address lookup should still permit manual car-wash play.

Tunnels/pipes, cat attacks, houses, Amy’s homes and underwater scenes are fiction. Simulation speed is affected by cat hazards; live GPS coordinates are never altered by gameplay. No user location history is retained or transmitted to an application server. The service worker caches local game assets only, never map tiles or external geocoder responses. The fixed-address cache contains only the two configured Lakeline places.

## v0.4 consequence and puppy coverage

`consequences_smoke.py` checks the ten-option pool, exactly one good/one bad plan per pair, all twenty animated landing branches, normal-motion kitten drifting and circular forcefields, a real pointer hit on a moving bubble, failed-round damage/pressure/jams, persistence across reload, retry preserving penalties, and explicit HQ repair. Reduced-motion tests keep moving targets stationary. Puppy failure is comedic property damage, never injury to the puppy or family. Higher pressure changes actual encounter cadence and raid time; low condition changes simulated driving speed only.

## GPS-first and game-map coverage

`gps_map_smoke.py` validates the real MapLibre canvas renderer against synthetic GeoJSON road geometry, no label/POI/building layers, automatic permissioned tablet GPS, accuracy display, zoom 20, manual zoom surviving a new fix, zero simulation time during GPS, permission denial leaving the game stationary, explicit Test Drive selection, and stale GPS success/error callbacks not taking over a newer selection. Rendering was inspected at 1280×800. The cloud network cannot verify OpenFreeMap/CARTO production tile delivery; synthetic renderer evidence is not a real local-road test. Physical tablet checks should verify WebGL performance and actual roads at the new close zoom.

## Net and inventory coverage

`loot_smoke.py` exercises a drop near an emulated GPS car, refusal to grab without a net, the catch animation, an earned net extension from 25 m to 35 m, no coordinates in saved inventory, reload persistence, a second drop revealed through travel, refusing an out-of-range cast, approaching the fixed drop using browser GPS updates, bubble amplification clearing a nearby kitten, and the HQ inventory display. Temporary GPS failures retain the live watch and recover on subsequent fixes; switching between GPS waiting and live does not relocate an existing drop.
