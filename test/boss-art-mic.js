/* Feedback — a microphone monster on a mic stand. The silver grille ball is its head (mesh lines, a big shouty mouth),
   the stand's tripod legs are its legs (pink rubber boots) and a curly pink lead is its tail, with a plug on the end.
   Idle: wobbles on the stand while little sound rings pulse out and the tail wags. Taunt: SKREEE! it leans in, squeezes
   its eyes shut and big jagged feedback rings blast out. Damage: the grille dents, the stand kinks and leans, a leg
   wobbles off, the mesh gets a hole with a spring poking out. Rage: red-hot grille, red cheeks, steam, red rings.
   Dead: it topples over onto its side with X eyes, its lead in a pile. */
(function(){
  const INK = "#23231F", PINK = "#D4668C", GOLD = "#FFB805", SKY = "#8ECAE6";
  const SIL = "#C9CED2", SIL2 = "#9AA1A8";
  const S = `stroke="${INK}" stroke-linejoin="round" stroke-linecap="round"`;
  const HX = 200, HY = 104, HR = 84;            // the grille head
  const HANDLE = "M140 204 L260 204 L238 248 Q200 258 162 248 Z";
  // the grille: a silver ball with latitude/longitude mesh lines, a shine and a shadow
  const grille = () => {
    let m = "";
    [62, 34].forEach(rx => { m += `<ellipse cx="${HX}" cy="${HY}" rx="${rx}" ry="${HR}" fill="none"/>`; });
    m += `<path d="M${HX} ${HY - HR} V${HY + HR}"/>`;
    [-56, -28, 0, 28, 56].forEach(dy => { const w = Math.sqrt(HR * HR - dy * dy); m += `<path d="M${HX - w} ${HY + dy} Q${HX} ${HY + dy + 8} ${HX + w} ${HY + dy}" fill="none"/>`; });
    return `<circle cx="${HX}" cy="${HY}" r="${HR}" fill="${SIL}" ${S} stroke-width="9"/>
      <g stroke="${SIL2}" stroke-width="3">${m}</g>
      <path d="M${HX + 70} ${HY + 40} A${HR - 6} ${HR - 6} 0 0 1 ${HX - 40} ${HY + 74}" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round" opacity=".14"/>
      <ellipse cx="${HX - 44}" cy="${HY - 52}" rx="22" ry="12" transform="rotate(-38 ${HX - 44} ${HY - 52})" fill="#fff" opacity=".85"/>
      <circle cx="${HX - 66}" cy="${HY - 22}" r="5" fill="#fff" opacity=".8"/>
      <circle class="mc-hot" cx="${HX}" cy="${HY}" r="${HR - 4}" fill="#E25B4A"/>`;
  };
  // the band and handle under the head (an on/off switch and a little LED)
  const handle = () => `<path d="${HANDLE}" fill="#3a3a38" ${S} stroke-width="8"/>
      <path d="M156 212 L172 244" stroke="#6b6558" stroke-width="7" stroke-linecap="round"/>
      <rect x="208" y="214" width="20" height="12" rx="4" fill="${GOLD}" ${S} stroke-width="3.5"/>
      <circle class="ba-led" cx="186" cy="222" r="5" fill="${PINK}"/>
      <rect x="128" y="180" width="144" height="30" rx="12" fill="#6b6558" ${S} stroke-width="8"/>
      <path d="M140 190 H260 M140 200 H260" stroke="${INK}" stroke-width="2.5" opacity=".35"/>`;
  // a jagged feedback ring
  const jag = (r, n) => { let d = ""; for(let i = 0; i < n * 2; i++){ const a = Math.PI * i / n, rr = i % 2 ? r - 16 : r; d += (i ? "L" : "M") + (HX + rr * Math.cos(a)).toFixed(1) + " " + (HY + rr * Math.sin(a)).toFixed(1); } return d + "Z"; };
  // the curly lead: loops along a line, then a tail sweeping up to a plug
  const coil = (x0, y0, x1, y1, loops, r) => { let d = ""; const N = 140;
    for(let i = 0; i <= N; i++){ const u = i / N, a = u * loops * 2 * Math.PI, cx = x0 + (x1 - x0) * u, cy = y0 + (y1 - y0) * u;
      d += (i ? "L" : "M") + (cx + r * Math.sin(a)).toFixed(1) + " " + (cy - r * Math.cos(a) + r).toFixed(1); } return d; };
  const lead = (d, w) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 8}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${PINK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const plug = `<rect x="-13" y="-40" width="26" height="40" rx="7" fill="${SIL}" ${S} stroke-width="6"/><rect x="-14" y="-14" width="28" height="9" rx="3" fill="${GOLD}" ${S} stroke-width="3"/>
      <rect x="-10" y="-50" width="20" height="12" rx="4" fill="#3a3a38" ${S} stroke-width="4"/><path d="M-7 -36 V-22" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".7"/>`;
  const leg = (d) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="26" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${SIL}" stroke-width="15" stroke-linecap="round"/>`;
  const boot = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="24" ry="12" fill="${PINK}" ${S} stroke-width="6"/><ellipse cx="${x - 7}" cy="${y - 4}" rx="8" ry="3.5" fill="#fff" opacity=".55"/>`;
  const star = (x, y, d) => `<g class="d3"><g transform="translate(${x} ${y})"><path class="ba-spark" d="M0 -9 L2.5 -2.5 L9 0 L2.5 2.5 L0 9 L-2.5 2.5 L-9 0 L-2.5 -2.5Z" fill="${GOLD}" style="animation-delay:${d}s"/></g></g>`;
  const svg = () => `<svg class="ba mic" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <ellipse cx="200" cy="380" rx="130" ry="14" fill="${INK}" opacity=".18"/>
  <g class="ba-hitg"><g class="ba-all">
   <g class="mc-live">
    <!-- back leg, the curly-lead tail, the hub and the front legs -->
    ${leg("M200 308 Q206 332 200 350")}${boot(200, 356)}
    ${lead(coil(224, 250, 298, 326, 4, 12), 8)}
    <g class="mc-tail">${lead("M300 340 Q340 372 356 334 Q364 312 360 292", 9)}<g transform="translate(360 292) rotate(8)">${plug}</g></g>
    ${leg("M200 308 Q126 302 80 352")}${boot(72, 360)}
    <g class="mc-legR">${leg("M200 308 Q274 302 320 352")}${boot(328, 360)}</g>
    <rect x="191" y="270" width="18" height="40" rx="6" fill="${SIL}" ${S} stroke-width="6"/>
    <circle cx="200" cy="308" r="16" fill="${GOLD}" ${S} stroke-width="6"/><circle cx="195" cy="303" r="4" fill="#fff" opacity=".7"/>
    <g class="d2"><path d="M188 280 l24 -4 M190 288 l20 -3" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/></g>
    <g class="ba-flash"><rect x="191" y="270" width="18" height="40" rx="6" fill="#fff"/><circle cx="200" cy="308" r="16" fill="#fff"/></g>
    <g class="mc-lean"><g class="mc-wob">
      <!-- taunt: jagged feedback rings blasting out from behind the head -->
      <g class="mc-blast"><path class="mc-jag a" d="${jag(120, 16)}" fill="none" stroke="${INK}" stroke-width="13" stroke-linejoin="round"/><path class="mc-jag a" d="${jag(120, 16)}" fill="none" stroke="${GOLD}" stroke-width="6" stroke-linejoin="round"/>
        <path class="mc-jag b" d="${jag(150, 20)}" fill="none" stroke="${INK}" stroke-width="13" stroke-linejoin="round"/><path class="mc-jag b" d="${jag(150, 20)}" fill="none" stroke="${PINK}" stroke-width="6" stroke-linejoin="round"/></g>
      <!-- idle: little sound rings -->
      <g class="mc-rings" fill="none" stroke-linecap="round">
        <path class="mc-ring" d="M96 70 Q80 104 96 138" stroke-width="8"/><path class="mc-ring" d="M74 56 Q52 104 74 152" stroke-width="8" style="animation-delay:.4s"/>
        <path class="mc-ring" d="M304 70 Q320 104 304 138" stroke-width="8" style="animation-delay:.2s"/><path class="mc-ring" d="M326 56 Q348 104 326 152" stroke-width="8" style="animation-delay:.6s"/></g>
      <!-- pole and clip -->
      <rect x="191" y="236" width="18" height="50" rx="6" fill="${SIL}" ${S} stroke-width="6"/>
      <path d="M150 230 Q150 262 200 262 Q250 262 250 230" fill="none" stroke="${INK}" stroke-width="20" stroke-linecap="round"/>
      <path d="M150 230 Q150 262 200 262 Q250 262 250 230" fill="none" stroke="${GOLD}" stroke-width="10" stroke-linecap="round"/>
      ${handle()}
      <path class="d1" d="M226 232 L216 240 L224 246" fill="none" stroke="${SIL2}" stroke-width="3.5" stroke-linecap="round"/>
      ${grille()}
      <!-- dents, the hole and the spring -->
      <g class="d1"><path d="M124 64 Q140 54 150 40" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><ellipse cx="146" cy="60" rx="16" ry="9" transform="rotate(-40 146 60)" fill="${INK}" opacity=".22"/><path d="M134 52 l8 6 M142 44 l6 8" stroke="${INK}" stroke-width="3" stroke-linecap="round"/></g>
      <g class="d2"><ellipse cx="270" cy="128" rx="12" ry="7" transform="rotate(50 270 128)" fill="${INK}" opacity=".22"/><path d="M262 116 L276 124 L270 136" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g>
      <g class="d3"><path d="M120 134 L130 126 L138 134 L148 128 L150 142 L142 150 L146 160 L132 158 L124 164 L120 152 L112 146 Z" fill="${INK}" ${S} stroke-width="3"/>
        <g class="mc-spring"><path d="M126 146 l-10 -8 l-6 14 l-10 -10 l-6 14 l-10 -10" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M126 146 l-10 -8 l-6 14 l-10 -10 l-6 14 l-10 -10" fill="none" stroke="${GOLD}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g></g>
      ${star(96, 128, 0)}${star(140, 176, .8)}${star(288, 60, 1.4)}
      <!-- face -->
      <g class="mc-eyes">
        <g class="ba-eye l"><circle cx="166" cy="86" r="27" fill="#fff" ${S} stroke-width="6"/><g class="ba-pup l"><circle cx="171" cy="92" r="11" fill="${INK}"/><circle cx="175" cy="88" r="3.5" fill="#fff"/></g></g>
        <g class="ba-eye r"><circle cx="236" cy="84" r="29" fill="#fff" ${S} stroke-width="6"/><g class="ba-pup r"><circle cx="230" cy="91" r="12" fill="${INK}"/><circle cx="234" cy="87" r="3.5" fill="#fff"/></g>
          <path class="d3 ba-spiral" d="M236 86 m0 0 a3 3 0 1 1 6 0 a8 8 0 1 1 -16 0 a13 13 0 1 1 26 0 a18 18 0 1 1 -36 0" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/></g>
      </g>
      <path class="mc-squeeze" d="M148 74 L180 88 L148 102 M254 72 L222 86 L254 100" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
      <g class="mc-bl"><path class="ba-brow" d="M136 50 L190 64" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/></g>
      <g class="mc-br"><path class="ba-brow" d="M268 46 L212 62" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/></g>
      <g class="mc-blush"><ellipse cx="136" cy="122" rx="15" ry="9" fill="#E25B4A"/><ellipse cx="266" cy="120" rx="15" ry="9" fill="#E25B4A"/></g>
      <g class="mc-mouth">
        <path d="M144 124 Q200 112 256 124 Q250 176 200 178 Q150 176 144 124 Z" fill="${INK}" ${S} stroke-width="6"/>
        <path d="M168 166 Q200 148 232 166 Q218 176 200 177 Q182 176 168 166 Z" fill="${PINK}"/>
        <path d="M150 125 Q200 115 250 125 L246 136 L232 130 L218 138 L204 131 L190 138 L176 131 L162 138 L153 133 Z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      </g>
      <g class="mc-steamg"><circle class="mc-steam" cx="108" cy="34" r="12" fill="#fff" stroke="${INK}" stroke-width="3"/><circle class="mc-steam" cx="292" cy="30" r="10" fill="#fff" stroke="${INK}" stroke-width="3" style="animation-delay:.6s"/></g>
      <g class="d1"><path class="ba-sweat" d="M290 120 Q300 138 290 148 Q280 138 290 120Z" fill="${SKY}" stroke="${INK}" stroke-width="3"/></g>
      <text class="mc-skree" x="318" y="38" transform="rotate(10 318 38)" text-anchor="middle" font-family="Nunito,ui-rounded,system-ui,sans-serif" font-weight="900" font-size="30" fill="${GOLD}" stroke="${INK}" stroke-width="7" paint-order="stroke">SKREEE!</text>
      <g class="ba-flash"><circle cx="${HX}" cy="${HY}" r="${HR + 4}" fill="#fff"/><path d="${HANDLE}" fill="#fff"/><rect x="128" y="180" width="144" height="30" rx="12" fill="#fff"/></g>
    </g></g>
   </g>
   <!-- defeated: toppled onto its side, lead in a pile, the stand in a heap -->
   <g class="dd mc-down">
     ${leg("M246 330 Q300 300 352 320")}${leg("M262 352 L360 356")}${boot(366, 358)}
     ${lead(coil(270, 318, 350, 330, 4, 14), 8)}
     <g transform="translate(352 300) rotate(30)">${plug}</g>
     <g transform="translate(-36 136) rotate(-90 200 150)">${handle()}<path d="M150 230 Q150 262 200 262 Q250 262 250 230" fill="none" stroke="${INK}" stroke-width="20" stroke-linecap="round"/><path d="M150 230 Q150 262 200 262 Q250 262 250 230" fill="none" stroke="${GOLD}" stroke-width="10" stroke-linecap="round"/>${grille()}</g>
     <g transform="translate(118 288)">
       <circle cx="-32" cy="-16" r="22" fill="#fff" ${S} stroke-width="5"/><circle cx="32" cy="-18" r="24" fill="#fff" ${S} stroke-width="5"/>
       <path d="M-43 -27 L-21 -5 M-21 -27 L-43 -5 M20 -30 L44 -6 M44 -30 L20 -6" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
       <path d="M-30 24 Q0 12 30 24 Q24 46 0 46 Q-24 46 -30 24 Z" fill="${INK}" ${S} stroke-width="5"/>
       <path d="M2 34 Q4 62 18 60 Q28 56 22 34 Z" fill="#F29BB8" ${S} stroke-width="4"/>
     </g>
     <g class="mc-orbit"><path transform="translate(80 186)" d="M0 -9 L2.6 -2.6 L9 0 L2.6 2.6 L0 9 L-2.6 2.6 L-9 0 L-2.6 -2.6Z" fill="${GOLD}" stroke="${INK}" stroke-width="2"/>
       <path transform="translate(172 176)" d="M0 -9 L2.6 -2.6 L9 0 L2.6 2.6 L0 9 L-2.6 2.6 L-9 0 L-2.6 -2.6Z" fill="${GOLD}" stroke="${INK}" stroke-width="2"/></g>
   </g>
  </g></g>
  <g class="ba-fx"></g>
</svg>`;
  const V = "transform-box:view-box";
  const css = `
.ba.mic .mc-wob{${V};transform-origin:200px 280px;animation:mc-wob 2.6s ease-in-out infinite}
@keyframes mc-wob{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
.ba.mic.rage .mc-wob{animation-duration:1s}
.ba.mic .mc-lean{${V};transform-origin:200px 280px;transition:transform .6s cubic-bezier(.3,1.5,.5,1)}
.ba.mic.st2 .mc-lean{transform:rotate(9deg)}
.ba.mic.st3 .mc-lean{transform:rotate(15deg)}
.ba.mic .mc-ring{stroke:${SKY};transform-box:fill-box;transform-origin:center;animation:mc-ring 1.6s ease-out infinite}
.ba.mic.rage .mc-ring{stroke:#E25B4A;animation-duration:.8s}
@keyframes mc-ring{0%{opacity:0;transform:scale(.6)}30%{opacity:1}100%{opacity:0;transform:scale(1.25)}}
.ba.mic .mc-tail{${V};transform-origin:300px 340px;animation:mc-tail 1.8s ease-in-out infinite}
@keyframes mc-tail{0%,100%{transform:rotate(0)}50%{transform:rotate(-12deg)}}
.ba.mic.rage .mc-tail{animation-duration:.6s}
.ba.mic .mc-hot{opacity:0;transition:opacity .5s}
.ba.mic.rage .mc-hot{opacity:.2}
.ba.mic .mc-blush{opacity:0;transition:opacity .5s}
.ba.mic.rage .mc-blush{opacity:.75}
.ba.mic .mc-bl,.ba.mic .mc-br{${V};transition:transform .4s}
.ba.mic .mc-bl{transform-origin:190px 64px}.ba.mic .mc-br{transform-origin:212px 62px}
.ba.mic.rage .mc-bl{transform:rotate(10deg)}.ba.mic.rage .mc-br{transform:rotate(-10deg)}
.ba.mic .mc-steam{opacity:0;transform-box:fill-box;transform-origin:center}
.ba.mic.rage .mc-steam{animation:mc-steam 1.3s ease-out infinite}
@keyframes mc-steam{0%{opacity:0;transform:translateY(0) scale(.4)}25%{opacity:.95}100%{opacity:0;transform:translateY(-44px) scale(1.5)}}
.ba.mic .mc-squeeze,.ba.mic .mc-skree{opacity:0}
.ba.mic.taunt .mc-squeeze,.ba.mic.taunt .mc-skree{opacity:1}
.ba.mic.taunt .mc-eyes{opacity:0}
.ba.mic .mc-mouth{${V};transform-origin:200px 124px}
.ba.mic.taunt .mc-mouth{animation:mc-shout .9s ease-in-out}
@keyframes mc-shout{0%,100%{transform:none}20%,80%{transform:scale(1.15,1.4)}50%{transform:scale(1.2,1.3)}}
.ba.mic.taunt .mc-wob{animation:mc-lean .9s ease-in-out}
@keyframes mc-lean{0%,100%{transform:none}25%,75%{transform:scale(1.1) rotate(-4deg)}50%{transform:scale(1.12) rotate(3deg)}}
.ba.mic .mc-jag{opacity:0;${V};transform-origin:${HX}px ${HY}px}
.ba.mic.taunt .mc-jag{animation:mc-jag .45s ease-out 2}
.ba.mic.taunt .mc-jag.b{animation-delay:.12s}
@keyframes mc-jag{0%{opacity:0;transform:scale(.55) rotate(0)}25%{opacity:1}100%{opacity:0;transform:scale(1.3) rotate(8deg)}}
.ba.mic.taunt .mc-ring{opacity:0;animation:none}
.ba.mic .mc-legR{${V};transform-origin:328px 360px}
.ba.mic.st2 .mc-legR{animation:mc-legoff 1.1s cubic-bezier(.4,0,.6,1) forwards}
@keyframes mc-legoff{0%{transform:none}20%{transform:rotate(-7deg)}40%{transform:rotate(5deg)}55%{transform:rotate(-4deg)}100%{transform:translate(28px,6px) rotate(-22deg)}}
.ba.mic .mc-spring{${V};transform-origin:126px 146px;animation:mc-boing .5s ease-in-out infinite alternate}
@keyframes mc-boing{to{transform:rotate(-14deg) scale(1.1,.9)}}
.ba.mic.dead{--tilt:0deg}
.ba.mic.dead .ba-hitg{animation:none;transform:none}
.ba.mic .mc-live{${V};transform-origin:120px 370px}
.ba.mic.dead .mc-live{animation:mc-tip .5s cubic-bezier(.5,0,.9,.6) forwards}
@keyframes mc-tip{0%{transform:none;opacity:1}80%{opacity:1}100%{transform:rotate(-40deg);opacity:0}}
.ba.mic .mc-down{${V};transform-origin:200px 372px}
.ba.mic.dead .mc-down{animation:mc-thud .55s .42s cubic-bezier(.3,1.6,.5,1) both}
@keyframes mc-thud{0%{opacity:0;transform:translateY(-30px) scale(1,.9)}40%{opacity:1}100%{opacity:1;transform:none}}
.ba.mic .mc-orbit{${V};transform-origin:126px 186px;animation:mc-spin 2.4s linear infinite}
@keyframes mc-spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.ba.mic *{animation:none!important}.ba.mic.dead .mc-live{opacity:0}.ba.mic.dead .mc-down{opacity:1}.ba.mic.st2 .mc-legR{opacity:0}}
`;
  BossArt.register("mic", { name: "Feedback", svg, css });
})();
