/* The one listener for every game (13 Oct 2026). Before this, Chord Quest, Boss Battle, Song Packs, Falling Notes and Tune Up
   each carried their own copy of the same code, so a fix in one never reached the others. Now they all use this file, and
   the test pages (dev/replay.html) run the very same code over recordings, so what's measured is what the games do.
   Load after fma-student.js and before fma-midi.js's hook (FMAMidi.useFor works on these listeners unchanged).

   const det = FMAListen.create();           one per page
   await det.start()                         asks for the microphone (echo cancelling, noise suppression and auto-gain off:
                                             they're made for voices and wreck a guitar). Options:
                                               { ctx }      share the page's own AudioContext (games that also play sound)
                                               { test: true } no microphone: feed sound into det.testGain instead (self-test,
                                                              replaying recordings)
   det.level()                               loudness in dB (0 = full scale) of the last ~0.1 s
   det.rms()                                 the same as plain RMS of the last 512 samples (onset detection)
   det.calibrate(ms)                         listens to the room for ms (default 2000) and sets det.gateDb a little above it

   CHORDS (which of the 12 note names are sounding)
   det.chroma()                              energy on each note name (70 Hz to 1.1 kHz), corrected for a guitar that's a little
                                             sharp or flat (det.tune, in semitones), or null when the sound isn't musical
                                             (a cough, a clatter: det.tonal under TONAL_MIN)
   det.scores()                              chroma scaled 0-1 above the noise floor, with each note's own overtones taken off
                                             the notes they land on, or null below the gate / not musical
   FMAListen.strongest(sc, margin)           the note clearly loudest (beats both neighbouring semitones by margin, default
                                             0.25), or -1: "root note" modes
   const m = FMAListen.chordMatch(chord, {thr, strays, need})
     m.step(sc) -> {hit, latched, heard}     call ~11 times a second with det.scores(). A chord is {mask, allow?}: mask = the
                                             notes that must sound, allow = notes that may also sound (an easy two-note chord
                                             accepts the full chord). hit once every needed note and no more than `strays`
                                             others hold for `need` readings (default 3) in a row. heard = notes that have
                                             lit up at some point (for the note chips).
     m.reset()

   SINGLE NOTES (melodies, tuning)
   det.read(opts) -> {f, clarity} | null     the pitch of the latest block (YIN). opts: {fmin, fmax, window, threshold};
                                             the defaults suit melodies (70-1400 Hz, 1024-sample window)
   const t = FMAListen.notes(det, { onNote(midi, when, legato), legato: () => bool, onLevel(rms), onHeard(midi|null) })
     t.step()                                call every ~12 ms. A note starts when the level jumps; its pitch is read just
                                             after. With legato() true, a new pitch that holds steady for ~50 ms with no new
                                             pick is a note too (hammer-ons, pull-offs, slides, bends). when = AudioContext
                                             time of the onset.

   Nothing is recorded or sent anywhere: every reading is worked out on the device and thrown away. */
