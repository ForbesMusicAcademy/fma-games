#!/usr/bin/env python3
"""Builds riff-lab.json: the Riff Lab's riffs, all FMA originals (royalty-free), written for the home games site.

Each riff is written bar by bar in a small tab notation, so the string and fret (and the technique) are exactly what a
student should play. Run from the repo root:  python3 tools/build-riff-lab.py
The riffs take their feel from the great rock bands (heavy 70s stomps, pedal-note gallops, garage punk, blues-rock),
but every one is new: none copies a real riff.

Notation, one note per token, "<string><fret><technique>:<length>":
  strings   e B G D A E   (high E ... low E)
  lengths   w=4 h=2 dq=1.5 q=1 de=0.75 e=0.5 s=0.25 t=1/3 (beats)
  techniques (on the note they lead INTO):
    /   slide up into this note from the note before (same string)
    \\   slide down into this note
    h   hammer-on onto this note       p   pull-off onto this note
    b1  bend this fret up a half step   b2  bend up a whole step (the note heard is the bent one)
    ~   vibrato                         pm  palm mute
  r:<length> is a rest.
"""
import json, os, re

OPEN = {"e": 64, "B": 59, "G": 55, "D": 50, "A": 45, "E": 40}
SIDX = {"e": 0, "B": 1, "G": 2, "D": 3, "A": 4, "E": 5}
LEN = {"w": 4, "h": 2, "dq": 1.5, "q": 1, "de": 0.75, "e": 0.5, "s": 0.25, "t": 1 / 3}
TOK = re.compile(r"^([eBGDAE])(\d{1,2})((?:pm|/|\\|h|p|b1|b2|~)*):(w|h|dq|q|de|e|s|t)$")

def parse_bar(bar, beats):
    notes, t = [], 0.0
    for tok in bar.split():
        if tok.startswith("r:"):
            t += LEN[tok[2:]]; continue
        m = TOK.match(tok)
        if not m: raise ValueError("bad token " + tok)
        s, f, tech, ln = m.group(1), int(m.group(2)), m.group(3), LEN[m.group(4)]
        n = {"t": round(t, 4), "d": round(ln, 4), "s": SIDX[s], "f": f, "m": OPEN[s] + f}
        techs = re.findall(r"pm|/|\\|h|p|b1|b2|~", tech)
        for x in techs:
            if x in ("b1", "b2"): n["bend"] = int(x[1]); n["m"] += int(x[1])
            else: n.setdefault("tech", []).append({"/": "slide", "\\": "slidedown", "h": "hammer", "p": "pull", "~": "vib", "pm": "pm"}[x])
        notes.append(n); t += ln
    if abs(t - beats) > 1e-6: raise ValueError(f"bar adds to {t}, not {beats}: {bar}")
    return notes

def riff(id, title, hook, tempo, bars, chords, ts=(4, 4), rep=2):
    beats = ts[0] * 4 / ts[1]
    seq = bars * rep
    notes = []
    for i, b in enumerate(seq):
        for n in parse_bar(b, beats):
            n = dict(n); n["t"] = round(n["t"] + i * beats, 4); notes.append(n)
    ch = [[i * beats, chords[i % len(chords)]] for i in range(len(seq))]
    # a hammer-on, pull-off or slide joins two notes on the same string, going the right way
    for a_, b_ in zip(notes, notes[1:]):
        for x in b_.get("tech", []):
            if x in ("hammer", "pull", "slide", "slidedown"):
                if a_["s"] != b_["s"]: raise ValueError(f"{id}: {x} at beat {b_['t']} isn't on the same string as the note before")
                up = b_["f"] > a_["f"]
                if (x in ("hammer", "slide") and not up) or (x in ("pull", "slidedown") and up):
                    raise ValueError(f"{id}: {x} at beat {b_['t']} goes the wrong way ({a_['f']} to {b_['f']})")
    if notes and notes[0].get("tech") and set(notes[0]["tech"]) & {"hammer", "pull", "slide", "slidedown"}:
        raise ValueError(id + ": starts with a legato note")
    ms = [n["m"] for n in notes]
    return {"id": id, "title": title, "hook": hook, "level": "Riff Lab", "tempo": tempo, "ts": list(ts), "bars": len(seq),
            "lo": min(ms), "hi": max(ms), "notes": notes, "chords": ch, "composer": "FMA original"}

LABS = []
def lab(n, name, skill, riffs): LABS.append({"lab": n, "name": name, "skill": skill, "riffs": riffs})

