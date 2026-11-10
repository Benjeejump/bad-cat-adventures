/* Original monoline letter guides, stroke-order tracing and local note keepsakes. */
"use strict";
(() => {
  const letters = {
    a: ["M73 48 C58 35 28 44 28 65 C28 89 68 91 73 65 L73 45", "M73 45 L73 85"],
    b: ["M30 20 L30 85", "M30 59 C42 33 77 42 77 65 C77 88 45 96 30 77"],
    c: ["M77 49 C57 32 27 45 27 65 C27 87 56 96 77 80"],
    d: ["M73 49 C55 34 27 44 27 65 C27 89 59 94 73 76", "M73 20 L73 85"],
    e: ["M28 63 L77 63 C78 36 28 34 27 63 C25 88 60 96 78 79"],
    f: ["M68 23 C52 10 40 24 40 42 L40 85", "M24 47 L65 47"],
    g: [
      "M73 48 C54 34 27 45 27 65 C27 88 58 93 73 76",
      "M73 45 L73 92 C73 111 43 116 29 101",
    ],
    h: ["M30 20 L30 85", "M30 60 C40 37 75 36 75 61 L75 85"],
    i: ["M51 46 L51 85", "M51 28 L52 28"],
    j: ["M62 46 L62 94 C62 112 38 114 30 101", "M62 28 L63 28"],
    k: ["M30 20 L30 85", "M75 45 L31 68 L77 85"],
    l: ["M51 20 L51 85"],
    m: [
      "M20 45 L20 85",
      "M20 59 C23 36 49 36 49 60 L49 85",
      "M49 59 C53 36 80 36 80 60 L80 85",
    ],
    n: ["M29 45 L29 85", "M29 60 C39 36 77 36 77 61 L77 85"],
    o: ["M53 43 C23 43 22 87 53 87 C84 87 83 43 53 43"],
    p: ["M29 45 L29 110", "M29 57 C46 34 79 43 79 65 C79 88 46 96 29 77"],
    q: ["M73 49 C54 34 27 44 27 65 C27 89 59 95 73 76", "M73 45 L73 110"],
    r: ["M33 45 L33 85", "M33 62 C39 42 57 39 71 47"],
    s: ["M75 48 C46 31 18 51 48 64 C85 73 74 99 29 81"],
    t: ["M48 24 L48 72 C48 90 64 92 75 79", "M26 47 L73 47"],
    u: ["M28 45 L28 70 C28 95 72 93 72 67 L72 45", "M72 45 L72 85"],
    v: ["M25 45 L51 85 L78 45"],
    w: ["M14 45 L30 85 L51 52 L72 85 L88 45"],
    x: ["M27 45 L77 85", "M77 45 L27 85"],
    y: ["M26 45 L52 85", "M78 45 L38 110"],
    z: ["M27 45 L78 45 L27 85 L78 85"],
    A: ["M20 85 L51 20 L83 85", "M32 60 L71 60"],
    B: [
      "M28 85 L28 20 L55 20 C88 20 88 52 55 52 L28 52",
      "M55 52 C92 52 92 85 55 85 L28 85",
    ],
    C: ["M81 30 C52 3 21 28 21 53 C21 84 57 104 82 78"],
    D: ["M28 85 L28 20 L48 20 C101 20 101 85 48 85 L28 85"],
    E: ["M78 20 L28 20 L28 85 L78 85", "M28 52 L69 52"],
    F: ["M28 85 L28 20 L78 20", "M28 52 L70 52"],
    G: ["M81 30 C51 4 20 27 20 54 C20 85 55 104 82 78 L82 56 L58 56"],
    H: ["M27 20 L27 85", "M77 20 L77 85", "M27 53 L77 53"],
    I: ["M30 20 L73 20", "M51 20 L51 85", "M30 85 L73 85"],
    J: ["M75 20 L75 68 C75 95 28 98 25 74", "M43 20 L88 20"],
    K: ["M28 20 L28 85", "M79 20 L28 57 L81 85"],
    L: ["M28 20 L28 85 L79 85"],
    M: ["M19 85 L19 20 L51 61 L84 20 L84 85"],
    N: ["M25 85 L25 20 L79 85 L79 20"],
    O: ["M52 20 C8 20 8 86 52 86 C96 86 96 20 52 20"],
    P: ["M28 85 L28 20 L53 20 C91 20 91 55 53 55 L28 55"],
    Q: ["M52 20 C8 20 8 86 52 86 C96 86 96 20 52 20", "M61 68 L86 95"],
    R: ["M28 85 L28 20 L53 20 C91 20 91 55 53 55 L28 55", "M52 55 L82 85"],
    S: ["M79 29 C46 6 16 27 37 46 C51 58 82 53 82 72 C82 94 43 99 24 78"],
    T: ["M18 20 L86 20", "M52 20 L52 85"],
    U: ["M25 20 L25 63 C25 95 79 95 79 63 L79 20"],
    V: ["M20 20 L52 85 L84 20"],
    W: ["M12 20 L29 85 L52 45 L75 85 L92 20"],
    X: ["M24 20 L80 85", "M80 20 L24 85"],
    Y: ["M20 20 L52 53 L84 20", "M52 53 L52 85"],
    Z: ["M25 20 L80 20 L25 85 L80 85"],
    ".": ["M51 85 L52 85"],
    ",": ["M54 82 L49 94"],
    "'": ["M53 24 L49 36"],
  };
  Object.assign(letters, window.badCatCursive.letters);
  const normalNotes = [
    "You are kind. I like your hugs.",
    "We can help. You are my pal.",
    "The puppy can hop. We can play.",
    "I see a cat. The cat is big.",
    "You make me smile. I like our walks.",
    "You make fun things. We can fix pipes.",
    "Jack can jump. We can jump too.",
    "Try a quick quiz. You can do it.",
    "Max can fix a box. I can help him.",
    "Five pups wave. We can wave back.",
    "Zoe has a kite. We can fly it.",
    "Buzz is a bee. He can zip and zoom.",
    "This quilt is soft. I like it on my bed.",
    "We share some jam. It is very sweet.",
    "Please bring a drum. We can make music.",
  ];
  const notes = [...normalNotes, ...window.badCatSeason.winterNotes];
  const currentNotes = () =>
    window.badCatSeason.active()
      ? window.badCatSeason.winterNotes
      : normalNotes;
  const recipients = [
    ["Luna", "assets/luna.png"],
    ["Captain Biscuit", "assets/captain-biscuit.png"],
    ["Giant Puppy", "assets/giant-puppy.png"],
  ];
  let dialog,
    svg,
    hooks,
    round,
    samples = [],
    currentPath,
    total = 0,
    active = false,
    pointer = null,
    lastPoint = null,
    frame = 0,
    animationStart = 0,
    doneTimer,
    tracingReady = false;
  let demoUntil = 0;
  let book = { pending: null, notes: [], alphabet: [], completedNotes: [] };
  try {
    const saved = JSON.parse(localStorage.getItem("bad-cat-pencil-v1"));
    if (saved && Array.isArray(saved.notes))
      book = {
        notes: saved.notes.filter((n) => notes.includes(n.text)).slice(-6),
        alphabet: [
          ...new Set(
            (Array.isArray(saved.alphabet)
              ? saved.alphabet
              : saved.notes.flatMap((n) => [...n.text.toLowerCase()])
            ).filter((ch) => /^[a-z]$/.test(ch)),
          ),
        ],
        completedNotes: [
          ...new Set(
            (Array.isArray(saved.completedNotes)
              ? saved.completedNotes
              : saved.notes.map((n) => n.text)
            ).filter((t) => notes.includes(t)),
          ),
        ],
        pending:
          saved.pending && notes.includes(saved.pending.text)
            ? saved.pending
            : null,
      };
  } catch {}
  const $ = (s) => dialog.querySelector(s);
  function save() {
    try {
      localStorage.setItem("bad-cat-pencil-v1", JSON.stringify(book));
    } catch {}
  }
  function persist() {
    if (!round || round.done) return;
    book.pending = {
      text: round.text,
      to: round.to,
      index: round.index,
      stroke: round.stroke,
      completed: round.completed,
      letterInk: round.letterInk,
      guideVersion: 2,
    };
    save();
  }
  const dists = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  function wordAt(index) {
    const a = round.text.lastIndexOf(" ", index) + 1,
      b = round.text.indexOf(" ", index);
    return round.text.slice(a, b < 0 ? undefined : b).replace(/[.,]/g, "");
  }
  function sentenceStrip() {
    const root = $("#pencil-note-text");
    root.replaceChildren();
    [...round.text].forEach((ch, i) => {
      const span = document.createElement("span");
      span.textContent = ch;
      span.className =
        i < round.index
          ? "note-inked"
          : i === round.index
            ? "note-current"
            : "note-future";
      root.append(span);
    });
    $("#pencil-count").textContent =
      `${round.completed.length} of ${round.text.replace(/ /g, "").length} letters and marks`;
  }
  function focusPage() {
    if (!round || round.done) return;
    svg.classList.toggle("large-tracing", !round.wholePage);
    if (round.wholePage) {
      svg.setAttribute("viewBox", "0 0 1000 380");
      return;
    }
    const root = svg.querySelector(`[data-letter-index="${round.index}"]`);
    if (!root) return;
    const box = root.getBBox(),
      m = root.transform.baseVal.consolidate().matrix;
    const x = box.x * m.a + m.e,
      y = box.y * m.d + m.f;
    const width = box.width * m.a,
      height = box.height * m.d;
    svg.setAttribute(
      "viewBox",
      `${x - 24} ${y - 20} ${Math.max(width + 48, 150)} ${Math.max(height + 40, 160)}`,
    );
  }
  function renderLetter() {
    tracingReady = false;
    clearTimeout(doneTimer);
    active = false;
    pointer = null;
    lastPoint = null;
    cancelAnimationFrame(frame);
    while (round.text[round.index] === " ") round.index++;
    if (round.index >= round.text.length) {
      finish();
      return;
    }
    const ch = round.text[round.index],
      strokes = letters[ch];
    if (!strokes) {
      round.index++;
      renderLetter();
      return;
    }
    round.progress = 0;
    round.points = [];
    sentenceStrip();
    $("#pencil-letter").textContent = ch;
    $("#pencil-word").textContent = `in “${wordAt(round.index)}”`;
    $("#pencil-step").textContent =
      `Stroke ${round.stroke + 1} of ${strokes.length} · start at the glowing star`;
    $("#pencil-status").textContent =
      "Follow the curved cursive trail across the page. The printed sentences show what it says. There is no rush.";
    buildPage(svg, round.text, round.index, round.stroke);
    const root = svg.querySelector(`[data-letter-index="${round.index}"]`);
    root.id = "letter-guides";
    currentPath = root.children[round.stroke];
    focusPage();
    total = currentPath.getTotalLength();
    samples = [];
    for (let n = 0; n <= total; n += 1.5) {
      const p = currentPath.getPointAtLength(n);
      samples.push({ x: p.x, y: p.y });
    }
    samples.push(currentPath.getPointAtLength(total));
    const extra = document.createElementNS("http://www.w3.org/2000/svg", "g");
    extra.innerHTML =
      '<path id="pencil-trace" fill="none"/><circle id="pencil-star-halo" r="7"/><text id="pencil-star" text-anchor="middle" dominant-baseline="central">★</text><g id="magic-pencil"><path d="m0 0 3-14 5 2-6 13Z" fill="#ffd477" stroke="#573d2c" stroke-width=".8"/><path d="m0 0 2-5 2 1Z" fill="#233a4d"/><path d="m3-14 1-3 5 2-1 3Z" fill="#ce7a98" stroke="#573d2c" stroke-width=".6"/></g>';
    root.append(extra);
    const trace = $("#pencil-trace");
    trace.setAttribute("d", strokes[round.stroke]);
    trace.style.strokeDasharray = total;
    trace.style.strokeDashoffset = total;
    const start = samples[0];
    $("#pencil-star-halo").setAttribute("cx", start.x);
    $("#pencil-star-halo").setAttribute("cy", start.y);
    $("#pencil-star").setAttribute("x", start.x);
    $("#pencil-star").setAttribute("y", start.y);
    animationStart = performance.now();
    tracingReady = true;
    frame = requestAnimationFrame(animate);
    persist();
    const scroller = $("#pencil-page-scroll"),
      bounds = root.getBoundingClientRect(),
      view = scroller.getBoundingClientRect();
    if (bounds.left < view.left || bounds.right > view.right)
      scroller.scrollLeft += bounds.left - view.left - 30;
  }
  function animate(now) {
    if (!dialog.open || round.done) return;
    const reduced =
      matchMedia("(prefers-reduced-motion: reduce)").matches && now > demoUntil;
    const t = reduced ? 0 : Math.min(1, ((now - animationStart) % 5500) / 4000);
    const startRatio = round.progress / (samples.length - 1);
    const p = currentPath.getPointAtLength(
      total * (startRatio + (1 - startRatio) * t),
    );
    $("#magic-pencil").setAttribute("transform", `translate(${p.x} ${p.y})`);
    frame = requestAnimationFrame(animate);
  }
  function local(e) {
    const p = svg.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    return p.matrixTransform(currentPath.getScreenCTM().inverse());
  }
  function moveAlong(point) {
    const generation = `${round.index}:${round.stroke}`;
    const start = lastPoint || point,
      length = dists(start, point),
      steps = Math.max(1, Math.ceil(length / 2));
    for (let i = 1; i <= steps && active; i++) {
      const p = {
        x: start.x + ((point.x - start.x) * i) / steps,
        y: start.y + ((point.y - start.y) * i) / steps,
      };
      const needed = samples[round.progress];
      if (dists(p, needed) > 20) continue;
      let best = round.progress;
      for (
        let j = round.progress;
        j < Math.min(samples.length, round.progress + 9);
        j++
      )
        if (dists(p, samples[j]) <= 16) best = j;
      round.progress = best;
      const star = samples[best];
      $("#pencil-star-halo").setAttribute("cx", star.x);
      $("#pencil-star-halo").setAttribute("cy", star.y);
      $("#pencil-star").setAttribute("x", star.x);
      $("#pencil-star").setAttribute("y", star.y);
      round.points.push({
        x: Math.round(p.x * 10) / 10,
        y: Math.round(p.y * 10) / 10,
      });
      $("#pencil-trace").style.strokeDashoffset =
        total * (1 - round.progress / (samples.length - 1));
      if (round.progress >= samples.length - 2) {
        completeStroke();
        break;
      }
    }
    lastPoint = generation === `${round.index}:${round.stroke}` ? point : null;
  }
  function completeStroke() {
    const carryPointer = pointer,
      singleStroke = letters[round.text[round.index]].length === 1;
    tracingReady = false;
    active = false;
    pointer = null;
    round.letterInk.push(
      round.points.length ? round.points : [samples[0], samples.at(-1)],
    );
    round.stroke++;
    if (round.stroke >= letters[round.text[round.index]].length) {
      const learnt = round.text[round.index].toLowerCase();
      if (/^[a-z]$/.test(learnt) && !book.alphabet.includes(learnt))
        book.alphabet.push(learnt);
      round.completed.push({
        ch: round.text[round.index],
        ink: round.letterInk,
      });
      round.index++;
      round.stroke = 0;
      round.letterInk = [];
      persist();
      $("#pencil-status").textContent =
        "Lovely tracing! Keep following the sentence.";
      if (singleStroke && /^[a-z]$/.test(round.text[round.index] || "")) {
        renderLetter();
        active = true;
        pointer = carryPointer;
        lastPoint = null;
      } else doneTimer = setTimeout(renderLetter, 450);
    } else {
      persist();
      $("#pencil-status").textContent =
        "Good stroke! Lift your finger, then start at the next star.";
      doneTimer = setTimeout(renderLetter, 450);
    }
  }
  function buildPage(sheet, text, index, stroke) {
    const ns = "http://www.w3.org/2000/svg";
    sheet.replaceChildren();
    sheet.setAttribute("viewBox", "0 0 1000 380");
    const defs = document.createElementNS(ns, "defs");
    defs.innerHTML =
      '<linearGradient id="pencil-ink"><stop stop-color="#287b9c"/><stop offset="1" stop-color="#205477"/></linearGradient>';
    sheet.append(defs);
    const { lines, positions } = window.badCatCursive.layout(text);
    lines.forEach((line, row) => {
      const label = document.createElementNS(ns, "text");
      label.setAttribute("x", 40);
      label.setAttribute("y", 28 + row * 180);
      label.setAttribute("class", "note-print-label");
      label.textContent = line;
      sheet.append(label);
      const guide = document.createElementNS(ns, "path");
      const top = 53 + row * 180;
      guide.setAttribute("class", "page-writing-lines");
      guide.setAttribute(
        "d",
        `M24 ${top + 19}H976M24 ${top + 43}H976M24 ${top + 81}H976M24 ${top + 105}H976`,
      );
      sheet.append(guide);
    });
    for (const pos of positions) {
      const g = document.createElementNS(ns, "g");
      g.dataset.letterIndex = pos.index;
      g.dataset.row = pos.y > 200 ? "2" : "1";
      g.setAttribute(
        "transform",
        `translate(${pos.x} ${pos.y}) scale(${pos.sx} ${pos.sy})`,
      );
      g.setAttribute("class", "cursive-glyph");
      (letters[pos.ch] || []).forEach((d, i) => {
        const path = document.createElementNS(ns, "path");
        path.setAttribute("d", d);
        path.setAttribute(
          "class",
          pos.index < index || (pos.index === index && i < stroke)
            ? "letter-complete"
            : pos.index === index && i === stroke
              ? "letter-active"
              : "letter-future",
        );
        g.append(path);
      });
      sheet.append(g);
    }
  }
  function drawFinished(root, completed, text) {
    root.replaceChildren();
    const sheet = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    sheet.setAttribute("role", "img");
    sheet.setAttribute("aria-label", text);
    buildPage(sheet, text, text.length, 0);
    root.append(sheet);
  }
  function finish() {
    round.done = true;
    cancelAnimationFrame(frame);
    book.pending = null;
    if (!book.completedNotes.includes(round.text))
      book.completedNotes.push(round.text);
    book.notes.push({
      text: round.text,
      to: round.to,
      completed: round.completed,
    });
    book.notes = book.notes.slice(-6);
    save();
    window.badCatCampaign.awardTreats(8);
    hooks.sound("victory");
    $("#pencil-work").hidden = true;
    $("#pencil-finished").hidden = false;
    $("#pencil-title").textContent = `A note for ${round.to}!`;
    $("#pencil-finished-text").textContent = round.text;
    drawFinished($("#pencil-finished-art"), round.completed, round.text);
    $("#pencil-status").textContent =
      "You wrote two sentences! Your neat cursive note is saved on this device. +8 puppy treats.";
  }
  function begin(pending) {
    clearTimeout(doneTimer);
    round = pending
      ? {
          ...pending,
          stroke: pending.guideVersion === 2 ? pending.stroke : 0,
          letterInk: pending.guideVersion === 2 ? pending.letterInk : [],
          done: false,
          progress: 0,
          points: [],
        }
      : {
          text: $("#pencil-message").value,
          to: $("#pencil-recipient").value,
          index: 0,
          stroke: 0,
          completed: [],
          letterInk: [],
          done: false,
        };
    $("#pencil-setup").hidden = true;
    $("#pencil-work").hidden = false;
    $("#pencil-finished").hidden = true;
    $("#pencil-title").textContent = "Follow the Magic Pencil";
    renderLetter();
  }
  function open() {
    if (
      window.badCatAdventure.isOpen() ||
      document.querySelector("#arsenal-dialog[open]")
    )
      return false;
    dialog.showModal();
    $("#pencil-finished").hidden = true;
    if (book.pending) begin(book.pending);
    else {
      $("#pencil-setup").hidden = false;
      $("#pencil-work").hidden = true;
      $("#pencil-status").textContent =
        "Choose a friend and a note. Trace one letter at a time. No timer, no grades.";
      $("#pencil-title").textContent = "A little note, written by you";
    }
    return true;
  }
  function init(h) {
    hooks = h;
    dialog = document.createElement("dialog");
    dialog.id = "handwriting-dialog";
    dialog.setAttribute("aria-labelledby", "pencil-title");
    dialog.innerHTML =
      '<header class="pencil-header"><img src="assets/luna.png" alt="Luna"><div><p>MAGIC PENCIL · YOUR OWN HANDWRITING</p><h2 id="pencil-title"></h2></div><button id="pencil-close" aria-label="Save and finish later">×</button></header><p id="pencil-status" role="status"></p><section id="pencil-setup"><label>To a teammate <select id="pencil-recipient"></select></label><label>Your two-sentence note <select id="pencil-message"></select></label><p>Start at the star. Follow the pencil. Lift your finger for the next stroke. Take as long as you like.</p><button id="pencil-begin">Let’s write a note</button><div id="pencil-course"></div><div id="pencil-keepsakes"></div></section><section id="pencil-work" hidden><p id="pencil-note-text" aria-label="Your note"></p><div class="pencil-letter-heading"><b id="pencil-letter"></b><span id="pencil-word"></span><small id="pencil-count"></small></div><p id="pencil-step"></p><div id="pencil-page-scroll"><svg id="writing-pad" viewBox="0 0 1000 380" aria-label="Two-line cursive tracing page"></svg></div><div class="pencil-controls"><button id="pencil-demo">Show me the stroke again</button><button id="pencil-zoom">Whole page / tracing size</button><button id="pencil-later">Save and finish later</button></div></section><section id="pencil-finished" hidden><div id="pencil-finished-art"></div><p id="pencil-finished-text"></p><button id="pencil-new">Write another note</button></section>';
    document.body.append(dialog);
    svg = $("#writing-pad");
    for (const [name] of recipients) {
      const o = document.createElement("option");
      o.value = name;
      o.textContent = name;
      $("#pencil-recipient").append(o);
    }
    for (const text of currentNotes()) {
      const o = document.createElement("option");
      o.value = text;
      o.textContent = text;
      $("#pencil-message").append(o);
    }
    $("#pencil-begin").onclick = () => begin();
    $("#pencil-zoom").onclick = () => {
      if (!round) return;
      round.wholePage = !round.wholePage;
      $("#pencil-zoom").textContent = round.wholePage
        ? "Large tracing"
        : "Whole note";
      focusPage();
    };
    $("#pencil-demo").onclick = () => {
      animationStart = performance.now();
      demoUntil = animationStart + 5500;
      $("#pencil-status").textContent =
        "Watch where the pencil starts and which way it goes. Then try with your finger.";
    };
    const close = () => {
      persist();
      dialog.close();
    };
    $("#pencil-close").onclick = close;
    $("#pencil-later").onclick = close;
    dialog.addEventListener("cancel", () => persist());
    dialog.addEventListener("close", () => {
      cancelAnimationFrame(frame);
      clearTimeout(doneTimer);
      active = false;
      hooks.closed();
    });
    $("#pencil-new").onclick = () => {
      round = null;
      $("#pencil-setup").hidden = false;
      $("#pencil-finished").hidden = true;
      renderKeepsakes();
    };
    svg.addEventListener("pointerdown", (e) => {
      if (!round || round.done || !tracingReady || !samples.length) return;
      e.preventDefault();
      const p = local(e);
      if (dists(p, samples[round.progress]) > 22) {
        $("#pencil-status").textContent =
          "Find the glowing star, then follow the trail. You can try as often as you like.";
        return;
      }
      active = true;
      pointer = e.pointerId;
      lastPoint = p;
      try {
        svg.setPointerCapture(e.pointerId);
      } catch {}
      moveAlong(p);
    });
    svg.addEventListener("pointermove", (e) => {
      if (!active || e.pointerId !== pointer) return;
      e.preventDefault();
      moveAlong(local(e));
    });
    const lift = () => {
      active = false;
      pointer = null;
      lastPoint = null;
    };
    svg.addEventListener("pointerup", lift);
    svg.addEventListener("pointercancel", lift);
    svg.addEventListener("lostpointercapture", lift);
    document.querySelectorAll("[data-handwriting]").forEach((b) =>
      b.addEventListener("click", () => {
        renderKeepsakes();
        open();
      }),
    );
  }
  function renderCourse() {
    const root = $("#pencil-course");
    root.replaceChildren();
    const label = document.createElement("p");
    label.textContent =
      book.alphabet.length === 26
        ? "You have practised all 26 letters!"
        : `${book.alphabet.length} of 26 letters explored · ${book.completedNotes.length} of ${currentNotes().length} notes completed`;
    root.append(label);
    const grid = document.createElement("div");
    grid.className = "pencil-alphabet";
    for (const ch of "abcdefghijklmnopqrstuvwxyz") {
      const badge = document.createElement("span");
      badge.textContent = ch.toUpperCase();
      badge.className = book.alphabet.includes(ch)
        ? "letter-practised"
        : "letter-to-explore";
      badge.title = book.alphabet.includes(ch)
        ? `${ch}: practised`
        : `${ch}: still to explore`;
      grid.append(badge);
    }
    root.append(grid);
    const candidates = currentNotes().filter(
      (t) => !book.completedNotes.includes(t),
    );
    const ranked = (candidates.length ? candidates : currentNotes())
      .map((text) => ({
        text,
        newLetters: new Set(
          [...text.toLowerCase()].filter(
            (ch) => /^[a-z]$/.test(ch) && !book.alphabet.includes(ch),
          ),
        ).size,
      }))
      .sort((a, b) => b.newLetters - a.newLetters);
    $("#pencil-message").value = ranked[0].text;
  }
  function renderKeepsakes() {
    renderCourse();
    const root = $("#pencil-keepsakes");
    root.replaceChildren();
    if (!book.notes.length) return;
    const title = document.createElement("h3");
    title.textContent = "Your saved notes";
    root.append(title);
    book.notes.forEach((n) => {
      const box = document.createElement("details");
      const summary = document.createElement("summary");
      summary.textContent = `To ${n.to}: ${n.text}`;
      const art = document.createElement("div");
      drawFinished(art, n.completed || [], n.text);
      box.append(summary, art);
      root.append(box);
    });
  }
  function refreshSeason() {
    const choice = $("#pencil-message"),
      previous = choice.value;
    choice.replaceChildren();
    for (const text of currentNotes()) {
      const o = document.createElement("option");
      o.value = text;
      o.textContent = text;
      choice.append(o);
    }
    if (currentNotes().includes(previous)) choice.value = previous;
    renderKeepsakes();
  }
  window.badCatHandwriting = {
    refreshSeason,
    init,
    open,
    isOpen: () => !!dialog?.open,
    diagnostics: () => ({
      text: round?.text,
      index: round?.index,
      stroke: round?.stroke,
      progress: round?.progress,
      totalSamples: samples.length,
      done: !!round?.done,
      saved: book.notes.length,
      pending: !!book.pending,
      alphabet: [...book.alphabet],
      completedNotes: book.completedNotes.length,
      curriculum: [...currentNotes()],
      guideStyle: "cursive",
    }),
  };
})();