(function(){
  const TONAL_MIN = 0.30, CHROMA_FFT = 16384, TIME = 4096;
  const NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  let stream = null;          // one microphone per page, whichever listener asks first

  function create(){
    const det = {
      ctx: null, an: null, tan: null, buf: null, td: new Float32Array(TIME), d: null, testGain: null,
      tune: 0, tonal: 0, gateDb: -50, ready: false,
      async start(opts){
        opts = opts || {};
        if(this.ready) return;
        this.ctx = opts.ctx || new (window.AudioContext || window.webkitAudioContext)();
        this.an = this.ctx.createAnalyser(); this.an.fftSize = CHROMA_FFT; this.an.smoothingTimeConstant = 0;
        this.tan = this.ctx.createAnalyser(); this.tan.fftSize = TIME; this.tan.smoothingTimeConstant = 0;
        this.buf = new Float32Array(this.an.frequencyBinCount);
        const into = this.ctx.createGain(); into.connect(this.an); into.connect(this.tan);
        if(opts.test){
          this.testGain = into;            // test sound goes straight in, never to the speaker
        }else{
          if(!stream) stream = await navigator.mediaDevices.getUserMedia({audio: {echoCancellation: false, noiseSuppression: false, autoGainControl: false}});
          this.ctx.createMediaStreamSource(stream).connect(into);
        }
        // (an OfflineAudioContext, used by dev/replay.html, can't be resumed before it renders)
        if(this.ctx.state === "suspended" && !(window.OfflineAudioContext && this.ctx instanceof OfflineAudioContext)) await this.ctx.resume();
        this.ready = true;
      },
      _time(){ this.tan.getFloatTimeDomainData(this.td); return this.td; },
      level(){
        const x = this._time(); let s = 0; for(let i = 0; i < x.length; i++) s += x[i] * x[i];
        return 20 * Math.log10(Math.sqrt(s / x.length) + 1e-9);
      },
      rms(){
        const x = this._time(); let s = 0; for(let i = x.length - 512; i < x.length; i++) s += x[i] * x[i];
        return Math.sqrt(s / 512);
      },
      async calibrate(ms){
        ms = ms || 2000; const samples = [], t0 = performance.now();
        await new Promise(res => { const tick = () => { samples.push(this.level()); if(performance.now() - t0 >= ms) res(); else setTimeout(tick, 60); }; tick(); });
        samples.sort((a, b) => a - b);
        const quiet = samples[Math.floor(samples.length * 0.8)];
        this.gateDb = Math.max(-75, Math.min(-38, quiet + 9));      // a note has to be well above the room's own noise
        return this.gateDb;
      },
      chroma(){
        this.an.getFloatFrequencyData(this.buf);
        const hz = this.ctx.sampleRate / CHROMA_FFT, k0 = Math.ceil(70 / hz), k1 = Math.floor(1100 / hz), n = k1 - k0;
        const mag = new Float32Array(n); let mx = 0;
        for(let i = 0; i < n; i++){ mag[i] = Math.pow(10, this.buf[k0 + i] / 20); if(mag[i] > mx) mx = mag[i]; }
        // Is this sound tonal at all? Notes are sharp spectral peaks; a cough, a rustle or a room's hiss is energy spread over
        // everything. Chords score about 0.85-1.0 here (even with noise on top), noise well under 0.15.
        { let tot = 0, pk = 0; const W = 15;
          for(let i = 0; i < n; i++){
            const e = mag[i] * mag[i]; tot += e;
            if((i === 0 || mag[i] >= mag[i - 1]) && (i === n - 1 || mag[i] >= mag[i + 1])){
              const seg = Array.from(mag.subarray(Math.max(0, i - W), Math.min(n, i + W + 1))).sort((a, b) => a - b);
              if(mag[i] >= 3 * seg[seg.length >> 1]){ pk += e; if(i > 0) pk += mag[i - 1] * mag[i - 1]; if(i < n - 1) pk += mag[i + 1] * mag[i + 1]; }
            }
          }
          this.tonal = pk / (tot + 1e-30);
        }
        if(this.tonal < TONAL_MIN) return null;
        // tuning: where do the strong peaks sit against the nearest semitone? (circular mean, weighted by size)
        let sx = 0, sy = 0;
        for(let i = 1; i < n - 1; i++){
          if(mag[i] > 0.25 * mx && mag[i] >= mag[i - 1] && mag[i] > mag[i + 1]){
            const a = this.buf[k0 + i - 1], b = this.buf[k0 + i], c = this.buf[k0 + i + 1], d = 0.5 * (a - c) / (a - 2 * b + c || 1);
            const f = (k0 + i + d) * hz, m = 69 + 12 * Math.log2(f / 440), frac = m - Math.round(m);
            sx += mag[i] * Math.cos(2 * Math.PI * frac); sy += mag[i] * Math.sin(2 * Math.PI * frac);
          }
        }
        if(sx || sy){ const est = Math.atan2(sy, sx) / (2 * Math.PI); this.tune = this.tune * 0.8 + est * 0.2; }
        const ch = new Float32Array(12);
        for(let i = 0; i < n; i++){
          const f = (k0 + i) * hz, m = 69 + 12 * Math.log2(f / 440) - this.tune, pc = ((Math.round(m) % 12) + 12) % 12;
          ch[pc] += Math.sqrt(mag[i]);
        }
        return ch;
      },
      scores(){
        if(!this.ready) return null;
        if(this.level() <= this.gateDb) return null;
        const ch = this.chroma(); if(!ch) return null;
        const sorted = Array.from(ch).sort((a, b) => a - b), floor = (sorted[5] + sorted[6]) / 2, span = sorted[11] - floor + 1e-9;
        const raw = Array.from(ch, v => Math.max(v - floor, 0) / span);
        // every note rings overtones: a 3rd overtone lands 7 semitones up, a 5th 4 up. Take a small share of each note's own
        // overtones off where they land, so a C chord doesn't light up B (an overtone of its E) and look like Em
        return raw.map((v, i) => Math.max(0, v - 0.25 * raw[(i + 5) % 12] - 0.10 * raw[(i + 8) % 12]));
      },
      // YIN pitch on the latest time block. Defaults suit melodies; Tune Up asks for a longer window and the guitar's range.
      read(opts){
        const o = Object.assign({ fmin: 70, fmax: 1400, window: 1024, threshold: 0.15 }, opts || {});
        const x = this._time(), sr = this.ctx.sampleRate, W = Math.min(o.window, x.length >> 1);
        const tMin = Math.max(2, Math.floor(sr / o.fmax)), tMax = Math.min(Math.ceil(sr / o.fmin), x.length - W - 1);
        if(!this.d || this.d.length < tMax + 2) this.d = new Float32Array(tMax + 2);
        const d = this.d, off = x.length - W - tMax - 1;          // the newest samples
        for(let t = 1; t <= tMax; t++){ let s = 0; for(let j = 0; j < W; j++){ const e = x[off + j] - x[off + j + t]; s += e * e; } d[t] = s; }
        let run = 0; d[0] = 1;
        for(let t = 1; t <= tMax; t++){ run += d[t]; d[t] = d[t] * t / (run || 1); }
        let t = tMin;
        while(t < tMax){ if(d[t] < o.threshold){ while(t + 1 < tMax && d[t + 1] < d[t]) t++; break; } t++; }
        if(t >= tMax) return null;
        const a = d[t - 1], b = d[t], c = d[t + 1], den = a - 2 * b + c;
        const tau = t + (den ? 0.5 * (a - c) / den : 0);
        return { f: sr / tau, clarity: 1 - b };
      }
    };
    return det;
  }

  function strongest(sc, margin){
    if(!sc) return -1;
    let b = 0; sc.forEach((v, i) => { if(v > sc[b]) b = i; });
    const nb = Math.max(sc[(b + 1) % 12], sc[(b + 11) % 12]);
    return sc[b] - nb >= (margin === undefined ? 0.25 : margin) ? b : -1;
  }

  function chordMatch(chord, opts){
    const o = Object.assign({ thr: 0.25, strays: 0, need: 3 }, opts || {});   // 25% (was 40%, 13 Oct 2026): phone mics hear quiet low strings weakly
    const latched = new Array(12).fill(false), onFor = new Array(12).fill(0);
    let run = 0, heard = 0;
    return {
      opts: o,
      reset(){ latched.fill(false); onFor.fill(0); run = 0; heard = 0; },
      step(sc){
        if(!sc){ latched.fill(false); onFor.fill(0); run = 0; return { hit: false, latched, heard }; }
        const allow = chord.allow || chord.mask; let missing = 0, strays = 0;
        for(let i = 0; i < 12; i++){
          const v = sc[i], need = (chord.mask >> i) & 1;
          latched[i] = v >= o.thr || (latched[i] && v >= o.thr - 0.10);     // once counted, a note stays counted until it drops a little
          onFor[i] = latched[i] ? onFor[i] + 1 : 0;
          if(onFor[i] >= 2 && need) heard |= 1 << i;                         // a chip lights only after two readings in a row
          if(need && !latched[i]) missing++;
          if(!need && !((allow >> i) & 1) && latched[i]) strays++;
        }
        run = (missing === 0 && strays <= o.strays) ? run + 1 : 0;
        return { hit: run >= o.need, latched, heard };
      }
    };
  }

  // note-by-note listening for melodies (Song Packs, Riff Lab, Falling Notes)
  function notes(det, h){
    h = h || {};
    const frames = [], pending = [], rmsWin = [];
    let lastOnset = -9, stab = { m: null, c: 0 }, lastEmit = null;
    return {
      step(){
        if(!det.ready) return;
        const now = det.ctx.currentTime, rms = det.rms();
        if(h.onLevel) h.onLevel(rms);
        rmsWin.push({ t: now, rms }); while(rmsWin.length && rmsWin[0].t < now - 2) rmsWin.shift();
        const floor = Math.min(0.02, Math.max(0.006, Math.min(...rmsWin.map(r => r.rms)) * 3));
        let midi = null;
        if(rms > floor){ const p = det.read(); if(p && p.clarity > 0.85 && p.f > 70 && p.f < 1400) midi = 69 + 12 * Math.log2(p.f / 440); }
        frames.push({ t: now, rms, midi }); while(frames.length && frames[0].t < now - 2) frames.shift();
        if(h.legato && h.legato() && midi != null && Math.abs(midi - Math.round(midi)) < 0.35){
          const r = Math.round(midi);
          if(r === stab.m) stab.c++; else stab = { m: r, c: 1 };
          if(stab.c === 4 && r !== lastEmit && now - lastOnset > 0.16){ lastEmit = r; if(h.onNote) h.onNote(r, now - 0.05, true); }
        }else if(midi == null) stab = { m: null, c: 0 };
        if(h.onHeard) h.onHeard(midi);
        let prevMin = Infinity; for(const f of frames) if(f.t >= now - 0.08 && f.t <= now - 0.02) prevMin = Math.min(prevMin, f.rms);
        if(prevMin < Infinity && rms > floor && rms > prevMin * 1.6 + 0.004 && now - lastOnset > 0.12){ lastOnset = now; pending.push(now); }
        for(let k = pending.length - 1; k >= 0; k--){
          const t = pending[k]; if(now < t + 0.12) continue;
          pending.splice(k, 1);
          const ms = frames.filter(f => f.midi != null && f.t >= t + 0.03 && f.t <= t + 0.12).map(f => f.midi).sort((a, b) => a - b);
          if(ms.length >= 2){ const m = Math.round(ms[ms.length >> 1]); lastEmit = m; if(h.onNote) h.onNote(m, t, false); }
        }
      }
    };
  }

  window.FMAListen = { create, strongest, chordMatch, notes, NAMES, TONAL_MIN };
})();
