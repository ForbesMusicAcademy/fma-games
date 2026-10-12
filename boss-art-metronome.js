/* Tick-Tock, the metronome boss: a grumpy wooden pyramid metronome with a half-lidded glare.
   Idle: the pendulum (its brass bowler-hat weight riding on top) swings tick... tock, with little "tick"/"tock" pops,
   and the wind-up key on its side slowly turns. Rage: faster swing, red cheeks, steam, steeper brows.
   Taunt: the arm whacks side to side wildly while it shouts "TICK! TOCK!".
   Damage: a screw pops out and the wood cracks (25%), the weight slips down to its nose and it gets a plaster (50%),
   the arm bends and it sweats (75%). Defeated: the arm flops over, two springs boing out of the top, X eyes, tongue out.
   Loaded after boss-anim.js; registers itself with BossArt.register. */
(function(){
  if(!window.BossArt || !BossArt.register) return;
  const INK = "#23231F", GOLD = "#FFB805", GOLDD = "#E0A400", PINK = "#D4668C", CREAM = "#FBF8EF", SKY = "#8ECAE6";
  const WOOD = "#C98545", WOODL = "#E3A564", WOODD = "#9B5E2C", PLINTH = "#8A5226", STEEL = "#d9dde0";
  const st = `stroke="${INK}" stroke-linejoin="round" stroke-linecap="round"`;
  const FONT = `font-family="Nunito,ui-rounded,system-ui,sans-serif" font-weight="900"`;
  const starP = "M0 -9 L2.5 -2.5 L9 0 L2.5 2.5 L0 9 L-2.5 2.5 L-9 0 L-2.5 -2.5Z";
  const sp = (cls, x, y, delay) => `<g class="${cls}"><g transform="translate(${x} ${y})"><path class="ba-spark" d="${starP}" fill="${GOLD}" stroke="${INK}" stroke-width="1.5" style="animation-delay:${delay}s"/></g></g>`;
  // the tempo scale's tick marks
  const ticks = () => { let s = ""; for(let y = 94, i = 0; y <= 236; y += 14, i++){ const w = (16 + (y - 78) / 168 * 10) * (i % 2 ? .45 : .75); s += `M${(200 - w).toFixed(1)} ${y} L${(200 + w).toFixed(1)} ${y} `; } return s; };
  // a coil spring drawn up from 0,0 (pops out of the top when it's beaten)
  const spring = `<path d="M0 0 l-12 -6 l24 -9 l-24 -9 l24 -9 l-24 -9 l24 -9 l-24 -9 l24 -9 l-12 -5" fill="none" stroke="${INK}" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="M0 0 l-12 -6 l24 -9 l-24 -9 l24 -9 l-24 -9 l24 -9 l-24 -9 l24 -9 l-12 -5" fill="none" stroke="${STEEL}" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cy="-74" r="9" fill="${PINK}" ${st} stroke-width="4"/>`;
  const label = (cls, x, y, rot, txt, size) => `<g transform="translate(${x} ${y}) rotate(${rot})"><text class="${cls}" text-anchor="middle" ${FONT} font-size="${size}" fill="#fff" stroke="${INK}" stroke-width="${size / 4.5}" paint-order="stroke" stroke-linejoin="round">${txt}</text></g>`;
  const BODY = "M150 52 L250 52 L338 330 L62 330 Z";

  const svg = () => `<svg class="ba metronome" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <ellipse cx="200" cy="380" rx="130" ry="14" fill="${INK}" opacity=".18"/>
  <g class="ba-hitg"><g class="ba-all">
    <!-- wind-up key (behind the body) -->
    <rect x="296" y="243" width="56" height="14" rx="5" fill="${GOLDD}" ${st} stroke-width="5"/>
    <g class="tt-key"><rect x="348" y="216" width="28" height="68" rx="14" fill="${GOLD}" ${st} stroke-width="6"/>
      <circle cx="362" cy="234" r="5" fill="${GOLDD}"/><circle cx="362" cy="266" r="5" fill="${GOLDD}"/><path d="M356 226 L356 242" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".7"/></g>
    <!-- springs that boing out of the top when defeated -->
    <g class="dd"><g transform="translate(160 60) rotate(-34)"><g class="tt-spring">${spring}</g></g>
      <g transform="translate(242 60) rotate(30)"><g class="tt-spring b">${spring}</g></g></g>
    <!-- the wooden pyramid -->
    <path d="${BODY}" fill="${WOOD}" ${st} stroke-width="10"/>
    <path d="M152 58 L170 58 L90 326 L66 326 Z" fill="${WOODD}" opacity=".5"/>
    <path d="M236 58 L245 58 L328 324 L318 324 Z" fill="${WOODL}"/>
    <path d="M160 112 q8 -6 16 0 M226 142 q8 -6 16 0 q8 6 16 0 M100 300 q12 -9 24 0 q12 9 24 0 M256 300 q12 -9 24 0 q12 9 24 0" fill="none" stroke="${WOODD}" stroke-width="3.5" stroke-linecap="round"/>
    <g class="tt-cap"><rect x="134" y="34" width="132" height="26" rx="11" fill="${PLINTH}" ${st} stroke-width="9"/>
      <path d="M148 42 L230 42" stroke="${WOODL}" stroke-width="4" stroke-linecap="round" opacity=".7"/>
      <circle cx="200" cy="26" r="9" fill="${GOLD}" ${st} stroke-width="5"/></g>
    <!-- tempo scale -->
    <path d="M184 78 L216 78 L226 248 L174 248 Z" fill="${CREAM}" ${st} stroke-width="5"/>
    <path d="${ticks()}" stroke="#6b6558" stroke-width="3" stroke-linecap="round"/>
    <!-- plinth -->
    <rect x="70" y="358" width="42" height="14" rx="6" fill="${INK}"/><rect x="288" y="358" width="42" height="14" rx="6" fill="${INK}"/>
    <rect x="46" y="322" width="308" height="42" rx="14" fill="${PLINTH}" ${st} stroke-width="10"/>
    <path d="M66 334 L334 334" stroke="${WOODL}" stroke-width="4" stroke-linecap="round" opacity=".55"/>
    <g><circle cx="76" cy="345" r="7" fill="${STEEL}" ${st} stroke-width="3"/><path d="M72 349 L80 341" stroke="${INK}" stroke-width="2.5"/></g>
    <circle class="d1" cx="324" cy="345" r="6" fill="${INK}"/>
    <g class="tt-screw"><circle cx="324" cy="345" r="7" fill="${STEEL}" ${st} stroke-width="3"/><path d="M320 349 L328 341" stroke="${INK}" stroke-width="2.5"/></g>
    <!-- cheeks (go red in rage) -->
    <ellipse class="tt-cheek" cx="124" cy="264" rx="16" ry="8" fill="${PINK}" opacity=".55"/>
    <ellipse class="tt-cheek" cx="276" cy="264" rx="16" ry="8" fill="${PINK}" opacity=".55"/>
    <!-- grumpy half-lidded eyes -->
    <g class="ba-eye l"><circle cx="146" cy="222" r="28" fill="#fff" ${st} stroke-width="6"/><circle class="ba-pup l" cx="153" cy="228" r="12" fill="${INK}"/>
      <circle cx="157" cy="224" r="3.5" fill="#fff"/><path d="M120.7 210 A28 28 0 0 1 171.3 210 Z" fill="${WOOD}" ${st} stroke-width="5"/></g>
    <g class="ba-eye r"><circle cx="254" cy="222" r="28" fill="#fff" ${st} stroke-width="6"/><circle class="ba-pup r" cx="247" cy="228" r="12" fill="${INK}"/>
      <path d="M228.7 210 A28 28 0 0 1 279.3 210 Z" fill="${WOOD}" ${st} stroke-width="5"/>
      <path class="d3 ba-spiral" d="M254 226 m0 0 a3 3 0 1 1 6 0 a7 7 0 1 1 -14 0 a11 11 0 1 1 22 0 a15 15 0 1 1 -30 0" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/></g>
    <path class="dd" d="M128 206 L164 242 M164 206 L128 242 M236 206 L272 242 M272 206 L236 242" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
    <path class="ba-brow l" d="M112 186 L176 202" stroke="${INK}" stroke-width="13" stroke-linecap="round"/>
    <path class="ba-brow r" d="M288 186 L224 202" stroke="${INK}" stroke-width="13" stroke-linecap="round"/>
    <!-- mouths: grumpy, shouting (taunt), and defeated -->
    <g class="tt-frown"><path d="M158 318 Q200 276 242 318 Q200 304 158 318Z" fill="${INK}" ${st} stroke-width="4"/>
      <path d="M206 297 L216 299 L213 308 L206 307Z" fill="#fff" ${st} stroke-width="2"/></g>
    <g class="tt-shoutm"><ellipse cx="200" cy="304" rx="22" ry="16" fill="${INK}"/><ellipse cx="200" cy="313" rx="12" ry="5" fill="${PINK}"/></g>
    <g class="dd"><path d="M206 310 Q206 334 216 332 Q224 328 220 310Z" fill="${PINK}" ${st} stroke-width="4"/>
      <path d="M166 308 Q178 298 190 308 Q202 318 214 308 Q226 298 236 306" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/></g>
    <!-- damage -->
    <path class="d1" d="M234 66 L246 92 L236 106 L256 132" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <ellipse class="d1" cx="104" cy="304" rx="13" ry="7" fill="${INK}" opacity=".25"/>
    <path class="d2" d="M76 318 L94 302 L88 290 L104 278" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <g class="d2"><g transform="translate(158 104) rotate(-32)"><rect x="-19" y="-8" width="38" height="16" rx="7" fill="#F3C9A6" ${st} stroke-width="4"/>
      <rect x="-6" y="-8" width="12" height="16" fill="#E8B48C"/><circle cx="-12" cy="-2" r="1.6" fill="${INK}"/><circle cx="12" cy="2" r="1.6" fill="${INK}"/></g></g>
    <path class="d3" d="M148 326 L160 340 L152 350 L166 362" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <g class="d3"><path class="ba-sweat" d="M306 168 Q318 190 306 202 Q294 190 306 168Z" fill="${SKY}" stroke="${INK}" stroke-width="3"/></g>
    ${sp("d3", 128, 140, 0)}${sp("d3", 300, 300, .8)}${sp("d2", 98, 330, .4)}
    <!-- the pendulum: swings from the brass hub (its nose) -->
    <g class="tt-arm">
      <rect x="194" y="146" width="12" height="128" rx="6" fill="${STEEL}" ${st} stroke-width="5"/>
      <g class="tt-armtop"><rect x="194" y="56" width="12" height="100" rx="6" fill="${STEEL}" ${st} stroke-width="5"/>
        <circle cx="200" cy="56" r="9" fill="${GOLD}" ${st} stroke-width="5"/></g>
      <circle class="d3" cx="200" cy="152" r="8" fill="${STEEL}" ${st} stroke-width="4"/>
      <g class="tt-wt"><path d="M182 96 Q200 84 218 96 L222 124 L178 124 Z" fill="${GOLD}" ${st} stroke-width="6"/>
        <rect x="179" y="111" width="42" height="8" fill="${PINK}"/>
        <path d="M188 98 L186 108" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".75"/>
        <rect x="164" y="121" width="72" height="11" rx="5.5" fill="${GOLD}" ${st} stroke-width="6"/>
        <path d="M222 112 L230 112" stroke="${INK}" stroke-width="5" stroke-linecap="round"/></g>
    </g>
    <circle cx="200" cy="272" r="16" fill="${GOLD}" ${st} stroke-width="6"/><circle cx="200" cy="272" r="5" fill="${INK}"/>
    <path d="M190 264 A12 12 0 0 1 198 260" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".8"/>
    <!-- tick / tock pops on the beat, and rage steam -->
    <g class="tt-pops">${label("tt-pop tick", 70, 136, -10, "tick", 24)}${label("tt-pop tock", 330, 136, 10, "tock", 24)}</g>
    <g class="tt-steam"><circle class="ba-smoke" cx="146" cy="40" r="16" fill="#efe9dc" stroke="${INK}" stroke-width="3"/>
      <circle class="ba-smoke" cx="256" cy="40" r="14" fill="#efe9dc" stroke="${INK}" stroke-width="3" style="animation-delay:.9s"/></g>
    <g class="dd"><circle class="ba-smoke" cx="186" cy="30" r="18" fill="#aaa" style="animation-delay:.3s"/><circle class="ba-smoke" cx="222" cy="34" r="15" fill="#bbb" style="animation-delay:1.1s"/></g>
    <g class="ba-flash"><path d="${BODY}" fill="#fff"/><rect x="46" y="322" width="308" height="42" rx="14" fill="#fff"/><rect x="134" y="34" width="132" height="26" rx="11" fill="#fff"/></g>
    <g class="tt-shout">${label("tt-sh a", 84, 96, -14, "TICK!", 40)}${label("tt-sh b", 318, 96, 14, "TOCK!", 40)}</g>
  </g></g>
  <g class="ba-fx"></g>
</svg>`;

  const css = `
.ba.metronome .tt-arm{transform-box:view-box;transform-origin:200px 272px;animation:tt-swing 1.6s ease-in-out infinite alternate}
@keyframes tt-swing{0%{transform:rotate(-15deg)}100%{transform:rotate(15deg)}}
.ba.metronome.rage .tt-arm{animation-duration:.7s}
.ba.metronome.taunt .tt-arm{animation:tt-whack .9s ease-in-out}
@keyframes tt-whack{0%{transform:rotate(0)}12%{transform:rotate(-34deg)}26%{transform:rotate(34deg)}40%{transform:rotate(-34deg)}54%{transform:rotate(34deg)}68%{transform:rotate(-28deg)}84%{transform:rotate(16deg)}100%{transform:rotate(0)}}
.ba.metronome.dead .tt-arm{animation:tt-flop 1.1s .2s cubic-bezier(.4,0,.6,1) forwards}
@keyframes tt-flop{0%{transform:rotate(0)}55%{transform:rotate(-90deg)}72%{transform:rotate(-74deg)}86%{transform:rotate(-84deg)}100%{transform:rotate(-80deg)}}
.ba.metronome .tt-armtop{transform-box:view-box;transform-origin:200px 152px;transition:transform .5s cubic-bezier(.3,1.6,.5,1)}
.ba.metronome.st3 .tt-armtop{transform:rotate(26deg)}
.ba.metronome.dead .tt-armtop{transform:rotate(100deg);transition-delay:.9s}
.ba.metronome .tt-wt{transition:transform .7s cubic-bezier(.5,0,.6,1.5)}
.ba.metronome.st2 .tt-wt{transform:translateY(74px)}
.ba.metronome .tt-key{transform-box:fill-box;transform-origin:center;animation:tt-key 2.6s ease-in-out infinite}
@keyframes tt-key{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.18)}}
.ba.metronome.rage .tt-key{animation-duration:1s}
.ba.metronome.dead .tt-key{animation:none}
.ba.metronome.st1 .tt-screw{animation:tt-screw 1s ease-in forwards}
@keyframes tt-screw{0%{transform:none;opacity:1}30%{transform:translate(26px,-70px) rotate(200deg)}100%{transform:translate(70px,40px) rotate(560deg);opacity:0}}
.ba.metronome .tt-screw{transform-box:fill-box;transform-origin:center}
.ba.metronome .tt-cheek{transition:fill .4s,opacity .4s}
.ba.metronome.rage .tt-cheek{fill:#E0473A;opacity:.8}
.ba.metronome.rage .ba-brow.l{transform:rotate(9deg)}
.ba.metronome.rage .ba-brow.r{transform:rotate(-9deg)}
.ba.metronome.rage.hit .ba-brow.l{transform:translateY(9px) rotate(9deg)}
.ba.metronome.rage.hit .ba-brow.r{transform:translateY(9px) rotate(-9deg)}
.ba.metronome .tt-steam{opacity:0;transition:opacity .4s}
.ba.metronome.rage .tt-steam{opacity:1}
.ba.metronome.dead .tt-steam,.ba.metronome.dead .tt-pops,.ba.metronome.dead .tt-frown,.ba.metronome.taunt .tt-pops{opacity:0}
.ba.metronome .tt-shoutm,.ba.metronome .tt-shout{opacity:0}
.ba.metronome.taunt .tt-shoutm,.ba.metronome.taunt .tt-shout{opacity:1}
.ba.metronome.taunt .tt-frown{opacity:0}
.ba.metronome .tt-sh{transform-box:fill-box;transform-origin:center}
.ba.metronome.taunt .tt-sh{animation:tt-shout .9s ease-out both}
.ba.metronome.taunt .tt-sh.b{animation-delay:.14s}
@keyframes tt-shout{0%{transform:scale(.2);opacity:0}16%{transform:scale(1.2);opacity:1}30%{transform:scale(1)}80%{opacity:1}100%{transform:scale(1.05) translateY(-8px);opacity:0}}
.ba.metronome .tt-pop{transform-box:fill-box;transform-origin:center;opacity:0;animation:tt-pop 3.2s ease-out infinite}
.ba.metronome .tt-pop.tock{animation-delay:1.6s}
.ba.metronome.rage .tt-pop{animation-duration:1.4s}
.ba.metronome.rage .tt-pop.tock{animation-delay:.7s}
@keyframes tt-pop{0%{opacity:0;transform:scale(.5)}4%{opacity:1;transform:scale(1.15)}22%{opacity:1;transform:scale(1) translateY(-6px)}34%,100%{opacity:0;transform:translateY(-14px)}}
.ba.metronome .tt-cap{transform-box:view-box;transform-origin:200px 52px;transition:transform .5s cubic-bezier(.3,1.8,.5,1)}
.ba.metronome.dead .tt-cap{transform:translate(-8px,-16px) rotate(-14deg)}
.ba.metronome .tt-spring{transform-box:fill-box;transform-origin:50% 100%;transform:scaleY(0)}
.ba.metronome.dead .tt-spring{animation:tt-boing 1.2s .35s cubic-bezier(.3,0,.4,1) forwards}
.ba.metronome.dead .tt-spring.b{animation-delay:.5s}
@keyframes tt-boing{0%{transform:scaleY(0)}28%{transform:scaleY(1.45)}46%{transform:scaleY(.72)}62%{transform:scaleY(1.22)}78%{transform:scaleY(.9)}100%{transform:scaleY(1)}}
@media (prefers-reduced-motion:reduce){
 .ba.metronome.dead .tt-arm{transform:rotate(-80deg)}
 .ba.metronome.dead .tt-spring{transform:none}
 .ba.metronome.st1 .tt-screw{opacity:0}
}
`;
  BossArt.register("metronome", { name: "Tick-Tock", svg, css });
})();
