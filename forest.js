/* Untimed multiplication trail: small groups, helpful retries and tables through 12. */
"use strict";
(() => {
  const dialog = document.createElement("dialog");
  dialog.id = "forest-dialog";
  dialog.setAttribute("aria-labelledby", "forest-title");
  dialog.innerHTML =
    '<div class="forest-scenery" aria-hidden="true"><i>♠</i><i>♠</i><i>♠</i><i>♠</i><i>♠</i><div class="forest-moon"></div></div><header><div><p>SPOOKY FOREST · LANTERN TRAIL</p><h2 id="forest-title">Light the puppy path</h2></div><button id="forest-close" aria-label="Leave the forest">×</button></header><section class="forest-game"><div class="forest-select"><label>Times table <select id="forest-table"><option value="starter">2, 5 and 10 · starter trail</option><option value="mix">Mixed · tables 1–12</option></select></label><button id="forest-start">New lantern trail</button></div><div id="forest-lanterns" aria-label="Lit lanterns"></div><div class="forest-trail"><img id="forest-puppy" src="assets/dylan.png" alt="Dylan the Dalmatian follows the glowing trail"><span class="forest-gate">✦</span></div><p id="forest-question"></p><p id="forest-context"></p><div id="forest-answers"></div><button id="forest-hint">Show glowing groups</button><div id="forest-groups" hidden></div><p id="forest-feedback" role="status"></p><p id="forest-reward"></p></section>';
  document.body.append(dialog);
  const $ = (s) => dialog.querySelector(s);
  for (let i = 1; i <= 12; i++) {
    const o = document.createElement("option");
    o.value = i;
    o.textContent = i + " times table";
    $("#forest-table").append(o);
  }
  let round = null,
    timer = 0,
    book = { trails: 0, correct: 0 };
  try {
    const old = JSON.parse(localStorage.getItem("bad-cat-forest-v1") || "null");
    if (
      old &&
      Number.isSafeInteger(old.trails) &&
      old.trails >= 0 &&
      Number.isSafeInteger(old.correct) &&
      old.correct >= 0
    )
      book = { trails: old.trails, correct: old.correct };
  } catch {}
  function save() {
    try {
      localStorage.setItem("bad-cat-forest-v1", JSON.stringify(book));
    } catch {}
  }
  function draw() {
    $("#forest-lanterns").innerHTML = Array.from(
      { length: 6 },
      (_, i) =>
        `<span class="${i < round.solved ? "lit" : ""}" aria-label="${i < round.solved ? "Lit" : "Unlit"} lantern">✦</span>`,
    ).join("");
    $("#forest-puppy").style.left =
      `min(${3 + round.solved * 13}%, calc(100% - 100px))`;
  }
  function question() {
    clearTimeout(timer);
    round.locked = false;
    $("#forest-groups").hidden = true;
    $("#forest-feedback").textContent = "";
    $("#forest-reward").textContent = "";
    const selected = $("#forest-table").value,
      tables =
        selected === "starter"
          ? [2, 5, 10]
          : selected === "mix"
            ? Array.from({ length: 12 }, (_, i) => i + 1)
            : [Number(selected)];
    round.a = tables[Math.floor(Math.random() * tables.length)];
    let b = 1 + Math.floor(Math.random() * 12),
      attempts = 0;
    while (round.used.has(round.a + "x" + b) && attempts++ < 20)
      b = 1 + Math.floor(Math.random() * 12);
    round.b = b;
    round.used.add(round.a + "x" + b);
    $("#forest-question").textContent = `${round.a} × ${round.b} = ?`;
    $("#forest-context").textContent =
      `${round.a} lantern trees, with ${round.b} fireflies on each. How many fireflies?`;
    const correct = round.a * round.b,
      answers = new Set([correct]);
    for (const value of [
      correct + round.a,
      correct - round.a,
      correct + round.b,
      correct - round.b,
      correct + 1,
      correct - 1,
      2,
      3,
      4,
    ]) {
      if (answers.size === 3) break;
      if (value >= 1 && value <= 144 && value !== correct) answers.add(value);
    }
    $("#forest-answers").replaceChildren();
    [...answers]
      .map((n) => [Math.random(), n])
      .sort((a, b) => a[0] - b[0])
      .slice(0, 3)
      .forEach(([, n]) => {
        const button = document.createElement("button");
        button.textContent = n;
        button.onclick = () => answer(n, button);
        $("#forest-answers").append(button);
      });
    draw();
  }
  function hint() {
    $("#forest-groups").hidden = false;
    $("#forest-groups").innerHTML = Array.from(
      { length: round.a },
      () => `<span>${"● ".repeat(round.b)}</span>`,
    ).join("");
    $("#forest-feedback").textContent =
      Array.from({ length: round.a }, () => round.b).join(" + ") +
      ` = ${round.a * round.b}. Count the glowing groups, then try.`;
  }
  function answer(n, button) {
    if (!round || round.locked) return;
    if (n !== round.a * round.b) {
      button.disabled = true;
      hint();
      return;
    }
    round.locked = true;
    round.solved++;
    book.correct++;
    save();
    draw();
    window.badCatCampaign &&
      $("#forest-feedback").replaceChildren(
        document.createTextNode("That’s it! Another lantern lights the way."),
      );
    [...$("#forest-answers").children].forEach((b) => (b.disabled = true));
    if (round.solved === 6) {
      book.trails++;
      save();
      const earned = window.badCatCampaign.awardTreats(5);
      $("#forest-question").textContent = "The forest gate is open!";
      $("#forest-context").textContent =
        "Dylan helped the woodland puppies find their way home.";
      $("#forest-reward").textContent =
        `+${earned} treats · ${book.trails} trails completed`;
      $("#forest-hint").hidden = true;
    } else timer = setTimeout(question, 1400);
  }
  function start() {
    clearTimeout(timer);
    round = { solved: 0, a: 0, b: 0, locked: false, used: new Set() };
    $("#forest-hint").hidden = false;
    question();
  }
  function open() {
    if (
      window.badCatAdventure.isOpen() ||
      document.querySelector("dialog[open]")
    )
      return false;
    dialog.showModal();
    start();
    return true;
  }
  $("#forest-close").onclick = () => dialog.close();
  $("#forest-start").onclick = start;
  $("#forest-table").onchange = start;
  $("#forest-hint").onclick = hint;
  dialog.addEventListener("close", () => {
    clearTimeout(timer);
    round = null;
  });
  const entry = document.createElement("button");
  entry.id = "forest-launch";
  entry.textContent = "🌙 Spooky Forest · times tables";
  entry.onclick = open;
  document.querySelector(".puppy-hq-options").append(entry);
  const hqEntry = entry.cloneNode(true);
  hqEntry.id = "forest-launch-hq";
  hqEntry.onclick = open;
  document.querySelector("#hq-view .hq-banner").append(hqEntry);
  window.badCatForest = {
    open,
    isOpen: () => dialog.open,
    diagnostics: () => ({
      a: round?.a,
      b: round?.b,
      solved: round?.solved || 0,
      trails: book.trails,
      correct: book.correct,
    }),
  };
})();
