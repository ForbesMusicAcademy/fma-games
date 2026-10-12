/* The Drum Kit: a cheeky drum-kit monster. Its bass drum is the body (face on the front head, an FMA badge,
   chrome lugs), tom-toms are its shoulders, a hi-hat is its hat, two crash cymbals are its ears, and chrome-tube
   arms end in white gloves holding drumsticks.
   Idle: bounces on the beat, taps its toms, hi-hat claps, cymbals shimmer. Rage: faster beat, red cheeks,
   an anger mark and steam out of the toms. Taunt: a fast stick roll on its own toms with "BA-DUM-TSS!".
   Damage: hoop dent and a plaster (25%), the front head rips and the left crash falls off (50%),
   a stick snaps and a tom droops (75%). Defeated: slumped, sticks dropped, the hi-hat cymbal spins
   down to the floor, X eyes, tongue out.
   Loaded after boss-anim.js; registers itself with BossArt.register. */
(function(){
  if(!window.BossArt || !BossArt.register) return;
  const INK = "#23231F", GOLD = "#FFB805", GOLDD = "#E0A400", PINK = "#D4668C", PINKL = "#E893B1", CREAM = "#FBF8EF";
  const SKY = "#8ECAE6", SKYD = "#4A9CC2", CHROME = "#d9dde0", STICK = "#EBC88A";
  const st = `stroke="${INK}" stroke-linejoin="round" stroke-linecap="round"`;
  const FONT = `font-family="Nunito,ui-rounded,system-ui,sans-serif" font-weight="900"`;
  const starP = "M0 -9 L2.5 -2.5 L9 0 L2.5 2.5 L0 9 L-2.5 2.5 L-9 0 L-2.5 -2.5Z";
  const sp = (cls, x, y, delay) => `<g class="${cls}"><g transform="translate(${x} ${y})"><path class="ba-spark" d="${starP}" fill="${GOLD}" stroke="${INK}" stroke-width="1.5" style="animation-delay:${delay}s"/></g></g>`;
  // a chunky tube: ink outline with a coloured core
  const tube = (d, col, w) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w - 9}" stroke-linecap="round" stroke-linejoin="round"/>`;
  // a cymbal centred on 0,0
  const cymbal = (rx, ry) => `<ellipse rx="${rx}" ry="${ry}" fill="${GOLD}" ${st} stroke-width="6"/>
      <ellipse rx="${rx * .62}" ry="${ry * .55}" fill="none" stroke="${GOLDD}" stroke-width="2.5"/>
      <ellipse cy="-2" rx="${rx * .26}" ry="${ry * .6}" fill="${GOLDD}" ${st} stroke-width="3.5"/>
      <path d="M${-rx * .8} ${-ry * .2} Q${-rx * .55} ${-ry * .8} ${-rx * .2} ${-ry * .85}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>`;
  // a tom-tom centred on 0,0 (head on top)
  const tom = `<path d="M-42 -14 L-42 22 A42 13 0 0 0 42 22 L42 -14 Z" fill="${SKYD}" ${st} stroke-width="7"/>
      <path d="M-30 -2 L-30 28" stroke="${SKY}" stroke-width="7" stroke-linecap="round"/>
      <rect x="-24" y="2" width="7" height="18" rx="3" fill="${CHROME}" ${st} stroke-width="3"/><rect x="17" y="2" width="7" height="18" rx="3" fill="${CHROME}" ${st} stroke-width="3"/>
      <ellipse cy="-14" rx="42" ry="13" fill="${CREAM}" ${st} stroke-width="6"/>`;
  const lugs = () => [...Array(10)].map((_, i) => `<rect x="-5" y="-113" width="10" height="20" rx="3" fill="${CHROME}" ${st} stroke-width="3" transform="translate(200 250) rotate(${i * 36 + 18})"/>`).join("");
  // a drumstick from the hand at hx,hy to the tip at tx,ty (split in two so one half can snap off)
  const stick = (hx, hy, tx, ty, snap) => {
    const bx = hx - (tx - hx) * .14, by = hy - (ty - hy) * .14, mx = (hx + tx) / 2, my = (hy + ty) / 2;
    const lower = tube(`M${bx} ${by} L${mx} ${my}`, STICK, 16), upper = `${tube(`M${mx} ${my} L${tx} ${ty}`, STICK, 16)}<ellipse cx="${tx}" cy="${ty}" rx="7" ry="9" fill="${STICK}" ${st} stroke-width="4.5" transform="rotate(${Math.atan2(ty - hy, tx - hx) * 180 / Math.PI + 90} ${tx} ${ty})"/>`;
    return lower + (snap ? `<g class="dk-snap">${upper}</g><path class="d3" d="M${mx - 6} ${my + 4} l4 -10 l4 6 l4 -9 l3 8" fill="${STICK}" ${st} stroke-width="3.5"/>` : upper);
  };
  const glove = (x, y, flip) => `<circle cx="${x}" cy="${y}" r="17" fill="#fff" ${st} stroke-width="5"/>
      <path d="M${x + flip * 4} ${y - 12} q${flip * 12} 2 ${flip * 10} 12" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M${x - flip * 12} ${y + 6} q${flip * 6} 4 ${flip * 12} 2" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
  const word = (cls, x, y, rot, txt, size, col) => `<g transform="translate(${x} ${y}) rotate(${rot})"><text class="dk-w ${cls}" text-anchor="middle" ${FONT} font-size="${size}" fill="${col}" stroke="${INK}" stroke-width="${size / 4.5}" paint-order="stroke" stroke-linejoin="round">${txt}</text></g>`;

  const svg = () => `<svg class="ba kit" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <ellipse cx="200" cy="380" rx="130" ry="14" fill="${INK}" opacity=".18"/>
  <g class="ba-hitg"><g class="ba-all"><g class="dk-bounce">
    <!-- crash-cymbal ears on their stands -->
    ${tube("M56 96 L112 196", CHROME, 13)}${tube("M344 96 L288 196", CHROME, 13)}
    <g class="dk-crashfall"><g transform="translate(54 92) rotate(-22)"><g class="dk-crash l">${cymbal(44, 11)}</g></g></g>
    <g transform="translate(346 92) rotate(22)"><g class="dk-crash r">${cymbal(44, 11)}</g></g>
    <!-- hi-hat hat -->
    ${tube("M200 140 L200 96", CHROME, 13)}
    <g transform="translate(200 104)">${cymbal(56, 11)}</g>
    <g class="dk-hhrod">${tube("M200 82 L200 40", CHROME, 11)}<rect x="191" y="56" width="18" height="10" rx="3" fill="${GOLDD}" ${st} stroke-width="4"/></g>
    <g class="dk-hhtop"><g transform="translate(200 76)">${cymbal(56, 11)}</g></g>
    <!-- tom-tom shoulders -->
    <g transform="translate(108 152) rotate(-18)"><g class="dk-tom l">${tom}</g></g>
    <g class="dk-tomdroop"><g transform="translate(292 152) rotate(18)"><g class="dk-tom r">${tom}
      <g class="d1" transform="rotate(-8)"><rect x="-18" y="6" width="36" height="14" rx="6" fill="#F3C9A6" ${st} stroke-width="4"/><rect x="-5" y="6" width="10" height="14" fill="#E8B48C"/></g></g></g></g>
    <!-- chrome arms -->
    ${tube("M106 282 Q60 290 42 246", CHROME, 22)}${tube("M294 282 Q340 290 358 246", CHROME, 22)}
    <!-- spur legs -->
    ${tube("M124 330 L96 366", CHROME, 14)}${tube("M276 330 L304 366", CHROME, 14)}
    <ellipse cx="94" cy="368" rx="14" ry="7" fill="${INK}"/><ellipse cx="306" cy="368" rx="14" ry="7" fill="${INK}"/>
    <!-- bass drum body -->
    <circle cx="200" cy="250" r="113" fill="${PINK}" ${st} stroke-width="10"/>
    <path d="M114 206 A96 96 0 0 1 166 160" fill="none" stroke="${PINKL}" stroke-width="7" stroke-linecap="round"/>
    ${lugs()}
    <circle cx="200" cy="250" r="90" fill="${CREAM}" ${st} stroke-width="6"/>
    <path d="M132 214 A74 74 0 0 1 182 180" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/>
    <rect x="176" y="312" width="48" height="20" rx="10" fill="${PINK}" ${st} stroke-width="3.5"/>
    <text x="200" y="327" text-anchor="middle" ${FONT} font-size="14" fill="#fff">FMA</text>
    <!-- face -->
    <ellipse class="dk-cheek" cx="136" cy="270" rx="14" ry="7" fill="${PINK}" opacity=".5"/>
    <ellipse class="dk-cheek" cx="264" cy="270" rx="14" ry="7" fill="${PINK}" opacity=".5"/>
    <g class="ba-eye l"><circle cx="162" cy="230" r="25" fill="#fff" ${st} stroke-width="6"/><circle class="ba-pup l" cx="167" cy="234" r="11" fill="${INK}"/><circle cx="171" cy="230" r="3.5" fill="#fff"/></g>
    <g class="ba-eye r"><circle cx="238" cy="230" r="25" fill="#fff" ${st} stroke-width="6"/><circle class="ba-pup r" cx="233" cy="234" r="11" fill="${INK}"/>
      <path class="d3 ba-spiral" d="M238 230 m0 0 a3 3 0 1 1 6 0 a7 7 0 1 1 -14 0 a11 11 0 1 1 22 0 a15 15 0 1 1 -30 0" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/></g>
    <path class="dd" d="M146 214 L178 246 M178 214 L146 246 M222 214 L254 246 M254 214 L222 246" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
    <path class="ba-brow l" d="M130 194 L184 206" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>
    <path class="ba-brow r" d="M270 194 L216 206" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>
    <g class="dk-grin"><path d="M150 264 Q200 276 250 264 Q244 306 200 306 Q156 306 150 264Z" fill="${INK}" ${st} stroke-width="5"/>
      <path d="M157 268 Q200 279 243 268 L241 277 Q200 288 159 277Z" fill="#fff"/>
      <path d="M178 298 Q200 284 222 298 Q200 306 178 298Z" fill="${PINK}"/></g>
    <g class="dd"><path d="M204 296 Q204 320 216 318 Q224 314 220 296Z" fill="${PINK}" ${st} stroke-width="4"/>
      <path d="M160 292 Q172 282 184 292 Q196 302 208 292 Q220 282 232 292 Q238 296 242 290" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/></g>
    <!-- damage -->
    <g class="d1"><path d="M298 196 q8 4 8 12 M304 188 q10 6 10 16" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><ellipse cx="300" cy="212" rx="9" ry="13" fill="${INK}" opacity=".25" transform="rotate(-30 300 212)"/></g>
    <g class="d2"><path d="M234 306 L244 298 L248 307 L259 300 L262 311 L272 314 L263 321 L267 331 L254 328 L248 335 L242 326 L231 323 L238 315 Z" fill="#3a3a38" ${st} stroke-width="4"/>
      <path d="M259 300 Q276 292 280 280 Q268 284 262 290Z" fill="${CREAM}" ${st} stroke-width="4"/>
      <ellipse cx="250" cy="316" rx="4" ry="5" fill="#fff"/><ellipse cx="258" cy="316" rx="4" ry="5" fill="#fff"/><circle cx="251" cy="317" r="2" fill="${INK}"/><circle cx="259" cy="317" r="2" fill="${INK}"/></g>
    <path class="d3" d="M120 300 L138 290 L134 278 L150 270" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
    <g class="d3"><path class="ba-sweat" d="M296 166 Q306 186 296 196 Q286 186 296 166Z" fill="${SKY}" stroke="${INK}" stroke-width="3"/></g>
    ${sp("d2", 70, 100, 0)}${sp("d3", 320, 300, .7)}${sp("d3", 130, 330, 1.3)}
    <!-- anger mark (rage) -->
    <g class="dk-anger" transform="translate(268 170)"><path d="M-12 -4 Q-4 -4 -4 -12 M4 -12 Q4 -4 12 -4 M12 4 Q4 4 4 12 M-4 12 Q-4 4 -12 4" fill="none" stroke="#E0473A" stroke-width="5" stroke-linecap="round"/></g>
    <!-- sticks and gloves -->
    <g class="dk-stick l">${stick(42, 244, 104, 122, false)}</g>
    <g class="dk-stick r">${stick(358, 244, 296, 122, true)}</g>
    ${glove(42, 244, 1)}${glove(358, 244, -1)}
    <!-- steam from the toms (rage) and smoke when beaten -->
    <g class="dk-steam"><circle class="ba-smoke" cx="104" cy="116" r="14" fill="#efe9dc" stroke="${INK}" stroke-width="3"/><circle class="ba-smoke" cx="296" cy="116" r="14" fill="#efe9dc" stroke="${INK}" stroke-width="3" style="animation-delay:1s"/></g>
    <g class="dd"><circle class="ba-smoke" cx="170" cy="130" r="16" fill="#aaa" style="animation-delay:.3s"/><circle class="ba-smoke" cx="236" cy="134" r="14" fill="#bbb" style="animation-delay:1.1s"/></g>
    <g class="ba-flash"><circle cx="200" cy="250" r="113" fill="#fff"/><ellipse cx="200" cy="90" rx="58" ry="26" fill="#fff"/><ellipse cx="108" cy="160" rx="46" ry="30" fill="#fff"/><ellipse cx="292" cy="160" rx="46" ry="30" fill="#fff"/></g>
  </g>
  <g class="dk-words">${word("a", 76, 52, -12, "BA-", 38, "#fff")}${word("b", 322, 52, 10, "DUM!", 38, "#fff")}${word("c", 200, 30, 0, "TSS!", 40, GOLD)}</g>
  </g></g>
  <g class="ba-fx"></g>
</svg>`;

  const css = `
.ba.kit .dk-bounce{animation:dk-bounce .75s ease-in-out infinite}
@keyframes dk-bounce{0%,100%{transform:translateY(0)}18%{transform:translateY(5px)}55%{transform:translateY(-6px)}}
.ba.kit.rage .dk-bounce,.ba.kit.rage .dk-stick,.ba.kit.rage .dk-hhtop,.ba.kit.rage .dk-crash{animation-duration:.42s}
.ba.kit.dead .dk-bounce{animation:none;transform:translateY(10px)}
.ba.kit .dk-stick{transition:transform .6s}
.ba.kit .dk-stick.l{transform-box:view-box;transform-origin:42px 244px;animation:dk-tapl .75s ease-in infinite}
.ba.kit .dk-stick.r{transform-box:view-box;transform-origin:358px 244px;animation:dk-tapr .75s ease-in infinite;animation-delay:-.37s}
@keyframes dk-tapl{0%,100%{transform:rotate(-6deg)}20%{transform:rotate(7deg)}}
@keyframes dk-tapr{0%,100%{transform:rotate(6deg)}20%{transform:rotate(-7deg)}}
.ba.kit.taunt .dk-stick.l{animation:dk-rolll .11s linear infinite alternate}
.ba.kit.taunt .dk-stick.r{animation:dk-rollr .11s linear -.055s infinite alternate}
@keyframes dk-rolll{0%{transform:rotate(-8deg)}100%{transform:rotate(9deg)}}
@keyframes dk-rollr{0%{transform:rotate(8deg)}100%{transform:rotate(-9deg)}}
.ba.kit.dead .dk-stick.l{animation:none;transform:rotate(-34deg)}
.ba.kit.dead .dk-stick.r{animation:none;transform:rotate(34deg)}
.ba.kit .dk-hhtop{animation:dk-hh .75s ease-in infinite}
@keyframes dk-hh{0%,100%{transform:translateY(0)}20%{transform:translateY(14px)}45%{transform:translateY(0)}}
.ba.kit.taunt .dk-hhtop{animation:dk-hh .9s ease-in .55s}
.ba.kit .dk-crash{transform-box:fill-box;transform-origin:center;animation:dk-shim 1.5s ease-in-out infinite}
.ba.kit .dk-crash.r{animation-delay:-.75s}
@keyframes dk-shim{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(6deg) scaleY(.85)}}
.ba.kit.taunt .dk-crash{animation:dk-shim .18s ease-in-out infinite}
.ba.kit.st2 .dk-crashfall{animation:dk-crashfall 1.1s ease-in forwards}
@keyframes dk-crashfall{0%{transform:none;opacity:1}25%{transform:translate(-12px,-26px) rotate(-30deg)}100%{transform:translate(-40px,300px) rotate(-220deg);opacity:0}}
.ba.kit .dk-crashfall{transform-box:fill-box;transform-origin:center}
.ba.kit .dk-tomdroop{transform-box:view-box;transform-origin:260px 196px;transition:transform .6s cubic-bezier(.3,1.6,.5,1)}
.ba.kit.st3 .dk-tomdroop{transform:rotate(22deg) translate(4px,6px)}
.ba.kit.dead .dk-tomdroop{transform:rotate(34deg) translate(6px,14px)}
.ba.kit .dk-tom{transform-box:fill-box;transform-origin:center}
.ba.kit.st3 .dk-snap{animation:dk-snap 1s ease-in forwards}
@keyframes dk-snap{0%{transform:none;opacity:1}25%{transform:translate(18px,-30px) rotate(40deg)}100%{transform:translate(60px,260px) rotate(320deg);opacity:0}}
.ba.kit .dk-snap{transform-box:fill-box;transform-origin:center}
.ba.kit .dk-cheek{transition:fill .4s,opacity .4s}
.ba.kit.rage .dk-cheek{fill:#E0473A;opacity:.8}
.ba.kit .dk-anger,.ba.kit .dk-steam{opacity:0;transition:opacity .4s}
.ba.kit.rage .dk-anger,.ba.kit.rage .dk-steam{opacity:1}
.ba.kit.dead .dk-anger,.ba.kit.dead .dk-steam,.ba.kit.dead .dk-grin{opacity:0}
.ba.kit.rage .ba-brow.l{transform:rotate(10deg)}
.ba.kit.rage .ba-brow.r{transform:rotate(-10deg)}
.ba.kit.rage.hit .ba-brow.l{transform:translateY(9px) rotate(10deg)}
.ba.kit.rage.hit .ba-brow.r{transform:translateY(9px) rotate(-10deg)}
.ba.kit .dk-hhrod,.ba.kit .dk-hhtop{transform-box:view-box;transform-origin:200px 76px}
.ba.kit.dead .dk-hhtop{animation:dk-spin 1.5s .2s cubic-bezier(.4,0,.7,1) forwards}
@keyframes dk-spin{0%{transform:none}15%{transform:translate(20px,-40px) scaleX(.2)}30%{transform:translate(50px,-10px) scaleX(1)}45%{transform:translate(80px,60px) scaleX(.2)}60%{transform:translate(104px,150px) scaleX(1)}75%{transform:translate(122px,240px) scaleX(.25)}88%{transform:translate(130px,284px) scaleX(1) rotate(8deg)}94%{transform:translate(130px,278px) rotate(-4deg)}100%{transform:translate(130px,284px) rotate(0)}}
.ba.kit .dk-w{opacity:0;transform-box:fill-box;transform-origin:center}
.ba.kit.taunt .dk-w.a{animation:dk-word .9s ease-out both}
.ba.kit.taunt .dk-w.b{animation:dk-word .75s ease-out .2s both}
.ba.kit.taunt .dk-w.c{animation:dk-word .5s ease-out .48s both}
@keyframes dk-word{0%{opacity:0;transform:scale(.2)}20%{opacity:1;transform:scale(1.25)}40%{transform:scale(1)}80%{opacity:1}100%{opacity:0;transform:translateY(-8px)}}
@media (prefers-reduced-motion:reduce){
 .ba.kit.st2 .dk-crashfall,.ba.kit.st3 .dk-snap{opacity:0}
 .ba.kit.dead .dk-hhtop{transform:translate(130px,284px)}
}
`;
  BossArt.register("kit", { name: "The Drum Kit", svg, css });
})();
