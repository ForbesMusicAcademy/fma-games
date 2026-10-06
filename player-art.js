/* "Your character": a customisable, animated vector player used across the Forbes Music Academy practice games.
   Designed to echo Dave's hand-made pick characters: big touching eyes with two-tone rims, glove gestures, chunky mouths,
   thin outlines, a soft shadow and handwritten names. A character is a small config, saved on the student's device:
     { name, body, color, accent, pose, hair, hairColor, eyes, eyeColor, mouth, acc, accColor }
   Player.get() / Player.set(cfg) / Player.random()          the saved character (a random one the first time)
   PlayerArt(container, cfg)  -> animated controller:  setDamage(0..1), hurt(), attack(dir), cheer(), ko(), reset()
   PlayerArt.svg(cfg)         -> plain SVG string (menus, thumbnails)
   PlayerArt.options / PlayerArt.presets                    what the editor offers */
(function(){
  const NS = "http://www.w3.org/2000/svg";
  const INK = "#1d1d1b";
  const ST = `stroke="${INK}" stroke-linejoin="round" stroke-linecap="round"`;
  const sw = w => `${ST} stroke-width="${w}"`;

  const PALETTE = ["#e8588e", "#d7262f", "#ff8a1c", "#ffb805", "#78d63a", "#5db35c", "#5fc4b0", "#2ca2ff", "#3d6dea", "#8a5ad6", "#6e1f3f", "#f3f2ee", "#8c8c8c", "#8b5a2b", "#2a2a2c"];
  const HAIR_COLORS = ["#2a2a2c", "#5b3a1e", "#c8761f", "#ffd34d", "#d7262f", "#e8588e", "#2ca2ff", "#8a5ad6", "#5db35c", "#f3f2ee"];
  const OPTIONS = {
    bodies: [["pick", "Pick"], ["amp", "Amp"], ["drum", "Drum"], ["metro", "Metronome"]],
    poses: [["rock", "Rock on"], ["thumbs", "Thumbs up"], ["peace", "Peace"], ["fists", "Fists up"], ["wave", "Wave"], ["point", "Number one"], ["chill", "Chill"]],
    hair: [["none", "None"], ["short", "Short"], ["spiky", "Spiky"], ["mohawk", "Mohawk"], ["afro", "Afro"], ["long", "Long"], ["pony", "Ponytail"]],
    eyes: [["classic", "Classic"], ["split", "Split"], ["bold", "Bold"], ["lidded", "Chilled"], ["fierce", "Fierce"], ["goggles", "Goggles"], ["happy", "Happy"]],
    mouths: [["smile", "Smile"], ["grin", "Big grin"], ["buck", "Buck teeth"], ["toothy", "Roar"], ["flat", "Deadpan"], ["slash", "Grumpy"], ["fangs", "Fangs"]],
    acc: [["none", "None"], ["glasses", "Glasses"], ["shades", "Shades"], ["cap", "Cap"], ["beanie", "Beanie"], ["phones", "Headphones"], ["band", "Headband"], ["bow", "Bow tie"], ["cape", "Cape"], ["crown", "Crown"]],
    palette: PALETTE, hairColors: HAIR_COLORS
  };
  // Starting points that echo Dave's six characters (the student can change anything afterwards)
  const PRESETS = [
    ["Plucky", { body: "pick", color: "#f3f2ee", accent: "#f3f2ee", pose: "thumbs", hair: "none", eyes: "classic", eyeColor: "#2ca2ff", mouth: "buck", acc: "none" }],
    ["Shredder", { body: "pick", color: "#2a2a2c", accent: "#d7262f", pose: "rock", hair: "none", eyes: "split", eyeColor: "#d7262f", mouth: "toothy", acc: "none" }],
    ["Fret", { body: "pick", color: "#e8588e", accent: "#e8588e", pose: "peace", hair: "none", eyes: "bold", eyeColor: "#78d63a", mouth: "grin", acc: "none" }],
    ["Clang", { body: "pick", color: "#d7262f", accent: "#d7262f", pose: "rock", hair: "mohawk", hairColor: "#8c8c8c", eyes: "fierce", eyeColor: "#8c8c8c", mouth: "slash", acc: "none" }],
    ["Scales", { body: "pick", color: "#5db35c", accent: "#5db35c", pose: "fists", hair: "none", eyes: "goggles", eyeColor: "#ffb805", mouth: "fangs", acc: "cape", accColor: "#d7262f" }],
    ["Callus", { body: "pick", color: "#2a2a2c", accent: "#6e1f3f", pose: "point", hair: "none", eyes: "lidded", eyeColor: "#6e1f3f", mouth: "flat", acc: "none" }]
  ];

  /* ---- colour helpers ---- */
  const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const toHex = a => "#" + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  const shade = (h, f) => toHex(hexRgb(h).map(v => v * f));
  function turn(h, deg, fallback){
    const [r, g, b] = hexRgb(h).map(v => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, L = (mx + mn) / 2;
    if(d < 0.12) return fallback || "#3d6dea";               // a grey/white/black: nothing to turn, use a stock partner colour
    const S = L > .5 ? d / (2 - mx - mn) : d / (mx + mn);
    let H = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    H = (H * 60 + deg) % 360;
    const a = S * Math.min(L, 1 - L), f = n => { const k = (n + H / 30) % 12; return L - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); };
    return toHex([f(0) * 255, f(8) * 255, f(4) * 255]);
  }
  const darkText = c => ["#f3f2ee", "#ffb805", "#78d63a", "#ffd34d", "#5fc4b0", "#8c8c8c", "#ff8a1c"].includes(c);

  /* ---- bodies: shape, face positions and where things attach ---- */
  const BODIES = {
    pick: {
      R: 27, eyes: [[173, 151], [227, 151]], mouth: 206, nameY: 256, shoulders: [[108, 208], [292, 208]], legs: [[182, 306], [220, 304]], top: [200, 78, 100], half: 98, bowY: 282,
      path: "M200 318 C158 306 104 236 100 158 C97 100 138 76 200 76 C262 76 303 100 300 158 C296 236 242 306 200 318Z",
      draw: c => `<path d="M200 318 C158 306 104 236 100 158 C97 100 138 76 200 76 C262 76 303 100 300 158 C296 236 242 306 200 318Z" fill="${c}" ${sw(3)}/><path d="M124 122 C132 100 150 90 170 88" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="7" stroke-linecap="round"/>`,
      cracks: ["M146 118 L162 136 L150 152 L168 170", "M262 104 L248 128 L266 144 L252 166"], band: [246, 238]
    },
    amp: {
      R: 25, eyes: [[170, 178], [230, 178]], mouth: 230, nameY: 285, shoulders: [[90, 206], [310, 206]], legs: [[160, 292], [240, 292]], top: [200, 106, 190], half: 114, bowY: 276,
      path: "M114 104 H286 Q312 104 312 130 V270 Q312 294 288 294 H112 Q88 294 88 270 V130 Q88 104 114 104Z",
      draw: c => `<path d="M168 106 Q200 70 232 106" fill="none" ${sw(8)}/><path d="M114 104 H286 Q312 104 312 130 V270 Q312 294 288 294 H112 Q88 294 88 270 V130 Q88 104 114 104Z" fill="${c}" ${sw(3)}/>
        <rect x="104" y="116" width="192" height="26" rx="10" fill="#fff" fill-opacity=".26"/><circle cx="128" cy="129" r="7" fill="${INK}"/><circle cx="154" cy="129" r="7" fill="${INK}"/><circle cx="180" cy="129" r="7" fill="${INK}"/><rect x="214" y="123" width="66" height="12" rx="6" fill="${INK}" opacity=".5"/>
        <rect x="104" y="152" width="192" height="128" rx="16" fill="#fff" fill-opacity=".2" stroke="${INK}" stroke-opacity=".3" stroke-width="2.4"/>`,
      cracks: ["M120 154 L138 172 L124 190 L146 208", "M280 152 L264 176 L284 194"], band: [270, 262]
    },
    drum: {
      R: 25, eyes: [[172, 198], [228, 198]], mouth: 240, nameY: 289, shoulders: [[92, 214], [308, 214]], legs: [[160, 292], [240, 292]], top: [200, 134, 190], half: 110, bowY: 270,
      path: "M92 136 V278 Q200 308 308 278 V136 Q200 112 92 136Z",
      draw: c => `<path d="M92 136 V278 Q200 308 308 278 V136Z" fill="${c}" ${sw(3)}/>
        <path d="M92 252 Q200 282 308 252" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="12"/>
        <path d="M108 150 L124 270 L140 152 L156 276 L172 156 M228 156 L244 276 L260 152 L276 270 L292 150" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3.6" stroke-linejoin="round"/>
        <ellipse cx="200" cy="136" rx="108" ry="26" fill="#f7f6f2" ${sw(3)}/><ellipse cx="200" cy="136" rx="92" ry="19" fill="none" stroke="${INK}" stroke-opacity=".22" stroke-width="2.4"/>`,
      cracks: ["M128 170 L146 188 L132 206 L152 224", "M274 168 L258 192 L278 210"], band: [262, 250]
    },
    metro: {
      R: 21, eyes: [[178, 172], [222, 172]], mouth: 226, nameY: 270, shoulders: [[120, 238], [280, 238]], legs: [[162, 298], [238, 298]], top: [200, 92, 100], half: 66, bowY: 272,
      path: "M158 92 H242 Q256 92 260 108 L304 282 Q308 300 290 300 H110 Q92 300 96 282 L140 108 Q144 92 158 92Z",
      draw: c => `<g class="pa-pend"><rect x="194" y="26" width="12" height="104" rx="6" fill="#d9b97a" ${sw(2.6)}/><rect x="186" y="52" width="28" height="20" rx="5" fill="#ffb805" ${sw(2.6)}/></g>
        <path d="M158 92 H242 Q256 92 260 108 L304 282 Q308 300 290 300 H110 Q92 300 96 282 L140 108 Q144 92 158 92Z" fill="${c}" ${sw(3)}/>
        <path d="M168 104 L150 292 M232 104 L250 292" stroke="#fff" stroke-opacity=".25" stroke-width="6" fill="none"/>`,
      cracks: ["M164 120 L180 142 L166 160 L184 180", "M246 140 L232 164 L250 182"], band: [250, 250]
    }
  };

  /* ---- eyes (big, touching, two-tone, white inner ring: the signature of Dave's characters) ---- */
  function star(cx, cy, r1, r2){
    let d = ""; for(let i = 0; i < 10; i++){ const a = -Math.PI / 2 + Math.PI * i / 5, r = i % 2 ? r2 : r1; d += (i ? "L" : "M") + (cx + r * Math.cos(a)).toFixed(1) + " " + (cy + r * Math.sin(a)).toFixed(1); }
    return d + "Z";
  }
  function eyesSvg(style, b, cfg){
    const [[lx, ly], [rx, ry]] = b.eyes, R = b.R, col = cfg.eyeColor, dk = shade(col, 0.5);
    const pupil = (x, y, r, dx) => `<circle cx="${x + dx}" cy="${y + R * 0.06}" r="${r}" fill="#111"/><circle cx="${x + dx - r * 0.35}" cy="${y - r * 0.3}" r="${r * 0.3}" fill="#fff"/>`;
    const half = (x, y, c) => `<path d="M${x - R} ${y} A${R} ${R} 0 0 0 ${x + R} ${y}Z" fill="${c}"/>`;
    const two = (x, y, top, bot, dx) => `<circle cx="${x}" cy="${y}" r="${R}" fill="${top}" ${sw(2.4)}/>${half(x, y, bot)}<circle cx="${x}" cy="${y}" r="${R}" fill="none" ${sw(2.4)}/><circle cx="${x}" cy="${y}" r="${R * 0.58}" fill="#fff"/>${pupil(x, y, R * 0.34, dx)}`;
    switch(style){
      case "split": { const b2 = turn(col, 215);
        return two(lx, ly, col, b2, R * 0.06) + two(rx, ry, b2, col, -R * 0.06); }
      case "bold": return [[lx, ly, 1], [rx, ry, -1]].map(([x, y, s]) => `<circle cx="${x}" cy="${y}" r="${R}" fill="#fff" stroke="${col}" stroke-width="${R * 0.3}"/><circle cx="${x}" cy="${y}" r="${R}" fill="none" ${sw(2)}/><circle cx="${x}" cy="${y}" r="${R * 0.62}" fill="#111"/><circle cx="${x - R * 0.2}" cy="${y - R * 0.22}" r="${R * 0.2}" fill="#fff"/>`).join("");
      case "lidded": return [[lx, ly], [rx, ry]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="${R * 0.98}" ry="${R * 0.72}" fill="#fff" ${sw(2.4)}/><circle cx="${x}" cy="${y + R * 0.12}" r="${R * 0.24}" fill="#111"/><path d="M${x - R * 0.98} ${y} A${R * 0.98} ${R * 0.72} 0 0 1 ${x + R * 0.98} ${y}L${x + R * 0.98} ${y - R * 0.08}L${x - R * 0.98} ${y - R * 0.08}Z" fill="${col}" ${sw(2.4)}/>`).join("");
      case "fierce": return [[lx, ly, -1], [rx, ry, 1]].map(([x, y, s]) => `<circle cx="${x}" cy="${y}" r="${R}" fill="${col}" ${sw(2.4)}/><ellipse cx="${x}" cy="${y + R * 0.12}" rx="${R * 0.74}" ry="${R * 0.62}" fill="#fff"/><circle cx="${x}" cy="${y + R * 0.2}" r="${R * 0.3}" fill="#111"/><path d="M${x + s * R * 1.05} ${y - R * 0.95} L${x - s * R * 0.75} ${y - R * 0.05}" stroke="#111" stroke-width="${R * 0.4}" stroke-linecap="round"/>`).join("");
      case "goggles": return [[lx, ly], [rx, ry]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${R}" fill="${col}" ${sw(2.4)}/><path d="M${x - R * 0.95} ${y - R * 0.05} H${x + R * 0.95}" stroke="#fff" stroke-width="${R * 0.38}"/><path d="M${x - R * 0.95} ${y - R * 0.05} H${x + R * 0.95}" stroke="#111" stroke-width="${R * 0.12}" stroke-dasharray="${R * 0.28} ${R * 0.28}"/><rect x="${x - R * 0.2}" y="${y - R * 0.27}" width="${R * 0.38}" height="${R * 0.38}" fill="#111"/>`).join("");
      case "happy": return [[lx, ly], [rx, ry]].map(([x, y]) => `<path d="M${x - R * 0.8} ${y + R * 0.3} Q${x} ${y - R * 0.95} ${x + R * 0.8} ${y + R * 0.3}" fill="none" stroke="${INK}" stroke-width="${R * 0.3}" stroke-linecap="round"/>`).join("");
      default: return two(lx, ly, col, dk, R * 0.06) + two(rx, ry, col, dk, -R * 0.06);
    }
  }
  /* ---- mouths (echoing his: buck teeth, grid grin, roar, deadpan, grumpy slash, fangs) ---- */
  function mouthSvg(style, y){
    switch(style){
      case "grin": return `<path d="M158 ${y - 8} Q200 ${y + 4} 242 ${y - 8} Q238 ${y + 30} 200 ${y + 32} Q162 ${y + 30} 158 ${y - 8}Z" fill="#fff" ${sw(3)}/><path d="M164 ${y + 10} H236 M178 ${y - 2} V${y + 30} M200 ${y} V${y + 32} M222 ${y - 2} V${y + 30}" stroke="${INK}" stroke-width="1.5" fill="none"/>`;
      case "buck": return `<path d="M176 ${y} Q200 ${y + 16} 224 ${y}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><rect x="190" y="${y + 6}" width="10" height="15" rx="2" fill="#fff" ${sw(2.2)}/><rect x="201" y="${y + 6}" width="10" height="15" rx="2" fill="#fff" ${sw(2.2)}/>`;
      case "toothy": return `<path d="M156 ${y - 6} Q200 ${y - 22} 244 ${y - 6} Q250 ${y + 24} 200 ${y + 28} Q150 ${y + 24} 156 ${y - 6}Z" fill="#6b2b12" stroke="#ff9d1e" stroke-width="5" stroke-linejoin="round"/><path d="M164 ${y - 4} Q200 ${y - 14} 236 ${y - 4} L231 ${y + 3} Q200 ${y - 4} 169 ${y + 3}Z" fill="#fff"/><path d="M168 ${y + 20} Q200 ${y + 26} 232 ${y + 20} L228 ${y + 15} Q200 ${y + 20} 172 ${y + 15}Z" fill="#fff"/><ellipse cx="201" cy="${y + 12}" rx="15" ry="6" fill="#e8647a"/>`;
      case "flat": return `<path d="M170 ${y + 4} H230" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`;
      case "slash": return `<path d="M166 ${y + 6} C184 ${y - 4} 210 ${y + 4} 236 ${y - 2}" fill="none" stroke="#111" stroke-width="8" stroke-linecap="round"/><path d="M230 ${y - 8} L243 ${y - 2} L232 ${y + 6}" fill="#111"/>`;
      case "fangs": return `<path d="M158 ${y - 8} Q200 ${y + 22} 244 ${y - 14} Q242 ${y + 24} 200 ${y + 28} Q164 ${y + 24} 158 ${y - 8}Z" fill="#fff" ${sw(3)}/><path d="M172 ${y + 6} L178 ${y + 22} L186 ${y + 12} M216 ${y + 14} L222 ${y + 2} L230 ${y + 12}" fill="#fff" ${sw(2)}/>`;
      default: return `<path d="M172 ${y - 4} Q200 ${y + 22} 228 ${y - 4}" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
    }
  }

  /* ---- hair (drawn for a top edge 140 wide centred on 0,0, extending up; scaled to the body) ---- */
  function hairSvg(style, color, top, half){
    if(style === "none") return { back: "", front: "" };
    const [tx, ty, tw] = top, s = Math.max(0.7, tw / 140), h = `fill="${color}" ${sw(3)}`;
    const T = body => `<g transform="translate(${tx} ${ty}) scale(${s.toFixed(2)})">${body}</g>`;
    const cap = `<path d="M-64 18 Q-70 -30 0 -34 Q70 -30 64 18 Q40 -2 10 8 Q-4 -6 -22 10 Q-44 -4 -64 18Z" ${h}/>`;
    switch(style){
      case "mohawk": return { back: "", front: T(`<path d="M-30 6 L-24 -34 L-12 -6 L-4 -48 L6 -6 L16 -42 L24 -4 L32 -30 L34 8 Q0 -6 -30 6Z" ${h}/>`) };
      case "spiky": return { back: "", front: T(`<path d="M-62 14 L-56 -22 L-40 0 L-30 -34 L-16 -4 L0 -42 L14 -4 L30 -34 L40 0 L56 -22 L62 14 Q0 -8 -62 14Z" ${h}/>`) };
      case "afro": return { back: T(`<circle cx="-48" cy="-4" r="30" ${h}/><circle cx="48" cy="-4" r="30" ${h}/><circle cx="-30" cy="-30" r="34" ${h}/><circle cx="30" cy="-30" r="34" ${h}/><circle cx="0" cy="-42" r="38" ${h}/>`), front: "" };
      case "short": return { back: "", front: T(cap) };
      case "long": { const hx = half + 4, y0 = ty + 14;
        const side = d => `<path d="M${200 + d * (hx - 6)} ${y0} Q${200 + d * (hx + 34)} ${y0 + 56} ${200 + d * (hx + 18)} ${y0 + 150} Q${200 + d * (hx - 6)} ${y0 + 160} ${200 + d * (hx - 12)} ${y0 + 110} Q${200 + d * (hx - 14)} ${y0 + 56} ${200 + d * (hx - 24)} ${y0 + 20}Z" ${h}/>`;
        return { back: side(-1) + side(1), front: T(cap) }; }
      case "pony": return { back: T(`<path d="M52 -4 Q96 -14 92 36 Q88 66 70 84 Q76 46 60 30Z" ${h}/><circle cx="54" cy="-2" r="7" fill="#ffb805" ${sw(2.6)}/>`), front: T(cap) };
    }
    return { back: "", front: "" };
  }

  /* ---- accessories (coloured with accColor) ---- */
  function accSvg(kind, b, c){
    const [tx, ty, tw] = b.top, s = Math.max(0.7, tw / 140), [[lx, ly], [rx, ry]] = b.eyes, R = b.R;
    const T = body => `<g transform="translate(${tx} ${ty}) scale(${s.toFixed(2)})">${body}</g>`;
    switch(kind){
      case "glasses": return { front: `<circle cx="${lx}" cy="${ly}" r="${R + 8}" fill="#cfeaff" fill-opacity=".25" stroke="${INK}" stroke-width="5"/><circle cx="${rx}" cy="${ry}" r="${R + 8}" fill="#cfeaff" fill-opacity=".25" stroke="${INK}" stroke-width="5"/><path d="M${lx + R + 8} ${ly} Q200 ${ly - 8} ${rx - R - 8} ${ry}" fill="none" stroke="${INK}" stroke-width="5"/>` };
      case "shades": return { front: `<rect x="${lx - R - 6}" y="${ly - R + 2}" width="${2 * R + 12}" height="${2 * R - 4}" rx="14" fill="${INK}"/><rect x="${rx - R - 6}" y="${ry - R + 2}" width="${2 * R + 12}" height="${2 * R - 4}" rx="14" fill="${INK}"/><path d="M${lx + R} ${ly - 6} H${rx - R}" stroke="${INK}" stroke-width="7"/><path d="M${lx - R + 4} ${ly - R + 10} l14 -2 M${rx - R + 4} ${ry - R + 10} l14 -2" stroke="#fff" stroke-opacity=".5" stroke-width="4" stroke-linecap="round"/>` };
      case "cap": return { front: T(`<path d="M-62 14 Q-64 -34 0 -38 Q64 -34 62 14Z" fill="${c}" ${sw(3)}/><path d="M-8 8 Q40 -4 92 8 Q84 22 20 20Z" fill="${c}" ${sw(3)}/><circle cx="0" cy="-38" r="5" fill="${INK}"/>`) };
      case "beanie": return { front: T(`<path d="M-64 18 Q-70 -36 0 -42 Q70 -36 64 18Z" fill="${c}" ${sw(3)}/><rect x="-66" y="2" width="132" height="22" rx="10" fill="${c}" ${sw(3)}/><path d="M-50 4 V22 M-30 4 V22 M-10 4 V22 M10 4 V22 M30 4 V22 M50 4 V22" stroke="${INK}" stroke-opacity=".35" stroke-width="2.2"/><circle cx="0" cy="-48" r="13" fill="#fff" ${sw(3)}/>`) };
      case "phones": return { front: T(`<path d="M-62 24 C-66 -50 66 -50 62 24" fill="none" ${sw(7)}/><rect x="-78" y="10" width="26" height="46" rx="12" fill="${c}" ${sw(3)}/><rect x="52" y="10" width="26" height="46" rx="12" fill="${c}" ${sw(3)}/>`) };
      case "band": return { front: T(`<path d="M-64 20 Q0 4 64 20 L62 36 Q0 20 -62 36Z" fill="${c}" ${sw(3)}/><path d="M60 24 L92 6 L90 44Z" fill="${c}" ${sw(2.6)}/>`) };
      case "bow": return { front: `<g transform="translate(200 ${b.bowY})"><path d="M0 0 L-34 -18 V18Z M0 0 L34 -18 V18Z" fill="${c}" ${sw(3)}/><circle cx="0" cy="0" r="9" fill="${c}" ${sw(3)}/></g>` };
      case "crown": return { front: T(`<path d="M-44 8 L-52 -30 L-26 -8 L0 -40 L26 -8 L52 -30 L44 8Z" fill="#ffc42b" ${sw(3)}/><circle cx="-52" cy="-30" r="5" fill="#d7262f"/><circle cx="0" cy="-40" r="5" fill="#2ca2ff"/><circle cx="52" cy="-30" r="5" fill="#d7262f"/>`) };
      case "cape": return { back: `<g class="pa-cape"><path d="M104 150 C70 220 56 300 52 372 C120 340 160 330 200 330 C240 330 280 340 348 372 C344 300 330 220 296 150Z" fill="${c}" ${sw(3)}/><path d="M104 160 C90 220 80 290 76 350 C112 332 140 326 168 324 C150 270 140 210 150 160Z" fill="#000" fill-opacity=".16"/></g>`, front: "" };
    }
    return { front: "", back: "" };
  }

  /* ---- hands & poses ---- */
  const HANDS = {
    rock: c => `<path d="M-17 8 C-21 -6 -11 -13 0 -13 C11 -13 21 -6 17 8 C15 21 -15 21 -17 8Z" fill="${c}" ${sw(2.8)}/>
      <rect x="-20" y="-46" width="12" height="38" rx="6" fill="${c}" ${sw(2.8)} transform="rotate(-14 -14 -8)"/><rect x="8" y="-42" width="11" height="34" rx="5.5" fill="${c}" ${sw(2.8)} transform="rotate(14 13 -8)"/>
      <circle cx="-3" cy="-12" r="7" fill="${c}" ${sw(2.4)}/><circle cx="5" cy="-12" r="6.5" fill="${c}" ${sw(2.4)}/><path d="M-18 4 C-30 -2 -27 -14 -17 -11" fill="${c}" ${sw(2.6)}/>`,
    thumbs: c => `<rect x="-23" y="-6" width="46" height="34" rx="15" fill="${c}" ${sw(2.8)}/><rect x="-19" y="-36" width="17" height="36" rx="8.5" fill="${c}" ${sw(2.8)} transform="rotate(-10 -10 -18)"/><path d="M-4 8 H20 M-4 18 H20" ${sw(2.2)} fill="none"/>`,
    peace: c => `<path d="M-17 8 C-21 -6 -11 -13 0 -13 C11 -13 21 -6 17 8 C15 21 -15 21 -17 8Z" fill="${c}" ${sw(2.8)}/>
      <rect x="-16" y="-46" width="12" height="38" rx="6" fill="${c}" ${sw(2.8)} transform="rotate(-16 -10 -8)"/><rect x="3" y="-46" width="12" height="38" rx="6" fill="${c}" ${sw(2.8)} transform="rotate(16 9 -8)"/>
      <circle cx="-6" cy="-6" r="6" fill="${c}" ${sw(2.4)}/><circle cx="6" cy="-6" r="6" fill="${c}" ${sw(2.4)}/><path d="M-18 6 C-30 0 -27 -12 -17 -9" fill="${c}" ${sw(2.6)}/>`,
    point: c => `<rect x="-20" y="-8" width="40" height="30" rx="13" fill="${c}" ${sw(2.8)}/><rect x="-6" y="-48" width="13" height="44" rx="6.5" fill="${c}" ${sw(2.8)}/><path d="M-14 8 H14 M-14 16 H14" ${sw(2.2)} fill="none"/>`,
    fist: c => `<rect x="-21" y="-14" width="42" height="36" rx="15" fill="${c}" ${sw(2.8)}/><path d="M-9 -12 V4 M2 -12 V4 M13 -10 V4" ${sw(2.2)} fill="none"/>`,
    open: c => `<path d="M-18 -10 C-20 8 -14 18 0 18 C14 18 20 8 18 -10Z" fill="${c}" ${sw(2.8)}/>
      <rect x="-20" y="8" width="11" height="30" rx="5.5" fill="${c}" ${sw(2.6)} transform="rotate(14 -14 8)"/><rect x="-9" y="12" width="11" height="34" rx="5.5" fill="${c}" ${sw(2.6)} transform="rotate(4 -3 12)"/>
      <rect x="2" y="12" width="11" height="34" rx="5.5" fill="${c}" ${sw(2.6)} transform="rotate(-6 8 12)"/><rect x="12" y="8" width="10" height="28" rx="5" fill="${c}" ${sw(2.6)} transform="rotate(-16 17 8)"/>`
  };
  // [hand, dx, dy, rotation] for the left and right hand, relative to each shoulder (mirrored to the right side)
  const POSES = {
    rock: [["rock", -38, -108, -8], ["rock", 38, -108, 8]],
    thumbs: [["thumbs", -34, -92, -12], ["thumbs", 34, -92, 12]],
    peace: [["thumbs", -38, -64, -12], ["peace", 38, -100, 14]],
    fists: [["fist", -32, -112, -10], ["fist", 32, -104, 10]],
    wave: [["open", -48, 40, 4], ["open", 46, -84, 180]],
    point: [["point", -30, -104, -8], ["open", 52, 44, -4]],
    chill: [["open", -50, 46, 6], ["open", 50, 46, -6]]
  };
  const limb = d => `<path d="${d}" fill="none" ${ST} stroke-width="10"/>`;
  const shoe = (c, x, y, flip) => `<g transform="translate(${x} ${y}) scale(${flip ? -1 : 1} 1)"><path d="M-30 0 C-34 -17 -10 -28 8 -24 C26 -20 38 -6 36 6 C34 15 -30 15 -30 0Z" fill="${c}" ${sw(3)}/><path d="M6 -22 C16 -12 22 -4 22 8" fill="none" ${sw(2.4)} opacity=".4"/></g>`;

  function build(cfg, anim){
    const b = BODIES[cfg.body] || BODIES.pick, col = cfg.color, ac = cfg.accent;
    const [[lsx, lsy], [rsx, rsy]] = b.shoulders, [[llx, lly], [rlx, rly]] = b.legs;
    const hair = hairSvg(cfg.hair, cfg.hairColor, b.top, b.half), acc = accSvg(cfg.acc, b, cfg.accColor);
    const legs = limb(`M${llx} ${lly} C${llx - 4} ${lly + 26} ${llx - 12} ${lly + 44} ${llx - 14} 360`) + limb(`M${rlx} ${rly} C${rlx + 4} ${rly + 26} ${rlx + 12} ${rly + 44} ${rlx + 14} 360`);
    const feet = shoe(ac, llx - 18, 372, false) + shoe(ac, rlx + 18, 370, true);
    const pose = POSES[cfg.pose] || POSES.rock;
    const arms = pose.map(([hnd, dx, dy, rot], i) => {
      const right = i === 1, sx = right ? rsx : lsx, sy = right ? rsy : lsy, hx = sx + dx, hy = sy + dy, r = rot * Math.PI / 180;
      const wrist = [hx - Math.sin(r) * 18, hy + Math.cos(r) * 18];
      const sgn = right ? 1 : -1, c1 = [sx + sgn * 36, sy + (dy < 0 ? 8 : 4)], c2 = [hx + sgn * 10, hy + (dy < 0 ? 50 : -30)];
      return `<g class="pa-arm ${right ? "r" : "l"}" style="transform-origin:${sx}px ${sy}px">${limb(`M${sx} ${sy} C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${wrist[0].toFixed(1)} ${wrist[1].toFixed(1)}`)}<g transform="translate(${hx} ${hy}) rotate(${rot}) scale(1.22)">${HANDS[hnd](ac)}</g></g>`;
    }).join("");
    const nm = (cfg.name || "").trim().slice(0, 10).replace(/[<>&"]/g, "");
    const name = nm ? `<text x="200" y="${b.nameY}" text-anchor="middle" font-family="'Caveat','Patrick Hand','Comic Sans MS',cursive" font-weight="700" font-size="${nm.length > 7 ? 27 : 32}" fill="${darkText(col) ? INK : "#fff"}" stroke="none">${nm}</text>` : "";
    const eyes = eyesSvg(cfg.eyes, b, cfg), mouth = mouthSvg(cfg.mouth, b.mouth), R2 = b.R + 2;
    const dmg = anim ? `
      <g class="d1"><path d="${b.cracks[0]}" fill="none" stroke="${INK}" stroke-width="3" ${ST}/><ellipse cx="${b.band[0] + 6}" cy="${b.band[1] + 30}" rx="15" ry="8" fill="#000" opacity=".2"/></g>
      <g class="d2"><path d="${b.cracks[1]}" fill="none" stroke="${INK}" stroke-width="3" ${ST}/>
        <g transform="translate(${b.band[0]} ${b.band[1]}) rotate(-24)"><rect x="-20" y="-7" width="40" height="14" rx="4" fill="#f2cf9a" ${sw(2)}/><rect x="-8" y="-7" width="16" height="14" fill="#e5b97a"/></g></g>
      <g class="d2"><path class="pa-sweat" d="M${b.eyes[1][0] + 40} ${b.eyes[1][1] - 24} Q${b.eyes[1][0] + 48} ${b.eyes[1][1] - 8} ${b.eyes[1][0] + 40} ${b.eyes[1][1]} Q${b.eyes[1][0] + 32} ${b.eyes[1][1] - 8} ${b.eyes[1][0] + 40} ${b.eyes[1][1] - 24}Z" fill="#8ecae6" ${sw(2)}/></g>
      <g class="d3">${b.eyes.map(e => `<circle cx="${e[0]}" cy="${e[1]}" r="${R2}" fill="#fff" ${sw(2.6)}/><path d="M${e[0]} ${e[1]} m0 0 a3 3 0 1 1 6 0 a7 7 0 1 1 -14 0 a11 11 0 1 1 22 0 a15 15 0 1 1 -30 0" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`).join("")}</g>
      <g class="dko">${b.eyes.map(e => `<circle cx="${e[0]}" cy="${e[1]}" r="${R2}" fill="#fff" ${sw(2.6)}/><path d="M${e[0] - 12} ${e[1] - 12} L${e[0] + 12} ${e[1] + 12} M${e[0] + 12} ${e[1] - 12} L${e[0] - 12} ${e[1] + 12}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`).join("")}</g>
      <g class="dko pa-stars"><g transform="translate(200 ${Math.max(30, b.top[1] - 36)})"><path d="${star(0, 0, 11, 5)}" fill="#ffb805" ${sw(2.2)} transform="translate(-44 8)"/><path d="${star(0, 0, 13, 6)}" fill="#ffb805" ${sw(2.2)} transform="translate(0 -8)"/><path d="${star(0, 0, 11, 5)}" fill="#ffb805" ${sw(2.2)} transform="translate(44 8)"/></g></g>` : "";
    const flash = anim ? `<path class="pa-flash" d="${b.path}" fill="#ff3b3b"/>` : "";
    return `${acc.back || ""}${hair.back}${legs}${feet}${arms}<g class="pa-body">${b.draw(col)}${eyes}${mouth}${name}${dmg}</g>${flash}${hair.front}${acc.front || ""}`;
  }

  const css = `
.pa{width:100%;height:100%;display:block;overflow:visible;filter:drop-shadow(0 3px 5px rgba(0,0,0,.22))}
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

  const DEFAULTS = { name: "", body: "pick", color: PALETTE[0], accent: PALETTE[3], pose: "rock", hair: "none", hairColor: HAIR_COLORS[0], eyes: "classic", eyeColor: "#2ca2ff", mouth: "smile", acc: "none", accColor: "" };
  const inList = (v, list) => list.some(x => (Array.isArray(x) ? x[0] : x) === v);
  // fills in anything missing and drops values from older versions that no longer exist
  const norm = cfg => {
    const c = Object.assign({}, DEFAULTS, cfg || {});
    if(!BODIES[c.body]) c.body = DEFAULTS.body;
    if(!POSES[c.pose]) c.pose = DEFAULTS.pose;
    if(!inList(c.eyes, OPTIONS.eyes)) c.eyes = DEFAULTS.eyes;
    if(!inList(c.mouth, OPTIONS.mouths)) c.mouth = DEFAULTS.mouth;
    if(!inList(c.hair, OPTIONS.hair)) c.hair = "none";
    if(!inList(c.acc, OPTIONS.acc)) c.acc = "none";
    if(!c.accColor) c.accColor = c.accent;
    return c;
  };

  function PlayerArt(el, cfg){
    injectCss(); cfg = norm(cfg);
    el.innerHTML = `<svg class="pa" viewBox="0 0 400 400" xmlns="${NS}" aria-hidden="true"><g class="pa-hitg"><g class="pa-all">${build(cfg, true)}</g></g></svg>`;
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
  PlayerArt.presets = PRESETS;
  PlayerArt.norm = norm;
  window.PlayerArt = PlayerArt;

  /* ---- the saved character ---- */
  const KEY = "fma-player-v1";
  const pick = a => a[Math.floor(Math.random() * a.length)];
  window.Player = {
    random(){
      const p = pick(PRESETS)[1];
      return norm(Object.assign({}, p, { body: pick(OPTIONS.bodies)[0], color: pick(PALETTE), accent: pick(PALETTE), pose: pick(OPTIONS.poses)[0], hair: pick(OPTIONS.hair)[0], hairColor: pick(HAIR_COLORS),
        eyes: pick(OPTIONS.eyes)[0], eyeColor: pick(PALETTE), mouth: pick(OPTIONS.mouths)[0], acc: pick(OPTIONS.acc)[0], accColor: pick(PALETTE) }));
    },
    get(){
      try{ const v = JSON.parse(localStorage.getItem(KEY)); if(v && v.body) return norm(v); }catch(e){}
      const r = this.random(); this.set(r); return r;
    },
    set(cfg){ try{ localStorage.setItem(KEY, JSON.stringify(norm(cfg))); }catch(e){} },
    has(){ try{ return !!localStorage.getItem(KEY); }catch(e){ return false; } }
  };
})();
