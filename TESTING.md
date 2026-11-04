# v0.3 validation record

Tested in Chromium 155 on Linux, including normal motion and reduced-motion settings. The browser suites cover the complete update; this is workspace evidence, not physical tablet or deployment verification.

- **Core regression (`browser_smoke.py`):** map initialisation, attribution, moving car/cats, pause/speed, transformations, gadgets, animated decisions, BC/M faces, removed building clutter, invention safety/persistence, garage, puppy and HQ squid play, offline reload, four viewport sizes, GPS denial/emulated accuracy, and no player coordinates in saved progress. No uncaught JavaScript errors.
- **New adventures (`adventure_smoke.py`):** full-viewport map at zoom 18; exactly two fixed place pins using explicitly synthetic geocoder fixtures; bubble/booster/tunnel hazards and gadget counters; animated decisions including Amy/Puppy Base; windscreen wipers, swipe, three bubbles, booster ordering, squid escape and replay; GPS accuracy/dwell/decline/re-entry gating; preserved manual zoom and fixed pins; offline car wash/Amy scene; responsive map sizing. No uncaught JavaScript errors.
- **Launch (`launch_smoke.py`):** opening shown on address load; Odyssey chase animation; silent before gesture; launch starts sound; quiet skip stays silent; automatic cat mischief and a random decision; actual wiper animation and squid transform; opening controls fit 1024×600 and 390×844. No uncaught JavaScript errors.
- **Pages (`pages_smoke.py`):** all public assets work below `/bad-cat-adventures/`, correct worker scope, offline HQ and invention creation. No uncaught JavaScript errors.
- **Installed upgrade (`update_smoke.py`):** installs the actual v0.1 worker from commit `6ba42fd`, replaces the staged site with v0.3, confirms the worker upgrades, the launch button works, and old inventions survive. An early controller-change listener avoids mixing a new launch page with cached v0.1 scripts.
- **Aiming and kitten raid (`targeting_smoke.py`):** action-first and character-first targeting, character impact animation, exactly 20 kittens, 45-second countdown, all-target victory, retry reset, timeout setbacks and tablet playfield size. No uncaught JavaScript errors.
- **Static checks:** `node --check` for the application scripts and service worker; `git diff --check`.

## Limits that remain

OpenStreetMap tile and Nominatim requests are denied by this cloud proxy. Real road imagery and actual business pin coordinates cannot be verified here. The fixed-address resolver checks exact house number, road and geographic bounds before creating pins; failed lookup is reported in Journey controls. Tests use synthetic address fixtures only, and do not substitute those coordinates into the shipped app. No approximate or invented business coordinates are hardcoded.

The car-wash arrival feature is a conservative GPS proximity offer, not a detector for entering the actual wash bay. Physical tablet testing must confirm the resolved entrance location, ±45 m accuracy gate, 65 m arrival radius, dwell, 180 m re-arm boundary, speaker sound, fullscreen/PWA behaviour and hotspot transitions. Weak GPS or unavailable address lookup should still permit manual car-wash play.

Tunnels/pipes, cat attacks, houses, Amy’s homes and underwater scenes are fiction. Simulation speed is affected by cat hazards; live GPS coordinates are never altered by gameplay. No user location history is retained or transmitted to an application server. The service worker caches local game assets only, never map tiles or external geocoder responses. The fixed-address cache contains only the two configured Lakeline places.

## v0.3 consequence and puppy coverage

`consequences_smoke.py` checks the ten-option pool, exactly one good/one bad plan per pair, all twenty animated landing branches, normal-motion kitten drifting and circular forcefields, a real pointer hit on a moving bubble, failed-round damage/pressure/jams, persistence across reload, retry preserving penalties, and explicit HQ repair. Reduced-motion tests keep moving targets stationary. Puppy failure is comedic property damage, never injury to the puppy or family. Higher pressure changes actual encounter cadence and raid time; low condition changes simulated driving speed only.
