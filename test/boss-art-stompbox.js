/* Captain Fuzz: a pompous guitar fuzz pedal in a captain's cap. Knobs for eyebrows, a chrome footswitch nose,
   a big curly handlebar moustache, a glowing LED, jack-socket ears with leads trailing to the floor, stubby boots.
   Idle: the LED pulses and the moustache wiggles. Rage: knobs cranked to max, red LED and cheeks, steam.
   Taunt: stamps its boots, clicks its own footswitch and fuzzy zig-zag sound waves burst out ("BZZZT!").
   Damage: a dent, scratches and a peeling label (25%), a knob pops off and the moustache droops (50%),
   the other knob and a screw pop off, sparks and sweat (75%). Defeated: LED off, moustache flops, cap slides, X eyes, smoke.
   Loaded after boss-anim.js; registers itself with BossArt.register. */
(function(){
  if(!window.BossArt || !BossArt.register) return;
  const INK = "#23231F", GOLD = "#FFB805", GOLDD = "#E0A400", PINK = "#D4668C", CREAM = "#FBF8EF", SKY = "#8ECAE6", SKYD = "#4A9CC2";
  const GREEN = "#4fb86a", GREEND = "#3a9a52", GREENL = "#8fdca3", CHROME = "#d9dde0", GREY = "#3a3a38", WARM = "#6b6558";
  const MO = "#6b4226", MOL = "#8f6040";
  const st = `stroke="${INK}" stroke-linejoin="round" stroke-linecap="round"`;
  const FONT = `font-family="Nunito,ui-rounded,system-ui,sans-serif" font-weight="900"`;
  const starP = "M0 -9 L2.5 -2.5 L9 0 L2.5 2.5 L0 9 L-2.5 2.5 L-9 0 L-2.5 -2.5Z";
  const sp = (cls, x, y, delay) => `<g class="${cls}"><g transform="translate(${x} ${y})"><path class="ba-spark" d="${starP}" fill="${GOLD}" stroke="${INK}" stroke-width="1.5" style="animation-delay:${delay}s"/></g></g>`;
  const tube = (d, col, w) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w - 8}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const screw = (x, y) => `<circle cx="${x}" cy="${y}" r="7" fill="${CHROME}" ${st} stroke-width="3"/><path d="M${x - 4} ${y} L${x + 4} ${y} M${x} ${y - 4} L${x} ${y + 4}" stroke="${INK}" stroke-width="2.2"/>`;
  // a knob (also an eyebrow) at x,y with its scale dots on the casing; the pointer turns (to max in rage)
  const dots = (x, y) => [-135, -90, -45, 0, 45, 90, 135].map(a => `<circle cx="${(x + 33 * Math.sin(a * Math.PI / 180)).toFixed(1)}" cy="${(y - 33 * Math.cos(a * Math.PI / 180)).toFixed(1)}" r="2.6" fill="${GREY}"/>`).join("");
  const knob = (side, x, y) => `${dots(x, y)}<circle cx="${x}" cy="${y}" r="10" fill="${WARM}" ${st} stroke-width="3"/><circle cx="${x}" cy="${y}" r="4" fill="${CHROME}"/>
    <g class="cf-kfall ${side}"><g transform="translate(${x} ${y})"><g class="ba-brow cf-knob">
      <circle r="25" fill="${GREY}" ${st} stroke-width="6"/><circle r="18.5" fill="none" stroke="${WARM}" stroke-width="5" stroke-dasharray="3 3.2"/>
      <circle r="12" fill="${WARM}" ${st} stroke-width="3"/>
      <g class="cf-ptr ${side}"><circle r="22" fill="none"/><path d="M0 -6 L0 -20" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g>
      <path d="M-15 -11 A18 18 0 0 1 -4 -18" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/></g></g></g>`;
  // one half of the handlebar moustache (the left half is this mirrored); its curl wiggles from the middle
  const moHalf = `<g class="cf-droop"><g class="cf-wig">
      ${tube("M262 270 C278 284 302 278 302 260 C302 246 284 244 282 257", MO, 17)}
      <path d="M197 260 C222 244 256 250 272 268 C258 288 222 292 197 282 Z" fill="${MO}" ${st} stroke-width="6"/>
      <path d="M214 266 L234 270 M222 278 L244 278 M246 262 L258 268" stroke="${MOL}" stroke-width="3.5" stroke-linecap="round"/></g></g>`;
  const wave = (cls, d) => `<g class="cf-wave ${cls}">${tube(d, GOLD, 13)}</g>`;
  const word = (x, y, rot, txt, size) => `<g transform="translate(${x} ${y}) rotate(${rot})"><text class="cf-word" text-anchor="middle" ${FONT} font-size="${size}" fill="${GOLD}" stroke="${INK}" stroke-width="${size / 4.5}" paint-order="stroke" stroke-linejoin="round">${txt}</text></g>`;
  const braid = () => { let d = "M118 88"; for(let i = 0; i < 8; i++) d += " q10.5 -6 21 0"; return d; };
  const HAT = "M112 96 Q104 50 200 42 Q296 50 288 96Z";

  const svg = () => `<svg class="ba stompbox" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <ellipse cx="200" cy="380" rx="130" ry="14" fill="${INK}" opacity=".18"/>
  <g class="ba-hitg"><g class="ba-all">
    <!-- leads from the jack-socket ears down to the floor -->
    ${tube("M22 204 C4 222 6 270 24 300 C40 326 28 352 54 366", PINK, 18)}
    ${tube("M378 204 C396 222 394 270 376 300 C360 326 372 352 346 366", SKYD, 18)}
    <rect x="16" y="192" width="30" height="24" rx="7" fill="${GOLD}" ${st} stroke-width="5"/><rect x="354" y="192" width="30" height="24" rx="7" fill="${GOLD}" ${st} stroke-width="5"/>
    <path d="M24 197 L24 211 M376 197 L376 211" stroke="${GOLDD}" stroke-width="3.5" stroke-linecap="round"/>
    <rect x="42" y="186" width="28" height="36" rx="5" fill="${CHROME}" ${st} stroke-width="6"/><rect x="330" y="186" width="28" height="36" rx="5" fill="${CHROME}" ${st} stroke-width="6"/>
    <path d="M51 192 L51 216 M60 192 L60 216 M340 192 L340 216 M349 192 L349 216" stroke="#9aa3a8" stroke-width="3" stroke-linecap="round"/>
    <!-- stubby legs and boots -->
    <g class="cf-leg l"><rect x="126" y="330" width="28" height="30" fill="${GREY}" ${st} stroke-width="5"/><path d="M112 372 Q110 350 140 350 Q172 350 172 372Z" fill="${INK}"/><path d="M124 358 Q132 354 142 355" stroke="#6b6558" stroke-width="3.5" stroke-linecap="round" fill="none"/></g>
    <g class="cf-leg r"><rect x="246" y="330" width="28" height="30" fill="${GREY}" ${st} stroke-width="5"/><path d="M228 372 Q228 350 260 350 Q290 350 288 372Z" fill="${INK}"/><path d="M244 358 Q252 354 262 355" stroke="#6b6558" stroke-width="3.5" stroke-linecap="round" fill="none"/></g>
    <!-- the pedal casing -->
    <rect x="66" y="92" width="268" height="254" rx="30" fill="${GREEN}" ${st} stroke-width="10"/>
    <path d="M71 310 L329 310 L329 318 Q329 341 304 341 L96 341 Q71 341 71 318Z" fill="${GREEND}"/>
    <path d="M84 132 L84 290" stroke="${GREENL}" stroke-width="7" stroke-linecap="round"/>
    ${screw(92, 122)}${screw(92, 324)}${screw(308, 324)}
    <circle class="d3" cx="308" cy="122" r="5" fill="${INK}"/>
    <g class="cf-screw">${screw(308, 122)}</g>
    <rect x="118" y="310" width="164" height="26" rx="8" fill="${CREAM}" ${st} stroke-width="5"/>
    <text x="200" y="328.5" text-anchor="middle" ${FONT} font-size="15" letter-spacing=".5" fill="${INK}">CAPTAIN FUZZ</text>
    <path class="d1" d="M266 310 L282 310 L282 300 Q270 300 266 310Z" fill="#e8e0cc" ${st} stroke-width="3.5"/>
    <!-- knob eyebrows and the LED -->
    ${knob("l", 134, 146)}${knob("r", 266, 146)}
    <circle class="cf-glow" cx="200" cy="152" r="21" fill="${PINK}" opacity=".35"/>
    <circle cx="200" cy="152" r="12" fill="${GREY}" ${st} stroke-width="4"/>
    <circle class="cf-led" cx="200" cy="152" r="8" fill="#F27BA0"/>
    <circle cx="197" cy="149" r="2.6" fill="#fff" opacity=".9"/>
    <!-- face -->
    <ellipse class="cf-cheek" cx="104" cy="246" rx="15" ry="8" fill="${PINK}" opacity=".55"/>
    <ellipse class="cf-cheek" cx="296" cy="246" rx="15" ry="8" fill="${PINK}" opacity=".55"/>
    <g class="ba-eye l"><circle cx="142" cy="206" r="29" fill="#fff" ${st} stroke-width="6"/><circle class="ba-pup l" cx="149" cy="211" r="12" fill="${INK}"/><circle cx="153" cy="207" r="3.6" fill="#fff"/>
      <path class="cf-lid" d="M116.6 192 A29 29 0 0 1 170.9 204 Z" fill="${GREEN}" ${st} stroke-width="5"/></g>
    <g class="ba-eye r"><circle cx="258" cy="206" r="29" fill="#fff" ${st} stroke-width="6"/><circle class="ba-pup r" cx="251" cy="211" r="12" fill="${INK}"/>
      <path class="cf-lid" d="M229.1 204 A29 29 0 0 1 283.4 192 Z" fill="${GREEN}" ${st} stroke-width="5"/>
      <path class="d3 ba-spiral" d="M258 206 m0 0 a3 3 0 1 1 6 0 a7 7 0 1 1 -14 0 a11 11 0 1 1 22 0 a15 15 0 1 1 -30 0" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/></g>
    <path class="dd" d="M124 188 L160 224 M160 188 L124 224 M240 188 L276 224 M276 188 L240 224" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
    <!-- mouths: grumpy, shouting (taunt), defeated -->
    <path class="cf-mouth" d="M180 300 Q200 290 220 300" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
    <g class="cf-shout"><path d="M178 290 Q200 322 222 290Z" fill="${INK}" ${st} stroke-width="4"/><path d="M190 302 Q200 296 210 302 Q200 310 190 302Z" fill="${PINK}"/></g>
    <g class="dd"><path d="M176 300 Q186 292 196 300 Q206 308 216 300 Q222 296 226 300" fill="none" stroke="${INK}" stroke-width="5.5" stroke-linecap="round"/></g>
    <!-- footswitch nose -->
    <g class="cf-switch"><ellipse cx="200" cy="258" rx="31" ry="11" fill="${CHROME}" ${st} stroke-width="6"/>
      <rect x="183" y="222" width="34" height="36" rx="9" fill="${CHROME}" ${st} stroke-width="6"/>
      <ellipse cx="200" cy="225" rx="16" ry="5.5" fill="#f4f6f7" ${st} stroke-width="3.5"/>
      <path d="M190 234 L190 250" stroke="#fff" stroke-width="4" stroke-linecap="round"/></g>
    <!-- handlebar moustache -->
    ${moHalf}<g transform="matrix(-1 0 0 1 400 0)">${moHalf}</g>
    <!-- captain's cap -->
    <g class="cf-hat"><g transform="rotate(-6 200 92)">
      <path d="${HAT}" fill="${CREAM}" ${st} stroke-width="8"/>
      <path d="M136 60 Q150 52 168 50" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
      <rect x="110" y="78" width="180" height="20" rx="6" fill="${GREY}" ${st} stroke-width="6"/>
      <path d="${braid()}" fill="none" stroke="${GOLD}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="200" cy="62" r="15" fill="${GOLD}" ${st} stroke-width="4"/>
      <path d="M204 51 L193 64 L200 64 L196 74 L208 60 L201 60Z" fill="${INK}"/>
      <path d="M104 96 Q200 132 296 96 Q200 108 104 96Z" fill="${INK}" ${st} stroke-width="6"/>
      <path d="M140 106 Q170 115 200 116" fill="none" stroke="${WARM}" stroke-width="3" stroke-linecap="round"/></g></g>
    <!-- damage -->
    <g class="d1"><ellipse cx="312" cy="176" rx="11" ry="16" fill="${INK}" opacity=".22"/><path d="M304 164 q10 10 2 24 M318 166 q-6 10 0 22" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M90 288 L108 268 M96 296 L116 274" stroke="${INK}" stroke-width="3.5" stroke-linecap="round" opacity=".45"/></g>
    <g class="d2"><path d="M70 150 L86 162 L78 174 L92 186" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></g>
    <g class="d3"><ellipse cx="236" cy="314" rx="22" ry="9" fill="${INK}" opacity=".18"/><path d="M300 270 L318 280 L310 292 L326 300" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></g>
    <g class="d3"><path class="ba-sweat" d="M318 196 Q330 218 318 230 Q306 218 318 196Z" fill="${SKY}" stroke="${INK}" stroke-width="3"/></g>
    ${sp("d2", 40, 176, 0)}${sp("d3", 362, 176, .6)}${sp("d3", 300, 120, 1.2)}${sp("d2", 150, 300, .9)}
    <!-- rage steam, defeated smoke -->
    <g class="cf-steam"><circle class="ba-smoke" cx="108" cy="80" r="15" fill="#efe9dc" stroke="${INK}" stroke-width="3"/><circle class="ba-smoke" cx="292" cy="80" r="15" fill="#efe9dc" stroke="${INK}" stroke-width="3" style="animation-delay:1s"/></g>
    <g class="dd"><circle class="ba-smoke" cx="170" cy="60" r="18" fill="#999" style="animation-delay:.2s"/><circle class="ba-smoke" cx="230" cy="56" r="16" fill="#aaa" style="animation-delay:1s"/><circle class="ba-smoke" cx="200" cy="66" r="14" fill="#bbb" style="animation-delay:1.7s"/></g>
    <g class="ba-flash"><rect x="66" y="92" width="268" height="254" rx="30" fill="#fff"/><path d="${HAT}" fill="#fff" transform="rotate(-6 200 92)"/></g>
    <!-- taunt: fuzzy sound waves -->
    <g class="cf-waves">
      ${wave("l", "M80 120 L64 116 L64 102 L48 98 L48 84 L32 80")}${wave("l b", "M62 160 L44 160 L40 146 L22 146 L18 132 L2 132")}
      ${wave("r", "M320 120 L336 116 L336 102 L352 98 L352 84 L368 80")}${wave("r b", "M338 160 L356 160 L360 146 L378 146 L382 132 L398 132")}
      ${word(200, 30, -4, "BZZZT!", 40)}</g>
  </g></g>
  <g class="ba-fx"></g>
</svg>`;

  const css = `
.ba.stompbox .cf-led{transition:fill .3s}
.ba.stompbox .cf-glow{transform-box:fill-box;transform-origin:center;animation:cf-glow 1.6s ease-in-out infinite;transition:fill .3s}
@keyframes cf-glow{0%,100%{opacity:.45;transform:scale(1)}50%{opacity:.12;transform:scale(.7)}}
.ba.stompbox.rage .cf-led,.ba.stompbox.rage .cf-glow{fill:#E0473A}
.ba.stompbox.rage .cf-glow{animation-duration:.45s}
.ba.stompbox.taunt .cf-glow{animation:cf-glow .15s infinite}
.ba.stompbox.dead .cf-led{fill:${WARM}}
.ba.stompbox.dead .cf-glow{animation:none;opacity:0}
.ba.stompbox .cf-wig{transform-box:view-box;transform-origin:200px 268px;animation:cf-wig 1.8s ease-in-out infinite}
@keyframes cf-wig{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(4deg)}}
.ba.stompbox.rage .cf-wig{animation-duration:.6s}
.ba.stompbox.taunt .cf-wig{animation:cf-wig .14s ease-in-out infinite}
.ba.stompbox.dead .cf-wig{animation:none}
.ba.stompbox .cf-droop{transform-box:view-box;transform-origin:200px 268px;transition:transform .7s cubic-bezier(.3,1.5,.5,1)}
.ba.stompbox.st2 .cf-droop{transform:rotate(16deg)}
.ba.stompbox.dead .cf-droop{transform:rotate(42deg) translateY(4px)}
.ba.stompbox .cf-ptr{transform-box:fill-box;transform-origin:center;transition:transform .6s cubic-bezier(.3,1.7,.5,1)}
.ba.stompbox .cf-ptr.l{transform:rotate(-40deg)}
.ba.stompbox .cf-ptr.r{transform:rotate(40deg)}
.ba.stompbox.rage .cf-ptr{transform:rotate(135deg)}
.ba.stompbox .cf-kfall{transform-box:fill-box;transform-origin:center}
.ba.stompbox.st2 .cf-kfall.l{animation:cf-fall 1.1s ease-in forwards}
.ba.stompbox.st3 .cf-kfall.r{animation:cf-fall 1.1s ease-in forwards}
@keyframes cf-fall{0%{transform:none;opacity:1}22%{transform:translate(-10px,-34px) rotate(-60deg)}100%{transform:translate(-30px,300px) rotate(-300deg);opacity:0}}
.ba.stompbox .cf-screw{transform-box:fill-box;transform-origin:center}
.ba.stompbox.st3 .cf-screw{animation:cf-screw 1s ease-in forwards}
@keyframes cf-screw{0%{transform:none;opacity:1}30%{transform:translate(20px,-60px) rotate(220deg)}100%{transform:translate(50px,280px) rotate(600deg);opacity:0}}
.ba.stompbox .cf-cheek{transition:fill .4s,opacity .4s}
.ba.stompbox.rage .cf-cheek{fill:#E0473A;opacity:.85}
.ba.stompbox .cf-steam{opacity:0;transition:opacity .4s}
.ba.stompbox.rage .cf-steam{opacity:1}
.ba.stompbox.dead .cf-steam,.ba.stompbox.dead .cf-mouth{opacity:0}
.ba.stompbox .cf-shout,.ba.stompbox .cf-waves{opacity:0}
.ba.stompbox.taunt .cf-shout,.ba.stompbox.taunt .cf-waves{opacity:1}
.ba.stompbox.taunt .cf-mouth{opacity:0}
.ba.stompbox .cf-lid{transition:opacity .2s}
.ba.stompbox.taunt .cf-lid,.ba.stompbox.dead .cf-lid{opacity:0}
.ba.stompbox .cf-switch{transform-box:fill-box;transform-origin:50% 100%}
.ba.stompbox.taunt .cf-switch{animation:cf-click .9s ease-out}
@keyframes cf-click{0%,100%{transform:none}12%,30%{transform:scaleY(.72)}40%{transform:scaleY(1.06)}55%,70%{transform:scaleY(.72)}80%{transform:none}}
.ba.stompbox .cf-leg{transform-box:fill-box;transform-origin:center}
.ba.stompbox.taunt .cf-leg.l{animation:cf-stamp .45s ease-in-out 2}
.ba.stompbox.taunt .cf-leg.r{animation:cf-stamp .45s ease-in-out .22s 2}
@keyframes cf-stamp{0%,100%{transform:none}40%{transform:translateY(-16px) rotate(-6deg)}}
.ba.stompbox .cf-wave{transform-box:fill-box;transform-origin:center}
.ba.stompbox.taunt .cf-wave.l{animation:cf-wavel .45s ease-out 2 both}
.ba.stompbox.taunt .cf-wave.r{animation:cf-waver .45s ease-out 2 both}
.ba.stompbox.taunt .cf-wave.b{animation-delay:.12s}
@keyframes cf-wavel{0%{opacity:0;transform:scale(.4)}25%{opacity:1}100%{opacity:0;transform:translate(-22px,-12px) scale(1.15)}}
@keyframes cf-waver{0%{opacity:0;transform:scale(.4)}25%{opacity:1}100%{opacity:0;transform:translate(22px,-12px) scale(1.15)}}
.ba.stompbox .cf-word{transform-box:fill-box;transform-origin:center}
.ba.stompbox.taunt .cf-word{animation:cf-word .9s ease-out both}
@keyframes cf-word{0%{transform:scale(.2) rotate(-8deg)}18%{transform:scale(1.25) rotate(3deg)}24%{transform:translateX(-4px)}30%{transform:translateX(4px)}36%{transform:translateX(-3px)}42%{transform:none}85%{opacity:1}100%{opacity:0;transform:translateY(-8px)}}
.ba.stompbox .cf-hat{transform-box:view-box;transform-origin:200px 96px;transition:transform .6s cubic-bezier(.3,1.6,.5,1)}
.ba.stompbox.taunt .cf-hat{transform:translateY(-8px) rotate(3deg)}
.ba.stompbox.dead .cf-hat{transform:translate(-8px,6px) rotate(-14deg)}
@media (prefers-reduced-motion:reduce){
 .ba.stompbox.st2 .cf-kfall.l,.ba.stompbox.st3 .cf-kfall.r,.ba.stompbox.st3 .cf-screw{opacity:0}
}
`;
  BossArt.register("stompbox", { name: "Captain Fuzz", svg, css });
})();