# ---------------- Lab 1: straight notes, low E, no techniques ----------------
lab(1, "Straight Notes", "Low E string, plain notes. Find the frets and keep it steady.", [
  riff("lab1-iron-gate", "Iron Gate", "A slow, heavy 70s stomp. Let every note ring.", 84,
       ["E0:e E0:e E5:q E7:q E5:q", "E0:e E0:e E8:q E7:h"], ["E5", "E5"]),
  riff("lab1-highway-run", "Highway Run", "A pedal-note driving riff: keep coming back to the open string.", 104,
       ["E0:e E0:e E3:e E0:e E5:e E0:e E3:e E0:e", "E0:e E0:e E7:e E0:e E5:e E0:e E3:e E2:e"], ["E5", "E5"]),
  riff("lab1-slow-thunder", "Slow Thunder", "Big, doomy and slow. Count the long notes right to the end.", 72,
       ["E0:h E10:q E12:q", "E7:h E5:q E3:q", "E0:w"], ["E5", "C5", "E5"], rep=2),
  riff("lab1-garage-days", "Garage Days", "Three-chord garage punk, played on one string.", 116,
       ["E0:q E3:e E5:e E0:q E3:q", "E5:e E6:e E5:e E3:e E0:h"], ["E5", "G5"]),
])

# ---------------- Lab 2: palm-muted chugs ----------------
lab(2, "Palm Mutes", "Rest the side of your picking hand on the strings for a tight chug.", [
  riff("lab2-chug-engine", "Chug Engine", "Muted chugs, then two loud notes to finish each bar.", 100,
       ["E0pm:e E0pm:e E0pm:e E0pm:e E0pm:e E0pm:e E3:e E5:e", "E0pm:e E0pm:e E0pm:e E0pm:e E0pm:e E0pm:e E7:e E5:e"], ["E5", "E5"]),
  riff("lab2-night-gallop", "Night Gallop", "The galloping horse rhythm of classic metal: long, short, short.", 92,
       ["E0pm:e E0pm:s E0pm:s E0pm:e E0pm:s E0pm:s E0pm:e E0pm:s E0pm:s E5:e E3:e",
        "E0pm:e E0pm:s E0pm:s E0pm:e E0pm:s E0pm:s E7:q E5:q"], ["E5", "E5"]),
  riff("lab2-brick-wall", "Brick Wall", "Chug, chug, then a big open note. Heavy and simple.", 96,
       ["E0pm:e E0pm:e E7:q E0pm:e E0pm:e E8:e E7:e", "E0pm:e E0pm:e E0pm:e E0pm:e E5:q E3:q"], ["E5", "E5"]),
  riff("lab2-power-station", "Power Station", "A bouncy pub-rock chug with notes popping out between.", 120,
       ["E0pm:e E0pm:e E3:e E0pm:e E5:e E0pm:e E3:e E0pm:e", "E0pm:e E0pm:e E7:e E5:e E3:e E0pm:e E0pm:q"], ["E5", "A5"]),
])

# ---------------- Lab 3: slides ----------------
lab(3, "Slides", "Keep your finger pressed down and slide it along the string to the next fret.", [
  riff("lab3-slide-show", "Slide Show", "Slide up two frets and back. The second note isn't picked.", 90,
       ["E5:q E7/:q E5:q E0:q", "E3:q E5/:q E3:q E0:q"], ["E5", "C5"]),
  riff("lab3-desert-road", "Desert Road", "A dusty blues-rock riff with a long slide up at the end.", 88,
       ["E0:e E0:e E7:q E9/:h", "E0:e E0:e E5:q E7/:q E5\\:q"], ["E5", "E5"]),
  riff("lab3-big-sky", "Big Sky", "Start high and slide your way down the neck.", 80,
       ["E12:h E10\\:q E7\\:q", "E5:h E3\\:q E0:q"], ["E5", "C5"]),
  riff("lab3-rocket", "Rocket", "Climb the string with slides, all the way to fret 12.", 100,
       ["E0:e E3:e E5/:e E7/:e E10/:e E12/:e E0:q", "E0:e E3:e E5/:e E3\\:e E0:h"], ["E5", "E5"]),
])

