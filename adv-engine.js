/* Adventure's engine: the character puppet, its moves, and the shared scenery helpers. Levels (adv-*.js) are loaded after
   this and add themselves to LEVELS; adventure.html runs the page. Classic scripts share their top-level names, so a level
   file can use run(), jump(), barSwing(), box(), smoke()... directly. */
"use strict";
const LEVELS = [];
const INK = "#26211f", R = Math.PI / 180, VW = 1280, VH = 720;
let W = 3300;          // the current level's width (set when a level loads)
const sin = a => Math.sin(a * R), cos = a => Math.cos(a * R);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const f1 = n => (Math.round(n * 10) / 10);
const shade = (h, f) => "#" + [1, 3, 5].map(i => clamp(Math.round(parseInt(h.slice(i, i + 2), 16) * f), 0, 255).toString(16).padStart(2, "0")).join("");
const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* =====================================================================
   THE RIG: a jointed puppet made from the character's OWN parts.
   PlayerArt.puppet(cfg) hands over the very same head, hair, hats, face,
   outfit, hands, shoes and slung guitar the front view uses, so the
   character looks the same from every side. This file only adds the
   skeleton (and the Rust Row gear on top).
   Angles in degrees. Limbs: 0 = pointing straight down, + = forward.
   Torso t: 0 = upright, + = leaning forward. rot spins the whole body
   about its centre (18 above the hip). Elbows bend +, knees bend −.
   ===================================================================== */
const S = 0.47;            // the house art's 400-unit page, in world units
const SIDE_SQ = 0.74;      // the torso seen side-on is narrower than from the front
let LEN, PZ, PZkey = "";
const GUITARS = ["acoustic", "guitar", "flyingv", "bass", "violin", "doubleneck", "ukulele"];
// the character as the puppet should draw it: the hard hat replaces any hat, the strap and Rust Bucket bring a guitar
function puppetCfg(cfg, wear){
  const c = Object.assign({}, cfg);
  if(wear.hat) c.acc = "none";
  // the tray's Rust Row gear replaces the same thing worn from the editor, so it never doubles up
  if((wear.mask || wear.goggles) && ["gasmask", "goggles"].includes(c.eyewear)) c.eyewear = "none";
  if(wear.vest && c.top === "hivis") c.top = "tee";
  if(wear.strap && c.extra === "biostrap") c.extra = "none";
  if((wear.strap || wear.rust) && !GUITARS.includes(c.gear)) c.gear = "guitar";
  if(wear.rust){ c.gear = "guitar"; c.gearColor = "#b5562c"; }
  return c;
}
function rig(cfg, wear){
  const key = JSON.stringify(cfg) + JSON.stringify(wear || {});
  if(key !== PZkey){
    PZkey = key; PZ = PlayerArt.puppet(puppetCfg(cfg, wear || {}));
    const g = PZ.g, leg = (PZ.FEET - PZ.hipY) / 2 * S;
    LEN = { torso: (PZ.hipY - g.tTop - 16) * S, neck: (PZ.hipY - g.tTop) * S, hc: (g.tTop - g.hy) * S, head: g.hrx * S,
      ua: g.arm * .52 * S, fa: g.arm * .52 * S, th: leg, sh: leg, sole: 24 * S, w: g.tW * S };
  }
  return PZ;
}
const CO = 18;   // centre of the body, above the hip
// ar stretches the arms (cartoon rubber-hose), so hands can reach past the big head when hanging
// brot / bflip: a skateboard's tilt and kickflip turn (or any ridden thing's), smoothed with the rest of the pose
const KEYS = ["t", "hd", "sB", "eB", "sF", "eF", "hB", "kB", "hF", "kF", "rot", "sq", "spark", "ar", "brot", "bflip"];
const BASE = { t: 0, hd: 0, sB: -6, eB: 14, sF: 6, eF: 14, hB: -4, kB: -2, hF: 4, kF: -2, rot: 0, sq: 1, spark: 0, ar: 1, brot: 0, bflip: 0 };
/* Things the character rides or carries, filled in by the levels. VEH[kind](p, J, st) returns { under, over }: SVG in the rider's
   own frame (hip at 0,0, before the body's spin), drawn under and over the rider. PROPS[kind](st) is drawn beside a character
   standing facing you (a skateboard leaning on their leg...). */
const VEH = {}, PROPS = {};
const P = (o, extra) => Object.assign({}, BASE, o, extra || {});
const lim = (a, l) => [Math.sin(a * R) * l, Math.cos(a * R) * l];
const up = (a, l) => [Math.sin(a * R) * l, -Math.cos(a * R) * l];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const rotV = (v, r) => [v[0] * cos(r) - v[1] * sin(r), v[0] * sin(r) + v[1] * cos(r)];

function joints(p){
  const sh = up(p.t, LEN.torso), nk = up(p.t, LEN.neck);
  const ar = p.ar || 1, arm = (s, e) => { const el = add(sh, lim(s, LEN.ua * ar)); return [sh, el, add(el, lim(s + e, LEN.fa * ar))]; };
  const leg = (h, k) => { const kn = lim(h, LEN.th); return [[0, 0], kn, add(kn, lim(h + k, LEN.sh))]; };
  const hc = add(nk, up(p.t + p.hd, LEN.hc));
  return { sh, nk, hc, aB: arm(p.sB, p.eB), aF: arm(p.sF, p.eF), lB: leg(p.hB, p.kB), lF: leg(p.hF, p.kF) };
}
// lowest foot below the hip, once the body is rotated (the sole sits below the ankle)
function lowest(p){ const J = joints(p); return Math.max(rotV(J.lB[2], p.rot)[1], rotV(J.lF[2], p.rot)[1]) + LEN.sole; }
// lowest point of the whole body below the centre (for rolls, where the back touches the ground)
function lowestAll(p){
  const J = joints(p), pts = [J.lB[1], J.lB[2], J.lF[1], J.lF[2], J.aB[2], J.aF[2], J.aB[1], J.sh, [0, 8]];
  let m = -1e9; pts.forEach(q => { m = Math.max(m, rotV([q[0], q[1] + CO], p.rot)[1]); });
  m = Math.max(m, rotV([J.hc[0], J.hc[1] + CO], p.rot)[1] + LEN.head);
  return m + 3;
}
const plantCY = (p, g) => g - lowest(p) - CO * cos(p.rot);
const rollCY = (p, g) => g - lowestAll(p);
function centreFor(p, local, wx, wy){ const v = rotV([0 - local[0], -CO - local[1]], p.rot); return [wx + v[0], wy + v[1]]; }
const hipOf = (cx, cy, rot) => [cx - CO * sin(rot), cy + CO * cos(rot)];

const pl = (pts, col, w, extra) => `<path d="M${pts.map(q => f1(q[0]) + " " + f1(q[1])).join(" L")}" fill="none" stroke="${col}" stroke-width="${f1(w)}" stroke-linecap="round" stroke-linejoin="round"${extra || ""}/>`;
const OL = 9 * S;          // a limb's outline, both sides together (the house tube)
const tubeW = (pts, col, w) => pl(pts, INK, w + OL) + pl(pts, col, w);

