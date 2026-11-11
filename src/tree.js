// tree.js - Realistic Grand Christmas Tree, Illuminated GOAL! Archway, Flying Santa Sleigh & Reindeer, Aurora Sky & Santa's Village

function createTextCanvas(text, width, height, options = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (options.bgColor) {
    ctx.fillStyle = options.bgColor;
    ctx.fillRect(0, 0, width, height);
  }

  if (options.borderColor) {
    ctx.strokeStyle = options.borderColor;
    ctx.lineWidth = options.borderWidth || 8;
    ctx.strokeRect(4, 4, width - 8, height - 8);
  }

  ctx.font = options.font || '900 72px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (options.glowColor) {
    ctx.shadowColor = options.glowColor;
    ctx.shadowBlur = 22;
  }

  if (options.outlineColor) {
    ctx.strokeStyle = options.outlineColor;
    ctx.lineWidth = 10;
    ctx.strokeText(text, width / 2, height / 2);
  }

  ctx.fillStyle = options.color || '#ffffff';
  ctx.fillText(text, width / 2, height / 2);

  return canvas;
}

// 1. Grand Illuminated Christmas Tree (at the Goal Hilltop & Village)
function createRealisticChristmasTree(THREE, options = {}) {
  const treeGroup = new THREE.Group();
  const scale = options.scale || 1.0;

  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x3b2314,
    roughness: 0.9
  });

  const pineMats = [
    new THREE.MeshStandardMaterial({ color: 0x0f3b1d, roughness: 0.8, flatShading: true }),
    new THREE.MeshStandardMaterial({ color: 0x164a26, roughness: 0.8, flatShading: true }),
    new THREE.MeshStandardMaterial({ color: 0x1e5931, roughness: 0.75, flatShading: true })
  ];

  const snowMat = new THREE.MeshStandardMaterial({
    color: 0xf4f9ff,
    roughness: 0.4,
    flatShading: true
  });

  // Trunk
  const trunkH = 14 * scale;
  const trunkR = 0.85 * scale;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(trunkR * 0.5, trunkR, trunkH, 10),
    trunkMat
  );
  trunk.position.y = trunkH * 0.45;
  trunk.castShadow = true;
  treeGroup.add(trunk);

  // Dense Multi-Tiered Pine Canopy
  const layers = 14;
  const baseRadius = 5.8 * scale;
  const layerStep = 1.02 * scale;
  const startY = 1.6 * scale;

  for (let i = 0; i < layers; i++) {
    const t = i / (layers - 1);
    const r = baseRadius * Math.pow(1 - t * 0.86, 1.08);
    const y = startY + i * layerStep;

    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(r, layerStep * 1.65, 11),
      pineMats[i % pineMats.length]
    );
    cone.position.y = y + layerStep * 0.5;
    cone.rotation.y = i * 0.4;
    cone.castShadow = true;
    cone.receiveShadow = true;
    treeGroup.add(cone);

    const branchCount = Math.max(6, Math.round(14 * (1 - t * 0.55)));
    for (let b = 0; b < branchCount; b++) {
      const angle = (b / branchCount) * Math.PI * 2 + i * 0.35;
      const bx = Math.cos(angle) * (r * 0.78);
      const bz = Math.sin(angle) * (r * 0.78);

      const frond = new THREE.Mesh(
        new THREE.ConeGeometry(r * 0.28, r * 0.65, 5),
        pineMats[(i + b) % pineMats.length]
      );
      frond.position.set(bx, y + 0.1 * scale, bz);
      frond.rotation.x = Math.sin(angle) * 0.45;
      frond.rotation.z = -Math.cos(angle) * 0.45;
      treeGroup.add(frond);

      if ((i + b) % 2 === 0) {
        const snowTip = new THREE.Mesh(
          new THREE.SphereGeometry(r * 0.14, 6, 5),
          snowMat
        );
        snowTip.scale.set(1.3, 0.45, 1.3);
        snowTip.position.set(
          Math.cos(angle) * (r * 0.92),
          y - 0.1 * scale,
          Math.sin(angle) * (r * 0.92)
        );
        treeGroup.add(snowTip);
      }
    }
  }

  // Spiraling Golden Garland & Fairy Lights
  const lightSpheres = [];
  const fairyColors = [0xffe066, 0xffaa22, 0xff4444, 0x44ff88, 0x66ddff, 0xffe066];
  const fairyGeo = new THREE.SphereGeometry(0.16 * scale, 6, 6);
  const totalLights = 150;

  for (let i = 0; i < totalLights; i++) {
    const t = i / totalLights;
    const y = startY + t * (layers * layerStep * 0.96);
    const r = baseRadius * Math.pow(1 - t * 0.86, 1.08) * 1.01;
    const turns = 9.5;
    const angle = t * Math.PI * 2 * turns;

    const col = fairyColors[i % fairyColors.length];
    const mat = new THREE.MeshBasicMaterial({ color: col });
    const bulb = new THREE.Mesh(fairyGeo, mat);
    bulb.position.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
    bulb.userData = {
      baseScale: 1.0,
      phase: i * 0.3,
      speed: 3.0 + (i % 5) * 0.5
    };
    lightSpheres.push(bulb);
    treeGroup.add(bulb);
  }

  // Shiny Ornaments
  const ornamentCols = [0xe53935, 0xffd700, 0x1e88e5, 0xab47bc, 0x00e676];
  const ornMats = ornamentCols.map(c => new THREE.MeshStandardMaterial({
    color: c,
    metalness: 0.85,
    roughness: 0.15
  }));
  const ornGeo = new THREE.SphereGeometry(0.28 * scale, 10, 10);

  for (let i = 0; i < 65; i++) {
    const t = 0.06 + (i / 65) * 0.82;
    const y = startY + t * (layers * layerStep);
    const r = baseRadius * Math.pow(1 - t * 0.86, 1.08) * 0.96;
    const angle = i * 2.39996;
    const orn = new THREE.Mesh(ornGeo, ornMats[i % ornMats.length]);
    orn.position.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
    treeGroup.add(orn);
  }

  // Stacked Gift Boxes under the Tree
  const giftColors = [0xd32f2f, 0x2e7d32, 0x1976d2, 0xfbc02d, 0x8e24aa];
  for (let g = 0; g < 10; g++) {
    const ang = (g / 10) * Math.PI * 2;
    const dist = (2.8 + (g % 3) * 1.1) * scale;
    const gw = (1.1 + (g % 2) * 0.5) * scale;
    const gh = (0.9 + (g % 3) * 0.4) * scale;
    const gift = new THREE.Mesh(
      new THREE.BoxGeometry(gw, gh, gw),
      new THREE.MeshStandardMaterial({ color: giftColors[g % giftColors.length], roughness: 0.4 })
    );
    gift.position.set(Math.cos(ang) * dist, gh / 2, Math.sin(ang) * dist);
    gift.rotation.y = g * 0.7;
    treeGroup.add(gift);
  }

  // Radiant Top Star
  const starY = startY + layers * layerStep + 0.8 * scale;
  const starGroup = new THREE.Group();
  starGroup.position.set(0, starY, 0);

  const starMat = new THREE.MeshStandardMaterial({
    color: 0xfff088,
    emissive: 0xffaa00,
    emissiveIntensity: 1.5,
    metalness: 0.8,
    roughness: 0.1
  });
  const s1 = new THREE.Mesh(new THREE.OctahedronGeometry(1.1 * scale, 0), starMat);
  s1.scale.set(1, 1.5, 0.35);
  starGroup.add(s1);

  const s2 = s1.clone();
  s2.rotation.z = Math.PI / 4;
  s2.scale.set(0.8, 0.8, 0.35);
  starGroup.add(s2);

  // Outer Halo Glow Sprite
  const haloCanvas = document.createElement('canvas');
  haloCanvas.width = 128;
  haloCanvas.height = 128;
  const hctx = haloCanvas.getContext('2d');
  const grad = hctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255, 250, 200, 1)');
  grad.addColorStop(0.35, 'rgba(255, 200, 60, 0.6)');
  grad.addColorStop(1, 'rgba(255, 160, 0, 0)');
  hctx.fillStyle = grad;
  hctx.fillRect(0, 0, 128, 128);

  const haloTex = new THREE.CanvasTexture(haloCanvas);
  const haloSprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: haloTex, transparent: true, blending: THREE.AdditiveBlending })
  );
  haloSprite.scale.set(6.5 * scale, 6.5 * scale, 1);
  starGroup.add(haloSprite);

  const starLight = new THREE.PointLight(0xffdd77, 2.5, 45 * scale);
  starGroup.add(starLight);

  treeGroup.add(starGroup);

  treeGroup.userData = {
    starGroup,
    lightSpheres,
    goalPosition: new THREE.Vector3(0, starY, 0),
    update(delta, time) {
      starGroup.rotation.y = time * 1.4;
      for (let i = 0; i < lightSpheres.length; i++) {
        const b = lightSpheres[i];
        const s = 0.75 + 0.45 * Math.sin(time * b.userData.speed + b.userData.phase);
        b.scale.setScalar(s);
      }
    }
  };

  return treeGroup;
}

