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
    mode: "test",
    paused: false,
    follow: true,
    speed: 1,
    elapsed: 0,
    distance: 0,
    car: [52.1995, 0.1198],
    badcat: [52.199, 0.119],
    metro: [52.1987, 0.1207],
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
    tileLayer,
    markers = {},
    buildings = [],
    tileLoaded = false,
    tileErrors = 0,
    mapTimer;
  const buildingDefs = [
    {
      name: "Puppy Headquarters",
      emoji: "🏡",
      offset: [0.0015, -0.0015],
      event: "puppy",
    },
    {
      name: "Metro's fictional lair",
      emoji: "🏰",
      offset: [0.0043, 0.002],
      event: "lair",
    },
    {
      name: "Cartoon houses",
      emoji: "🏘️",
      offset: [0.0022, 0.0045],
      event: "houses",
    },
    {
      name: "Squid Car Wash",
      emoji: "🧽",
      offset: [-0.0003, 0.0032],
      event: "squid",
    },
  ];
  function buildingEvent(kind) {
    if (kind === "squid") {
      encounter("squid");
      return;
    }
    if (kind === "puppy") {
      gadget("puppy");
      story(
        "Puppy Headquarters opens its doors. Giant Puppy offers to carry the whole car. Politely.",
      );
    }
    if (kind === "lair") {
      story(
        "Metro's lair has a secret button labelled ‘DO NOT PRESS’. It dispenses tiny hats. Suspicious!",
      );
      burst("🎩", 10);
      sound("sonar");
    }
    if (kind === "houses") {
      encounter("vacuum");
    }
  }
  function initFallback() {
    for (const [key, emoji, label] of [
      ["car", "🚙", "Your crew"],
      ["badcat", "🐈‍⬛", "Bad Cat"],
      ["metro", "🐱", "Metro"],
    ]) {
      const node = document.createElement("div");
      node.className = `actor ${key === "car" ? "car-actor" : "enemy-actor"}`;
      node.id = `actor-${key}`;
      node.textContent = emoji;
      node.setAttribute("aria-label", label);
      $("#fallback-actors").append(node);
    }
    buildingDefs.forEach((b, i) => {
      const node = document.createElement("button");
      node.className = "actor building-actor";
      node.textContent = b.emoji;
      node.title = `${b.name} · fictional`;
      node.setAttribute(
        "aria-label",
        `${b.name}, fictional adventure building`,
      );
      node.style.left = `${[23, 70, 78, 31][i]}%`;
      node.style.top = `${[30, 23, 69, 78][i]}%`;
      node.addEventListener("click", () => buildingEvent(b.event));
      $("#fallback-actors").append(node);
    });
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
    script.onload = initMap;
    script.onerror = () =>
      mapNotice(
        "Road map unavailable. Enjoy the fictional imagination map, or play offline in Mission HQ.",
      );
    document.head.append(script);
    mapTimer = setTimeout(() => {
      if (!tileLoaded)
        mapNotice(
          "Road map unavailable. Imagination map active — this is not a navigation map.",
        );
    }, 9000);
  }
  function initMap() {
    if (!window.L) return;
    map = L.map("map", {
      zoomControl: false,
      attributionControl: true,
    }).setView(state.car, 15);
    L.control.zoom({ position: "topright" }).addTo(map);
    const tiles = (tileLayer = L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
      },
    ).addTo(map));
    tiles.on("tileload", () => {
      tileLoaded = true;
      clearTimeout(mapTimer);
      $("#map-stage").classList.add("has-map");
      $("#map-stage").classList.remove("no-tiles");
      mapNotice("");
    });
    tiles.on("tileerror", () => {
      tileErrors++;
      if (tileErrors > 2) {
        $("#map-stage").classList.add("no-tiles");
        mapNotice(
          "Map tiles could not load. Showing fictional terrain; Mission HQ works offline.",
        );
      }
    });
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
      icon: icon("🐈‍⬛", "enemy-icon"),
      title: "Bad Cat · fictional character",
    }).addTo(map);
    markers.metro = L.marker(state.metro, {
      icon: icon("🐱", "enemy-icon"),
      title: "Metro · fictional character",
    }).addTo(map);
    buildings = buildingDefs.map((b) =>
      L.marker([state.car[0] + b.offset[0], state.car[1] + b.offset[1]], {
        icon: icon(b.emoji, "building-icon"),
        title: `${b.name} · fictional overlay`,
      })
        .addTo(map)
        .on("click", () => buildingEvent(b.event)),
    );
    L.polyline(route, {
      color: "#718d75",
      weight: 3,
      opacity: 0.4,
      dashArray: "6 9",
      interactive: false,
    }).addTo(map);
    map.on("dragstart", () => {
      state.follow = false;
      updateFollow();
    });
    setVehicle(progress.vehicle, false);
    if (state.view === "hq") setTimeout(() => map.invalidateSize(), 0);
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
    if (state.mode === "test" && !state.paused) {
      const prev = state.car;
      state.elapsed += dt * state.speed;
      state.car = routePoint(state.elapsed / 200);
      state.distance += metres(prev, state.car);
    }
    if (!state.paused || state.mode === "gps") {
      const t = state.elapsed / 200;
      const retreat = Date.now() < state.retreatUntil;
      if (state.mode === "test") {
        // Vary signed route offsets so cats approach, overtake and retreat.
        state.badcat = routePoint(
          t + Math.sin(state.elapsed / 13) * 0.025 - (retreat ? 0.06 : 0.012),
        );
        state.metro = routePoint(
          t + Math.cos(state.elapsed / 17) * 0.032 - (retreat ? 0.075 : 0.021),
        );
      } else {
        const r = retreat ? 0.004 : 0.0012;
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
    updateActors();
  }
  function setTestDrive() {
    browserLocation.stop();
    state.mode = "test";
    state.gpsStarting = false;
    state.lastGPS = null;
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
    if (map) map.setView(state.car, 15);
    buildings.forEach((m, i) =>
      m.setLatLng([
        route[0][0] + buildingDefs[i].offset[0],
        route[0][1] + buildingDefs[i].offset[1],
      ]),
    );
    toast("Test Drive ready. Let the adventure roll!");
  }
  function startGPS() {
    if (!navigator.geolocation) {
      toast("This browser does not support GPS. Test Drive is ready.");
      return;
    }
    if (!window.isSecureContext) {
      toast("GPS needs HTTPS or localhost. Use Test Drive here.");
      return;
    }
    if (
      !confirm(
        "Use this tablet’s location? Only the current position is kept in memory; no location history is saved. Online road-map tiles reveal the viewed area to OpenStreetMap. A phone hotspot does not share the phone’s GPS. Use only as a passenger.",
      )
    )
      return;
    state.gpsStarting = true;
    $("#gps").textContent = "⌖ Finding you…";
    browserLocation.start(
      (fix) => {
        if (!state.gpsStarting && state.mode !== "gps") return;
        const previous = state.lastGPS;
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
        if (map && state.follow) map.setView(state.car, 15, { animate: false });
        buildings.forEach((marker, i) =>
          marker.setLatLng([
            state.car[0] + buildingDefs[i].offset[0],
            state.car[1] + buildingDefs[i].offset[1],
          ]),
        );
        updateActors();
      },
      (error) => {
        const messages = {
          1: "GPS permission was declined. Test Drive works without it.",
          2: "The tablet could not find a position. A hotspot does not provide phone GPS.",
          3: "GPS took too long. Try near a window, or use Test Drive.",
        };
        const message =
          messages[error.code] || "GPS unavailable. Test Drive is ready.";
        setTestDrive();
        story(message);
        toast(message);
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
    progress.gadgets++;
    save();
    sound(kind);
    if (kind === "shield") {
      state.shieldUntil = Date.now() + 12000;
      state.retreatUntil = Date.now() + 8000;
      $("#map-stage").classList.add("shielded");
      story(
        "Forcefield up! The cats bounce gently away, like marshmallows on a trampoline.",
      );
      toast("Forcefield active for 12 seconds. Boing!");
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
    return (
      base +
      '<ellipse cx="120" cy="118" rx="87" ry="8" fill="#c9d9c7"/><path d="M27 77 48 66 65 36Q105 27 143 38l31 29 30 7q16 6 12 27H24Z" fill="#74a8a2" stroke="#284952" stroke-width="4"/><path d="m68 42-15 26 45-1V39m8 0v28h57l-25-25Z" fill="#cbe3dc" stroke="#284952" stroke-width="3"/><path d="m25 83 19 1v13H25m172-15 17 5v11h-17" fill="#f3d89b" stroke="#284952" stroke-width="2"/><path d="M105 72v24m-48-18h12m51-1h12" stroke="#284952" stroke-width="3"/><g fill="#29434c" stroke="#284952" stroke-width="3"><circle cx="63" cy="104" r="18"/><circle cx="176" cy="104" r="18"/></g><g fill="#dce7d7"><circle cx="63" cy="104" r="8"/><circle cx="176" cy="104" r="8"/></g><path d="M74 27h56l10 8H66Z" fill="#d6aa6b" stroke="#284952" stroke-width="3"/></svg>'
    );
  }
  function setVehicle(type, announce = true) {
    progress.vehicle = type;
    save();
    $("#vehicle-art").innerHTML = vehicleSVG(type);
    $("#vehicle-name").textContent = {
      car: "Adventure Cruiser",
      plane: "Cloud Hopper",
      submarine: "Bubble Voyager",
    }[type];
    $$("[data-vehicle]").forEach((b) => {
      b.classList.toggle("selected", b.dataset.vehicle === type);
      b.setAttribute("aria-pressed", b.dataset.vehicle === type);
    });
    const emoji = { car: "🚙", plane: "✈️", submarine: "🤿" }[type];
    $("#actor-car").textContent = emoji;
    if (markers.car)
      markers.car.setIcon(
        L.divIcon({
          className: "leaflet-actor",
          html: `<div>${emoji}</div>`,
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
              "Wheels down. The Adventure Cruiser is ready for whatever Dylan dreams up.",
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
    const which = kind || (state.encounter++ % 2 === 0 ? "squid" : "vacuum");
    $("#encounter-art").textContent = which === "squid" ? "🦑🫧" : "🌪️🏘️";
    $("#encounter-title").textContent =
      which === "squid" ? "Squid at the car wash!" : "Mega House Vacuum!";
    $("#encounter-text").textContent =
      which === "squid"
        ? "Eight arms, one enormous soap sponge. The squid has tangled the car wash. How will your crew help?"
        : "“More powerful than a kitten tornado!” Metro cheers. The vacuum is lifting cartoon houses. Let’s bring them gently home.";
    $("#encounter-actions").replaceChildren();
    const choices =
      which === "squid"
        ? [
            [
              "Bubble tickles",
              "bubble",
              "The squid giggles, untangles every hose and gives the car a sparkling wash.",
            ],
            [
              "Ask Bad Cat to help",
              "puppy",
              "Bad Cat and Giant Puppy teach the squid a bubble dance. Now it runs the car wash!",
            ],
          ]
        : [
            [
              "Forcefield the houses",
              "shield",
              "The houses settle inside cosy forcefield bubbles. Everyone floats gently home.",
            ],
            [
              "Reverse the vacuum",
              "laser",
              "Dylan presses the big reverse button. Houses float down, and the vacuum blows a rainbow!",
            ],
          ];
    choices.forEach(([name, power, result]) => {
      const button = document.createElement("button");
      button.textContent = name;
      button.addEventListener("click", () => {
        dialog.close();
        gadget(power);
        story(result);
        toast(result);
      });
      $("#encounter-actions").append(button);
    });
    dialog.showModal();
    sound("sonar");
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
    if (online && tileLayer) {
      tileErrors = 0;
      tileLayer.redraw();
    }
  }
  $$("[data-view]").forEach((b) =>
    b.addEventListener("click", () => setView(b.dataset.view)),
  );
  $$("[data-gadget]").forEach((b) =>
    b.addEventListener("click", () => gadget(b.dataset.gadget)),
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
    newMission();
    toast("New mission received. Your story, your rules!");
  });
  $("#close-encounter").addEventListener("click", () => dialog.close());
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
      dialog.open ||
      state.view !== "drive"
    )
      return;
    const index = Number(event.key) - 1;
    if (index >= 0 && index < 6) {
      event.preventDefault();
      gadget(
        ["shield", "laser", "sonar", "bubble", "puppy", "encounter"][index],
      );
    }
  });
  window.addEventListener("online", updateConnection);
  window.addEventListener("offline", updateConnection);
  window.addEventListener("pagehide", () => browserLocation.stop());
  window.addEventListener("pageshow", (event) => {
    if (event.persisted && state.mode === "gps") {
      setTestDrive();
      toast("Welcome back. Tap Use my GPS to reconnect your location.");
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && audio) audio.suspend().catch(() => {});
  });
  initFallback();
  setVehicle(progress.vehicle, false);
  updateEquipment();
  renderInventions();
  updateConnection();
  save();
  updateActors();
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
  });
})();
