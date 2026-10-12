"""Builds fma-boss-songs.js's song list: Boss Battle's songs, shared with Chord Quest.

Run after chord-songs.json changes ("update the games from the ladder"):   python3 tools/build-boss-songs.py

Two sources:
  * the Band Skills Ladder's Ladder Songs tab (chord-songs.json). Dave, 13 Oct 2026: arrange each song's chords in the
    ladder in their proper order, and that order IS the loop, one chord per bar, exactly as listed. Ladder songs win over
    the hand-written ones below when the title is the same (their ids are kept, so stars and bests carry over).
  * a few FMA warm-ups and songs that aren't on the ladder, written by hand here.
Only the song list between the BEGIN/END markers in fma-boss-songs.js is replaced; the code after it is left alone.
"""
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
EXTRA = [   # (id, title, artist, loop) - not on the ladder
    ("em-g-stomp", "Em–G Stomp", "FMA warm-up", ["Em", "Em", "G", "G"]),
    ("g-em-groove", "G–Em Groove", "FMA warm-up", ["G", "Em", "G", "Em"]),
    ("three-chord-trick", "Three-Chord Trick", "FMA warm-up", ["G", "C", "Em", "C"]),
    ("zombie", "Zombie", "The Cranberries", ["Em", "C", "G", "D"]),
    ("wagon-wheel", "Wagon Wheel", "Old Crow Medicine Show", ["G", "D", "Em", "C"]),
    ("brown-eyed-girl", "Brown Eyed Girl", "Van Morrison", ["G", "C", "G", "D"]),
    ("sweet-home-alabama", "Sweet Home Alabama", "Lynyrd Skynyrd", ["D", "C", "G", "G"]),
    ("perfect", "Perfect", "Ed Sheeran", ["G", "Em", "C", "D"]),
    ("riptide", "Riptide", "Vance Joy", ["Am", "G", "C", "C"]),
    ("shake-it-off", "Shake It Off", "Taylor Swift", ["Am", "C", "G", "G"]),
    ("let-it-be", "Let It Be", "The Beatles", ["C", "G", "Am", "F"]),
    ("little-talks", "Little Talks", "Of Monsters and Men", ["Am", "F", "C", "G"]),
    ("la-bamba", "La Bamba", "Ritchie Valens", ["C", "F", "G", "G"]),
    ("dreams", "Dreams", "Fleetwood Mac", ["F", "G", "F", "G"]),
    ("born-in-the-usa", "Born in the U.S.A.", "Bruce Springsteen", ["A", "A", "D", "D"]),
    ("wild-thing", "Wild Thing", "The Troggs", ["A", "D", "E", "D"]),
]
norm = lambda t: re.sub(r"[^a-z0-9]", "", t.lower())
slug = lambda t: re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")
ladder = json.load(open(os.path.join(ROOT, "chord-songs.json")))["songs"]
by_title = {norm(s["title"]): s for s in ladder}
out = []
for sid, t, a, c in EXTRA:
    s = by_title.pop(norm(t), None)
    out.append({"id": sid, "t": t, "a": (s or {}).get("artist") or a, "c": s["chords"] if s else c, **({"ladder": True} if s else {})})
for s in ladder:
    if norm(s["title"]) in by_title:
        out.append({"id": slug(s["title"]), "t": s["title"], "a": s["artist"] or "Band Skills Ladder", "c": s["chords"], "ladder": True})
path = os.path.join(ROOT, "fma-boss-songs.js"); js = open(path).read()
body = "window.FMABossSongs = [\n" + ",\n".join("  " + json.dumps(o, ensure_ascii=False) for o in out) + "\n];"
js = re.sub(r"window\.FMABossSongs = \[.*?\n\];", lambda m: body, js, count=1, flags=re.S)
open(path, "w").write(js)
print(len(out), "songs,", sum(1 for o in out if o.get("ladder")), "from the ladder")
