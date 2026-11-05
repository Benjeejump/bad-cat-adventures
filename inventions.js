/* Picture recipes are saved, and the chosen item actually flies during play. */
"use strict";
(() => {
  const make = (rows) =>
    rows.map(([id, label, picture, power]) => ({ id, label, picture, power }));
  const launchers = make([
    ["waterslide", "Waterslide", "🛝"],
    ["catapult", "Catapult", "🏹"],
    ["cannon", "Bubble cannon", "💨"],
    ["slingshot", "Slingshot", "🪃"],
    ["rocket", "Rocket tube", "🚀"],
    ["trampoline", "Trampoline", "🟦"],
    ["tunnel", "Secret pipe", "🕳️"],
    ["hose", "Garden hose", "🚿"],
    ["fan", "Giant fan", "🌀"],
    ["balloon", "Balloon drop", "🎈"],
    ["train", "Toy train", "🚂"],
    ["springboard", "Springboard", "〰️"],
    ["volcano", "Pretend volcano", "🌋"],
    ["cloud", "Cloud chute", "☁️"],
    ["whale", "Whale spout", "🐳"],
    ["squid", "Squid launcher", "🦑"],
    ["robot", "Robot arm", "🤖"],
    ["portal", "Magic doorway", "🪄"],
    ["trebuchet", "Trebuchet", "⚙️"],
    ["skateboard", "Skateboard ramp", "🛹"],
  ]);
  const items = make([
    ["yarn", "Yarn", "🧶"],
    ["springs", "Springs", "〰️"],
    ["paperplanes", "Paper planes", "➤"],
    ["acorns", "Acorns", "🌰"],
    ["waffles", "Waffles", "🧇"],
    ["socks", "Socks", "🧦"],
    ["rubberducks", "Rubber ducks", "🦆"],
    ["marshmallows", "Marshmallows", "☁️"],
    ["bubbles", "Bubbles", "🫧"],
    ["pinecones", "Pine cones", "🌲"],
    ["pillows", "Pillows", "🛏️"],
    ["bananas", "Bananas", "🍌"],
    ["treats", "Puppy treats", "🦴"],
    ["tennisballs", "Tennis balls", "🎾"],
    ["cupcakes", "Cupcakes", "🧁"],
    ["jelly", "Jelly", "🍮"],
    ["spaghetti", "Spaghetti", "🍝"],
    ["feathers", "Feathers", "🪶"],
    ["leaves", "Leaves", "🍂"],
    ["confetti", "Confetti", "🎊"],
    ["snowballs", "Snowballs", "❄️"],
    ["waterballoons", "Water balloons", "🎈"],
    ["slime", "Slime", "🟢"],
    ["popcorn", "Popcorn", "🍿"],
    ["donuts", "Donuts", "🍩"],
    ["boots", "Boots", "🥾"],
    ["toycars", "Toy cars", "🚗"],
    ["stars", "Stars", "⭐"],
    ["flowers", "Flowers", "🌼"],
    ["carrots", "Carrots", "🥕"],
    ["cheese", "Cheese", "🧀"],
    ["buckets", "Buckets", "🪣"],
    ["umbrellas", "Umbrellas", "☂️"],
    ["magnets", "Magnets", "🧲"],
    ["ribbons", "Ribbons", "🎀"],
    ["beachballs", "Beach balls", "🏐"],
    ["pizzas", "Pizzas", "🍕"],
    ["bears", "Teddy bears", "🧸"],
    ["icecream", "Ice cream", "🍦"],
    ["sponge", "Sponges", "🧽"],
  ]);
  const features = make([
    ["splash", "Big splash", "💦", "bubble"],
    ["flaming", "Pretend flames", "🔥", "laser"],
    ["stinky", "Stinky", "🦨", "puppy"],
    ["bouncy", "Extra bouncy", "🏀", "shield"],
    ["sticky", "Super sticky", "🍯", "bubble"],
    ["icy", "Icy cold", "🧊", "shield"],
    ["rainbow", "Rainbow", "🌈", "laser"],
    ["sparkly", "Sparkly", "✨", "laser"],
    ["giant", "Giant-sized", "🔍", "puppy"],
    ["tiny", "Teeny tiny", "🐜", "bubble"],
    ["magnetic", "Magnetic", "🧲", "shield"],
    ["soapy", "Extra soapy", "🧼", "bubble"],
    ["silly", "Silly faces", "🤪", "puppy"],
    ["musical", "Musical", "🎵", "puppy"],
    ["glowing", "Glowing", "💡", "laser"],
    ["whirling", "Whirling", "🌪️", "bubble"],
    ["fizzy", "Fizzy", "🥤", "bubble"],
    ["squishy", "Squishy", "🧽", "shield"],
    ["springy", "Springy", "〰️", "shield"],
    ["tickly", "Tickly", "🪶", "puppy"],
    ["invisible", "Almost invisible", "👻", "shield"],
    ["electric", "Cartoon sparks", "⚡", "laser"],
    ["sleepy", "Sleepy", "💤", "puppy"],
    ["muddy", "Muddy", "🟤", "bubble"],
  ]);
  let selection = { launcher: "waterslide", item: "yarn", feature: "splash" },
    hooks,
    inventory;
  const find = (list, id) => list.find((x) => x.id === id);
  function recipe(value) {
    const launcher = find(launchers, value?.launcher),
      item = find(items, value?.item),
      feature = find(features, value?.feature);
    return launcher && item && feature ? { launcher, item, feature } : null;
  }
  function normalize(value) {
    const r = recipe(value);
    return r
      ? {
          launcher: r.launcher.id,
          item: r.item.id,
          feature: r.feature.id,
          power: r.feature.power,
        }
      : {};
  }
  function describe(value) {
    const r = recipe(value);
    return r
      ? `${r.feature.label} ${r.item.label.toLowerCase()} · ${r.launcher.label}`
      : "Classic gadget";
  }
  const illustrated = new Set([
    "catapult",
    "waterslide",
    "springs",
    "paperplanes",
    "acorns",
    "pinecones",
    "pillows",
    "marshmallows",
  ]);
  function picture(node, option) {
    if (illustrated.has(option.id)) {
      const img = document.createElement("img");
      img.src = `assets/inventions/${option.id}.svg`;
      img.alt = option.label;
      node.append(img);
    } else node.textContent = option.picture;
  }
  function preview() {
    const r = recipe(selection),
      node = document.querySelector("#invention-preview");
    node.replaceChildren();
    const icons = document.createElement("b");
    icons.append(document.createTextNode(r.launcher.picture + " → "));
    const item = document.createElement("span");
    picture(item, r.item);
    icons.append(item, document.createTextNode(" " + r.feature.picture));
    const label = document.createElement("span");
    label.textContent = describe(selection);
    node.append(icons, label);
    document.querySelector("#invention-power").value = r.feature.power;
  }
  function init(h) {
    hooks = h;
    for (const [key, list] of [
      ["launcher", launchers],
      ["item", items],
      ["feature", features],
    ]) {
      const grid = document.querySelector("#invention-" + key + "-choices");
      for (const option of list) {
        const b = document.createElement("button");
        b.type = "button";
        b.dataset.recipe = option.id;
        b.setAttribute("aria-pressed", option.id === selection[key]);
        const icon = document.createElement("span");
        picture(icon, option);
        icon.setAttribute("aria-hidden", "true");
        const label = document.createElement("span");
        label.textContent = option.label;
        b.append(icon, label);
        b.addEventListener("click", () => {
          selection[key] = option.id;
          grid
            .querySelectorAll("button")
            .forEach((n) => n.setAttribute("aria-pressed", n === b));
          preview();
        });
        grid.append(b);
      }
    }
    preview();
    document
      .querySelector("#preview-invention")
      .addEventListener("click", () =>
        launch(
          { ...selection, name: "Test invention" },
          document.querySelector("#invention-preview"),
          true,
        ),
      );
    inventory = document.createElement("dialog");
    inventory.id = "arsenal-dialog";
    inventory.innerHTML =
      '<header><h2>Dylan’s inventions</h2><button type="button" aria-label="Close inventions">×</button></header><p>Choose your invention, then tap BC, Metro or a kitten.</p><div id="field-inventions"></div><button type="button" id="build-more">Build at HQ</button>';
    inventory.querySelector("header button").onclick = () => inventory.close();
    inventory.querySelector("#build-more").onclick = () => {
      inventory.close();
      hooks.hq();
    };
    document.body.append(inventory);
    document.querySelector("#arsenal-launch").onclick = () => {
      renderInventory();
      inventory.showModal();
    };
  }
  function deploy(inv) {
    inventory?.close();
    hooks.deploy(inv);
  }
  function renderInventory() {
    const root = inventory.querySelector("#field-inventions");
    root.replaceChildren();
    const entries = hooks.list();
    if (!entries.length) {
      root.textContent = "Your arsenal is empty. Build an invention at HQ!";
      return;
    }
    for (const inv of entries) {
      const b = document.createElement("button");
      b.textContent = `${recipe(inv)?.item.picture || "✦"} ${inv.name} — ${describe(inv)}`;
      b.onclick = () => deploy(inv);
      root.append(b);
    }
  }
  function launch(inv, target, previewOnly = false) {
    const r = recipe(inv);
    if (!r) return;
    const bounds = target?.getBoundingClientRect?.();
    const end = {
      x: bounds ? bounds.x + bounds.width / 2 : (target?.x ?? innerWidth / 2),
      y: bounds
        ? bounds.y + bounds.height / 2
        : (target?.y ?? innerHeight * 0.4),
    };
    const start = previewOnly
      ? { x: end.x - 160, y: end.y + 60 }
      : { x: innerWidth * 0.5, y: innerHeight * 0.82 };
    const stage = document.createElement("div");
    stage.className = "recipe-launch";
    stage.dataset.launcher = r.launcher.id;
    stage.dataset.item = r.item.id;
    stage.dataset.feature = r.feature.id;
    const source = document.createElement("span");
    source.className = "recipe-source";
    picture(source, r.launcher);
    source.style.left = start.x + "px";
    source.style.top = start.y + "px";
    stage.append(source);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    for (let i = 0; i < 5; i++) {
      const shot = document.createElement("span");
      shot.className = "recipe-projectile feature-" + r.feature.id;
      picture(shot, r.item);
      shot.style.left = start.x + "px";
      shot.style.top = start.y + "px";
      stage.append(shot);
      const dx = end.x - start.x + (i - 2) * 13,
        dy = end.y - start.y;
      const loft = [
        "catapult",
        "trebuchet",
        "slingshot",
        "springboard",
        "trampoline",
      ].includes(r.launcher.id)
        ? -170
        : r.launcher.id === "balloon" || r.launcher.id === "cloud"
          ? -220
          : r.launcher.id === "waterslide"
            ? 70
            : -35;
      shot.animate(
        [
          { transform: "translate(0,0) scale(.5)", opacity: 0 },
          {
            transform: `translate(${dx * 0.5}px,${dy * 0.5 + loft}px) rotate(${i * 35}deg)`,
            opacity: 1,
            offset: 0.5,
          },
          {
            transform: `translate(${dx}px,${dy}px) rotate(${i * 80}deg) scale(${r.feature.id === "giant" ? 2 : 1})`,
            opacity: 1,
          },
        ],
        { duration: reduced ? 250 : 1000, delay: i * 90, fill: "forwards" },
      );
    }
    const impact = document.createElement("span");
    impact.className = "recipe-burst";
    impact.textContent = `${r.feature.picture} ${r.item.picture} ${r.feature.picture}`;
    impact.style.left = end.x + "px";
    impact.style.top = end.y + "px";
    stage.append(impact);
    const caption = document.createElement("span");
    caption.className = "recipe-caption";
    caption.textContent = `${inv.name}: ${describe(inv)}!`;
    stage.append(caption);
    // Keep previews above the native HQ/arsenal dialog top layer when applicable.
    const dialog = target?.closest?.("dialog[open]");
    (dialog || document.body).append(stage);
    setTimeout(() => stage.remove(), 2400);
  }
  window.badCatInventions = {
    init,
    recipe,
    normalize,
    describe,
    deploy,
    launch,
    selection: () => ({ ...selection, power: recipe(selection).feature.power }),
    counts: () => ({
      launchers: launchers.length,
      items: items.length,
      features: features.length,
    }),
  };
})();
