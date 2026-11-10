/* Full-screen motion scenes. The puppy stays central while clouds rise behind it. */
"use strict";
(() => {
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  function puppy() {
    return `<div class="story-world puppy cinematic-world"><div class="falling-sky"></div><div class="rising-clouds" aria-hidden="true">${Array.from({ length: 12 }, (_, i) => `<i class="rising-cloud" style="--cloud-x:${((i * 29) % 108) - 8}%;--cloud-size:${110 + (i % 4) * 70}px;--cloud-duration:${6 + (i % 4) * 2}s;--cloud-delay:-${i * 1.7}s"></i>`).join("")}</div><div class="fall-streaks" aria-hidden="true"></div><div class="scene-character"><img src="assets/giant-puppy.png" alt="Giant Puppy falling through moving clouds"></div><div class="landing-floor"></div></div>`;
  }
  function tornado(kind) {
    const cats = Array.from({ length: 24 }, (_, i) => {
      const row = i % 6,
        rx = 320 - row * 43,
        ry = 42 - row * 4,
        cy = 120 + row * 68,
        size = 70 - row * 5;
      const path = `M ${500 - rx} ${cy} a ${rx} ${ry} 0 1 0 ${rx * 2} 0 a ${rx} ${ry} 0 1 0 -${rx * 2} 0`;
      return `<g class="cyclone-cat" style="filter:hue-rotate(${(i % 4) * 15}deg)"><image href="assets/kitten.png" x="${reduced() ? 500 - rx - size / 2 : -size / 2}" y="${reduced() ? cy - size / 2 : -size / 2}" width="${size}" height="${size}">${reduced() ? "" : `<animateMotion dur="${2.7 + row * 0.4}s" begin="-${i * 0.31}s" repeatCount="indefinite" path="${path}" rotate="auto"/>`}</image></g>`;
    }).join("");
    return `<div class="story-world tornado cinematic-world ${kind === "kittens" ? "kitten-arrival" : ""}"><div class="tornado-sky"></div><svg class="kitten-cyclone" viewBox="0 0 1000 700" role="img" aria-label="A tornado of kittens whirling across the sky"><defs><linearGradient id="wind-mist" x2="0" y2="1"><stop stop-color="#d7e6d3" stop-opacity=".45"/><stop offset="1" stop-color="#daf1e0" stop-opacity=".05"/></linearGradient></defs><path d="M160 100Q440 400 450 560H550Q560 400 840 100Z" fill="url(#wind-mist)"/>${Array.from({ length: 7 }, (_, i) => `<ellipse cx="500" cy="${110 + i * 68}" rx="${340 - i * 44}" ry="${40 - i * 3}" fill="none" stroke="#d8f8ea" stroke-opacity=".2" stroke-width="5" stroke-dasharray="20 24"/>`).join("")}${cats}</svg><div class="tornado-rescue"><img src="assets/giant-puppy.png" alt="Puppy rescue"></div></div>`;
  }
  function prop(effect) {
    const svg = (content) =>
      `<svg viewBox="0 0 500 180" aria-hidden="true">${content}</svg>`;
    const cookie = (x, y, r) =>
      `<g><circle cx="${x}" cy="${y}" r="${r}" fill="#d9a164" stroke="#815d3f" stroke-width="3"/>${[-1, 0, 1].map((n, i) => `<circle cx="${x + n * r * 0.45}" cy="${y + ((i % 2) - 0.5) * r * 0.6}" r="${r * 0.1}" fill="#81563f"/>`).join("")}</g>`;
    const props = {
      bubbles: svg(
        [80, 160, 250, 340, 420]
          .map(
            (x, i) =>
              `<ellipse cx="${x}" cy="${110 - (i % 2) * 20}" rx="72" ry="48" fill="#a8eff3aa" stroke="#e9ffff" stroke-width="5"/><ellipse cx="${x - 23}" cy="${90 - (i % 2) * 20}" rx="14" ry="7" fill="#fff9"/>`,
          )
          .join(""),
      ),
      badcat:
        '<img src="assets/bad-cat.png" alt="Bad Cat’s springy landing bed">',
      treats: svg(
        Array.from({ length: 18 }, (_, i) =>
          cookie(45 + (i % 7) * 65, 140 - Math.floor(i / 7) * 36, 26),
        ).join(""),
      ),
      parachute: svg(
        '<path d="M30 80Q250-100 470 80L360 65 250 90 140 65Z" fill="#df9b88" stroke="#695d65" stroke-width="5"/><path d="M30 80 220 175m250-95L280 175M140 65l95 110m125-110-95 110" stroke="#d6e8dc" stroke-width="4"/>',
      ),
      hammock: svg(
        '<path d="M20 30Q250 220 480 30Q250 300 20 30Z" fill="#e3c57e" stroke="#856e4b" stroke-width="6"/><path d="m80 74 320 20M150 108l220 15M110 50l50 94m80-75 10 96m70-96-8 94m85-114-45 82" fill="none" stroke="#b18d4d" stroke-width="5"/>',
      ),
      trampoline: svg(
        '<path d="M90 120 70 175m340-55 20 55" stroke="#7d8c9a" stroke-width="14"/><ellipse cx="250" cy="100" rx="200" ry="45" fill="#599aaa" stroke="#c8e3c7" stroke-width="14"/>',
      ),
      vacuum:
        '<img class="landing-vacuum" src="assets/mega-vacuum.png" alt="Metro’s cartoon mega vacuum">',
      blanket: svg(
        '<path d="M20 50 120 100 250 125 380 100 480 50 450 145H50Z" fill="#c595b6" stroke="#745f7e" stroke-width="5"/><path d="M120 100v45m130-20v20m130-45v45m-330-15h400" stroke="#f0d2ba" stroke-width="7"/>',
      ),
      cloud: svg(
        '<path d="M70 140Q-10 70 100 60Q140-30 230 40Q310-35 370 45Q500 30 450 140Z" fill="#f8fff5" stroke="#badfdc" stroke-width="5"/>',
      ),
      slide: svg(
        ["#dc878b", "#e8b87e", "#f3dc91", "#aad0a0", "#8fcbd4", "#a39ac6"]
          .map(
            (c, i) =>
              `<path d="M30 ${155 - i * 16}Q250 ${-65 - i * 16} 470 ${155 - i * 16}" stroke="${c}" stroke-width="18" fill="none"/>`,
          )
          .join(""),
      ),
    };
    return props[effect] || props.cloud;
  }
  function kittenNet(count = 20, won = true) {
    const kittens = Array.from(
      { length: count },
      (_, i) =>
        `<image href="assets/kitten.png" x="${270 + (i % 5) * 70}" y="${170 + Math.floor(i / 5) * 64}" width="75" height="75" style="filter:hue-rotate(${(i % 4) * 18}deg)"/>`,
    ).join("");
    return `<div class="story-world kitten-net cinematic-world"><div class="net-result-sky"></div><svg viewBox="0 0 900 600" class="kitten-net-art" role="img" aria-label="${count} kittens safely caught in a big net"><defs><pattern id="net-mesh" width="34" height="34" patternUnits="userSpaceOnUse"><path d="M0 0 34 34M34 0 0 34" stroke="#f5dba8" stroke-width="2"/></pattern><clipPath id="net-bag-clip"><path d="M245 150Q450 190 655 150L635 410Q610 505 450 515 290 505 265 410Z"/></clipPath></defs><path d="M250 150 120 530" stroke="#aa7548" stroke-width="25" stroke-linecap="round"/><path d="M245 150Q450 190 655 150L635 410Q610 505 450 515 290 505 265 410Z" fill="#75b6c966" stroke="#e5c78e" stroke-width="9"/><g clip-path="url(#net-bag-clip)">${kittens}<path d="M245 150H655V520H245Z" fill="url(#net-mesh)"/></g><ellipse cx="450" cy="150" rx="205" ry="43" fill="none" stroke="#f5dfad" stroke-width="13"/><rect x="350" y="520" width="200" height="55" rx="18" fill="#173f52" stroke="#d9c18c" stroke-width="4"/><text x="450" y="557" fill="#ffe4a6" font-family="sans-serif" font-size="30" font-weight="900" text-anchor="middle">${count} / 20 CAUGHT</text></svg></div>`;
  }
  window.badCatCinematics = {
    art: (which) =>
      which === "puppy"
        ? puppy()
        : ["tornado", "kittens"].includes(which)
          ? tornado(which)
          : null,
    prop,
    kittenNet,
  };
})();
