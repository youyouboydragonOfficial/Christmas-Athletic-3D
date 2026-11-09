// sound.js - BGM and Synthesized Sound Effects for Christmas Athletic 3D

class SoundManager {
  constructor() {
    this.audioCtx = null;
    this.bgmAudio = null;
    this.isMuted = false;
    this.bgmVolume = 0.55;
    this.sfxVolume = 0.7;
    this.currentTrack = 'upbeat'; // 'upbeat' or 'calm'
    this.tracks = {
      upbeat: 'assets/audio/jingle_bells.mp3',
      calm: 'assets/audio/jingle_bells_calm.mp3'
    };
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
      this.initBGM();
      this.initialized = true;
    } catch (e) {
      console.warn("AudioContext init error:", e);
    }
  }

  initBGM() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
    this.bgmAudio = new Audio(this.tracks[this.currentTrack]);
    this.bgmAudio.loop = true;
    this.bgmAudio.volume = this.isMuted ? 0 : this.bgmVolume;
  }

  playBGM() {
    this.init();
    if (!this.bgmAudio) return;
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    this.bgmAudio.play().catch(err => {
      console.log("BGM autoplay waiting for user interaction:", err);
    });
  }

  pauseBGM() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
  }

  switchTrack(trackName) {
    if (this.tracks[trackName] && this.currentTrack !== trackName) {
      this.currentTrack = trackName;
      const isPlaying = this.bgmAudio && !this.bgmAudio.paused;
      this.initBGM();
      if (isPlaying) {
        this.playBGM();
      }
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.bgmAudio) {
      this.bgmAudio.volume = muted ? 0 : this.bgmVolume;
    }
  }

  setBgmVolume(val) {
    this.bgmVolume = Math.max(0, Math.min(1, val));
    if (this.bgmAudio && !this.isMuted) {
      this.bgmAudio.volume = this.bgmVolume;
    }
  }

  setSfxVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
  }

  // ---- Synthesized Sound Effects (No external audio latency) ----
  
  // High-pitched crystal jump sound
  playJump() {
    if (this.isMuted || !this.audioCtx) return;
    try {
      const t = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(700, t + 0.12);

      gain.gain.setValueAtTime(0.25 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(t);
      osc.stop(t + 0.15);
    } catch (e) {}
  }

  // Soft snow crunch landing sound
  playLand() {
    if (this.isMuted || !this.audioCtx) return;
    try {
      const t = this.audioCtx.currentTime;
      const bufferSize = this.audioCtx.sampleRate * 0.08;
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.4;
      }

      const whiteNoise = this.audioCtx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, t);
      filter.frequency.linearRampToValueAtTime(100, t + 0.08);

      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.3 * this.sfxVolume, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.08);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);

      whiteNoise.start(t);
    } catch (e) {}
  }

  // Present trampoline spring bounce sound
  playBounce() {
    if (this.isMuted || !this.audioCtx) return;
    try {
      const t = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.15);
      osc.frequency.exponentialRampToValueAtTime(600, t + 0.3);

      gain.gain.setValueAtTime(0.4 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(t);
      osc.stop(t + 0.36);
    } catch (e) {}
  }

  // Silver Christmas Bell jingle sound (harmonic chimes)
  playBell() {
    if (this.isMuted || !this.audioCtx) return;
    try {
      const t = this.audioCtx.currentTime;
      const freqs = [1760, 2637, 3520]; // A6, E7, A7 bright harmonics
      
      freqs.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        const amp = (0.2 / (idx + 1)) * this.sfxVolume;
        gain.gain.setValueAtTime(amp, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(t);
        osc.stop(t + 0.5);
      });
    } catch (e) {}
  }

  // Falling / defeat sound
  playFall() {
    if (this.isMuted || !this.audioCtx) return;
    try {
      const t = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.4);

      gain.gain.setValueAtTime(0.25 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.45);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(t);
      osc.stop(t + 0.46);
    } catch (e) {}
  }

  // Stage clear Christmas fanfare
  playClear() {
    if (this.isMuted || !this.audioCtx) return;
    try {
      const t = this.audioCtx.currentTime;
      // Notes of Jingle bells opening: E5, E5, E5, E5, E5, E5, E5, G5, C5, D5, E5
      const notes = [
        { freq: 659.25, time: 0.00, dur: 0.12 }, // E5
        { freq: 659.25, time: 0.14, dur: 0.12 }, // E5
        { freq: 659.25, time: 0.28, dur: 0.24 }, // E5
        { freq: 659.25, time: 0.56, dur: 0.12 }, // E5
        { freq: 659.25, time: 0.70, dur: 0.12 }, // E5
        { freq: 659.25, time: 0.84, dur: 0.24 }, // E5
        { freq: 659.25, time: 1.12, dur: 0.14 }, // E5
        { freq: 783.99, time: 1.28, dur: 0.14 }, // G5
        { freq: 523.25, time: 1.44, dur: 0.18 }, // C5
        { freq: 587.33, time: 1.64, dur: 0.18 }, // D5
        { freq: 659.25, time: 1.84, dur: 0.55 }, // E5
      ];

      notes.forEach(n => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.freq, t + n.time);

        gain.gain.setValueAtTime(0.35 * this.sfxVolume, t + n.time);
        gain.gain.exponentialRampToValueAtTime(0.01, t + n.time + n.dur);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(t + n.time);
        osc.stop(t + n.time + n.dur + 0.02);
      });
    } catch (e) {}
  }
}

window.soundManager = new SoundManager();
