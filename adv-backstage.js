/* Level 3: Backstage Pass, a night-time rock festival. Drive the crew's golf cart round backstage, climb the stage, scale the
   lighting truss, then stage-dive and crowd-surf to the Feedback Beast. Choices: 3 backstage, then 2 on stage. */
LEVELS.push((() => {
  const W = 3950, G = 620, ST = 470, TRUSS = 280;
  const RAMP = x => 620 - (x - 1290) * (146 / 210);       // the cart ramp up to the stage: (1290, 620) to (1500, 474)

  /* ---- scenery ---- */
  const defs = `<linearGradient id="bpSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b0a1f"/><stop offset=".6" stop-color="#2a1550"/><stop offset="1" stop-color="#5a2266"/></linearGradient>
    <linearGradient id="bpBeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6c8" stop-opacity=".55"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></linearGradient>
    <linearGradient id="bpBeamP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff6fa3" stop-opacity=".5"/><stop offset="1" stop-color="#ff6fa3" stop-opacity="0"/></linearGradient>
    <linearGradient id="bpBeamC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4fd0c0" stop-opacity=".5"/><stop offset="1" stop-color="#4fd0c0" stop-opacity="0"/></linearGradient>
    <pattern id="bpCable" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="16" height="16" fill="#ffc42b"/><rect width="8" height="16" fill="${INK}"/></pattern>`;
  function sky(){
    seed = 5; let s = `<rect x="-200" y="-1400" width="${W + 400}" height="2200" fill="url(#bpSky)"/>`;
    for(let i = 0; i < 120; i++){ const x = rnd() * W, y = rnd() * 420, r = .8 + rnd() * 1.6;
      s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="#fff" opacity="${f1(.4 + rnd() * .6)}">${i % 4 ? "" : `<animate attributeName="opacity" values="1;.2;1" dur="${f1(2 + rnd() * 3)}s" repeatCount="indefinite"/>`}</circle>`; }
    return s;
  }
  const sun = () => `<circle cx="1500" cy="110" r="44" fill="#fff6d8"/><circle cx="1484" cy="100" r="9" fill="#e9dfc0" opacity=".7"/><circle cx="1514" cy="122" r="6" fill="#e9dfc0" opacity=".7"/>`;
  function far(){
    // festival tents, a Ferris wheel and flag poles on the horizon
    let s = "";
    for(let x = 0; x < W; x += 260){ s += `<path d="M${x} 560 L${x + 70} 470 L${x + 140} 560Z" fill="#3b2463"/><path d="M${x + 70} 470 V450" stroke="#3b2463" stroke-width="3"/><path d="M${x + 70} 450 l18 6 l-18 6z" fill="${["#ff6fa3", "#ffc42b", "#4fd0c0"][(x / 260) % 3]}"/>`; }
    const fw = (cx, cy, r) => { let o = `<g><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#5b3a8a" stroke-width="5"/>`; for(let i = 0; i < 12; i++){ const a = i * 30 * R; o += `<path d="M${cx} ${cy} L${f1(cx + r * Math.cos(a))} ${f1(cy + r * Math.sin(a))}" stroke="#5b3a8a" stroke-width="2"/><circle cx="${f1(cx + r * Math.cos(a))}" cy="${f1(cy + r * Math.sin(a))}" r="6" fill="${["#ffc42b", "#ff6fa3", "#4fd0c0"][i % 3]}"/>`; }
      return o + `<animateTransform attributeName="transform" type="rotate" values="0 ${cx} ${cy};360 ${cx} ${cy}" dur="40s" repeatCount="indefinite"/></g><path d="M${cx - 50} 560 L${cx} ${cy} L${cx + 50} 560" fill="none" stroke="#5b3a8a" stroke-width="6"/>`; };
    return s + fw(900, 380, 150);
  }
  function mid(){
    // the back of the main stage's roof and big screens, and a sea of far-off crowd
    let s = `<path d="M1400 560 L1400 120 L2600 120 L2600 560Z" fill="#1d1430" opacity=".9"/><path d="M1360 140 Q2000 40 2640 140" fill="none" stroke="#3b2463" stroke-width="18"/>`;
    [1500, 2380].forEach((x, i) => { s += `<rect x="${x}" y="200" width="200" height="120" rx="8" fill="#14101f" stroke="#3b2463" stroke-width="6"/><rect x="${x + 10}" y="210" width="180" height="100" fill="${i ? "#2f6f9a" : "#7a2f7a"}"><animate attributeName="fill" values="${i ? "#2f6f9a;#7a2f7a;#2f6f9a" : "#7a2f7a;#2f6f9a;#7a2f7a"}" dur="3s" repeatCount="indefinite"/></rect><text x="${x + 100}" y="272" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="30" fill="#fff" opacity=".85">${i ? "LOUD!" : "FMA FEST"}</text>`; });
    seed = 9; for(let x = 2500; x < W; x += 16) s += `<circle cx="${f1(x + rnd() * 8)}" cy="${f1(552 + rnd() * 10)}" r="${f1(9 + rnd() * 4)}" fill="#2b1a40"/>`;
    return s;
  }
  function main(){
    let s = "";
    // floors: backstage concrete, the stage deck, the mosh pit
    s += `<rect x="-100" y="${G}" width="${W + 200}" height="160" fill="#2b2733"/><path d="M-100 ${G} H${W + 100}" stroke="${INK}" stroke-width="4"/>`;
    for(let x = 0; x < W; x += 140) s += `<path d="M${x} ${G + 4} L${x + 60} ${G + 90}" stroke="#3a3542" stroke-width="3"/>`;
    // backstage: the back wall of the stage with crew signs, a tour bus, road cases
    s += box(-20, 300, 1400, 320, "#3a3542") + `<rect x="-20" y="300" width="1400" height="320" fill="url(#brick)" opacity=".5"/>`;
    s += box(60, 330, 260, 56, "#14101f") + `<text x="190" y="368" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="28" fill="#ffc42b" letter-spacing="2">BACKSTAGE</text>`;
    s += box(560, 380, 120, 240, "#4fb86a") + box(588, 404, 64, 30, "#f7f4ee") + `<text x="620" y="425" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="12" fill="${INK}">GREEN RM</text><circle cx="664" cy="510" r="6" fill="#ffc42b" stroke="${INK}" stroke-width="2"/>`;
    s += box(720, 340, 170, 46, "#e8433f") + `<text x="805" y="370" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="20" fill="#fff">CREW ONLY</text>`;
    [[120, 560, 90, 60], [220, 580, 60, 40], [380, 570, 70, 50]].forEach(([x, y, w, h]) => { s += box(x, y, w, h, "#26211f") + `<path d="M${x} ${y} h10 M${x + w - 10} ${y} h10 M${x} ${y + h} h10 M${x + w - 10} ${y + h} h10" stroke="#9aa3ad" stroke-width="5"/><rect x="${x + w / 2 - 14}" y="${y + h / 2 - 6}" width="28" height="12" fill="#f7f4ee"/>`; });
    // the road case stack (climb it)
    s += box(940, 580, 120, 40, "#26211f") + box(940, 540, 120, 40, "#26211f");
    [[940, 540], [940, 580]].forEach(([x, y]) => { s += `<path d="M${x} ${y} h14 M${x + 106} ${y} h14 M${x} ${y + 40} h14 M${x + 106} ${y + 40} h14" stroke="#9aa3ad" stroke-width="6"/><text x="${x + 60}" y="${y + 26}" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="13" fill="#ffc42b">FMA · AMP</text>`; });
    // the merch stand
    s += box(1170, 470, 150, 150, "#a070e8") + `<path d="M1160 470 L1330 470 L1316 446 L1174 446Z" fill="#ff6fa3" stroke="${INK}" stroke-width="3"/><text x="1245" y="500" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="18" fill="#fff">MERCH</text>`;
    [1190, 1236, 1282].forEach((x, i) => { s += `<path d="M${x} 520 l8 -6 l12 0 l8 6 l-4 6 l-4 -2 v22 h-16 v-22 l-4 2z" fill="${["#ffc42b", "#4fd0c0", "#f7f4ee"][i]}" stroke="${INK}" stroke-width="2"/>`; });
    // cable ramps across the floor (the cart bumps over them)
    [430, 1120].forEach(x => { s += `<path d="M${x - 24} 620 Q${x} 604 ${x + 24} 620Z" fill="url(#bpCable)" stroke="${INK}" stroke-width="3"/>`; });
    // the cart ramp up to the stage, and the stage
    s += `<path d="M1290 620 L1500 474 L1520 470 L1520 620Z" fill="#5d6670" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M1300 612 L1500 474" stroke="#ffc42b" stroke-width="4" stroke-dasharray="12 10"/>`;
    s += box(1520, ST, 980, 150, "#1d1a24") + `<path d="M1520 ${ST} H2500" stroke="#9aa3ad" stroke-width="6"/>`;
    for(let x = 1540; x < 2500; x += 46) s += `<path d="M${x} ${ST + 10} V${G - 4}" stroke="#2b2733" stroke-width="3"/>`;
    // amp stacks, the drum riser and kit, mic stands
    [[1560, 330], [1700, 330]].forEach(([x, y]) => { s += box(x, y, 110, 70, "#26211f") + box(x, y + 70, 110, 70, "#26211f") + `<rect x="${x + 8}" y="${y + 8}" width="94" height="14" fill="#d8c9a8"/><rect x="${x + 8}" y="${y + 26}" width="94" height="38" fill="url(#grille)"/><rect x="${x + 8}" y="${y + 78}" width="94" height="56" fill="url(#grille)"/>`; });
    s += box(1960, 420, 180, 50, "#3a3542") + `<text x="2050" y="452" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="14" fill="#9aa3ad">DRUM RISER</text>`;
    s += `<ellipse cx="2080" cy="380" rx="34" ry="34" fill="#e8433f" stroke="${INK}" stroke-width="3"/><ellipse cx="2080" cy="380" rx="22" ry="22" fill="#f7f4ee" stroke="${INK}" stroke-width="2"/><text x="2080" y="386" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="12" fill="${INK}">FMA</text>`;
    s += `<path d="M2120 420 L2130 330 M2110 330 H2160" stroke="${INK}" stroke-width="4"/><ellipse cx="2135" cy="328" rx="28" ry="5" fill="#ffc42b" stroke="${INK}" stroke-width="2"/><ellipse cx="2030" cy="400" rx="16" ry="10" fill="#9aa3ad" stroke="${INK}" stroke-width="2"/>`;
    [1850, 2300].forEach(x => { s += `<path d="M${x} ${ST} L${x} 360 M${x - 16} ${ST} L${x} ${ST - 16} L${x + 16} ${ST}" stroke="#9aa3ad" stroke-width="4" fill="none"/><path d="M${x} 360 L${x + 20} 350" stroke="#9aa3ad" stroke-width="4"/><rect x="${x + 16}" y="340" width="12" height="18" rx="5" fill="#3a3a3d" stroke="${INK}" stroke-width="2" transform="rotate(-30 ${x + 22} 349)"/>`; });
    // the lighting truss: a tower with a ladder, and a walkway along the top
    const tr = (x0, y0, x1, y1) => { let o = `<path d="M${x0} ${y0} H${x1} M${x0} ${y1} H${x1}" stroke="#9aa3ad" stroke-width="5"/>`; for(let x = x0; x < x1; x += 24) o += `<path d="M${x} ${y0} L${x + 12} ${y1} L${x + 24} ${y0}" stroke="#9aa3ad" stroke-width="2.5" fill="none"/>`; return o; };
    s += `<g stroke-linecap="round">${tr(2180, TRUSS, 2620, TRUSS + 18)}</g><path d="M2180 ${TRUSS} H2620" stroke="${INK}" stroke-width="2"/>`;
    s += pl([[2181, TRUSS - 20], [2181, ST]], INK, 8) + pl([[2181, TRUSS - 20], [2181, ST]], "#9aa3ad", 4) + pl([[2239, TRUSS - 20], [2239, ST]], INK, 8) + pl([[2239, TRUSS - 20], [2239, ST]], "#9aa3ad", 4);
    for(let y = ST - 10; y > TRUSS - 10; y -= 30) s += pl([[2181, y], [2239, y]], INK, 4);
    [2300, 2400, 2500, 2600].forEach((x, i) => { s += `<rect x="${x - 10}" y="${TRUSS + 18}" width="20" height="22" rx="4" fill="#3a3a3d" stroke="${INK}" stroke-width="2"/>`
      + `<polygon points="${x - 8},${TRUSS + 40} ${x + 8},${TRUSS + 40} ${x + 90},${G} ${x - 90},${G}" fill="url(#${["bpBeam", "bpBeamP", "bpBeamC", "bpBeam"][i]})"><animateTransform attributeName="transform" type="rotate" values="-14 ${x} ${TRUSS + 30};14 ${x} ${TRUSS + 30};-14 ${x} ${TRUSS + 30}" dur="${3 + i}s" repeatCount="indefinite"/></polygon>`; });
    // the zip-line from the end of the truss down into the crowd
    s += `<path d="M2600 ${TRUSS - 4} L2780 480" stroke="${INK}" stroke-width="3"/><path d="M2780 480 V${G}" stroke="#9aa3ad" stroke-width="6"/>`;
    // the mosh pit: heads, hands in the air, the barrier
    seed = 13; const skins = ["#ffe2c9", "#f6c9a2", "#e5ab7f", "#c98c5e", "#9b6a45", "#6d4730"], hair = ["#2b2623", "#5b3a1e", "#ffd34d", "#e8433f", "#a070e8", "#8b5a2b"];
    for(let x = 2520; x < 3290; x += 30){ const y = 568 + rnd() * 12, k = Math.floor(rnd() * 6);
      s += `<circle cx="${f1(x)}" cy="${f1(y + 40)}" r="20" fill="${["#5470f0", "#e8433f", "#4fb86a", "#3a3a3d", "#ff8a1c"][k % 5]}" stroke="${INK}" stroke-width="2.5"/><circle cx="${f1(x)}" cy="${f1(y)}" r="16" fill="${skins[k]}" stroke="${INK}" stroke-width="2.5"/><path d="M${f1(x - 16)} ${f1(y - 2)} Q${f1(x)} ${f1(y - 26)} ${f1(x + 16)} ${f1(y - 2)}Z" fill="${hair[(k + 2) % 6]}" stroke="${INK}" stroke-width="2"/>`;
      if(rnd() < .4){ const hx = x + 10, b = (rnd() * 2).toFixed(2); s += `<g><path d="M${f1(hx)} ${f1(y + 16)} L${f1(hx + 6)} ${f1(y - 34)}" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M${f1(hx)} ${f1(y + 16)} L${f1(hx + 6)} ${f1(y - 34)}" stroke="${skins[k]}" stroke-width="6" stroke-linecap="round"/><circle cx="${f1(hx + 6)}" cy="${f1(y - 37)}" r="6" fill="${skins[k]}" stroke="${INK}" stroke-width="2"/><animateTransform attributeName="transform" type="translate" values="0 0;0 -8;0 0" dur=".7s" begin="${b}s" repeatCount="indefinite"/></g>`; } }
    s += `<path d="M3290 620 V560 H3340 V620" fill="none" stroke="#9aa3ad" stroke-width="6"/>`; for(let x = 3296; x < 3340; x += 9) s += `<path d="M${x} 564 V616" stroke="#9aa3ad" stroke-width="3"/>`;
    // the boss: the Feedback Beast, a giant speaker stack with a face
    s += box(3560, 250, 320, 370, "#26211f") + `<rect x="3576" y="266" width="288" height="338" fill="url(#grille)"/>`;
    s += `<circle cx="3650" cy="360" r="42" fill="#3a3a3d" stroke="#9aa3ad" stroke-width="6"/><circle cx="3790" cy="360" r="42" fill="#3a3a3d" stroke="#9aa3ad" stroke-width="6"/><circle cx="3650" cy="360" r="14" fill="#ff3b3b"><animate attributeName="r" values="12;18;12" dur=".9s" repeatCount="indefinite"/></circle><circle cx="3790" cy="360" r="14" fill="#ff3b3b"><animate attributeName="r" values="12;18;12" dur=".9s" repeatCount="indefinite"/></circle>`;
    s += `<path d="M3612 316 L3690 340 M3828 316 L3750 340" stroke="#ff3b3b" stroke-width="8" stroke-linecap="round"/><path d="M3630 500 Q3720 450 3810 500 Q3720 560 3630 500Z" fill="#14101f" stroke="#9aa3ad" stroke-width="5"/><path d="M3650 500 L3664 482 L3678 500 L3692 482 L3706 500 L3720 482 L3734 500 L3748 482 L3762 500 L3776 482 L3790 500" fill="none" stroke="#f7f4ee" stroke-width="4"/>`;
    s += `<g fill="none" stroke="#ff6fa3" stroke-width="5" opacity=".7"><path d="M3540 380 q-30 -30 0 -60"><animate attributeName="opacity" values="0;1;0" dur="1.2s" repeatCount="indefinite"/></path><path d="M3520 400 q-50 -50 0 -100"><animate attributeName="opacity" values="0;1;0" dur="1.2s" begin=".4s" repeatCount="indefinite"/></path></g>`;
    return s;
  }
  function fore(){
    // the front row of the crowd, close to camera, and stage-light haze
    seed = 21; let s = "";
    for(let x = 2380; x < 3500; x += 46){ const y = 700 + rnd() * 16; s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="30" fill="#140f20"/>`; if(rnd() < .35) s += `<path d="M${f1(x + 12)} ${f1(y - 20)} L${f1(x + 22)} ${f1(y - 90)}" stroke="#140f20" stroke-width="14" stroke-linecap="round"/><circle cx="${f1(x + 22)}" cy="${f1(y - 96)}" r="9" fill="#140f20"/>`; }
    return s + `<path d="M-100 20 H${W * 1.4}" stroke="#140f20" stroke-width="40"/>`;
  }

  /* ---- quests ---- */
  const nodes = [
    { id: "c1", x: 200, g: G, hx: 200, hy: 280, icon: "🎚️", name: "Soundcheck", url: "tuner.html", lane: "Notes", game: "Tuning Race", spot: "the loading bay", loot: ["laminate"], prop: "cart" },
    { id: "k1", x: 700, g: G, hx: 700, hy: 300, icon: "🛋️", name: "Green Room Warm-up", url: "chords.html", lane: "Chords", game: "Chords · A, D and E", spot: "the green room", loot: ["towel"], choice: "k", prop: "cart" },
    { id: "k2", x: 976, g: 540, hx: 976, hy: 230, icon: "🧳", name: "Road Case Riff", url: "songs.html", lane: "Riffs & TAB", game: "Songs · a riff on two strings", spot: "the road cases", loot: ["headset"], choice: "k" },
    { id: "k3", x: 1230, g: G, hx: 1230, hy: 320, icon: "👕", name: "Merch Stand", url: "quiz.html", lane: "Notes", game: "Note Quiz · level 2", spot: "the merch stand", loot: ["starshades"], choice: "k", prop: "cart" },
    { id: "c2", x: 1620, g: ST, hx: 1620, hy: 200, icon: "🎤", name: "Side of Stage", url: "quiz.html", lane: "Notes", game: "Note Quiz · level 2 · 10 questions", spot: "the side of the stage", loot: [] },
    { id: "t1", x: 2050, g: 420, hx: 2050, hy: 170, icon: "🥁", name: "Drum Riser", url: "chords.html", lane: "Chords", game: "Chords · Am, C, G and F", spot: "the drum riser", loot: ["lightup"], choice: "t" },
    { id: "t2", x: 2330, g: TRUSS, hx: 2440, hy: 130, icon: "💡", name: "Lighting Rig", url: "songs.html", lane: "Riffs & TAB", game: "Songs · a longer riff", spot: "the lighting truss", loot: ["glowchain"], choice: "t" },
    { id: "boss", x: 3480, g: G, hx: 3720, hy: 190, icon: "🔈", name: "The Feedback Beast", url: "boss.html", lane: "Gate boss", game: "Boss Battle · Stand By Me · medium · root notes", spot: "front of house", loot: ["glitter"], boss: true }
  ];
  /* ---- routes ---- */
  const upRamp = from => [drive(from, 1290, G), driveCurve([[1290, G], [1500, 474], [1531, ST]]), drive(1531, 1590, ST), cartStop(1590, ST)];
  const surfToBoss = (x0, y) => [crowdSurf(x0, 3200, y), crowdDrop(3200, y, 3290, G), run(3304, 3456, G), stop(3456, G)];
  const edges = [
    { from: "c1", to: "k1", route: () => [cartIn(200, G), drive(194, 670, G, { start: 1, bumps: [430] }), cartStop(670, G)] },
    { from: "c1", to: "k2", route: () => [run(200, 400, G, { start: 1 }), jump(400, G, 460, G, { apex: 20 }), run(474, 865, G), ledge(865, G, 940, 540)] },
    { from: "c1", to: "k3", route: () => [cartIn(200, G), drive(194, 1200, G, { start: 1, bumps: [430, 1120] }), cartStop(1200, G)] },
    { from: "k1", to: "c2", route: () => [cartIn(700, G), drive(694, 760, G, { start: 1 }), ...upRamp(760)] },
    { from: "k2", to: "c2", route: () => [run(976, 1050, 540, { start: 1 }), jump(1050, 540, 1140, G, { apex: 20 }), run(1154, 1300, G),
      jump(1300, G, 1380, RAMP(1380), { apex: 22 }), jump(1394, RAMP(1394), 1480, RAMP(1480), { apex: 22 }), jump(1494, RAMP(1494), 1560, ST, { apex: 18 }), run(1574, 1596, ST), stop(1596, ST)] },
    { from: "k3", to: "c2", route: () => [cartIn(1230, G), drive(1224, 1250, G, { start: 1 }), ...upRamp(1250)] },
    { from: "c2", to: "t1", route: () => [run(1620, 1900, ST, { start: 1 }), jump(1900, ST, 1990, 420, { apex: 30 }), run(2004, 2026, 420), stop(2026, 420)] },
    { from: "c2", to: "t2", route: () => [run(1620, 2186, ST, { start: 1 }), stop(2186, ST), ladder(2210, ST, TRUSS), jump(2210, TRUSS, 2270, TRUSS, { apex: 22, fromStand: 1 }), run(2284, 2306, TRUSS), stop(2306, TRUSS)] },
    { from: "t1", to: "boss", route: () => [run(2050, 2130, 420, { start: 1 }), jump(2130, 420, 2200, ST, { apex: 20 }), run(2214, 2440, ST), stageDive(2440, ST, 2640, 500), ...surfToBoss(2640, 500)] },
    { from: "t2", to: "boss", route: () => {
      const z = zip(2604, TRUSS - 2, 2770, 474), z0 = z.at(0), z1 = z.at(1);
      return [run(2330, 2560, TRUSS, { start: 1 }), kf([{ u: 0, p: RUNAT(2560), x: 2560, g: TRUSS }, { u: .5, p: REACHUP, x: 2580, y: plantCY(REACHUP, TRUSS) - 12 }, { u: 1, p: z0.p, x: z0.cx, y: z0.cy }], .45),
        z, kf([{ u: 0, p: z1.p, x: z1.cx, y: z1.cy }, { u: .5, p: P(LEAP, { rot: 40 }), x: z1.cx + 20, y: z1.cy + 10 }, { u: 1, p: SURF, x: 2800, y: 500 }], .5, [], { veh: "crowd" }), ...surfToBoss(2800, 500)]; } }
  ];
  return {
    id: "backstage", name: "Backstage Pass", icon: "🎸", blurb: "A night at the rock festival: drive the crew cart, climb the lighting rig, stage-dive and crowd-surf.",
    W, ground: G,
    parallax: { "L-sun": .03, "L-far": .2, "L-mid": .55, "L-fore": 1.3 },
    layers: () => ({ defs, sky: sky(), sun: sun(), far: far(), mid: mid(), main: main(), fore: fore() }),
    platforms: [{ a: -100, b: W + 100, y: G }, { a: 940, b: 1060, y: 540 }, { a: 1520, b: 2500, y: ST }, { a: 1960, b: 2140, y: 420 }, { a: 2180, b: 2620, y: TRUSS }],
    nodes, edges,
    extras: [{ hx: 900, hy: 140, icon: "❓", name: "Tour Bus", from: "c1", msg: "❓ The tour bus: a side quest, coming soon" }]
  };
})());