/* ---- Rust Row gear, drawn over the character's own head (page units, head centre at 200, g.hy) ---- */
function headGear(g, wear, side){
  const hx = g.hrx, oy = g.oy, sw = w => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  const xs = side ? [200 + hx * 0.016, 200 + hx * 0.584] : null;     // where the turned eyes are
  let s = "";
  if(wear.goggles){
    s += side ? `<path d="M${200 - hx * 1.04} ${oy - hx * 0.5} Q200 ${oy - hx * 0.68} ${200 + hx * 1.02} ${oy - hx * 0.56}" fill="none" stroke="${INK}" stroke-width="${hx * 0.2}"/><path d="M${200 - hx * 1.04} ${oy - hx * 0.5} Q200 ${oy - hx * 0.68} ${200 + hx * 1.02} ${oy - hx * 0.56}" fill="none" stroke="#3a3a3d" stroke-width="${hx * 0.12}"/>`
        + xs.map(x => `<circle cx="${x}" cy="${oy - hx * 0.6}" r="${hx * 0.22}" fill="#3fbfa8" ${sw(5)}/><circle cx="${x - hx * 0.07}" cy="${oy - hx * 0.67}" r="${hx * 0.06}" fill="#dffff8"/>`).join("")
      : `<path d="M${200 - hx * 1.04} ${oy - hx * 0.56} Q200 ${oy - hx * 0.74} ${200 + hx * 1.04} ${oy - hx * 0.56}" fill="none" stroke="${INK}" stroke-width="${hx * 0.2}"/><path d="M${200 - hx * 1.04} ${oy - hx * 0.56} Q200 ${oy - hx * 0.74} ${200 + hx * 1.04} ${oy - hx * 0.56}" fill="none" stroke="#3a3a3d" stroke-width="${hx * 0.12}"/>`;
  }
  if(wear.mask){
    s += side ? `<path d="M${200 - hx * 1.02} ${oy + hx * 0.1} L${200 + hx * 0.2} ${oy + hx * 0.4}" stroke="${INK}" stroke-width="${hx * 0.16}" stroke-linecap="round"/><path d="M${200 - hx * 1.02} ${oy + hx * 0.1} L${200 + hx * 0.2} ${oy + hx * 0.4}" stroke="#3a3a3d" stroke-width="${hx * 0.09}" stroke-linecap="round"/>`
        + xs.map(x => `<circle cx="${x}" cy="${oy}" r="${hx * 0.27}" fill="#d2ffe6" fill-opacity=".28" ${sw(6)}/>`).join("")
        + `<ellipse cx="${200 + hx * 0.36}" cy="${oy + hx * 0.52}" rx="${hx * 0.36}" ry="${hx * 0.28}" fill="#6c7480" ${sw(6)}/>`
        + `<rect x="${200 + hx * 0.56}" y="${oy + hx * 0.42}" width="${hx * 0.36}" height="${hx * 0.32}" rx="${hx * 0.08}" fill="#8a9a4f" ${sw(5)}/><path d="M${200 + hx * 0.68} ${oy + hx * 0.47} v${hx * 0.22} M${200 + hx * 0.8} ${oy + hx * 0.47} v${hx * 0.22}" stroke="${INK}" stroke-width="3"/>`
      : `<path d="M${200 - hx * 1.02} ${oy + hx * 0.12} Q200 ${oy + hx * 0.02} ${200 + hx * 1.02} ${oy + hx * 0.12}" fill="none" stroke="${INK}" stroke-width="${hx * 0.16}"/><path d="M${200 - hx * 1.02} ${oy + hx * 0.12} Q200 ${oy + hx * 0.02} ${200 + hx * 1.02} ${oy + hx * 0.12}" fill="none" stroke="#3a3a3d" stroke-width="${hx * 0.09}"/>`;
  }
  if(wear.hat){
    const b = oy - hx * 0.22, dome = `M${200 - hx * 1.14} ${b} C${200 - hx * 1.2} ${oy - hx * 1.78} ${200 + hx * 1.2} ${oy - hx * 1.78} ${200 + hx * 1.14} ${b} Z`;
    const brim = side ? `M${200 - hx * 1.22} ${b} L${200 + hx * 1.5} ${b - hx * 0.04}` : `M${200 - hx * 1.3} ${b} L${200 + hx * 1.3} ${b}`;
    s += `<path d="${dome}" fill="#ffc42b" ${sw(6)}/><path d="M${200 - hx * 0.5} ${oy - hx * 1.1} Q${200 - hx * 0.2} ${oy - hx * 1.2} ${200 + hx * 0.1} ${oy - hx * 1.22}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="7" stroke-linecap="round"/><path d="M200 ${oy - hx * 1.3} V${b}" fill="none" stroke="${INK}" stroke-opacity=".35" stroke-width="5"/>`
      + `<path d="${brim}" stroke="${INK}" stroke-width="${hx * 0.22}" stroke-linecap="round"/><path d="${brim}" stroke="#ffc42b" stroke-width="${hx * 0.12}" stroke-linecap="round"/>`;
  }
  return s;
}
// the hi-vis vest and the biohazard strap, over the character's own top (page units)
function bodyGear(g, wear){
  const x0 = 200 - g.tW / 2, x1 = 200 + g.tW / 2, tB = g.tTop + g.tH, r = g.tW * 0.26;
  let s = "";
  if(wear.vest){
    const rr = `M${x0 + r} ${g.tTop} H${x1 - r} Q${x1} ${g.tTop} ${x1} ${g.tTop + r} V${tB - r} Q${x1} ${tB} ${x1 - r} ${tB} H${x0 + r} Q${x0} ${tB} ${x0} ${tB - r} V${g.tTop + r} Q${x0} ${g.tTop} ${x0 + r} ${g.tTop}Z`;
    s += `<path d="${rr}" fill="#ff8a1c" stroke="${INK}" stroke-width="6"/>` + [0.36, 0.68].map(k => `<path d="M${x0 + 3} ${g.tTop + g.tH * k} H${x1 - 3}" stroke="#e8e8e8" stroke-width="${g.tH * 0.11}"/>`).join("")
      + `<path d="M200 ${g.tTop + 4} V${tB - 4}" stroke="${INK}" stroke-opacity=".4" stroke-width="3"/>`;
  }
  if(wear.strap){
    const d = `M${x1 - 8} ${g.tTop + 2} L${x0 + 6} ${tB - 6}`;
    s += `<path d="${d}" stroke="${INK}" stroke-width="16" stroke-linecap="round"/><path d="${d}" stroke="#ffc42b" stroke-width="9" stroke-linecap="round"/><path d="${d}" stroke="${INK}" stroke-width="9" stroke-dasharray="6 7"/>`
      + `<circle cx="200" cy="${g.tTop + g.tH * 0.5}" r="11" fill="#ffc42b" stroke="${INK}" stroke-width="3.5"/><text x="200" y="${g.tTop + g.tH * 0.5 + 6}" font-size="17" text-anchor="middle" fill="${INK}">☣</text>`;
  }
  return s;
}

