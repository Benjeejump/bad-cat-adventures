# Bad Cat Adventures v0.13

A personal, child-friendly adventure for Dylan the Dalmatian puppy. Bad Cat, Metro and Captain Squirrel are the villains. All characters and assets are original; there are no accounts, advertising or real-money purchases.

## Play

Open the game and choose **Let’s ride** or **Play quietly**. Road Adventure is now the only main world: GPS and maps have been retired. No location permission or map-service requests are needed.

- Use the left D-pad or arrow keys to move. Switch between the white Odyssey, Doggy Plane, submarine and walking puppy in HQ.
- The four toes and heel of the paw are five configurable launchers. Choose one, then tap the playfield or a nearby villain. Keys 1–5 select launchers. The road’s Fire button sends a projectile upward and can hit villains or bees.
- Bees wander independently rather than descending in formation. All adventure movement, attacks, boost timers and bee encounters pause in Mission HQ, Puppy HQ, the home, the store and other activities.
- Visible booster pods can be activated with the Boost button or B: a three-second burst, temporary projectile protection and a twelve-second recharge. Theft removes them; recovery restores them with a glow. Sonar/puppy/shield hits on the cats, or defeating them, recover stolen equipment even after a reload.
- Bad Cat fires kittens, Metro throws spanners and Captain Squirrel fires acorns. Attacks wind up first, travel slowly, can be dodged or shot, and cause small recoverable dents.
- The separate house button at bottom right opens Puppy HQ: inventory, launcher editing, vehicle choices, the puppy house, net, learning games and workshop.
- Crack a villain’s forcefield and hit the exposed villain to earn a treat and launch a decision encounter. Villain chatter no longer schedules automatic attacks.
- Occasionally, five illustrated bees enter the world. Shoot or dodge them. Contact with Dylan starts the spelling game. Games pause while menus or another activity are open.
- A floating message bottle can be collected with the net selected in HQ. It opens a handwritten note directly on the large tracing surface.
- Treats buy 150 furnishings across five homes: dog house, apartment, house, big house and mansion. The homes offer 10, 20, 30, 40 and 50 items respectively. Fully furnish each home before upgrading. Earlier homes remain visitable. New furniture costs 6–82 treats; home upgrades cost 20/40/65/90 treats. Existing purchases remain owned.

There are no timed random cutaways and no tunnel activity. Instruction notifications and the aiming popup are removed. Story feedback is kept inside HQ.

## Puppy home and friends

Dylan walks around his home independently, naps on beds, snacks at bowls, reads and plays with furniture. Tap an item to send him to it.

**Invite friends** offers eight breeds: Golden Retriever, Corgi, Pug, Husky, Dachshund, Beagle, Poodle and Boston Terrier. An invitation costs 12–20 treats once; returning or swapping an unlocked friend is free. The homes fit 1/2/3/4/5 friends respectively. Chosen guests are saved per home, use furnishings alongside Dylan, and work offline. These are fictional puppy visitors, not online invitations.

## Learning games

**Spooky Forest:** a cosy multiplication lantern trail. Choose a table from 1–12, a starter mixture of 2/5/10, or a full mixed trail. Answer six questions to light the path and earn five treats. Wrong answers offer grouped-dot and repeated-addition hints with no penalty or timer. Progress saves locally.

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

## Christmas mode

Tap the top-right puppy logo five times to open parental settings, then switch **Christmas mode** on or off. The choice saves on this device without changing treats, purchases, collected words or inventions. Day/night remains a separate choice.

The winter version includes snowy North Pole scenery, festive character outfits and vehicles, Christmas launchers and invention ingredients, gingerbread homes and furniture, dressed-up friends, seasonal spelling and tracing sentences, present-themed multiplication, an elf pipe workshop and Santa squid wash. Switching off restores the regular artwork and labels.

Metro drives his Austin Metro bus, and Bad Cat rides a hot-air balloon. Their forcefields and projectile hit areas follow their vehicles. Controls use solid contrasting label backgrounds in both themes.
