/* Who's playing, for the home games. Load this before any other game script.
   A student's portal link opens the games with ?token=...; the token is taken out of the address bar and added to this
   device's list of players, so siblings on one phone or iPad each open their own link once and can then switch between
   themselves on the games menu. Each player keeps their own progress, stars and character: fmaKey("some-key") gives
   the storage key for whoever is playing. The first player on a device keeps whatever progress the device already had;
   anyone else starts fresh; "Someone else" (a friend) plays without saving to anyone's progress.
   Each finished round is posted to the portal web app, which works out the student from the token itself, and answers
   with the effort points it earned (rounds, practice days and beating your own best: never scores or winning). A small
   note then says so ("+3 for the Tuesday Rockers"). mount() also shows the player's own points for the week and how
   their team is going. No one else's points are ever shown.
   Progress follows the student to any device (cloud saves): every game keeps its progress under fmaKey(name), and those
   items are kept in the portal's "Game Saves" tab. Opening the games fetches the player's items; anything another device
   changed replaces this device's copy (the page reloads once so the game picks it up). If both devices changed the same
   game before syncing, the one with more progress is kept. Changed items are sent after every round and when the page
   closes. The sheet is the master; this device's copy is only a cache.
   With ENDPOINT blank (tracking off) none of this happens: tokens are only stripped from the address, nothing is kept,
   nothing is shown, nothing is sent, and every game uses its plain storage keys. */
