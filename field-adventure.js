/* A single, local adventure world: steering, avoidable bees and netted messages. */
"use strict";
(() => {
  let bees = [],
    bottle = null,
    nextBees = 24,
    nextBottle = 38,
    elapsed = 0,
    last = 0;
  const defeatedAt = {},
    held = new Set(),
    offsets = {};
  const $ = (s) => document.querySelector(s);
  const layer = document.createElement("div");
  layer.id = "field-encounters";
  document.body.append(layer);
  const pad = document.createElement("nav");
  pad.id = "movement-pad";
  pad.setAttribute("aria-label", "Move Dylan");
  pad.innerHTML =
    '<button data-move="up" aria-label="Move up">▲</button><button data-move="left" aria-label="Move left">◀</button><span aria-hidden="true">●</span><button data-move="right" aria-label="Move right">▶</button><button data-move="down" aria-label="Move down">▼</button>';
  document.body.append(pad);
  function playing() {
    return window.badCatPlay.active();
  }
  function hero() {
    return window.badCatRoad.visible()
      ? $("#road-player")
      : $("#world-vehicle");
  }
  function center(node) {
    const r = node.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }
  function clearBees() {
    bees.forEach((b) => b.node.remove());
    bees = [];
    nextBees = 35 + Math.random() * 25;
  }
  function spawnBees() {
    if (bees.length || !playing()) return false;
    for (let i = 0; i < 5; i++) {
      const node = document.createElement("button");
      node.className = "field-bee";
      node.setAttribute(
        "aria-label",
        window.badCatSeason.active()
          ? "Launcher target: Christmas jingle bee"
          : "Launcher target: spelling bee",
      );
      node.innerHTML = '<img src="assets/spelling-bee.png" alt="Bee">';
      const bee = {
        node,
        x: 55 + Math.random() * Math.max(1, innerWidth - 110),
        y: 105 + Math.random() * Math.min(140, innerHeight * 0.2),
        age: 0,
        vx: (Math.random() < 0.5 ? -1 : 1) * (35 + Math.random() * 35),
        vy: 15 + Math.random() * 30,
        turnIn: 0.4 + Math.random() * 1.3,
        phase: Math.random() * Math.PI * 2,
      };
      bees.push(bee);
      layer.append(node);
      node.onclick = () => {
        const p = center(node);
        window.badCatTargeting.shootAt(p.x, p.y);
      };
    }
    return true;
  }
  function spawnBottle() {
    if (bottle || !playing()) return false;
    const node = document.createElement("button");
    node.className = "message-bottle";
    node.setAttribute(
      "aria-label",
      window.badCatSeason.active()
        ? "Catch Santa’s letter in a bottle with your net"
        : "Catch the message in a bottle with your net",
    );
    node.innerHTML =
      '<svg viewBox="0 0 80 110" aria-hidden="true"><path d="M30 6h20v24l14 16v51q0 8-8 8H24q-8 0-8-8V46l14-16Z" fill="#79dedbcc" stroke="#fff1c5" stroke-width="4"/><path d="M28 7h24v11H28Z" fill="#c09256"/><path d="M25 49h30v39H25Z" fill="#fff1c5"/><path d="m29 57 22 0m-22 9h22m-22 9h16" stroke="#527998" stroke-width="3"/></svg>';
    bottle = { node, x: innerWidth * 0.68, y: innerHeight * 0.43, age: 0 };
    layer.append(node);
    node.onclick = () => {
      if (!playing()) return;
      if (!window.badCatLoot.diagnostics().armed) {
        node.classList.remove("bottle-wiggle");
        void node.offsetWidth;
        node.classList.add("bottle-wiggle");
        return;
      }
      node.remove();
      bottle = null;
      window.badCatLoot.cancel();
      nextBottle = 60 + Math.random() * 25;
      if (window.badCatHandwriting.open()) $("#pencil-begin").click();
    };
    return true;
  }
  function findHit(x, y) {
    return bees.some(
      (b) => Math.hypot(center(b.node).x - x, center(b.node).y - y) < 45,
    );
  }
  function hitAt(x, y) {
    const b = bees.find(
      (b) => Math.hypot(center(b.node).x - x, center(b.node).y - y) < 45,
    );
    if (!b) return false;
    b.node.remove();
    bees = bees.filter((v) => v !== b);
    if (!bees.length) nextBees = 35 + Math.random() * 25;
    return true;
  }
  function defeated(key) {
    if (!playing() || elapsed - (defeatedAt[key] ?? -100) < 30) return false;
    defeatedAt[key] = elapsed;
    window.badCatCampaign.awardTreats(1);
    window.badCatCharacters.resetField?.(key);
    window.badCatRoad.dismiss?.(key);
    clearBees();
    const options =
      key === "metro"
        ? ["pipeworks", "vacuum"]
        : key === "captain"
          ? ["puppy", "tornado"]
          : ["badcat", "kittens"];
    window.badCatAdventure.encounter(
      options[Math.floor(Math.random() * options.length)],
    );
    return true;
  }
  function steer(dx, dy, dt) {
    if (window.badCatRoad.visible()) {
      window.badCatRoad.steer(
        dx * dt * 35 * (window.badCatCombat?.speed() || 1),
        dy * dt * 35 * (window.badCatCombat?.speed() || 1),
      );
      return;
    }
    const node = hero();
    if (!node) return;
    const mode = window.badCatVehicle.mode(),
      o = (offsets[mode] ??= { x: 0, y: 0 });
    const r = node.getBoundingClientRect(),
      speed =
        Math.min(innerWidth, innerHeight) *
        0.32 *
        (window.badCatCombat?.speed() || 1);
    const nx = Math.max(
      12 - r.left,
      Math.min(innerWidth - 12 - r.right, dx * dt * speed),
    );
    const ny = Math.max(
      80 - r.top,
      Math.min(innerHeight - 90 - r.bottom, dy * dt * speed),
    );
    o.x += nx;
    o.y += ny;
    node.style.translate = `${o.x}px ${o.y}px`;
  }
  function resetInput() {
    held.clear();
  }
  pad.querySelectorAll("button").forEach((b) => {
    b.onpointerdown = (e) => {
      e.preventDefault();
      held.add(b.dataset.move);
      b.setPointerCapture(e.pointerId);
    };
    for (const ev of ["pointerup", "pointercancel", "lostpointercapture"])
      b.addEventListener(ev, () => held.delete(b.dataset.move));
  });
  const directions = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    w: "up",
    s: "down",
    a: "left",
    d: "right",
  };
  window.addEventListener("keydown", (e) => {
    if (
      !playing() ||
      e.target.closest("input,textarea,select,dialog") ||
      !directions[e.key]
    )
      return;
    e.preventDefault();
    held.add(directions[e.key]);
  });
  window.addEventListener("keyup", (e) => held.delete(directions[e.key]));
  window.addEventListener("blur", resetInput);
  document.addEventListener("visibilitychange", resetInput);
  function frame(now) {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    const active = playing();
    document.body.classList.toggle("game-paused", !active);
    pad.hidden = !active;
    layer.hidden = !active;
    if (active) {
      elapsed += dt;
      steer(
        Number(held.has("right")) - Number(held.has("left")),
        Number(held.has("down")) - Number(held.has("up")),
        dt,
      );
      nextBees -= dt;
      nextBottle -= dt;
      if (nextBees <= 0 && !bees.length) spawnBees();
      if (nextBottle <= 0 && !bottle) spawnBottle();
      const player = hero(),
        p = player ? center(player) : null;
      for (const b of [...bees]) {
        b.age += dt;
        b.turnIn -= dt;
        if (b.turnIn <= 0) {
          b.vx =
            Math.cos(Math.random() * Math.PI * 2) * (30 + Math.random() * 45);
          b.vy = -12 + Math.random() * 65;
          b.turnIn = 0.6 + Math.random() * 1.7;
        }
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.x < 38 || b.x > innerWidth - 38) b.vx *= -1;
        b.x = Math.max(38, Math.min(innerWidth - 38, b.x));
        if (b.y < 90) {
          b.y = 90;
          b.vy = Math.abs(b.vy);
        }
        b.node.style.left = b.x + "px";
        b.node.style.top = b.y + "px";
        if (p && Math.hypot(p.x - b.x, p.y - b.y) < 46) {
          clearBees();
          window.badCatAdventure.encounter("spelling");
          break;
        }
        if (b.y > innerHeight + 60) {
          b.node.remove();
          bees = bees.filter((v) => v !== b);
          if (!bees.length) nextBees = 35;
        }
      }
      if (bottle) {
        bottle.age += dt;
        bottle.node.style.left = bottle.x + "px";
        bottle.node.style.top = bottle.y + Math.sin(bottle.age) * 14 + "px";
        if (bottle.age > 90) {
          bottle.node.remove();
          bottle = null;
          nextBottle = 40;
        }
      }
    } else resetInput();
    requestAnimationFrame(frame);
  }
  // GPS is retired. These old entry points are removed after the main app has bound its UI.
  [
    "#journey-mode-bar",
    "#location-gate",
    "#gps",
    "#test-drive",
    "#retry-gps",
    "#follow",
    ".speed-label",
    "#distance",
    "#place-status",
    ".map-key",
  ].forEach((s) =>
    document.querySelectorAll(s).forEach((n) => {
      n.dataset.retired = "true";
      n.hidden = true;
    }),
  );
  $("#net-launch b").textContent = "Net · catch messages";
  const choice = $("#launch-journey");
  choice.innerHTML = '<option value="road">Adventure</option>';
  choice.hidden = true;
  window.badCatEncounters = {
    spawnBees,
    spawnBottle,
    findHit,
    hitAt,
    defeated,
    clear: () => {
      clearBees();
      bottle?.node.remove();
      bottle = null;
      nextBottle = 45;
    },
    diagnostics: () => ({
      bees: bees.length,
      beePositions: bees.map((b) => ({ x: b.x, y: b.y, vx: b.vx, vy: b.vy })),
      active: playing(),
      bottle: !!bottle,
      elapsed,
      defeated: { ...defeatedAt },
    }),
  };
  let lastWidth = innerWidth,
    lastHeight = innerHeight;
  window.addEventListener("resize", () => {
    for (const object of [...bees, ...(bottle ? [bottle] : [])]) {
      object.x = Math.max(
        40,
        Math.min(innerWidth - 40, (object.x / lastWidth) * innerWidth),
      );
      object.y = Math.max(
        90,
        Math.min(innerHeight - 90, (object.y / lastHeight) * innerHeight),
      );
    }
    lastWidth = innerWidth;
    lastHeight = innerHeight;
  });
  requestAnimationFrame(frame);
})();
