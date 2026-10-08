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
    { id: "rust", part: "gear", value: "rustbucket", svg: `<path d="M22 4 L30 2 L31 6 L24 9 Z" fill="#a8723c" stroke="#26211f" stroke-width="2"/><path d="M24 8 L15 18" stroke="#26211f" stroke-width="5"/><path d="M24 8 L15 18" stroke="#a8723c" stroke-width="2.5"/><circle cx="12" cy="24" r="9" fill="#b5562c" stroke="#26211f" stroke-width="2.5"/><circle cx="9" cy="20" r="5" fill="#b5562c" stroke="#26211f" stroke-width="2.5"/><circle cx="12" cy="24" r="9" fill="#b5562c"/><circle cx="12" cy="24" r="2.5" fill="#26211f"/><circle cx="16" cy="28" r="2" fill="#7a3a1c"/>`, level: "Rust Row", name: "Rust Bucket guitar", quest: "The Grumpy Amp" },
    { id: "skatehelmet", part: "acc", value: "skatehelmet", svg: `<path d="M5 25 C4 6 32 6 31 25 Q18 28 5 25Z" fill="#4aa8ff" stroke="#26211f" stroke-width="2.5"/><path d="M13 9 V14 M18 8 V13 M23 9 V14" stroke="#26211f" stroke-width="2.4"/><circle cx="25" cy="19" r="2.6" fill="#ffc42b"/>`, level: "Skate City", name: "Skate helmet", quest: "Kick-Off" },
    { id: "kneepads", part: "extra", value: "kneepads", svg: `<rect x="5" y="9" width="11" height="18" rx="5" fill="#3a3a3d" stroke="#26211f" stroke-width="2.5"/><rect x="20" y="9" width="11" height="18" rx="5" fill="#3a3a3d" stroke="#26211f" stroke-width="2.5"/><path d="M6 18 H15 M21 18 H30" stroke="#ff6fa3" stroke-width="2.4"/>`, level: "Skate City", name: "Knee pads", quest: "Bus Stop Bop" },
    { id: "skateshoes", part: "shoes", value: "skate", svg: `<path d="M4 22 C3 13 12 10 19 11 C27 12 32 17 32 22 C31 26 4 27 4 22Z" fill="#e8433f" stroke="#26211f" stroke-width="2.5"/><path d="M3 23 H33 Q33 29 30 29 H6 Q3 29 3 23Z" fill="#f2d39a" stroke="#26211f" stroke-width="2"/><path d="M10 18 Q18 20 26 15" stroke="#fff" stroke-width="2.4" fill="none"/>`, level: "Skate City", name: "Skate shoes", quest: "Plaza Ledge" },
    { id: "graffiti", part: "top", value: "graffiti", svg: `<path d="M11 4 L4 9 L7 15 L10 13 V32 H26 V13 L29 15 L32 9 L25 4 Q18 9 11 4Z" fill="#5470f0" stroke="#26211f" stroke-width="2.5" stroke-linejoin="round"/><path d="M12 17 q3 -4 6 0 t6 0" stroke="#ff6fa3" stroke-width="2.6" fill="none"/><path d="M13 25 l3 4 l3 -4 l3 4" stroke="#9be04a" stroke-width="2.4" fill="none"/>`, level: "Skate City", name: "Graffiti hoodie", quest: "Mural Jam" },
    { id: "shutter", part: "eyewear", value: "shutter", svg: `<rect x="4" y="12" width="12" height="11" rx="2" fill="none" stroke="#ff6fa3" stroke-width="2.6"/><rect x="20" y="12" width="12" height="11" rx="2" fill="none" stroke="#ff6fa3" stroke-width="2.6"/><path d="M4 16 H16 M4 19.5 H16 M20 16 H32 M20 19.5 H32 M16 15 H20" stroke="#ff6fa3" stroke-width="2"/>`, level: "Skate City", name: "Shutter shades", quest: "Kickflip Corner" },
    { id: "bandana", part: "neck", value: "bandana", svg: `<path d="M4 10 Q18 16 32 10 L18 31Z" fill="#e8433f" stroke="#26211f" stroke-width="2.5" stroke-linejoin="round"/><circle cx="13" cy="15" r="1.6" fill="#fff"/><circle cx="23" cy="15" r="1.6" fill="#fff"/><circle cx="18" cy="21" r="1.6" fill="#fff"/>`, level: "Skate City", name: "Bandana", quest: "Deck Riff" },
    { id: "stickerbomb", part: "gear", value: "stickerbomb", svg: `<path d="M24 8 L15 18" stroke="#26211f" stroke-width="5"/><path d="M24 8 L15 18" stroke="#e0bf82" stroke-width="2.5"/><path d="M22 4 L30 2 L31 6 L24 9 Z" fill="#3a3a3d" stroke="#26211f" stroke-width="2"/><circle cx="12" cy="24" r="9" fill="#f7f4ee" stroke="#26211f" stroke-width="2.5"/><circle cx="9" cy="20" r="5" fill="#f7f4ee" stroke="#26211f" stroke-width="2.5"/><circle cx="12" cy="24" r="9" fill="#f7f4ee"/><circle cx="9" cy="26" r="2.4" fill="#e8433f"/><circle cx="15" cy="21" r="2" fill="#4aa8ff"/><circle cx="14" cy="28" r="1.8" fill="#9be04a"/>`, level: "Skate City", name: "Sticker Bomb guitar", quest: "The Garbage Gobbler" },
    { id: "laminate", part: "neck", value: "laminate", svg: `<path d="M8 4 L18 16 L28 4" fill="none" stroke="#e8433f" stroke-width="3"/><rect x="11" y="15" width="14" height="17" rx="2" fill="#f7f4ee" stroke="#26211f" stroke-width="2"/><rect x="11" y="15" width="14" height="5" fill="#e8433f"/><text x="18" y="29" font-size="6" font-weight="900" text-anchor="middle" fill="#26211f">AAA</text>`, level: "Backstage Pass", name: "AAA laminate", quest: "Soundcheck" },
    { id: "towel", part: "extra", value: "towel", svg: `<path d="M8 6 Q18 2 28 6 L26 31 L10 31Z" fill="#f7f4ee" stroke="#26211f" stroke-width="2.5" stroke-linejoin="round"/><path d="M10 22 H26 M10 26 H26" stroke="#4aa8ff" stroke-width="2.4"/>`, level: "Backstage Pass", name: "Roadie towel", quest: "Green Room Warm-up" },
    { id: "headset", part: "acc", value: "headset", svg: `<path d="M7 20 C6 4 30 4 29 20" fill="none" stroke="#26211f" stroke-width="4"/><rect x="4" y="17" width="7" height="11" rx="3" fill="#3a3a3d" stroke="#26211f" stroke-width="2"/><path d="M8 27 Q10 33 19 32" fill="none" stroke="#26211f" stroke-width="2.4"/><circle cx="20" cy="32" r="2.4" fill="#e8433f"/>`, level: "Backstage Pass", name: "Crew headset", quest: "Road Case Riff" },
    { id: "starshades", part: "eyewear", value: "starshades", svg: `<path d="M10 9 L12.4 14.6 L18 15 L13.6 18.6 L15 24 L10 21 L5 24 L6.4 18.6 L2 15 L7.6 14.6Z" fill="#ff6fa3" stroke="#26211f" stroke-width="2"/><path d="M26 9 L28.4 14.6 L34 15 L29.6 18.6 L31 24 L26 21 L21 24 L22.4 18.6 L18 15 L23.6 14.6Z" fill="#ff6fa3" stroke="#26211f" stroke-width="2"/>`, level: "Backstage Pass", name: "Star shades", quest: "Merch Stand" },
    { id: "lightup", part: "shoes", value: "lightup", svg: `<path d="M4 22 C3 13 12 10 19 11 C27 12 32 17 32 22 C31 26 4 27 4 22Z" fill="#5470f0" stroke="#26211f" stroke-width="2.5"/><path d="M4 23 H32 Q32 28 29 28 H7 Q4 28 4 23Z" fill="#f7f4ee" stroke="#26211f" stroke-width="2"/><circle cx="9" cy="25.5" r="1.8" fill="#4fd0c0"/><circle cx="15" cy="25.5" r="1.8" fill="#ff6fa3"/><circle cx="21" cy="25.5" r="1.8" fill="#ffd34d"/><circle cx="27" cy="25.5" r="1.8" fill="#9be04a"/>`, level: "Backstage Pass", name: "Light-up sneakers", quest: "Drum Riser" },
    { id: "glowchain", part: "neck", value: "glowchain", svg: `<path d="M5 8 Q18 34 31 8" fill="none" stroke="#9be04a" stroke-width="9" opacity=".35"/><path d="M5 8 Q18 34 31 8" fill="none" stroke="#26211f" stroke-width="5"/><path d="M5 8 Q18 34 31 8" fill="none" stroke="#c6ff7a" stroke-width="2.4"/>`, level: "Backstage Pass", name: "Glow necklace", quest: "Lighting Rig" },
    { id: "glitter", part: "gear", value: "glitter", svg: `<path d="M24 8 L15 18" stroke="#26211f" stroke-width="5"/><path d="M24 8 L15 18" stroke="#e0bf82" stroke-width="2.5"/><path d="M22 4 L30 2 L31 6 L24 9 Z" fill="#3a3a3d" stroke="#26211f" stroke-width="2"/><circle cx="12" cy="24" r="9" fill="#a070e8" stroke="#26211f" stroke-width="2.5"/><circle cx="9" cy="20" r="5" fill="#a070e8" stroke="#26211f" stroke-width="2.5"/><circle cx="12" cy="24" r="9" fill="#a070e8"/><circle cx="9" cy="25" r="1.4" fill="#fff"/><circle cx="14" cy="21" r="1.4" fill="#fff"/><circle cx="13" cy="28" r="1.4" fill="#fff"/><path d="M8 18 l1 2.4 l2.4 .2 l-1.8 1.6 l.6 2.4 l-2.2 -1.3 l-2.2 1.3 l.6 -2.4 l-1.8 -1.6 l2.4 -.2z" fill="#ffd34d"/>`, level: "Backstage Pass", name: "Glitter guitar", quest: "The Feedback Beast" },
    { id: "pickpendant", part: "neck", value: "pickpendant", svg: `<path d="M6 5 Q18 22 30 5" fill="none" stroke="#9aa3ad" stroke-width="2.4" stroke-dasharray="3 2"/><path d="M18 33 C14 29 9 23 9 18 C9 14 14 12 18 12 C22 12 27 14 27 18 C27 23 22 29 18 33Z" fill="#ffc42b" stroke="#26211f" stroke-width="2.5"/>`, level: "Inside the Amp", name: "Pick pendant", quest: "Plug In" },
    { id: "tuningcrown", part: "acc", value: "tuningcrown", svg: `<path d="M5 24 Q18 20 31 24 L31 29 Q18 25 5 29Z" fill="#ffc42b" stroke="#26211f" stroke-width="2"/><g stroke="#26211f" stroke-width="2"><path d="M9 23 V16 M15 21 V13 M21 21 V13 M27 23 V16"/><ellipse cx="9" cy="12" rx="3" ry="4.4" fill="#dfe3e8"/><ellipse cx="15" cy="9" rx="3" ry="4.4" fill="#dfe3e8"/><ellipse cx="21" cy="9" rx="3" ry="4.4" fill="#dfe3e8"/><ellipse cx="27" cy="12" rx="3" ry="4.4" fill="#dfe3e8"/></g>`, level: "Inside the Amp", name: "Tuning-peg crown", quest: "String Slide" },
    { id: "spark", part: "shoes", value: "spark", svg: `<path d="M6 24 V9 Q12 6 18 9 V14 C27 15 32 19 32 24 C31 28 6 28 6 24Z" fill="#4aa8ff" stroke="#26211f" stroke-width="2.5"/><path d="M5 25 H33 Q33 30 30 30 H8 Q5 30 5 25Z" fill="#f7f4ee" stroke="#26211f" stroke-width="2"/><path d="M14 11 L10 18 L14 18 L11 24 L19 15 L15 15 L18 11Z" fill="#ffd34d" stroke="#26211f" stroke-width="1.6"/>`, level: "Inside the Amp", name: "Spark high-tops", quest: "Drum Bounce" },
    { id: "vumeter", part: "eyewear", value: "vumeter", svg: `<circle cx="10" cy="18" r="8" fill="#fff6d8" stroke="#26211f" stroke-width="2.6"/><circle cx="26" cy="18" r="8" fill="#fff6d8" stroke="#26211f" stroke-width="2.6"/><path d="M10 21 L14 13 M26 21 L30 13" stroke="#e8433f" stroke-width="2"/><path d="M18 18 H18" stroke="#26211f" stroke-width="2.6"/>`, level: "Inside the Amp", name: "VU goggles", quest: "Keyboard Run" },
    { id: "cablecoil", part: "extra", value: "cablecoil", svg: `<ellipse cx="18" cy="16" rx="11" ry="12" fill="none" stroke="#26211f" stroke-width="6"/><ellipse cx="18" cy="16" rx="11" ry="12" fill="none" stroke="#e8433f" stroke-width="2.6"/><ellipse cx="15" cy="18" rx="11" ry="12" fill="none" stroke="#e8433f" stroke-width="2.6"/><rect x="22" y="27" width="8" height="6" rx="1" fill="#dfe3e8" stroke="#26211f" stroke-width="1.6"/>`, level: "Inside the Amp", name: "Patch cable", quest: "Speaker Stack" },
    { id: "circuit", part: "top", value: "circuit", svg: `<path d="M11 4 L4 9 L7 15 L10 13 V32 H26 V13 L29 15 L32 9 L25 4 Q18 9 11 4Z" fill="#2f8f5b" stroke="#26211f" stroke-width="2.5" stroke-linejoin="round"/><path d="M10 18 H16 V24 H22 M26 16 H21 V12" fill="none" stroke="#ffc42b" stroke-width="2"/><rect x="15" y="26" width="7" height="4" fill="#26211f"/>`, level: "Inside the Amp", name: "Circuit tee", quest: "Pedal Board" },
    { id: "lightning", part: "gear", value: "lightning", svg: `<circle cx="12" cy="24" r="12" fill="#4fd0c0" opacity=".3"/><path d="M24 8 L15 18" stroke="#26211f" stroke-width="5"/><path d="M24 8 L15 18" stroke="#e0bf82" stroke-width="2.5"/><path d="M22 4 L30 2 L31 6 L24 9 Z" fill="#3a3a3d" stroke="#26211f" stroke-width="2"/><circle cx="12" cy="24" r="9" fill="#4fd0c0" stroke="#26211f" stroke-width="2.5"/><circle cx="9" cy="20" r="5" fill="#4fd0c0" stroke="#26211f" stroke-width="2.5"/><circle cx="12" cy="24" r="9" fill="#4fd0c0"/><path d="M11 17 L7 24 L11 24 L8 31 L16 22 L12 22 L15 17Z" fill="#ffd34d" stroke="#26211f" stroke-width="1.4"/>`, level: "Inside the Amp", name: "Thunderbolt guitar", quest: "Captain Fuzz" },
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
  // what's been found in Adventure on this device, across every level (everyone starts with Rust Row's hard hat)
  function adventureOwned(){
    const got = new Set(["hat"]), k = n => window.fmaKey ? fmaKey(n) : n;
    try{ (JSON.parse(localStorage.getItem(k("fma-adventure-gear-v1"))) || []).forEach(g => got.add(g)); }catch(e){}
    try{ const d = JSON.parse(localStorage.getItem(k("fma-rustrow-v1"))); ((d && d.owned) || []).forEach(g => got.add(g)); }catch(e){}      // the first Rust Row's own list
    return got;
  }

  window.FMAPicks = { EARN, OPEN, ADVENTURE, balance: () => load().picks, price, isOpen: (p, v) => isOpen(p, v), lock: lockOf, unlock, round, milestone, adventureOwned, icon: ICON };
})();
