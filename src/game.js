// game.js - Master Game Controller: Scene, Lights, Snow Weather, Game Loop, UI Interaction

class Game {
  constructor() {
    this.currentStageNum = 1;
    this.maxStages = 1000;
    this.timeElapsed = 0;
    this.bellsCollected = 0;
    this.totalBellsInStage = 0;
    this.isCleared = false;
    this.isPaused = false;
    this.isDraggingMouse = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    this.initThree();
    this.initSnowParticles();
    this.initFactories();
    this.bindEvents();

    this.loadStage(this.currentStageNum);
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initThree() {
    this.container = document.getElementById('game-container');
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0e1726);
    this.scene.fog = new THREE.FogExp2(0x132238, 0.012);

    // Camera
    this.camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Lights
    this.ambientLight = new THREE.AmbientLight(0xddeeff, 0.55);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xfff8ee, 1.25);
    this.sunLight.position.set(40, 80, 50);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 250;
    const shadowD = 60;
    this.sunLight.shadow.camera.left = -shadowD;
    this.sunLight.shadow.camera.right = shadowD;
    this.sunLight.shadow.camera.top = shadowD;
    this.sunLight.shadow.camera.bottom = -shadowD;
    this.scene.add(this.sunLight);

    // Subtle blue moon/sky rim light
    this.rimLight = new THREE.DirectionalLight(0x5599ee, 0.4);
    this.rimLight.position.set(-40, 30, -50);
    this.scene.add(this.rimLight);
  }

  // Beautiful Falling Snowflakes Particle System
  initSnowParticles() {
    const snowCount = 2500;
    const snowGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(snowCount * 3);
    const velocities = new Float32Array(snowCount * 3);

    for (let i = 0; i < snowCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 160;
      positions[i * 3 + 1] = Math.random() * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 160;

      velocities[i * 3 + 0] = (Math.random() - 0.5) * 0.4;
      velocities[i * 3 + 1] = -(1.2 + Math.random() * 2.2);
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
    }

    snowGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.snowVelocities = velocities;

    const snowMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.35,
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
    this.bellsCollected = 0;

    // Clear old stage group
    if (this.currentStageGroup) {
      this.scene.remove(this.currentStageGroup);
    }

    // Build new stage
    this.stageData = this.stageGenerator.buildStage(this.currentStageNum);
    this.currentStageGroup = this.stageData.stageGroup;
    this.scene.add(this.currentStageGroup);

    this.totalBellsInStage = this.stageData.collectibleBells.length;

    // Apply Biome Atmosphere
    const biome = this.stageData.info.biome;
    this.scene.background.setHex(biome.sky);
    this.scene.fog.color.setHex(biome.fog);
    this.sunLight.color.setHex(biome.light);

    // Reset player
    this.player.reset(this.stageData.startPosition);

    // Update HUD
    this.updateHUD();
    this.hideClearModal();

    // Start BGM on user start
    if (window.soundManager) {
      window.soundManager.playBGM();
    }
  }

  updateHUD() {
    const info = this.stageData.info;
    document.getElementById('hud-stage-title').innerText = info.title;
    document.getElementById('hud-gimmick').innerText = info.featuredGimmicks;
    document.getElementById('hud-bells').innerText = `${this.bellsCollected} / ${this.totalBellsInStage}`;
    document.getElementById('hud-timer').innerText = this.timeElapsed.toFixed(1) + 's';
  }

  showClearModal() {
    this.isCleared = true;
    if (window.soundManager) {
      window.soundManager.playClear();
    }
    const modal = document.getElementById('clear-modal');
    document.getElementById('clear-stage-num').innerText = this.currentStageNum;
    document.getElementById('clear-time').innerText = this.timeElapsed.toFixed(2) + 's';
    document.getElementById('clear-bells').innerText = `${this.bellsCollected} / ${this.totalBellsInStage}`;
    modal.classList.remove('hidden');
  }

  hideClearModal() {
    const modal = document.getElementById('clear-modal');
    modal.classList.add('hidden');
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      // Audio start on first keypress
      if (window.soundManager && !window.soundManager.initialized) {
        window.soundManager.playBGM();
      }

      if (e.code === 'KeyW' || e.code === 'ArrowUp') this.player.input.forward = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') this.player.input.backward = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.player.input.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.player.input.right = true;
      if (e.code === 'Space') {
        this.player.input.jump = true;
        this.player.jumpBufferTimer = 0.16; // Jump buffering
      }
      if (e.code === 'KeyR') {
        // Quick Retry
        this.player.reset(this.stageData.startPosition);
      }
      if (e.code === 'KeyM') {
        // Toggle Mute
        const isMuted = !window.soundManager.isMuted;
        window.soundManager.setMuted(isMuted);
        document.getElementById('btn-mute').innerText = isMuted ? '🔇 BGM OFF' : '🎵 BGM ON';
      }
      if (e.code === 'KeyT') {
        // Switch BGM Track
        const nextTrack = window.soundManager.currentTrack === 'upbeat' ? 'calm' : 'upbeat';
        window.soundManager.switchTrack(nextTrack);
      }
      if (e.code === 'Escape') {
        this.toggleStageSelectModal();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') this.player.input.forward = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') this.player.input.backward = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.player.input.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.player.input.right = false;
      if (e.code === 'Space') this.player.input.jump = false;
    });

    // Mouse drag for camera orbit
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
        this.player.cameraPitch = Math.max(0.08, Math.min(1.2, this.player.cameraPitch + dy * 0.004));
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDraggingMouse = false;
    });

    window.addEventListener('wheel', (e) => {
      this.player.cameraDistance = Math.max(3.5, Math.min(16.0, this.player.cameraDistance + e.deltaY * 0.006));
    });

    // UI Buttons
    document.getElementById('btn-next-stage').addEventListener('click', () => {
      this.loadStage(this.currentStageNum + 1);
    });
    document.getElementById('btn-retry').addEventListener('click', () => {
      this.loadStage(this.currentStageNum);
    });
    document.getElementById('btn-select-stage').addEventListener('click', () => {
      this.toggleStageSelectModal();
    });
    document.getElementById('btn-close-select').addEventListener('click', () => {
      this.toggleStageSelectModal();
    });
    document.getElementById('btn-jump-stage').addEventListener('click', () => {
      const inputVal = parseInt(document.getElementById('input-stage-num').value, 10);
      if (!isNaN(inputVal) && inputVal >= 1 && inputVal <= 1000) {
        this.loadStage(inputVal);
        this.toggleStageSelectModal();
      }
    });

    document.getElementById('btn-mute').addEventListener('click', () => {
      const isMuted = !window.soundManager.isMuted;
      window.soundManager.setMuted(isMuted);
      document.getElementById('btn-mute').innerText = isMuted ? '🔇 BGM OFF' : '🎵 BGM ON';
    });

    document.getElementById('btn-track').addEventListener('click', () => {
      const nextTrack = window.soundManager.currentTrack === 'upbeat' ? 'calm' : 'upbeat';
      window.soundManager.switchTrack(nextTrack);
      document.getElementById('btn-track').innerText = nextTrack === 'upbeat' ? '🎷 Upbeat Band' : '🔔 Gentle Jingle';
    });
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
    // Show quick stage jump presets (1, 10, 50, 100, 200, 500, 1000, etc.)
    const milestones = [1, 2, 5, 10, 25, 50, 100, 200, 350, 500, 750, 1000];
    milestones.forEach(s => {
      const btn = document.createElement('button');
      btn.className = 'stage-btn' + (s === this.currentStageNum ? ' active' : '');
      btn.innerText = `Stage ${s}`;
      btn.addEventListener('click', () => {
        this.loadStage(s);
        this.toggleStageSelectModal();
      });
      grid.appendChild(btn);
    });
  }

  // Update dynamic gimmicks
  updateGimmicks(delta, time) {
    // 1. Moving Platforms
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

    // 2. Crumble Platforms
    this.stageData.platforms.forEach(plat => {
      if (plat.userData.type === GimmickType.CRUMBLE) {
        const u = plat.userData;
        if (u.steppedOn && !u.fallen) {
          u.shakeTimer += delta;
          // Shake vibration
          plat.position.x += (Math.random() - 0.5) * 0.08;
          plat.position.z += (Math.random() - 0.5) * 0.08;
          if (u.shakeTimer >= u.shakeDuration) {
            u.fallen = true;
          }
        } else if (u.fallen) {
          u.fallSpeed += 30 * delta;
          plat.position.y -= u.fallSpeed * delta;
          u.respawnTimer += delta;
          if (u.respawnTimer >= u.respawnDuration) {
            // Respawn
            u.steppedOn = false;
            u.fallen = false;
            u.fallSpeed = 0;
            u.shakeTimer = 0;
            u.respawnTimer = 0;
            plat.position.y = u.originalY;
          }
        }
      }
    });

    // 3. Rotating Hazards
    this.stageData.hazardObjects.forEach(hazard => {
      if (hazard.userData.type === GimmickType.ROTATING_BEAM) {
        hazard.rotation.y += hazard.userData.rotSpeed * delta;
      } else if (hazard.userData.type === GimmickType.FALLING_ICICLE) {
        const u = hazard.userData;
        const pPos = this.player.position;
        const distXZ = Math.hypot(pPos.x - hazard.position.x, pPos.z - hazard.position.z);

        if (!u.triggered && distXZ < u.triggerDistance && pPos.y < hazard.position.y) {
          u.triggered = true;
        }

        if (u.triggered && !u.falling) {
          u.shakeTimer += delta;
          hazard.position.x += (Math.random() - 0.5) * 0.06;
          if (u.shakeTimer >= u.shakeDuration) {
            u.falling = true;
          }
        } else if (u.falling) {
          u.fallVelocity += 40 * delta;
          hazard.position.y -= u.fallVelocity * delta;
          // Check collision with player
          if (distXZ < 0.8 && Math.abs(pPos.y - hazard.position.y) < 1.5) {
            if (window.soundManager) window.soundManager.playFall();
            this.player.reset(this.stageData.startPosition);
          }
        }
      }
    });

    // 4. Collectible Bells
    this.stageData.collectibleBells.forEach(bell => {
      if (!bell.userData.collected) {
        bell.rotation.y += 2.4 * delta;
        bell.position.y = bell.userData.baseY + Math.sin(time * 3.5) * 0.25;

        // Player collection distance check
        const d = this.player.position.distanceTo(bell.position);
        if (d < 1.4) {
          bell.userData.collected = true;
          bell.visible = false;
          this.bellsCollected++;
          if (window.soundManager) window.soundManager.playBell();
          this.updateHUD();
        }
      }
    });

    // 5. Update Goal Tree
    if (this.stageData.goalTree && this.stageData.goalTree.userData.update) {
      this.stageData.goalTree.userData.update(delta, time);
    }
  }

  // Update Snow particles around player
  updateSnow(delta) {
    if (!this.snowParticles) return;
    const pos = this.snowParticles.geometry.attributes.position.array;
    const vel = this.snowVelocities;
    const pPos = this.player.position;

    for (let i = 0; i < vel.length / 3; i++) {
      pos[i * 3 + 0] += vel[i * 3 + 0];
      pos[i * 3 + 1] += vel[i * 3 + 1];
      pos[i * 3 + 2] += vel[i * 3 + 2];

      // Respawn near player in bounding cylinder
      if (pos[i * 3 + 1] < pPos.y - 10) {
        pos[i * 3 + 1] = pPos.y + 40 + Math.random() * 20;
        pos[i * 3 + 0] = pPos.x + (Math.random() - 0.5) * 120;
        pos[i * 3 + 2] = pPos.z + (Math.random() - 0.5) * 120;
      }
    }
    this.snowParticles.geometry.attributes.position.needsUpdate = true;
  }

  animate(currentTime) {
    requestAnimationFrame(this.animate);

    const delta = 0.016; // Stable ~60fps step
    const time = currentTime * 0.001;

    if (!this.isCleared) {
      this.timeElapsed += delta;
      this.updateHUD();
    }

    // 1. Update Gimmicks & Environment
    this.updateGimmicks(delta, time);

    // 2. Update Player
    this.player.update(delta, this.stageData);

    // 3. Fall death check
    if (this.player.position.y < -18) {
      if (window.soundManager) window.soundManager.playFall();
      this.player.reset(this.stageData.startPosition);
    }

    // 4. Goal Check (Touching top star of realistic tree)
    if (!this.isCleared) {
      const distToGoal = this.player.position.distanceTo(this.stageData.goalPosition);
      if (distToGoal < 4.2) {
        this.showClearModal();
      }
    }

    // 5. Camera & Snow
    this.player.updateCamera(this.camera);
    this.updateSnow(delta);

    // 6. Follow light
    this.sunLight.position.set(
      this.player.position.x + 40,
      this.player.position.y + 80,
      this.player.position.z + 50
    );
    this.sunLight.target.position.copy(this.player.position);
    this.sunLight.target.updateMatrixWorld();

    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