/* ---- an arm or a leg, built from the character's own sleeves, hands, trousers and shoes ---- */
function armSVG(Z, a, angle, kind, wear, far){
  const sl = Z.sleeve, AW = 12 * S, SW = (13 + (sl.puffy ? 7 : 0)) * S, col = Z.col, cuff = sl.cuffC || shade(col, 0.82);
  const handC = wear.gloves || Z.glove ? "#4a4a4f" : Z.skin;
  let s = pl(a, INK, AW + OL);
  const sleevePts = sl.none ? null : sl.long ? [a[0], a[1], mix(a[1], a[2], 0.72)] : [a[0], mix(a[0], a[1], 0.75)];
  if(sleevePts) s += pl(sleevePts, INK, SW + OL);
  s += pl(a, Z.skin, AW);
  if(sleevePts){
    s += pl(sleevePts, col, SW);
    if(sl.long) s += pl([mix(a[1], a[2], 0.55), mix(a[1], a[2], 0.72)], cuff, SW);
    if(sl.stripe) s += pl(sleevePts, "#fff", 3.4 * S);
  }
  if(Z.band) s += tubeW([mix(a[1], a[2], 0.74), mix(a[1], a[2], 0.86)], Z.band, SW + 3 * S);
  // the hand, turned to point along the forearm (fingers up = -y in hand space)
  const g = Z.g;
  s += `<g transform="translate(${f1(a[2][0])} ${f1(a[2][1])}) rotate(${f1(180 - angle)}) scale(${far ? -S : S} ${S}) translate(0 ${f1(-12 * g.hand)})">${Z.hand(kind, handC)}</g>`;
  return s;
}
function legSVG(Z, l, h, k){
  const skirt = ["skirt", "pleated", "tutu"].includes(Z.bottom), shorts = Z.bottom === "shorts";
  const LW = (Z.legW || 15) * S;
  let s = pl(l, INK, LW + OL) + pl(l, skirt || shorts ? Z.skin : Z.pants, LW);
  if(shorts) s += pl([l[0], mix(l[0], l[1], 0.8)], INK, LW + OL) + pl([l[0], mix(l[0], l[1], 0.8)], Z.pants, LW);
  if(Z.knees) s += `<ellipse cx="${f1(l[1][0] + 2)}" cy="${f1(l[1][1])}" rx="${f1(LW * .62)}" ry="${f1(LW * .55)}" fill="${Z.knees}" stroke="${INK}" stroke-width="2.5"/>`;
  s += `<g transform="translate(${f1(l[2][0])} ${f1(l[2][1])}) rotate(${f1(-(h + k))}) scale(${S})">${Z.shoe(false)}</g>`;
  return s;
}
const handKind = (p, angle, moving) => angle > 100 ? "open" : moving ? "fist" : "rest";

function sideSVG(p, cfg, wear, id){
  const Z = rig(cfg, wear), J = joints(p), g = Z.g;
  const moving = Math.abs(p.t) > 8 || Math.abs(p.hF - p.hB) > 20;
  const torsoT = `rotate(${f1(p.t)}) scale(${f1(S * SIDE_SQ * 1000) / 1000} ${S}) translate(-200 ${-Z.hipY})`;
  const headT = `rotate(${f1(p.t)}) translate(0 ${f1(-LEN.neck)}) rotate(${f1(p.hd)}) scale(${S}) translate(-200 ${-g.tTop})`;
  const far = x => `<g filter="url(#pzDim)">${x}</g>`;
  let s = "";
  if(Z.extraBack) s += `<g transform="${torsoT}">${Z.extraBack}</g>`;
  s += far(legSVG(Z, J.lB, p.hB, p.kB) + armSVG(Z, J.aB, p.sB + p.eB, handKind(p, p.sB + p.eB, moving), wear, true));
  if(Z.slung) s += `<g transform="rotate(${f1(p.t)}) scale(${S}) translate(${f1(-200 - g.tW * 0.3)} ${f1(-Z.hipY - g.tH * 0.42)})">${Z.slung}</g>`;
  if(Z.hairBack) s += `<g transform="${headT}"><g transform="translate(${f1(200 - g.hrx * 0.3)} 0) scale(.8 1) translate(-200 0)">${Z.hairBack}</g></g>`;
  s += legSVG(Z, J.lF, p.hF, p.kF);
  s += `<g transform="${torsoT}">${Z.torso}${bodyGear(g, wear)}${Z.extraMid}</g>`;
  s += `<g transform="${headT}">${Z.headSide}${headGear(g, wear, true)}</g>`;
  s += armSVG(Z, J.aF, p.sF + p.eF, handKind(p, p.sF + p.eF, moving), wear, false);
  return s;
}

/* ---- the back view (ladders, and walking away into the world) ---- */
function ik(a, b, l1, l2, out){
  let dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy); d = clamp(d, 1, l1 + l2 - .5);
  const base = Math.atan2(dy, dx), ang = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  const j1 = [a[0] + l1 * Math.cos(base + ang), a[1] + l1 * Math.sin(base + ang)], j2 = [a[0] + l1 * Math.cos(base - ang), a[1] + l1 * Math.sin(base - ang)];
  return (j1[0] - a[0]) * out > (j2[0] - a[0]) * out ? j1 : j2;
}
function backSVG(st, cfg, wear, id){
  const Z = rig(cfg, wear), g = Z.g, page = `scale(${S}) translate(-200 ${-Z.hipY})`;
  const skirt = ["skirt", "pleated", "tutu"].includes(Z.bottom), shorts = Z.bottom === "shorts", LW = (Z.legW || 15) * S;
  let s = "";
  if(Z.extraBack && /pa-cape/.test(Z.extraBack)) s += `<g transform="${page}">${Z.extraBack}</g>`;
  [-1, 1].forEach((sd, i) => {
    const root = [sd * g.tW * 0.2 * S, 0], foot = st.f[i], knee = ik(root, foot, LEN.th, LEN.sh, sd), l = [root, knee, foot];
    s += pl(l, INK, LW + OL) + pl(l, skirt || shorts ? Z.skin : Z.pants, LW);
    if(shorts) s += pl([root, mix(root, knee, 0.8)], INK, LW + OL) + pl([root, mix(root, knee, 0.8)], Z.pants, LW);
    if(Z.knees) s += `<ellipse cx="${f1(knee[0])}" cy="${f1(knee[1])}" rx="${f1(LW * .6)}" ry="${f1(LW * .55)}" fill="${Z.knees}" stroke="${INK}" stroke-width="2.5"/>`;
    s += `<g transform="translate(${f1(foot[0])} ${f1(foot[1])}) scale(${S * 0.86})">${Z.shoe(sd < 0)}</g>`;
  });
  s += `<g transform="${page}">${Z.torsoBack}${bodyGear(g, Object.assign({}, wear, { strap: false }))}${Z.extraMid}${Z.hairBack}${Z.extraBack && !/pa-cape/.test(Z.extraBack) ? Z.extraBack : ""}${Z.slung}</g>`;
  if(wear.strap) s += `<g transform="${page}"><path d="M${200 + g.tW * 0.42} ${g.tTop + 4} L${200 - g.tW * 0.46} ${g.tTop + g.tH - 8}" stroke="#ffc42b" stroke-width="6" stroke-linecap="round"/><path d="M${200 + g.tW * 0.42} ${g.tTop + 4} L${200 - g.tW * 0.46} ${g.tTop + g.tH - 8}" stroke="${INK}" stroke-width="6" stroke-dasharray="5 6"/></g>`;
  s += `<g transform="${page}">${Z.headBack}${headGear(g, wear, false)}</g>`;
  const handC = wear.gloves || Z.glove ? "#4a4a4f" : Z.skin;
  [-1, 1].forEach((sd, i) => {
    const root = [sd * (g.tW / 2 - 6) * S, -LEN.torso], hand = st.h[i], el = ik(root, hand, LEN.ua, LEN.fa, sd), a = [root, el, hand];
    const ang = Math.atan2(hand[0] - el[0], hand[1] - el[1]) / R;      // the forearm's direction, limb convention
    s += armSVG(Z, a, ang, st.climb ? "fist" : "rest", wear, sd < 0);
  });
  return s;
}

/* ---- the front: the same house art the other games use ---- */
const frontCache = new Map();
function frontSVG(cfg, pose){
  const key = pose + JSON.stringify(cfg);
  if(!frontCache.has(key)){
    let s = window.PlayerArt ? PlayerArt.svg(cfg, "full", pose) : "<svg/>";
    s = s.replace(/viewBox="[^"]*"/, 'viewBox="0 0 400 400" width="400" height="400"');
    frontCache.set(key, s);
  }
  return frontCache.get(key);
}

/* =====================================================================
   MOVES: each move is a few key poses. Positions and poses are smoothed
   through the keys (Catmull-Rom), so a move is a short list, not frames.
   ===================================================================== */
