/* Chords for every chord game (Chord Practice, Boss Battle): the ladder, the shapes, the diagrams, and what's unlocked.
   Everything comes from chord-ladder.json, whose first tier is the Band Skills Ladder (Dave and Simone's) with the shapes
   from its Chord charts tab. Load after fma-student.js.

   FMAChords.load()          -> Promise; fetches the ladder once. Call before anything else.
   FMAChords.list / tiers    -> every chord in ladder order: {name, tones, pcs, mask, root, tier, shape}
   FMAChords.info(name)      -> one chord, or null if the ladder doesn't know it
   FMAChords.diagram(name)   -> an SVG chord diagram (the ladder's shape, finger colours as on the ladder's charts)
   FMAChords.label(name)     -> what to show students for a chord: "Easy-G" for G (the ladder's "labels"), else the name
   FMAChords.unlocked()      -> the names this player has unlocked in Chord Quest (a Set)
   FMAChords.inst            -> "guitar" or "piano": which ladder, diagrams and progress this page uses
   FMAChords.storeKey        -> the Chord Quest progress key for that instrument (guitar and piano are kept apart)

   PIANO (13 Oct 2026): a piano player gets the ladder's pianoTiers, listens for the plain chord type, and sees a keyboard
   diagram (right hand, root position, note names and fingers on the keys) instead of a guitar shape. The first four
   (pianoEasy) are two-note chords, root and 3rd, labelled Easy-C etc.; playing the whole chord still counts (c.allow).
   "C:3" on the ladder is the full C, won later; songs and Boss Battle use it once it's unlocked (FMAChords.forSong).
   Fingers: two notes 1-2, three notes 1-2-4 (easier than 1-3-5 for little hands), four notes 1-2-3-5.

   On guitar a chord listens for exactly the notes its shape sounds: the two-finger G (320000) rings an open E, so that E
   is part of "G" here. A chord without a shape falls back to its plain chord type. */
