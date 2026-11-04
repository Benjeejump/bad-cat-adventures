/* Fictional supply drops anchored near the current car. Only inventory is saved. */
"use strict";
(() => {
  const KEY = "bad-cat-inventory-v1";
  const types = {
    net: {
      name: "Long-reach net",
      icon: "🥅",
      text: "Net reach increases by 10 metres.",
    },
    bubble: {
      name: "Bubble amplifier",
      icon: "🫧",
      text: "Bubble hits can clear nearby kittens too.",
    },
    shield: {
      name: "Forcefield cell",
      icon: "◈",
      text: "Forcefields last five seconds longer.",
    },
    laser: {
      name: "Rainbow power pack",
      icon: "✦",
      text: "Targeted confetti effects last three seconds longer.",
    },
    sonar: {
      name: "Sonar lens",
      icon: "◎",
      text: "Sonar reveals last three seconds longer.",
    },
    snacks: {
      name: "Puppy snack crate",
      icon: "🍪",
      text: "Three supplies for the puppy squad.",
    },
    repair: {
      name: "Odyssey repair kit",
      icon: "🛠️",
      text: "Repairs 25% condition and clears gadget jams.",
    },
  };
  let saved = {},
    hooks,
    map,
    marker,
    drop = null,
    armed = false,
    car = null,
    mode = "waiting",
    accuracy = Infinity,
    last = null,
    travelled = 0,
    foreground = 0,
    nextDistance = 150,
    captured = 0,
    fallbackNode = null;
  const levels = { net: 0, bubble: 0, shield: 0, laser: 0, sonar: 0 };
  try {
    saved = JSON.parse(localStorage.getItem(KEY) || "{}") || {};
    for (const key of Object.keys(levels))
      if (Number.isInteger(saved.levels?.[key]))
        levels[key] = Math.max(0, Math.min(3, saved.levels[key]));
    if (Number.isInteger(saved.captured))
      captured = Math.max(0, Math.min(99999, saved.captured));
  } catch {
    /* Inventory is optional in private mode. */
  }
  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify({ levels, captured }));
    } catch {
      hooks.say("Upgrade caught for this visit. Storage is unavailable.");
    }
    render();
  }
  const reach = () => 25 + levels.net * 10;
  function render() {
    document.querySelector("#inventory-readout").textContent =
      `${captured} drops caught · Net reach ${reach()} m · Bubble ${levels.bubble}/3 · Forcefield ${levels.shield}/3 · Laser ${levels.laser}/3 · Sonar ${levels.sonar}/3`;
    document.querySelector("#net-launch").classList.toggle("net-armed", armed);
    document.querySelector("#net-hint").hidden = !armed;
    if (!drop)
      document.querySelector("#net-hint-text").textContent =
        "Net ready · explore for a supply drop";
  }
  function select() {
    if (!car || !["gps", "test"].includes(mode)) {
      hooks.say(
        "Find your tablet’s GPS position or explicitly choose Test Drive before catching map drops.",
      );
      return;
    }
    armed = !armed;
    if (armed) window.badCatTargeting.cancel();
    render();
    position();
  }
  function clear() {
    if (marker && map) map.removeLayer(marker);
    marker = null;
    fallbackNode?.remove();
    fallbackNode = null;
    drop = null;
  }
  function spawn(heading) {
    const keys = Object.keys(types),
      key = keys[Math.floor(Math.random() * keys.length)],
      metres = captured === 0 ? 18 : 30 + Math.random() * 20,
      angle = Number.isFinite(heading) ? heading : Math.random() * Math.PI * 2;
    const north = Math.cos(angle) * metres,
      east = Math.sin(angle) * metres;
    drop = {
      key,
      point: [
        car[0] + north / 111320,
        car[1] +
          east / (111320 * Math.max(0.2, Math.cos((car[0] * Math.PI) / 180))),
      ],
      age: 0,
    };
    fallbackNode = document.createElement("button");
    fallbackNode.className = "loot-fallback";
    fallbackNode.setAttribute("aria-label", `Supply drop: ${types[key].name}`);
    fallbackNode.innerHTML = `<span>${types[key].icon}</span><small>SUPPLY DROP</small>`;
    fallbackNode.addEventListener("click", catchDrop);
    document.querySelector("#map-stage").append(fallbackNode);
    if (map) {
      marker = L.marker(drop.point, {
        icon: L.divIcon({
          className: "loot-marker",
          html: `<div><span>${types[key].icon}</span><small>SUPPLY DROP</small></div>`,
          iconSize: [62, 62],
          iconAnchor: [31, 31],
        }),
        title: `Fictional supply drop: ${types[key].name}`,
      })
        .addTo(map)
        .on("click", catchDrop);
    }
    hooks.say(
      "Supply drop spotted! Get close, select the Net, then tap the parcel.",
    );
    position();
  }
  function position() {
    if (!drop || !car) return;
    const distance = Math.round(hooks.metres(car, drop.point));
    document.querySelector("#net-hint-text").textContent =
      `Net ready · drop ${distance} m away · reach ${reach()} m${distance > reach() ? " · get closer" : ""}`;
    if (!fallbackNode || !map) return;
    const c = map.latLngToContainerPoint(car),
      p = map.latLngToContainerPoint(drop.point),
      carNode = document.querySelector("#actor-car").getBoundingClientRect(),
      stage = document.querySelector("#map-stage").getBoundingClientRect();
    const x = Math.max(
        45,
        Math.min(
          stage.width - 160,
          carNode.x + carNode.width / 2 - stage.x + p.x - c.x,
        ),
      ),
      y = Math.max(
        210,
        Math.min(
          stage.height - 125,
          carNode.y + carNode.height / 2 - stage.y + p.y - c.y,
        ),
      );
    fallbackNode.style.left = `${x}px`;
    fallbackNode.style.top = `${y}px`;
  }
  function catchDrop() {
    if (!drop) return;
    if (!car) {
      hooks.say("Wait for a reliable GPS position before casting the net.");
      return;
    }
    if (!armed) {
      hooks.say("Select the Net on the right, then tap this supply drop.");
      return;
    }
    if (mode === "gps" && accuracy > 75) {
      hooks.say(
        "GPS is too uncertain to aim the net. Wait for a better position fix.",
      );
      return;
    }
    if (hooks.metres(car, drop.point) > reach()) {
      hooks.say(
        `Out of reach! The net reaches ${reach()} metres. Get closer to this drop.`,
      );
      return;
    }
    const item = types[drop.key],
      key = drop.key;
    let resultText = item.text;
    const fx = document.createElement("div");
    fx.className = "net-catch-effect";
    fx.innerHTML = '<img src="assets/net.svg" alt="">';
    const stage = document.querySelector("#map-stage");
    const targetNode =
      stage.classList.contains("has-map") &&
      !stage.classList.contains("no-tiles")
        ? marker?.getElement()
        : fallbackNode;
    const rect = (targetNode || fallbackNode).getBoundingClientRect();
    fx.style.left = `${rect.x}px`;
    fx.style.top = `${rect.y}px`;
    document.body.append(fx);
    setTimeout(() => fx.remove(), 1000);
    if (key === "snacks") window.badCatCampaign.resupply();
    else if (key === "repair") window.badCatCampaign.repair();
    else if (levels[key] < 3) levels[key]++;
    else {
      window.badCatCampaign.reward();
      resultText = "Already fully upgraded—converted into one supply.";
    }
    captured++;
    armed = false;
    clear();
    persist();
    travelled = 0;
    nextDistance = 120 + Math.random() * 120;
    hooks.sound("puppy");
    hooks.say(`Caught: ${item.name}! ${resultText}`);
    render();
  }
  function update(dt, point, currentMode, currentAccuracy, heading) {
    const source = currentMode === "test" ? "test" : "gps";
    if (source !== mode) {
      clear();
      last = null;
      foreground = 0;
      travelled = 0;
      armed = false;
      mode = source;
      render();
    }
    car = ["gps", "test"].includes(currentMode) ? point : null;
    accuracy = currentAccuracy;
    if (
      !car ||
      hooks.view() !== "drive" ||
      document.hidden ||
      hooks.paused() ||
      window.badCatAdventure.isOpen()
    )
      return;
    if (last) {
      const d = hooks.metres(last, car);
      if (d > 1 && d < 150) travelled += d;
    }
    last = [...car];
    foreground += dt;
    if (drop) {
      drop.age += dt;
      if (drop.age > 90 || hooks.metres(car, drop.point) > 250) clear();
      else position();
    } else if (
      foreground >= 6 &&
      (captured === 0 || travelled >= nextDistance) &&
      (mode === "test" || accuracy <= 75)
    )
      spawn(heading);
  }
  function init(h) {
    hooks = h;
    const hint = document.createElement("div");
    hint.id = "net-hint";
    hint.hidden = true;
    hint.innerHTML =
      '<span id="net-hint-text">Net ready · explore for a supply drop</span><button id="cancel-net" aria-label="Put the net away">×</button>';
    document.body.append(hint);
    document.querySelector("#cancel-net").addEventListener("click", () => {
      armed = false;
      render();
    });
    document.querySelector("#net-launch").addEventListener("click", select);
    const card = document.createElement("section");
    card.className = "panel hq-card";
    card.innerHTML =
      '<span class="hq-icon">🎒</span><h2>Dylan’s arsenal</h2><p id="inventory-readout"></p><p>Catch fictional map drops with your net. Gadget upgrades work across adventures and stay on this tablet. Drop positions are never saved.</p>';
    document.querySelector(".hq-grid").append(card);
    render();
  }
  window.badCatLoot = {
    init,
    attachMap: (m) => (map = m),
    update,
    level: (key) => levels[key] || 0,
    cancel: () => {
      armed = false;
      render();
    },
    diagnostics: () => ({
      armed,
      captured,
      distanceToNextDrop: Math.max(0, Math.round(nextDistance - travelled)),
      foregroundSeconds: Math.round(foreground),
      levels: { ...levels },
      reachMetres: reach(),
      drop: drop
        ? {
            type: drop.key,
            distanceMetres: car
              ? Math.round(hooks.metres(car, drop.point))
              : null,
          }
        : null,
    }),
  };
})();