# ---------------- Lab 4: hammer-ons ----------------
lab(4, "Hammer-ons", "Pick once, then tap a finger down hard on the next fret to sound the note.", [
  riff("lab4-anvil", "Anvil", "Open string, hammer to fret 3. A blues-rock classic move.", 92,
       ["E0:e E3h:e E0:e E3h:e E5:q E7:q", "E0:e E2h:e E3h:e E0:e E5:h"], ["E5", "E5"]),
  riff("lab4-rumble", "Rumble", "Pedal notes with a hammer-on kick at the end of each beat.", 100,
       ["E0:e E0:e E3:e E5h:e E0:e E0:e E7:e E8h:e", "E0:e E0:e E3:e E5h:e E7:h"], ["E5", "E5"]),
  riff("lab4-muddy-water", "Muddy Water", "A swampy blues riff full of hammer-ons from the open string.", 88,
       ["E0:e E3h:e E0:e E5:e E0:e E3h:e E5:e E6h:e", "E7:h E0:h"], ["E5", "A5"]),
  riff("lab4-stomp-box", "Stomp Box", "Chugs, slides and hammer-ons together.", 104,
       ["E0pm:e E0pm:e E0:e E3h:e E5:q E7/:q", "E0pm:e E0pm:e E0:e E2h:e E3h:h"], ["E5", "G5"]),
])

# ---------------- Lab 5: pull-offs ----------------
lab(5, "Pull-offs", "Pick the fretted note, then flick your finger off so the lower note rings.", [
  riff("lab5-drop-off", "Drop Off", "Fret 3, pull off to the open string. Over and over.", 92,
       ["E3:e E0p:e E3:e E0p:e E5:e E3p:e E0p:e E0:e", "E3:e E0p:e E5:e E0p:e E7:h"], ["E5", "E5"]),
  riff("lab5-backwards", "Backwards", "A riff that tumbles down the string.", 96,
       ["E7:e E5p:e E3:e E0:e E7:e E5p:e E7:e E8:e", "E7:e E5p:e E3:e E0p:e E0:h"], ["E5", "C5"]),
  riff("lab5-cliff-edge", "Cliff Edge", "Two pull-offs in a row: fret 5, fret 3, open.", 84,
       ["E5:e E3p:e E0p:e E3:e E5:q E7:q", "E5:e E3p:e E0p:e E0:e E3:h"], ["E5", "G5"]),
  riff("lab5-yo-yo", "Yo-Yo", "Hammer on, pull off: the string goes up and down without picking.", 96,
       ["E0:e E3h:e E0p:e E3h:e E5:q E3:q", "E0:e E3h:e E0p:e E5:e E7/:h"], ["E5", "E5"]),
])

# ---------------- Lab 6: bends ----------------
lab(6, "Bends", "Push or pull the string sideways to raise the note. On the low E, pull it down towards the floor.", [
  riff("lab6-growl", "Growl", "Small half-step bends that make the riff growl.", 88,
       ["E0:e E0:e E3b1:q E0:e E0:e E5b1:q", "E0:e E0:e E3b1:q E0:h"], ["E5", "E5"]),
  riff("lab6-grind", "Grind", "Pick fret 7, then bend it. Listen for the note rising.", 80,
       ["E7:q E7b1:q E5:q E3:q", "E0:q E3:q E5b1:h"], ["E5", "C5"]),
  riff("lab6-swamp-thing", "Swamp Thing", "A heavy blues bend on fret 3, answered by the open string.", 92,
       ["E3b1:e E0:e E3b1:e E0:e E5:q E3:q", "E3b1:e E0:e E5:e E7:e E5b1:h"], ["E5", "E5"]),
  riff("lab6-sludge", "Sludge", "Slow and heavy, with bends, slides and hammer-ons.", 76,
       ["E0:q E3h:q E5b1:h", "E7:q E5\\:q E3b1:h"], ["E5", "G5"]),
])

# ---------------- Lab 7: vibrato ----------------
lab(7, "Vibrato", "On a long note, wobble the string up and down a little so it sings.", [
  riff("lab7-howl", "Howl", "Short notes, then a long one you shake with vibrato.", 84,
       ["E0:e E3:e E5:q E7~:h", "E5:e E3:e E0:q E3~:h"], ["E5", "E5"]),
  riff("lab7-siren", "Siren", "Big long notes up high. Make each one sing.", 72,
       ["E9~:h E10~:h", "E12~:w"], ["E5", "E5"]),
  riff("lab7-long-road", "Long Road", "Slide into a long note and add vibrato.", 80,
       ["E5:q E7/~:dq E5:e E3:q", "E0:q E3h:q E5~:h"], ["E5", "A5"]),
  riff("lab7-last-stand", "Last Stand", "Everything on the low E: chugs, slides, hammers, pulls, bends and vibrato.", 92,
       ["E0pm:e E0pm:e E3h:e E0p:e E5:q E7/~:q", "E0pm:e E0pm:e E3b1:q E5:e E7:e E12~:q"], ["E5", "E5"]),
])

