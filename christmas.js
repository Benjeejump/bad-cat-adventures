/* One reversible parent switch refreshes content, art and every play surface. */
"use strict";
(() => {
  const season = window.badCatSeason,
    $ = (s) => document.querySelector(s);
  const toggle = document.createElement("label");
  toggle.className = "christmas-toggle";
  toggle.innerHTML =
    '<input id="christmas-mode" type="checkbox"> <span>Christmas mode<small>Snow, North Pole adventures and festive games</small></span>';
  $("#parent-controls").insertBefore(toggle, $("#parent-zero"));
  toggle.querySelector("input").onchange = (e) => season.set(e.target.checked);
  const snow = document.createElement("div");
  snow.className = "christmas-snow";
  snow.setAttribute("aria-hidden", "true");
  snow.innerHTML = Array.from(
    { length: 24 },
    (_, i) =>
      `<i style="--snow-x:${(i * 43) % 100}%;--snow-delay:-${i * 0.9}s;--snow-time:${7 + (i % 5)}s">❄</i>`,
  ).join("");
  document.body.append(snow);
  const banners = [
    ['[data-view="drive"] span', "North Pole adventure"],
    ['[data-view="hq"] span', "Santa’s Mission HQ"],
    [
      ".launch-line",
      "One family sleigh. Three festive troublemakers. A North Pole adventure!",
    ],
    [
      ".launch-hint",
      "Drive through the snow, fly with gifts or dive beneath the ice.",
    ],
    ["#puppy-hq-title", "North Pole Puppy HQ"],
    ["#arsenal-edit-heading", "Choose a festive launcher"],
    ["#arsenal-editor header h2", "My five Christmas launchers"],
    ["#arsenal-dialog header h2", "Dylan’s Christmas inventions"],
    ["#pipe-title", "Metro’s North Pole Pipeworks"],
    ["#pipeworks-dialog .pipe-header p", "ELF WORKSHOP · NO TIME LIMIT"],
    [
      "#pencil-setup > p",
      "Write a Christmas note. Follow the magic candy-cane pencil, with no hurry.",
    ],
    ["#house-friends-panel h3", "Invite a friend for Christmas"],
    ["#spelling-dialog .spell-header p", "CHRISTMAS JINGLE-BEE CODE"],
    [".wordbook-card h2", "Dylan’s Christmas word collection"],
    [
      "#sentence-locked",
      "Collect three words to unlock Santa’s secret sentence code.",
    ],
    ["#forest-title", "Light the North Pole trail"],
    ["#forest-dialog header p", "SNOWY FOREST · CHRISTMAS TIMES TABLES"],
    ["#forest-launch", "🎄 Christmas Forest · times tables"],
    ["#forest-launch-hq", "🎄 Christmas Forest · times tables"],
    ["#pipe-launch span", "Elf Pipeworks"],
    ["#pencil-launch span", "Letters to Santa"],
    ["#arsenal-launch span", "Christmas inventions"],
    ["#carwash-launch span", "Santa’s squid wash"],
    ["#spelling-launch span", "Jingle bees"],
    ["#kitten-launch span", "Elf kitten attack"],
    ["#edit-arsenal", "🎁 My five Christmas launchers"],
    ["#net-launch b", "Net · catch Santa’s letters"],
    ["#furniture-store-launch", "🎁 Christmas furniture store"],
  ];
  const textOriginal = new Map();
  function setLabels() {
    for (const [selector, winter] of banners) {
      const node = $(selector);
      if (!node) continue;
      if (!textOriginal.has(node)) textOriginal.set(node, node.textContent);
      const text = season.active() ? winter : textOriginal.get(node);
      if (node.textContent !== text) node.textContent = text;
    }
  }
  const outfitImages = new Set([
    "luna.png",
    "captain-biscuit.png",
    "giant-puppy.png",
    "kitten.png",
    "spelling-bee.png",
  ]);
  function positionOutfit(img) {
    const hat = img._christmasHat,
      scarf = img._christmasScarf;
    if (!hat) return;
    const show = season.active() && img.offsetWidth > 0;
    hat.hidden = !show;
    scarf.hidden = !show;
    if (!show) return;
    const pet = img.classList.contains("house-friend");
    if (pet) {
      hat.style.left = `calc(${img.style.left} - 14px)`;
      hat.style.top = `calc(${img.style.top} - 38px)`;
      scarf.style.left = `calc(${img.style.left} - 12px)`;
      scarf.style.top = `calc(${img.style.top} - 1px)`;
    } else {
      hat.style.left = img.offsetLeft + img.offsetWidth * 0.47 + "px";
      hat.style.top = img.offsetTop - 4 + "px";
      hat.style.width = Math.max(16, img.offsetWidth * 0.3) + "px";
      hat.style.height = Math.max(12, img.offsetHeight * 0.2) + "px";
      scarf.style.left = img.offsetLeft + img.offsetWidth * 0.35 + "px";
      scarf.style.top = img.offsetTop + img.offsetHeight * 0.68 + "px";
      scarf.style.width = Math.max(16, img.offsetWidth * 0.35) + "px";
    }
  }
  season.positionOutfit = positionOutfit;
  function decorateImage(img) {
    const raw = img.getAttribute("src");
    if (!raw) return;
    const normalized = season.original(raw),
      next = season.asset(normalized);
    if (next !== raw) img.setAttribute("src", next);
    const name = normalized.split("/").pop();
    if (outfitImages.has(name) || normalized.includes("assets/friends/")) {
      if (!img._christmasHat) {
        const parent = img.parentElement;
        if (!parent) return;
        if (getComputedStyle(parent).position === "static")
          parent.classList.add("seasonal-outfit-host");
        const hat = document.createElement("span"),
          scarf = document.createElement("span");
        hat.className = "christmas-hat";
        scarf.className = "christmas-scarf";
        hat.setAttribute("aria-hidden", "true");
        scarf.setAttribute("aria-hidden", "true");
        parent.append(hat, scarf);
        img._christmasHat = hat;
        img._christmasScarf = scarf;
        img.addEventListener("load", () => positionOutfit(img));
      }
      positionOutfit(img);
    }
  }
  const fluidLabels = {
    water: ["Water", "Warm cocoa"],
    slime: ["Green slime", "Peppermint syrup"],
    honey: ["Golden goo", "Gingerbread icing"],
    sparkles: ["Purple sparkle juice", "Elf sparkle milk"],
  };
  function addSnow() {
    document.querySelectorAll("dialog").forEach((dialog) => {
      if (!dialog.querySelector(":scope > .christmas-snow"))
        dialog.append(snow.cloneNode(true));
    });
  }
  function apply() {
    addSnow();
    $("#christmas-mode").checked = season.active();
    document.querySelectorAll("img").forEach(decorateImage);
    window.badCatInventions?.refreshSeason();
    window.badCatArsenal?.render();
    window.badCatHouse?.refreshSeason();
    window.badCatHandwriting?.refreshSeason();
    window.badCatForest?.refreshSeason?.();
    for (const option of document.querySelectorAll("#pipe-fluid option"))
      option.textContent =
        fluidLabels[option.value]?.[season.active() ? 1 : 0] ||
        option.textContent;
    setLabels();
    $("#parent-status").textContent = season.active()
      ? "Christmas mode is on. Progress and treats are unchanged."
      : "Christmas mode is off. Your regular adventure is back.";
    window.dispatchEvent(new Event("resize"));
  }
  window.addEventListener("bad-cat-season", apply);
  let pending = new Set(),
    scheduled = false;
  new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === "attributes") {
        if (record.target instanceof HTMLImageElement)
          pending.add(record.target);
        else if (record.attributeName === "open")
          record.target.querySelectorAll("img").forEach((n) => pending.add(n));
      } else
        for (const node of record.addedNodes) {
          if (node.nodeType !== 1) continue;
          if (node.matches("img")) pending.add(node);
          node.querySelectorAll?.("img").forEach((n) => pending.add(n));
        }
    }
    if (pending.size && !scheduled) {
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        const images = [...pending];
        pending.clear();
        images.filter((n) => n.isConnected).forEach(decorateImage);
      });
    }
  }).observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["src", "open"],
  });
  window.addEventListener("resize", () =>
    document.querySelectorAll("img").forEach(positionOutfit),
  );
  apply();
})();