// 2. Illuminated "GOAL!" Archway
function createGoalArchway(THREE, scale = 1.0) {
  const archGroup = new THREE.Group();

  const archRadius = 7.5 * scale;
  const tubeRadius = 0.85 * scale;

  const archGeo = new THREE.TorusGeometry(archRadius, tubeRadius, 12, 32, Math.PI);
  const archMat = new THREE.MeshStandardMaterial({
    color: 0xd84315,
    emissive: 0x551100,
    roughness: 0.3,
    metalness: 0.4
  });
  const archMesh = new THREE.Mesh(archGeo, archMat);
  archMesh.position.y = 0.5 * scale;
  archMesh.castShadow = true;
  archGroup.add(archMesh);

  const stripeColors = [0xffea00, 0xff3d00, 0x00e676, 0x00b0ff];
  stripeColors.forEach((col, idx) => {
    const r = archRadius - (idx - 1.5) * 0.38 * scale;
    const sGeo = new THREE.TorusGeometry(r, 0.14 * scale, 8, 32, Math.PI);
    const sMat = new THREE.MeshBasicMaterial({ color: col });
    const sMesh = new THREE.Mesh(sGeo, sMat);
    sMesh.position.set(0, 0.5 * scale, tubeRadius * 0.88);
    archGroup.add(sMesh);

    const sMeshBack = sMesh.clone();
    sMeshBack.position.z = -tubeRadius * 0.88;
    archGroup.add(sMeshBack);
  });

  const bulbs = [];
  const bulbGeo = new THREE.SphereGeometry(0.22 * scale, 8, 8);
  const bulbCount = 24;
  for (let i = 0; i <= bulbCount; i++) {
    const angle = (i / bulbCount) * Math.PI;
    const bx = Math.cos(angle) * (archRadius + tubeRadius * 0.9);
    const by = Math.sin(angle) * (archRadius + tubeRadius * 0.9) + 0.5 * scale;

    const bMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xffffaa : 0xff5533 });
    const bulb = new THREE.Mesh(bulbGeo, bMat);
    bulb.position.set(bx, by, tubeRadius * 0.5);
    bulbs.push(bulb);
    archGroup.add(bulb);
  }

  const baseGeo = new THREE.BoxGeometry(2.6 * scale, 1.5 * scale, 2.6 * scale);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0xb71c1c, roughness: 0.5 });
  const baseL = new THREE.Mesh(baseGeo, baseMat);
  baseL.position.set(-archRadius, 0.75 * scale, 0);
  archGroup.add(baseL);

  const baseR = baseL.clone();
  baseR.position.x = archRadius;
  archGroup.add(baseR);

  const goalCanvas = createTextCanvas('GOAL!', 512, 160, {
    font: '900 110px "Segoe UI", Impact, sans-serif',
    color: '#fff6a9',
    outlineColor: '#d32f2f',
    glowColor: '#ffaa00'
  });
  const goalTex = new THREE.CanvasTexture(goalCanvas);
  const signGeo = new THREE.PlaneGeometry(8.5 * scale, 2.7 * scale);
  const signMat = new THREE.MeshBasicMaterial({
    map: goalTex,
    transparent: true,
    side: THREE.DoubleSide
  });
  const signMesh = new THREE.Mesh(signGeo, signMat);
  signMesh.position.set(0, archRadius * 0.76, 0);
  archGroup.add(signMesh);

  const goalLight = new THREE.PointLight(0xffcc55, 2.2, 35 * scale);
  goalLight.position.set(0, archRadius * 0.6, 2 * scale);
  archGroup.add(goalLight);

  archGroup.userData = {
    bulbs,
    update(delta, time) {
      for (let i = 0; i < bulbs.length; i++) {
        const on = Math.floor(time * 6 + i) % 2 === 0;
        bulbs[i].scale.setScalar(on ? 1.25 : 0.75);
      }
    }
  };

  return archGroup;
}

