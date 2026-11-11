// tree.js - Realistic Grand Christmas Tree, Snowy Forest Pines, and Illuminated GOAL! Archway

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

// 1. Grand Illuminated Christmas Tree (at the Goal Hilltop)
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

    // Main tier cone with scalloped bottom via low-poly segments + branch fronds
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(r, layerStep * 1.65, 11),
      pineMats[i % pineMats.length]
    );
    cone.position.y = y + layerStep * 0.5;
    cone.rotation.y = i * 0.4;
    cone.castShadow = true;
    cone.receiveShadow = true;
    treeGroup.add(cone);

    // Snow cap ring on branch tips
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

  // Spiraling Golden Garland & Fairy Lights (like the reference image!)
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

// 2. Illuminated "GOAL!" Archway (Matching the Reference Image!)
function createGoalArchway(THREE, scale = 1.0) {
  const archGroup = new THREE.Group();

  const archRadius = 7.5 * scale;
  const tubeRadius = 0.85 * scale;

  // Main Arch Torus (Half ring)
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

  // Rainbow Inner Trim Stripes
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

  // Marquee Light Bulbs along the Arch
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

  // Pillars Bases
  const baseGeo = new THREE.BoxGeometry(2.6 * scale, 1.5 * scale, 2.6 * scale);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0xb71c1c, roughness: 0.5 });
  const baseL = new THREE.Mesh(baseGeo, baseMat);
  baseL.position.set(-archRadius, 0.75 * scale, 0);
  archGroup.add(baseL);

  const baseR = baseL.clone();
  baseR.position.x = archRadius;
  archGroup.add(baseR);

  // Glowing "GOAL!" Banner Sign inside top of the Arch
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

  // Warm Goal Light
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

// 3. Fast Snowy Forest Pine Tree (for Valley Scenery)
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

window.createTextCanvas = createTextCanvas;
window.createRealisticChristmasTree = createRealisticChristmasTree;
window.createGoalArchway = createGoalArchway;
window.createSnowyPineTree = createSnowyPineTree;
