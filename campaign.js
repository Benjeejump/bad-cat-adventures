/* Persistent consequences: the crew can recover, but retries never erase a setback. */
"use strict";
(() => {
  const KEY = "bad-cat-campaign-v1",
    powers = ["shield", "laser", "sonar", "bubble", "puppy"];
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  let state = {
      condition: 100,
      supplies: 6,
      heat: 0,
      jams: {},
      wins: 0,
      losses: 0,
    },
    storage = true,
    notice = () => {};
  try {
    const old = JSON.parse(localStorage.getItem(KEY) || "null");
    if (old) {
      for (const k of ["condition", "supplies", "heat", "wins", "losses"])
        if (Number.isFinite(old[k]))
          state[k] = Math.floor(
            clamp(
              old[k],
              0,
              k === "condition"
                ? 100
                : k === "supplies"
                  ? 99
                  : k === "heat"
                    ? 5
                    : 1000000,
            ),
          );
      for (const k of powers)
        if (Number.isInteger(old.jams?.[k]))
          state.jams[k] = clamp(old.jams[k], 0, 4);
    }
  } catch {
    storage = false;
  }
  const labels = {
    shield: "Forcefield",
    laser: "Confetti laser",
    sonar: "Sonar",
    bubble: "Bubble blaster",
    puppy: "Puppy squad",
  };
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      storage = false;
    }
    render();
  }
  function snapshot() {
    return { ...state, jams: { ...state.jams } };
  }
  function change(delta) {
    for (const key of ["condition", "supplies", "heat"])
      if (delta[key])
        state[key] = clamp(
          state[key] + delta[key],
          0,
          key === "condition" ? 100 : key === "supplies" ? 99 : 5,
        );
    for (const [key, value] of Object.entries(delta.jams || {}))
      state.jams[key] = Math.max(state.jams[key] || 0, value);
    save();
  }
  function render() {
    const summary = document.querySelector("#crew-readout");
    if (!summary) return;
    document
      .querySelector(".campaign-hud")
      .classList.toggle("low-treats", state.supplies <= 2);
    summary.title =
      state.supplies <= 2
        ? "We’re low on treats! Practice spelling to earn more."
        : "Puppy treats buy puppy help.";
    const balance = document.querySelector("#paw-treat-balance");
    if (balance) balance.textContent = `🍪 ${state.supplies}`;
    summary.textContent = `🚙 ${state.condition}%   🍪 ${state.supplies}   🐈 ${state.heat}/5`;
    document.querySelector("#crew-detail").textContent =
      `Car condition ${state.condition}%. Treats ${state.supplies}. Cats’ advantage ${state.heat}/5. ${
        Object.entries(state.jams)
          .filter(([, n]) => n > 0)
          .map(([k, n]) => `${labels[k]} jammed for ${n} more attempts.`)
          .join(" ") || "All gadgets working."
      }${storage ? "" : " Changes cannot be saved in this browser."}`;
    document.querySelector("#workshop-status").textContent =
      `${state.condition}% condition · ${state.supplies} treats · cats’ advantage ${state.heat}/5. Repairing clears gadget jams; resupplying reduces the cats’ advantage.`;
  }
  function use(power, { raid = false } = {}) {
    if (!powers.includes(power)) return true;
    if (state.jams[power] > 0) {
      state.jams[power]--;
      save();
      notice(
        `${labels[power]} fizzles — still jammed! ${state.jams[power] ? "Try another gadget or repair in HQ." : "That was the last jam; try again."}`,
      );
      return false;
    }
    // One snack per puppy sortie, not per kitten; a sortie covers up to five targets.
    if (power === "puppy" && !raid) {
      if (!state.supplies) {
        notice(
          "We’re low on treats! Spell a word or restock Puppy Base, or use another gadget.",
        );
        return false;
      }
      change({ supplies: -1 });
    }
    return true;
  }
  const risks = {
    badcat: [
      {
        bad: true,
        delta: { condition: -10, heat: 2, jams: { laser: 2 } },
        message:
          "It was BC’s prank button! The laser is jammed for two attempts, the Odyssey has a dent, and the cats gain an advantage.",
        result: "mishap",
      },
      { delta: { heat: -1 }, message: null },
    ],
    vacuum: [
      { delta: { supplies: -1 }, message: null },
      {
        bad: true,
        delta: { condition: -15, heat: 2, jams: { bubble: 2 } },
        message:
          "The reverse switch backfires! The vacuum flings sticky foam at the Odyssey. Bubble blaster jammed for two attempts; the cats are stronger.",
        result: "mishap",
      },
    ],
    tunnel: [
      { delta: { heat: -1 } },
      { delta: { supplies: -1 } },
      {
        bad: true,
        delta: { condition: -12, heat: 1, jams: { sonar: 2 } },
        message:
          "The submarine is too big for this pipe! It scrapes the hull and clogs the sonar. The cats slip away.",
        result: "stuck",
      },
    ],
    trap: [
      { delta: { heat: 1 } },
      {
        bad: true,
        delta: { condition: -8, heat: 1, jams: { bubble: 2 } },
        message:
          "The bigger bubble sticks to Metro’s trap! Sticky foam dents the bumper and jams the bubble blaster. Try sonar or repairs next.",
        result: "mishap",
      },
    ],
    heist: [{ delta: { heat: -1 } }, { delta: { supplies: -1, heat: -1 } }],
    tornado: [
      {
        bad: true,
        delta: { condition: -12, heat: 1 },
        message:
          "The kitten tornado catches the wings! The Odyssey lands with a bump. The cats keep the hat and gain an advantage.",
        result: "stuck",
      },
      { delta: { supplies: -1, heat: -1 } },
    ],
    amy: [
      { delta: { condition: 10, supplies: 1 } },
      {
        bad: true,
        delta: { supplies: -2, heat: 1 },
        message:
          "Wrong imaginary house! Metro’s decoy biscuit tin steals two treats while the puppies investigate. Amy was next door all along.",
        result: "mishap",
      },
    ],
    puppybase: [
      { delta: { supplies: 3, condition: 20, heat: -2 } },
      { delta: { condition: 10, heat: -1 } },
    ],
  };
  function choice(id, index) {
    const rule = risks[id]?.[index] || { delta: {} };
    change(rule.delta);
    return { ...rule };
  }
  function raidResult(won, cleared) {
    if (won) {
      state.wins++;
      change({ supplies: 2, heat: -1 });
      return "Treats +2. Cats’ advantage −1. Existing dents and jams still need repairs.";
    }
    state.losses++;
    const escaped = 20 - cleared;
    change({
      condition: -Math.min(25, escaped * 2),
      supplies: -2,
      heat: 2,
      jams: { shield: 2 },
    });
    return `${escaped} kittens escaped and scratched the Odyssey! Treats −2, cats’ advantage +2, forcefield jammed for two attempts. These setbacks carry into the next adventure.`;
  }
  function raidUse(power, index) {
    if (!use(power, { raid: true })) return false;
    if (power === "puppy" && index % 5 === 0) {
      if (!state.supplies) {
        notice(
          "The puppies need treats. Spell a word, restock Puppy Base, or choose another gadget.",
        );
        return false;
      }
      change({ supplies: -1 });
    }
    if (power === "laser" && (index + 1) % 5 === 0) change({ heat: 1 });
    return true;
  }
  function puppyOutcome(success, id) {
    if (success) {
      change({ condition: 5, supplies: 1, heat: -1 });
      return "Car condition +5, treats +1, cats’ advantage −1.";
    }
    change({
      condition: -15,
      supplies: -2,
      heat: 1,
      jams: { [id === "blanket" ? "shield" : "laser"]: 2 },
    });
    return "Car condition −15, treats −2, cats’ advantage +1, one gadget jammed for two attempts.";
  }
  function repair() {
    change({ condition: 25 });
    for (const k of powers) state.jams[k] = 0;
    save();
    notice(
      "Workshop repairs +25 car condition and clears gadget jams. Treats and cat advantage stay as they were.",
    );
  }
  function resupply() {
    change({ supplies: 3, heat: -1 });
    notice("Puppy Base restocks three treats. Cats’ advantage −1.");
  }
  function init(onNotice) {
    notice = onNotice;
    const hud = document.createElement("details");
    hud.className = "campaign-hud";
    hud.innerHTML =
      '<summary id="crew-readout" aria-label="Dylan, Dalmatian puppy hero: crew condition, puppy treats and cats advantage"></summary><p id="crew-detail" role="status"></p><span>Repairs and resupply: Mission HQ</span>';
    document.body.append(hud);
    const card = document.createElement("section");
    card.className = "panel hq-card workshop-card";
    card.innerHTML =
      '<span class="hq-icon">🛠️</span><h2>Odyssey workshop</h2><p id="workshop-status" role="status"></p><button id="repair-crew" class="primary-button">Repair car + clear jams</button> <button id="resupply-crew" class="primary-button">Restock Puppy Base</button><p>Choices and escaped kittens leave real setbacks. This is where the crew recovers.</p>';
    document.querySelector(".hq-grid").append(card);
    document.querySelector("#repair-crew").addEventListener("click", repair);
    document
      .querySelector("#resupply-crew")
      .addEventListener("click", resupply);
    render();
  }
  window.badCatCampaign = {
    init,
    use,
    choice,
    raidResult,
    raidUse,
    puppyOutcome,
    snapshot,
    repair,
    resupply,
    motionScale: () =>
      state.condition < 35 ? 0.65 : state.condition < 65 ? 0.85 : 1,
    pressure: () => state.heat,
    raidSeconds: () => Math.max(30, 45 - state.heat * 2),
    spendTreats: (amount) => {
      if (
        !Number.isSafeInteger(amount) ||
        amount < 0 ||
        state.supplies < amount
      )
        return false;
      change({ supplies: -amount });
      return true;
    },
    awardTreats: (amount) => {
      if (!Number.isFinite(amount)) return 0;
      const before = state.supplies;
      change({ supplies: Math.trunc(amount) });
      return state.supplies - before;
    },
    reward: () => change({ supplies: 1 }),
    choiceLabel: (id, index) => {
      const rule = risks[id]?.[index];
      return rule?.bad
        ? " · RISKY"
        : rule?.delta?.supplies < 0
          ? " · USES TREATS"
          : "";
    },
  };
})();