const CR = (a, b, c, d, s) => .5 * (2 * b + (-a + c) * s + (2 * a - 5 * b + 4 * c - d) * s * s + (-a + 3 * b - 3 * c + d) * s * s * s);
function runPose(ph, a){
  a = a === undefined ? 1 : a;
  const s = Math.sin(ph), c = Math.cos(ph), s2 = -s, c2 = -c;
  return P({ t: 15 * a, hd: -10 * a, hF: 36 * s * a, kF: (-10 - 78 * Math.max(0, c)) * a, hB: 36 * s2 * a, kB: (-10 - 78 * Math.max(0, c2)) * a,
    sF: -50 * s * a + 6, eF: 78 * a + 12, sB: 50 * s * a - 6, eB: 78 * a + 12 });
}
const STRIDE = 13;   // world px per radian of run cycle
const RUNAT = x => runPose(x / STRIDE);
const STAND = P({});
const CROUCH = P({ t: 30, hd: -16, sB: -58, eB: 38, sF: -46, eF: 36, hB: 62, kB: -114, hF: 58, kF: -110, sq: .94 });
const LAUNCH = P({ t: 10, hd: -24, ar: 1.3, sB: 152, eB: 14, sF: 166, eF: 10, hB: -12, kB: -26, hF: 34, kF: -72 });
const REACHUP = P({ t: 8, hd: -34, ar: 1.6, sB: 160, eB: 6, sF: 166, eF: 4, hB: -16, kB: -34, hF: 30, kF: -70 });
const TUCK = P({ t: 40, hd: 20, sB: 56, eB: 96, sF: 66, eF: 92, hB: 118, kB: -146, hF: 124, kF: -148 });
const LEAP = P({ t: 18, hd: -8, sB: -72, eB: 42, sF: 132, eF: 26, hB: -38, kB: -72, hF: 84, kF: -28 });
const REACH = P({ t: 10, hd: -4, sB: 96, eB: 22, sF: 112, eF: 20, hB: 30, kB: -40, hF: 44, kF: -30 });
const LANDC = P({ t: 32, hd: -10, sB: 38, eB: 42, sF: 62, eF: 40, hB: 60, kB: -116, hF: 66, kF: -110, sq: .86 });

