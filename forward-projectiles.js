/* Paw pads launch real projectiles straight ahead in every adventure mode. */
"use strict";
(() => {
  const layer = document.createElement("div");
  layer.id = "hero-projectiles";
  layer.setAttribute("aria-hidden", "true");
  document.body.append(layer);
  let shots = [],
    last = 0,
    cooldown = 0;
  const hero = () =>
    document.querySelector(
      window.badCatRoad?.visible() ? "#road-player" : "#world-vehicle",
    );
  const active = () =>
    !!window.badCatPlay?.active() && !window.badCatTargeting.raidActive();
  function ready() {
    return active() && cooldown <= 0 && !!hero();
  }
  function launch(power, invention) {
    if (!ready()) return false;
    const r = hero().getBoundingClientRect(),
      node = document.createElement("span");
    node.className = "hero-shot hero-shot-" + power;
    const recipe = invention && window.badCatInventions.recipe(invention);
    if (recipe) {
      node.textContent = recipe.item.picture;
      node.dataset.item = recipe.item.id;
      node.title = invention.name;
    } else if (power === "puppy") {
      const img = document.createElement("img");
      img.src = window.badCatSeason.asset("assets/captain-biscuit.png");
      img.alt = "";
      node.append(img);
    } else
      node.textContent = window.badCatSeason.powerIcon(
        power,
        { shield: "◈", laser: "✦", sonar: "◎", bubble: "🫧" }[power],
      );
    const shot = {
      node,
      power,
      invention,
      x: r.x + r.width / 2,
      y: r.top + 8,
      age: 0,
    };
    node.style.left = shot.x + "px";
    node.style.top = shot.y + "px";
    layer.append(node);
    shots.push(shot);
    cooldown = 0.22;
    return true;
  }
  // A swept segment prevents fast shots passing through a small moving target.
  function touches(a, b, rect, padding = 10) {
    const left = rect.left - padding,
      right = rect.right + padding;
    return (
      a.x >= left &&
      a.x <= right &&
      Math.max(a.y, b.y) >= rect.top - padding &&
      Math.min(a.y, b.y) <= rect.bottom + padding
    );
  }
  function pop(x, y) {
    const node = document.createElement("i");
    node.className = "shot-intercept";
    node.textContent = "✦";
    node.style.left = x + "px";
    node.style.top = y + "px";
    layer.append(node);
    setTimeout(() => node.remove(), 450);
  }
  function clear() {
    shots.forEach((s) => s.node.remove());
    shots = [];
    layer.replaceChildren();
  }
  function tick(dt) {
    const play = active();
    layer.hidden = !play;
    if (!play) return;
    cooldown = Math.max(0, cooldown - dt);
    for (const shot of [...shots]) {
      const previous = { x: shot.x, y: shot.y };
      shot.y -= dt * 480;
      shot.age += dt;
      shot.node.style.top = shot.y + "px";
      let hit = false;
      // Interceptions are geometric collisions, never taps or nearest-target assists.
      for (const node of document.querySelectorAll(
        ".villain-projectile,.field-bee",
      )) {
        const rect = node.getBoundingClientRect();
        if (!rect.width || !touches(previous, shot, rect, 8)) continue;
        const x = rect.x + rect.width / 2,
          y = rect.y + rect.height / 2;
        hit = node.matches(".villain-projectile")
          ? window.badCatCombat.hitAt(x, y)
          : window.badCatEncounters.hitAt(x, y);
        if (hit) {
          pop(x, y);
          break;
        }
      }
      if (!hit)
        for (const key of ["badcat", "metro", "captain"]) {
          const node = window.badCatTargeting.targetNode(key),
            rect = node?.getBoundingClientRect();
          if (!rect?.width || !touches(previous, shot, rect)) continue;
          hit = true;
          // Remove before callbacks: a hit may pause the world and clear all shots.
          shot.node.remove();
          shots = shots.filter((s) => s !== shot);
          window.badCatTargeting.forwardHit(
            key,
            node,
            shot.power,
            shot.invention,
          );
          break;
        }
      if (hit || shot.y < -60 || shot.age > 4) {
        shot.node.remove();
        shots = shots.filter((s) => s !== shot);
      }
      if (!active()) {
        clear();
        break;
      }
    }
  }
  function frame(now) {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    tick(dt);
    requestAnimationFrame(frame);
  }
  window.addEventListener("bad-cat-vehicle", clear);
  window.badCatProjectiles = {
    ready,
    launch,
    clear,
    diagnostics: () =>
      shots.map(({ x, y, power, invention }) => ({
        x,
        y,
        power,
        item: invention?.item || null,
      })),
  };
  requestAnimationFrame(frame);
})();