(function(){
  const PCV = {C:0, D:2, E:4, F:5, G:7, A:9, B:11};
  const SHARP = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"], FLAT = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];
  const OPEN = [4, 9, 2, 7, 11, 4];                 // low E to high e
  const FINGER = {1: "#F3B640", 2: "#C072DE", 3: "#4F6EF2", 4: "#F04747"};   // the FMA finger key: index orange, middle purple, ring blue, pinky red
  const START_POOL = 2;                             // Chord Practice starts with the first two chords open (keep in step with index.html)
  let ladder = null, list = [], tiers = [], byName = {}, loading = null;
  const INST = (window.fmaInstrument && fmaInstrument.get()) === "piano" ? "piano" : "guitar", PIANO = INST === "piano";
  const STORE = PIANO ? "fma-home-chords-piano-v1" : "fma-home-chords-v1";

  const parse = name => {
    const m = /^([A-G])([#b]?)(.*)$/.exec(name || ""); if(!m) return null;
    return { root: (PCV[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0) + 12) % 12, flat: m[2] === "b" || (m[1] === "F" && !m[2]), q: m[3] };
  };
  const cell = s => { if(s === "o") return {fret: 0}; if(s === "x" || !s) return null; const [f, n] = String(s).split(":"); return {fret: Number(f), finger: Number(n) || 1}; };

  function build(){
    list = []; tiers = []; byName = {};
    const shapes = PIANO ? {} : (ladder.shapes || {});
    (PIANO && ladder.pianoTiers ? ladder.pianoTiers : ladder.tiers).forEach((t, ti) => {
      const first = list.length;
      t.chords.forEach(name => {
        const base = name.replace(/:3$/, ""), p = parse(base), ivs = p && ladder.qualities[p.q];
        if(!ivs) return;
        const spell = p.flat ? FLAT : SHARP, shape = shapes[name] || null;
        let pcs = ivs.map(iv => (p.root + iv) % 12);
        if(shape){        // the notes the shape actually sounds, root first, then in chord order, then any extra (e.g. the easy G's E)
          const heard = new Set(shape.map(cell).map((c, i) => c && (OPEN[i] + c.fret) % 12).filter(x => x !== null && x !== undefined && x !== false));
          pcs = pcs.filter(pc => heard.has(pc)).concat([...heard].filter(pc => !pcs.includes(pc)));
        }
        const full = pcs.reduce((a, pc) => a | (1 << pc), 0);
        if(PIANO && name === base && (ladder.pianoEasy || []).includes(name)) pcs = [p.root, (p.root + ivs[1]) % 12];     // two-note chord: root and 3rd
        const c = { name, base, root: p.root, pcs, tones: pcs.map(pc => spell[pc]), mask: pcs.reduce((a, pc) => a | (1 << pc), 0), allow: full, tier: ti, shape,
          easy: PIANO && pcs.length === 2 };
        list.push(c); byName[name] = c;
      });
      tiers.push({ name: t.name, first, last: list.length - 1 });
    });
  }

  // a chord diagram in the style of the ladder's Chord charts tab, scaled to fit whatever box it's put in
  // piano: a keyboard from the C at or below the root, with the chord's keys (root position, right hand) coloured and named
  function keys(name){
    const c = byName[name]; if(!c) return "";
    const p = parse(c.base);
    let last = -1; const semis = c.pcs.map(pc => { let s = pc; while(s <= last) s += 12; last = s; return s; });
    const WHITE = [0, 2, 4, 5, 7, 9, 11], spell = p.flat ? FLAT : SHARP, top = Math.max(...semis);
    const octs = top >= 24 ? 3 : 2, ww = 26, wh = 108, bw = 16, bh = 66, W = octs * 7 * ww + 4, H = wh + 30;
    const on = new Set(semis), out = [`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${name} chord on piano">`];
    const fingers = semis.length >= 4 ? [1, 2, 3, 5] : semis.length === 3 ? [1, 2, 4] : [1, 2];
    const label = (x, y, s, dark) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Nunito,ui-rounded,system-ui,sans-serif" font-weight="900" font-size="${dark ? 11 : 13}" fill="${dark ? "#fff" : "#23231F"}">${spell[s % 12]}</text>`;
    const fing = (x, s) => `<g><circle cx="${x}" cy="${wh + 15}" r="10" fill="#23231F"/><text x="${x}" y="${wh + 19.5}" text-anchor="middle" font-family="Work Sans,system-ui,sans-serif" font-weight="700" font-size="12" fill="#FFB805">${fingers[semis.indexOf(s)]}</text></g>`;
    for(let o = 0; o < octs; o++) WHITE.forEach((w, k) => {
      const s = o * 12 + w, x = 2 + (o * 7 + k) * ww, hit = on.has(s);
      out.push(`<rect x="${x}" y="2" width="${ww}" height="${wh}" rx="4" fill="${hit ? "#FFB805" : "#fff"}" stroke="#23231F" stroke-width="2"/>`);
      if(hit) out.push(label(x + ww / 2, wh - 10, s), fing(x + ww / 2, s));
    });
    for(let o = 0; o < octs; o++) [1, 3, 6, 8, 10].forEach(b => {
      const s = o * 12 + b, k = WHITE.indexOf(b - 1), x = 2 + (o * 7 + k + 1) * ww - bw / 2, hit = on.has(s);
      out.push(`<rect x="${x}" y="2" width="${bw}" height="${bh}" rx="3" fill="${hit ? "#D4668C" : "#23231F"}" stroke="#23231F" stroke-width="2"/>`);
      if(hit) out.push(label(x + bw / 2, bh - 8, s, true), fing(x + bw / 2, s));
    });
    out.push("</svg>");
    return out.join("");
  }

  function diagram(name, opts){
    if(PIANO) return keys(name);
    const c = byName[name]; if(!c || !c.shape) return "";
    const o = Object.assign({ title: false }, opts || {});
    const cells = c.shape.map(cell), frets = cells.filter(x => x && x.fret > 0).map(x => x.fret);
    const hi = frets.length ? Math.max(...frets) : 0, lo = frets.length ? Math.min(...frets) : 1;
    const base = hi <= 4 ? 1 : lo;                                  // past the 4th fret, start the grid at the lowest fret used
    const W = 220, X0 = 40, GAP = 28, TOP = o.title ? 74 : 40, FG = 40, N = 4, R = 11;
    const xe = X0 + 5 * GAP, H = TOP + N * FG + 16;
    const out = [`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${name} chord diagram">`];
    if(o.title) out.push(`<text x="${W / 2}" y="44" text-anchor="middle" font-family="Nunito,ui-rounded,system-ui,sans-serif" font-weight="900" font-size="40" fill="#111">${name}</text>`);
    for(let k = 1; k <= N; k++) out.push(`<line x1="${X0}" y1="${TOP + k * FG}" x2="${xe}" y2="${TOP + k * FG}" stroke="#A8843F" stroke-width="2"/>`);
    for(let i = 0; i < 6; i++) out.push(`<line x1="${X0 + i * GAP}" y1="${TOP}" x2="${X0 + i * GAP}" y2="${TOP + N * FG}" stroke="#111" stroke-width="2"/>`);
    if(base === 1) out.push(`<line x1="${X0 - 2}" y1="${TOP}" x2="${xe + 2}" y2="${TOP}" stroke="#111" stroke-width="8" stroke-linecap="round"/>`);
    else out.push(`<text x="${X0 - 12}" y="${TOP + FG * 0.62 + 6}" text-anchor="end" font-family="Work Sans,system-ui,sans-serif" font-weight="700" font-size="17" fill="#6B6558">${base}fr</text>`);
    cells.forEach((x, i) => {
      const sx = X0 + i * GAP;
      if(!x) out.push(`<text x="${sx}" y="${TOP - 12}" text-anchor="middle" font-family="Work Sans,system-ui,sans-serif" font-weight="700" font-size="18" fill="#6B6558">×</text>`);
      else if(x.fret === 0) out.push(`<circle cx="${sx}" cy="${TOP - 17}" r="8" fill="#fff" stroke="#111" stroke-width="2.5"/>`);
      else{
        const y = TOP + (x.fret - base) * FG + FG * 0.55;
        out.push(`<circle cx="${sx}" cy="${y}" r="${R}" fill="${FINGER[x.finger] || FINGER[1]}" stroke="#111" stroke-width="2.5"/>`);
        out.push(`<text x="${sx}" y="${y + 5}" text-anchor="middle" font-family="Work Sans,system-ui,sans-serif" font-weight="700" font-size="13" fill="#111">${x.finger}</text>`);
      }
    });
    out.push("</svg>");
    return out.join("");
  }

  // the chords this player has open in Chord Practice (the first `unlocked` of the ladder)
  function unlocked(){
    let n = START_POOL;
    try{ const P = JSON.parse(localStorage.getItem(window.fmaKey ? fmaKey(STORE) : STORE)); if(P && P.unlocked) n = P.unlocked; }catch(e){}
    const out = new Set(); list.slice(0, n).forEach(c => { out.add(c.name); out.add(c.base); });      // "C:3" also opens songs that use C
    return out;
  }
  // the chord a song's "C" means for this player: on piano, the full chord once it's unlocked, else the easy two-note one
  function forSong(name, open){
    const full = byName[name + ":3"];
    if(full && (open || unlocked()).has(full.name)) return full;
    return byName[name] || null;
  }

  window.FMAChords = {
    load(url){ return loading || (loading = fetch(url || "chord-ladder.json", {cache: "no-cache"}).then(r => r.json()).then(j => { ladder = j; build(); return list; })); },
    get list(){ return list; }, get tiers(){ return tiers; },
    info: name => byName[name] || null,
    label: name => { const c = byName[name]; if(PIANO) return c && c.easy ? "Easy-" + c.base : (c ? c.base : name);
      return (ladder && ladder.labels && ladder.labels[name]) || name; },
    diagram, unlocked, forSong, START_POOL, inst: INST, storeKey: STORE
  };
})();
