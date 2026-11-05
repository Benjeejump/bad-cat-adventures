/* Deliberate parent gestures; ordinary play has no extra confirmation screens. */
"use strict";
(() => {
  const panel = document.createElement("dialog");
  panel.id = "parent-controls";
  panel.innerHTML = `<h2>Parent controls</h2><p>Hold the puppy logo for 5 seconds to leave a task. Five short taps open these controls.</p><button id="parent-zero">Reset treats to zero</button><button id="parent-reset">Reset the whole game…</button><section id="parent-confirm" hidden><p>Erase this device’s treats, inventions, upgrades, collected words, notes and puppy houses? This cannot be undone.</p><button id="parent-erase">Erase saved game and restart</button><button id="parent-keep">Keep saved game</button></section><p id="parent-status" role="status"></p><button id="parent-close">Back to game</button>`;
  document.body.append(panel);
  let taps = 0,
    lastTap = 0;
  function exitTask() {
    if (window.badCatSpelling.isOpen()) window.badCatSpelling.parentExit();
    window.badCatTargeting.abortRaid();
    window.badCatAdventure.parentExit();
    document.querySelectorAll("dialog[open]").forEach((d) => d.close());
    window.badCatCharacters.clearPlans();
    window.badCatAdventure.deferSpelling();
  }
  function badge(host) {
    if (host.querySelector(":scope > .parent-logo")) return;
    const b = document.createElement("button");
    b.className = "parent-logo";
    b.setAttribute("aria-label", "Parent puppy logo");
    b.innerHTML = '<img src="assets/dylan.png" alt="" draggable="false">';
    host.append(b);
    let timer,
      started = 0,
      held = false,
      pointer = null;
    function cancel() {
      clearTimeout(timer);
      b.classList.remove("parent-holding");
      started = 0;
      pointer = null;
    }
    function begin() {
      held = false;
      started = performance.now();
      b.classList.add("parent-holding");
      timer = setTimeout(() => {
        held = true;
        taps = 0;
        cancel();
        exitTask();
      }, 5000);
    }
    function end() {
      const short = started && performance.now() - started < 550;
      cancel();
      if (held || !short) {
        taps = 0;
        return;
      }
      const now = performance.now();
      taps = now - lastTap < 1000 ? taps + 1 : 1;
      lastTap = now;
      if (taps === 5) {
        taps = 0;
        document.querySelector("#parent-confirm").hidden = true;
        panel.showModal();
      }
    }
    b.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      pointer = e.pointerId;
      b.setPointerCapture(e.pointerId);
      begin();
    });
    b.addEventListener("pointerup", end);
    b.addEventListener("pointercancel", () => {
      cancel();
      taps = 0;
    });
    b.addEventListener("lostpointercapture", () => {
      if (pointer !== null) cancel();
    });
    b.addEventListener("contextmenu", (e) => e.preventDefault());
    b.addEventListener("keydown", (e) => {
      if ([" ", "Enter"].includes(e.key) && !e.repeat) {
        e.preventDefault();
        begin();
      }
    });
    b.addEventListener("keyup", (e) => {
      if ([" ", "Enter"].includes(e.key)) {
        e.preventDefault();
        end();
      }
    });
    b.addEventListener("blur", () => {
      cancel();
    });
  }
  badge(document.body);
  document.querySelectorAll("dialog").forEach(badge);
  new MutationObserver(() =>
    document.querySelectorAll("dialog").forEach(badge),
  ).observe(document.body, { childList: true, subtree: true });
  document.querySelector("#parent-close").onclick = () => panel.close();
  document.querySelector("#parent-zero").onclick = () => {
    window.badCatCampaign.spendTreats(
      window.badCatCampaign.snapshot().supplies,
    );
    document.querySelector("#parent-status").textContent =
      "Treats reset to zero.";
  };
  document.querySelector("#parent-reset").onclick = () => {
    document.querySelector("#parent-confirm").hidden = false;
  };
  document.querySelector("#parent-keep").onclick = () => {
    document.querySelector("#parent-confirm").hidden = true;
  };
  document.querySelector("#parent-erase").onclick = () => {
    const keys = [
      "bad-cat-progress-v1",
      "bad-cat-campaign-v1",
      "bad-cat-inventory-v1",
      "bad-cat-arsenal-v1",
      "bad-cat-puppy-house-v1",
      "bad-cat-wordbook-v1",
      "bad-cat-pencil-v1",
      "bad-cat-enemy-fields-v1",
      "metro-pipeworks-v1",
    ];
    try {
      keys.forEach((key) => localStorage.removeItem(key));
      location.reload();
    } catch {
      document.querySelector("#parent-status").textContent =
        "Could not reset saved data. Please allow device storage and try again.";
    }
  };
  window.badCatParents = { isOpen: () => panel.open };
})();
