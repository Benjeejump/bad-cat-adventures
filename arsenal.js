/* Five directly usable slots; recipe snapshots survive reload, retired recipes reset. */
"use strict";
(() => {
  const base = [
    ["shield", "Forcefield", "◈"],
    ["laser", "Confetti blaster", "ϟ"],
    ["sonar", "Sonar", "◎"],
    ["bubble", "Bubble blaster", "🫧"],
    ["puppy", "Puppy squad", "🐶"],
  ];
  let hooks,
    dialog,
    hqMenu,
    slots = base.slice(0, 5).map((x) => x[0]),
    editing = 0,
    buttons = [];
  const signature = (v) =>
    JSON.stringify([v.name, v.power, v.launcher, v.item, v.feature]);
  try {
    const raw = JSON.parse(localStorage.getItem("bad-cat-arsenal-v1"));
    if (Array.isArray(raw) && raw.length >= 4)
      slots = [
        ...raw.slice(0, 5),
        ...base.slice(raw.length, 5).map((x) => x[0]),
      ];
  } catch {}
  function resolve(i) {
    const value = slots[i];
    if (typeof value === "string")
      return base.find((x) => x[0] === value) ? value : base[i][0];
    if (!value || typeof value !== "object") return base[i][0];
    return (
      hooks.list().find((v) => signature(v) === signature(value)) || base[i][0]
    );
  }
  function save() {
    try {
      localStorage.setItem("bad-cat-arsenal-v1", JSON.stringify(slots));
    } catch {}
  }
  function arm(i) {
    if (!Number.isInteger(i) || i < 0 || i >= 5) return;
    const inv = resolve(i);
    if (typeof inv === "string") window.badCatTargeting.arm(inv);
    else window.badCatTargeting.arm(inv.power, inv);
  }
  function render() {
    if (!hooks) return;
    buttons.forEach((b, i) => {
      const inv = resolve(i);
      slots[i] = inv;
      b.dataset.slot = String(i);
      b.dataset.arsenalPower = typeof inv === "string" ? inv : inv.power;
      const label = b.querySelector("b");
      label.textContent =
        typeof inv === "string"
          ? window.badCatSeason.powerName(
              inv,
              base.find((x) => x[0] === inv)[1],
            )
          : inv.name;
      const icon = b.querySelector(".gadget-icon");
      icon.replaceChildren();
      if (typeof inv !== "string" && window.badCatInventions.recipe(inv)) {
        const r = window.badCatInventions.recipe(inv);
        icon.textContent = r.item.picture;
      } else if (window.badCatSeason.active()) {
        icon.textContent = window.badCatSeason.powerIcon(
          typeof inv === "string" ? inv : inv.power,
          "🎁",
        );
      } else if ((typeof inv === "string" ? inv : inv.power) === "puppy") {
        const img = document.createElement("img");
        img.src = "assets/captain-biscuit.png";
        img.alt = "";
        icon.append(img);
      } else
        icon.textContent = base.find(
          (x) => x[0] === (typeof inv === "string" ? inv : inv.power),
        )[2];
      b.removeAttribute("title");
      b.setAttribute("aria-label", label.textContent);
    });
    save();
  }
  function menu() {
    render();
    const root = dialog.querySelector("#arsenal-slots");
    root.replaceChildren();
    for (let i = 0; i < 5; i++) {
      const b = document.createElement("button");
      b.textContent = `${i + 1} · ${buttons[i].querySelector("b").textContent}`;
      b.setAttribute("aria-pressed", i === editing);
      b.onclick = () => {
        editing = i;
        menu();
      };
      root.append(b);
    }
    const choices = dialog.querySelector("#arsenal-choices");
    choices.replaceChildren();
    for (const item of [...base.map((x) => x[0]), ...hooks.list()]) {
      const b = document.createElement("button");
      b.textContent =
        typeof item === "string"
          ? window.badCatSeason.powerName(
              item,
              base.find((x) => x[0] === item)[1],
            )
          : `${window.badCatInventions.recipe(item)?.item.picture || "✦"} ${item.name}`;
      b.onclick = () => {
        slots[editing] = item;
        save();
        menu();
      };
      choices.append(b);
    }
    dialog.querySelector("#arsenal-edit-heading").textContent =
      `Choose launcher for slot ${editing + 1}`;
  }
  function init(h) {
    hooks = h;
    const heel = document.createElement("button");
    heel.className = "gadget gadget-heel";
    heel.dataset.gadget = "puppy";
    heel.innerHTML = '<span class="gadget-icon"></span><b>Puppy squad</b>';
    document.querySelector(".action-rail .gadget-grid").append(heel);
    buttons = base
      .slice(0, 5)
      .map(([power]) => document.querySelector(`[data-gadget="${power}"]`));
    buttons.forEach((b, i) =>
      b.addEventListener(
        "click",
        (e) => {
          e.stopImmediatePropagation();
          arm(i);
        },
        true,
      ),
    );
    dialog = document.createElement("dialog");
    dialog.id = "arsenal-editor";
    dialog.innerHTML =
      '<header><h2>My five launchers</h2><button id="close-loadout" aria-label="Close arsenal menu">×</button></header><p>Choose a slot, then choose a standard gadget or one of your inventions. Changes save right away.</p><div id="arsenal-slots"></div><h3 id="arsenal-edit-heading"></h3><div id="arsenal-choices"></div><button id="arsenal-build">Build more at HQ</button>';
    document.body.append(dialog);
    dialog.querySelector("#close-loadout").onclick = () => dialog.close();
    dialog.querySelector("#arsenal-build").onclick = () => {
      dialog.close();
      hooks.hq();
      document
        .querySelector("#invention-form")
        ?.scrollIntoView({ block: "start" });
    };
    document.querySelector("#edit-arsenal").onclick = () => {
      menu();
      dialog.showModal();
    };
    const rail = document.querySelector(".action-rail");
    hqMenu = document.createElement("dialog");
    hqMenu.id = "puppy-hq-menu";
    hqMenu.setAttribute("aria-labelledby", "puppy-hq-title");
    hqMenu.innerHTML =
      '<header><h2 id="puppy-hq-title">Puppy HQ</h2><button id="close-puppy-hq" aria-label="Close Puppy HQ">×</button></header><div class="puppy-hq-options"></div>';
    const options = hqMenu.querySelector(".puppy-hq-options");
    [...rail.querySelector(".gadget-grid").children]
      .filter((n) => !buttons.includes(n))
      .forEach((n) => options.append(n));
    [...rail.children]
      .filter((n) => !n.matches(".gadget-grid,.rail-label"))
      .forEach((n) => options.append(n));
    const journeyModes = document.querySelector("#journey-mode-bar");
    if (journeyModes) options.append(journeyModes);
    const storyPanel = document.querySelector(".journey-story");
    if (storyPanel) options.append(storyPanel);
    const crew = document.querySelector(".campaign-hud");
    if (crew) options.append(crew);
    const follow = document.querySelector("#follow");
    if (follow) options.append(follow);
    const settings = document.querySelector(".journey-settings");
    if (settings) options.append(settings);
    const workshop = document.createElement("button");
    workshop.textContent = "✦ Build inventions at HQ";
    workshop.onclick = () => hooks.hq();
    options.prepend(workshop);
    const hqButton = document.createElement("button");
    hqButton.id = "puppy-hq-launch";
    hqButton.innerHTML = `<span aria-hidden="true">⌂</span><b>HQ</b><small id="paw-treat-balance">🍪 ${window.badCatCampaign.snapshot().supplies}</small>`;
    hqButton.setAttribute("aria-haspopup", "dialog");
    hqButton.onclick = () => hqMenu.showModal();
    rail.append(hqButton);
    hqMenu.querySelector("#close-puppy-hq").onclick = () => hqMenu.close();
    hqMenu.addEventListener(
      "click",
      (e) => {
        if (e.target.closest(".puppy-hq-options button")) hqMenu.close();
      },
      true,
    );
    document.body.append(hqMenu);
    document.querySelector("#edit-arsenal").textContent = "⚙ My five launchers";
    render();
  }
  window.badCatArsenal = {
    init,
    render,
    arm,
    isOpen: () => !!dialog?.open || !!hqMenu?.open,
    diagnostics: () =>
      slots.map((_, i) => {
        const v = resolve(i);
        return typeof v === "string" ? v : v.name;
      }),
  };
})();
