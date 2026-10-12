/* The Boss Battle songs, shared by Boss Battle (boss.html) and Chord Quest (which says which songs a new chord opens).
   Each song is its main chord loop, one chord per bar, simplified. A song opens once every chord in it is unlocked in Chord
   Quest (on the player's own instrument's ladder). Keep each id for good: bests and stars are saved by it.
   The first 16 were written from memory (6 Oct). The rest ("ladder": true) come from the Band Skills Ladder's Ladder Songs tab
   (chord-songs.json), in the order the ladder lists their chords: two chords alternate bar by bar, three chords play the third
   for two bars. Dave: check any loop against how you teach it and tell Claude to fix it. Load after fma-chords.js. */
window.FMABossSongs = [
  {"id": "em-g-stomp", "t": "Em–G Stomp", "a": "FMA warm-up", "c": ["Em", "Em", "G", "G"]},
  {"id": "g-em-groove", "t": "G–Em Groove", "a": "FMA warm-up", "c": ["G", "Em", "G", "Em"]},
  {"id": "three-chord-trick", "t": "Three-Chord Trick", "a": "FMA warm-up", "c": ["G", "C", "Em", "C"]},
  {"id": "zombie", "t": "Zombie", "a": "The Cranberries", "c": ["Em", "C", "G", "D"]},
  {"id": "wagon-wheel", "t": "Wagon Wheel", "a": "Old Crow Medicine Show", "c": ["G", "D", "Em", "C"]},
  {"id": "brown-eyed-girl", "t": "Brown Eyed Girl", "a": "Van Morrison", "c": ["G", "C", "G", "D"]},
  {"id": "sweet-home-alabama", "t": "Sweet Home Alabama", "a": "Lynyrd Skynyrd", "c": ["D", "C", "G", "G"]},
  {"id": "perfect", "t": "Perfect", "a": "Ed Sheeran", "c": ["G", "Em", "C", "D"]},
  {"id": "riptide", "t": "Riptide", "a": "Vance Joy", "c": ["Am", "G", "C", "C"]},
  {"id": "shake-it-off", "t": "Shake It Off", "a": "Taylor Swift", "c": ["Am", "C", "G", "G"]},
  {"id": "let-it-be", "t": "Let It Be", "a": "The Beatles", "c": ["C", "G", "Am", "F"]},
  {"id": "little-talks", "t": "Little Talks", "a": "Of Monsters and Men", "c": ["Am", "F", "C", "G"]},
  {"id": "la-bamba", "t": "La Bamba", "a": "Ritchie Valens", "c": ["C", "F", "G", "G"]},
  {"id": "dreams", "t": "Dreams", "a": "Fleetwood Mac", "c": ["F", "G", "F", "G"]},
  {"id": "born-in-the-usa", "t": "Born in the U.S.A.", "a": "Bruce Springsteen", "c": ["A", "A", "D", "D"]},
  {"id": "wild-thing", "t": "Wild Thing", "a": "The Troggs", "c": ["A", "D", "E", "D"]},
  {"id": "21-guns", "t": "21 Guns", "a": "Green Day", "c": ["Em", "G", "C", "D"], "ladder": true},
  {"id": "500-miles", "t": "500 Miles", "a": "The Proclaimers", "c": ["E", "B", "A", "C#m"], "ladder": true},
  {"id": "a-horse-with-no-name", "t": "A Horse with No Name", "a": "America", "c": ["Em", "D", "Em", "D"], "ladder": true},
  {"id": "achy-breaky-heart", "t": "Achy Breaky Heart", "a": "Billy Ray Cyrus", "c": ["A", "E", "A", "E"], "ladder": true},
  {"id": "angel-of-harlem", "t": "Angel of Harlem", "a": "U2", "c": ["C", "F", "G", "Am"], "ladder": true},
  {"id": "bellyache", "t": "Bellyache", "a": "Billie Eilish", "c": ["C", "Am", "Em", "Em"], "ladder": true},
  {"id": "best-day-of-my-life", "t": "Best Day of My Life", "a": "American Authors", "c": ["D", "G", "D", "G"], "ladder": true},
  {"id": "big-jet-plane", "t": "Big Jet Plane", "a": "Angus & Julia Stone", "c": ["C", "Am", "Em", "G"], "ladder": true},
  {"id": "blurred-lines", "t": "Blurred Lines", "a": "Robin Thicke", "c": ["G", "D", "G", "D"], "ladder": true},
  {"id": "broken-window-serenade", "t": "Broken Window Serenade", "a": "Whiskey Myers", "c": ["Em", "C", "Em", "C"], "ladder": true},
  {"id": "copperhead-road", "t": "Copperhead Road", "a": "Steve Earle", "c": ["D", "G", "D", "G"], "ladder": true},
  {"id": "cowpoke", "t": "Cowpoke", "a": "Colter Wall", "c": ["Am", "C", "F", "G"], "ladder": true},
  {"id": "dance-monkey", "t": "Dance Monkey", "a": "Tones and I", "c": ["Em", "C", "D", "Bm"], "ladder": true},
  {"id": "day-o-banana-boat-song", "t": "Day-O (Banana Boat Song)", "a": "Harry Belafonte", "c": ["F", "C", "F", "C"], "ladder": true},
  {"id": "drunken-sailor", "t": "Drunken Sailor", "a": "Traditional", "c": ["Dm", "C", "Dm", "C"], "ladder": true},
  {"id": "eleanor-rigby", "t": "Eleanor Rigby", "a": "The Beatles", "c": ["C", "Em", "C", "Em"], "ladder": true},
  {"id": "everyday-people", "t": "Everyday People", "a": "Sly & The Family Stone", "c": ["G", "C", "G", "C"], "ladder": true},
  {"id": "feelin-alright", "t": "Feelin' Alright", "a": "Joe Cocker / Traffic", "c": ["A", "D", "A", "D"], "ladder": true},
  {"id": "give-peace-a-chance", "t": "Give Peace a Chance", "a": "John Lennon", "c": ["D", "A", "D", "A"], "ladder": true},
  {"id": "jambalaya", "t": "Jambalaya", "a": "Hank Williams", "c": ["C", "G", "C", "G"], "ladder": true},
  {"id": "kung-fu-fighting", "t": "Kung Fu Fighting", "a": "Carl Douglas", "c": ["D", "Em", "A", "A"], "ladder": true},
  {"id": "lively-up-yourself", "t": "Lively Up Yourself", "a": "Bob Marley", "c": ["D", "G", "D", "G"], "ladder": true},
  {"id": "ocean-eyes", "t": "Ocean Eyes", "a": "Billie Eilish", "c": ["C", "D", "Em", "G"], "ladder": true},
  {"id": "open-the-gate", "t": "Open the Gate", "a": "Band Skills Ladder", "c": ["Em", "G", "C", "D"], "ladder": true},
  {"id": "otherside", "t": "Otherside", "a": "Red Hot Chili Peppers", "c": ["Am", "F", "C", "G", "Em"], "ladder": true},
  {"id": "oye-como-va", "t": "Oye Como Va", "a": "Santana", "c": ["Am", "D", "Am", "D"], "ladder": true},
  {"id": "paperback-writer", "t": "Paperback Writer", "a": "The Beatles", "c": ["G", "C", "G", "C"], "ladder": true},
  {"id": "rhiannon", "t": "Rhiannon", "a": "Fleetwood Mac", "c": ["Am", "F", "C", "C"], "ladder": true},
  {"id": "royals", "t": "Royals", "a": "Lorde", "c": ["D", "C", "G", "G"], "ladder": true},
  {"id": "skinny-love", "t": "Skinny Love", "a": "Bon Iver", "c": ["Am", "C", "G", "F"], "ladder": true},
  {"id": "tulsa-time", "t": "Tulsa Time", "a": "Eric Clapton", "c": ["G", "D", "G", "D"], "ladder": true},
  {"id": "what-i-got", "t": "What I Got", "a": "Sublime", "c": ["D", "G", "D", "G"], "ladder": true},
  {"id": "winter-sound", "t": "Winter Sound", "a": "Band Skills Ladder", "c": ["C", "D", "Em", "G"], "ladder": true},
  {"id": "wish-you-were-here", "t": "Wish You Were Here", "a": "Pink Floyd", "c": ["Em", "G", "C", "Am", "A", "D"], "ladder": true},
  {"id": "working-class-hero", "t": "Working Class Hero", "a": "John Lennon", "c": ["Am", "G", "Am", "G"], "ladder": true}
];

