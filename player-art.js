/* "Your character": a customisable, animated vector player used across the Forbes Music Academy practice games.
   A classic chibi cartoon kid, teen or adult: big round head, thick even outlines, tiny dot eyes, stubby limbs, flat colours.
   (The things you battle in the games are instruments and equipment, so the player is always a person.)
   A character is a small config, saved on the student's device:
     { name, body (kid/teen/adult), skin, hair, hairColor, eyes, eyeColor, mouth, top, color, bottom, pants, accent (shoes), pose, acc, accColor }
   Player.get() / Player.set(cfg) / Player.random()          the saved character (a random one the first time)
   PlayerArt(container, cfg)  -> animated controller:  setDamage(0..1), hurt(), attack(dir), cheer(), ko(), reset()
   PlayerArt.svg(cfg, view)   -> plain SVG string (menus, thumbnails); view = "full" | "head" | "face"
   PlayerArt.options          -> what the editor offers
   Everything worn on the head (hair, hats, glasses) is drawn once in "head units" (the head is a circle of radius 1) and
   scaled to the age's head, so it fits kids, teens and adults alike. */
(function(){
  const NS = "http://www.w3.org/2000/svg";
  const INK = "#26211f";
  const ST = `stroke="${INK}" stroke-linejoin="round" stroke-linecap="round"`;
  const sw = w => `${ST} stroke-width="${w}"`;

  const SKINS = ["#ffe2c9", "#f6c9a2", "#e5ab7f", "#c98c5e", "#9b6a45", "#6d4730"];
  const PALETTE = ["#e8433f", "#ff6fa3", "#ff8a1c", "#ffc42b", "#9be04a", "#4fb86a", "#4fd0c0", "#4aa8ff", "#5470f0", "#a070e8", "#f7f4ee", "#a8723c", "#3a3a3d"];
  const HAIR_COLORS = ["#2b2623", "#5b3a1e", "#8b5a2b", "#c8761f", "#ffd34d", "#e8433f", "#ff6fa3", "#4aa8ff", "#a070e8", "#f7f4ee"];
  const EYE_COLORS = ["#2b2623", "#5b3a1e", "#4aa8ff", "#4fb86a", "#a070e8"];
  const OPTIONS = {
    bodies: [["kid", "Kid"], ["teen", "Teen"], ["adult", "Adult"]],
    poses: [["cheer", "Cheer"], ["wave", "Wave"], ["thumbs", "Thumbs up"], ["rock", "Rock on"], ["relax", "Relaxed"]],
    hair: [["none", "None"], ["crop", "Short"], ["sweep", "Sweep"], ["spiky", "Spiky"], ["curly", "Curly"], ["bun", "Bun"], ["long", "Long"], ["pigtails", "Pigtails"]],
    eyes: [["dots", "Dots"], ["sparkle", "Sparkle"], ["googly", "Googly"], ["happy", "Happy"], ["wink", "Wink"], ["sleepy", "Sleepy"], ["starry", "Starry"]],
    mouths: [["smile", "Smile"], ["open", "Open smile"], ["grin", "Teeth"], ["tongue", "Tongue out"], ["wow", "Wow"], ["kitty", "Kitty"]],
    tops: [["tee", "T-shirt"], ["hoodie", "Hoodie"], ["stripes", "Stripes"], ["overalls", "Dungarees"]],
    bottoms: [["pants", "Pants"], ["shorts", "Shorts"], ["skirt", "Skirt"]],
    acc: [["none", "None"], ["beanie", "Beanie"], ["cap", "Cap"], ["santa", "Santa"], ["pirate", "Pirate"], ["elf", "Elf"], ["party", "Party"], ["crown", "Crown"], ["band", "Band"], ["phones", "Phones"], ["glasses", "Specs"], ["shades", "Shades"], ["mask", "Mask"], ["cape", "Cape"]],
    skins: SKINS, palette: PALETTE, hairColors: HAIR_COLORS, eyeColors: EYE_COLORS
  };
  const shade = (h, f) => "#" + [1, 3, 5].map(i => Math.max(0, Math.min(255, Math.round(parseInt(h.slice(i, i + 2), 16) * f))).toString(16).padStart(2, "0")).join("");
  const darkText = c => ["#f7f4ee", "#ffc42b", "#9be04a", "#ffd34d", "#4fd0c0", "#ff8a1c", "#4aa8ff"].includes(c);

  /* ---- the three ages: proportions only (kids have the biggest heads and the shortest legs) ---- */
  const AGES = {
    kid:   { hy: 152, hrx: 86, hry: 78, tTop: 226, tH: 62, tW: 86, hand: 0.78, reach: 0.82 },
    teen:  { hy: 140, hrx: 72, hry: 68, tTop: 204, tH: 80, tW: 90, hand: 0.88, reach: 0.92 },
    adult: { hy: 128, hrx: 62, hry: 60, tTop: 182, tH: 96, tW: 94, hand: 0.98, reach: 1.0 }
  };
  Object.values(AGES).forEach(a => { a.oy = a.hy + a.hrx - a.hry; });   // the unit head circle's centre
  const FEET = 344;           // ankles; shoes sit just below

  /* ---- faces: simple and round ---- */
  function star(cx, cy, r1, r2){
    let d = ""; for(let i = 0; i < 10; i++){ const a = -Math.PI / 2 + Math.PI * i / 5, r = i % 2 ? r2 : r1; d += (i ? "L" : "M") + (cx + r * Math.cos(a)).toFixed(1) + " " + (cy + r * Math.sin(a)).toFixed(1); }
    return d + "Z";
  }
  function eyesSvg(style, eyes, k, ec){
    const [[lx, ly], [rx, ry]] = eyes;
    const arc = (x, y) => `<path d="M${x - 15 * k} ${y + 6 * k} Q${x} ${y - 16 * k} ${x + 15 * k} ${y + 6 * k}" fill="none" stroke="${INK}" stroke-width="${Math.max(3, 6 * k)}" stroke-linecap="round"/>`;
    const dot = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="${12 * k}" ry="${15 * k}" fill="${ec}" ${sw(Math.max(2, 3 * k))}/><circle cx="${x - 3.5 * k}" cy="${y - 5.5 * k}" r="${4.4 * k}" fill="#fff"/>`;
    const sparkle = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="${16 * k}" ry="${20 * k}" fill="${INK}"/><ellipse cx="${x}" cy="${y + 3 * k}" rx="${12.5 * k}" ry="${15.5 * k}" fill="${ec}"/><ellipse cx="${x}" cy="${y + 4 * k}" rx="${7 * k}" ry="${9 * k}" fill="${INK}"/><circle cx="${x - 5.5 * k}" cy="${y - 7 * k}" r="${5.6 * k}" fill="#fff"/><circle cx="${x + 5 * k}" cy="${y + 8 * k}" r="${2.7 * k}" fill="#fff"/>`;
    const googly = (x, y, s) => `<circle cx="${x}" cy="${y}" r="${19 * k}" fill="#fff" ${sw(Math.max(2, 3.5 * k))}/><circle cx="${x + s * 5 * k}" cy="${y + 5 * k}" r="${9 * k}" fill="${ec}"/><circle cx="${x + s * 5 * k - 2.5 * k}" cy="${y + 2.5 * k}" r="${3 * k}" fill="#fff"/>`;
    const sleepy = (x, y) => `<path d="M${x - 14 * k} ${y - 2 * k} A${14 * k} ${14 * k} 0 0 0 ${x + 14 * k} ${y - 2 * k}Z" fill="${INK}"/><path d="M${x - 17 * k} ${y - 2 * k} H${x + 17 * k}" stroke="${INK}" stroke-width="${Math.max(3, 5 * k)}" stroke-linecap="round"/>`;
    const starry = (x, y) => `<path d="${star(x, y, 19 * k, 8.5 * k)}" fill="#ffc42b" ${sw(Math.max(2, 3 * k))}/>`;
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
  function mouthSvg(style, y){      // drawn around x=200 for a mouth 64 wide, scaled to the head by the caller
    switch(style){
      case "open": return `<path d="M170 ${y - 2} Q200 ${y + 8} 230 ${y - 2} Q226 ${y + 34} 200 ${y + 34} Q174 ${y + 34} 170 ${y - 2}Z" fill="#5b1f24" ${sw(5)}/><path d="M184 ${y + 24} Q200 ${y + 14} 216 ${y + 24} Q212 ${y + 33} 200 ${y + 33} Q188 ${y + 33} 184 ${y + 24}Z" fill="#ff7a94"/>`;
      case "grin": return `<path d="M166 ${y - 4} Q200 ${y + 10} 234 ${y - 4} Q232 ${y + 28} 200 ${y + 30} Q168 ${y + 28} 166 ${y - 4}Z" fill="#fff" ${sw(5)}/><path d="M170 ${y + 11} H230 M200 ${y + 3} V${y + 30}" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      case "tongue": return `<path d="M172 ${y} Q200 ${y + 20} 228 ${y}" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M188 ${y + 11} Q200 ${y + 42} 214 ${y + 11} Q201 ${y + 18} 188 ${y + 11}Z" fill="#ff7a94" ${sw(4)}/>`;
      case "wow": return `<ellipse cx="200" cy="${y + 12}" rx="13" ry="17" fill="#5b1f24" ${sw(5)}/><ellipse cx="200" cy="${y + 21}" rx="7" ry="6" fill="#ff7a94"/>`;
      case "kitty": return `<path d="M178 ${y + 2} Q189 ${y + 18} 200 ${y + 4} Q211 ${y + 18} 222 ${y + 2}" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
      default: return `<path d="M168 ${y - 4} Q200 ${y + 26} 232 ${y - 4}" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
    }
  }

  /* ---- hair, in head units (head = circle of radius 1 at 0,0; face is the lower half) ---- */
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
    if(style === "curly"){
      const cs = [[-0.86, -0.4, 0.4], [-0.58, -0.92, 0.42], [0, -1.08, 0.46], [0.58, -0.92, 0.42], [0.86, -0.4, 0.4]];
      const ring = cs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join("");
      return { back: "", front: `<g transform="translate(200 ${g.oy}) scale(${g.hrx})" fill="${color}" ${sS}><g stroke-width="${W(11)}">${ring}</g><g stroke="none">${ring}</g></g>` };
    }
    let back = "";
    if(style === "long") back = T(`<path d="M-1.0 -0.3 C-1.28 0.4 -1.32 1.4 -1.0 1.85 C-0.8 1.95 -0.5 1.85 -0.5 1.62 L-0.6 0.2Z"/><path d="M1.0 -0.3 C1.28 0.4 1.32 1.4 1.0 1.85 C0.8 1.95 0.5 1.85 0.5 1.62 L0.6 0.2Z"/>`);
    if(style === "pigtails") back = T(`<path d="M-1.0 -0.4 C-1.5 -0.2 -1.62 0.7 -1.38 1.3 C-1.08 1.3 -0.92 0.8 -0.96 0.1Z"/><path d="M1.0 -0.4 C1.5 -0.2 1.62 0.7 1.38 1.3 C1.08 1.3 0.92 0.8 0.96 0.1Z"/><circle cx="-1.04" cy="-0.28" r="0.15" fill="#e8433f"/><circle cx="1.04" cy="-0.28" r="0.15" fill="#e8433f"/>`);
    return { back, front: T(HAIR_FRONT[style] || "") };
  }

  /* ---- things worn on the head and face, in head units ---- */
  function accSvg(kind, g, c, cfg){
    const dk = shade(c, 0.72), W = x => (x / g.hrx).toFixed(4), U = body => `<g transform="translate(200 ${g.oy}) scale(${g.hrx})" ${ST} stroke-width="${W(5)}">${body}</g>`;
    const dome = (top, base) => `M-1.1 ${base} C-1.18 ${top + 0.08} -0.6 ${top} 0 ${top} C0.6 ${top} 1.18 ${top + 0.08} 1.1 ${base}Z`;
    switch(kind){
      case "beanie": return { front: U(`<path d="${dome(-1.5, -0.3)}" fill="${c}"/><rect x="-1.16" y="-0.58" width="2.32" height="0.46" rx="0.16" fill="${c}"/><path d="M-0.84 -0.54 V-0.16 M-0.56 -0.54 V-0.16 M-0.28 -0.54 V-0.16 M0 -0.54 V-0.16 M0.28 -0.54 V-0.16 M0.56 -0.54 V-0.16 M0.84 -0.54 V-0.16" fill="none" stroke-opacity=".28" stroke-width="${W(3)}"/><circle cx="0" cy="-1.58" r="0.24" fill="#fff"/>`) };
      case "cap": return { front: U(`<path d="${dome(-1.38, -0.16)}" fill="${c}"/><path d="M0 -1.34 V-0.2" fill="none" stroke-opacity=".25" stroke-width="${W(3)}"/><circle cx="0" cy="-1.38" r="0.07" fill="${dk}"/><path d="M-0.98 -0.2 C-0.5 0.16 0.5 0.16 0.98 -0.2 C0.5 -0.4 -0.5 -0.4 -0.98 -0.2Z" fill="${dk}"/>`) };
      case "santa": return { front: U(`<path d="M-1.1 -0.3 C-1.18 -1.1 -0.5 -1.55 0.2 -1.5 C0.9 -1.45 1.5 -1.1 1.56 -0.5 C1.2 -0.95 0.8 -1.08 0.4 -1.08 C-0.2 -1.0 -0.8 -0.7 -1.1 -0.3Z" fill="${c}"/><path d="M-1.1 -0.3 C-1.18 -1.1 -0.5 -1.5 0.3 -1.2 C0.8 -1.0 1.1 -0.7 1.1 -0.3Z" fill="${c}"/><rect x="-1.18" y="-0.62" width="2.36" height="0.5" rx="0.25" fill="#fff"/><circle cx="1.58" cy="-0.36" r="0.24" fill="#fff"/>`) };
      case "pirate": return { front: U(`<path d="M-1.5 -0.32 C-1.1 -0.95 -0.55 -1.4 0 -1.4 C0.55 -1.4 1.1 -0.95 1.5 -0.32 C1.0 -0.14 0.5 -0.5 0 -0.5 C-0.5 -0.5 -1.0 -0.14 -1.5 -0.32Z" fill="#2a2a2e"/><path d="M-1.38 -0.4 C-0.95 -0.12 -0.45 -0.5 0 -0.5 C0.45 -0.5 0.95 -0.12 1.38 -0.4" fill="none" stroke="#ffc42b" stroke-width="${W(7)}"/><circle cx="0" cy="-0.95" r="0.18" fill="#fff"/><path d="M-0.34 -0.7 L0.34 -0.7 M-0.3 -0.6 L0.3 -0.6" fill="none" stroke="#fff" stroke-width="${W(4)}"/>`) };
      case "elf": return { front: U(`<path d="M-1.1 -0.3 C-1.16 -1.0 -0.9 -1.5 -1.5 -1.95 C-0.7 -1.85 0.4 -1.6 0.8 -1.1 C1.1 -0.8 1.14 -0.5 1.1 -0.3Z" fill="${c}"/><rect x="-1.16" y="-0.6" width="2.32" height="0.46" rx="0.16" fill="#e8433f"/><circle cx="-1.52" cy="-1.98" r="0.16" fill="#ffc42b"/>`) };
      case "party": return { front: U(`<g transform="rotate(10)"><path d="M-0.62 -0.86 L0.1 -2.0 L0.66 -0.8 Q0 -0.55 -0.62 -0.86Z" fill="${c}"/><path d="M-0.4 -1.14 Q0.05 -0.98 0.45 -1.12 M-0.2 -1.5 Q0.1 -1.4 0.3 -1.5" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="${W(5)}"/><circle cx="0.1" cy="-2.02" r="0.16" fill="#ffc42b"/></g>`) };
      case "crown": return { front: U(`<path d="M-0.72 -0.86 L-0.88 -1.5 L-0.42 -1.14 L0 -1.62 L0.42 -1.14 L0.88 -1.5 L0.72 -0.86 Q0 -0.7 -0.72 -0.86Z" fill="#ffc42b"/><circle cx="-0.88" cy="-1.5" r="0.08" fill="#e8433f"/><circle cx="0" cy="-1.62" r="0.08" fill="#4aa8ff"/><circle cx="0.88" cy="-1.5" r="0.08" fill="#e8433f"/>`) };
      case "band": return { front: U(`<path d="M-1.04 -0.36 Q0 -0.74 1.04 -0.36 L1.04 -0.12 Q0 -0.5 -1.04 -0.12Z" fill="${c}"/><path d="M0.82 -0.4 L1.3 -0.66 L1.24 -0.04Z" fill="${c}"/>`) };
      case "phones": return { front: U(`<path d="M-1.02 -0.04 C-1.12 -1.5 1.12 -1.5 1.02 -0.04" fill="none" stroke="${INK}" stroke-width="${W(12)}"/><path d="M-1.02 -0.04 C-1.12 -1.5 1.12 -1.5 1.02 -0.04" fill="none" stroke="${c}" stroke-width="${W(6)}" /><rect x="-1.2" y="-0.28" width="0.3" height="0.62" rx="0.14" fill="${c}"/><rect x="0.9" y="-0.28" width="0.3" height="0.62" rx="0.14" fill="${c}"/>`) };
      case "glasses": return { front: U(`<circle cx="-0.36" cy="0.1" r="0.3" fill="#d9efff" fill-opacity=".35"/><circle cx="0.36" cy="0.1" r="0.3" fill="#d9efff" fill-opacity=".35"/><path d="M-0.06 0.06 Q0 0 0.06 0.06" fill="none"/><path d="M-0.66 0.06 L-1.0 0.0 M0.66 0.06 L1.0 0.0" fill="none"/>`) };
      case "shades": return { front: U(`<rect x="-0.7" y="-0.12" width="0.68" height="0.5" rx="0.18" fill="${INK}"/><rect x="0.02" y="-0.12" width="0.68" height="0.5" rx="0.18" fill="${INK}"/><path d="M-0.1 -0.02 H0.1 M-0.7 -0.04 L-1.0 -0.1 M0.7 -0.04 L1.0 -0.1" fill="none"/><path d="M-0.58 0.0 l0.18 -0.04 M0.14 0.0 l0.18 -0.04" stroke="#fff" stroke-opacity=".55" stroke-width="${W(4)}" fill="none"/>`) };
      case "mask": return { front: U(`<path d="M-1.0 -0.16 Q0 -0.5 1.0 -0.16 Q1.06 0.36 0.56 0.4 Q0.3 0.3 0 0.34 Q-0.3 0.3 -0.56 0.4 Q-1.06 0.36 -1.0 -0.16Z" fill="${c}"/><ellipse cx="-0.36" cy="0.08" rx="0.22" ry="0.17" fill="#fff"/><ellipse cx="0.36" cy="0.08" rx="0.22" ry="0.17" fill="#fff"/><circle cx="-0.34" cy="0.1" r="0.07" fill="${INK}" stroke="none"/><circle cx="0.34" cy="0.1" r="0.07" fill="${INK}" stroke="none"/>`) };
      case "cape": { const x0 = 200 - g.tW / 2 - 2, x1 = 200 + g.tW / 2 + 2, y0 = g.tTop + 8, y1 = FEET + 6;
        return { back: `<g class="pa-cape"><path d="M${x0} ${y0} C${x0 - 34} ${y0 + 70} ${x0 - 40} ${y1 - 30} ${x0 - 30} ${y1} C${x0 + 20} ${y1 - 18} ${x1 - 20} ${y1 - 18} ${x1 + 30} ${y1} C${x1 + 40} ${y1 - 30} ${x1 + 34} ${y0 + 70} ${x1} ${y0}Z" fill="${c}" ${sw(6)}/></g>`, front: "" }; }
    }
    return { front: "", back: "" };
  }

  /* ---- arms and gloves (skin-coloured hands; each finger and thumb is its own shape) ---- */
  const POSES = {
    cheer: [[-46, -84, -12, "open"], [46, -84, 12, "open"]],
    wave: [[-54, 42, 188, "open"], [48, -90, 10, "open"]],
    thumbs: [[-58, -26, -10, "thumbs"], [58, -26, 10, "thumbs"]],
    rock: [[-46, -88, -14, "rock"], [46, -88, 14, "rock"]],
    relax: [[-52, 46, 172, "open"], [52, 46, -172, "open"]]
  };
  const finger = (x, y, len, rot, c, wd) => `<rect x="${x - (wd || 10.4) / 2}" y="${y - len}" width="${wd || 10.4}" height="${len + 5}" rx="${(wd || 10.4) / 2}" fill="${c}" ${sw(3.4)} transform="rotate(${rot} ${x} ${y})"/>`;
  const palm = c => `<ellipse cx="0" cy="4" rx="17" ry="15" fill="${c}"/><path d="M-17 2 C-19 14 -9 20.5 0 20.5 C9 20.5 19 14 17 2" fill="none" ${sw(3.4)}/>`;
  const HANDS = {
    open: c => `${finger(-15, 7, 18, -64, c, 11)}${finger(-9, -4, 23, -17, c)}${finger(0, -7, 27, 0, c)}${finger(9, -4, 23, 17, c)}${palm(c)}`,
    thumbs: c => `<rect x="-14" y="-33" width="14" height="34" rx="7" fill="${c}" ${sw(3.4)} transform="rotate(-12 -7 0)"/><rect x="-20" y="-6" width="40" height="34" rx="14" fill="${c}" ${sw(3.4)}/><path d="M-4 5 H15 M-4 13 H15 M-4 21 H13" ${sw(2.6)} fill="none"/>`,
    rock: c => `${finger(-12, -2, 25, -15, c)}${finger(12, -2, 22, 15, c, 9.6)}<rect x="-20" y="-6" width="40" height="32" rx="13" fill="${c}" ${sw(3.4)}/><circle cx="-3" cy="-5" r="6.5" fill="${c}" ${sw(3)}/><circle cx="6" cy="-5" r="6" fill="${c}" ${sw(3)}/><ellipse cx="-3" cy="15" rx="13" ry="7.5" fill="${c}" ${sw(3.2)} transform="rotate(-14 -3 15)"/>`
  };
  // a limb drawn as a tube: dark outline underneath, colour on top
  const tube = (d, w, col) => `<path d="${d}" fill="none" ${ST} stroke-width="${w + 9}"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  // the first part (0..t) and the rest (t..1) of a quadratic curve S-C-E, so a sleeve can cover part of an arm
  function qsplit(S, C, E, t){
    const mx = S[0] + t * (C[0] - S[0]), my = S[1] + t * (C[1] - S[1]);
    const px = (1 - t) * (1 - t) * S[0] + 2 * (1 - t) * t * C[0] + t * t * E[0], py = (1 - t) * (1 - t) * S[1] + 2 * (1 - t) * t * C[1] + t * t * E[1];
    const nx = (1 - t) * C[0] + t * E[0], ny = (1 - t) * C[1] + t * E[1], f = n => n.toFixed(1);
    return { head: `M${f(S[0])} ${f(S[1])} Q${f(mx)} ${f(my)} ${f(px)} ${f(py)}`, rest: `M${f(px)} ${f(py)} Q${f(nx)} ${f(ny)} ${f(E[0])} ${f(E[1])}` };
  }
  const shoe = (c, x, y, flip) => `<g transform="translate(${x} ${y}) scale(${flip ? -1 : 1} 1)"><path d="M-20 4 C-22 -12 -8 -18 6 -16 C20 -14 28 -4 26 6 C24 13 -20 14 -20 4Z" fill="${c}" ${sw(5)}/><path d="M-19 8 H25" stroke="${INK}" stroke-opacity=".35" stroke-width="3" fill="none"/></g>`;
  const rrect = (x0, y0, x1, y1, r) => `M${x0 + r} ${y0} H${x1 - r} Q${x1} ${y0} ${x1} ${y0 + r} V${y1 - r} Q${x1} ${y1} ${x1 - r} ${y1} H${x0 + r} Q${x0} ${y1} ${x0} ${y1 - r} V${y0 + r} Q${x0} ${y0} ${x0 + r} ${y0}Z`;

  function build(cfg, anim){
    const g = AGES[cfg.body] || AGES.kid, skin = cfg.skin, col = cfg.color, pants = cfg.pants, shoeC = cfg.accent;
    const tBot = g.tTop + g.tH, x0 = 200 - g.tW / 2, x1 = 200 + g.tW / 2, r = g.tW * 0.26;
    const acc = accSvg(cfg.acc, g, cfg.accColor, cfg), hair = hairSvg(cfg.hair, cfg.hairColor, g);
    const lx = 200 - g.tW * 0.2, rx = 200 + g.tW * 0.2;

    // legs and shoes
    let legs = "";
    const leg = (x, y0, y1, c) => tube(`M${x} ${y0} L${x} ${y1}`, 15, c);
    if(cfg.bottom === "pants"){ legs = leg(lx, tBot - 10, FEET, pants) + leg(rx, tBot - 10, FEET, pants); }
    else if(cfg.bottom === "shorts"){ legs = leg(lx, tBot - 10, FEET, skin) + leg(rx, tBot - 10, FEET, skin) + leg(lx, tBot - 10, tBot + 26, pants) + leg(rx, tBot - 10, tBot + 26, pants); }
    else { legs = leg(lx, tBot - 10, FEET, skin) + leg(rx, tBot - 10, FEET, skin); }
    const skirt = cfg.bottom === "skirt" ? `<path d="M${x0 - 2} ${tBot - 8} L${x0 - 20} ${tBot + 36} Q200 ${tBot + 46} ${x1 + 20} ${tBot + 36} L${x1 + 2} ${tBot - 8}Z" fill="${pants}" ${sw(5)}/>` : "";
    const feet = shoe(shoeC, lx - 6, FEET + 12, false) + shoe(shoeC, rx + 6, FEET + 12, true);

    // torso and top
    let torso = `<path d="${rrect(x0, g.tTop, x1, tBot, r)}" fill="${col}" ${sw(6)}/>`;
    const mid = g.tTop + g.tH / 2;
    if(cfg.top === "stripes"){ for(let i = 1; i <= 3; i++){ const y = g.tTop + (g.tH * i) / 4; torso += `<path d="M${x0 + 3} ${y} H${x1 - 3}" stroke="${shade(col, 0.6)}" stroke-width="${g.tH * 0.12}" fill="none"/>`; } torso += `<path d="${rrect(x0, g.tTop, x1, tBot, r)}" fill="none" ${sw(6)}/>`; }
    if(cfg.top === "hoodie"){ torso += `<path d="M${200 - g.tW * 0.34} ${tBot - g.tH * 0.42} H${200 + g.tW * 0.34} L${200 + g.tW * 0.4} ${tBot - 8} H${200 - g.tW * 0.4}Z" fill="${shade(col, 0.88)}" ${sw(4)}/><path d="M${200 - 8} ${g.tTop + 8} V${g.tTop + g.tH * 0.38} M${200 + 8} ${g.tTop + 8} V${g.tTop + g.tH * 0.38}" ${sw(3.4)} fill="none"/>`; }
    if(cfg.top === "overalls"){ torso += `<path d="M${x0 + 6} ${g.tTop + g.tH * 0.4} H${x1 - 6} V${tBot - 2} H${x0 + 6}Z" fill="${pants}" ${sw(4.5)}/><path d="M${x0 + 18} ${g.tTop + g.tH * 0.4} V${g.tTop + 3} M${x1 - 18} ${g.tTop + g.tH * 0.4} V${g.tTop + 3}" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="M${x0 + 18} ${g.tTop + g.tH * 0.4} V${g.tTop + 3} M${x1 - 18} ${g.tTop + g.tH * 0.4} V${g.tTop + 3}" fill="none" stroke="${pants}" stroke-width="7" stroke-linecap="round"/><circle cx="${x0 + 18}" cy="${g.tTop + g.tH * 0.4 + 6}" r="3.6" fill="#ffc42b"/><circle cx="${x1 - 18}" cy="${g.tTop + g.tH * 0.4 + 6}" r="3.6" fill="#ffc42b"/>`; }
    const nm = (cfg.name || "").trim().slice(0, 10).replace(/[<>&"]/g, "");
    const lightTop = darkText(cfg.top === "overalls" ? pants : col);
    const name = nm ? `<text x="200" y="${(mid + 8).toFixed(0)}" text-anchor="middle" font-family="'Caveat','Patrick Hand','Comic Sans MS',cursive" font-weight="700" font-size="${nm.length > 7 ? 19 : 23}" fill="${lightTop ? INK : "#fff"}" stroke="none">${nm}</text>` : "";

    // arms with sleeves
    const pose = POSES[cfg.pose] || POSES.cheer;
    const long = cfg.top === "hoodie" || cfg.top === "stripes";
    const arms = pose.map(([dx, dy, rot, hnd], i) => {
      const right = i === 1, sgn = right ? 1 : -1, S = [right ? x1 - 5 : x0 + 5, g.tTop + 18], hx = S[0] + dx * g.reach, hy = S[1] + dy * g.reach, rr = rot * Math.PI / 180, hsz = g.hand;
      const E = [hx - Math.sin(rr) * 19 * hsz, hy + Math.cos(rr) * 19 * hsz], C = [S[0] + sgn * Math.abs(dx) * g.reach * 0.9, S[1] + (dy > 0 ? dy * g.reach * 0.2 : 8)];
      const whole = `M${S[0]} ${S[1]} Q${C[0].toFixed(1)} ${C[1].toFixed(1)} ${E[0].toFixed(1)} ${E[1].toFixed(1)}`;
      const cut = qsplit(S, C, E, long ? 0.86 : 0.42), cuff = long ? qsplit(S, C, E, 0.86) : null;
      let arm = tube(whole, 12, skin) + tube(cut.head, 12.5, col);
      if(long) arm += tube(cuff.rest, 12.5, shade(col, 0.82));
      return `<g class="pa-arm ${right ? "r" : "l"}" style="transform-origin:${S[0]}px ${S[1]}px">${arm}<g transform="translate(${hx.toFixed(1)} ${hy.toFixed(1)}) rotate(${rot}) scale(${(right ? hsz : -hsz).toFixed(2)} ${hsz})">${HANDS[hnd](skin)}</g></g>`;
    }).join("");

    // head and face
    const k = g.hrx / 141, oy = g.oy, ey = oy + g.hrx * 0.1, eyes = [[200 - g.hrx * 0.36, ey], [200 + g.hrx * 0.36, ey]];
    const my = oy + g.hrx * 0.44, m = g.hrx * 0.32 / 32;
    const ears = `<circle cx="${200 - g.hrx * 0.98}" cy="${oy + g.hrx * 0.12}" r="${g.hrx * 0.17}" fill="${skin}" ${sw(5)}/><circle cx="${200 + g.hrx * 0.98}" cy="${oy + g.hrx * 0.12}" r="${g.hrx * 0.17}" fill="${skin}" ${sw(5)}/>`;
    const head = `<ellipse cx="200" cy="${g.hy}" rx="${g.hrx}" ry="${g.hry}" fill="${skin}" ${sw(6)}/>`;
    const cheeks = `<ellipse cx="${200 - g.hrx * 0.58}" cy="${oy + g.hrx * 0.38}" rx="${g.hrx * 0.13}" ry="${g.hrx * 0.085}" fill="#ff5f8f" fill-opacity=".34"/><ellipse cx="${200 + g.hrx * 0.58}" cy="${oy + g.hrx * 0.38}" rx="${g.hrx * 0.13}" ry="${g.hrx * 0.085}" fill="#ff5f8f" fill-opacity=".34"/>`;
    const mouth = `<g transform="translate(${(200 - 200 * m).toFixed(1)} ${(my - 0 * m).toFixed(1)}) scale(${m.toFixed(3)})">${mouthSvg(cfg.mouth, 0)}</g>`;
    const R2 = g.hrx * 0.26;
    const dmg = anim ? `
      <g class="d1"><g transform="translate(${200 + g.hrx * 0.5} ${g.hy + g.hry * 0.5}) rotate(-24) scale(${g.hrx / 70})"><rect x="-17" y="-6" width="34" height="12" rx="4" fill="#f2cf9a" ${sw(3)}/><rect x="-6" y="-6" width="12" height="12" fill="#e5b97a"/></g></g>
      <g class="d2"><g transform="translate(${200 - g.hrx * 0.46} ${g.hy - g.hry * 0.5}) rotate(20) scale(${g.hrx / 70})"><rect x="-17" y="-6" width="34" height="12" rx="4" fill="#f2cf9a" ${sw(3)}/><rect x="-6" y="-6" width="12" height="12" fill="#e5b97a"/></g><path class="pa-sweat" d="M${200 + g.hrx * 0.9} ${g.hy - g.hry * 0.4} q9 15 0 22 q-9 -7 0 -22Z" fill="#8ecae6" ${sw(3)}/></g>
      <g class="d3">${eyes.map(e => `<circle cx="${e[0]}" cy="${e[1]}" r="${R2}" fill="#fff" ${sw(3.4)}/><path d="M${e[0]} ${e[1]} m0 0 a${R2 * 0.1} ${R2 * 0.1} 0 1 1 ${R2 * 0.2} 0 a${R2 * 0.25} ${R2 * 0.25} 0 1 1 -${R2 * 0.5} 0 a${R2 * 0.4} ${R2 * 0.4} 0 1 1 ${R2 * 0.8} 0 a${R2 * 0.55} ${R2 * 0.55} 0 1 1 -${R2 * 1.1} 0" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`).join("")}</g>
      <g class="dko">${eyes.map(e => `<circle cx="${e[0]}" cy="${e[1]}" r="${R2}" fill="#fff" ${sw(3.4)}/><path d="M${e[0] - R2 * 0.55} ${e[1] - R2 * 0.55} L${e[0] + R2 * 0.55} ${e[1] + R2 * 0.55} M${e[0] + R2 * 0.55} ${e[1] - R2 * 0.55} L${e[0] - R2 * 0.55} ${e[1] + R2 * 0.55}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`).join("")}</g>
      <g class="dko pa-stars"><g transform="translate(200 ${Math.max(26, g.hy - g.hry - 34)})"><path d="${star(0, 0, 11, 5)}" fill="#ffc42b" ${sw(2.6)} transform="translate(-48 8)"/><path d="${star(0, 0, 13, 6)}" fill="#ffc42b" ${sw(2.6)} transform="translate(0 -8)"/><path d="${star(0, 0, 11, 5)}" fill="#ffc42b" ${sw(2.6)} transform="translate(48 8)"/></g></g>` : "";
    const flash = anim ? `<g class="pa-flash" fill="#ff3b3b"><ellipse cx="200" cy="${g.hy}" rx="${g.hrx}" ry="${g.hry}"/><path d="${rrect(x0, g.tTop, x1, tBot, r)}"/></g>` : "";
    return `${acc.back || ""}${hair.back}${legs}${skirt}${feet}${torso}${name}${arms}<g class="pa-body">${ears}${head}${cheeks}${eyesSvg(cfg.eyes, eyes, k, cfg.eyeColor)}${mouth}${hair.front}${acc.front || ""}${dmg}</g>${flash}`;
  }
  const viewBox = (cfg, view) => {
    const g = AGES[cfg.body] || AGES.kid;
    if(view === "face") return `${200 - g.hrx * 1.2} ${g.oy - g.hrx * 0.72} ${g.hrx * 2.4} ${g.hrx * 1.8}`;
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

  const DEFAULTS = { name: "", body: "kid", skin: SKINS[1], hair: "crop", hairColor: HAIR_COLORS[1], eyes: "dots", eyeColor: EYE_COLORS[0], mouth: "smile", top: "tee", color: PALETTE[7], bottom: "pants", pants: PALETTE[8], accent: PALETTE[0], pose: "cheer", acc: "none", accColor: PALETTE[0] };
  const inList = (v, list) => list.some(x => (Array.isArray(x) ? x[0] : x) === v);
  const isHex = v => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v);
  // fills in anything missing; values from older versions that no longer exist (picks, amps, old hats...) fall back to a default
  const norm = cfg => {
    const c = Object.assign({}, DEFAULTS, cfg || {});
    if(!AGES[c.body]) c.body = DEFAULTS.body;
    if(!POSES[c.pose]) c.pose = DEFAULTS.pose;
    if(!inList(c.eyes, OPTIONS.eyes)) c.eyes = DEFAULTS.eyes;
    if(!inList(c.mouth, OPTIONS.mouths)) c.mouth = DEFAULTS.mouth;
    if(!inList(c.hair, OPTIONS.hair)) c.hair = DEFAULTS.hair;
    if(!inList(c.top, OPTIONS.tops)) c.top = DEFAULTS.top;
    if(!inList(c.bottom, OPTIONS.bottoms)) c.bottom = DEFAULTS.bottom;
    if(!inList(c.acc, OPTIONS.acc)) c.acc = "none";
    ["skin", "hairColor", "eyeColor", "color", "pants", "accent", "accColor"].forEach(k => { if(!isHex(c[k])) c[k] = DEFAULTS[k]; });
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
      return norm({ body: pick(OPTIONS.bodies)[0], skin: pick(SKINS), hair: pick(OPTIONS.hair)[0], hairColor: pick(HAIR_COLORS), eyes: pick(OPTIONS.eyes.slice(0, 5))[0], eyeColor: pick(EYE_COLORS),
        mouth: pick(OPTIONS.mouths)[0], top: pick(OPTIONS.tops)[0], color: pick(PALETTE), bottom: pick(OPTIONS.bottoms)[0], pants: pick(PALETTE), accent: pick(PALETTE), pose: pick(OPTIONS.poses)[0],
        acc: pick(["none", "none", ...OPTIONS.acc.map(a => a[0])]), accColor: pick(PALETTE) });
    },
    get(){
      try{ const v = JSON.parse(localStorage.getItem(KEY)); if(v && v.body) return norm(v); }catch(e){}
      const r = this.random(); this.set(r); return r;
    },
    set(cfg){ try{ localStorage.setItem(KEY, JSON.stringify(norm(cfg))); }catch(e){} },
    has(){ try{ return !!localStorage.getItem(KEY); }catch(e){ return false; } }
  };
})();