// a move from keyframes: { u (0..1), p (pose), x (centre x), y (centre y) or g (ground to stand on) or roll (ground to roll on) }
// tag: extra fields for every state of the move, e.g. { veh: "board" } for a move done on a skateboard
function kf(frames, dur, fx, tag){
  frames.forEach(f => { f.P = P(f.p); if(f.y === undefined) f.y = f.roll !== undefined ? rollCY(f.P, f.roll) : plantCY(f.P, f.g); });
  const n = frames.length;
  return { dur, fx: fx || [], end: { x: frames[n - 1].x }, at(u){
    let i = 0; while(i < n - 2 && u > frames[i + 1].u) i++;
    const a = frames[Math.max(0, i - 1)], b = frames[i], c = frames[i + 1], d = frames[Math.min(n - 1, i + 2)];
    const s = clamp((u - b.u) / (c.u - b.u), 0, 1), p = {};
    KEYS.forEach(k => { p[k] = CR(a.P[k], b.P[k], c.P[k], d.P[k], s); });
    return Object.assign({ m: "side", cx: CR(a.x, b.x, c.x, d.x, s), cy: CR(a.y, b.y, c.y, d.y, s), p }, tag);
  } };
}
function run(x0, x1, g, o){
  o = o || {};
  const V = 280;
  return { dur: Math.abs(x1 - x0) / V, fx: [], at(u){
    const x = lerp(x0, x1, u), a = o.start ? Math.min(1, .25 + (x - x0) / 45) : 1, p = runPose(x / STRIDE, a);
    return { m: "side", cx: x, cy: plantCY(p, g), p };
  } };
}
function stop(x0, g){
  return kf([{ u: 0, p: RUNAT(x0), x: x0, g }, { u: .45, p: P({ t: -8, hd: 4, sB: 24, eB: 30, sF: 38, eF: 30, hB: -16, kB: -30, hF: 32, kF: -10 }), x: x0 + 18, g }, { u: 1, p: STAND, x: x0 + 24, g }], .42, [{ u: .3, k: "skid" }]);
}
// the arc between a launch point and a landing point, with optional flips (+ = front flip, − = back flip)
function arcKeys(xa, ya, xb, yb, apex, flips, u0, u1, rot0){
  const out = [], uas = flips ? [.25, .5, .75] : [.33, .66], A = apex + Math.abs(ya - yb) / 2;
  uas.forEach(ua => {
    const rot = rot0 + 360 * flips * (ua < .5 ? 2 * ua * ua : 1 - 2 * (1 - ua) * (1 - ua)) * .96;
    out.push({ u: lerp(u0, u1, ua), p: flips ? P(TUCK, { rot }) : LEAP, x: lerp(xa, xb, ua), y: lerp(ya, yb, ua) - 4 * A * ua * (1 - ua) });
  });
  return out;
}
function jump(x0, g0, x1, g1, o){
  o = o || {};
  const fl = o.flips || 0, rotEnd = 360 * fl, xa = x0 + 22, xb = x1 - 8, ya = plantCY(LAUNCH, g0) - 10, yb = plantCY(REACH, g1);
  const frames = [
    { u: 0, p: o.fromStand ? STAND : RUNAT(x0), x: x0, g: g0 },
    { u: .12, p: CROUCH, x: x0 + 10, g: g0 },
    { u: .22, p: LAUNCH, x: xa, y: ya },
    ...arcKeys(xa, ya, xb, yb, o.apex === undefined ? 50 : o.apex, fl, .22, .78, 0),
    { u: .78, p: P(REACH, { rot: rotEnd }), x: xb, y: yb },
    { u: .89, p: P(LANDC, { rot: rotEnd }), x: x1, g: g1 },
    { u: 1, p: o.stand ? P(STAND, { rot: rotEnd }) : P(RUNAT(x1 + 14), { rot: rotEnd }), x: x1 + 14, g: g1 }];
  return kf(frames, .62 + Math.hypot(x1 - x0, g1 - g0) / 700 + Math.abs(fl) * .14, [{ u: .2, k: "dust" }, { u: .8, k: "dust" }]);
}
function backflip(x, g){
  const ya = plantCY(REACHUP, g) - 14, frames = [
    { u: 0, p: STAND, x, g }, { u: .16, p: CROUCH, x: x + 2, g }, { u: .28, p: REACHUP, x: x - 4, y: ya },
    { u: .42, p: P(TUCK, { rot: -110 }), x: x - 12, y: ya - 70 }, { u: .54, p: P(TUCK, { rot: -220 }), x: x - 18, y: ya - 64 },
    { u: .66, p: P(TUCK, { rot: -320 }), x: x - 22, y: ya - 24 }, { u: .74, p: P(REACH, { rot: -360 }), x: x - 24, y: plantCY(REACH, g) },
    { u: .84, p: P(LANDC, { rot: -360 }), x: x - 24, g }, { u: 1, p: P(STAND, { rot: -360, sB: 150, sF: 158, eB: 10, eF: 10, ar: 1.5, hd: -14 }), x: x - 24, g }];
  return kf(frames, 1.5, [{ u: .26, k: "dust" }, { u: .76, k: "dust" }]);
}
// kong vault: dive, both hands on the obstacle, knees tucked through
function kong(x0, g, ox, oy, ow){
  const DIVE = P({ t: 38, hd: -16, sB: 112, eB: 10, sF: 122, eF: 8, hB: -28, kB: -42, hF: 30, kF: -84 });
  const PLANT = P({ t: 72, hd: -32, ar: 1.3, sB: 10, eB: 0, sF: 16, eF: 0, hB: -48, kB: -34, hF: -38, kF: -52 });
  const THRU = P({ t: 44, hd: -10, sB: -36, eB: 10, sF: -30, eF: 10, hB: 100, kB: -140, hF: 106, kF: -138 });
  const EXT = P({ t: 20, hd: -6, sB: 70, eB: 20, sF: 84, eF: 20, hB: 28, kB: -32, hF: 46, kF: -24 });
  const pc = centreFor(PLANT, joints(PLANT).aF[2], ox + ow * .42, oy);
  const end = ox + ow + 62;
  return kf([
    { u: 0, p: RUNAT(x0), x: x0, g },
    { u: .2, p: DIVE, x: ox - 44, y: plantCY(DIVE, g) - 16 },
    { u: .42, p: PLANT, x: pc[0], y: pc[1] },
    { u: .6, p: THRU, x: ox + ow * .78, y: plantCY(THRU, oy - 5) },
    { u: .78, p: EXT, x: ox + ow + 28, y: (oy + g) / 2 - 52 },
    { u: .89, p: LANDC, x: ox + ow + 44, g },
    { u: 1, p: RUNAT(end), x: end, g }], .86, [{ u: .42, k: "tap" }, { u: .89, k: "dust" }]);
}
// slide under something low, sparks off the metal
function slide(x0, g, x1){
  const DROP = P({ t: -18, hd: -24, sB: -22, eB: 22, sF: 42, eF: 30, hB: 30, kB: -92, hF: 70, kF: -22 });
  const SL = P({ t: -56, hd: -30, sB: -78, eB: -8, sF: 62, eF: 40, hB: 10, kB: -126, hF: 84, kF: -2, spark: 1 });
  const UP = P({ t: 22, hd: -6, sB: 62, eB: 40, sF: -30, eF: 40, hB: 82, kB: -122, hF: -10, kF: -62 });
  return kf([
    { u: 0, p: RUNAT(x0), x: x0, g }, { u: .14, p: DROP, x: x0 + 34, g }, { u: .24, p: SL, x: x0 + 72, g },
    { u: .74, p: SL, x: x1 - 46, g }, { u: .87, p: UP, x: x1 - 16, g }, { u: 1, p: RUNAT(x1), x: x1, g }],
    .45 + (x1 - x0) / 380, [{ u: .2, k: "dust" }]);
}
// leap to a bar, swing, let go into a back-flip flyaway
function barSwing(x0, g0, bx, by, x1, g1){
  const HANG = P({ t: 0, hd: -46, ar: 1.95, sB: 162, eB: 0, sF: 166, eF: 0, hB: -20, kB: -36, hF: -8, kF: -24 });
  const PIKE = P(HANG, { hB: 58, kB: -8, hF: 66, kF: -4, hd: -36 });
  const ARCH = P(HANG, { t: -8, hd: -50, hB: -36, kB: -52, hF: -26, kF: -42 });
  const hang = (u, pose, r) => { const p = P(pose, { rot: r }), c = centreFor(p, joints(p).aF[2], bx, by); return { u, p, x: c[0], y: c[1] }; };
  const rel = hang(.76, TUCK, -150);
  const xb = x1 - 8, yb = plantCY(REACH, g1);
  return kf([
    { u: 0, p: RUNAT(x0), x: x0, g: g0 }, { u: .07, p: CROUCH, x: x0 + 10, g: g0 },
    { u: .15, p: REACHUP, x: lerp(x0, bx, .45), y: plantCY(REACHUP, g0) - 30 },
    hang(.25, HANG, -22), hang(.37, ARCH, 36), hang(.5, PIKE, -58), hang(.61, ARCH, 32), hang(.72, PIKE, -108), rel,
    { u: .82, p: P(TUCK, { rot: -235 }), x: lerp(rel.x, xb, .45), y: Math.min(rel.y, yb) - 46 },
    { u: .88, p: P(TUCK, { rot: -315 }), x: lerp(rel.x, xb, .8), y: lerp(rel.y, yb, .7) - 20 },
    { u: .93, p: P(REACH, { rot: -360 }), x: xb, y: yb },
    { u: .97, p: P(LANDC, { rot: -360 }), x: x1, g: g1 },
    { u: 1, p: P(STAND, { rot: -360 }), x: x1 + 8, g: g1 }], 2.3, [{ u: .25, k: "clang" }, { u: .76, k: "whoosh" }, { u: .93, k: "dust" }]);
}
// jump at a wall, catch the ledge, hang, pull up, knee over, stand
function ledge(x0, g0, wx, ly){
  const HANGW = P({ t: -8, hd: -40, ar: 1.9, sB: 146, eB: 4, sF: 150, eF: 2, hB: 14, kB: -52, hF: 26, kF: -64 });
  const PULL = P({ t: 20, hd: -22, ar: 1.25, sB: 40, eB: -80, sF: 46, eF: -86, hB: 20, kB: -62, hF: 44, kF: -92 });
  const MANT = P({ t: 44, hd: -14, sB: 8, eB: -6, sF: 14, eF: -8, hB: 102, kB: -150, hF: -12, kF: -56 });
  const at = (u, pose, hx, dy) => { const c = centreFor(pose, joints(pose).aF[2], hx, ly); return { u, p: pose, x: c[0], y: c[1] + (dy || 0) }; };
  const h1 = at(.34, HANGW, wx + 1);
  return kf([
    { u: 0, p: RUNAT(x0), x: x0, g: g0 }, { u: .1, p: CROUCH, x: x0 + 10, g: g0 },
    { u: .22, p: REACHUP, x: lerp(x0, h1.x, .7), y: h1.y + 8 },
    h1, at(.46, HANGW, wx + 1, 4), at(.62, PULL, wx + 3), at(.76, MANT, wx + 12),
    { u: .88, p: CROUCH, x: wx + 26, g: ly }, { u: 1, p: STAND, x: wx + 36, g: ly }], 1.65, [{ u: .34, k: "grab" }, { u: .88, k: "dust" }]);
}
// run off an edge, front flip, land and roll it out
function dropRoll(x0, g0, x1, g1){
  const xa = x0 + 22, ya = plantCY(LAUNCH, g0) - 10, xb = x1 - 6, yb = plantCY(REACH, g1);
  const T = n => P(TUCK, { rot: n });
  return kf([
    { u: 0, p: RUNAT(x0), x: x0, g: g0 }, { u: .09, p: CROUCH, x: x0 + 8, g: g0 }, { u: .17, p: LAUNCH, x: xa, y: ya },
    ...arcKeys(xa, ya, xb, yb, 60, 1, .17, .5, 0),
    { u: .5, p: P(REACH, { rot: 360 }), x: xb, y: yb }, { u: .56, p: P(LANDC, { rot: 360 }), x: x1 + 6, g: g1 },
    { u: .65, p: T(470), x: x1 + 36, roll: g1 }, { u: .73, p: T(580), x: x1 + 62, roll: g1 }, { u: .81, p: T(690), x: x1 + 88, roll: g1 },
    { u: .9, p: P(CROUCH, { rot: 720 }), x: x1 + 106, g: g1 }, { u: 1, p: P(RUNAT(x1 + 124), { rot: 720 }), x: x1 + 124, g: g1 }],
    1.55, [{ u: .5, k: "dust" }, { u: .6, k: "dust" }, { u: .9, k: "dust" }]);
}
// climbing a ladder, seen from behind
function ladder(x, gB, gT){
  const dist = gB - gT;
  return { dur: dist / 120 + .2, fx: [], at(u){
    const e = u < .1 ? u * u * 5 : u > .9 ? 1 - (1 - u) * (1 - u) * 5 : u - .05;
    return { m: "back", cx: x, fy: lerp(gB, gT, clamp(e / .95, 0, 1)), q: (gB - lerp(gB, gT, clamp(e / .95, 0, 1))) / 30 * Math.PI };
  } };
}
function backPose(q, climbing){
  const L = LEN.th + LEN.sh, hx = LEN.w * 0.2;
  if(!climbing){ const hy = -LEN.torso + (LEN.ua + LEN.fa) * .94; return { hipUp: L + LEN.sole, f: [[-hx, L], [hx, L]], h: [[-(LEN.w / 2 + 9), hy], [LEN.w / 2 + 9, hy]] }; }
  const s = Math.sin(q), y = -LEN.neck - 6;
  return { hipUp: L + LEN.sole, climb: true, f: [[-hx, L - 11 * Math.max(0, -s)], [hx, L - 11 * Math.max(0, s)]], h: [[-LEN.head * 0.76, y - 12 * s], [LEN.head * 0.76, y + 12 * s]] };
}
const hold = (st, dur) => ({ dur, fx: [], at: () => st });