/* Which boss guards which song. The bosses come in a fixed order, easiest songs first, so new chords bring new bosses:
   sort the songs by their hardest chord on this player's ladder (guitar and piano climb different ladders), then share the
   roster out in blocks. The Smoke Machine, the final boss, guards the hardest songs. */
window.FMABoss = (function(){
  const ROSTER = ["amp", "cables", "metronome", "kit", "stompbox", "sournote", "mic", "smoke"];
  const NAMES = { amp: "The Amp", cables: "The Tangle", metronome: "Tick-Tock", kit: "The Drum Kit", stompbox: "Captain Fuzz",
    sournote: "Sour Note", mic: "Feedback", smoke: "The Smoke Machine" };
  const songs = window.FMABossSongs;
  const idx = n => { const i = FMAChords.list.findIndex(c => c.name === n); return i < 0 ? 1e4 : i; };
  const pos = s => Math.max(...s.c.map(idx));          // where a song sits on the ladder: its hardest chord
  let sorted = null;
  const order = () => sorted || (sorted = songs.map((s, i) => ({ s, i })).sort((a, b) => pos(a.s) - pos(b.s) || a.i - b.i).map(x => x.s));
  function bossOf(s){
    const o = order(), r = Math.max(0, o.indexOf(s));          // shared out evenly: 51 songs = 6 or 7 a boss
    return ROSTER[Math.min(ROSTER.length - 1, Math.floor(r * ROSTER.length / o.length))];
  }
  const isOpen = (s, open) => s.c.every(n => open.has(n));
  return { ROSTER, NAMES, pos, order, bossOf, isOpen, name: k => NAMES[k] || k,
    byId: id => songs.find(s => s.id === id), openNow: open => order().filter(s => isOpen(s, open)) };
})();
