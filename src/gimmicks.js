// gimmicks.js - Athletic Gimmicks: Ice, Crumbling Snow, Trampoline Present, Moving Platforms, Icicles, Wind, Bells

const GimmickType = {
  NORMAL: 'normal',
  ICE: 'ice',
  CRUMBLE: 'crumble',
  BOUNCE_PRESENT: 'bounce_present',
  MOVING_PLATFORM: 'moving_platform',
  ROTATING_BEAM: 'rotating_beam',
  FALLING_ICICLE: 'falling_icicle',
  SPIKE_HOLLY: 'spike_holly',
  WIND_ZONE: 'wind_zone',
  BELL: 'bell'
};

class GimmickFactory {
  constructor(THREE) {
    this.THREE = THREE;
    this.initSharedMaterials();
  }

  initSharedMaterials() {
    const THREE = this.THREE;

    // Normal Platform (Frosted Stone + Snow top)
    this.stoneMat = new THREE.MeshStandardMaterial({
      color: 0x5a6978,
      roughness: 0.85,
      metalness: 0.1
    });
    this.snowTopMat = new THREE.MeshStandardMaterial({
      color: 0xf0f7ff,
      roughness: 0.45,
      metalness: 0.05
    });

    // Ice Platform (Slippery, slightly translucent, bright cyan-blue)
    this.iceMat = new THREE.MeshStandardMaterial({
      color: 0x9be0f7,
      roughness: 0.08,
      metalness: 0.25,
      transparent: true,
      opacity: 0.88
    });

    // Crumble Snow Platform
    this.crumbleMat = new THREE.MeshStandardMaterial({
      color: 0xe0ecf8,
      roughness: 0.7,
      metalness: 0.0
    });

    // Bounce Present Box (Vibrant Red with Gold Ribbon)
    this.presentMat = new THREE.MeshStandardMaterial({
      color: 0xd32f2f,
      roughness: 0.35,
      metalness: 0.2
    });
    this.ribbonMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.25,
      metalness: 0.75
    });

    // Wood Sled / Moving Platform
    this.woodMat = new THREE.MeshStandardMaterial({
      color: 0x8d5b4c,
      roughness: 0.8,
      metalness: 0.05
    });
    this.goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xffcc33,
      metalness: 0.8,
      roughness: 0.3
    });

    // Candy Cane Pattern (Red & White)
    this.candyWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3
    });
    this.candyRedMat = new THREE.MeshStandardMaterial({
      color: 0xee2222,
      roughness: 0.3
    });

    // Icicle Mat (Cold sharp glass-like ice)
    this.icicleMat = new THREE.MeshStandardMaterial({
      color: 0xcdeeff,
      roughness: 0.15,
      metalness: 0.3,
      transparent: true,
      opacity: 0.92
    });

    // Bell (Gold Chime)
    this.bellMat = new THREE.MeshStandardMaterial({
      color: 0xffcc00,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x553300,
      emissiveIntensity: 0.3
    });
    this.bellBowMat = new THREE.MeshStandardMaterial({
      color: 0xdd1122,
      roughness: 0.5
    });
  }

  // 1. Normal Snow Platform
  createNormalPlatform(w, h, d) {
    const THREE = this.THREE;
    const group = new THREE.Group();

    // Base body
    const baseGeo = new THREE.BoxGeometry(w, h * 0.7, d);
    const baseMesh = new THREE.Mesh(baseGeo, this.stoneMat);
    baseMesh.position.y = -h * 0.15;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    group.add(baseMesh);

    // Snow Cap on top
    const capGeo = new THREE.BoxGeometry(w + 0.1, h * 0.3, d + 0.1);
    const capMesh = new THREE.Mesh(capGeo, this.snowTopMat);
    capMesh.position.y = h * 0.35;
    capMesh.castShadow = true;
    capMesh.receiveShadow = true;
    group.add(capMesh);

    group.userData = {
      type: GimmickType.NORMAL,
      friction: 0.85,
      bounce: 0,
      bounds: { w, h, d }
    };
    return group;
  }

  // 2. Ice Platform (Slippery)
  createIcePlatform(w, h, d) {
    const THREE = this.THREE;
    const group = new THREE.Group();

    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, this.iceMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Subtle frost edge
    const frostEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })
    );
    group.add(frostEdges);

    group.userData = {
      type: GimmickType.ICE,
      friction: 0.04, // Extremely slippery!
      bounce: 0,
      bounds: { w, h, d }
    };
    return group;
  }

  // 3. Crumble Snow Platform (Falls after player stands on it)
  createCrumblePlatform(w, h, d) {
    const THREE = this.THREE;
    const group = new THREE.Group();

    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, this.crumbleMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    group.userData = {
      type: GimmickType.CRUMBLE,
      friction: 0.8,
      bounce: 0,
      bounds: { w, h, d },
      steppedOn: false,
      shakeTimer: 0,
      shakeDuration: 1.1, // seconds before falling
      fallen: false,
      fallSpeed: 0,
      respawnTimer: 0,
      respawnDuration: 3.5,
      originalY: 0
    };
    return group;
  }

  // 4. Bounce Present (Trampoline)
  createBouncePresent(w, h, d, bounceForce = 22) {
    const THREE = this.THREE;
    const group = new THREE.Group();

    // Box
    const boxGeo = new THREE.BoxGeometry(w, h, d);
    const boxMesh = new THREE.Mesh(boxGeo, this.presentMat);
    boxMesh.castShadow = true;
    boxMesh.receiveShadow = true;
    group.add(boxMesh);

    // Ribbon X
    const ribXGeo = new THREE.BoxGeometry(w + 0.04, h + 0.04, d * 0.22);
    const ribXMesh = new THREE.Mesh(ribXGeo, this.ribbonMat);
    group.add(ribXMesh);

    // Ribbon Z
    const ribZGeo = new THREE.BoxGeometry(w * 0.22, h + 0.04, d + 0.04);
    const ribZMesh = new THREE.Mesh(ribZGeo, this.ribbonMat);
    group.add(ribZMesh);

    // Bow on Top
    const bowGeo = new THREE.TorusGeometry(0.35, 0.1, 8, 16);
    const bow1 = new THREE.Mesh(bowGeo, this.ribbonMat);
    bow1.position.y = h / 2 + 0.25;
    bow1.rotation.x = Math.PI / 4;
    group.add(bow1);

    const bow2 = bow1.clone();
    bow2.rotation.y = Math.PI / 2;
    group.add(bow2);

    group.userData = {
      type: GimmickType.BOUNCE_PRESENT,
      friction: 0.85,
      bounceForce: bounceForce,
      bounds: { w, h, d },
      springAnim: 0
    };
    return group;
  }

  // 5. Moving Sled Platform
  createMovingPlatform(w, h, d, travelVector, speed = 1.8) {
    const THREE = this.THREE;
    const group = new THREE.Group();

    // Sled base
    const sledGeo = new THREE.BoxGeometry(w, h * 0.8, d);
    const sledMesh = new THREE.Mesh(sledGeo, this.woodMat);
    sledMesh.castShadow = true;
    sledMesh.receiveShadow = true;
    group.add(sledMesh);

    // Gold runners/trim
    const trimGeo = new THREE.BoxGeometry(w * 0.1, h * 0.4, d + 0.4);
    const trimL = new THREE.Mesh(trimGeo, this.goldTrimMat);
    trimL.position.set(-w / 2 + 0.1, -h * 0.4, 0);
    group.add(trimL);

    const trimR = trimL.clone();
    trimR.position.x = w / 2 - 0.1;
    group.add(trimR);

    // Snow cover on top
    const snowGeo = new THREE.BoxGeometry(w * 0.9, 0.15, d * 0.9);
    const snowMesh = new THREE.Mesh(snowGeo, this.snowTopMat);
    snowMesh.position.y = h * 0.45;
    group.add(snowMesh);

    group.userData = {
      type: GimmickType.MOVING_PLATFORM,
      friction: 0.85,
      bounce: 0,
      bounds: { w, h, d },
      origin: new THREE.Vector3(),
      travelVector: travelVector.clone(),
      speed: speed,
      phase: 0,
      deltaPos: new THREE.Vector3()
    };
    return group;
  }

  // 6. Rotating Beam (Candy Cane Obstacle)
  createRotatingBeam(length, radius = 0.45, axis = 'y', rotSpeed = 1.2) {
    const THREE = this.THREE;
    const group = new THREE.Group();

    // Striped Candy Beam
    const segments = 12;
    const segLen = length / segments;
    for (let s = 0; s < segments; s++) {
      const segGeo = new THREE.CylinderGeometry(radius, radius, segLen, 12);
      const mat = (s % 2 === 0) ? this.candyRedMat : this.candyWhiteMat;
      const segMesh = new THREE.Mesh(segGeo, mat);
      segMesh.position.y = -length / 2 + (s + 0.5) * segLen;
      segMesh.castShadow = true;
      group.add(segMesh);
    }

    if (axis === 'y') {
      group.rotation.z = Math.PI / 2; // Lie flat horizontally
    }

    group.userData = {
      type: GimmickType.ROTATING_BEAM,
      rotAxis: axis,
      rotSpeed: rotSpeed,
      bounds: { w: length, h: radius * 2, d: radius * 2 }
    };
    return group;
  }

  // 7. Falling Icicle (Triggers when player is below)
  createFallingIcicle(height = 3.0, radius = 0.5) {
    const THREE = this.THREE;
    const group = new THREE.Group();

    const icicleGeo = new THREE.ConeGeometry(radius, height, 6);
    icicleGeo.rotateX(Math.PI); // Point downwards
    const icicleMesh = new THREE.Mesh(icicleGeo, this.icicleMat);
    icicleMesh.castShadow = true;
    group.add(icicleMesh);

    group.userData = {
      type: GimmickType.FALLING_ICICLE,
      bounds: { w: radius * 2, h: height, d: radius * 2 },
      triggered: false,
      shakeTimer: 0,
      shakeDuration: 0.45,
      falling: false,
      fallVelocity: 0,
      originalPos: new THREE.Vector3(),
      resetTimer: 0,
      triggerDistance: 3.5
    };
    return group;
  }

  // 8. Collectible Christmas Bell
  createCollectibleBell() {
    const THREE = this.THREE;
    const group = new THREE.Group();

    // Bell shape
    const bellGeo = new THREE.CylinderGeometry(0.15, 0.45, 0.65, 12);
    const bellMesh = new THREE.Mesh(bellGeo, this.bellMat);
    bellMesh.castShadow = true;
    group.add(bellMesh);

    // Clapper inside
    const clapperGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const clapperMesh = new THREE.Mesh(clapperGeo, this.bellMat);
    clapperMesh.position.y = -0.3;
    group.add(clapperMesh);

    // Red Bow on top
    const bowGeo = new THREE.TorusGeometry(0.18, 0.06, 6, 12);
    const bow = new THREE.Mesh(bowGeo, this.bellBowMat);
    bow.position.y = 0.42;
    group.add(bow);

    group.userData = {
      type: GimmickType.BELL,
      collected: false,
      bounds: { radius: 0.8 },
      baseY: 0
    };
    return group;
  }
}

window.GimmickType = GimmickType;
window.GimmickFactory = GimmickFactory;
