/* Level 4: Inside the Amp. Shrunk down inside a guitar rig: bounce across drum skins, slide along a guitar string, run (or ride a
   giant pick) across piano keys that play as you cross them, stomp effect pedals that light up, and ride the pick down the
   speaker cone to Captain Fuzz. Choices: 3 after the input jack, then 2 before the boss. */
LEVELS.push((() => {
  const W = 4200, G = 620, KEYTOP = 600, PED = 588, CAB = 380;
  const STR = x => 520 - (x - 1150) * (140 / 490);               // the giant string: (1150, 520) up to (1640, 380)
  const DRUMS = [[700, 560, 70], [880, 510, 70], [1060, 470, 70]];   // centre x, skin height, half width
  const KEYS = []; for(let x = 1780; x < 2440; x += 40) KEYS.push(x);
  const PEDALS = [2760, 2880, 3000, 3120];                       // left edges, 80 wide
  const PEDAL_C = ["#e8433f", "#ffc42b", "#4aa8ff", "#9be04a"];
  const arc = (cx, cy, r, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => { const a = (a0 + (a1 - a0) * i / n) * R; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });

  /* ---- scenery ---- */
  const defs = `<linearGradient id="ampSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050b18"/><stop offset=".7" stop-color="#0d1f33"/><stop offset="1" stop-color="#123a3a"/></linearGradient>
    <radialGradient id="ampGlow"><stop offset="0" stop-color="#ffb347" stop-opacity=".9"/><stop offset="1" stop-color="#ff7a1c" stop-opacity="0"/></radialGradient>
    <linearGradient id="ampString" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f6f8"/><stop offset="1" stop-color="#8d96a0"/></linearGradient>
    <radialGradient id="ampCone"><stop offset="0" stop-color="#5d6670"/><stop offset=".3" stop-color="#3a3f46"/><stop offset="1" stop-color="#22262c"/></radialGradient>`;
  function sky(){
    // a dark sky of circuitry: glowing traces with pulses running along them
    seed = 31; let s = `<rect x="-200" y="-1400" width="${W + 400}" height="2200" fill="url(#ampSky)"/>`;
    for(let i = 0; i < 26; i++){ const x = rnd() * W, y = 40 + rnd() * 380, w = 120 + rnd() * 260, h = 40 + rnd() * 120, c = rnd() < .5 ? "#1f6f6a" : "#244a6f";
      const d = `M${f1(x)} ${f1(y)} H${f1(x + w)} V${f1(y + h)} H${f1(x + w + 80)}`;
      s += `<path d="${d}" fill="none" stroke="${c}" stroke-width="3"/><circle cx="${f1(x)}" cy="${f1(y)}" r="5" fill="${c}"/><circle cx="${f1(x + w + 80)}" cy="${f1(y + h)}" r="5" fill="${c}"/>`
        + `<circle r="4" fill="#7ff5e8"><animateMotion path="${d}" dur="${f1(3 + rnd() * 4)}s" repeatCount="indefinite"/></circle>`; }
    return s;
  }
  const sun = () => "";
  function far(){
    // giant capacitors and resistors on the horizon
    seed = 37; let s = "", x = -40;
    while(x < W){ const kind = rnd();
      if(kind < .5){ const w = 70 + rnd() * 40, h = 140 + rnd() * 140; s += `<rect x="${f1(x)}" y="${f1(560 - h)}" width="${f1(w)}" height="${f1(h + 40)}" rx="14" fill="#173247"/><rect x="${f1(x)}" y="${f1(560 - h)}" width="${f1(w)}" height="16" rx="8" fill="#20435d"/><text x="${f1(x + w / 2)}" y="${f1(560 - h / 2)}" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="18" fill="#27506e">${["470µF", "1000µF", "220µF"][Math.floor(rnd() * 3)]}</text>`; x += w + 30; }
      else { const w = 160 + rnd() * 60; s += `<rect x="${f1(x)}" y="490" width="${f1(w)}" height="44" rx="20" fill="#1c3a52"/>${[.25, .45, .65].map((k, i) => `<rect x="${f1(x + w * k)}" y="490" width="14" height="44" fill="${["#5a3a2a", "#3a2a5a", "#5a4a1a"][i]}"/>`).join("")}<path d="M${f1(x - 30)} 512 H${f1(x)} M${f1(x + w)} 512 H${f1(x + w + 30)}" stroke="#1c3a52" stroke-width="5"/>`; x += w + 70; } }
    return s;
  }
  function mid(){
    // glowing valves and transformers
    let s = "";
    for(let x = 300; x < W; x += 520){
      s += `<rect x="${x}" y="300" width="160" height="200" rx="8" fill="#1a2430" stroke="#2c3a48" stroke-width="5"/><path d="M${x} 340 H${x + 160} M${x} 380 H${x + 160} M${x} 420 H${x + 160} M${x} 460 H${x + 160}" stroke="#2c3a48" stroke-width="5"/>`;
      s += `<g transform="translate(${x + 260} 0)"><ellipse cx="0" cy="380" rx="60" ry="80" fill="url(#ampGlow)"><animate attributeName="opacity" values=".7;1;.7" dur="2.2s" repeatCount="indefinite"/></ellipse><path d="M-34 470 V340 Q-34 300 0 300 Q34 300 34 340 V470Z" fill="#cfe9f5" fill-opacity=".25" stroke="#7a8a96" stroke-width="4"/><path d="M-12 450 V360 M12 450 V360 M-20 380 H20" stroke="#ff9a3c" stroke-width="4"/><rect x="-40" y="470" width="80" height="30" rx="4" fill="#2a2a2e"/></g>`;
    }
    return s;
  }
  function main(){
    let s = "";
    // the circuit-board floor, with gold traces
    s += `<rect x="-100" y="${G}" width="${W + 200}" height="160" fill="#1f6f4a"/><path d="M-100 ${G} H${W + 100}" stroke="${INK}" stroke-width="4"/>`;
    for(let x = 0; x < W; x += 180) s += `<path d="M${x} ${G + 14} H${x + 70} L${x + 90} ${G + 40} H${x + 160}" fill="none" stroke="#d9b44a" stroke-width="3"/><circle cx="${x + 160}" cy="${G + 40}" r="5" fill="#d9b44a"/>`;
    // the input jack (a giant socket, with the plug coming in)
    s += box(30, 420, 220, 200, "#3a3f46", `rx="20"`) + `<circle cx="140" cy="500" r="56" fill="#dfe3e8" stroke="${INK}" stroke-width="4"/><circle cx="140" cy="500" r="30" fill="#14181e" stroke="${INK}" stroke-width="3"/><text x="140" y="600" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="20" fill="#dfe3e8">INPUT</text>`;
    s += `<path d="M-100 500 H60" stroke="${INK}" stroke-width="26"/><path d="M-100 500 H60" stroke="#e8433f" stroke-width="18"/><rect x="60" y="484" width="60" height="32" rx="6" fill="#dfe3e8" stroke="${INK}" stroke-width="3"/><rect x="118" y="490" width="40" height="20" fill="#ffc42b" stroke="${INK}" stroke-width="3"/>`;
    // drums (their skins squash when you land: ids amp-d0..2)
    DRUMS.forEach(([cx, top, hw], i) => { const c = ["#e8433f", "#4aa8ff", "#a070e8"][i];
      s += `<path d="M${cx - hw} ${top} V${G} H${cx + hw} V${top}Z" fill="${c}" stroke="${INK}" stroke-width="4"/>`;
      for(let k = 0; k < 4; k++) s += `<path d="M${cx - hw + 12 + k * (hw * 2 - 24) / 3} ${top + 8} V${G - 8}" stroke="#dfe3e8" stroke-width="5"/>`;
      s += `<path d="M${cx - hw - 4} ${top} H${cx + hw + 4}" stroke="#dfe3e8" stroke-width="10" stroke-linecap="round"/><path d="M${cx - hw - 4} ${top} H${cx + hw + 4}" stroke="${INK}" stroke-width="2" stroke-linecap="round" fill="none"/>`
        + `<g id="amp-d${i}" style="transform-box:fill-box;transform-origin:center top"><ellipse cx="${cx}" cy="${top}" rx="${hw}" ry="10" fill="#f7f4ee" stroke="${INK}" stroke-width="3"/><text x="${cx}" y="${top + 5}" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="12" fill="${c}">FMA</text></g>`; });
    // the giant string, wound like a low E, from its post up to a fretboard block
    s += `<path d="M1150 520 L1640 380" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="M1150 520 L1640 380" stroke="url(#ampString)" stroke-width="8" stroke-linecap="round"/><path d="M1150 520 L1640 380" stroke="#8d96a0" stroke-width="8" stroke-dasharray="2 4" opacity=".6"/>`;
    s += box(1136, 520, 28, 100, "#dfe3e8", `rx="6"`) + box(1640, CAB, 140, 240, "#5a3220") + `<path d="M1680 ${CAB} V${G} M1730 ${CAB} V${G}" stroke="#dfe3e8" stroke-width="5"/><circle cx="1705" cy="440" r="9" fill="#f7f4ee" stroke="${INK}" stroke-width="2"/>`;
    // the patch cable down from the block (zip down it)
    s += `<path d="M1780 372 Q1890 420 2000 560 L2000 ${KEYTOP}" fill="none" stroke="${INK}" stroke-width="9"/><path d="M1780 372 Q1890 420 2000 560 L2000 ${KEYTOP}" fill="none" stroke="#4fd0c0" stroke-width="5"/>`;
    // piano keys (they go down and play a note as you cross them: ids amp-k0..)
    s += box(1772, KEYTOP - 4, 676, 30, "#26211f");
    KEYS.forEach((x, i) => { s += `<rect id="amp-k${i}" x="${x}" y="${KEYTOP}" width="38" height="26" rx="3" fill="#f7f4ee" stroke="${INK}" stroke-width="3"/>`; });
    KEYS.forEach((x, i) => { if(i < KEYS.length - 1 && [0, 1, 3, 4, 5].includes(i % 7)) s += `<rect x="${x + 27}" y="${KEYTOP - 10}" width="22" height="22" rx="3" fill="#26211f"/>`; });
    // pedals (they light up and click when stomped: ids amp-p0..3)
    PEDALS.forEach((x, i) => { s += box(x, PED, 80, G - PED, PEDAL_C[i], `rx="6"`) + `<circle cx="${x + 20}" cy="${PED + 10}" r="5" fill="#26211f"/><circle cx="${x + 60}" cy="${PED + 10}" r="5" fill="#26211f"/><circle id="amp-p${i}" cx="${x + 40}" cy="${PED + 9}" r="5" fill="#5a1a1a" stroke="${INK}" stroke-width="2"/>`
      + `<rect x="${x + 24}" y="${PED + 20}" width="32" height="9" rx="3" fill="#dfe3e8" stroke="${INK}" stroke-width="2"/>`; });
    s += `<path d="M2830 ${G - 4} Q2880 ${G + 10} 2930 ${G - 4} M2950 ${G - 4} Q3000 ${G + 10} 3050 ${G - 4} M3070 ${G - 4} Q3120 ${G + 10} 3170 ${G - 4}" fill="none" stroke="${INK}" stroke-width="5"/>`;
    // the step and the speaker cabinet, with its cone as a ramp down the front
    s += box(3200, 500, 90, 120, "#3a3f46", `rx="6"`) + `<path d="M3214 520 H3276 M3214 540 H3276" stroke="#5d6670" stroke-width="4"/>`;
    const cone = arc(3790, CAB, 240, 180, 90, 14);
    s += box(3330, CAB, 230, 240, "#26211f") + `<rect x="3346" y="${CAB + 16}" width="198" height="208" fill="url(#grille)"/>`;
    s += `<path d="M3550 ${CAB} ${cone.map(p => "L" + f1(p[0]) + " " + f1(p[1])).join(" ")} L3550 ${G}Z" fill="url(#ampCone)" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
    [60, 120, 180].forEach(r => { const a = arc(3790, CAB, 240 - r * .55, 180, 90, 10); s += `<path d="M${a.map(p => f1(p[0]) + " " + f1(p[1])).join(" L")}" fill="none" stroke="#5d6670" stroke-width="3" opacity=".7"/>`; });
    s += `<path d="M3330 ${CAB} H3560" stroke="#9aa3ad" stroke-width="6"/><text x="3445" y="${CAB - 12}" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="18" fill="#dfe3e8">FMA 4×12</text>`;
    // shrunk-down friends: sitting on the input jack, dancing by the valves
    s += npc(401, 140, 420, { pose: "wave", phone: false, bob: false, cfg: { acc: "phones" } }) + npc(402, 2530, G, { pose: "rock", bob: 6, beat: .45 }) + npc(403, 3480, CAB, { pose: "cheer", bob: 6 });
    // the boss: Captain Fuzz, a big grumpy fuzz pedal with cable tentacles
    s += `<g><path d="M3960 560 Q3900 520 3880 600 M4180 540 Q4240 500 4260 590" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round"/><path d="M3960 560 Q3900 520 3880 600 M4180 540 Q4240 500 4260 590" fill="none" stroke="#a070e8" stroke-width="10" stroke-linecap="round"/><animateTransform attributeName="transform" type="translate" values="0 0;0 -6;0 0" dur="1.6s" repeatCount="indefinite"/></g>`;
    s += box(3960, 360, 230, 260, "#ff8a1c", `rx="18"`) + `<rect x="3976" y="376" width="198" height="60" rx="8" fill="#26211f"/><text x="4075" y="418" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="30" fill="#ffc42b">FUZZ</text>`;
    s += `<circle cx="4020" cy="480" r="24" fill="#26211f" stroke="#dfe3e8" stroke-width="5"/><circle cx="4130" cy="480" r="24" fill="#26211f" stroke="#dfe3e8" stroke-width="5"/><path d="M4020 480 L4006 466 M4130 480 L4144 466" stroke="#ff3b3b" stroke-width="5" stroke-linecap="round"/>`;
    s += `<path d="M3996 444 L4044 462 M4154 444 L4106 462" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><rect x="4030" y="540" width="90" height="40" rx="8" fill="#dfe3e8" stroke="${INK}" stroke-width="4"/><path d="M4040 560 L4052 548 L4064 560 L4076 548 L4088 560 L4100 548 L4112 560" fill="none" stroke="${INK}" stroke-width="3"/>`;
    s += `<circle cx="4075" cy="520" r="7" fill="#ff3b3b"><animate attributeName="opacity" values="1;.2;1" dur=".6s" repeatCount="indefinite"/></circle>`;
    return s;
  }
  function fore(){
    // ribbon cables and wires hanging across the top, close to camera
    let s = "";
    for(let x = 0; x < W * 1.35; x += 700) s += `<path d="M${x} -10 Q${x + 180} 90 ${x + 380} -10" fill="none" stroke="#0a121c" stroke-width="16"/><path d="M${x + 60} -10 Q${x + 240} 70 ${x + 440} -10" fill="none" stroke="#e8433f" stroke-width="6" opacity=".55"/>`;
    return s;
  }

  /* ---- scenery that reacts: drum skins squash, keys go down and play, pedals light up ---- */
  let lastKey = -1, lastPedal = -1, lastDrum = -1;
  function onFrame(st){
    if(!st || st.m !== "side" || !st.p) return;
    const h = hipOf(st.cx, st.cy, st.p.rot), feet = h[1] + lowest(st.p), x = st.cx;
    // drums
    let d = -1; DRUMS.forEach(([cx, top, hw], i) => { if(Math.abs(x - cx) < hw && Math.abs(feet - top) < 10) d = i; });
    if(d !== lastDrum){ [0, 1, 2].forEach(i => { const e = document.getElementById("amp-d" + i); if(e) e.style.transform = i === d ? "scale(1.06, .55) translateY(8px)" : ""; });
      if(d >= 0) Sound.note([98, 82.4, 73.4][d], .3, "sine"); lastDrum = d; }
    // keys
    let k = -1; if(Math.abs(feet - KEYTOP) < 14 || (st.veh && Math.abs(feet - KEYTOP + BU) < 14)) KEYS.forEach((kx, i) => { if(x - 8 >= kx && x - 8 < kx + 40) k = i; });
    if(k !== lastKey){ const old = document.getElementById("amp-k" + lastKey), now = document.getElementById("amp-k" + k);
      if(old){ old.setAttribute("y", KEYTOP); old.setAttribute("fill", "#f7f4ee"); }
      if(now){ now.setAttribute("y", KEYTOP + 5); now.setAttribute("fill", "#ffe9a0"); Sound.note(SCALE[k % SCALE.length], .35); }
      lastKey = k; }
    // pedals
    let p = -1; if(Math.abs(feet - PED) < 12) PEDALS.forEach((px, i) => { if(x >= px && x < px + 80) p = i; });
    if(p !== lastPedal){ if(p >= 0){ const e = document.getElementById("amp-p" + p); if(e){ e.setAttribute("fill", "#ff3b3b"); e.setAttribute("r", "7"); } Sound.note(SCALE[[0, 2, 4, 7][p]] / 2, .25, "square"); } lastPedal = p; }
  }

  /* ---- quests ---- */
  const nodes = [
    { id: "m1", x: 200, g: G, hx: 330, hy: 330, icon: "🔌", name: "Plug In", url: "tuner.html", lane: "Notes", game: "Tuning Race", spot: "the input jack", loot: ["pickpendant"] },
    { id: "p2", x: 1078, g: 470, hx: 1078, hy: 230, icon: "🥁", name: "Drum Bounce", url: "chords.html", lane: "Chords", game: "Chords · E, A and D", spot: "the floor tom", loot: ["spark"], choice: "p" },
    { id: "p1", x: 1718, g: CAB, hx: 1718, hy: 150, icon: "〰️", name: "String Slide", url: "quiz.html", lane: "Notes", game: "Note Quiz · level 3 · all 12 notes", spot: "the fretboard block", loot: ["tuningcrown"], choice: "p" },
    { id: "p3", x: 2430, g: KEYTOP, hx: 2400, hy: 330, icon: "🎹", name: "Keyboard Run", url: "songs.html", lane: "Riffs & TAB", game: "Songs · a riff across three strings", spot: "the piano keys", loot: ["vumeter"], choice: "p", prop: "pick" },
    { id: "s2", x: 2650, g: G, hx: 2650, hy: 300, icon: "💡", name: "Valve Garden", url: "chords.html", lane: "Chords", game: "Chords · G, Em, C and D", spot: "the glowing valves", loot: [] },
    { id: "q2", x: 3174, g: PED, hx: 3120, hy: 330, icon: "🎛️", name: "Pedal Board", url: "songs.html", lane: "Riffs & TAB", game: "Songs · a riff with a power chord", spot: "the pedal board", loot: ["circuit"], choice: "q" },
    { id: "q1", x: 3400, g: CAB, hx: 3420, hy: 150, icon: "🔊", name: "Speaker Stack", url: "quiz.html", lane: "Notes", game: "Note Quiz · level 3 · 10 questions", spot: "the speaker cabinet", loot: ["cablecoil"], choice: "q" },
    { id: "boss", x: 3906, g: G, hx: 4075, hy: 260, icon: "😠", name: "Captain Fuzz", url: "boss.html", lane: "Gate boss", game: "Boss Battle · Someone Like You · medium · whole chords", spot: "the end of the signal chain", loot: ["lightning"], boss: true }
  ];
  /* ---- routes ---- */
  const drums3 = () => [run(200, 560, G, { start: 1 }), jump(560, G, 690, 560, { apex: 50 }), Object.assign(jump(704, 560, 870, 510, { apex: 70, flips: 1 }), { fx: [{ u: .2, k: "dust" }, { u: .32, k: "moment", name: "boing" }, { u: .8, k: "dust" }] }), jump(884, 510, 1040, 470, { apex: 60 })];
  const underStrings = from => [jump(from, 470, 1180, G, { apex: 30 }), run(1194, 1760, G)];
  const keysToValves = () => [jump(1760, G, 1820, KEYTOP, { apex: 26 }), run(1834, 2420, KEYTOP), jump(2420, KEYTOP, 2500, G, { apex: 20 }), run(2514, 2626, G), stop(2626, G)];
  const pedals = () => [run(2650, 2700, G, { start: 1 }), jump(2700, G, 2800, PED, { apex: 30 }), jump(2814, PED, 2920, PED, { apex: 34 }), jump(2934, PED, 3040, PED, { apex: 34 })];
  const upCab = from => [jump(from, PED, 3215, 500, { apex: 40 }), run(3229, 3255, 500), ledge(3255, 500, 3330, CAB)];
  const coneRide = from => [mount(from, CAB, { board: "pick" }), push(from + 10, 3540, CAB, { start: 1, board: "pick" }), Object.assign(rideCurve([[3540, CAB], [3552, CAB], ...arc(3790, CAB, 240, 175, 90, 12)], { board: "pick" }), { fx: [{ u: .25, k: "moment", name: "cone" }] }), push(3790, 3880, G, { cruise: 1, board: "pick" }), rideStop(3880, G, { board: "pick" })];
  const edges = [
    { from: "m1", to: "p2", route: () => [...drums3(), stop(1054, 470)] },
    { from: "m1", to: "p1", route: () => [...drums3(), jump(1054, 470, 1160, STR(1160), { apex: 40 }), grind(1174, STR(1174), 1630, STR(1630), { board: "none" }), run(1630, 1694, CAB), stop(1694, CAB)] },
    { from: "m1", to: "p3", route: () => [...drums3(), jump(1054, 470, 1180, G, { apex: 30 }), mount(1194, G, { board: "pick" }), push(1204, 1760, G, { board: "pick" }), ollie(1760, G, 1820, KEYTOP, { board: "pick", apex: 26 }), push(1834, 2404, KEYTOP, { board: "pick", cruise: 1 }), rideStop(2404, KEYTOP, { board: "pick" })] },
    { from: "p2", to: "s2", route: () => [...underStrings(1078), ...keysToValves()] },
    { from: "p1", to: "s2", route: () => {
      const z = zip(1786, 376, 1990, 560), z0 = z.at(0), z1 = z.at(1);
      return [run(1718, 1750, CAB, { start: 1 }), kf([{ u: 0, p: RUNAT(1750), x: 1750, g: CAB }, { u: .5, p: REACHUP, x: 1766, y: plantCY(REACHUP, CAB) - 10 }, { u: 1, p: z0.p, x: z0.cx, y: z0.cy }], .45), z,
        kf([{ u: 0, p: z1.p, x: z1.cx, y: z1.cy }, { u: .6, p: REACH, x: 2014, y: plantCY(REACH, KEYTOP) }, { u: .8, p: LANDC, x: 2026, g: KEYTOP }, { u: 1, p: RUNAT(2040), x: 2040, g: KEYTOP }], .55, [{ u: .6, k: "dust" }]),
        run(2040, 2420, KEYTOP), jump(2420, KEYTOP, 2500, G, { apex: 20 }), run(2514, 2626, G), stop(2626, G)]; } },
    { from: "p3", to: "s2", route: () => [run(2430, 2450, KEYTOP, { start: 1 }), jump(2450, KEYTOP, 2510, G, { apex: 20 }), run(2524, 2626, G), stop(2626, G)] },
    { from: "s2", to: "q2", route: () => [...pedals(), jump(3054, PED, 3136, PED, { apex: 34 }), stop(3150, PED)] },
    { from: "s2", to: "q1", route: () => [...pedals(), ...upCab(3054), run(3366, 3376, CAB), stop(3376, CAB)] },
    { from: "q2", to: "boss", route: () => [...upCab(3174), ...coneRide(3366)] },
    { from: "q1", to: "boss", route: () => coneRide(3400) }
  ];
  return {
    id: "amp", name: "Inside the Amp", icon: "🔌", blurb: "Shrink down inside the gear: drum bounces, a string slide, piano keys that play and the speaker cone.",
    W, ground: G, onFrame,
    parallax: { "L-far": .25, "L-mid": .55, "L-fore": 1.3 },
    layers: () => { lastKey = lastPedal = lastDrum = -1; return { defs, sky: sky(), sun: sun(), far: far(), mid: mid(), main: main(), fore: fore() }; },
    platforms: [{ a: -100, b: W + 100, y: G }, ...DRUMS.map(([cx, top, hw]) => ({ a: cx - hw, b: cx + hw, y: top })), { a: 1640, b: 1780, y: CAB }, { a: 1772, b: 2448, y: KEYTOP },
      ...PEDALS.map(x => ({ a: x, b: x + 80, y: PED })), { a: 3200, b: 3290, y: 500 }, { a: 3330, b: 3560, y: CAB }],
    nodes, edges,
    moments: {
      // the front flip between the drums
      boing(M){ M.slow(.25, 1700); M.phones(true); M.polaroidsAt([790], ["BOING! 🥁"]); M.after(2400, () => M.phones(false)); M.after(3300, () => M.clearPolaroids()); },
      // riding the pick down the speaker cone: slow-mo, and your friend on the cab gets the shot
      cone(M){ M.slow(.25, 1700); M.phones(true); M.polaroidsAt([3660], ["TURN IT UP TO 11! 🔊"]); M.after(2400, () => M.phones(false)); M.after(3400, () => M.clearPolaroids()); }
    },
    polaroidBack: (cx, cy) => `<rect x="${cx - 200}" y="${cy - 200}" width="400" height="400" fill="#0d1f33"/><circle cx="${cx}" cy="${cy}" r="120" fill="url(#ampCone)"/>`,
    extras: [{ hx: 2200, hy: 120, icon: "❓", name: "Tone Knob", from: "p1", msg: "❓ The tone knob: a side quest, coming soon" }]
  };
})());
