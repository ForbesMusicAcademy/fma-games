/* The Smoke Machine — the final boss. A big pink-and-gold stage fog box on caster wheels: two chunky par-can stage lights
   on top are its eyes (barn doors for eyebrows, coloured beams shining up), a vent grille is its toothy grin, a chasing-bulb
   HEADLINER marquee on its chest, a crown worn at a jaunty angle, an exhaust pipe, a fog gauge and a power-cord tail.
   Idle: smoke puffs drift up, the beams sweep, the marquee bulbs chase, the gauge jiggles. Taunt: a huge FWOOSH of
   smoke while the lights flash and swing. Rage: red-hot lenses and beams, the gauge in the red, everything faster.
   Damage: bulbs blow, a lens cracks, the access panel pops loose, the smoke turns grey and sputters, a wheel rolls away.
   Dead: lights out, X eyes, one last sad puff, slumped on its missing wheel. */
(function(){
  const INK = "#23231F", PINK = "#D4668C", PINKD = "#B04F75", GOLD = "#FFB805", GOLDD = "#E0A400", SKY = "#8ECAE6";
  const S = `stroke="${INK}" stroke-linejoin="round" stroke-linecap="round"`;
  const BOX = `x="52" y="150" width="296" height="178" rx="26"`;
  const CLOUD = "M-34 12 C-50 12 -50 -12 -32 -12 C-32 -32 -6 -36 2 -22 C10 -38 38 -30 34 -10 C52 -10 52 12 34 12 Z";
  const cloud = (x, y, s, cls, d) => `<g transform="translate(${x} ${y}) scale(${s})"><g class="${cls}" style="animation-delay:${d}s"><path class="sm-cloud" d="${CLOUD}" ${S} stroke-width="5"/><path d="M-30 -2 C-30 -12 -20 -16 -14 -12" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/></g></g>`;
  // marquee bulbs around the HEADLINER sign, numbered so they chase
  let bulbs = "", n = 0;
  const bulb = (x, y) => { bulbs += `<circle class="sm-bulb" cx="${x}" cy="${y}" r="4.6" fill="#FFF3B0" stroke="${INK}" stroke-width="2" style="animation-delay:${(n++ * .09).toFixed(2)}s"/>`; };
  for(let x = 104; x <= 296; x += 16) bulb(x, 168);
  bulb(310, 190);
  for(let x = 296; x >= 104; x -= 16) bulb(x, 212);
  bulb(90, 190);
  const dud = (x, y) => `<circle cx="${x}" cy="${y}" r="4.6" fill="#6b6558" stroke="${INK}" stroke-width="2"/><path d="M${x - 3} ${y - 2} l3 2 l-1 3" fill="none" stroke="${INK}" stroke-width="1.5"/>`;
  // hazard stripes along the bottom
  let stripes = ""; for(let x = 70; x <= 318; x += 22) stripes += `<path d="M${x} 322 L${x + 10} 304 L${x + 20} 304 L${x + 10} 322 Z" fill="${INK}"/>`;
  // vent bars = teeth
  let teeth = ""; for(let x = 128; x <= 268; x += 20) teeth += `<rect x="${x}" y="236" width="12" height="44" rx="4" fill="#E8E1D2" stroke="${INK}" stroke-width="2.5"/>`;
  const screw = (x, y) => `<circle cx="${x}" cy="${y}" r="5.5" fill="${GOLD}" stroke="${INK}" stroke-width="2.5"/><path d="M${x - 3} ${y - 3} L${x + 3} ${y + 3}" stroke="${INK}" stroke-width="2"/>`;
  // a par-can stage light that is also an eye
  const can = (cx, cy, side, extra) => `<g class="sm-can ${side}">
      <circle class="sm-halo" cx="${cx}" cy="${cy}" r="64" fill="${GOLD}"/>
      <path d="M${cx - 52} ${cy} Q${cx - 52} ${cy + 60} ${cx} ${cy + 60} Q${cx + 52} ${cy + 60} ${cx + 52} ${cy}" fill="none" stroke="${INK}" stroke-width="20" stroke-linecap="round"/>
      <path d="M${cx - 52} ${cy} Q${cx - 52} ${cy + 60} ${cx} ${cy + 60} Q${cx + 52} ${cy + 60} ${cx + 52} ${cy}" fill="none" stroke="${GOLD}" stroke-width="10" stroke-linecap="round"/>
      <circle cx="${cx}" cy="${cy}" r="50" fill="#3a3a38" ${S} stroke-width="8"/>
      <circle cx="${cx}" cy="${cy}" r="42" fill="#6b6558" ${S} stroke-width="4"/>
      <path d="M${cx - 34} ${cy - 30} A46 46 0 0 1 ${cx + 10} ${cy - 46}" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".45"/>
      <g class="ba-eye ${side}"><circle class="sm-lens" cx="${cx}" cy="${cy}" r="35" stroke="${INK}" stroke-width="5"/>
        <g class="ba-pup ${side}"><circle cx="${cx + (side === "l" ? 8 : -8)}" cy="${cy + 6}" r="14" fill="${INK}"/><circle cx="${cx + (side === "l" ? 12 : -4)}" cy="${cy + 1}" r="4.5" fill="#fff"/></g>
        <path d="M${cx - 22} ${cy - 18} A28 28 0 0 1 ${cx - 4} ${cy - 27}" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>${extra}</g>
      <circle cx="${cx - 52}" cy="${cy}" r="7" fill="${GOLD}" ${S} stroke-width="3.5"/><circle cx="${cx + 52}" cy="${cy}" r="7" fill="${GOLD}" ${S} stroke-width="3.5"/>
    </g>`;
  const wheel = (x) => `<circle cx="${x}" cy="350" r="20" fill="#3a3a38" ${S} stroke-width="7"/><circle cx="${x}" cy="350" r="8" fill="#C9CED2" ${S} stroke-width="3.5"/><path d="M${x - 12} ${x > 200 ? 338 : 340} a16 16 0 0 1 10 -6" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".5"/>`;
  const bracket = (x) => `<path d="M${x - 16} 322 L${x + 16} 322 L${x + 8} 346 L${x - 8} 346 Z" fill="${GOLDD}" ${S} stroke-width="5"/>`;
  const star = (x, y, d) => `<g class="d3"><g transform="translate(${x} ${y})"><path class="ba-spark" d="M0 -9 L2.5 -2.5 L9 0 L2.5 2.5 L0 9 L-2.5 2.5 L-9 0 L-2.5 -2.5Z" fill="${GOLD}" style="animation-delay:${d}s"/></g></g>`;
  const svg = () => `<svg class="ba smoke" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <ellipse cx="200" cy="380" rx="130" ry="14" fill="${INK}" opacity=".18"/>
  <g class="ba-hitg"><g class="ba-all">
    <!-- coloured beams shining up from behind the lights -->
    <g class="sm-beam l"><path d="M138 100 L28 -30 L120 -40 Z" fill="${SKY}" opacity=".5"/></g>
    <g class="sm-beam r"><path d="M262 100 L280 -40 L372 -30 Z" fill="${GOLD}" opacity=".45"/></g>
    <!-- exhaust pipe and its puffs -->
    <path d="M54 262 H34 Q26 262 26 254 V150" fill="none" stroke="${INK}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M54 262 H34 Q26 262 26 254 V150" fill="none" stroke="#C9CED2" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 136 L40 136 L36 154 L16 154 Z" fill="#C9CED2" ${S} stroke-width="6"/>
    <!-- power-cord tail -->
    <path d="M346 300 C384 300 396 330 372 346 C356 356 372 370 388 362" fill="none" stroke="${INK}" stroke-width="14" stroke-linecap="round"/>
    <path d="M346 300 C384 300 396 330 372 346 C356 356 372 370 388 362" fill="none" stroke="#3a3a38" stroke-width="6" stroke-linecap="round"/>
    <!-- wheels -->
    ${bracket(100)}${bracket(300)}
    <g class="sm-wheel l">${wheel(100)}</g>${wheel(300)}
    <!-- the box -->
    <rect ${BOX} fill="${PINK}" ${S} stroke-width="10"/>
    <path d="M70 158 H330" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".35"/>
    <rect x="60" y="302" width="280" height="22" rx="8" fill="${GOLD}"/>${stripes}
    <path d="M57 302 H343 M57 324 H343" stroke="${INK}" stroke-width="5"/>
    ${screw(70, 168)}${screw(330, 168)}${screw(70, 290)}${screw(330, 290)}
    <!-- HEADLINER marquee -->
    <rect x="90" y="168" width="220" height="44" rx="12" fill="${INK}" stroke="${INK}" stroke-width="4"/>
    <text x="200" y="198" text-anchor="middle" font-family="Nunito,ui-rounded,system-ui,sans-serif" font-weight="900" font-size="22" letter-spacing="1.5" fill="${GOLD}">HEADLINER</text>
    ${bulbs}
    <g class="d1">${dud(152, 168)}${dud(296, 212)}</g><g class="d2">${dud(232, 168)}${dud(90, 190)}${dud(168, 212)}</g><g class="d3">${dud(120, 168)}${dud(264, 168)}${dud(232, 212)}${dud(310, 190)}</g>
    <g class="sm-dark">${bulbs.replace(/sm-bulb/g, "sm-off")}</g>
    <!-- the vent-grille grin -->
    <path d="M112 232 Q200 222 288 232 Q292 290 200 292 Q108 290 112 232 Z" fill="${INK}" ${S} stroke-width="6"/>
    ${teeth}
    <path d="M112 232 Q200 222 288 232 Q292 290 200 292 Q108 290 112 232 Z" fill="none" ${S} stroke-width="7"/>
    <g class="d3"><rect x="208" y="236" width="12" height="44" rx="4" fill="${INK}"/></g>
    <!-- fog gauge (right) -->
    <circle cx="318" cy="252" r="19" fill="#FBF8EF" ${S} stroke-width="5"/>
    <path d="M305 258 A14 14 0 0 1 306 244" fill="none" stroke="#4fb86a" stroke-width="4"/><path d="M330 244 A14 14 0 0 1 331 258" fill="none" stroke="#E25B4A" stroke-width="4"/>
    <g class="sm-needle"><path d="M318 252 L318 238" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/></g><circle cx="318" cy="252" r="3.5" fill="${INK}"/>
    <!-- access panel (left): pops loose and swings on one screw -->
    <g class="d2"><rect x="62" y="226" width="40" height="64" rx="6" fill="${INK}"/><path d="M70 236 q10 8 0 16 q-10 8 0 16 M90 234 C80 250 98 260 86 280" fill="none" stroke="${GOLD}" stroke-width="3.5" stroke-linecap="round"/></g>
    ${star(82, 236, 0)}
    <g class="sm-panel"><rect x="62" y="226" width="40" height="64" rx="6" fill="${PINKD}" ${S} stroke-width="5"/>
      <circle cx="82" cy="246" r="9" fill="${GOLD}" ${S} stroke-width="3.5"/><path d="M82 246 L82 239" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <rect x="75" y="264" width="14" height="18" rx="4" fill="#3a3a38" ${S} stroke-width="3"/><rect class="sm-toggle" x="78" y="266" width="8" height="8" rx="2" fill="#E25B4A"/>
      <circle cx="68" cy="232" r="3" fill="${GOLD}" stroke="${INK}" stroke-width="1.5"/><circle cx="96" cy="284" r="3" fill="${GOLD}" stroke="${INK}" stroke-width="1.5"/></g>
    <!-- cracks, dents and drips on the box -->
    <path class="d1" d="M330 186 L316 200 L326 210 L312 224" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
    <ellipse class="d2" cx="232" cy="300" rx="16" ry="6" fill="${INK}" opacity=".25"/>
    <path class="d3" d="M150 296 L164 310 L156 318" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
    <g class="d1"><path class="ba-sweat" d="M346 196 Q356 214 346 224 Q336 214 346 196Z" fill="${SKY}" stroke="${INK}" stroke-width="3"/></g>
    <g class="d3"><path class="ba-sweat" d="M56 190 Q66 208 56 218 Q46 208 56 190Z" fill="${SKY}" stroke="${INK}" stroke-width="3" style="animation-delay:.7s"/></g>
    ${star(300, 228, .6)}${star(200, 150, 1.2)}
    <!-- the lights (eyes), barn-door brows and the crown -->
    ${can(138, 104, "l", `<path class="d2" d="M118 86 L134 102 L126 110 L142 124 M134 102 L150 96" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`)}
    ${can(262, 104, "r", `<path class="d3 ba-spiral" d="M262 106 m0 0 a3 3 0 1 1 6 0 a8 8 0 1 1 -16 0 a13 13 0 1 1 26 0 a18 18 0 1 1 -36 0" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`)}
    <g class="dd"><circle cx="138" cy="104" r="35" fill="#4a4a48" stroke="${INK}" stroke-width="5"/><circle cx="262" cy="104" r="35" fill="#4a4a48" stroke="${INK}" stroke-width="5"/>
      <path d="M124 90 L152 118 M152 90 L124 118 M248 90 L276 118 M276 90 L248 118" stroke="#E8E1D2" stroke-width="7" stroke-linecap="round"/></g>
    <g class="sm-bl"><path class="ba-brow" d="M86 48 L188 66 L184 80 L84 62 Z" fill="#3a3a38" ${S} stroke-width="6"/></g>
    <g class="sm-br"><path class="ba-brow" d="M314 44 L212 64 L216 78 L316 58 Z" fill="#3a3a38" ${S} stroke-width="6"/></g>
    <g class="sm-crown"><g transform="translate(290 34) rotate(18)"><path d="M-28 12 L-32 -16 L-15 -2 L0 -24 L15 -2 L32 -16 L28 12 Z" fill="${GOLD}" ${S} stroke-width="5"/>
      <rect x="-30" y="8" width="60" height="10" rx="4" fill="${GOLDD}" ${S} stroke-width="4"/><circle cx="0" cy="13" r="3.5" fill="${PINK}"/><circle cx="-16" cy="13" r="2.5" fill="${SKY}"/><circle cx="16" cy="13" r="2.5" fill="${SKY}"/><circle cx="0" cy="-24" r="4" fill="${PINK}" ${S} stroke-width="2.5"/></g></g>
    <!-- smoke puffs: from the exhaust pipe and the corners of the grin -->
    <g class="sm-puffs">${cloud(26, 112, 1.1, "sm-puff", 0)}${cloud(26, 112, .9, "sm-puff", 1.3)}${cloud(116, 234, .6, "sm-puff s", .6)}${cloud(284, 234, .6, "sm-puff s", 1.9)}</g>
    <g class="dd">${cloud(26, 116, .7, "sm-last", 0)}</g>
    <!-- taunt: the big FWOOSH -->
    <g class="sm-blast">${cloud(200, 262, 2.2, "sm-big", 0)}
      <text x="200" y="272" text-anchor="middle" font-family="Nunito,ui-rounded,system-ui,sans-serif" font-weight="900" font-size="34" fill="${PINK}" stroke="${INK}" stroke-width="7" paint-order="stroke">FWOOSH!</text></g>
    <g class="ba-flash"><rect ${BOX} fill="#fff"/><circle cx="138" cy="104" r="54" fill="#fff"/><circle cx="262" cy="104" r="54" fill="#fff"/></g>
  </g></g>
  <g class="ba-fx"></g>
</svg>`;
  const V = "transform-box:view-box";
  const css = `
.ba.smoke .sm-lens{fill:#FFF8DA;transition:fill .4s}
.ba.smoke.rage .sm-lens{fill:#FFC9BD}
.ba.smoke .sm-halo{opacity:.22;transform-box:fill-box;transform-origin:center;animation:sm-halo 1.8s ease-in-out infinite}
@keyframes sm-halo{0%,100%{opacity:.14;transform:scale(.92)}50%{opacity:.32;transform:scale(1.04)}}
.ba.smoke.rage .sm-halo{fill:#E25B4A;animation-duration:.7s}
.ba.smoke .sm-beam{${V};transition:opacity .4s}
.ba.smoke .sm-beam.l{transform-origin:138px 100px;animation:sm-sweepl 3.4s ease-in-out infinite}
.ba.smoke .sm-beam.r{transform-origin:262px 100px;animation:sm-sweepr 3.4s ease-in-out infinite}
@keyframes sm-sweepl{0%,100%{transform:rotate(-12deg)}50%{transform:rotate(16deg)}}
@keyframes sm-sweepr{0%,100%{transform:rotate(12deg)}50%{transform:rotate(-16deg)}}
.ba.smoke.rage .sm-beam path{fill:#E25B4A}
.ba.smoke.rage .sm-beam{animation-duration:1.3s}
.ba.smoke.st2 .sm-beam.l{opacity:0}
.ba.smoke.st3 .sm-beam.r{animation:sm-sweepr 1.3s ease-in-out infinite,sm-flicker .9s steps(2) infinite}
@keyframes sm-flicker{0%,60%{opacity:1}70%{opacity:.1}80%{opacity:.8}90%{opacity:0}}
.ba.smoke.taunt .sm-beam{animation:sm-spin .9s ease-in-out,sm-flash .15s steps(2) 6;opacity:1}
@keyframes sm-spin{0%{transform:rotate(0)}50%{transform:rotate(-40deg)}100%{transform:rotate(30deg)}}
@keyframes sm-flash{50%{opacity:.2}}
.ba.smoke .sm-bulb{animation:sm-chase 1.2s steps(1) infinite}
@keyframes sm-chase{0%{fill:#FFF3B0}33%{fill:${GOLD}}66%{fill:#FFFDF0}}
.ba.smoke.rage .sm-bulb{animation-duration:.45s}
.ba.smoke .sm-dark,.ba.smoke .sm-big,.ba.smoke .sm-blast{opacity:0}
.ba.smoke.dead .sm-dark{opacity:1}
.ba.smoke .sm-off{fill:#6b6558}
.ba.smoke .sm-cloud{fill:#fff;transition:fill .6s}
.ba.smoke.st2 .sm-cloud{fill:#C9C4BB}.ba.smoke.st3 .sm-cloud{fill:#9a958c}
.ba.smoke .sm-puff{opacity:0;animation:sm-puff 2.6s ease-out infinite}
.ba.smoke .sm-puff.s{animation-name:sm-puffs}
@keyframes sm-puff{0%{opacity:0;transform:translate(0,0) scale(.4)}15%{opacity:1}100%{opacity:0;transform:translate(14px,-130px) scale(1.4)}}
@keyframes sm-puffs{0%{opacity:0;transform:translate(0,0) scale(.4)}15%{opacity:1}100%{opacity:0;transform:translate(0,-90px) scale(1.5)}}
.ba.smoke.rage .sm-puff{animation-duration:1.3s}
.ba.smoke.st2 .sm-puff{animation-timing-function:steps(6)}
.ba.smoke.st3 .sm-puff.s{display:none}
.ba.smoke.dead .sm-puffs{display:none}
.ba.smoke .sm-last{opacity:0}
.ba.smoke.dead .sm-last{animation:sm-last 3s 1s ease-out forwards}
@keyframes sm-last{0%{opacity:0;transform:translate(0,0) scale(.3)}20%{opacity:1}100%{opacity:0;transform:translate(8px,-70px) scale(1)}}
.ba.smoke.taunt .sm-blast{opacity:1}
.ba.smoke.taunt .sm-big{animation:sm-big .9s ease-out forwards}
@keyframes sm-big{0%{opacity:0;transform:scale(.2)}20%{opacity:1;transform:scale(1)}70%{opacity:1}100%{opacity:0;transform:translateY(-30px) scale(1.3)}}
.ba.smoke .sm-blast text{transform-box:fill-box;transform-origin:center}
.ba.smoke.taunt .sm-blast text{animation:sm-word .9s ease-out forwards}
@keyframes sm-word{0%{opacity:0;transform:scale(.3)}25%{opacity:1;transform:scale(1.15) rotate(-4deg)}75%{opacity:1;transform:scale(1)}100%{opacity:0;transform:translateY(-20px)}}
.ba.smoke.taunt .sm-halo{animation:sm-strobe .15s steps(2) 6;fill:#fff}
@keyframes sm-strobe{0%{opacity:.8;transform:scale(1.15)}100%{opacity:.1}}
.ba.smoke .sm-needle{${V};transform-origin:318px 252px;animation:sm-needle 1.4s ease-in-out infinite}
@keyframes sm-needle{0%,100%{transform:rotate(-30deg)}50%{transform:rotate(-12deg)}}
.ba.smoke.rage .sm-needle{animation-name:sm-needler;animation-duration:.3s}
@keyframes sm-needler{0%,100%{transform:rotate(55deg)}50%{transform:rotate(72deg)}}
.ba.smoke.dead .sm-needle{animation:none;transform:rotate(-70deg)}
.ba.smoke .sm-bl,.ba.smoke .sm-br{${V};transition:transform .4s}
.ba.smoke .sm-bl{transform-origin:186px 72px}.ba.smoke .sm-br{transform-origin:214px 70px}
.ba.smoke.rage .sm-bl{transform:rotate(8deg)}.ba.smoke.rage .sm-br{transform:rotate(-8deg)}
.ba.smoke.dead .sm-bl{transform:rotate(-14deg) translateY(10px)}.ba.smoke.dead .sm-br{transform:rotate(14deg) translateY(10px)}
.ba.smoke .sm-panel{${V};transform-origin:96px 284px;transition:transform .8s cubic-bezier(.3,1.6,.5,1)}
.ba.smoke.st2 .sm-panel{transform:rotate(-62deg)}
.ba.smoke.st3 .sm-panel{transform:rotate(-78deg)}
.ba.smoke .sm-toggle{animation:sm-toggle 2s steps(1) infinite}
@keyframes sm-toggle{50%{transform:translateY(8px)}}
.ba.smoke .sm-crown{${V};transform-origin:290px 50px;transition:transform .6s cubic-bezier(.3,1.6,.5,1)}
.ba.smoke.st3 .sm-crown{transform:rotate(16deg) translate(6px,8px)}
.ba.smoke.dead .sm-crown{transform:rotate(34deg) translate(18px,26px)}
.ba.smoke .sm-wheel{transform-box:fill-box;transform-origin:center}
.ba.smoke.st3 .sm-wheel{animation:sm-roll 1.4s cubic-bezier(.3,0,.6,1) forwards}
@keyframes sm-roll{0%{transform:none;opacity:1}15%{transform:translate(4px,-8px)}70%{opacity:1}100%{transform:translate(-110px,0) rotate(-400deg);opacity:0}}
.ba.smoke.st3{--tilt:-4deg}
.ba.smoke.dead .ba-led{animation:none}
.ba.smoke.dead .sm-beam,.ba.smoke.dead .sm-halo{opacity:0!important;animation:none}
@media (prefers-reduced-motion:reduce){.ba.smoke *{animation:none!important}.ba.smoke.st3 .sm-wheel{opacity:0}.ba.smoke .sm-puff{opacity:.8}.ba.smoke.dead .sm-puff{opacity:0}}
`;
  BossArt.register("smoke", { name: "The Smoke Machine", svg, css });
})();
