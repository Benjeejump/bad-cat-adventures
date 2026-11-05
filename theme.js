/* A real saved night palette, including the map, not a dark overlay on the screen. */
"use strict";
(() => {
  const key = "bad-cat-display-theme-v1",
    media = matchMedia("(prefers-color-scheme: dark)");
  let mode = "auto";
  try {
    const v = localStorage.getItem(key);
    if (["auto", "day", "night"].includes(v)) mode = v;
  } catch {}
  const night = () => mode === "night" || (mode === "auto" && media.matches);
  function apply() {
    document.documentElement.dataset.theme = night() ? "night" : "day";
    document.documentElement.dataset.themeChoice = mode;
    document.documentElement.style.colorScheme = night() ? "dark" : "light";
    const button = document.querySelector("#theme-toggle");
    if (button) {
      button.textContent =
        mode === "auto" ? "◐ AUTO" : night() ? "☾ NIGHT" : "☀ DAY";
      button.setAttribute(
        "aria-label",
        `Display: ${mode}. Switch day, night or automatic mode.`,
      );
    }
    const choice = document.querySelector("#theme-choice");
    if (choice) choice.value = mode;
    window.dispatchEvent(
      new CustomEvent("bad-cat-theme", { detail: { night: night(), mode } }),
    );
  }
  function cycle() {
    mode = mode === "auto" ? "night" : mode === "night" ? "day" : "auto";
    try {
      localStorage.setItem(key, mode);
    } catch {}
    apply();
  }
  apply();
  document.addEventListener("DOMContentLoaded", () => {
    const button = document.querySelector("#theme-toggle");
    button?.addEventListener("click", cycle);
    document
      .querySelector("#theme-choice")
      ?.addEventListener("change", (e) =>
        window.badCatTheme.set(e.target.value),
      );
    apply();
  });
  media.addEventListener("change", () => {
    if (mode === "auto") apply();
  });
  window.badCatTheme = {
    mode: () => mode,
    isNight: night,
    set: (value) => {
      if (["auto", "day", "night"].includes(value)) {
        mode = value;
        try {
          localStorage.setItem(key, mode);
        } catch {}
        apply();
      }
    },
  };
})();
