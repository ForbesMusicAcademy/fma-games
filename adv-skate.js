/* Level 2: Skate City, a sunny city street. Skateboarding between quests: ollies, grinds, a handrail, manuals, kickflips,
   a 360 off the kicker and a drop-in down the half-pipe. Two choice checkpoints (pick one of three, then one of two). */
LEVELS.push((() => {
  const W = 3800, G = 620;
  const RAIL = x => 492 + (x - 1520) * 0.5;          // the stair handrail: (1520, 492) down to (1720, 592)
  const arc = (cx, cy, r, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => { const a = (a0 + (a1 - a0) * i / n) * R; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });

  /* ---- scenery ---- */
  const defs = `<linearGradient id="scSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fbcff"/><stop offset=".7" stop-color="#bfe7ff"/><stop offset="1" stop-color="#eaf7ff"/></linearGradient>
    <radialGradient id="scSun"><stop offset="0" stop-color="#fff8d6"/><stop offset=".5" stop-color="#ffe9a0" stop-opacity=".7"/><stop offset="1" stop-color="#ffe9a0" stop-opacity="0"/></radialGradient>`;
  function sky(){
    let s = `<rect x="-200" y="-1400" width="${W + 400}" height="2200" fill="url(#scSky)"/>`;
    [[300, 120, 1], [900, 70, .8], [1600, 140, 1.1], [2300, 90, .9], [3000, 130, 1], [3600, 60, .8]].forEach(([x, y, k], i) => {
      s += `<g opacity=".95"><g transform="translate(${x} ${y}) scale(${k})"><ellipse cx="0" cy="0" rx="60" ry="22" fill="#fff"/><circle cx="-24" cy="-10" r="22" fill="#fff"/><circle cx="12" cy="-18" r="28" fill="#fff"/><circle cx="38" cy="-4" r="18" fill="#fff"/></g><animateTransform attributeName="transform" type="translate" values="0 0;60 0;0 0" dur="${30 + i * 7}s" repeatCount="indefinite"/></g>`; });
    return s;
  }
  const sun = () => `<circle cx="980" cy="150" r="150" fill="url(#scSun)"/><circle cx="980" cy="150" r="52" fill="#fff6c8"/>`;
  function far(){
    seed = 41; let s = "", x = -40;
    while(x < W){ const w = 60 + rnd() * 90, h = 160 + rnd() * 240;
      s += `<rect x="${f1(x)}" y="${f1(560 - h)}" width="${f1(w)}" height="${f1(h + 60)}" fill="#a8c6de"/>`;
      for(let r = 0; r < h / 26 - 1; r++) for(let c = 0; c < w / 18 - 1; c++) if(rnd() < .5) s += `<rect x="${f1(x + 8 + c * 18)}" y="${f1(572 - h + r * 26)}" width="8" height="12" fill="#d6e8f5"/>`;
      if(rnd() < .2) s += `<path d="M${f1(x + w / 2)} ${f1(560 - h)} V${f1(520 - h)}" stroke="#a8c6de" stroke-width="4"/><circle cx="${f1(x + w / 2)}" cy="${f1(518 - h)}" r="4" fill="#ff6b6b"><animate attributeName="opacity" values="1;.2;1" dur="1.4s" repeatCount="indefinite"/></circle>`;
      x += w + 8 + rnd() * 30; }
    return s;
  }
  function mid(){
    seed = 77; let s = "", x = -60; const cols = ["#f2c28c", "#e98b6d", "#7fc8b8", "#f4e3b5", "#c9a6e0", "#9fd18b"];
    const signs = ["CAFÉ", "RECORDS", "PIZZA", "BOOKS", "DONUTS", "VINTAGE", "GUITARS", "BAKERY"];
    let k = 0;
    while(x < W){ const w = 170 + rnd() * 130, h = 200 + rnd() * 120, c = cols[Math.floor(rnd() * cols.length)], top = 600 - h;
      s += `<rect x="${f1(x)}" y="${f1(top)}" width="${f1(w)}" height="${f1(h + 30)}" fill="${c}" stroke="#7a6a64" stroke-width="2" opacity=".9"/><rect x="${f1(x - 4)}" y="${f1(top - 10)}" width="${f1(w + 8)}" height="12" fill="${shade(c, .8)}"/>`;
      for(let r = 0; r < 2; r++) for(let i = 0; i < Math.floor(w / 50); i++) s += `<rect x="${f1(x + 16 + i * 50)}" y="${f1(top + 22 + r * 56)}" width="28" height="36" fill="#cfe9f5" stroke="#7a6a64" stroke-width="2"/>`;
      const aw = `M${f1(x + 10)} ${f1(top + h - 92)} H${f1(x + w - 10)} L${f1(x + w)} ${f1(top + h - 66)} H${f1(x)}Z`;
      s += `<path d="${aw}" fill="${k % 2 ? "#e8433f" : "#4aa8ff"}" opacity=".9"/><path d="${aw}" fill="url(#scStripe)" opacity=".5"/>`;
      s += `<rect x="${f1(x + w / 2 - 44)}" y="${f1(top + h - 124)}" width="88" height="24" rx="5" fill="#fff8ec" stroke="#7a6a64" stroke-width="2"/><text x="${f1(x + w / 2)}" y="${f1(top + h - 106)}" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="15" fill="#5a4a44">${signs[k % signs.length]}</text>`;
      if(rnd() < .55){ const tx = x + w + 4; s += `<path d="M${f1(tx)} 600 V520" stroke="#7a5b45" stroke-width="8"/><circle cx="${f1(tx)}" cy="500" r="40" fill="#6dbb5f"/><circle cx="${f1(tx - 26)}" cy="518" r="26" fill="#5aa84f"/><circle cx="${f1(tx + 24)}" cy="514" r="28" fill="#5aa84f"/>`; }
      x += w + 18 + rnd() * 20; k++; }
    return `<defs><pattern id="scStripe" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="10" height="20" fill="#fff"/></pattern></defs>` + s;
  }
  function main(){
    let s = "";
    // footpath and road
    s += `<rect x="-100" y="${G}" width="${W + 200}" height="40" fill="#d6cfc4"/><path d="M-100 ${G} H${W + 100}" stroke="${INK}" stroke-width="4"/>`;
    for(let x = 0; x < W; x += 80) s += `<path d="M${x} ${G + 2} V${G + 38}" stroke="#b5ad9f" stroke-width="2"/>`;
    s += `<rect x="-100" y="${G + 38}" width="${W + 200}" height="10" fill="#a39b8f"/><rect x="-100" y="${G + 48}" width="${W + 200}" height="120" fill="#4a4a52"/>`;
    for(let x = 20; x < W; x += 120) s += `<rect x="${x}" y="${G + 76}" width="56" height="6" rx="2" fill="#f4eee6" opacity=".8"/>`;
    // the skate shop
    s += box(40, 360, 360, 260, "#3fa7a0") + box(30, 344, 380, 22, "#2e7f79") + box(90, 380, 260, 50, "#26211f") + `<text x="220" y="416" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="30" fill="#ffc42b" letter-spacing="2">FMA SKATE CO.</text>`;
    s += box(70, 450, 180, 130, "#cfe9f5") + box(280, 450, 90, 170, "#8c5a3c");
    [100, 140, 180, 220].forEach((x, i) => { s += `<rect x="${x}" y="462" width="14" height="96" rx="7" fill="${["#e8433f", "#ffc42b", "#a070e8", "#4fb86a"][i]}" stroke="${INK}" stroke-width="2.5"/>`; });
    // fire hydrant
    s += `<rect x="458" y="594" width="26" height="26" rx="4" fill="#e8433f" stroke="${INK}" stroke-width="3"/><path d="M455 594 Q471 572 487 594Z" fill="#e8433f" stroke="${INK}" stroke-width="3"/><rect x="450" y="600" width="42" height="9" rx="4" fill="#c9302c" stroke="${INK}" stroke-width="2.5"/>`;
    // the bench (grind its seat)
    s += box(640, 582, 130, 9, "#a8723c") + box(646, 548, 118, 9, "#a8723c") + `<path d="M652 591 V620 M758 591 V620 M652 557 V582 M758 557 V582" stroke="${INK}" stroke-width="5"/>`;
    // bus stop
    s += `<rect x="820" y="470" width="150" height="150" fill="#cfe9f5" opacity=".5" stroke="${INK}" stroke-width="3"/>` + box(812, 456, 166, 16, "#5d6670") + box(832, 486, 56, 80, "#ff6fa3") + `<text x="860" y="520" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="13" fill="#fff">GIG</text><text x="860" y="538" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="13" fill="#fff">SAT!</text>`;
    s += `<path d="M990 620 V430" stroke="#5d6670" stroke-width="6"/><circle cx="990" cy="424" r="16" fill="#ffc42b" stroke="${INK}" stroke-width="3"/><text x="990" y="430" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="14" fill="${INK}">B</text>`;
    // the kicker up to the plaza, and the plaza
    s += `<path d="M900 620 L996 620 L996 594Z" fill="#d9a066" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
    s += box(1010, 520, 510, 100, "#bdb5a8") + `<path d="M1010 520 H1520" stroke="#8d96a0" stroke-width="6"/>`;
    for(let x = 1030; x < 1500; x += 60) s += `<path d="M${x} 532 V610" stroke="#a39b8f" stroke-width="2"/>`;
    [1120, 1400].forEach(x => { s += box(x - 30, 486, 60, 34, "#a8723c") + `<circle cx="${x}" cy="452" r="34" fill="#6dbb5f" stroke="${INK}" stroke-width="3"/><circle cx="${x - 20}" cy="470" r="18" fill="#5aa84f" stroke="${INK}" stroke-width="3"/>`; });
    // the stair set and its handrail
    for(let i = 0; i < 5; i++) s += box(1520 + i * 40, 520 + i * 20, 40, 100 - i * 20, i % 2 ? "#c9c1b4" : "#bdb5a8");
    s += `<path d="M1530 ${RAIL(1530) + 2} V${525} M1620 ${RAIL(1620) + 2} V${570} M1710 ${RAIL(1710) + 2} V${615}" stroke="${INK}" stroke-width="5"/><path d="M1520 ${RAIL(1520)} L1720 ${RAIL(1720)}" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M1520 ${RAIL(1520)} L1720 ${RAIL(1720)}" stroke="#dfe3e8" stroke-width="4" stroke-linecap="round"/>`;
    // the mural wall
    s += box(1740, 400, 280, 220, "#f7f4ee");
    s += `<circle cx="1800" cy="470" r="50" fill="#ffc42b"/><circle cx="1960" cy="560" r="60" fill="#4fd0c0"/><path d="M1750 600 Q1880 480 2010 600" fill="#ff6fa3"/><g transform="translate(1880 520) rotate(-30)"><rect x="-6" y="-90" width="12" height="80" fill="#a8723c" stroke="${INK}" stroke-width="3"/><circle cx="0" cy="12" r="30" fill="#e8433f" stroke="${INK}" stroke-width="3"/><circle cx="0" cy="-16" r="20" fill="#e8433f" stroke="${INK}" stroke-width="3"/><circle cx="0" cy="12" r="30" fill="#e8433f"/><circle cx="0" cy="4" r="7" fill="${INK}"/></g>`;
    s += `<text x="1880" y="450" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="44" fill="#5470f0" stroke="${INK}" stroke-width="3" paint-order="stroke" transform="rotate(-6 1880 450)">ROCK ON!</text>`;
    // the food truck
    s += box(2060, 470, 220, 130, "#ffc42b") + box(2240, 500, 60, 100, "#ffc42b") + box(2248, 510, 44, 34, "#cfe9f5") + box(2090, 492, 120, 54, "#26211f") + `<path d="M2080 492 L2220 492 L2230 470 L2070 470Z" fill="#e8433f" stroke="${INK}" stroke-width="3"/>`;
    s += `<text x="2150" y="526" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="20" fill="#ffc42b">TACOS</text>`;
    [2100, 2250].forEach(x => { s += `<circle cx="${x}" cy="604" r="17" fill="#3a3a3d" stroke="${INK}" stroke-width="3"/><circle cx="${x}" cy="604" r="6" fill="#9aa3ad"/>`; });
    // traffic cones
    [2350, 2380, 2410].forEach(x => { s += `<path d="M${x - 11} 620 L${x} 588 L${x + 11} 620Z" fill="#ff8a1c" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M${x - 6} 606 H${x + 6}" stroke="#fff" stroke-width="4"/>`; });
    // the skate park: kicker, deck, drop-in transition
    s += `<path d="M2600 620 L2690 620 L2690 586Z" fill="#d9a066" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
    const tr = arc(3100, 470, 150, 180, 90, 12);
    s += `<path d="M2790 620 V470 H2950 ${tr.map(p => "L" + f1(p[0]) + " " + f1(p[1])).join(" ")} L3100 620Z" fill="#d9a066" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
    for(let i = 1; i < 6; i++) s += `<path d="M2790 ${470 + i * 25} H2950" stroke="#b07f4a" stroke-width="2"/>`;
    s += `<path d="M2790 470 H2954" stroke="#9aa3ad" stroke-width="7" stroke-linecap="round"/><path d="M2810 470 V440 H2830 M2930 470 V440 H2910" stroke="${INK}" stroke-width="4" fill="none"/>`;
    s += `<text x="2870" y="560" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="26" fill="#fff" stroke="${INK}" stroke-width="3" paint-order="stroke">SK8</text>`;
    // a fun box before the boss
    s += box(3250, 598, 56, 22, "#5470f0");
    // the boss: a garbage truck with a grumpy grille
    s += box(3430, 400, 330, 210, "#4fb86a") + `<path d="M3430 400 L3480 360 L3760 360 L3760 400Z" fill="#3e9a59" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
    s += box(3400, 470, 70, 140, "#3e9a59") + `<path d="M3404 480 H3466 V530 H3404Z" fill="#cfe9f5" stroke="${INK}" stroke-width="3"/><path d="M3408 492 L3428 504 M3462 492 L3442 504" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><circle cx="3424" cy="512" r="5" fill="${INK}"/><circle cx="3446" cy="512" r="5" fill="${INK}"/>`;
    s += `<path d="M3400 556 H3470 M3400 570 H3470 M3400 584 H3470" stroke="${INK}" stroke-width="3"/><path d="M3404 596 L3412 588 L3420 596 L3428 588 L3436 596 L3444 588 L3452 596 L3460 588 L3468 596" fill="none" stroke="#fff" stroke-width="3"/>`;
    s += `<text x="3600" y="500" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="28" fill="#fff" stroke="${INK}" stroke-width="3" paint-order="stroke">GOBBLER</text>`;
    [3450, 3560, 3700].forEach(x => { s += `<circle cx="${x}" cy="604" r="22" fill="#3a3a3d" stroke="${INK}" stroke-width="3"/><circle cx="${x}" cy="604" r="8" fill="#9aa3ad"/>`; });
    s += `<g opacity=".7">${smoke(3770, 380, "#9aa3ad", 3, 100, 4)}</g>`;
    return s;
  }
  function fore(){
    let s = `<path d="M-100 40 Q600 90 1300 40 T2700 40 T4100 40" fill="none" stroke="#2d2a35" stroke-width="3" opacity=".7"/><path d="M-100 70 Q600 120 1300 70 T2700 70 T4100 70" fill="none" stroke="#2d2a35" stroke-width="2" opacity=".6"/>`;
    [200, 1500, 2900, 4300].forEach(x => { s += `<g fill="#2f5a3a" opacity=".9"><circle cx="${x}" cy="-20" r="80"/><circle cx="${x + 70}" cy="10" r="50"/><circle cx="${x - 60}" cy="20" r="45"/></g>`; });
    return s;
  }

  /* ---- quests: three to choose from after the start, then two before the boss ---- */
  const nodes = [
    { id: "s1", x: 220, g: G, hx: 220, hy: 300, icon: "🛹", name: "Kick-Off", url: "tuner.html", lane: "Notes", game: "Tuning Race", spot: "the skate shop", loot: ["skatehelmet"] },
    { id: "a1", x: 880, g: G, hx: 880, hy: 340, icon: "🚌", name: "Bus Stop Bop", url: "quiz.html", lane: "Notes", game: "Note Quiz · level 2 · natural notes", spot: "the bus stop", loot: ["kneepads"], choice: "a" },
    { id: "a2", x: 1250, g: 520, hx: 1250, hy: 250, icon: "🌳", name: "Plaza Ledge", url: "chords.html", lane: "Chords", game: "Chords · G, C and D", spot: "the plaza", loot: ["skateshoes"], choice: "a" },
    { id: "a3", x: 1850, g: G, hx: 1850, hy: 330, icon: "🎨", name: "Mural Jam", url: "songs.html", lane: "Riffs & TAB", game: "Songs · a Beginner riff", spot: "the mural wall", loot: ["graffiti"], choice: "a" },
    { id: "s2", x: 2150, g: G, hx: 2150, hy: 360, icon: "🌮", name: "Food Truck Chords", url: "chords.html", lane: "Chords", game: "Chords · Em, Am, G and C", spot: "the taco truck", loot: [] },
    { id: "b1", x: 2520, g: G, hx: 2520, hy: 360, icon: "🔁", name: "Kickflip Corner", url: "quiz.html", lane: "Notes", game: "Note Quiz · level 2 · 10 questions", spot: "the corner", loot: ["shutter"], choice: "b" },
    { id: "b2", x: 2880, g: 470, hx: 2880, hy: 210, icon: "🛝", name: "Deck Riff", url: "songs.html", lane: "Riffs & TAB", game: "Songs · a riff on two strings", spot: "the half-pipe deck", loot: ["bandana"], choice: "b" },
    { id: "boss", x: 3360, g: G, hx: 3560, hy: 280, icon: "🗑️", name: "The Garbage Gobbler", url: "boss.html", lane: "Gate boss", game: "Boss Battle · Wagon Wheel (G D Em C) · slow · whole chords", spot: "the end of the street", loot: ["stickerbomb"], boss: true }
  ];
  /* ---- the routes (on the board the whole way) ---- */
  const toBench = () => [mount(220, G), push(230, 400, G, { start: 1 }), ollie(400, G, 520, G), push(534, 585, G), ollie(585, G, 650, 586, { apex: 22 }), grind(664, 586, 758, 586), ollie(758, 586, 800, G, { apex: 14 })];
  const toPlaza = from => [push(from, 905, G), ollie(905, G, 1070, 520, { apex: 34 })];
  const downRail = from => [push(from, 1440, 520), ollie(1440, 520, 1510, RAIL(1524), { apex: 16 }), grind(1524, RAIL(1524), 1716, RAIL(1716)), ollie(1716, RAIL(1716), 1780, G, { apex: 10 })];
  const toTruck = from => [push(from, 2000, G), manual(2000, 2100, G), push(2100, 2124, G), rideStop(2124, G)];
  const overCones = () => [mount(2150, G), push(2160, 2300, G, { start: 1 }), ollie(2300, G, 2440, G, { flip: true, apex: 52 })];
  const dropIn = from => [rideCurve([[from, 470], [2952, 470], ...arc(3100, 470, 150, 165, 90, 10)]), push(3100, 3240, G, { cruise: 1 }), ollie(3240, G, 3320, G, { apex: 30 }), rideStop(3334, G)];
  const edges = [
    { from: "s1", to: "a1", route: () => [...toBench(), push(814, 854, G), rideStop(854, G)] },
    { from: "s1", to: "a2", route: () => [...toBench(), ...toPlaza(814), push(1084, 1224, 520), rideStop(1224, 520)] },
    { from: "s1", to: "a3", route: () => [...toBench(), ...toPlaza(814), ...downRail(1084), push(1794, 1824, G), rideStop(1824, G)] },
    { from: "a1", to: "s2", route: () => [mount(880, G), ...toPlaza(890), ...downRail(1084), ...toTruck(1794)] },
    { from: "a2", to: "s2", route: () => [mount(1250, 520), ...downRail(1260), ...toTruck(1794)] },
    { from: "a3", to: "s2", route: () => [mount(1850, G), push(1860, 1990, G, { start: 1 }), ...toTruck(1990)] },
    { from: "s2", to: "b1", route: () => [...overCones(), push(2454, 2494, G), rideStop(2494, G)] },
    { from: "s2", to: "b2", route: () => [...overCones(), push(2454, 2610, G), ollie(2610, G, 2790, 470, { apex: 46, spin: 1 }), push(2804, 2854, 470, { cruise: 1 }), rideStop(2854, 470)] },
    { from: "b1", to: "boss", route: () => [mount(2520, G), push(2530, 2610, G, { start: 1 }), ollie(2610, G, 2790, 470, { apex: 50, flip: true }), manual(2804, 2930, 470), ...dropIn(2930)] },
    { from: "b2", to: "boss", route: () => [mount(2880, 470), push(2890, 2930, 470, { start: 1 }), ...dropIn(2930)] }
  ];
  return {
    id: "skate", name: "Skate City", icon: "🛹", blurb: "Skate a sunny city street: ollies, grinds, a handrail, kickflips and the half-pipe.",
    W, ground: G, prop: "board",
    parallax: { "L-sun": .04, "L-far": .2, "L-mid": .5, "L-fore": 1.25 },
    layers: () => ({ defs, sky: sky(), sun: sun(), far: far(), mid: mid(), main: main(), fore: fore() }),
    platforms: [{ a: -100, b: W + 100, y: G }, { a: 640, b: 770, y: 586 }, { a: 1010, b: 1520, y: 520 }, { a: 2790, b: 2950, y: 470 }],
    nodes, edges,
    extras: [{ hx: 1650, hy: 150, icon: "❓", name: "Rooftop", from: "a2", msg: "❓ A rooftop side quest, coming soon" }]
  };
})());
