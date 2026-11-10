/* A separate fictional scrolling-road adventure; never supplies coordinates to GPS. */
"use strict";
(() => {
  let hooks,
    root,
    enabled = false,
    x = 50,
    y = 74,
    elapsed = 0,
    nextSpawn = 3,
    nextTreat = 5,
    cooldown = 0,
    wasBusy = false,
    treats = [],
    keys = { left: false, right: false },
    activeEnemy = null,
    spawnIndex = 0,
    animationFrame = 0,
    lastFrame = 0;
  const cast = ["badcat", "metro", "captain"];
  const names = {
    badcat: "Bad Cat",
    metro: "Metro",
    captain: "Captain Squirrel",
  };
  const games = {
    badcat: ["spelling", "kittens"],
    metro: ["pipeworks", "vacuum"],
    captain: ["tornado", "puppy", "kittens"],
  };
  function visible() {
    return enabled && !window.badCatVehicle.worldActive();
  }
  function animate(now) {
    const dt = lastFrame ? Math.min((now - lastFrame) / 1000, 0.1) : 0;
    lastFrame = now;
    tick(dt);
    if (enabled) animationFrame = requestAnimationFrame(animate);
  }
  function change(on) {
    window.badCatCharacters.clearPlans?.();
    cancelAnimationFrame(animationFrame);
    lastFrame = 0;
    enabled = on;
    window.badCatProjectiles?.clear();
    root.hidden = !visible();
    document.body.classList.toggle("road-mode", on);
    keys = { left: false, right: false };
    if (on) {
      elapsed = 0;
      ((spawnIndex = 0), (animationFrame = 0), (lastFrame = 0));
      nextSpawn = 3;
      cooldown = 3;
      treats.forEach((b) => b.node.remove());
      treats = [];
      cast.forEach((k) => (root.querySelector(".road-" + k).hidden = true));
      activeEnemy = null;
      x = 50;
      y = 74;
      render();
      animationFrame = requestAnimationFrame(animate);
    }
  }
  function render() {
    const walking = window.badCatVehicle.mode() === "walking";
    const playerImage = root.querySelector("#road-player img");
    const image = window.badCatSeason.asset(
      walking ? "assets/dylan.png" : "assets/road-odyssey.png",
    );
    if (!playerImage.src.endsWith(image)) playerImage.src = image;
    playerImage.alt = walking
      ? "Dylan the Dalmatian puppy"
      : "White Honda Odyssey";
    root.hidden = !visible();
    root.style.setProperty("--road-x", x + "%");
    root.style.setProperty("--road-y", y + "%");
    root.style.setProperty("--road-scroll", ((elapsed * 140) % 1880) + "px");
    root
      .querySelectorAll(".road-trees span")
      .forEach(
        (n, i) => (n.style.top = ((i * 17 + elapsed * 18) % 120) - 10 + "%"),
      );
    root.classList.toggle("road-paused", !hooks.active());
    root.querySelector("#road-distance").textContent =
      `${Math.floor(elapsed * 12)} adventure metres`;
  }
  function spawn() {
    const key = cast[spawnIndex++ % cast.length];
    activeEnemy = key;
    const b = root.querySelector(".road-" + key);
    const visible = cast.filter(
      (k) => k !== key && !root.querySelector(".road-" + k).hidden,
    );
    if (visible.length >= 2)
      root.querySelector(".road-" + visible[0]).hidden = true;
    b.hidden = false;
    b.classList.add("road-arrival");
    setTimeout(() => b.classList.remove("road-arrival"), 900);
    window.badCatCharacters.talk(key);
    root.querySelector("#road-radio").textContent =
      `${names[key]} popped up! Aim a launcher to interrupt the plan.`;
    return key;
  }
  function deploy(kind, key) {
    if (!visible() || cooldown > 0 || window.badCatAdventure.isOpen())
      return false;
    const choices = games[key] || games.badcat;
    const game = choices[Math.floor(Math.random() * choices.length)];
    root.querySelector("#road-radio").textContent =
      `${names[key] || "The villains"} launched a surprise!`;
    hooks.surprise(game);
    cooldown = 20;
    wasBusy = true;
    return true;
  }
  function fire() {
    if (!visible() || !hooks.active()) return false;
    if (!window.badCatTargeting.diagnostics().armed)
      window.badCatArsenal.arm(1);
    return window.badCatTargeting.fireForward();
  }
  function move(value) {
    x = Math.max(24, Math.min(76, value));
  }
  function tick(dt) {
    if (!enabled) return;
    const busy = window.badCatAdventure.isOpen();
    if (wasBusy && !busy) {
      cooldown = 20;
      cast.forEach((k) => (root.querySelector(".road-" + k).hidden = true));
      activeEnemy = null;
      nextSpawn = 4;
    }
    wasBusy = busy;
    if (busy) {
      keys = { left: false, right: false, fire: false };
    }
    if (!visible() || !hooks.active()) {
      root.hidden = !visible();
      root.classList.add("road-paused");
      return;
    }
    elapsed +=
      dt *
      window.badCatCampaign.motionScale() *
      window.badCatAdventure.motionScale() *
      (window.badCatCombat?.speed() || 1);
    if (keys.fire) fire();
    cooldown = Math.max(0, cooldown - dt);
    nextSpawn -= dt;
    nextTreat -= dt;
    move(x + (Number(keys.right) - Number(keys.left)) * dt * 35);
    if (nextSpawn <= 0) {
      spawn();
      nextSpawn = 10;
    }
    cast.forEach((key, i) => {
      const b = root.querySelector(".road-" + key);
      b.style.left = 25 + i * 25 + Math.sin(elapsed * 0.7 + i) * 9 + "%";
      b.style.top = 38 + (i % 2) * 13 + Math.sin(elapsed * 0.8 + i) * 3 + "%";
    });
    if (nextTreat <= 0) {
      const node = document.createElement("span");
      node.className = "road-treat";
      node.textContent = "🍪";
      root.querySelector(".road-playfield").append(node);
      treats.push({ x: 26 + Math.random() * 48, y: 3, node });
      nextTreat = 8;
    }
    for (const t of treats) {
      t.y += dt * 21;
      t.node.style.left = t.x + "%";
      t.node.style.top = t.y + "%";
      if (Math.abs(t.y - y) < 7 && Math.abs(t.x - x) < 8) {
        window.badCatCampaign.awardTreats(1);
        t.y = 110;
        root.querySelector("#road-radio").textContent =
          "Treat caught! Spend it on your Puppy House.";
      }
    }
    treats = treats.filter((t) => {
      if (t.y > 100) {
        t.node.remove();
        return false;
      }
      return true;
    });
    render();
  }
  function init(h) {
    hooks = h;
    root = document.createElement("section");
    root.id = "road-world";
    root.hidden = true;
    root.innerHTML = `<div class="road-playfield"><div class="road-verge"></div><div class="road-asphalt"><i></i><i></i></div><div class="road-trees">${Array.from({ length: 12 }, (_, i) => `<span style="--tree:${i}">🌳</span>`).join("")}</div>${cast.map((k) => `<button class="road-enemy road-${k}" aria-label="Target ${names[k]}" hidden><img src="assets/${k === "badcat" ? "bad-cat-balloon" : k === "metro" ? "metro-bus" : "captain-squirrel"}.png" alt="${k === "badcat" ? "Bad Cat riding his hot-air balloon" : k === "metro" ? "Metro driving his Austin city bus" : names[k]}"></button>`).join("")}<div id="road-player"><img src="assets/road-odyssey.png" alt="Dylan’s white Honda Odyssey driving up the road"></div></div><div class="road-hud"><b>ROAD ADVENTURE</b><span id="road-distance"></span><p id="road-radio" role="status">Steer, catch treats, and stop the villains’ surprise plans!</p></div><div class="road-controls"><button id="road-left" aria-label="Steer left">◀</button><button id="road-fire">✦ Fire launcher</button><button id="road-right" aria-label="Steer right">▶</button></div>`;
    document.querySelector("#map-stage").append(root);
    cast.forEach(
      (k) =>
        (root.querySelector(".road-" + k).onclick = () =>
          window.badCatTargeting.target(k, root.querySelector(".road-" + k))),
    );
    for (const direction of ["left", "right"]) {
      const b = root.querySelector("#road-" + direction);
      b.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        keys[direction] = true;
        try {
          b.setPointerCapture(e.pointerId);
        } catch {}
      });
      for (const ev of ["pointerup", "pointercancel", "lostpointercapture"])
        b.addEventListener(ev, () => (keys[direction] = false));
      b.onclick = () => move(x + (direction === "left" ? -9 : 9));
    }
    const fireButton = root.querySelector("#road-fire");
    fireButton.onclick = fire;
    fireButton.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      keys.fire = true;
      fire();
      try {
        fireButton.setPointerCapture(e.pointerId);
      } catch {}
    });
    for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
      fireButton.addEventListener(event, () => (keys.fire = false));
    const player = root.querySelector("#road-player");
    let dragging = false;
    player.querySelector("img").draggable = false;
    player.onpointerdown = (e) => {
      e.preventDefault();
      if (!hooks.active()) return;
      dragging = true;
      player.setPointerCapture(e.pointerId);
    };
    player.onpointermove = (e) => {
      if (!dragging) return;
      const r = root.getBoundingClientRect();
      move(((e.clientX - r.left) / r.width) * 100);
      render();
    };
    player.onpointerup = player.onpointercancel = () => (dragging = false);
    window.addEventListener("keydown", (e) => {
      if (
        !visible() ||
        !hooks.active() ||
        e.target.closest("input,select,textarea,dialog")
      )
        return;
      if (e.code === "Space") {
        e.preventDefault();
        fire();
      }
    });
    window.addEventListener("keyup", (e) => {
      if (["ArrowLeft", "a", "A"].includes(e.key)) keys.left = false;
      if (["ArrowRight", "d", "D"].includes(e.key)) keys.right = false;
    });
    window.addEventListener(
      "blur",
      () => (keys = { left: false, right: false }),
    );
  }
  window.badCatRoad = {
    init,
    change,
    tick,
    deploy,
    fire,
    visible,
    dismiss: (key) => {
      root.querySelector(".road-" + key)?.setAttribute("hidden", "");
      activeEnemy = null;
      nextSpawn = 8;
    },
    steer: (dx, dy) => {
      move(x + dx);
      y = Math.max(25, Math.min(84, y + dy));
      render();
    },
    diagnostics: () => ({
      enabled,
      visible: visible(),
      x,
      y,
      elapsed,
      activeEnemy,
      shots: window.badCatProjectiles?.diagnostics().length || 0,
      treats: treats.length,
      cooldown,
    }),
  };
})();