(function(){
  // Paste the portal web app's /exec URL here (Apps Script > Deploy > Manage deployments). Blank = tracking off.
  const ENDPOINT = "https://script.google.com/macros/s/AKfycbz300hcF1srTeOc5haho_yF4mqySLhDwtzEuRrLc4S3pVx3DrnktDlw114RXuoVgCJu/exec";
  const KEY = "fma-student-v2", OLD = "fma-student-v1", ON = !!ENDPOINT;
  const empty = () => ({ profiles: [], active: null, n: 0, blankUsed: false });
  function load(){
    try{ const v = JSON.parse(localStorage.getItem(KEY)); if(v && Array.isArray(v.profiles)) return v; }catch(e){}
    try{ const o = JSON.parse(localStorage.getItem(OLD));      // the first version kept one student
      if(o && o.token) return { profiles: [{ token: o.token, name: o.name || "", ns: "" }], active: o.token, n: 0, blankUsed: true }; }catch(e){}
    return empty();
  }
  const save = () => { try{ localStorage.setItem(KEY, JSON.stringify(S)); localStorage.removeItem(OLD); }catch(e){} };
  const S = ON ? load() : empty();
  const prof = () => S.profiles.find(p => p.token === S.active) || null;

  try{
    const u = new URL(location.href), t = (u.searchParams.get("token") || "").trim();
    if(t){
      u.searchParams.delete("token");
      history.replaceState(null, "", u.pathname + u.search + u.hash);
      if(ON){
        if(!S.profiles.some(p => p.token === t)){
          // the device's existing progress goes to the first player only; a removed player's slot is never reused
          const ns = S.blankUsed ? ":p" + (++S.n) : "";
          S.blankUsed = true; S.profiles.push({ token: t, name: "", ns });
        }
        S.active = t; save();
      }
    }
  }catch(e){}

  // the storage key for whoever is playing (plain key when tracking is off or nobody has been added yet)
  const SYNCED = new Set(["fma-home-songs-v1", "fma-home-chords-v1", "fma-tuner-v1", "fma-note-quiz-v1", "fma-boss-v1",
    "fma-picks-v1", "fma-player-v1", "fma-player-touched"]);           // games add their own through fmaKey() too
  window.fmaKey = base => {
    if(/^fma-[a-z0-9-]{1,40}$/.test(base)) SYNCED.add(base);
    if(!ON || !S.profiles.length) return base;
    const p = prof(); return base + (p ? p.ns : ":guest");
  };

  // Which instrument this player plays ("guitar" or "piano"; "" until they've said). Asked once on the games menu, kept with
  // their progress (so it follows them to any device), and changed from the menu's corner button.
  window.fmaInstrument = {
    get(){ try{ const v = localStorage.getItem(fmaKey("fma-instrument-v1")); return v === "piano" || v === "guitar" ? v : ""; }catch(e){ return ""; } },
    set(v){ try{ localStorage.setItem(fmaKey("fma-instrument-v1"), v); }catch(e){} },
    word(){ return this.get() === "piano" ? "piano" : "guitar"; }
  };

  const post = body => fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body) }).then(r => r.json());
  async function names(){
    for(const p of S.profiles.slice()){
      if(p.name) continue;
      try{
        const r = await post({ action: "whoami", token: p.token });
        if(r.ok) p.name = r.firstName;
        else if(r.error === "bad-token"){ S.profiles = S.profiles.filter(x => x !== p); if(S.active === p.token) S.active = null; }
      }catch(e){}
    }
    save();
  }
  const btn = (label, fn) => { const b = document.createElement("button"); b.type = "button"; b.className = "ghost"; b.textContent = label;
    b.style.cssText = "min-height:34px;padding:0 12px;margin:4px 6px 0 0"; b.onclick = fn; return b; };
  const pick = token => { S.active = token; save(); location.reload(); };
  const ord = n => n + (["th", "st", "nd", "rd"][(n % 100 >= 11 && n % 100 <= 13) ? 0 : Math.min(n % 10, 4) % 4] || "th");
  // a short note at the bottom of the screen after a round that earned points
  function toast(r){
    const t = document.createElement("div");
    t.style.cssText = "position:fixed;left:50%;bottom:max(18px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:60;background:#fff;color:#23231F;" +
      "border:2px solid #23231F;border-radius:16px;padding:10px 16px;font:700 16px/1.3 'Work Sans',system-ui,sans-serif;text-align:center;box-shadow:0 10px 30px -12px rgba(0,0,0,.45);" +
      "max-width:calc(100% - 32px);transition:opacity .4s,transform .4s;opacity:0";
    const head = document.createElement("div"); head.textContent = "+" + r.gained + (r.team ? " for " + r.team : " points");
    const why = document.createElement("div"); why.style.cssText = "font-weight:600;font-size:14px;color:#6B6558";
    why.textContent = r.reasons && r.reasons.length ? "For " + r.reasons.join(", ").replace(/, ([^,]*)$/, " and $1") : "";
    t.append(head, why); document.body.append(t);
    requestAnimationFrame(() => { t.style.opacity = "1"; });
    setTimeout(() => { t.style.opacity = "0"; setTimeout(() => t.remove(), 500); }, 3800);
  }

  /* ---------- the bug button (every page): the games are brand new, so make telling us easy ----------
     A small 🐞 in the bottom corner opens a box to say what went wrong. It goes to the portal's "Bug Reports" tab with the
     page, the device and the last few errors the page hit; with a student playing, their first name comes from the token
     on the sheet's side. Hide it on a page with <body data-no-bug>. */
  const BUG_EMAIL = "hello@forbesmusic.com.au";
  const errs = [];
  window.addEventListener("error", e => { errs.push(String(e.message || "error").slice(0, 150) + (e.lineno ? " @" + String(e.filename || "").split("/").pop() + ":" + e.lineno : "")); errs.splice(0, errs.length - 3); });
  window.addEventListener("unhandledrejection", e => { errs.push("promise: " + String((e.reason && e.reason.message) || e.reason).slice(0, 150)); errs.splice(0, errs.length - 3); });
  function bugBox(){
    if(document.getElementById("fmaBugBox")) return;
    const font = "'Work Sans',system-ui,-apple-system,sans-serif";
    const wrap = document.createElement("div"); wrap.id = "fmaBugBox";
    wrap.style.cssText = "position:fixed;inset:0;z-index:2147483000;background:rgba(35,35,31,.45);display:flex;align-items:center;justify-content:center;padding:16px";
    const box = document.createElement("div");
    box.style.cssText = "background:#fff;color:#23231F;border:2px solid #23231F;border-radius:18px;padding:18px;max-width:420px;width:100%;box-shadow:0 18px 40px -14px rgba(0,0,0,.5);font:16px/1.4 " + font;
    const me = ON ? prof() : null;
    box.innerHTML = `<div style="font:800 21px/1.2 'Nunito',ui-rounded,system-ui,sans-serif;margin-bottom:6px">🐞 Found a bug?</div>
      <div style="color:#6B6558;font-size:15px;margin-bottom:10px">These games are brand new. If something broke, looked wrong, or was confusing, tell us and we'll fix it. Thank you!</div>
      <textarea id="fmaBugText" rows="4" maxlength="1000" placeholder="What happened? What were you doing just before?" style="width:100%;box-sizing:border-box;border:2px solid #E8E1D2;border-radius:12px;padding:10px;font:16px/1.4 ${font};resize:vertical"></textarea>
      ${me ? "" : `<input id="fmaBugWho" maxlength="80" placeholder="Your name or email (optional)" style="width:100%;box-sizing:border-box;margin-top:8px;border:2px solid #E8E1D2;border-radius:12px;padding:10px;font:16px ${font}">`}
      <div id="fmaBugMsg" style="min-height:20px;margin-top:6px;font-size:14px;color:#6B6558"></div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px">
        <button type="button" id="fmaBugCancel" style="min-height:42px;padding:0 16px;border-radius:12px;border:2px solid #E8E1D2;background:#fff;color:#23231F;font:700 16px ${font};cursor:pointer">Cancel</button>
        <button type="button" id="fmaBugSend" style="min-height:42px;padding:0 18px;border-radius:12px;border:2px solid #23231F;background:#FFB805;color:#23231F;font:800 16px ${font};cursor:pointer">Send</button>
      </div>`;
    wrap.append(box); document.body.append(wrap);
    const $ = id => box.querySelector("#" + id), close = () => wrap.remove();
    $("fmaBugText").focus();
    $("fmaBugCancel").onclick = close;
    wrap.addEventListener("click", e => { if(e.target === wrap) close(); });
    $("fmaBugSend").onclick = async () => {
      const what = $("fmaBugText").value.trim(), who = $("fmaBugWho") ? $("fmaBugWho").value.trim() : "";
      if(!what){ $("fmaBugMsg").textContent = "Type a few words about what happened first."; return; }
      const report = { action: "bug", token: me ? me.token : "", page: location.pathname.split("/").pop() || "index.html", what, who,
        device: navigator.userAgent.slice(0, 250), screen: innerWidth + "x" + innerHeight, errors: errs.join(" | ") };
      const mail = () => { $("fmaBugMsg").innerHTML = `Couldn't send it just now. Could you email it to <a href="mailto:${BUG_EMAIL}?subject=${encodeURIComponent("Practice games bug (" + report.page + ")")}&body=${encodeURIComponent(what)}">${BUG_EMAIL}</a>?`; };
      if(!ENDPOINT){ mail(); return; }
      $("fmaBugSend").disabled = true; $("fmaBugMsg").textContent = "Sending…";
      try{
        const r = await post(report);
        if(!r || !r.ok) throw 0;
        box.innerHTML = `<div style="font:800 21px/1.2 'Nunito',ui-rounded,system-ui,sans-serif;margin-bottom:6px">Thanks! 🙌</div><div style="color:#6B6558">We've got it, and we'll take a look.</div>`;
        setTimeout(close, 2200);
      }catch(e){ $("fmaBugSend").disabled = false; mail(); }
    };
  }
  document.addEventListener("DOMContentLoaded", () => {
    if(document.body.hasAttribute("data-no-bug")) return;
    const b = document.createElement("button"); b.type = "button"; b.textContent = "🐞"; b.title = "Found a bug? Tell us"; b.setAttribute("aria-label", "Report a bug");
    b.style.cssText = "position:fixed;left:max(10px,env(safe-area-inset-left));bottom:max(10px,env(safe-area-inset-bottom));z-index:2147482000;width:40px;height:40px;" +
      "border-radius:50%;border:2px solid #23231F;background:#fff;font-size:20px;line-height:1;padding:0;cursor:pointer;opacity:.8;box-shadow:0 4px 12px -4px rgba(0,0,0,.35)";
    b.onclick = bugBox; document.body.append(b);
  });

  // while someone's scores are being saved, the pages' "nothing is sent anywhere" lines switch to wording that's true
  if(ON && prof()) document.addEventListener("DOMContentLoaded", () =>
    document.querySelectorAll("[data-tracked]").forEach(el => { el.textContent = el.getAttribute("data-tracked"); }));

  /* ---------- cloud saves ---------- */
  const loadedAt = Date.now();
  let pulled = false, pushing = false;
  const hash = t => { let h = 2166136261; for(let i = 0; i < t.length; i++){ h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36) + "." + t.length; };
  const metaKey = p => "fma-sync-v1" + p.ns;               // per player: what was last sent or fetched, item by item
  const readMeta = p => { try{ return JSON.parse(localStorage.getItem(metaKey(p))) || {}; }catch(e){ return {}; } };
  const writeMeta = (p, m) => { try{ localStorage.setItem(metaKey(p), JSON.stringify(m)); }catch(e){} };
  const mine = (p, name) => { try{ return localStorage.getItem(name + p.ns); }catch(e){ return null; } };
  const num = x => Number(x) || 0;
  // how far along a game's save is. Only used when two devices both changed the same game; any other item keeps this device's.
  const PROGRESS = {
    "fma-home-songs-v1": o => Object.values(o.songs || {}).reduce((a, r) => a + num(r.stars) * 10 + (r.diamond ? 20 : 0) + num(r.runs) * 0.01, 0),
    "fma-home-chords-v1": o => num(o.unlocked) * 100 + Object.values(o.cards || {}).reduce((a, c) => a + (c.grad ? 10 : 0) + num(c.streak), 0) + num(o.sess) * 0.01,
    "fma-tuner-v1": o => num(o.runs),
    "fma-note-quiz-v1": o => Object.keys(o).filter(k => /^best/.test(k)).reduce((a, k) => a + num(o[k]), 0),
    "fma-picks-v1": o => num(o.total) + (o.unlocked || []).length
  };
  const progress = (name, text) => { try{ return PROGRESS[name](JSON.parse(text) || {}); }catch(e){ return 0; } };
  // Song stars merge song by song (best of each), so stars earned on two devices are all kept. Returns the merged text.
  const MERGE = {
    "fma-home-songs-v1": (a, b) => {
      const A = JSON.parse(a) || {}, B = JSON.parse(b) || {}, songs = Object.assign({}, A.songs);
      for(const [id, r] of Object.entries(B.songs || {})){
        const q = songs[id];
        songs[id] = !q ? r : { stars: Math.max(num(q.stars), num(r.stars)), best: Math.max(num(q.best), num(r.best)),
          diamond: !!(q.diamond || r.diamond), runs: Math.max(num(q.runs), num(r.runs)) };
      }
      const seen = new Set(), log = (A.log || []).concat(B.log || []).filter(x => { const k = x && x.t + x.song + x.mode; if(seen.has(k)) return false; seen.add(k); return true; })
        .sort((x, y) => String(x.t).localeCompare(String(y.t))).slice(-50);
      return JSON.stringify(Object.assign({}, A, B, { songs, log }));
    },
    // Chords: the same game is played in class on the Group Guitar rig, so the sheet's copy may hold class results.
    // Each chord keeps whichever copy changed it last (its "t"); the same rule as mergeChordSaves_ in portal_saves.js
    // and the rig's mergeChordSaves (keep the three identical).
    "fma-home-chords-v1": (a, b) => {
      const A = JSON.parse(a) || {}, B = JSON.parse(b) || {};
      const sa = num(A.sess), sb = num(B.sess), sess = Math.max(sa, sb);
      const rank = c => (c.grad ? Math.min(4, num(c.k) + 1) : Math.min(3, num(c.k))) * 1000 + (c.grad ? 500 : 0) + num(c.streak);
      const take = (c, from) => { const o = Object.assign({}, c); if(o.grad && o.due != null) o.due = num(o.due) - from + sess; return o; };
      const ca = A.cards || {}, cb = B.cards || {}, cards = {};
      for(const n of new Set([...Object.keys(ca), ...Object.keys(cb)])){
        const x = ca[n], y = cb[n];
        if(!y){ cards[n] = take(x, sa); continue; }
        if(!x){ cards[n] = take(y, sb); continue; }
        const useA = (num(x.t) || num(y.t)) ? num(x.t) > num(y.t) : rank(x) > rank(y);
        const pick = useA ? take(x, sa) : take(y, sb);
        if(x.lapses != null || y.lapses != null) pick.lapses = Math.max(num(x.lapses), num(y.lapses));
        for(const f of ["everGrad", "retained", "diamondEver"]) if(x[f] || y[f]) pick[f] = true;
        cards[n] = pick;
      }
      const merged = Object.assign({}, B, { unlocked: Math.max(num(A.unlocked), num(B.unlocked)) || 2, sess,
        lastDate: [A.lastDate, B.lastDate].filter(Boolean).sort().pop() || null, cards });
      // nothing new from the other copy: hand back this device's text unchanged, so it isn't saved and sent again
      const canon = o => JSON.stringify(o, (k, v) => v && typeof v === "object" && !Array.isArray(v) ? Object.keys(v).sort().reduce((r, x) => (r[x] = v[x], r), {}) : v);
      return canon(merged) === canon(B) ? b : JSON.stringify(merged);
    }
  };

  // Bring this device up to date with saved items from the sheet. An item another device changed replaces this
  // device's copy, unless this device changed it too and has more progress (then this device's copy goes up instead).
  // Returns true if the page reloaded to pick up new progress.
  function reconcile(p, cloud, early){
    const meta = readMeta(p);
    let replaced = false;
    for(const name of Object.keys(cloud)){
      const c = cloud[name], m = meta[name] || {}, here = mine(p, name);
      if(!/^fma-[a-z0-9-]{1,40}$/.test(name) || !c || typeof c.v !== "string" || c.at === m.at) continue;   // nothing new
      const changedHere = here != null && hash(here) !== m.h;
      if(changedHere && MERGE[name]){                       // both changed: combine them
        let merged; try{ merged = MERGE[name](c.v, here); }catch(e){ merged = here; }
        if(merged === here){ meta[name] = { at: c.at, h: m.h }; continue; }       // this device already has it all
        if(!early) continue;
        try{ localStorage.setItem(name + p.ns, merged); replaced = true; }catch(e){ continue; }
        meta[name] = { at: c.at, h: m.h };                  // still "changed here", so the merged copy goes up
        continue;
      }
      const takeCloud = !changedHere || (PROGRESS[name] && progress(name, c.v) > progress(name, here));
      if(takeCloud){
        if(!early) continue;       // a game is probably under way: the next page sorts it out (its copy is still "changed")
        if(here !== c.v){ try{ localStorage.setItem(name + p.ns, c.v); replaced = true; }catch(e){ continue; } }
        meta[name] = { at: c.at, h: hash(c.v) };
      }else meta[name] = { at: c.at, h: m.h };             // this device has more progress: it goes up with the next save
    }
    writeMeta(p, meta);
    if(replaced){
      let last = 0; try{ last = Number(sessionStorage.getItem("fma-sync-reload")) || 0; }catch(e){}
      if(Date.now() - last > 15000){ try{ sessionStorage.setItem("fma-sync-reload", String(Date.now())); }catch(e){} location.reload(); return true; }
    }
    return false;
  }
  const early = () => Date.now() - loadedAt < 10000;
  async function pull(){
    const p = prof(); if(!ON || !p) return;
    let r; try{ r = await post({ action: "load", token: p.token }); }catch(e){ return; }
    if(!r || !r.ok || prof() !== p) return;
    pulled = true;
    if(!reconcile(p, r.keys || {}, early())) push();
  }
  // Send whatever this player changed on this device, saying which version of each item it last saw. Never before
  // this device has caught up (pull). Items another device saved in the meantime come back as conflicts.
  async function push(closing, tries){
    const p = prof(); if(!ON || !p || !pulled) return false;
    const meta = readMeta(p), keys = {}, base = {}, sent = {};
    for(const name of SYNCED){
      const v = mine(p, name); if(v == null) continue;
      const h = hash(v); if(meta[name] && meta[name].h === h) continue;
      keys[name] = v; sent[name] = h; base[name] = meta[name] ? meta[name].at : 0;
    }
    if(!Object.keys(keys).length) return true;
    const body = JSON.stringify({ action: "save", token: p.token, keys, base });
    if(closing){ try{ fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body, keepalive: true }); }catch(e){} return true; }
    if(pushing) return false;
    pushing = true;
    let r;
    try{ r = await fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body }).then(x => x.json()); }
    catch(e){ return false; }finally{ pushing = false; }
    if(!r || !r.ok) return false;
    const m = readMeta(p); for(const name in r.at) m[name] = { at: r.at[name], h: sent[name] }; writeMeta(p, m);
    if(r.conflicts && Object.keys(r.conflicts).length){
      if(reconcile(p, r.conflicts, early())) return true;
      if((tries || 0) < 2) return push(false, (tries || 0) + 1);      // this device's copies that won go up now
    }
    return true;
  }
  if(ON && prof()){
    pull();
    document.addEventListener("visibilitychange", () => { if(document.visibilityState === "hidden") push(true); });
    window.addEventListener("pagehide", () => push(true));
  }

  /* ---------- practice time and where players stop (13 Oct 2026) ----------
     Practice minutes: every finished round carries secs, how long this page was open AND on screen since the last finished
     round (or since it opened), capped per game so a page left open on the bench doesn't count. Where players stop: a few
     plain events go to the portal's "Game Events" tab: "open" (a page opened), "mic-ok" / "mic-blocked" (the microphone
     question), "left" (the page closed before a round was finished, with how long it was open). Only for a named player with
     tracking on. Never any sound, never what was played. */
  const PAGE = (location.pathname.split("/").pop() || "index").replace(/\.html$/, "") || "index";
  const CAPS = { chords: 40, "boss-battle": 150, "tuning-race": 300, "note-quiz": 300 };      // the most one round can count, in seconds (others 240)
  let shownAt = document.visibilityState === "visible" ? performance.now() : null, banked = 0, rounds = 0, opened = performance.now();
  const onScreen = () => banked + (shownAt !== null ? performance.now() - shownAt : 0);
  document.addEventListener("visibilitychange", () => {
    if(document.visibilityState === "hidden"){ if(shownAt !== null){ banked += performance.now() - shownAt; shownAt = null; } }
    else if(shownAt === null) shownAt = performance.now();
  });
  function takeSecs(game){
    const s = onScreen() / 1000; banked = 0; shownAt = document.visibilityState === "visible" ? performance.now() : null;
    return Math.round(Math.min(s, CAPS[game] || 240));
  }
  const evq = []; let evTimer = null;
  function flushEvents(closing){
    const p = prof(); if(!ON || !p || !evq.length) return;
    const body = JSON.stringify({ action: "event", token: p.token, ev: evq.splice(0, 20) });
    try{ fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body, keepalive: !!closing }).catch(() => {}); }catch(e){}
  }
  function event(name, extra){
    if(!ON || !prof()) return;
    evq.push(Object.assign({ e: name, page: PAGE, at: Date.now() }, extra || {}));
    clearTimeout(evTimer); evTimer = setTimeout(flushEvents, 1500);
  }
  if(ON){
    event("open");
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){      // the microphone question, answered once per page
      const gum = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices); let asked = false;
      navigator.mediaDevices.getUserMedia = c => gum(c).then(st => { if(!asked){ asked = true; event("mic-ok"); } return st; },
        e => { if(!asked){ asked = true; event("mic-blocked", { why: e && e.name || "" }); } throw e; });
    }
    window.addEventListener("pagehide", () => {
      if(!rounds && PAGE !== "index") event("left", { secs: Math.round((performance.now() - opened) / 1000) });
      flushEvents(true);
    });
  }

  window.FMAStudent = {
    active: () => ON && !!prof(),
    event,
    // the studio's practice challenge this week (minutes so far, the goal, the prize), or null when tracking is off
    async challenge(){
      if(!ON) return null;
      try{ const p = prof(), r = await post({ action: "challenge", token: p ? p.token : "" }); return r.ok ? r : null; }catch(e){ return null; }
    },
    // Fill el with who's playing and buttons to switch between this device's players. Empty when tracking is off.
    async mount(el){
      el.textContent = "";
      if(!ON || !S.profiles.length) return;
      await names();
      const named = S.profiles.filter(p => p.name), me = prof();
      if(!named.length) return;
      if(me && me.name){
        const b = document.createElement("b"); b.textContent = me.name;
        el.append("Playing as ", b, ". Your scores save to your progress. ");
      }else el.append(named.length ? "Who's playing? " : "");
      const row = document.createElement("div");
      named.filter(p => p !== me).forEach(p => row.append(btn((me ? "I'm " : "") + p.name, () => pick(p.token))));
      if(me) row.append(btn(named.length > 1 ? "Someone else" : "Not you?", () => pick(null)));
      el.append(row);
      if(!me) return;
      try{      // your own points this week, and your team's place (never anyone else's points)
        const r = await post({ action: "points", token: me.token });
        if(!r.ok) return;
        const p = document.createElement("div"); p.style.marginTop = "6px";
        p.textContent = "Your points this week: " + r.me.week + (r.me.last ? " (last week " + r.me.last + ")" : "");
        el.append(p);
        r.teams.forEach(t => { const d = document.createElement("div");
          d.textContent = t.name + ": " + ord(t.rank) + " of " + t.of + " this week · " + t.practised + " of " + t.members + " have practised"; el.append(d); });
      }catch(e){}
    },
    // the weekly team league (team names and counts only), for the classroom screen; null when tracking is off
    async league(){
      if(!ON) return null;
      try{ const r = await post({ action: "league" }); return r.ok ? r : null; }catch(e){ return null; }
    },
    // Called after every finished round. Picks (fma-picks.js) are earned on this device whether or not tracking is on.
    // Returns true if the round was saved, false if tracking is off, nobody is playing, or the save failed.
    async send(game, data){
      data = Object.assign({}, data, { secs: takeSecs(game) }); rounds++;
      try{ if(window.FMAPicks) FMAPicks.round(game, data); }catch(e){}
      const p = prof();
      if(!ON || !p) return false;
      setTimeout(push, 50);                                // the round's progress, once the game has saved it (some save just after this call)
      try{
        const r = await post(Object.assign({ action: "result", token: p.token, game }, data));
        if(r.ok && r.gained > 0) toast(r);
        return !!r.ok;
      }catch(e){ return false; }
    },
    // for testing: fetch now / send now
    sync: { pull, push }
  };
})();
