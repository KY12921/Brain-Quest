// ------------------------------------------------------------------
// Brain Quest — Game Music.
//
// HONEST NOTE: there are no audio files here — this generates simple
// instrumental music loops directly in the browser using the Web
// Audio API (oscillators). That's a deliberate choice: it needs no
// external assets, no licensing concerns, and no download size, and
// it guarantees "instrumental only, no speech" by construction, since
// it's just synthesized tones. It won't sound like a produced
// soundtrack, but it's a real, working, copyright-free music system.
//
// Browsers block audio from starting without a user gesture first —
// that's why playback only begins after a click, either on a music
// option in Settings or (if a track was already selected in a past
// session) the next click anywhere in the app.
// ------------------------------------------------------------------

const NOTE_FREQ = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99
};

// Each track is a chord progression, not a single melodic line — real
// harmony (multiple simultaneous notes per step) makes a genuine
// difference in how "musical" this sounds versus one note at a time.
const MUSIC_TRACKS = {
  lofi: {
    name: "Lo-Fi Study",
    description: "Warm chord progression — classic lo-fi study vibe.",
    wave: "triangle",
    attack: 0.03,
    steps: [
      { notes: ["C4", "E4", "G4"], duration: 1.6 },
      { notes: ["A3", "C4", "E4"], duration: 1.6 },
      { notes: ["F3", "A3", "C4"], duration: 1.6 },
      { notes: ["G3", "B3", "D4"], duration: 1.6 }
    ]
  },
  deepFocus: {
    name: "Deep Focus",
    description: "Slow, sparse dyads — for silent, distraction-free focus.",
    wave: "sine",
    attack: 0.6,
    steps: [
      { notes: ["C4", "G4"], duration: 3.0 },
      { notes: ["A3", "E4"], duration: 3.0 },
      { notes: ["F3", "C4"], duration: 3.0 },
      { notes: ["G3", "D4"], duration: 3.0 }
    ]
  },
  rainyDay: {
    name: "Rainy Day",
    description: "Soft, reflective chords — a gentle backdrop for reading.",
    wave: "sine",
    attack: 0.15,
    steps: [
      { notes: ["A3", "C4", "E4"], duration: 1.8 },
      { notes: ["F3", "A3", "C4"], duration: 1.8 },
      { notes: ["C4", "E4", "G4"], duration: 1.8 },
      { notes: ["G3", "B3", "D4"], duration: 1.8 }
    ]
  },
  sunnyMorning: {
    name: "Sunny Morning",
    description: "Bright, upbeat pop progression — energizing without being distracting.",
    wave: "triangle",
    attack: 0.02,
    steps: [
      { notes: ["C4", "E4", "G4"], duration: 1.0 },
      { notes: ["G3", "B3", "D4"], duration: 1.0 },
      { notes: ["A3", "C4", "E4"], duration: 1.0 },
      { notes: ["F3", "A3", "C4"], duration: 1.0 }
    ]
  },
  nightOwl: {
    name: "Night Owl",
    description: "Slow, moody jazz-tinged progression — for late-night sessions.",
    wave: "sine",
    attack: 0.4,
    steps: [
      { notes: ["D4", "F4", "A4"], duration: 2.4 },
      { notes: ["G3", "B3", "D4"], duration: 2.4 },
      { notes: ["C4", "E4", "G4"], duration: 2.4 },
      { notes: ["A3", "C4", "E4"], duration: 2.4 }
    ]
  },
  coffeeShop: {
    name: "Coffee Shop",
    description: "Relaxed, warm instrumental loop — bought in the Shop.",
    wave: "triangle",
    attack: 0.05,
    shopItem: true,
    steps: [
      { notes: ["F3", "A3", "C4"], duration: 1.4 },
      { notes: ["C4", "E4", "G4"], duration: 1.4 },
      { notes: ["D4", "F4", "A4"], duration: 1.4 },
      { notes: ["G3", "B3", "D4"], duration: 1.4 }
    ]
  },
  zenGarden: {
    name: "Zen Garden",
    description: "Slow, minimal ambient loop — bought in the Shop.",
    wave: "sine",
    attack: 0.8,
    shopItem: true,
    steps: [
      { notes: ["C4"], duration: 3.5 },
      { notes: ["G3"], duration: 3.5 },
      { notes: ["A3"], duration: 3.5 },
      { notes: ["E3"], duration: 3.5 }
    ]
  }
};

const MusicPlayer = {
  ctx: null,
  gainNode: null,
  currentTrackId: null,
  playToken: 0,
  volume: 0.5,

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) throw new Error("Web Audio API not available in this environment");
      this.ctx = new AudioCtx();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = this.volume;
      this.gainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
  },

  setVolume(v) {
    this.volume = v;
    if (this.gainNode) this.gainNode.gain.value = v;
  },

  stop() {
    this.currentTrackId = null;
    this.playToken++; // invalidates any pending scheduled notes
  },

  play(trackId) {
    this.stop();
    if (!trackId || trackId === "off" || !MUSIC_TRACKS[trackId]) return;
    this.ensureContext();
    this.currentTrackId = trackId;
    const myToken = this.playToken;
    this._playStepLoop(MUSIC_TRACKS[trackId], 0, myToken);
  },

  _playStepLoop(track, stepIndex, myToken) {
    if (myToken !== this.playToken) return; // stopped or switched since this was scheduled
    const step = track.steps[stepIndex % track.steps.length];
    const dur = step.duration;
    const attack = track.attack || 0.02;

    // Play every note in this step's chord simultaneously — this is
    // what makes it sound like real harmony, not one note at a time.
    step.notes.forEach(noteName => {
      const freq = NOTE_FREQ[noteName];
      if (!freq) return;

      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      osc.type = track.wave;
      osc.frequency.value = freq;

      const now = this.ctx.currentTime;
      noteGain.gain.setValueAtTime(0, now);
      noteGain.gain.linearRampToValueAtTime(1 / step.notes.length, now + attack);
      noteGain.gain.linearRampToValueAtTime(0, now + dur * 0.95);

      osc.connect(noteGain);
      noteGain.connect(this.gainNode);
      osc.start(now);
      osc.stop(now + dur);
    });

    setTimeout(() => {
      this._playStepLoop(track, stepIndex + 1, myToken);
    }, dur * 1000);
  }
};

// Resume a previously-picked track on the next click anywhere, since
// browsers require a user gesture before audio can start. Defaults to
// Night Owl at 50% volume for anyone who hasn't chosen a preference —
// see app.js's login flow for the more precise trigger tied directly
// to signing in, which this is a fallback for.
function initMusicAutoResume() {
  let saved = "nightOwl";
  try { saved = localStorage.getItem("bqMusic") || "nightOwl"; } catch (e) {}
  let savedVolume = 0.5;
  try { savedVolume = parseFloat(localStorage.getItem("bqMusicVolume")) || 0.5; } catch (e) {}
  MusicPlayer.volume = savedVolume;

  if (saved !== "off") {
    document.addEventListener("click", function resumeOnce() {
      document.removeEventListener("click", resumeOnce);
      MusicPlayer.play(saved);
    }, { once: true });
  }
}
initMusicAutoResume();
