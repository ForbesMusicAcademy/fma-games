/* Level 1: Rust Row, an industrial district at dusk. Parkour: vaults, ledge grabs, a bar swing, flips, a slide and a ladder. */
LEVELS.push((() => {
  const W = 3300;      // (the scenery below was drawn for this width)
  function skyLayer(){
    return `<rect x="-200" y="-1400" width="${W + 400}" height="2200" fill="url(#gSky)"/>`
      + `<ellipse cx="700" cy="560" rx="900" ry="60" fill="#ffb07a" opacity=".35"/>`
      + [[300, 120], [900, 80], [1500, 150], [2200, 100], [2900, 60]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="220" ry="22" fill="#a65a7e" opacity=".25"/>`).join("");
  }
  function sunLayer(){ return `<circle cx="760" cy="430" r="190" fill="url(#gSun)"/><circle cx="760" cy="430" r="70" fill="#fff0c4" opacity=".9"/>`; }
  function farLayer(){
    seed = 11; let s = "", x = -40;
    while(x < W){
      const w = 60 + rnd() * 130, h = 70 + rnd() * 170;
      s += `<rect x="${f1(x)}" y="${f1(580 - h)}" width="${f1(w)}" height="${f1(h + 60)}" fill="#8e527a"/>`;
      for(let i = 0; i < 4; i++) if(rnd() < .6) s += `<rect x="${f1(x + 8 + rnd() * (w - 20))}" y="${f1(590 - h + 10 + rnd() * (h - 30))}" width="5" height="7" fill="#ffcf8a" opacity=".6"/>`;
      if(rnd() < .38){ const sx = x + w * .35, sh = h + 70 + rnd() * 90;
        s += `<rect x="${f1(sx)}" y="${f1(580 - sh)}" width="16" height="${f1(sh)}" fill="#7d4570"/><rect x="${f1(sx)}" y="${f1(590 - sh)}" width="16" height="8" fill="#d06a7a"/><rect x="${f1(sx)}" y="${f1(610 - sh)}" width="16" height="8" fill="#d06a7a"/>`
          + `<circle cx="${f1(sx + 8)}" cy="${f1(576 - sh)}" r="3" fill="#ff4a4a"><animate attributeName="opacity" values="1;.1;1" dur="${(1.5 + rnd()).toFixed(1)}s" repeatCount="indefinite"/></circle>` + smoke(f1(sx + 8), f1(578 - sh), "#c999b4", 3, 160, 7 + rnd() * 3); }
      x += w + rnd() * 26;
    }
    return s;
  }
  function midLayer(){
    seed = 29; let s = "", x = -60;
    while(x < W){
      const w = 140 + rnd() * 160, h = 150 + rnd() * 140, top = 600 - h;
      s += `<rect x="${f1(x)}" y="${f1(top)}" width="${f1(w)}" height="${f1(h + 40)}" fill="#5c2c4a"/>`;
      if(rnd() < .5){ let p = `M${f1(x)} ${f1(top)}`; for(let i = 0; i < 4; i++) p += ` L${f1(x + w * (i + .7) / 4)} ${f1(top - 26)} L${f1(x + w * (i + 1) / 4)} ${f1(top)}`; s += `<path d="${p} Z" fill="#5c2c4a"/>`; }
      for(let r = 0; r < 3; r++) for(let c = 0; c < Math.floor(w / 40); c++) if(rnd() < .45) s += `<rect x="${f1(x + 14 + c * 40)}" y="${f1(top + 24 + r * 40)}" width="18" height="14" fill="#ffb36b" opacity="${(.5 + rnd() * .4).toFixed(2)}"/>`;
      if(rnd() < .3){ const tx = x + w * .6; s += `<path d="M${f1(tx - 18)} ${f1(top)} L${f1(tx - 12)} ${f1(top - 50)} M${f1(tx + 18)} ${f1(top)} L${f1(tx + 12)} ${f1(top - 50)}" stroke="#4a2240" stroke-width="5"/><rect x="${f1(tx - 26)}" y="${f1(top - 90)}" width="52" height="42" rx="6" fill="#4a2240"/><path d="M${f1(tx - 28)} ${f1(top - 90)} L${f1(tx)} ${f1(top - 112)} L${f1(tx + 28)} ${f1(top - 90)} Z" fill="#4a2240"/>`; }
      x += w + 10 + rnd() * 40;
    }
    // a neon billboard
    s += `<g transform="translate(1120 250)"><rect x="0" y="0" width="230" height="70" rx="8" fill="#2a1630" stroke="#120a18" stroke-width="4"/><path d="M40 70 V140 M190 70 V140" stroke="#2a1630" stroke-width="8"/>`
      + `<text x="115" y="46" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="30" fill="#ff6fa3" filter="url(#glow)">ROCK ON<animate attributeName="opacity" values="1;1;.3;1;1;.5;1" dur="4s" repeatCount="indefinite"/></text></g>`;
    // a big gantry crane far off
    s += `<g fill="none" stroke="#4a2240" stroke-width="6"><path d="M2350 600 V170 M2400 600 V170 M2350 170 H2720 M2350 200 H2720 M2350 600 L2400 520 L2350 440 L2400 360 L2350 280 L2400 200"/></g><path d="M2650 200 V300" stroke="#4a2240" stroke-width="3"/>`;
    return s;
  }
  function mainLayer(){
    let s = "";
    // ---- ground
    s += `<rect x="-100" y="620" width="${W + 200}" height="140" fill="#3b3240"/><path d="M-100 620 H${W + 100}" stroke="${INK}" stroke-width="4"/><path d="M-100 624 H${W + 100}" stroke="#5a4c5a" stroke-width="3"/>`;
    for(let x = 20; x < W; x += 110) s += `<rect x="${x}" y="672" width="46" height="7" rx="2" fill="#c9a64a" opacity=".55"/>`;
    [[560, 650, 46], [1350, 662, 60], [1990, 652, 40], [2860, 660, 54]].forEach(([x, y, r]) => { s += `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="8" fill="#7a4a6e" opacity=".7"/><path d="M${x - r * .5} ${y - 2} H${x + r * .3}" stroke="#ffb07a" stroke-width="2" opacity=".6"/>`; });
    // ---- warehouse + loading dock (Q1)
    s += box(30, 250, 460, 300, "#a4523f") + `<rect x="30" y="250" width="460" height="300" fill="url(#brick)"/>` + box(18, 236, 484, 20, "#7a3a30");
    s += box(170, 330, 190, 212, "#c9c0b0"); for(let y = 340; y < 540; y += 11) s += `<path d="M172 ${y} H358" stroke="#a39a8c" stroke-width="2"/>`;
    s += box(140, 266, 250, 46, "#2e3a4a") + `<text x="265" y="300" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="30" fill="#ffc42b" letter-spacing="3">RUST ROW</text>`;
    s += box(56, 300, 64, 42, "#ffcf6b") + `<path d="M88 300 V342 M56 321 H120" stroke="${INK}" stroke-width="3"/>` + box(400, 300, 64, 42, "#ffcf6b") + `<path d="M432 300 V342 M400 321 H464" stroke="${INK}" stroke-width="3"/>`;
    s += `<path d="M265 322 l-14 0" stroke="${INK}" stroke-width="3"/><ellipse cx="265" cy="380" rx="90" ry="60" fill="url(#gLamp)"/>`;
    s += box(80, 540, 340, 80, "#9a8f86") + `<rect x="80" y="540" width="340" height="10" fill="url(#haz)" stroke="${INK}" stroke-width="3"/>`;
    [116, 236, 356].forEach(x => { s += `<rect x="${x}" y="562" width="18" height="34" rx="4" fill="${INK}"/>`; });
    s += box(92, 498, 42, 42, "#c08a4a") + `<path d="M92 498 L134 540 M134 498 L92 540" stroke="${INK}" stroke-width="2.5"/>` + box(100, 470, 30, 28, "#c08a4a");
    // ---- chain-link fence, barrier, cones
    s += `<rect x="440" y="520" width="420" height="100" fill="url(#chain)" opacity=".7"/>`; for(let x = 440; x <= 860; x += 70) s += `<path d="M${x} 516 V620" stroke="#6d6a70" stroke-width="6"/>`; s += `<path d="M440 520 H860" stroke="#6d6a70" stroke-width="4"/>`;
    s += `<path d="M628 620 L640 592 L642 570 L682 570 L684 592 L696 620 Z" fill="url(#haz)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
    [770, 800].forEach(x => { s += `<path d="M${x - 12} 620 L${x} 588 L${x + 12} 620 Z" fill="#ff8a1c" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M${x - 6} 606 H${x + 6}" stroke="#fff" stroke-width="4"/>`; });
    // ---- containers (Q2)
    s += box(860, 520, 300, 100, "#c9483b"); for(let x = 872; x < 1155; x += 12) s += `<path d="M${x} 526 V614" stroke="#a33a2f" stroke-width="3"/>`;
    s += box(980, 420, 180, 100, "#3f7fbf"); for(let x = 992; x < 1155; x += 12) s += `<path d="M${x} 426 V514" stroke="#326aa3" stroke-width="3"/>`;
    s += `<text x="1070" y="485" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="34" fill="#fff" opacity=".85">FMA</text><text x="1010" y="590" font-family="Nunito" font-weight="900" font-size="18" fill="#fff" opacity=".7">RIFF LOGISTICS</text>`;
    // ---- scaffold with the swing bar
    const pipe = (a, b, w) => pl([a, b], INK, (w || 8) + 5) + pl([a, b], "#e8b23a", w || 8);
    s += pipe([1240, 290], [1240, 620]) + pipe([1340, 290], [1340, 620]) + pipe([1230, 470], [1350, 470]) + pipe([1244, 474], [1336, 614], 6) + pipe([1222, 300], [1358, 300]);
    s += `<rect x="1230" y="612" width="22" height="8" fill="${INK}"/><rect x="1330" y="612" width="22" height="8" fill="${INK}"/>`;
    // ---- crane (bonus node hangs from it)
    s += `<g stroke="${INK}" stroke-width="3" fill="none"><path d="M1960 620 V70 M1992 620 V70"/>`; for(let y = 620; y > 80; y -= 34) s += `<path d="M1960 ${y} L1992 ${y - 34} M1960 ${y - 34} H1992"/>`; s += `</g>`;
    s += `<rect x="1956" y="70" width="40" height="550" fill="#e8b23a" opacity=".35"/>` + box(1640, 62, 740, 20, "#e8b23a");
    for(let x = 1650; x < 2370; x += 26) s += `<path d="M${x} 66 L${x + 13} 78 L${x + 26} 66" stroke="${INK}" stroke-width="2" fill="none"/>`;
    s += box(1946, 84, 60, 44, "#e8b23a") + box(1956, 92, 22, 18, "#bfe8ff") + box(2300, 82, 70, 44, "#5d6670") + `<path d="M1905 82 V206" stroke="${INK}" stroke-width="3"/><path d="M1898 206 h14 v8 q0 12 -10 12 q-8 0 -8 -8" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
    s += `<circle cx="1976" cy="56" r="5" fill="#ff3b3b" stroke="${INK}" stroke-width="2"><animate attributeName="opacity" values="1;.2;1" dur="1.2s" repeatCount="indefinite"/></circle>`;
    // ---- catwalk (Q3)
    s += pl([[1430, 318], [1820, 318]], INK, 8) + pl([[1430, 318], [1820, 318]], "#8d96a0", 4) + pl([[1430, 340], [1820, 340]], "#6d7680", 3);
    for(let x = 1434; x <= 1820; x += 48) s += pl([[x, 318], [x, 360]], INK, 4);
    [1445, 1630, 1800].forEach(x => { s += box(x, 396, 14, 224, "#5d6670"); });
    s += box(1425, 360, 400, 12, "#5d6670"); let z = "M1425 372"; for(let x = 1425; x < 1825; x += 25) z += ` L${x + 12.5} 394 L${x + 25} 372`; s += `<path d="${z}" fill="none" stroke="${INK}" stroke-width="3"/>` + box(1425, 392, 400, 6, "#5d6670");
    s += box(1692, 344, 16, 16, "#5d6670") + smoke(1700, 340, "#f4eee6", 3, 90, 3);
    s += pl([[1520, 318], [1520, 270]], INK, 4) + `<path d="M1508 270 h24 l-4 10 h-16 z" fill="#3a3a3d" stroke="${INK}" stroke-width="2.5"/><polygon points="1512,280 1528,280 1570,360 1470,360" fill="#ffe9a8" opacity=".18"/>`;
    // ---- the pipeworks and the low pipe you slide under
    s += pl([[1840, 440], [2445, 440]], INK, 34) + pl([[1840, 440], [2445, 440]], "#3e8f8a", 28);
    [1880, 2010, 2140, 2270, 2400].forEach(x => { s += box(x - 5, 422, 10, 36, "#2e6f6a"); });
    s += pl([[2100, 440], [2100, 522], [2182, 522], [2182, 440]], INK, 26) + pl([[2100, 440], [2100, 522], [2182, 522], [2182, 440]], "#4fa59f", 20);
    s += `<circle cx="2141" cy="522" r="11" fill="#c9483b" stroke="${INK}" stroke-width="3"/><path d="M2133 522 h16 M2141 514 v16" stroke="${INK}" stroke-width="3"/>`;
    s += pl([[2010, 440], [2010, 620]], INK, 22) + pl([[2010, 440], [2010, 620]], "#3e8f8a", 16);
    // ---- sewer grate (Q4)
    s += `<ellipse cx="2300" cy="606" rx="90" ry="54" fill="url(#gToxic)"><animate attributeName="opacity" values=".6;1;.6" dur="2.4s" repeatCount="indefinite"/></ellipse>`;
    s += `<rect x="2258" y="614" width="84" height="12" rx="3" fill="#121012" stroke="${INK}" stroke-width="3"/>`; for(let x = 2266; x < 2340; x += 10) s += `<path d="M${x} 616 V624" stroke="#7dff6a" stroke-width="3" opacity=".8"/>`;
    for(let i = 0; i < 5; i++){ const x = 2270 + i * 15, b = (-i * .9).toFixed(1); s += `<circle cx="${x}" cy="610" r="6" fill="#8dff6a"><animate attributeName="cy" values="612;500" dur="4.5s" begin="${b}s" repeatCount="indefinite"/><animate attributeName="r" values="4;20" dur="4.5s" begin="${b}s" repeatCount="indefinite"/><animate attributeName="opacity" values=".6;0" dur="4.5s" begin="${b}s" repeatCount="indefinite"/></circle>`; }
    [2372, 2410].forEach((x, i) => { s += box(x, 572 - i * 4, 34, 48 + i * 4, "#6fbf3f") + `<path d="M${x} ${588 - i * 4} h34 M${x} ${606} h34" stroke="${INK}" stroke-width="2.5"/><text x="${x + 17}" y="${602}" text-anchor="middle" font-size="14" fill="${INK}">☣</text>`; });
    s += `<ellipse cx="2380" cy="636" rx="40" ry="6" fill="#7dff6a" opacity=".45"/>`;
    // ---- the building, its ladder and roof (Q5)
    s += box(2460, 300, 320, 320, "#8c4a3a") + `<rect x="2460" y="300" width="320" height="320" fill="url(#brick)"/>` + box(2452, 290, 336, 14, "#6e3a2e");
    [[2560, 330], [2640, 330], [2720, 330], [2560, 470], [2720, 470]].forEach(([x, y], i) => { s += box(x - 22, y, 44, 56, i % 3 === 1 ? "#3a2e3e" : "#ffcf6b") + `<path d="M${x} ${y} V${y + 56} M${x - 22} ${y + 28} H${x + 22}" stroke="${INK}" stroke-width="3"/>`; });
    s += `<text x="2640" y="440" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="28" fill="#ff6fa3" filter="url(#glow)">FORBES MUSIC<animate attributeName="opacity" values="1;1;1;.4;1;.7;1" dur="3.3s" repeatCount="indefinite"/></text>`;
    s += pl([[2461, 268], [2461, 620]], INK, 8) + pl([[2461, 268], [2461, 620]], "#9aa3ad", 4) + pl([[2519, 268], [2519, 620]], INK, 8) + pl([[2519, 268], [2519, 620]], "#9aa3ad", 4);
    for(let y = 600; y > 270; y -= 30) s += pl([[2461, y], [2519, y]], INK, 4);
    s += `<path d="M2700 300 L2706 214 M2760 300 L2754 214 M2700 300 L2760 240 M2760 300 L2700 240" stroke="${INK}" stroke-width="4"/>` + box(2688, 158, 84, 60, "#7a5b45", `rx="10"`) + `<path d="M2684 160 L2730 128 L2776 160 Z" fill="#5e4535" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M2690 182 H2770 M2690 200 H2770" stroke="${INK}" stroke-width="2"/>`;
    s += box(2566, 276, 42, 24, "#9aa3ad") + `<circle cx="2587" cy="288" r="7" fill="none" stroke="${INK}" stroke-width="2"/>`;
    // ---- the boss factory (Q6)
    s += `<path d="M2860 620 V260 L2920 220 V260 L2980 220 V260 L3040 220 V260 L3100 220 V260 L3160 220 V260 L3220 220 V260 L3280 220 V260 L3330 240 V620 Z" fill="#4a3045" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
    [2905, 3230].forEach(x => { s += box(x, 110, 30, 150, "#5c3a50") + `<rect x="${x}" y="126" width="30" height="10" fill="#d06a7a"/><rect x="${x}" y="152" width="30" height="10" fill="#d06a7a"/>` + smoke(x + 15, 106, "#6a5a6a", 4, 170, 6); });
    s += `<ellipse cx="3180" cy="620" rx="190" ry="70" fill="url(#gBoss)"/>`;
    s += box(3075, 390, 210, 230, "url(#grille)") + box(3075, 390, 210, 44, "#d8c9a8");
    [3098, 3126, 3154, 3182, 3210, 3238, 3264].forEach(x => { s += `<circle cx="${x}" cy="412" r="8" fill="${INK}"/><path d="M${x} 412 l4 -5" stroke="#fff" stroke-width="2"/>`; });
    s += `<g filter="url(#glow)"><path d="M3112 470 L3160 488 L3112 496 Z M3248 470 L3200 488 L3248 496 Z" fill="#ff3b3b"><animate attributeName="opacity" values=".6;1;.6" dur="1.6s" repeatCount="indefinite"/></path></g>`;
    s += `<path d="M3120 560 L3140 545 L3160 560 L3180 545 L3200 560 L3220 545 L3240 560" fill="none" stroke="#ff3b3b" stroke-width="4" opacity=".8"/>`;
    s += `<path d="M3075 440 L3285 600 M3285 440 L3075 600" stroke="#9aa3ad" stroke-width="6" stroke-dasharray="10 5"/>` + box(3164, 500, 32, 30, "#ffc42b", `rx="4"`) + `<path d="M3170 500 v-10 a10 10 0 0 1 20 0 v10" fill="none" stroke="${INK}" stroke-width="4"/>`;
    s += `<rect x="2860" y="540" width="215" height="80" fill="url(#chain)" opacity=".7"/><path d="M2860 540 H3075" stroke="#6d6a70" stroke-width="4"/>`;
    return s;
  }
  function people(){
    return npc(301, 140, 540, { pose: "wave", phone: false, bob: false, cfg: { acc: "hardhat", top: "hivis" } }) + npc(302, 1480, 360, { pose: "cheer", bob: 6, cfg: { acc: "hardhat", top: "hivis" } })
      + npc(303, 2440, 620, { pose: "thumbs", phone: false, bob: false, cfg: { eyewear: "gasmask", top: "hivis" } }) + npc(304, 1370, 620, { pose: "cheer", bob: 7, cfg: { acc: "cap" } });
  }
  function foreLayer(){
    let s = "";
    [380, 1150, 1900, 2700, 3500].forEach((x, i) => { const len = 50 + (i % 3) * 30; s += `<path d="M${x} -10 V${len}" stroke="#1a1220" stroke-width="5" stroke-dasharray="9 4"/><path d="M${x - 6} ${len} q6 14 12 0" stroke="#1a1220" stroke-width="5" fill="none"/>`; });
    [[600, 1100], [2100, 2600], [3300, 3900]].forEach(([a, b]) => { s += `<rect x="${a}" y="-10" width="${b - a}" height="30" fill="#1a1220"/><rect x="${a + 40}" y="16" width="16" height="22" fill="#1a1220"/><rect x="${b - 60}" y="16" width="16" height="22" fill="#1a1220"/>`; });
    for(let x = 100; x < 4000; x += 260) s += `<path d="M${x} 724 q4 -26 8 0 q6 -34 12 0 q4 -20 8 0 Z" fill="#1a1220"/>`;
    return s;
  }
  
  return {
    id: "rustrow", name: "Rust Row", icon: "🏭", blurb: "Parkour across an old industrial district: vaults, flips, bar swings and ladders.",
    W, ground: 620, legacy: "fma-rustrow-v1",
    parallax: { "L-sun": .06, "L-far": .22, "L-mid": .5, "L-fore": 1.3 },
    layers: () => ({ sky: skyLayer(), sun: sunLayer(), far: farLayer(), mid: midLayer(), main: mainLayer() + people(), fore: foreLayer() }),
  platforms: [{ a: -100, b: W + 100, y: 620 }, { a: 80, b: 420, y: 540 }, { a: 630, b: 694, y: 570 }, { a: 860, b: 1160, y: 520 }, { a: 980, b: 1160, y: 420 },
  { a: 1425, b: 1825, y: 360 }, { a: 2452, b: 2788, y: 300 }],
  nodes: [
  { id: "q1", x: 250, g: 540, hx: 250, hy: 292, icon: "🎛️", name: "Tune Up!", url: "tuner.html", lane: "Notes", game: "Tuning Race", spot: "Loading Dock 3", loot: ["hat"] },
  { id: "q2", x: 1060, g: 420, hx: 1070, hy: 160, icon: "🎯", name: "Six Strings, Six Names", url: "quiz.html", lane: "Notes", game: "Note Quiz · level 1 · 5 questions", spot: "the container yard", loot: ["vest"] },
  { id: "q3", x: 1600, g: 360, hx: 1600, hy: 122, icon: "📜", name: "First Riff", url: "songs.html", lane: "Riffs & TAB", game: "Songs · a Beginner riff", spot: "the high catwalk", loot: ["goggles"] },
  { id: "q4", x: 2300, g: 620, hx: 2300, hy: 340, icon: "🎸", name: "Two-Chord Friends", url: "chords.html", lane: "Chords", game: "Chords · Em + Am", spot: "the stinky sewer grate", loot: ["mask", "strap"], choice: "r" },
  { id: "q5", x: 2640, g: 300, hx: 2640, hy: 72, icon: "⚡", name: "Open String Speed Round", url: "quiz.html", lane: "Notes", game: "Note Quiz · level 1 · 10 questions", spot: "the factory rooftop", loot: ["gloves"], choice: "r" },
  { id: "q6", x: 3030, g: 620, hx: 3180, hy: 290, icon: "🔊", name: "The Grumpy Amp", url: "boss.html", lane: "Gate boss", game: "Boss Battle · Zombie (Em C G D) · slow · root notes", spot: "the factory gate", loot: ["rust"], boss: true }
],
    moments: {
      // letting go of the bar: time slows for the flyaway, the workers whip out their phones
      flyaway(M){ M.slow(.25, 1900); M.phones(true); M.polaroidsAt([1360], ["BIG AIR!! 🏗️"]); M.after(2600, () => M.phones(false)); M.after(3600, () => M.clearPolaroids()); }
    },
    polaroidBack: (cx, cy) => `<rect x="${cx - 200}" y="${cy - 200}" width="400" height="400" fill="#e0705a"/><circle cx="${cx - 40}" cy="${cy + 30}" r="70" fill="#ffd99a" opacity=".8"/>`,
    extras: [{ hx: 1905, hy: 248, icon: "❓", name: "Crane Hook", msg: "❓ Crane Hook: a side quest, coming soon" }],
    edges: [
    { from: "q1", to: "q2", route: () => [run(250, 400, 540, { start: 1 }), jump(400, 540, 500, 620, { apex: 26 }), run(514, 565, 620), kong(565, 620, 640, 570, 44), run(746, 785, 620),
    ledge(785, 620, 860, 520), run(896, 915, 520), jump(915, 520, 1010, 420, { flips: 1, apex: 64 }), run(1024, 1036, 420), stop(1036, 420)] },
    { from: "q2", to: "q3", route: () => [run(1060, 1130, 420, { start: 1 }), Object.assign(barSwing(1130, 420, 1290, 300, 1490, 360), { fx: [{ u: .25, k: "clang" }, { u: .7, k: "moment", name: "flyaway" }, { u: .93, k: "dust" }] }), run(1498, 1576, 360, { start: 1 }), stop(1576, 360)] },
    { from: "q3", to: "q4", route: () => [run(1600, 1790, 360, { start: 1 }), dropRoll(1790, 360, 1900, 620), run(2024, 2034, 620), slide(2034, 620, 2238), run(2238, 2276, 620), stop(2276, 620)] },
    // a choice: the sewer grate or the rooftop, and either one leads on to the boss
    { from: "q3", to: "q5", route: () => [run(1600, 1790, 360, { start: 1 }), dropRoll(1790, 360, 1900, 620), run(2024, 2034, 620), slide(2034, 620, 2238), run(2238, 2466, 620), stop(2466, 620), ladder(2490, 620, 300), jump(2490, 300, 2550, 300, { apex: 22, fromStand: 1 }), run(2564, 2616, 300), stop(2616, 300)] },
    { from: "q4", to: "q6", route: () => [run(2300, 3006, 620, { start: 1 }), stop(3006, 620)] },
    { from: "q5", to: "q6", route: () => [run(2640, 2750, 300, { start: 1 }), dropRoll(2750, 300, 2850, 620), run(2974, 3006, 620), stop(3006, 620)] }
    ]
  };
})());
