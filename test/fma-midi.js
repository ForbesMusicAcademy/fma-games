/* MIDI keyboards (and any other MIDI instrument) for every game. Load it after fma-student.js.
   A keyboard plugged into the computer or phone (USB, or Bluetooth MIDI) plays straight into the games: no microphone,
   no room noise, no tuning. Chrome, Edge and Android support it; iPhone and iPad browsers don't, so there it simply
   never shows up and the games carry on with the microphone as before.

   What the player sees: a "🎹 Got a keyboard?" button on the games menu. Tapping it asks the browser for keyboard access
   once (no surprise permission pop-ups on page load); after that it connects by itself on every visit, and a small pill
   in the bottom corner of each game shows the keyboard and the notes it's playing. While a keyboard is
   plugged in the games listen to it instead of the microphone. The pill also turns the keyboard's sound on or off:
   many USB keyboards have no speaker, so the page plays a simple piano sound for them (and players with a speaker on
   their keyboard can switch the page's sound off). "Use the mic" hands back to the microphone, e.g. to play guitar.

   For game code (current and future games):
     FMAMidi.useFor(det, near)  the standard hook for games built on the shared listener (det.start / det.level and
                           det.chroma for note names, or det.read for a pitch {f, clarity}): with a keyboard in, start()
                           skips the microphone, level() reads loud while keys are down, chroma() returns exactly the held
                           notes and read() the held key's pitch, so the game's own logic works unchanged. near() is
                           optional: the Hz the game wants right now, so read() moves the key into that octave.
     FMAMidi.mount(el)     shows the "Got a keyboard?" invite inside el (the games menu). Connecting there covers every
                           game, so the game pages only show the pill while a keyboard is actually plugged in.
     FMAMidi.active()      true when a keyboard is plugged in and the player hasn't chosen the mic.
     FMAMidi.onNote(fn)    fn({on, note, vel}) for every key press/release (note = MIDI number, 60 = middle C).
     FMAMidi.held()        the MIDI numbers sounding right now (keys down, held by the sustain pedal, or just let go).
     FMAMidi.chroma()      the 12 note names sounding right now as a Float32Array (1 = sounding), or null for none.
    A new game gets all of this by loading fma-midi.js and calling FMAMidi.useFor() on its listener (or onNote() for
   note-by-note games like Song Practice).
   Nothing is recorded or sent anywhere: key presses are read on this device and forgotten. */