/* ---- one sequence of moves, played in order ---- */
function seqOf(moves){
  let t = 0; const starts = moves.map(m => { const s = t; t += m.dur; return s; });
  return { moves, total: t, find(tt){
    let i = moves.length - 1; while(i > 0 && tt < starts[i]) i--;
    return { i, m: moves[i], u: clamp((tt - starts[i]) / moves[i].dur, 0, 1) };
  } };
}

/* =====================================================================
   A PLAYER: draws one character (with shadow, motion trail and dust)
   ===================================================================== */
class Actor{
  constructor(layer, fxLayer, id, ground){ this.layer = layer; this.fxl = fxLayer; this.id = id; this.ground = ground; this.parts = []; this.trail = []; this.turn = 1; this.mode = null; this.seq = null; this.t = 0; this.speed = 1; }
  play(moves, done){ this.seq = seqOf(moves); this.t = 0; this.fired = new Set(); this.done = done; }
  feet(st){ if(st.m !== "side") return st.fy; const h = hipOf(st.cx, st.cy, st.p.rot); return h[1] + lowest(st.p); }
  burst(k, x, y){
    if(RM && k !== "dust") return;
    const n = { dust: 7, skid: 5, tap: 4, grab: 3, clang: 6, whoosh: 0, spark: 2 }[k] || 0;
    for(let i = 0; i < n; i++){
      const spark = k === "spark" || k === "clang";
      this.parts.push({ k: spark ? "spark" : "dust", x: x + (Math.random() - .5) * 18, y: y - (spark ? 0 : 3), vx: (Math.random() - .5) * (spark ? 260 : 90) - (k === "spark" ? 140 : 0), vy: spark ? -80 - Math.random() * 160 : -10 - Math.random() * 40, life: 0, max: spark ? .4 + Math.random() * .3 : .5 + Math.random() * .4, r: 5 + Math.random() * 6 });
    }
  }
  tick(dt){
    if(this.seq){
      this.t += dt * this.speed;
      const T = this.seq.total, f = this.seq.find(Math.min(this.t, T));
      this.state = f.m.at(f.u);
      f.m.fx.forEach((e, j) => { const key = f.i + ":" + j; if(f.u >= e.u && !this.fired.has(key)){ this.fired.add(key);
        let x = this.state.cx, y = this.feet(this.state);
        if(e.k === "clang" || e.k === "grab" || e.k === "tap"){ const h = hipOf(this.state.cx, this.state.cy, this.state.p.rot), J = joints(this.state.p), hand = rotV(J.aF[2], this.state.p.rot); x = h[0] + hand[0]; y = h[1] + hand[1]; }
        this.burst(e.k, x, y); } });
      if(this.state.p && this.state.p.spark > .5 && Math.random() < .8) this.burst("spark", this.state.cx - 10, this.feet(this.state));
      if(this.t >= T){ const d = this.done; this.seq = null; this.done = null; if(d) d(); }
    }
    this.parts = this.parts.filter(p => { p.life += dt * this.speed; p.x += p.vx * dt * this.speed; p.y += p.vy * dt * this.speed; if(p.k === "spark") p.vy += 600 * dt * this.speed; else { p.vx *= .96; p.r += 18 * dt * this.speed; } return p.life < p.max; });
  }
  render(dt, cfg, wear){
    const st = this.state; if(!st) return;
    if(st.m !== this.mode){ if(this.mode) this.turn = 0; this.mode = st.m; }
    this.turn = Math.min(1, this.turn + dt * (this.speed || 1) / .2);
    const tsx = this.turn < 1 ? .15 + .85 * (1 - Math.pow(1 - this.turn, 3)) : 1;
    const feet = this.feet(st), gy = this.ground ? this.ground(st.cx, feet) : feet;
    const k = clamp(1 - (gy - feet) / 260, .35, 1);
    let s = `<ellipse cx="${f1(st.cx)}" cy="${f1(gy + 1)}" rx="${f1(30 * k)}" ry="${f1(6.5 * k)}" fill="#000" opacity="${f1(.32 * k * 100) / 100}"/>`;
    // a motion trail while flipping fast
    if(st.m === "side"){
      const last = this.trail[this.trail.length - 1];
      if(last && Math.abs(st.p.rot - last.p.rot) > 4 * this.speed && !RM) this.trail.push(st); else if(this.trail.length) this.trail.shift();
      if(!last) this.trail.push(st);
      while(this.trail.length > 4) this.trail.shift();
      this.trail.slice(0, -1).forEach((g, i) => { s += this.body(g, cfg, wear, this.id + "t" + i, 1, .12 + i * .07); });
    } else this.trail = [];
    s += this.body(st, cfg, wear, this.id, tsx, 1);
    this.layer.innerHTML = s;
    if(this.fxl) this.fxl.innerHTML = this.parts.map(p => p.k === "spark"
      ? `<line x1="${f1(p.x)}" y1="${f1(p.y)}" x2="${f1(p.x - p.vx * .03)}" y2="${f1(p.y - p.vy * .03)}" stroke="#ffd34d" stroke-width="3" stroke-linecap="round" opacity="${f1(1 - p.life / p.max)}"/>`
      : `<circle cx="${f1(p.x)}" cy="${f1(p.y)}" r="${f1(p.r)}" fill="#d9c8b4" stroke="${INK}" stroke-width="2" opacity="${f1((1 - p.life / p.max) * .8)}"/>`).join("");
  }
  body(st, cfg, wear, id, tsx, op){
    let inner = "";
    if(st.m === "side"){
      const h = hipOf(st.cx, st.cy, st.p.rot), sq = st.p.sq;
      const v = st.veh && VEH[st.veh] ? VEH[st.veh](st.p, joints(st.p), st) : {};
      inner = `<g transform="translate(${f1(h[0])} ${f1(h[1])}) rotate(${f1(st.p.rot)}) scale(${f1((2 - sq) * 100) / 100} ${f1(sq * 100) / 100})">${v.under || ""}${sideSVG(st.p, cfg, wear, id)}${v.over || ""}</g>`;
    } else if(st.m === "back"){
      const bp = backPose(st.q, st.climb !== false);
      inner = `<g transform="translate(${f1(st.cx)} ${f1(st.fy - bp.hipUp)})">${backSVG(bp, cfg, wear, id)}</g>`;
    } else {
      const Z = rig(cfg, wear), over = `<svg viewBox="0 0 400 400" width="400" height="400">${bodyGear(Z.g, Object.assign({}, wear, { strap: false }))}${headGear(Z.g, wear, false)}</svg>`;
      inner = (st.prop && PROPS[st.prop] ? PROPS[st.prop](st) : "") + `<g transform="translate(${f1(st.cx - 200 * S)} ${f1(st.fy - 370 * S)}) scale(${S})">${frontSVG(puppetCfg(cfg, wear), st.pose || "wave")}${over}</g>`;
    }
    const wrap = tsx < 1 ? `<g transform="translate(${f1(st.cx)} 0) scale(${f1(tsx * 100) / 100} 1) translate(${f1(-st.cx)} 0)">${inner}</g>` : inner;
    return op < 1 ? `<g opacity="${f1(op * 100) / 100}">${wrap}</g>` : wrap;
  }
}

