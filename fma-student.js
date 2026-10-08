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
   With ENDPOINT blank (tracking off) none of this happens: tokens are only stripped from the address, nothing is kept,
   nothing is shown, nothing is sent, and every game uses its plain storage keys. */
(function(){
  // Paste the portal web app's /exec URL here (Apps Script > Deploy > Manage deployments). Blank = tracking off.
  const ENDPOINT = "";
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
  window.fmaKey = base => {
    if(!ON || !S.profiles.length) return base;
    const p = prof(); return base + (p ? p.ns : ":guest");
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

  // while someone's scores are being saved, the pages' "nothing is sent anywhere" lines switch to wording that's true
  if(ON && prof()) document.addEventListener("DOMContentLoaded", () =>
    document.querySelectorAll("[data-tracked]").forEach(el => { el.textContent = el.getAttribute("data-tracked"); }));

  window.FMAStudent = {
    active: () => ON && !!prof(),
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
      try{ if(window.FMAPicks) FMAPicks.round(game, data); }catch(e){}
      const p = prof();
      if(!ON || !p) return false;
      try{
        const r = await post(Object.assign({ action: "result", token: p.token, game }, data));
        if(r.ok && r.gained > 0) toast(r);
        return !!r.ok;
      }catch(e){ return false; }
    }
  };
})();
