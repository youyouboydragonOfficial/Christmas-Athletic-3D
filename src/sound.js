// sound.js - 100% Reliable Classic Jingle Bells BGM & Instant Seamless Loop + Sound Effects

class SoundManager {
  constructor() {
    this.audioCtx = null;
    this.isMuted = false;
    this.bgmVolume = 0.72;
    this.sfxVolume = 0.82;
    this.currentTrack = 'classic';
    this.tracks = {
      classic: 'assets/audio/jingle_bells_classic.wav',
      fast: 'assets/audio/jingle_bells_fast.mp3',
      user_fast: 'assets/audio/christmas_fast.mp3',
      calm: 'assets/audio/jingle_bells_calm.mp3'
    };
    this.bgmEl = null;
    this.initialized = false;
    this.isPlaying = false;
  }

  init() {
    if (this.initialized) return;

    let el = document.getElementById('bgm-audio');
    if (!el) {
      el = document.createElement('audio');
      el.id = 'bgm-audio';
      el.loop = true;
      el.preload = 'auto';
      document.body.appendChild(el);
    }
    this.bgmEl = el;
    this.bgmEl.src = this.tracks[this.currentTrack];
    this.bgmEl.volume = this.isMuted ? 0 : this.bgmVolume;

    // Instant gapless loop
    this.bgmEl.addEventListener('timeupdate', () => {
      if (this.bgmEl.duration > 0 && this.bgmEl.currentTime >= this.bgmEl.duration - 0.06) {
        this.bgmEl.currentTime = 0;
        if (this.bgmEl.paused && !this.isMuted) {
          this.bgmEl.play().catch(() => {});
        }
      }
    });
    this.bgmEl.addEventListener('ended', () => {
      this.bgmEl.currentTime = 0;
      if (!this.isMuted) {
        this.bgmEl.play().catch(() => {});
      }
    });

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    } catch (e) {}

    this.initialized = true;
  }

  playBGM() {
    this.init();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    if (this.bgmEl) {
      this.bgmEl.volume = this.isMuted ? 0 : this.bgmVolume;
      if (this.bgmEl.paused) {
        const playPromise = this.bgmEl.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            this.isPlaying = true;
          }).catch(() => {});
        }
      }
    }
  }

  stopBGM() {
    if (this.bgmEl) {
      this.bgmEl.pause();
      this.isPlaying = false;
    }
  }

  switchTrack(trackName) {
    if (this.tracks[trackName]) {
      this.currentTrack = trackName;
      if (this.bgmEl) {
        this.bgmEl.src = this.tracks[trackName];
        this.bgmEl.currentTime = 0;
        this.playBGM();
      }
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.bgmEl) {
      this.bgmEl.volume = muted ? 0 : this.bgmVolume;
      if (!muted && this.bgmEl.paused) {
        this.playBGM();
      }
    }
  }

  // --- Synthesized Sound Effects ---

  playJump() {
    if (this.isMuted || !this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      const t = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(380, t);
      osc.frequency.exponentialRampToValueAtTime(760, t + 0.10);

      gain.gain.setValueAtTime(0.24 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.11);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
    } catch (e) {}
  }

  playLand() {
    if (this.isMuted || !this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      const t = this.audioCtx.currentTime;
      const bufferSize = this.audioCtx.sampleRate * 0.05;
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.28;

      const noise = this.audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, t);
      filter.frequency.linearRampToValueAtTime(80, t + 0.05);

      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.22 * this.sfxVolume, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.05);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);
      noise.start(t);
    } catch (e) {}
  }

  playBounce() {
    if (this.isMuted || !this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      const t = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, t);
      osc.frequency.exponentialRampToValueAtTime(980, t + 0.14);
      osc.frequency.exponentialRampToValueAtTime(680, t + 0.26);

      gain.gain.setValueAtTime(0.38 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.29);
    } catch (e) {}
  }

  playBell() {
    if (this.isMuted || !this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      const t = this.audioCtx.currentTime;
      [2093, 2793, 3520].forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        const amp = (0.22 / (idx + 1)) * this.sfxVolume;
        gain.gain.setValueAtTime(amp, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.40);
      });
    } catch (e) {}
  }

  playFall() {
    if (this.isMuted || !this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      const t = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(75, t + 0.42);

      gain.gain.setValueAtTime(0.32 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.44);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.45);
    } catch (e) {}
  }

  playClear() {
    if (this.isMuted || !this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      const t = this.audioCtx.currentTime;
      const notes = [
        { freq: 659.25, time: 0.00, dur: 0.10 }, // E5
        { freq: 659.25, time: 0.12, dur: 0.10 }, // E5
        { freq: 659.25, time: 0.24, dur: 0.20 }, // E5
        { freq: 659.25, time: 0.48, dur: 0.10 }, // E5
        { freq: 659.25, time: 0.60, dur: 0.10 }, // E5
        { freq: 659.25, time: 0.72, dur: 0.20 }, // E5
        { freq: 659.25, time: 0.96, dur: 0.11 }, // E5
        { freq: 783.99, time: 1.08, dur: 0.11 }, // G5
        { freq: 523.25, time: 1.20, dur: 0.14 }, // C5
        { freq: 587.33, time: 1.36, dur: 0.14 }, // D5
        { freq: 659.25, time: 1.52, dur: 0.45 }  // E5
      ];

      notes.forEach(n => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.freq, t + n.time);
        gain.gain.setValueAtTime(0.36 * this.sfxVolume, t + n.time);
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

// Ensure BGM starts on any user interaction anywhere
['click', 'pointerdown', 'mousedown', 'keydown'].forEach(evt => {
  window.addEventListener(evt, () => {
    if (window.soundManager && (!window.soundManager.isPlaying && !window.soundManager.isMuted)) {
      window.soundManager.playBGM();
    }
  }, { passive: true });
});
