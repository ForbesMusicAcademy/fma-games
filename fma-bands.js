/* The Band League board: every group class is a band, and each band's characters stand together acting out a scene.
   Used by league.html (the games site) and the Group Guitar classroom screen (between activities).
   Needs player-art.js loaded first.

   FMABands.render(el, data, opts)
     data  = the portal's league reply: { week:"2026-10-12", lastWinner, teams:[{ name, perMember, home, cls, practised,
             members, looks:[character config or null] }] }, already sorted, top band first
     opts  = { animate:"all" | "leader" (default), size:"big" (classroom TV) | "" }
   Returns a controller with destroy(), to stop the animated characters before redrawing.

   Bands, never students: no names and no one student's points are shown. A member who hasn't made a character yet
   gets a stand-in, picked the same way every time (from the band and their place in it), so the line-up doesn't
   shuffle on every refresh. Each week the bands act out a new scene (the league resets on Mondays), standing right on
   the white card, no backdrop; the leading band gets the gold border and always plays live. */
(function(){
  // One pose set per week, cycling. Players holding an instrument keep playing it (the big poses become a solo).
  // One scene per week, cycling: the whole band acts it out together. Players holding an instrument keep playing it
  // (the big poses become a solo), so a scene reads as the band mid-song.
  const WEEKS = [
    { name:"The big finish",  poses:["star", "rock", "star", "cheer"] },
    { name:"Album cover",     poses:["hips", "flex", "peace", "hips"] },
    { name:"Hello, Forbes!",  poses:["wave", "wave", "thumbs", "wave"] },
    { name:"Encore!",         poses:["cheer", "star", "cheer", "rock"] },
    { name:"Photo shoot",     poses:["peace", "thumbs", "peace", "hips"] },
    { name:"Rock out",        poses:["rock", "rock", "flex", "rock"] }
  ];
  const weekIndex = week => { const t = Date.parse((week || "") + "T00:00:00Z"); return isFinite(t) ? Math.floor(t / 604800000) : 0; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  // a stand-in character that's always the same for this band and place: Player.random() with a seeded Math.random
  function standIn(seedText){
    let h = 2166136261; for(const ch of seedText){ h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
    let s = (h >>> 0) || 1;
    const real = Math.random;
    Math.random = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    try{ return window.Player.random(); } finally { Math.random = real; }
  }
  function injectCss(){
    if(document.getElementById("fmab-css")) return;
    const st = document.createElement("style"); st.id = "fmab-css";
    st.textContent = `
.fmab{display:flex;flex-direction:column;gap:var(--fmab-gap,14px)}
.fmab .wk{display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap;font-family:var(--head,inherit);font-weight:900;color:var(--muted,#6B6558)}
.fmab .wk b{color:var(--fg,#23231F)}
.fmab .band{display:grid;grid-template-columns:auto 1fr;gap:6px 14px;align-items:center;background:var(--card,#fff);border:1px solid var(--line,#E8E1D2);border-radius:22px;padding:10px 16px 12px}
.fmab .band.lead{border:3px solid #FFB805;box-shadow:0 0 0 6px rgba(255,184,5,.18)}
.fmab .rk{grid-row:1/3;font-family:var(--head,inherit);font-weight:900;font-size:var(--fmab-rk,30px);width:1.6em;text-align:center;color:var(--muted,#6B6558)}
.fmab .lead .rk{color:#C98F00}
.fmab .nm{display:flex;justify-content:space-between;align-items:baseline;gap:10px;font-family:var(--head,inherit);font-weight:900;font-size:var(--fmab-nm,22px)}
.fmab .nm small{font-size:.62em;color:var(--muted,#6B6558);white-space:nowrap}
.fmab .stage{position:relative;display:flex;justify-content:center;align-items:flex-end;gap:0;height:var(--fmab-h,140px)}
.fmab .who{height:96%;aspect-ratio:1;flex:0 1 auto;min-width:0;margin:0 calc(var(--fmab-h,140px) * -.2);position:relative;z-index:1}
.fmab .who::before{content:"";position:absolute;left:32%;right:32%;bottom:1%;height:5%;border-radius:50%;background:rgba(35,35,31,.12);z-index:-1}
.fmab .who svg{width:100%;height:100%;display:block}
.fmab .bar{grid-column:2;height:10px;background:var(--line,#E8E1D2);border-radius:999px;overflow:hidden}
.fmab .bar i{display:block;height:100%;background:var(--sky,#4A9CC2);border-radius:999px;transition:width .8s}
.fmab .lead .bar i{background:var(--good,#3E7D4C)}
.fmab .sub{grid-column:2;color:var(--muted,#6B6558);font-weight:600;font-size:var(--fmab-sub,14px)}
.fmab.big{--fmab-h:var(--fmab-hbig,17vh);--fmab-nm:3vh;--fmab-rk:4.4vh;--fmab-sub:1.7vh;--fmab-gap:1.2vh}
.fmab.big .band{padding:.8vh 1.2vw 1vh;border-radius:2.4vh}
.fmab.big .bar{height:1.1vh}
.fmab.big .wk{font-size:2.2vh}
.fmab .cols{display:grid;grid-template-columns:var(--fmab-cols,1fr);gap:var(--fmab-gap,14px)}
@media (max-width:520px){.fmab .band{gap:6px 8px;padding:10px 10px 12px}.fmab .rk{font-size:22px;width:1.1em}.fmab .nm{font-size:18px}}
`;
    document.head.appendChild(st);
  }
  function render(el, data, opts){
    opts = opts || {}; injectCss();
    const teams = (data && data.teams) || [], live = [];
    const wk = WEEKS[((weekIndex(data && data.week) % WEEKS.length) + WEEKS.length) % WEEKS.length];
    const top = Math.max(1, ...teams.map(t => t.perMember || 0));
    // ties share a place (Dave, 14 Oct 2026): equal points = the same place, shown "=1"; every band tied at the top leads
    const pts = t => Math.round((t.perMember || 0) * 10);
    const place = teams.map((t, i) => { let k = i; while(k > 0 && pts(teams[k - 1]) === pts(t)) k--; return k + 1; });
    const tied = i => teams.some((u, j) => j !== i && pts(u) === pts(teams[i]));
    const leads = i => place[i] === 1 && (teams[i].perMember || 0) > 0;
    const lead = teams.length && teams[0].perMember > 0 ? 0 : -1;
    const cols = opts.size !== "big" ? 1 : teams.length > 6 ? 3 : teams.length > 2 ? 2 : 1;   // the classroom TV fits them all on one screen
    el.innerHTML = `<div class="fmab ${opts.size === "big" ? "big" : ""}" style="--fmab-cols:repeat(${cols},1fr)">` +
      `<div class="wk"><span>This week's scene: <b>${esc(wk.name)}</b></span>${data && data.lastWinner ? `<span>Last week's winners: <b>${esc(data.lastWinner)}</b></span>` : ""}</div>` +
      `<div class="cols">` + teams.map((t, i) =>
        `<div class="band ${leads(i) ? "lead" : ""}" data-i="${i}"><div class="rk">${leads(i) ? "🏆" : (tied(i) ? "=" : "") + place[i]}</div>` +
        `<div class="nm"><span>${esc(t.name)}</span><small>${t.perMember} pts each${leads(i) && tied(i) ? " · equal 1st" : ""}</small></div>` +
        `<div class="stage"></div><div class="bar"><i style="width:${Math.max(2, 100 * (t.perMember || 0) / top).toFixed(0)}%"></i></div>` +
        `<div class="sub">${t.practised} of ${t.members} practised at home${t.practised === t.members && t.members ? " · whole-band bonus!" : ""}` +
          `${t.cls ? " · " + t.cls + " from class games" : ""}</div></div>`).join("") + `</div></div>`;
    teams.forEach((t, i) => {
      const stage = el.querySelector(`.band[data-i="${i}"] .stage`); if(!stage) return;
      const looks = (t.looks && t.looks.length ? t.looks : Array.from({ length:t.members || 0 }, () => null));
      const animate = opts.animate === "all" || leads(i);
      looks.forEach((cfg, k) => {
        const mine = !!cfg, c = cfg || standIn(t.name + "#" + k), pose = wk.poses[k % wk.poses.length];
        const d = document.createElement("div"); d.className = "who" + (mine ? "" : " new"); stage.appendChild(d);
        if(animate && window.PlayerArt){
          try{ live.push(window.PlayerArt(d, Object.assign({}, c), { idle:true, pose })); }catch(e){ d.innerHTML = window.PlayerArt.svg(c, "full", pose); }
        } else if(window.PlayerArt) d.innerHTML = window.PlayerArt.svg(c, "full", pose);
      });
    });
    return { destroy(){ live.forEach(c => { try{ c.destroy(); }catch(e){} }); live.length = 0; } };
  }
  // A pretend league for trying the board with no portal (league.html?demo, classroom.html?demo&league)
  function demo(){
    const now = new Date(), mon = new Date(now.getTime() - ((now.getDay() + 6) % 7) * 86400000);
    const names = ["Monday 4:30PM", "Tuesday 4:30PM", "Friday 4:30PM", "Thursday 5:30PM", "Wednesday 4:00PM"];
    const sizes = [4, 5, 3, 6, 4];
    const teams = names.map((name, i) => {
      const members = sizes[i], practised = Math.max(1, members - (i % 3)), home = Math.round((38 - i * 6.5) * 10) / 10, cls = [12, 15, 6, 9, 3][i];
      const looks = Array.from({ length:members }, (_, k) => (k + i) % 3 === 0 ? null : standIn("demo" + i + "-" + k));
      return { name, members, practised, home, cls, perMember:Math.round((home + cls) * 10) / 10, looks };
    }).sort((a, b) => b.perMember - a.perMember);
    return { ok:true, week:mon.toISOString().slice(0, 10), lastWinner:"Tuesday 4:30PM", teams };
  }
  window.FMABands = { render, demo, WEEKS };
})();
