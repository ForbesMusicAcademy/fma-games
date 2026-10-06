/* Student tracking for the home games. The portal link carries ?token=...; it is saved on this device, removed from the
   address bar, and each finished round is posted to the portal web app, which works out the student from the token itself.
   Without a token (or with ENDPOINT blank) nothing is sent and nothing is shown. Never silent: the page shows who is
   playing, with a "Not you?" switch for shared phones. */
(function(){
  // Paste the portal web app's /exec URL here (Apps Script > Deploy > Manage deployments). Blank = tracking off.
  const ENDPOINT = "";
  const KEY = "fma-student-v1";
  const load = () => { try{ return JSON.parse(localStorage.getItem(KEY)) || {}; }catch(e){ return {}; } };
  const save = o => { try{ localStorage.setItem(KEY, JSON.stringify(o)); }catch(e){} };

  try{
    const u = new URL(location.href), t = (u.searchParams.get("token") || "").trim();
    if(t){
      const old = load();
      save(old.token === t ? old : {token:t});
      u.searchParams.delete("token");
      history.replaceState(null, "", u.pathname + u.search + u.hash);
    }
  }catch(e){}

  const post = body => fetch(ENDPOINT, {method:"POST", headers:{"Content-Type":"text/plain;charset=utf-8"}, body:JSON.stringify(body)}).then(r => r.json());
  const on = () => !!(ENDPOINT && load().token);

  async function whoami(){
    const s = load();
    if(!ENDPOINT || !s.token) return "";
    if(s.name) return s.name;
    try{
      const r = await post({action:"whoami", token:s.token});
      if(r.ok){ s.name = r.firstName; save(s); return s.name; }
      if(r.error === "bad-token") save({});      // an old or wrong link: forget it
    }catch(e){}
    return "";
  }

  window.FMAStudent = {
    active: on,
    forget(){ save({}); },
    // Fill `el` with "Playing as Ava. Not you?" while a token is saved; leave it empty otherwise.
    async mount(el){
      el.textContent = "";
      const name = await whoami();
      if(!name) return;
      const b = document.createElement("b"); b.textContent = name;
      const sw = document.createElement("button"); sw.type = "button"; sw.className = "ghost"; sw.textContent = "Not you?";
      sw.style.cssText = "min-height:32px;padding:0 12px;margin-left:8px";
      sw.onclick = () => { this.forget(); el.textContent = "Okay. Scores from this device won't be saved. Open your own link from the portal to save yours."; };
      el.append("Playing as ", b, ". Your scores save to your progress. ", sw);
    },
    // Returns true if the round was saved, false if tracking is off or the save failed.
    async send(game, data){
      const s = load();
      if(!ENDPOINT || !s.token) return false;
      try{ return !!(await post(Object.assign({action:"result", token:s.token, game}, data))).ok; }catch(e){ return false; }
    }
  };
})();