# ---------------- Lab 8: power zone (A and D strings) ----------------
lab(8, "Power Zone", "The same techniques, now on the A and D strings, and crossing between them.", [
  riff("lab8-drop-zone", "Drop Zone", "A low riff that crosses from the A string to the D string.", 96,
       ["A0:e A3:e A5:q D2:q D3h:q", "A0:e A3:e A5:e A3p:e A0:h"], ["A5", "A5"]),
  riff("lab8-steamroller", "Steamroller", "Muted chugs on the A string with notes jumping to the D string.", 104,
       ["A0pm:e A0pm:e D2:e A0pm:e D3:e A0pm:e D2:e A0pm:e", "A0pm:e A0pm:e A3:e A5/:e D5:q D3\\:q"], ["A5", "A5"]),
  riff("lab8-mountain-pass", "Mountain Pass", "Hammer-ons and pull-offs, rocking between two strings.", 92,
       ["D0:e D2h:e D0p:e A3:e A0:e A3h:e D0:q", "D0:e D2h:e D3h:e D2p:e D0:q A0~:q"], ["D5", "A5"]),
  riff("lab8-jet-stream", "Jet Stream", "Fast notes, a bend and some vibrato across A and D.", 108,
       ["A0:e A2:e A3:e D0:e D2:e D3:e D5:e D7b1:e", "D5:e D3p:e D2:e A3:e A0:q A5~:q"], ["A5", "D5"]),
])

# ---------------- Lab 9: lead zone (G and B strings) ----------------
lab(9, "Lead Zone", "Up on the G and B strings, where guitar solos live. Full bends: push the note up two frets.", [
  riff("lab9-first-bend", "First Bend", "Pick fret 7 on the G, then push it up a whole step.", 80,
       ["G7:q G7b2:q G5:q G7:q", "B5:q B8:q G7b2:h"], ["A5", "A5"]),
  riff("lab9-screamer", "Screamer", "A big bend on the B string, then down the scale.", 84,
       ["B8b2:h B8:q B5:q", "G7:q G5:q G7~:h"], ["A5", "D5"]),
  riff("lab9-sunset", "Sunset", "A singing melody with hammer-ons, pull-offs and vibrato.", 88,
       ["G5:e G7h:e B5:e B8:e B5:q G7~:q", "B8:e B5p:e G7:e G5:e G7~:h"], ["A5", "A5"]),
  riff("lab9-encore", "Encore", "Bends, slides and vibrato together. Make it sing!", 92,
       ["G5:e G7/:e G7b2:q B5:e B8:e B8b2:q", "B5:e G7:e G5:e G7h:e G7b2~:h"], ["A5", "E5"]),
])

# ---------------- Lab 10: the box (A minor pentatonic, 5th fret) ----------------
lab(10, "The Box", "The A minor pentatonic box at the 5th fret: the shape behind countless rock solos.", [
  riff("lab10-the-box", "The Box", "Walk up the box and back down. Two notes on every string.", 96,
       ["E5:e E8:e A5:e A7:e D5:e D7:e G5:e G7:e", "B5:e B8:e e5:e e8:e e5:q r:q",
        "e8:e e5:e B8:e B5:e G7:e G5:e D7:e D5:e", "A7:e A5:e E8:e E5:e E5:h"], ["A5", "A5", "A5", "A5"], rep=1),
  riff("lab10-blues-lick", "Blues Lick", "A bend on the B string falling down the box.", 88,
       ["B8b2:q B5:e G7:e G5:e D7:e D5:q", "B8:e B5p:e G7:e G5:e G7b2~:h"], ["A5", "D5"]),
  riff("lab10-stadium", "Stadium", "Big, slow notes up high for the whole crowd to hear.", 80,
       ["e5:q e8:q B8b2:h", "B5:q G7:q G7b2~:h"], ["A5", "G5"]),
  riff("lab10-grand-finale", "Grand Finale", "Everything you've learned in one riff. Take a bow!", 96,
       ["A5:e A7h:e D5:e D7h:e G5:e G7h:e B5:e B8h:e", "e5:e e8h:e e5p:e B8:e B8b2:q G7~:q",
        "D7:e D5p:e A7:e A5p:e E8:e E5p:e A5:e A7/:e", "A5:h r:q A5~:q"], ["A5", "D5", "E5", "A5"], rep=1),
])

out = {"_readme": "Riff Lab riffs, all FMA originals (royalty-free). Built by tools/build-riff-lab.py: edit that, not this file. "
                  "Each note has t/d in beats, the string s (0 = high E ... 5 = low E), the fret f, the pitch m heard (a bend's m is "
                  "the bent note), and any techniques.",
       "labs": LABS}
here = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(here, "..", "riff-lab.json"), "w") as f: json.dump(out, f, separators=(",", ":"), ensure_ascii=False)
print(sum(len(l["riffs"]) for l in LABS), "riffs in", len(LABS), "labs")