/* ---- shared scenery helpers ---- */
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const box = (x, y, w, h, fill, ex) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${INK}" stroke-width="3" stroke-linejoin="round" ${ex || ""}/>`;
function smoke(cx, cy, col, n, rise, dur){
  let s = ""; n = n || 3; rise = rise || 140; dur = dur || 6;
  for(let i = 0; i < n; i++){ const b = (-i * dur / n).toFixed(2);
    s += `<circle cx="${cx}" cy="${cy}" r="8" fill="${col}"><animate attributeName="cy" values="${cy};${cy - rise}" dur="${dur}s" begin="${b}s" repeatCount="indefinite"/><animate attributeName="cx" values="${cx};${cx + 40}" dur="${dur}s" begin="${b}s" repeatCount="indefinite"/><animate attributeName="r" values="8;34" dur="${dur}s" begin="${b}s" repeatCount="indefinite"/><animate attributeName="opacity" values=".7;0" dur="${dur}s" begin="${b}s" repeatCount="indefinite"/></circle>`; }
  return s;
}
function defs(){
  return `<linearGradient id="gSky" gradientUnits="userSpaceOnUse" x1="0" y1="-1400" x2="0" y2="620"><stop offset="0" stop-color="#0f0a1c"/><stop offset=".55" stop-color="#2d1b4e"/><stop offset=".74" stop-color="#7a3a6a"/><stop offset=".88" stop-color="#e0705a"/><stop offset="1" stop-color="#ffc07a"/></linearGradient>
  <radialGradient id="gSun"><stop offset="0" stop-color="#fff1c9"/><stop offset=".45" stop-color="#ffd99a" stop-opacity=".9"/><stop offset="1" stop-color="#ff9a6a" stop-opacity="0"/></radialGradient>
  <radialGradient id="gToxic"><stop offset="0" stop-color="#9dff6a" stop-opacity=".9"/><stop offset="1" stop-color="#5dff3a" stop-opacity="0"/></radialGradient>
  <radialGradient id="gBoss"><stop offset="0" stop-color="#ff3b3b" stop-opacity=".55"/><stop offset="1" stop-color="#ff3b3b" stop-opacity="0"/></radialGradient>
  <radialGradient id="gLamp"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".55"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></radialGradient>
  <linearGradient id="hDone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a0"/><stop offset="1" stop-color="#f0a91c"/></linearGradient>
  <linearGradient id="hCur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bff7ef"/><stop offset="1" stop-color="#2fb3a3"/></linearGradient>
  <linearGradient id="hLock" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9aa3ad"/><stop offset="1" stop-color="#5d6670"/></linearGradient>
  <linearGradient id="hBoss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8a7a"/><stop offset="1" stop-color="#b8282a"/></linearGradient>
  <pattern id="haz" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="16" height="16" fill="#ffc42b"/><rect width="8" height="16" fill="${INK}"/></pattern>
  <pattern id="grille" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#2b2326"/><circle cx="6" cy="6" r="2.6" fill="#120d14"/></pattern>
  <pattern id="chain" width="14" height="14" patternUnits="userSpaceOnUse"><path d="M0 0 L14 14 M14 0 L0 14" stroke="#8d8a94" stroke-width="1.4"/></pattern>
  <pattern id="brick" width="32" height="16" patternUnits="userSpaceOnUse"><path d="M0 16 H32 M16 0 V8 M0 8 H32 M8 8 V16" stroke="#000" stroke-opacity=".18" stroke-width="2"/></pattern>
  <filter id="pzDim"><feComponentTransfer><feFuncR type="linear" slope=".78"/><feFuncG type="linear" slope=".78"/><feFuncB type="linear" slope=".82"/></feComponentTransfer></filter>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
}

/* =====================================================================
   RIDING: a board under the feet (skateboard, or a giant guitar pick).
   The board is drawn from the front foot (VEH.board), tilted by the pose's
   brot and flipped by bflip (a kickflip), so any move that bends the legs
   carries the board with it. BU = how far the deck lifts the feet.
   ===================================================================== */
const BU = 16;                // deck + wheels, in world units
const BOARDS = { board: { len: 66, deck: "#3a3a3d", under: "#e8433f", wheels: true }, pick: { len: 74, deck: "#ffc42b", under: "#ff8a1c", wheels: false } };
function boardSVG(kind, p, J, col){
  const B = BOARDS[kind] || BOARDS.board, fF = J.lF[2], cx = fF[0] - 16, cy = fF[1] + LEN.sole + 4, half = B.len / 2, fl = Math.cos((p.bflip || 0) * Math.PI * 2);
  const under = fl < 0, deckC = under ? (col || B.under) : B.deck;
  let s = `<g transform="translate(${f1(cx)} ${f1(cy)}) rotate(${f1(p.brot || 0)}) scale(1 ${f1(Math.max(.08, Math.abs(fl)) * 100) / 100})">`;
  if(kind === "pick") s += `<path d="M${-half} -3 Q${-half + 6} -9 0 -9 Q${half - 4} -9 ${half} -2 Q${half - 8} 7 0 8 Q${-half + 6} 7 ${-half} -3Z" fill="${deckC}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M${-half + 12} -4 H${half - 14}" stroke="#fff" stroke-opacity=".6" stroke-width="2.5" stroke-linecap="round"/>`;
  else {
    if(B.wheels && !under) s += `<rect x="${-half + 10}" y="1" width="8" height="5" fill="#9aa3ad" stroke="${INK}" stroke-width="2"/><rect x="${half - 18}" y="1" width="8" height="5" fill="#9aa3ad" stroke="${INK}" stroke-width="2"/><circle cx="${-half + 14}" cy="8" r="5" fill="#f4eee6" stroke="${INK}" stroke-width="2.5"/><circle cx="${half - 14}" cy="8" r="5" fill="#f4eee6" stroke="${INK}" stroke-width="2.5"/>`;
    s += `<path d="M${-half} -4 Q${-half - 4} -8 ${-half - 2} -10 M${half} -4 Q${half + 4} -8 ${half + 2} -10" stroke="${INK}" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M${-half} -4 Q${-half - 4} -8 ${-half - 2} -10 M${half} -4 Q${half + 4} -8 ${half + 2} -10" stroke="${deckC}" stroke-width="3" stroke-linecap="round" fill="none"/>`
      + `<rect x="${-half}" y="-4" width="${B.len}" height="6" rx="3" fill="${deckC}" stroke="${INK}" stroke-width="2.5"/>`;
    if(under) s += `<path d="M-12 -1 L-4 -1 L-8 3Z M2 -1 L12 -1 L7 3Z" fill="#ffc42b"/>`;
  }
  return s + `</g>`;
}
// drawn in front of the rider (long hair and capes would hide it otherwise); the deck sits just under the soles
VEH.board = (p, J) => ({ over: boardSVG("board", p, J) });
VEH.pick = (p, J) => ({ over: boardSVG("pick", p, J) });
// standing beside a board: it leans on the character's leg
PROPS.board = st => `<g transform="translate(${f1(st.cx + 34)} ${f1(st.fy)}) rotate(-78)"><rect x="0" y="-4" width="64" height="6" rx="3" fill="#3a3a3d" stroke="${INK}" stroke-width="2.5"/><circle cx="12" cy="8" r="5" fill="#f4eee6" stroke="${INK}" stroke-width="2.5"/><circle cx="52" cy="8" r="5" fill="#f4eee6" stroke="${INK}" stroke-width="2.5"/></g>`;
PROPS.pick = st => `<g transform="translate(${f1(st.cx + 44)} ${f1(st.fy - 30)}) rotate(-70)"><path d="M-37 -3 Q-31 -9 0 -9 Q33 -9 37 -2 Q29 7 0 8 Q-31 7 -37 -3Z" fill="#ffc42b" stroke="${INK}" stroke-width="3"/></g>`;

