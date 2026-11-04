"use strict";
(() => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const STORAGE_KEY = "bad-cat-progress-v1";
  const defaults = {
    inventions: [],
    equipment: "Bubble boost",
    vehicle: "car",
    puppies: 0,
    squidWins: 0,
    gadgets: 0,
    missions: 0,
    volume: 35,
  };
  let saved = {};
  let storageAvailable = true;
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
  } catch {
    storageAvailable = false;
  }
  const powers = ["bubble", "shield", "puppy", "laser"];
  const equipment = ["Bubble boost", "Waffle wings", "Super snorkel"];
  const progress = {
    ...defaults,
    inventions: Array.isArray(saved.inventions)
      ? saved.inventions
          .filter(
            (i) => i && typeof i.name === "string" && powers.includes(i.power),
          )
          .slice(0, 20)
          .map((i) => ({ name: i.name.slice(0, 40), power: i.power }))
      : [],
  };
  if (equipment.includes(saved.equipment)) progress.equipment = saved.equipment;
  if (["car", "plane", "submarine"].includes(saved.vehicle))
    progress.vehicle = saved.vehicle;
  for (const key of ["puppies", "squidWins", "gadgets", "missions"])
    if (Number.isSafeInteger(saved[key]) && saved[key] >= 0)
      progress[key] = saved[key];
  if (Number.isFinite(saved.volume))
    progress.volume = Math.max(0, Math.min(100, saved.volume));
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      storageAvailable = false;
    }
    $("#save-status").textContent = storageAvailable
      ? "Progress stays on this device. ✓"
      : "Storage unavailable — progress lasts for this visit.";
  }
  let toastTimer;
  function toast(message) {
    $("#toast").textContent = message;
    $("#toast").classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(
      () => $("#toast").classList.remove("visible"),
      4200,
    );
  }
  function story(message) {
    $("#story").textContent = message;
  }
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const state = {
    mode: "waiting",
    paused: false,
    follow: true,
    speed: 1,
    elapsed: 0,
    distance: 0,
    car: [0, 0],
    badcat: [0, 0],
    metro: [0, 0],
    locationRequest: 0,
    shieldUntil: 0,
    retreatUntil: 0,
    allyUntil: 0,
    view: "drive",
    watch: null,
    gpsStarting: false,
    lastGPS: null,
    encounter: 0,
    ticks: 0,
  };
  // Location sources only provide the current fix to this sink. A future private phone source can
  // implement start(onFix, onError)/stop without changing the map or game. No history is retained.
  const browserLocation = {
    start(onFix, onError) {
      this.stop();
      state.watch = navigator.geolocation.watchPosition(onFix, onError, {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 5000,
      });
    },
    stop() {
      if (state.watch !== null && navigator.geolocation)
        navigator.geolocation.clearWatch(state.watch);
      state.watch = null;
    },
  };
  const route = [
    [52.1995, 0.1198],
    [52.2005, 0.1195],
    [52.2018, 0.1188],
    [52.203, 0.1182],
    [52.2041, 0.1176],
    [52.205, 0.117],
    [52.2058, 0.1164],
    [52.2063, 0.1178],
    [52.2068, 0.1196],
    [52.2075, 0.1213],
    [52.2078, 0.123],
    [52.2072, 0.1243],
    [52.2063, 0.1252],
    [52.205, 0.1257],
    [52.2037, 0.1258],
    [52.2025, 0.1257],
    [52.2014, 0.1245],
    [52.2006, 0.1232],
    [52.1999, 0.1217],
    [52.1995, 0.1198],
  ];
  function routePoint(t) {
    const p = (((t % 1) + 1) % 1) * (route.length - 1);
    const i = Math.floor(p);
    const f = p - i;
    return [
      route[i][0] + (route[i + 1][0] - route[i][0]) * f,
      route[i][1] + (route[i + 1][1] - route[i][1]) * f,
    ];
  }
  function metres(a, b) {
    const rad = Math.PI / 180;
    const dLat = (b[0] - a[0]) * rad,
      dLon = (b[1] - a[1]) * rad;
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dLon / 2) ** 2;
    return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }
  let map,
    markers = {},
    tileLoaded = false;
  function initFallback() {
    for (const [key, emoji, label] of [
      ["car", "", "White Honda Odyssey"],
      ["badcat", "🐈‍⬛", "Bad Cat"],
      ["metro", "🐱", "Metro"],
    ]) {
      const node = document.createElement("div");
      node.className = `actor ${key === "car" ? "car-actor" : "enemy-actor"}`;
      node.id = `actor-${key}`;
      node.innerHTML =
        key === "car"
          ? ""
          : `<img src="assets/${key === "badcat" ? "bad-cat" : "metro"}.svg" alt="${key === "badcat" ? "BC, Bad Cat" : "M, Metro"}">`;
      node.setAttribute("aria-label", label);
      if (key !== "car") {
        node.setAttribute("role", "button");
        node.tabIndex = 0;
        const act = () => window.badCatTargeting.target(key, node);
        node.addEventListener("click", act);
        node.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            act();
          }
        });
      }
      $("#fallback-actors").append(node);
    }
  }
  function mapNotice(text) {
    $("#map-notice").textContent = text;
    $("#map-notice").classList.toggle("hidden", !text);
  }
  function loadMap() {
    // Pinned, locally bundled Leaflet. Only road tiles require an external request.
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "assets/leaflet/leaflet.css";
    document.head.append(css);
    const script = document.createElement("script");
    script.src = "assets/leaflet/leaflet.js";
    script.onload = async () => {
      await window.badCatGameMap.prepare();
      initMap();
    };
    script.onerror = () =>
      mapNotice(
        "Road map unavailable. Enjoy the fictional imagination map, or play offline in Mission HQ.",
      );
    document.head.append(script);
  }
  function initMap() {
    if (!window.L) return;
    map = L.map("map", {
      zoomControl: false,
      attributionControl: true,
      maxZoom: 21,
    }).setView(state.car, 20);
    L.control.zoom({ position: "bottomleft" }).addTo(map);
    window.badCatLoot.attachMap(map);
    if (["gps", "test"].includes(state.mode)) startGameMap();
    const icon = (emoji, extra = "") =>
      L.divIcon({
        className: `leaflet-actor ${extra}`,
        html: `<div>${emoji}</div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });
    markers.car = L.marker(state.car, {
      icon: icon("🚙"),
      title: "Your crew",
      keyboard: true,
    }).addTo(map);
    markers.badcat = L.marker(state.badcat, {
      icon: icon(
        '<img src="assets/bad-cat.svg" alt="BC, Bad Cat">',
        "enemy-icon badcat-marker",
      ),
      title: "Bad Cat · fictional character",
    }).addTo(map);
    markers.metro = L.marker(state.metro, {
      icon: icon(
        '<img src="assets/metro.svg" alt="M, Metro">',
        "enemy-icon metro-marker",
      ),
      title: "Metro · fictional character",
    }).addTo(map);
    markers.badcat.on("click", () =>
      window.badCatTargeting.target("badcat", markers.badcat.getElement()),
    );
    markers.metro.on("click", () =>
      window.badCatTargeting.target("metro", markers.metro.getElement()),
    );
    const siteMarkers = new Map();
    let resolvingSites = false,
      lastSiteAttempt = 0;
    const placeSites = async () => {
      if (resolvingSites || Date.now() - lastSiteAttempt < 15000) return;
      resolvingSites = true;
      lastSiteAttempt = Date.now();
      try {
        // Sequential requests respect the public geocoder's one-request-per-second limit.
        for (const site of window.BAD_CAT_SITES) {
          if (siteMarkers.has(site.id)) continue;
          const coordinates = await window.resolveBadCatSite(site);
          if (coordinates) {
            const marker = L.marker(coordinates, {
              icon: icon(site.id === "carwash" ? "🦑" : "🐾", "carwash-pin"),
              title: `${site.name} · ${site.address}`,
            })
              .addTo(map)
              .bindTooltip(`${site.name} · ${site.address}`)
              .on("click", () =>
                site.id === "carwash"
                  ? window.badCatAdventure.carwash()
                  : encounter("puppybase"),
              );
            siteMarkers.set(site.id, marker);
          }
          await new Promise((resolve) => setTimeout(resolve, 1100));
        }
      } finally {
        resolvingSites = false;
        $("#place-status").textContent =
          siteMarkers.size === 2
            ? "GO Car Wash + Puppy Base: fixed Lakeline pins ready."
            : "Place lookup needs a connection. The car wash button always works.";
        $("#retry-places").hidden = siteMarkers.size === 2;
      }
    };
    placeSites();
    window.addEventListener("online", placeSites);
    $("#retry-places").addEventListener("click", placeSites);
    map.on("dragstart", () => {
      state.follow = false;
      updateFollow();
    });
    setVehicle(progress.vehicle, false);
    if (state.view === "hq") setTimeout(() => map.invalidateSize(), 0);
  }
  function startGameMap() {
    if (!map) return;
    window.badCatGameMap.mount(map, {
      ready: () => {
        tileLoaded = true;
        $("#map-stage").classList.add("has-map");
        $("#map-stage").classList.remove("no-tiles");
        mapNotice("");
      },
      unavailable: (message) => {
        tileLoaded = false;
        $("#map-stage").classList.add("no-tiles");
        mapNotice(message);
      },
    });
  }
  function locationGate(show, title, message) {
    $("#location-gate").hidden = !show;
    $("#map-stage").classList.toggle("awaiting-location", show);
    if (title) $("#gps-gate-title").textContent = title;
    if (message) $("#gps-gate-message").textContent = message;
  }
  function locationUnavailable(message, keepWatching = false) {
    if (!keepWatching) browserLocation.stop();
    state.mode = keepWatching ? "locating" : "unavailable";
    state.gpsStarting = keepWatching;
    $("#pause").disabled = true;
    $("#speed").disabled = true;
    $("#test-drive").classList.remove("selected");
    $("#gps").classList.remove("selected");
    $("#source-badge").textContent = "GPS UNAVAILABLE";
    $("#gps").textContent = "⌖ Retry GPS";
    $("#accuracy").textContent = message;
    locationGate(
      true,
      "GPS needs a little help",
      message + " Retry GPS, visit HQ, or explicitly choose Test Drive.",
    );
    story(message);
  }
  function updateFollow() {
    $("#follow").textContent = state.follow
      ? "⌖ Following car"
      : "⌖ Follow car";
    $("#follow").setAttribute("aria-pressed", state.follow);
  }
  function updateActors() {
    const c = state.car;
    for (const key of ["car", "badcat", "metro"]) {
      if (markers[key]) markers[key].setLatLng(state[key]);
      const node = $(`#actor-${key}`);
      const point = state[key];
      // Fictional terrain projects the simulation route; GPS fallback centres the crew.
      const x =
        state.mode === "test"
          ? 25 + ((point[1] - 0.1164) / 0.0094) * 50
          : 50 + (point[1] - c[1]) * 5000;
      const y =
        state.mode === "test"
          ? 78 - ((point[0] - 52.1995) / 0.0083) * 50
          : 50 - (point[0] - c[0]) * 8000;
      node.style.left = `${x}%`;
      node.style.top = `${y}%`;
      if (key === "car" && !tileLoaded) {
        $("#map-stage").style.setProperty("--car-x", `${x}%`);
        $("#map-stage").style.setProperty("--car-y", `${y}%`);
      }
    }
    if (map && state.follow && state.view === "drive")
      map.panTo(c, { animate: false });
    if (map && tileLoaded) {
      const p = map.latLngToContainerPoint(c);
      $("#map-stage").style.setProperty("--car-x", `${p.x}px`);
      $("#map-stage").style.setProperty("--car-y", `${p.y}px`);
    }
    const d1 = Math.round(metres(c, state.badcat)),
      d2 = Math.round(metres(c, state.metro));
    $("#badcat-distance").textContent = `${d1} m`;
    $("#metro-distance").textContent = `${d2} m`;
    const ally = Date.now() < state.allyUntil;
    $("#badcat-mood").textContent = ally
      ? "Your unexpected ally!"
      : d1 < 100
        ? "Getting very curious…"
        : "Plotting something…";
    $("#proximity").textContent =
      Date.now() < state.retreatUntil
        ? "✦ The cats are taking a playful detour!"
        : Math.min(d1, d2) < 100
          ? "⚠ Cats nearby! Pick a gadget, commander."
          : "◎ Scanning… mischief on the horizon.";
    $("#distance").textContent =
      `${(state.distance / 1000).toFixed(2)} km explored`;
  }
  function tick(dt) {
    window.badCatTargeting.tick(dt);
    window.badCatAdventure.tick(dt);
    if (
      state.mode === "test" &&
      !state.paused &&
      !window.badCatAdventure.isOpen()
    ) {
      const prev = state.car;
      state.elapsed +=
        dt *
        state.speed *
        window.badCatAdventure.motionScale() *
        window.badCatCampaign.motionScale();
      state.car = routePoint(state.elapsed / 200);
      state.distance += metres(prev, state.car);
    }
    if (!state.paused || state.mode === "gps") {
      const t = state.elapsed / 200;
      const retreat = Date.now() < state.retreatUntil;
      if (state.mode === "test") {
        // Vary signed route offsets so cats approach, overtake and retreat.
        state.badcat = routePoint(
          t + Math.sin(state.elapsed / 13) * 0.06 - (retreat ? 0.1 : 0.05),
        );
        state.metro = routePoint(
          t + Math.cos(state.elapsed / 17) * 0.06 - (retreat ? 0.14 : 0.12),
        );
      } else {
        const r = retreat ? 0.0009 : 0.00022;
        state.ticks += dt;
        state.badcat = [
          state.car[0] + Math.sin(state.ticks / 12) * r,
          state.car[1] + Math.cos(state.ticks / 12) * r,
        ];
        state.metro = [
          state.car[0] + Math.cos(state.ticks / 14) * r * 1.3,
          state.car[1] - Math.sin(state.ticks / 14) * r * 1.3,
        ];
      }
    }
    $("#map-stage").classList.toggle(
      "shielded",
      Date.now() < state.shieldUntil,
    );
    for (const key of ["badcat", "metro"]) {
      const effect = state.targetEffects?.[key];
      if (effect && Date.now() < effect.until) {
        const side = key === "badcat" ? -1 : 1;
        state[key] = [
          state.car[0] + (effect.kind === "sonar" ? 0.0005 : -0.0008),
          state.car[1] + side * 0.0014,
        ];
      }
    }
    const tunnel = window.badCatAdventure.tunnelState();
    document
      .querySelectorAll(".enemy-icon,.actor.enemy-actor")
      .forEach((node) => node.classList.toggle("in-tunnel", !!tunnel?.hidden));
    if (tunnel?.exiting) {
      state.badcat = [state.car[0] + 0.00055, state.car[1] - 0.0006];
      state.metro = [state.car[0] + 0.00075, state.car[1] + 0.0006];
    }
    updateActors();
    window.badCatLoot.update(
      dt,
      state.car,
      state.mode,
      state.mode === "test" ? 0 : state.gpsAccuracy,
      state.heading,
    );
  }
  function setTestDrive() {
    state.locationRequest++;
    browserLocation.stop();
    locationGate(false);
    state.mode = "test";
    state.gpsStarting = false;
    state.lastGPS = null;
    state.lastGPSZoomed = false;
    state.paused = false;
    state.car = routePoint(state.elapsed / 200);
    $("#source-badge").textContent = "TEST DRIVE";
    $("#location-label").firstChild.textContent = "Test Drive · Cambridge, UK";
    $("#accuracy").textContent = "No location permission needed";
    $("#pause").disabled = false;
    $("#speed").disabled = false;
    $("#pause").textContent = "Ⅱ Pause";
    $("#pause").setAttribute("aria-pressed", "false");
    $("#test-drive").classList.add("selected");
    $("#gps").classList.remove("selected");
    $("#gps").textContent = "⌖ Use my GPS";
    state.follow = true;
    updateFollow();
    if (map) map.setView(state.car, 20);
    startGameMap();
    toast("Test Drive ready. Let the adventure roll!");
  }
  function startGPS() {
    if (!navigator.geolocation) {
      locationUnavailable("This browser cannot provide GPS.");
      return;
    }
    if (!window.isSecureContext) {
      locationUnavailable("GPS needs HTTPS or localhost.");
      return;
    }
    state.paused = false;
    const request = ++state.locationRequest;
    const firstGPS = state.mode !== "gps";
    if (firstGPS) {
      state.mode = "locating";
      locationGate(
        true,
        "Finding the Odyssey…",
        "Waiting for this tablet’s GPS. Allow location in Chrome when asked.",
      );
    }
    $("#source-badge").textContent = "FINDING GPS";
    state.gpsStarting = true;
    $("#gps").textContent = "⌖ Finding you…";
    browserLocation.start(
      (fix) => {
        if (
          request !== state.locationRequest ||
          (!state.gpsStarting && state.mode !== "gps")
        )
          return;
        locationGate(false);
        const previous = state.lastGPS;
        state.gpsAccuracy = fix.coords.accuracy;
        if (Number.isFinite(fix.coords.heading))
          state.heading = (fix.coords.heading * Math.PI) / 180;
        else if (previous)
          state.heading = Math.atan2(
            (fix.coords.longitude - previous[1]) *
              Math.cos((fix.coords.latitude * Math.PI) / 180),
            fix.coords.latitude - previous[0],
          );
        state.mode = "gps";
        state.gpsStarting = false;
        state.car = [fix.coords.latitude, fix.coords.longitude];
        if (
          previous &&
          fix.coords.accuracy < 100 &&
          metres(previous, state.car) > 5
        )
          state.distance += metres(previous, state.car);
        state.lastGPS = state.car;
        $("#source-badge").textContent = "LIVE GPS";
        $("#location-label").firstChild.textContent = "Your crew · live GPS";
        $("#accuracy").textContent =
          `Accuracy ±${Math.round(fix.coords.accuracy)} m${fix.coords.accuracy > 100 ? " · weak signal" : ""}`;
        $("#gps").textContent = "⌖ GPS active";
        $("#gps").classList.add("selected");
        $("#test-drive").classList.remove("selected");
        $("#pause").disabled = true;
        $("#speed").disabled = true;
        if (map && state.follow)
          map.setView(
            state.car,
            firstGPS && !state.lastGPSZoomed ? 20 : map.getZoom(),
            { animate: false },
          );
        state.lastGPSZoomed = true;
        startGameMap();
        window.badCatAdventure.onFix(state.car, fix.coords.accuracy);
        updateActors();
      },
      (error) => {
        if (request !== state.locationRequest) return;
        const messages = {
          1: "GPS permission was declined. You can allow location in Chrome settings.",
          2: "The tablet could not find a position. A hotspot does not provide phone GPS.",
          3: "GPS took too long. Try near a window, or use Test Drive.",
        };
        const message =
          messages[error.code] || "GPS unavailable. Test Drive is ready.";
        locationUnavailable(message, error.code === 2 || error.code === 3);
      },
    );
  }
  // Sound is synthesised locally. Never create/resume the audio context before a gesture.
  let audio,
    soundEnabled = false;
  $("#volume").value = progress.volume;
  function sound(kind) {
    if (!soundEnabled) return;
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      audio.resume().catch(() => {});
      const notes =
        kind === "puppy"
          ? [440, 554, 659, 880]
          : kind === "sonar"
            ? [740, 370]
            : kind === "laser"
              ? [880, 220]
              : kind === "shield"
                ? [220, 330, 440]
                : [392, 523, 659];
      notes.forEach((f, i) => {
        const osc = audio.createOscillator(),
          gain = audio.createGain(),
          t = audio.currentTime + i * 0.1;
        osc.type = kind === "laser" ? "triangle" : "sine";
        osc.frequency.setValueAtTime(f, t);
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(60, f * 0.7),
          t + 0.18,
        );
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(
          (progress.volume / 100) * 0.14,
          t + 0.015,
        );
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
        osc.connect(gain);
        gain.connect(audio.destination);
        osc.start(t);
        osc.stop(t + 0.28);
      });
    } catch {
      soundEnabled = false;
      $("#sound").textContent = "♪ OFF";
      $("#sound").setAttribute("aria-pressed", "false");
      $("#sound").setAttribute("aria-label", "Turn sound on");
      toast("Sound is unavailable in this browser. All gadgets still work.");
    }
  }
  function burst(emoji, count = 15) {
    for (let i = 0; i < count; i++) {
      const node = document.createElement("span");
      node.className = "particle";
      node.textContent = emoji;
      node.style.left = `${40 + Math.random() * 20}%`;
      node.style.top = `${40 + Math.random() * 20}%`;
      node.style.setProperty("--dx", `${(Math.random() - 0.5) * 600}px`);
      node.style.setProperty("--dy", `${(Math.random() - 0.5) * 450}px`);
      $("#effect-layer").append(node);
      setTimeout(() => node.remove(), 2000);
    }
  }
  function pulse() {
    const node = document.createElement("div");
    node.className = "sonar-pulse";
    $("#effect-layer").append(node);
    setTimeout(() => node.remove(), 2000);
  }
  function gadget(kind) {
    if (kind === "encounter") {
      encounter();
      return;
    }
    if (!window.badCatCampaign.use(kind)) {
      return false;
    }
    window.badCatAdventure.onGadget(kind);
    progress.gadgets++;
    save();
    sound(kind);
    if (kind === "shield") {
      state.shieldUntil =
        Date.now() + 12000 + window.badCatLoot.level("shield") * 5000;
      state.retreatUntil = Date.now() + 8000;
      $("#map-stage").classList.add("shielded");
      story(
        "Forcefield up! The cats bounce gently away, like marshmallows on a trampoline.",
      );
      toast(
        `Forcefield active for ${12 + window.badCatLoot.level("shield") * 5} seconds. Boing!`,
      );
    }
    if (kind === "laser") {
      const beam = document.createElement("div");
      beam.className = "beam";
      $("#effect-layer").append(beam);
      setTimeout(() => beam.remove(), 800);
      burst("✦", 20);
      state.retreatUntil = Date.now() + 6500;
      story(
        "Rainbow confetti, away! Metro is distracted by a very sparkly hat.",
      );
      toast("Confetti blaster fired!");
    }
    if (kind === "sonar") {
      pulse();
      story(
        `Ping! Bad Cat is ${Math.round(metres(state.car, state.badcat))} metres away. Also detected: one mysterious biscuit.`,
      );
      toast("Sonar found the cats… and a biscuit.");
    }
    if (kind === "bubble") {
      burst("🫧", 16);
      state.retreatUntil = Date.now() + 7000;
      story(
        "A bubbly cloud surrounds the crew. Bad Cat tries to catch a bubble and floats off giggling.",
      );
      toast("Bubble blaster: maximum wobble!");
    }
    if (kind === "puppy") {
      burst("🐶", 9);
      state.allyUntil = Date.now() + 18000;
      state.retreatUntil = Date.now() + 10000;
      progress.puppies++;
      save();
      story(
        "Giant Puppy bounds in! Bad Cat decides to help the puppies. Metro pretends this was the plan all along.",
      );
      toast("Puppy squad deployed. Bad Cat is on your team!");
    }
    $("#gadget-count").textContent = `${progress.gadgets} big ideas unleashed`;
    return true;
  }
  function vehicleSVG(type) {
    const base =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" role="img" aria-label="Original cartoon adventure vehicle">';
    if (type === "plane")
      return (
        base +
        '<ellipse cx="120" cy="117" rx="77" ry="7" fill="#bed2c3"/><path d="M25 75 94 63 116 19 139 19 132 62 202 70 219 85 133 87 137 119 119 119 99 88 36 90Z" fill="#d4ac68" stroke="#284952" stroke-width="4"/><path d="m143 61 25-13 17 0-11 20" fill="#4c8d98" stroke="#284952" stroke-width="3"/><rect x="95" y="63" width="36" height="20" rx="8" fill="#c8e5e1"/><path d="M215 58v42" stroke="#294853" stroke-width="5"/><circle cx="215" cy="79" r="6" fill="#ed926a"/></svg>'
      );
    if (type === "submarine")
      return (
        base +
        '<ellipse cx="120" cy="117" rx="77" ry="7" fill="#bed2c3"/><path d="M52 55h130q40 28 0 57H52q-35-28 0-57Z" fill="#d8ae64" stroke="#284952" stroke-width="4"/><path d="M109 55V28h25v12h-11v15" fill="#76aaa5" stroke="#284952" stroke-width="4"/><path d="m37 72-20-15v48l21-13m167-21 19-16v49l-18-12" fill="#6da59e" stroke="#284952" stroke-width="4"/><g fill="#c8e5e1" stroke="#284952" stroke-width="4"><circle cx="80" cy="83" r="16"/><circle cx="127" cy="83" r="16"/><circle cx="174" cy="83" r="16"/></g><g fill="#c6e4df"><circle cx="209" cy="35" r="8"/><circle cx="226" cy="18" r="5"/></g></svg>'
      );
    return '<img src="assets/odyssey.svg" alt="White Honda Odyssey" class="odyssey-art">';
  }

  function setVehicle(type, announce = true) {
    progress.vehicle = type;
    save();
    $("#vehicle-art").innerHTML = vehicleSVG(type);
    $("#vehicle-name").textContent = {
      car: "White Honda Odyssey",
      plane: "Cloud Hopper",
      submarine: "Bubble Voyager",
    }[type];
    $$("[data-vehicle]").forEach((b) => {
      b.classList.toggle("selected", b.dataset.vehicle === type);
      b.setAttribute("aria-pressed", b.dataset.vehicle === type);
    });
    const emoji = { car: "🚙", plane: "✈️", submarine: "🤿" }[type];
    const markerArt =
      type === "car"
        ? '<img src="assets/odyssey.svg" alt="White Honda Odyssey">'
        : emoji;
    $("#actor-car").innerHTML = markerArt;
    if (markers.car)
      markers.car.setIcon(
        L.divIcon({
          className: "leaflet-actor",
          html: `<div>${markerArt}</div>`,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        }),
      );
    if (announce) {
      sound("shield");
      burst("✦", 8);
      toast(
        `${$("#vehicle-name").textContent} ready. ${progress.equipment} equipped!`,
      );
      story(
        pick(
          {
            car: [
              "Wheels down. The white Honda Odyssey is ready for whatever Dylan dreams up.",
            ],
            plane: [
              "Wings out! Bad Cat waves from a tiny cloud. Metro forgot to pack a parachute sandwich.",
            ],
            submarine: [
              "Dive, dive! Bubble Voyager is ready. The squid has invited us for tea.",
            ],
          }[type],
        ),
      );
    }
  }
  function updateEquipment() {
    $("#equipment-label").textContent = `${progress.equipment} equipped`;
    $("#garage-status").textContent =
      `Equipped: ${progress.equipment}. All upgrades run on imagination.`;
    $$("[data-equipment]").forEach((b) =>
      b.classList.toggle(
        "selected",
        b.dataset.equipment === progress.equipment,
      ),
    );
  }
  const missions = [
    "Metro has borrowed the moon to light his lair. Can your waffle-wing plane help put it back?",
    "The Mega House Vacuum is sucking up cartoon houses! Invent a way to make it sneeze them back.",
    "Giant Puppy is stuck in a very small hat. Bad Cat has a plan. Do you trust it?",
    "The car wash squid wants to be a drummer. Can the bubble blaster build it a drum kit?",
    "Bad Cat has become an ally! Rescue Metro from a tornado made entirely of kittens.",
    "Puppy Headquarters is floating away on a giant bubble. Choose a vehicle and bring snacks.",
    "A biscuit-shaped island appears on the sonar. Is it a trap, or is it lunchtime?",
    "All the cartoon houses have swapped front doors. Can your newest invention sort them out?",
  ];
  function newMission() {
    let next = pick(missions);
    if (next === $("#mission-text").textContent)
      next = missions[(missions.indexOf(next) + 1) % missions.length];
    $("#mission-text").textContent = next;
    story(next);
    progress.missions++;
    save();
    sound("sonar");
  }
  const dialog = $("#encounter-dialog");
  function encounter(kind) {
    window.badCatAdventure.encounter(kind);
  }
  function renderInventions() {
    $("#inventions").replaceChildren();
    progress.inventions.forEach((inv, index) => {
      const li = document.createElement("li"),
        use = document.createElement("button"),
        remove = document.createElement("button");
      use.className = "use-invention";
      use.textContent = `✦ ${inv.name}`;
      use.title = "Deploy this invention";
      use.addEventListener("click", () => {
        gadget(inv.power);
        toast(`${inv.name} activated!`);
        $("#puppy-status").textContent =
          `Your invention, ${inv.name}, is ready for adventure.`;
      });
      remove.textContent = "×";
      remove.setAttribute("aria-label", `Delete ${inv.name}`);
      remove.addEventListener("click", () => {
        progress.inventions.splice(index, 1);
        save();
        renderInventions();
      });
      li.append(use, remove);
      $("#inventions").append(li);
    });
  }
  function setView(view) {
    state.view = view;
    document.body.classList.toggle("map-mode", view === "drive");
    if (view !== "drive") window.badCatTargeting.cancel();
    $("#drive-view").classList.toggle("hidden", view !== "drive");
    $("#hq-view").classList.toggle("hidden", view !== "hq");
    $$("[data-view]").forEach((b) => {
      b.classList.toggle("active", b.dataset.view === view);
      b.setAttribute("aria-pressed", b.dataset.view === view);
    });
    if (view === "drive" && map) setTimeout(() => map.invalidateSize(), 0);
  }
  function updateConnection() {
    const online = navigator.onLine;
    $("#connection").textContent = online ? "● ONLINE" : "● OFFLINE";
    if (!online)
      mapNotice(
        "Offline · Mission HQ and all gadgets work. Road maps need a connection.",
      );
    else if (tileLoaded) mapNotice("");
    if (online) window.badCatGameMap.retry();
  }
  $$("[data-view]").forEach((b) =>
    b.addEventListener("click", () => setView(b.dataset.view)),
  );
  $$("[data-gadget]").forEach((b) =>
    b.addEventListener("click", () =>
      b.dataset.gadget === "encounter"
        ? encounter()
        : window.badCatTargeting.arm(b.dataset.gadget),
    ),
  );
  $$("[data-vehicle]").forEach((b) =>
    b.addEventListener("click", () => setVehicle(b.dataset.vehicle)),
  );
  $$("[data-equipment]").forEach((b) =>
    b.addEventListener("click", () => {
      progress.equipment = b.dataset.equipment;
      save();
      updateEquipment();
      toast(`${progress.equipment} equipped!`);
      sound("shield");
    }),
  );
  $$("[data-puppy]").forEach((b) =>
    b.addEventListener("click", () => {
      progress.puppies++;
      save();
      sound("puppy");
      $("#puppy-status").textContent =
        `${b.dataset.puppy} ${pick(["brings you an emergency biscuit.", "does a heroic somersault.", "offers Bad Cat a friendship paw.", "is ready for your next mission!"])}`;
      b.animate(
        [
          { transform: "rotate(-5deg)" },
          { transform: "rotate(5deg)" },
          { transform: "rotate(0deg)" },
        ],
        { duration: 350 },
      );
    }),
  );
  $("#retry-gps").addEventListener("click", startGPS);
  $("#choose-test").addEventListener("click", setTestDrive);
  $("#choose-hq").addEventListener("click", () => setView("hq"));
  $("#test-drive").addEventListener("click", setTestDrive);
  $("#gps").addEventListener("click", startGPS);
  $("#pause").addEventListener("click", () => {
    state.paused = !state.paused;
    $("#pause").textContent = state.paused ? "▶ Resume" : "Ⅱ Pause";
    $("#pause").setAttribute("aria-pressed", state.paused);
  });
  $("#speed").addEventListener(
    "change",
    () => (state.speed = Number($("#speed").value)),
  );
  $("#follow").addEventListener("click", () => {
    state.follow = !state.follow;
    updateFollow();
    if (map && state.follow) map.panTo(state.car);
  });
  $("#sound").addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    $("#sound").textContent = soundEnabled ? "♪ ON" : "♪ OFF";
    $("#sound").setAttribute("aria-pressed", soundEnabled);
    $("#sound").setAttribute(
      "aria-label",
      soundEnabled ? "Mute sound" : "Turn sound on",
    );
    if (soundEnabled) sound("puppy");
    else if (audio) audio.suspend().catch(() => {});
  });
  $("#volume").addEventListener("input", () => {
    progress.volume = Number($("#volume").value);
    save();
  });
  $("#fullscreen").addEventListener("click", async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen)
        await document.documentElement.requestFullscreen();
      else toast("Use your browser menu to install or open fullscreen.");
    } catch {
      toast(
        "Fullscreen is unavailable here. Try installing the app from Chrome’s menu.",
      );
    }
  });
  $("#mission").addEventListener("click", newMission);
  $("#surprise-drive").addEventListener("click", () => {
    encounter();
  });

  $("#invention-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = $("#invention-name").value.trim();
    if (!name) {
      toast("Give your invention a name first.");
      return;
    }
    if (progress.inventions.length >= 20) {
      toast("The lab has 20 inventions. Retire one to make room.");
      return;
    }
    progress.inventions.unshift({
      name: name.slice(0, 40),
      power: $("#invention-power").value,
    });
    save();
    renderInventions();
    $("#invention-name").value = "";
    sound("shield");
    toast(`${name} is ready! Tap it to test its power.`);
  });
  let tickles = 0;
  $("#squid-target").addEventListener("click", () => {
    tickles++;
    sound("bubble");
    $("#squid-target").animate(
      [
        { transform: "rotate(-6deg)" },
        { transform: "rotate(6deg)" },
        { transform: "rotate(0deg)" },
      ],
      { duration: 300 },
    );
    $("#squid-progress").value = tickles;
    $("#squid-status").textContent = `${tickles} of 3 bubbly tickles`;
    if (tickles === 3) {
      window.badCatCampaign.reward();
      progress.squidWins++;
      save();
      $("#squid-status").textContent =
        "You did it! The squid is your car wash buddy. Tap to play again.";
      tickles = 0;
      toast("Squid befriended! Every adventure needs an eight-armed friend.");
    }
  });
  window.addEventListener("keydown", (event) => {
    if (
      event.repeat ||
      /INPUT|SELECT|TEXTAREA/.test(event.target.tagName) ||
      window.badCatAdventure.isOpen() ||
      state.view !== "drive"
    )
      return;
    const index = Number(event.key) - 1;
    if (index >= 0 && index < 6) {
      event.preventDefault();
      if (index === 5) encounter();
      else
        window.badCatTargeting.arm(
          ["shield", "laser", "sonar", "bubble", "puppy"][index],
        );
    }
  });
  window.addEventListener("online", updateConnection);
  window.addEventListener("offline", updateConnection);
  window.addEventListener("pagehide", () => browserLocation.stop());
  window.addEventListener("pageshow", (event) => {
    if (event.persisted && state.mode === "gps") {
      startGPS();
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && audio) audio.suspend().catch(() => {});
  });
  window.badCatLoot.init({
    view: () => state.view,
    paused: () => state.paused,
    metres,
    sound,
    say: (message) => {
      story(message);
      toast(message);
    },
  });
  window.badCatCampaign.init((message) => {
    story(message);
    toast(message);
  });
  window.badCatTargeting.init({
    view: () => state.view,
    sound,
    story,
    result: (won, count) => window.badCatAdventure.raidResult(won, count),
    apply: (kind, target) => {
      if (gadget(kind) === false) return false;
      state.targetEffects ||= {};
      state.targetEffects[target] = {
        kind,
        until: Date.now() + 9000 + window.badCatLoot.level(kind) * 3000,
      };
      return true;
    },
  });
  window.badCatAdventure.init({
    gadget,
    vehicle: setVehicle,
    sound,
    story,
    metres,
    startSound: () => {
      if (!soundEnabled) $("#sound").click();
    },
    view: () => state.view,
    startJourney: startGPS,
    paused: () => state.paused || !["gps", "test"].includes(state.mode),
    shielded: () => Date.now() < state.shieldUntil,
    setView,
    win: (reward = true) => {
      if (reward) window.badCatCampaign.reward();
      progress.squidWins++;
      save();
    },
  });
  initFallback();
  setVehicle(progress.vehicle, false);
  updateEquipment();
  renderInventions();
  updateConnection();
  save();
  updateActors();
  locationGate(true);
  $("#pause").disabled = true;
  $("#speed").disabled = true;
  loadMap();
  if (progress.gadgets)
    $("#gadget-count").textContent = `${progress.gadgets} big ideas unleashed`;
  let previous = performance.now();
  setInterval(() => {
    const now = performance.now();
    const dt = Math.min((now - previous) / 1000, 0.5);
    previous = now;
    if (!document.hidden) tick(dt);
  }, 250);
  if (!("serviceWorker" in navigator))
    $(".nav-tab i").textContent = "ONLINE ONLY";
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./sw.js")
      .then(() => navigator.serviceWorker.ready)
      .then(() => {
        $(".nav-tab i").textContent = "OFFLINE READY";
      })
      .catch(() => {
        $(".nav-tab i").textContent = "CACHE UNAVAILABLE";
        toast(
          "Offline install could not finish. Keep this tab open, or retry on HTTPS.",
        );
      });
  }
  // A read-only diagnostic snapshot for manual checks; never includes GPS coordinates.
  window.badCatDiagnostics = () => ({
    mode: state.mode,
    paused: state.paused,
    vehicle: progress.vehicle,
    simulationElapsed: state.elapsed,
    distanceMetres: Math.round(state.distance),
    mapReady: !!map,
    tilesLoaded: tileLoaded,
    soundEnabled,
    audioState: audio?.state || "not-started",
    inventions: progress.inventions.length,
    cacheSupported: "serviceWorker" in navigator,
    zoom: map?.getZoom() || null,
    mapAppearance: window.badCatGameMap.diagnostics(),
    inventory: window.badCatLoot.diagnostics(),
    adventure: window.badCatAdventure.diagnostics(),
    targeting: window.badCatTargeting.diagnostics(),
    campaign: window.badCatCampaign.snapshot(),
  });
})();
