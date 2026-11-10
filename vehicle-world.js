/* Fictional flight and sea worlds. GPS keeps running, road-map panning does not. */
"use strict";
(() => {
  let hooks,
    mode = "car",
    hazard = null,
    hazardTime = 0,
    stability = 100,
    protectedFor = 0,
    nextHazard = 14,
    announcement = "",
    speechSerial = 0;
  const planeFollowups = [
    "We hope you are safely buckled in your seats. This could be a bumpy ride.",
    "Captain Biscuit has checked the wings. Please keep all paws inside the aircraft.",
    "Today’s in-flight snack is imaginary waffles. Metro has not been allowed near the engine.",
    "Your captain is Dylan. The seatbelt sign is on because Bad Cat has borrowed a cloud.",
    "Please stow your biscuits under the seat in front of you. Puppy turbulence is expected.",
  ];
  const titles = {
    plane: "DOGGY PLANE · FLIGHT DECK",
    submarine: "ODYSSEY · UNDERSEA DECK",
  };
  function speak(explicit = false) {
    if (
      !announcement ||
      !window.speechSynthesis ||
      !window.SpeechSynthesisUtterance ||
      (!explicit && !hooks.canSpeak())
    )
      return;
    const serial = ++speechSerial;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(announcement);
    utterance.lang = "en-US";
    utterance.rate = 0.88;
    utterance.volume = 0.85;
    const voices = speechSynthesis.getVoices();
    utterance.voice =
      voices.find((v) => /^en-US/i.test(v.lang) && v.localService) ||
      voices.find((v) => /^en-US/i.test(v.lang)) ||
      null;
    utterance.onerror = () => {};
    if (serial === speechSerial) speechSynthesis.speak(utterance);
  }
  function render() {
    const root = document.querySelector("#vehicle-world");
    if (!root) return;
    root.hidden = ["car", "walking"].includes(mode);
    const transient = [...root.classList].filter((c) =>
      ["world-wiping", "world-pinging"].includes(c),
    );
    root.className = `vehicle-world ${mode}-world${hazard ? " world-hazard-" + hazard : ""}${protectedFor > 0 ? " world-protected" : ""}`;
    transient.forEach((c) => root.classList.add(c));
    document.body.classList.toggle("mode-plane", mode === "plane");
    document.body.classList.toggle("mode-submarine", mode === "submarine");
    if (["car", "walking"].includes(mode)) return;
    document.querySelector("#world-title").textContent =
      window.badCatSeason.active()
        ? mode === "plane"
          ? "SANTA’S DOGGY PLANE"
          : "NORTH POLE UNDER-ICE SUB"
        : titles[mode];
    document.querySelector("#world-stability").textContent =
      `${mode === "plane" ? "Flight" : "Dive"} stability ${stability}%`;
    document.querySelector("#world-status").textContent = hazard
      ? {
          turbulence:
            "Kitten turbulence! Stabilise the plane or switch on the cloud shield.",
          storm: "Metro made a storm cloud! Shield the plane before boosting.",
          ink: "Squid ink on the viewing glass! Use the wipers.",
          current:
            "A strong current caught the sub! Sonar finds a route; bubble jets can escape.",
        }[hazard]
      : mode === "plane"
        ? "Clouds ahead. Captain Dylan has the controls."
        : "Clear water. Watch for squid ink and changing currents.";
    document.querySelector("#world-announcement").textContent = announcement;
    const tools = document.querySelectorAll("[data-world-tool]");
    const labels =
      mode === "plane"
        ? ["◈ Cloud shield", "Puppy autopilot", "ϟ Waffle boost"]
        : ["↔ Wipers", "◎ Sonar", "🫧 Bubble jets"];
    if (window.badCatSeason.active())
      labels.splice(
        0,
        3,
        ...(mode === "plane"
          ? ["❄ Snow shield", "🦌 Reindeer autopilot", "🎁 Sleigh boost"]
          : ["↔ Ice wipers", "🔔 Iceberg sonar", "🍭 Peppermint jets"]),
      );
    tools.forEach((b, i) => {
      b.textContent = labels[i];
      if (mode === "plane" && i === 1) {
        const img = document.createElement("img");
        img.className = "crew-inline";
        img.src = "assets/captain-biscuit.png";
        img.alt = "";
        b.prepend(img);
      }
    });
    document.querySelector("#world-vehicle").src = window.badCatSeason.asset(
      mode === "plane" ? "assets/doggy-plane.png" : "assets/family-sub.png",
    );
    document.querySelector("#world-vehicle").alt =
      mode === "plane"
        ? "Doggy Plane flying through the clouds"
        : "Odyssey submarine beneath the sea";
  }
  function change(type, announce = true) {
    if (type === mode) {
      render();
      return;
    }
    speechSerial++;
    window.speechSynthesis?.cancel();
    mode = type;
    hazard = null;
    stability = 100;
    hazardTime = 0;
    protectedFor = 0;
    nextHazard = 14;
    announcement =
      type === "plane"
        ? `Welcome aboard this Honda Odyssey flight. ${planeFollowups[Math.floor(Math.random() * planeFollowups.length)]}`
        : type === "submarine"
          ? "Dive crew ready. Captain Dylan, sonar is listening. Watch out for Metro’s pipes and that very large squid."
          : "";
    render();
    if (announce && !["car", "walking"].includes(mode)) speak();
    hooks.changed(type);
  }
  function clearHazard(message) {
    hazard = null;
    hazardTime = 0;
    nextHazard = 18 + Math.random() * 14;
    stability = Math.min(100, stability + 15);
    hooks.say(message);
    render();
  }
  function useTool(index) {
    if (mode === "plane") {
      if (index === 0) {
        if (window.badCatCampaign.use("shield")) {
          protectedFor = 12 + window.badCatLoot.level("shield") * 5;
          clearHazard(
            "Cloud shield up! The Doggy Plane bounces gently through the trouble.",
          );
          hooks.sound("shield");
        }
      }
      if (index === 1) {
        if (window.badCatCampaign.use("puppy")) {
          stability = Math.min(100, stability + 25);
          clearHazard(
            "Captain Biscuit levels the wings. One treat well spent!",
          );
          hooks.sound("puppy");
        }
      }
      if (index === 2) {
        hooks.sound("laser");
        if (hazard === "storm" && protectedFor <= 0) {
          stability = Math.max(20, stability - 15);
          window.badCatCampaign.awardTreats(-1);
          hooks.say(
            "Too much waffle boost inside a storm! A bumpy ride costs one treat. Try the cloud shield.",
          );
        } else
          clearHazard(
            "Waffle boost! The Doggy Plane zooms out of the kitten cloud.",
          );
      }
    } else if (mode === "submarine") {
      if (index === 0) {
        document
          .querySelector("#vehicle-world")
          .classList.remove("world-wiping");
        void document.querySelector("#vehicle-world").offsetWidth;
        document.querySelector("#vehicle-world").classList.add("world-wiping");
        hooks.sound("bubble");
        if (hazard === "ink")
          clearHazard("Wipers sweep the ink away. The viewing glass is clear!");
        else hooks.say("The submarine’s viewing glass is sparkling.");
      }
      if (index === 1) {
        if (window.badCatCampaign.use("sonar")) {
          clearHazard("PING! Sonar finds a safe channel through the current.");
          document
            .querySelector("#vehicle-world")
            .classList.remove("world-pinging");
          void document.querySelector("#vehicle-world").offsetWidth;
          document
            .querySelector("#vehicle-world")
            .classList.add("world-pinging");
          hooks.sound("sonar");
        }
      }
      if (index === 2) {
        if (window.badCatCampaign.use("bubble")) {
          clearHazard(
            "Bubble jets push the submarine clear of the swirling water.",
          );
          hooks.sound("bubble");
        }
      }
    }
    render();
  }
  function tick(dt) {
    if (["car", "walking"].includes(mode) || !hooks.active()) return;
    protectedFor = Math.max(0, protectedFor - dt);
    nextHazard -= dt;
    if (!hazard && nextHazard <= 0) {
      hazard =
        mode === "plane"
          ? Math.random() < 0.5
            ? "turbulence"
            : "storm"
          : Math.random() < 0.5
            ? "ink"
            : "current";
      hazardTime = 0;
      render();
    }
    if (hazard) {
      hazardTime += dt;
      if (protectedFor > 0) {
        clearHazard("The protective field kept the crew safe.");
        return;
      }
      if (hazardTime > 8) {
        hazardTime = 0;
        stability = Math.max(20, stability - 10);
        window.badCatCampaign.awardTreats(-1);
        hooks.say(
          `${mode === "plane" ? "The bumpy cloud shakes loose" : "The current sweeps away"} one puppy treat. Use the ${mode === "plane" ? "flight" : "dive"} tools to steady the crew.`,
        );
        render();
      }
    }
  }
  function reactToHit(key) {
    if (["car", "walking"].includes(mode)) return;
    const node = document.querySelector(`.world-${key}`);
    node.classList.remove("world-enemy-hit");
    void node.offsetWidth;
    node.classList.add("world-enemy-hit");
    setTimeout(() => node.classList.remove("world-enemy-hit"), 2500);
  }
  function init(h) {
    hooks = h;
    const root = document.createElement("div");
    root.id = "vehicle-world";
    root.hidden = true;
    root.innerHTML = `<div class="world-scenery"><div class="world-cloud-stream">${Array.from({ length: 8 }, (_, i) => `<i style="--cloud-x:${i * 17 - 10}%;--cloud-delay:-${i * 2.1}s"></i>`).join("")}</div><div class="sea-rays"></div><div class="sea-floor"></div><div class="sea-fish fish-one">🐟</div><div class="sea-fish fish-two">🐠</div><div class="sea-ink"></div><div class="world-storm"></div></div><div class="world-heading"><b id="world-title"></b><span id="world-stability"></span></div><img id="world-vehicle" class="world-family-vehicle" alt=""><div class="world-enemy world-badcat"><img src="assets/bad-cat-balloon.png" alt="Bad Cat riding his hot-air balloon"><span>BC</span></div><div class="world-enemy world-metro"><img src="assets/metro-bus.png" alt="Metro driving his Austin city bus"><span>M</span></div><button class="world-enemy world-captain" aria-label="Target Captain Squirrel"><img src="assets/captain-squirrel.png" alt="Captain Squirrel"><span>C</span></button><div class="sub-wiper"></div><div class="sub-wiper sub-wiper-right"></div><div class="world-sonar"></div><div class="world-controls"><p id="world-status" role="status"></p><div><button data-world-tool="0"></button><button data-world-tool="1"></button><button data-world-tool="2"></button></div><details><summary>Captain’s announcement <button id="repeat-flight" aria-label="Repeat the captain’s announcement">♪</button></summary><p id="world-announcement"></p></details></div>`;
    document.querySelector("#map-stage").append(root);
    root
      .querySelectorAll("[data-world-tool]")
      .forEach((b) =>
        b.addEventListener("click", () => useTool(Number(b.dataset.worldTool))),
      );
    document.querySelector("#repeat-flight").addEventListener("click", (e) => {
      e.preventDefault();
      speak(true);
    });
    for (const key of ["badcat", "metro", "captain"])
      root
        .querySelector(`.world-${key}`)
        .addEventListener("click", () =>
          window.badCatTargeting.target(
            key,
            root.querySelector(`.world-${key}`),
          ),
        );
    render();
  }
  window.badCatVehicle = {
    init,
    change,
    tick,
    reactToHit,
    worldActive: () => !["car", "walking"].includes(mode),
    mode: () => mode,
    diagnostics: () => ({
      mode,
      hazard,
      stability,
      protectedFor,
      announcement,
    }),
  };
})();