// 3. Snowy Forest Pine Tree
function createSnowyPineTree(THREE, scale = 1.0) {
  const group = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25 * scale, 0.4 * scale, 2.5 * scale, 6),
    new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 })
  );
  trunk.position.y = 1.25 * scale;
  group.add(trunk);

  const pineMat = new THREE.MeshStandardMaterial({ color: 0x1b4332, roughness: 0.85, flatShading: true });
  const snowMat = new THREE.MeshStandardMaterial({ color: 0xeaf4f8, roughness: 0.5, flatShading: true });

  for (let i = 0; i < 4; i++) {
    const r = (2.4 - i * 0.45) * scale;
    const h = (2.6 - i * 0.3) * scale;
    const y = (2.4 + i * 1.45) * scale;

    const cone = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), pineMat);
    cone.position.y = y;
    group.add(cone);

    const snowCone = new THREE.Mesh(new THREE.ConeGeometry(r * 0.82, h * 0.45, 7), snowMat);
    snowCone.position.y = y + h * 0.3;
    group.add(snowCone);
  }

  return group;
}

// 4. Detailed 3D Santa Claus Character (for Sleigh & Goal Plaza!)
function createSantaClausModel(THREE, scale = 1.0) {
  const santa = new THREE.Group();

  const redSuitMat = new THREE.MeshStandardMaterial({ color: 0xd61c1c, roughness: 0.45 });
  const whiteFurMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.65 });
  const beltMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.85, roughness: 0.2, emissive: 0x443300 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xffd5b8, roughness: 0.5 });

  // Jolly Belly / Coat
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.62, 1.15, 14), redSuitMat);
  body.position.y = 1.05;
  santa.add(body);

  // White Fur Bottom Trim & Vertical Strip
  const hem = new THREE.Mesh(new THREE.TorusGeometry(0.60, 0.11, 8, 18), whiteFurMat);
  hem.rotation.x = Math.PI / 2;
  hem.position.y = 0.52;
  santa.add(hem);

  const frontTrim = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.12, 0.12), whiteFurMat);
  frontTrim.position.set(0, 1.05, 0.52);
  santa.add(frontTrim);

  // Black Belt & Gold Buckle
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.58, 0.18, 14), beltMat);
  belt.position.y = 0.92;
  santa.add(belt);

  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.24, 0.08), goldMat);
  buckle.position.set(0, 0.92, 0.58);
  santa.add(buckle);

  // Boots & Legs
  [-0.22, 0.22].forEach(lx => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.45, 10), redSuitMat);
    leg.position.set(lx, 0.32, 0);
    santa.add(leg);
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 0.38), beltMat);
    boot.position.set(lx, 0.11, 0.05);
    santa.add(boot);
  });

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 14, 14), skinMat);
  head.position.y = 1.88;
  santa.add(head);

  // Rosy Nose & Eyes
  const nose = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xff6b6b, roughness: 0.4 })
  );
  nose.position.set(0, 1.86, 0.36);
  santa.add(nose);

  [-0.12, 0.12].forEach(ex => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), beltMat);
    eye.position.set(ex, 1.94, 0.33);
    santa.add(eye);
  });

  // Big Fluffy White Beard & Mustache
  const beard = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.65, 10), whiteFurMat);
  beard.rotation.x = Math.PI + 0.18;
  beard.position.set(0, 1.62, 0.22);
  santa.add(beard);

  [-0.12, 0.12].forEach((mx, idx) => {
    const stache = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), whiteFurMat);
    stache.scale.set(1.5, 0.6, 0.8);
    stache.position.set(mx, 1.78, 0.35);
    stache.rotation.z = idx === 0 ? 0.25 : -0.25;
    santa.add(stache);
  });

  // Iconic Santa Hat with White Fur Brim & Pom-Pom
  const hatBrim = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.09, 8, 16), whiteFurMat);
  hatBrim.rotation.x = Math.PI / 2 - 0.1;
  hatBrim.position.set(0, 2.08, 0);
  santa.add(hatBrim);

  const hatCone = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.68, 12), redSuitMat);
  hatCone.position.set(0.06, 2.38, -0.05);
  hatCone.rotation.z = -0.32;
  santa.add(hatCone);

  const pompom = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), whiteFurMat);
  pompom.position.set(0.24, 2.66, -0.08);
  santa.add(pompom);

  // Waving Right Arm & Left Arm
  const rightArm = new THREE.Group();
  rightArm.position.set(0.55, 1.45, 0);
  const rSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.55, 10), redSuitMat);
  rSleeve.position.y = 0.22;
  rightArm.add(rSleeve);
  const rCuff = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.045, 6, 12), whiteFurMat);
  rCuff.rotation.x = Math.PI / 2;
  rCuff.position.y = 0.45;
  rightArm.add(rCuff);
  const rGlove = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), whiteFurMat);
  rGlove.position.y = 0.54;
  rightArm.add(rGlove);
  rightArm.rotation.z = -0.55;
  santa.add(rightArm);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.55, 1.45, 0);
  const lSleeve = rSleeve.clone();
  lSleeve.position.y = -0.22;
  leftArm.add(lSleeve);
  leftArm.rotation.z = 0.35;
  santa.add(leftArm);

  santa.scale.setScalar(scale);
  santa.userData = { rightArm };
  return santa;
}

