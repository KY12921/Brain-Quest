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
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25
};

const MUSIC_TRACKS = {
  lofi: {
    name: "Lo-Fi Study",
    description: "Warm, mellow chords — classic lo-fi study vibe.",
    wave: "triangle",
    noteDuration: 0.9,
    notes: ["C4", "E4", "G4", "E4", "A4", "G4", "E4", "D4"]
  },
  deepFocus: {
    name: "Deep Focus",
    description: "Slow and sparse — for silent, distraction-free focus.",
    wave: "sine",
    noteDuration: 2.0,
    notes: ["C4", "G4", "E4", "A4"]
  },
  rainyDay: {
    name: "Rainy Day",
    description: "Soft and reflective — a gentle backdrop for reading.",
    wave: "sine",
    noteDuration: 1.1,
    notes: ["A4", "C5", "E5", "D5", "C5", "A4"]
  }
};

const MusicPlayer = {
  ctx: null,
  gainNode: null,
  currentTrackId: null,
  playToken: 0,
  volume: 0.15,

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
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
    this._playNoteLoop(MUSIC_TRACKS[trackId], 0, myToken);
  },

  _playNoteLoop(track, noteIndex, myToken) {
    if (myToken !== this.playToken) return; // stopped or switched since this was scheduled
    const freq = NOTE_FREQ[track.notes[noteIndex % track.notes.length]];
    const dur = track.noteDuration;

    const osc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();
    osc.type = track.wave;
    osc.frequency.value = freq;

    const now = this.ctx.currentTime;
    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(1, now + 0.02);
    noteGain.gain.linearRampToValueAtTime(0, now + dur * 0.95);

    osc.connect(noteGain);
    noteGain.connect(this.gainNode);
    osc.start(now);
    osc.stop(now + dur);

    setTimeout(() => {
      this._playNoteLoop(track, noteIndex + 1, myToken);
    }, dur * 1000);
  }
};

// Resume a previously-picked track on the next click anywhere, since
// browsers require a user gesture before audio can start.
function initMusicAutoResume() {
  let saved = "off";
  try { saved = localStorage.getItem("studyBossMusic") || "off"; } catch (e) {}
  let savedVolume = 0.15;
  try { savedVolume = parseFloat(localStorage.getItem("studyBossMusicVolume")) || 0.15; } catch (e) {}
  MusicPlayer.volume = savedVolume;

  if (saved !== "off") {
    document.addEventListener("click", function resumeOnce() {
      document.removeEventListener("click", resumeOnce);
      MusicPlayer.play(saved);
    }, { once: true });
  }
}
initMusicAutoResume();
