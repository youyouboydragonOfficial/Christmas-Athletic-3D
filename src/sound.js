// sound.js - 8 Festive Instrumental Christmas BGM Tracks + Instant Seamless Loop & Sound Effects

class SoundManager {
  constructor() {
    this.audioCtx = null;
    this.isMuted = false;
    this.bgmVolume = 0.72;
    this.sfxVolume = 0.82;
    this.trackIndex = 0;

    this.playlist = [
      { id: 'classic', title: 'ジングルベル (王道ソリの鈴)', src: 'assets/audio/jingle_bells_classic.wav' },
      { id: 'santa', title: 'サンタのソリ遊び (Housetop)', src: 'assets/audio/santa_sleigh_ride.wav' },
      { id: 'deck', title: 'ひいらぎかざろう (Deck the Halls)', src: 'assets/audio/deck_the_halls.wav' },
      { id: 'wish', title: 'メリー・クリスマス (We Wish You)', src: 'assets/audio/we_wish_you_merry_christmas.wav' },
      { id: 'joy', title: 'もろびとこぞりて (Joy to the World)', src: 'assets/audio/joy_to_the_world.wav' },
      { id: 'fast', title: 'ジングルベル (アップビートバンド)', src: 'assets/audio/jingle_bells_fast.mp3' },
      { id: 'user_fast', title: 'クリスマス・ブラスマーチ', src: 'assets/audio/christmas_fast.mp3' },
      { id: 'calm', title: '聖夜のジングルベル (Calm)', src: 'assets/audio/jingle_bells_calm.mp3' }
    ];

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
    this.bgmEl.src = this.playlist[this.trackIndex].src;
    this.bgmEl.volume = this.isMuted ? 0 : this.bgmVolume;

    // Instant gapless loop when song finishes
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
    this.updateTrackButtonLabel();
  }

  getCurrentTrackInfo() {
    return this.playlist[this.trackIndex];
  }

  updateTrackButtonLabel() {
    const btn = document.getElementById('btn-bgm-switch');
    if (btn) {
      const info = this.getCurrentTrackInfo();
      btn.innerText = `🔔 BGM [${this.trackIndex + 1}/${this.playlist.length}]: ${info.title}`;
    }
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

  nextTrack() {
    this.init();
    this.trackIndex = (this.trackIndex + 1) % this.playlist.length;
    if (this.bgmEl) {
      this.bgmEl.src = this.playlist[this.trackIndex].src;
      this.bgmEl.currentTime = 0;
      this.playBGM();
    }
    this.updateTrackButtonLabel();
  }

  setTrackByStage(stageNum) {
    this.init();
    const newIdx = (stageNum - 1) % this.playlist.length;
    if (newIdx !== this.trackIndex) {
      this.trackIndex = newIdx;
      if (this.bgmEl) {
        this.bgmEl.src = this.playlist[this.trackIndex].src;
        this.bgmEl.currentTime = 0;
        if (this.isPlaying && !this.isMuted) {
          this.bgmEl.play().catch(() => {});
        }
      }
    }
    this.updateTrackButtonLabel();
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
        { freq: 659.25, time: 0.00, dur: 0.10 },
        { freq: 659.25, time: 0.12, dur: 0.10 },
        { freq: 659.25, time: 0.24, dur: 0.20 },
        { freq: 659.25, time: 0.48, dur: 0.10 },
        { freq: 659.25, time: 0.60, dur: 0.10 },
        { freq: 659.25, time: 0.72, dur: 0.20 },
        { freq: 659.25, time: 0.96, dur: 0.11 },
        { freq: 783.99, time: 1.08, dur: 0.11 },
        { freq: 523.25, time: 1.20, dur: 0.14 },
        { freq: 587.33, time: 1.36, dur: 0.14 },
        { freq: 659.25, time: 1.52, dur: 0.45 }
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

['click', 'pointerdown', 'mousedown', 'keydown'].forEach(evt => {
  window.addEventListener(evt, () => {
    if (window.soundManager && (!window.soundManager.isPlaying && !window.soundManager.isMuted)) {
      window.soundManager.playBGM();
    }
  }, { passive: true });
});
