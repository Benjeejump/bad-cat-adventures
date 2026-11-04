/* Full-screen decisions, animated story results and the windscreen mini-game.
   Receives current GPS fixes only for a local, in-memory arrival check. */
"use strict";
(() => {
  const $ = (s) => document.querySelector(s);
  const dialog = $("#encounter-dialog");
  let launching = true;
  let hooks,
    active = null,
    sequence = 0,
    nextEvent = 45,
    round = null;
  let hazard = null,
    hazardSeconds = 0,
    actionCountdown = 18,
    lastEvent = null;
  let arrivalArmed = true,
    arrivalDwell = 0,
    lastFixTime = 0,
    pendingArrival = false,
    arrivalSince = null,
    arrivalReceivedAt = 0;
  const events = [
    {
      id: "kittens",
      title: "Twenty kittens just arrived!",
      text: "BC and Metro opened the kitten pipe! Choose a gadget, then tap each kitten to send it safely home. Can Dylan clear all 20 in 45 seconds?",
      icon: "kittens",
      choices: [],
    },
    {
      id: "tunnel",
      title: "BC and Metro found a secret pipe!",
      text: "They’ve ducked underground and are trying to pop up ahead of the Odyssey. Dylan, what’s the plan?",
      icon: "metro",
      choices: [
        [
          "Sonar: find their tunnel",
          "sonar",
          "scan",
          "PING! Their pretend pipe lights up. BC and M pop out, surprised that Dylan found them!",
        ],
        [
          "Fill the pipe with bubbles",
          "bubble",
          "pipe",
          "Bubbles WHOOSH through the pipe. Both cats slide out on a giant bubble raft!",
        ],
        [
          "Follow in submarine mode",
          "submarine",
          "submerge",
          "Dive! The Odyssey follows the pipe in submarine mode. Metro was hiding behind a tiny rubber duck.",
        ],
      ],
    },
    {
      id: "amy",
      title: "Wait… does Amy live THERE?!",
      text: "Dylan spots a very suspicious building. Could it be Amy’s newest imaginary house?",
      icon: "amy",
      choices: [
        [
          "Knock on the secret door",
          "sonar",
          "amy",
          "Knock knock! Amy pops out with a welcome mat. “Of course I live here… on Tuesdays!”",
        ],
        [
          "Send a puppy to investigate",
          "puppy",
          "rescue",
          "The puppies find Amy’s imaginary slippers and a biscuit tin. This must be her deluxe secret home!",
        ],
      ],
    },
    {
      id: "puppybase",
      title: "Welcome to Puppy Base!",
      text: "2000 Lakeline Boulevard: the puppies’ imagination-powered home base. What’s the mission, commander?",
      icon: "puppy",
      choices: [
        [
          "Launch the puppy squad",
          "puppy",
          "rescue",
          "Puppy Base doors open! Captain Biscuit, Luna and Giant Puppy zoom out to help the Odyssey.",
        ],
        [
          "Try the bubble training course",
          "bubble",
          "bounce",
          "The puppies bounce through a bubble obstacle course. Even Bad Cat has a go!",
        ],
      ],
    },
    {
      id: "trap",
      title: "Metro fired his bubble cannon!",
      text: "M has wrapped the Odyssey in a giant wobble bubble. Test Drive has slowed down! How will Dylan escape?",
      icon: "metro",
      choices: [
        [
          "Pop it with confetti",
          "laser",
          "rainbow",
          "ZAP! The trap pops into confetti. Metro’s cannon squirts him in the face!",
        ],
        [
          "Make a bigger bubble",
          "bubble",
          "bounce",
          "Your giant bubble gently lifts Metro’s trap off the Odyssey. Full speed ahead!",
        ],
      ],
    },
    {
      id: "heist",
      title: "Bad Cat borrowed our booster!",
      text: "BC has zipped away with the bubble booster. The Odyssey is cruising slowly until you get it back. What’s the plan?",
      icon: "badcat",
      choices: [
        [
          "Find it with sonar",
          "sonar",
          "scan",
          "PING! The booster was in Bad Cat’s hat. Dylan’s sonar finds it and BC returns it with a sheepish grin.",
        ],
        [
          "Offer a puppy friendship",
          "puppy",
          "ally",
          "Giant Puppy offers a friendship paw. Bad Cat brings back the booster and joins your crew!",
        ],
      ],
    },
    {
      id: "vacuum",
      title: "Metro switched on the MEGA VACUUM!",
      text: "It’s more powerful than a kitten tornado! The cartoon houses are floating away. Your move, Dylan.",
      icon: "🌪️",
      choices: [
        [
          "Shield the houses",
          "shield",
          "shield",
          "Cosy forcefields catch every house. Down they float, safe and sound!",
        ],
        [
          "Reverse the vacuum",
          "laser",
          "rainbow",
          "The vacuum sneezes a rainbow! Every house lands on a cushion of confetti.",
        ],
      ],
    },
    {
      id: "puppy",
      title: "Giant Puppy needs a landing spot!",
      text: "A giant puppy is bouncing towards the Odyssey. What’s the best way to catch a very good, very big dog?",
      icon: "🐶",
      choices: [
        [
          "Make a bubble trampoline",
          "bubble",
          "bounce",
          "BOING! Giant Puppy bounces into a soft bubble and gives everyone a slobbery thank-you.",
        ],
        [
          "Ask Bad Cat to guide it",
          "puppy",
          "ally",
          "Bad Cat becomes your co-pilot. Together, you guide Giant Puppy into a perfect fluffy landing!",
        ],
      ],
    },
    {
      id: "tornado",
      title: "A kitten tornado is on the way!",
      text: "Metro’s hat has blown into a spinning cloud of kittens. Can your crew bring it back?",
      icon: "🐈‍⬛",
      choices: [
        [
          "Fly above the kittens",
          "plane",
          "flight",
          "Waffle wings out! The white Odyssey soars over the kittens and catches Metro’s hat.",
        ],
        [
          "Send the puppy squad",
          "puppy",
          "rescue",
          "The puppy squad forms a wiggly ladder. One tiny kitten returns the hat. Teamwork!",
        ],
      ],
    },
    {
      id: "badcat",
      title: "Bad Cat has a mysterious button…",
      text: "“Trust me,” says Bad Cat. Metro says it probably makes waffles. What will Dylan choose?",
      icon: "🐈‍⬛",
      choices: [
        [
          "Press it together",
          "bubble",
          "rainbow",
          "Surprise! It rains tiny rainbow waffles. Bad Cat shares the biggest one with Dylan.",
        ],
        [
          "Scan it with sonar",
          "sonar",
          "scan",
          "PING! It’s a secret puppy beacon. A rescue puppy arrives wearing a detective hat!",
        ],
      ],
    },
  ];
  function art(which) {
    const houses =
      '<g class="scene-houses"><g transform="translate(100 230)"><path d="m0 0 55-45 55 45v90H0Z" fill="#f3c276"/><path d="m-10 0 65-55 65 55" fill="none" stroke="#b25e5f" stroke-width="15"/><path d="M45 90V45h30v45" fill="#518da2"/></g><g transform="translate(690 240) scale(.8)"><path d="m0 0 55-45 55 45v90H0Z" fill="#b3d7be"/><path d="m-10 0 65-55 65 55" fill="none" stroke="#557b90" stroke-width="15"/></g></g>';
    return `<div class="story-world ${which}"><svg viewBox="0 0 900 430" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="900" height="430" fill="#c3e1e4"/><circle cx="730" cy="78" r="40" fill="#fff0ac"/><path d="M0 290Q150 230 300 290T600 280T900 270V430H0Z" fill="#9abea5"/><path d="M0 410Q450 290 900 410" fill="none" stroke="#e8dfc6" stroke-width="95"/>${houses}<g class="vacuum-machine"><path d="M390 175h105l18 140H370Z" fill="#cf8b76" stroke="#314d60" stroke-width="7"/><path d="M405 175v-40q0-65 73-55t30 87" fill="none" stroke="#536f84" stroke-width="23"/><circle cx="395" cy="320" r="20" fill="#314d60"/><circle cx="490" cy="320" r="20" fill="#314d60"/><circle cx="437" cy="225" r="23" fill="#fce8ad"/><path d="m427 224 10 9 15-21" fill="none" stroke="#314d60" stroke-width="5"/></g></svg><div class="scene-character">${which === "puppy" ? "🐶" : `<img src="assets/${which === "amy" ? "amy" : ["vacuum", "trap"].includes(which) ? "metro" : "bad-cat"}.svg" alt="${which === "amy" ? "Amy’s imaginary cameo" : ["vacuum", "trap"].includes(which) ? "M, Metro" : "BC, Bad Cat"}">`}</div><img class="scene-car" src="assets/odyssey.svg" alt="White Honda Odyssey"><div class="scene-pipes"><i></i><i></i><span>BC + M · SECRET PIPE</span></div><div class="scene-puppies">🐶 🐕 🦮</div><div class="scene-magic">✦ 🫧 ✦ 🌈 ✦</div></div>`;
  }
  function open() {
    if (!dialog.open) dialog.showModal();
  }
  function close() {
    dialog.close();
  }
  function actions(choices) {
    $("#encounter-actions").replaceChildren();
    for (const [text, fn] of choices) {
      const b = document.createElement("button");
      b.textContent = text;
      b.addEventListener("click", fn);
      $("#encounter-actions").append(b);
    }
  }
  function encounter(kind) {
    if (dialog.open || launching) return;
    if (kind === "squid") {
      carwash();
      return;
    }
    const candidates = events.filter(
      (e) => e.id !== lastEvent && e.id !== "puppybase",
    );
    active =
      events.find((e) => e.id === kind) ||
      candidates[Math.floor(Math.random() * candidates.length)];
    lastEvent = active.id;
    sequence++;
    if (["trap", "heist", "tunnel"].includes(active.id)) setHazard(active.id);
    $("#scene-stage").innerHTML = art(active.id);
    if (active.id === "amy") {
      const homes = [
        ["🍔", "burger house"],
        ["⛪", "church-shaped hideout"],
        ["🗑️", "deluxe dumpster mansion"],
        ["🏢", "upside-down apartment"],
      ];
      const home = homes[Math.floor(Math.random() * homes.length)];
      $(".story-world").insertAdjacentHTML(
        "beforeend",
        `<div class="amy-home"><span>${home[0]}</span><b>AMY’S ${home[1].toUpperCase()}</b><small>100% imaginary. Very exclusive.</small></div>`,
      );
    }
    $("#scene-eyebrow").textContent = "UNEXPECTED HAPPENING · DYLAN DECIDES";
    $("#encounter-title").textContent = active.title;
    $("#encounter-text").textContent = active.text;
    dialog.className = "story-dialog";
    if (active.id === "kittens") {
      actions([
        [
          "Let’s clear those kittens!",
          () => {
            close();
            window.badCatTargeting.startRaid();
          },
        ],
        ["Not just now", close],
      ]);
      open();
      hooks.sound("sonar");
      return;
    }
    actions(
      active.choices.map(([name, power, result, message]) => [
        name,
        () => {
          const world = $(".story-world");
          world.classList.add("resolved", `result-${result}`);
          if (["plane", "submarine"].includes(power)) {
            hooks.vehicle(power);
            clearHazard();
          } else hooks.gadget(power);
          $("#scene-eyebrow").textContent = "YOUR IDEA CHANGED THE STORY";
          $("#encounter-title").textContent = "Nice thinking, Dylan!";
          $("#encounter-text").textContent = message;
          hooks.story(message);
          actions([["Back to our adventure →", close]]);
          hooks.sound("puppy");
        },
      ]),
    );
    open();
    hooks.sound("sonar");
  }
  const squidSVG = `<svg class="windscreen-squid" viewBox="0 0 700 500" aria-label="Friendly giant squid stuck to the windscreen"><g class="tentacles" fill="none" stroke="#bc6595" stroke-width="34" stroke-linecap="round"><path d="M240 270Q40 160 100 370T25 450"/><path d="M260 300Q80 330 180 450"/><path d="M300 305Q270 490 220 460"/><path d="M335 315Q350 480 310 480"/><path d="M370 315Q430 490 460 470"/><path d="M405 300Q600 400 530 465"/><path d="M440 275Q670 195 610 375T680 460"/><path d="M460 240Q570 100 660 250"/></g><g class="squid-body"><path d="M220 265Q195 175 350 45q155 130 130 220Q360 360 220 265Z" fill="#df91ba" stroke="#9c527e" stroke-width="5"/><path d="m230 220-80-35 75 83m245-48 80-35-75 83" fill="#bc6595"/><g fill="#fff"><ellipse cx="299" cy="231" rx="33" ry="41"/><ellipse cx="397" cy="231" rx="33" ry="41"/></g><g fill="#283e56"><ellipse cx="307" cy="238" rx="14" ry="21"/><ellipse cx="389" cy="238" rx="14" ry="21"/></g><path d="M324 282q25 24 49 0" fill="none" stroke="#8c426a" stroke-width="7" stroke-linecap="round"/><g fill="#f4c3d9"><circle cx="262" cy="272" r="13"/><circle cx="436" cy="272" r="13"/></g></g></svg>`;
  function carwash() {
    if (dialog.open || launching) return;
    round = { wipers: 0, bubbles: 0, boosters: 0, won: false };
    active = null;
    dialog.className = "carwash-dialog";
    $("#scene-stage").innerHTML =
      `<div class="windscreen"><div class="underwater-rays"></div><div class="sea-label">GO CAR WASH · IMAGINATION DIVE</div><div class="fish fish-one">🐟</div><div class="fish fish-two">🐠</div><div class="water-bubbles"></div>${squidSVG}<div class="soap-smears"><i></i><i></i><i></i><i></i></div><div class="windshield-frame"></div><div class="wiper wiper-left"></div><div class="wiper wiper-right"></div><div class="dashboard"><span>HONDA ODYSSEY</span><span>UNDERWATER MODE</span></div></div>`;
    $("#scene-eyebrow").textContent = "CAR WASH ADVENTURE · NO RUSH";
    $("#encounter-title").textContent = "There’s a squid on our windscreen!";
    $("#encounter-text").textContent =
      "Swipe a wiper, give it 3 bubbly tickles, then use the boosters to send it swimming. Nothing can hurt our crew.";
    actions([
      ["↔ Wipers", () => washAction("wipers")],
      ["🫧 Bubbles · 0/3", () => washAction("bubbles")],
      ["🚀 Boosters", () => washAction("boosters")],
    ]);
    $("#encounter-actions").children[0].id = "wash-wipers";
    $("#encounter-actions").children[1].id = "wash-bubbles";
    $("#encounter-actions").children[2].id = "wash-boosters";
    let start = null;
    const screen = $(".windscreen");
    screen.addEventListener("pointerdown", (e) => {
      start = { x: e.clientX, y: e.clientY };
      screen.setPointerCapture(e.pointerId);
    });
    screen.addEventListener("pointerup", (e) => {
      if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 35)
        washAction("wipers");
      start = null;
    });
    screen.addEventListener("pointercancel", () => (start = null));
    open();
    hooks.sound("sonar");
  }
  function animateAction(el, className) {
    el.classList.remove(className);
    void el.offsetWidth;
    el.classList.add(className);
  }
  function washAction(action) {
    if (!round || round.won) return;
    const screen = $(".windscreen");
    hooks.sound(
      action === "boosters"
        ? "laser"
        : action === "wipers"
          ? "sonar"
          : "bubble",
    );
    if (action === "wipers") {
      round.wipers++;
      screen.classList.add("clear-glass");
      animateAction(screen, "wiping");
      $("#wash-wipers").textContent = "↔ Wipers ✓";
      $("#encounter-text").textContent =
        "Nice sweep! Now tickle those suckers with three bubble bursts.";
    }
    if (action === "bubbles") {
      round.bubbles = Math.min(3, round.bubbles + 1);
      animateAction(screen, "bubbling");
      screen.style.setProperty("--squid-scale", 1 - round.bubbles * 0.07);
      $("#wash-bubbles").textContent = `🫧 Bubbles · ${round.bubbles}/3`;
      $("#encounter-text").textContent =
        round.bubbles < 3
          ? "The squid is giggling. More bubbly tickles!"
          : "Its tentacles are loose! Clear the glass with wipers, then boost away.";
    }
    if (action === "boosters") {
      round.boosters++;
      animateAction(screen, "boosting");
      if (round.wipers > 0 && round.bubbles === 3) {
        round.won = true;
        screen.classList.add("squid-free");
        $("#scene-eyebrow").textContent = "SQUID RESCUE COMPLETE";
        $("#encounter-title").textContent = "Clear windscreen. Happy squid!";
        $("#encounter-text").textContent =
          "WHOOSH! The squid swims away waving all eight arms. The white Odyssey is sparkling clean.";
        hooks.win();
        hooks.story(
          "Dylan freed the windscreen squid with wipers, bubbles and a super boost!",
        );
        actions([
          [
            "Play car wash again",
            () => {
              dialog.close();
              carwash();
            },
          ],
          ["Back to the map →", close],
        ]);
      } else {
        $("#encounter-text").textContent =
          "Whoosh! Still a little sticky. Try the wipers and three bubble bursts before the big escape.";
      }
    }
  }
  function onFix(point, accuracy, now = Date.now()) {
    const site = window.BAD_CAT_SITE;
    if (
      !site?.coordinates ||
      !Number.isFinite(accuracy) ||
      accuracy > site.maximumAccuracyMetres
    ) {
      arrivalDwell = 0;
      lastFixTime = 0;
      arrivalSince = null;
      return;
    }
    const distance = hooks.metres(point, site.coordinates);
    if (distance > site.exitRadiusMetres) {
      arrivalArmed = true;
      arrivalDwell = 0;
      lastFixTime = 0;
      arrivalSince = null;
      pendingArrival = false;
      return;
    }
    if (!arrivalArmed) return;
    if (distance <= site.arrivalRadiusMetres) {
      const gap = lastFixTime ? now - lastFixTime : 0;
      if (arrivalSince === null || gap > 20000) {
        arrivalSince = now;
        arrivalDwell = 0;
      } else arrivalDwell = Math.max(arrivalDwell, now - arrivalSince);
      lastFixTime = now;
      arrivalReceivedAt = Date.now();
      if (arrivalDwell >= 8000) {
        arrivalArmed = false;
        pendingArrival = true;
        offerArrival();
      }
    } else {
      arrivalDwell = 0;
      lastFixTime = 0;
      arrivalSince = null;
    }
  }
  function offerArrival() {
    if (!pendingArrival || launching || dialog.open || hooks.view() !== "drive")
      return;
    pendingArrival = false;
    dialog.className = "arrival-dialog";
    $("#scene-stage").innerHTML =
      '<div class="arrival-art">🦑<img src="assets/odyssey.svg" alt="White Honda Odyssey"></div>';
    $("#scene-eyebrow").textContent = "YOU’RE AT GO CAR WASH";
    $("#encounter-title").textContent = "Ready for the squid wash, Dylan?";
    $("#encounter-text").textContent =
      "We’re near GO Car Wash on Lakeline Boulevard. Turn the windscreen into an underwater adventure?";
    actions([
      [
        "Let’s play!",
        () => {
          close();
          carwash();
        },
      ],
      ["Maybe later", close],
    ]);
    open();
  }
  function setHazard(kind) {
    if (hooks.shielded()) {
      hooks.story(
        "Your forcefield bounces Metro’s mischief away. BC applauds!",
      );
      hooks.sound("shield");
      return;
    }
    hazard = kind;
    hazardSeconds = 35;
    let layer = $("#map-hazard");
    if (!layer) {
      layer = document.createElement("div");
      layer.id = "map-hazard";
      layer.className = "map-hazard";
      $("#map-stage").append(layer);
    }
    layer.innerHTML =
      kind === "tunnel"
        ? '<div class="pipe-mouth pipe-entry">BC ↓</div><div class="pipe-mouth pipe-exit">M ↑</div><div class="pipe-link"></div><div class="hazard-label">BC + M are using a pretend tunnel. Sonar can find them!</div>'
        : kind === "trap"
          ? '<div class="hazard-bubble"></div><div class="hazard-label">M fired a bubble trap! Try bubbles or confetti.</div>'
          : '<div class="hazard-rocket">🚀</div><div class="hazard-label">BC borrowed the booster! Try sonar or puppies.</div>';
    document
      .querySelectorAll(
        kind === "tunnel"
          ? ".enemy-icon,.actor.enemy-actor"
          : kind === "trap"
            ? ".metro-marker,#actor-metro"
            : ".badcat-marker,#actor-badcat",
      )
      .forEach((n) => n.classList.add("is-acting"));
    hooks.story(
      kind === "tunnel"
        ? "BC and Metro duck into a pipe! Their pretend tunnel is heading under the Odyssey. Try sonar, bubbles or a forcefield."
        : kind === "trap"
          ? "Metro fires his bubble cannon! The Odyssey slows to a gentle wobble. Bubbles, confetti or a shield can help."
          : "Bad Cat swipes the booster! Cruise gently while sonar or puppies bring it back.",
    );
    hooks.sound("sonar");
  }
  function clearHazard(message) {
    if (!hazard) return;
    hazard = null;
    hazardSeconds = 0;
    $("#map-hazard")?.replaceChildren();
    document
      .querySelectorAll(".is-acting")
      .forEach((n) => n.classList.remove("is-acting"));
    if (message) hooks.story(message);
  }
  function onGadget(kind) {
    if (hazard === "tunnel" && ["sonar", "bubble", "shield"].includes(kind))
      clearHazard(
        "Dylan found their secret pipe! BC and M pop out in a cloud of bubbles.",
      );
    else if (hazard === "trap" && ["bubble", "laser", "shield"].includes(kind))
      clearHazard("POP! Dylan freed the Odyssey from Metro’s bubble trap.");
    else if (hazard === "heist" && ["sonar", "puppy", "shield"].includes(kind))
      clearHazard(
        "BC returns the booster. The Odyssey is back to full imagination power!",
      );
  }
  function tick(dt) {
    if (!hooks) return;
    if (window.badCatTargeting?.raidActive()) return;
    if (
      arrivalArmed &&
      arrivalSince !== null &&
      Date.now() - arrivalReceivedAt < 20000
    ) {
      arrivalDwell += dt * 1000;
      if (arrivalDwell >= 8000) {
        arrivalArmed = false;
        pendingArrival = true;
      }
    }
    offerArrival();
    if (
      launching ||
      dialog.open ||
      document.hidden ||
      hooks.view() !== "drive" ||
      hooks.paused()
    )
      return;
    if (hazard) {
      hazardSeconds -= dt;
      if (hazardSeconds <= 0)
        clearHazard("The cats get distracted by a biscuit. Full speed ahead!");
    } else {
      actionCountdown -= dt;
      if (actionCountdown <= 0) {
        actionCountdown = 32 + Math.random() * 15;
        setHazard(["trap", "heist", "tunnel"][Math.floor(Math.random() * 3)]);
      }
    }
    nextEvent -= dt;
    if (nextEvent <= 0) {
      nextEvent = 55 + Math.random() * 35;
      encounter();
    }
  }
  dialog.addEventListener("close", () => {
    if (dialog.open) return;
    round = null;
    active = null;
    nextEvent = Math.max(nextEvent, 35);
  });
  $("#close-encounter").addEventListener("click", close);
  function raidResult(won, cleared) {
    dialog.className = "story-dialog";
    $("#scene-stage").innerHTML = art("puppy");
    $(".story-world").classList.add("resolved", "result-rescue");
    $("#scene-eyebrow").textContent = won
      ? "KITTEN MISSION COMPLETE"
      : "PUPPY RESCUE TO THE RESCUE";
    $("#encounter-title").textContent = won
      ? "All 20 kittens are safely home!"
      : "The puppies scoop up the last kittens!";
    $("#encounter-text").textContent = won
      ? "Dylan did it! BC is impressed. Metro is pretending he meant this to happen."
      : `You sent ${cleared} kittens home. The puppy squad helps with the rest. Fancy another round?`;
    actions([
      [
        "Play again",
        () => {
          close();
          window.badCatTargeting.startRaid();
        },
      ],
      ["Back to the map →", close],
    ]);
    open();
    hooks.sound("puppy");
    if (won) hooks.win();
  }
  window.badCatAdventure = {
    init(h) {
      hooks = h;
      $("#carwash-launch").addEventListener("click", carwash);
      document
        .querySelectorAll(".topbar,main")
        .forEach((node) => (node.inert = true));
      const launch = (soundOn) => {
        if (!launching) return;
        launching = false;
        document
          .querySelectorAll(".topbar,main")
          .forEach((node) => (node.inert = false));
        if (soundOn) hooks.startSound();
        $("#game-launch").classList.add("launch-finished");
        document.body.classList.remove("launching");
        setTimeout(() => {
          $("#game-launch").hidden = true;
          $("#carwash-launch").focus();
        }, 450);
      };
      $("#launch-play").addEventListener("click", () => launch(true));
      $("#launch-silent").addEventListener("click", () => launch(false));
      $("#launch-skip").addEventListener("click", () => launch(false));
      $("#launch-play").focus();
      $("#game-launch").addEventListener("keydown", (event) => {
        if (event.key !== "Tab") return;
        const buttons = [
          $("#launch-play"),
          $("#launch-silent"),
          $("#launch-skip"),
        ];
        const i = buttons.indexOf(document.activeElement);
        if (event.shiftKey && i <= 0) {
          event.preventDefault();
          buttons[2].focus();
        } else if (!event.shiftKey && i === 2) {
          event.preventDefault();
          buttons[0].focus();
        }
      });
    },
    encounter,
    raidResult,
    carwash,
    tick,
    onFix,
    onGadget,
    tunnelState: () =>
      hazard === "tunnel"
        ? {
            hidden: hazardSeconds < 33 && hazardSeconds > 28,
            exiting: hazardSeconds <= 28,
          }
        : null,
    motionScale: () => (hazard ? 0.45 : 1),
    isOpen: () =>
      dialog.open || launching || !!window.badCatTargeting?.raidActive(),
    diagnostics: () => ({
      launching,
      round: round ? { ...round } : null,
      nextEventSeconds: Math.ceil(nextEvent),
      arrivalArmed,
      siteConfigured: !!window.BAD_CAT_SITE?.coordinates,
      hazard,
    }),
  };
})();
