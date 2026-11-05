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
          .map((i) => ({
            name: i.name.slice(0, 40),
            power: i.power,
            ...window.badCatInventions.normalize(i),
          }))
      : [],
  };
  if (equipment.includes(saved.equipment)) progress.equipment = saved.equipment;
  if (["car", "plane", "submarine", "walking"].includes(saved.vehicle))
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
  // Routine guidance stays in the HQ story log instead of opening notifications.
  function toast(message) {
    story(message);
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
    heading: 0,
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
          : `<img src="assets/${key === "badcat" ? "bad-cat" : "metro"}.png" alt="${key === "badcat" ? "BC, Bad Cat" : "M, Metro"}">`;
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
      rotate: true,
      rotateControl: false,
      touchRotate: false,
      shiftKeyRotate: false,
      zoomAnimation: false,
      zoomControl: false,
      attributionControl: true,
      maxZoom: 21,
    }).setView(state.car, 20);
    L.control.zoom({ position: "bottomleft" }).addTo(map);
    window.badCatLoot.attachMap(map);
    if (["gps", "test", "road"].includes(state.mode)) startGameMap();
    const icon = (emoji, extra = "") =>
      L.divIcon({
        className: `leaflet-actor ${extra}`,
        html: `<div>${emoji}</div>`,
        iconSize: [80, 80],
        iconAnchor: [40, 40],
      });
    markers.car = L.marker(state.car, {
      icon: icon("🚙"),
      title: "Your crew",
      keyboard: true,
    }).addTo(map);
    markers.badcat = L.marker(state.badcat, {
      icon: icon(
        '<img src="assets/bad-cat.png" alt="BC, Bad Cat">',
        "enemy-icon badcat-marker",
      ),
      title: "Bad Cat · fictional character",
    }).addTo(map);
    markers.metro = L.marker(state.metro, {
      icon: icon(
        '<img src="assets/metro.png" alt="M, Metro">',
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
    if (
      !map ||
      state.mode === "road" ||
      !["car", "walking"].includes(progress.vehicle)
    )
      return;
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
    updateJourneyMode();
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
      ? "⌖ Following Dylan"
      : "⌖ Follow Dylan";
    $("#follow").setAttribute("aria-pressed", state.follow);
  }
  function updateActors() {
    const c = state.car;
    if (
      map &&
      ["car", "walking"].includes(progress.vehicle) &&
      Number.isFinite(state.heading)
    ) {
      const desired = (-state.heading * 180) / Math.PI;
      const delta =
        ((((desired - (map.getBearing?.() || 0) + 540) % 360) + 360) % 360) -
        180;
      if (Math.abs(delta) > 0.5) map.setBearing?.(desired);
    }
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
    if (
      map &&
      state.follow &&
      state.view === "drive" &&
      ["car", "walking"].includes(progress.vehicle)
    )
      map.panTo(c, { animate: false });
    if (map && tileLoaded && ["car", "walking"].includes(progress.vehicle)) {
      const p = map.latLngToContainerPoint(c);
      $("#map-stage").style.setProperty("--car-x", `${p.x}px`);
      $("#map-stage").style.setProperty("--car-y", `${p.y}px`);
    }
    if (!["car", "walking"].includes(progress.vehicle)) {
      $("#map-stage").style.setProperty("--car-x", "50%");
      $("#map-stage").style.setProperty("--car-y", "43%");
    }
    const d1 = Math.round(metres(c, state.badcat)),
      d2 = Math.round(metres(c, state.metro));
    $("#badcat-distance").textContent = `${d1} m`;
    $("#metro-distance").textContent = `${d2} m`;
    const ally = Date.now() < state.allyUntil;
    $("#badcat-mood").textContent = ally
      ? "Distracted by the puppy squad!"
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
    window.badCatVehicle.tick(dt);
    window.badCatCharacters.tick(dt);
    window.badCatTargeting.tick(dt);
    window.badCatAdventure.tick(dt);
    if (state.mode === "road") return;
    if (
      state.mode === "test" &&
      !state.paused &&
      !window.badCatAdventure.isOpen()
    ) {
      const prev = state.car;
      state.elapsed +=
        dt *
        state.speed *
        (progress.vehicle === "walking" ? 0.45 : 1) *
        window.badCatAdventure.motionScale() *
        window.badCatCampaign.motionScale();
      state.car = routePoint(state.elapsed / 200);
      state.distance += metres(prev, state.car);
      if (metres(prev, state.car) > 0.01)
        state.heading = Math.atan2(
          (state.car[1] - prev[1]) * Math.cos((state.car[0] * Math.PI) / 180),
          state.car[0] - prev[0],
        );
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
  function setRoadAdventure() {
    window.badCatAdventure.resetLocationArrival();
    state.locationRequest++;
    browserLocation.stop();
    state.gpsStarting = false;
    state.lastGPS = null;
    state.mode = "road";
    state.paused = false;
    locationGate(false);
    setVehicle("car", false);
    window.badCatRoad.change(true);
    setView("drive");
    $("#source-badge").textContent = "ROAD ADVENTURE";
    $("#accuracy").textContent = "Fictional road · GPS off";
    $("#pause").disabled = false;
    $("#speed").disabled = true;
    $("#pause").textContent = "Ⅱ Pause";
    $("#pause").setAttribute("aria-pressed", "false");
    updateJourneyMode();
    story(
      "Steer with arrows or drag the Odyssey. Pick a launcher, fire confetti, and catch treats!",
    );
  }
  function updateJourneyMode() {
    document
      .querySelectorAll("[data-journey-mode]")
      .forEach((b) =>
        b.setAttribute(
          "aria-pressed",
          b.dataset.journeyMode === (state.mode === "road" ? "road" : "gps"),
        ),
      );
  }
  function setTestDrive() {
    window.badCatRoad.change(false);
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
    setView("drive");
    window.badCatRoad.change(false);
    updateJourneyMode();
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
      updateJourneyMode();
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
        const next = [fix.coords.latitude, fix.coords.longitude];
        const moving =
          !Number.isFinite(fix.coords.speed) || fix.coords.speed > 0.8;
        if (
          moving &&
          Number.isFinite(fix.coords.heading) &&
          fix.coords.heading >= 0
        )
          state.heading = (fix.coords.heading * Math.PI) / 180;
        else if (
          previous &&
          fix.coords.accuracy <= 50 &&
          metres(previous, next) >= Math.max(8, fix.coords.accuracy)
        )
          state.heading = Math.atan2(
            (next[1] - previous[1]) * Math.cos((next[0] * Math.PI) / 180),
            next[0] - previous[0],
          );
        state.mode = "gps";
        updateJourneyMode();
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
        if (
          map &&
          state.follow &&
          ["car", "walking"].includes(progress.vehicle)
        )
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
  let lastSoundEffect = null;
  $("#volume").value = progress.volume;
  function sound(kind, force = false) {
    if (!soundEnabled && !force) return;
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      audio.resume().catch(() => {});
      lastSoundEffect = kind;
      if (kind === "victory") {
        for (const [start, freq, duration] of [
          [0, 523.25, 0.16],
          [0, 659.25, 0.16],
          [0, 783.99, 0.16],
          [0.25, 523.25, 0.7],
          [0.25, 659.25, 0.7],
          [0.25, 1046.5, 0.7],
        ]) {
          const osc = audio.createOscillator(),
            gain = audio.createGain(),
            t = audio.currentTime + start;
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(
            (progress.volume / 100) * 0.1,
            t + 0.015,
          );
          gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
          osc.connect(gain);
          gain.connect(audio.destination);
          osc.start(t);
          osc.stop(t + duration + 0.03);
        }
        return;
      }
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
      if (emoji === "🐶") {
        const img = document.createElement("img");
        img.src = i % 2 ? "assets/luna.png" : "assets/captain-biscuit.png";
        img.alt = "";
        node.append(img);
      } else node.textContent = emoji;
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
  function shotVisual(kind, invention, point) {
    if (invention) window.badCatInventions.launch(invention, point);
    else {
      const shot = document.createElement("span");
      shot.className = "free-shot";
      shot.textContent = {
        shield: "◈",
        laser: "✦",
        sonar: "◎",
        bubble: "🫧",
        puppy: "🐾",
      }[kind];
      document.body.append(shot);
      const player = window.badCatTargeting.targetNode("car");
      const r = player?.getBoundingClientRect();
      const x = r ? r.x + r.width / 2 : innerWidth / 2;
      const y = r ? r.y + r.height / 2 : innerHeight * 0.82;
      shot.animate(
        [
          { transform: `translate(${x}px,${y}px) scale(.4)` },
          {
            transform: `translate(${point.x}px,${point.y}px) scale(1.4)`,
            opacity: 0,
          },
        ],
        { duration: 650, easing: "ease-out" },
      ).onfinish = () => shot.remove();
    }
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
        "Giant Puppy bounds in! Bad Cat runs from the puppy squad. Metro hides his latest invention.",
      );
      toast("Puppy squad deployed. Bad Cat’s plan is interrupted!");
    }
    $("#gadget-count").textContent = `${progress.gadgets} big ideas unleashed`;
    return true;
  }
  function vehicleSVG(type) {
    if (type === "walking")
      return '<img src="assets/dylan.png" alt="Dylan, Dalmatian puppy hero walking">';
    if (type === "plane")
      return '<img src="assets/doggy-plane.png" alt="Doggy Plane">';
    if (type === "submarine")
      return '<img src="assets/family-sub.png" alt="Odyssey submarine">';
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
    return '<img src="assets/odyssey.png" alt="White Honda Odyssey" class="odyssey-art">';
  }

  function setVehicle(type, announce = true) {
    progress.vehicle = type;
    window.badCatVehicle.change(type, announce);
    save();
    $("#vehicle-art").innerHTML = vehicleSVG(type);
    $("#vehicle-name").textContent = {
      car: "White Honda Odyssey",
      walking: "Dylan · Dalmatian puppy hero",
      plane: "Doggy Plane",
      submarine: "Bubble Voyager",
    }[type];
    $$("[data-vehicle]").forEach((b) => {
      b.classList.toggle("selected", b.dataset.vehicle === type);
      b.setAttribute("aria-pressed", b.dataset.vehicle === type);
    });
    const emoji = { car: "🚙", plane: "✈️", submarine: "🤿", walking: "🐾" }[
      type
    ];
    const markerArt =
      type === "walking"
        ? '<img src="assets/dylan.png" alt="Dylan, Dalmatian puppy hero walking">'
        : type === "car"
          ? '<img src="assets/odyssey.png" alt="White Honda Odyssey">'
          : emoji;
    $("#actor-car").innerHTML = markerArt;
    if (markers.car)
      markers.car.setIcon(
        L.divIcon({
          className: "leaflet-actor player-marker",
          html: `<div>${markerArt}</div>`,
          iconSize: [80, 80],
          iconAnchor: [40, 40],
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
            walking: [
              "Paws down! Dylan the Dalmatian is on patrol. Sniff out Bad Cat and Metro’s next trick!",
            ],
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
    "Bad Cat and Metro released a kitten tornado! Help Dylan protect Puppy Base.",
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
    window.badCatArsenal?.render?.();
    $("#inventions").replaceChildren();
    progress.inventions.forEach((inv, index) => {
      const li = document.createElement("li"),
        use = document.createElement("button"),
        remove = document.createElement("button");
      use.className = "use-invention";
      use.textContent = `${window.badCatInventions.recipe(inv)?.item.picture || "✦"} ${inv.name}`;
      const details = document.createElement("small");
      details.className = "invention-recipe";
      details.textContent = window.badCatInventions.describe(inv);
      use.append(details);
      use.title = "Deploy this invention";
      use.addEventListener("click", () => window.badCatInventions.deploy(inv));
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
        `${b.dataset.puppy} ${pick(["brings you an emergency biscuit.", "does a heroic somersault.", "practises a gadget drill with Dylan.", "is ready for your next mission!"])}`;
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
  document
    .querySelectorAll("[data-journey-mode]")
    .forEach(
      (b) =>
        (b.onclick = () =>
          b.dataset.journeyMode === "road" ? setRoadAdventure() : startGPS()),
    );
  $("#choose-road").onclick = setRoadAdventure;
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
    if (map && state.follow && ["car", "walking"].includes(progress.vehicle))
      map.panTo(state.car);
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
    const parts = window.badCatInventions.selection();
    const name =
      $("#invention-name").value.trim() ||
      window.badCatInventions.describe(parts).slice(0, 40);
    if (progress.inventions.length >= 20) {
      toast("The lab has 20 inventions. Retire one to make room.");
      return;
    }
    progress.inventions.unshift({
      name: name.slice(0, 40),
      ...parts,
    });
    save();
    renderInventions();
    $("#invention-name").value = "";
    sound("shield");
    toast(
      `${name} saved! Equip it in your arsenal, then tap anywhere to shoot.`,
    );
  });
  window.badCatInventions.init({
    list: () => progress.inventions,
    hq: () => setView("hq"),
    deploy: (inv) => {
      setView("drive");
      window.badCatTargeting.arm(inv.power, inv);
      story(`${inv.name} ready — tap anywhere to shoot.`);
    },
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
    if (index >= 0 && index < 4) {
      event.preventDefault();
      window.badCatArsenal.arm(index);
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
  window.badCatSpelling.init({
    sound,
    canSpeak: () => soundEnabled,
    celebrate: (wordAudio) => sound("victory", wordAudio),
    started: () => window.badCatAdventure.deferSpelling(),
    finished: () => window.badCatAdventure.deferSpelling(),
  });
  window.badCatVehicle.init({
    canSpeak: () => soundEnabled,
    active: () =>
      state.view === "drive" &&
      !state.paused &&
      !window.badCatAdventure.isOpen(),
    sound,
    say: (message) => {
      story(message);
      toast(message);
    },
    changed: (type) => {
      if (["car", "walking"].includes(type) && map && state.mode !== "road") {
        map.invalidateSize();
        if (["gps", "test", "road"].includes(state.mode)) {
          map.setView(state.car, map.getZoom(), { animate: false });
          startGameMap();
        }
      }
    },
  });
  window.badCatCharacters.init({
    active: () =>
      state.view === "drive" &&
      !state.paused &&
      (["gps", "test", "road"].includes(state.mode) ||
        window.badCatVehicle.worldActive()) &&
      !window.badCatAdventure.isOpen(),
    plan: (kind, key) =>
      state.mode === "road" && window.badCatRoad.visible()
        ? window.badCatRoad.deploy(kind, key)
        : window.badCatAdventure.enactPlan(kind),
    sound,
  });
  window.badCatTargeting.init({
    view: () => state.view,
    sound,
    story,
    result: (won, count) => window.badCatAdventure.raidResult(won, count),
    miss: (kind, invention, point) => {
      if (!window.badCatCampaign.use(kind)) return false;
      progress.gadgets++;
      save();
      sound(kind);
      shotVisual(kind, invention, point);
    },
    apply: (kind, target, invention) => {
      const retreat = state.retreatUntil,
        ally = state.allyUntil;
      if (!window.badCatCampaign.use(kind)) return false;
      progress.gadgets++;
      save();
      sound(kind);
      window.badCatAdventure.onGadget(kind);
      if (kind === "shield") {
        state.shieldUntil =
          Date.now() + 12000 + window.badCatLoot.level("shield") * 5000;
        $("#map-stage").classList.add("shielded");
      }
      state.retreatUntil = retreat;
      state.allyUntil = ally;
      const strike = window.badCatCharacters.hit(target, kind);
      const node = window.badCatTargeting.targetNode(target);
      const rect = node?.getBoundingClientRect();
      if (rect)
        shotVisual(kind, invention, {
          x: rect.x + rect.width / 2,
          y: rect.y + rect.height / 2,
        });
      if (strike?.exposed) {
        window.badCatVehicle.reactToHit(target);
        state.targetEffects ||= {};
        state.targetEffects[target] = {
          kind,
          until: Date.now() + 9000 + window.badCatLoot.level(kind) * 3000,
        };
      }
      return strike;
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
    startJourney: (mode) => (mode === "road" ? setRoadAdventure() : startGPS()),
    paused: () =>
      state.paused ||
      (!["gps", "test", "road"].includes(state.mode) &&
        !window.badCatVehicle.worldActive()),
    shielded: () => Date.now() < state.shieldUntil,
    setView,
    win: (reward = true) => {
      if (reward) window.badCatCampaign.reward();
      progress.squidWins++;
      save();
    },
  });
  window.badCatHandwriting.init({
    sound,
    closed: () => window.badCatAdventure.deferSpelling(),
  });
  window.badCatPipes.init({
    sound,
    closed: () => window.badCatAdventure.deferSpelling(),
  });
  window.badCatRoad.init({
    active: () =>
      state.mode === "road" &&
      state.view === "drive" &&
      !state.paused &&
      !document.hidden &&
      !window.badCatAdventure.isOpen(),
    sound,
    surprise: (kind) => window.badCatAdventure.encounter(kind),
    hit: (key, node) => {
      if (!window.badCatTargeting.diagnostics().armed)
        window.badCatArsenal.arm(1);
      window.badCatTargeting.target(key, node);
    },
  });
  window.badCatArsenal.init({
    list: () => progress.inventions,
    hq: () => setView("hq"),
  });
  window.badCatHouse.init({
    sound,
    closed: () => window.badCatAdventure.deferSpelling(),
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
    lastSoundEffect,
    inventions: progress.inventions.length,
    cacheSupported: "serviceWorker" in navigator,
    zoom: map?.getZoom() || null,
    mapAppearance: window.badCatGameMap.diagnostics(),
    inventory: window.badCatLoot.diagnostics(),
    adventure: window.badCatAdventure.diagnostics(),
    targeting: window.badCatTargeting.diagnostics(),
    campaign: window.badCatCampaign.snapshot(),
    spelling: window.badCatSpelling.diagnostics(),
    characters: window.badCatCharacters.diagnostics(),
    theme: window.badCatTheme.mode(),
    road: window.badCatRoad.diagnostics(),
    arsenal: window.badCatArsenal.diagnostics(),
    vehicleWorld: window.badCatVehicle.diagnostics(),
  });
})();
