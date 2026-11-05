/* An untimed, supportive spelling trap. All practice and words stay on this device. */
"use strict";
(() => {
  const $ = (s) => document.querySelector(s),
    KEY = "bad-cat-wordbook-v1";
  const bank = window.BAD_CAT_WORDS,
    byWord = new Map(bank.map((e) => [e.word, e]));
  const shuffle = (list) => {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  let hooks,
    dialog,
    round = null,
    frame = 0,
    lastFrame = 0,
    movers = [],
    speechToken = 0,
    announced = false;
  let book = {
      words: {},
      grade: "mixed",
      recent: [],
      missed: [],
      sentences: [],
      pending: null,
      calm: false,
    },
    storage = true,
    codeWords = [];
  let resultTimer = null;
  function closeResultAfter(ms) {
    clearTimeout(resultTimer);
    resultTimer = setTimeout(() => {
      if (round?.done) dialog.close();
    }, ms);
  }
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "null");
    if (data) {
      for (const [word, record] of Object.entries(data.words || {}))
        if (
          byWord.has(word) &&
          Number.isInteger(record?.wins) &&
          record.wins > 0
        )
          book.words[word] = {
            wins: Math.min(9999, record.wins),
            assisted: !!record.assisted,
          };
      if (["2", "3", "mixed"].includes(data.grade)) book.grade = data.grade;
      if (typeof data.calm === "boolean") book.calm = data.calm;
      book.recent = Array.isArray(data.recent)
        ? data.recent.filter((w) => byWord.has(w)).slice(-8)
        : [];
      book.missed = Array.isArray(data.missed)
        ? [...new Set(data.missed.filter((w) => byWord.has(w)))].slice(-30)
        : [];
      book.sentences = Array.isArray(data.sentences)
        ? data.sentences
            .filter((s) => typeof s === "string" && s.length <= 180)
            .slice(-20)
        : [];
      if (
        byWord.has(data.pending?.word) &&
        Number.isInteger(data.pending.used) &&
        data.pending.used >= 0 &&
        data.pending.used < 3
      )
        book.pending = {
          word: data.pending.word,
          used: data.pending.used,
          assisted: !!data.pending.assisted,
          feedback: !!data.pending.feedback,
        };
    }
  } catch {
    storage = false;
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(book));
      storage = true;
    } catch {
      storage = false;
    }
    renderBook();
  }
  function say(message) {
    $("#spell-message").textContent = message;
  }
  function chooseWord() {
    const eligible = bank.filter(
        (w) => book.grade === "mixed" || String(w.grade) === book.grade,
      ),
      fresh = eligible.filter((w) => !book.recent.slice(-3).includes(w.word));
    const retry = fresh.filter((w) => book.missed.includes(w.word));
    const choices =
      retry.length && Math.random() < 0.35
        ? retry
        : fresh.length
          ? fresh
          : eligible;
    return choices[Math.floor(Math.random() * choices.length)];
  }
  function speak(entry = round?.entry, explicit = false) {
    if (!entry) return;
    if (explicit) announced = true;
    if (!explicit && !announced && !hooks.canSpeak()) {
      $("#speech-status").textContent = "Tap Hear the word. There is no timer.";
      return;
    }
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      $("#speech-status").textContent =
        "Word audio is unavailable here. Use Look at the word, then try spelling it.";
      return;
    }
    const token = ++speechToken;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(
      `Listen to the sentence. ${entry.sentence} The word is ${entry.word}. Spell ${entry.word}.`,
    );
    u.lang = "en-US";
    u.rate = 0.78;
    u.pitch = 1.05;
    u.volume = 0.9;
    const voices = speechSynthesis.getVoices();
    u.voice =
      voices.find((v) => /^en-US/i.test(v.lang) && v.localService) ||
      voices.find((v) => /^en-US/i.test(v.lang)) ||
      voices.find((v) => /^en/i.test(v.lang)) ||
      null;
    u.onstart = () => {
      if (token === speechToken)
        $("#speech-status").textContent =
          "Listen to the word. Tap the speaker to repeat.";
    };
    u.onend = () => {
      if (token === speechToken)
        $("#speech-status").textContent =
          "Hear it again as many times as you like.";
    };
    u.onerror = (e) => {
      if (
        token === speechToken &&
        !["canceled", "interrupted"].includes(e.error)
      )
        $("#speech-status").textContent =
          "Word audio could not play. Try Hear again, or use Look at the word.";
    };
    $("#speech-status").textContent = "Starting word audio…";
    speechSynthesis.speak(u);
  }
  function pending(feedback = false) {
    if (!round || round.done) return;
    book.pending = {
      word: round.entry.word,
      used: round.used,
      assisted: round.assisted,
      feedback,
    };
    save();
  }
  function slots() {
    const el = $("#word-slots");
    el.replaceChildren();
    for (let i = 0; i < round.entry.word.length; i++) {
      const span = document.createElement("span");
      span.className = "word-slot" + (i < round.fixed ? " fixed-letter" : "");
      span.textContent = round.answer[i]?.letter || "";
      span.setAttribute(
        "aria-label",
        `Letter ${i + 1}${span.textContent ? ": " + span.textContent : ""}`,
      );
      el.append(span);
    }
    $("#check-word").disabled =
      round.answer.length !== round.entry.word.length || round.feedback;
    $("#undo-letter").disabled =
      round.answer.length <= round.fixed || round.feedback;
    $("#clear-letters").disabled =
      round.answer.length <= round.fixed || round.feedback;
  }
  function prepareAttempt() {
    cancelAnimationFrame(frame);
    movers = [];
    round.feedback = false;
    round.answer = [];
    round.fixed = Math.min(round.used, 2, round.entry.word.length - 1);
    const letters = [...round.entry.word.toUpperCase()],
      wrong = shuffle(
        [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].filter((l) => !letters.includes(l)),
      ).slice(0, 10);
    const pool = shuffle([...letters, ...wrong]);
    const field = $("#bee-field");
    field.replaceChildren();
    for (let i = 0; i < pool.length; i++) {
      const bee = document.createElement("button");
      bee.className = "letter-bee";
      bee.dataset.letter = pool[i];
      bee.dataset.bee = String(i);
      bee.setAttribute("aria-label", `Choose letter ${pool[i]}`);
      const art = document.createElement("img");
      art.src = "assets/spelling-bee.png";
      art.alt = "";
      const label = document.createElement("b");
      label.textContent = pool[i];
      bee.append(art, label);
      bee.addEventListener("click", () => select(i));
      bee.addEventListener("pointerenter", () => {
        if (movers[i]) movers[i].holdUntil = performance.now() + 900;
      });
      bee.addEventListener("pointerdown", () => {
        if (movers[i]) movers[i].holdUntil = performance.now() + 900;
      });
      field.append(bee);
      movers.push({
        node: bee,
        letter: pool[i],
        x: 0,
        y: 0,
        vx: (Math.random() < 0.5 ? -1 : 1) * (6 + Math.random() * 8),
        vy: (Math.random() < 0.5 ? -1 : 1) * (5 + Math.random() * 7),
      });
    }
    for (let i = 0; i < round.fixed; i++) {
      const j = movers.findIndex(
        (m) => m.letter === letters[i] && !m.node.disabled,
      );
      movers[j].node.disabled = true;
      round.answer.push({ letter: letters[i], index: j });
    }
    $("#spell-attempt").textContent = `Try ${round.used + 1} of 3`;
    $("#spell-reveal").hidden = true;
    $("#try-spelling-again").hidden = true;
    $("#spell-result-actions").replaceChildren();
    $("#spell-practice-area").hidden = false;
    $("#check-word").hidden = false;
    $("#spell-check-controls").hidden = false;
    $("#spell-rescue").hidden = true;
    $("#spell-close").textContent = "🔒";
    $("#spell-close").setAttribute(
      "aria-label",
      "Finish the spelling challenge to escape",
    );
    slots();
    say(
      round.used
        ? `A puppy filled in ${round.fixed === 1 ? "the first letter" : "the first two letters"}. You can do the rest!`
        : "Bad Cat locked the bee code! Hear the word, then choose the letters in order.",
    );
    if (round.used >= 2) {
      const next = movers.find(
        (m) => !m.node.disabled && m.letter === letters[round.fixed],
      );
      next?.node.classList.add("helpful-bee");
      say("A friendly bee is glowing with the next letter. Take your time.");
    }
    startSwarm();
    pending();
  }
  function startSwarm() {
    let oldW = 0,
      oldH = 0;
    lastFrame = 0;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animate = (now) => {
      if (!round || round.done || round.feedback) return;
      const field = $("#bee-field"),
        w = field.clientWidth,
        columns = w < 450 ? 5 : w > 900 ? 9 : 7,
        size = Math.max(46, Math.min(76, w / columns - 8)),
        rows = Math.ceil(movers.length / columns);
      $("#spell-practice-area").style.minHeight = `${rows * (size + 10)}px`;
      const h = field.clientHeight,
        dt = lastFrame ? Math.min(0.05, (now - lastFrame) / 1000) : 0;
      lastFrame = now;
      movers.forEach((m, i) => {
        if (!oldW) {
          let x, y;
          for (let trial = 0; trial < 60; trial++) {
            x = Math.random() * (w - size);
            y = Math.random() * (h - size);
            if (
              movers
                .slice(0, i)
                .every((p) => Math.hypot(p.x - x, p.y - y) > size)
            )
              break;
          }
          m.x = x;
          m.y = y;
        } else if (w !== oldW || h !== oldH) {
          m.x = (m.x / Math.max(1, oldW - size)) * (w - size);
          m.y = (m.y / Math.max(1, oldH - size)) * (h - size);
        }
        if (
          !reduced &&
          !book.calm &&
          !document.hidden &&
          !m.node.disabled &&
          now > (m.holdUntil || 0)
        ) {
          m.x += m.vx * dt;
          m.y += m.vy * dt;
        }
        if (m.x < 0 || m.x > w - size) m.vx *= -1;
        if (m.y < 0 || m.y > h - size) m.vy *= -1;
        m.x = Math.max(0, Math.min(w - size, m.x));
        m.y = Math.max(0, Math.min(h - size, m.y));
        m.node.style.width = `${size}px`;
        m.node.style.height = `${size}px`;
        m.node.style.transform = `translate(${m.x}px,${m.y}px)`;
      });
      for (let i = 0; i < movers.length; i++)
        for (let j = 0; j < i; j++) {
          const a = movers[i],
            b = movers[j];
          if (a.node.disabled || b.node.disabled) continue;
          const dx = a.x - b.x,
            dy = a.y - b.y,
            d = Math.hypot(dx, dy),
            min = size * 0.85;
          if (d > 0 && d < min) {
            const amount = (min - d) / 2;
            if (now > (a.holdUntil || 0)) {
              a.x += (dx / d) * amount;
              a.y += (dy / d) * amount;
            }
            if (now > (b.holdUntil || 0)) {
              b.x -= (dx / d) * amount;
              b.y -= (dy / d) * amount;
            }
          }
        }
      oldW = w;
      oldH = h;
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
  }
  function select(index) {
    if (
      !round ||
      round.done ||
      round.feedback ||
      round.answer.length >= round.entry.word.length ||
      movers[index].node.disabled
    )
      return;
    movers[index].node.disabled = true;
    round.answer.push({ letter: movers[index].letter, index });
    slots();
    if (
      round.answer.length === round.entry.word.length &&
      round.answer
        .map((a) => a.letter)
        .join("")
        .toLowerCase() === round.entry.word
    )
      check();
  }
  function undo() {
    if (!round || round.feedback || round.answer.length <= round.fixed) return;
    const last = round.answer.pop();
    movers[last.index].node.disabled = false;
    slots();
  }
  function reveal(correct) {
    $("#spell-reveal").hidden = false;
    $("#spell-reveal-label").textContent = correct
      ? "CODE CRACKED · CORRECT SPELLING"
      : "LET’S LEARN THE CORRECT SPELLING";
    $("#correct-spelling").textContent = round.entry.word;
  }
  function beesFlyAway() {
    const layer = document.createElement("div");
    layer.className = "bee-victory-flight";
    layer.setAttribute("aria-hidden", "true");
    const snapshots = movers.map((m) => ({
      node: m.node,
      rect: m.node.getBoundingClientRect(),
    }));
    dialog.append(layer);
    snapshots.forEach(({ node, rect }, i) => {
      const bee = node.cloneNode(true);
      bee.removeAttribute("disabled");
      bee.tabIndex = -1;
      bee.style.cssText = `left:${rect.x}px;top:${rect.y}px;width:${rect.width}px;height:${rect.height}px;opacity:1;transform:none;pointer-events:none`;
      layer.append(bee);
      const dir = i % 2 ? 1 : -1;
      bee.animate(
        [
          { transform: "translate(0,0) rotate(0)", opacity: 1 },
          {
            transform: `translate(${dir * (innerWidth * 0.65 + 120)}px,${-innerHeight * 0.75 - (i % 4) * 70}px) rotate(${dir * 140}deg) scale(.55)`,
            opacity: 0,
          },
        ],
        { duration: 1400 + i * 28, easing: "ease-in", fill: "forwards" },
      );
    });
    setTimeout(() => layer.remove(), 2600);
  }
  function finish(won, early = false) {
    if (!round || round.done) return;
    round.done = true;
    round.feedback = true;
    round.won = won;
    speechToken++;
    window.speechSynthesis?.cancel();
    if (won) beesFlyAway();
    hooks.finished?.();
    cancelAnimationFrame(frame);
    book.pending = null;
    const word = round.entry.word;
    reveal(won);
    $("#spell-practice-area").hidden = true;
    $("#spell-check-controls").hidden = true;
    $("#try-spelling-again").hidden = true;
    $("#spell-rescue").hidden = true;
    $("#spell-close").textContent = "×";
    $("#spell-close").setAttribute("aria-label", "Close word result");
    if (won) {
      const seen = book.words[word];
      book.words[word] = {
        wins: (seen?.wins || 0) + 1,
        assisted: round.assisted || round.used > 1,
      };
      book.missed = book.missed.filter((w) => w !== word);
      save();
      const reward = seen
        ? 1
        : round.assisted
          ? 1
          : Math.max(1, 4 - round.used);
      const earned = window.badCatCampaign.awardTreats(reward);
      say(
        `You spelled ${word}! It’s in your word collection. ${earned ? `+${earned} puppy ${earned === 1 ? "treat" : "treats"}!` : "Your treat jar is full!"}`,
      );
      dialog.classList.add("word-won");
      hooks.celebrate(announced);
    } else {
      book.missed = [...new Set([...book.missed, word])].slice(-30);
      save();
      const delta = window.badCatCampaign.awardTreats(-2);
      say(
        `${early ? "You gave it a try. " : ""}Captain Biscuit cracks the hive and brings you out! ${Math.abs(delta)} treats used for the rescue. The word is ${word}. We can practice it again another day.`,
      );
      dialog.classList.add("word-rescued");
      hooks.sound("puppy");
    }
    $("#spell-title").textContent = won
      ? "Da-dah! You cracked Bad Cat’s bee code!"
      : "Puppy rescue! Look at the word together.";
    const image = $("#spell-result-puppy");
    image.hidden = false;
    const actions = $("#spell-result-actions");
    actions.replaceChildren();
    const close = document.createElement("button");
    close.textContent = "Back to the adventure →";
    close.addEventListener("click", () => dialog.close());
    actions.append(close);
    const practice = document.createElement("button");
    practice.textContent = "Practice another word";
    practice.addEventListener("click", () => {
      dialog.close();
      open();
    });
    actions.append(practice);
    $("#hear-word").disabled = won;
    $("#speech-status").textContent = won
      ? "The code is cracked! Watch the bees fly away."
      : "Tap Hear the word if you’d like to learn it again.";
    renderBook();
    closeResultAfter(won ? 3400 : 7500);
  }
  function check() {
    if (
      !round ||
      round.done ||
      round.feedback ||
      round.answer.length !== round.entry.word.length
    )
      return;
    round.used++;
    const answer = round.answer
      .map((a) => a.letter)
      .join("")
      .toLowerCase();
    if (answer === round.entry.word) {
      finish(true);
      return;
    }
    round.feedback = true;
    cancelAnimationFrame(frame);
    reveal(false);
    $("#your-spelling").textContent = `Your try: ${answer}`;
    $("#your-spelling").hidden = false;
    say(
      "Not quite. Look at the correct word and say it with the puppy. Mistakes help us learn.",
    );
    $("#check-word").disabled = true;
    $("#undo-letter").disabled = true;
    $("#clear-letters").disabled = true;
    $("#spell-check-controls").hidden = true;
    $("#spell-practice-area").hidden = true;
    $("#spell-rescue").hidden = true;
    speak(round.entry, false);
    if (round.used >= 3) {
      finish(false);
      return;
    }
    $("#try-spelling-again").hidden = false;
    $("#try-spelling-again").textContent =
      `Try again with ${round.used === 1 ? "a first-letter hint" : "two letters and a glowing bee"}`;
    pending(true);
  }
  function rescue() {
    if (!round || round.done) {
      dialog.close();
      return;
    }
    say(
      "Bad Cat’s code is still locked. Keep trying the word—there’s no timer. Hear it again, look at the spelling, or calm the bees. A puppy will help after three tries.",
    );
    $("#hear-word").focus();
  }
  function open(word) {
    if (
      !hooks ||
      dialog.open ||
      window.badCatHandwriting?.isOpen() ||
      window.badCatPipes?.isOpen() ||
      window.badCatTargeting?.raidActive() ||
      (document.querySelector("#game-launch:not([hidden])") &&
        !document
          .querySelector("#game-launch")
          .classList.contains("launch-finished"))
    )
      return false;
    if (document.querySelector("#encounter-dialog").open) return false;
    clearTimeout(resultTimer);
    speechToken++;
    window.speechSynthesis?.cancel();
    const resume = book.pending,
      entry = resume
        ? byWord.get(resume.word)
        : byWord.get(word) || chooseWord();
    round = {
      entry,
      used: resume?.used || 0,
      assisted: !!resume?.assisted,
      answer: [],
      fixed: 0,
      done: false,
      feedback: false,
    };
    announced = false;
    $("#hear-word").disabled = false;
    dialog.className = "spelling-dialog";
    $("#spell-title").textContent = "Bad Cat’s spelling bees trapped the crew!";
    $("#spell-result-puppy").hidden = true;
    $("#your-spelling").hidden = true;
    $("#speech-status").textContent =
      "No timer. Hear the word as often as you need.";
    book.recent = [...book.recent, entry.word].slice(-8);
    dialog.showModal();
    hooks.started?.();
    prepareAttempt();
    if (resume?.feedback && round.used > 0) {
      round.feedback = true;
      cancelAnimationFrame(frame);
      reveal(false);
      $("#try-spelling-again").hidden = false;
      $("#check-word").disabled = true;
      $("#spell-rescue").hidden = true;
      $("#spell-check-controls").hidden = true;
      $("#spell-practice-area").hidden = true;
      $("#undo-letter").disabled = true;
      $("#clear-letters").disabled = true;
      say("Welcome back. Here is the spelling to review before your next try.");
    }
    speak(entry, false);
    $("#hear-word").focus();
    return true;
  }
  function renderBook() {
    if (!$("#wordbook-count")) return;
    const words = Object.keys(book.words).sort();
    $("#wordbook-count").textContent =
      `${words.length} words collected · ${bank.length} words to explore${storage ? "" : " · saving unavailable"}`;
    const list = $("#collected-words");
    list.replaceChildren();
    for (const word of words) {
      const button = document.createElement("button");
      button.textContent = word;
      button.title = "Practice this collected word";
      button.addEventListener("click", () => open(word));
      list.append(button);
    }
    $("#sentence-locked").hidden = words.length >= 3;
    $("#sentence-form").hidden = words.length < 3;
    if (words.length >= 3 && codeWords.length < 3) newCode();
  }
  function newCode() {
    const words = Object.keys(book.words);
    if (words.length < 3) return;
    codeWords = shuffle(words).slice(0, 3);
    $("#sentence-code-words").textContent = codeWords.join("  •  ");
    $("#code-sentence").value = "";
    $("#sentence-form").classList.remove("code-cracked");
    $("#sentence-feedback").textContent =
      "Use any two of these words in your own sentence. Start with a capital and end with . ? or !";
  }
  function checkSentence(event) {
    event.preventDefault();
    const text = $("#code-sentence").value.trim(),
      tokens = text.toLowerCase().match(/[a-z]+/g) || [],
      used = codeWords.filter((w) => tokens.includes(w));
    const out = $("#sentence-feedback");
    if (tokens.length < 4 || used.length < 2) {
      out.textContent =
        "Try a sentence of at least four words using two different code words above. Read it aloud with a grown-up.";
      return;
    }
    if (!/^[A-Z]/.test(text) || !/[.!?]$/.test(text)) {
      out.textContent =
        "Your code words are there! Add a capital at the start and . ? or ! at the end.";
      return;
    }
    const duplicate = book.sentences.some(
      (s) => s.toLowerCase() === text.toLowerCase(),
    );
    let gained = 0;
    if (!duplicate) {
      book.sentences = [...book.sentences, text].slice(-20);
      save();
      gained = window.badCatCampaign.awardTreats(2);
    }
    $("#sentence-form").classList.add("code-cracked");
    out.textContent = `Code cracked with ${used.join(" and ")}! ${duplicate ? "You already earned treats for this sentence." : gained ? `+${gained} puppy treats.` : "Your treat jar is full."} Read your sentence aloud. This game checks the code words and punctuation, not grammar.`;
    hooks.sound("puppy");
  }
  function init(h) {
    hooks = h;
    dialog = document.createElement("dialog");
    dialog.id = "spelling-dialog";
    dialog.setAttribute("aria-labelledby", "spell-title");
    dialog.innerHTML = `<div class="bee-backdrop" aria-hidden="true"></div><header class="spell-header"><img src="assets/bad-cat.png" alt="BC"><div><p>CRACK THE SPELLING-BEE CODE</p><h2 id="spell-title"></h2></div><button id="spell-close" aria-label="Try spelling before escaping">×</button></header><section class="spell-body"><div class="spell-tools"><button id="hear-word">🔊 Hear the word</button><span id="spell-attempt">Try 1 of 3</span><button id="calm-bees" aria-pressed="false">Calm the bees</button><button id="look-word">Look at the word · learning hint</button></div><p id="speech-status" role="status"></p><div id="word-slots" aria-label="Your spelling"></div><p id="spell-message" role="status" aria-live="polite"></p><div id="spell-reveal" hidden><small id="spell-reveal-label"></small><strong id="correct-spelling"></strong><span id="your-spelling" hidden></span></div><img id="spell-result-puppy" src="assets/giant-puppy.png" alt="Captain Biscuit celebrates or helps you escape" hidden><div id="spell-practice-area"><div id="bee-field" aria-label="Choose letter bees in word order"></div></div><div id="spell-check-controls"><button id="undo-letter">← Undo letter</button><button id="clear-letters">Clear my letters</button><button id="check-word">Unlock the bee code</button></div><button id="try-spelling-again" hidden>Try again with a hint</button><button id="spell-rescue" hidden>Puppy rescue · uses up to 2 treats</button><div id="spell-result-actions"></div></section>`;
    document.body.append(dialog);
    $("#calm-bees").setAttribute("aria-pressed", book.calm);
    $("#calm-bees").textContent = book.calm ? "Bees calm ✓" : "Calm the bees";
    $("#calm-bees").addEventListener("click", () => {
      book.calm = !book.calm;
      $("#calm-bees").setAttribute("aria-pressed", book.calm);
      $("#calm-bees").textContent = book.calm ? "Bees calm ✓" : "Calm the bees";
      save();
    });
    $("#hear-word").addEventListener("click", () => speak(round?.entry, true));
    $("#look-word").addEventListener("click", () => {
      if (!round || round.done) return;
      round.assisted = true;
      reveal(false);
      say(
        "Look, say the word, then hide it and try. Learning hints are always allowed.",
      );
      pending(round.feedback);
    });
    $("#spell-reveal").addEventListener("click", () => {
      if (round && !round.feedback && !round.done)
        $("#spell-reveal").hidden = true;
    });
    $("#undo-letter").addEventListener("click", undo);
    $("#clear-letters").addEventListener("click", () => {
      while (round && !round.feedback && round.answer.length > round.fixed)
        undo();
    });
    $("#check-word").addEventListener("click", check);
    $("#try-spelling-again").addEventListener("click", () => {
      $("#your-spelling").hidden = true;
      prepareAttempt();
    });
    $("#spell-rescue").addEventListener("click", rescue);
    $("#spell-close").addEventListener("click", rescue);
    dialog.addEventListener("cancel", (e) => {
      e.preventDefault();
      rescue();
    });
    dialog.addEventListener("keydown", (e) => {
      if (!round || round.done || round.feedback) return;
      if (/^[a-z]$/i.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const i = movers.findIndex(
          (m) => !m.node.disabled && m.letter === e.key.toUpperCase(),
        );
        if (i >= 0) {
          e.preventDefault();
          select(i);
        }
      } else if (e.key === "Backspace") {
        e.preventDefault();
        undo();
      }
    });
    dialog.addEventListener("close", () => {
      if (dialog.open) return;
      clearTimeout(resultTimer);
      cancelAnimationFrame(frame);
      speechToken++;
      window.speechSynthesis?.cancel();
      round = null;
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        speechToken++;
        window.speechSynthesis?.cancel();
      }
    });
    const card = document.createElement("section");
    card.className = "panel hq-card wordbook-card";
    card.innerHTML =
      '<span class="hq-icon">🐝</span><h2>Dylan’s word collection</h2><p id="wordbook-count"></p><label for="word-grade">Practice words</label><select id="word-grade"><option value="mixed">Grades 2 + 3</option><option value="2">Grade 2 · gentler words</option><option value="3">Grade 3 · a little stretch</option></select><button id="practice-spelling" class="primary-button">Play the spelling-bee code</button><div id="collected-words"></div>';
    document.querySelector(".hq-grid").append(card);
    $("#word-grade").value = book.grade;
    $("#word-grade").addEventListener("change", () => {
      book.grade = $("#word-grade").value;
      save();
    });
    $("#practice-spelling").addEventListener("click", () => open());
    const sentence = document.createElement("section");
    sentence.className = "panel hq-card sentence-card";
    sentence.innerHTML =
      '<span class="hq-icon">🔐</span><h2>Sentence code laboratory</h2><p id="sentence-locked">Collect three correctly spelled words to unlock a sentence code.</p><form id="sentence-form" hidden><p id="sentence-code-words"></p><label for="code-sentence">Write your sentence</label><textarea id="code-sentence" maxlength="180" rows="3" placeholder="Write a sentence with two of your code words."></textarea><button class="primary-button" type="submit">Crack the sentence code</button><button id="new-sentence-code" type="button">New word code</button><p id="sentence-feedback" role="status"></p></form>';
    document.querySelector(".hq-grid").append(sentence);
    $("#sentence-form").addEventListener("submit", checkSentence);
    $("#new-sentence-code").addEventListener("click", newCode);
    $("#spelling-launch").addEventListener("click", () =>
      window.badCatAdventure.encounter("spelling"),
    );
    renderBook();
  }
  window.badCatSpelling = {
    init,
    open,
    isOpen: () => !!dialog?.open,
    resume: () => {
      if (book.pending) open();
    },
    diagnostics: () => ({
      word: round?.entry.word || null,
      used: round?.used || 0,
      answer: round?.answer.map((a) => a.letter).join("") || "",
      done: !!round?.done,
      bankSize: bank.length,
      collected: Object.keys(book.words),
      grade: book.grade,
    }),
  };
})();
