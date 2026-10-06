/* "Your character": a customisable, animated vector player used across the Forbes Music Academy practice games.
   Classic friendly cartoon style: round bodies, thick outlines, simple shiny eyes, rosy cheeks, big smiles, mitten hands.
   A character is a small config, saved on the student's device:
     { name, body, color, accent, pose, eyes, eyeColor, mouth, acc, accColor }
   Player.get() / Player.set(cfg) / Player.random()          the saved character (a random one the first time)
   PlayerArt(container, cfg)  -> animated controller:  setDamage(0..1), hurt(), attack(dir), cheer(), ko(), reset()
   PlayerArt.svg(cfg, view)   -> plain SVG string (menus, thumbnails); view = "full" | "head" | "face"
   PlayerArt.options          -> what the editor offers */
(function(){
  const NS = "http://www.w3.org/2000/svg";
  const INK = "#1d1d1b";
  const ST = `stroke="${INK}" stroke-linejoin="round" stroke-linecap="round"`;
  const sw = w => `${ST} stroke-width="${w}"`;

  const PALETTE = ["#ff6fa3", "#e8433f", "#ff8a1c", "#ffc42b", "#9be04a", "#4fb86a", "#4fd0c0", "#4aa8ff", "#5470f0", "#a070e8", "#f7f4ee", "#a8723c", "#3a3a3d"];
    const OPTIONS = {
    bodies: [["pick", "Pick"], ["amp", "Amp"], ["drum", "Drum"], ["metro", "Metronome"]],
    poses: [["cheer", "Cheer"], ["wave", "Wave"], ["thumbs", "Thumbs up"], ["rock", "Rock on"], ["relax", "Relaxed"]],
    eyes: [["dots", "Dots"], ["sparkle", "Sparkle"], ["googly", "Googly"], ["happy", "Happy"], ["wink", "Wink"], ["sleepy", "Sleepy"], ["starry", "Starry"]],
    mouths: [["smile", "Smile"], ["open", "Open smile"], ["grin", "Teeth"], ["tongue", "Tongue out"], ["wow", "Wow"], ["kitty", "Kitty"]],
    acc: [["none", "None"], ["beanie", "Beanie"], ["cap", "Cap"], ["tophat", "Top hat"], ["party", "Party"], ["crown", "Crown"], ["band", "Band"], ["phones", "Phones"], ["glasses", "Specs"], ["shades", "Shades"], ["bow", "Bow tie"], ["cape", "Cape"]],
    palette: PALETTE
  };
  const shade = (h, f) => "#" + [1, 3, 5].map(i => Math.max(0, Math.min(255, Math.round(parseInt(h.slice(i, i + 2), 16) * f))).toString(16).padStart(2, "0")).join("");
  const darkText = c => ["#f7f4ee", "#ffc42b", "#9be04a", "#ffd34d", "#4fd0c0", "#ff8a1c", "#4aa8ff"].includes(c);

  /* ---- bodies: shape, face positions and where things attach ---- */
  const BODIES = {
    pick: {
      R: 20, eyes: [[170, 152], [230, 152]], mouth: 204, nameY: 262, shoulders: [[104, 214], [296, 214]], legs: [[180, 308], [222, 308]], top: [200, 74, 104], half: 100, hat: { l: 101, r: 299, y0: 72, y1: 124, shape: "round" }, bowY: 288,
      path: "M200 324 C150 310 96 242 94 164 C92 104 138 72 200 72 C262 72 308 104 306 164 C304 242 250 310 200 324Z",
      draw: c => `<path d="M200 324 C150 310 96 242 94 164 C92 104 138 72 200 72 C262 72 308 104 306 164 C304 242 250 310 200 324Z" fill="${c}" ${sw(5)}/><path d="M122 126 C130 102 150 90 172 88" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="9" stroke-linecap="round"/>`,
      cracks: ["M146 118 L162 136 L150 152 L168 170", "M262 104 L248 128 L266 144 L252 166"], band: [246, 244]
    },
    amp: {
      R: 20, eyes: [[162, 180], [238, 180]], mouth: 232, nameY: 285, shoulders: [[88, 210], [312, 210]], legs: [[158, 294], [242, 294]], top: [200, 106, 196], half: 116, hat: { l: 86, r: 314, y0: 104, y1: 152, shape: "square" }, bowY: 278,
      path: "M124 104 H276 Q314 104 314 142 V262 Q314 296 280 296 H120 Q86 296 86 262 V142 Q86 104 124 104Z",
      draw: c => `<path d="M170 106 Q200 72 230 106" fill="none" ${sw(8)}/><path d="M124 104 H276 Q314 104 314 142 V262 Q314 296 280 296 H120 Q86 296 86 262 V142 Q86 104 124 104Z" fill="${c}" ${sw(5)}/>
        <circle cx="130" cy="130" r="8" fill="#fff" fill-opacity=".85" ${sw(3)}/><circle cx="160" cy="130" r="8" fill="#fff" fill-opacity=".85" ${sw(3)}/><circle cx="190" cy="130" r="8" fill="#fff" fill-opacity=".85" ${sw(3)}/><rect x="222" y="124" width="66" height="12" rx="6" fill="#fff" fill-opacity=".5"/>
        <rect x="106" y="152" width="188" height="130" rx="22" fill="#fff" fill-opacity=".22"/>`,
      cracks: ["M120 154 L138 172 L124 190 L146 208", "M280 152 L264 176 L284 194"], band: [270, 266]
    },
    drum: {
      R: 20, eyes: [[166, 200], [234, 200]], mouth: 242, nameY: 289, shoulders: [[90, 218], [310, 218]], legs: [[160, 294], [240, 294]], top: [200, 134, 196], half: 112, hat: { l: 90, r: 310, y0: 112, y1: 172, shape: "square" }, bowY: 272,
      path: "M90 138 V278 Q200 310 310 278 V138 Q200 112 90 138Z",
      draw: c => `<path d="M90 138 V278 Q200 310 310 278 V138Z" fill="${c}" ${sw(5)}/>
        <path d="M90 254 Q200 284 310 254" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="12"/>
        <path d="M110 152 L126 270 L142 154 M258 154 L274 270 L290 152" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>
        <ellipse cx="200" cy="138" rx="110" ry="26" fill="#f7f4ee" ${sw(5)}/>`,
      cracks: ["M128 170 L146 188 L132 206 L152 224", "M274 168 L258 192 L278 210"], band: [262, 252]
    },
    metro: {
      R: 18, eyes: [[174, 176], [226, 176]], mouth: 228, nameY: 272, shoulders: [[118, 240], [282, 240]], legs: [[160, 300], [240, 300]], top: [200, 92, 104], half: 68, hat: { l: 131, r: 269, y0: 92, y1: 134, shape: "round" }, bowY: 274,
      path: "M158 92 H242 Q258 92 262 108 L306 282 Q312 302 290 302 H110 Q88 302 94 282 L138 108 Q142 92 158 92Z",
      draw: c => `<g class="pa-pend"><rect x="194" y="26" width="12" height="104" rx="6" fill="#e0bf82" ${sw(4)}/><rect x="186" y="52" width="28" height="20" rx="6" fill="#ffc42b" ${sw(4)}/></g>
        <path d="M158 92 H242 Q258 92 262 108 L306 282 Q312 302 290 302 H110 Q88 302 94 282 L138 108 Q142 92 158 92Z" fill="${c}" ${sw(5)}/>
        <path d="M170 106 L152 290" stroke="#fff" stroke-opacity=".35" stroke-width="8" stroke-linecap="round" fill="none"/>`,
      cracks: ["M164 120 L180 142 L166 160 L184 180", "M246 140 L232 164 L250 182"], band: [250, 252]
    }
  };

  /* ---- faces: simple, round, friendly ---- */
  function star(cx, cy, r1, r2){
    let d = ""; for(let i = 0; i < 10; i++){ const a = -Math.PI / 2 + Math.PI * i / 5, r = i % 2 ? r2 : r1; d += (i ? "L" : "M") + (cx + r * Math.cos(a)).toFixed(1) + " " + (cy + r * Math.sin(a)).toFixed(1); }
    return d + "Z";
  }
  function eyesSvg(style, b, cfg){
    const [[lx, ly], [rx, ry]] = b.eyes, k = b.R / 20, ec = cfg.eyeColor;
    const arc = (x, y) => `<path d="M${x - 15 * k} ${y + 6 * k} Q${x} ${y - 16 * k} ${x + 15 * k} ${y + 6 * k}" fill="none" stroke="${INK}" stroke-width="${6 * k}" stroke-linecap="round"/>`;
    const dot = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="${12 * k}" ry="${15 * k}" fill="${ec}" ${sw(3)}/><circle cx="${x - 3.5 * k}" cy="${y - 5.5 * k}" r="${4.4 * k}" fill="#fff"/><circle cx="${x + 4 * k}" cy="${y + 5 * k}" r="${2 * k}" fill="#fff" opacity=".8"/>`;
    const sparkle = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="${16 * k}" ry="${20 * k}" fill="${INK}"/><ellipse cx="${x}" cy="${y + 3 * k}" rx="${12.5 * k}" ry="${15.5 * k}" fill="${ec}"/><ellipse cx="${x}" cy="${y + 4 * k}" rx="${7 * k}" ry="${9 * k}" fill="${INK}"/><circle cx="${x - 5.5 * k}" cy="${y - 7 * k}" r="${5.6 * k}" fill="#fff"/><circle cx="${x + 5 * k}" cy="${y + 8 * k}" r="${2.7 * k}" fill="#fff"/>`;
    const googly = (x, y, s) => `<circle cx="${x}" cy="${y}" r="${19 * k}" fill="#fff" ${sw(3.5)}/><circle cx="${x + s * 5 * k}" cy="${y + 5 * k}" r="${9 * k}" fill="${ec}"/><circle cx="${x + s * 5 * k - 2.5 * k}" cy="${y + 2.5 * k}" r="${3 * k}" fill="#fff"/>`;
    const sleepy = (x, y) => `<path d="M${x - 14 * k} ${y - 2 * k} A${14 * k} ${14 * k} 0 0 0 ${x + 14 * k} ${y - 2 * k}Z" fill="${INK}"/><path d="M${x - 17 * k} ${y - 2 * k} H${x + 17 * k}" stroke="${INK}" stroke-width="${5 * k}" stroke-linecap="round"/>`;
    const starry = (x, y) => `<path d="${star(x, y, 19 * k, 8.5 * k)}" fill="#ffc42b" ${sw(3)}/>`;
    switch(style){
      case "sparkle": return sparkle(lx, ly) + sparkle(rx, ry);
      case "googly": return googly(lx, ly, 1) + googly(rx, ry, -1);
      case "happy": return arc(lx, ly) + arc(rx, ry);
      case "wink": return dot(lx, ly) + arc(rx, ry);
      case "sleepy": return sleepy(lx, ly) + sleepy(rx, ry);
      case "starry": return starry(lx, ly) + starry(rx, ry);
      default: return dot(lx, ly) + dot(rx, ry);
    }
  }
  const cheeks = b => `<ellipse cx="${b.eyes[0][0] - 20}" cy="${b.eyes[0][1] + 26}" rx="12" ry="8" fill="#ff5f8f" fill-opacity=".38"/><ellipse cx="${b.eyes[1][0] + 20}" cy="${b.eyes[1][1] + 26}" rx="12" ry="8" fill="#ff5f8f" fill-opacity=".38"/>`;
  function mouthSvg(style, y){
    switch(style){
      case "open": return `<path d="M170 ${y - 2} Q200 ${y + 8} 230 ${y - 2} Q226 ${y + 34} 200 ${y + 34} Q174 ${y + 34} 170 ${y - 2}Z" fill="#5b1f24" ${sw(4)}/><path d="M184 ${y + 24} Q200 ${y + 14} 216 ${y + 24} Q212 ${y + 33} 200 ${y + 33} Q188 ${y + 33} 184 ${y + 24}Z" fill="#ff7a94"/>`;
      case "grin": return `<path d="M166 ${y - 4} Q200 ${y + 10} 234 ${y - 4} Q232 ${y + 28} 200 ${y + 30} Q168 ${y + 28} 166 ${y - 4}Z" fill="#fff" ${sw(4)}/><path d="M170 ${y + 11} H230 M200 ${y + 3} V${y + 30}" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
      case "tongue": return `<path d="M172 ${y} Q200 ${y + 20} 228 ${y}" fill="none" stroke="${INK}" stroke-width="5.5" stroke-linecap="round"/><path d="M188 ${y + 11} Q200 ${y + 42} 214 ${y + 11} Q201 ${y + 18} 188 ${y + 11}Z" fill="#ff7a94" ${sw(3.5)}/>`;
      case "wow": return `<ellipse cx="200" cy="${y + 12}" rx="13" ry="17" fill="#5b1f24" ${sw(4)}/><ellipse cx="200" cy="${y + 21}" rx="7" ry="6" fill="#ff7a94"/>`;
      case "kitty": return `<path d="M178 ${y + 2} Q189 ${y + 18} 200 ${y + 4} Q211 ${y + 18} 222 ${y + 2}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
      default: return `<path d="M168 ${y - 4} Q200 ${y + 26} 232 ${y - 4}" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
    }
  }

  /* ---- accessories (coloured with accColor). Hats are fitted to each body's own top: a beanie covers the whole top of a pick, and is boxy on an amp. ---- */
  function accSvg(kind, b, c){
    const h = b.hat, cx = 200, w = h.r - h.l, [[lx, ly], [rx, ry]] = b.eyes, R = b.R + 7, dk = shade(c, 0.72);
    const k = Math.min(28, w * 0.12);
    // a dome from the base line y1 up to height yt, in the body's own shape (rounded for a pick, boxy for an amp or drum)
    const dome = (yt, y1) => {
      if(h.shape === "square") return `M${h.l} ${y1} V${yt + k} Q${h.l} ${yt} ${h.l + k} ${yt} H${h.r - k} Q${h.r} ${yt} ${h.r} ${yt + k} V${y1}Z`;
      const cy = y1 + (yt - y1) / 0.75; return `M${h.l} ${y1} C${h.l} ${cy} ${h.r} ${cy} ${h.r} ${y1}Z`;
    };
    const sc = Math.max(0.7, Math.min(1.3, w / 170));
    switch(kind){
      case "beanie": { const yt = h.y0 - 12;
        const ribs = Array.from({ length: 9 }, (_, i) => { const x = h.l + (i + 1) * (w + 16) / 10 - 8; return `M${x.toFixed(1)} ${h.y1 - 28} V${h.y1 + 2}`; }).join(" ");
        return { front: `<path d="${dome(yt, h.y1 - 14)}" fill="${c}" ${sw(4)}/><rect x="${h.l - 8}" y="${h.y1 - 34}" width="${w + 16}" height="38" rx="14" fill="${c}" ${sw(4)}/><path d="${ribs}" stroke="${INK}" stroke-opacity=".28" stroke-width="2.6" fill="none"/><circle cx="${cx}" cy="${yt - (h.shape === "square" ? 8 : 4)}" r="${15 * sc}" fill="#fff" ${sw(4)}/>` }; }
      case "cap": { const yt = h.y0 - 4;
        return { front: `<path d="${dome(yt, h.y1 - 12)}" fill="${c}" ${sw(4)}/><path d="M${cx} ${yt + 6} V${h.y1 - 24}" stroke="${INK}" stroke-opacity=".25" stroke-width="3"/><circle cx="${cx}" cy="${yt - 2}" r="6" fill="${dk}" ${sw(3)}/><path d="M${h.l + 14} ${h.y1 - 12} Q${cx} ${h.y1 + 30} ${h.r - 14} ${h.y1 - 12} Q${cx} ${h.y1 - 4} ${h.l + 14} ${h.y1 - 12}Z" fill="${dk}" ${sw(4)}/>` }; }
      case "tophat": { const bw = w * 0.5, ty = h.y0 - 64;
        return { front: `<path d="M${cx - bw / 2} ${h.y0 + 8} L${cx - bw / 2 + 4} ${ty + 8} Q${cx - bw / 2 + 4} ${ty} ${cx - bw / 2 + 14} ${ty} H${cx + bw / 2 - 14} Q${cx + bw / 2 - 4} ${ty} ${cx + bw / 2 - 4} ${ty + 8} L${cx + bw / 2} ${h.y0 + 8}Z" fill="${c}" ${sw(4)}/><rect x="${cx - bw / 2 + 1}" y="${h.y0 - 12}" width="${bw - 2}" height="20" fill="${dk}" ${sw(3.4)}/><ellipse cx="${cx}" cy="${h.y0 + 8}" rx="${w * 0.46}" ry="13" fill="${c}" ${sw(4)}/>` }; }
      case "party": { const s2 = sc, ay = h.y0 - 92 * s2, bx = 52 * s2;
        return { front: `<g transform="rotate(8 ${cx} ${h.y0 + 10})"><path d="M${cx - bx} ${h.y0 + 12} L${cx} ${ay} L${cx + bx} ${h.y0 + 12} Q${cx} ${h.y0 + 28} ${cx - bx}  ${h.y0 + 12}Z" fill="${c}" ${sw(4)}/><path d="M${cx - bx * 0.62} ${h.y0 - 22 * s2} Q${cx} ${h.y0 - 8 * s2} ${cx + bx * 0.62} ${h.y0 - 22 * s2} M${cx - bx * 0.32} ${h.y0 - 56 * s2} Q${cx} ${h.y0 - 46 * s2} ${cx + bx * 0.32} ${h.y0 - 56 * s2}" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="6" stroke-linecap="round"/><circle cx="${cx}" cy="${ay}" r="${10 * s2}" fill="#ffc42b" ${sw(3.6)}/></g>` }; }
      case "crown": { const y0 = h.y0 + 6;
        return { front: `<path d="M${cx - 46 * sc} ${y0 + 8} L${cx - 54 * sc} ${y0 - 30 * sc} L${cx - 24 * sc} ${y0 - 8 * sc} L${cx} ${y0 - 38 * sc} L${cx + 24 * sc} ${y0 - 8 * sc} L${cx + 54 * sc} ${y0 - 30 * sc} L${cx + 46 * sc} ${y0 + 8} Q${cx} ${y0 + 22} ${cx - 46 * sc} ${y0 + 8}Z" fill="#ffc42b" ${sw(4)}/><circle cx="${cx - 54 * sc}" cy="${y0 - 30 * sc}" r="5.5" fill="#e8433f" ${sw(2.4)}/><circle cx="${cx}" cy="${y0 - 38 * sc}" r="5.5" fill="#4aa8ff" ${sw(2.4)}/><circle cx="${cx + 54 * sc}" cy="${y0 - 30 * sc}" r="5.5" fill="#e8433f" ${sw(2.4)}/>` }; }
      case "band": { const ins = h.shape === "square" ? 0 : 11;
        return { front: `<path d="M${h.l + ins} ${h.y1 - 30} Q${cx} ${h.y1 - 38} ${h.r - ins} ${h.y1 - 30} L${h.r} ${h.y1 - 4} Q${cx} ${h.y1 - 12} ${h.l} ${h.y1 - 4}Z" fill="${c}" ${sw(4)}/><path d="M${h.r - 26} ${h.y1 - 18} L${h.r + 10} ${h.y1 - 40} L${h.r + 12} ${h.y1 - 4}Z" fill="${c}" ${sw(3.4)}/>` }; }
      case "phones": { const yt = h.y0 - 4, cy = h.y1 - 12 + (yt - (h.y1 - 12)) / 0.75;
        return { front: `<path d="M${h.l} ${h.y1 - 12} C${h.l} ${cy} ${h.r} ${cy} ${h.r} ${h.y1 - 12}" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/><path d="M${h.l} ${h.y1 - 12} C${h.l} ${cy} ${h.r} ${cy} ${h.r} ${h.y1 - 12}" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/><rect x="${h.l - 17}" y="${h.y1 - 26}" width="26" height="48" rx="12" fill="${c}" ${sw(4)}/><rect x="${h.r - 9}" y="${h.y1 - 26}" width="26" height="48" rx="12" fill="${c}" ${sw(4)}/>` }; }
      case "glasses": return { front: `<circle cx="${lx}" cy="${ly}" r="${R + 4}" fill="#d9efff" fill-opacity=".35" stroke="${INK}" stroke-width="5"/><circle cx="${rx}" cy="${ry}" r="${R + 4}" fill="#d9efff" fill-opacity=".35" stroke="${INK}" stroke-width="5"/><path d="M${lx + R + 4} ${ly} Q200 ${ly - 8} ${rx - R - 4} ${ry}" fill="none" stroke="${INK}" stroke-width="5"/>` };
      case "shades": return { front: `<rect x="${lx - R - 4}" y="${ly - R + 4}" width="${2 * R + 8}" height="${2 * R - 8}" rx="15" fill="${INK}"/><rect x="${rx - R - 4}" y="${ry - R + 4}" width="${2 * R + 8}" height="${2 * R - 8}" rx="15" fill="${INK}"/><path d="M${lx + R} ${ly - 6} H${rx - R}" stroke="${INK}" stroke-width="7"/><path d="M${lx - R + 8} ${ly - R + 12} l12 -2 M${rx - R + 8} ${ry - R + 12} l12 -2" stroke="#fff" stroke-opacity=".55" stroke-width="4" stroke-linecap="round"/>` };
      case "bow": return { front: `<g transform="translate(200 ${b.bowY})"><path d="M0 0 L-34 -18 V18Z M0 0 L34 -18 V18Z" fill="${c}" ${sw(4)}/><circle cx="0" cy="0" r="9" fill="${c}" ${sw(4)}/></g>` };
      case "cape": return { back: `<g class="pa-cape"><path d="M104 150 C70 220 56 300 52 372 C120 340 160 330 200 330 C240 330 280 340 348 372 C344 300 330 220 296 150Z" fill="${c}" ${sw(4)}/><path d="M104 160 C90 220 80 290 76 350 C112 332 140 326 168 324 C150 270 140 210 150 160Z" fill="#000" fill-opacity=".14"/></g>`, front: "" };
    }
    return { front: "", back: "" };
  }

  /* ---- arms and gloves. Every hand is built from its own fingers and thumb, so gestures read clearly. ---- */
  // [dx, dy, rotation, hand] for the left and right hand, relative to each shoulder (hands that hang down are turned 180 degrees)
  const POSES = {
    cheer: [[-44, -80, -12, "open"], [44, -80, 12, "open"]],
    wave: [[-52, 44, 188, "open"], [46, -86, 10, "open"]],
    thumbs: [[-56, -24, -10, "thumbs"], [56, -24, 10, "thumbs"]],
    rock: [[-44, -84, -14, "rock"], [44, -84, 14, "rock"]],
    relax: [[-50, 46, 172, "open"], [50, 46, -172, "open"]]
  };
  const finger = (x, y, len, rot, c, wd) => `<rect x="${x - (wd || 10.4) / 2}" y="${y - len}" width="${wd || 10.4}" height="${len + 5}" rx="${(wd || 10.4) / 2}" fill="${c}" ${sw(3.2)} transform="rotate(${rot} ${x} ${y})"/>`;
  // the thumb is on the left of the drawing; the palm outline only runs round the bottom so the fingers join it without a seam
  const palm = c => `<ellipse cx="0" cy="4" rx="17" ry="15" fill="${c}"/><path d="M-17 2 C-19 14 -9 20.5 0 20.5 C9 20.5 19 14 17 2" fill="none" ${sw(3.2)}/>`;
  const HANDS = {
    open: c => `${finger(-15, 7, 18, -64, c, 11)}${finger(-9, -4, 23, -17, c)}${finger(0, -7, 27, 0, c)}${finger(9, -4, 23, 17, c)}${palm(c)}`,
    thumbs: c => `<rect x="-14" y="-33" width="14" height="34" rx="7" fill="${c}" ${sw(3.2)} transform="rotate(-12 -7 0)"/><rect x="-20" y="-6" width="40" height="34" rx="14" fill="${c}" ${sw(3.2)}/><path d="M-4 5 H15 M-4 13 H15 M-4 21 H13" ${sw(2.4)} fill="none"/>`,
    rock: c => `${finger(-12, -2, 25, -15, c)}${finger(12, -2, 22, 15, c, 9.6)}<rect x="-20" y="-6" width="40" height="32" rx="13" fill="${c}" ${sw(3.2)}/><circle cx="-3" cy="-5" r="6.5" fill="${c}" ${sw(2.8)}/><circle cx="6" cy="-5" r="6" fill="${c}" ${sw(2.8)}/><ellipse cx="-3" cy="15" rx="13" ry="7.5" fill="${c}" ${sw(3)} transform="rotate(-14 -3 15)"/>`
  };
  const limb = d => `<path d="${d}" fill="none" ${ST} stroke-width="12"/>`;
  const shoe = (c, x, y, flip) => `<g transform="translate(${x} ${y}) scale(${flip ? -1 : 1} 1)"><path d="M-28 2 C-30 -14 -8 -24 10 -20 C26 -16 34 -4 32 6 C30 14 -28 14 -28 2Z" fill="${c}" ${sw(4.5)}/></g>`;

  function build(cfg, anim){
    const b = BODIES[cfg.body] || BODIES.pick, col = cfg.color, ac = cfg.accent;
    const [[lsx, lsy], [rsx, rsy]] = b.shoulders, [[llx, lly], [rlx, rly]] = b.legs;
    const acc = accSvg(cfg.acc, b, cfg.accColor);
    const legs = limb(`M${llx} ${lly} C${llx - 2} ${lly + 22} ${llx - 6} ${lly + 40} ${llx - 8} 356`) + limb(`M${rlx} ${rly} C${rlx + 2} ${rly + 22} ${rlx + 6} ${rly + 40} ${rlx + 8} 356`);
    const feet = shoe(ac, llx - 14, 366, false) + shoe(ac, rlx + 14, 366, true);
    const pose = POSES[cfg.pose] || POSES.cheer;
    const arms = pose.map(([dx, dy, rot, hs], i) => {
      const right = i === 1, sgn = right ? 1 : -1, sx = right ? rsx : lsx, sy = right ? rsy : lsy, hx = sx + dx, hy = sy + dy, r = rot * Math.PI / 180;
      const wx = hx - Math.sin(r) * 19, wy = hy + Math.cos(r) * 19;          // the wrist, just below the palm
      return `<g class="pa-arm ${right ? "r" : "l"}" style="transform-origin:${sx}px ${sy}px">${limb(`M${sx} ${sy} Q${sx + sgn * Math.abs(dx) * 0.9} ${sy + (dy > 0 ? dy * 0.2 : 8)} ${wx.toFixed(1)} ${wy.toFixed(1)}`)}<g transform="translate(${hx} ${hy}) rotate(${rot}) scale(${right ? 1 : -1} 1)">${HANDS[hs](ac)}</g></g>`;
    }).join("");
    const nm = (cfg.name || "").trim().slice(0, 10).replace(/[<>&"]/g, "");
    const name = nm ? `<text x="200" y="${b.nameY}" text-anchor="middle" font-family="'Caveat','Patrick Hand','Comic Sans MS',cursive" font-weight="700" font-size="${nm.length > 7 ? 27 : 32}" fill="${darkText(col) ? INK : "#fff"}" stroke="none">${nm}</text>` : "";
    const eyes = eyesSvg(cfg.eyes, b, cfg), mouth = mouthSvg(cfg.mouth, b.mouth), R2 = b.R + 4;
    const dmg = anim ? `
      <g class="d1"><path d="${b.cracks[0]}" fill="none" stroke="${INK}" stroke-width="3.6" ${ST}/><ellipse cx="${b.band[0] + 6}" cy="${b.band[1] + 30}" rx="15" ry="8" fill="#000" opacity=".2"/></g>
      <g class="d2"><path d="${b.cracks[1]}" fill="none" stroke="${INK}" stroke-width="3.6" ${ST}/>
        <g transform="translate(${b.band[0]} ${b.band[1]}) rotate(-24)"><rect x="-20" y="-7" width="40" height="14" rx="4" fill="#f2cf9a" ${sw(2.6)}/><rect x="-8" y="-7" width="16" height="14" fill="#e5b97a"/></g></g>
      <g class="d2"><path class="pa-sweat" d="M${b.eyes[1][0] + 40} ${b.eyes[1][1] - 24} Q${b.eyes[1][0] + 48} ${b.eyes[1][1] - 8} ${b.eyes[1][0] + 40} ${b.eyes[1][1]} Q${b.eyes[1][0] + 32} ${b.eyes[1][1] - 8} ${b.eyes[1][0] + 40} ${b.eyes[1][1] - 24}Z" fill="#8ecae6" ${sw(2.4)}/></g>
      <g class="d3">${b.eyes.map(e => `<circle cx="${e[0]}" cy="${e[1]}" r="${R2}" fill="#fff" ${sw(3)}/><path d="M${e[0]} ${e[1]} m0 0 a3 3 0 1 1 6 0 a7 7 0 1 1 -14 0 a11 11 0 1 1 22 0 a15 15 0 1 1 -30 0" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`).join("")}</g>
      <g class="dko">${b.eyes.map(e => `<circle cx="${e[0]}" cy="${e[1]}" r="${R2}" fill="#fff" ${sw(3)}/><path d="M${e[0] - 10} ${e[1] - 10} L${e[0] + 10} ${e[1] + 10} M${e[0] + 10} ${e[1] - 10} L${e[0] - 10} ${e[1] + 10}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`).join("")}</g>
      <g class="dko pa-stars"><g transform="translate(200 ${Math.max(30, b.top[1] - 36)})"><path d="${star(0, 0, 11, 5)}" fill="#ffc42b" ${sw(2.6)} transform="translate(-44 8)"/><path d="${star(0, 0, 13, 6)}" fill="#ffc42b" ${sw(2.6)} transform="translate(0 -8)"/><path d="${star(0, 0, 11, 5)}" fill="#ffc42b" ${sw(2.6)} transform="translate(44 8)"/></g></g>` : "";
    const flash = anim ? `<path class="pa-flash" d="${b.path}" fill="#ff3b3b"/>` : "";
    return `${acc.back || ""}${legs}${feet}${arms}<g class="pa-body">${b.draw(col)}${cheeks(b)}${eyes}${mouth}${name}${dmg}</g>${flash}${acc.front || ""}`;
  }
  const viewBox = (cfg, view) => {
    const b = BODIES[cfg.body] || BODIES.pick;
    if(view === "face") return `110 ${b.eyes[0][1] - 56} 180 ${b.mouth - b.eyes[0][1] + 100}`;
    if(view === "head") { const y = b.hat.y0 - 100; return `60 ${y} 280 ${b.mouth + 54 - y}`; }
    return "0 0 400 400";
  };

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

  const DEFAULTS = { name: "", body: "pick", color: PALETTE[0], accent: "#f7f4ee", pose: "cheer", eyes: "dots", eyeColor: "#3a3a3d", mouth: "smile", acc: "none", accColor: "" };
  const inList = (v, list) => list.some(x => (Array.isArray(x) ? x[0] : x) === v);
  // fills in anything missing and swaps values from older versions that no longer exist for the nearest current one
  const norm = cfg => {
    const c = Object.assign({}, DEFAULTS, cfg || {});
    if(!BODIES[c.body]) c.body = DEFAULTS.body;
    if(!POSES[c.pose]) c.pose = DEFAULTS.pose;
    if(!inList(c.eyes, OPTIONS.eyes)) c.eyes = DEFAULTS.eyes;
    if(!inList(c.mouth, OPTIONS.mouths)) c.mouth = DEFAULTS.mouth;
    if(!inList(c.acc, OPTIONS.acc)) c.acc = "none";
    if(!/^#[0-9a-f]{6}$/i.test(c.eyeColor)) c.eyeColor = DEFAULTS.eyeColor;
    if(!c.accColor) c.accColor = c.accent;
    return c;
  };

  function PlayerArt(el, cfg){
    injectCss(); cfg = norm(cfg);
    el.innerHTML = `<svg class="pa" viewBox="0 0 400 400" xmlns="${NS}" aria-hidden="true"><ellipse cx="200" cy="384" rx="104" ry="10" fill="${INK}" opacity=".14"/><g class="pa-hitg"><g class="pa-all">${build(cfg, true)}</g></g></svg>`;
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
  PlayerArt.svg = (cfg, view) => { cfg = norm(cfg); return `<svg viewBox="${viewBox(cfg, view)}" xmlns="${NS}"><g>${build(cfg, false)}</g></svg>`; };
  PlayerArt.options = OPTIONS;
  PlayerArt.presets = [];
  PlayerArt.norm = norm;
  window.PlayerArt = PlayerArt;

  /* ---- the saved character ---- */
  const KEY = "fma-player-v1";
  const pick = a => a[Math.floor(Math.random() * a.length)];
  window.Player = {
    random(){
      return norm({ body: pick(OPTIONS.bodies)[0], color: pick(PALETTE.slice(0, 11)), accent: pick(["#f7f4ee", "#f7f4ee", pick(PALETTE)]), pose: pick(OPTIONS.poses)[0],
        eyes: pick(OPTIONS.eyes.slice(0, 5))[0], eyeColor: pick(["#3a3a3d", "#3a3a3d", "#4aa8ff", "#4fb86a", "#a8723c"]), mouth: pick(OPTIONS.mouths)[0], acc: pick(OPTIONS.acc)[0], accColor: pick(PALETTE) });
    },
    get(){
      try{ const v = JSON.parse(localStorage.getItem(KEY)); if(v && v.body) return norm(v); }catch(e){}
      const r = this.random(); this.set(r); return r;
    },
    set(cfg){ try{ localStorage.setItem(KEY, JSON.stringify(norm(cfg))); }catch(e){} },
    has(){ try{ return !!localStorage.getItem(KEY); }catch(e){ return false; } }
  };
})();
