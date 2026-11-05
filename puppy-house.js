/* Five homes, twenty unique furnishings each. Treats are earned only in game. */
"use strict";
(() => {
  const homes = [
    { name: "Dog house", upgrade: 8, rooms: 1 },
    { name: "Dog apartment", upgrade: 15, rooms: 2 },
    { name: "House", upgrade: 25, rooms: 3 },
    { name: "Big house", upgrade: 35, rooms: 4 },
    { name: "Mansion", upgrade: 0, rooms: 6 },
  ];
  const lists = [
    [
      ["Soft puppy bed", "🛏️"],
      ["Food bowl", "🥣"],
      ["Water bowl", "💧"],
      ["Stripy blanket", "🧣"],
      ["Tennis ball", "🎾"],
      ["Chew bone", "🦴"],
      ["Welcome mat", "🟫"],
      ["Rubber duck", "🦆"],
      ["Night light", "💡"],
      ["Toy basket", "🧺"],
      ["Fluffy cushion", "☁️"],
      ["Puppy brush", "🪮"],
      ["Little towel", "🧻"],
      ["Squeaky carrot", "🥕"],
      ["Flower pot", "🌼"],
      ["Story book", "📘"],
      ["Window curtain", "🪟"],
      ["Biscuit jar", "🍪"],
      ["Name sign", "🏷️"],
      ["Tiny wind chime", "🎐"],
    ],
    [
      ["Comfy sofa", "🛋️"],
      ["Reading lamp", "🪔"],
      ["Puppy bookcase", "📚"],
      ["Round rug", "🟠"],
      ["Coat hooks", "🧥"],
      ["Toy train", "🚂"],
      ["Kitchen stool", "🪑"],
      ["Breakfast table", "🪵"],
      ["Wall clock", "🕒"],
      ["Potted fern", "🪴"],
      ["Laundry basket", "🧺"],
      ["Music radio", "📻"],
      ["Rain boots rack", "🥾"],
      ["Art easel", "🎨"],
      ["Puppy portrait", "🖼️"],
      ["Blue beanbag", "🔵"],
      ["Building blocks", "🧱"],
      ["Puzzle box", "🧩"],
      ["Balcony flowers", "🌻"],
      ["Bubble bath", "🛁"],
    ],
    [
      ["Bunk beds", "🛏️"],
      ["Big dining table", "🍽️"],
      ["Puppy fridge", "🧊"],
      ["Kitchen oven", "🍳"],
      ["Adventure map", "🗺️"],
      ["Workshop bench", "🛠️"],
      ["Indoor slide", "🛝"],
      ["Doll house", "🏠"],
      ["Garden swing", "🌿"],
      ["Big fish tank", "🐠"],
      ["Bicycle stand", "🚲"],
      ["Homework desk", "✏️"],
      ["Telescope", "🔭"],
      ["Movie screen", "🎬"],
      ["Garden fountain", "⛲"],
      ["Bird feeder", "🐦"],
      ["Sand pit", "🏖️"],
      ["Toy drum kit", "🥁"],
      ["Rocket tent", "🚀"],
      ["Berry garden", "🍓"],
    ],
    [
      ["Cloud bed", "☁️"],
      ["Game table", "🎲"],
      ["Big play tunnel", "🌀"],
      ["Climbing frame", "🪜"],
      ["Garden pool", "🏊"],
      ["Trampoline", "🏀"],
      ["Picnic set", "🧺"],
      ["Puppy piano", "🎹"],
      ["Science station", "🧪"],
      ["Big craft cabinet", "🗄️"],
      ["Mini train track", "🚃"],
      ["Costume closet", "🎭"],
      ["Puppy bakery", "🧁"],
      ["Pizza oven", "🍕"],
      ["Waffle machine", "🧇"],
      ["Greenhouse", "🌱"],
      ["Book nook", "📖"],
      ["Hamster habitat", "🐹"],
      ["Robot helper", "🤖"],
      ["Rooftop hammock", "🏝️"],
    ],
    [
      ["Royal puppy bed", "👑"],
      ["Grand library", "📚"],
      ["Indoor waterfall", "🌊"],
      ["Giant ball pit", "🟣"],
      ["Cinema seats", "🎟️"],
      ["Space observatory", "🪐"],
      ["Puppy gym", "🏋️"],
      ["Art gallery", "🖼️"],
      ["Music studio", "🎙️"],
      ["Indoor treehouse", "🌳"],
      ["Giant aquarium", "🐬"],
      ["Adventure simulator", "🕹️"],
      ["Rainbow slide", "🌈"],
      ["Rooftop garden", "🌷"],
      ["Treasure display", "💎"],
      ["Party stage", "🎉"],
      ["Ice cream bar", "🍦"],
      ["Sky bridge", "🌉"],
      ["Puppy spa", "🫧"],
      ["Moonlight dome", "🌙"],
    ],
  ];
  const catalog = lists.flatMap((rows, tier) =>
    rows.map(([name, icon], index) => ({
      id: `home-${tier}-${index}`,
      tier,
      index,
      name,
      icon,
      price: [1, 3, 5, 8, 12][tier] + (index % 6) * [1, 1, 2, 2, 4][tier],
    })),
  );
  let data = { tier: 0, owned: [], placed: [], positions: {} },
    dialog,
    hooks,
    view = 0,
    selected = null;
  try {
    const v = JSON.parse(localStorage.getItem("bad-cat-puppy-house-v1"));
    if (v) {
      data.tier = Math.max(0, Math.min(4, Math.floor(v.tier) || 0));
      data.owned = [
        ...new Set(
          (v.owned || []).filter((id) => catalog.some((i) => i.id === id)),
        ),
      ];
      data.placed = [
        ...new Set((v.placed || []).filter((id) => data.owned.includes(id))),
      ];
      data.positions =
        v.positions && typeof v.positions === "object" ? v.positions : {};
    }
  } catch {}
  const $ = (s) => dialog.querySelector(s);
  function save() {
    try {
      localStorage.setItem("bad-cat-puppy-house-v1", JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  }
  function message(text) {
    $("#house-status").textContent = text;
  }
  function count(tier) {
    return catalog.filter((i) => i.tier === tier && data.placed.includes(i.id))
      .length;
  }
  function buy(id) {
    const item = catalog.find((i) => i.id === id);
    if (
      !item ||
      item.tier !== data.tier ||
      view !== data.tier ||
      data.owned.includes(id)
    )
      return false;
    if (!window.badCatCampaign.spendTreats(item.price)) {
      message(
        `You need ${item.price} treats for ${item.name}. Earn treats in spelling, notes, pipe repairs or Road Adventure.`,
      );
      return false;
    }
    data.owned.push(id);
    data.placed.push(id);
    if (!save()) {
      data.owned = data.owned.filter((x) => x !== id);
      data.placed = data.placed.filter((x) => x !== id);
      window.badCatCampaign.awardTreats(item.price);
      message("Saving is unavailable. Your treats were returned.");
      return false;
    }
    hooks.sound("shield");
    render();
    message(`${item.name} added! Tap it in your home to let Dylan try it.`);
    return true;
  }
  function upgrade() {
    if (view !== data.tier || data.tier === 4 || count(data.tier) !== 20)
      return false;
    const price = homes[data.tier].upgrade;
    if (!window.badCatCampaign.spendTreats(price)) {
      message(
        `The next home costs ${price} treats. Your furnished home is saved while you earn them.`,
      );
      return false;
    }
    data.tier++;
    view = data.tier;
    if (!save()) {
      data.tier--;
      view = data.tier;
      window.badCatCampaign.awardTreats(price);
      return false;
    }
    hooks.sound("victory");
    render();
    message(
      `Welcome to your ${homes[view].name.toLowerCase()}! It starts empty. Your previous home is saved.`,
    );
    return true;
  }
  function use(item, node) {
    selected = item.id;
    const pup = $("#house-puppy"),
      box = node.getBoundingClientRect(),
      scene = $("#house-building").getBoundingClientRect();
    pup.style.left =
      Math.max(5, Math.min(90, ((box.x - scene.x) / scene.width) * 100)) + "%";
    pup.style.top =
      Math.max(12, Math.min(85, ((box.y - scene.y) / scene.height) * 100)) +
      "%";
    pup.classList.remove("house-playing");
    void pup.offsetWidth;
    pup.classList.add("house-playing");
    node.classList.add("house-item-used");
    setTimeout(() => node.classList.remove("house-item-used"), 1100);
    hooks.sound("puppy");
    message(
      `Dylan explores the ${item.name.toLowerCase()}! Choose Move item, then tap a new spot to rearrange it.`,
    );
  }
  function render() {
    const home = homes[view],
      room = $("#house-building");
    room.className = `home-tier-${view}`;
    room.style.setProperty("--home-rooms", home.rooms);
    room.replaceChildren();
    $("#house-title").textContent = `Your ${home.name}`;
    $("#house-balance").textContent =
      `🍪 ${window.badCatCampaign.snapshot().supplies} treats`;
    $("#house-progress").textContent =
      `${count(view)} / 20 furnishings placed${view < data.tier ? " · saved previous home" : ""}`;
    for (let r = 0; r < home.rooms; r++) {
      const node = document.createElement("div");
      node.className = "house-room";
      node.dataset.room = r;
      room.append(node);
    }
    const owned = catalog.filter(
      (i) => i.tier === view && data.placed.includes(i.id),
    );
    owned.forEach((item) => {
      const b = document.createElement("button");
      b.className = "house-item";
      b.textContent = item.icon;
      b.title = item.name;
      b.setAttribute("aria-label", `Play with ${item.name}`);
      b.dataset.houseItem = item.id;
      const pos = data.positions[item.id];
      if (pos && Number.isFinite(pos.x) && Number.isFinite(pos.y)) {
        b.style.left = Math.max(3, Math.min(94, pos.x)) + "%";
        b.style.top = Math.max(3, Math.min(90, pos.y)) + "%";
      } else {
        const n = item.index,
          cols =
            home.rooms === 1
              ? 5
              : home.rooms === 2
                ? 5
                : home.rooms === 3
                  ? 6
                  : home.rooms === 4
                    ? 5
                    : 6;
        b.style.left = 7 + (n % cols) * (85 / cols) + "%";
        b.style.top =
          25 + Math.floor(n / cols) * (58 / Math.ceil(20 / cols)) + "%";
      }
      b.onclick = (e) => {
        e.stopPropagation();
        use(item, b);
      };
      room.append(b);
    });
    const pup = document.createElement("img");
    pup.id = "house-puppy";
    pup.src = "assets/dylan.png";
    pup.alt = "Dylan, your Dalmatian puppy";
    room.append(pup);
    const shop = $("#house-shop");
    shop.replaceChildren();
    catalog
      .filter((i) => i.tier === view)
      .forEach((item) => {
        const card = document.createElement("article"),
          icon = document.createElement("span"),
          name = document.createElement("b"),
          button = document.createElement("button");
        icon.className = "house-shop-icon";
        icon.textContent = item.icon;
        name.textContent = item.name;
        const owned = data.owned.includes(item.id),
          placed = data.placed.includes(item.id);
        button.dataset.buyItem = item.id;
        button.textContent = owned
          ? placed
            ? "Store item"
            : "Place item"
          : `Buy · ${item.price} treats`;
        button.disabled =
          view !== data.tier ||
          (!owned && window.badCatCampaign.snapshot().supplies < item.price);
        button.onclick = () => {
          if (!owned) {
            buy(item.id);
            return;
          }
          data.placed = placed
            ? data.placed.filter((id) => id !== item.id)
            : [...data.placed, item.id];
          save();
          render();
        };
        card.append(icon, name, button);
        shop.append(card);
      });
    const up = $("#house-upgrade");
    up.hidden = view !== data.tier || view === 4;
    up.disabled =
      count(view) !== 20 ||
      window.badCatCampaign.snapshot().supplies < home.upgrade;
    up.textContent =
      view < 4
        ? `Upgrade to ${homes[view + 1].name} · ${home.upgrade} treats`
        : "Mansion complete";
    $("#house-upgrade-help").textContent =
      view !== data.tier
        ? `This saved home stays furnished. Visit your ${homes[data.tier].name.toLowerCase()} to keep building.`
        : count(view) === 20
          ? view === 4
            ? "Your mansion is fully furnished!"
            : `Fully furnished! Your next home costs ${home.upgrade} treats.`
          : "Place all 20 furnishings to unlock the next home. There is no hurry.";
    const selector = $("#house-visit");
    selector.replaceChildren();
    homes.forEach((h, i) => {
      if (i > data.tier) return;
      const o = document.createElement("option");
      o.value = i;
      o.textContent = h.name + (i === data.tier ? " · current" : " · saved");
      selector.append(o);
    });
    selector.value = view;
  }
  function open() {
    if (
      window.badCatAdventure.isOpen() ||
      document.querySelector("#arsenal-dialog[open],#arsenal-editor[open]")
    )
      return false;
    view = data.tier;
    selected = null;
    render();
    message(
      "Earn treats from spelling, notes, pipe repairs and Road Adventure cookies. Spend them to furnish Dylan’s home. Purchases stay on this device.",
    );
    dialog.showModal();
    return true;
  }
  function init(h) {
    hooks = h;
    dialog = document.createElement("dialog");
    dialog.id = "puppy-house-dialog";
    dialog.setAttribute("aria-labelledby", "house-title");
    dialog.innerHTML =
      '<header><div><p>DYLAN’S PUPPY HOUSE</p><h2 id="house-title"></h2></div><b id="house-balance"></b><button id="house-close" aria-label="Close Puppy House">×</button></header><p id="house-status" role="status"></p><div class="house-toolbar"><label>Visit <select id="house-visit"></select></label><span id="house-progress"></span><button id="house-move">Move selected item</button></div><div id="house-garden"><div id="house-building"></div></div><div class="house-upgrade"><p id="house-upgrade-help"></p><button id="house-upgrade"></button></div><h3 id="house-shop-heading">Furnish this home · 20 things to collect</h3><div id="house-shop"></div>';
    document.body.append(dialog);
    $("#house-close").onclick = () => dialog.close();
    dialog.addEventListener("close", hooks.closed);
    $("#house-upgrade").onclick = upgrade;
    $("#house-visit").onchange = () => {
      view = Number($("#house-visit").value);
      selected = null;
      render();
    };
    let moving = false;
    $("#house-move").onclick = () => {
      if (!selected || view !== data.tier) {
        message("Tap one of your furnishings first.");
        return;
      }
      moving = true;
      message("Tap a new spot inside your home.");
    };
    $("#house-building").onclick = (e) => {
      if (!moving || !selected) return;
      const r = $("#house-building").getBoundingClientRect();
      data.positions[selected] = {
        x: ((e.clientX - r.x) / r.width) * 100,
        y: ((e.clientY - r.y) / r.height) * 100,
      };
      moving = false;
      save();
      render();
      message("Moved! Your room arrangement is saved.");
    };
    document
      .querySelectorAll("[data-puppy-house]")
      .forEach((b) => (b.onclick = open));
  }
  window.badCatHouse = {
    init,
    open,
    isOpen: () => !!dialog?.open,
    diagnostics: () => ({
      tier: data.tier,
      view,
      homes: homes.map((h) => h.name),
      catalog: catalog.map((i) => ({ ...i })),
      owned: [...data.owned],
      placed: [...data.placed],
      furnished: count(data.tier),
    }),
  };
})();
