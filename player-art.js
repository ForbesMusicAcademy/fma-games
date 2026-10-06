/* "Your character": a customisable, animated vector player used across the Forbes Music Academy practice games.
   A classic chibi cartoon kid, teen or adult: big round head, thick even outlines, big white eyes with a black dot pupil, stubby limbs.
   (The things you battle in the games are instruments and equipment, so the player is always a person.)
   Eyes always have the same design (white circle, black dot); the eyelids carry the emotion. There are no eyebrows and no cheeks.
   A character is a small config, saved on the student's device:
     { name, body (kid/teen/adult), skin, hair, hairColor, eyes, mouth, mark, eyewear, top, color, bottom, pants, accent (shoes),
       pose, acc (head), accColor, gear, gearColor }
   Player.get() / Player.set(cfg) / Player.random()          the saved character (a random one the first time)
   PlayerArt(container, cfg)  -> animated controller:  setDamage(0..1), hurt(), attack(dir), cheer(), ko(), reset()
   PlayerArt.svg(cfg, view)   -> plain SVG string (menus, thumbnails); view = "full" | "head" | "face"
   PlayerArt.options          -> what the editor offers (lists run from sweet to wicked)
   Everything worn on the head (hair, hats, glasses) is drawn once in "head units" (the head is a circle of radius 1) and
   scaled to the age's head, so it fits kids, teens and adults alike. */