(function(){
  const PREF = "fma-midi-v1", TAIL = 250;    // a key let go still counts for a moment, so a quick tap reads like a struck note
  const NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  const pref = (() => { try{ return Object.assign({ sound: true, mic: false }, JSON.parse(localStorage.getItem(PREF)) || {}); }catch(e){ return { sound: true, mic: false }; } })();
  const savePref = () => { try{ localStorage.setItem(PREF, JSON.stringify(pref)); }catch(e){} };
  const supported = !!navigator.requestMIDIAccess;
  let access = null, asked = false, pedal = false;
  const down = new Map(), pedalled = new Set(), released = new Map(), listeners = [];   // note -> velocity / note / note -> time let go

  /* ---------- connecting ---------- */
  const inputs = () => access ? [...access.inputs.values()].filter(i => i.state !== "disconnected") : [];
  function wire(){
    inputs().forEach(i => { i.onmidimessage = msg; });
    if(!inputs().length){ down.clear(); pedalled.clear(); }
    draw();
  }
  async function connect(){
    if(!supported || access) return;
    asked = true;
    try{ access = await navigator.requestMIDIAccess(); access.onstatechange = wire; wire(); }
    catch(e){ access = null; draw("Keyboard access was blocked. Allow MIDI for this page in the browser settings."); }
  }
  // Already allowed on an earlier visit: connect quietly. Otherwise wait for a tap on the pill.
  if(supported && navigator.permissions) navigator.permissions.query({ name: "midi" }).then(p => { if(p.state === "granted") connect(); }).catch(() => {});

  /* ---------- reading the keys ---------- */
  function msg(e){
    const [st, a, b] = e.data, type = st & 0xf0;
    if(type === 0x90 && b > 0) noteOn(a, b);
    else if(type === 0x80 || type === 0x90) noteOff(a);
    else if(type === 0xb0 && a === 64){          // sustain pedal
      pedal = b >= 64;
      if(!pedal){ pedalled.forEach(n => { if(!down.has(n)){ released.set(n, performance.now()); voiceOff(n); } }); pedalled.clear(); }
    }
    else if(type === 0xb0 && (a === 120 || a === 123)){ [...down.keys()].forEach(noteOff); }   // all notes off
  }
  function noteOn(n, vel){
    down.set(n, vel); released.delete(n); voiceOn(n, vel); draw();
    listeners.forEach(fn => { try{ fn({ on: true, note: n, vel }); }catch(err){ console.error(err); } });
  }
  function noteOff(n){
    if(!down.has(n)) return;
    down.delete(n);
    if(pedal) pedalled.add(n); else { released.set(n, performance.now()); voiceOff(n); }
    draw();
    listeners.forEach(fn => { try{ fn({ on: false, note: n, vel: 0 }); }catch(err){ console.error(err); } });
  }
  function held(){
    const now = performance.now(), s = new Set([...down.keys(), ...pedalled]);
    if(!s.size) released.forEach((t, n) => { if(now - t < TAIL) s.add(n); });   // only fills a gap: never adds strays to a chord being held
    released.forEach((t, n) => { if(now - t >= TAIL) released.delete(n); });
    return [...s].sort((x, y) => x - y);
  }
  function chroma(){
    const h = held(); if(!h.length) return null;
    const ch = new Float32Array(12); h.forEach(n => { ch[n % 12] = 1; });
    return ch;
  }
  const active = () => supported && !pref.mic && inputs().length > 0;

  /* ---------- a simple piano sound, for keyboards without a speaker ---------- */
  let ac = null, out = null; const voices = new Map();
  function audio(){
    if(!ac){ try{ ac = new (window.AudioContext || window.webkitAudioContext)(); out = ac.createGain(); out.gain.value = 0.5; out.connect(ac.destination); }catch(e){ return null; } }
    if(ac.state === "suspended") ac.resume().catch(() => {});
    return ac;
  }
  ["pointerdown", "keydown"].forEach(ev => addEventListener(ev, () => { if(ac && ac.state === "suspended") ac.resume().catch(() => {}); }, true));
  function voiceOn(n, vel){
    if(!pref.sound) return;
    const c = audio(); if(!c || c.state !== "running") return;
    voiceOff(n, 0.03);
    const f = 440 * Math.pow(2, (n - 69) / 12), t = c.currentTime, g = c.createGain(), peak = 0.06 + 0.3 * (vel / 127);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.006);
    g.gain.exponentialRampToValueAtTime(peak * 0.35, t + 0.5); g.gain.exponentialRampToValueAtTime(0.0001, t + 4);
    const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = Math.min(9000, f * 6 + 800 * (vel / 127));
    const o1 = c.createOscillator(), o2 = c.createOscillator(), g2 = c.createGain();
    o1.type = "triangle"; o1.frequency.value = f; o2.type = "sine"; o2.frequency.value = f * 2; g2.gain.value = 0.25;
    o1.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g); g.connect(out);
    o1.start(t); o2.start(t); o1.stop(t + 4.1); o2.stop(t + 4.1);
    voices.set(n, { g, o: [o1, o2] });
  }
  function voiceOff(n, rel){
    const v = voices.get(n); if(!v || !ac) return;
    voices.delete(n);
    const t = ac.currentTime; rel = rel || 0.25;
    v.g.gain.cancelScheduledValues(t); v.g.gain.setValueAtTime(Math.max(0.0001, v.g.gain.value), t); v.g.gain.exponentialRampToValueAtTime(0.0001, t + rel);
    v.o.forEach(o => { try{ o.stop(t + rel + 0.02); }catch(e){} });
  }

  /* ---------- hooking a game's detector ---------- */
  function useFor(det, near){
    if(!det || det._midi) return det;
    det._midi = true;
    const start = det.start, level = det.level, chr = det.chroma, read = det.read;
    det.start = async function(){
      if(!active()) return start.apply(this, arguments);
      // keyboard only: the game still gets its own audio context (drums, clicks), just no microphone
      this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
      if(this.ctx.state === "suspended") await this.ctx.resume();
      this.keysOnly = true; this.ready = true;
    };
    det.level = function(){
      if(active() && held().length) return -12;                  // keys down: comfortably above any gate
      if(this.keysOnly || !this.an) return -120;                  // no microphone running
      return level.apply(this, arguments);
    };
    if(chr) det.chroma = function(){
      if(active()){ const ch = chroma(); if(ch){ this.tonal = 1; return ch; } }
      if(this.keysOnly || !this.an) return null;
      return chr.apply(this, arguments);
    };
    if(read) det.read = function(){
      const h = active() ? held() : [];
      if(h.length){
        let f = 440 * Math.pow(2, (h[0] - 69) / 12);              // the lowest key down
        const want = near && near();
        if(want) f *= Math.pow(2, Math.round(Math.log2(want / f)));   // into the octave the game wants: only the note name counts
        return { f, clarity: 1 };
      }
      if(this.keysOnly || !this.an) return null;
      return read.apply(this, arguments);
    };
    return det;
  }

  /* ---------- the pill ---------- */
  let pill = null, host = null, note = "";
  function draw(msgText){
    if(!supported) return;
    if(msgText !== undefined) note = msgText;
    if(!pill){
      if(!document.body){ if(!draw.wait){ draw.wait = 1; addEventListener("DOMContentLoaded", () => draw()); } return; }
      const css = document.createElement("style");
      css.textContent = `.fmamidi{position:fixed;left:max(10px,env(safe-area-inset-left));bottom:max(10px,env(safe-area-inset-bottom));z-index:40;display:flex;align-items:center;gap:6px;
        max-width:calc(100vw - 20px);padding:5px 6px 5px 10px;border-radius:999px;background:#fff;border:2px solid #23231F;box-shadow:0 8px 22px -14px rgba(35,35,31,.6);
        font:600 13px/1.2 'Work Sans',system-ui,sans-serif;color:#23231F}
        .fmamidi.inline{position:static;display:inline-flex;box-shadow:none}
        .fmamidi.idle{padding:0;border-width:1px;border-color:#E8E1D2}
        .fmamidi button{font:inherit;cursor:pointer;border:0;background:none;color:inherit;padding:4px 8px;border-radius:999px;min-height:30px}
        .fmamidi .opt{background:#EFEAD9}
        .fmamidi .opt[aria-pressed=true]{background:#FFB805}
        .fmamidi .lbl{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
        .fmamidi .keys{font-family:'Nunito',ui-rounded,sans-serif;font-weight:900;min-width:2.5em;color:#6B6558}
        .fmamidi .msg{font-weight:400;color:#6B6558;padding-right:6px}`;
      document.head.appendChild(css);
      pill = document.createElement("div"); pill.className = "fmamidi"; pill.setAttribute("role", "region"); pill.setAttribute("aria-label", "MIDI keyboard");
      document.body.appendChild(pill);
    }
    const ins = inputs();
    if(host && pill.parentNode !== host) host.appendChild(pill);
    pill.hidden = !host && !(access && ins.length);           // in a game, only while a keyboard is plugged in
    if(!access){
      pill.className = "fmamidi idle" + (host ? " inline" : "");
      pill.innerHTML = note ? `<span class="msg" style="padding:6px 10px">${note}</span>` : `<button type="button" data-a="connect" title="Play the games on a MIDI keyboard">🎹 Got a keyboard?</button>`;
    }else if(!ins.length){
      pill.className = "fmamidi idle" + (host ? " inline" : "");
      pill.innerHTML = `<span class="msg" style="padding:6px 10px">🎹 Plug in your keyboard to play the games on it</span>`;
    }else{
      const name = ins[0].name || "Keyboard", h = held();
      pill.className = "fmamidi" + (host ? " inline" : "");
      pill.innerHTML = `<span class="lbl" title="${esc(name)}">🎹 ${pref.mic ? "Keyboard ready" : esc(short(name))}</span>`
        + (pref.mic ? "" : `<span class="keys" aria-live="off">${h.length ? h.slice(0, 4).map(n => NAMES[n % 12]).join(" ") : "–"}</span>`)
        + (pref.mic ? "" : `<button type="button" class="opt" data-a="sound" aria-pressed="${pref.sound}" title="Play a piano sound from this device (for keyboards without a speaker)">${pref.sound ? "🔊" : "🔇"}</button>`)
        + `<button type="button" class="opt" data-a="mic" aria-pressed="${pref.mic}" title="${pref.mic ? "Listen to the keyboard again" : "Use the microphone instead (e.g. to play guitar)"}">${pref.mic ? "Use keyboard" : "Use the mic"}</button>`;
    }
    pill.querySelectorAll("button").forEach(b => b.onclick = () => {
      const a = b.dataset.a;
      if(a === "connect"){ audio(); connect(); }
      if(a === "sound"){ pref.sound = !pref.sound; savePref(); if(pref.sound) audio(); else [...voices.keys()].forEach(n => voiceOff(n)); draw(); }
      if(a === "mic"){ pref.mic = !pref.mic; savePref(); draw(); }
    });
  }
  const short = s => s.replace(/\b(MIDI|USB|Port|Out|In)\b/gi, "").replace(/\s+\d+$/, "").replace(/\s{2,}/g, " ").trim().slice(0, 22) || "Keyboard";
  const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  draw();

  window.FMAMidi = {
    supported, useFor, active, held, chroma, connect,
    mount(el){ if(el){ host = el; draw(); } },
    onNote(fn){ listeners.push(fn); return () => { const i = listeners.indexOf(fn); if(i >= 0) listeners.splice(i, 1); }; },
    name: n => NAMES[n % 12] + (Math.floor(n / 12) - 1),
    // test hook: lets the self-tests (and Dave, from the console) press keys with no keyboard plugged in
    _test: { on: noteOn, off: noteOff, fake(name){ access = access || { inputs: new Map([["t", { name: name || "Test keyboard", state: "connected" }]]) }; wire(); } }
  };
})();
