// gimmicks.js - Authentic Athletic Course Structures & Interactive Christmas Gimmicks

const GimmickType = {
  SNOW_SCAFFOLD: 'snow_scaffold',
  GIANT_PRESENT: 'giant_present',
  SNOWFLAKE_PAD: 'snowflake_pad',
  MOVING_CANDY_DECK: 'moving_candy_deck',
  ROPE_BRIDGE: 'rope_bridge',
  NET_RAMP: 'net_ramp',
  COLLAPSING_ICE: 'collapsing_ice',
  SANTA_DRUM: 'santa_drum',
  SPINNING_HAZARD: 'spinning_hazard',
  CHECKPOINT: 'checkpoint',
  COIN: 'coin',
  SNOWFLAKE_ITEM: 'snowflake_item'
};

class GimmickFactory {
  constructor(THREE) {
    this.THREE = THREE;
    this.initMaterials();
  }

  initMaterials() {
    const THREE = this.THREE;

    this.woodLogMat = new THREE.MeshStandardMaterial({
      color: 0x4e342e,
      roughness: 0.88
    });
    this.woodPlankMat = new THREE.MeshStandardMaterial({
      color: 0x6d4c41,
      roughness: 0.82
    });
    this.ropeMat = new THREE.MeshStandardMaterial({
      color: 0xa1887f,
      roughness: 0.9
    });
    this.snowMat = new THREE.MeshStandardMaterial({
      color: 0xf4f9ff,
      roughness: 0.45,
      metalness: 0.05
    });
    this.iceCrystalMat = new THREE.MeshStandardMaterial({
      color: 0xb3ecff,
      emissive: 0x116699,
      emissiveIntensity: 0.45,
      roughness: 0.12,
      metalness: 0.35
    });
    this.translucentIceMat = new THREE.MeshStandardMaterial({
      color: 0x80e5ff,
      emissive: 0x005588,
      emissiveIntensity: 0.35,
      roughness: 0.1,
      metalness: 0.25,
      transparent: true,
      opacity: 0.82
    });
    this.glowPadMat = new THREE.MeshBasicMaterial({
      color: 0x44ddff
    });

    // Present Box Materials
    this.presentRedMat = new THREE.MeshStandardMaterial({ color: 0xc62828, roughness: 0.35 });
    this.presentGreenMat = new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.38 });
    this.presentBlueMat = new THREE.MeshStandardMaterial({ color: 0x1565c0, roughness: 0.35 });
    this.presentGoldMat = new THREE.MeshStandardMaterial({ color: 0xf9a825, roughness: 0.25, metalness: 0.5 });

    this.ribbonGreenMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.3, metalness: 0.2 });
    this.ribbonRedMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.3, metalness: 0.2 });
    this.ribbonGoldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.2, metalness: 0.7 });

    // Candy Cane Materials
    this.candyRedMat = new THREE.MeshStandardMaterial({ color: 0xe53935, roughness: 0.25 });
    this.candyWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 });

    // Collectible Coin & Crystal
    this.goldCoinMat = new THREE.MeshStandardMaterial({
      color: 0xffdd33,
      emissive: 0xff9900,
      emissiveIntensity: 0.5,
      metalness: 0.85,
      roughness: 0.15
    });
  }

  // 1. Wooden Scaffolding Platform with Thick Snow Top ("雪の足場")
  createScaffoldingSnowPlatform(w, h, d, legHeight = 8.0) {
    const THREE = this.THREE;
    const group = new THREE.Group();

    const deckH = h * 0.55;
    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(w, deckH, d),
      this.woodPlankMat
    );
    deck.position.y = -h * 0.2;
    deck.castShadow = true;
    deck.receiveShadow = true;
    group.add(deck);

    const snowH = h * 0.55;
    const snowTop = new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.25, snowH, d + 0.25),
      this.snowMat
    );
    snowTop.position.y = h * 0.24;
    snowTop.castShadow = true;
    snowTop.receiveShadow = true;
    group.add(snowTop);

    const postR = 0.28;
    const postGeo = new THREE.CylinderGeometry(postR, postR * 1.1, legHeight + 1.2, 8);
    const ox = w / 2 - 0.35;
    const oz = d / 2 - 0.35;
    const corners = [
      [-ox, -oz], [ox, -oz], [-ox, oz], [ox, oz]
    ];

    corners.forEach(([cx, cz]) => {
      const post = new THREE.Mesh(postGeo, this.woodLogMat);
      post.position.set(cx, -legHeight / 2 + 0.2, cz);
      post.castShadow = true;
      group.add(post);
    });

    if (legHeight >= 3.5) {
      const beamX = new THREE.Mesh(new THREE.BoxGeometry(w, 0.26, 0.26), this.woodLogMat);
      beamX.position.set(0, -legHeight * 0.45, oz);
      group.add(beamX);

      const beamX2 = beamX.clone();
      beamX2.position.z = -oz;
      group.add(beamX2);

      const beamZ = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, d), this.woodLogMat);
      beamZ.position.set(-ox, -legHeight * 0.45, 0);
      group.add(beamZ);

      const beamZ2 = beamZ.clone();
      beamZ2.position.x = ox;
      group.add(beamZ2);
    }

    group.userData = {
      type: GimmickType.SNOW_SCAFFOLD,
      friction: 0.88,
      bounds: { w, h, d }
    };
    return group;
  }

  // 2. Glowing "CHECKPOINT" Gate
  createCheckpointGate(width = 4.6, height = 4.2) {
    const THREE = this.THREE;
    const group = new THREE.Group();

    const frameMat = new THREE.MeshStandardMaterial({
      color: 0xffe082,
      emissive: 0xffaa00,
      emissiveIntensity: 0.85,
      roughness: 0.2
    });

    const postGeo = new THREE.BoxGeometry(0.28, height, 0.28);
    const postL = new THREE.Mesh(postGeo, frameMat);
    postL.position.set(-width / 2, height / 2, 0);
    group.add(postL);

    const postR = new THREE.Mesh(postGeo, frameMat);
    postR.position.set(width / 2, height / 2, 0);
    group.add(postR);

    const topBar = new THREE.Mesh(new THREE.BoxGeometry(width + 0.4, 0.28, 0.28), frameMat);
    topBar.position.set(0, height, 0);
    group.add(topBar);

    const signCanvas = window.createTextCanvas('CHECKPOINT', 512, 128, {
      bgColor: 'rgba(35, 25, 15, 0.92)',
      borderColor: '#ffd54f',
      borderWidth: 10,
      font: '900 62px "Segoe UI", Arial, sans-serif',
      color: '#fff8e1',
      glowColor: '#ffab00'
    });
    const signTex = new THREE.CanvasTexture(signCanvas);
    const signMat = new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });
    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.92, 1.05), signMat);
    signMesh.position.set(0, height - 0.55, 0);
    group.add(signMesh);

    const light = new THREE.PointLight(0xffcc44, 1.5, 14);
    light.position.set(0, height - 0.5, 0);
    group.add(light);

    group.userData = {
      type: GimmickType.CHECKPOINT,
      activated: false,
      frameMat,
      light,
      activate() {
        if (this.activated) return;
        this.activated = true;
        this.frameMat.color.setHex(0x69f0ae);
        this.frameMat.emissive.setHex(0x00e676);
        this.light.color.setHex(0x00e676);
      }
    };

    return group;
  }

  // 3. Giant Stacked Present Box with Climbing Net & Ladder ("巨大なプレゼント")
  createStackedGiantPresent(w = 6.2, h = 6.8, d = 6.2, variant = 0) {
    const THREE = this.THREE;
    const group = new THREE.Group();

    const lowerH = h * 0.52;
    const upperH = h * 0.48;
    const upperW = w * 0.92;
    const upperD = d * 0.92;

    const lowerMat = variant % 3 === 0 ? this.presentGreenMat : (variant % 3 === 1 ? this.presentRedMat : this.presentBlueMat);
    const upperMat = variant % 3 === 0 ? this.presentRedMat : (variant % 3 === 1 ? this.presentGreenMat : this.presentRedMat);
    const lowerRibMat = variant % 2 === 0 ? this.ribbonRedMat : this.ribbonGoldMat;
    const upperRibMat = variant % 2 === 0 ? this.ribbonGreenMat : this.ribbonGoldMat;

    const lowerBox = new THREE.Mesh(new THREE.BoxGeometry(w, lowerH, d), lowerMat);
    lowerBox.position.y = -h / 2 + lowerH / 2;
    lowerBox.castShadow = true;
    lowerBox.receiveShadow = true;
    group.add(lowerBox);

    const lRib = new THREE.Mesh(new THREE.BoxGeometry(w + 0.08, lowerH + 0.04, d * 0.16), lowerRibMat);
    lRib.position.copy(lowerBox.position);
    group.add(lRib);

    const upperBox = new THREE.Mesh(new THREE.BoxGeometry(upperW, upperH, upperD), upperMat);
    upperBox.position.y = h / 2 - upperH / 2;
    upperBox.castShadow = true;
    upperBox.receiveShadow = true;
    group.add(upperBox);

    const lid = new THREE.Mesh(new THREE.BoxGeometry(upperW + 0.45, 0.65, upperD + 0.45), upperMat);
    lid.position.y = h / 2 - 0.25;
    lid.castShadow = true;
    group.add(lid);

    const uRibX = new THREE.Mesh(new THREE.BoxGeometry(upperW + 0.5, upperH + 0.08, upperD * 0.16), upperRibMat);
    uRibX.position.copy(upperBox.position);
    group.add(uRibX);

    const uRibZ = new THREE.Mesh(new THREE.BoxGeometry(upperW * 0.16, upperH + 0.08, upperD + 0.5), upperRibMat);
    uRibZ.position.copy(upperBox.position);
    group.add(uRibZ);

    const bowGroup = new THREE.Group();
    bowGroup.position.y = h / 2 + 0.45;
    for (let a = 0; a < 4; a++) {
      const loop = new THREE.Mesh(
        new THREE.TorusGeometry(0.95, 0.26, 8, 16),
        upperRibMat
      );
      loop.rotation.y = (a / 4) * Math.PI;
      loop.rotation.x = 0.35;
      bowGroup.add(loop);
    }
    group.add(bowGroup);

    // Cargo Climbing Net on Front (-Z face)
    const netW = w * 0.48;
    const netZ = -d / 2 - 0.12;
    const vRopes = 6;
    for (let i = 0; i <= vRopes; i++) {
      const rx = -netW / 2 + (i / vRopes) * netW;
      const rope = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, h, 6),
        this.ropeMat
      );
      rope.position.set(rx, 0, netZ);
      group.add(rope);
    }
    const hRopes = 12;
    for (let j = 0; j <= hRopes; j++) {
      const ry = -h / 2 + (j / hRopes) * h;
      const rung = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, netW, 6),
        this.ropeMat
      );
      rung.rotation.z = Math.PI / 2;
      rung.position.set(0, ry, netZ);
      group.add(rung);
    }

    // Wooden Climbing Ladder on Right (+X face)
    const ladderX = w / 2 + 0.15;
    const ladderW = 1.1;
    const railGeo = new THREE.CylinderGeometry(0.06, 0.06, h + 0.4, 6);
    const rail1 = new THREE.Mesh(railGeo, this.woodLogMat);
    rail1.position.set(ladderX, 0.2, -ladderW / 2);
    group.add(rail1);

    const rail2 = rail1.clone();
    rail2.position.z = ladderW / 2;
    group.add(rail2);

    for (let r = 0; r < 13; r++) {
      const ry = -h / 2 + 0.4 + (r / 12) * (h - 0.4);
      const step = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, ladderW, 6),
        this.woodPlankMat
      );
      step.rotation.x = Math.PI / 2;
      step.position.set(ladderX, ry, 0);
      group.add(step);
    }

    group.userData = {
      type: GimmickType.GIANT_PRESENT,
      friction: 0.88,
      bounds: { w: w + 0.3, h, d: d + 0.3 },
      isClimbable: true
    };
    return group;
  }

  // 4. Giant 3D Crystalline Snowflake Platform & Jump Pad ("雪の結晶")
  createSnowflakeJumpPad(radius = 3.6, bounceVel = new this.THREE.Vector3(0, 21, 14)) {
    const THREE = this.THREE;
    const group = new THREE.Group();

    const baseDisk = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.72, radius * 0.82, 0.55, 24),
      new THREE.MeshStandardMaterial({ color: 0x102a45, roughness: 0.3, metalness: 0.6 })
    );
    baseDisk.position.y = -0.35;
    group.add(baseDisk);

    const glowRing = new THREE.Mesh(
      new THREE.TorusGeometry(radius * 0.74, 0.14, 10, 32),
      this.glowPadMat
    );
    glowRing.rotation.x = Math.PI / 2;
    glowRing.position.y = -0.1;
    group.add(glowRing);

    const flakeGroup = new THREE.Group();
    const armLen = radius * 1.95;

    for (let i = 0; i < 6; i++) {
      const armWrapper = new THREE.Group();
      armWrapper.rotation.y = (i / 6) * Math.PI * 2;

      if (i < 3) {
        const mainArm = new THREE.Mesh(
          new THREE.BoxGeometry(0.48, 0.42, armLen),
          this.iceCrystalMat
        );
        mainArm.castShadow = true;
        mainArm.receiveShadow = true;
        armWrapper.add(mainArm);
      }

      [0.45, 0.72].forEach(frac => {
        const dist = (armLen / 2) * frac;
        const bLen = radius * (0.55 - frac * 0.2);

        const branchL = new THREE.Mesh(
          new THREE.BoxGeometry(0.32, 0.38, bLen),
          this.iceCrystalMat
        );
        branchL.position.set(-bLen * 0.32, 0, dist);
        branchL.rotation.y = Math.PI / 3;
        armWrapper.add(branchL);

        const branchR = new THREE.Mesh(
          new THREE.BoxGeometry(0.32, 0.38, bLen),
          this.iceCrystalMat
        );
        branchR.position.set(bLen * 0.32, 0, dist);
        branchR.rotation.y = -Math.PI / 3;
        armWrapper.add(branchR);
      });

      flakeGroup.add(armWrapper);
    }

    const hexCore = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.38, radius * 0.38, 0.46, 6),
      this.iceCrystalMat
    );
    flakeGroup.add(hexCore);
    group.add(flakeGroup);

    const curvePoints = [];
    const simSteps = 24;
    const g = 25.0;
    for (let s = 0; s <= simSteps; s++) {
      const t = (s / simSteps) * 1.15;
      const px = bounceVel.x * t;
      const py = 0.5 + bounceVel.y * t - 0.5 * g * t * t;
      const pz = bounceVel.z * t;
      curvePoints.push(new THREE.Vector3(px, py, pz));
    }
    const arcCurve = new THREE.CatmullRomCurve3(curvePoints);
    const arcGeo = new THREE.TubeGeometry(arcCurve, 32, 0.16, 8, false);
    const arcMat = new THREE.MeshBasicMaterial({
      color: 0xa8f5ff,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const arcMesh = new THREE.Mesh(arcGeo, arcMat);
    group.add(arcMesh);

    group.userData = {
      type: GimmickType.SNOWFLAKE_PAD,
      friction: 0.4,
      flakeGroup,
      bounceVelocity: bounceVel,
      bounds: { w: radius * 1.75, h: 0.8, d: radius * 1.75 }
    };
    return group;
  }

  // 5. Candy Cane Moving Platform ("動く床")
  createCandyCaneMovingDeck(w = 4.6, h = 0.9, d = 3.8, travelVec, speed = 1.9) {
    const THREE = this.THREE;
    const group = new THREE.Group();

    const deck = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.5, d), this.woodPlankMat);
    deck.position.y = -h * 0.2;
    deck.castShadow = true;
    group.add(deck);

    const snow = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, h * 0.5, d + 0.2), this.snowMat);
    snow.position.y = h * 0.2;
    snow.receiveShadow = true;
    group.add(snow);

    [-w / 2 - 0.35, w / 2 + 0.35].forEach(cx => {
      const caneGroup = new THREE.Group();
      caneGroup.position.set(cx, 0, 0);

      const segs = 10;
      const shaftH = 4.2;
      const segH = shaftH / segs;
      for (let i = 0; i < segs; i++) {
        const seg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.28, 0.28, segH, 12),
          i % 2 === 0 ? this.candyRedMat : this.candyWhiteMat
        );
        seg.position.y = (i + 0.5) * segH - 0.5;
        caneGroup.add(seg);
      }

      const hook = new THREE.Mesh(
        new THREE.TorusGeometry(0.65, 0.28, 10, 18, Math.PI),
        this.candyRedMat
      );
      hook.position.set(cx < 0 ? 0.65 : -0.65, shaftH - 0.5, 0);
      caneGroup.add(hook);

      group.add(caneGroup);
    });

    group.userData = {
      type: GimmickType.MOVING_CANDY_DECK,
      friction: 0.88,
      bounds: { w, h, d },
      origin: new THREE.Vector3(),
      travelVector: travelVec.clone(),
      speed: speed,
      phase: Math.random() * Math.PI * 2,
      deltaPos: new THREE.Vector3()
    };
    return group;
  }

  // 6. Collapsing Ice Crystal Platform ("氷の崩れる足場")
  createCollapsingIcePlatform(w = 4.2, h = 0.8, d = 4.2) {
    const THREE = this.THREE;
    const group = new THREE.Group();

    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      this.translucentIceMat.clone()
    );
    slab.castShadow = true;
    slab.receiveShadow = true;
    group.add(slab);

    // Icicles underneath
    for (let i = 0; i < 6; i++) {
      const icicle = new THREE.Mesh(
        new THREE.ConeGeometry(0.28, 1.3, 5),
        this.iceCrystalMat
      );
      icicle.rotation.x = Math.PI;
      icicle.position.set(
        (Math.cos(i * 1.1) * w * 0.32),
        -h / 2 - 0.6,
        (Math.sin(i * 1.7) * d * 0.32)
      );
      group.add(icicle);
    }

    group.userData = {
      type: GimmickType.COLLAPSING_ICE,
      friction: 0.45,
      bounds: { w, h, d },
      triggered: false,
      collapsed: false,
      timer: 0,
      baseY: 0,
      slab
    };
    return group;
  }

  // 7. Festive Santa Drum Trampoline ("サンタの太鼓トランポリン")
  createSantaDrumTrampoline(radius = 2.8, bounceY = 21.5) {
    const THREE = this.THREE;
    const group = new THREE.Group();

    const drumBody = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, 1.8, 20),
      this.presentRedMat
    );
    drumBody.position.y = -0.5;
    group.add(drumBody);

    const drumTop = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.94, radius * 0.94, 0.25, 20),
      new THREE.MeshStandardMaterial({ color: 0xfff8e1, emissive: 0x443300, roughness: 0.3 })
    );
    drumTop.position.y = 0.35;
    group.add(drumTop);

    const rimTop = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.16, 8, 24),
      this.ribbonGoldMat
    );
    rimTop.rotation.x = Math.PI / 2;
    rimTop.position.y = 0.4;
    group.add(rimTop);

    const rimBot = rimTop.clone();
    rimBot.position.y = -1.35;
    group.add(rimBot);

    group.userData = {
      type: GimmickType.SNOWFLAKE_PAD,
      friction: 0.85,
      bounceVelocity: new THREE.Vector3(0, bounceY, 5.5),
      bounds: { w: radius * 1.85, h: 1.0, d: radius * 1.85 }
    };
    return group;
  }

  // 8. Suspension Rope Bridge & Net Bridge Between Two Points
  createRopeBridge(startPos, endPos, width = 2.6, isNet = false) {
    const THREE = this.THREE;
    const bridgeGroup = new THREE.Group();
    const stepPlatforms = [];

    const diff = new THREE.Vector3().subVectors(endPos, startPos);
    const totalDist = diff.length();
    const angleY = Math.atan2(diff.x, diff.z);

    const plankCount = Math.max(4, Math.floor(totalDist / 1.15));

    for (let i = 1; i < plankCount; i++) {
      const t = i / plankCount;
      const sag = isNet ? 0 : Math.sin(t * Math.PI) * 0.45;

      const px = startPos.x + diff.x * t;
      const py = startPos.y + diff.y * t - sag;
      const pz = startPos.z + diff.z * t;

      const plank = new THREE.Group();
      plank.position.set(px, py, pz);
      plank.rotation.y = angleY;

      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(width, 0.25, 0.85),
        isNet ? this.ropeMat : this.woodPlankMat
      );
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      plank.add(mesh);

      if (!isNet && i % 2 === 1) {
        [-width / 2, width / 2].forEach(rx => {
          const post = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.06, 1.1, 6),
            this.woodLogMat
          );
          post.position.set(rx, 0.55, 0);
          plank.add(post);
        });
      }

      plank.userData = {
        type: GimmickType.ROPE_BRIDGE,
        friction: 0.88,
        bounds: { w: width + 0.4, h: 0.4, d: 1.25 }
      };

      bridgeGroup.add(plank);
      stepPlatforms.push(plank);
    }

    return { bridgeGroup, stepPlatforms };
  }

  // 9. Collectible Gold Coin & Glowing Snowflake Token
  createCollectible(isSnowflake = false) {
    const THREE = this.THREE;
    const group = new THREE.Group();

    if (isSnowflake) {
      for (let i = 0; i < 3; i++) {
        const bar = new THREE.Mesh(
          new THREE.BoxGeometry(0.14, 0.95, 0.14),
          this.iceCrystalMat
        );
        bar.rotation.z = (i / 3) * Math.PI;
        group.add(bar);
      }
    } else {
      const coin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.45, 0.12, 16),
        this.goldCoinMat
      );
      coin.rotation.x = Math.PI / 2;
      group.add(coin);
    }

    group.userData = {
      type: isSnowflake ? GimmickType.SNOWFLAKE_ITEM : GimmickType.COIN,
      isSnowflake,
      collected: false,
      baseY: 0
    };
    return group;
  }

  // 10. Spinning Candy Cane Sweeper Hazard
  createSpinningSweeper(length = 6.5, speed = 1.6) {
    const THREE = this.THREE;
    const group = new THREE.Group();

    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.55, 0.8, 12),
      this.presentGoldMat
    );
    group.add(hub);

    const bar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, length, 10),
      this.candyRedMat
    );
    bar.rotation.z = Math.PI / 2;
    group.add(bar);

    group.userData = {
      type: GimmickType.SPINNING_HAZARD,
      length,
      speed
    };
    return group;
  }
}

window.GimmickType = GimmickType;
window.GimmickFactory = GimmickFactory;
