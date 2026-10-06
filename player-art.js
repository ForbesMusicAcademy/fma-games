/* "Your character": a customisable, animated vector player used across the Forbes Music Academy practice games.
   A character is a small config, saved on the student's device (localStorage), drawn as SVG from swappable parts:
     { name, body, color, accent, hair, hairColor, eyes, mouth, acc }
   Player.get() / Player.set(cfg) / Player.random()          the saved character (a random one the first time)
   PlayerArt(container, cfg)  -> animated controller:  setDamage(0..1), hurt(), attack(dir), cheer(), ko(), reset()
   PlayerArt.svg(cfg)         -> plain SVG string (menus, thumbnails)
   PlayerArt.options          -> the lists the editor offers (bodies, hair, eyes, mouths, accessories, palettes) */
(function(){
  const NS = "http://www.w3.org/2000/svg";
  const INK = "#1d1d1b";
  const ST = `stroke="${INK}" stroke-linejoin="round" stroke-linecap="round"`;
  const sw = w => `${ST} stroke-width="${w}"`;

  const PALETTE = ["#e8588e", "#d7262f", "#ff8a1c", "#ffb805", "#5db35c", "#5fc4b0", "#2ca2ff", "#3d6dea", "#8a5ad6", "#f3f2ee", "#8b5a2b", "#2a2a2c"];
  const HAIR_COLORS = ["#2a2a2c", "#5b3a1e", "#c8761f", "#ffd34d", "#d7262f", "#e8588e", "#2ca2ff", "#8a5ad6", "#5db35c", "#f3f2ee"];
  const OPTIONS = {
    bodies: [["pick", "Pick"], ["amp", "Amp"], ["drum", "Drum"], ["metro", "Metronome"]],
    hair: [["none", "None"], ["short", "Short"], ["spiky", "Spiky"], ["mohawk", "Mohawk"], ["afro", "Afro"], ["long", "Long"], ["pony", "Ponytail"]],
    eyes: [["round", "Round"], ["happy", "Happy"], ["sleepy", "Sleepy"], ["angry", "Angry"], ["wide", "Googly"], ["star", "Starry"]],
    mouths: [["smile", "Smile"], ["grin", "Grin"], ["tongue", "Tongue"], ["oh", "Wow"], ["smirk", "Smirk"], ["fangs", "Fangs"]],
    acc: [["none", "None"], ["glasses", "Glasses"], ["shades", "Shades"], ["cap", "Cap"], ["beanie", "Beanie"], ["phones", "Headphones"], ["band", "Headband"], ["bow", "Bow tie"], ["cape", "Cape"], ["crown", "Crown"]],
    palette: PALETTE, hairColors: HAIR_COLORS
  };

  /* ---- bodies: shape, face positions and where things attach ---- */
  const BODIES = {
    pick: {
      eyes: [[172, 152], [228, 152]], mouth: 204, nameY: 252, shoulders: [[106, 208], [294, 208]], legs: [[182, 306], [220, 304]], top: [200, 78, 100], half: 98, bowY: 280,
      path: "M200 318 C158 306 104 236 100 158 C97 100 138 76 200 76 C262 76 303 100 300 158 C296 236 242 306 200 318Z",
      draw: (c) => `<path d="M200 318 C158 306 104 236 100 158 C97 100 138 76 200 76 C262 76 303 100 300 158 C296 236 242 306 200 318Z" fill="${c}" ${sw(5)}/><path d="M124 120 C132 98 150 88 170 86" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="7" stroke-linecap="round"/>`,
      cracks: ["M146 118 L162 136 L150 152 L168 170", "M262 104 L248 128 L266 144 L252 166"], band: [246, 238]
    },
    amp: {
      eyes: [[166, 176], [234, 176]], mouth: 230, nameY: 285, shoulders: [[90, 206], [310, 206]], legs: [[160, 292], [240, 292]], top: [200, 106, 190], half: 114, bowY: 276,
      path: "M114 104 H286 Q312 104 312 130 V270 Q312 294 288 294 H112 Q88 294 88 270 V130 Q88 104 114 104Z",
      draw: (c) => `<path d="M168 106 Q200 70 232 106" fill="none" ${sw(9)}/><path d="M114 104 H286 Q312 104 312 130 V270 Q312 294 288 294 H112 Q88 294 88 270 V130 Q88 104 114 104Z" fill="${c}" ${sw(5)}/>
        <rect x="104" y="116" width="192" height="26" rx="10" fill="#fff" fill-opacity=".28"/><circle cx="128" cy="129" r="7" fill="${INK}"/><circle cx="154" cy="129" r="7" fill="${INK}"/><circle cx="180" cy="129" r="7" fill="${INK}"/><rect x="214" y="123" width="66" height="12" rx="6" fill="${INK}" opacity=".55"/>
        <rect x="104" y="152" width="192" height="128" rx="16" fill="#fff" fill-opacity=".22" stroke="${INK}" stroke-opacity=".35" stroke-width="3"/>`,
      cracks: ["M120 154 L138 172 L124 190 L146 208", "M280 152 L264 176 L284 194"], band: [270, 262]
    },
    drum: {
      eyes: [[168, 196], [232, 196]], mouth: 240, nameY: 289, shoulders: [[92, 214], [308, 214]], legs: [[160, 292], [240, 292]], top: [200, 134, 190], half: 110, bowY: 270,
      path: "M92 136 V278 Q200 308 308 278 V136 Q200 112 92 136Z",
      draw: (c) => `<path d="M92 136 V278 Q200 308 308 278 V136Z" fill="${c}" ${sw(5)}/>
        <path d="M92 252 Q200 282 308 252" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="12"/>
        <path d="M108 150 L124 270 L140 152 L156 276 L172 156 M228 156 L244 276 L260 152 L276 270 L292 150" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="4" stroke-linejoin="round"/>
        <ellipse cx="200" cy="136" rx="108" ry="26" fill="#f7f6f2" ${sw(5)}/><ellipse cx="200" cy="136" rx="92" ry="19" fill="none" stroke="${INK}" stroke-opacity=".25" stroke-width="3"/>`,
      cracks: ["M128 170 L146 188 L132 206 L152 224", "M274 168 L258 192 L278 210"], band: [262, 250]
    },
    metro: {
      eyes: [[172, 172], [228, 172]], mouth: 226, nameY: 268, shoulders: [[120, 236], [280, 236]], legs: [[162, 298], [238, 298]], top: [200, 92, 100], half: 66, bowY: 270,
      path: "M158 92 H242 Q256 92 260 108 L304 282 Q308 300 290 300 H110 Q92 300 96 282 L140 108 Q144 92 158 92Z",
      draw: (c) => `<g class="pa-pend"><rect x="194" y="26" width="12" height="104" rx="6" fill="#d9b97a" ${sw(3)}/><rect x="186" y="52" width="28" height="20" rx="5" fill="#ffb805" ${sw(3)}/></g>
        <path d="M158 92 H242 Q256 92 260 108 L304 282 Q308 300 290 300 H110 Q92 300 96 282 L140 108 Q144 92 158 92Z" fill="${c}" ${sw(5)}/>
        <path d="M168 104 L150 292 M232 104 L250 292" stroke="#fff" stroke-opacity=".25" stroke-width="6" fill="none"/>`,
      cracks: ["M164 120 L180 142 L166 160 L184 180", "M246 140 L232 164 L250 182"], band: [250, 250]
    }
  };

  /* ---- faces ---- */
  function eyesSvg(style, e){
    const [[lx, ly], [rx, ry]] = e;
    const one = (x, y) => {
      switch(style){
        case "happy": return `<path d="M${x - 14} ${y + 6} Q${x} ${y - 14} ${x + 14} ${y + 6}" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
        case "sleepy": return `<circle cx="${x}" cy="${y}" r="17" fill="#fff" ${sw(3.5)}/><circle cx="${x}" cy="${y + 4}" r="7" fill="${INK}"/><path d="M${x - 18} ${y - 2} H${x + 18} V${y - 18} A18 18 0 0 0 ${x - 18} ${y - 2}Z" fill="${INK}" fill-opacity=".18" ${sw(3.5)}/>`;
        case "angry": return `<circle cx="${x}" cy="${y + 2}" r="16" fill="#fff" ${sw(3.5)}/><circle cx="${x}" cy="${y + 5}" r="7" fill="${INK}"/><path d="M${x + (x < 200 ? -20 : 20)} ${y - 18} L${x + (x < 200 ? 18 : -18)} ${y - 6}" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>`;
        case "wide": return `<circle cx="${x}" cy="${y}" r="24" fill="#fff" ${sw(4)}/><circle cx="${x + (x < 200 ? 6 : -6)}" cy="${y + 5}" r="10" fill="${INK}"/><circle cx="${x + (x < 200 ? 2 : -10)}" cy="${y}" r="4" fill="#fff"/>`;
        case "star": return `<circle cx="${x}" cy="${y}" r="20" fill="#fff" ${sw(3.5)}/><path d="${star(x, y, 15, 7)}" fill="#ffb805" ${sw(2.4)}/>`;
        default: return `<circle cx="${x}" cy="${y}" r="19" fill="#fff" ${sw(3.5)}/><circle cx="${x + (x < 200 ? 3 : -3)}" cy="${y + 2}" r="9" fill="${INK}"/><circle cx="${x + (x < 200 ? -1 : -7)}" cy="${y - 2}" r="3" fill="#fff"/>`;
      }
    };
    return one(lx, ly) + one(rx, ry);
  }
  function mouthSvg(style, y){
    switch(style){
      case "grin": return `<path d="M164 ${y - 8} Q200 ${y + 4} 236 ${y - 8} Q232 ${y + 28} 200 ${y + 30} Q168 ${y + 28} 164 ${y - 8}Z" fill="#fff" ${sw(4)}/><path d="M170 ${y + 8} H230 M200 ${y - 2} V${y + 30}" stroke="${INK}" stroke-width="2" fill="none"/>`;
      case "tongue": return `<path d="M170 ${y - 4} Q200 ${y + 22} 230 ${y - 4}" fill="#5a1d1d" ${sw(4)}/><path d="M184 ${y + 10} Q200 ${y + 40} 216 ${y + 10} Q200 ${y + 18} 184 ${y + 10}Z" fill="#ff6b8b" ${sw(3)}/>`;
      case "oh": return `<ellipse cx="200" cy="${y + 8}" rx="14" ry="18" fill="#5a1d1d" ${sw(4)}/><ellipse cx="200" cy="${y + 16}" rx="8" ry="6" fill="#ff6b8b"/>`;
      case "smirk": return `<path d="M176 ${y + 6} Q206 ${y + 18} 232 ${y - 6}" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
      case "fangs": return `<path d="M168 ${y - 6} Q200 ${y + 18} 232 ${y - 6}" fill="#fff" ${sw(4)}/><path d="M176 ${y} L182 ${y + 14} L190 ${y + 6} M224 ${y} L218 ${y + 14} L210 ${y + 6}" fill="#fff" ${sw(2.6)}/>`;
      default: return `<path d="M172 ${y - 4} Q200 ${y + 22} 228 ${y - 4}" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
    }
  }
  function star(cx, cy, r1, r2){
    let d = ""; for(let i = 0; i < 10; i++){ const a = -Math.PI / 2 + Math.PI * i / 5, r = i % 2 ? r2 : r1; d += (i ? "L" : "M") + (cx + r * Math.cos(a)).toFixed(1) + " " + (cy + r * Math.sin(a)).toFixed(1); }
    return d + "Z";
  }

  /* ---- hair (drawn for a top edge 140 wide centred on 0,0, extending up; scaled to the body) ---- */
  function hairSvg(style, color, top, half){
    if(style === "none") return { back: "", front: "" };
    const [tx, ty, tw] = top, s = Math.max(0.7, tw / 140), h = c => `fill="${color}" ${sw(4)}`;
    const T = body => `<g transform="translate(${tx} ${ty}) scale(${s.toFixed(2)})">${body}</g>`;
    switch(style){
      case "mohawk": return { back: "", front: T(`<path d="M-30 6 L-24 -34 L-12 -6 L-4 -48 L6 -6 L16 -42 L24 -4 L32 -30 L34 8 Q0 -6 -30 6Z" ${h()}/>`) };
      case "spiky": return { back: "", front: T(`<path d="M-62 14 L-56 -22 L-40 0 L-30 -34 L-16 -4 L0 -42 L14 -4 L30 -34 L40 0 L56 -22 L62 14 Q0 -8 -62 14Z" ${h()}/>`) };
      case "afro": return { back: T(`<circle cx="-48" cy="-4" r="30" ${h()}/><circle cx="48" cy="-4" r="30" ${h()}/><circle cx="-30" cy="-30" r="34" ${h()}/><circle cx="30" cy="-30" r="34" ${h()}/><circle cx="0" cy="-42" r="38" ${h()}/>`), front: "" };
      case "short": return { back: "", front: T(`<path d="M-64 18 Q-70 -30 0 -34 Q70 -30 64 18 Q40 -2 10 8 Q-4 -6 -22 10 Q-44 -4 -64 18Z" ${h()}/>`) };
      case "long": { const hx = half + 4, y0 = ty + 14;     // strands hang down just outside the body
        const side = d => `<path d="M${200 + d * (hx - 6)} ${y0} Q${200 + d * (hx + 34)} ${y0 + 56} ${200 + d * (hx + 18)} ${y0 + 150} Q${200 + d * (hx - 6)} ${y0 + 160} ${200 + d * (hx - 12)} ${y0 + 110} Q${200 + d * (hx - 14)} ${y0 + 56} ${200 + d * (hx - 24)} ${y0 + 20}Z" ${h()}/>`;
        return { back: side(-1) + side(1), front: T(`<path d="M-64 18 Q-70 -30 0 -34 Q70 -30 64 18 Q40 -2 10 8 Q-4 -6 -22 10 Q-44 -4 -64 18Z" ${h()}/>`) }; }
      case "pony": return { back: T(`<path d="M52 -4 Q96 -14 92 36 Q88 66 70 84 Q76 46 60 30Z" ${h()}/><circle cx="54" cy="-2" r="7" fill="#ffb805" ${sw(3)}/>`), front: T(`<path d="M-64 18 Q-70 -30 0 -34 Q70 -30 64 18 Q40 -2 10 8 Q-4 -6 -22 10 Q-44 -4 -64 18Z" ${h()}/>`) };
    }
    return { back: "", front: "" };
  }

  /* ---- accessories ---- */
  function accSvg(kind, b, accent){
    const [tx, ty, tw] = b.top, s = Math.max(0.7, tw / 140), [[lx, ly], [rx, ry]] = b.eyes;
    const T = body => `<g transform="translate(${tx} ${ty}) scale(${s.toFixed(2)})">${body}</g>`;
    switch(kind){
      case "glasses": return { front: `<circle cx="${lx}" cy="${ly}" r="28" fill="none" stroke="${INK}" stroke-width="6"/><circle cx="${rx}" cy="${ry}" r="28" fill="none" stroke="${INK}" stroke-width="6"/><path d="M${lx + 28} ${ly} Q200 ${ly - 10} ${rx - 28} ${ry}" fill="none" stroke="${INK}" stroke-width="6"/>` };
      case "shades": return { front: `<rect x="${lx - 30}" y="${ly - 20}" width="60" height="38" rx="14" fill="${INK}"/><rect x="${rx - 30}" y="${ry - 20}" width="60" height="38" rx="14" fill="${INK}"/><path d="M${lx + 30} ${ly - 8} H${rx - 30}" stroke="${INK}" stroke-width="7"/><path d="M${lx - 20} ${ly - 12} l14 -2 M${rx - 20} ${ry - 12} l14 -2" stroke="#fff" stroke-opacity=".5" stroke-width="4" stroke-linecap="round"/>` };
      case "cap": return { front: T(`<path d="M-62 14 Q-64 -34 0 -38 Q64 -34 62 14Z" fill="${accent}" ${sw(4.5)}/><path d="M-8 8 Q40 -4 92 8 Q84 22 20 20Z" fill="${accent}" ${sw(4.5)}/><circle cx="0" cy="-38" r="5" fill="${INK}"/>`) };
      case "beanie": return { front: T(`<path d="M-64 18 Q-70 -36 0 -42 Q70 -36 64 18Z" fill="${accent}" ${sw(4.5)}/><rect x="-66" y="2" width="132" height="22" rx="10" fill="${accent}" ${sw(4.5)}/><path d="M-50 4 V22 M-30 4 V22 M-10 4 V22 M10 4 V22 M30 4 V22 M50 4 V22" stroke="${INK}" stroke-opacity=".35" stroke-width="2.5"/><circle cx="0" cy="-48" r="13" fill="#fff" ${sw(4)}/>`) };
      case "phones": return { front: T(`<path d="M-62 24 C-66 -50 66 -50 62 24" fill="none" ${sw(8)}/><rect x="-78" y="10" width="26" height="46" rx="12" fill="${accent}" ${sw(4.5)}/><rect x="52" y="10" width="26" height="46" rx="12" fill="${accent}" ${sw(4.5)}/>`) };
      case "band": return { front: T(`<path d="M-64 20 Q0 4 64 20 L62 36 Q0 20 -62 36Z" fill="${accent}" ${sw(4)}/><path d="M60 24 L92 6 L90 44Z" fill="${accent}" ${sw(3.5)}/>`) };
      case "bow": return { front: `<g transform="translate(200 ${b.bowY})"><path d="M0 0 L-34 -18 V18Z M0 0 L34 -18 V18Z" fill="${accent}" ${sw(4)}/><circle cx="0" cy="0" r="9" fill="${accent}" ${sw(4)}/></g>` };
      case "crown": return { front: T(`<path d="M-44 8 L-52 -30 L-26 -8 L0 -40 L26 -8 L52 -30 L44 8Z" fill="#ffc42b" ${sw(4.5)}/><circle cx="-52" cy="-30" r="5" fill="#d7262f"/><circle cx="0" cy="-40" r="5" fill="#2ca2ff"/><circle cx="52" cy="-30" r="5" fill="#d7262f"/>`) };
      case "cape": return { back: `<g class="pa-cape"><path d="M104 150 C70 220 56 300 52 372 C120 340 160 330 200 330 C240 330 280 340 348 372 C344 300 330 220 296 150Z" fill="${accent}" ${sw(4.5)}/><path d="M104 160 C90 220 80 290 76 350 C112 332 140 326 168 324 C150 270 140 210 150 160Z" fill="#000" fill-opacity=".14"/></g>`, front: "" };
    }
    return { front: "", back: "" };
  }

  /* ---- limbs ---- */
  const limb = d => `<path d="${d}" fill="none" ${ST} stroke-width="11"/>`;
  const mitten = (x, y, rot, c) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(1.15)"><rect x="-21" y="-16" width="42" height="36" rx="15" fill="${c}" ${sw(3.6)}/><path d="M-9 -14 V2 M2 -14 V2 M13 -12 V2" ${sw(2.6)} fill="none"/><ellipse cx="-20" cy="2" rx="8" ry="11" fill="${c}" ${sw(3.2)}/></g>`;
  const shoe = (c, x, y, flip) => `<g transform="translate(${x} ${y}) scale(${flip ? -1 : 1} 1)"><path d="M-30 0 C-34 -17 -10 -28 8 -24 C26 -20 38 -6 36 6 C34 15 -30 15 -30 0Z" fill="${c}" ${sw(4)}/><path d="M6 -22 C16 -12 22 -4 22 8" fill="none" ${sw(3)} opacity=".45"/></g>`;

  function build(cfg, anim){
    const b = BODIES[cfg.body] || BODIES.pick, col = cfg.color, ac = cfg.accent;
    const [[lsx, lsy], [rsx, rsy]] = b.shoulders, [[llx, lly], [rlx, rly]] = b.legs;
    const hair = hairSvg(cfg.hair, cfg.hairColor, b.top, b.half), acc = accSvg(cfg.acc, b, ac);
    const legs = limb(`M${llx} ${lly} C${llx - 4} ${lly + 26} ${llx - 12} ${lly + 44} ${llx - 14} 360`) + limb(`M${rlx} ${rly} C${rlx + 4} ${rly + 26} ${rlx + 12} ${rly + 44} ${rlx + 14} 360`);
    const feet = shoe(ac, llx - 18, 372, false) + shoe(ac, rlx + 18, 370, true);
    const lh = [lsx - 50, lsy + 34], rh = [rsx + 50, rsy + 34];
    const arms = `<g class="pa-arm l" style="transform-origin:${lsx}px ${lsy}px">${limb(`M${lsx} ${lsy} C${lsx - 28} ${lsy + 4} ${lsx - 50} ${lsy + 6} ${lh[0]} ${lh[1] - 8}`)}${mitten(lh[0], lh[1], -18, ac)}</g>` +
                 `<g class="pa-arm r" style="transform-origin:${rsx}px ${rsy}px">${limb(`M${rsx} ${rsy} C${rsx + 28} ${rsy + 4} ${rsx + 50} ${rsy + 6} ${rh[0]} ${rh[1] - 8}`)}${mitten(rh[0], rh[1], 18, ac)}</g>`;
    const nm = (cfg.name || "").trim().slice(0, 10);
    const name = nm ? `<text x="200" y="${b.nameY}" text-anchor="middle" font-family="'Nunito','Comic Sans MS',cursive" font-weight="900" font-size="${nm.length > 7 ? 19 : 23}" fill="${cfg.color === "#2a2a2c" || cfg.color === "#8b5a2b" || cfg.color === "#3d6dea" || cfg.color === "#d7262f" || cfg.color === "#8a5ad6" ? "#fff" : INK}" stroke="none">${nm.replace(/[<>&"]/g, "")}</text>` : "";
    const eyes = eyesSvg(cfg.eyes, b.eyes), mouth = mouthSvg(cfg.mouth, b.mouth);
    const dmg = anim ? `
      <g class="d1"><path d="${b.cracks[0]}" fill="none" stroke="${INK}" stroke-width="3.6" ${ST}/><ellipse cx="${b.band[0] + 6}" cy="${b.band[1] + 30}" rx="15" ry="8" fill="#000" opacity=".2"/></g>
      <g class="d2"><path d="${b.cracks[1]}" fill="none" stroke="${INK}" stroke-width="3.6" ${ST}/>
        <g transform="translate(${b.band[0]} ${b.band[1]}) rotate(-24)"><rect x="-20" y="-7" width="40" height="14" rx="4" fill="#f2cf9a" ${sw(2.2)}/><rect x="-8" y="-7" width="16" height="14" fill="#e5b97a"/></g></g>
      <g class="d2"><path class="pa-sweat" d="M${b.eyes[1][0] + 40} ${b.eyes[1][1] - 24} Q${b.eyes[1][0] + 48} ${b.eyes[1][1] - 8} ${b.eyes[1][0] + 40} ${b.eyes[1][1]} Q${b.eyes[1][0] + 32} ${b.eyes[1][1] - 8} ${b.eyes[1][0] + 40} ${b.eyes[1][1] - 24}Z" fill="#8ecae6" ${sw(2)}/></g>
      <g class="d3">${b.eyes.map(e => `<circle cx="${e[0]}" cy="${e[1]}" r="23" fill="#fff" ${sw(3)}/><path d="M${e[0]} ${e[1]} m0 0 a3 3 0 1 1 6 0 a7 7 0 1 1 -14 0 a11 11 0 1 1 22 0 a15 15 0 1 1 -30 0" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`).join("")}</g>
      <g class="dko">${b.eyes.map(e => `<circle cx="${e[0]}" cy="${e[1]}" r="23" fill="#fff" ${sw(3)}/><path d="M${e[0] - 12} ${e[1] - 12} L${e[0] + 12} ${e[1] + 12} M${e[0] + 12} ${e[1] - 12} L${e[0] - 12} ${e[1] + 12}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`).join("")}</g>
      <g class="dko pa-stars"><g transform="translate(200 ${Math.max(30, b.top[1] - 36)})"><path d="${star(0, 0, 11, 5)}" fill="#ffb805" ${sw(2.4)} transform="translate(-44 8)"/><path d="${star(0, 0, 13, 6)}" fill="#ffb805" ${sw(2.4)} transform="translate(0 -8)"/><path d="${star(0, 0, 11, 5)}" fill="#ffb805" ${sw(2.4)} transform="translate(44 8)"/></g></g>` : "";
    const flash = anim ? `<path class="pa-flash" d="${b.path}" fill="#ff3b3b"/>` : "";
    return `${acc.back || ""}${hair.back}${legs}${feet}${arms}<g class="pa-body">${b.draw(col)}${eyes}${mouth}${name}${dmg}</g>${flash}${hair.front}${acc.front || ""}`;
  }

  const css = `
.pa{width:100%;height:100%;display:block;overflow:visible}
.pa-hitg{transform-box:view-box;transform-origin:200px 380px}
.pa-all{transform-box:view-box;transform-origin:200px 380px;animation:pa-idle 2.6s ease-in-out infinite}
@keyframes pa-idle{0%,100%{transform:scale(1,1)}50%{transform:scale(1.012,.986) translateY(-2px)}}
.pa-arm{transform-box:view-box;animation:pa-sway 2.8s ease-in-out infinite}
.pa-arm.r{animation-direction:reverse}
@keyframes pa-sway{0%,100%{transform:rotate(0)}50%{transform:rotate(5deg)}}
.pa-cape{transform-box:view-box;transform-origin:200px 150px;animation:pa-cape 1.8s ease-in-out infinite}
@keyframes pa-cape{0%,100%{transform:skewX(0)}50%{transform:skewX(2.5deg)}}
.pa-pend{transform-box:view-box;transform-origin:200px 120px;animation:pa-tick 1.4s ease-in-out infinite alternate}
@keyframes pa-tick{from{transform:rotate(-14deg)}to{transform:rotate(14deg)}}
.pa-flash{opacity:0}
.pa.hurt .pa-flash{animation:pa-flash .4s ease-out}
@keyframes pa-flash{0%{opacity:.7}100%{opacity:0}}
.pa.hurt .pa-hitg{animation:pa-hurt .5s cubic-bezier(.2,.8,.3,1)}
@keyframes pa-hurt{0%{transform:none}15%{transform:translate(calc(var(--hd,1) * -20px),4px) rotate(calc(var(--hd,1) * -9deg)) scale(.93,1.06)}45%{transform:translate(calc(var(--hd,1) * 8px),0) rotate(calc(var(--hd,1) * 4deg))}100%{transform:none}}
.pa.atk .pa-hitg{animation:pa-atk .55s cubic-bezier(.3,0,.2,1)}
@keyframes pa-atk{0%{transform:none}35%{transform:translateX(calc(var(--ad,1) * 56px)) rotate(calc(var(--ad,1) * 7deg)) scale(1.07)}100%{transform:none}}
.pa.cheer .pa-hitg{animation:pa-cheer .6s ease-out}
@keyframes pa-cheer{0%,100%{transform:none}35%{transform:translateY(-26px) scale(.97,1.05)}60%{transform:translateY(0) scale(1.04,.96)}}
.pa.ko .pa-hitg{animation:pa-ko .9s cubic-bezier(.3,0,.4,1) forwards}
@keyframes pa-ko{0%{transform:none}35%{transform:translateY(-18px) rotate(-6deg)}100%{transform:translate(-16px,34px) rotate(-76deg)}}
.pa.ko .pa-all{animation:none}
.pa-body .d1,.pa-body .d2,.pa-body .d3,.pa-body .dko{opacity:0;transition:opacity .35s}
.pa.st1 .d1,.pa.st2 .d2,.pa.st3 .d3,.pa.ko .dko{opacity:1}
.pa.ko .d3{opacity:0}
.pa-sweat{animation:pa-sweat 1.3s ease-in infinite}
@keyframes pa-sweat{0%{transform:translateY(0);opacity:0}20%{opacity:1}100%{transform:translateY(34px);opacity:0}}
.pa-stars{transform-box:view-box;transform-origin:200px 60px;animation:pa-spin 1.4s linear infinite}
@keyframes pa-spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.pa *{animation:none!important;transition:none!important}}
`;
  function injectCss(){ if(document.getElementById("pa-css")) return; const s = document.createElement("style"); s.id = "pa-css"; s.textContent = css; document.head.appendChild(s); }

  const norm = cfg => Object.assign({ name: "", body: "pick", color: PALETTE[0], accent: PALETTE[3], hair: "none", hairColor: HAIR_COLORS[0], eyes: "round", mouth: "smile", acc: "none" }, cfg || {});

  function PlayerArt(el, cfg){
    injectCss(); cfg = norm(cfg);
    el.innerHTML = `<svg class="pa" viewBox="0 0 400 400" xmlns="${NS}" aria-hidden="true"><ellipse cx="200" cy="384" rx="110" ry="11" fill="${INK}" opacity=".16"/><g class="pa-hitg"><g class="pa-all">${build(cfg, true)}</g></g></svg>`;
    const svg = el.querySelector("svg");
    let stage = 0, ko = false, dir = 1;
    const flick = (cls, ms) => { svg.classList.remove(cls); void svg.getBoundingClientRect(); svg.classList.add(cls); setTimeout(() => svg.classList.remove(cls), ms); };
    return {
      setDamage(f){
        if(ko) return; f = Math.max(0, Math.min(1, f || 0));
        const st = f >= 0.75 ? 3 : f >= 0.5 ? 2 : f >= 0.25 ? 1 : 0;
        if(st === stage) return; stage = st;
        for(let i = 1; i <= 3; i++) svg.classList.toggle("st" + i, i <= st);
      },
      hurt(){ if(ko) return; dir = -dir; svg.style.setProperty("--hd", dir); flick("hurt", 520); },
      attack(d){ if(ko) return; svg.style.setProperty("--ad", d || 1); flick("atk", 580); },
      cheer(){ if(!ko) flick("cheer", 620); },
      ko(){ if(ko) return; ko = true; svg.classList.add("ko"); },
      reset(){ ko = false; stage = 0; svg.classList.remove("st1", "st2", "st3", "ko", "hurt", "atk", "cheer"); }
    };
  }
  PlayerArt.svg = cfg => `<svg viewBox="0 0 400 400" xmlns="${NS}"><g>${build(norm(cfg), false)}</g></svg>`;
  PlayerArt.options = OPTIONS;
  PlayerArt.norm = norm;
  window.PlayerArt = PlayerArt;

  /* ---- the saved character ---- */
  const KEY = "fma-player-v1";
  const pick = a => a[Math.floor(Math.random() * a.length)];
  window.Player = {
    random(){
      return norm({ name: "", body: pick(OPTIONS.bodies)[0], color: pick(PALETTE), accent: pick(PALETTE), hair: pick(OPTIONS.hair)[0], hairColor: pick(HAIR_COLORS),
        eyes: pick(OPTIONS.eyes)[0], mouth: pick(OPTIONS.mouths)[0], acc: pick(OPTIONS.acc)[0] });
    },
    get(){
      try{ const v = JSON.parse(localStorage.getItem(KEY)); if(v && v.body) return norm(v); }catch(e){}
      const r = this.random(); this.set(r); return r;
    },
    set(cfg){ try{ localStorage.setItem(KEY, JSON.stringify(norm(cfg))); }catch(e){} },
    has(){ try{ return !!localStorage.getItem(KEY); }catch(e){ return false; } }
  };
})();
