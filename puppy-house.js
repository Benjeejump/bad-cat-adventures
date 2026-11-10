/* Five homes with 10, 20, 30, 40 and 50 furnishings. Treats are earned only in game. */
"use strict";
(() => {
  const homes = [
    { name: "Dog house", upgrade: 20, rooms: 1, items: 10 },
    { name: "Dog apartment", upgrade: 40, rooms: 2, items: 20 },
    { name: "House", upgrade: 65, rooms: 3, items: 30 },
    { name: "Big house", upgrade: 90, rooms: 4, items: 40 },
    { name: "Mansion", upgrade: 0, rooms: 6, items: 50 },
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
  const legacyDogHouse = lists[0].slice(10).map(([name, icon], i) => ({
    id: `home-0-${i + 10}`,
    tier: 0,
    index: i + 10,
    name,
    icon,
    price: 0,
  }));
  const extras = [
    ["Puppy hammock", "🏖️"],
    ["Climbing ladder", "🪜"],
    ["Telescope", "🔭"],
    ["Drawing desk", "🎨"],
    ["Mini greenhouse", "🌱"],
    ["Toy sailboat", "⛵"],
    ["Bubble fountain", "🫧"],
    ["Rocket lamp", "🚀"],
    ["Reading tent", "⛺"],
    ["Music box", "🎵"],
    ["Model railway", "🚂"],
    ["Skate ramp", "🛹"],
    ["Puzzle chest", "🧩"],
    ["Puppy portrait", "🖼️"],
    ["Garden swing", "🛝"],
    ["Baking station", "🧁"],
    ["Dinosaur display", "🦕"],
    ["Chess table", "♟️"],
    ["Lego corner", "🧱"],
    ["Butterfly garden", "🦋"],
    ["Mini planetarium", "🌌"],
    ["Robot helper", "🤖"],
    ["Puppy carousel", "🎠"],
    ["Indoor lagoon", "🐠"],
    ["Crystal chandelier", "💡"],
    ["Magic mirror", "🪞"],
    ["Lemonade stand", "🍋"],
    ["Treasure map rug", "🗺️"],
    ["Rainbow art wall", "🌈"],
    ["Star projector", "⭐"],
  ];
  lists.forEach((rows, tier) => {
    if (tier === 0) rows.splice(10);
    while (rows.length < homes[tier].items) {
      const [name, icon] = extras[rows.length - 20];
      rows.push([`${homes[tier].name} ${name.toLowerCase()}`, icon]);
    }
  });
  const catalog = lists.flatMap((rows, tier) =>
    rows.map(([name, icon], index) => ({
      id: `home-${tier}-${index}`,
      tier,
      index,
      name,
      icon,
      price: [6, 12, 20, 30, 42][tier] + (index % 6) * [2, 3, 4, 6, 8][tier],
    })),
  );
  const friends = [
    { id: "golden", name: "Buddy", breed: "Golden Retriever", price: 12 },
    { id: "corgi", name: "Pip", breed: "Corgi", price: 14 },
    { id: "pug", name: "Mochi", breed: "Pug", price: 14 },
    { id: "husky", name: "Nova", breed: "Husky", price: 18 },
    { id: "dachshund", name: "Dash", breed: "Dachshund", price: 16 },
    { id: "beagle", name: "Scout", breed: "Beagle", price: 16 },
    { id: "poodle", name: "Coco", breed: "Poodle", price: 20 },
    { id: "boston", name: "Ziggy", breed: "Boston Terrier", price: 18 },
  ];
  const knownItems = [...catalog, ...legacyDogHouse];
  let data = {
      tier: 0,
      owned: [],
      placed: [],
      positions: {},
      unlockedFriends: [],
      visitors: {},
    },
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
          (v.owned || []).filter((id) => knownItems.some((i) => i.id === id)),
        ),
      ];
      data.placed = [
        ...new Set((v.placed || []).filter((id) => data.owned.includes(id))),
      ];
      data.unlockedFriends = [
        ...new Set(
          (v.unlockedFriends || []).filter((id) =>
            friends.some((f) => f.id === id),
          ),
        ),
      ];
      for (let tier = 0; tier < 5; tier++)
        data.visitors[tier] = [
          ...new Set(
            (v.visitors?.[tier] || []).filter((id) =>
              data.unlockedFriends.includes(id),
            ),
          ),
        ].slice(0, tier + 1);
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
    if (
      view !== data.tier ||
      data.tier === 4 ||
      count(data.tier) !== homes[data.tier].items
    )
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
  const pet = {
    x: 65,
    y: 65,
    target: null,
    phase: "idle",
    action: "",
    pause: 0,
    visits: 0,
    lastItem: null,
    view: 0,
  };
  let petLast = 0;
  const friendPets = new Map();
  function use(item) {
    selected = item.id;
    pet.target = { id: item.id };
    pet.phase = "walking";
    pet.pause = 0;
    message(
      `Dylan is walking to the ${item.name.toLowerCase()}. You can move selected furniture with Move item.`,
    );
  }
  function petAction(name) {
    if (/bed|sofa|cushion|blanket|hammock/i.test(name))
      return ["napping", "A little puppy nap… Zzz"];
    if (/bowl|food|water|kitchen|biscuit|ice cream|baking/i.test(name))
      return ["snacking", "Snack time! Nom nom."];
    if (/book|library|story|reading/i.test(name))
      return ["reading", "One more puppy story!"];
    if (/ball|toy|train|bone|duck|chew|puzzle|gym/i.test(name))
      return ["playing", "Play time!"];
    return ["sniffing", "Sniff sniff… tail wag!"];
  }
  function movePet(actor, pup, bubble, room, dt) {
    if (actor.view !== view) {
      Object.assign(actor, {
        view,
        x: 55 + Math.random() * 20,
        y: 55 + Math.random() * 20,
        target: null,
        phase: "idle",
        pause: 0,
      });
    }
    actor.pause = Math.max(0, actor.pause - dt);
    if (!actor.target && actor.pause === 0) {
      const claimed = new Set(
        [
          pet,
          ...[...friendPets.entries()]
            .filter(([id]) => (data.visitors[view] || []).includes(id))
            .map(([, actor]) => actor),
        ]
          .filter((other) => other !== actor && other.target?.id)
          .map((other) => other.target.id),
      );
      const options = [...room.querySelectorAll("[data-house-item]")].filter(
        (n) => !claimed.has(n.dataset.houseItem),
      );
      const candidates = options.filter(
          (n) => n.dataset.houseItem !== actor.lastItem,
        ),
        nodes = candidates.length ? candidates : options;
      nodes.sort(
        (a, b) =>
          Math.hypot(
            parseFloat(a.style.left) - actor.x,
            parseFloat(a.style.top) - actor.y,
          ) -
          Math.hypot(
            parseFloat(b.style.left) - actor.x,
            parseFloat(b.style.top) - actor.y,
          ),
      );
      actor.target = nodes.length
        ? { id: nodes[0].dataset.houseItem }
        : { x: 20 + Math.random() * 60, y: 35 + Math.random() * 45 };
      actor.phase = "walking";
    }
    if (actor.target) {
      const item = actor.target.id
          ? knownItems.find((i) => i.id === actor.target.id)
          : null,
        node = item
          ? room.querySelector(`[data-house-item="${item.id}"]`)
          : null;
      if (item && !node) actor.target = null;
      else if (actor.phase === "walking") {
        const tx = node ? parseFloat(node.style.left) : actor.target.x,
          ty = node ? parseFloat(node.style.top) : actor.target.y;
        const dx = ((tx - actor.x) * room.clientWidth) / 100,
          dy = ((ty - actor.y) * room.clientHeight) / 100,
          distance = Math.hypot(dx, dy),
          step = dt * 100;
        pup.classList.toggle("pet-facing-left", dx < 0);
        if (distance > step && distance > 1) {
          actor.x += (((dx / distance) * step) / room.clientWidth) * 100;
          actor.y += (((dy / distance) * step) / room.clientHeight) * 100;
        } else {
          actor.x = tx;
          actor.y = ty;
          if (item) {
            const [action, line] = petAction(item.name);
            actor.phase = action;
            actor.action = line;
            actor.pause = 3;
            node.classList.add("house-item-used");
          } else {
            actor.target = null;
            actor.phase = "idle";
            actor.pause = 1.5;
          }
        }
      } else if (actor.pause === 0) {
        node?.classList.remove("house-item-used");
        actor.lastItem = item?.id;
        actor.visits++;
        actor.target = null;
        actor.phase = "idle";
        actor.pause = 1.5;
      }
    }
    pup.style.left = actor.x + "%";
    pup.style.top = actor.y + "%";
    pup.dataset.activity = actor.phase;
    bubble.hidden = ["walking", "idle"].includes(actor.phase);
    bubble.textContent =
      actor === pet
        ? actor.action
        : {
            napping: "Zzz",
            snacking: "Nom!",
            reading: "📖",
            playing: "♫",
            sniffing: "♡",
          }[actor.phase] || "";
    bubble.style.left = actor.x + "%";
    bubble.style.top = actor.y + "%";
  }
  function petFrame(now) {
    const dt = petLast ? Math.min(0.05, (now - petLast) / 1000) : 0;
    petLast = now;
    if (
      dialog?.open &&
      !dialog.classList.contains("house-store-mode") &&
      !dialog.classList.contains("house-friends-mode") &&
      !document.hidden
    ) {
      const room = $("#house-building");
      movePet(pet, $("#house-puppy"), $("#house-pet-bubble"), room, dt);
      for (const id of data.visitors[view] || []) {
        const pup = room.querySelector(`[data-friend="${id}"]`),
          bubble = room.querySelector(`[data-friend-bubble="${id}"]`);
        if (pup && bubble) movePet(friendPets.get(id), pup, bubble, room, dt);
      }
    }
    requestAnimationFrame(petFrame);
  }
  function renderFriends() {
    const visitors = data.visitors[view] || [],
      capacity = view + 1,
      root = $("#house-friends");
    root.replaceChildren();
    $("#house-friend-count").textContent =
      `${visitors.length} / ${capacity} visiting friend${capacity === 1 ? "" : "s"}. Invitations unlock once; swapping friends is free.`;
    for (const friend of friends) {
      const card = document.createElement("article"),
        img = document.createElement("img"),
        title = document.createElement("b"),
        breed = document.createElement("span"),
        button = document.createElement("button");
      img.src = `assets/friends/${friend.id}.svg`;
      img.alt = friend.breed;
      title.textContent = friend.name;
      breed.textContent = friend.breed;
      const unlocked = data.unlockedFriends.includes(friend.id),
        visiting = visitors.includes(friend.id);
      button.dataset.friend = friend.id;
      button.textContent = visiting
        ? "Say goodbye"
        : unlocked
          ? "Invite to play"
          : `Unlock invitation · ${friend.price} treats`;
      button.disabled =
        !visiting &&
        (visitors.length >= capacity ||
          (!unlocked &&
            window.badCatCampaign.snapshot().supplies < friend.price));
      button.onclick = () => {
        const current = data.visitors[view] || [],
          wasUnlocked = data.unlockedFriends.includes(friend.id);
        if (current.includes(friend.id)) {
          data.visitors[view] = current.filter((id) => id !== friend.id);
          save();
          render();
          return;
        }
        if (current.length >= view + 1) return;
        const price = wasUnlocked ? 0 : friend.price;
        if (!window.badCatCampaign.spendTreats(price)) return;
        const oldUnlocked = [...data.unlockedFriends];
        if (!wasUnlocked) data.unlockedFriends.push(friend.id);
        data.visitors[view] = [...current, friend.id];
        if (!save()) {
          data.unlockedFriends = oldUnlocked;
          data.visitors[view] = current;
          window.badCatCampaign.awardTreats(price);
          message("Invitation could not be saved. Treats returned.");
          return;
        }
        dialog.classList.remove("house-friends-mode");
        render();
        dialog.scrollTop = 0;
        message(`${friend.name} the ${friend.breed} came to play!`);
      };
      card.append(img, title, breed, button);
      root.append(card);
    }
  }
  function render() {
    const home = homes[view],
      room = $("#house-building");
    room.className = `home-tier-${view}`;
    room.style.minHeight = `${Math.max(350, Math.ceil(home.items / (innerWidth < 600 ? 4 : 6)) * 62)}px`;
    room.style.setProperty("--home-rooms", home.rooms);
    room.replaceChildren();
    $("#house-title").textContent = dialog.classList.contains(
      "house-store-mode",
    )
      ? `Furniture store · ${home.name}`
      : `Your ${home.name}`;
    $("#house-balance").textContent =
      `🍪 ${window.badCatCampaign.snapshot().supplies} treats`;
    $("#house-progress").textContent =
      `${count(view)} / ${home.items} furnishings placed${view < data.tier ? " · saved previous home" : ""}`;
    for (let r = 0; r < home.rooms; r++) {
      const node = document.createElement("div");
      node.className = "house-room";
      node.dataset.room = r;
      room.append(node);
    }
    const owned = knownItems.filter(
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
          cols = innerWidth < 600 ? 4 : 6;
        b.style.left = 7 + (n % cols) * (85 / cols) + "%";
        b.style.top =
          25 +
          Math.floor(n / cols) *
            (58 / Math.ceil(Math.max(home.items, owned.length) / cols)) +
          "%";
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
    pup.style.left = pet.x + "%";
    pup.style.top = pet.y + "%";
    room.append(pup);
    const bubble = document.createElement("span");
    bubble.id = "house-pet-bubble";
    bubble.hidden = true;
    room.append(bubble);
    for (const id of data.visitors[view] || []) {
      const friend = friends.find((f) => f.id === id);
      if (!friend) continue;
      if (!friendPets.has(id))
        friendPets.set(id, {
          x: 45 + Math.random() * 25,
          y: 45 + Math.random() * 25,
          target: null,
          phase: "idle",
          action: "",
          pause: 0,
          visits: 0,
          lastItem: null,
          view,
        });
      const actor = friendPets.get(id),
        image = document.createElement("img"),
        speech = document.createElement("span");
      image.className = "house-friend";
      image.dataset.friend = id;
      image.src = `assets/friends/${id}.svg`;
      image.alt = `${friend.name}, ${friend.breed}`;
      image.style.left = actor.x + "%";
      image.style.top = actor.y + "%";
      speech.className = "friend-pet-bubble";
      speech.dataset.friendBubble = id;
      speech.hidden = true;
      room.append(image, speech);
    }
    $("#house-shop-heading").textContent =
      `Furniture store · ${home.items} things for this home`;
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
        card.classList.toggle(
          "can-afford",
          !owned && window.badCatCampaign.snapshot().supplies >= item.price,
        );
        card.classList.toggle("furniture-owned", owned);
        const price = document.createElement("small");
        price.className = "furniture-price";
        price.textContent = owned ? "Yours ✓" : `${item.price} treats`;
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
        card.append(icon, name, price, button);
        shop.append(card);
      });
    const up = $("#house-upgrade");
    up.hidden = view !== data.tier || view === 4;
    up.disabled =
      count(view) !== home.items ||
      window.badCatCampaign.snapshot().supplies < home.upgrade;
    up.textContent =
      view < 4
        ? `Upgrade to ${homes[view + 1].name} · ${home.upgrade} treats`
        : "Mansion complete";
    $("#house-upgrade-help").textContent =
      view !== data.tier
        ? `This saved home stays furnished. Visit your ${homes[data.tier].name.toLowerCase()} to keep building.`
        : count(view) === home.items
          ? view === 4
            ? "Your mansion is fully furnished!"
            : `Fully furnished! Your next home costs ${home.upgrade} treats.`
          : `Place all ${home.items} furnishings to unlock the next home. There is no hurry.`;
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
    renderFriends();
  }
  function open(section = "home") {
    if (
      window.badCatAdventure.isOpen() ||
      document.querySelector("#arsenal-dialog[open],#arsenal-editor[open]")
    )
      return false;
    view = data.tier;
    selected = null;
    dialog.classList.toggle("house-store-mode", section === "store");
    dialog.classList.remove("house-friends-mode");
    render();
    message(
      "Earn treats from spelling, notes, pipe repairs and Road Adventure cookies. Spend them to furnish Dylan’s home. Purchases stay on this device.",
    );
    dialog.showModal();
    dialog.scrollTop = 0;
    return true;
  }
  function init(h) {
    hooks = h;
    requestAnimationFrame(petFrame);
    dialog = document.createElement("dialog");
    dialog.id = "puppy-house-dialog";
    dialog.setAttribute("aria-labelledby", "house-title");
    dialog.innerHTML =
      '<header><div><p>DYLAN’S PUPPY HOUSE</p><h2 id="house-title"></h2></div><b id="house-balance"></b><button id="house-close" aria-label="Close Puppy House">×</button></header><p id="house-status" role="status"></p><nav id="house-view-tabs" aria-label="Home and furniture store"><button id="house-home-tab">🏠 My home</button><button id="house-store-tab">🛍 Furniture store</button><button id="house-friends-tab">🐶 Invite friends</button></nav><div class="house-toolbar"><label>Visit <select id="house-visit"></select></label><span id="house-progress"></span><button id="house-move">Move selected item</button></div><div id="house-garden"><div id="house-building"></div></div><div class="house-upgrade"><p id="house-upgrade-help"></p><button id="house-upgrade"></button></div><h3 id="house-shop-heading">Furniture store</h3><div id="house-shop"></div><section id="house-friends-panel"><h3>Invite a friend to play</h3><p id="house-friend-count"></p><div id="house-friends"></div></section>';
    document.body.append(dialog);
    $("#house-close").onclick = () => dialog.close();
    $("#house-home-tab").onclick = () => {
      dialog.classList.remove("house-store-mode", "house-friends-mode");
      render();
      dialog.scrollTop = 0;
    };
    $("#house-store-tab").onclick = () => {
      dialog.classList.remove("house-friends-mode");
      dialog.classList.add("house-store-mode");
      render();
      dialog.scrollTop = 0;
    };
    $("#house-friends-tab").onclick = () => {
      dialog.classList.remove("house-store-mode");
      dialog.classList.add("house-friends-mode");
      render();
      dialog.scrollTop = 0;
    };
    const store = document.createElement("button");
    store.id = "furniture-store-launch";
    store.textContent = "🛍 Furniture store · spend treats";
    store.onclick = () => open("store");
    document.querySelector(".puppy-hq-options").prepend(store);
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
      pet: {
        x: pet.x,
        y: pet.y,
        phase: pet.phase,
        action: pet.action,
        visits: pet.visits,
        target: pet.target?.id || null,
      },
      friendCapacity: view + 1,
      friends: friends.map((f) => ({ ...f })),
      unlockedFriends: [...data.unlockedFriends],
      visitors: [...(data.visitors[view] || [])],
      friendActivity: [...(data.visitors[view] || [])].map((id) => ({
        id,
        ...friendPets.get(id),
      })),
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