(function(){
  const NS = "http://www.w3.org/2000/svg";
  const INK = "#26211f";
  const ST = `stroke="${INK}" stroke-linejoin="round" stroke-linecap="round"`;
  const sw = w => `${ST} stroke-width="${w}"`;
  let uid = 0;                    // unique ids for the eye clip paths (many characters can be on one page)

  const SKINS = ["#ffe2c9", "#f6c9a2", "#e5ab7f", "#c98c5e", "#9b6a45", "#6d4730"];
  const PALETTE = ["#e8433f", "#ff6fa3", "#ff8a1c", "#ffc42b", "#9be04a", "#4fb86a", "#4fd0c0", "#4aa8ff", "#5470f0", "#a070e8", "#f7f4ee", "#a8723c", "#3a3a3d"];
  const HAIR_COLORS = ["#2b2623", "#5b3a1e", "#8b5a2b", "#c8761f", "#ffd34d", "#e8433f", "#ff6fa3", "#4aa8ff", "#a070e8", "#f7f4ee"];
  // Every list runs from sweet to wicked.
  const OPTIONS = {
    bodies: [["kid", "Kid"], ["teen", "Teen"], ["adult", "Adult"]],
    poses: [["cheer", "Cheer"], ["wave", "Wave"], ["thumbs", "Thumbs up"], ["rock", "Rock on"], ["relax", "Relaxed"]],
    hair: [["none", "None"], ["crop", "Short"], ["sweep", "Sweep"], ["curly", "Curly"], ["bun", "Bun"], ["pigtails", "Pigtails"], ["long", "Long"], ["spiky", "Spiky"]],
    eyes: [["calm", "Calm"], ["happy", "Happy"], ["wide", "Wide"], ["sleepy", "Sleepy"], ["sad", "Sad"], ["wink", "Wink"], ["sly", "Sly"], ["grumpy", "Grumpy"]],
    mouths: [["smile", "Smile"], ["kitty", "Kitty"], ["open", "Open"], ["tongue", "Tongue"], ["wow", "Wow"], ["grin", "Teeth"], ["smirk", "Smirk"], ["fangs", "Fangs"], ["snarl", "Snarl"]],
    marks: [["none", "None"], ["freckles", "Freckles"], ["plaster", "Plaster"], ["warpaint", "Paint"], ["scar", "Scar"]],
    eyewear: [["none", "None"], ["glasses", "Specs"], ["shades", "Shades"], ["mask", "Mask"], ["patch", "Eye patch"]],
    tops: [["tee", "T-shirt"], ["hoodie", "Hoodie"], ["stripes", "Stripes"], ["overalls", "Dungarees"]],
    bottoms: [["pants", "Pants"], ["shorts", "Shorts"], ["skirt", "Skirt"]],
    acc: [["none", "None"], ["bow", "Bow"], ["flower", "Flower"], ["halo", "Halo"], ["bunny", "Bunny"], ["cat", "Cat ears"], ["crown", "Crown"], ["party", "Party"], ["beanie", "Beanie"], ["cap", "Cap"], ["band", "Band"], ["phones", "Phones"], ["santa", "Santa"], ["elf", "Elf"], ["pirate", "Pirate"], ["horns", "Horns"]],
    gear: [["none", "None"], ["guitar", "Guitar"], ["sticks", "Sticks"], ["mic", "Mic"], ["cape", "Cape"]],
    skins: SKINS, palette: PALETTE, hairColors: HAIR_COLORS
  };
  const shade = (h, f) => "#" + [1, 3, 5].map(i => Math.max(0, Math.min(255, Math.round(parseInt(h.slice(i, i + 2), 16) * f))).toString(16).padStart(2, "0")).join("");
  const darkText = c => ["#f7f4ee", "#ffc42b", "#9be04a", "#ffd34d", "#4fd0c0", "#ff8a1c", "#4aa8ff"].includes(c);

  /* ---- the three ages: proportions only (kids have the biggest heads and the shortest legs) ---- */
  const AGES = {
    kid:   { hy: 152, hrx: 86, hry: 78, tTop: 226, tH: 62, tW: 86, hand: 1.08, reach: 0.82 },
    teen:  { hy: 140, hrx: 72, hry: 68, tTop: 204, tH: 80, tW: 90, hand: 1.16, reach: 0.92 },
    adult: { hy: 128, hrx: 62, hry: 60, tTop: 182, tH: 96, tW: 94, hand: 1.26, reach: 1.0 }
  };
  Object.values(AGES).forEach(a => { a.oy = a.hy + a.hrx - a.hry; });   // the unit head circle's centre (its top lines up with the real head)
  const FEET = 344;           // ankles; shoes sit just below
  const EYE_X = 0.33, EYE_R = 0.25;   // in head units: big eyes that almost touch

  /* ---- eyes: always a white circle with a black dot; only the lids change. Lids are skin-coloured and clipped to the eye. ---- */
  function eyesSvg(style, g, skin){
    const R = g.hrx * EYE_R, cy = g.oy + g.hrx * 0.0, xs = [200 - g.hrx * EYE_X, 200 + g.hrx * EYE_X];
    const eye = (x, side, kind) => {            // side: -1 for the left eye on screen, +1 for the right
      const id = "pe" + (++uid), lw = Math.max(3.2, R * 0.2);
      const pupil = kind === "wide" ? R * 0.2 : R * 0.36;
      const dotY = kind === "sleepy" || kind === "sly" ? cy + R * 0.12 : cy;
      // a lid covers the top (or bottom) of the eye along a line from the outer corner to the inner corner
      const upper = (yOuter, yInner) => { const xo = x + side * R * 1.2, xi = x - side * R * 1.2;
        return `<path d="M${xo.toFixed(1)} ${(cy + yOuter * R).toFixed(1)} L${xi.toFixed(1)} ${(cy + yInner * R).toFixed(1)} L${xi.toFixed(1)} ${cy - R * 1.4} L${xo.toFixed(1)} ${cy - R * 1.4}Z" fill="${skin}" ${sw(lw)}/>`; };
      let lid = "";
      switch(kind){
        case "sleepy": lid = upper(-0.02, -0.02); break;
        case "sly": lid = upper(-0.12, -0.44); break;
        case "grumpy": lid = upper(-0.72, -0.02); break;          // slants down towards the nose
        case "sad": lid = upper(-0.12, -0.72); break;             // droops at the outside
        case "happy": lid = `<path d="M${x - R * 1.2} ${cy + R * 0.28} Q${x} ${cy - R * 0.5} ${x + R * 1.2} ${cy + R * 0.28} L${x + R * 1.2} ${cy + R * 1.4} L${x - R * 1.2} ${cy + R * 1.4}Z" fill="${skin}" ${sw(lw)}/>`; break;
      }
      return `<clipPath id="${id}"><circle cx="${x}" cy="${cy}" r="${R}"/></clipPath><circle cx="${x}" cy="${cy}" r="${R}" fill="#fff"/><circle cx="${x}" cy="${dotY}" r="${pupil}" fill="${INK}" clip-path="url(#${id})"/><g clip-path="url(#${id})">${lid}</g><circle cx="${x}" cy="${cy}" r="${R}" fill="none" ${sw(Math.max(3.4, R * 0.2))}/>`;
    };
    const closed = (x) => `<path d="M${x - R * 0.9} ${cy + R * 0.1} Q${x} ${cy + R * 0.6} ${x + R * 0.9} ${cy + R * 0.1}" fill="none" ${sw(Math.max(3.6, R * 0.24))}/>`;
    if(style === "wink") return eye(xs[0], -1, "calm") + closed(xs[1]);
    return eye(xs[0], -1, style) + eye(xs[1], 1, style);
  }
  function mouthSvg(style, y){      // drawn around x=200 for a mouth 64 wide, scaled to the head by the caller
    const dark = "#5b1f24";
    switch(style){
      case "open": return `<path d="M170 ${y - 2} Q200 ${y + 8} 230 ${y - 2} Q226 ${y + 34} 200 ${y + 34} Q174 ${y + 34} 170 ${y - 2}Z" fill="${dark}" ${sw(5)}/><path d="M184 ${y + 24} Q200 ${y + 14} 216 ${y + 24} Q212 ${y + 33} 200 ${y + 33} Q188 ${y + 33} 184 ${y + 24}Z" fill="#ff7a94"/>`;
      case "grin": return `<path d="M166 ${y - 4} Q200 ${y + 10} 234 ${y - 4} Q232 ${y + 28} 200 ${y + 30} Q168 ${y + 28} 166 ${y - 4}Z" fill="#fff" ${sw(5)}/><path d="M170 ${y + 11} H230 M200 ${y + 3} V${y + 30}" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      case "tongue": return `<path d="M172 ${y} Q200 ${y + 20} 228 ${y}" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M188 ${y + 11} Q200 ${y + 42} 214 ${y + 11} Q201 ${y + 18} 188 ${y + 11}Z" fill="#ff7a94" ${sw(4)}/>`;
      case "wow": return `<ellipse cx="200" cy="${y + 12}" rx="13" ry="17" fill="${dark}" ${sw(5)}/><ellipse cx="200" cy="${y + 21}" rx="7" ry="6" fill="#ff7a94"/>`;
      case "kitty": return `<path d="M178 ${y + 2} Q189 ${y + 18} 200 ${y + 4} Q211 ${y + 18} 222 ${y + 2}" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
      case "smirk": return `<path d="M170 ${y + 8} Q198 ${y + 16} 234 ${y - 8}" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M232 ${y - 8} l6 -5" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
      case "fangs": return `<path d="M164 ${y - 4} Q200 ${y + 12} 236 ${y - 4} Q232 ${y + 22} 200 ${y + 24} Q168 ${y + 22} 164 ${y - 4}Z" fill="${dark}" ${sw(5)}/><path d="M174 ${y} L181 ${y + 18} L190 ${y + 6} M210 ${y + 6} L219 ${y + 18} L226 ${y}" fill="#fff" ${sw(3.4)}/>`;
      case "snarl": return `<path d="M160 ${y - 4} Q200 ${y + 36} 240 ${y - 4} Q200 ${y + 10} 160 ${y - 4}Z" fill="${dark}" ${sw(5)}/><path d="M170 ${y} L176 ${y + 12} L184 ${y + 3} L192 ${y + 14} L200 ${y + 4} L208 ${y + 14} L216 ${y + 3} L224 ${y + 12} L230 ${y}" fill="#fff" ${sw(3)}/>`;
      default: return `<path d="M168 ${y - 4} Q200 ${y + 26} 232 ${y - 4}" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
    }
  }

  /* ---- hair, in head units ---- */
  const HAIR_FRONT = {
    crop: `<path d="M-1.04 0.08 C-1.14 -0.7 -0.7 -1.2 0 -1.2 C0.7 -1.2 1.14 -0.7 1.04 0.08 C0.95 -0.36 0.6 -0.62 0 -0.62 C-0.6 -0.62 -0.95 -0.36 -1.04 0.08Z"/>`,
    sweep: `<path d="M-1.06 0.14 C-1.16 -0.78 -0.6 -1.24 0.1 -1.24 C0.82 -1.24 1.16 -0.7 1.06 0.14 C1.0 -0.28 0.86 -0.5 0.62 -0.56 C0.3 -0.18 -0.32 -0.5 -0.7 -0.42 C-0.9 -0.36 -1.0 -0.2 -1.06 0.14Z"/><path d="M-0.5 -1.18 C-0.55 -1.5 -0.2 -1.62 0.1 -1.46 C-0.1 -1.4 -0.2 -1.3 -0.1 -1.2Z"/>`,
    spiky: `<path d="M-1.05 0.05 L-1.12 -0.55 L-0.78 -0.78 L-0.86 -1.3 L-0.42 -0.98 L-0.22 -1.5 L0.04 -1.0 L0.34 -1.46 L0.5 -0.94 L0.86 -1.3 L0.84 -0.76 L1.14 -0.58 L1.05 0.05 C0.92 -0.4 0.5 -0.6 0 -0.6 C-0.5 -0.6 -0.92 -0.4 -1.05 0.05Z"/>`,
    bun: `<path d="M-1.04 0.08 C-1.14 -0.7 -0.7 -1.2 0 -1.2 C0.7 -1.2 1.14 -0.7 1.04 0.08 C0.95 -0.36 0.6 -0.62 0 -0.62 C-0.6 -0.62 -0.95 -0.36 -1.04 0.08Z"/><circle cx="0" cy="-1.42" r="0.34"/>`,
    long: `<path d="M-1.04 0.08 C-1.14 -0.7 -0.7 -1.2 0 -1.2 C0.7 -1.2 1.14 -0.7 1.04 0.08 C0.95 -0.36 0.6 -0.62 0 -0.62 C-0.6 -0.62 -0.95 -0.36 -1.04 0.08Z"/>`,
    pigtails: `<path d="M-1.04 0.08 C-1.14 -0.7 -0.7 -1.2 0 -1.2 C0.7 -1.2 1.14 -0.7 1.04 0.08 C0.95 -0.36 0.6 -0.62 0 -0.62 C-0.6 -0.62 -0.95 -0.36 -1.04 0.08Z"/>`
  };
  function hairSvg(style, color, g){
    if(style === "none") return { back: "", front: "" };
    const W = x => (x / g.hrx).toFixed(4), sS = `${ST} stroke-width="${W(5)}"`;
    const T = body => `<g transform="translate(200 ${g.oy}) scale(${g.hrx})" fill="${color}" ${sS}>${body}</g>`;
    const shine = `<path d="M-0.62 -1.0 C-0.4 -1.14 -0.1 -1.18 0.14 -1.16" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width="${W(7)}" stroke-linecap="round"/>`;
    if(style === "curly"){
      const cs = [[-0.86, -0.4, 0.4], [-0.58, -0.92, 0.42], [0, -1.08, 0.46], [0.58, -0.92, 0.42], [0.86, -0.4, 0.4]];
      const ring = cs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join("");
      return { back: "", front: `<g transform="translate(200 ${g.oy}) scale(${g.hrx})" fill="${color}" ${sS}><g stroke-width="${W(11)}">${ring}</g><g stroke="none">${ring}</g></g>` };
    }
    let back = "";
    if(style === "long") back = T(`<path d="M-1.0 -0.3 C-1.28 0.4 -1.32 1.4 -1.0 1.85 C-0.8 1.95 -0.5 1.85 -0.5 1.62 L-0.6 0.2Z"/><path d="M1.0 -0.3 C1.28 0.4 1.32 1.4 1.0 1.85 C0.8 1.95 0.5 1.85 0.5 1.62 L0.6 0.2Z"/>`);
    if(style === "pigtails") back = T(`<path d="M-1.0 -0.4 C-1.5 -0.2 -1.62 0.7 -1.38 1.3 C-1.08 1.3 -0.92 0.8 -0.96 0.1Z"/><path d="M1.0 -0.4 C1.5 -0.2 1.62 0.7 1.38 1.3 C1.08 1.3 0.92 0.8 0.96 0.1Z"/><circle cx="-1.04" cy="-0.28" r="0.15" fill="#e8433f"/><circle cx="1.04" cy="-0.28" r="0.15" fill="#e8433f"/>`);
    return { back, front: T(HAIR_FRONT[style] || "") + (style === "spiky" ? "" : `<g transform="translate(200 ${g.oy}) scale(${g.hrx})">${shine}</g>`) };
  }

  /* ---- things worn on the head (hats, ears, halo, horns), in head units ---- */
  function headSvg(kind, g, c){
    // hats that sit on the forehead are lifted so they stay above the big eyes
    const lift = ["beanie", "cap", "santa", "elf", "pirate", "band"].includes(kind) ? -0.16 : 0;
    const dk = shade(c, 0.72), W = x => (x / g.hrx).toFixed(4), U = body => `<g transform="translate(200 ${g.oy}) scale(${g.hrx})" ${ST} stroke-width="${W(5)}"><g transform="translate(0 ${lift})">${body}</g></g>`;
    const dome = (top, base) => `M-1.1 ${base} C-1.18 ${top + 0.08} -0.6 ${top} 0 ${top} C0.6 ${top} 1.18 ${top + 0.08} 1.1 ${base}Z`;
    switch(kind){
      case "bow": return U(`<g transform="translate(0.62 -1.0) rotate(18)"><path d="M0 0 C-0.3 -0.5 -0.85 -0.4 -0.78 0.04 C-0.7 0.46 -0.3 0.4 0 0Z" fill="${c}"/><path d="M0 0 C0.3 -0.5 0.85 -0.4 0.78 0.04 C0.7 0.46 0.3 0.4 0 0Z" fill="${c}"/><circle cx="0" cy="0" r="0.15" fill="${dk}"/></g>`);
      case "flower": return U(`<g transform="translate(-0.66 -0.9)">${[0, 1, 2, 3, 4].map(i => { const a = i * 72 * Math.PI / 180; return `<circle cx="${(Math.sin(a) * 0.2).toFixed(3)}" cy="${(-Math.cos(a) * 0.2).toFixed(3)}" r="0.17" fill="${c}"/>`; }).join("")}<circle r="0.13" fill="#ffc42b"/></g>`);
      case "halo": return U(`<ellipse cx="0" cy="-1.5" rx="0.62" ry="0.16" fill="none" stroke="${INK}" stroke-width="${W(15)}"/><ellipse cx="0" cy="-1.5" rx="0.62" ry="0.16" fill="none" stroke="#ffd34d" stroke-width="${W(8)}"/>`);
      case "bunny": return U(`<g transform="rotate(-9 -0.4 -1)"><ellipse cx="-0.4" cy="-1.62" rx="0.2" ry="0.66" fill="#f7f4ee"/><ellipse cx="-0.4" cy="-1.6" rx="0.09" ry="0.46" fill="#ffaabd" stroke="none"/></g><g transform="rotate(9 0.4 -1)"><ellipse cx="0.4" cy="-1.62" rx="0.2" ry="0.66" fill="#f7f4ee"/><ellipse cx="0.4" cy="-1.6" rx="0.09" ry="0.46" fill="#ffaabd" stroke="none"/></g>`);
      case "cat": return U(`<path d="M-0.98 -0.5 L-0.86 -1.5 L-0.28 -1.0Z" fill="${c}"/><path d="M-0.8 -0.9 L-0.78 -1.2 L-0.52 -1.0Z" fill="#ffaabd" stroke="none"/><path d="M0.98 -0.5 L0.86 -1.5 L0.28 -1.0Z" fill="${c}"/><path d="M0.8 -0.9 L0.78 -1.2 L0.52 -1.0Z" fill="#ffaabd" stroke="none"/>`);
      case "crown": return U(`<path d="M-0.72 -0.86 L-0.88 -1.5 L-0.42 -1.14 L0 -1.62 L0.42 -1.14 L0.88 -1.5 L0.72 -0.86 Q0 -0.7 -0.72 -0.86Z" fill="#ffc42b"/><circle cx="-0.88" cy="-1.5" r="0.08" fill="#e8433f" stroke="none"/><circle cx="0" cy="-1.62" r="0.08" fill="#4aa8ff" stroke="none"/><circle cx="0.88" cy="-1.5" r="0.08" fill="#e8433f" stroke="none"/>`);
      case "party": return U(`<g transform="rotate(10)"><path d="M-0.62 -0.86 L0.1 -2.0 L0.66 -0.8 Q0 -0.55 -0.62 -0.86Z" fill="${c}"/><path d="M-0.4 -1.14 Q0.05 -0.98 0.45 -1.12 M-0.2 -1.5 Q0.1 -1.4 0.3 -1.5" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="${W(5)}"/><circle cx="0.1" cy="-2.02" r="0.16" fill="#ffc42b"/></g>`);
      case "beanie": return U(`<path d="${dome(-1.5, -0.3)}" fill="${c}"/><rect x="-1.16" y="-0.58" width="2.32" height="0.46" rx="0.16" fill="${c}"/><path d="M-0.84 -0.54 V-0.16 M-0.56 -0.54 V-0.16 M-0.28 -0.54 V-0.16 M0 -0.54 V-0.16 M0.28 -0.54 V-0.16 M0.56 -0.54 V-0.16 M0.84 -0.54 V-0.16" fill="none" stroke-opacity=".28" stroke-width="${W(3)}"/><circle cx="0" cy="-1.58" r="0.24" fill="#fff"/>`);
      case "cap": return U(`<path d="${dome(-1.38, -0.16)}" fill="${c}"/><path d="M0 -1.34 V-0.2" fill="none" stroke-opacity=".25" stroke-width="${W(3)}"/><circle cx="0" cy="-1.38" r="0.07" fill="${dk}"/><path d="M-0.98 -0.2 C-0.5 0.16 0.5 0.16 0.98 -0.2 C0.5 -0.4 -0.5 -0.4 -0.98 -0.2Z" fill="${dk}"/>`);
      case "band": return U(`<path d="M-1.04 -0.36 Q0 -0.74 1.04 -0.36 L1.04 -0.12 Q0 -0.5 -1.04 -0.12Z" fill="${c}"/><path d="M0.82 -0.4 L1.3 -0.66 L1.24 -0.04Z" fill="${c}"/>`);
      case "phones": return U(`<path d="M-1.02 -0.04 C-1.12 -1.5 1.12 -1.5 1.02 -0.04" fill="none" stroke="${INK}" stroke-width="${W(12)}"/><path d="M-1.02 -0.04 C-1.12 -1.5 1.12 -1.5 1.02 -0.04" fill="none" stroke="${c}" stroke-width="${W(6)}"/><rect x="-1.2" y="-0.28" width="0.3" height="0.62" rx="0.14" fill="${c}"/><rect x="0.9" y="-0.28" width="0.3" height="0.62" rx="0.14" fill="${c}"/>`);
      case "santa": return U(`<path d="M-1.1 -0.3 C-1.18 -1.1 -0.5 -1.55 0.2 -1.5 C0.9 -1.45 1.5 -1.1 1.56 -0.5 C1.2 -0.95 0.8 -1.08 0.4 -1.08 C-0.2 -1.0 -0.8 -0.7 -1.1 -0.3Z" fill="${c}"/><path d="M-1.1 -0.3 C-1.18 -1.1 -0.5 -1.5 0.3 -1.2 C0.8 -1.0 1.1 -0.7 1.1 -0.3Z" fill="${c}"/><rect x="-1.18" y="-0.62" width="2.36" height="0.5" rx="0.25" fill="#fff"/><circle cx="1.58" cy="-0.36" r="0.24" fill="#fff"/>`);
      case "elf": return U(`<path d="M-1.1 -0.3 C-1.16 -1.0 -0.9 -1.5 -1.5 -1.95 C-0.7 -1.85 0.4 -1.6 0.8 -1.1 C1.1 -0.8 1.14 -0.5 1.1 -0.3Z" fill="${c}"/><rect x="-1.16" y="-0.6" width="2.32" height="0.46" rx="0.16" fill="#e8433f"/><circle cx="-1.52" cy="-1.98" r="0.16" fill="#ffc42b"/>`);
      case "pirate": return U(`<path d="M-1.5 -0.32 C-1.1 -0.95 -0.55 -1.4 0 -1.4 C0.55 -1.4 1.1 -0.95 1.5 -0.32 C1.0 -0.14 0.5 -0.5 0 -0.5 C-0.5 -0.5 -1.0 -0.14 -1.5 -0.32Z" fill="#2a2a2e"/><path d="M-1.38 -0.4 C-0.95 -0.12 -0.45 -0.5 0 -0.5 C0.45 -0.5 0.95 -0.12 1.38 -0.4" fill="none" stroke="#ffc42b" stroke-width="${W(7)}"/><circle cx="0" cy="-0.95" r="0.18" fill="#fff"/><path d="M-0.34 -0.7 L0.34 -0.7 M-0.3 -0.6 L0.3 -0.6" fill="none" stroke="#fff" stroke-width="${W(4)}"/>`);
      case "horns": return U(`<path d="M-0.5 -0.95 C-0.72 -1.3 -0.56 -1.62 -0.26 -1.8 C-0.32 -1.5 -0.18 -1.25 -0.12 -1.0Z" fill="#d7262f"/><path d="M0.5 -0.95 C0.72 -1.3 0.56 -1.62 0.26 -1.8 C0.32 -1.5 0.18 -1.25 0.12 -1.0Z" fill="#d7262f"/>`);
    }
    return "";
  }
  /* ---- the face: marks and eyewear, in head units ---- */
  function faceSvg(mark, eyewear, g, skin){
    const W = x => (x / g.hrx).toFixed(4), U = body => `<g transform="translate(200 ${g.oy}) scale(${g.hrx})" ${ST} stroke-width="${W(5)}">${body}</g>`, ex = EYE_X, er = EYE_R;
    let out = "";
    switch(mark){
      case "freckles": out += U(`<g fill="#b5764a" stroke="none">${[[-0.18, 0.3], [-0.06, 0.38], [0.06, 0.3], [0.18, 0.38], [-0.3, 0.42], [0.3, 0.42], [0, 0.2]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="0.035"/>`).join("")}</g>`); break;
      case "plaster": out += U(`<g transform="translate(0 0.3) rotate(-16)"><rect x="-0.26" y="-0.09" width="0.52" height="0.18" rx="0.07" fill="#f2cf9a" stroke-width="${W(3.4)}"/><rect x="-0.07" y="-0.09" width="0.14" height="0.18" fill="#e5b97a" stroke="none"/></g>`); break;
      case "warpaint": out += U(`<g fill="none" stroke="#d7262f" stroke-width="${W(7)}"><path d="M${-ex - 0.22} 0.34 L${-ex + 0.2} 0.34 M${-ex - 0.2} 0.46 L${-ex + 0.16} 0.46"/><path d="M${ex - 0.2} 0.34 L${ex + 0.22} 0.34 M${ex - 0.16} 0.46 L${ex + 0.2} 0.46"/></g>`); break;
      case "scar": out += U(`<path d="M0.52 -0.34 L0.86 0.34" fill="none" stroke="#b5483f" stroke-width="${W(7)}"/><path d="M0.56 -0.14 l0.18 -0.07 M0.64 0.04 l0.18 -0.07 M0.72 0.2 l0.18 -0.07" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="${W(3.4)}"/>`); break;
    }
    switch(eyewear){
      case "glasses": out += U(`<circle cx="${-ex}" cy="0" r="${er + 0.1}" fill="#d9efff" fill-opacity=".3"/><circle cx="${ex}" cy="0" r="${er + 0.1}" fill="#d9efff" fill-opacity=".3"/><path d="M${-ex + er + 0.1} -0.02 Q0 -0.12 ${ex - er - 0.1} -0.02 M${-ex - er - 0.1} -0.04 L-1.0 -0.1 M${ex + er + 0.1} -0.04 L1.0 -0.1" fill="none"/>`); break;
      case "shades": out += U(`<rect x="${-ex - er - 0.1}" y="${-er - 0.04}" width="${2 * er + 0.2}" height="${2 * er}" rx="0.18" fill="${INK}"/><rect x="${ex - er - 0.1}" y="${-er - 0.04}" width="${2 * er + 0.2}" height="${2 * er}" rx="0.18" fill="${INK}"/><path d="M${-ex + er + 0.1} -0.1 H${ex - er - 0.1} M${-ex - er - 0.1} -0.08 L-1.0 -0.14 M${ex + er + 0.1} -0.08 L1.0 -0.14" fill="none"/><path d="M${-ex - 0.14} -0.1 l0.14 -0.04 M${ex - 0.14} -0.1 l0.14 -0.04" stroke="#fff" stroke-opacity=".55" stroke-width="${W(4)}" fill="none"/>`); break;
      case "mask": out += U(`<path d="M-1.02 -0.3 Q0 -0.56 1.02 -0.3 Q1.08 0.3 0.62 0.36 Q0.3 0.28 0 0.3 Q-0.3 0.28 -0.62 0.36 Q-1.08 0.3 -1.02 -0.3Z" fill="#4aa8ff"/><circle cx="${-ex}" cy="0" r="${er - 0.02}" fill="#fff"/><circle cx="${ex}" cy="0" r="${er - 0.02}" fill="#fff"/><circle cx="${-ex}" cy="0" r="${er * 0.36}" fill="${INK}" stroke="none"/><circle cx="${ex}" cy="0" r="${er * 0.36}" fill="${INK}" stroke="none"/>`); break;
      case "patch": out += U(`<path d="M${-1.0} -0.46 L${ex - er - 0.1} -0.1 M${ex + er + 0.05} -0.1 L1.0 -0.5" fill="none" stroke-width="${W(5)}"/><circle cx="${ex}" cy="0" r="${er + 0.08}" fill="#2a2a2e"/>`); break;
    }
    return out;
  }
  /* ---- gear worn on the body: guitar on a strap, drumsticks on the back, a headset mic, a cape ---- */
  function gearSvg(kind, g, c){
    const x0 = 200 - g.tW / 2, x1 = 200 + g.tW / 2, tBot = g.tTop + g.tH, s = g.tW / 90;
    switch(kind){
      case "guitar": return { mid: `<path d="M${x0 + 6} ${g.tTop + 4} L${200 + 26 * s} ${tBot - 4}" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="M${x0 + 6} ${g.tTop + 4} L${200 + 26 * s} ${tBot - 4}" stroke="#a8723c" stroke-width="7" stroke-linecap="round"/>
        <g transform="translate(${200 + 16 * s} ${tBot - 2 * s}) rotate(-34) scale(${(s * 0.92).toFixed(3)})"><rect x="26" y="-9" width="104" height="14" rx="4" fill="#e0bf82" ${sw(5)}/><path d="M50 -9 V5 M72 -9 V5 M94 -9 V5 M114 -9 V5" stroke="${INK}" stroke-opacity=".4" stroke-width="2"/><rect x="126" y="-13" width="30" height="21" rx="6" fill="${shade(c, 0.7)}" ${sw(5)}/><circle cx="136" cy="-6" r="2.5" fill="#fff"/><circle cx="146" cy="-6" r="2.5" fill="#fff"/><g fill="${c}" ${sw(5)}><ellipse cx="-12" cy="8" rx="38" ry="30"/><ellipse cx="14" cy="-8" rx="26" ry="21"/></g><g fill="${c}" stroke="none"><ellipse cx="-12" cy="8" rx="35" ry="27"/><ellipse cx="14" cy="-8" rx="23" ry="18"/></g><circle cx="-6" cy="8" r="9" fill="#2a2a2e"/><rect x="-34" y="2" width="12" height="9" rx="2" fill="#2a2a2e"/></g>` };
      case "sticks": { const ty = g.hy - g.hry * 0.55, out = g.hrx + 50;       // crossed behind the shoulders, tips poking out past the head
        const st = (xa, xb) => `<path d="M${xa} ${g.tTop + 22} L${xb} ${ty}" stroke="${INK}" stroke-width="14" stroke-linecap="round"/><path d="M${xa} ${g.tTop + 22} L${xb} ${ty}" stroke="#e0bf82" stroke-width="8" stroke-linecap="round"/><circle cx="${xb}" cy="${ty}" r="9" fill="#e0bf82" ${sw(4)}/>`;
        return { back: st(200 + 16, 200 - out) + st(200 - 16, 200 + out) }; }
      case "mic": { const W = x => (x / g.hrx).toFixed(4), U = body => `<g transform="translate(200 ${g.oy}) scale(${g.hrx})" fill="none" ${ST} stroke-width="${W(6)}">${body}</g>`;
        return { head: U(`<path d="M-1.02 -0.1 C-1.1 -1.3 1.1 -1.3 1.02 -0.1" stroke-width="${W(7)}"/><circle cx="-1.04" cy="0.1" r="0.2" fill="${c}"/><path d="M-1.0 0.28 C-0.98 0.9 -0.6 1.04 -0.26 0.9" stroke-width="${W(6)}"/><circle cx="-0.2" cy="0.9" r="0.13" fill="#2a2a2e"/>`) }; }
      case "cape": { const y0 = g.tTop + 8, y1 = FEET + 6;
        return { back: `<g class="pa-cape"><path d="M${x0 - 2} ${y0} C${x0 - 36} ${y0 + 70} ${x0 - 42} ${y1 - 30} ${x0 - 32} ${y1} C${x0 + 20} ${y1 - 18} ${x1 - 20} ${y1 - 18} ${x1 + 32} ${y1} C${x1 + 42} ${y1 - 30} ${x1 + 36} ${y0 + 70} ${x1 + 2} ${y0}Z" fill="${c}" ${sw(6)}/></g>` }; }
    }
    return {};
  }

  /* ---- arms and gloves. Cartoon gloves: three tapered, curved fingers and a thumb, the middle finger tallest. ---- */
  // where each hand goes (absolute, from the head and body size, so a kid's hands clear a big head). The hand continues the forearm.
  const POSES = {
    cheer: g => [[200 - (g.hrx + 38), g.hy + 4, "open"], [200 + (g.hrx + 38), g.hy + 4, "open"]],
    wave: g => [[200 - (g.tW / 2 + 36), g.tTop + g.tH + 4, "open"], [200 + (g.hrx + 44), g.hy - g.hry * 0.45, "open"]],
    thumbs: g => [[200 - (g.tW / 2 + 50), g.tTop + 40, "thumbs"], [200 + (g.tW / 2 + 50), g.tTop + 40, "thumbs"]],
    rock: g => [[200 - (g.hrx + 38), g.hy - g.hry * 0.3, "rock"], [200 + (g.hrx + 38), g.hy - g.hry * 0.3, "rock"]],
    relax: g => [[200 - (g.tW / 2 + 30), g.tTop + g.tH + 8, "open"], [200 + (g.tW / 2 + 30), g.tTop + g.tH + 8, "open"]]
  };
  // a finger that is skinny at the base and fat at the tip, with a little bend
  function digit(bx, by, tx, ty, bend, wb, wt, c, sk){
    const dx = tx - bx, dy = ty - by, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L, mx = (bx + tx) / 2 + nx * bend, my = (by + ty) / 2 + ny * bend, wm = (wb + wt) / 2, f = n => n.toFixed(1);
    return `<path d="M${f(bx + nx * wb / 2)} ${f(by + ny * wb / 2)} Q${f(mx + nx * wm / 2)} ${f(my + ny * wm / 2)} ${f(tx + nx * wt / 2)} ${f(ty + ny * wt / 2)} A${f(wt / 2)} ${f(wt / 2)} 0 0 0 ${f(tx - nx * wt / 2)} ${f(ty - ny * wt / 2)} Q${f(mx - nx * wm / 2)} ${f(my - ny * wm / 2)} ${f(bx - nx * wb / 2)} ${f(by - ny * wb / 2)}Z" fill="${c}" ${sw(3.6)}/>`;
  }
  const palmBlob = (c, sk) => `<ellipse cx="0" cy="2" rx="16" ry="14" fill="${c}"/><path d="M-16 0 C-18 12 -8 17 0 17 C8 17 18 12 16 0" fill="none" ${sw(3.6)}/><path d="M-5 5 Q0 9 6 5" fill="none" stroke="${shade(c, 0.78)}" stroke-width="2.4" stroke-linecap="round"/>`;
  const HANDS = {
    open: c => `${digit(-12, 4, -27, -11, -3, 8, 11, c)}${digit(-8, -6, -13, -30, 2, 7.5, 11.5, c)}${digit(0, -8, 1, -38, 0, 8, 12.5, c)}${digit(8, -6, 14, -30, -2, 7.5, 11.5, c)}${palmBlob(c)}`,
    thumbs: c => `${digit(-6, -4, -9, -33, -3, 10, 13, c)}<rect x="-18" y="-8" width="36" height="30" rx="13" fill="${c}" ${sw(3.6)}/><path d="M-6 4 H14 M-6 11 H14 M-6 18 H12" ${sw(2.8)} fill="none"/>`,
    rock: c => `${digit(-10, -6, -24, -33, 3, 7.5, 11.5, c)}${digit(11, -6, 25, -29, -3, 7, 10.5, c)}<rect x="-18" y="-8" width="36" height="30" rx="13" fill="${c}" ${sw(3.6)}/><circle cx="-1" cy="-6" r="6" fill="${c}" ${sw(3.2)}/><ellipse cx="-2" cy="14" rx="12" ry="6.5" fill="${c}" ${sw(3.4)} transform="rotate(-12 -2 14)"/>`
  };
  // a limb drawn as a tube: dark outline underneath, colour on top
  const tube = (d, w, col) => `<path d="${d}" fill="none" ${ST} stroke-width="${w + 9}"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  function qsplit(S, C, E, t){
    const mx = S[0] + t * (C[0] - S[0]), my = S[1] + t * (C[1] - S[1]);
    const px = (1 - t) * (1 - t) * S[0] + 2 * (1 - t) * t * C[0] + t * t * E[0], py = (1 - t) * (1 - t) * S[1] + 2 * (1 - t) * t * C[1] + t * t * E[1];
    const nx = (1 - t) * C[0] + t * E[0], ny = (1 - t) * C[1] + t * E[1], f = n => n.toFixed(1);
    return { head: `M${f(S[0])} ${f(S[1])} Q${f(mx)} ${f(my)} ${f(px)} ${f(py)}`, rest: `M${f(px)} ${f(py)} Q${f(nx)} ${f(ny)} ${f(E[0])} ${f(E[1])}` };
  }
  const shoe = (c, x, y, flip) => `<g transform="translate(${x} ${y}) scale(${flip ? -1 : 1} 1)"><path d="M-20 4 C-22 -12 -8 -18 6 -16 C20 -14 28 -4 26 6 C24 13 -20 14 -20 4Z" fill="${c}" ${sw(5)}/><path d="M-19 8 H25" stroke="${INK}" stroke-opacity=".35" stroke-width="3" fill="none"/></g>`;
  const rrect = (x0, y0, x1, y1, r) => `M${x0 + r} ${y0} H${x1 - r} Q${x1} ${y0} ${x1} ${y0 + r} V${y1 - r} Q${x1} ${y1} ${x1 - r} ${y1} H${x0 + r} Q${x0} ${y1} ${x0} ${y1 - r} V${y0 + r} Q${x0} ${y0} ${x0 + r} ${y0}Z`;
  function star(cx, cy, r1, r2){
    let d = ""; for(let i = 0; i < 10; i++){ const a = -Math.PI / 2 + Math.PI * i / 5, r = i % 2 ? r2 : r1; d += (i ? "L" : "M") + (cx + r * Math.cos(a)).toFixed(1) + " " + (cy + r * Math.sin(a)).toFixed(1); }
    return d + "Z";
  }

  function build(cfg, anim){
    const g = AGES[cfg.body] || AGES.kid, skin = cfg.skin, col = cfg.color, pants = cfg.pants, shoeC = cfg.accent;
    const tBot = g.tTop + g.tH, x0 = 200 - g.tW / 2, x1 = 200 + g.tW / 2, r = g.tW * 0.26;
    const hair = hairSvg(cfg.hair, cfg.hairColor, g), headAcc = headSvg(cfg.acc, g, cfg.accColor), gear = gearSvg(cfg.gear, g, cfg.gearColor);
    const lx = 200 - g.tW * 0.2, rx = 200 + g.tW * 0.2;

    // legs and shoes
    const leg = (x, y0, y1, c) => tube(`M${x} ${y0} L${x} ${y1}`, 15, c);
    let legs;
    if(cfg.bottom === "pants") legs = leg(lx, tBot - 10, FEET, pants) + leg(rx, tBot - 10, FEET, pants);
    else if(cfg.bottom === "shorts") legs = leg(lx, tBot - 10, FEET, skin) + leg(rx, tBot - 10, FEET, skin) + leg(lx, tBot - 10, tBot + 26, pants) + leg(rx, tBot - 10, tBot + 26, pants);
    else legs = leg(lx, tBot - 10, FEET, skin) + leg(rx, tBot - 10, FEET, skin);
    const skirt = cfg.bottom === "skirt" ? `<path d="M${x0 - 2} ${tBot - 8} L${x0 - 20} ${tBot + 36} Q200 ${tBot + 46} ${x1 + 20} ${tBot + 36} L${x1 + 2} ${tBot - 8}Z" fill="${pants}" ${sw(5)}/>` : "";
    const feet = shoe(shoeC, lx - 6, FEET + 12, false) + shoe(shoeC, rx + 6, FEET + 12, true);

    // torso and top, with a soft shadow down one side
    let torso = `<path d="${rrect(x0, g.tTop, x1, tBot, r)}" fill="${col}" ${sw(6)}/>`;
    torso += `<path d="${rrect(x1 - 16, g.tTop + 6, x1 - 3, tBot - 6, 6)}" fill="#000" opacity=".1"/>`;
    const mid = g.tTop + g.tH / 2;
    if(cfg.top === "stripes"){ for(let i = 1; i <= 3; i++){ const y = g.tTop + (g.tH * i) / 4; torso += `<path d="M${x0 + 3} ${y} H${x1 - 3}" stroke="${shade(col, 0.6)}" stroke-width="${g.tH * 0.12}" fill="none"/>`; } torso += `<path d="${rrect(x0, g.tTop, x1, tBot, r)}" fill="none" ${sw(6)}/>`; }
    if(cfg.top === "hoodie"){ torso += `<path d="M${200 - g.tW * 0.34} ${tBot - g.tH * 0.42} H${200 + g.tW * 0.34} L${200 + g.tW * 0.4} ${tBot - 8} H${200 - g.tW * 0.4}Z" fill="${shade(col, 0.88)}" ${sw(4)}/><path d="M${200 - 8} ${g.tTop + 8} V${g.tTop + g.tH * 0.38} M${200 + 8} ${g.tTop + 8} V${g.tTop + g.tH * 0.38}" ${sw(3.4)} fill="none"/>`; }
    if(cfg.top === "overalls"){ torso += `<path d="M${x0 + 6} ${g.tTop + g.tH * 0.4} H${x1 - 6} V${tBot - 2} H${x0 + 6}Z" fill="${pants}" ${sw(4.5)}/><path d="M${x0 + 18} ${g.tTop + g.tH * 0.4} V${g.tTop + 3} M${x1 - 18} ${g.tTop + g.tH * 0.4} V${g.tTop + 3}" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="M${x0 + 18} ${g.tTop + g.tH * 0.4} V${g.tTop + 3} M${x1 - 18} ${g.tTop + g.tH * 0.4} V${g.tTop + 3}" fill="none" stroke="${pants}" stroke-width="7" stroke-linecap="round"/><circle cx="${x0 + 18}" cy="${g.tTop + g.tH * 0.4 + 6}" r="3.6" fill="#ffc42b"/><circle cx="${x1 - 18}" cy="${g.tTop + g.tH * 0.4 + 6}" r="3.6" fill="#ffc42b"/>`; }
    const nm = (cfg.name || "").trim().slice(0, 10).replace(/[<>&"]/g, "");
    const name = nm ? `<text x="200" y="${(mid + 8).toFixed(0)}" text-anchor="middle" font-family="'Caveat','Patrick Hand','Comic Sans MS',cursive" font-weight="700" font-size="${nm.length > 7 ? 19 : 23}" fill="${darkText(cfg.top === "overalls" ? pants : col) ? INK : "#fff"}" stroke="none">${nm}</text>` : "";

    // arms: the forearm flows straight into the hand, so the wrist never looks broken
    const pose = (POSES[cfg.pose] || POSES.cheer)(g), long = cfg.top === "hoodie" || cfg.top === "stripes", hsz = g.hand;
    const arms = pose.map(([hx, hy, hnd], i) => {
      const right = i === 1, sgn = right ? 1 : -1, S = [right ? x1 - 5 : x0 + 5, g.tTop + 18], H = [hx, hy];
      const C = [S[0] + sgn * Math.abs(H[0] - S[0]) * 0.9, S[1] + (H[1] > S[1] ? (H[1] - S[1]) * 0.2 : 8)];
      let dirx = H[0] - C[0], diry = H[1] - C[1]; const dl = Math.hypot(dirx, diry) || 1; dirx /= dl; diry /= dl;
      let E, ang;
      if(hnd === "thumbs"){ ang = sgn * 12; E = [H[0] - sgn * 16 * hsz, H[1] + 4 * hsz]; }       // forearm comes in from the side, thumb stays up
      else { ang = Math.atan2(dirx, -diry) * 180 / Math.PI; E = [H[0] - dirx * 13 * hsz, H[1] - diry * 13 * hsz]; }
      const whole = `M${S[0]} ${S[1]} Q${C[0].toFixed(1)} ${C[1].toFixed(1)} ${E[0].toFixed(1)} ${E[1].toFixed(1)}`;
      const cut = qsplit(S, C, E, long ? 0.84 : 0.42), cuff = long ? qsplit(S, C, E, 0.84) : null;
      let arm = tube(whole, 12, skin) + tube(cut.head, 12.5, col);
      if(long) arm += tube(cuff.rest, 12.5, shade(col, 0.82));
      // the left hand is mirrored so the thumb always points in towards the body
      return `<g class="pa-arm ${right ? "r" : "l"}" style="transform-origin:${S[0]}px ${S[1]}px">${arm}<g transform="translate(${H[0].toFixed(1)} ${H[1].toFixed(1)}) rotate(${ang.toFixed(1)}) scale(${(right ? hsz : -hsz).toFixed(2)} ${hsz})">${HANDS[hnd](skin)}</g></g>`;
    }).join("");

    // head and face (no cheeks, no eyebrows)
    const oy = g.oy, my = oy + g.hrx * 0.5, m = g.hrx * 0.27 / 32;
    const ears = `<circle cx="${200 - g.hrx * 0.98}" cy="${oy + g.hrx * 0.1}" r="${g.hrx * 0.17}" fill="${skin}" ${sw(5)}/><circle cx="${200 + g.hrx * 0.98}" cy="${oy + g.hrx * 0.1}" r="${g.hrx * 0.17}" fill="${skin}" ${sw(5)}/>`;
    const head = `<ellipse cx="200" cy="${g.hy}" rx="${g.hrx}" ry="${g.hry}" fill="${skin}" ${sw(6)}/>`;
    const mouth = `<g transform="translate(${(200 - 200 * m).toFixed(1)} ${my.toFixed(1)}) scale(${m.toFixed(3)})">${mouthSvg(cfg.mouth, 0)}</g>`;
    const R = g.hrx * EYE_R, ex = g.hrx * EYE_X;
    const eyeList = [[200 - ex, oy], [200 + ex, oy]];
    const dmg = anim ? `
      <g class="d1"><g transform="translate(${200 + g.hrx * 0.5} ${oy + g.hrx * 0.52}) rotate(-24) scale(${g.hrx / 70})"><rect x="-17" y="-6" width="34" height="12" rx="4" fill="#f2cf9a" ${sw(3)}/><rect x="-6" y="-6" width="12" height="12" fill="#e5b97a"/></g></g>
      <g class="d2"><g transform="translate(${200 - g.hrx * 0.5} ${oy - g.hrx * 0.62}) rotate(20) scale(${g.hrx / 70})"><rect x="-17" y="-6" width="34" height="12" rx="4" fill="#f2cf9a" ${sw(3)}/><rect x="-6" y="-6" width="12" height="12" fill="#e5b97a"/></g><path class="pa-sweat" d="M${200 + g.hrx * 0.92} ${oy - g.hrx * 0.5} q9 15 0 22 q-9 -7 0 -22Z" fill="#8ecae6" ${sw(3)}/></g>
      <g class="d3">${eyeList.map(e => `<circle cx="${e[0]}" cy="${e[1]}" r="${R}" fill="#fff" ${sw(3.6)}/><path d="M${e[0]} ${e[1]} m0 0 a${R * 0.1} ${R * 0.1} 0 1 1 ${R * 0.2} 0 a${R * 0.25} ${R * 0.25} 0 1 1 -${R * 0.5} 0 a${R * 0.4} ${R * 0.4} 0 1 1 ${R * 0.8} 0 a${R * 0.55} ${R * 0.55} 0 1 1 -${R * 1.1} 0" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`).join("")}</g>
      <g class="dko">${eyeList.map(e => `<circle cx="${e[0]}" cy="${e[1]}" r="${R}" fill="#fff" ${sw(3.6)}/><path d="M${e[0] - R * 0.55} ${e[1] - R * 0.55} L${e[0] + R * 0.55} ${e[1] + R * 0.55} M${e[0] + R * 0.55} ${e[1] - R * 0.55} L${e[0] - R * 0.55} ${e[1] + R * 0.55}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`).join("")}</g>
      <g class="dko pa-stars"><g transform="translate(200 ${Math.max(26, g.hy - g.hry - 34)})"><path d="${star(0, 0, 11, 5)}" fill="#ffc42b" ${sw(2.6)} transform="translate(-48 8)"/><path d="${star(0, 0, 13, 6)}" fill="#ffc42b" ${sw(2.6)} transform="translate(0 -8)"/><path d="${star(0, 0, 11, 5)}" fill="#ffc42b" ${sw(2.6)} transform="translate(48 8)"/></g></g>` : "";
    const flash = anim ? `<g class="pa-flash" fill="#ff3b3b"><ellipse cx="200" cy="${g.hy}" rx="${g.hrx}" ry="${g.hry}"/><path d="${rrect(x0, g.tTop, x1, tBot, r)}"/></g>` : "";
    return `${gear.back || ""}${hair.back}${legs}${skirt}${feet}${torso}${name}${gear.mid || ""}${arms}<g class="pa-body">${ears}${head}${eyesSvg(cfg.eyes, g, skin)}${faceSvg(cfg.mark, cfg.eyewear, g, skin)}${mouth}${hair.front}${headAcc}${gear.head || ""}${dmg}</g>${flash}`;
  }
  const viewBox = (cfg, view) => {
    const g = AGES[cfg.body] || AGES.kid;
    if(view === "face") return `${200 - g.hrx * 1.2} ${g.oy - g.hrx * 0.7} ${g.hrx * 2.4} ${g.hrx * 1.75}`;
    if(view === "head") return `${200 - g.hrx * 1.5} ${g.oy - g.hrx * 2.05} ${g.hrx * 3} ${g.hrx * 3.5}`;
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
.pa-cape{transform-box:view-box;transform-origin:200px 200px;animation:pa-cape 1.8s ease-in-out infinite}
@keyframes pa-cape{0%,100%{transform:skewX(0)}50%{transform:skewX(2.5deg)}}
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

  const DEFAULTS = { name: "", body: "kid", skin: SKINS[1], hair: "crop", hairColor: HAIR_COLORS[1], eyes: "calm", mouth: "smile", mark: "none", eyewear: "none", top: "tee", color: PALETTE[7], bottom: "pants", pants: PALETTE[8], accent: PALETTE[0], pose: "cheer", acc: "none", accColor: PALETTE[0], gear: "none", gearColor: PALETTE[6] };
  const inList = (v, list) => list.some(x => (Array.isArray(x) ? x[0] : x) === v);
  const isHex = v => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v);
  // fills in anything missing; values from older versions that no longer exist fall back to a default
  const norm = cfg => {
    const c = Object.assign({}, DEFAULTS, cfg || {});
    if(!AGES[c.body]) c.body = DEFAULTS.body;
    if(!POSES[c.pose]) c.pose = DEFAULTS.pose;
    if(!inList(c.eyes, OPTIONS.eyes)) c.eyes = DEFAULTS.eyes;
    if(!inList(c.mouth, OPTIONS.mouths)) c.mouth = DEFAULTS.mouth;
    if(!inList(c.hair, OPTIONS.hair)) c.hair = DEFAULTS.hair;
    if(!inList(c.top, OPTIONS.tops)) c.top = DEFAULTS.top;
    if(!inList(c.bottom, OPTIONS.bottoms)) c.bottom = DEFAULTS.bottom;
    if(!inList(c.mark, OPTIONS.marks)) c.mark = "none";
    if(!inList(c.eyewear, OPTIONS.eyewear)) c.eyewear = "none";
    if(!inList(c.acc, OPTIONS.acc)) c.acc = "none";
    if(!inList(c.gear, OPTIONS.gear)) c.gear = "none";
    ["skin", "hairColor", "color", "pants", "accent", "accColor", "gearColor"].forEach(k => { if(!isHex(c[k])) c[k] = DEFAULTS[k]; });
    return c;
  };

  function PlayerArt(el, cfg){
    injectCss(); cfg = norm(cfg);
    el.innerHTML = `<svg class="pa" viewBox="0 0 400 400" xmlns="${NS}" aria-hidden="true"><ellipse cx="200" cy="384" rx="92" ry="9" fill="${INK}" opacity=".14"/><g class="pa-hitg"><g class="pa-all">${build(cfg, true)}</g></g></svg>`;
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
      return norm({ body: pick(OPTIONS.bodies)[0], skin: pick(SKINS), hair: pick(OPTIONS.hair)[0], hairColor: pick(HAIR_COLORS), eyes: pick(OPTIONS.eyes)[0],
        mouth: pick(OPTIONS.mouths)[0], mark: pick(["none", "none", ...OPTIONS.marks.map(a => a[0])]), eyewear: pick(["none", "none", "none", ...OPTIONS.eyewear.map(a => a[0])]),
        top: pick(OPTIONS.tops)[0], color: pick(PALETTE), bottom: pick(OPTIONS.bottoms)[0], pants: pick(PALETTE), accent: pick(PALETTE), pose: pick(OPTIONS.poses)[0],
        acc: pick(["none", ...OPTIONS.acc.map(a => a[0])]), accColor: pick(PALETTE), gear: pick(["none", "none", ...OPTIONS.gear.map(a => a[0])]), gearColor: pick(PALETTE) });
    },
    get(){
      try{ const v = JSON.parse(localStorage.getItem(KEY)); if(v && v.body) return norm(v); }catch(e){}
      const r = this.random(); this.set(r); return r;
    },
    set(cfg){ try{ localStorage.setItem(KEY, JSON.stringify(norm(cfg))); }catch(e){} },
    has(){ try{ return !!localStorage.getItem(KEY); }catch(e){ return false; } }
  };
})();