// 5. Flying Santa Sleigh + Reindeer Team (with Rudolph's Glowing Red Nose & Magic Stardust!)
function createFlyingSantaSleigh(THREE, scale = 1.0) {
  const fleetGroup = new THREE.Group();

  const sleighRed = new THREE.MeshStandardMaterial({
    color: 0xc62828,
    emissive: 0x330505,
    roughness: 0.3,
    metalness: 0.25
  });
  const goldTrim = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    emissive: 0x664400,
    roughness: 0.2,
    metalness: 0.85
  });
  const sackMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.85 });
  const deerFurMat = new THREE.MeshStandardMaterial({ color: 0x795548, roughness: 0.75 });
  const antlerMat = new THREE.MeshStandardMaterial({ color: 0xd7ccc8, roughness: 0.6 });

  // --- SLEIGH BODY ---
  const sleighGroup = new THREE.Group();

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.4, 4.4), sleighRed);
  cabin.position.set(0, 1.2, 0);
  sleighGroup.add(cabin);

  // Curved front hood of sleigh
  const frontCurve = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 2.8, 12, 1, false, 0, Math.PI), sleighRed);
  frontCurve.rotation.z = Math.PI / 2;
  frontCurve.position.set(0, 1.4, 2.2);
  sleighGroup.add(frontCurve);

  // Golden Sleigh Runners (Skis)
  [-1.2, 1.2].forEach(rx => {
    const runner = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 6.2), goldTrim);
    runner.position.set(rx, 0.15, 0.4);
    sleighGroup.add(runner);

    const curl = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.09, 8, 16, Math.PI), goldTrim);
    curl.rotation.y = Math.PI / 2;
    curl.position.set(rx, 0.7, 3.4);
    sleighGroup.add(curl);

    // Gold struts
    [-1.4, 1.2].forEach(rz => {
      const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.9, 6), goldTrim);
      strut.position.set(rx, 0.6, rz);
      sleighGroup.add(strut);
    });
  });

  // Golden Side Trim Rails
  [-1.44, 1.44].forEach(sx => {
    const trim = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 4.6), goldTrim);
    trim.position.set(sx, 1.85, 0);
    sleighGroup.add(trim);
  });

  // Santa Claus Riding in the Sleigh!
  const santa = createSantaClausModel(THREE, 1.15);
  santa.position.set(0, 1.2, 0.5);
  sleighGroup.add(santa);

  // Giant Toy Sack & Colorful Gifts in Back of Sleigh
  const toySack = new THREE.Mesh(new THREE.SphereGeometry(1.35, 12, 12), sackMat);
  toySack.scale.set(1.0, 1.2, 0.95);
  toySack.position.set(0, 2.3, -1.25);
  sleighGroup.add(toySack);

  // Warm Magical Lantern Glow on Sleigh
  const sleighLight = new THREE.PointLight(0xffdd77, 2.6, 55);
  sleighLight.position.set(0, 3.5, 1.0);
  sleighGroup.add(sleighLight);

  fleetGroup.add(sleighGroup);

  // --- REINDEER TEAM (6 Paired Reindeer + RUDOLPH at the Lead!) ---
  const reindeerList = [];
  const makeReindeer = (isRudolph) => {
    const deer = new THREE.Group();

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.7, 1.65), deerFurMat);
    torso.position.y = 1.15;
    deer.add(torso);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.85, 8), deerFurMat);
    neck.position.set(0, 1.65, 0.68);
    neck.rotation.x = 0.35;
    deer.add(neck);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.72), deerFurMat);
    head.position.set(0, 2.02, 0.98);
    deer.add(head);

    // Nose (Bright Glowing Red for Rudolph!)
    const noseMat = isRudolph
      ? new THREE.MeshBasicMaterial({ color: 0xff1744 })
      : new THREE.MeshStandardMaterial({ color: 0x212121 });
    const nose = new THREE.Mesh(new THREE.SphereGeometry(isRudolph ? 0.16 : 0.09, 10, 10), noseMat);
    nose.position.set(0, 2.04, 1.38);
    deer.add(nose);

    if (isRudolph) {
      const noseLight = new THREE.PointLight(0xff1744, 2.2, 25);
      noseLight.position.set(0, 2.04, 1.5);
      deer.add(noseLight);
    }

    // Antlers
    [-0.18, 0.18].forEach(ax => {
      const antler = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.75, 5), antlerMat);
      antler.position.set(ax, 2.48, 0.85);
      antler.rotation.z = ax > 0 ? -0.35 : 0.35;
      deer.add(antler);
    });

    // 4 Legs
    const legs = [];
    [
      [-0.22, 0.55],
      [0.22, 0.55],
      [-0.22, -0.55],
      [0.22, -0.55]
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.95, 6), deerFurMat);
      leg.position.set(lx, 0.55, lz);
      deer.add(leg);
      legs.push(leg);
    });

    deer.userData = { legs };
    return deer;
  };

  for (let row = 1; row <= 3; row++) {
    [-1.15, 1.15].forEach((rx, sideIdx) => {
      const d = makeReindeer(false);
      d.position.set(rx, 0, row * 3.8 + 1.5);
      fleetGroup.add(d);
      reindeerList.push({ mesh: d, phase: row * 1.1 + sideIdx * 0.5, baseY: 0 });
    });
  }

  // Rudolph at the very front!
  const rudolph = makeReindeer(true);
  rudolph.position.set(0, 0.2, 16.5);
  fleetGroup.add(rudolph);
  reindeerList.push({ mesh: rudolph, phase: 0, baseY: 0.2 });

  // Golden Reins connecting Sleigh to Rudolph
  [-0.9, 0.9].forEach(rx => {
    const rein = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 15.5, 6), goldTrim);
    rein.rotation.x = Math.PI / 2;
    rein.position.set(rx * 0.6, 1.5, 8.5);
    fleetGroup.add(rein);
  });

  // Magical Golden Stardust Trail behind the Sleigh!
  const dustSpheres = [];
  const dustGeo = new THREE.SphereGeometry(0.24, 6, 6);
  for (let i = 0; i < 32; i++) {
    const dMat = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? 0xffe066 : 0xff99cc,
      transparent: true,
      opacity: 1 - i / 32
    });
    const sp = new THREE.Mesh(dustGeo, dMat);
    sp.position.set(
      (Math.sin(i * 1.7) * 1.4),
      1.2 + Math.cos(i * 1.3) * 0.6,
      -2.6 - i * 0.85
    );
    fleetGroup.add(sp);
    dustSpheres.push(sp);
  }

  fleetGroup.scale.setScalar(scale);

  fleetGroup.userData = {
    santa,
    reindeerList,
    dustSpheres,
    update(delta, time) {
      // Santa waving
      if (santa.userData.rightArm) {
        santa.userData.rightArm.rotation.z = -0.55 + Math.sin(time * 5.0) * 0.35;
      }
      // Reindeer galloping motion
      reindeerList.forEach(item => {
        const p = time * 8.0 + item.phase;
        item.mesh.position.y = item.baseY + Math.sin(p) * 0.25;
        item.mesh.rotation.x = Math.cos(p) * 0.14;
        item.mesh.userData.legs.forEach((leg, lIdx) => {
          leg.rotation.x = Math.sin(p + (lIdx < 2 ? 0 : Math.PI)) * 0.65;
        });
      });
      // Sparkling stardust trail
      dustSpheres.forEach((sp, idx) => {
        sp.position.y = 1.2 + Math.sin(time * 6.0 + idx * 0.5) * 0.45;
        const s = 0.6 + 0.5 * Math.sin(time * 8.0 + idx);
        sp.scale.setScalar(s * (1 - idx / 36));
      });
    }
  };

  return fleetGroup;
}

