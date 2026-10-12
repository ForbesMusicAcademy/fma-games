/* Chords for every chord game (Chord Practice, Boss Battle): the ladder, the shapes, the diagrams, and what's unlocked.
   Everything comes from chord-ladder.json, whose first tier is the Band Skills Ladder (Dave and Simone's) with the shapes
   from its Chord charts tab. Load after fma-student.js.

   FMAChords.load()          -> Promise; fetches the ladder once. Call before anything else.
   FMAChords.list / tiers    -> every chord in ladder order: {name, tones, pcs, mask, root, tier, shape}
   FMAChords.info(name)      -> one chord, or null if the ladder doesn't know it
   FMAChords.diagram(name)   -> an SVG chord diagram (the ladder's shape, finger colours as on the ladder's charts)
   FMAChords.label(name)     -> what to show students for a chord: "Easy-G" for G (the ladder's "labels"), else the name
   FMAChords.unlocked()      -> the names this player has unlocked in Chord Practice (a Set)

   On guitar a chord listens for exactly the notes its shape sounds: the two-finger G (320000) rings an open E, so that E
   is part of "G" here. A chord without a shape falls back to its plain chord type. */
(function(){
  const PCV = {C:0, D:2, E:4, F:5, G:7, A:9, B:11};
  const SHARP = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"], FLAT = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];
  const OPEN = [4, 9, 2, 7, 11, 4];                 // low E to high e
  const FINGER = {1: "#F3B640", 2: "#C072DE", 3: "#4F6EF2", 4: "#F04747"};   // the FMA finger key: index orange, middle purple, ring blue, pinky red
  const START_POOL = 2;                             // Chord Practice starts with the first two chords open (keep in step with index.html)
  let ladder = null, list = [], tiers = [], byName = {}, loading = null;

  const parse = name => {
    const m = /^([A-G])([#b]?)(.*)$/.exec(name || ""); if(!m) return null;
    return { root: (PCV[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0) + 12) % 12, flat: m[2] === "b" || (m[1] === "F" && !m[2]), q: m[3] };
  };
  const cell = s => { if(s === "o") return {fret: 0}; if(s === "x" || !s) return null; const [f, n] = String(s).split(":"); return {fret: Number(f), finger: Number(n) || 1}; };

  function build(){
    list = []; tiers = []; byName = {};
    const shapes = ladder.shapes || {};
    ladder.tiers.forEach((t, ti) => {
      const first = list.length;
      t.chords.forEach(name => {
        const p = parse(name), ivs = p && ladder.qualities[p.q];
        if(!ivs) return;
        const spell = p.flat ? FLAT : SHARP, shape = shapes[name] || null;
        let pcs = ivs.map(iv => (p.root + iv) % 12);
        if(shape){        // the notes the shape actually sounds, root first, then in chord order, then any extra (e.g. the easy G's E)
          const heard = new Set(shape.map(cell).map((c, i) => c && (OPEN[i] + c.fret) % 12).filter(x => x !== null && x !== undefined && x !== false));
          pcs = pcs.filter(pc => heard.has(pc)).concat([...heard].filter(pc => !pcs.includes(pc)));
        }
        const c = { name, root: p.root, pcs, tones: pcs.map(pc => spell[pc]), mask: pcs.reduce((a, pc) => a | (1 << pc), 0), tier: ti, shape };
        list.push(c); byName[name] = c;
      });
      tiers.push({ name: t.name, first, last: list.length - 1 });
    });
  }

  // a chord diagram in the style of the ladder's Chord charts tab, scaled to fit whatever box it's put in
  function diagram(name, opts){
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
    try{ const P = JSON.parse(localStorage.getItem(window.fmaKey ? fmaKey("fma-home-chords-v1") : "fma-home-chords-v1")); if(P && P.unlocked) n = P.unlocked; }catch(e){}
    return new Set(list.slice(0, n).map(c => c.name));
  }

  window.FMAChords = {
    load(){ return loading || (loading = fetch("chord-ladder.json", {cache: "no-cache"}).then(r => r.json()).then(j => { ladder = j; build(); return list; })); },
    get list(){ return list; }, get tiers(){ return tiers; },
    info: name => byName[name] || null,
    label: name => (ladder && ladder.labels && ladder.labels[name]) || name,
    diagram, unlocked, START_POOL
  };
})();
