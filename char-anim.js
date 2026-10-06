/* Forbes Music Academy's pick characters as animated vector art, shared by the home Boss Battle (and later the classroom screen).
   const c = CharArt(containerElement, "plucky");     // shredder, clang, fret, plucky, scales, callus
   c.setDamage(0..1)   how beaten up they look (scuffs and a crack at 25%, a bandage and sweat at 50%, dizzy at 75%)
   c.hurt()            flinch and flash red          c.attack(dir)  lunge toward the boss (dir 1 = right, -1 = left)
   c.cheer()           a little jump                 c.ko()         knocked out (X eyes, stars, slump)        c.reset()
   CharArt.svg(name)   the plain SVG string (no animation hooks needed) for use as an image.
   Drawn from the characters Dave created: same pick bodies, faces, gloves and shoes, redrawn as vectors. */
(function(){
  const NS = "http://www.w3.org/2000/svg";
  const INK = "#1d1d1b";
  const PICK = "M200 318 C158 306 104 236 100 158 C97 100 138 76 200 76 C262 76 303 100 300 158 C296 236 242 306 200 318Z";
  const ST = `stroke="${INK}" stroke-linejoin="round" stroke-linecap="round"`;
  const sw = w => `${ST} stroke-width="${w}"`;

  /* ---- hands (drawn around 0,0, pointing up), in the glove colour ---- */
  const HANDS = {
    rock: c => `<path d="M-17 8 C-21 -6 -11 -13 0 -13 C11 -13 21 -6 17 8 C15 21 -15 21 -17 8Z" fill="${c}" ${sw(3.6)}/>
      <rect x="-20" y="-46" width="12" height="38" rx="6" fill="${c}" ${sw(3.6)} transform="rotate(-14 -14 -8)"/>
      <rect x="8" y="-42" width="11" height="34" rx="5.5" fill="${c}" ${sw(3.6)} transform="rotate(14 13 -8)"/>
      <circle cx="-3" cy="-12" r="7" fill="${c}" ${sw(3)}/><circle cx="5" cy="-12" r="6.5" fill="${c}" ${sw(3)}/>
      <path d="M-18 4 C-30 -2 -27 -14 -17 -11" fill="${c}" ${sw(3.2)}/>`,
    thumbs: c => `<rect x="-23" y="-6" width="46" height="34" rx="15" fill="${c}" ${sw(3.6)}/>
      <rect x="-19" y="-36" width="17" height="36" rx="8.5" fill="${c}" ${sw(3.6)} transform="rotate(-10 -10 -18)"/>
      <path d="M-4 8 H20 M-4 18 H20" ${sw(2.6)} fill="none"/>`,
    peace: c => `<path d="M-17 8 C-21 -6 -11 -13 0 -13 C11 -13 21 -6 17 8 C15 21 -15 21 -17 8Z" fill="${c}" ${sw(3.6)}/>
      <rect x="-16" y="-46" width="12" height="38" rx="6" fill="${c}" ${sw(3.6)} transform="rotate(-16 -10 -8)"/>
      <rect x="3" y="-46" width="12" height="38" rx="6" fill="${c}" ${sw(3.6)} transform="rotate(16 9 -8)"/>
      <circle cx="-6" cy="-6" r="6" fill="${c}" ${sw(3)}/><circle cx="6" cy="-6" r="6" fill="${c}" ${sw(3)}/>
      <path d="M-18 6 C-30 0 -27 -12 -17 -9" fill="${c}" ${sw(3.2)}/>`,
    point: c => `<rect x="-20" y="-8" width="40" height="30" rx="13" fill="${c}" ${sw(3.6)}/>
      <rect x="-6" y="-48" width="13" height="44" rx="6.5" fill="${c}" ${sw(3.6)}/>
      <path d="M-14 8 H14 M-14 16 H14" ${sw(2.4)} fill="none"/>`,
    fist: c => `<rect x="-21" y="-14" width="42" height="36" rx="15" fill="${c}" ${sw(3.6)}/>
      <path d="M-9 -12 V4 M2 -12 V4 M13 -10 V4" ${sw(2.6)} fill="none"/>`,
    open: c => `<path d="M-18 -10 C-20 8 -14 18 0 18 C14 18 20 8 18 -10Z" fill="${c}" ${sw(3.6)}/>
      <rect x="-20" y="8" width="11" height="30" rx="5.5" fill="${c}" ${sw(3.2)} transform="rotate(14 -14 8)"/>
      <rect x="-9" y="12" width="11" height="34" rx="5.5" fill="${c}" ${sw(3.2)} transform="rotate(4 -3 12)"/>
      <rect x="2" y="12" width="11" height="34" rx="5.5" fill="${c}" ${sw(3.2)} transform="rotate(-6 8 12)"/>
      <rect x="12" y="8" width="10" height="28" rx="5" fill="${c}" ${sw(3.2)} transform="rotate(-16 17 8)"/>`
  };
  const hand = (type, color, x, y, rot) => `<g transform="translate(${x} ${y}) rotate(${rot || 0}) scale(1.22)">${HANDS[type](color)}</g>`;
  const shoe = (color, x, y, flip) => `<g transform="translate(${x} ${y}) scale(${flip ? -1 : 1} 1)"><path d="M-30 0 C-34 -17 -10 -28 8 -24 C26 -20 38 -6 36 6 C34 15 -30 15 -30 0Z" fill="${color}" ${sw(4)}/><path d="M6 -22 C16 -12 22 -4 22 8" fill="none" ${sw(3)} opacity=".45"/></g>`;
  const limb = d => `<path d="${d}" fill="none" ${ST} stroke-width="11"/>`;
  const label = (text, color, x, y, size) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="'Patrick Hand','Comic Sans MS','Nunito',cursive" font-style="italic" font-weight="800" font-size="${size || 22}" fill="${color}">${text}</text>`;
  const eye = (cx, cy, r, w) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${w || "#fff"}" ${sw(3)}/>`;

  /* ---- the six characters: face, hands, shoes ---- */
  const CHARS = {
    shredder: {
      pick: "#2a2a2c", name: ["Shredder", "#c0242b"],
      eyes: [[178, 150], [222, 144]], eyeR: 26,
      face: () => `
        <circle cx="176" cy="152" r="27" fill="#d7262f" ${sw(3)}/><path d="M149 152 A27 27 0 0 0 203 152 Z" fill="#1747b8"/>
        <circle cx="224" cy="146" r="27" fill="#3d6dea" ${sw(3)}/><path d="M197 146 A27 27 0 0 0 251 146 Z" fill="#b8202a"/>
        <circle cx="178" cy="152" r="12" fill="#fff"/><circle cx="180" cy="152" r="7" fill="#111"/>
        <circle cx="222" cy="146" r="12" fill="#fff"/><circle cx="224" cy="146" r="7" fill="#111"/>
        <g transform="translate(0 -10)"><path d="M158 188 Q200 172 244 188 Q248 214 200 216 Q154 214 158 188Z" fill="#6b2b12" stroke="#ff9d1e" stroke-width="5" stroke-linejoin="round"/>
        <path d="M164 190 Q200 178 238 190 L232 196 Q200 188 170 196Z" fill="#fff"/><path d="M168 208 Q200 214 234 208 L230 203 Q200 208 172 203Z" fill="#fff"/>
        <ellipse cx="201" cy="206" rx="15" ry="6" fill="#e8647a"/></g>`,
      arms: [["M108 205 C70 215 62 150 70 118", "rock", "#c4122a", 70, 100, -8], ["M292 205 C335 215 340 150 332 118", "rock", "#1747b8", 330, 100, 8]],
      shoes: ["#1747b8", "#c4122a"], legs: INK
    },
    clang: {
      pick: "#c1363a", name: null,
      eyeR: 24, eyes: [[178, 150], [222, 150]],
      face: () => `
        <path d="M192 124 L200 84 L208 124Z" fill="#6d6d6d" ${sw(3)}/>
        <circle cx="178" cy="152" r="24" fill="#8c8c8c" ${sw(3)}/><circle cx="222" cy="152" r="24" fill="#8c8c8c" ${sw(3)}/>
        <path d="M160 148 H196 V160 Q178 170 160 160Z" fill="#fff"/><path d="M204 148 H240 V160 Q222 170 204 160Z" fill="#fff"/>
        <circle cx="180" cy="156" r="7" fill="#111"/><circle cx="220" cy="156" r="7" fill="#111"/>
        <path d="M156 134 L198 156 M244 134 L202 156" stroke="#111" stroke-width="9" stroke-linecap="round"/>
        <path d="M168 206 C186 196 212 204 238 198" fill="none" stroke="#111" stroke-width="8" stroke-linecap="round"/>
        <path d="M232 192 L244 198 L234 206" fill="#111"/>`,
      guitar: true,
      shoes: ["#c1363a", "#c1363a"]
    },
    fret: {
      pick: "#e8588e", name: ["Fret", "#1d1d1b"],
      eyes: [[172, 146], [228, 146]], eyeR: 24,
      face: () => `
        <circle cx="172" cy="146" r="26" fill="#fff" stroke="#78d63a" stroke-width="7"/><circle cx="228" cy="146" r="26" fill="#fff" stroke="#78d63a" stroke-width="7"/>
        <circle cx="172" cy="146" r="17" fill="#111"/><circle cx="228" cy="146" r="17" fill="#111"/>
        <circle cx="166" cy="140" r="5" fill="#fff"/><circle cx="222" cy="140" r="5" fill="#fff"/>
        <path d="M198 144 H202" stroke="#78d63a" stroke-width="6"/>
        <path d="M158 186 Q200 176 242 186 Q238 224 200 226 Q162 224 158 186Z" fill="#fff" ${sw(3.5)}/>
        <path d="M160 200 H240 M180 180 V226 M200 180 V227 M220 180 V226" stroke="#1d1d1b" stroke-width="1.6" fill="none"/>`,
      arms: [["M104 212 C60 240 56 186 72 154", "thumbs", "#e8588e", 70, 142, -12], ["M296 212 C345 220 345 160 330 126", "peace", "#e8588e", 330, 112, 14]],
      shoes: ["#e8588e", "#e8588e"]
    },
    plucky: {
      pick: "#f3f2ee", name: ["Plucky", "#1d1d1b"],
      eyes: [[172, 150], [228, 150]], eyeR: 24,
      face: () => `
        <circle cx="172" cy="150" r="27" fill="#2ca2ff" ${sw(3.5)}/><path d="M146 156 A27 27 0 0 0 198 156 Z" fill="#0a4ea8"/>
        <circle cx="228" cy="150" r="27" fill="#2ca2ff" ${sw(3.5)}/><path d="M202 156 A27 27 0 0 0 254 156 Z" fill="#0a4ea8"/>
        <circle cx="172" cy="152" r="13" fill="#fff"/><circle cx="172" cy="152" r="8" fill="#111"/>
        <circle cx="228" cy="152" r="13" fill="#fff"/><circle cx="228" cy="152" r="8" fill="#111"/>
        <path d="M178 192 Q200 204 224 192" fill="none" stroke="#111" stroke-width="5" stroke-linecap="round"/>
        <rect x="190" y="198" width="10" height="14" rx="2" fill="#fff" ${sw(2.4)}/><rect x="201" y="198" width="10" height="14" rx="2" fill="#fff" ${sw(2.4)}/>`,
      arms: [["M104 205 C68 215 62 160 74 130", "thumbs", "#f7f6f2", 74, 118, -14], ["M296 205 C335 215 340 160 328 130", "thumbs", "#f7f6f2", 326, 118, 14]],
      shoes: ["#f7f6f2", "#f7f6f2"]
    },
    scales: {
      pick: "#5db35c", name: ["Scales", "#14501a"],
      eyes: [[176, 150], [224, 144]], eyeR: 22, cape: true, pose: -28,
      face: () => `
        <circle cx="176" cy="150" r="24" fill="#ffab12" ${sw(3.5)}/><circle cx="226" cy="144" r="24" fill="#ffab12" ${sw(3.5)}/>
        <path d="M156 146 H200 M206 140 H250" stroke="#fff" stroke-width="8"/><path d="M156 146 H200 M206 140 H250" stroke="#111" stroke-width="3" stroke-dasharray="6 6"/>
        <rect x="170" y="143" width="9" height="9" fill="#111"/><rect x="220" y="137" width="9" height="9" fill="#111"/>
        <path d="M156 186 Q200 214 246 180 Q242 214 200 220 Q164 216 156 186Z" fill="#fff" ${sw(3.5)}/>
        <path d="M172 200 L178 214 L184 204 M214 208 L220 198 L226 208" fill="#fff" ${sw(2.2)}/>`,
      arms: [["M108 196 C70 180 60 130 76 96", "fist", "#4ab04c", 76, 84, -10], ["M292 196 C320 190 330 130 322 100", "fist", "#4ab04c", 322, 88, 10]],
      shoes: ["#4ab04c", "#4ab04c"]
    },
    callus: {
      pick: "#2a2a2c", name: ["Callus", "#fff"],
      eyes: [[178, 150], [222, 150]], eyeR: 14,
      face: () => `
        <ellipse cx="200" cy="158" rx="46" ry="52" fill="#b78a2e" ${sw(3)}/>
        <ellipse cx="180" cy="148" rx="15" ry="11" fill="#fff" ${sw(2.6)}/><ellipse cx="222" cy="148" rx="15" ry="11" fill="#fff" ${sw(2.6)}/>
        <path d="M165 144 Q180 128 195 144Z" fill="#7a2442" ${sw(2.2)}/><path d="M207 144 Q222 128 237 144Z" fill="#7a2442" ${sw(2.2)}/>
        <circle cx="184" cy="152" r="4" fill="#111"/><circle cx="226" cy="152" r="4" fill="#111"/>
        <path d="M168 190 H236" stroke="#5a4210" stroke-width="3.5" stroke-linecap="round"/>`,
      arms: [["M108 205 C74 220 70 150 82 112", "point", "#6e1f3f", 82, 100, -8], ["M292 205 C322 235 335 255 335 268", "open", "#6e1f3f", 334, 262, 4]],
      shoes: ["#6e1f3f", "#6e1f3f"]
    }
  };

  /* ---- assembly ---- */
  function guitar(){
    // a simplified teal Strat held across the body: body low-left, neck up to the right (drawn flat, then rotated)
    return `<g transform="translate(150 292) rotate(-38)">
      <rect x="40" y="-9" width="212" height="18" rx="3" fill="#d9b97a" ${sw(3)}/>
      <path d="M70 -9 V9 M100 -9 V9 M128 -9 V9 M154 -9 V9 M178 -9 V9 M200 -9 V9 M221 -9 V9" stroke="#8a6f3a" stroke-width="1.6"/>
      <path d="M250 -12 L292 -16 Q300 -10 296 -2 L292 8 L250 12Z" fill="#e0c88e" ${sw(3)}/>
      <circle cx="262" cy="-10" r="2.5" fill="#444"/><circle cx="272" cy="-11" r="2.5" fill="#444"/><circle cx="282" cy="-12" r="2.5" fill="#444"/>
      <path d="M-84 8 C-96 -30 -50 -52 -14 -40 C10 -48 32 -50 50 -34 C62 -22 56 -8 44 2 C54 20 46 44 8 52 C-30 60 -76 46 -84 8Z" fill="#5fc4b0" ${sw(4)}/>
      <path d="M-62 4 C-68 -14 -40 -26 -14 -20 C8 -28 22 -24 30 -10 C26 8 8 30 -20 34 C-46 34 -60 22 -62 4Z" fill="#fff" ${sw(3)}/>
      <rect x="-30" y="-14" width="52" height="7" rx="3" fill="#333"/><rect x="-34" y="-1" width="52" height="7" rx="3" fill="#333"/><rect x="-38" y="12" width="52" height="7" rx="3" fill="#333"/>
      <circle cx="-8" cy="40" r="5" fill="#bbb" ${sw(2)}/><circle cx="12" cy="36" r="5" fill="#bbb" ${sw(2)}/>
    </g>`;
  }
  function cape(){
    return `<g class="ca-cape">
      <path d="M262 120 C318 150 372 262 384 392 C346 352 322 330 292 304 C300 250 276 190 244 150Z" fill="#c8161d" ${sw(4)}/>
      <path d="M262 126 C306 172 340 262 352 362 C326 338 308 322 292 304 C298 250 278 190 250 150Z" fill="#9c0f16"/>
    </g>`;
  }
  function build(name, anim){
    const c = CHARS[name]; if(!c) return "";
    const shoes = c.shoes, legCol = c.legs || INK;
    const legs = `${limb("M180 304 C176 330 168 346 166 366")}${limb("M222 302 C226 326 232 346 238 364")}`;
    const feet = `${shoe(shoes[0], 164, 372, false)}${shoe(shoes[1], 242, 370, true)}`;
    let arms = "";
    if(c.guitar){
      arms = `${limb("M104 212 C100 262 112 270 140 282")}${hand("fist", "#c1363a", 142, 284, 30)}` +
             `${limb("M296 208 C330 200 348 160 352 136")}${hand("open", "#c1363a", 354, 124, -100)}`;
    }else{
      arms = c.arms.map((a, i) => `<g class="ca-arm ${i ? "r" : "l"}">${limb(a[0])}${hand(a[1], a[2], a[3], a[4], a[5])}</g>`).join("");
    }
    const flash = `<path class="ca-flash" d="${PICK}" fill="#ff3b3b"/>`;
    const dmg = anim ? `
      <g class="d1"><path d="M146 120 L162 138 L150 154 L168 172" fill="none" stroke="${INK}" stroke-width="3.4" ${ST}/><ellipse cx="256" cy="262" rx="14" ry="8" fill="#000" opacity=".22"/></g>
      <g class="d2"><path d="M262 104 L248 128 L266 144 L252 166" fill="none" stroke="${INK}" stroke-width="3.4" ${ST}/>
        <g transform="translate(246 238) rotate(-24)"><rect x="-20" y="-7" width="40" height="14" rx="4" fill="#f2cf9a" ${sw(2.2)}/><rect x="-8" y="-7" width="16" height="14" fill="#e5b97a"/></g></g>
      <g class="d2"><path class="ca-sweat" d="M290 120 Q298 136 290 144 Q282 136 290 120Z" fill="#8ecae6" ${sw(2)}/></g>
      <g class="d3">${(c.eyes || [[178, 150], [222, 150]]).map(e => `<circle cx="${e[0]}" cy="${e[1]}" r="${(c.eyeR || 24) + 2}" fill="#fff" ${sw(3)}/><path d="M${e[0]} ${e[1]} m0 0 a3 3 0 1 1 6 0 a7 7 0 1 1 -14 0 a11 11 0 1 1 22 0 a15 15 0 1 1 -30 0" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`).join("")}</g>
      <g class="dko">${(c.eyes || [[178, 150], [222, 150]]).map(e => `<circle cx="${e[0]}" cy="${e[1]}" r="${(c.eyeR || 24) + 2}" fill="#fff" ${sw(3)}/><path d="M${e[0] - 12} ${e[1] - 12} L${e[0] + 12} ${e[1] + 12} M${e[0] + 12} ${e[1] - 12} L${e[0] - 12} ${e[1] + 12}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`).join("")}</g>
      <g class="dko ca-stars"><g transform="translate(200 60)"><path d="${starPath(0, 0, 11, 5)}" fill="#ffb805" ${sw(2.4)} transform="translate(-44 4)"/><path d="${starPath(0, 0, 13, 6)}" fill="#ffb805" ${sw(2.4)} transform="translate(0 -12)"/><path d="${starPath(0, 0, 11, 5)}" fill="#ffb805" ${sw(2.4)} transform="translate(44 4)"/></g></g>` : "";
    const nameTxt = c.name ? label(c.name[0], c.name[1], 200, 246, 20) : "";
    const body = `<g class="ca-body"><path d="${PICK}" fill="${c.pick}" ${sw(5)}/>${c.face()}${nameTxt}${dmg}</g>`;
    const poseTf = c.pose ? ` transform="rotate(${c.pose} 200 220)"` : "";
    const capeSvg = c.cape ? cape() : "";
    return `<g${poseTf}>${capeSvg}${legs}${feet}${c.guitar ? body + guitar() + arms : arms + body}${anim ? flash : ""}</g>`;
  }
  function starPath(cx, cy, r1, r2){
    let d = ""; for(let i = 0; i < 10; i++){ const a = -Math.PI / 2 + Math.PI * i / 5, r = i % 2 ? r2 : r1; d += (i ? "L" : "M") + (cx + r * Math.cos(a)).toFixed(1) + " " + (cy + r * Math.sin(a)).toFixed(1); }
    return d + "Z";
  }

  const css = `
.ca{width:100%;height:100%;display:block;overflow:visible}
.ca-hitg{transform-box:view-box;transform-origin:200px 380px}
.ca-all{transform-box:view-box;transform-origin:200px 380px;animation:ca-idle 2.6s ease-in-out infinite}
@keyframes ca-idle{0%,100%{transform:scale(1,1)}50%{transform:scale(1.012,.986) translateY(-2px)}}
.ca-arm.l{transform-box:view-box;transform-origin:106px 205px;animation:ca-sway 2.8s ease-in-out infinite}
.ca-arm.r{transform-box:view-box;transform-origin:294px 205px;animation:ca-sway 2.8s ease-in-out infinite reverse}
@keyframes ca-sway{0%,100%{transform:rotate(0)}50%{transform:rotate(5deg)}}
.ca-cape{transform-box:view-box;transform-origin:262px 130px;animation:ca-cape 1.8s ease-in-out infinite}
@keyframes ca-cape{0%,100%{transform:rotate(0)}50%{transform:rotate(3.5deg)}}
.ca-flash{opacity:0}
.ca.hurt .ca-flash{animation:ca-flash .4s ease-out}
@keyframes ca-flash{0%{opacity:.7}100%{opacity:0}}
.ca.hurt .ca-hitg{animation:ca-hurt .5s cubic-bezier(.2,.8,.3,1)}
@keyframes ca-hurt{0%{transform:none}15%{transform:translate(calc(var(--hd,1) * -20px),4px) rotate(calc(var(--hd,1) * -9deg)) scale(.93,1.06)}45%{transform:translate(calc(var(--hd,1) * 8px),0) rotate(calc(var(--hd,1) * 4deg))}100%{transform:none}}
.ca.atk .ca-hitg{animation:ca-atk .55s cubic-bezier(.3,0,.2,1)}
@keyframes ca-atk{0%{transform:none}35%{transform:translateX(calc(var(--ad,1) * 56px)) rotate(calc(var(--ad,1) * 7deg)) scale(1.07)}100%{transform:none}}
.ca.cheer .ca-hitg{animation:ca-cheer .6s ease-out}
@keyframes ca-cheer{0%,100%{transform:none}35%{transform:translateY(-26px) scale(.97,1.05)}60%{transform:translateY(0) scale(1.04,.96)}}
.ca.ko .ca-hitg{animation:ca-ko .9s cubic-bezier(.3,0,.4,1) forwards}
@keyframes ca-ko{0%{transform:none}35%{transform:translateY(-18px) rotate(-6deg)}100%{transform:translate(-16px,34px) rotate(-76deg)}}
.ca.ko .ca-all{animation:none}
.ca-body .d1,.ca-body .d2,.ca-body .d3,.ca-body .dko{opacity:0;transition:opacity .35s}
.ca.st1 .d1,.ca.st2 .d2,.ca.st3 .d3,.ca.ko .dko{opacity:1}
.ca.ko .d3{opacity:0}
.ca-sweat{animation:ca-sweat 1.3s ease-in infinite}
@keyframes ca-sweat{0%{transform:translateY(0);opacity:0}20%{opacity:1}100%{transform:translateY(34px);opacity:0}}
.ca-stars{transform-box:view-box;transform-origin:200px 60px;animation:ca-spin 1.4s linear infinite}
@keyframes ca-spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.ca *{animation:none!important;transition:none!important}}
`;
  function injectCss(){ if(document.getElementById("ca-css")) return; const s = document.createElement("style"); s.id = "ca-css"; s.textContent = css; document.head.appendChild(s); }

  window.CharArt = function(el, name){
    injectCss();
    el.innerHTML = `<svg class="ca" viewBox="0 0 400 400" xmlns="${NS}" aria-hidden="true"><ellipse cx="200" cy="384" rx="110" ry="11" fill="#1d1d1b" opacity=".16"/><g class="ca-hitg"><g class="ca-all">${build(name, true)}</g></g></svg>`;
    const svg = el.querySelector("svg");
    let stage = 0, ko = false, dir = 1;
    const flick = (cls, ms) => { svg.classList.remove(cls); void svg.getBoundingClientRect(); svg.classList.add(cls); setTimeout(() => svg.classList.remove(cls), ms); };
    return {
      setDamage(f){
        if(ko) return;
        f = Math.max(0, Math.min(1, f || 0));
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
  };
  CharArt.svg = name => `<svg viewBox="0 0 400 400" xmlns="${NS}"><g>${build(name, false)}</g></svg>`;
  CharArt.names = Object.keys(CHARS);
})();