// 6. Magical Christmas Eve Night Sky: Giant Glowing Full Moon, Stars & Shimmering Aurora Borealis!
function createSantaWonderlandSky(THREE, courseLength = 220) {
  const skyGroup = new THREE.Group();

  // A. Giant Glowing Full Moon (Ahead in the sky so Santa's Sleigh flies across it!)
  const moonGroup = new THREE.Group();
  moonGroup.position.set(-38, 68, courseLength * 0.75 + 70);

  const moonMesh = new THREE.Mesh(
    new THREE.SphereGeometry(16, 24, 24),
    new THREE.MeshBasicMaterial({ color: 0xfff8d6 })
  );
  moonGroup.add(moonMesh);

  // Moon Halo Glow
  const haloCanvas = document.createElement('canvas');
  haloCanvas.width = 256;
  haloCanvas.height = 256;
  const ctx = haloCanvas.getContext('2d');
  const grad = ctx.createRadialGradient(128, 128, 18, 128, 128, 128);
  grad.addColorStop(0, 'rgba(255, 250, 210, 0.95)');
  grad.addColorStop(0.35, 'rgba(255, 225, 130, 0.45)');
  grad.addColorStop(1, 'rgba(255, 200, 80, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const haloTex = new THREE.CanvasTexture(haloCanvas);
  const haloSprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: haloTex, transparent: true, blending: THREE.AdditiveBlending })
  );
  haloSprite.scale.set(78, 78, 1);
  moonGroup.add(haloSprite);

  skyGroup.add(moonGroup);

  // B. 1,800 Twinkling Starlight Dome
  const starCount = 1800;
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.45;
    const r = 260 + Math.random() * 80;
    starPos[i * 3 + 0] = Math.sin(phi) * Math.cos(theta) * r;
    starPos[i * 3 + 1] = Math.cos(phi) * r * 0.65 + 25;
    starPos[i * 3 + 2] = (courseLength * 0.5) + Math.sin(phi) * Math.sin(theta) * r;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xfff8e7,
    size: 1.15,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending
  });
  const stars = new THREE.Points(starGeo, starMat);
  skyGroup.add(stars);

  // C. Shimmering Aurora Borealis Ribbons across the Heavens!
  const auroraRibbons = [];
  const auroraCols = [0x00ffaa, 0x00e5ff, 0xff44cc, 0x55ff99];

  for (let a = 0; a < 4; a++) {
    const pts = [];
    const zStart = -40 + a * 45;
    for (let k = 0; k <= 24; k++) {
      const t = k / 24;
      const ax = (t - 0.5) * 260 + Math.sin(t * Math.PI * 3 + a) * 25;
      const ay = 58 + a * 7 + Math.cos(t * Math.PI * 2 + a) * 6;
      const az = zStart + t * (courseLength + 90) * 0.6 + Math.sin(t * Math.PI * 2) * 30;
      pts.push(new THREE.Vector3(ax, ay, az));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const tubeGeo = new THREE.TubeGeometry(curve, 48, 3.8, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: auroraCols[a % auroraCols.length],
      transparent: true,
      opacity: 0.24,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const ribbon = new THREE.Mesh(tubeGeo, tubeMat);
    ribbon.scale.set(1, 3.2, 1);
    skyGroup.add(ribbon);
    auroraRibbons.push({ mesh: ribbon, baseY: ribbon.position.y, phase: a * 1.4 });
  }

  skyGroup.userData = {
    auroraRibbons,
    update(delta, time) {
      auroraRibbons.forEach((ar, idx) => {
        ar.mesh.position.x = Math.sin(time * 0.4 + ar.phase) * 6.0;
        ar.mesh.material.opacity = 0.18 + 0.10 * Math.sin(time * 1.2 + idx);
      });
    }
  };

  return skyGroup;
}

// 7. Cozy Santa's North Pole Log Cabin / Toy Workshop (with Warm Lit Windows & Snow Roof)
function createChristmasCabin(THREE, scale = 1.0) {
  const cabin = new THREE.Group();

  const woodMat = new THREE.MeshStandardMaterial({ color: 0x5d3a1a, roughness: 0.85 });
  const roofSnowMat = new THREE.MeshStandardMaterial({ color: 0xf0f7ff, roughness: 0.45 });
  const warmWindowMat = new THREE.MeshBasicMaterial({ color: 0xffe066 });
  const brickMat = new THREE.MeshStandardMaterial({ color: 0x8d2b2b, roughness: 0.8 });

  // Cabin walls
  const walls = new THREE.Mesh(new THREE.BoxGeometry(5.6, 3.6, 4.8), woodMat);
  walls.position.y = 1.8;
  cabin.add(walls);

  // Snow-covered Pitched Roof
  const roof = new THREE.Mesh(new THREE.ConeGeometry(4.8, 2.8, 4), roofSnowMat);
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 4.9;
  cabin.add(roof);

  // Brick Chimney
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.4, 0.9), brickMat);
  chimney.position.set(1.6, 5.2, -0.8);
  cabin.add(chimney);

  // Warm Glowing Windows (Front, Back & Sides)
  [-1.4, 1.4].forEach(wx => {
    const winFront = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), warmWindowMat);
    winFront.position.set(wx, 2.0, 2.42);
    cabin.add(winFront);

    const winBack = winFront.clone();
    winBack.rotation.y = Math.PI;
    winBack.position.set(wx, 2.0, -2.42);
    cabin.add(winBack);
  });

  cabin.scale.setScalar(scale);
  return cabin;
}

