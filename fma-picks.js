/* Picks 🎸: the practice games' currency. Load after fma-student.js and player-art.js.
   Students start with a small set of character items and earn picks by practising, then spend them in the character editor
   to unlock more. Picks are only ever EARNED by playing, never bought (red line 1: no money, ever), and they only buy
   character items (red line 6: no real-world prizes). Every locked item shows its price, so the path is always clear.
   Identity is never locked (7 Oct rule): every skin tone, body, eyes, mouth, natural hair colour and plenty of hairstyles
   are open from day one, so every kid can make a character that looks like them. Only the flair is locked.
   Adventure gear (Rust Row's hard hat, gas mask...) can't be bought: it's only found by clearing quests in Adventure.
   Everything is kept on this device, one wallet per player (fmaKey), like the rest of the games' progress. */
(function(){
  /* ---------------- the rules, set once (change the numbers here) ---------------- */
  const EARN = {
    round: 5,            // every finished round, even a "not yet": every try pays
    chordTry: 1,         // Chord Practice counts each chord as a round, so it pays a little per chord...
    chordHit: 2,         // ...and a bit more when it rings
    best: 10,            // beating your own best score or time
    graduate: 30,        // a chord graduates (once per chord)
    boss: 30,            // beating a boss at a new song, speed or mode (once each)
    quest: 25,           // clearing an Adventure quest (once each), on top of that level's own gear
    days: { 3: 20, 5: 30 }   // practising on 3 and on 5 different days in a week (Mon-Sun). Nothing is lost by missing a day.
    // still to come, once tracking is on: a bonus for everyone when the whole group practises that week
  };
  // what's open from the start, per part of the character (anything not listed costs picks)
  const OPEN = {
    hair: ["none", "buzz", "balding", "crop", "shortsides", "sweep", "curly", "afro", "bun", "ponytail", "pigtails", "plait", "bob", "long", "wavy"],
    mark: ["none", "freckles", "plaster"],
    eyewear: ["none", "glasses"],
    top: ["tee", "hoodie", "stripes"],
    bottom: ["pants", "shorts", "skirt"],
    shoes: ["sneakers", "hightops"],
    neck: ["none", "scarf"],
    extra: ["none", "backpack"],
    acc: ["none", "cap", "beanie", "bow"],
    gear: ["none", "acoustic", "guitar"]
  };
  // what everything else costs: the more of a novelty, the more picks (hair colours are never locked). Anything new that
  // isn't listed here costs 60.
  const PRICES = {
    hair: { quiff: 30, mop: 30, bowl: 60, spiky: 60, spacebuns: 60, grunge: 60, mohawk: 100 },
    mark: { scar: 30, warpaint: 60, glam: 60, bolt: 100, starpaint: 150, batpaint: 150 },
    eyewear: { round: 30, shades: 60, mask: 100, patch: 100 },
    top: { overalls: 30, jersey: 30, track: 30, bolt: 30, jacket: 60, flannel: 60, puffer: 60, tiedye: 60, collarless: 60, fringe: 100, military: 100, sequin: 150, pepper: 150, leather: 150 },
    bottom: { leggings: 30, trackies: 30, cargo: 30, pleated: 30, baggy: 60, ripped: 60, maxi: 60, flares: 100, stage: 100, tutu: 100 },
    shoes: { boots: 30, chelsea: 60, platforms: 100 },
    neck: { beads: 30, bowtie: 30, peace: 60, chain: 60, clock: 100 },
    extra: { bumbag: 30, sweatbands: 30, belt: 60, wings: 150, cape: 150 },
    acc: { flower: 30, party: 30, visor: 30, band: 30, sidecap: 30, bucket: 60, flowers: 60, bunny: 60, cat: 60, hippy: 60, phones: 60, santa: 100, elf: 100, pirate: 100, crown: 150, halo: 150, horns: 150 },
    gear: { ukulele: 30, bass: 60, mic: 60, violin: 100, flyingv: 150, doubleneck: 150 }
  };
  // which list in PlayerArt.options each part's choices come from
  const LISTS = { hair: "hair", mark: "marks", eyewear: "eyewear", top: "tops", bottom: "bottoms", shoes: "shoes", neck: "neck", extra: "extras", acc: "acc", gear: "gear" };
  // Adventure gear: found by clearing quests, never bought. Each is a real character item (in player-art.js) that sits in its
  // own category in the editor with a padlock, and can be worn in every game once found.
  const ADVENTURE = [
    { id: "hat", part: "acc", value: "hardhat", svg: `<path d="M5 25 C5 6 31 6 31 23 Z" fill="#ffc42b" stroke="#26211f" stroke-width="2.5"/><path d="M2 25 H35" stroke="#26211f" stroke-width="5" stroke-linecap="round"/><path d="M2 25 H35" stroke="#ffc42b" stroke-width="2" stroke-linecap="round"/><path d="M18 8 V24" stroke="#26211f" stroke-width="2"/>`, level: "Rust Row", name: "Hard hat", quest: "Tune Up!" },
    { id: "vest", part: "top", value: "hivis", svg: `<path d="M9 6 L14 4 L18 12 L22 4 L27 6 L30 32 L6 32 Z" fill="#ff8a1c" stroke="#26211f" stroke-width="2.5" stroke-linejoin="round"/><path d="M7 18 H29 M6.5 25 H29.5" stroke="#eee" stroke-width="3"/>`, level: "Rust Row", name: "Hi-vis vest", quest: "Six Strings, Six Names" },
    { id: "goggles", part: "eyewear", value: "goggles", svg: `<path d="M3 18 H33" stroke="#3a3a3d" stroke-width="4"/><circle cx="12" cy="18" r="7" fill="#3fbfa8" stroke="#26211f" stroke-width="2.5"/><circle cx="24" cy="18" r="7" fill="#3fbfa8" stroke="#26211f" stroke-width="2.5"/><circle cx="10" cy="16" r="2" fill="#dffff8"/><circle cx="22" cy="16" r="2" fill="#dffff8"/>`, level: "Rust Row", name: "Welding goggles", quest: "First Riff" },
    { id: "mask", part: "eyewear", value: "gasmask", svg: `<circle cx="12" cy="13" r="6" fill="#cfeee0" stroke="#26211f" stroke-width="2.5"/><circle cx="24" cy="13" r="6" fill="#cfeee0" stroke="#26211f" stroke-width="2.5"/><path d="M8 20 Q18 36 28 20 Z" fill="#6c7480" stroke="#26211f" stroke-width="2.5"/><rect x="13" y="24" width="10" height="9" rx="2" fill="#8a9a4f" stroke="#26211f" stroke-width="2"/>`, level: "Rust Row", name: "Gas mask", quest: "Two-Chord Friends" },
    { id: "strap", part: "extra", value: "biostrap", svg: `<path d="M4 30 L32 6" stroke="#26211f" stroke-width="9" stroke-linecap="round"/><path d="M4 30 L32 6" stroke="#ffc42b" stroke-width="5" stroke-linecap="round"/><path d="M4 30 L32 6" stroke="#26211f" stroke-width="5" stroke-dasharray="3 4"/><circle cx="18" cy="18" r="7" fill="#ffc42b" stroke="#26211f" stroke-width="2"/><text x="18" y="22" font-size="11" text-anchor="middle">☣</text>`, level: "Rust Row", name: "Biohazard strap", quest: "Two-Chord Friends" },
    { id: "gloves", part: "extra", value: "gloves", svg: `<path d="M9 32 V14 Q9 9 12 9 V5 Q15 3 16 6 V4 Q19 2 20 5 V5 Q23 4 23 8 V10 Q27 9 27 14 L26 22 Q30 18 32 21 L25 32 Z" fill="#4a4a4f" stroke="#26211f" stroke-width="2.5" stroke-linejoin="round"/><path d="M9 28 H25" stroke="#ffc42b" stroke-width="3"/>`, level: "Rust Row", name: "Work gloves", quest: "Open String Speed Round" },
    { id: "rust", part: "gear", value: "rustbucket", svg: `<path d="M22 4 L30 2 L31 6 L24 9 Z" fill="#a8723c" stroke="#26211f" stroke-width="2"/><path d="M24 8 L15 18" stroke="#26211f" stroke-width="5"/><path d="M24 8 L15 18" stroke="#a8723c" stroke-width="2.5"/><circle cx="12" cy="24" r="9" fill="#b5562c" stroke="#26211f" stroke-width="2.5"/><circle cx="9" cy="20" r="5" fill="#b5562c" stroke="#26211f" stroke-width="2.5"/><circle cx="12" cy="24" r="9" fill="#b5562c"/><circle cx="12" cy="24" r="2.5" fill="#26211f"/><circle cx="16" cy="28" r="2" fill="#7a3a1c"/>`, level: "Rust Row", name: "Rust Bucket guitar", quest: "The Grumpy Amp" }
  ];

  /* ---------------- the wallet ---------------- */
  const key = () => window.fmaKey ? window.fmaKey("fma-picks-v1") : "fma-picks-v1";
  const fresh = () => ({ picks: 0, total: 0, unlocked: [], days: [], once: {} });
  function load(){ try{ const v = JSON.parse(localStorage.getItem(key())); if(v && typeof v.picks === "number") return Object.assign(fresh(), v); }catch(e){} return fresh(); }
  function save(w){ try{ localStorage.setItem(key(), JSON.stringify(w)); }catch(e){} }
  const options = () => (window.PlayerArt && PlayerArt.options) || {};
  const values = part => (options()[LISTS[part]] || []).map(o => Array.isArray(o) ? o[0] : o);
  const id = (part, v) => part + ":" + v;

  const questItem = (part, v) => ADVENTURE.find(a => a.part === part && a.value === v);
  function price(part, v){
    if(questItem(part, v) || !OPEN[part] || OPEN[part].includes(v)) return 0;
    return (PRICES[part] || {})[v] || 60;
  }
  const isOpen = (part, v, w) => { const q = questItem(part, v); if(q) return adventureOwned().has(q.id);
    return price(part, v) === 0 || (w || load()).unlocked.includes(id(part, v)); };
  // why something is locked: { price } to buy with picks, or { quest } found in Adventure; null when it's open
  const lockOf = (part, v) => { if(isOpen(part, v)) return null; const q = questItem(part, v); return q ? { quest: q } : { price: price(part, v) }; };

  // a character wearing anything that isn't unlocked goes back to the starter set for those parts (identity untouched)
  function clamp(cfg, random){
    const w = load(), c = Object.assign({}, cfg); let changed = false;
    Object.keys(OPEN).forEach(part => {
      if(c[part] === undefined || isOpen(part, c[part], w)) return;
      const open = values(part).filter(v => isOpen(part, v, w));
      c[part] = random ? open[Math.floor(Math.random() * open.length)] : OPEN[part][0];
      changed = true;
    });
    return { cfg: c, changed };
  }
  // the saved character always obeys the rules, on every page; "Mix it up" only mixes what you've unlocked
  if(window.Player){
    const get = Player.get.bind(Player), random = Player.random.bind(Player);
    Player.get = () => { const r = clamp(get()); if(r.changed) Player.set(r.cfg); return r.cfg; };
    Player.random = () => clamp(random(), true).cfg;
  }

  /* ---------------- earning ---------------- */
  const pad = n => String(n).padStart(2, "0");
  const dayStr = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const weekOf = d => { const m = new Date(d); m.setDate(m.getDate() - ((m.getDay() + 6) % 7)); return dayStr(m); };      // the Monday
  function add(w, n, why, list){ if(n > 0){ w.picks += n; w.total += n; list.push([n, why]); } }
  function once(w, k, n, why, list){ if(w.once[k]) return; w.once[k] = 1; add(w, n, why, list); }
  // a practice day, and the 3- and 5-day bonuses for the week
  function practised(w, list){
    const now = new Date(), today = dayStr(now), wk = weekOf(now);
    if(!w.days.includes(today)) w.days.push(today);
    w.days = w.days.slice(-21);
    const n = w.days.filter(d => weekOf(new Date(d + "T12:00")) === wk).length;
    Object.keys(EARN.days).forEach(k => { if(n >= +k) once(w, "week:" + wk + ":" + k, EARN.days[k], k + " practice days this week", list); });
  }
  // after every finished round, from FMAStudent.send (whether or not tracking is on)
  function round(game, d){
    d = d || {}; const w = load(), list = [];
    if(game === "chords") add(w, d.right ? EARN.chordHit : EARN.chordTry, "playing a chord", list);
    else add(w, EARN.round, "finishing a round", list);
    if(d.improved && game !== "chords") add(w, EARN.best, "beating your best", list);
    if(game === "chords" && d.graduated) once(w, "chord:" + d.detail, EARN.graduate, "graduating " + d.detail, list);
    if(game === "boss-battle" && d.right) once(w, "boss:" + d.detail + ":" + d.level + ":" + d.mode, EARN.boss, "beating the boss", list);
    practised(w, list);
    save(w); show(list, w.picks, game === "chords" && list.length === 1);
    return list;
  }
  // a one-off reward (Adventure quests)
  function milestone(k, n, why){ const w = load(), list = []; once(w, k, n, why, list); if(list.length){ save(w); show(list, w.picks); } return list; }
  function unlock(part, v){
    const w = load(), p = price(part, v);
    if(isOpen(part, v, w)) return { ok: true };
    if(questItem(part, v)) return { ok: false };
    if(w.picks < p) return { ok: false, need: p - w.picks };
    w.picks -= p; w.unlocked.push(id(part, v)); save(w); return { ok: true, spent: p };
  }

  /* ---------------- showing it ---------------- */
  // a guitar pick: the currency's icon
  const ICON = (s, col) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" style="vertical-align:-0.18em" aria-hidden="true"><path d="M12 22.5C8 19 3.2 12.6 3.2 7.6 3.2 3.9 7.4 1.8 12 1.8s8.8 2.1 8.8 5.8c0 5-4.8 11.4-8.8 14.9Z" fill="${col || "#ffc42b"}" stroke="#26211f" stroke-width="2" stroke-linejoin="round"/><path d="M7.5 6.2C8.6 4.8 10.3 4.3 12 4.3" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".75"/></svg>`;
  let quiet = 0;
  function show(list, balance, small){
    if(!list.length || !document.body) return;
    // Chord Practice pays per chord: only pop up every few chords, not after every strum
    if(small && ++quiet % 5) return;
    const n = list.reduce((a, x) => a + x[0], 0), t = document.createElement("div");
    t.style.cssText = "position:fixed;left:50%;top:max(14px,env(safe-area-inset-top));transform:translate(-50%,-20px);z-index:70;background:#fff8e1;color:#23231F;" +
      "border:2px solid #23231F;border-radius:16px;padding:8px 16px;font:800 17px/1.3 'Nunito','Work Sans',system-ui,sans-serif;text-align:center;box-shadow:0 10px 30px -12px rgba(0,0,0,.45);" +
      "max-width:calc(100% - 32px);transition:opacity .4s,transform .4s;opacity:0;pointer-events:none";
    t.innerHTML = `${ICON(20)} +${small ? "" : n} picks <span style="font-weight:600;font-size:14px;color:#6B6558">· you have ${balance}</span>`
      + (small ? "" : `<div style="font:600 13px 'Work Sans',system-ui,sans-serif;color:#6B6558">For ${list.map(x => x[1]).join(", ").replace(/, ([^,]*)$/, " and $1")}</div>`);
    document.body.append(t);
    requestAnimationFrame(() => { t.style.opacity = "1"; t.style.transform = "translate(-50%,0)"; });
    setTimeout(() => { t.style.opacity = "0"; setTimeout(() => t.remove(), 500); }, 3600);
  }
  // what's been found in Adventure on this device (for the editor's collection)
  function adventureOwned(){ try{ const d = JSON.parse(localStorage.getItem(window.fmaKey ? fmaKey("fma-rustrow-v1") : "fma-rustrow-v1")); return new Set((d && d.owned) || ["hat"]); }catch(e){ return new Set(["hat"]); } }      // everyone starts Rust Row with the hard hat

  window.FMAPicks = { EARN, OPEN, ADVENTURE, balance: () => load().picks, price, isOpen: (p, v) => isOpen(p, v), lock: lockOf, unlock, round, milestone, adventureOwned, icon: ICON };
})();
