/* Original Metro puzzle: generated pipe routes, illustrated workshop, no external game assets. */
"use strict";
(() => {
  const directions = [
    [-1, 0, 1, 4],
    [0, 1, 2, 8],
    [1, 0, 4, 1],
    [0, -1, 8, 2],
  ];
  const rotate = (m) => ((m << 1) & 15) | (m >> 3);
  const shuffle = (a) =>
    a
      .map((v) => [Math.random(), v])
      .sort((a, b) => a[0] - b[0])
      .map((x) => x[1]);
  let dialog,
    board,
    hooks,
    round,
    frame = 0,
    last = 0,
    record = { wins: 0, level: 1 };
  try {
    const v = JSON.parse(localStorage.getItem("metro-pipeworks-v1"));
    if (
      v &&
      Number.isSafeInteger(v.wins) &&
      v.wins >= 0 &&
      Number.isSafeInteger(v.level) &&
      v.level >= 1
    )
      record = { wins: Math.min(v.wins, 99999), level: Math.min(v.level, 12) };
  } catch {}
  const $ = (s) => dialog.querySelector(s);
  function save() {
    try {
      localStorage.setItem("metro-pipeworks-v1", JSON.stringify(record));
    } catch {}
  }
  function generate(rows, cols) {
    let route = null,
      budget = 15000;
    const first = Math.floor(Math.random() * rows) * cols;
    const seen = new Set([first]),
      path = [first];
    function visit(i) {
      if (--budget <= 0) return false;
      if (path.length === rows * cols) {
        if (i % cols === cols - 1) {
          route = [...path];
          return true;
        }
        return false;
      }
      for (const [dr, dc] of shuffle(directions)) {
        const r = Math.floor(i / cols) + dr,
          c = (i % cols) + dc,
          n = r * cols + c;
        if (r < 0 || c < 0 || r >= rows || c >= cols || seen.has(n)) continue;
        seen.add(n);
        path.push(n);
        if (visit(n)) return true;
        path.pop();
        seen.delete(n);
      }
      return false;
    }
    visit(first);
    if (!route) {
      route = [];
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          route.push(r * cols + (r % 2 ? cols - 1 - c : c));
    }
    const solution = Array(rows * cols).fill(0);
    solution[route[0]] |= 8;
    solution[route.at(-1)] |= 2;
    for (let p = 1; p < route.length; p++) {
      const a = route[p - 1],
        b = route[p],
        diff = b - a;
      const out = diff === 1 ? 2 : diff === -1 ? 8 : diff === cols ? 4 : 1;
      solution[a] |= out;
      solution[b] |= rotate(rotate(out));
    }
    const tiles = solution.map((mask) => {
      for (let t = Math.floor(Math.random() * 4); t; t--) mask = rotate(mask);
      return mask;
    });
    if (tiles.every((m, i) => m === solution[i]))
      tiles[route[0]] = rotate(tiles[route[0]]);
    return { solution, tiles, start: route[0], end: route.at(-1) };
  }
  let selectedPiece = 10;
  function placementPuzzle(rows, cols, level) {
    const mid = Math.floor(rows / 2),
      detour = Math.random() < 0.5 ? 0 : rows - 1,
      path = [mid * cols, mid * cols + 1];
    let r = mid;
    while (r !== detour) {
      r += detour > r ? 1 : -1;
      path.push(r * cols + 1);
    }
    for (let c = 2; c < cols - 1; c++) path.push(detour * cols + c);
    while (r !== mid) {
      r += mid > r ? 1 : -1;
      path.push(r * cols + cols - 2);
    }
    path.push(mid * cols + cols - 1);
    const solution = Array(rows * cols).fill(0);
    solution[path[0]] = 8;
    solution[path.at(-1)] = 2;
    for (let i = 1; i < path.length; i++) {
      const diff = path[i] - path[i - 1],
        out = diff === 1 ? 2 : diff === -1 ? 8 : diff === cols ? 4 : 1;
      solution[path[i - 1]] |= out;
      solution[path[i]] |= rotate(rotate(out));
    }
    const centre = mid * cols + Math.floor(cols / 2),
      obstacles = [
        centre,
        ...shuffle(
          [...solution.keys()].filter((i) => !path.includes(i) && i !== centre),
        ).slice(
          0,
          Math.min(2 + Math.floor(level / 2), rows * cols - path.length - 1),
        ),
      ];
    const tiles = Array(rows * cols).fill(0),
      start = path[0],
      end = path.at(-1);
    tiles[start] = solution[start];
    tiles[end] = solution[end];
    return {
      solution,
      tiles,
      start,
      end,
      obstacles,
      fixed: [start, end],
      required: path.length,
    };
  }
  function svg(mask) {
    let d = "";
    for (const [, , bit] of directions)
      if (mask & bit)
        d += `M50 50L${bit === 2 ? 100 : bit === 8 ? 0 : 50} ${bit === 1 ? 0 : bit === 4 ? 100 : 50}`;
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><path class="pipe-shadow" d="${d}"/><path class="pipe-metal" d="${d}"/><path class="pipe-bore" d="${d}"/><path class="pipe-water" d="${d}"/><circle class="pipe-joint" cx="50" cy="50" r="12"/><circle class="pipe-bolt" cx="14" cy="14" r="3"/><circle class="pipe-bolt" cx="86" cy="86" r="3"/></svg>`;
  }
  function connections() {
    const { tiles, start, end, cols, rows } = round,
      wet = new Set(),
      queue = [];
    if (tiles[start] & 8) {
      wet.add(start);
      queue.push(start);
    }
    let leaks = 0;
    while (queue.length) {
      const i = queue.shift(),
        r = Math.floor(i / cols),
        c = i % cols;
      for (const [dr, dc, bit, opposite] of directions) {
        if (!(tiles[i] & bit)) continue;
        if ((i === start && bit === 8) || (i === end && bit === 2)) continue;
        const nr = r + dr,
          nc = c + dc,
          n = nr * cols + nc;
        if (
          nr < 0 ||
          nc < 0 ||
          nr >= rows ||
          nc >= cols ||
          !(tiles[n] & opposite)
        ) {
          leaks++;
          continue;
        }
        if (!wet.has(n)) {
          wet.add(n);
          queue.push(n);
        }
      }
    }
    return {
      wet,
      leaks,
      complete:
        (round.placement ? wet.has(end) : wet.size === tiles.length) &&
        !leaks &&
        !!(tiles[end] & 2),
    };
  }
  function paint() {
    const flow = connections();
    board.querySelectorAll("button").forEach((b, i) => {
      const blocked = round.obstacles.includes(i);
      b.innerHTML = blocked
        ? '<span class="pipe-obstacle-art">🪨</span>'
        : round.tiles[i]
          ? svg(round.tiles[i])
          : '<span class="pipe-empty-socket">＋</span>';
      b.classList.toggle("pipe-obstacle", blocked);
      b.classList.toggle("pipe-fixed", round.fixed.includes(i));
      b.classList.toggle(
        "pipe-wet",
        [...flow.wet].slice(0, Math.floor(round.flowCount)).includes(i) &&
          round.started,
      );
      b.classList.toggle("pipe-start", i === round.start);
      b.classList.toggle("pipe-end", i === round.end);
      b.disabled =
        round.done ||
        round.paused ||
        round.obstacles.includes(i) ||
        round.fixed.includes(i);
      b.setAttribute(
        "aria-label",
        `Pipe row ${Math.floor(i / round.cols) + 1}, column ${(i % round.cols) + 1}. ${round.tiles[i] === 5 ? "Vertical" : round.tiles[i] === 10 ? "Horizontal" : "Corner"}. Turn clockwise.`,
      );
    });
    $("#pipe-connected").textContent = round.placement
      ? `${flow.wet.size} pipes flowing · reach OUT`
      : `${flow.wet.size} / ${round.tiles.length} pipes connected`;
    $("#pipe-turns").textContent = `${round.turns} turns`;
    if (
      round.started &&
      !round.done &&
      flow.complete &&
      round.flowCount >= (round.placement ? flow.wet.size : round.tiles.length)
    )
      finish();
  }
  function turn(i) {
    if (!round || round.done || round.paused) return;
    if (round.obstacles.includes(i) || round.fixed.includes(i)) return;
    if (round.placement) {
      const sameShape =
        round.tiles[i] &&
        (round.tiles[i] === 5 || round.tiles[i] === 10) ===
          (selectedPiece === 5 || selectedPiece === 10);
      round.tiles[i] =
        selectedPiece === 0
          ? 0
          : sameShape
            ? rotate(round.tiles[i])
            : selectedPiece;
    } else round.tiles[i] = rotate(round.tiles[i]);
    round.flowCount = 0;
    round.turns++;
    hooks.sound("sonar");
    paint();
  }
  function start(level = record.level) {
    cancelAnimationFrame(frame);
    last = 0;
    const rows = level >= 5 ? 5 : 3,
      cols = level >= 3 ? 5 : 4;
    round = {
      ...(level >= 3
        ? placementPuzzle(rows, cols, level)
        : {
            ...generate(rows, cols),
            obstacles: [],
            fixed: [],
            required: rows * cols,
          }),
      placement: level >= 3,
      rows,
      cols,
      level,
      turns: 0,
      started: false,
      done: false,
      paused: false,
      assisted: false,
      practice: $("#pipe-practice").checked,
      flowCount: 0,
    };
    $("#pipe-piece-tray").hidden = !round.placement;
    board.style.setProperty("--pipe-cols", cols);
    board.style.setProperty("--pipe-rows", rows);
    board.replaceChildren();
    for (let i = 0; i < rows * cols; i++) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "pipe-tile";
      b.addEventListener("click", () => turn(i));
      board.append(b);
    }
    $("#pipe-level").textContent =
      `Metro’s prank ${level} · ${record.wins} repairs completed`;
    $("#pipe-status").textContent = round.placement
      ? "Metro blocked the crawlspace! Choose straight or bent pipes from the tray. Place them around the rocks to reach OUT. Tap a matching piece to turn it. No timer!"
      : "Metro scrambled every pipe! Help Dylan connect ALL pipes, from the blue inlet to the green outlet. Then start the flow.";
    $("#pipe-result").hidden = true;
    $("#pipe-start-water").hidden = false;
    $("#pipe-pause").hidden = true;
    $("#pipe-hint").hidden = false;
    $("#pipe-practice").disabled = false;
    $("#pipe-route-label").textContent =
      `IN → row ${Math.floor(round.start / cols) + 1} · OUT → row ${Math.floor(round.end / cols) + 1}`;
    paint();
    updateClock();
    frame = requestAnimationFrame(tick);
  }
  function updateClock() {
    $("#pipe-timer").textContent = round.done ? "Connected!" : "No rush";
    $("#pipe-tank").value = round.done
      ? 100
      : (round.flowCount / round.required) * 100;
    $("#pipe-tank").setAttribute(
      "aria-label",
      `${Math.min(round.tiles.length, Math.floor(round.flowCount))} pipes filled. No time limit.`,
    );
  }
  function water() {
    if (!round || round.done) return;
    round.practice = $("#pipe-practice").checked;
    round.started = true;

    $("#pipe-start-water").hidden = true;
    $("#pipe-pause").hidden = false;
    $("#pipe-pause").textContent = "Pause water";
    $("#pipe-status").textContent =
      "Follow the flow! Take your time connecting every pipe. Luna can help with a hint.";
    paint();
  }
  function finish() {
    if (round.done) return;
    round.done = true;
    round.won = true;
    cancelAnimationFrame(frame);
    board.querySelectorAll("button").forEach((b) => (b.disabled = true));
    $("#pipe-pause").hidden = true;
    $("#pipe-hint").hidden = true;
    $("#pipe-start-water").hidden = true;
    $("#pipe-result").hidden = false;
    record.wins++;
    record.level = Math.min(12, Math.max(record.level, round.level + 1));
    save();
    const treats = window.badCatCampaign.awardTreats(2);
    const fluid = $("#pipe-fluid").selectedOptions[0].textContent;
    $("#pipe-status").textContent =
      `WHOOSH! ${fluid} reached the end through every pipe. Dylan outsmarted Metro’s pipe prank! +${treats} puppy treat${treats === 1 ? "" : "s"}.`;
    hooks.sound("victory");
    dialog.classList.add("pipes-win");
    $("#pipe-next").textContent = "Next pipe prank";
    updateClock();
    $("#pipe-next").focus();
  }
  function hint() {
    if (!round || round.done || round.paused) return;
    const wrong = round.tiles.findIndex((m, i) => m !== round.solution[i]);
    if (wrong < 0) return;
    round.tiles[wrong] = round.solution[wrong];
    round.flowCount = 0;
    round.assisted = true;
    $("#pipe-status").textContent =
      "Luna: “One pipe fixed! Follow the openings from the blue inlet. You can do it, Dylan!”";
    paint();
    const b = board.children[wrong];
    b.classList.add("pipe-hint");
    setTimeout(() => b.classList.remove("pipe-hint"), 1200);
  }
  function tick(now) {
    if (!dialog.open) return;
    const dt = last ? Math.min((now - last) / 1000, 0.5) : 0;
    last = now;
    if (round.started && !round.done && !round.paused && !document.hidden) {
      const before = Math.floor(round.flowCount),
        flow = connections();
      round.flowCount = Math.min(
        flow.wet.size,
        round.flowCount + dt / (round.practice ? 0.55 : 0.28),
      );
      updateClock();
      if (Math.floor(round.flowCount) !== before) paint();
    }
    if (!round.done) frame = requestAnimationFrame(tick);
  }
  function open() {
    if (
      window.badCatAdventure.isOpen() ||
      document.querySelector("#arsenal-dialog[open]")
    )
      return false;
    dialog.classList.remove("pipes-win");
    dialog.showModal();
    start();
    return true;
  }
  function init(h) {
    hooks = h;
    dialog = document.createElement("dialog");
    dialog.id = "pipeworks-dialog";
    dialog.setAttribute("aria-labelledby", "pipe-title");
    dialog.innerHTML =
      '<header class="pipe-header"><img src="assets/metro.png" alt="Metro"><div><p>DYLAN’S MISSION · NO TIME LIMIT</p><h2 id="pipe-title">Pipeworks!</h2><small id="pipe-level"></small></div><button id="pipe-close" aria-label="Close Pipeworks">×</button></header><section class="pipe-content"><p id="pipe-status" role="status"></p><div class="pipe-gauges"><b id="pipe-timer"></b><progress id="pipe-tank" max="100"></progress><span id="pipe-connected"></span><span id="pipe-turns"></span></div><p id="pipe-route-label"></p><div id="pipe-piece-tray" hidden><b>Pick a piece</b><button data-pipe-piece="10">━ Straight</button><button data-pipe-piece="3">┗ Bend</button><button id="pipe-piece-turn">↻ Turn chosen piece</button><button data-pipe-piece="0">× Remove</button><span id="pipe-piece-preview"></span></div><div id="pipe-board" aria-label="Rotate or place pipes to carry water around obstacles"></div><div class="pipe-controls"><label><input type="checkbox" id="pipe-practice" checked> Slow flow · watch it travel</label><label>Send <select id="pipe-fluid"><option value="water">Water</option><option value="slime">Green slime</option><option value="honey">Golden goo</option><option value="sparkles">Purple sparkle juice</option></select></label><button id="pipe-start-water">Start the flow</button><button id="pipe-pause" hidden>Pause water</button><button id="pipe-hint">Luna’s hint</button><button id="pipe-small">Smaller puzzle</button></div><div id="pipe-result" hidden><button id="pipe-next"></button><button id="pipe-replay">Replay this workshop</button></div></section>';
    document.body.append(dialog);
    board = $("#pipe-board");
    const preview = () => {
      $("#pipe-piece-preview").innerHTML = selectedPiece
        ? svg(selectedPiece)
        : "×";
      dialog
        .querySelectorAll("[data-pipe-piece]")
        .forEach((b) =>
          b.setAttribute(
            "aria-pressed",
            Number(b.dataset.pipePiece) === 0
              ? selectedPiece === 0
              : Number(b.dataset.pipePiece) === 10
                ? [5, 10].includes(selectedPiece)
                : ![0, 5, 10].includes(selectedPiece),
          ),
        );
    };
    dialog.querySelectorAll("[data-pipe-piece]").forEach(
      (b) =>
        (b.onclick = () => {
          selectedPiece = Number(b.dataset.pipePiece);
          preview();
        }),
    );
    $("#pipe-piece-turn").onclick = () => {
      selectedPiece = rotate(selectedPiece);
      preview();
    };
    preview();
    $("#pipe-close").onclick = () => dialog.close();
    dialog.addEventListener("close", () => {
      cancelAnimationFrame(frame);
      hooks.closed();
    });
    $("#pipe-start-water").onclick = water;
    $("#pipe-hint").onclick = hint;
    $("#pipe-fluid").onchange = () =>
      (board.dataset.fluid = $("#pipe-fluid").value);
    $("#pipe-practice").onchange = () => {
      round.practice = $("#pipe-practice").checked;
      updateClock();
    };
    $("#pipe-small").onclick = () => {
      dialog.classList.remove("pipes-win");
      start(1);
    };
    $("#pipe-pause").onclick = () => {
      round.paused = !round.paused;
      $("#pipe-pause").textContent = round.paused
        ? "Resume water"
        : "Pause water";
      paint();
    };
    $("#pipe-next").onclick = () => {
      dialog.classList.remove("pipes-win");
      start(round.won ? Math.min(12, round.level + 1) : round.level);
    };
    $("#pipe-replay").onclick = () => {
      dialog.classList.remove("pipes-win");
      start(round.level);
    };
    document
      .querySelectorAll("[data-pipeworks]")
      .forEach((b) => b.addEventListener("click", open));
  }
  window.badCatPipes = {
    init,
    open,
    isOpen: () => !!dialog?.open,
    diagnostics: () =>
      round
        ? {
            rows: round.rows,
            placement: round.placement,
            obstacles: [...round.obstacles],
            fixed: [...round.fixed],
            cols: round.cols,
            tiles: [...round.tiles],
            start: round.start,
            end: round.end,
            flowCount: round.flowCount,
            hasTimeLimit: false,
            started: round.started,
            paused: round.paused,
            done: round.done,
            won: !!round.won,
            practice: round.practice,
            turns: round.turns,
            connected: connections().wet.size,
            record: { ...record },
          }
        : null,
  };
})();
