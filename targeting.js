/* Gadget -> character targeting and the timed, forgiving 20-kitten raid. */
"use strict";
(() => {
  const $ = (s) => document.querySelector(s);
  const names = {
    shield: "Forcefield",
    laser: "Confetti laser",
    sonar: "Sonar",
    bubble: "Bubble blaster",
    puppy: "Puppy squad",
  };
  const emoji = {
    shield: "◈",
    laser: "✦",
    sonar: "◎",
    bubble: "🫧",
    puppy: "🐶",
  };
  let hooks,
    armed = null,
    selected = null,
    raid = null;
  let movers = [],
    animationFrame = 0,
    lastFrame = 0;
  function update() {
    const bar = $("#target-bar");
    bar.hidden = !armed && !selected;
    $("#target-instruction").textContent = armed
      ? `${names[armed]} ready — tap ${raid ? "a kitten" : "BC or M"}!`
      : `${selected === "badcat" ? "BC" : "M"} selected — choose a gadget.`;
    document.querySelectorAll("[data-gadget]").forEach((b) => {
      b.classList.toggle("aiming", b.dataset.gadget === armed);
      b.setAttribute("aria-pressed", b.dataset.gadget === armed);
    });
  }
  function arm(power) {
    if (!names[power]) return;
    armed = power;
    if (selected) {
      target(selected, document.querySelector(`#actor-${selected}`));
      selected = null;
    }
    update();
  }
  function impact(node, power) {
    if (!node) return;
    node.classList.remove("target-impact");
    void node.offsetWidth;
    node.classList.add("target-impact");
    const rect = node.getBoundingClientRect(),
      fx = document.createElement("span");
    fx.className = "target-pop";
    fx.textContent = emoji[power];
    fx.style.left = `${rect.x + rect.width / 2}px`;
    fx.style.top = `${rect.y}px`;
    document.body.append(fx);
    setTimeout(() => {
      fx.remove();
      node.classList.remove("target-impact");
    }, 1000);
  }
  function target(character, node) {
    if (!armed) {
      selected = character;
      update();
      return;
    }
    const power = armed;
    if (hooks.apply(power, character) === false) return;
    impact(node, power);
    const line = {
      shield: "boings away from your shield",
      laser: "gets covered in rainbow confetti",
      sonar: "is revealed by a giant sonar ping",
      bubble: "floats away in a wobbly bubble",
      puppy: "is led away by the puppy squad",
    }[power];
    hooks.story(`${character === "badcat" ? "BC" : "M"} ${line}!`);
    selected = null;
    update();
  }
  function startRaid() {
    if (raid) return;
    selected = null;
    armed = null;
    raid = {
      remaining: 20,
      seconds: window.badCatCampaign.raidSeconds(),
      cleared: 0,
    };
    document.body.classList.add("raid-active");
    $("#kitten-raid").hidden = false;
    $("#kitten-field").replaceChildren();
    movers = [];
    for (let i = 0; i < 20; i++) {
      const b = document.createElement("button");
      b.className = "kitten-target";
      b.setAttribute("aria-label", `Kitten ${i + 1}`);
      b.dataset.kitten = String(i + 1);
      b.style.setProperty("--arrive-delay", `${i * 0.06}s`);
      b.style.setProperty("--kitten-hue", `${(i % 5) * 16}deg`);
      b.innerHTML = `<span class="kitten-emoji" aria-hidden="true">${["🐱", "😺", "😸", "😼", "🙀"][i % 5]}</span><small>${i + 1}</small>`;
      b.addEventListener("click", () => {
        if (!raid || b.disabled) return;
        if (!armed) {
          $("#target-instruction").textContent =
            "Choose a gadget on the right, then tap a kitten!";
          return;
        }
        if (!window.badCatCampaign.raidUse(armed, raid.cleared)) return;
        b.disabled = true;
        impact(b, armed);
        b.classList.add("kitten-cleared");
        hooks.sound(armed);
        raid.remaining--;
        raid.cleared++;
        $("#raid-count").textContent = `${raid.remaining} kittens left`;
        if (!raid.remaining) finishRaid(true);
      });
      $("#kitten-field").append(b);
      movers.push({
        node: b,
        x: ((i % 5) + 0.5) / 5,
        y: (Math.floor(i / 5) + 0.5) / 4,
        vx: (Math.random() < 0.5 ? -1 : 1) * (18 + Math.random() * 22),
        vy: (Math.random() < 0.5 ? -1 : 1) * (14 + Math.random() * 20),
      });
    }
    startDrift();
    arm("bubble");
    $("#raid-count").textContent = "20 kittens left";
    $("#raid-time").textContent = String(raid.seconds);
    $("#raid-progress").max = raid.seconds;
    $("#raid-progress").value = raid.seconds;
    $("#raid-close").focus();
  }
  function startDrift() {
    cancelAnimationFrame(animationFrame);
    lastFrame = 0;
    let oldWidth = 0,
      oldHeight = 0;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const frame = (now) => {
      if (!raid) return;
      const field = $("#kitten-field"),
        width = field.clientWidth,
        height = field.clientHeight,
        size = Math.max(46, Math.min(76, width / 5 - 6));
      const dt = lastFrame ? Math.min(0.05, (now - lastFrame) / 1000) : 0;
      lastFrame = now;
      for (const m of movers) {
        if (!oldWidth) {
          m.x = m.x * Math.max(1, width - size);
          m.y = m.y * Math.max(1, height - size);
        } else if (width !== oldWidth || height !== oldHeight) {
          m.x = (m.x / Math.max(1, oldWidth - size)) * (width - size);
          m.y = (m.y / Math.max(1, oldHeight - size)) * (height - size);
        }
        if (!reduced && !document.hidden && !m.node.disabled) {
          m.x += m.vx * dt;
          m.y += m.vy * dt;
        }
        if (m.x < 0 || m.x > width - size) m.vx *= -1;
        if (m.y < 0 || m.y > height - size) m.vy *= -1;
        m.x = Math.max(0, Math.min(width - size, m.x));
        m.y = Math.max(0, Math.min(height - size, m.y));
        m.node.style.width = `${size}px`;
        m.node.style.height = `${size}px`;
        m.node.style.transform = `translate3d(${m.x}px,${m.y}px,0)`;
      }
      oldWidth = width;
      oldHeight = height;
      animationFrame = requestAnimationFrame(frame);
    };
    animationFrame = requestAnimationFrame(frame);
  }
  function finishRaid(won) {
    if (!raid) return;
    const cleared = raid.cleared;
    raid = null;
    cancelAnimationFrame(animationFrame);
    movers = [];
    $("#kitten-raid").hidden = true;
    document.body.classList.remove("raid-active");
    armed = null;
    selected = null;
    update();
    hooks.result(won, cleared);
  }
  function tick(dt) {
    if (!raid || document.hidden || hooks.view() !== "drive") return;
    raid.seconds = Math.max(0, raid.seconds - dt);
    $("#raid-time").textContent = Math.ceil(raid.seconds);
    $("#raid-progress").value = raid.seconds;
    if (raid.seconds === 0) finishRaid(false);
  }
  function init(h) {
    hooks = h;
    const bar = document.createElement("div");
    bar.id = "target-bar";
    bar.hidden = true;
    bar.innerHTML =
      '<span id="target-instruction" role="status"></span><button id="cancel-target" aria-label="Cancel aiming">×</button>';
    document.body.append(bar);
    $("#cancel-target").addEventListener("click", () => {
      armed = null;
      selected = null;
      update();
    });
    const panel = document.createElement("section");
    panel.id = "kitten-raid";
    panel.hidden = true;
    panel.setAttribute("aria-label", "Timed kitten attack");
    panel.innerHTML =
      '<div class="raid-heading"><div><p>BC + M OPENED THE KITTEN PIPE!</p><h2>Kitten attack!</h2><span id="raid-count">20 kittens left</span></div><div class="raid-clock"><b id="raid-time">45</b><span>SECONDS</span></div><button id="raid-close" aria-label="End kitten round">×</button></div><progress id="raid-progress" max="45" value="45" aria-label="Kitten attack time remaining"></progress><p class="raid-help">Pick a gadget → burst the drifting kitten bubbles! Escaped kittens cause lasting setbacks.</p><div id="kitten-field"></div>';
    document.body.append(panel);
    $("#raid-close").addEventListener("click", () => finishRaid(false));
    $("#kitten-launch").addEventListener("click", () =>
      window.badCatAdventure.encounter("kittens"),
    );
  }
  window.badCatTargeting = {
    init,
    arm,
    target,
    cancel: () => {
      armed = null;
      selected = null;
      update();
    },
    startRaid,
    tick,
    raidActive: () => !!raid,
    diagnostics: () => ({ armed, selected, raid: raid ? { ...raid } : null }),
  };
})();
