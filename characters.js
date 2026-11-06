/* A biker kitten, an inventor cat and a pirate squirrel lead the playful villains. */
"use strict";
(() => {
  const defs = {
    captain: {
      name: "Captain Squirrel",
      badge: "CS",
      max: 3,
      plans: [
        ["tornado", "Arrr! A whirlwind of kittens off the starboard bow!"],
        ["puppy", "Hoist the acorns! My next surprise is coming aboard!"],
        ["kittens", "My kitten crew will board your Odyssey!"],
      ],
    },
    badcat: {
      name: "Bad Cat",
      badge: "BC",
      max: 3,
      plans: [
        ["heist", "While you’re looking, I shall borrow your booster. Genius!"],
        ["heist", "My next invention will swipe those biscuits!"],
        [
          "spelling",
          "My spelling bees are sharpening their pencils… and their stingers!",
        ],
      ],
    },
    metro: {
      name: "Metro",
      badge: "M",
      max: 4,
      plans: [
        ["trap", "Pressure gauge green! My bubble cannon is nearly ready!"],
        ["trap", "I built a giant bubble machine. Look at those gears!"],
        ["trap", "One more turn of this spanner… then BUBBLE TROUBLE!"],
      ],
    },
  };
  const state = {
    captain: { shield: 3, exposedTime: 0, plan: null },
    badcat: { shield: 3, exposedTime: 0, plan: null },
    metro: { shield: 4, exposedTime: 0, plan: null },
  };
  let hooks,
    bubble,
    spoken = null,
    bubbleUntil = 0;
  try {
    const data = JSON.parse(
      localStorage.getItem("bad-cat-enemy-fields-v1") || "null",
    );
    for (const key of Object.keys(defs))
      if (Number.isInteger(data?.[key]))
        state[key].shield = Math.max(0, Math.min(defs[key].max, data[key]));
  } catch {}
  function save() {
    try {
      localStorage.setItem(
        "bad-cat-enemy-fields-v1",
        JSON.stringify({
          badcat: state.badcat.shield,
          metro: state.metro.shield,
          captain: state.captain.shield,
        }),
      );
    } catch {}
  }
  function nodes(key) {
    return [
      ...document.querySelectorAll(
        key === "badcat"
          ? "#actor-badcat,.badcat-marker,.world-badcat,.road-badcat"
          : key === "captain"
            ? ".road-captain"
            : "#actor-metro,.metro-marker,.world-metro,.road-metro",
      ),
    ];
  }
  function decorate() {
    for (const key of Object.keys(defs))
      for (const node of nodes(key)) {
        let field = node.querySelector(".enemy-forcefield");
        if (!field) {
          field = document.createElement("div");
          field.className = "enemy-forcefield";
          field.innerHTML = '<span class="npc-shield-hp"></span>';
          node.append(field);
          const badge = document.createElement("span");
          badge.className = "npc-character-badge";
          badge.textContent = defs[key].badge;
          node.append(badge);
        }
        const n = state[key].shield;
        node.classList.toggle("enemy-unshielded", n === 0);
        node.classList.toggle(
          "enemy-field-cracked",
          n > 0 && n < defs[key].max,
        );
        field.querySelector("span").textContent = n
          ? `${n}/${defs[key].max}`
          : "OPEN";
        field.setAttribute(
          "aria-label",
          `${defs[key].name} forcefield: ${n} layers`,
        );
      }
  }
  function position() {
    if (!bubble || !spoken) return;
    const candidates = nodes(spoken);
    const node = candidates.find(
      (n) =>
        n.getClientRects().length &&
        getComputedStyle(n).visibility !== "hidden",
    );
    if (!node) {
      bubble.hidden = true;
      return;
    }
    const rect = node.getBoundingClientRect(),
      width = Math.min(300, innerWidth - 145),
      left = Math.max(
        12,
        Math.min(innerWidth - width - 150, rect.x + rect.width / 2 - width / 2),
      );
    bubble.style.width = `${width}px`;
    bubble.style.left = `${left}px`;
    bubble.style.top = `${Math.max(90, Math.min(innerHeight - 190, rect.y - 110))}px`;
    bubble.hidden = Date.now() > bubbleUntil;
  }
  function speak(key, text) {
    if (key === "captain" && !text.startsWith("Arrr")) text = "Arrr! " + text;
    spoken = key;
    bubbleUntil = Date.now() + 6500;
    bubble.querySelector("img").src =
      `assets/${key === "badcat" ? "bad-cat" : key === "captain" ? "captain-squirrel" : "metro"}.png`;
    bubble.querySelector("img").alt = defs[key].name;
    bubble.querySelector("b").textContent =
      `${defs[key].badge} · ${defs[key].name}`;
    bubble.querySelector("p").textContent = text;
    bubble.hidden = false;
    position();
  }
  function talk(key) {
    if (!defs[key]) return;
    const cat = state[key];
    if (!cat.plan) {
      const plan =
        defs[key].plans[Math.floor(Math.random() * defs[key].plans.length)];
      cat.plan = {
        kind: plan[0],
        line: plan[1],
        remaining: 12 + Math.random() * 6,
      };
    }
    speak(key, cat.plan.line);
    decorate();
  }
  function hit(key, power) {
    const cat = state[key],
      def = defs[key];
    if (!cat) return null;
    if (cat.shield === 0) {
      cat.plan = null;
      cat.exposedTime = 0;
      speak(
        key,
        key === "badcat"
          ? "My calculations did NOT include that!"
          : "Oi! That gadget was supposed to be mine!",
      );
      return {
        exposed: true,
        message: `${def.badge} has no forcefield—your ${power === "puppy" ? "puppy squad" : power + " gadget"} gets through!`,
      };
    }
    const damage =
      power === "sonar"
        ? 1
        : power === "laser"
          ? 2 + Math.min(1, window.badCatLoot.level("laser"))
          : 1;
    cat.shield = Math.max(0, cat.shield - damage);
    save();
    decorate();
    if (!damage) {
      speak(
        key,
        `You found my forcefield: ${cat.shield} layers. Finding it isn’t breaking it!`,
      );
      return {
        exposed: false,
        message: `Sonar reveals ${def.badge}’s ${cat.shield}-layer forcefield. Attack it with a blaster!`,
      };
    }
    if (cat.shield === 0) {
      cat.plan = null;
      cat.exposedTime = 0;
      speak(
        key,
        key === "badcat"
          ? "My magnificent forcefield! Who authorised this?!"
          : "You cracked my field generator! I need a bigger spanner!",
      );
      for (const node of nodes(key)) {
        node.classList.add("field-shattering");
        setTimeout(() => node.classList.remove("field-shattering"), 900);
      }
      hooks.sound("shield");
      return {
        exposed: false,
        broken: true,
        message: `${def.badge}’s forcefield shatters! The plan is interrupted. Your next attack can reach ${def.name}.`,
      };
    }
    speak(
      key,
      key === "badcat"
        ? `A crack? Merely a tiny flaw in a brilliant design. ${cat.shield} layers left!`
        : `Generator wobbling! ${cat.shield} layers left. Hold together, you silly machine!`,
    );
    return {
      exposed: false,
      message: `Hit! ${def.badge}’s forcefield has ${cat.shield} of ${def.max} layers left.`,
    };
  }
  function tick(dt) {
    decorate();
    position();
    if (!hooks.active()) return;
    for (const key of Object.keys(defs)) {
      if (!hooks.active()) break;
      const cat = state[key];
      if (cat.shield === 0) {
        cat.exposedTime += dt;
        if (cat.exposedTime >= 60) {
          cat.shield = defs[key].max;
          cat.exposedTime = 0;
          save();
          decorate();
          speak(key, "Field generator rebuilt! You’ll have to crack it again.");
        }
      }
    }
  }
  function init(h) {
    hooks = h;
    bubble = document.createElement("aside");
    bubble.id = "npc-speech";
    bubble.hidden = true;
    bubble.setAttribute("role", "status");
    bubble.setAttribute("aria-live", "polite");
    bubble.innerHTML = '<img alt=""><div><b></b><p></p></div>';
    document.body.append(bubble);
    decorate();
  }
  window.badCatCharacters = {
    init,
    talk,
    hit,
    tick,
    decorate,
    resetField: (key) => {
      if (!state[key]) return;
      state[key].shield = defs[key].max;
      state[key].exposedTime = 0;
      state[key].plan = null;
      save();
      decorate();
    },
    clearPlans: () => {
      for (const cat of Object.values(state)) cat.plan = null;
      spoken = null;
      if (bubble) bubble.hidden = true;
    },
    diagnostics: () =>
      Object.fromEntries(
        Object.entries(state).map(([k, v]) => [
          k,
          { shield: v.shield, max: defs[k].max, plan: v.plan?.kind || null },
        ]),
      ),
  };
})();
