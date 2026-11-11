// game.js - Master Controller for Christmas Athletic 3D (Matching Reference Image Scene, HUD & 30-Player Race)

class Game {
  constructor() {
    this.currentStageNum = 1;
    this.maxStages = 1000;
    this.timeElapsed = 0;
    this.snowflakesCollected = 12; // Starts at 12 like "❄️ × 12" in the reference image, increments as you collect!
    this.isCleared = false;
    this.showGuideLabels = true;
    this.isDraggingMouse = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.aiChallengers = [];
    this.labelElements = [];

    this.initThree();
    this.initSnowParticles();
    this.initFactories();
    this.bindEvents();

    this.loadStage(this.currentStageNum);
    this.lastFrameTime = performance.now();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initThree() {
    this.container = document.getElementById('game-container');
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x232952);
    this.scene.fog = new THREE.FogExp2(0x3b3d68, 0.0065);

    this.camera = new THREE.PerspectiveCamera(56, width / height, 0.1, 800);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Rich Twilight + Warm Festive Lighting
    this.hemiLight = new THREE.HemisphereLight(0xb8d0ff, 0x4a3b5c, 0.85);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xffe8cc, 1.35);
    this.sunLight.position.set(-45, 75, -30);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 260;
    const d = 75;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.scene.add(this.sunLight);
  }

  initSnowParticles() {
    const snowCount = 2600;
    const snowGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(snowCount * 3);
    const velocities = new Float32Array(snowCount * 3);

    for (let i = 0; i < snowCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 180;
      positions[i * 3 + 1] = Math.random() * 75;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 180;

      velocities[i * 3 + 0] = (Math.random() - 0.5) * 0.5;
      velocities[i * 3 + 1] = -(1.5 + Math.random() * 2.2);
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    }

    snowGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.snowVelocities = velocities;

    const snowMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.38,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.snowParticles = new THREE.Points(snowGeo, snowMat);
    this.scene.add(this.snowParticles);
  }

  initFactories() {
    this.gimmickFactory = new GimmickFactory(THREE);
    this.stageGenerator = new StageGenerator(THREE, this.gimmickFactory);
    this.player = new Player(THREE, this.scene);
  }

  loadStage(stageNum) {
    this.currentStageNum = Math.max(1, Math.min(this.maxStages, stageNum));
    this.isCleared = false;
    this.timeElapsed = 0;

    if (this.currentStageGroup) {
      this.scene.remove(this.currentStageGroup);
    }

    // Clear old AI challengers
    this.aiChallengers.forEach(ai => ai.dispose());
    this.aiChallengers = [];

    // Build stage
    this.stageData = this.stageGenerator.buildStage(this.currentStageNum);
    this.currentStageGroup = this.stageData.stageGroup;
    this.scene.add(this.currentStageGroup);

    // Apply Theme Sky & Fog
    const theme = this.stageData.info.theme;
    this.scene.background.setHex(theme.skyTop);
    this.scene.fog.color.setHex(theme.fog);
    this.sunLight.color.setHex(theme.light);

    // Reset Player
    this.player.reset(this.stageData.startPosition);

    // Spawn AI Challengers along the course (for the 30-player athletic race feel!)
    for (let i = 0; i < 12; i++) {
      const ai = new AIChallenger(THREE, this.scene, this.stageData.aiWaypoints, i);
      this.aiChallengers.push(ai);
    }

    // Build 3D Floating Guide Labels ("雪の足場", "巨大なプレゼント", "動く床")
    this.createGuideLabelDOM();

    this.setBannerText('REACH THE GOAL!');
    this.hideClearModal();
    this.updateHUD();
  }

  createGuideLabelDOM() {
    const container = document.getElementById('world-labels-container');
    container.innerHTML = '';
    this.labelElements = [];

    if (!this.stageData.guideLabels) return;
    this.stageData.guideLabels.forEach(lbl => {
      const el = document.createElement('div');
      el.className = 'world-floating-label';
      el.innerText = lbl.text;
      container.appendChild(el);
      this.labelElements.push({ el, worldPos: lbl.position });
    });
  }

  updateGuideLabels() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.labelElements.forEach(item => {
      if (!this.showGuideLabels) {
        item.el.style.display = 'none';
        return;
      }

      const proj = item.worldPos.clone().project(this.camera);
      const dist = this.camera.position.distanceTo(item.worldPos);

      if (proj.z > 1.0 || proj.z < -1.0 || dist > 65) {
        item.el.style.display = 'none';
      } else {
        const sx = (proj.x * 0.5 + 0.5) * w;
        const sy = (-proj.y * 0.5 + 0.5) * h;
        item.el.style.display = 'block';
        item.el.style.left = `${sx}px`;
        item.el.style.top = `${sy}px`;
      }
    });
  }

  setBannerText(txt, revertAfterMs = 0) {
    const banner = document.getElementById('center-banner-text');
    if (banner) {
      banner.innerText = txt;
    }
    if (revertAfterMs > 0) {
      clearTimeout(this.bannerTimeout);
      this.bannerTimeout = setTimeout(() => {
        if (!this.isCleared && banner) {
          banner.innerText = 'REACH THE GOAL!';
        }
      }, revertAfterMs);
    }
  }

  formatTimer(sec) {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    const cs = Math.floor((sec % 1) * 100);
    const mm = String(mins).padStart(2, '0');
    const ss = String(secs).padStart(2, '0');
    const cc = String(cs).padStart(2, '0');
    return `${mm}:${ss}.${cc}`;
  }

  updateHUD() {
    // Top Header Bar
    const stageEl = document.getElementById('hud-stage-name');
    if (stageEl) {
      stageEl.innerText = this.currentStageNum === 1
        ? 'STAGE: CHRISTMAS ATHLETIC'
        : `STAGE ${this.currentStageNum}: CHRISTMAS ATHLETIC`;
    }

    const timerEl = document.getElementById('hud-timer');
    if (timerEl) {
      timerEl.innerText = `TIMER: ${this.formatTimer(this.timeElapsed)}`;
    }

    // Active qualifiers count (starts 18/30 like the reference screenshot)
    const activeCount = 18;
    const playersEl = document.getElementById('hud-players');
    if (playersEl) {
      playersEl.innerText = `PLAYERS: ${activeCount}/30`;
    }

    // HP & Stamina Bars
    const hpFill = document.getElementById('hp-bar-fill');
    if (hpFill) {
      hpFill.style.width = `${Math.max(0, Math.min(100, this.player.hp))}%`;
    }
    const stamFill = document.getElementById('stamina-bar-fill');
    if (stamFill) {
      stamFill.style.width = `${Math.max(0, Math.min(100, this.player.stamina))}%`;
    }

    // Snowflake Counter
    const snowCountEl = document.getElementById('hud-snowflake-count');
    if (snowCountEl) {
      snowCountEl.innerText = `×${this.snowflakesCollected}`;
    }
  }

  showClearModal() {
    this.isCleared = true;
    this.setBannerText('🏆 STAGE CLEAR! 🏆');
    if (window.soundManager) {
      window.soundManager.playClear();
    }
    const modal = document.getElementById('clear-modal');
    document.getElementById('clear-stage-num').innerText = this.currentStageNum;
    document.getElementById('clear-time').innerText = this.formatTimer(this.timeElapsed);
    document.getElementById('clear-bells').innerText = `❄️ ×${this.snowflakesCollected}`;
    modal.classList.remove('hidden');

    if (this.autoNextTimer) clearTimeout(this.autoNextTimer);
    this.autoNextTimer = setTimeout(() => {
      this.loadStage(this.currentStageNum + 1);
    }, 2000);
  }

  hideClearModal() {
    const modal = document.getElementById('clear-modal');
    if (modal) modal.classList.add('hidden');
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });

    window.addEventListener('keydown', (e) => {
      if (window.soundManager && !window.soundManager.initialized) {
        window.soundManager.playBGM();
      }

      if (e.code === 'KeyW' || e.code === 'ArrowUp') this.player.input.forward = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') this.player.input.backward = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.player.input.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.player.input.right = true;

      if (e.code === 'Space') {
        this.player.input.jump = true;
        this.player.triggerJump();
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyB') {
        this.player.input.dash = true;
      }
      if (e.code === 'KeyC' || e.code === 'KeyE') {
        this.player.input.climb = true;
        this.player.input.dash = true;
      }
      if (e.code === 'KeyQ') {
        this.player.cameraYaw += 0.08;
      }
      if (e.code === 'KeyR') {
        this.player.respawnAtCheckpoint();
        this.setBannerText('RESPAWNED AT CHECKPOINT!', 1800);
      }
      if (e.code === 'KeyG') {
        this.showGuideLabels = !this.showGuideLabels;
      }
      if (e.code === 'KeyM') {
        const isMuted = !window.soundManager.isMuted;
        window.soundManager.setMuted(isMuted);
      }
      if (e.code === 'KeyT') {
        const tracks = ['fast', 'user_fast', 'calm'];
        const nextIdx = (tracks.indexOf(window.soundManager.currentTrack) + 1) % tracks.length;
        window.soundManager.switchTrack(tracks[nextIdx]);
      }
      if (e.code === 'Escape' || e.code === 'Tab') {
        e.preventDefault();
        this.toggleStageSelectModal();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') this.player.input.forward = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') this.player.input.backward = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.player.input.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.player.input.right = false;
      if (e.code === 'Space') this.player.input.jump = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyB') {
        this.player.input.dash = false;
      }
      if (e.code === 'KeyC' || e.code === 'KeyE') {
        this.player.input.climb = false;
        this.player.input.dash = false;
      }
    });

    window.addEventListener('mousedown', (e) => {
      if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
        this.isDraggingMouse = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDraggingMouse) {
        const dx = e.clientX - this.lastMouseX;
        const dy = e.clientY - this.lastMouseY;
        this.player.cameraYaw -= dx * 0.0055;
        this.player.cameraPitch = Math.max(0.08, Math.min(1.15, this.player.cameraPitch + dy * 0.004));
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDraggingMouse = false;
    });

    window.addEventListener('wheel', (e) => {
      this.player.cameraDistance = Math.max(4.0, Math.min(16.0, this.player.cameraDistance + e.deltaY * 0.006));
    });

    // Buttons
    const btnNext = document.getElementById('btn-next-stage');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        if (this.autoNextTimer) clearTimeout(this.autoNextTimer);
        this.loadStage(this.currentStageNum + 1);
      });
    }

    const btnGuide = document.getElementById('btn-open-guide');
    if (btnGuide) {
      btnGuide.addEventListener('click', () => {
        this.toggleStageSelectModal();
      });
    }

    const btnCloseSelect = document.getElementById('btn-close-select');
    if (btnCloseSelect) {
      btnCloseSelect.addEventListener('click', () => {
        this.toggleStageSelectModal();
      });
    }

    const btnJumpStage = document.getElementById('btn-jump-stage');
    if (btnJumpStage) {
      btnJumpStage.addEventListener('click', () => {
        const inputVal = parseInt(document.getElementById('input-stage-num').value, 10);
        if (!isNaN(inputVal) && inputVal >= 1 && inputVal <= 1000) {
          this.loadStage(inputVal);
          this.toggleStageSelectModal();
        }
      });
    }
  }

  toggleStageSelectModal() {
    const modal = document.getElementById('stage-select-modal');
    modal.classList.toggle('hidden');
    if (!modal.classList.contains('hidden')) {
      this.populateStageGrid();
    }
  }

  populateStageGrid() {
    const grid = document.getElementById('stage-grid');
    grid.innerHTML = '';
    const milestones = [1, 2, 3, 5, 10, 25, 50, 100, 250, 500, 750, 1000];
    milestones.forEach(s => {
      const btn = document.createElement('button');
      btn.className = 'stage-btn' + (s === this.currentStageNum ? ' active' : '');
      btn.innerText = `STAGE ${s}`;
      btn.addEventListener('click', () => {
        this.loadStage(s);
        this.toggleStageSelectModal();
      });
      grid.appendChild(btn);
    });
  }

  updateGimmicks(delta, time) {
    // 1. Moving Candy Cane Platforms ("動く床")
    this.stageData.movingObjects.forEach(plat => {
      const u = plat.userData;
      u.phase += delta * u.speed;
      const prevX = plat.position.x;
      const prevY = plat.position.y;
      const prevZ = plat.position.z;

      const offset = Math.sin(u.phase);
      plat.position.x = u.origin.x + u.travelVector.x * offset;
      plat.position.y = u.origin.y + u.travelVector.y * offset;
      plat.position.z = u.origin.z + u.travelVector.z * offset;

      u.deltaPos.set(
        plat.position.x - prevX,
        plat.position.y - prevY,
        plat.position.z - prevZ
      );
    });

    // 2. Rotate Snowflake Pads gently
    this.stageData.platforms.forEach(plat => {
      if (plat.userData.type === GimmickType.SNOWFLAKE_PAD && plat.userData.flakeGroup) {
        plat.userData.flakeGroup.rotation.y += 0.45 * delta;
      }
    });

    // 3. Spinning Candy Hazards
    this.stageData.hazardObjects.forEach(haz => {
      haz.rotation.y += haz.userData.speed * delta;
      const d = this.player.position.distanceTo(haz.position);
      if (d < haz.userData.length * 0.45 && Math.abs(this.player.position.y - haz.position.y) < 1.2) {
        if (this.player.invincibleTimer <= 0) {
          this.player.hp = Math.max(10, this.player.hp - 20);
          this.player.velocity.y = 8.5;
          this.player.invincibleTimer = 1.0;
          if (window.soundManager) window.soundManager.playFall();
        }
      }
    });

    // 4. Collectible Coins & Snowflakes
    this.stageData.collectibles.forEach(item => {
      if (!item.userData.collected) {
        item.rotation.y += 2.6 * delta;
        item.position.y = item.userData.baseY + Math.sin(time * 4.0 + item.position.x) * 0.22;

        if (this.player.position.distanceTo(item.position) < 1.65) {
          item.userData.collected = true;
          item.visible = false;
          this.snowflakesCollected++;
          this.player.stamina = Math.min(100, this.player.stamina + 15);
          if (window.soundManager) window.soundManager.playBell();
        }
      }
    });

    // 5. Update Goal Archway & Grand Christmas Tree Lights
    if (this.stageData.goalArch && this.stageData.goalArch.userData.update) {
      this.stageData.goalArch.userData.update(delta, time);
    }
    if (this.stageData.goalTree && this.stageData.goalTree.userData.update) {
      this.stageData.goalTree.userData.update(delta, time);
    }

    // 6. Update AI Challengers
    this.aiChallengers.forEach(ai => ai.update(delta));
  }

  updateSnow(delta) {
    if (!this.snowParticles) return;
    const pos = this.snowParticles.geometry.attributes.position.array;
    const vel = this.snowVelocities;
    const pPos = this.player.position;

    for (let i = 0; i < vel.length / 3; i++) {
      pos[i * 3 + 0] += vel[i * 3 + 0];
      pos[i * 3 + 1] += vel[i * 3 + 1];
      pos[i * 3 + 2] += vel[i * 3 + 2];

      if (pos[i * 3 + 1] < pPos.y - 12) {
        pos[i * 3 + 1] = pPos.y + 42 + Math.random() * 18;
        pos[i * 3 + 0] = pPos.x + (Math.random() - 0.5) * 140;
        pos[i * 3 + 2] = pPos.z + (Math.random() - 0.5) * 140;
      }
    }
    this.snowParticles.geometry.attributes.position.needsUpdate = true;
  }

  animate(now) {
    requestAnimationFrame(this.animate);

    const rawDelta = (now - this.lastFrameTime) * 0.001;
    this.lastFrameTime = now;
    const delta = Math.min(0.033, Math.max(0.001, rawDelta || 0.016));
    const time = now * 0.001;

    if (!this.isCleared) {
      this.timeElapsed += delta;
    }

    this.updateGimmicks(delta, time);

    this.player.update(delta, this.stageData, () => {
      this.setBannerText('✨ CHECKPOINT REACHED! ✨', 2200);
    });

    // Goal Check (Reaching the Hilltop GOAL! Archway or Christmas Tree)
    if (!this.isCleared) {
      const distToGoal = this.player.position.distanceTo(this.stageData.goalPosition);
      if (distToGoal < 7.5) {
        this.showClearModal();
      }
    }

    this.player.updateCamera(this.camera);
    this.updateSnow(delta);
    this.updateGuideLabels();
    this.updateHUD();

    this.sunLight.position.set(
      this.player.position.x - 35,
      this.player.position.y + 70,
      this.player.position.z - 25
    );
    this.sunLight.target.position.copy(this.player.position);
    this.sunLight.target.updateMatrixWorld();

    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
