# Validation record

Validated in headless Chromium 155 on Linux. These results describe this workspace, not a deployed site or physical Samsung tablet.

## Passed

- JavaScript syntax: `node --check app.js` and `node --check sw.js`.
- Main browser suite: **44 assertions passed**, including desktop startup; local Leaflet and attribution; car and both cats moving; pause/resume and simulation speed; all transformations; every gadget; audio context activated after a gesture; both encounter resolutions; fictional building interaction; safe invention text and reload persistence; garage persistence; puppies; squid challenge; surprise missions; service-worker cache; offline reload and offline play; GPS permission denial and a browser-emulated ±12 m fix; switching back to simulation; no coordinates in saved progress; and no uncaught JavaScript errors.
- Responsive checks: drive and HQ had no horizontal overflow at 1280×800, 1024×600, 800×1280 and 390×844. Desktop and tablet screenshots were inspected during development. Shorter displays can scroll vertically.
- Pages-path suite: **4 assertions passed** for Leaflet/attribution under `/bad-cat-adventures/`, service-worker scope, offline HQ invention creation, and no uncaught JavaScript errors.
- Vendored Leaflet 1.9.4 archive verified against the npm registry SHA-512 digest before extraction; licence retained.
- Whitespace checks: `git diff --check`.

## Not verified here

- **Real road-map tiles:** `tile.openstreetmap.org` returned a cloud-proxy CONNECT 403. Local Leaflet initialises, but actual OpenStreetMap imagery could not be verified. The labelled fictional fallback, simulation and HQ were exercised instead. The map is north-up; no rotation plugin is used.
- **Physical device:** real GPS reception, audible speaker output, Chrome installation prompt, standalone orientation, fullscreen, moving-car accuracy, hotspot transitions and Samsung battery/browser behaviour need the README’s tablet checklist. Audio context operation was tested; no human listened to a physical speaker.
- **Deployment:** no commit was pushed and no GitHub Pages deployment was performed. The workflow and instructions are supplied; the expected address in README is not a verified live URL.
- **Fresh cloud task restoration:** not tested or published. Cloud draft startup instructions and the `tile.openstreetmap.org` domain addition were saved, but draft persistence does not apply networking or publish the environment.

## Scope notes

The first version is deliberately forgiving: actions change playful feedback, temporary cat behaviour and saved aggregate counters rather than health or a win/lose campaign. Test Drive interpolates an approximate route and is not navigation. Buildings, enemies and encounters are fiction. Equipment and inventions persist locally; there are no accounts or cross-device synchronisation. Offline shell availability requires a successful first cache install on HTTPS/localhost. Road tiles are never added to the service-worker cache.