const RIDE = P({ t: 6, hd: -6, sB: -26, eB: 24, sF: 34, eF: 26, hB: -18, kB: -10, hF: 22, kF: -18 });
const RCROUCH = P({ t: 22, hd: -12, sB: -40, eB: 40, sF: 30, eF: 40, hB: 30, kB: -96, hF: 52, kF: -104, sq: .95 });
const RPOP = P({ t: 14, hd: -16, sB: -70, eB: 30, sF: 80, eF: 20, hB: 6, kB: -50, hF: 70, kF: -112, brot: -24 });
const RAIR = P({ t: 22, hd: -10, sB: -80, eB: 34, sF: 90, eF: 26, hB: 48, kB: -110, hF: 74, kF: -124 });
const RGRIND = P({ t: 14, hd: -8, sB: -70, eB: 16, sF: 76, eF: 14, hB: 4, kB: -36, hF: 34, kF: -44 });
const RMANUAL = P({ t: -10, hd: 4, sB: -60, eB: 20, sF: 60, eF: 20, hB: -6, kB: -16, hF: 26, kF: -22, brot: -11 });
const RIDEV = 330;            // rolling speed, px a second
// rolling along, kicking the ground every so often (start: from standing, pushes straight away)
function push(x0, x1, g, o){
  o = o || {}; const kind = o.board || "board", cyc = 170;
  return { dur: Math.abs(x1 - x0) / RIDEV + (o.start ? .25 : 0), fx: [], at(u){
    const x = lerp(x0, x1, o.start ? u * u * (3 - 2 * u) * .4 + u * .6 : u), ph = (((x - x0) % cyc) + cyc) % cyc / cyc;
    const k = o.cruise ? 0 : Math.max(0, Math.sin(Math.min(1, ph / .45) * Math.PI));        // a push in the first part of each cycle
    const p = P(RIDE, { hB: -18 - 28 * k, kB: -10 + 6 * k, t: 6 + 8 * k, sB: -26 - 30 * k, sF: 34 + 20 * k });
    // the pushing foot reaches down to the ground, so plant the board foot, not the lowest
    const J = joints(p), fy = J.lF[2][1] + LEN.sole;
    return { m: "side", cx: x, cy: g - BU - fy - CO, p, veh: kind };
  } };
}
// an ollie, from ground g0 to ground g1: crouch, pop the tail, float, land. flip: a kickflip. spin: 1 = a 360 in the air.
function ollie(x0, g0, x1, g1, o){
  o = o || {}; const kind = o.board || "board", spin = (o.spin || 0) * 360, A = o.apex === undefined ? 46 : o.apex;
  const ya = plantCY(RPOP, g0 - BU) - 6, yb = plantCY(RCROUCH, g1 - BU);
  const fr = [{ u: 0, p: RIDE, x: x0, g: g0 - BU }, { u: .14, p: RCROUCH, x: x0 + 30, g: g0 - BU }, { u: .24, p: RPOP, x: x0 + 52, y: ya }];
  [.25, .5, .75].forEach(ua => { const x = lerp(x0 + 52, x1 - 26, ua), y = lerp(ya, yb, ua) - 4 * (A + Math.abs(ya - yb) / 2) * ua * (1 - ua);
    fr.push({ u: lerp(.24, .8, ua), p: P(RAIR, { rot: spin * ua, bflip: o.flip ? ua * 1.33 : 0, brot: ua < .5 ? -10 : 6 }), x, y }); });
  fr.push({ u: .8, p: P(RAIR, { rot: spin, bflip: o.flip ? 1 : 0, kB: -80, kF: -90 }), x: x1 - 26, y: yb - 10 },
    { u: .9, p: P(RCROUCH, { rot: spin, bflip: o.flip ? 1 : 0 }), x: x1 - 6, g: g1 - BU }, { u: 1, p: P(RIDE, { rot: spin, bflip: o.flip ? 1 : 0 }), x: x1 + 14, g: g1 - BU });
  return kf(fr, .72 + Math.abs(x1 - x0) / 900 + (spin ? .15 : 0), [{ u: .22, k: "tap" }, { u: .86, k: "dust" }], { veh: kind });
}
// grinding along a rail or ledge from (x0, y0) to (x1, y1), sparks flying
function grind(x0, y0, x1, y1, o){
  o = o || {}; const kind = o.board || "board", ang = Math.atan2(y1 - y0, x1 - x0) / R;
  return { dur: Math.hypot(x1 - x0, y1 - y0) / (RIDEV * .9), fx: [], at(u){
    const p = P(RGRIND, { brot: ang, t: 14 + ang * .3, spark: 1, sF: 76 + Math.sin(u * 12) * 8 });
    return { m: "side", cx: lerp(x0, x1, u), cy: plantCY(p, lerp(y0, y1, u) - 4), p, veh: kind };
  } };
}
// a manual: rolling on the back wheels, nose in the air, arms out for balance
function manual(x0, x1, g, o){
  o = o || {}; const kind = o.board || "board";
  return kf([{ u: 0, p: RIDE, x: x0, g: g - BU }, { u: .2, p: RMANUAL, x: lerp(x0, x1, .2), g: g - BU }, { u: .8, p: P(RMANUAL, { sB: -80, sF: 80 }), x: lerp(x0, x1, .8), g: g - BU }, { u: 1, p: RIDE, x: x1, g: g - BU }],
    Math.abs(x1 - x0) / RIDEV + .1, [], { veh: kind });
}
// riding along a curved surface (a ramp, a half-pipe, a drum shell): pts is a list of [x, y] on the surface; the body tilts with it
function rideCurve(pts, o){
  o = o || {}; const kind = o.board || "board", segs = [];
  let tot = 0; for(let i = 1; i < pts.length; i++){ const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(d); tot += d; }
  const L0 = lowest(RGRIND) + BU;
  return { dur: tot / (RIDEV * (o.speed || 1.1)), fx: [], at(u){
    let d = u * tot, i = 0; while(i < segs.length - 1 && d > segs[i]){ d -= segs[i]; i++; }
    const a = pts[i], b = pts[i + 1], t = segs[i] ? d / segs[i] : 0, x = lerp(a[0], b[0], t), y = lerp(a[1], b[1], t), ang = Math.atan2(b[1] - a[1], b[0] - a[0]) / R;
    const p = P(RGRIND, { rot: ang, t: 10, sB: -50, sF: 60 }), c = add([x, y], rotV([0, -L0 - CO], ang));
    return { m: "side", cx: c[0], cy: c[1], p, veh: kind };
  } };
}
// a tail-drag stop, then step off the board
function rideStop(x0, g, o){
  o = o || {}; const kind = o.board || "board";
  return kf([{ u: 0, p: RIDE, x: x0, g: g - BU }, { u: .5, p: P(RIDE, { brot: -18, t: -6, hB: -26, hF: 30, spark: 1 }), x: x0 + 20, g: g - BU }, { u: 1, p: P(RIDE, { brot: -14, spark: 0 }), x: x0 + 26, g: g - BU }],
    .5, [{ u: .3, k: "skid" }], { veh: kind });
}
// hop onto the board from standing (the start of a ride)
const mount = (x, g, o) => kf([{ u: 0, p: STAND, x, g }, { u: .4, p: P(RCROUCH, { hB: 10 }), x: x + 4, g: g - BU }, { u: 1, p: RIDE, x: x + 10, g: g - BU }], .35, [], { veh: (o && o.board) || "board" });
