# Bad Cat Adventures v0.11

A personal, child-friendly adventure for Dylan the Dalmatian puppy. Bad Cat, Metro and Captain Squirrel are the villains. All characters and assets are original; there are no accounts, advertising or real-money purchases.

## Play

Open the game and choose **Let’s ride** or **Play quietly**. Road Adventure is now the only main world: GPS and maps have been retired. No location permission or map-service requests are needed.

- Use the left D-pad or arrow keys to move. Switch between the white Odyssey, Doggy Plane, submarine and walking puppy in HQ.
- The four toes and heel of the paw are five configurable launchers. Choose one, then tap the playfield or a nearby villain. Keys 1–5 select launchers. The road’s Fire button sends a projectile upward and can hit villains or bees.
- The separate house button at bottom right opens Puppy HQ: inventory, launcher editing, vehicle choices, the puppy house, net, learning games and workshop.
- Crack a villain’s forcefield and hit the exposed villain to earn a treat and launch a decision encounter. Villain chatter no longer schedules automatic attacks.
- Occasionally, five illustrated bees enter the world. Shoot or dodge them. Contact with Dylan starts the spelling game. Games pause while menus or another activity are open.
- A floating message bottle can be collected with the net selected in HQ. It opens a handwritten note directly on the large tracing surface.
- Treats buy 150 furnishings across five homes: dog house, apartment, house, big house and mansion. The homes offer 10, 20, 30, 40 and 50 items respectively. Fully furnish each home before upgrading. Earlier homes remain visitable.

There are no timed random cutaways and no tunnel activity. Instruction notifications and the aiming popup are removed. Story feedback is kept inside HQ.

## Learning games

**Spelling:** 288 words for grades 2–3, spoken words with context, exact letter blanks, distractor bees, hints and three attempts. Correct words are collected and unlock sentence codes. The final correct letter stops speech and celebrates. A puppy rescues Dylan after three unsuccessful attempts.

**Pipes:** a full-screen workshop with 24 large tiles at the start and up to 48 later. Connect the route, then watch water or slime flow. Later puzzles add obstacles and selectable pieces. No deadline or failure timer. Hints remain available. Completion earns five treats.

**Magic Pencil:** two-sentence notes covering A–Z through the course. The current formation is magnified across the available writing surface; **Whole note** shows the complete two-line page. Finger movement follows ordered cursive strokes. Notes and progress save locally. Completion earns eight treats.

The emergency snack box restores a low balance to three treats; it does not stack free treats above three. Free repairs clear jams so a child can recover without a game-over screen.

## Parent development controls

The puppy logo stays at the upper right in its own space, including inside tasks. Hold for five seconds to leave an activity without completing it. Five quick taps open controls to zero treats or erase saved progress with confirmation. These are development shortcuts, not a security lock.

## Run locally

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

No runtime dependencies or build step. Use Chrome or a modern browser. Audio starts only after a gesture. Progress saves in this browser’s local storage; clearing site data erases it.

## Publish and offline play

The Pages workflow stages the static game on pushes to `main`. All paths are relative, including the service worker, so GitHub project subpaths work. The previously configured address is https://benjeejump.github.io/bad-cat-adventures/.

Load once online, wait for offline readiness, then use Chrome’s Install app option when available. The service worker caches the game, characters and learning assets. Cache version changes install a fresh shell atomically; reload to receive an update. No external map services are called by the current game. Some older map code and licensed assets remain bundled for compatibility, but there is no playable GPS mode.

## Validation and playability

See [PLAYABILITY.md](PLAYABILITY.md) for the assessment and remaining gaps. Current release checks are documented in [TESTING.md](TESTING.md). Browser checks demonstrate software behavior; a real tablet play session is still needed to judge finger comfort, spoken-word clarity and Dylan’s engagement.
