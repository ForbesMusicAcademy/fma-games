/* "Your character": a customisable, animated vector player used across the Forbes Music Academy practice games.
   A classic chibi cartoon kid, teen or adult: big round head, thick even outlines, big white eyes with a black dot pupil, stubby limbs.
   (The things you battle in the games are instruments and equipment, so the player is always a person.)
   Eyes always have the same design (white circle, black dot with a little shine); the eyelids carry the emotion. There are no eyebrows and no cheeks.
   A character is a small config, saved on the student's device:
     { name, body (kid/teen/adult), skin, hair, hairColor, beard, eyes, mouth, mark, eyewear, top, color, bottom, pants, shoes, accent (shoe colour),
       neck, neckColor,
       pose, acc (head), accColor, gear (instrument), gearColor, extra (accessory: cape, backpack...), extraColor }
   Player.get() / Player.set(cfg) / Player.random()          the saved character (a random one the first time)
   PlayerArt(container, cfg, { idle, pose })  -> a live, animated character and its controller:
       setDamage(0..1), hurt(), attack(dir), cheer(), react(), ko(), reset(), fidget(name), idle(on), destroy(),
       fire()  a burst of flames from a Flying V (it also does this on its own every so often)
       pose(name, ms)  strike a pose for ms (0 = hold it) and then go back to the resting one
       moment(name, ms)  the pose for a game moment from PlayerArt.MOMENTS, with a jump for joy on win/best/cheer
   Poses are not chosen in the editor (the character always stands relaxed there): the games use them for moments.
   PlayerArt.MOMENTS maps game moments to poses (hello, start, hit, streak, best, win, done); games call pose(MOMENTS.x).
       Left alone it blinks, glances about and fidgets in a way that suits its pose (waving, pumping, headbanging).
       There is deliberately no "Jam"/air-guitar pose and no drumsticks: see the README.
   PlayerArt.svg(cfg, view)   -> plain SVG string (menus, thumbnails); view = "full" | "fig" | "head" | "face" | "chest" | "feet"
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
  const HAIR_COLORS = ["#2b2623", "#3b2a20", "#5b3a1e", "#8b5a2b", "#a6774a", "#8e3b1f", "#c8761f", "#e3a35a", "#ffd34d", "#efe3b8", "#9a958e", "#6e6a66", "#f7f4ee",
    "#e8433f", "#ff6fa3", "#ff8a1c", "#4fb86a", "#4fd0c0", "#4aa8ff", "#a070e8"];
  // Every list runs from sweet to wicked.
  const OPTIONS = {
    bodies: [["kid", "Kid"], ["teen", "Teen"], ["adult", "Adult"]],
    poses: [["wave", "Wave"], ["cheer", "Cheer"], ["thumbs", "Thumbs up"], ["peace", "Peace"], ["star", "Star jump"],
      ["hips", "Hands on hips"], ["flex", "Flex"], ["rock", "Rock on"], ["relax", "Relaxed"]],
    hair: [["none", "None"], ["buzz", "Buzz cut"], ["balding", "Balding"], ["crop", "Short"], ["shortsides", "Short back and sides"], ["sweep", "Sweep"], ["quiff", "Flick-up"], ["mop", "Mop"], ["bowl", "Mop-top"],
      ["curly", "Curly"], ["afro", "Afro"], ["spiky", "Spiky"], ["mohawk", "Mohawk"], ["bun", "Bun"], ["spacebuns", "Space buns"], ["ponytail", "Ponytail"],
      ["pigtails", "Pigtails"], ["plait", "Plaits"], ["bob", "Bob"], ["long", "Long"], ["wavy", "Long and wavy"], ["grunge", "Grunge"]],
    beards: [["none", "None"], ["stubble", "Stubble"], ["moustache", "Moustache"], ["handlebar", "Handlebar"], ["goatee", "Goatee"],
      ["chinstrap", "Chinstrap"], ["full", "Full beard"], ["bushy", "Big beard"]],
    eyes: [["calm", "Calm"], ["happy", "Happy"], ["wide", "Wide"], ["sleepy", "Sleepy"], ["tired", "Tired"], ["sad", "Sad"], ["wink", "Wink"], ["sly", "Sly"], ["grumpy", "Grumpy"]],
    mouths: [["smile", "Smile"], ["kitty", "Kitty"], ["open", "Open"], ["tongue", "Tongue"], ["wow", "Wow"], ["grin", "Teeth"], ["smirk", "Smirk"], ["fangs", "Fangs"], ["snarl", "Snarl"]],
    marks: [["none", "None"], ["freckles", "Freckles"], ["plaster", "Plaster"], ["glam", "Glam shadow"], ["bolt", "Lightning bolt"], ["warpaint", "Paint"], ["starpaint", "Star paint"], ["batpaint", "Bat paint"], ["scar", "Scar"]],
    eyewear: [["none", "None"], ["glasses", "Specs"], ["round", "Round tints"], ["shades", "Shades"], ["mask", "Mask"], ["patch", "Eye patch"], ["goggles", "Welding goggles"], ["gasmask", "Gas mask"]],
    // tops and bottoms include music-scene staples: grunge flannel, hip-hop jersey and puffer, Britpop trackie, pop-star sequins
    tops: [["tee", "T-shirt"], ["hoodie", "Hoodie"], ["stripes", "Stripes"], ["overalls", "Dungarees"], ["jacket", "Jacket"], ["bolt", "Bolt tee"], ["tiedye", "Tie-dye"], ["fringe", "Fringe jacket"],
      ["flannel", "Flannel"], ["jersey", "Jersey"], ["track", "Trackie top"], ["puffer", "Puffer"], ["sequin", "Sequins"], ["military", "Military jacket"], ["pepper", "Band jacket"], ["collarless", "Collarless suit"], ["leather", "Spiky leather jacket"], ["hivis", "Hi-vis vest"]],
    bottoms: [["pants", "Pants"], ["shorts", "Shorts"], ["skirt", "Skirt"], ["pleated", "Pleated skirt"], ["tutu", "Tutu"], ["maxi", "Long skirt"],
      ["leggings", "Leggings"], ["flares", "Flares"], ["stage", "Stripe pants"], ["baggy", "Baggy jeans"], ["cargo", "Cargos"], ["ripped", "Ripped"], ["trackies", "Trackies"]],
    shoes: [["sneakers", "Sneakers"], ["hightops", "High-tops"], ["boots", "Boots"], ["chelsea", "Chelsea boots"], ["platforms", "Platforms"]],
    neck: [["none", "None"], ["beads", "Beads"], ["peace", "Peace sign"], ["chain", "Chain"], ["clock", "Clock"], ["scarf", "Scarf"], ["bowtie", "Bow tie"]],
    acc: [["none", "None"], ["bow", "Bow"], ["flower", "Flower"], ["flowers", "Flower crown"], ["halo", "Halo"], ["bunny", "Bunny"], ["cat", "Cat ears"], ["crown", "Crown"], ["party", "Party"], ["beanie", "Beanie"], ["cap", "Cap"], ["sidecap", "Side cap"], ["visor", "Visor"], ["bucket", "Bucket"], ["band", "Band"], ["hippy", "Hippie headband"], ["phones", "Phones"], ["santa", "Santa"], ["elf", "Elf"], ["pirate", "Pirate"], ["horns", "Horns"], ["hardhat", "Hard hat"]],
    // "guitar" is the Strat (older saves called it just "Guitar")
    gear: [["none", "None"], ["acoustic", "Acoustic"], ["guitar", "Strat"], ["flyingv", "Flying V"], ["bass", "Bass"], ["violin", "Violin bass"], ["doubleneck", "Double neck"], ["ukulele", "Ukulele"], ["mic", "Mic"], ["rustbucket", "Rust Bucket"]],
    extras: [["none", "None"], ["wings", "Wings"], ["backpack", "Backpack"], ["bumbag", "Bum bag"], ["belt", "Studded belt"], ["sweatbands", "Sweatbands"], ["cape", "Cape"], ["gloves", "Work gloves"], ["biostrap", "Biohazard strap"]],
    skins: SKINS, palette: PALETTE, hairColors: HAIR_COLORS
  };
  const shade = (h, f) => "#" + [1, 3, 5].map(i => Math.max(0, Math.min(255, Math.round(parseInt(h.slice(i, i + 2), 16) * f))).toString(16).padStart(2, "0")).join("");
  const darkText = c => ["#f7f4ee", "#ffc42b", "#9be04a", "#ffd34d", "#4fd0c0", "#ff8a1c", "#4aa8ff"].includes(c);

  /* ---- the three ages: proportions only (kids have the biggest heads and the shortest legs) ---- */
  const AGES = {
    kid:   { hy: 152, hrx: 86, hry: 78, tTop: 226, tH: 62, tW: 86, hand: 1.08, arm: 72, tilt: 0 },
    teen:  { hy: 140, hrx: 72, hry: 68, tTop: 204, tH: 80, tW: 90, hand: 1.16, arm: 82, tilt: -9 },
    adult: { hy: 128, hrx: 62, hry: 60, tTop: 182, tH: 96, tW: 94, hand: 1.26, arm: 94, tilt: -18 }
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
      const dotY = kind === "tired" ? cy + R * 0.32 : kind === "sleepy" || kind === "sly" ? cy + R * 0.12 : cy;
      // a lid covers the top (or bottom) of the eye along a line from the outer corner to the inner corner
      const upper = (yOuter, yInner) => { const xo = x + side * R * 1.2, xi = x - side * R * 1.2;
        return `<path d="M${xo.toFixed(1)} ${(cy + yOuter * R).toFixed(1)} L${xi.toFixed(1)} ${(cy + yInner * R).toFixed(1)} L${xi.toFixed(1)} ${cy - R * 1.4} L${xo.toFixed(1)} ${cy - R * 1.4}Z" fill="${skin}" ${sw(lw)}/>`; };
      let lid = "";
      switch(kind){
        case "sleepy": lid = upper(-0.02, -0.02); break;
        case "tired": lid = upper(0.12, 0.2); break;                // heavy lids, more than half shut
        case "sly": lid = upper(-0.12, -0.44); break;
        case "grumpy": lid = upper(-0.72, -0.02); break;          // slants down towards the nose
        case "sad": lid = upper(-0.12, -0.72); break;             // droops at the outside
        case "winkopen": lid = `<path d="M${x - R * 1.2} ${cy + R * 0.5} Q${x} ${cy + R * 0.14} ${x + R * 1.2} ${cy + R * 0.5} L${x + R * 1.2} ${cy + R * 1.4} L${x - R * 1.2} ${cy + R * 1.4}Z" fill="${skin}" ${sw(lw)}/>`; break;
        case "happy": lid = `<path d="M${x - R * 1.2} ${cy + R * 0.28} Q${x} ${cy - R * 0.5} ${x + R * 1.2} ${cy + R * 0.28} L${x + R * 1.2} ${cy + R * 1.4} L${x - R * 1.2} ${cy + R * 1.4}Z" fill="${skin}" ${sw(lw)}/>`; break;
      }
      return `<g class="pa-eye" style="transform-origin:${x}px ${cy}px"><clipPath id="${id}"><circle cx="${x}" cy="${cy}" r="${R}"/></clipPath><circle cx="${x}" cy="${cy}" r="${R}" fill="#fff"/><g clip-path="url(#${id})"><g class="pa-pup"><circle cx="${x}" cy="${dotY}" r="${pupil}" fill="${INK}"/><circle cx="${x + pupil * 0.36}" cy="${dotY - pupil * 0.38}" r="${pupil * 0.3}" fill="#fff"/></g></g><g clip-path="url(#${id})">${lid}</g><circle cx="${x}" cy="${cy}" r="${R}" fill="none" ${sw(Math.max(3.4, R * 0.2))}/></g>`;
    };
    const closed = (x) => `<path d="M${x - R * 0.9} ${cy + R * 0.1} Q${x} ${cy + R * 0.6} ${x + R * 0.9} ${cy + R * 0.1}" fill="none" ${sw(Math.max(3.6, R * 0.24))}/>`;
    if(style === "wink") return eye(xs[0], -1, "winkopen") + closed(xs[1]);
    // exhausted: dark bags under both eyes
    const bags = style !== "tired" ? "" : xs.map(x => `<path d="M${x - R * 1.0} ${cy + R * 0.86} Q${x} ${cy + R * 1.78} ${x + R * 1.0} ${cy + R * 0.86} Q${x} ${cy + R * 1.2} ${x - R * 1.0} ${cy + R * 0.86}Z" fill="${shade(skin, 0.5)}" opacity=".6"/>`
      + `<path d="M${x - R * 0.9} ${cy + R * 1.1} Q${x} ${cy + R * 1.72} ${x + R * 0.9} ${cy + R * 1.1} M${x - R * 0.55} ${cy + R * 1.62} Q${x} ${cy + R * 1.92} ${x + R * 0.55} ${cy + R * 1.62}" fill="none" stroke="${shade(skin, 0.38)}" stroke-width="${Math.max(2.6, R * 0.13).toFixed(1)}" stroke-linecap="round"/>`).join("");
    return bags + eye(xs[0], -1, style) + eye(xs[1], 1, style);
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
  // a fluffy cloud of circles, outlined as one shape (the outline goes down first, the fill on top)
  const cloud = (cs, w) => { const ring = cs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join(""); return `<g stroke-width="${w}">${ring}</g><g stroke="none">${ring}</g>`; };
  // hats that cover the crown: the lower edge of each hat (head units, before the hat's lift). All hair above that edge is hidden,
  // right across, so nothing sticks up out of the crown or puffs out over the sides; hair below the edge (fringes, curls round
  // the ears, long hair) still shows, the way hair comes out from under a hat. (Oct 2026: puffs and spikes used to poke through.)
  const HAT_BASE = { beanie: -0.12, cap: -0.2, sidecap: -0.2, bucket: -0.1, santa: -0.12, elf: -0.14, pirate: -0.22, hardhat: -0.24 };
  const HAT_HALF = { beanie: 1.16, cap: 1.1, sidecap: 1.1, bucket: 1.34, santa: 1.18, elf: 1.16, pirate: 1.4, hardhat: 1.32 };     // half the hat's width at that edge
  const HAT_LIFT = ["beanie", "cap", "sidecap", "visor", "bucket", "santa", "elf", "pirate", "band"];
  const SKULL = "M-0.97 -0.12 C-1.0 -0.72 -0.58 -1.0 0 -1.0 C0.58 -1.0 1.0 -0.72 0.97 -0.12 C0.8 -0.42 0.48 -0.56 0 -0.56 C-0.48 -0.56 -0.8 -0.42 -0.97 -0.12Z";
  function hairSvg(style, color, g, hat){
    const h = hairShapes(style, color, g), base = HAT_BASE[hat];
    if(base === undefined) return h;
    /* Hair poking out beside the hat is shaped as if the hat presses it down: from the hat's edge the hair line curves down and
       out in a rounded shoulder (not a straight cut), and the cut gets an ink outline so it reads as drawn hair. The outline is
       masked by the hair itself, so it only appears where there actually is hair. */
    const r = g.hrx, y1 = g.oy + (base + (HAT_LIFT.includes(hat) ? -0.16 : 0)) * r, hw = (HAT_HALF[hat] || 1.15) * r, f = n => n.toFixed(1);
    const edge = sg => `Q${f(200 + sg * (hw + 0.28 * r))} ${f(y1)} ${f(200 + sg * (hw + 1.1 * r))} ${f(y1 + 1.5 * r)}`;
    const line = `M${f(200 - hw - 1.1 * r)} ${f(y1 + 1.5 * r)} Q${f(200 - hw - 0.28 * r)} ${f(y1)} ${f(200 - hw)} ${f(y1)} L${f(200 + hw)} ${f(y1)} ${edge(1)}`;
    const keep = `${line} L${f(200 + 4 * r)} 700 L${f(200 - 4 * r)} 700Z`;
    const wrap = x => { if(!x) return ""; const id = "hc" + (++uid);
      return `<mask id="${id}" maskUnits="userSpaceOnUse" x="-200" y="-200" width="800" height="900"><path d="${keep}" fill="#fff"/></mask>`
        + `<filter id="${id}w"><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"/></filter><mask id="${id}e" maskUnits="userSpaceOnUse" x="-200" y="-200" width="800" height="900"><g filter="url(#${id}w)">${x}</g></mask>`
        + `<g mask="url(#${id})">${x}</g><path d="${line}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" mask="url(#${id}e)"/>`; };
    return { back: wrap(h.back), front: wrap(h.front) };
  }
  /* Hair is drawn in head units (the head is a unit circle; eyes sit on y = 0, so a fringe stops above y = -0.3).
     Every style is built the same way, like a storybook illustration: the hair colour with pointed locks at the ends,
     a darker layer underneath (the back of the hair), darker strand lines that follow the way the hair falls,
     and a couple of light strands where it catches the light. */
  const tint = (h, t) => "#" + [1, 3, 5].map(i => Math.round(parseInt(h.slice(i, i + 2), 16) * (1 - t) + 255 * t).toString(16).padStart(2, "0")).join("");
  const mixHex = (a, b, t) => "#" + [1, 3, 5].map(i => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, "0")).join("");
  const n3 = n => +n.toFixed(3);
  // a run of locks from `from` through pts: each stroke bowed sideways by b (a fraction of its length; a list cycles)
  const edge = (from, pts, b) => { let q = from;
    return pts.map((p, i) => { const k = Array.isArray(b) ? b[i % b.length] : b, dx = p[0] - q[0], dy = p[1] - q[1];
      const s = `Q${n3((q[0] + p[0]) / 2 - dy * k)} ${n3((q[1] + p[1]) / 2 + dx * k)} ${n3(p[0])} ${n3(p[1])}`; q = p; return s; }).join(" "); };
  // strand lines from the crown out towards each tip (stopping short of it), curving by bend. Each strand starts a little
  // to the side of the root, towards its own tip, so they don't all fan out of one point.
  const toward = (root, tips, k, bend) => tips.map(t => { const r = [root[0] + (t[0] - root[0]) * 0.4, root[1] + (t[1] - root[1]) * 0.15];
    const ex = r[0] + (t[0] - r[0]) * k, ey = r[1] + (t[1] - r[1]) * k, dx = ex - r[0], dy = ey - r[1];
    return `M${n3(r[0])} ${n3(r[1])} Q${n3((r[0] + ex) / 2 - dy * bend)} ${n3((r[1] + ey) / 2 + dx * bend)} ${n3(ex)} ${n3(ey)}`; }).join(" ");
  const mirror = pts => pts.map(([x, y]) => [-x, y]).reverse();
  // a top-of-head cap with a smooth hairline (pulled back: buns, ponytail, plaits); part = a centre parting line
  const CAP = "M-1.05 0.02 C-1.15 -0.78 -0.7 -1.23 0 -1.23 C0.7 -1.23 1.15 -0.78 1.05 0.02 "
    + edge([1.05, 0.02], [[0.9, -0.4], [0.62, -0.58], [0.3, -0.66], [0, -0.68], [-0.3, -0.66], [-0.62, -0.58], [-0.9, -0.4], [-1.05, 0.02]], -0.12) + "Z";
  const CAP_STRANDS = "M-0.84 -0.42 Q-0.72 -0.92 -0.24 -1.12 M-0.42 -0.64 Q-0.36 -0.98 -0.1 -1.16 M0.42 -0.64 Q0.36 -0.98 0.1 -1.16 M0.84 -0.42 Q0.72 -0.92 0.24 -1.12";
  function hairShapes(style, color, g){
    if(style === "none") return { back: "", front: "" };
    const W = x => (x / g.hrx).toFixed(4), sS = `${ST} stroke-width="${W(5)}"`;
    // shadows: blonde, ginger and brown hair darken towards a warm brown (plain darkening turns them khaki); everything else just darkens
    const [cr, cg, cb] = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16)), warm = cg > cb * 1.2 && cr >= cg && cr + cg + cb > 210;
    const dim = t => warm ? mixHex(color, "#5a2a0a", t) : shade(color, 1 - t);
    const dk = dim(0.32), dk2 = dim(0.5), lt = tint(color, 0.42), under = dim(0.24);
    const T = (body, fill) => `<g transform="translate(200 ${g.oy}) scale(${g.hrx})" fill="${fill || color}" ${sS}>${body}</g>`;
    const ln = (d, c, w, op) => d ? `<path d="${d}" fill="none" stroke="${c}" stroke-width="${W(w)}" stroke-linecap="round"${op ? ` stroke-opacity="${op}"` : ""}/>` : "";
    const tex = (dark, light) => ln(dark, dk, 2.6) + ln(light, lt, 3.4, 0.85);      // the strand lines that give hair its texture
    const curl = (x, y, r) => `M${n3(x - r * 0.5)} ${n3(y + r * 0.1)} A${n3(r * 0.5)} ${n3(r * 0.5)} 0 1 1 ${n3(x + r * 0.1)} ${n3(y + r * 0.45)}`;
    const shape = (outer, pts, b) => `<path d="${outer} ${edge(pts[0], pts.slice(1), b)}Z"/>`;
    switch(style){
      case "buzz": {             // a see-through cap: the colour of the hair, the skin showing through, a fine stubble texture
        let dots = ""; for(let y = -0.92; y < -0.5; y += 0.12) for(let x = -0.86; x <= 0.86; x += 0.14){ const yy = y + Math.abs(x) * 0.36 * (y < -0.8 ? 0 : 1); if(x * x + (yy + 0.1) * (yy + 0.1) < 0.88) dots += `M${n3(x + (y * 7 % 0.05))} ${n3(yy)}h0.001`; }
        return { back: "", front: T(`<path d="${SKULL}" fill-opacity=".55" stroke="none"/>`) + T(ln(dots, dk, 2.4, 0.28) + ln("M-0.8 -0.42 C-0.5 -0.6 0.5 -0.6 0.8 -0.42", color, 4, 0.5)) };
      }
      case "balding": {         // grandpa style: a bald, shiny dome, and buzz-cut hair only round the sides, above and round the ears
        const side = sg => { const P = (x, y) => `${n3(sg * x)} ${y}`;
          return `M${P(0.84, -0.56)} C${P(0.7, -0.46)} ${P(0.66, -0.26)} ${P(0.7, -0.04)} C${P(0.72, 0.1)} ${P(0.78, 0.2)} ${P(0.86, 0.28)} L${P(0.98, 0.22)} C${P(1.02, -0.06)} ${P(1.0, -0.36)} ${P(0.84, -0.56)}Z`; };
        let dots = ""; for(let y = -0.46; y <= 0.16; y += 0.1) for(let x = 0.76; x <= 0.96; x += 0.08){ if(x > 0.74 + Math.abs(y + 0.15) * 0.1) dots += `M${n3(x)} ${n3(y)}h0.001 M${n3(-x)} ${n3(y + 0.05)}h0.001 `; }
        return { back: "", front: T(`<path d="${side(-1)} ${side(1)}" fill-opacity=".72" stroke="none"/>` + ln(dots, dk, 2.4, 0.35))
          + T(ln("M-0.52 -0.8 Q-0.32 -0.94 -0.08 -0.96", "#fff", 5, 0.55) + ln("M0.08 -0.95 Q0.14 -0.95 0.2 -0.94", "#fff", 5, 0.55)) };
      }
      case "shortsides": {       // faded sides, a bit of length on top swept over, a little flick at the front
        const pts = [[0.86, -0.42], [0.66, -0.56], [0.58, -0.44], [0.36, -0.64], [0.24, -0.54], [-0.06, -0.66], [-0.5, -0.6], [-0.88, -0.36]];
        return { back: "", front: T(`<path d="${SKULL}" fill-opacity=".4" stroke="none"/>` + shape("M-0.88 -0.36 C-0.98 -0.88 -0.56 -1.16 0 -1.18 C0.5 -1.2 0.86 -1.08 0.96 -0.84 C1.0 -0.68 0.94 -0.52 0.86 -0.42", pts, 0.14)
            + tex("M-0.6 -0.66 C-0.3 -0.94 0.2 -1.04 0.62 -0.96 M-0.2 -0.68 C0.1 -0.86 0.44 -0.86 0.7 -0.74 M-0.76 -0.5 C-0.6 -0.8 -0.3 -1.0 0.0 -1.08", "M-0.5 -0.96 C-0.2 -1.1 0.2 -1.12 0.5 -1.06")) };
      }
      case "crop": {             // a short, messy fringe of pointed locks, swept a little to one side
        const tips = [[-0.92, -0.48], [-0.74, -0.34], [-0.56, -0.66], [-0.36, -0.36], [-0.2, -0.66], [0.04, -0.38], [0.2, -0.68], [0.44, -0.42], [0.58, -0.66], [0.8, -0.44], [0.92, -0.56], [1.05, 0.02]];
        return { back: "", front: T(shape("M1.05 0.02 C1.16 -0.78 0.7 -1.24 0.02 -1.24 C-0.7 -1.24 -1.16 -0.78 -1.05 0.02", [[-1.05, 0.02], ...tips], [0.16, -0.1])
          + tex(toward([-0.2, -1.14], tips.filter((_, i) => i % 2 && i < 10), 0.66, 0.1), "M-0.66 -0.98 Q-0.34 -1.14 0.0 -1.12 M0.26 -1.08 Q0.5 -1.04 0.66 -0.92")) };
      }
      case "sweep": {            // a side quiff: the front swept up and over to one side, the forehead showing
        return { back: "", front: T(`<path d="M-1.05 0.02 C-1.16 -0.8 -0.74 -1.22 -0.1 -1.26 C0.36 -1.3 0.8 -1.42 1.14 -1.3 Q0.98 -1.2 1.0 -1.08 C1.1 -0.86 1.12 -0.4 1.05 0.02 ${edge([1.05, 0.02], [[0.92, -0.46], [0.8, -0.36], [0.62, -0.62]], 0.12)} C0.3 -0.8 -0.3 -0.66 -0.62 -0.5 ${edge([-0.62, -0.5], [[-0.76, -0.32], [-0.86, -0.5], [-1.05, 0.02]], 0.12)}Z"/>`
          + tex("M-0.7 -0.62 C-0.3 -0.92 0.3 -1.1 0.92 -1.22 M-0.3 -0.7 C0.1 -0.88 0.5 -1.02 0.86 -1.08 M-0.88 -0.66 C-0.6 -1.0 -0.1 -1.18 0.46 -1.26 M0.3 -0.84 C0.6 -0.94 0.9 -0.92 0.98 -0.6", "M-0.52 -0.96 C-0.2 -1.12 0.2 -1.2 0.62 -1.24")) };
      }
      case "quiff": {            // short sides with the front flicked straight up into a point
        const tips = [[0.92, -0.46], [0.74, -0.4], [0.6, -0.62], [0.36, -0.5], [0.2, -0.68]];
        return { back: "", front: T(`<path d="M-1.05 0.02 C-1.12 -0.6 -0.9 -0.98 -0.56 -1.12 C-0.4 -1.32 -0.16 -1.5 0.14 -1.66 C0.14 -1.5 0.26 -1.38 0.4 -1.3 C0.5 -1.38 0.58 -1.46 0.64 -1.52 C0.64 -1.36 0.72 -1.2 0.86 -1.06 C1.08 -0.86 1.12 -0.4 1.05 0.02 ${edge([1.05, 0.02], tips, 0.12)} C-0.02 -0.72 -0.2 -0.7 -0.36 -0.66 ${edge([-0.36, -0.66], [[-0.4, -0.48], [-0.56, -0.64], [-0.78, -0.42], [-0.9, -0.52], [-1.05, 0.02]], 0.12)}Z"/>`
          + tex("M-0.5 -0.7 Q-0.34 -1.12 0.08 -1.52 M0.0 -0.72 Q0.04 -1.1 0.32 -1.36 M0.48 -0.68 Q0.48 -1.02 0.6 -1.42 M-0.82 -0.6 Q-0.72 -0.98 -0.42 -1.2", "M-0.28 -0.88 Q-0.14 -1.2 0.06 -1.44")) };
      }
      case "spiky": {            // a crest of flame-shaped spikes, the sides kept short
        const spikes = [[-0.84, -1.3], [-0.5, -1.06], [-0.4, -1.56], [-0.1, -1.14], [0.12, -1.7], [0.3, -1.16], [0.58, -1.54], [0.66, -1.08], [0.98, -1.24], [0.86, -0.88]];
        return { back: "", front: T(`<path d="M-1.05 0.02 C-1.12 -0.56 -0.98 -0.84 -0.78 -0.96 ${edge([-0.78, -0.96], spikes, [0.18, -0.08])} C1.1 -0.6 1.1 -0.3 1.05 0.02 ${edge([1.05, 0.02], [[0.9, -0.44], [0.72, -0.4], [0.56, -0.6]], 0.1)} C0.2 -0.68 -0.2 -0.68 -0.56 -0.6 ${edge([-0.56, -0.6], [[-0.72, -0.4], [-0.9, -0.44], [-1.05, 0.02]], 0.1)}Z"/>`
          + tex(toward([0, -0.66], spikes.filter((_, i) => !(i % 2)), 0.8, 0.1), "M-0.42 -0.9 Q-0.3 -1.2 -0.3 -1.4 M0.06 -0.9 Q0.1 -1.3 0.1 -1.5")) };
      }
      case "mop": {              // shaggy and long all round: a heavy fringe to the eyebrows and over the ears
        const tips = [[1.0, 0.06], [0.92, 0.3], [0.82, -0.36], [0.66, -0.26], [0.56, -0.52], [0.4, -0.3], [0.28, -0.54], [0.14, -0.32], [0, -0.54], [-0.14, -0.32], [-0.28, -0.54], [-0.42, -0.3], [-0.56, -0.52], [-0.68, -0.26], [-0.82, -0.36], [-0.92, 0.3], [-1.0, 0.06], [-1.14, 0.36]];
        return { back: T(`<path d="M-1.12 -0.4 C-1.24 0.1 -1.22 0.42 -1.06 0.56 L1.06 0.56 C1.22 0.42 1.24 0.1 1.12 -0.4Z"/>`, under),
          front: T(shape("M-1.14 0.36 C-1.26 -0.74 -0.7 -1.3 0.02 -1.3 C0.72 -1.3 1.26 -0.74 1.14 0.36", [[1.14, 0.36], ...tips], [0.14, -0.14])
            + tex(toward([0, -1.2], tips.filter((_, i) => i % 2 && i > 2 && i < 14), 0.66, 0.06), "M-0.66 -1.04 Q-0.34 -1.2 0.0 -1.2 M0.3 -1.16 Q0.56 -1.1 0.72 -0.98")) };
      }
      case "bowl": {             // the 60s mop-top: a rounded helmet of hair, a heavy straight fringe to just above the eyes, over the ears
        const tips = [[1.0, 0.3], [0.92, 0.38], [0.86, -0.08], [0.76, -0.3], [0.6, -0.26], [0.46, -0.34], [0.3, -0.27], [0.14, -0.35], [0, -0.27], [-0.14, -0.35], [-0.3, -0.27], [-0.46, -0.34], [-0.6, -0.26], [-0.76, -0.3], [-0.86, -0.08], [-0.92, 0.38], [-1.0, 0.3], [-1.16, 0.36]];
        return { back: T(`<path d="M-1.14 -0.4 C-1.24 0.0 -1.22 0.3 -1.1 0.42 L1.1 0.42 C1.22 0.3 1.24 0.0 1.14 -0.4Z"/>`, under),
          front: T(shape("M-1.16 0.36 C-1.3 -0.8 -0.72 -1.34 0.02 -1.34 C0.74 -1.34 1.3 -0.8 1.16 0.36", [[1.16, 0.36], ...tips], [0.12, -0.12])
            + tex(toward([0, -1.26], tips.filter((_, i) => i > 3 && i < 14), 0.74, 0.04) + " M-0.98 -0.5 Q-1.04 -0.1 -0.96 0.26 M0.98 -0.5 Q1.04 -0.1 0.96 0.26", "M-0.62 -1.12 Q-0.3 -1.26 0.0 -1.26 M0.3 -1.22 Q0.58 -1.14 0.74 -1.0")) };
      }
      case "curly": {            // a mop of tight curls
        const cs = [[-1.0, -0.08, 0.24], [-0.98, -0.48, 0.26], [-0.8, -0.86, 0.27], [-0.5, -1.08, 0.28], [-0.14, -1.18, 0.28], [0.22, -1.16, 0.28], [0.56, -1.04, 0.27], [0.84, -0.8, 0.26], [1.0, -0.44, 0.25], [1.02, -0.06, 0.23],
          [-0.62, -0.64, 0.22], [-0.24, -0.74, 0.22], [0.14, -0.74, 0.22], [0.5, -0.66, 0.22], [0, -0.92, 0.42]];
        return { back: "", front: T(cloud(cs, W(11)) + ln(cs.slice(0, 14).map(([x, y, r]) => curl(x, y, r)).join(" "), dk, 2.6) + ln("M-0.6 -1.18 A0.2 0.2 0 0 1 -0.36 -1.28 M0.1 -1.36 A0.2 0.2 0 0 1 0.34 -1.36", lt, 3.4, 0.85)) };
      }
      case "afro": {
        const cs = [[0, -0.62, 0.98], [-0.82, -0.28, 0.6], [0.82, -0.28, 0.6], [-0.62, -1.02, 0.58], [0.62, -1.02, 0.58], [0, -1.3, 0.56], [-1.02, 0.2, 0.42], [1.02, 0.2, 0.42]];
        const spots = [[-1.2, -0.3], [-0.96, -0.86], [-0.5, -1.36], [0.1, -1.6], [0.62, -1.34], [1.06, -0.8], [1.24, -0.2], [-1.2, 0.3], [1.2, 0.36], [-0.3, -1.1], [0.36, -1.12]];
        return { back: T(cloud(cs, W(11)) + ln(spots.map(([x, y]) => curl(x, y, 0.18)).join(" "), dk, 2.6) + ln("M-0.86 -1.2 A0.5 0.5 0 0 1 -0.36 -1.56", lt, 4, 0.7)),
          front: T(`<path d="M-1.05 0.02 C-1.12 -0.6 -0.7 -1.04 0 -1.04 C0.7 -1.04 1.12 -0.6 1.05 0.02 ${edge([1.05, 0.02], [[0.9, -0.34], [0.72, -0.5], [0.4, -0.62], [0, -0.66], [-0.4, -0.62], [-0.72, -0.5], [-0.9, -0.34], [-1.05, 0.02]], -0.14)}Z"/>` + ln([[-0.6, -0.8], [-0.2, -0.86], [0.2, -0.86], [0.6, -0.8]].map(([x, y]) => curl(x, y, 0.16)).join(" "), dk, 2.6)) };
      }
      case "mohawk": {           // shaved sides (a see-through cap) and a crest of locks down the middle
        const crest = [[-0.5, -1.4], [-0.24, -1.2], [-0.16, -1.76], [0.06, -1.32], [0.24, -1.84], [0.3, -1.3], [0.58, -1.46]];
        return { back: "", front: T(`<path d="${SKULL}" fill-opacity=".3" stroke="none"/><path d="M-0.3 -0.9 ${edge([-0.3, -0.9], crest, [0.16, -0.1])} L0.32 -0.9 Q0 -0.82 -0.3 -0.9Z"/>` + tex(toward([0, -0.9], crest.filter((_, i) => !(i % 2)), 0.78, 0.1), "M-0.04 -1.0 Q0.02 -1.3 0.12 -1.56")) };
      }
      case "bun": case "spacebuns": {   // hair pulled up off the face into one bun on top, or two
        const buns = style === "bun" ? [[0, -1.4, 0.36]] : [[-0.72, -1.06, 0.3], [0.72, -1.06, 0.3]];
        const bunArt = buns.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join("");
        const swirl = buns.map(([x, y, r]) => `M${n3(x - r * 0.6)} ${n3(y + r * 0.1)} Q${n3(x - r * 0.4)} ${n3(y - r * 0.7)} ${n3(x + r * 0.4)} ${n3(y - r * 0.5)} M${n3(x - r * 0.3)} ${n3(y + r * 0.5)} Q${n3(x + r * 0.5)} ${n3(y + r * 0.5)} ${n3(x + r * 0.6)} ${n3(y - r * 0.1)}`).join(" ");
        return { back: "", front: T(bunArt + `<path d="${CAP}"/>` + (style === "spacebuns" ? ln("M0 -1.22 L0 -0.7", dk, 3) : "")
          + tex(swirl + " " + (style === "bun" ? CAP_STRANDS : "M-0.84 -0.42 Q-0.8 -0.8 -0.6 -0.9 M-0.36 -0.66 Q-0.36 -0.96 -0.5 -1.0 M0.36 -0.66 Q0.36 -0.96 0.5 -1.0 M0.84 -0.42 Q0.8 -0.8 0.6 -0.9"), buns.map(([x, y, r]) => `M${n3(x - r * 0.62)} ${n3(y - r * 0.3)} A${n3(r * 0.7)} ${n3(r * 0.7)} 0 0 1 ${n3(x - r * 0.1)} ${n3(y - r * 0.68)}`).join(" "))) };
      }
      case "ponytail": {         // pulled back off the face into a high ponytail with a bobble
        const tail = [[1.0, 1.24], [0.94, 1.0], [0.84, 1.16], [0.84, 0.86]];
        return { back: T(`<path d="M0.5 -0.98 C1.2 -1.22 1.6 -0.62 1.44 0.1 C1.36 0.56 1.16 0.9 1.0 1.24 ${edge([1.0, 1.24], tail.slice(1), 0.16)} C0.86 0.5 1.04 0.24 0.86 -0.1Z"/>`
            + tex("M1.0 -0.92 C1.34 -0.6 1.32 0.2 1.06 0.9 M0.9 -0.7 C1.12 -0.4 1.12 0.2 0.96 0.6", "M1.2 -0.84 C1.4 -0.5 1.38 -0.1 1.3 0.2") + `<circle cx="0.92" cy="-0.92" r="0.15" fill="#e8433f"/>`),
          front: T(`<path d="${CAP}"/>` + tex(CAP_STRANDS, "M-0.62 -0.98 Q-0.3 -1.14 0.06 -1.14")) };
      }
      case "pigtails": case "plait": {  // a centre parting; two bunches that flick out, or two plaits hanging past the shoulders
        let back;
        if(style === "pigtails"){
          const tuft = sg => { const p = [[-1.6, 0.66], [-1.5, 0.48], [-1.42, 0.78], [-1.3, 0.54], [-1.12, 0.68]].map(([x, y]) => [x * sg, y]);
            return `<path d="M${-0.98 * sg} -0.42 C${-1.46 * sg} -0.5 ${-1.66 * sg} 0.1 ${p[0][0]} ${p[0][1]} ${edge(p[0], p.slice(1), 0.18 * sg)} C${-1.12 * sg} 0.3 ${-1.0 * sg} 0.0 ${-0.96 * sg} -0.2Z"/>`
              + ln(`M${-1.12 * sg} -0.3 C${-1.4 * sg} -0.1 ${-1.46 * sg} 0.3 ${-1.44 * sg} 0.6 M${-1.06 * sg} -0.1 C${-1.24 * sg} 0.1 ${-1.28 * sg} 0.4 ${-1.26 * sg} 0.52`, dk, 2.6) + ln(`M${-1.26 * sg} -0.36 C${-1.46 * sg} -0.2 ${-1.54 * sg} 0.1 ${-1.54 * sg} 0.34`, lt, 3.4, 0.85); };
          back = T(tuft(1) + tuft(-1) + `<circle cx="-1.04" cy="-0.3" r="0.15" fill="#e8433f"/><circle cx="1.04" cy="-0.3" r="0.15" fill="#e8433f"/>`);
        } else {
          const plait = sg => { let o = ""; for(let i = 0; i < 6; i++){ const y = 0.36 + i * 0.22, x = sg * (1.02 + (i % 2 ? 0.03 : -0.03)), a = (i % 2 ? 28 : -28);
              o += `<ellipse cx="${n3(x)}" cy="${n3(y)}" rx="0.17" ry="0.13" transform="rotate(${a} ${n3(x)} ${n3(y)})"/>`; }
            const ty = 0.36 + 6 * 0.22 - 0.06, tx = sg * 1.02;
            return o + `<path d="M${tx - 0.08} ${n3(ty)} ${edge([tx - 0.08, ty], [[tx - 0.12, ty + 0.28], [tx - 0.02, ty + 0.16], [tx + 0.04, ty + 0.32], [tx + 0.1, ty + 0.14], [tx + 0.08, ty]], 0.16)}Z"/>`
              + `<rect x="${n3(tx - 0.1)}" y="${n3(ty - 0.06)}" width="0.2" height="0.1" rx="0.04" fill="#e8433f"/>`
              + ln([0, 1, 2, 3, 4, 5].map(i => { const y = 0.36 + i * 0.22, x = sg * (1.02 + (i % 2 ? 0.03 : -0.03)), d = i % 2 ? 1 : -1; return `M${n3(x - 0.09 * d)} ${n3(y - 0.06)} Q${n3(x)} ${n3(y + 0.02)} ${n3(x + 0.09 * d)} ${n3(y + 0.04)}`; }).join(" "), dk, 2.4); };
          back = T(`<path d="M-1.08 -0.3 C-1.16 0.1 -1.1 0.34 -1.0 0.44 L1.0 0.44 C1.1 0.34 1.16 0.1 1.08 -0.3Z" fill="${under}"/>` + plait(-1) + plait(1));
        }
        return { back, front: T(`<path d="M-1.06 0.3 C-1.16 -0.74 -0.7 -1.24 0 -1.24 C0.7 -1.24 1.16 -0.74 1.06 0.3 C0.96 0.1 0.9 -0.2 0.82 -0.4 C0.66 -0.62 0.3 -0.68 0 -0.9 C-0.3 -0.68 -0.66 -0.62 -0.82 -0.4 C-0.9 -0.2 -0.96 0.1 -1.06 0.3Z"/>`
          + tex("M0 -1.2 L0 -0.92 M-0.1 -1.06 C-0.5 -0.96 -0.84 -0.66 -0.96 -0.1 M0.1 -1.06 C0.5 -0.96 0.84 -0.66 0.96 -0.1 M-0.3 -1.12 C-0.7 -1.06 -0.98 -0.7 -1.04 -0.3", "M-0.2 -1.14 C-0.52 -1.06 -0.76 -0.88 -0.86 -0.62 M0.2 -1.14 C0.5 -1.08 0.72 -0.92 0.82 -0.7")) };
      }
      case "bob": {              // a side-parted bob to the chin, the ends flicking out
        return { back: T(`<path d="M-1.1 -0.3 C-1.22 0.3 -1.16 0.72 -1.0 0.86 Q0 0.98 1.0 0.86 C1.16 0.72 1.22 0.3 1.1 -0.3Z"/>`, under),
          front: T(`<path d="M-1.1 0.8 C-1.26 -0.6 -0.7 -1.26 0.3 -1.24 C0.92 -1.2 1.26 -0.6 1.12 0.62 Q1.2 0.76 1.28 0.74 Q1.12 0.9 0.92 0.78 C0.9 0.3 0.86 -0.2 0.7 -0.44 C0.56 -0.66 0.4 -0.8 0.3 -0.96 C0.0 -0.66 -0.5 -0.56 -0.8 -0.3 ${edge([-0.8, -0.3], [[-0.82, 0.2], [-0.88, 0.04], [-0.88, 0.76]], 0.1)} Q-1.04 0.9 -1.22 0.88Z"/>`
            + tex("M0.3 -1.1 C-0.2 -0.96 -0.7 -0.7 -0.98 -0.2 M0.16 -1.0 C-0.2 -0.78 -0.6 -0.6 -0.84 -0.36 M-1.02 0.0 C-1.06 0.3 -1.04 0.56 -1.0 0.8 M0.46 -1.08 C0.8 -0.92 1.0 -0.5 1.04 0.1 M0.94 0.0 C0.96 0.3 0.98 0.5 1.02 0.74", "M-0.12 -1.12 C-0.5 -1.0 -0.8 -0.76 -0.92 -0.5 M0.62 -1.08 C0.86 -0.92 0.98 -0.66 1.02 -0.4")) };
      }
      case "long": case "wavy": {   // long hair to the shoulder blades, side-parted: dead straight, or in loose waves
        const wavy = style === "wavy";
        const ends = [[-1.12, 1.86], [-0.92, 1.66], [-0.74, 1.9], [-0.5, 1.7], [-0.26, 1.92], [0, 1.72], [0.26, 1.92], [0.5, 1.7], [0.74, 1.9], [0.92, 1.66], [1.12, 1.86]];
        const sideL = wavy ? "M-1.04 -0.4 C-1.34 0.0 -1.12 0.36 -1.3 0.74 C-1.46 1.12 -1.16 1.44 -1.12 1.86" : "M-1.06 -0.4 C-1.2 0.4 -1.22 1.3 -1.12 1.86";
        const sideR = wavy ? "C1.16 1.44 1.46 1.12 1.3 0.74 C1.12 0.36 1.34 0.0 1.04 -0.4Z" : "C1.22 1.3 1.2 0.4 1.06 -0.4Z";
        const backStrands = wavy ? "M-1.04 0.0 C-1.2 0.4 -1.0 0.8 -1.16 1.2 C-1.26 1.5 -1.02 1.66 -1.0 1.76 M1.04 0.0 C1.2 0.4 1.0 0.8 1.16 1.2 C1.26 1.5 1.02 1.66 1.0 1.76"
          : "M-1.06 0.2 C-1.1 0.8 -1.08 1.3 -1.0 1.7 M1.06 0.2 C1.1 0.8 1.08 1.3 1.0 1.7 M-0.92 0.6 L-0.84 1.6 M0.92 0.6 L0.84 1.6";
        const fallL = wavy ? "C-0.92 -0.0 -0.8 0.24 -0.94 0.5 Q-0.98 0.62 -0.9 0.7" : "C-0.88 0.1 -0.88 0.44 -0.9 0.66";
        return { back: T(`<path d="${sideL} ${edge([-1.12, 1.86], ends.slice(1), [0.18, -0.12])} ${sideR}"/>`, under) + T(ln(backStrands, dk2, 2.6) + ln(toward([0, 0.9], ends.filter((_, i) => i % 2), 0.9, 0.02), dk2, 2.4)),
          front: T(`<path d="M-1.08 0.56 C-1.2 0.2 -1.22 -0.2 -1.12 -0.5 C-1.0 -0.96 -0.7 -1.24 -0.3 -1.24 C0.4 -1.26 0.98 -0.96 1.12 -0.5 C1.22 -0.2 1.2 0.2 1.08 0.56 ${edge([1.08, 0.56], [[0.98, 0.5], [0.9, 0.7]], 0.14)} ${wavy ? "C0.98 0.4 0.82 0.1 0.86 -0.1 C0.88 -0.3 0.72 -0.46 0.6 -0.54" : "C0.88 0.2 0.86 -0.2 0.76 -0.36 C0.7 -0.46 0.66 -0.52 0.6 -0.54"} C0.3 -0.76 -0.1 -0.76 -0.3 -0.98 C-0.44 -0.7 -0.76 -0.5 -0.86 -0.2 ${fallL} ${edge([-0.9, 0.7], [[-0.98, 0.5], [-1.08, 0.56]], 0.14)}Z"/>`
            + tex(wavy ? "M0.7 -0.9 C1.0 -0.6 0.88 -0.3 1.0 0.0 C1.06 0.24 0.94 0.4 0.98 0.6 M-0.7 -0.9 C-1.0 -0.6 -0.88 -0.3 -1.0 0.0 C-1.06 0.24 -0.94 0.4 -0.98 0.6 M-0.2 -1.1 C0.2 -1.0 0.6 -0.8 0.8 -0.5"
              : "M0.7 -0.92 C0.94 -0.5 0.98 0.1 0.98 0.56 M-0.7 -0.92 C-0.94 -0.5 -0.98 0.1 -0.98 0.56 M-0.2 -1.1 C0.2 -1.0 0.6 -0.8 0.82 -0.46 M-0.44 -1.0 C-0.7 -0.8 -0.86 -0.5 -0.92 -0.1",
              "M-0.5 -1.04 C-0.78 -0.86 -0.92 -0.6 -0.96 -0.2 M0.0 -1.12 C0.4 -1.06 0.72 -0.88 0.86 -0.62")) };
      }
      case "grunge": {           // long, straggly and centre-parted, a stray strand or two across the face
        return { back: T(`<path d="M-1.02 -0.4 C-1.32 0.3 -1.32 1.1 -1.16 1.62 ${edge([-1.16, 1.62], [[-1.0, 1.4], [-0.92, 1.68], [-0.76, 1.42], [-0.62, 1.6]], 0.14)} L-0.56 0.4Z"/><path d="M1.02 -0.4 C1.32 0.3 1.3 1.0 1.2 1.52 ${edge([1.2, 1.52], [[1.04, 1.36], [0.94, 1.64], [0.8, 1.38], [0.66, 1.54]], -0.14)} L0.56 0.4Z"/>` + ln("M-1.06 0.4 Q-1.1 1.0 -0.98 1.4 M1.08 0.4 Q1.12 0.9 1.04 1.3 M-0.84 0.6 Q-0.86 1.0 -0.8 1.3", dk2, 3), under),
          front: T(`<path d="M-1.08 0.36 C-1.18 -0.8 -0.6 -1.24 0 -1.22 C0.6 -1.24 1.18 -0.8 1.08 0.36 C1.02 -0.1 0.84 -0.48 0.42 -0.62 C0.24 -0.66 0.08 -0.7 0 -0.82 C-0.08 -0.7 -0.24 -0.66 -0.42 -0.62 C-0.84 -0.48 -1.02 -0.1 -1.08 0.36Z"/>`
            + tex("M-0.5 -0.92 Q-0.78 -0.5 -0.88 0 M0.5 -0.92 Q0.8 -0.5 0.9 0.05 M-0.18 -1.06 Q-0.36 -0.82 -0.46 -0.64 M0.2 -1.06 Q0.5 -0.9 0.66 -0.56 M-0.3 -0.7 Q-0.2 -0.4 -0.26 -0.1", "M-0.7 -1.0 Q-0.94 -0.7 -1.0 -0.3")) };
      }
    }
    return { back: "", front: "" };
  }

  /* ---- things worn on the head (hats, ears, halo, horns), in head units ---- */
  function headSvg(kind, g, c){
    // hats that sit on the forehead are lifted so they stay above the big eyes
    const lift = HAT_LIFT.includes(kind) ? -0.16 : 0;
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
      // worn sideways: the brim sticks out over one ear
      case "sidecap": return U(`<path d="${dome(-1.38, -0.16)}" fill="${c}"/><path d="M0.2 -1.34 Q0.5 -0.8 0.6 -0.2" fill="none" stroke-opacity=".25" stroke-width="${W(3)}"/><circle cx="0" cy="-1.38" r="0.07" fill="${dk}"/><path d="M0.82 -0.44 C1.22 -0.66 1.74 -0.5 1.76 -0.26 C1.56 -0.1 1.12 -0.12 0.9 -0.18Z" fill="${dk}"/>`);
      case "visor": return U(`<path d="M-1.06 -0.44 Q0 -0.86 1.06 -0.44 L1.06 -0.18 Q0 -0.6 -1.06 -0.18Z" fill="${c}"/><path d="M-0.86 -0.4 C-1.26 -0.64 -1.78 -0.48 -1.8 -0.24 C-1.6 -0.08 -1.14 -0.1 -0.92 -0.16Z" fill="${dk}"/>`);
      case "bucket": return U(`<path d="M-0.86 -0.42 C-0.9 -1.18 -0.52 -1.38 0 -1.38 C0.52 -1.38 0.9 -1.18 0.86 -0.42Z" fill="${c}"/><path d="M-1.34 -0.08 C-1.16 -0.5 -0.64 -0.56 0 -0.56 C0.64 -0.56 1.16 -0.5 1.34 -0.08 C0.8 -0.24 -0.8 -0.24 -1.34 -0.08Z" fill="${c}"/><path d="M-0.86 -0.62 Q0 -0.8 0.86 -0.62" fill="none" stroke="${dk}" stroke-width="${W(6)}"/><path d="M-0.5 -1.2 Q-0.2 -1.3 0.1 -1.28" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="${W(5)}"/>`);
      case "band": return U(`<path d="M-1.04 -0.36 Q0 -0.74 1.04 -0.36 L1.04 -0.12 Q0 -0.5 -1.04 -0.12Z" fill="${c}"/><path d="M0.82 -0.4 L1.3 -0.66 L1.24 -0.04Z" fill="${c}"/>`);
      case "phones": return U(`<path d="M-1.02 -0.04 C-1.12 -1.5 1.12 -1.5 1.02 -0.04" fill="none" stroke="${INK}" stroke-width="${W(12)}"/><path d="M-1.02 -0.04 C-1.12 -1.5 1.12 -1.5 1.02 -0.04" fill="none" stroke="${c}" stroke-width="${W(6)}"/><rect x="-1.2" y="-0.28" width="0.3" height="0.62" rx="0.14" fill="${c}"/><rect x="0.9" y="-0.28" width="0.3" height="0.62" rx="0.14" fill="${c}"/>`);
      case "santa": return U(`<path d="M-1.1 -0.3 C-1.18 -1.1 -0.5 -1.55 0.2 -1.5 C0.9 -1.45 1.5 -1.1 1.56 -0.5 C1.2 -0.95 0.8 -1.08 0.4 -1.08 C-0.2 -1.0 -0.8 -0.7 -1.1 -0.3Z" fill="${c}"/><path d="M-1.1 -0.3 C-1.18 -1.1 -0.5 -1.5 0.3 -1.2 C0.8 -1.0 1.1 -0.7 1.1 -0.3Z" fill="${c}"/><rect x="-1.18" y="-0.62" width="2.36" height="0.5" rx="0.25" fill="#fff"/><circle cx="1.58" cy="-0.36" r="0.24" fill="#fff"/>`);
      case "elf": return U(`<path d="M-1.1 -0.3 C-1.16 -1.0 -0.9 -1.5 -1.5 -1.95 C-0.7 -1.85 0.4 -1.6 0.8 -1.1 C1.1 -0.8 1.14 -0.5 1.1 -0.3Z" fill="${c}"/><rect x="-1.16" y="-0.6" width="2.32" height="0.46" rx="0.16" fill="#e8433f"/><circle cx="-1.52" cy="-1.98" r="0.16" fill="#ffc42b"/>`);
      case "pirate": return U(`<path d="M-1.5 -0.32 C-1.1 -0.95 -0.55 -1.4 0 -1.4 C0.55 -1.4 1.1 -0.95 1.5 -0.32 C1.0 -0.14 0.5 -0.5 0 -0.5 C-0.5 -0.5 -1.0 -0.14 -1.5 -0.32Z" fill="#2a2a2e"/><path d="M-1.38 -0.4 C-0.95 -0.12 -0.45 -0.5 0 -0.5 C0.45 -0.5 0.95 -0.12 1.38 -0.4" fill="none" stroke="#ffc42b" stroke-width="${W(7)}"/><circle cx="0" cy="-0.95" r="0.18" fill="#fff"/><path d="M-0.34 -0.7 L0.34 -0.7 M-0.3 -0.6 L0.3 -0.6" fill="none" stroke="#fff" stroke-width="${W(4)}"/>`);
      // a ring of little flowers across the top of the head, with leaves between
      case "flowers": { const at = x => -1.1 + 0.4 * x * x, pcs = [c, "#ff6fa3", "#f7f4ee", "#a070e8", "#ffc42b"];
        const leaves = [-0.6, -0.2, 0.2, 0.6].map(x => `<ellipse cx="${x}" cy="${n3(at(x) - 0.04)}" rx="0.13" ry="0.06" transform="rotate(${x * 40} ${x} ${n3(at(x) - 0.04)})" fill="#4fb86a" stroke-width="${W(3)}"/>`).join("");
        return U(leaves + [-0.8, -0.4, 0, 0.4, 0.8].map((x, i) => `<g transform="translate(${x} ${n3(at(x))})" stroke-width="${W(3.2)}">${[0, 1, 2, 3, 4].map(k => { const a = k * 72 * Math.PI / 180; return `<circle cx="${n3(Math.sin(a) * 0.13)}" cy="${n3(-Math.cos(a) * 0.13)}" r="0.11" fill="${pcs[i]}"/>`; }).join("")}<circle r="0.08" fill="${pcs[i] === "#ffc42b" ? "#ff8a1c" : "#ffc42b"}"/></g>`).join("")); }
      // a hippie headband worn low across the forehead, a zigzag woven in, its long tails hanging down one side
      case "hippy": { const zc = ["#ffc42b", "#ffd34d", "#ff8a1c"].includes(c) ? "#e8433f" : "#ffc42b";
        let zig = ""; for(let i = 0; i <= 12; i++){ const x = -0.96 + i * 0.16; zig += `${i ? "L" : "M"}${n3(x)} ${n3(-0.58 + 0.17 * x * x + (i % 2 ? -0.05 : 0.05))} `; }
        return U(`<path d="M0.98 -0.48 C1.14 -0.16 1.3 0.3 1.36 0.74 L1.2 0.8 C1.14 0.38 1.04 -0.06 0.9 -0.4Z" fill="${c}"/><path d="M0.94 -0.44 C1.02 -0.08 1.06 0.4 1.06 0.88 L0.9 0.88 C0.9 0.42 0.88 0.02 0.82 -0.36Z" fill="${dk}"/>`
          + `<path d="M-1.06 -0.5 Q0 -0.86 1.06 -0.5 L1.06 -0.28 Q0 -0.64 -1.06 -0.28Z" fill="${c}"/><path d="${zig}" fill="none" stroke="${zc}" stroke-width="${W(4)}"/><circle cx="1.0" cy="-0.42" r="0.09" fill="${dk}"/>`); }
      // Rust Row (Adventure) gear: a yellow hard hat with a ridge and a wide brim
      case "hardhat": return U(`<path d="M-1.14 -0.24 C-1.2 -1.8 1.2 -1.8 1.14 -0.24Z" fill="#ffc42b"/><path d="M-0.5 -1.12 Q-0.2 -1.22 0.1 -1.24" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="${W(7)}"/><path d="M0 -1.32 V-0.26" fill="none" stroke-opacity=".35" stroke-width="${W(5)}"/><path d="M-1.32 -0.24 H1.32" stroke-width="${W(20)}"/><path d="M-1.32 -0.24 H1.32" stroke="#ffc42b" stroke-width="${W(11)}"/>`);
      case "horns": return U(`<path d="M-0.5 -0.95 C-0.72 -1.3 -0.56 -1.62 -0.26 -1.8 C-0.32 -1.5 -0.18 -1.25 -0.12 -1.0Z" fill="#d7262f"/><path d="M0.5 -0.95 C0.72 -1.3 0.56 -1.62 0.26 -1.8 C0.32 -1.5 0.18 -1.25 0.12 -1.0Z" fill="#d7262f"/>`);
    }
    return "";
  }
  /* ---- the face: marks and eyewear, in head units ---- */
  function faceSvg(mark, eyewear, g, hc){
    const W = x => (x / g.hrx).toFixed(4), U = body => `<g transform="translate(200 ${g.oy}) scale(${g.hrx})" ${ST} stroke-width="${W(5)}">${body}</g>`, ex = EYE_X;
    const ry = g.hry / g.hrx, cy = ry - 1, f = n => n.toFixed(3);       // the head ellipse, in head units
    const tache = `<path d="M0 0.4 C-0.1 0.3 -0.34 0.3 -0.42 0.48 C-0.3 0.43 -0.14 0.49 0 0.45 C0.14 0.49 0.3 0.43 0.42 0.48 C0.34 0.3 0.1 0.3 0 0.4Z" fill="${hc}"/>`;
    let out = "";
    switch(mark){
      case "freckles": out += U(`<g fill="#b5764a" stroke="none">${[[-0.18, 0.3], [-0.06, 0.38], [0.06, 0.3], [0.18, 0.38], [-0.3, 0.42], [0.3, 0.42], [0, 0.2]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="0.035"/>`).join("")}</g>`); break;
      case "plaster": out += U(`<g transform="translate(0.56 0.42) rotate(-24) scale(.8)"><rect x="-0.26" y="-0.09" width="0.52" height="0.18" rx="0.07" fill="#f2cf9a" stroke-width="${W(3.4)}"/><rect x="-0.07" y="-0.09" width="0.14" height="0.18" fill="#e5b97a" stroke="none"/></g>`); break;
      case "warpaint": out += U(`<g fill="none" stroke="#d7262f" stroke-width="${W(7)}"><path d="M${-ex - 0.22} 0.34 L${-ex + 0.2} 0.34 M${-ex - 0.2} 0.46 L${-ex + 0.16} 0.46"/><path d="M${ex - 0.2} 0.34 L${ex + 0.22} 0.34 M${ex - 0.16} 0.46 L${ex + 0.2} 0.46"/></g>`); break;
      case "scar": out += U(`<path d="M0.52 -0.34 L0.86 0.34" fill="none" stroke="#b5483f" stroke-width="${W(7)}"/><path d="M0.56 -0.14 l0.18 -0.07 M0.64 0.04 l0.18 -0.07 M0.72 0.2 l0.18 -0.07" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="${W(3.4)}"/>`); break;
    }
    return out;
  }
  /* face paint and make-up go on under the eyes (the eyes are drawn over them). White-face paints turn the eyelids white too. */
  const PAINT_BASE = { starpaint: "#f7f4ee", batpaint: "#f7f4ee" };
  function paintSvg(mark, g){
    const W = x => (x / g.hrx).toFixed(4), U = body => `<g transform="translate(200 ${g.oy}) scale(${g.hrx})" stroke="none">${body}</g>`, ex = EYE_X, f = n3;
    switch(mark){
      // a big black star over one eye
      case "starpaint": return U(`<path d="${star(ex, -0.02, 0.52, 0.23, 3)}" fill="${INK}"/>`);
      // black round both eyes, rising into pointed wings on the forehead
      case "batpaint": return U([-1, 1].map(sg => { const P = (x, y) => `${f(sg * x)} ${f(y)}`;
          return `<path d="M${P(0.06, 0.06)} Q${P(0.33, 0.46)} ${P(0.64, 0.18)} L${P(0.9, -0.18)} L${P(0.84, -0.9)} L${P(0.64, -0.44)} L${P(0.48, -0.86)} L${P(0.36, -0.42)} L${P(0.14, -0.7)} L${P(0.06, -0.2)}Z" fill="${INK}" stroke="${INK}" stroke-width="${W(3)}" stroke-linejoin="round"/>`; }).join(""));
      // a red lightning bolt with a blue edge, from the forehead down over one eye to the cheek
      case "bolt": return U(`<path d="M0.02 -0.84 L0.52 -0.84 L0.3 -0.24 L0.66 -0.24 L0.1 0.76 L0.22 0.08 L-0.12 0.08Z" fill="#e8433f" stroke="#4aa8ff" stroke-width="${W(5)}" stroke-linejoin="round"/>`);
      // glam-rock eyeshadow: purple and blue sweeps over each eye, a flick at the corner and a little glitter
      case "glam": return U([-1, 1].map(sg => { const x = sg * ex;
          return `<path d="M${f(x - 0.42)} 0.06 Q${f(x)} -0.74 ${f(x + 0.42)} 0.06 Q${f(x)} -0.1 ${f(x - 0.42)} 0.06Z" fill="#a070e8"/><path d="M${f(x - 0.34)} 0.02 Q${f(x)} -0.5 ${f(x + 0.34)} 0.02 Q${f(x)} -0.1 ${f(x - 0.34)} 0.02Z" fill="#4aa8ff"/>`
            + `<path d="M${f(x + sg * 0.3)} 0.02 L${f(x + sg * 0.5)} -0.14" fill="none" stroke="${INK}" stroke-width="${W(4)}" stroke-linecap="round"/>`
            + [[-0.16, -0.4], [0.06, -0.48], [0.22, -0.34]].map(([dx, y]) => `<circle cx="${f(x + sg * dx)}" cy="${y}" r="0.03" fill="#fff"/>`).join(""); }).join(""));
    }
    return "";
  }
  function beardSvg(kind, g, hc){
    if(!kind || kind === "none") return "";
    const W = x => (x / g.hrx).toFixed(4), U = body => `<g transform="translate(200 ${g.oy}) scale(${g.hrx})" ${ST} stroke-width="${W(5)}">${body}</g>`;
    const ry = g.hry / g.hrx, cy = ry - 1, chin = cy + ry, f = n => n.toFixed(3);       // the head ellipse, in head units
    const a = 0.26, ox = Math.cos(a) * 1.02, oyy = cy + Math.sin(a) * ry;
    const tache = `<path d="M0 0.4 C-0.1 0.3 -0.34 0.3 -0.42 0.48 C-0.3 0.43 -0.14 0.49 0 0.45 C0.14 0.49 0.3 0.43 0.42 0.48 C0.34 0.3 0.1 0.3 0 0.4Z" fill="${hc}"/>`;
    // a jaw beard: drop = how far below the chin it hangs, inner = how high it comes up under the mouth, side = how wide the gap is
    const jaw = (drop, inner, side, round) => { const by = chin + drop;
      return `M${f(-ox)} ${f(oyy)} C${f(-1.04)} ${f(by - 0.1 - round)} ${f(-0.55 - round)} ${f(by)} 0 ${f(by)} C${f(0.55 + round)} ${f(by)} ${f(1.04)} ${f(by - 0.1 - round)} ${f(ox)} ${f(oyy)} L${f(side)} ${f(oyy + 0.02)} C${f(side - 0.04)} ${f(inner - 0.06)} 0.36 ${f(inner)} 0 ${f(inner)} C-0.36 ${f(inner)} ${f(-side + 0.04)} ${f(inner - 0.06)} ${f(-side)} ${f(oyy + 0.02)}Z`; };
    switch(kind){
      // five o'clock shadow: lots of tiny dots over the jaw and top lip, clipped to the face so none sit outside its outline
      case "stubble": { const id = "sb" + (++uid), id2 = "sf" + (++uid); let dots = "", i = 0;
        for(let y = 0.24; y < chin + 0.06; y += 0.062, i++) for(let x = -1 + (i % 2) * 0.034; x < 1; x += 0.068){ const j = ((i * 31 + Math.round(x * 100) * 17) % 11) / 11 - 0.5;
          dots += `<circle cx="${n3(x + j * 0.02)}" cy="${n3(y + j * 0.016)}" r="0.017"/>`; }
        return U(`<clipPath id="${id}"><path d="${jaw(0.02, 0.8, 0.74, 0)}"/>${tache.replace(` fill="${hc}"`, "")}</clipPath><clipPath id="${id2}"><ellipse cx="0" cy="${f(cy)}" rx="0.95" ry="${f(ry - 0.05)}"/></clipPath>`
          + `<g clip-path="url(#${id2})"><g clip-path="url(#${id})"><g fill="${hc}" fill-opacity=".8" stroke="none">${dots}</g></g></g>`); }
      case "moustache": return U(tache);
      case "handlebar": { const half = `<path d="M0 0.4 C-0.12 0.3 -0.36 0.31 -0.48 0.42 C-0.56 0.48 -0.66 0.42 -0.62 0.3 C-0.72 0.4 -0.66 0.58 -0.48 0.53 C-0.32 0.48 -0.14 0.5 0 0.45Z" fill="${hc}"/>`;
        return U(half + `<g transform="scale(-1 1)">${half}</g>`); }
      case "goatee": return U(`<path d="M-0.22 ${f(chin - 0.14)} Q0 ${f(chin - 0.2)} 0.22 ${f(chin - 0.14)} Q0.2 ${f(chin + 0.1)} 0 ${f(chin + 0.14)} Q-0.2 ${f(chin + 0.1)} -0.22 ${f(chin - 0.14)}Z" fill="${hc}"/>` + tache);
      case "chinstrap": return U(`<path d="${jaw(0.06, chin - 0.1, 0.88, 0)}" fill="${hc}"/>`);
      case "full": return U(`<path d="${jaw(0.13, 0.8, 0.74, 0)}" fill="${hc}"/>` + tache);
      case "bushy": return U(`<path d="${jaw(0.5, 0.8, 0.74, 0.18)}" fill="${hc}"/><path d="M-0.4 ${f(chin + 0.12)} q0.08 0.14 0.02 0.26 M0 ${f(chin + 0.18)} q0.08 0.14 0.02 0.26 M0.4 ${f(chin + 0.12)} q0.08 0.14 0.02 0.26" fill="none" stroke="${shade(hc, 0.7)}" stroke-width="${W(3.4)}"/>` + tache);
    }
    return "";
  }
  function eyewearSvg(eyewear, g){
    const W = x => (x / g.hrx).toFixed(4), U = body => `<g transform="translate(200 ${g.oy}) scale(${g.hrx})" ${ST} stroke-width="${W(5)}">${body}</g>`, ex = EYE_X, er = EYE_R;
    let out = "";
    switch(eyewear){
      case "glasses": out += U(`<circle cx="${-ex}" cy="0" r="${er + 0.1}" fill="#d9efff" fill-opacity=".3"/><circle cx="${ex}" cy="0" r="${er + 0.1}" fill="#d9efff" fill-opacity=".3"/><path d="M${-ex + er + 0.1} -0.02 Q0 -0.12 ${ex - er - 0.1} -0.02 M${-ex - er - 0.1} -0.04 L-1.0 -0.1 M${ex + er + 0.1} -0.04 L1.0 -0.1" fill="none"/>`); break;
      case "shades": out += U(`<rect x="${-ex - er - 0.1}" y="${-er - 0.04}" width="${2 * er + 0.2}" height="${2 * er}" rx="0.18" fill="${INK}"/><rect x="${ex - er - 0.1}" y="${-er - 0.04}" width="${2 * er + 0.2}" height="${2 * er}" rx="0.18" fill="${INK}"/><path d="M${-ex + er + 0.1} -0.1 H${ex - er - 0.1} M${-ex - er - 0.1} -0.08 L-1.0 -0.14 M${ex + er + 0.1} -0.08 L1.0 -0.14" fill="none"/><path d="M${-ex - 0.14} -0.1 l0.14 -0.04 M${ex - 0.14} -0.1 l0.14 -0.04" stroke="#fff" stroke-opacity=".55" stroke-width="${W(4)}" fill="none"/>`); break;
      case "mask": out += U(`<path d="M-1.02 -0.3 Q0 -0.56 1.02 -0.3 Q1.08 0.3 0.62 0.36 Q0.3 0.28 0 0.3 Q-0.3 0.28 -0.62 0.36 Q-1.08 0.3 -1.02 -0.3Z" fill="#4aa8ff"/><circle cx="${-ex}" cy="0" r="${er - 0.02}" fill="#fff"/><circle cx="${ex}" cy="0" r="${er - 0.02}" fill="#fff"/><circle cx="${-ex}" cy="0" r="${er * 0.36}" fill="${INK}" stroke="none"/><circle cx="${ex}" cy="0" r="${er * 0.36}" fill="${INK}" stroke="none"/>`); break;
      case "round": out += U([-ex, ex].map(x => `<circle cx="${x}" cy="0" r="${er + 0.07}" fill="#ff8a1c" fill-opacity=".45" stroke-width="${W(3.6)}"/>`).join("")
        + `<path d="M${-ex + er + 0.07} -0.02 Q0 -0.1 ${ex - er - 0.07} -0.02 M${-ex - er - 0.07} 0 L-1.0 -0.08 M${ex + er + 0.07} 0 L1.0 -0.08" fill="none" stroke-width="${W(3.6)}"/>`); break;
      // Rust Row (Adventure) gear: welding goggles over the eyes, and a gas mask with a filter
      case "goggles": out += U(`<path d="M-1.04 -0.04 L1.04 -0.04" stroke-width="${W(16)}"/><path d="M-1.04 -0.04 L1.04 -0.04" stroke="#3a3a3d" stroke-width="${W(9)}"/>` + [-ex, ex].map(x => `<circle cx="${x}" cy="0" r="${er + 0.08}" fill="#3fbfa8" fill-opacity=".88" stroke-width="${W(6)}"/><circle cx="${x - 0.1}" cy="-0.1" r="0.06" fill="#dffff8" stroke="none"/>`).join("")); break;
      case "gasmask": out += U(`<path d="M-1.02 0.12 Q0 0.0 1.02 0.12" fill="none" stroke-width="${W(14)}"/><path d="M-1.02 0.12 Q0 0.0 1.02 0.12" fill="none" stroke="#3a3a3d" stroke-width="${W(8)}"/>`
          + [-ex, ex].map(x => `<circle cx="${x}" cy="0" r="${er + 0.03}" fill="#d2ffe6" fill-opacity=".3" stroke-width="${W(6)}"/>`).join("")
          + `<ellipse cx="0" cy="0.52" rx="0.36" ry="0.28" fill="#6c7480" stroke-width="${W(6)}"/><rect x="-0.17" y="0.66" width="0.34" height="0.3" rx="0.08" fill="#8a9a4f" stroke-width="${W(5)}"/><path d="M-0.06 0.71 v0.2 M0.06 0.71 v0.2" fill="none" stroke-width="${W(3)}"/>`); break;
      case "patch": out += U(`<path d="M${-1.0} -0.46 L${ex - er - 0.1} -0.1 M${ex + er + 0.05} -0.1 L1.0 -0.5" fill="none" stroke-width="${W(5)}"/><circle cx="${ex}" cy="0" r="${er + 0.08}" fill="#2a2a2e"/>`); break;
    }
    return out;
  }
  /* ---- the instruments, drawn lying flat: neck along +x, strings on y = -2, the body around 0,0 ---- */
  const INSTR_SIZE = { acoustic: 1.04, bass: 1.06, ukulele: 0.68, doubleneck: 0.92, violin: 1.0 };
  // a spike (or stud) on a jacket: base centred on x,y, pointing along angle a (radians)
  const spike = (x, y, a, len, w) => { const c = Math.cos(a), sn = Math.sin(a), f = n => n.toFixed(1);
    return `<path d="M${f(x - sn * w)} ${f(y + c * w)} L${f(x + c * len)} ${f(y + sn * len)} L${f(x + sn * w)} ${f(y - c * w)}Z" fill="#dfe3e8" ${sw(2.2)}/><path d="M${f(x - sn * w * 0.3)} ${f(y + c * w * 0.3)} L${f(x + c * len * 0.7)} ${f(y + sn * len * 0.7)}" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`; };
  function instrumentSvg(kind, c){
    // Rust Row's Rust Bucket: a beaten-up Strat, rust orange with spots of rust
    if(kind === "rustbucket") return instrumentSvg("guitar", "#b5562c") + `<g fill="#7a3a1c"><circle cx="-40" cy="10" r="5"/><circle cx="-26" cy="-22" r="3.5"/><circle cx="-50" cy="-8" r="3"/><circle cx="8" cy="18" r="3.5"/></g>`;
    const dark = "#2a2a2e", guard = c === "#f7f4ee" ? dark : "#f7f4ee", nl = kind === "bass" ? 34 : 0, end = 128 + nl;
    const frets = n => { let d = ""; for(let x = 50; x < end - 8; x += 22) d += `M${x} -9 V5 `; return `<path d="${d}" stroke="${INK}" stroke-opacity=".4" stroke-width="2"/>`; };
    const neck = from => `<rect x="${from}" y="-9" width="${end - from}" height="14" rx="4" fill="#e0bf82" ${sw(5)}/>${frets()}`;
    const pegs = (n, x, y, gap) => { let o = ""; for(let i = 0; i < n; i++) o += `<circle cx="${x + i * gap}" cy="${y}" r="2.5" fill="#fff"/>`; return o; };
    const strings = (from, n) => { let d = ""; for(let i = 0; i < n; i++){ const y = -6 + i * 8 / Math.max(1, n - 1); d += `M${from} ${y.toFixed(1)} L${end} ${y.toFixed(1)} `; } return `<path d="${d}" stroke="#fff" stroke-opacity=".6" stroke-width="1.1"/>`; };
    // Strat-style double cutaway: the upper horn (the -y side) reaches further along the neck than the lower one
    const STRAT = "M40 -21 C30 -31 12 -28 4 -22 C-6 -32 -28 -38 -44 -32 C-62 -24 -64 4 -56 18 C-48 32 -28 36 -14 28 C-4 22 8 28 20 25 C31 22 34 15 28 11 C21 9 15 6 15 -1 L15 -7 C16 -13 30 -12 40 -21Z";
    switch(kind){
      case "acoustic": case "ukulele": {      // round bouts, a sound hole and a bridge; slotted headstock
        const n = kind === "ukulele" ? 4 : 6;
        return neck(24) + `<path d="M${end - 2} -12 H${end + 30} Q${end + 34} -12 ${end + 34} -8 V4 Q${end + 34} 8 ${end + 30} 8 H${end - 2}Z" fill="${shade(c, 0.6)}" ${sw(5)}/>${pegs(n / 2, end + 6, -7, 10)}${pegs(n / 2, end + 6, 3, 10)}
          <g fill="${c}" ${sw(5)}><circle cx="-26" cy="-2" r="34"/><circle cx="14" cy="-2" r="25"/></g><g fill="${c}" stroke="none"><circle cx="-26" cy="-2" r="31.5"/><circle cx="14" cy="-2" r="22.5"/></g>
          <path d="M-58 -2 A32 32 0 0 1 -26 -34" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/>
          <ellipse cx="-8" cy="11" rx="12" ry="7" fill="${shade(c, 0.6)}"/><circle cx="4" cy="-2" r="12" fill="none" stroke="${shade(c, 0.6)}" stroke-width="3"/><circle cx="4" cy="-2" r="9" fill="${dark}"/>
          <rect x="-40" y="-14" width="8" height="24" rx="3" fill="#5b3a1e" ${sw(3)}/>${strings(-36, n === 6 ? 3 : 2)}`; }
      case "flyingv": {                       // a V with its point at the neck, two wings swept back
        return neck(14) + `<path d="M${end - 2} -9 L${end + 34} -16 L${end + 26} -2 L${end + 34} 12 L${end - 2} 5Z" fill="${shade(c, 0.7)}" ${sw(5)}/>${pegs(3, end + 6, -8, 9)}${pegs(3, end + 6, 4, 9)}
          <path d="M26 -11 L-56 -44 Q-66 -43 -63 -33 L-18 -2 L-63 29 Q-66 39 -56 40 L26 7 Q32 -2 26 -11Z" fill="${c}" ${sw(5)}/>
          <path d="M18 -12 L-6 -21 L-36 -3 L-6 17 L18 8Z" fill="${guard}" ${sw(3)}/>
          <rect x="-4" y="-11" width="10" height="18" rx="2" fill="${dark}"/><rect x="10" y="-11" width="10" height="18" rx="2" fill="${dark}"/><rect x="-16" y="-7" width="5" height="10" rx="1" fill="#c9ccd2" ${sw(1.6)}/>
          <path d="M-50 -38 L10 -14" stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/>${strings(-13, 3)}`; }
      case "violin": {                        // a violin-shaped hollow-body bass: two round bouts with a waist, sunburst, two pickups, a small headstock
        const VIOLIN = "M24 -2 C24 -18 14 -22 6 -20 C0 -19 -4 -14 -12 -14 C-20 -14 -24 -30 -44 -30 C-62 -30 -66 -14 -66 -2 C-66 10 -62 26 -44 26 C-24 26 -20 10 -12 10 C-4 10 0 15 6 16 C14 18 24 14 24 -2Z";
        return neck(14) + `<path d="M${end - 2} -11 H${end + 24} Q${end + 30} -11 ${end + 30} -5 V1 Q${end + 30} 7 ${end + 24} 7 H${end - 2}Z" fill="${shade(c, 0.5)}" ${sw(5)}/>${pegs(2, end + 8, -7, 12)}${pegs(2, end + 8, 3, 12)}
          <path d="${VIOLIN}" fill="${shade(c, 0.55)}" ${sw(5)}/><path d="${VIOLIN}" fill="${c}" transform="translate(-21 -2) scale(.82) translate(21 2)"/><ellipse cx="-36" cy="-2" rx="17" ry="12" fill="${tint(c, 0.45)}" opacity=".7"/>
          <rect x="-2" y="-11" width="8" height="18" rx="2" fill="${dark}" stroke="#d9dde3" stroke-width="1.6"/><rect x="10" y="-11" width="8" height="18" rx="2" fill="${dark}" stroke="#d9dde3" stroke-width="1.6"/>
          <rect x="-40" y="-9" width="5" height="14" rx="1.5" fill="#5b3a1e" ${sw(1.8)}/><path d="M-26 10 h14 v8 h-14Z" fill="#2a2a2e" ${sw(1.8)}/><circle cx="-22" cy="14" r="2" fill="#fff"/><circle cx="-16" cy="14" r="2" fill="#fff"/>
          <path d="M-58 -18 C-64 -8 -64 6 -58 14" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/>${strings(-38, 2)}`; }
      case "doubleneck": {                    // two necks (a 12-string above a 6-string) on one big twin-horned body
        const hs = `<path d="M${end - 2} -9 L${end + 24} -15 Q${end + 34} -16 ${end + 33} -8 L${end + 30} 2 Q${end + 24} 6 ${end + 14} 5 L${end - 2} 5Z" fill="${shade(c, 0.7)}" ${sw(5)}/>`;
        const NECKS = [[-14, true], [12, false]];
        return NECKS.map(([dy, twelve]) => `<g transform="translate(0 ${dy})">${neck(14)}${hs}${pegs(6, end + 2, -10, 5.4)}${twelve ? pegs(6, end + 2, 2, 5.4) : ""}</g>`).join("")
          + `<path d="M36 -40 C28 -52 10 -50 4 -44 C-12 -56 -44 -58 -60 -46 C-76 -32 -76 30 -60 44 C-44 56 -12 54 4 42 C10 48 28 48 36 36 C28 32 22 28 22 22 L22 -26 C22 -32 28 -36 36 -40Z" fill="${c}" ${sw(5)}/>`
          + NECKS.map(([dy]) => `<g transform="translate(0 ${dy})"><rect x="-6" y="-11" width="10" height="18" rx="2" fill="${dark}"/><rect x="8" y="-11" width="10" height="18" rx="2" fill="${dark}"/><rect x="-22" y="-8" width="5" height="12" rx="1" fill="#c9ccd2" ${sw(1.6)}/>${strings(-19, 3)}</g>`).join("")
          + `<circle cx="-52" cy="24" r="3.4" fill="${dark}"/><circle cx="-42" cy="32" r="3.4" fill="${dark}"/><circle cx="-30" cy="38" r="3.4" fill="${dark}"/><circle cx="-54" cy="-30" r="3" fill="#fff" ${sw(1.6)}/>
          <path d="M-62 -30 C-70 -14 -70 14 -64 28" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/>`; }
      case "bass": {                          // a long neck, four big tuners, one split pickup
        return neck(14) + `<path d="M${end - 2} -9 L${end + 34} -12 Q${end + 40} -10 ${end + 38} -2 L${end + 30} 6 L${end - 2} 5Z" fill="${shade(c, 0.7)}" ${sw(5)}/>${pegs(4, end + 4, -13, 9)}
          <path d="${STRAT}" fill="${c}" ${sw(5)}/><path d="M12 -12 C0 -16 -14 -18 -24 -12 L-30 4 C-24 18 -8 20 2 16 L12 8Z" fill="${guard}" ${sw(3)}/>
          <rect x="-12" y="-11" width="8" height="10" rx="2" fill="${dark}"/><rect x="-6" y="-2" width="8" height="10" rx="2" fill="${dark}"/><rect x="-48" y="-10" width="7" height="16" rx="1.5" fill="#c9ccd2" ${sw(1.6)}/>
          <circle cx="-34" cy="18" r="3.2" fill="${dark}"/><circle cx="-24" cy="22" r="3.2" fill="${dark}"/><path d="M-50 -28 C-58 -18 -58 4 -52 14" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/>${strings(-44, 2)}`; }
      default: {                              // "guitar": the Strat, three single-coil pickups and a white scratchplate
        return neck(14) + `<path d="M${end - 2} -9 L${end + 24} -15 Q${end + 34} -16 ${end + 33} -8 L${end + 30} 2 Q${end + 24} 6 ${end + 14} 5 L${end - 2} 5Z" fill="${shade(c, 0.7)}" ${sw(5)}/>${pegs(6, end + 2, -10, 5.4)}
          <path d="${STRAT}" fill="${c}" ${sw(5)}/><path d="M14 -10 C2 -17 -18 -20 -30 -14 L-36 6 C-28 20 -10 22 4 18 L14 8Z" fill="${guard}" ${sw(3)}/>
          ${[-24, -12, 0].map((x, i) => `<rect x="${x + (i ? 0 : -2)}" y="-10" width="5" height="16" rx="2.5" fill="${dark}" transform="rotate(${i ? 0 : -8} ${x} -2)"/>`).join("")}
          <rect x="-46" y="-11" width="8" height="18" rx="1.5" fill="#c9ccd2" ${sw(1.6)}/><circle cx="-26" cy="14" r="3" fill="#fff" ${sw(1.4)}/><circle cx="-16" cy="16" r="3" fill="#fff" ${sw(1.4)}/>
          <path d="M-50 -28 C-58 -18 -58 4 -52 14" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/>${strings(-42, 3)}`; }
    }
  }
  /* ---- gear worn on the body: guitar on a strap, a headset mic, a cape. ---- */
  function gearSvg(kind, g, c, solo){
    const x0 = 200 - g.tW / 2, x1 = 200 + g.tW / 2, tBot = g.tTop + g.tH, s = g.tW / 90;
    switch(kind){
      case "guitar": case "bass": case "ukulele": case "acoustic": case "flyingv": case "doubleneck": case "violin": case "rustbucket": {
        const ga = guitarAt(g, solo), k = ga.k * (INSTR_SIZE[kind] || 1), strap = `M${x0 + 6} ${g.tTop + 4} L${(ga.x + 4 * s).toFixed(1)} ${(ga.y + 6 * s).toFixed(1)}`;
        return { mid: `<path d="${strap}" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="${strap}" stroke="#a8723c" stroke-width="7" stroke-linecap="round"/>
        <g transform="translate(${ga.x.toFixed(1)} ${ga.y.toFixed(1)}) rotate(${ga.rot}) scale(${k.toFixed(3)})">${instrumentSvg(kind, c)}</g>` }; }
      case "mic": { const W = x => (x / g.hrx).toFixed(4), U = body => `<g transform="translate(200 ${g.oy}) scale(${g.hrx})" fill="none" ${ST} stroke-width="${W(6)}">${body}</g>`;
        return { head: U(`<path d="M-1.02 -0.1 C-1.1 -1.3 1.1 -1.3 1.02 -0.1" stroke-width="${W(7)}"/><circle cx="-1.04" cy="0.1" r="0.2" fill="${c}"/><path d="M-1.0 0.28 C-0.98 0.9 -0.6 1.04 -0.26 0.9" stroke-width="${W(6)}"/><circle cx="-0.2" cy="0.9" r="0.13" fill="#2a2a2e"/>`) }; }
      case "cape": { const y0 = g.tTop + 8, y1 = FEET + 6;       // (an accessory now: drawn via extraSvg)
        return { back: `<g class="pa-cape"><path d="M${x0 - 2} ${y0} C${x0 - 36} ${y0 + 70} ${x0 - 42} ${y1 - 30} ${x0 - 32} ${y1} C${x0 + 20} ${y1 - 18} ${x1 - 20} ${y1 - 18} ${x1 + 32} ${y1} C${x1 + 42} ${y1 - 30} ${x1 + 36} ${y0 + 70} ${x1 + 2} ${y0}Z" fill="${c}" ${sw(6)}/></g>` }; }
    }
    return {};
  }

  /* ---- accessories: back = behind everything, mid = over the top (under the arms), band = sweatbands on the wrists ---- */
  function extraSvg(kind, g, c){
    const x0 = 200 - g.tW / 2, x1 = 200 + g.tW / 2, tBot = g.tTop + g.tH;
    switch(kind){
      case "cape": return gearSvg("cape", g, c);
      case "wings": { const wing = sg => { const bx = 200 + sg * 10, by = g.tTop + 16, tx = 200 + sg * (g.tW / 2 + 82), ty = g.tTop - 44;
          return `<path d="M${bx} ${by} C${bx + sg * 30} ${ty - 6} ${tx - sg * 14} ${ty - 12} ${tx} ${ty} C${tx + sg * 6} ${ty + 20} ${tx - sg * 4} ${ty + 30} ${tx - sg * 14} ${ty + 34} C${tx - sg * 4} ${ty + 48} ${tx - sg * 16} ${ty + 62} ${tx - sg * 30} ${ty + 62} C${tx - sg * 24} ${ty + 84} ${tx - sg * 42} ${ty + 100} ${tx - sg * 60} ${ty + 98} C${bx + sg * 18} ${g.tTop + g.tH * 0.8} ${bx} ${by + 30} ${bx} ${by}Z" fill="${c}" ${sw(5)}/><path d="M${tx - sg * 14} ${ty + 34} Q${bx + sg * 40} ${ty + 26} ${bx + sg * 16} ${by} M${tx - sg * 30} ${ty + 62} Q${bx + sg * 34} ${ty + 56} ${bx + sg * 12} ${by + 14}" fill="none" stroke="${shade(c, 0.78)}" stroke-width="3" stroke-linecap="round"/>`; };
        return { back: wing(-1) + wing(1) }; }
      case "backpack": return { back: `<path d="${rrect(x0 - 12, g.tTop + 10, x1 + 12, tBot - 2, 16)}" fill="${c}" ${sw(5)}/>`,
          mid: [x0 + 14, x1 - 14].map(x => `<path d="M${x} ${g.tTop + 1} L${x - (x < 200 ? 4 : -4)} ${g.tTop + g.tH * 0.8}" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M${x} ${g.tTop + 1} L${x - (x < 200 ? 4 : -4)} ${g.tTop + g.tH * 0.8}" fill="none" stroke="${shade(c, 0.75)}" stroke-width="5" stroke-linecap="round"/>`).join("") };
      case "bumbag": return { mid: `<path d="M${x0 + 2} ${tBot - 14} L${x1 - 2} ${tBot - 22}" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M${x0 + 2} ${tBot - 14} L${x1 - 2} ${tBot - 22}" fill="none" stroke="#3a3a3d" stroke-width="4" stroke-linecap="round"/><path d="${rrect(200 - 19, tBot - 26, 200 + 19, tBot - 4, 9)}" fill="${c}" ${sw(4.5)}/><path d="M${200 - 13} ${tBot - 18} Q200 ${tBot - 21} ${200 + 13} ${tBot - 18}" fill="none" ${sw(2.4)}/><circle cx="${200 + 13}" cy="${tBot - 18}" r="2.4" fill="#d9d9de" ${sw(1.6)}/>` };
      case "belt": { let studs = ""; for(let x = x0 + 9; x < x1 - 4; x += 10) if(Math.abs(x - 200) > 10) studs += `<circle cx="${x.toFixed(1)}" cy="${tBot - 8}" r="2.2" fill="#e6e8ec" ${sw(1.4)}/>`;
        return { mid: `<path d="M${x0 + 1} ${tBot - 14} H${x1 - 1} V${tBot - 2} H${x0 + 1}Z" fill="${c}" ${sw(4)}/>${studs}<rect x="${200 - 9}" y="${tBot - 16}" width="18" height="16" rx="3" fill="#ffc42b" ${sw(3)}/><rect x="${200 - 4}" y="${tBot - 11}" width="8" height="6" rx="1" fill="${c}"/>` }; }
      case "sweatbands": return { band: c };
      // Rust Row (Adventure) gear: work gloves (dark hands with a yellow cuff), and a biohazard guitar strap across the body
      case "gloves": return { glove: "#4a4a4f" };
      case "biostrap": { const d = `M${x1 - 8} ${g.tTop + 2} L${x0 + 6} ${tBot - 6}`;
        return { mid: `<path d="${d}" stroke="${INK}" stroke-width="16" stroke-linecap="round"/><path d="${d}" stroke="#ffc42b" stroke-width="9" stroke-linecap="round"/><path d="${d}" stroke="${INK}" stroke-width="9" stroke-dasharray="6 7"/><circle cx="200" cy="${g.tTop + g.tH * 0.5}" r="11" fill="#ffc42b" ${sw(3.5)}/><text x="200" y="${g.tTop + g.tH * 0.5 + 6}" font-size="17" text-anchor="middle" fill="${INK}">☣</text>` }; }
    }
    return {};
  }

  /* ---- arms and hands ---- */
  const shoulder = (g, right) => [right ? 200 + g.tW / 2 - 6 : 200 - g.tW / 2 + 6, g.tTop + 16];
  // the guitar on its strap (also where its attack notes come from)
  const INSTRUMENTS = ["acoustic", "guitar", "flyingv", "bass", "violin", "doubleneck", "ukulele", "rustbucket"];
  // solo = lifted high for a guitar solo, the neck pointing up at the sky
  const guitarAt = (g, solo) => { const s = g.tW / 90; return solo ? { x: 200 + 34 * s, y: g.tTop + g.tH * 0.56, rot: -46, k: s * 0.92 } : { x: 200 + 14 * s, y: g.tTop + g.tH * 0.64, rot: -30, k: s * 0.92 }; };
  const guitarPt = (g, lx, ly, solo) => { const t = guitarAt(g, solo), a = t.rot * Math.PI / 180;
    return [t.x + t.k * (lx * Math.cos(a) - ly * Math.sin(a)), t.y + t.k * (lx * Math.sin(a) + ly * Math.cos(a))]; };
  /* Poses: [screen-left hand, screen-right hand], each [x, y, hand shape, options]. Raised hands are placed with reach():
     an angle out from straight up and the age's arm length, so arms stay short and chunky and the hands clear the big head.
     Options: C = the elbow (the arm's bend), ang = a fixed hand tilt (mirrored for the left), cls = animation hooks. */
  // (older bodies have smaller heads, so their raised arms can point more upwards: tilt)
  const reach = (g, sg, deg, frac) => { const S = shoulder(g, sg > 0), a = (deg + g.tilt) * Math.PI / 180, L = g.arm * (frac || 1); return [S[0] + sg * L * Math.sin(a), S[1] - L * Math.cos(a)]; };
  const hipHand = (g, sg) => [200 + sg * (g.tW / 2 + 1), g.tTop + g.tH - 8, "fist", { C: [200 + sg * (g.tW / 2 + 52), g.tTop + g.tH * 0.36], nosway: true }];
  const restHand = (g, sg) => [200 + sg * (g.tW / 2 + 20), g.tTop + g.tH + 12, "rest"];
  const POSES = {
    wave: g => [restHand(g, -1), [...reach(g, 1, 60, 1.06), "open", { cls: "waver" }]],
    cheer: g => [-1, 1].map(sg => [...reach(g, sg, 66, 1.06), "open", { cls: "pumper" }]),
    thumbs: g => [-1, 1].map(sg => { const x = 200 + sg * (g.tW / 2 + 38); return [x, g.tTop + 22, "thumbs", { ang: 6, C: [x - sg * 2, g.tTop + g.tH * 0.95], cls: "pumper" }]; }),
    peace: g => [restHand(g, -1), [...reach(g, 1, 66, 1.02), "peace", { cls: "pumper" }]],
    star: g => [-1, 1].map(sg => [...reach(g, sg, 78, 1.1), "open", { cls: "pumper" }]),
    hips: g => [hipHand(g, -1), hipHand(g, 1)],
    flex: g => [-1, 1].map(sg => { const S = shoulder(g, sg > 0); return [S[0] + sg * 54, S[1] - 38, "fist", { C: [S[0] + sg * 62, S[1] + 12], cls: "pumper", flex: true }]; }),
    rock: g => [-1, 1].map(sg => [...reach(g, sg, 64, 1.06), "rock", { cls: "pumper" }]),
    relax: g => [restHand(g, -1), restHand(g, 1)]
  };
  /* Holding an instrument: the fretting hand on the neck and the picking hand over the strings, both in front of it.
     This is the resting pose whenever the gear is an instrument. Big game moments lift it into a solo instead of other poses.
     Deliberately no strumming movement at all: a hand moving at the guitar's body read badly (Oct 2026). The picking hand
     stays still; the life comes from the solo lift, headbangs and hops. */
  function holdPose(g, kind, solo){
    const t = guitarAt(g, solo), a = t.rot * Math.PI / 180, k = t.k * (INSTR_SIZE[kind] || 1), dy = kind === "doubleneck" ? 12 : 0;
    const at = (lx, ly) => [t.x + k * (lx * Math.cos(a) - ly * Math.sin(a)), t.y + k * (lx * Math.sin(a) + ly * Math.cos(a))];
    // From Dave's sketch (Oct 2026): the picking arm crosses the body to a still hand back towards the bridge. The fretting arm
    // runs from the shoulder down to the neck and goes BEHIND it (no hand drawn); all that shows of the hand is an "m" of three
    // fingertips on the fretboard, wrapped round from the neck's bottom edge and open there (no outline across their base:
    // they carry on round the back of the neck into the hidden hand).
    const SL = shoulder(g, false), SR = shoulder(g, true), strum = at(-28, dy + 6), fx = kind === "bass" ? 118 : 96, fret = at(fx, dy - 2);
    const reach = at(fx - 4, dy - 4);       // where the arm disappears behind the neck
    const pose = [[strum[0], strum[1], "rest", { C: [SL[0] - 4, g.tTop + g.tH * 0.6], front: true, nosway: true }],
      [reach[0], reach[1], "rest", { C: [(SR[0] + reach[0]) / 2 + 10, (SR[1] + reach[1]) / 2 + 8], nohand: true, nosway: true }]];
    // the fingertips, in the instrument's own frame: three bumps rising from the neck's bottom edge (y = 5) up the fretboard
    const r = 5.2, x0 = fx - 3 * r, base = dy + 5, top = dy - 0.5, ol = (3.8 / k).toFixed(2);
    // A little of the back of the hand shows under the neck: the wrist comes out from behind the bottom edge (open there, no
    // outline), curves gently under, and runs up into the three fingers, which cross the fretboard. One shape, outlined outside only.
    const xr = x0 + 6 * r, low = base + 11, wr = x0 - 7;
    const hand = `M${wr} ${base} C${wr - 1.5} ${base + 7} ${x0 - 2} ${low} ${x0 + 6} ${low} C${xr - 1} ${low + 1} ${xr + 2.5} ${base + 6} ${xr} ${base - 1} V${top}`
      + ` A${r} ${r} 0 0 0 ${x0 + 4 * r} ${top} A${r} ${r} 0 0 0 ${x0 + 2 * r} ${top} A${r} ${r} 0 0 0 ${x0} ${top} V${base}`;
    // drawn at the normal guitar size whatever the instrument's size (so it isn't tiny on a ukulele), anchored on the neck's bottom edge
    const sz = INSTR_SIZE[kind] || 1, kk = k / sz, keep = `translate(${fx} ${base}) scale(${(1 / sz).toFixed(3)}) translate(${-fx} ${-base})`;
    pose.fingers = (skin) => `<g transform="translate(${t.x.toFixed(1)} ${t.y.toFixed(1)}) rotate(${t.rot}) scale(${k.toFixed(3)}) ${keep}"><path d="${hand}Z" fill="${skin}"/>`
      + `<path d="${hand}" fill="none" stroke="${INK}" stroke-width="${(3.8 / kk).toFixed(2)}" stroke-linejoin="round" stroke-linecap="round"/><path d="M${x0 + 2 * r} ${top} v2.6 M${x0 + 4 * r} ${top} v2.6" fill="none" stroke="${INK}" stroke-width="${(1.8 / kk).toFixed(2)}" stroke-linecap="round"/></g>`;
    return pose;
  }
  const STANCE = { star: 24, rock: 10, hips: 10, flex: 12, hold: 8, solo: 18 };      // how far apart the feet are
  /* Hands are drawn as ONE silhouette, the same trick as the curly hair: every part's thick ink outline goes down first,
     then every part's skin fill on top, so fingers fuse into the palm and only the outer edge gets a line.
     Drawn in hand space: the hand's centre at 0,0, fingers pointing up (-y), thumb towards the body (-x), wrist at WRIST.
     A skin "wrist" stub laid over the join hides where the hand's outline would cross the arm, so arm and hand are one piece. */
  const HAND_OL = 7.5;                         // outline width each part gets (both sides together), in hand units
  /* Classic cartoon hands (the Simpsons / old Disney convention): a palm with three blunt, sausage-like fingers and a stubby
     thumb. Smooth, no knuckle lines or nails. The thumb always sits on the inner side (towards the body); folded fingers are
     just bumps along the top of the fist. */
  const THUMB_IN = ["M-9 4 Q-14.5 1 -13.5 -5.5", 8.2];         // a thumb tucked up the inner side of a fist
  const HANDS = {
    // palm out, three fingers fanned, thumb out low on the inner side: the wave / cheer hand
    open: { wrist: [0, 13], parts: [["M-6 -3 L-10.8 -23.5", 9], ["M0 -5 L0.4 -28.5", 9.4], ["M6 -3 L11 -22.5", 8.8], ["M-8.5 7 Q-16 7 -20.5 -1", 9.2], ["M0 1.5 L0 2", 24]],
      detail: () => "" },
    // fingers together, hanging easy at the side. A hanging hand is turned upside down, so this one is drawn mirrored
    // (thumb on +x): that keeps the thumb on the inner side, towards the body, instead of sticking out like a big pinky.
    rest: { wrist: [0, 13.8], parts: [["M5.6 -3 Q6.4 -13 5.8 -20.5", 8.4], ["M0 -4 Q0.2 -15 -0.4 -23", 8.6], ["M-5.6 -3 Q-6.2 -12 -6.4 -19.5", 8.2], ["M8.4 4 Q13 0 13.2 -6.5", 7.8], ["M0 1 L0 1.6", 23]],
      detail: () => `<path d="M2.9 -20.5 V-16.5 M-3.1 -19.5 V-15.5" fill="none" ${sw(1.8)}/>` },
    // thumbs up: a fist seen from the front, three curled fingers stacked on the outside, thumb straight up on the inside
    thumbs: { wrist: [0, 16], parts: [["M-1 3 L1 3", 24.5], ["M7 -4.5 L10.5 -4.5", 9], ["M7.5 3 L11 3", 9], ["M7.5 10 L10.5 10", 8.6], ["M-5 -6 Q-6.5 -18 -3.5 -27", 10.4]],
      detail: () => `<path d="M3.5 -0.8 L11 -0.8 M3.5 6.6 L11 6.6" fill="none" ${sw(2)}/>` },
    // devil horns: first and last finger up, the middle one folded
    rock: { wrist: [0, 13], parts: [["M0 1 L0 3", 23.5], ["M-5.4 -4 L-9.6 -27", 8.6], ["M6.4 -4 L10.6 -24.5", 8.4], ["M0.6 -9 L0.6 -9.4", 8.6], THUMB_IN], detail: () => "" },
    // peace sign: first two fingers up in a V, the third folded
    peace: { wrist: [0, 13], parts: [["M0 1 L0 3", 23.5], ["M-5.4 -4 L-9.8 -27", 8.6], ["M0.8 -5 L4.2 -28", 8.6], ["M6.8 -7.8 L6.8 -8.2", 8.4], THUMB_IN], detail: () => "" },
    // fretting: the palm under the neck, three long fingers reaching up across the fretboard (the thumb is hidden behind the neck)
    fret: { wrist: [0, 14], parts: [["M0 2 L0 4", 22], ["M-6.5 -3 Q-8 -17 -9.5 -29", 8], ["M0 -4 Q0.2 -19 -0.8 -33", 8.2], ["M6.5 -3 Q8 -16 7 -27", 7.8]],
      detail: () => `<path d="M-3.4 -8 Q-4.2 -16 -5.4 -24 M3.4 -8 Q4 -16 3.6 -24" fill="none" ${sw(1.8)}/>` },
    // a fist, three knuckles along the top and the thumb up the inner side: hips, flexing
    fist: { wrist: [0, 13], parts: [["M0 1 L0 1.5", 24], ["M-6.2 -8.4 L-6.2 -8.8", 8.6], ["M0 -9.8 L0 -10.2", 8.8], ["M6.2 -8.4 L6.2 -8.8", 8.4], THUMB_IN],
      detail: () => `<path d="M-3.1 -12.5 V-9 M3.1 -12.5 V-9" fill="none" ${sw(1.8)}/>` }
  };
  // things a hand can hold, in hand space, drawn before the hand so the fingers wrap over them
  const HOLD = {
  };
  function handSvg(kind, c, armW, hold){
    const h = HANDS[kind] || HANDS.open, [wx, wy] = h.wrist, cap = (d, w, col) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const ink = h.parts.map(([d, w]) => cap(d, w + HAND_OL, INK)).join(""), skin = h.parts.map(([d, w]) => cap(d, w, c)).join("");
    const stub = `<path d="M${wx} ${wy + 6} L${wx * 0.4} ${wy * 0.4}" fill="none" stroke="${c}" stroke-width="${armW}" stroke-linecap="butt"/>`;
    return (HOLD[hold] || "") + ink + skin + stub + h.detail(c);
  }
  // a limb drawn as a tube: dark outline underneath, colour on top
  const tube = (d, w, col) => `<path d="${d}" fill="none" ${ST} stroke-width="${w + 9}"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  function qsplit(S, C, E, t){
    const mx = S[0] + t * (C[0] - S[0]), my = S[1] + t * (C[1] - S[1]);
    const px = (1 - t) * (1 - t) * S[0] + 2 * (1 - t) * t * C[0] + t * t * E[0], py = (1 - t) * (1 - t) * S[1] + 2 * (1 - t) * t * C[1] + t * t * E[1];
    const nx = (1 - t) * C[0] + t * E[0], ny = (1 - t) * C[1] + t * E[1], f = n => n.toFixed(1);
    return { head: `M${f(S[0])} ${f(S[1])} Q${f(mx)} ${f(my)} ${f(px)} ${f(py)}`, rest: `M${f(px)} ${f(py)} Q${f(nx)} ${f(ny)} ${f(E[0])} ${f(E[1])}` };
  }
  /* one arm: shoulder -> elbow bend -> wrist, sleeve and cuff on top, then the hand. Returns the SVG and where the hand ended up. */
  function armSvg(spec, right, g, skin, col, sleeve){
    const [hx, hy, hnd, o = {}] = spec, sgn = right ? 1 : -1, S = shoulder(g, right), H = [hx, hy], hsz = g.hand, AW = 12, W = (HANDS[hnd] || HANDS.open).wrist;
    const C = o.C || [S[0] + sgn * Math.abs(H[0] - S[0]) * 0.9, S[1] + (H[1] > S[1] ? (H[1] - S[1]) * 0.25 : 6)];
    const ang = o.ang !== undefined ? sgn * o.ang : Math.atan2(H[0] - C[0], -(H[1] - C[1])) * 180 / Math.PI;
    // the wrist, in page space: the hand's wrist point carried through the same rotate/scale as the hand
    const a = ang * Math.PI / 180, wx = W[0] * hsz * sgn, wy = W[1] * hsz, E = o.nohand ? H : [H[0] + wx * Math.cos(a) - wy * Math.sin(a), H[1] + wx * Math.sin(a) + wy * Math.cos(a)];
    const whole = `M${S[0]} ${S[1]} Q${C[0].toFixed(1)} ${C[1].toFixed(1)} ${E[0].toFixed(1)} ${E[1].toFixed(1)}`;
    // sleeves are cut by distance from the wrist (not a fraction of the arm), so a cuff never swallows the wrist on a short arm
    const L = (Math.hypot(E[0] - S[0], E[1] - S[1]) + Math.hypot(C[0] - S[0], C[1] - S[1]) + Math.hypot(E[0] - C[0], E[1] - C[1])) / 2;
    const tAt = px => Math.max(0.3, Math.min(0.95, 1 - px / L));
    let arm = sleeve.only ? "" : tube(whole, AW, skin);
    const SW = AW + 1 + (sleeve.puffy ? 7 : 0);
    if(sleeve.long){ const sl = qsplit(S, C, E, tAt(26)), cf = qsplit(S, C, E, tAt(15)); arm += tube(cf.head, SW, sleeve.cuffC || shade(col, 0.82)) + tube(sl.head, SW, col);
      if(sleeve.epaulette){    // a gold epaulette on the shoulder with a fringe hanging off it
        const ec = sleeve.cuffC, ex = S[0] + sgn * 4, ey = S[1] - 6; let fr = "";
        for(let i = -2; i <= 2; i++) fr += `M${(ex + i * 4.4).toFixed(1)} ${ey + 4} v8 `;
        arm += `<path d="${fr}" stroke="${INK}" stroke-width="4.6" stroke-linecap="round"/><path d="${fr}" stroke="${ec}" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="${ex}" cy="${ey}" rx="13" ry="6.5" fill="${ec}" ${sw(3.4)}/>`; }
      if(sleeve.spikes){      // a row of spikes along the top of the shoulder, pointing outwards
        const at = t => [(1 - t) * (1 - t) * S[0] + 2 * (1 - t) * t * C[0] + t * t * E[0], (1 - t) * (1 - t) * S[1] + 2 * (1 - t) * t * C[1] + t * t * E[1]];
        arm += [0.06, 0.2, 0.34].map(t => { const p = at(t), q = at(t + 0.02); let nx = -(q[1] - p[1]), ny = q[0] - p[0];
          if(nx * sgn - ny < 0){ nx = -nx; ny = -ny; } const n = Math.hypot(nx, ny) || 1;
          return spike(p[0] + nx / n * (SW / 2 + 3), p[1] + ny / n * (SW / 2 + 3), Math.atan2(ny, nx), 10, 3.4); }).join(""); }
      if(sleeve.stripe) arm += `<path d="${sl.head}" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/>`;
      if(sleeve.puffy){ const k = qsplit(S, C, E, 0.5).head.split(" ").slice(-2).join(" "); arm += `<circle cx="${k.split(" ")[0]}" cy="${k.split(" ")[1]}" r="2.6" fill="${shade(col, 0.7)}"/>`; } }
    else if(!sleeve.none) arm += tube(qsplit(S, C, E, 0.4).head, SW, col);
    if(sleeve.band && !sleeve.only){      // a sweatband round the wrist
      const at = t => [(1 - t) * (1 - t) * S[0] + 2 * (1 - t) * t * C[0] + t * t * E[0], (1 - t) * (1 - t) * S[1] + 2 * (1 - t) * t * C[1] + t * t * E[1]];
      const p0 = at(tAt(sleeve.long ? 14 : 12)), p1 = at(tAt(5)); arm += tube(`M${p0[0].toFixed(1)} ${p0[1].toFixed(1)} L${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`, SW + 3, sleeve.band); }
    if(o.flex && !sleeve.only){ const t = qsplit(S, C, E, 0.62).head.split(" ").slice(-2).map(Number);      // a little bicep bump on a flexed arm
      arm += `<path d="M${(t[0] - sgn * 16).toFixed(1)} ${(t[1] - 4).toFixed(1)} Q${(t[0] - sgn * 6).toFixed(1)} ${(t[1] - 22).toFixed(1)} ${(t[0] + sgn * 6).toFixed(1)} ${(t[1] - 8).toFixed(1)}" fill="${sleeve.long ? col : skin}" ${sw(4.5)}/>`; }
    // the left hand is mirrored so the thumb always points in towards the body
    const hand = sleeve.only || o.nohand ? "" : `<g class="pa-hand" style="transform-origin:${E[0].toFixed(1)}px ${E[1].toFixed(1)}px"><g transform="translate(${H[0].toFixed(1)} ${H[1].toFixed(1)}) rotate(${ang.toFixed(1)}) scale(${(right ? hsz : -hsz).toFixed(2)} ${hsz})">${handSvg(hnd, sleeve.glove || skin, (AW / hsz).toFixed(2), o.hold)}</g></g>`;
    const cls = ["pa-arm", right ? "r" : "l", o.cls || "", o.nosway ? "nosway" : ""].join(" ").trim();
    return { svg: `<g class="${cls}" style="transform-origin:${S[0]}px ${S[1]}px">${arm}${hand}</g>`, front: !!o.front, hand: H };
  }
  const FOOT = "M-20 4 C-22 -12 -8 -18 6 -16 C20 -14 28 -4 26 6 C24 13 -20 14 -20 4Z";
  // Layering below the waist: skirts cover the shoes, and shoes and boots cover trousers (they tuck in), except flares and
  // baggy jeans, which are cut to hang over the shoes.
  const OVER_SHOES = ["baggy", "flares"];
  const SHAFT = 8;          // boot shafts sit over the leg, which comes down at x = +6 in shoe space
  function shoe(c, x, y, flip, style){
    const shine = `<path d="M-12 -9 Q-6 -13 0 -12.5" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="3" stroke-linecap="round"/>`;
    let body;
    if(style === "hightops")         // basketball high-tops: a padded ankle, white sole and toe cap, laces
      body = `<g transform="translate(${SHAFT} 0)"><path d="M-15 -8 L-14 -32 Q-3 -36 8 -32 L9 -10Z" fill="${c}" ${sw(5)}/></g><path d="${FOOT}" fill="${c}" ${sw(5)}/><path d="M-20 5 C-20 12 24 13 26 5 L26 8 C24 14 -20 14 -20 8Z" fill="#f7f4ee" ${sw(3.4)}/><path d="M13 -10 C20 -8 25 -3 25.5 3 L16 3 Q14 -3 13 -10Z" fill="#f7f4ee" ${sw(3)}/><path transform="translate(${SHAFT} 0)" d="M-9 -27 L3 -24 M-9 -21 L3 -18 M-8 -15 L4 -12" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>`;
    else if(style === "boots")       // chunky lace-up boots on a thick sole
      body = `<g transform="translate(${SHAFT} 0)"><path d="M-16 -6 L-15 -34 Q-3 -38 9 -34 L10 -8Z" fill="${c}" ${sw(5)}/></g><path d="${FOOT}" fill="${c}" ${sw(5)}/><path d="M-22 4 H28 Q29 15 24 15 H-19 Q-23 15 -22 4Z" fill="#2a2a2e" ${sw(3.4)}/><path transform="translate(${SHAFT} 0)" d="M-10 -28 L2 -25 M-10 -21 L2 -18 M-9 -14 L3 -11" fill="none" stroke="#ffc42b" stroke-width="2.6" stroke-linecap="round"/><path d="M-21 9 H27" stroke="#fff" stroke-opacity=".25" stroke-width="2"/>`;
    else if(style === "chelsea")     // 60s Chelsea boots: ankle height, a pointed toe, a stacked heel and an elastic panel at the side
      body = `<g transform="translate(${SHAFT} 0)"><path d="M-15 -6 L-14 -30 Q-3 -33 8 -30 L9 -8Z" fill="${c}" ${sw(5)}/></g><path d="M-20 4 C-22 -12 -8 -18 6 -16 C18 -14 26 -5 30 5 C26 10 -20 12 -20 4Z" fill="${c}" ${sw(5)}/><path d="M-20 5 L-19 14 H-7 L-7 8Z" fill="${shade(c, 0.55)}" ${sw(3.4)}/><path transform="translate(${SHAFT} 0)" d="M-6 -29 Q-3 -19 -6 -11 L1 -11 Q-1 -19 2 -29Z" fill="${shade(c, 0.6)}" ${sw(2.4)}/>`;
    else if(style === "platforms")   // glam-rock platform boots: tall, on a huge two-tone sole
      body = `<g transform="translate(${SHAFT} 0)"><path d="M-16 -8 L-15 -40 Q-3 -44 9 -40 L10 -10Z" fill="${c}" ${sw(5)}/></g><path d="${FOOT}" fill="${c}" ${sw(5)}/><path d="M-22 4 H28 V20 Q28 24 24 24 H-18 Q-22 24 -22 20Z" fill="${shade(c, 0.62)}" ${sw(4)}/><path d="M-21 13 H27" stroke="#fff" stroke-opacity=".45" stroke-width="3"/>`;
    else body = `<path d="${FOOT}" fill="${c}" ${sw(5)}/><path d="M-19 8 H25" stroke="${INK}" stroke-opacity=".35" stroke-width="3" fill="none"/>`;
    return `<g transform="translate(${x} ${y}) scale(${flip ? -1 : 1} 1)">${body}${shine}</g>`;
  }
  const rrect = (x0, y0, x1, y1, r) => `M${x0 + r} ${y0} H${x1 - r} Q${x1} ${y0} ${x1} ${y0 + r} V${y1 - r} Q${x1} ${y1} ${x1 - r} ${y1} H${x0 + r} Q${x0} ${y1} ${x0} ${y1 - r} V${y0 + r} Q${x0} ${y0} ${x0 + r} ${y0}Z`;
  function star(cx, cy, r1, r2, dp){
    let d = ""; for(let i = 0; i < 10; i++){ const a = -Math.PI / 2 + Math.PI * i / 5, r = i % 2 ? r2 : r1; d += (i ? "L" : "M") + (cx + r * Math.cos(a)).toFixed(dp || 1) + " " + (cy + r * Math.sin(a)).toFixed(dp || 1); }
    return d + "Z";
  }

  /* ---- the whole character. anim = the live version (expressions, alternate arms, animation hooks); off for thumbnails. ---- */
  // only = "top" | "bottom" | "shoes" | "neck": draw just that item of clothing, for the outfit menu
  function build(cfg, anim, only){
    const g = AGES[cfg.body] || AGES.kid, skin = cfg.skin, col = cfg.color, pants = cfg.pants, shoeC = cfg.accent;
    const tBot = g.tTop + g.tH, x0 = 200 - g.tW / 2, x1 = 200 + g.tW / 2, r = g.tW * 0.26;
    const hair = hairSvg(cfg.hair, cfg.hairColor, g, cfg.acc), headAcc = headSvg(cfg.acc, g, cfg.accColor), gear = gearSvg(cfg.gear, g, cfg.gearColor, cfg.pose === "solo"), extra = extraSvg(cfg.extra, g, cfg.extraColor);

    // legs and shoes; some poses stand with their feet apart
    const st = STANCE[cfg.pose] || 0, hipY = tBot - 10, lx = 200 - g.tW * 0.2, rx = 200 + g.tW * 0.2, lf = lx - st, rf = rx + st;
    const legX = (xa, xb, y) => xa + (xb - xa) * (y - hipY) / (FEET - hipY), f1 = n => n.toFixed(1);
    const legD = (xa, xb, y0, y1) => `M${f1(legX(xa, xb, y0))} ${y0} L${f1(legX(xa, xb, y1))} ${y1}`;
    const leg = (xa, xb, y1, c, w) => tube(legD(xa, xb, hipY, y1), w || 15, c);
    const LEGW = { baggy: 25, cargo: 19, trackies: 17, ripped: 13, leggings: 13, flares: 15, stage: 14 }, bw = LEGW[cfg.bottom] || 15, both = fn => fn(lx, lf, -1) + fn(rx, rf, 1);
    let legs;
    if(cfg.bottom === "pants") legs = leg(lx, lf, FEET, pants) + leg(rx, rf, FEET, pants);
    else if(LEGW[cfg.bottom]){
      legs = both((xa, xb) => leg(xa, xb, FEET, pants, bw));
      const kneeY = hipY + (FEET - hipY) * 0.55;
      if(cfg.bottom === "baggy")       // wide, slouchy jeans: a roomy seat, turned-up cuffs, double stitching
        legs = `<path d="${rrect(lx - bw / 2 - 4, hipY - 6, rx + bw / 2 + 4, hipY + 22, 9)}" fill="${pants}" ${sw(5)}/>` + legs
          + both((xa, xb) => { const x = legX(xa, xb, FEET - 6); return `<path d="${rrect(x - bw / 2 - 6, FEET - 13, x + bw / 2 + 6, FEET + 1, 4)}" fill="${shade(pants, 0.8)}" ${sw(4.5)}/>`; })
          + both((xa, xb, sg) => `<path d="${legD(xa + sg * (bw / 2 - 4), xb + sg * (bw / 2 - 4), hipY + 14, FEET - 16)}" fill="none" stroke="${shade(pants, 1.4)}" stroke-width="1.6" stroke-dasharray="4 3"/>`)
          // crinkles where the denim bunches up at the knees and ankles
          + both((xa, xb) => [kneeY - 4, kneeY + 4, FEET - 34, FEET - 26, FEET - 19].map((y, i) => { const x = legX(xa, xb, y), w = bw / 2 - 3, dir = i % 2 ? -1 : 1;
              return `<path d="M${(x - w).toFixed(1)} ${y} Q${(x - w * 0.2).toFixed(1)} ${y + 3 * dir} ${(x + w * 0.5).toFixed(1)} ${y - 1}" fill="none" stroke="${shade(pants, 0.62)}" stroke-width="2.2" stroke-linecap="round"/>`; }).join(""))
          // a wallet chain looping from the belt to the back pocket
          + (() => { const xa = rx + bw / 2 - 1, d = `M${xa.toFixed(1)} ${hipY + 2} C${(xa + 18).toFixed(1)} ${hipY + 22} ${(xa + 14).toFixed(1)} ${hipY + 44} ${(xa - 4).toFixed(1)} ${hipY + 36}`;
              return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#d9dde3" stroke-width="3" stroke-linecap="round" stroke-dasharray="3 2.4"/>`; })();
      if(cfg.bottom === "cargo")       // pockets on the side of each thigh
        legs += both((xa, xb, sg) => { const y = hipY + 26, x = legX(xa, xb, y) + sg * 2; return `<path d="${rrect(x - 8, y, x + 8, y + 20, 3)}" fill="${shade(pants, 0.86)}" ${sw(3)}/><path d="M${x - 8} ${y + 6} H${x + 8}" fill="none" ${sw(2.4)}/>`; });
      if(cfg.bottom === "ripped")      // skinny jeans torn at the knees, a little skin and white threads showing
        legs += both((xa, xb) => { const x = legX(xa, xb, kneeY); return `<path d="M${x - 5} ${kneeY - 4} L${x - 2} ${kneeY - 7} L${x + 1} ${kneeY - 4} L${x + 4} ${kneeY - 6} L${x + 5} ${kneeY + 3} L${x + 1} ${kneeY + 6} L${x - 3} ${kneeY + 4} Z" fill="${skin}" ${sw(2.2)}/><path d="M${x - 4} ${kneeY - 1} H${x + 4} M${x - 4} ${kneeY + 2} H${x + 4}" stroke="#fff" stroke-width="1.6"/>`; });
      if(cfg.bottom === "leggings")    // skin-tight, with a soft sheen down each leg
        legs += both((xa, xb) => `<path d="${legD(xa - 2, xb - 2, hipY + 10, FEET - 6)}" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="2.6" stroke-linecap="round"/>`);
      if(cfg.bottom === "flares")      // bell-bottoms: fitted to the knee, then flaring out wide
        legs += both((xa, xb) => { const xk = legX(xa, xb, kneeY), xf = legX(xa, xb, FEET); return `<path d="M${(xk - 7.5).toFixed(1)} ${kneeY} L${(xf - 17).toFixed(1)} ${FEET + 1} Q${xf.toFixed(1)} ${FEET + 5} ${(xf + 17).toFixed(1)} ${FEET + 1} L${(xk + 7.5).toFixed(1)} ${kneeY}Z" fill="${pants}" ${sw(4.5)}/><path d="M${xf.toFixed(1)} ${kneeY + 10} V${FEET - 2}" stroke="${shade(pants, 1.4)}" stroke-width="1.6" stroke-dasharray="4 3"/>`; });
      if(cfg.bottom === "stage"){      // fitted stage trousers with a bold stripe down the outside of each leg (red, or white on red)
        const sc = pants === "#e8433f" ? "#f7f4ee" : "#e8433f";
        legs += both((xa, xb, sg) => `<path d="${legD(xa + sg * (bw / 2 - 3.5), xb + sg * (bw / 2 - 3.5), hipY + 6, FEET - 3)}" fill="none" stroke="${sc}" stroke-width="4.4" stroke-linecap="round"/>`); }
      if(cfg.bottom === "trackies")    // a white stripe down the outside of each leg
        legs += both((xa, xb, sg) => `<path d="${legD(xa + sg * (bw / 2 - 3), xb + sg * (bw / 2 - 3), hipY + 6, FEET - 3)}" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/>`);
    }
    else if(cfg.bottom === "shorts") legs = leg(lx, lf, FEET, skin) + leg(rx, rf, FEET, skin) + leg(lx, lf, tBot + 26, pants) + leg(rx, rf, tBot + 26, pants);
    else legs = leg(lx, lf, FEET, skin) + leg(rx, rf, FEET, skin);
    // skirts (legs show underneath)
    const pl = shade(pants, 0.72), tut = (y, sp, col) => { let d = `M${x0 - sp} ${y}`; const n = 7, w = (g.tW + 2 * sp) / n; for(let i = 0; i < n; i++) d += ` q${(w / 2).toFixed(1)} 13 ${w.toFixed(1)} 0`; return `<path d="M${x0 + 2} ${tBot - 10} L${x0 - sp} ${y} ${d.slice(d.indexOf("q"))} L${x1 - 2} ${tBot - 10}Z" fill="${col}" ${sw(4.5)}/>`; };
    const SKIRTS = {
      skirt: `<path d="M${x0 - 2} ${tBot - 8} L${x0 - 20} ${tBot + 36} Q200 ${tBot + 46} ${x1 + 20} ${tBot + 36} L${x1 + 2} ${tBot - 8}Z" fill="${pants}" ${sw(5)}/><path d="M${x0 - 14} ${tBot + 30} Q200 ${tBot + 39} ${x1 + 14} ${tBot + 30}" fill="none" stroke="${pl}" stroke-width="3.5" stroke-linecap="round"/>`,
      pleated: `<path d="M${x0 - 1} ${tBot - 8} L${x0 - 16} ${tBot + 28} H${x1 + 16} L${x1 + 1} ${tBot - 8}Z" fill="${pants}" ${sw(5)}/><path d="${[-0.66, -0.33, 0, 0.33, 0.66].map(k => `M${(200 + k * g.tW * 0.5).toFixed(1)} ${tBot - 4} L${(200 + k * (g.tW * 0.5 + 16)).toFixed(1)} ${tBot + 27}`).join(" ")}" fill="none" stroke="${pl}" stroke-width="2.6"/><path d="M${x0} ${tBot - 4} H${x1}" stroke="${pl}" stroke-width="4"/>`,
      tutu: tut(tBot + 22, 26, shade(pants, 1.3)) + tut(tBot + 14, 16, pants) + `<path d="M${x0 + 1} ${tBot - 6} H${x1 - 1}" stroke="${pl}" stroke-width="5" stroke-linecap="round"/>`,
      maxi: `<path d="M${x0 - 2} ${tBot - 8} C${x0 - 10} ${tBot + 40} ${x0 - 34} ${FEET - 34} ${x0 - 34} ${FEET - 8} Q200 ${FEET + 4} ${x1 + 34} ${FEET - 8} C${x1 + 34} ${FEET - 34} ${x1 + 10} ${tBot + 40} ${x1 + 2} ${tBot - 8}Z" fill="${pants}" ${sw(5)}/><path d="M${200 - g.tW * 0.18} ${tBot + 10} Q${200 - g.tW * 0.3} ${FEET - 40} ${200 - g.tW * 0.36} ${FEET - 6} M${200 + g.tW * 0.14} ${tBot + 14} Q${200 + g.tW * 0.26} ${FEET - 40} ${200 + g.tW * 0.32} ${FEET - 6}" fill="none" stroke="${pl}" stroke-width="2.6" stroke-linecap="round"/><path d="M${x0 - 30} ${FEET - 16} Q200 ${FEET - 4} ${x1 + 30} ${FEET - 16}" fill="none" stroke="${shade(pants, 1.35)}" stroke-width="4" stroke-linecap="round"/>`
    };
    const skirt = SKIRTS[cfg.bottom] || "";
    const feet = shoe(shoeC, lf - 6, FEET + 12, false, cfg.shoes) + shoe(shoeC, rf + 6, FEET + 12, true, cfg.shoes);

    // torso and top, with a soft shadow down one side
    let torso = `<path d="${rrect(x0, g.tTop, x1, tBot, r)}" fill="${col}" ${sw(6)}/>`;
    torso += `<path d="${rrect(x1 - 16, g.tTop + 6, x1 - 3, tBot - 6, 6)}" fill="#000" opacity=".1"/>`;
    const mid = g.tTop + g.tH / 2;
    let nameOn = true, nameFill = darkText(col) ? INK : "#fff";
    if(cfg.top === "stripes"){ for(let i = 1; i <= 3; i++){ const y = g.tTop + (g.tH * i) / 4; torso += `<path d="M${x0 + 3} ${y} H${x1 - 3}" stroke="${shade(col, 0.6)}" stroke-width="${g.tH * 0.12}" fill="none"/>`; } torso += `<path d="${rrect(x0, g.tTop, x1, tBot, r)}" fill="none" ${sw(6)}/>`; }
    if(cfg.top === "hoodie"){ torso += `<path d="M${200 - g.tW * 0.34} ${tBot - g.tH * 0.42} H${200 + g.tW * 0.34} L${200 + g.tW * 0.4} ${tBot - 8} H${200 - g.tW * 0.4}Z" fill="${shade(col, 0.88)}" ${sw(4)}/><path d="M${200 - 8} ${g.tTop + 8} V${g.tTop + g.tH * 0.38} M${200 + 8} ${g.tTop + 8} V${g.tTop + g.tH * 0.38}" ${sw(3.4)} fill="none"/>`; }
    if(cfg.top === "overalls"){ nameFill = darkText(pants) ? INK : "#fff"; torso += `<path d="M${x0 + 6} ${g.tTop + g.tH * 0.4} H${x1 - 6} V${tBot - 2} H${x0 + 6}Z" fill="${pants}" ${sw(4.5)}/><path d="M${x0 + 18} ${g.tTop + g.tH * 0.4} V${g.tTop + 3} M${x1 - 18} ${g.tTop + g.tH * 0.4} V${g.tTop + 3}" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="M${x0 + 18} ${g.tTop + g.tH * 0.4} V${g.tTop + 3} M${x1 - 18} ${g.tTop + g.tH * 0.4} V${g.tTop + 3}" fill="none" stroke="${pants}" stroke-width="7" stroke-linecap="round"/><circle cx="${x0 + 18}" cy="${g.tTop + g.tH * 0.4 + 6}" r="3.6" fill="#ffc42b"/><circle cx="${x1 - 18}" cy="${g.tTop + g.tH * 0.4 + 6}" r="3.6" fill="#ffc42b"/>`; }
    // an open front: the shirt underneath down the middle, with lapels or a collar either side
    const openFront = (tee, lapel) => { const iw = g.tW * 0.17;
      return `<path d="M${200 - iw} ${g.tTop + 3} H${200 + iw} V${tBot - 3} H${200 - iw}Z" fill="${tee}"/><path d="M${200 - iw} ${g.tTop + 3} V${tBot - 2} M${200 + iw} ${g.tTop + 3} V${tBot - 2}" fill="none" ${sw(4)}/>`
        + [-1, 1].map(sg => `<path d="M${200 + sg * iw} ${g.tTop + 1} L${200 + sg * iw} ${g.tTop + g.tH * 0.46} L${200 + sg * g.tW * 0.33} ${g.tTop + 2}Z" fill="${lapel}" ${sw(4)}/>`).join(""); };
    const clip = body => { const id = "pt" + (++uid); return `<clipPath id="${id}"><path d="${rrect(x0, g.tTop, x1, tBot, r)}"/></clipPath><g clip-path="url(#${id})">${body}</g><path d="${rrect(x0, g.tTop, x1, tBot, r)}" fill="none" ${sw(6)}/>`; };
    const white = col === "#f7f4ee" ? "#3a3a3d" : "#f7f4ee";
    if(cfg.top === "jacket"){        // open jacket over a tee: the tee down the middle, lapels, a zip edge each side
      nameOn = false; torso += openFront(white, shade(col, 0.8));
      torso += `<path d="M${x0 + 12} ${tBot - g.tH * 0.3} h${g.tW * 0.14}" fill="none" ${sw(3.4)}/><circle cx="${x1 - 14}" cy="${g.tTop + g.tH * 0.62}" r="4" fill="#ffc42b" ${sw(2.6)}/>`; }
    if(cfg.top === "leather"){       // punk leather jacket: open over a tee, shiny creases, a belt at the hem, spikes up both lapels
      nameOn = false; const iw = g.tW * 0.17;
      torso += clip(`<path d="M${x0 + 10} ${g.tTop + 10} Q${x0 + 16} ${mid} ${x0 + 12} ${tBot - 14} M${x1 - 22} ${g.tTop + 12} Q${x1 - 16} ${mid} ${x1 - 20} ${tBot - 16}" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="3.4" stroke-linecap="round"/>`);
      torso += openFront(white, shade(col, 0.72));
      torso += `<path d="M${x0 + 2} ${tBot - 13} H${200 - iw} M${200 + iw} ${tBot - 13} H${x1 - 2}" fill="none" ${sw(3)}/><rect x="${x0 + 8}" y="${tBot - 12}" width="9" height="9" rx="1.5" fill="none" stroke="#dfe3e8" stroke-width="2.4"/>`;
      torso += `<path d="M${x1 - 12} ${g.tTop + g.tH * 0.3} L${x1 - 24} ${g.tTop + g.tH * 0.42}" fill="none" stroke="#dfe3e8" stroke-width="2.6" stroke-linecap="round"/>`;
      torso += [-1, 1].map(sg => [0.25, 0.5, 0.75].map(t => { const ax = 200 + sg * iw, ay = g.tTop + g.tH * 0.46, bx = 200 + sg * g.tW * 0.33, by = g.tTop + 2;
        let nx = by - ay, ny = -(bx - ax); if(nx * sg < 0){ nx = -nx; ny = -ny; }      // the lapel edge's outward side
        return spike(ax + (bx - ax) * t, ay + (by - ay) * t, Math.atan2(ny, nx), 11, 3.8); }).join("")).join(""); }
    if(cfg.top === "flannel"){       // 90s grunge: an open plaid flannel shirt over a white tee, chest pocket
      nameOn = false; let a = "", b = "";
      for(let x = x0 + 7; x < x1; x += 16){ a += `M${x} ${g.tTop} V${tBot} `; b += `M${x + 6} ${g.tTop} V${tBot} `; }
      for(let y = g.tTop + 7; y < tBot; y += 16){ a += `M${x0} ${y} H${x1} `; b += `M${x0} ${y + 6} H${x1} `; }
      torso += clip(`<path d="${a}" stroke="${shade(col, 0.55)}" stroke-width="6.5" opacity=".6"/><path d="${b}" stroke="${shade(col, 1.6)}" stroke-width="1.6" opacity=".7"/>`);
      torso += openFront("#f7f4ee", shade(col, 0.75));
      torso += `<path d="${rrect(x1 - g.tW * 0.3, g.tTop + g.tH * 0.3, x1 - g.tW * 0.08, g.tTop + g.tH * 0.52, 3)}" fill="${shade(col, 0.85)}" ${sw(3)}/>`; }
    if(cfg.top === "jersey"){        // a sleeveless basketball jersey with contrast trim
      const tr = darkText(col) ? INK : "#f7f4ee";
      torso += `<path d="M${200 - g.tW * 0.2} ${g.tTop + 1} Q200 ${g.tTop + g.tH * 0.36} ${200 + g.tW * 0.2} ${g.tTop + 1}" fill="${skin}" stroke="${tr}" stroke-width="5"/>`;
      torso += [-1, 1].map(sg => `<path d="M${200 + sg * (g.tW / 2 - 4)} ${g.tTop + 6} Q${200 + sg * (g.tW / 2 - 20)} ${g.tTop + g.tH * 0.3} ${200 + sg * (g.tW / 2 - 3)} ${g.tTop + g.tH * 0.5}" fill="none" stroke="${tr}" stroke-width="4.5" stroke-linecap="round"/>`).join("");
      torso += `<path d="M${x0 + 4} ${tBot - 7} H${x1 - 4}" stroke="${tr}" stroke-width="4"/>`; }
    if(cfg.top === "track"){         // a zip-up tracksuit top: stripes down the sides and arms, a stand-up collar
      nameOn = false;
      torso += clip(`<path d="M${x0 + 9} ${g.tTop} V${tBot} M${x1 - 9} ${g.tTop} V${tBot}" stroke="#fff" stroke-width="4"/>`);
      torso += `<path d="M200 ${g.tTop + 8} V${tBot - 2}" fill="none" ${sw(2.8)}/><rect x="196" y="${g.tTop + 14}" width="8" height="11" rx="2" fill="#d9d9de" ${sw(2.4)}/>`;
      torso += `<path d="M${200 - g.tW * 0.24} ${g.tTop - 2} L${200 - g.tW * 0.2} ${g.tTop + 10} H${200 + g.tW * 0.2} L${200 + g.tW * 0.24} ${g.tTop - 2}Z" fill="${shade(col, 0.82)}" ${sw(3.6)}/>`; }
    if(cfg.top === "puffer"){        // a big quilted puffer jacket with a high collar
      nameOn = false;
      torso += clip([0.25, 0.5, 0.75].map(k => `<path d="M${x0} ${g.tTop + g.tH * k} H${x1}" stroke="${shade(col, 0.68)}" stroke-width="3.4"/>`).join("") + [0.12, 0.37, 0.62, 0.87].map(k => `<path d="M${x0 + 12} ${g.tTop + g.tH * k - 3} Q${x0 + 28} ${g.tTop + g.tH * k - 7} ${x0 + 40} ${g.tTop + g.tH * k - 3}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/>`).join(""));
      torso += `<path d="M200 ${g.tTop + 10} V${tBot - 2}" fill="none" ${sw(2.8)}/>`;
      torso += `<path d="${rrect(200 - g.tW * 0.3, g.tTop - 6, 200 + g.tW * 0.3, g.tTop + 12, 8)}" fill="${col}" ${sw(4)}/>`; }
    if(cfg.top === "sequin"){        // a sparkly pop-star jacket, open over a black top
      nameOn = false; let dots = "";
      for(let y = g.tTop + 6, row = 0; y < tBot; y += 9, row++) for(let x = x0 + 4 + (row % 2) * 4.5; x < x1; x += 9) dots += `M${x.toFixed(1)} ${y}h0.01`;
      torso += clip(`<path d="${dots}" stroke="${shade(col, 1.45)}" stroke-width="4.4" stroke-linecap="round" opacity=".75"/><path d="${dots}" stroke="${shade(col, 0.7)}" stroke-width="1.4" stroke-linecap="round" transform="translate(1.6 1.6)" opacity=".6"/>`);
      torso += openFront("#2a2a2e", shade(col, 0.72));
      torso += [[x0 + 14, g.tTop + g.tH * 0.62, 7], [x1 - 14, g.tTop + g.tH * 0.3, 5.5]].map(([x, y, k]) => `<path d="M${x} ${y - k} Q${x} ${y} ${x + k} ${y} Q${x} ${y} ${x} ${y + k} Q${x} ${y} ${x - k} ${y} Q${x} ${y} ${x} ${y - k}Z" fill="#fff"/>`).join(""); }
    if(cfg.top === "tiedye"){        // a hippie tie-dye tee: rainbow arms spiralling out from the middle, the tee colour showing between
      nameOn = false; const cx = 200 + g.tW * 0.04, cy = mid + 2;
      let d = ""; for(let t = 0; t <= 11; t += 0.25){ const rr = 2 + t * 5.6; d += `${t ? "L" : "M"}${(Math.cos(t) * rr).toFixed(1)} ${(Math.sin(t) * rr).toFixed(1)} `; }
      torso += clip(["#e8433f", "#ff8a1c", "#ffc42b", "#4fb86a", "#a070e8"].map((c, i) => `<path d="${d}" transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${i * 60})" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/>`).join("")
        + `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="5" fill="#fff" opacity=".7"/>`); }
    if(cfg.top === "fringe"){        // a hippie suede jacket: open over a tee, fringe across the chest and along the hem
      nameOn = false; const fc = shade(col, 0.82), iw = g.tW * 0.17, yy = g.tTop + g.tH * 0.5;
      const fr = (xa, xb, y, len) => { let d = ""; for(let x = xa; x <= xb; x += 5) d += `M${x.toFixed(1)} ${y.toFixed(1)} l0.6 ${len} `; return `<path d="${d}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="${d}" stroke="${fc}" stroke-width="2.6" stroke-linecap="round"/>`; };
      torso += openFront("#f7f4ee", fc);
      torso += `<path d="M${x0 + 3} ${yy} H${200 - iw} M${200 + iw} ${yy} H${x1 - 3}" fill="none" ${sw(3)}/>` + fr(x0 + 7, 200 - iw - 4, yy + 2, 9) + fr(200 + iw + 4, x1 - 7, yy + 2, 9)
        + fr(x0 + 12, 200 - iw - 2, tBot - 2, 14) + fr(200 + iw + 2, x1 - 12, tBot - 2, 14); }
    if(cfg.top === "military"){      // a stadium-rock military jacket: open over a white vest, buckled straps across, a stand-up collar
      nameOn = false; const iw = g.tW * 0.15, dk = shade(col, 0.72);
      torso += `<path d="M${200 - iw} ${g.tTop + 3} H${200 + iw} V${tBot - 3} H${200 - iw}Z" fill="#f7f4ee"/><path d="M${200 - iw} ${g.tTop + 3} V${tBot - 2} M${200 + iw} ${g.tTop + 3} V${tBot - 2}" fill="none" ${sw(4)}/>`;
      torso += [0.3, 0.52, 0.74].map(k => { const y = g.tTop + g.tH * k, w = iw + 12;
        return `<rect x="${(200 - w).toFixed(1)}" y="${(y - 3.5).toFixed(1)}" width="${(2 * w).toFixed(1)}" height="7" rx="2" fill="${dk}" ${sw(2.4)}/><rect x="${(200 + iw - 6).toFixed(1)}" y="${(y - 5.5).toFixed(1)}" width="10" height="11" rx="2" fill="none" stroke="#dfe3e8" stroke-width="2.6"/>`
          + [-1, 1].map(sg => `<circle cx="${(200 + sg * w).toFixed(1)}" cy="${y.toFixed(1)}" r="3.2" fill="#dfe3e8" ${sw(1.6)}/>`).join(""); }).join("");
      torso += [-1, 1].map(sg => `<path d="M${200 + sg * g.tW * 0.26} ${g.tTop - 4} L${200 + sg * g.tW * 0.22} ${g.tTop + 9} L${200 + sg * iw} ${g.tTop + 9} L${200 + sg * iw} ${g.tTop - 1}Z" fill="${dk}" ${sw(3.4)}/>`).join(""); }
    if(cfg.top === "collarless"){    // a 60s collarless suit jacket: a round neckline with piping, buttoned down the front, a white shirt and skinny tie at the neck
      nameOn = false; const nw = g.tW * 0.2, nb = g.tTop + g.tH * 0.26, pc = shade(col, 0.62);
      torso += `<path d="M${200 - nw} ${g.tTop + 2} Q200 ${nb + 6} ${200 + nw} ${g.tTop + 2}Z" fill="#f7f4ee"/><path d="M${200 - nw * 0.5} ${g.tTop + 2} L200 ${g.tTop + 9} L${200 + nw * 0.5} ${g.tTop + 2}" fill="#f7f4ee" ${sw(2.4)}/>`
        + `<path d="M197 ${g.tTop + 9} H203 L204.5 ${nb - 1} L200 ${nb + 3} L195.5 ${nb - 1}Z" fill="${INK}"/>`
        + `<path d="M${200 - nw} ${g.tTop + 2} Q200 ${nb + 6} ${200 + nw} ${g.tTop + 2} M200 ${(nb + 3).toFixed(1)} V${tBot - 2}" fill="none" stroke="${pc}" stroke-width="3.2" stroke-linecap="round"/>`
        + [0.46, 0.64, 0.82].map(k => `<circle cx="206" cy="${(g.tTop + g.tH * k).toFixed(1)}" r="2.8" fill="${pc}" ${sw(1.4)}/>`).join(""); }
    if(cfg.top === "pepper"){        // a psychedelic marching-band jacket: bright satin, gold braid looped across the chest, gold collar and cuffs, epaulettes
      nameOn = false; const gold = ["#ffc42b", "#ffd34d", "#ff8a1c"].includes(col) ? "#e8433f" : "#ffc42b";
      torso += clip(`<path d="M${x0 + 12} ${g.tTop + 10} Q${x0 + 18} ${mid} ${x0 + 14} ${tBot - 12}" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="4" stroke-linecap="round"/>`);
      torso += `<path d="M200 ${g.tTop + 10} V${tBot - 2}" fill="none" ${sw(2.6)}/>`;
      torso += [0.3, 0.46, 0.62, 0.78].map(k => { const y = (g.tTop + g.tH * k).toFixed(1), w = g.tW * 0.27;
        return `<path d="M${(200 - w).toFixed(1)} ${y} H${(200 + w).toFixed(1)}" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M${(200 - w).toFixed(1)} ${y} H${(200 + w).toFixed(1)}" stroke="${gold}" stroke-width="3" stroke-linecap="round"/>`
          + [-1, 1].map(sg => `<circle cx="${(200 + sg * w).toFixed(1)}" cy="${y}" r="3.6" fill="none" stroke="${INK}" stroke-width="5"/><circle cx="${(200 + sg * w).toFixed(1)}" cy="${y}" r="3.6" fill="none" stroke="${gold}" stroke-width="2.4"/>`).join(""); }).join("");
      torso += `<path d="${rrect(200 - g.tW * 0.24, g.tTop - 5, 200 + g.tW * 0.24, g.tTop + 9, 5)}" fill="${gold}" ${sw(3.4)}/>`; }
    if(cfg.top === "hivis"){         // Rust Row (Adventure): a sleeveless hi-vis safety vest, orange whatever the colour, two silver stripes
      nameOn = false; torso = `<path d="${rrect(x0, g.tTop, x1, tBot, r)}" fill="#ff8a1c" ${sw(6)}/>` + clip([0.36, 0.68].map(k => `<path d="M${x0} ${g.tTop + g.tH * k} H${x1}" stroke="#e8e8e8" stroke-width="${g.tH * 0.11}"/>`).join("")) + `<path d="M200 ${g.tTop + 4} V${tBot - 4}" stroke="${INK}" stroke-opacity=".4" stroke-width="3"/>`; }
    if(cfg.top === "bolt"){          // a band tee with a big lightning bolt instead of the name
      nameOn = false; const k = g.tH / 64, bc = darkText(col) ? INK : "#ffc42b";
      torso += `<path transform="translate(200 ${mid}) scale(${k.toFixed(3)})" d="M4 -22 L-11 3 L-1 3 L-6 22 L11 -5 L1 -5 L8 -22Z" fill="${bc}" ${sw(4 / k)}/>`; }
    // (the name is no longer printed on the shirt: it shows under the character instead, Oct 2026)
    const name = "";

    // things worn round the neck
    const nc = cfg.neckColor, ny = g.tTop + 4;
    const chainD = `M${200 - g.tW * 0.26} ${ny - 2} Q200 ${g.tTop + g.tH * 0.66} ${200 + g.tW * 0.26} ${ny - 2}`;
    const neck = cfg.neck === "chain" ? `<path d="${chainD}" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="${chainD}" fill="none" stroke="#ffc42b" stroke-width="5.6" stroke-linecap="round"/><path d="${chainD}" fill="none" stroke="#b07a10" stroke-width="2" stroke-dasharray="2 4"/><g transform="translate(200 ${(g.tTop + g.tH * 0.38).toFixed(1)}) scale(.85)"><ellipse cx="0" cy="8" rx="8.5" ry="6.5" transform="rotate(-22 0 8)" fill="#ffc42b" ${sw(4)}/><path d="M7.4 6 V-20 Q15 -16 18 -6" fill="none" ${sw(5)}/></g>`
      // a big old-school clock on a gold chain (the rim takes the neck colour)
      : cfg.neck === "clock" ? (() => { const cr = g.tW * 0.27, cy = g.tTop + g.tH * 0.5 + 2, d = `M${200 - g.tW * 0.26} ${ny - 2} Q200 ${cy - cr * 0.2} ${200 + g.tW * 0.26} ${ny - 2}`;
          const ticks = [0, 1, 2, 3].map(i => { const a = i * Math.PI / 2; return `M${(200 + Math.sin(a) * cr * 0.62).toFixed(1)} ${(cy - Math.cos(a) * cr * 0.62).toFixed(1)} L${(200 + Math.sin(a) * cr * 0.78).toFixed(1)} ${(cy - Math.cos(a) * cr * 0.78).toFixed(1)}`; }).join(" ");
          return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#ffc42b" stroke-width="5.6" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#b07a10" stroke-width="2" stroke-dasharray="2 4"/>
            <circle cx="200" cy="${cy.toFixed(1)}" r="${(cr + 6).toFixed(1)}" fill="${nc}" ${sw(4.5)}/><circle cx="200" cy="${cy.toFixed(1)}" r="${cr.toFixed(1)}" fill="#fffdf6" ${sw(3)}/>
            <path d="${ticks}" fill="none" ${sw(2.6)}/><path d="M200 ${cy.toFixed(1)} L200 ${(cy - cr * 0.5).toFixed(1)} M200 ${cy.toFixed(1)} L${(200 + cr * 0.4).toFixed(1)} ${(cy + cr * 0.12).toFixed(1)}" fill="none" ${sw(3)}/><circle cx="200" cy="${cy.toFixed(1)}" r="2.6" fill="${INK}"/>
            <path d="M${(200 - cr * 0.55).toFixed(1)} ${(cy - cr * 0.5).toFixed(1)} Q${(200 - cr * 0.2).toFixed(1)} ${(cy - cr * 0.78).toFixed(1)} ${(200 + cr * 0.1).toFixed(1)} ${(cy - cr * 0.75).toFixed(1)}" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>`; })()
      // a string of rainbow love beads
      : cfg.neck === "beads" ? (() => { const cols = ["#e8433f", "#ffc42b", "#4fb86a", "#4aa8ff", "#a070e8", nc], ax = 200 - g.tW * 0.26, bx = 200 + g.tW * 0.26, ay = ny - 2, cy = g.tTop + g.tH * 0.62;
          let o = ""; for(let i = 0; i <= 12; i++){ const t = i / 12, x = (1 - t) * (1 - t) * ax + 2 * (1 - t) * t * 200 + t * t * bx, y = (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * cy + t * t * ay;
            o += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.8" fill="${cols[i % cols.length]}" ${sw(2)}/>`; }
          return o; })()
      // a peace-sign pendant on a leather cord (the sign takes the neck colour)
      : cfg.neck === "peace" ? (() => { const py = g.tTop + g.tH * 0.44, d = `M${200 - g.tW * 0.24} ${ny - 2} Q200 ${(2 * (py - 9) - (ny - 2)).toFixed(1)} ${200 + g.tW * 0.24} ${ny - 2}`, sign = "M0 -9 V9 M0 1.5 L-6.4 6.4 M0 1.5 L6.4 6.4";
          return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#a8723c" stroke-width="2.6" stroke-linecap="round"/>
            <g transform="translate(200 ${py.toFixed(1)})"><circle r="9" fill="none" stroke="${INK}" stroke-width="7"/><path d="${sign}" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><circle r="9" fill="none" stroke="${nc}" stroke-width="3.4"/><path d="${sign}" fill="none" stroke="${nc}" stroke-width="2.6" stroke-linecap="round"/></g>`; })()
      : cfg.neck === "scarf" ? `<path d="${rrect(200 - g.tW * 0.3, g.tTop - 6, 200 + g.tW * 0.3, g.tTop + 10, 8)}" fill="${nc}" ${sw(4)}/><path d="M${200 + g.tW * 0.08} ${g.tTop + 4} L${200 + g.tW * 0.06} ${g.tTop + g.tH * 0.6} L${200 + g.tW * 0.24} ${g.tTop + g.tH * 0.58} L${200 + g.tW * 0.24} ${g.tTop + 6}Z" fill="${nc}" ${sw(4)}/><path d="M${200 + g.tW * 0.09} ${g.tTop + g.tH * 0.6 + 2} v5 M${200 + g.tW * 0.15} ${g.tTop + g.tH * 0.6 + 1} v5 M${200 + g.tW * 0.21} ${g.tTop + g.tH * 0.59 + 1} v5" fill="none" ${sw(2.4)}/><path d="M${200 + g.tW * 0.07} ${g.tTop + g.tH * 0.35} H${200 + g.tW * 0.24}" stroke="${shade(nc, 0.7)}" stroke-width="3"/>`
      : cfg.neck === "bowtie" ? `<g transform="translate(200 ${ny + 4})"><path d="M0 0 L-15 -9 Q-18 0 -15 9Z M0 0 L15 -9 Q18 0 15 9Z" fill="${nc}" ${sw(3.6)}/><rect x="-4.5" y="-5" width="9" height="10" rx="3" fill="${shade(nc, 0.78)}" ${sw(3)}/></g>` : "";

    // arms. The live version also carries a second, arms-up set for celebrating (shown by the "joy" class).
    const sleeve = { only: only === "top", band: extra.band, glove: extra.glove, long: ["hoodie", "stripes", "jacket", "flannel", "track", "puffer", "sequin", "leather", "fringe", "military", "pepper", "collarless"].includes(cfg.top), spikes: cfg.top === "leather", none: cfg.top === "jersey" || cfg.top === "hivis", stripe: cfg.top === "track", puffy: cfg.top === "puffer",
      epaulette: cfg.top === "pepper", cuffC: cfg.top === "pepper" ? (["#ffc42b", "#ffd34d", "#ff8a1c"].includes(col) ? "#e8433f" : "#ffc42b") : null };
    const pose = cfg.pose === "hold" || cfg.pose === "solo" ? holdPose(g, cfg.gear, cfg.pose === "solo") : (POSES[cfg.pose] || POSES.wave)(g);
    const armSet = specs => specs.map((sp, i) => armSvg(sp, i === 1, g, skin, col, sleeve));
    const main = armSet(pose), behind = main.filter(a => !a.front).map(a => a.svg).join(""), front = main.filter(a => a.front).map(a => a.svg).join("");
    // (a player holding an instrument keeps hold of it when celebrating)
    const fingers = pose.fingers ? pose.fingers(extra.glove || skin) : "";      // fretting fingertips over the neck (see holdPose)
    const altSet = anim ? armSet(cfg.pose === "hold" || cfg.pose === "solo" ? pose : POSES.cheer(g)) : [];
    const alt = altSet.filter(a => !a.front).map(a => a.svg).join(""), altFront = altSet.filter(a => a.front).map(a => a.svg).join("");

    // head and face (no cheeks, no eyebrows)
    const oy = g.oy, my = oy + g.hrx * 0.5, m = g.hrx * 0.27 / 32;
    const ears = `<circle cx="${200 - g.hrx * 0.98}" cy="${oy + g.hrx * 0.1}" r="${g.hrx * 0.17}" fill="${skin}" ${sw(5)}/><circle cx="${200 + g.hrx * 0.98}" cy="${oy + g.hrx * 0.1}" r="${g.hrx * 0.17}" fill="${skin}" ${sw(5)}/>`;
    const faceSkin = PAINT_BASE[cfg.mark] || skin;          // white-face paint covers the face (not the ears)
    const head = `<ellipse cx="200" cy="${g.hy}" rx="${g.hrx}" ry="${g.hry}" fill="${faceSkin}" ${sw(6)}/>`;
    const mouthAt = style => `<g transform="translate(${(200 - 200 * m).toFixed(1)} ${my.toFixed(1)}) scale(${m.toFixed(3)})">${mouthSvg(style, 0)}</g>`;
    const R = g.hrx * EYE_R, ex = g.hrx * EYE_X;
    const eyeList = [[200 - ex, oy], [200 + ex, oy]], ew = Math.max(4.4, R * 0.3).toFixed(1);
    // expressions that take over the face for a moment: ouch (> <) and joy (^ ^)
    const expr = anim ? `<g class="pa-xhurt"><path d="${eyeList.map((e, i) => { const s = i ? -1 : 1; return `M${e[0] - s * R * 0.5} ${e[1] - R * 0.55} L${e[0] + s * R * 0.45} ${e[1]} L${e[0] - s * R * 0.5} ${e[1] + R * 0.55}`; }).join(" ")}" fill="none" stroke="${INK}" stroke-width="${ew}" stroke-linecap="round" stroke-linejoin="round"/>${mouthAt("wow")}</g>
      <g class="pa-xjoy"><path d="${eyeList.map(e => `M${e[0] - R * 0.7} ${e[1] + R * 0.3} Q${e[0]} ${e[1] - R * 0.95} ${e[0] + R * 0.7} ${e[1] + R * 0.3}`).join(" ")}" fill="none" stroke="${INK}" stroke-width="${ew}" stroke-linecap="round"/>${mouthAt("open")}</g>` : "";
    const dmg = anim ? `
      <g class="d1"><g transform="translate(${200 + g.hrx * 0.5} ${oy + g.hrx * 0.52}) rotate(-24) scale(${g.hrx / 70})"><rect x="-17" y="-6" width="34" height="12" rx="4" fill="#f2cf9a" ${sw(3)}/><rect x="-6" y="-6" width="12" height="12" fill="#e5b97a"/></g></g>
      <g class="d2"><g transform="translate(${200 - g.hrx * 0.5} ${oy - g.hrx * 0.62}) rotate(20) scale(${g.hrx / 70})"><rect x="-17" y="-6" width="34" height="12" rx="4" fill="#f2cf9a" ${sw(3)}/><rect x="-6" y="-6" width="12" height="12" fill="#e5b97a"/></g><path class="pa-sweat" d="M${200 + g.hrx * 0.92} ${oy - g.hrx * 0.5} q9 15 0 22 q-9 -7 0 -22Z" fill="#8ecae6" ${sw(3)}/></g>
      <g class="d3">${eyeList.map(e => `<circle cx="${e[0]}" cy="${e[1]}" r="${R}" fill="#fff" ${sw(3.6)}/><path d="M${e[0]} ${e[1]} m0 0 a${R * 0.1} ${R * 0.1} 0 1 1 ${R * 0.2} 0 a${R * 0.25} ${R * 0.25} 0 1 1 -${R * 0.5} 0 a${R * 0.4} ${R * 0.4} 0 1 1 ${R * 0.8} 0 a${R * 0.55} ${R * 0.55} 0 1 1 -${R * 1.1} 0" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`).join("")}</g>
      <g class="dko">${eyeList.map(e => `<circle cx="${e[0]}" cy="${e[1]}" r="${R}" fill="#fff" ${sw(3.6)}/><path d="M${e[0] - R * 0.55} ${e[1] - R * 0.55} L${e[0] + R * 0.55} ${e[1] + R * 0.55} M${e[0] + R * 0.55} ${e[1] - R * 0.55} L${e[0] - R * 0.55} ${e[1] + R * 0.55}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`).join("")}</g>
      <g class="dko pa-stars"><g transform="translate(200 ${Math.max(26, g.hy - g.hry - 34)})"><path d="${star(0, 0, 11, 5)}" fill="#ffc42b" ${sw(2.6)} transform="translate(-48 8)"/><path d="${star(0, 0, 13, 6)}" fill="#ffc42b" ${sw(2.6)} transform="translate(0 -8)"/><path d="${star(0, 0, 11, 5)}" fill="#ffc42b" ${sw(2.6)} transform="translate(48 8)"/></g></g>` : "";
    const flash = anim ? `<g class="pa-flash" fill="#ff3b3b"><ellipse cx="200" cy="${g.hy}" rx="${g.hrx}" ry="${g.hry}"/><path d="${rrect(x0, g.tTop, x1, tBot, r)}"/></g>` : "";
    const face = `${paintSvg(cfg.mark, g)}<g class="pa-eyes">${eyesSvg(cfg.eyes, g, faceSkin)}</g>${faceSvg(cfg.mark, cfg.eyewear, g, cfg.hairColor)}${beardSvg(cfg.beard, g, cfg.hairColor)}<g class="pa-mouth">${mouthAt(cfg.mouth)}</g>`;
    // the eyewear sits over the expression overlays, so shades stay on when you get hit
    const headG = `<g class="pa-body" style="transform-origin:200px ${g.tTop + 6}px">${ears}${head}${face}${expr}${eyewearSvg(cfg.eyewear, g)}${hair.front}${headAcc}${gear.head || ""}${dmg}</g>`;
    const arms = `<g class="pa-main">${behind}</g>` + (anim ? `<g class="pa-alt">${alt}</g>` : "");
    // seen from behind (Adventure): no face, the back of the head is hair, and capes, wings, backpacks and a slung guitar sit over the back
    if(cfg._back || cfg._puppet){
      const hc = cfg.hairColor, hx = g.hrx, hy = g.hy, hr = g.hry, dkH = shade(hc, 0.72);
      const strands = [-0.5, -0.17, 0.17, 0.5].map(k => `M${(200 + k * hx).toFixed(1)} ${(hy - hr * 0.9).toFixed(1)} Q${(200 + k * hx * 1.15).toFixed(1)} ${hy.toFixed(1)} ${(200 + k * hx * 0.9).toFixed(1)} ${(hy + hr * 0.75).toFixed(1)}`).join(" ");
      const cover = cfg.hair === "none" ? ""
        : cfg.hair === "buzz" ? `<ellipse cx="200" cy="${hy}" rx="${hx}" ry="${hr}" fill="${hc}" opacity=".55"/>`
        : cfg.hair === "balding" ? `<path d="M${200 - hx * 0.98} ${hy + hr * 0.05} Q200 ${hy - hr * 0.2} ${200 + hx * 0.98} ${hy + hr * 0.05} Q${200 + hx * 0.8} ${hy + hr * 0.8} 200 ${hy + hr} Q${200 - hx * 0.8} ${hy + hr * 0.8} ${200 - hx * 0.98} ${hy + hr * 0.05}Z" fill="${hc}"/>`
        : cfg.hair === "mohawk" ? `<path d="${rrect(200 - hx * 0.16, hy - hr * 1.02, 200 + hx * 0.16, hy + hr * 0.9, hx * 0.14)}" fill="${hc}"/>`
        : `<ellipse cx="200" cy="${hy}" rx="${hx}" ry="${hr}" fill="${hc}"/><path d="${strands}" fill="none" stroke="${dkH}" stroke-width="3.4" stroke-linecap="round"/><path d="M${200 - hx * 0.3} ${hy - hr * 0.7} Q200 ${hy - hr * 0.86} ${200 + hx * 0.2} ${hy - hr * 0.74}" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="5" stroke-linecap="round"/>`;
      const nape = cfg.hair === "none" || cfg.hair === "balding" ? "" : `<ellipse cx="200" cy="${hy}" rx="${hx}" ry="${hr}" fill="none" ${sw(6)}/>`;
      // a guitar slung across the back: strap over the right shoulder, body at the left hip, neck up past the shoulder
      let slung = "";
      if(cfg._gear){
        const wood = cfg._gear === "acoustic" ? "#c98a4b" : cfg._gear === "rustbucket" ? "#b5562c" : cfg._gearColor, s = cfg._gear === "ukulele" ? 0.62 : cfg._gear === "bass" ? 1.08 : 1;
        const bx = 200 - g.tW * 0.22, by = tBot - 4, ang = -38;
        const bodyG = cfg._gear === "flyingv" ? `<path d="M0 -14 L-34 52 L-14 52 L0 18 L14 52 L34 52Z" fill="${wood}" ${sw(5)}/>`
          : `<circle cx="0" cy="22" r="${(34 * s).toFixed(1)}" fill="${wood}" ${sw(5)}/><circle cx="0" cy="${(-12 * s).toFixed(1)}" r="${(26 * s).toFixed(1)}" fill="${wood}" ${sw(5)}/><rect x="-14" y="16" width="28" height="7" rx="3" fill="${shade(wood, 0.6)}"/>`;
        const neckG = `<rect x="-6" y="${(-150 * s).toFixed(1)}" width="12" height="${(130 * s).toFixed(1)}" rx="3" fill="#7a4e26" ${sw(4.5)}/><rect x="-10" y="${(-176 * s).toFixed(1)}" width="20" height="30" rx="5" fill="#2b2623" ${sw(4)}/>` + (cfg._gear === "doubleneck" ? `<rect x="10" y="-140" width="12" height="120" rx="3" fill="#7a4e26" ${sw(4.5)}/>` : "");
        slung = `<path d="M${200 + g.tW * 0.42} ${g.tTop + 4} L${200 - g.tW * 0.46} ${tBot - 8}" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M${200 + g.tW * 0.42} ${g.tTop + 4} L${200 - g.tW * 0.46} ${tBot - 8}" stroke="#a8723c" stroke-width="6" stroke-linecap="round"/>`
          + `<g transform="translate(${bx.toFixed(1)} ${by}) rotate(${-ang})">${neckG}${bodyG}</g>`;
      }
      const headB = `<g class="pa-body" style="transform-origin:200px ${g.tTop + 6}px">${ears}<ellipse cx="200" cy="${hy}" rx="${hx}" ry="${hr}" fill="${skin}" ${sw(6)}/>${cover}${nape}${hair.front}${headAcc}</g>`;
      if(cfg._puppet){
        /* The parts of this exact character, for a jointed puppet (the side-scrolling levels). Everything is in the usual
           400-unit page space; the puppet places each part on its own joint. The side view is a three-quarter turn to the
           right: the face slides towards the way you're facing and only the back ear shows, but the hair, hats, face and
           outfit are the very same art as the front, so the character never changes when it turns. */
        const ear1 = `<circle cx="${200 - g.hrx * 0.94}" cy="${oy + g.hrx * 0.12}" r="${g.hrx * 0.17}" fill="${skin}" ${sw(5)}/>`;
        const turn = `translate(${(200 + g.hrx * 0.3).toFixed(1)} 0) scale(0.86 1) translate(-200 0)`;
        const hipY = tBot - 10;
        return { puppet: {
          g, hipY, FEET, skin, col: cfg.top === "hivis" ? "#ff8a1c" : col, pants, shoeC, bottom: cfg.bottom, legW: bw, sleeve, band: extra.band, glove: extra.glove || null,
          hairBack: hair.back || "",
          headSide: `${ear1}${head}<g transform="${turn}">${face}${eyewearSvg(cfg.eyewear, g)}</g>${hair.front}${headAcc}${gear.head || ""}`,
          headBack: headB,
          torso: `${skirt}${torso}${neck}`, torsoBack: `${skirt}${torso}${cfg.neck === "scarf" ? neck : ""}`,
          extraMid: extra.mid || "", extraBack: extra.back || "", slung,
          // a shoe with its ankle (where the leg comes in) at 0,0, toe pointing +x
          shoe: flip => `<g transform="translate(${flip ? 6 : -6} -12)">${shoe(shoeC, 0, 0, flip, cfg.shoes)}</g>`,
          // a hand in hand space (fingers up -y, wrist at +y), at the age's hand size
          hand: (kind, c) => `<g transform="scale(${g.hand})">${handSvg(kind, c || skin, (12 / g.hand).toFixed(2))}</g>`,
          tube
        } };
      }
      const backSvg = `${OVER_SHOES.includes(cfg.bottom) ? feet + legs : legs + feet}${skirt}${torso}${cfg.neck === "scarf" ? neck : ""}${extra.mid || ""}<g class="pa-main">${behind}</g>${front}${hair.back || ""}${extra.back || ""}${slung}${headB}`;
      return { svg: backSvg, fx: { kind: "notes", pts: null, hands: [] }, look: 0 };
    }
    const svg = `${extra.back || ""}${gear.back || ""}${hair.back ? `<g class="pa-body" style="transform-origin:200px ${g.tTop + 6}px">${hair.back}</g>` : ""}${OVER_SHOES.includes(cfg.bottom) ? feet + legs : legs + feet}${skirt}${torso}${name}${neck}${extra.mid || ""}${arms}${gear.mid || ""}${fingers}${headG}${front ? `<g class="pa-main">${front}</g>` : ""}${altFront ? `<g class="pa-alt">${altFront}</g>` : ""}${flash}`;

    // where attack effects come from
    const fx = cfg.gear === "mic" ? { kind: "waves", pts: [[200 + g.hrx * 0.4, my + 8]] }
      : INSTRUMENTS.includes(cfg.gear) ? { kind: "notes", pts: [guitarPt(g, -6, 6, cfg.pose === "solo")] }
      : { kind: "notes", pts: null, hands: main.map(a => a.hand) };
    if(only){
      const bottom = cfg.bottom === "shorts" ? leg(lx, lf, tBot + 26, pants) + leg(rx, rf, tBot + 26, pants) : SKIRTS[cfg.bottom] ? skirt : legs;
      if(only === "extra"){      // an accessory on its own (gloves and sweatbands get a pair of hands to sit on)
        const hands = c => [-1, 1].map(sg => `<g transform="translate(${200 + sg * 34} ${g.tTop + g.tH / 2}) scale(${(sg * g.hand * 1.5).toFixed(2)} ${(g.hand * 1.5).toFixed(2)})">${handSvg("open", c, (12 / g.hand).toFixed(2))}</g>`).join("");
        if(cfg.extra === "gloves") return { svg: hands(extra.glove) + [-1, 1].map(sg => `<rect x="${200 + sg * 34 - 16}" y="${g.tTop + g.tH / 2 + 18}" width="32" height="10" rx="4" fill="#ffc42b" ${sw(3)}/>`).join("") };
        if(cfg.extra === "sweatbands") return { svg: hands(skin) + [-1, 1].map(sg => `<rect x="${200 + sg * 34 - 17}" y="${g.tTop + g.tH / 2 + 16}" width="34" height="14" rx="5" fill="${extra.band}" ${sw(4)}/>`).join("") };
        if(cfg.extra === "biostrap") return { svg: `<path d="${rrect(x0, g.tTop, x1, tBot, r)}" fill="#e9e3d6" opacity=".6"/>${extra.mid}` };
        return { svg: (extra.back || "") + (extra.mid || "") };
      }
      return { svg: only === "top" ? torso + behind : only === "bottom" ? bottom : only === "shoes" ? feet : neck };
    }
    // a Flying V shoots fire from its headstock now and then
    if(cfg.gear === "flyingv") fx.fire = { pt: guitarPt(g, 160, -2, cfg.pose === "solo"), ang: guitarAt(g, cfg.pose === "solo").rot };
    return { svg, fx, look: R * 0.36 };
  }
  const viewBox = (cfg, view) => {
    const g = AGES[cfg.body] || AGES.kid;
    if(view === "face") return `${200 - g.hrx * 1.2} ${g.oy - g.hrx * 0.7} ${g.hrx * 2.4} ${g.hrx * 1.75}`;
    if(view === "fig") return "30 22 340 340";            // the whole figure, cropped close (editor thumbnails)
    if(view === "feet") return "112 262 176 116";          // shoes
    if(view === "chest") return `${200 - g.tW * 0.85} ${g.tTop - g.tW * 0.45} ${g.tW * 1.7} ${g.tW * 1.3}`;   // neckwear
    if(view === "head") return `${200 - g.hrx * 1.5} ${g.oy - g.hrx * 2.05} ${g.hrx * 3} ${g.hrx * 3.5}`;
    return "0 0 400 400";
  };

  /* ---- animation. Layers, outside in: pa-hitg (actions: hurt, attack, cheer, KO) > pa-all (breathing) > pa-fid (fidgets: hops).
     Inside: pa-body is the head (tilts, bobs, headbangs), pa-arm swings from the shoulder, pa-hand turns at the wrist,
     pa-eye blinks, pa-pup (the pupils) look around. Every movement is a CSS class switched on for a moment. ---- */
  const css = `
.pa{width:100%;height:100%;display:block;overflow:visible}
.pa-hitg,.pa-all,.pa-fid{transform-box:view-box;transform-origin:200px 380px}
.pa-arm,.pa-hand,.pa-body,.pa-eye,.pa-pup,.pa-fx,.pa-fx *{transform-box:view-box}
.pa-all{animation:pa-idle 2.6s ease-in-out infinite}
@keyframes pa-idle{0%,100%{transform:scale(1,1)}50%{transform:scale(1.012,.986) translateY(-2px)}}
.pa-arm{animation:pa-sway 2.8s ease-in-out infinite}
.pa-arm.r{animation-direction:reverse}
.pa-arm.nosway{animation:none}
@keyframes pa-sway{0%,100%{transform:rotate(0)}50%{transform:rotate(5deg)}}
.pa-cape{transform-box:view-box;transform-origin:200px 200px;animation:pa-cape 1.8s ease-in-out infinite}
@keyframes pa-cape{0%,100%{transform:skewX(0)}50%{transform:skewX(2.5deg)}}
.pa-alt,.pa-xhurt,.pa-xjoy{display:none}
.pa.joy .pa-alt,.pa.joy .pa-xjoy,.pa.glad .pa-xjoy,.pa.hurt .pa-xhurt{display:inline}
.pa.joy .pa-main,.pa.joy .pa-eyes,.pa.joy .pa-mouth,.pa.glad .pa-eyes,.pa.glad .pa-mouth,.pa.hurt .pa-eyes,.pa.hurt .pa-mouth,.pa.hurt .pa-xjoy{display:none}
.pa.ko .pa-xhurt,.pa.ko .pa-xjoy,.pa.ko .pa-alt{display:none}
.pa.ko .pa-main{display:inline}
.pa.ko .pa-mouth{display:inline}
.pa-eye{transition:transform .06s}
.pa.blink .pa-eye{transform:scaleY(.1)}
.pa-pup{transition:transform .22s ease}
.pa.lookl .pa-pup{transform:translateX(calc(var(--look) * -1))}
.pa.lookr .pa-pup{transform:translateX(var(--look))}
.pa.lookup .pa-pup{transform:translateY(calc(var(--look) * -1))}
.pa.hop .pa-fid{animation:pa-hop .55s ease-out}
@keyframes pa-hop{0%,100%{transform:none}30%{transform:translateY(-18px) scale(.97,1.04)}62%{transform:translateY(0) scale(1.04,.96)}}
.pa.tilt .pa-body{animation:pa-tilt 1.5s ease-in-out}
@keyframes pa-tilt{0%,100%{transform:none}25%,75%{transform:rotate(7deg)}}
.pa.bob .pa-body{animation:pa-bob .42s ease-in-out 4}
@keyframes pa-bob{50%{transform:translateY(5px) rotate(-3deg)}}
.pa.bang .pa-body{animation:pa-bang .3s ease-in-out 5}
@keyframes pa-bang{40%{transform:translateY(9px) rotate(5deg)}}
.pa.wavebig .pa-arm.waver{animation:pa-wave .36s ease-in-out 4}
@keyframes pa-wave{0%,100%{transform:rotate(0)}50%{transform:rotate(-14deg)}}
.pa.pump .pa-arm.pumper{animation:pa-pump .3s ease-in-out 4}
.pa.pump .pa-arm.pumper.r{animation-delay:.15s}
@keyframes pa-pump{0%,100%{transform:rotate(0)}50%{transform:rotate(-8deg)}}
.pa.pump .pa-arm.pumper.l{animation-name:pa-pumpl}
@keyframes pa-pumpl{0%,100%{transform:rotate(0)}50%{transform:rotate(8deg)}}
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
.pa.ko .pa-all,.pa.ko .pa-arm{animation:none}
.pa-body .d1,.pa-body .d2,.pa-body .d3,.pa-body .dko{opacity:0;transition:opacity .35s}
.pa.st1 .d1,.pa.st2 .d2,.pa.st3 .d3,.pa.ko .dko{opacity:1}
.pa.ko .d3{opacity:0}
.pa-sweat{animation:pa-sweat 1.3s ease-in infinite}
@keyframes pa-sweat{0%{transform:translateY(0);opacity:0}20%{opacity:1}100%{transform:translateY(34px);opacity:0}}
.pa-stars{transform-box:view-box;transform-origin:200px 60px;animation:pa-spin 1.4s linear infinite}
@keyframes pa-spin{to{transform:rotate(360deg)}}
.pa-fx{pointer-events:none;animation:pa-fly var(--t,.9s) cubic-bezier(.2,.7,.4,1) var(--dl,0s) both}
@keyframes pa-fly{0%{transform:translate(0,0) scale(.3) rotate(0);opacity:0}18%{opacity:1;transform:translate(calc(var(--dx) * .2),calc(var(--dy) * .2)) scale(1.1) rotate(calc(var(--rt) * .3))}100%{transform:translate(var(--dx),var(--dy)) scale(.9) rotate(var(--rt));opacity:0}}
.pa-fx.pop{animation-name:pa-pop;animation-timing-function:ease-out}
@keyframes pa-pop{0%{transform:scale(.2);opacity:0}25%{transform:scale(1.15);opacity:1}100%{transform:scale(1.5);opacity:0}}
@media (prefers-reduced-motion:reduce){.pa *{animation:none!important;transition:none!important}}
`;
  function injectCss(){ if(document.getElementById("pa-css")) return; const s = document.createElement("style"); s.id = "pa-css"; s.textContent = css; document.head.appendChild(s); }

  // effects that fly off the character: music notes, sound waves (in viewBox units, at the effect's origin)
  const FXC = ["#ffc42b", "#ff6fa3", "#4aa8ff", "#9be04a", "#a070e8", "#4fd0c0"];
  const NOTE1 = c => `<ellipse cx="0" cy="0" rx="8.5" ry="6.5" transform="rotate(-22)" fill="${c}" ${sw(3.4)}/><path d="M7.4 -2 V-30 Q15 -26 18 -16" fill="none" ${sw(4)}/>`;
  const NOTE2 = c => `<ellipse cx="-11" cy="2" rx="7.5" ry="5.8" transform="rotate(-22 -11 2)" fill="${c}" ${sw(3.2)}/><ellipse cx="11" cy="-4" rx="7.5" ry="5.8" transform="rotate(-22 11 -4)" fill="${c}" ${sw(3.2)}/><path d="M-4.6 0 V-26 L17.4 -32 V-6" fill="none" ${sw(4)}/><path d="M-4.6 -22 L17.4 -28" fill="none" ${sw(6)}/>`;
  const WAVE = c => `<path d="M0 -20 Q14 0 0 20" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M0 -20 Q14 0 0 20" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`;
  function spawn(svg, kind, pts, dir, small){
    const layer = svg.querySelector(".pa-fxl"); if(!layer) return;
    const rnd = (a, b) => a + Math.random() * (b - a), bits = [];
    pts.forEach(([x, y], pi) => {
      const n = small ? 2 : 3;
      for(let i = 0; i < n; i++){
        const c = FXC[Math.floor(Math.random() * FXC.length)];
        let body, dx, dy, rt, t = small ? 1.2 : 0.9, dl = i * 0.08 + pi * 0.05, pop = false, sc = small ? 0.95 : 1.5;
        if(kind === "waves"){ body = WAVE(c); dx = dir * (150 + i * 50); dy = rnd(-6, 6); rt = 0; dl = i * 0.12; sc = 1.1 + i * 0.35; }
        else { body = (Math.random() < 0.5 ? NOTE1 : NOTE2)(c); dx = small ? rnd(-40, 40) : dir * rnd(170, 290); dy = small ? rnd(-100, -70) : rnd(-110, -10); t = small ? 1.2 : 1.0; rt = rnd(-25, 25); }
        bits.push(`<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${sc.toFixed(2)})"><g class="pa-fx${pop ? " pop" : ""}" style="--dx:${dx.toFixed(0)}px;--dy:${dy.toFixed(0)}px;--rt:${rt.toFixed(0)}deg;--t:${t}s;--dl:${dl.toFixed(2)}s">${body}</g></g>`);
      }
    });
    const g = document.createElementNS(NS, "g"); g.innerHTML = bits.join(""); layer.appendChild(g);
    setTimeout(() => g.remove(), 1800);
  }

  // fire: a short burst of flames shooting out along the neck. Each flame is drawn pointing up, then turned to face the way it flies.
  const FLAME = (o, i) => `<path d="M0 -24 C9 -13 14 -3 11 6 C9 13 4 16 0 16 C-4 16 -9 13 -11 6 C-14 -3 -9 -13 0 -24Z" fill="${o}" ${sw(3.2)}/><path d="M0 -10 C4 -4 6 1 5 6 C4 10 2 11 0 11 C-2 11 -4 10 -5 6 C-6 1 -4 -4 0 -10Z" fill="${i}"/>`;
  function spawnFire(svg, fire){
    const layer = svg.querySelector(".pa-fxl"); if(!layer) return;
    const [x, y] = fire.pt, bits = [];
    for(let i = 0; i < 8; i++){
      const d = 50 + i * 10 + Math.random() * 14, side = (Math.random() - 0.5) * 22, sc = 0.8 + Math.random() * 0.6, rt = (Math.random() - 0.5) * 30;
      const [o, inner] = i % 3 ? ["#ff8a1c", "#ffd34d"] : ["#e8433f", "#ffc42b"];
      bits.push(`<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${fire.ang + 90}) scale(${sc.toFixed(2)})"><g class="pa-fx" style="--dx:${side.toFixed(0)}px;--dy:${(-d).toFixed(0)}px;--rt:${rt.toFixed(0)}deg;--t:.75s;--dl:${(i * 0.06).toFixed(2)}s">${FLAME(o, inner)}</g></g>`);
    }
    const g = document.createElementNS(NS, "g"); g.innerHTML = bits.join(""); layer.appendChild(g);
    setTimeout(() => g.remove(), 1600);
  }

  /* ---- idle life: one shared timer drives every live character on the page (blinks, glances, fidgets).
     A character that has left the page is dropped from the list. Nothing runs if the device asks for reduced motion. ---- */
  const live = new Set();
  const RM = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  let ticker = null;
  function tickAll(){
    const now = performance.now();
    live.forEach(c => { if(!c.svg.isConnected){ live.delete(c); return; } if(!document.hidden) c.step(now); });
    if(!live.size){ clearInterval(ticker); ticker = null; }
  }
  const SOLO_POSES = ["star", "rock", "cheer", "flex"];      // the moments a guitar player celebrates with a solo
  const FIDGET_MS = { hop: 600, tilt: 1550, bob: 1750, bang: 1600, wavebig: 1500, pump: 1300 };
  // which fidgets suit which pose (repeats make one more likely)
  function fidgetsFor(cfg){
    const base = ["look", "look", "hop", "tilt", "bob"];
    if(cfg.pose === "hold" || cfg.pose === "solo") return base.concat(["solo", "solo", "bang", "bob"]);
    if(cfg.pose === "wave") return base.concat(["wavebig", "wavebig"]);
    if(cfg.pose === "rock") return base.concat(["bang", "bang", "pump"]);
    if(["cheer", "thumbs", "peace", "star", "flex"].includes(cfg.pose)) return base.concat(["pump", "pump"]);
    return base;
  }

  const DEFAULTS = { name: "", body: "kid", skin: SKINS[1], hair: "crop", hairColor: HAIR_COLORS[1], eyes: "calm", mouth: "smile", mark: "none", eyewear: "none", top: "tee", color: PALETTE[7], bottom: "pants", pants: PALETTE[8], accent: PALETTE[0], pose: "relax", acc: "none", accColor: PALETTE[0], gear: "none", gearColor: PALETTE[6], shoes: "sneakers", neck: "none", neckColor: PALETTE[0], beard: "none", extra: "none", extraColor: PALETTE[10] };
  const inList = (v, list) => list.some(x => (Array.isArray(x) ? x[0] : x) === v);
  const isHex = v => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v);
  // fills in anything missing; values from older versions that no longer exist fall back to a default
  const norm = cfg => {
    const c = Object.assign({}, DEFAULTS, cfg || {});
    if(c.mark === "beard" || c.mark === "moustache"){ c.beard = c.mark === "beard" ? "full" : "moustache"; c.mark = "none"; }   // older saves
    if(!inList(c.beard, OPTIONS.beards)) c.beard = "none";
    if(c.gear === "cape"){ c.extra = "cape"; c.extraColor = c.gearColor; c.gear = "none"; }                        // older saves
    if(!inList(c.extra, OPTIONS.extras)) c.extra = "none";
    if(!AGES[c.body]) c.body = DEFAULTS.body;
    c.pose = "relax";                              // poses belong to game moments now, not the saved character
    if(!inList(c.eyes, OPTIONS.eyes)) c.eyes = DEFAULTS.eyes;
    if(!inList(c.mouth, OPTIONS.mouths)) c.mouth = DEFAULTS.mouth;
    if(!inList(c.hair, OPTIONS.hair)) c.hair = DEFAULTS.hair;
    if(!inList(c.top, OPTIONS.tops)) c.top = DEFAULTS.top;
    if(!inList(c.bottom, OPTIONS.bottoms)) c.bottom = DEFAULTS.bottom;
    if(!inList(c.mark, OPTIONS.marks)) c.mark = "none";
    if(!inList(c.eyewear, OPTIONS.eyewear)) c.eyewear = "none";
    if(!inList(c.acc, OPTIONS.acc)) c.acc = "none";
    if(!inList(c.gear, OPTIONS.gear)) c.gear = "none";
    if(!inList(c.shoes, OPTIONS.shoes)) c.shoes = "sneakers";
    if(!inList(c.neck, OPTIONS.neck)) c.neck = "none";
    ["skin", "hairColor", "color", "pants", "accent", "accColor", "gearColor", "neckColor", "extraColor"].forEach(k => { if(!isHex(c[k])) c[k] = DEFAULTS[k]; });
    return c;
  };

  /* PlayerArt(el, cfg, { idle, tap }) draws the live character into el and returns its controller. idle (on by default) adds
     blinking, glancing about and the pose's own fidgets; games can turn it off while the character should hold still.
     tap (on by default): tapping the character makes it react or cheer. */
  function PlayerArt(el, cfg, opts){
    injectCss(); cfg = norm(cfg); opts = Object.assign({ idle: true, tap: true }, opts || {});
    const holding = INSTRUMENTS.includes(cfg.gear);
    if(holding) cfg.pose = "hold";                   // holding an instrument: always holds it, even at rest
    else if(POSES[opts.pose]) cfg.pose = opts.pose;  // a game can choose the resting pose
    let b = build(cfg, true), shown = cfg.pose, poseT = null;
    el.innerHTML = `<svg class="pa" viewBox="0 0 400 400" xmlns="${NS}" aria-hidden="true" style="--look:${b.look.toFixed(1)}px"><ellipse cx="200" cy="384" rx="92" ry="9" fill="${INK}" opacity=".14"/><g class="pa-hitg"><g class="pa-all"><g class="pa-fid">${b.svg}</g></g></g><g class="pa-fxl"></g></svg>`;
    const svg = el.querySelector("svg"), timers = new Set();
    let stage = 0, ko = false, dir = 1, idle = opts.idle;
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
    const ACTIONS = ["hurt", "atk", "cheer", "joy", "glad", "ko"], FIDGETS = ["hop", "tilt", "bob", "bang", "wavebig", "pump", "lookl", "lookr", "lookup"];
    const busy = () => ACTIONS.some(c => svg.classList.contains(c));
    const flick = (cls, ms) => { svg.classList.remove(cls); void svg.getBoundingClientRect(); svg.classList.add(cls); later(() => svg.classList.remove(cls), ms); };
    const calm = () => FIDGETS.forEach(c => svg.classList.remove(c));
    let pool = fidgetsFor(cfg);
    // swap the drawn pose; damage and action classes live on the svg, so they carry over
    function draw(p){
      const c = Object.assign({}, cfg, { pose: p }); b = build(c, true); shown = p; pool = fidgetsFor(c);
      svg.querySelector(".pa-fid").innerHTML = b.svg; svg.style.setProperty("--look", b.look.toFixed(1) + "px");
    }
    function fidget(name){
      if(name === "solo"){ ctl.pose("star", 2000); return; }
      if(name === "look"){ const first = Math.random() < 0.5 ? "lookl" : "lookr"; svg.classList.add(first);
        later(() => { svg.classList.remove(first); if(Math.random() < 0.6) svg.classList.add(first === "lookl" ? "lookr" : "lookl"); }, 800);
        later(() => svg.classList.remove("lookl", "lookr"), 1700); return; }
      flick(name, FIDGET_MS[name] || 1000);
    }
    let nextBlink = performance.now() + 1200 + Math.random() * 2000, nextFidget = performance.now() + 1800 + Math.random() * 2200, nextFire = performance.now() + 2500 + Math.random() * 3000;
    const ctl = {
      svg,
      step(now){
        if(ko || RM) return;
        if(now > nextBlink){ nextBlink = now + 2200 + Math.random() * 3200;
          if(!busy()){ flick("blink", 120); if(Math.random() < 0.2) later(() => flick("blink", 110), 240); } }
        if(idle && b.fx.fire && now > nextFire){ nextFire = now + 6000 + Math.random() * 6000; if(!busy()) ctl.fire(); }
        if(idle && now > nextFidget){ nextFidget = now + 3200 + Math.random() * 4200; if(!busy()) fidget(pool[Math.floor(Math.random() * pool.length)]); }
      },
      setDamage(f){
        if(ko) return; f = Math.max(0, Math.min(1, f || 0));
        const st = f >= 0.75 ? 3 : f >= 0.5 ? 2 : f >= 0.25 ? 1 : 0;
        if(st === stage) return; stage = st;
        for(let i = 1; i <= 3; i++) svg.classList.toggle("st" + i, i <= st);
      },
      hurt(){ if(ko) return; calm(); svg.classList.remove("joy", "glad"); dir = -dir; svg.style.setProperty("--hd", dir); flick("hurt", 560); },
      // an attack: a lunge, then notes (or sound waves, with the mic) fly off in direction d
      attack(d){ if(ko) return; d = d || 1; calm(); svg.style.setProperty("--ad", d); flick("atk", 580);
        later(() => spawn(svg, b.fx.kind, b.fx.pts || [b.fx.hands[d > 0 ? 1 : 0]], d), 180); },
      cheer(){ if(ko) return; calm(); flick("cheer", 620); flick("joy", 1300); if(holding) flick("bang", 1600); },
      // a little jump, for when something changes (the editor uses it). The face stays as chosen.
      react(){ if(ko) return; calm(); flick("hop", 600); },
      fidget(name){ if(!ko && !busy()) fidget(name); },
      // flames from a Flying V (does nothing with any other gear, or if the device asks for reduced motion)
      fire(){ if(!ko && !RM && b.fx.fire) spawnFire(svg, b.fx.fire); },
      pose(name, ms){
        if(ko || !POSES[name]) return;
        // a player holding an instrument keeps playing it: the big poses become a solo (guitar lifted high, with a headbang)
        if(holding) name = SOLO_POSES.includes(name) ? "solo" : "hold";
        if(poseT){ clearTimeout(poseT); timers.delete(poseT); poseT = null; }
        if(shown !== name) draw(name);
        calm(); flick("hop", 600); if(name === "solo") flick("bang", 1600);
        if(ms > 0){ poseT = setTimeout(() => { timers.delete(poseT); poseT = null; if(!ko && shown !== cfg.pose) draw(cfg.pose); }, ms); timers.add(poseT); }
      },
      idle(on){ idle = on !== false; if(!idle) calm(); },
      ko(){ if(ko) return; ko = true; calm(); svg.classList.remove("joy", "glad", "hurt"); svg.classList.add("ko"); },
      moment(name, ms){
        const p = PlayerArt.MOMENTS[name]; if(!p || ko) return;
        ctl.pose(p, ms === undefined ? 1400 : ms);
        if(["win", "best", "cheer"].includes(name)) ctl.cheer();
      },
      reset(){ ko = false; stage = 0; if(shown !== cfg.pose) draw(cfg.pose); svg.classList.remove("st1", "st2", "st3", "ko", "hurt", "atk", "cheer", "joy", "glad"); calm(); },
      destroy(){ live.delete(ctl); timers.forEach(clearTimeout); timers.clear(); }
    };
    if(opts.tap){ let taps = 0; svg.style.cursor = "pointer";
      svg.addEventListener("click", () => { if(ko || busy()) return; calm(); taps++;
        if(taps % 2) ctl.react(); else ctl.cheer(); }); }
    if(el._pa) el._pa.destroy();
    el._pa = ctl; live.add(ctl);
    if(!ticker) ticker = setInterval(tickAll, 120);
    return ctl;
  }
  PlayerArt.svg = (cfg, view, pose) => { cfg = norm(cfg); if(INSTRUMENTS.includes(cfg.gear)) cfg.pose = pose && SOLO_POSES.includes(pose) ? "solo" : "hold"; else if(pose && POSES[pose]) cfg.pose = pose; return `<svg viewBox="${viewBox(cfg, view)}" xmlns="${NS}"><g>${build(cfg, false).svg}</g></svg>`; };
  // one item of clothing on its own (part = "top" | "bottom" | "shoes" | "neck"), framed to fit, for the outfit menu
  PlayerArt.item = (cfg, part) => {
    cfg = norm(Object.assign({}, cfg, { pose: "relax", gear: "none", name: "" }));
    const g = AGES[cfg.body] || AGES.kid, tBot = g.tTop + g.tH, box = (cx, cy, size) => `${(cx - size / 2).toFixed(1)} ${(cy - size / 2).toFixed(1)} ${size.toFixed(1)} ${size.toFixed(1)}`;
    const vb = part === "extra" ? (cfg.extra === "wings" ? box(200, g.tTop - 6, g.tW + 210) : cfg.extra === "cape" ? box(200, (g.tTop + FEET) / 2 + 6, FEET - g.tTop + 50) : box(200, g.tTop + g.tH / 2, g.tW + 70))
      : part === "top" ? box(200, g.tTop + g.tH / 2 + 4, Math.max(g.tW + 70, g.tH + 44))
      : part === "bottom" ? (["skirt", "pleated", "tutu"].includes(cfg.bottom) ? box(200, tBot + 18, g.tW + 66) : box(200, (tBot + FEET) / 2 + 2, Math.max(FEET - tBot + 34, g.tW + 70)))
      : part === "shoes" ? box(200, FEET + 2, 120)
      : cfg.neck === "clock" ? box(200, g.tTop + g.tH * 0.36, g.tW * 1.3) : box(200, g.tTop + g.tH * 0.22, g.tW * 1.1);
    const [vx, vy, vs] = vb.split(" ").map(Number), body = build(cfg, false, part).svg
      || `<g fill="none" stroke="#c9c2b2" stroke-width="${(vs * 0.05).toFixed(1)}" stroke-linecap="round"><circle cx="${vx + vs / 2}" cy="${vy + vs / 2}" r="${vs * 0.22}"/><path d="M${vx + vs * 0.345} ${vy + vs * 0.655} L${vx + vs * 0.655} ${vy + vs * 0.345}"/></g>`;   // "none"
    return `<svg viewBox="${vb}" xmlns="${NS}"><g>${body}</g></svg>`;
  };
  // the character seen from behind (Adventure walks away from the camera). Instruments are slung on the back.
  // hipY tells a game where the legs start, so it can step them one at a time.
  PlayerArt.back = cfg => { cfg = norm(cfg); const g = AGES[cfg.body] || AGES.kid, hold = INSTRUMENTS.includes(cfg.gear);
    const c = Object.assign({}, cfg, { _back: true, _gear: hold ? cfg.gear : null, _gearColor: cfg.gearColor, gear: "none", pose: "relax" });
    return { svg: `<svg viewBox="0 0 400 400" width="400" height="400" xmlns="${NS}"><g>${build(c, false).svg}</g></svg>`, hipY: g.tTop + g.tH - 10, headTop: g.hy - g.hry }; };
  // the character as a set of parts for a jointed puppet (see the _puppet branch in build). Instruments are slung on the back.
  PlayerArt.puppet = cfg => { cfg = norm(cfg); const hold = INSTRUMENTS.includes(cfg.gear);
    return build(Object.assign({}, cfg, { _puppet: true, _gear: hold ? cfg.gear : null, _gearColor: cfg.gearColor, gear: hold ? "none" : cfg.gear, pose: "relax" }), false).puppet; };
  // an instrument (or the mic) on its own, framed square, for the editor's Gear tab
  PlayerArt.gear = (kind, c) => {
    if(kind === "none") return `<svg viewBox="0 0 100 100" xmlns="${NS}"><g fill="none" stroke="#c9c2b2" stroke-width="7" stroke-linecap="round"><circle cx="50" cy="50" r="24"/><path d="M33 67 L67 33"/></g></svg>`;
    if(kind === "mic") return `<svg viewBox="0 0 100 100" xmlns="${NS}"><g ${ST} stroke-width="4"><path d="M50 58 V84 M36 86 H64" fill="none" stroke-width="5"/><path d="M34 44 Q34 62 50 62 Q66 62 66 44" fill="none"/><rect x="40" y="14" width="20" height="40" rx="10" fill="#3a3a3d"/><path d="M41 26 H59 M41 33 H59 M41 40 H59" stroke="#9a958e" stroke-width="2"/></g></svg>`;
    const sz = INSTR_SIZE[kind] || 1;
    return `<svg viewBox="-82 -168 236 236" xmlns="${NS}"><g transform="rotate(-45) scale(${(0.86 / sz).toFixed(3)})">${instrumentSvg(kind, c || "#e8433f")}</g></svg>`;
  };
  PlayerArt.options = OPTIONS;
  // the student's own character beside a game (waves hello), and one inside a celebration popup holding a moment's pose
  PlayerArt.buddy = (el, opts) => { if(!el) return null; const c = PlayerArt(el, window.Player.get(), opts); setTimeout(() => c.moment("hello", 2000), 400); return c; };
  PlayerArt.popIn = (box, moment) => {
    const d = document.createElement("div"); d.style.cssText = "width:124px;height:124px;margin:-8px auto 0"; box.prepend(d);
    const c = PlayerArt(d, window.Player.get(), { tap: false }); setTimeout(() => c.moment(moment, 0), 150); return c;
  };
  // which pose each game moment uses (all poses stay friendly: there is no sad or losing pose)
  PlayerArt.MOMENTS = { hello: "wave", wait: "hips", start: "thumbs", hit: "thumbs", streak: "flex", best: "star", win: "rock", cheer: "cheer", done: "peace" };
  PlayerArt.presets = [];
  PlayerArt.norm = norm;
  window.PlayerArt = PlayerArt;

  /* ---- the saved character ---- */
  const key = () => window.fmaKey ? window.fmaKey("fma-player-v1") : "fma-player-v1";      // one character per player on the device
  const pick = a => a[Math.floor(Math.random() * a.length)];
  window.Player = {
    random(){
      const gear = pick(["none", "none", ...OPTIONS.gear.map(a => a[0])]);
      return norm({ body: pick(OPTIONS.bodies)[0], skin: pick(SKINS), hair: pick(OPTIONS.hair)[0], hairColor: pick(HAIR_COLORS), eyes: pick(OPTIONS.eyes)[0],
        mouth: pick(OPTIONS.mouths)[0], mark: pick(["none", "none", "none", ...OPTIONS.marks.map(a => a[0])]), eyewear: pick(["none", "none", "none", ...OPTIONS.eyewear.map(a => a[0])]),
        beard: Math.random() < 0.2 ? pick(OPTIONS.beards)[0] : "none", top: pick(OPTIONS.tops)[0], color: pick(PALETTE), bottom: pick(OPTIONS.bottoms)[0], pants: pick(PALETTE), accent: pick(PALETTE),
        acc: pick(["none", ...OPTIONS.acc.map(a => a[0])]), accColor: pick(PALETTE), gear, gearColor: pick(PALETTE),
        shoes: pick(OPTIONS.shoes)[0], neck: pick(["none", "none", ...OPTIONS.neck.map(a => a[0])]), neckColor: pick(PALETTE),
        extra: pick(["none", "none", ...OPTIONS.extras.map(a => a[0])]), extraColor: pick(PALETTE) });
    },
    // the clear-out: bald, medium skin, plain tee and pants, nothing else (keeps the body type)
    plain(body){
      return norm({ body: body || "kid", skin: SKINS[2], hair: "none", beard: "none", eyes: "calm", mouth: "smile", mark: "none", eyewear: "none",
        top: "tee", color: PALETTE[10], bottom: "pants", pants: PALETTE[12], shoes: "sneakers", accent: PALETTE[12], pose: "relax",
        acc: "none", gear: "none", neck: "none", extra: "none" });
    },
    get(){
      try{ const v = JSON.parse(localStorage.getItem(key())); if(v && v.body) return norm(v); }catch(e){}
      const r = this.random(); this.set(r); return r;
    },
    set(cfg){ try{ localStorage.setItem(key(), JSON.stringify(norm(cfg))); }catch(e){} },
    has(){ try{ return !!localStorage.getItem(key()); }catch(e){ return false; } }
  };
})();
