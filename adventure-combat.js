/* Visible, rechargeable boosters and slow, dodgeable villain projectiles. */
"use strict";
(() => {
  const $ = (s) => document.querySelector(s),
    cast = ["badcat", "metro", "captain"];
  let owned = true,
    burst = 0,
    cooldown = 0,
    recovered = 0,
    elapsed = 0,
    immunity = 0,
    last = 0;
  let shots = [],
    windups = [],
    next = { badcat: 6, metro: 9, captain: 12 };
  try {
    owned =
      JSON.parse(localStorage.getItem("bad-cat-boosters-v1") || "null")
        ?.owned !== false;
  } catch {}
  const layer = document.createElement("div");
  layer.id = "villain-projectiles";
  document.body.append(layer);
  const rig = document.createElement("div");
  rig.className = "vehicle-booster-rig";
  rig.setAttribute("aria-hidden", "true");
  rig.innerHTML =
    '<i class="booster-pod pod-left"></i><i class="booster-pod pod-right"></i>';
  document.body.append(rig);
  const control = document.createElement("button");
  control.id = "booster-control";
  control.setAttribute("aria-label", "Activate vehicle boosters");
  control.innerHTML =
    '<span aria-hidden="true">🚀</span><b>BOOST</b><small></small><progress max="12" value="12" aria-label="Booster recharge"></progress>';
  document.body.append(control);
  function save() {
    try {
      localStorage.setItem("bad-cat-boosters-v1", JSON.stringify({ owned }));
    } catch {}
  }
  function active() {
    return window.badCatPlay.active();
  }
  function hero() {
    return window.badCatRoad.visible()
      ? $("#road-player")
      : $("#world-vehicle");
  }
  function nodeFor(key) {
    const node = document.querySelector(
      (window.badCatVehicle.worldActive() ? ".world-" : ".road-") + key,
    );
    return node &&
      !node.hidden &&
      node.getBoundingClientRect().width &&
      getComputedStyle(node).visibility !== "hidden"
      ? node
      : null;
  }
  function center(node) {
    const r = node.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }
  function clear() {
    next = { badcat: 6, metro: 9, captain: 12 };
    shots.forEach((s) => s.node.remove());
    shots = [];
    windups.forEach((w) => w.node.classList.remove("enemy-winding-up"));
    windups = [];
  }
  function recoverBoosters() {
    if (owned) return false;
    owned = true;
    recovered = 5;
    cooldown = 0;
    save();
    render();
    return true;
  }
  function boost() {
    if (!active() || !owned || cooldown > 0) return false;
    burst = 3;
    cooldown = 12;
    return true;
  }
  control.onclick = boost;
  window.addEventListener("keydown", (e) => {
    if (
      e.key.toLowerCase() === "b" &&
      !e.repeat &&
      !e.target.closest("input,textarea,select,dialog")
    )
      boost();
  });
  function art(key) {
    if(window.badCatSeason.active())return `<span class="christmas-missile">${key==="badcat"?"🎁":key==="metro"?"🍭":"🔔"}</span>`;
    if (key === "badcat") return '<img src="assets/kitten.png" alt="Kitten">';
    if (key === "captain")
      return '<img src="assets/inventions/acorns.svg" alt="Acorn">';
    return '<svg viewBox="0 0 80 80" aria-label="Spanner"><path d="M57 8q-20-2-23 19L7 54a10 10 0 0 0 16 16l27-27q21-3 20-23L57 34 45 22Z" fill="#b9e5f6" stroke="#234c76" stroke-width="5"/><circle cx="17" cy="61" r="4" fill="#234c76"/></svg>';
  }
  function launch(key) {
    if (!active() || shots.length >= 6) return false;
    const source = nodeFor(key),
      player = hero();
    if (!source || !player) return false;
    const from = center(source),
      to = center(player);
    const sourceBounds = source.getBoundingClientRect();
    if (key === "badcat") from.y = sourceBounds.top + sourceBounds.height * 0.8;
    if (key === "metro") {
      from.x = sourceBounds.left + sourceBounds.width * 0.72;
      from.y = sourceBounds.top + sourceBounds.height * 0.45;
    }
    const distance = Math.max(1, Math.hypot(to.x - from.x, to.y - from.y));
    const node = document.createElement("button");
    node.className = "villain-projectile projectile-" + key;
    node.setAttribute(
      "aria-label",
      `Shoot ${key === "badcat" ? "Bad Cat’s kitten" : key === "metro" ? "Metro’s spanner" : "Captain Squirrel’s acorn"}`,
    );
    node.innerHTML = art(key);
    layer.append(node);
    const shot = {
      node,
      key,
      x: from.x,
      y: from.y,
      vx: ((to.x - from.x) / distance) * 135,
      vy: ((to.y - from.y) / distance) * 135,
      age: 0,
    };
    shots.push(shot);
    node.style.left = shot.x + "px";
    node.style.top = shot.y + "px";
    node.onclick = () => {
      const p = center(node);
      window.badCatTargeting.shootAt(p.x, p.y);
    };
    return true;
  }
  function findHit(x, y) {
    return shots.some((s) => Math.hypot(s.x - x, s.y - y) < 38);
  }
  function hitAt(x, y) {
    const shot = shots.find((s) => Math.hypot(s.x - x, s.y - y) < 38);
    if (!shot) return false;
    shot.node.remove();
    shots = shots.filter((s) => s !== shot);
    return true;
  }
  function render() {
    const play = active(),
      player = hero();
    layer.hidden = !play;
    control.hidden = !play;
    rig.hidden = !play || !owned || !player;
    document.body.classList.toggle("boosting", play && burst > 0);
    if (!play) return;
    if (player) {
      const r = player.getBoundingClientRect();
      Object.assign(rig.style, {
        left: r.x + "px",
        top: r.y + "px",
        width: r.width + "px",
        height: r.height + "px",
      });
    }
    for (const key of ["badcat", "metro"]) {
      const node = nodeFor(key);
      if (!node) continue;
      let token = node.querySelector(".stolen-booster-token");
      if (!token) {
        token = document.createElement("span");
        token.className = "stolen-booster-token";
        token.textContent = "🚀";
        token.setAttribute("aria-label", "Carrying the stolen boosters");
        node.append(token);
      }
      token.hidden = owned;
    }
    control.disabled = !owned || cooldown > 0;
    control.querySelector("b").textContent = !owned
      ? "STOLEN"
      : burst > 0
        ? "BOOSTING!"
        : cooldown > 0
          ? "RECHARGING"
          : "BOOST";
    control.querySelector("small").textContent = !owned
      ? "Sonar or defeat the cats"
      : recovered > 0
        ? "Boosters recovered!"
        : cooldown > 0
          ? `${Math.ceil(cooldown)}s`
          : "Ready";
    control.querySelector("progress").value = owned ? 12 - cooldown : 0;
    rig.classList.toggle("boosters-recovered", recovered > 0);
    rig.classList.toggle("boosters-firing", burst > 0);
  }
  function tick(dt) {
    render();
    if (!active()) return;
    elapsed += dt;
    burst = Math.max(0, burst - dt);
    cooldown = Math.max(0, cooldown - dt);
    recovered = Math.max(0, recovered - dt);
    immunity = Math.max(0, immunity - dt);
    for (const key of cast) {
      next[key] -= dt;
      if (next[key] <= 0 && nodeFor(key)) {
        const node = nodeFor(key);
        node.classList.add("enemy-winding-up");
        windups.push({ key, node, remaining: 0.9 });
        next[key] = 7 + Math.random() * 5;
      }
    }
    windups = windups.filter((w) => {
      w.remaining -= dt;
      if (w.remaining > 0) return true;
      w.node.classList.remove("enemy-winding-up");
      launch(w.key);
      return false;
    });
    const player = hero(),
      p = player ? center(player) : null;
    shots = shots.filter((s) => {
      s.age += dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.node.style.left = s.x + "px";
      s.node.style.top = s.y + "px";
      s.node.style.rotate = s.age * 100 + "deg";
      if (p && Math.hypot(s.x - p.x, s.y - p.y) < 42) {
        if (burst <= 0 && immunity <= 0) {
          window.badCatCampaign.projectileHit();
          immunity = 1.5;
          player.classList.remove("vehicle-bonk");
          void player.offsetWidth;
          player.classList.add("vehicle-bonk");
        }
        s.node.remove();
        return false;
      }
      if (
        s.age > 9 ||
        s.x < -70 ||
        s.x > innerWidth + 70 ||
        s.y < -70 ||
        s.y > innerHeight + 70
      ) {
        s.node.remove();
        return false;
      }
      return true;
    });
    render();
  }
  function frame(now) {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    tick(dt);
    requestAnimationFrame(frame);
  }
  window.badCatCombat = {
    boost,
    launch,
    findHit,
    hitAt,
    clear,
    speed: () => (burst > 0 ? 1.9 : 1),
    stealBoosters: () => {
      owned = false;
      burst = 0;
      save();
      render();
    },
    recoverBoosters,
    recoverFromHit: (key, power, exposed) => {
      if (
        owned ||
        !["badcat", "metro"].includes(key) ||
        (!exposed && !["sonar", "puppy", "shield"].includes(power))
      )
        return false;
      return recoverBoosters();
    },
    diagnostics: () => ({
      owned,
      burst,
      cooldown,
      elapsed,
      immunity,
      shots: shots.map((s) => ({ key: s.key, x: s.x, y: s.y, age: s.age })),
      windups: windups.length,
    }),
  };
  requestAnimationFrame(frame);
})();
