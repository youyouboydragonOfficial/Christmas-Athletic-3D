// tree.js - Realistic Christmas Tree with Layered Pine Branches, Snow Details, Fairy Lights, and Golden Star

function createRealisticChristmasTree(THREE, options = {}) {
  const treeGroup = new THREE.Group();
  const scale = options.scale || 1.0;
  const isGoalTree = options.isGoal !== false;

  // Materials
  const trunkMaterial = new THREE.MeshStandardMaterial({
    color: 0x3d2817,
    roughness: 0.9,
    metalness: 0.1,
    flatShading: true
  });

  const pineMaterials = [
    new THREE.MeshStandardMaterial({
      color: 0x114221,
      roughness: 0.8,
      metalness: 0.05,
      flatShading: true
    }),
    new THREE.MeshStandardMaterial({
      color: 0x17532b,
      roughness: 0.85,
      metalness: 0.05,
      flatShading: true
    }),
    new THREE.MeshStandardMaterial({
      color: 0x206336,
      roughness: 0.75,
      metalness: 0.05,
      flatShading: true
    })
  ];

  const snowMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5faff,
    roughness: 0.4,
    metalness: 0.1,
    flatShading: true
  });

  // 1. Trunk
  const trunkHeight = 12 * scale;
  const trunkRadius = 0.7 * scale;
  const trunkGeo = new THREE.CylinderGeometry(trunkRadius * 0.7, trunkRadius, trunkHeight, 10);
  const trunkMesh = new THREE.Mesh(trunkGeo, trunkMaterial);
  trunkMesh.position.y = trunkHeight / 2;
  trunkMesh.castShadow = true;
  trunkMesh.receiveShadow = true;
  treeGroup.add(trunkMesh);

  // 2. Realistic Multi-layered Pine Canopy
  const layers = 11;
  const baseRadius = 5.2 * scale;
  const layerHeight = 1.0 * scale;
  const startY = 1.5 * scale;

  for (let i = 0; i < layers; i++) {
    const t = i / (layers - 1); // 0 at bottom, 1 at top
    const radius = baseRadius * Math.pow(1 - t * 0.88, 1.15);
    const yPos = startY + i * layerHeight * 1.05;
    const branchCount = Math.max(6, Math.round(14 * (1 - t * 0.6)));

    // Ring of drooping branches
    for (let b = 0; b < branchCount; b++) {
      const angle = (b / branchCount) * Math.PI * 2 + (i * 0.55);
      const branchLen = radius * (0.85 + Math.random() * 0.3);
      
      const branchGroup = new THREE.Group();
      branchGroup.position.set(0, yPos, 0);
      branchGroup.rotation.y = angle;

      // Primary conical branch frond
      const frondGeo = new THREE.ConeGeometry(branchLen * 0.45, branchLen, 5);
      // Rotate frond to face outward and droop slightly
      frondGeo.translate(0, branchLen / 2, 0);
      frondGeo.rotateX(Math.PI / 2 + 0.22);

      const mat = pineMaterials[(i + b) % pineMaterials.length];
      const frondMesh = new THREE.Mesh(frondGeo, mat);
      frondMesh.castShadow = true;
      frondMesh.receiveShadow = true;
      branchGroup.add(frondMesh);

      // Snow patch on upper surface of branch
      if (Math.random() > 0.15) {
        const snowGeo = new THREE.ConeGeometry(branchLen * 0.38, branchLen * 0.45, 4);
        snowGeo.translate(0, branchLen * 0.25, 0.08 * scale);
        snowGeo.rotateX(Math.PI / 2 + 0.18);
        const snowMesh = new THREE.Mesh(snowGeo, snowMaterial);
        snowMesh.position.y = 0.08 * scale;
        branchGroup.add(snowMesh);
      }

      treeGroup.add(branchGroup);
    }
  }

  // 3. Shiny Glass Baubles & Ornaments
  const ornamentColors = [0xd32f2f, 0xffd700, 0x1976d2, 0xe0e0e0, 0x9c27b0];
  const ornamentMaterials = ornamentColors.map(c => new THREE.MeshStandardMaterial({
    color: c,
    metalness: 0.88,
    roughness: 0.18,
    envMapIntensity: 1.0
  }));

  const baubleGeo = new THREE.SphereGeometry(0.26 * scale, 8, 8);
  const ornamentCount = 55;
  for (let i = 0; i < ornamentCount; i++) {
    const t = 0.08 + (i / ornamentCount) * 0.8;
    const yPos = startY + t * (layers * layerHeight * 1.05);
    const curRadius = baseRadius * Math.pow(1 - t * 0.88, 1.15) * 0.95;
    const angle = i * 2.39996; // Golden angle for natural dispersion

    const ox = Math.cos(angle) * curRadius;
    const oz = Math.sin(angle) * curRadius;

    const bMat = ornamentMaterials[i % ornamentMaterials.length];
    const bauble = new THREE.Mesh(baubleGeo, bMat);
    bauble.position.set(ox, yPos, oz);
    bauble.castShadow = true;
    treeGroup.add(bauble);
  }

  // 4. Twinkling Fairy Lights (Spiral string)
  const lightCount = 110;
  const lightColors = [0xffdd77, 0xff4444, 0x44ff66, 0x44ccff, 0xff88ff];
  const lightSpheres = [];

  const fairyGeo = new THREE.SphereGeometry(0.12 * scale, 6, 6);

  for (let i = 0; i < lightCount; i++) {
    const t = i / lightCount;
    const yPos = startY + 0.5 * scale + t * (layers * layerHeight * 1.0);
    const curRadius = baseRadius * Math.pow(1 - t * 0.88, 1.15) * 1.02;
    const turns = 8.5;
    const angle = t * Math.PI * 2 * turns;

    const lx = Math.cos(angle) * curRadius;
    const lz = Math.sin(angle) * curRadius;

    const col = lightColors[i % lightColors.length];
    const fairyMat = new THREE.MeshStandardMaterial({
      color: col,
      emissive: col,
      emissiveIntensity: 0.85,
      roughness: 0.2
    });

    const lightMesh = new THREE.Mesh(fairyGeo, fairyMat);
    lightMesh.position.set(lx, yPos, lz);
    lightMesh.userData = {
      baseIntensity: 0.85,
      blinkOffset: Math.random() * Math.PI * 2,
      blinkSpeed: 1.5 + Math.random() * 2.0
    };
    lightSpheres.push(lightMesh);
    treeGroup.add(lightMesh);
  }

  // 5. The Golden Bethlehem Star on Top
  const starY = startY + layers * layerHeight * 1.05 + 0.4 * scale;
  const starGroup = new THREE.Group();
  starGroup.position.set(0, starY, 0);

  // 3D 8-Pointed Star
  const starGeo = new THREE.OctahedronGeometry(0.85 * scale, 0);
  starGeo.scale(1, 1.6, 0.4);
  const starMat = new THREE.MeshStandardMaterial({
    color: 0xffe066,
    emissive: 0xffaa00,
    emissiveIntensity: 1.2,
    metalness: 0.8,
    roughness: 0.2
  });
  const starMesh1 = new THREE.Mesh(starGeo, starMat);
  starGroup.add(starMesh1);

  // Second star rotated 45 deg for intricate 8-pointed star look
  const starMesh2 = starMesh1.clone();
  starMesh2.rotation.z = Math.PI / 4;
  starMesh2.scale.set(0.75, 0.75, 0.75);
  starGroup.add(starMesh2);

  // Star core light
  const starLight = new THREE.PointLight(0xffea88, 2.5, 25 * scale);
  starLight.position.set(0, 0, 0);
  starGroup.add(starLight);

  treeGroup.add(starGroup);

  // Expose goal collision target and update animation function
  treeGroup.userData = {
    starGroup: starGroup,
    lightSpheres: lightSpheres,
    goalPosition: new THREE.Vector3(0, starY, 0),
    isGoalTree: isGoalTree,
    update: function(delta, time) {
      // Rotate top star
      if (starGroup) {
        starGroup.rotation.y = time * 1.2;
        const pulse = 1.0 + Math.sin(time * 3.0) * 0.25;
        starMat.emissiveIntensity = 1.0 * pulse;
        starLight.intensity = 2.2 * pulse;
      }
      // Twinkle fairy lights
      for (let j = 0; j < lightSpheres.length; j++) {
        const mesh = lightSpheres[j];
        const val = 0.4 + 0.6 * Math.sin(time * mesh.userData.blinkSpeed + mesh.userData.blinkOffset);
        mesh.material.emissiveIntensity = mesh.userData.baseIntensity * Math.max(0.2, val);
      }
    }
  };

  return treeGroup;
}

window.createRealisticChristmasTree = createRealisticChristmasTree;
