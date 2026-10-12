/* Sour Note — a giant grumpy quaver (eighth note). Its round note head is the body and face, the stem rises like a tall
   hat with the flag flapping on top, it wears a sharp-sign sheriff badge, white cartoon gloves and pink sneakers.
   Idle: the flag flaps, the whole note wobbles slightly off-pitch, one fist shakes. Taunt: blows a raspberry (PBBBT!)
   with wobbly wah-wah lines. Damage: lime-sour turns more and more flustered orange, the head cracks, the stem bends,
   the flag droops. Rage: red cheeks, steam, angrier brows, frantic flapping. Dead: melts into a flat squashed note. */
(function(){
  const INK = "#23231F", PINK = "#D4668C", GOLD = "#FFB805", SKY = "#8ECAE6";
  const S = `stroke="${INK}" stroke-linejoin="round" stroke-linecap="round"`;
  const HEAD = `cx="180" cy="272" rx="118" ry="86" transform="rotate(-20 180 272)"`;
  const FLAG = "M290 34 C318 58 370 80 368 140 C367 164 356 182 338 196 C348 168 348 142 330 124 C318 112 304 106 290 102 Z";
  const star = (x, y, s) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -9 L2.6 -2.6 L9 0 L2.6 2.6 L0 9 L-2.6 2.6 L-9 0 L-2.6 -2.6Z" fill="${GOLD}" stroke="${INK}" stroke-width="2"/>`;
  // a sharp sign, drawn with lines so it never depends on a font
  const sharp = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"><path d="M-5 -13 L-6 13 M6 -14 L5 12 M-13 -3 L13 -8 M-13 8 L13 3"/></g>`;
  // a wobbly "wah-wah" line, pointing along +x from its wrapper's origin
  const wah = (x, y, r, d) => `<g transform="translate(${x} ${y}) rotate(${r})"><g class="sn-wah" style="animation-delay:${d}s">` +
    `<path d="M0 0 q7 -11 14 0 t14 0 t14 0 t14 0" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/>` +
    `<path d="M0 0 q7 -11 14 0 t14 0 t14 0 t14 0" fill="none" stroke="${GOLD}" stroke-width="5" stroke-linecap="round"/></g></g>`;
  const arm = d => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path class="sn-skinS" d="${d}" fill="none" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`;
  const glove = (x, y) => `<circle cx="${x}" cy="${y}" r="17" fill="#fff" ${S} stroke-width="6"/><path d="M${x - 8} ${y - 6} q4 -4 8 0 M${x} ${y - 6} q4 -4 8 0" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
  const svg = () => `<svg class="ba sournote" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <ellipse cx="200" cy="380" rx="130" ry="14" fill="${INK}" opacity=".18"/>
  <g class="ba-hitg"><g class="ba-all">
   <g class="sn-live"><g class="sn-wob">
    <!-- pink sneakers -->
    <g><ellipse cx="126" cy="364" rx="32" ry="14" fill="${PINK}" ${S} stroke-width="6"/><ellipse cx="116" cy="359" rx="10" ry="4" fill="#fff" opacity=".55"/>
      <ellipse cx="232" cy="362" rx="32" ry="14" fill="${PINK}" ${S} stroke-width="6"/><ellipse cx="242" cy="357" rx="10" ry="4" fill="#fff" opacity=".55"/></g>
    <!-- the stem: a lower part and an upper part that bends at the joint, the flag on top -->
    <rect class="sn-skin2" x="270" y="140" width="28" height="140" rx="14" ${S} stroke-width="7"/>
    <g class="sn-upper">
      <g class="sn-droop"><g class="sn-flap">
        <path class="sn-skin" d="${FLAG}" ${S} stroke-width="8"/>
        <path d="M300 62 C330 82 352 104 352 138" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" opacity=".35"/>
        <path d="M308 58 C324 70 338 82 346 98" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".5"/>
        <path class="ba-flash" d="${FLAG}" fill="#fff"/>
      </g></g>
      <rect class="sn-skin2" x="270" y="28" width="28" height="136" rx="14" ${S} stroke-width="7"/>
      <rect x="276" y="40" width="7" height="100" rx="3.5" fill="#fff" opacity=".4"/>
      <rect class="ba-flash" x="270" y="28" width="28" height="136" rx="14" fill="#fff"/>
    </g>
    <g class="d2"><rect x="262" y="140" width="44" height="18" rx="5" fill="#F5E6C8" ${S} stroke-width="4" transform="rotate(-24 284 149)"/><circle cx="279" cy="150" r="1.8" fill="${INK}"/><circle cx="289" cy="146" r="1.8" fill="${INK}"/></g>
    <!-- the sharp-sign sheriff badge -->
    <g><circle cx="284" cy="190" r="22" fill="${GOLD}" ${S} stroke-width="6"/><circle cx="284" cy="190" r="15" fill="none" stroke="#E0A400" stroke-width="3"/>${sharp(284, 190, .8)}<path d="M272 178 a16 16 0 0 1 10 -5" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/></g>
    <!-- right arm, hand on hip -->
    ${arm("M268 296 L322 288 L296 326")}${glove(294, 326)}
    <!-- the note head -->
    <ellipse class="sn-skin" ${HEAD} ${S} stroke-width="9"/>
    <path d="M86 318 Q150 372 262 330" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round" opacity=".12"/>
    <ellipse cx="116" cy="216" rx="36" ry="14" transform="rotate(-30 116 216)" fill="#fff" opacity=".5"/>
    <circle cx="154" cy="200" r="6" fill="#fff" opacity=".55"/>
    <g fill="${INK}" opacity=".16"><circle cx="96" cy="262" r="3"/><circle cx="108" cy="290" r="2.5"/><circle cx="246" cy="214" r="3"/><circle cx="262" cy="244" r="2.5"/><circle cx="232" cy="318" r="3"/><circle cx="128" cy="326" r="2.5"/><circle cx="84" cy="300" r="2"/></g>
    <!-- cracks and dents -->
    <path class="d1" d="M170 190 L160 210 L176 220 L162 240" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="d2" d="M74 300 L96 302 L92 318 L112 326" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <ellipse class="d2" cx="252" cy="232" rx="13" ry="8" fill="${INK}" opacity=".3"/>
    <path class="d3" d="M262 270 L244 282 L256 296 L238 312 L250 322" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- face: sour eyelids, grumpy brows -->
    <g class="ba-eye l"><circle cx="134" cy="252" r="30" fill="#fff" ${S} stroke-width="6"/>
      <g class="ba-pup l"><circle cx="143" cy="260" r="12" fill="${INK}"/><circle cx="147" cy="256" r="3.5" fill="#fff"/></g>
      <path class="sn-skin" d="M108 237 A30 30 0 0 1 163.9 249.4 Z" ${S} stroke-width="5"/></g>
    <g class="ba-eye r"><circle cx="208" cy="240" r="34" fill="#fff" ${S} stroke-width="6"/>
      <g class="ba-pup r"><circle cx="199" cy="250" r="13" fill="${INK}"/><circle cx="203" cy="246" r="4" fill="#fff"/></g>
      <path class="sn-skin" d="M174.1 243 A34 34 0 0 1 237.4 223 Z" ${S} stroke-width="5"/>
      <path class="d3 ba-spiral" d="M208 246 m0 0 a3 3 0 1 1 6 0 a8 8 0 1 1 -16 0 a13 13 0 1 1 26 0 a18 18 0 1 1 -36 0" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/></g>
    <g class="sn-bl"><path class="ba-brow" d="M100 220 L162 232" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/></g>
    <g class="sn-br"><path class="ba-brow" d="M178 218 L246 196" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/></g>
    <path d="M96 280 q-8 6 -4 14 M254 262 q10 4 8 14" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" opacity=".55"/>
    <g class="sn-blush"><ellipse cx="110" cy="296" rx="18" ry="10" fill="#E25B4A"/><ellipse cx="244" cy="284" rx="18" ry="10" fill="#E25B4A"/></g>
    <!-- the puckered, lemon-sucking lips -->
    <g class="sn-pucker"><ellipse cx="188" cy="312" rx="16" ry="13" fill="${PINK}" ${S} stroke-width="5"/><ellipse cx="189" cy="313" rx="5" ry="4" fill="${INK}"/>
      <path d="M180 304 l-3 -4 M196 304 l3 -4 M178 320 l-3 4 M198 320 l3 4 M171 312 h-5 M205 312 h5" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <path d="M181 306 q4 -3 8 -2" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".7"/></g>
    <!-- the raspberry (taunt) -->
    <g class="sn-rasp">
      <ellipse cx="188" cy="312" rx="28" ry="16" fill="${PINK}" ${S} stroke-width="6"/>
      <g class="sn-tongue"><path d="M174 314 Q170 352 189 354 Q208 352 204 314 Z" fill="#F29BB8" ${S} stroke-width="5"/><path d="M189 322 L189 342" stroke="${INK}" stroke-width="3" stroke-linecap="round" opacity=".5"/></g>
      <path d="M164 306 Q188 300 212 306" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <circle cx="232" cy="300" r="4" fill="${SKY}" stroke="${INK}" stroke-width="2"/><circle cx="244" cy="318" r="3" fill="${SKY}" stroke="${INK}" stroke-width="2"/><circle cx="146" cy="300" r="3.5" fill="${SKY}" stroke="${INK}" stroke-width="2"/>
      ${wah(222, 306, -18, 0)}${wah(224, 324, 14, .1)}${wah(154, 314, 192, .05)}
      <text x="96" y="168" transform="rotate(-12 96 168)" text-anchor="middle" font-family="Nunito,ui-rounded,system-ui,sans-serif" font-weight="900" font-size="34" fill="${PINK}" stroke="${INK}" stroke-width="7" paint-order="stroke">PBBBT!</text>
    </g>
    <!-- left arm, shaking a fist -->
    <g class="sn-fist">${arm("M80 290 Q46 292 40 252")}${glove(40, 244)}</g>
    <!-- rage steam -->
    <g class="sn-steamg"><circle class="sn-steam" cx="92" cy="206" r="13" fill="#fff" stroke="${INK}" stroke-width="3"/><circle class="sn-steam" cx="250" cy="180" r="11" fill="#fff" stroke="${INK}" stroke-width="3" style="animation-delay:.5s"/><circle class="sn-steam" cx="74" cy="226" r="9" fill="#fff" stroke="${INK}" stroke-width="3" style="animation-delay:.8s"/></g>
    <!-- damage extras -->
    <g class="d1"><path class="ba-sweat" d="M70 236 Q80 254 70 264 Q60 254 70 236Z" fill="${SKY}" stroke="${INK}" stroke-width="3"/></g>
    <g class="d3"><path class="ba-sweat" d="M266 216 Q276 234 266 244 Q256 234 266 216Z" fill="${SKY}" stroke="${INK}" stroke-width="3" style="animation-delay:.6s"/></g>
    <g class="d2"><g class="sn-dizzy">${star(150, 170, 1.2)}${star(220, 160, 1)}</g></g>
    <g class="ba-flash"><ellipse ${HEAD} fill="#fff"/><rect x="270" y="140" width="28" height="140" rx="14" fill="#fff"/><circle cx="284" cy="190" r="22" fill="#fff"/></g>
   </g></g>
   <!-- defeated: a flat squashed note -->
   <g class="dd sn-puddle">
     <path d="M292 304 Q326 238 352 234 Q376 232 380 262" fill="none" stroke="${INK}" stroke-width="34" stroke-linecap="round"/>
     <path d="M292 304 Q326 238 352 234 Q376 232 380 262" fill="none" stroke="#A9BE52" stroke-width="20" stroke-linecap="round"/>
     <path d="M370 258 C390 276 390 310 376 334 C370 316 362 306 352 300 C358 288 364 272 370 258 Z" fill="#C9D96A" ${S} stroke-width="7"/>
     <path d="M36 356 C30 318 100 286 196 286 C292 286 352 310 350 342 C349 364 312 374 276 368 C256 378 230 378 216 368 C172 378 94 380 62 372 C46 368 38 362 36 356 Z" fill="#C9D96A" ${S} stroke-width="9"/>
     <ellipse cx="104" cy="308" rx="32" ry="9" transform="rotate(-10 104 308)" fill="#fff" opacity=".55"/>
     <g fill="${INK}" opacity=".16"><circle cx="80" cy="340" r="3"/><circle cx="276" cy="306" r="3"/><circle cx="312" cy="344" r="2.5"/></g>
     <circle cx="150" cy="322" r="21" fill="#fff" ${S} stroke-width="5"/><circle cx="232" cy="318" r="23" fill="#fff" ${S} stroke-width="5"/>
     <path d="M140 312 L160 332 M160 312 L140 332 M221 307 L243 329 M243 307 L221 329" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
     <path d="M166 352 q8 -7 16 0 t16 0 t16 0" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
     <path d="M196 353 Q194 374 208 374 Q220 372 212 352 Z" fill="#F29BB8" ${S} stroke-width="4"/>
     <g transform="rotate(-14 304 344)"><ellipse cx="304" cy="344" rx="20" ry="10" fill="${GOLD}" ${S} stroke-width="5"/></g>
     <ellipse cx="62" cy="370" rx="26" ry="10" fill="${PINK}" ${S} stroke-width="5"/>
     <g class="sn-orbit">${star(150, 262, 1.2)}${star(240, 256, 1)}${star(196, 240, 1.1)}</g>
   </g>
  </g></g>
  <g class="ba-fx"></g>
</svg>`;
  const V = "transform-box:view-box";
  const css = `
.ba.sournote .sn-skin{fill:#BEDB3E;transition:fill .6s}
.ba.sournote .sn-skin2{fill:#9DBF2E;transition:fill .6s}
.ba.sournote .sn-skinS{stroke:#BEDB3E;transition:stroke .6s}
.ba.sournote.st1 .sn-skin{fill:#D3D73E}.ba.sournote.st1 .sn-skin2{fill:#B4B92E}.ba.sournote.st1 .sn-skinS{stroke:#D3D73E}
.ba.sournote.st2 .sn-skin{fill:#EAC340}.ba.sournote.st2 .sn-skin2{fill:#CBA22E}.ba.sournote.st2 .sn-skinS{stroke:#EAC340}
.ba.sournote.st3 .sn-skin{fill:#F39E4C}.ba.sournote.st3 .sn-skin2{fill:#D9803A}.ba.sournote.st3 .sn-skinS{stroke:#F39E4C}
.ba.sournote .sn-wob{${V};transform-origin:180px 372px;animation:sn-wob 2.8s ease-in-out infinite}
@keyframes sn-wob{0%,100%{transform:rotate(-1.6deg)}30%{transform:rotate(2deg)}42%{transform:rotate(.4deg)}58%{transform:rotate(2.6deg)}80%{transform:rotate(-2.2deg)}}
.ba.sournote.rage .sn-wob{animation-duration:1.2s}
.ba.sournote .sn-upper{${V};transform-origin:284px 152px;transition:transform .6s cubic-bezier(.3,1.6,.5,1)}
.ba.sournote.st2 .sn-upper{transform:rotate(11deg)}
.ba.sournote.st3 .sn-upper{transform:rotate(22deg)}
.ba.sournote .sn-droop{${V};transform-origin:292px 40px;transition:transform .7s cubic-bezier(.3,1.5,.5,1)}
.ba.sournote.st2 .sn-droop{transform:rotate(-8deg) scale(.8,1.08)}
.ba.sournote.st3 .sn-droop{transform:rotate(-14deg) scale(.6,1.16)}
.ba.sournote .sn-flap{${V};transform-origin:292px 40px;animation:sn-flap 1.1s ease-in-out infinite}
@keyframes sn-flap{0%,100%{transform:rotate(0) scale(1)}50%{transform:rotate(-13deg) scale(.94,1.04)}}
.ba.sournote.rage .sn-flap{animation-duration:.45s}
.ba.sournote.st3 .sn-flap{animation-duration:2.4s}
.ba.sournote .sn-fist{${V};transform-origin:80px 290px;animation:sn-fist 1.6s ease-in-out infinite}
@keyframes sn-fist{0%,100%{transform:rotate(0)}25%{transform:rotate(-9deg)}50%{transform:rotate(4deg)}75%{transform:rotate(-7deg)}}
.ba.sournote.rage .sn-fist{animation-duration:.4s}
.ba.sournote .sn-bl,.ba.sournote .sn-br{${V};transition:transform .4s}
.ba.sournote .sn-bl{transform-origin:162px 232px}.ba.sournote .sn-br{transform-origin:178px 218px}
.ba.sournote.rage .sn-bl{transform:rotate(9deg)}.ba.sournote.rage .sn-br{transform:rotate(-9deg)}
.ba.sournote .sn-blush{opacity:0;transition:opacity .5s}
.ba.sournote.st1 .sn-blush{opacity:.3}.ba.sournote.rage .sn-blush{opacity:.8}
.ba.sournote .sn-steam{opacity:0;transform-box:fill-box;transform-origin:center}
.ba.sournote.rage .sn-steam{animation:sn-steam 1.3s ease-out infinite}
@keyframes sn-steam{0%{opacity:0;transform:translateY(0) scale(.4)}25%{opacity:.95}100%{opacity:0;transform:translateY(-60px) scale(1.5)}}
.ba.sournote .sn-dizzy{${V};transform-origin:186px 166px;animation:sn-spin 3s linear infinite}
.ba.sournote .sn-rasp{opacity:0}
.ba.sournote.taunt .sn-rasp{opacity:1}
.ba.sournote.taunt .sn-pucker{opacity:0}
.ba.sournote .sn-wah{opacity:0;transform-box:fill-box;transform-origin:left center}
.ba.sournote.taunt .sn-wah{animation:sn-wah .85s ease-out both}
@keyframes sn-wah{0%{opacity:0;transform:translateX(0) scale(.5,1)}20%{opacity:1}100%{opacity:0;transform:translateX(70px) scale(1.15,1.6)}}
.ba.sournote .sn-tongue{${V};transform-origin:189px 314px}
.ba.sournote.taunt .sn-tongue{animation:sn-tongue .3s ease-in-out 3}
@keyframes sn-tongue{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(8deg) scaleY(1.1)}}
.ba.sournote.dead{--tilt:0deg}
.ba.sournote.dead .ba-hitg{animation:none;transform:none}
.ba.sournote .sn-live{${V};transform-origin:200px 374px}
.ba.sournote.dead .sn-live{animation:sn-melt .7s cubic-bezier(.5,0,.8,.5) forwards}
@keyframes sn-melt{0%{transform:none;opacity:1}35%{transform:scale(.9,1.12)}100%{transform:scale(1.5,.06);opacity:0}}
.ba.sournote .sn-puddle{${V};transform-origin:200px 372px}
.ba.sournote.dead .sn-puddle{animation:sn-spread .7s .45s cubic-bezier(.3,1.5,.5,1) both}
@keyframes sn-spread{0%{opacity:0;transform:scale(.5,.2)}100%{opacity:1;transform:none}}
.ba.sournote .sn-orbit{${V};transform-origin:196px 254px;animation:sn-spin 2.4s linear infinite}
@keyframes sn-spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.ba.sournote *{animation:none!important}.ba.sournote.dead .sn-live{opacity:0}.ba.sournote.dead .sn-puddle{opacity:1}}
`;
  BossArt.register("sournote", { name: "Sour Note", svg, css });
})();
