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
    slots = base.map((x) => x[0]),
    editing = 0,
    buttons = [];
  const signature = (v) =>
    JSON.stringify([v.name, v.power, v.launcher, v.item, v.feature]);
  try {
    const raw = JSON.parse(localStorage.getItem("bad-cat-arsenal-v1"));
    if (Array.isArray(raw) && raw.length === 5) slots = raw;
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
        typeof inv === "string" ? base.find((x) => x[0] === inv)[1] : inv.name;
      const icon = b.querySelector(".gadget-icon");
      icon.replaceChildren();
      if (typeof inv !== "string" && window.badCatInventions.recipe(inv)) {
        const r = window.badCatInventions.recipe(inv);
        icon.textContent = r.item.picture;
      } else if ((typeof inv === "string" ? inv : inv.power) === "puppy") {
        const img = document.createElement("img");
        img.src = "assets/captain-biscuit.png";
        img.alt = "";
        icon.append(img);
      } else
        icon.textContent = base.find(
          (x) => x[0] === (typeof inv === "string" ? inv : inv.power),
        )[2];
      b.title =
        typeof inv === "string"
          ? label.textContent
          : window.badCatInventions.describe(inv);
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
          ? base.find((x) => x[0] === item)[1]
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
    buttons = base.map(([power]) =>
      document.querySelector(`[data-gadget="${power}"]`),
    );
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
    render();
  }
  window.badCatArsenal = {
    init,
    render,
    arm,
    isOpen: () => !!dialog?.open,
    diagnostics: () =>
      slots.map((_, i) => {
        const v = resolve(i);
        return typeof v === "string" ? v : v.name;
      }),
  };
})();
