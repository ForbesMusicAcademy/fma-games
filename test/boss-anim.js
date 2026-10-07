/* The animated bosses, shared by the home Boss Battle and the classroom screen. Plain SVG + CSS, no files.
   const boss = BossArt(containerElement, { kind: "amp", hue: 0 });
   kind: "amp"     a grumpy amp monster (the default)
         "cables"  a tangled knot of guitar leads; beating it shakes loops loose, and defeated it ends up neatly coiled
   BossArt.kinds lists them with their names.
   boss.setDamage(0..1)  how beaten up it looks (cracks at 25%, a horn snaps at 50%, tilt and dizzy at 75%)
   boss.hit(n)           reacts to n hits (knock-back, flash, POW burst; streaks of hits hit harder)
   boss.taunt()          smirks and bobs (a player missed)
   boss.die()            defeated
   Keep a copy in each folder that uses it (Home Practice and the classroom's iPad control page). */
(function(){
  const NS = "http://www.w3.org/2000/svg";
  const INK = "#23231F", PINK = "#D4668C", GOLD = "#FFB805";
  const css = `
.ba{width:100%;height:100%;display:block;overflow:visible}
.ba-hitg{transform-box:view-box;transform-origin:200px 364px;transform:rotate(var(--tilt,0deg));transition:transform .5s}
.ba-all{transform-box:view-box;transform-origin:200px 364px;animation:ba-idle 3.2s ease-in-out infinite}
.ba.st3 .ba-all{animation-duration:1.1s}
@keyframes ba-idle{0%,100%{transform:scale(1,1)}50%{transform:scale(1.016,.984)}}
.ba.st1{--tilt:0deg}.ba.st3{--tilt:3deg}.ba.dead{--tilt:-11deg}
.ba.hit .ba-hitg{animation:ba-hit .46s cubic-bezier(.2,.8,.3,1)}
@keyframes ba-hit{
 0%{transform:rotate(var(--tilt,0deg))}
 16%{transform:translate(calc(var(--hd,1) * -22px * var(--hs,1)),5px) rotate(calc(var(--tilt,0deg) + var(--hd,1) * -6deg * var(--hs,1))) scale(.92,1.07)}
 46%{transform:translate(calc(var(--hd,1) * 9px * var(--hs,1)),0) rotate(calc(var(--tilt,0deg) + var(--hd,1) * 3deg)) scale(1.05,.95)}
 100%{transform:rotate(var(--tilt,0deg))}}
.ba.taunt .ba-hitg{animation:ba-taunt .9s ease-in-out}
@keyframes ba-taunt{0%,100%{transform:rotate(var(--tilt,0deg))}22%{transform:translateY(-16px) rotate(calc(var(--tilt,0deg) - 3deg))}44%{transform:translateY(0)}66%{transform:translateY(-12px) rotate(calc(var(--tilt,0deg) + 3deg))}}
.ba.dead .ba-hitg{animation:ba-fall 1s cubic-bezier(.3,0,.4,1) forwards}
@keyframes ba-fall{0%{transform:rotate(0)}40%{transform:translateY(-14px) rotate(-3deg)}100%{transform:translateY(12px) rotate(-11deg)}}
.ba.dead .ba-all{animation:none}
/* eyes */
.ba-eye,.ba-pup,.ba-brow{transform-box:fill-box;transform-origin:center;transition:transform .1s}
.ba-eye{animation:ba-blink 5s infinite}
.ba-eye.r{animation-delay:.05s}
@keyframes ba-blink{0%,93%,100%{transform:scaleY(1)}96%{transform:scaleY(.08)}}
.ba.hit .ba-pup{transform:scale(.5)}
.ba.hit .ba-brow{transform:translateY(9px)}
.ba.taunt .ba-brow{transform:translateY(-5px)}
.ba.st2 .ba-pup.l{transform:translate(-5px,2px)}
.ba-led{animation:ba-led 1.6s ease-in-out infinite}
@keyframes ba-led{0%,100%{opacity:1}50%{opacity:.45}}
.ba.st3 .ba-led{fill:#C0392B;animation-duration:.35s}
/* damage appears by stage (the stage classes are cumulative: st1, st1 st2, st1 st2 st3) */
.ba .d1,.ba .d2,.ba .d3,.ba .dd{opacity:0;transition:opacity .4s}
.ba.st1 .d1,.ba.st2 .d2,.ba.st3 .d3,.ba.dead .dd{opacity:1}
.ba.dead .ba-pup,.ba.dead .ba-spiral{opacity:0}
.ba.st3 .ba-pup.r{opacity:0}
.ba-horn{transition:transform .6s}
.ba.st3 .ba-horn.r{transform-box:view-box;transform-origin:236px 58px;transform:rotate(26deg)}
.ba.st2 .ba-horn.l{animation:ba-horn .9s ease-in forwards}
@keyframes ba-horn{0%{transform:none;opacity:1}100%{transform:translate(-70px,280px) rotate(-130deg);opacity:0}}
.ba.st3 .k2{animation:ba-knob 1s ease-in forwards}
@keyframes ba-knob{0%{transform:none;opacity:1}100%{transform:translate(10px,300px);opacity:0}}
.ba-spark{opacity:0;animation:ba-spark 2.4s infinite}
.ba.st3 .ba-spark{animation-duration:.9s}
@keyframes ba-spark{0%,70%,100%{opacity:0;transform:scale(.2)}78%{opacity:1;transform:scale(1.1)}90%{opacity:.8;transform:scale(.7)}}
.ba-smoke{opacity:0;transform-box:fill-box;transform-origin:center;animation:ba-smoke 2.4s ease-out infinite}
@keyframes ba-smoke{0%{opacity:.0;transform:translateY(0) scale(.5)}20%{opacity:.7}100%{opacity:0;transform:translateY(-90px) scale(1.7)}}
.ba-sweat{animation:ba-sweat 1.4s ease-in infinite}
@keyframes ba-sweat{0%{transform:translateY(0);opacity:0}15%{opacity:1}100%{transform:translateY(46px);opacity:0}}
.ba-flash{opacity:0}
.ba.hit .ba-flash{animation:ba-flash .3s ease-out}
@keyframes ba-flash{0%{opacity:.75}100%{opacity:0}}
.ba-pow{transform-box:fill-box;transform-origin:center;animation:ba-pow .8s ease-out forwards;pointer-events:none}
@keyframes ba-pow{0%{opacity:0;transform:scale(.3) rotate(-8deg)}18%{opacity:1;transform:scale(1.15) rotate(3deg)}60%{opacity:1;transform:scale(1) rotate(0)}100%{opacity:0;transform:translateY(-26px) scale(1)}}
@media (prefers-reduced-motion:reduce){.ba *{animation:none!important;transition:none!important}.ba-pow{animation:none!important;opacity:0}}
`;
  function injectCss(){
    if(document.getElementById("ba-css")) return;
    const s = document.createElement("style"); s.id = "ba-css"; s.textContent = css + cableCss; document.head.appendChild(s);
  }
  const burstPath = (cx, cy, r1, r2, n) => {
    let d = ""; for(let i = 0; i < n * 2; i++){ const a = Math.PI * i / n, r = i % 2 ? r2 : r1; d += (i ? "L" : "M") + (cx + r * Math.cos(a)).toFixed(1) + " " + (cy + r * Math.sin(a)).toFixed(1); }
    return d + "Z";
  };
  const starP = "M0 -9 L2.5 -2.5 L9 0 L2.5 2.5 L0 9 L-2.5 2.5 L-9 0 L-2.5 -2.5Z";
  // (the spark's own animation sets transform, so its position goes on a wrapper)
  const sp = (x, y, delay) => `<g class="d1"><g transform="translate(${x} ${y})"><path class="ba-spark" d="${starP}" fill="${GOLD}" style="animation-delay:${delay}s"/></g></g>`;
  const stroke = `stroke="${INK}" stroke-linejoin="round" stroke-linecap="round"`;
  const SVG = `<svg class="ba" viewBox="0 0 400 400" xmlns="${NS}" aria-hidden="true">
  <ellipse cx="200" cy="380" rx="130" ry="14" fill="${INK}" opacity=".18"/>
  <g class="ba-hitg"><g class="ba-all">
    <path class="ba-horn l" d="M120 52 L150 18 L168 56" fill="${PINK}" ${stroke} stroke-width="8"/>
    <path class="ba-horn r" d="M280 52 L250 18 L232 56" fill="${PINK}" ${stroke} stroke-width="8"/>
    <path class="d2" d="M122 54 L136 40 L152 54" fill="${PINK}" ${stroke} stroke-width="8"/>
    <rect x="50" y="48" width="300" height="316" rx="34" fill="#3a3a38" ${stroke} stroke-width="10"/>
    <rect x="70" y="68" width="260" height="46" rx="14" fill="${INK}"/>
    <circle class="k1" cx="100" cy="91" r="12" fill="${GOLD}"/><circle class="k2" cx="140" cy="91" r="12" fill="${GOLD}"/><circle class="k3" cx="180" cy="91" r="12" fill="${GOLD}"/>
    <rect class="ba-led" x="226" y="82" width="84" height="18" rx="9" fill="${PINK}"/>
    <rect x="70" y="130" width="260" height="214" rx="22" fill="#6b6558" ${stroke} stroke-width="6"/>
    <g class="d2"><ellipse cx="286" cy="318" rx="34" ry="22" fill="${INK}"/><circle cx="286" cy="318" r="14" fill="#4a4a48" ${stroke} stroke-width="3"/></g>
    <g class="ba-eye l"><circle cx="140" cy="206" r="36" fill="#fff" ${stroke} stroke-width="6"/><circle class="ba-pup l" cx="150" cy="212" r="14" fill="${INK}"/></g>
    <g class="ba-eye r"><circle cx="260" cy="206" r="36" fill="#fff" ${stroke} stroke-width="6"/><circle class="ba-pup r" cx="250" cy="212" r="14" fill="${INK}"/>
      <path class="d3 ba-spiral" d="M260 206 m0 0 a4 4 0 1 1 8 0 a9 9 0 1 1 -18 0 a14 14 0 1 1 28 0 a19 19 0 1 1 -38 0 a24 24 0 1 1 48 0" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/></g>
    <path class="dd" d="M118 184 L162 228 M162 184 L118 228 M238 184 L282 228 M282 184 L238 228" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
    <path class="ba-brow" d="M96 164 L172 188 M304 164 L228 188" fill="none" stroke="${INK}" stroke-width="14" stroke-linecap="round"/>
    <path d="M110 288 Q200 250 290 288 L276 328 L246 300 L222 330 L200 302 L178 330 L154 300 L124 328 Z" fill="#fff" ${stroke} stroke-width="6"/>
    <path class="d2" d="M178 298 L200 300 L222 330 L180 330 Z" fill="${INK}"/>
    <path class="dd" d="M168 306 Q200 372 234 306 Z" fill="${PINK}" ${stroke} stroke-width="5"/>
    <path class="d1" d="M146 138 L168 160 L150 178 L176 198 L164 216" fill="none" stroke="${INK}" stroke-width="5" ${stroke.replace(/^stroke="[^"]*" /, "")}/>
    <path class="d2" d="M292 140 L274 164 L298 184 L280 204" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="d3" d="M100 304 L134 322 L124 340 L168 346" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <ellipse class="d1" cx="104" cy="156" rx="16" ry="9" fill="${INK}" opacity=".35"/>
    <ellipse class="d3" cx="300" cy="260" rx="20" ry="11" fill="${INK}" opacity=".3"/>
    <g class="d3"><path class="ba-sweat" d="M330 150 Q342 172 330 184 Q318 172 330 150Z" fill="#8ECAE6" stroke="${INK}" stroke-width="3"/></g>
    ${sp(158, 168, 0)}${sp(286, 172, 1.1)}${sp(120, 330, .5)}
    <g class="d2"><circle class="ba-smoke" cx="190" cy="40" r="18" fill="#bbb"/><circle class="ba-smoke" cx="215" cy="46" r="14" fill="#ccc" style="animation-delay:1.2s"/></g>
    <g class="d3"><circle class="ba-smoke" cx="170" cy="46" r="16" fill="#aaa" style="animation-delay:.6s"/></g>
    <g class="dd"><circle class="ba-smoke" cx="240" cy="44" r="20" fill="#999" style="animation-delay:.3s"/><circle class="ba-smoke" cx="150" cy="44" r="20" fill="#999" style="animation-delay:.9s"/></g>
    <rect class="ba-flash" x="50" y="48" width="300" height="316" rx="34" fill="#fff"/>
  </g></g>
  <g class="ba-fx"></g>
</svg>`;
  /* ---- the cable knot ---- */
  const SKY = "#4A9CC2";
  const ell = (cx, cy, rx, ry) => `M${cx - rx} ${cy} A${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`;
  // a lead: a thick ink outline with the coloured cable on top
  const lead = (d, col, cls, tf) => `<g${cls ? ` class="${cls}"` : ""}${tf ? ` transform="${tf}"` : ""}><path d="${d}" fill="none" stroke="${INK}" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${col}" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  // a jack plug with two little eyes, drawn pointing up from 0,0 (where its lead joins)
  const plug = () => `<rect x="-12" y="-46" width="24" height="44" rx="6" fill="${GOLD}" ${stroke} stroke-width="6"/>
      <rect x="-15" y="-54" width="30" height="11" rx="4" fill="${INK}"/>
      <rect x="-5.5" y="-84" width="11" height="32" rx="3" fill="#d9dde0" ${stroke} stroke-width="5"/>
      <circle cy="-88" r="7" fill="#d9dde0" ${stroke} stroke-width="5"/>
      <circle cx="-5" cy="-24" r="5" fill="#fff" stroke="${INK}" stroke-width="2.5"/><circle cx="5" cy="-24" r="5" fill="#fff" stroke="${INK}" stroke-width="2.5"/>
      <circle cx="-4" cy="-23" r="2.2" fill="${INK}"/><circle cx="6" cy="-23" r="2.2" fill="${INK}"/>
      <g transform="translate(0 -100)"><path class="ba-spark" d="${starP}" fill="${GOLD}"/></g>`;
  // a lead's tail out of the knot, ending in a plug; the whole thing pivots at the knot (for drooping)
  const tail = (cls, x0, y0, d, col, px, py, ang, delay) => `<g class="ba-plug ${cls}" style="transform-box:view-box;transform-origin:${x0}px ${y0}px">${lead(d, col)}` +
    `<g transform="translate(${px} ${py}) rotate(${ang})" style="--d:${delay}s">${plug()}</g></g>`;
  const CABLES = `<svg class="ba cables" viewBox="0 0 400 400" xmlns="${NS}" aria-hidden="true">
  <ellipse cx="200" cy="380" rx="130" ry="14" fill="${INK}" opacity=".18"/>
  <g class="ba-hitg"><g class="ba-all">
    <g class="ba-knot"><g transform="translate(200 222) scale(1.1) translate(-200 -215)">
      ${tail("l", 108, 250, "M108 250 C70 240 52 210 58 176", SKY, 58, 176, -14, 0)}
      ${tail("r", 296, 160, "M296 160 C326 150 340 136 338 118", PINK, 338, 118, 24, .7)}
      ${tail("t", 200, 104, "M200 104 C200 80 182 66 160 66", GOLD, 160, 66, -70, 1.4)}
      <circle cx="200" cy="215" r="112" fill="#2f2f2d" ${stroke} stroke-width="10"/>
      ${lead(ell(200, 215, 108, 50), PINK, "ba-loop a", "rotate(22 200 215)")}
      ${lead(ell(200, 215, 108, 50), SKY, "ba-loop b", "rotate(-38 200 215)")}
      ${lead(ell(200, 215, 108, 50), GOLD, "ba-loop c", "rotate(84 200 215)")}
      ${lead(ell(200, 215, 92, 40), "#4fb86a", "ba-loop d", "rotate(-4 200 215)")}
      <circle cx="200" cy="222" r="70" fill="#3a3a38" ${stroke} stroke-width="6"/>
      <g class="ba-eye l"><circle cx="172" cy="206" r="25" fill="#fff" ${stroke} stroke-width="5"/><circle class="ba-pup l" cx="178" cy="211" r="10" fill="${INK}"/></g>
      <g class="ba-eye r"><circle cx="228" cy="206" r="25" fill="#fff" ${stroke} stroke-width="5"/><circle class="ba-pup r" cx="222" cy="211" r="10" fill="${INK}"/>
        <path class="d3 ba-spiral" d="M228 206 m0 0 a3 3 0 1 1 6 0 a7 7 0 1 1 -14 0 a11 11 0 1 1 22 0 a15 15 0 1 1 -30 0" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/></g>
      <path class="ba-brow" d="M140 178 L190 194 M260 178 L210 194" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/>
      <path d="M164 262 Q200 240 236 262 L228 282 L212 268 L200 284 L188 268 L172 282 Z" fill="#fff" ${stroke} stroke-width="5"/>
      <g class="d3"><path class="ba-sweat" d="M276 170 Q286 188 276 198 Q266 188 276 170Z" fill="#8ECAE6" stroke="${INK}" stroke-width="3"/></g>
      <circle class="ba-flash" cx="200" cy="215" r="118" fill="#fff"/>
    </g></g>
    ${lead("M136 300 C104 344 100 376 140 372 C178 368 170 336 162 320", PINK, "d1 ba-loose")}
    ${lead("M262 304 C298 342 306 376 268 374 C232 372 238 340 244 324", SKY, "d2 ba-loose")}
    ${lead("M308 236 C356 252 368 296 336 310 C308 322 302 288 310 270", GOLD, "d3 ba-loose")}
    <g class="dd">
      ${lead(ell(200, 332, 158, 46), PINK)}${lead(ell(200, 324, 128, 36), PINK)}${lead(ell(200, 316, 98, 26), PINK)}
      <rect x="184" y="272" width="32" height="96" rx="8" fill="${GOLD}" ${stroke} stroke-width="5"/>
      <g transform="translate(352 344) rotate(70)">${plug()}</g>
      <g transform="translate(200 312)"><circle cx="-34" r="17" fill="#fff" ${stroke} stroke-width="4.5"/><circle cx="34" r="17" fill="#fff" ${stroke} stroke-width="4.5"/>
        <path d="M-43 -9 L-25 9 M-25 -9 L-43 9 M25 -9 L43 9 M43 -9 L25 9" stroke="${INK}" stroke-width="5" stroke-linecap="round"/></g>
    </g>
  </g></g>
  <g class="ba-fx"></g>
</svg>`;
  const cableCss = `
.ba.cables .ba-loop{transition:opacity .45s,transform .45s}
.ba.cables.st1 .ba-loop.a,.ba.cables.st2 .ba-loop.b,.ba.cables.st3 .ba-loop.d{opacity:0}
.ba.cables .ba-plug{transition:transform .7s cubic-bezier(.3,1.4,.5,1)}
.ba.cables.st2 .ba-plug.l{transform:rotate(-95deg)}
.ba.cables.st3 .ba-plug.t{transform:rotate(-55deg)}
.ba.cables .ba-spark{animation-delay:var(--d,0s)}
.ba.cables.taunt .ba-spark{animation-duration:.5s}
.ba.cables .ba-knot{transition:opacity .5s}
.ba.cables.dead .ba-knot,.ba.cables.dead .ba-loose{opacity:0}
.ba.cables.dead{--tilt:0deg}
.ba.cables.dead .ba-hitg{animation:none;transform:none}
`;
  const KINDS = { amp: () => SVG, cables: () => CABLES };
  const WORDS = ["POW", "BAM", "WHAM", "ZAP", "BOOM", "THWACK"];
  window.BossArt = function(el, opt){
    injectCss();
    opt = opt || {};
    const kind = KINDS[opt.kind] ? opt.kind : "amp";
    el.innerHTML = KINDS[kind]();
    const svg = el.querySelector("svg"), fx = svg.querySelector(".ba-fx");
    let stage = 0, dead = false, combo = 0, comboAt = 0, dir = 1, hueDeg = opt.hue || 0;
    const wrapFilter = () => { el.style.filter = (hueDeg ? "hue-rotate(" + hueDeg + "deg) " : "") + (dead && kind === "amp" ? "grayscale(.9) brightness(.85)" : ""); };
    wrapFilter();
    const flick = (cls, ms) => { svg.classList.remove(cls); void svg.getBoundingClientRect(); svg.classList.add(cls); setTimeout(() => svg.classList.remove(cls), ms); };
    function pow(scale){
      const x = 100 + Math.random() * 200, y = 120 + Math.random() * 180, w = WORDS[Math.floor(Math.random() * WORDS.length)];
      const g = document.createElementNS(NS, "g"); g.setAttribute("class", "ba-pow");
      g.innerHTML = `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${scale})"><path d="${burstPath(0, 0, 58, 30, 9)}" fill="${GOLD}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>` +
        `<text y="11" text-anchor="middle" font-family="Nunito,ui-rounded,system-ui,sans-serif" font-weight="900" font-size="30" fill="#fff" stroke="${INK}" stroke-width="7" paint-order="stroke">${w}!</text></g>`;
      fx.appendChild(g); setTimeout(() => g.remove(), 850);
    }
    return {
      setDamage(f){
        if(dead) return;
        f = Math.max(0, Math.min(1, f || 0));
        const st = f >= 0.75 ? 3 : f >= 0.5 ? 2 : f >= 0.25 ? 1 : 0;
        if(st === stage) return;
        stage = st;
        for(let i = 1; i <= 3; i++) svg.classList.toggle("st" + i, i <= st);
      },
      hit(n){
        if(dead) return;
        const now = performance.now();
        combo = now - comboAt < 2500 ? combo + (n || 1) : (n || 1); comboAt = now;
        dir = -dir;
        svg.style.setProperty("--hd", dir);
        svg.style.setProperty("--hs", Math.min(2.2, 1 + 0.22 * (combo - 1) + 0.1 * ((n || 1) - 1)).toFixed(2));
        flick("hit", 480);
        // a classroom full of hits would bury the boss in bursts: at most two at a time, kept smaller
        const bursts = (n || 1) >= 3 ? 2 : 1;
        for(let i = 0; i < bursts; i++) setTimeout(() => { if(fx.children.length < 3) pow(0.55 + Math.min(0.3, combo * 0.04)); }, i * 110);
      },
      taunt(){ if(!dead) flick("taunt", 920); },
      die(){
        if(dead) return;
        dead = true; stage = 3;
        svg.classList.add("st1", "st2", "st3", "dead"); wrapFilter();
      },
      reset(){
        dead = false; stage = 0; combo = 0;
        svg.classList.remove("st1", "st2", "st3", "dead", "hit", "taunt"); wrapFilter();
      }
    };
  };
  window.BossArt.kinds = [["amp", "The Amp"], ["cables", "The Tangle"]];
})();