// 8. Cute 3D Christmas Snowman ("雪だるま")
function createSnowman(THREE, scale = 1.0) {
  const sm = new THREE.Group();
  const snowMat = new THREE.MeshStandardMaterial({ color: 0xf8fbff, roughness: 0.4 });
  const redMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.5 });
  const hatMat = new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.6 });
  const orangeMat = new THREE.MeshStandardMaterial({ color: 0xff6d00, roughness: 0.5 });

  const bot = new THREE.Mesh(new THREE.SphereGeometry(0.95, 12, 12), snowMat);
  bot.position.y = 0.85;
  sm.add(bot);

  const mid = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 12), snowMat);
  mid.position.y = 2.15;
  sm.add(mid);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), snowMat);
  head.position.y = 3.15;
  sm.add(head);

  // Red Scarf
  const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.12, 8, 14), redMat);
  scarf.rotation.x = Math.PI / 2;
  scarf.position.y = 2.72;
  sm.add(scarf);

  // Carrot Nose
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.45, 8), orangeMat);
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 3.15, 0.58);
  sm.add(nose);

  // Top Hat
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.08, 12), hatMat);
  brim.position.y = 3.58;
  sm.add(brim);
  const topHat = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.55, 12), hatMat);
  topHat.position.y = 3.88;
  sm.add(topHat);

  sm.scale.setScalar(scale);
  return sm;
}

window.createTextCanvas = createTextCanvas;
window.createRealisticChristmasTree = createRealisticChristmasTree;
window.createGoalArchway = createGoalArchway;
window.createSnowyPineTree = createSnowyPineTree;
window.createSantaClausModel = createSantaClausModel;
window.createFlyingSantaSleigh = createFlyingSantaSleigh;
window.createSantaWonderlandSky = createSantaWonderlandSky;
window.createChristmasCabin = createChristmasCabin;
window.createSnowman = createSnowman;
