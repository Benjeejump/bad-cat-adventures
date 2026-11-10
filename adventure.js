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
    nextSpelling = 75 + Math.random() * 50,
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
      id: "pipeworks",
      title: "Metro scrambled the pipes!",
      text: "Help Dylan guide the flow safely under the floorboards.",
      choices: [],
    },
    {
      id: "spelling",
      title: "Bad Cat’s spelling bees!",
      text: "Crack the word code to escape.",
      choices: [],
    },
    {
      id: "kittens",
      title: "Twenty kittens just arrived!",
      text: "BC and Metro opened the kitten pipe! Choose a gadget, then tap each kitten to send it safely home. Can Dylan clear all 20 in 45 seconds?",
      icon: "kittens",
      choices: [],
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
          "Send the puppy squad",
          "puppy",
          "ally",
          "Giant Puppy distracts Bad Cat. Dylan grabs the booster while BC slips away to plot again!",
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
          "Ask Luna to guide it",
          "puppy",
          "ally",
          "Luna guides Dylan to a clear landing spot. Giant Puppy lands safely while Bad Cat grumbles!",
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
    const cinematic = window.badCatCinematics.art(which);
    if (cinematic) return cinematic;
    const houses =
      '<g class="scene-houses"><g transform="translate(100 230)"><path d="m0 0 55-45 55 45v90H0Z" fill="#f3c276"/><path d="m-10 0 65-55 65 55" fill="none" stroke="#b25e5f" stroke-width="15"/><path d="M45 90V45h30v45" fill="#518da2"/></g><g transform="translate(690 240) scale(.8)"><path d="m0 0 55-45 55 45v90H0Z" fill="#b3d7be"/><path d="m-10 0 65-55 65 55" fill="none" stroke="#557b90" stroke-width="15"/></g></g>';
    return `<div class="story-world ${which}"><svg viewBox="0 0 900 430" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="900" height="430" fill="#c3e1e4"/><circle cx="730" cy="78" r="40" fill="#fff0ac"/><path d="M0 290Q150 230 300 290T600 280T900 270V430H0Z" fill="#9abea5"/><path d="M0 410Q450 290 900 410" fill="none" stroke="#e8dfc6" stroke-width="95"/>${houses}</svg>${which === "vacuum" ? '<div class="vacuum-prop"><img class="vacuum-machine" src="assets/mega-vacuum.png" alt="Metro’s giant cartoon vacuum with a glowing treat tank"><span class="vacuum-suction" aria-hidden="true">✦ ✦ ✦</span></div>' : ""}<div class="scene-character">${which === "puppy" ? '<img src="assets/giant-puppy.png" alt="Giant Puppy falling from the sky">' : `<img src="assets/${which === "amy" ? "amy" : ["vacuum", "trap"].includes(which) ? "metro" : "bad-cat"}.${which === "amy" ? "svg" : "png"}" alt="${which === "amy" ? "Amy’s imaginary cameo" : ["vacuum", "trap"].includes(which) ? "M, Metro" : "BC, Bad Cat"}">`}</div><img class="scene-car" src="assets/odyssey.png" alt="White Honda Odyssey"><div class="scene-pipes"><i></i><i></i><span>BC + M · SECRET PIPE</span></div><div class="scene-puppies"><img src="assets/captain-biscuit.png" alt="Captain Biscuit"><img src="assets/luna.png" alt="Luna"><img src="assets/giant-puppy.png" alt="Giant Puppy"></div><div class="scene-magic">✦ 🫧 ✦ 🌈 ✦</div></div>`;
  }
  function open() {
    clearTimeout(autoCloseTimer);
    if (!dialog.open) dialog.showModal();
  }
  let autoCloseTimer = null;
  function scheduleReturn(ms = 3200) {
    clearTimeout(autoCloseTimer);
    autoCloseTimer = setTimeout(() => {
      if (dialog.open) close();
    }, ms);
  }
  function autoReturn(ms = 3200) {
    actions([]);
    scheduleReturn(ms);
  }
  function close() {
    clearTimeout(autoCloseTimer);
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
    if (kind === "tunnel") return false;
    if (dialog.open || launching || window.badCatSpelling.isOpen()) return;
    if (kind === "spelling") {
      window.badCatSpelling.open();
      return;
    }
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
    if (active.id === "pipeworks") {
      sequence++;
      active = null;
      window.badCatPipes.open();
      return;
    }
    if (active.id === "spelling") {
      sequence++;
      window.badCatSpelling.open();
      return;
    }
    sequence++;
    if (["trap", "heist"].includes(active.id)) setHazard(active.id);
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
    dialog.className = ["puppy", "tornado", "kittens"].includes(active?.id)
      ? "story-dialog cinematic-dialog"
      : "story-dialog";
    if (active.id === "puppy") {
      $("#encounter-title").textContent = "GIANT PUPPY IS FALLING!";
      $("#encounter-text").textContent =
        "Dylan, choose a landing plan! One of these plans will work. The other will go wrong…";
      const choices = window.badCatPuppyOptions.sample();
      actions(
        choices.map((option) => [
          option.name,
          () => {
            const world = $(".story-world");
            world.classList.add(
              "resolved",
              "puppy-decided",
              `puppy-${option.effect}`,
              option.success ? "puppy-success" : "puppy-failure",
            );
            world.insertAdjacentHTML(
              "beforeend",
              `<div class="puppy-prop prop-${option.effect}" aria-hidden="true">${window.badCatCinematics.prop(option.effect)}</div>`,
            );
            const delta = window.badCatCampaign.puppyOutcome(
              option.success,
              option.id,
            );
            $("#scene-eyebrow").textContent = option.success
              ? "PUPPY CAUGHT!"
              : "THE LANDING PLAN BACKFIRED";
            $("#encounter-title").textContent = option.success
              ? "Safe landing, Giant Puppy!"
              : "Oof! That didn’t work!";
            $("#encounter-text").textContent =
              (option.success ? option.good : option.bad) + " " + delta;
            hooks.story(option.success ? option.good : option.bad);
            hooks.sound(option.success ? "puppy" : "laser");
            autoReturn(3400);
          },
        ]),
      );
      open();
      hooks.sound("sonar");
      return;
    }
    if (active.id === "kittens") {
      $("#encounter-text").textContent =
        `Twenty kittens are drifting in forcefield bubbles! Choose a gadget, then tap each kitten. You have ${window.badCatCampaign.raidSeconds()} seconds. Escaped kittens damage the Odyssey and cost supplies.`;
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
      active.choices.map(([name, power, result, message], index) => [
        name + window.badCatCampaign.choiceLabel(active.id, index),
        () => {
          const world = $(".story-world");
          const consequence = window.badCatCampaign.choice(active.id, index);
          let worked = true;
          if (!consequence.bad) {
            if (["plane", "submarine"].includes(power)) {
              hooks.vehicle(power);
              clearHazard();
            } else worked = hooks.gadget(power) !== false;
          }
          const failed = consequence.bad || !worked;
          world.classList.add(
            "resolved",
            `result-${failed ? consequence.result || "mishap" : result}`,
          );
          $("#scene-eyebrow").textContent = failed
            ? "THAT DIDN’T GO TO PLAN"
            : "YOUR CHOICE HAS CONSEQUENCES";
          $("#encounter-title").textContent = failed
            ? "The cats got the upper paw!"
            : "Dylan changed the story!";
          const outcome =
            consequence.message ||
            (worked
              ? message
              : "The gadget fizzles. The crew must use another tool or repair in HQ. The cats keep their advantage.");
          $("#encounter-text").textContent = outcome;
          hooks.story(outcome);
          autoReturn(3200);
          hooks.sound("puppy");
        },
      ]),
    );
    open();
    hooks.sound("sonar");
  }
  const squidSVG =
    '<img class="windscreen-squid" src="assets/carwash-squid.png" alt="Friendly giant squid stuck to the windscreen">';
  function carwash() {
    if (dialog.open || launching || window.badCatSpelling.isOpen()) return;
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
        ]);
        scheduleReturn(4000);
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
    if (
      !pendingArrival ||
      window.badCatAdventure.isOpen() ||
      hooks.view() !== "drive"
    )
      return;
    pendingArrival = false;
    dialog.className = "arrival-dialog";
    $("#scene-stage").innerHTML =
      '<div class="arrival-art"><img class="arrival-squid" src="assets/carwash-squid.png" alt="Friendly squid"><img src="assets/odyssey.png" alt="White Honda Odyssey"></div>';
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
    if (kind === "tunnel") return;
    if (hooks.shielded()) {
      hooks.story(
        "Your forcefield bounces Metro’s mischief away. BC applauds!",
      );
      hooks.sound("shield");
      return;
    }
    hazard = kind;
    if (kind === "heist") window.badCatCombat?.stealBoosters();
    hazardSeconds = 35;
    let layer = $("#map-hazard");
    if (!layer) {
      layer = document.createElement("div");
      layer.id = "map-hazard";
      layer.className = "map-hazard";
      $("#map-stage").append(layer);
    }
    layer.innerHTML =
      kind === "trap"
        ? '<div class="hazard-bubble"></div><div class="hazard-label">Metro’s bubble trap!</div>'
        : '<div class="hazard-rocket">🚀</div><div class="hazard-label">Bad Cat borrowed the booster!</div>';
    hooks.story(
      kind === "trap"
        ? "Metro’s bubble cannon wobbles!"
        : "Bad Cat swiped the booster!",
    );
    hooks.sound("sonar");
  }
  function clearHazard(message) {
    if (!hazard) return;
    if (hazard === "heist") window.badCatCombat?.recoverBoosters();
    hazard = null;
    hazardSeconds = 0;
    $("#map-hazard")?.replaceChildren();
    document
      .querySelectorAll(".is-acting")
      .forEach((n) => n.classList.remove("is-acting"));
    if (message) hooks.story(message);
  }
  function onGadget(kind) {
    if (hazard === "trap" && ["bubble", "laser", "shield"].includes(kind))
      clearHazard("POP! Dylan freed the Odyssey from Metro’s bubble trap.");
    else if (hazard === "heist" && ["sonar", "puppy", "shield"].includes(kind))
      clearHazard(
        "BC returns the booster. The Odyssey is back to full imagination power!",
      );
  }
  function tick(dt) {
    if (!hooks) return;
    if (
      window.badCatHouse?.isOpen() ||
      window.badCatArsenal?.isOpen() ||
      window.badCatHandwriting?.isOpen() ||
      window.badCatPipes?.isOpen() ||
      window.badCatTargeting?.raidActive() ||
      window.badCatSpelling.isOpen()
    )
      return;
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
    }
    // Ambient games come from bee contact, bottle pickups and villain defeats.
  }
  dialog.addEventListener("close", () => {
    if (dialog.open) return;
    clearTimeout(autoCloseTimer);
    round = null;
    active = null;
    nextEvent = Math.max(nextEvent, 35);
  });
  $("#close-encounter").addEventListener("click", close);
  function raidResult(won, cleared) {
    dialog.className = "story-dialog cinematic-dialog";
    $("#scene-stage").innerHTML = window.badCatCinematics.kittenNet(
      won ? 20 : cleared,
      won,
    );
    $(".story-world").classList.add(
      "resolved",
      won ? "result-net-caught" : "result-mishap",
    );
    $("#scene-eyebrow").textContent = won
      ? "KITTEN MISSION COMPLETE"
      : "KITTENS ESCAPED · SETBACKS CARRY ON";
    $("#encounter-title").textContent = won
      ? "All 20 kittens are safely home!"
      : "The kittens got away with our supplies!";
    const consequence = window.badCatCampaign.raidResult(won, cleared);
    $("#encounter-text").textContent =
      (won ? "Dylan cleared all 20! " : `You cleared ${cleared} of 20. `) +
      consequence;
    actions([
      [
        "Play again",
        () => {
          close();
          window.badCatTargeting.startRaid();
        },
      ],
    ]);
    open();
    scheduleReturn(4000);
    hooks.sound("puppy");
    if (won) hooks.win(false);
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
        hooks.startJourney($("#launch-journey").value);
        $("#game-launch").classList.add("launch-finished");
        document.body.classList.remove("launching");
        setTimeout(() => {
          $("#game-launch").hidden = true;
          $("#carwash-launch").focus();
          window.badCatSpelling.resume();
        }, 450);
      };
      $("#launch-play").addEventListener("click", () => launch(true));
      $("#launch-silent").addEventListener("click", () => launch(false));
      $("#launch-skip").addEventListener("click", () => launch(false));
      $("#launch-play").focus();
      $("#game-launch").addEventListener("keydown", (event) => {
        if (event.key !== "Tab") return;
        const buttons = [
          $("#launch-journey"),
          $("#launch-play"),
          $("#launch-silent"),
          $("#launch-skip"),
        ];
        const i = buttons.indexOf(document.activeElement);
        if (event.shiftKey && i <= 0) {
          event.preventDefault();
          buttons.at(-1).focus();
        } else if (!event.shiftKey && i === buttons.length - 1) {
          event.preventDefault();
          buttons[0].focus();
        }
      });
    },
    encounter,
    parentExit: close,
    deferSpelling: () => {
      nextSpelling = 120 + Math.random() * 90;
      nextEvent = Math.max(nextEvent, 35);
    },
    enactPlan: (plan) => {
      if (window.badCatAdventure.isOpen()) return false;
      if (plan === "spelling") encounter("spelling");
      else setHazard(plan);
      return true;
    },
    raidResult,
    carwash,
    tick,
    onFix,
    resetLocationArrival: () => {
      pendingArrival = false;
      arrivalSince = null;
      arrivalDwell = 0;
      lastFixTime = 0;
      arrivalReceivedAt = 0;
      arrivalArmed = true;
    },
    onGadget,
    motionScale: () => (hazard ? 0.45 : 1),
    isOpen: () =>
      dialog.open ||
      !!window.badCatParents?.isOpen() ||
      launching ||
      !!window.badCatHouse?.isOpen() ||
      !!window.badCatArsenal?.isOpen() ||
      !!window.badCatHandwriting?.isOpen() ||
      !!window.badCatPipes?.isOpen() ||
      !!window.badCatTargeting?.raidActive() ||
      window.badCatSpelling.isOpen(),
    diagnostics: () => ({
      launching,
      round: round ? { ...round } : null,
      nextEventSeconds: Math.ceil(nextEvent),
      surprisePool: events
        .filter((e) => e.id !== lastEvent && e.id !== "puppybase")
        .map((e) => e.id),
      nextSpellingSeconds: Math.ceil(nextSpelling),
      arrivalArmed,
      siteConfigured: !!window.BAD_CAT_SITE?.coordinates,
      hazard,
    }),
  };
})();
