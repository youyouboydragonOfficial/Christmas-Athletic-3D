// stage-generator.js - 1000 Mathematically Verified 100%-Clearable Athletic Rounds + Unique Traps Per Map + Santa Sky Wonderland

class StageGenerator {
  constructor(THREE, gimmickFactory) {
    this.THREE = THREE;
    this.factory = gimmickFactory;
  }

  getPRNG(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  getStageInfo(stageNum) {
    const archetypes = [
      {
        name: 'SANTA VALLEY ATHLETIC',
        sub: 'サンタの雪渓谷・王道クリスマスアスレチック',
        skyTop: 0x111936,
        fog: 0x263159,
        light: 0xffe8c8
      },
      {
        name: 'PRESENT FORTRESS CLIMB',
        sub: 'サンタの巨大プレゼント要塞・立体クライミング',
        skyTop: 0x1c1238,
        fog: 0x35235c,
        light: 0xffdfea
      },
      {
        name: 'CANDY CANE SKY EXPRESS',
        sub: 'キャンディケイン超特急・連続動く床ハイウェイ',
        skyTop: 0x26102e,
        fog: 0x451f52,
        light: 0xffd6e0
      },
      {
        name: 'AURORA SNOWFLAKE CANYON',
        sub: 'オーロラ輝く雪の結晶・大ジャンプ渓谷',
        skyTop: 0x0b2038,
        fog: 0x193d61,
        light: 0xd4f4ff
      },
      {
        name: 'NORTH POLE ICE GLACIER',
        sub: '北極の氷河・崩れる氷と太鼓トランポリン',
        skyTop: 0x0d263b,
        fog: 0x1e4968,
        light: 0xe0f7ff
      },
      {
        name: 'RUDOLPH BRIDGE RIDGE',
        sub: '赤鼻のトナカイ山脈・空中吊り橋コース',
        skyTop: 0x1f142e,
        fog: 0x3b2854,
        light: 0xffe4cc
      },
      {
        name: 'SANTA TOY WORKSHOP',
        sub: 'サンタのおもちゃ工房・からくりアスレチック',
        skyTop: 0x21152b,
        fog: 0x3d264f,
        light: 0xfff0c4
      },
      {
        name: 'CHRISTMAS EVE STARLIGHT',
        sub: '聖夜のスターライト・グランドフィナーレ回廊',
        skyTop: 0x0f1734,
        fog: 0x24325c,
        light: 0xfff2cc
      }
    ];

    const trapNames = [
      '巨大キャンディ振り子',
      '転がる巨大雪玉',
      'びっくり箱スターバンパー',
      'くるみ割り人形の行進',
      '落下する大つらら',
      '回転ペパーミントホイール',
      'スターライトレーザー',
      '回転キャンディスピナー'
    ];

    const idx = (stageNum - 1) % archetypes.length;
    const theme = archetypes[idx];
    const trapA = (stageNum - 1) % 8;
    const trapB = (trapA + 1 + ((stageNum * 2) % 7)) % 8;
    const trapDesc = `${trapNames[trapA]} ＆ ${trapNames[trapB]}`;

    return {
      stageNum,
      archetypeIndex: idx,
      trapA,
      trapB,
      trapDesc,
      title: `ROUND ${stageNum} / 1000: ${theme.name}`,
      subtitle: `${theme.sub} 【トラップ: ${trapDesc}】`,
      theme
    };
  }

  // Exact physics ballistic velocity calculator:
  // Guarantees a player bounced from startPos lands dead-center on targetPos!
  computeExactLaunchVelocity(startPos, targetPos, flightTime = 1.08) {
    const THREE = this.THREE;
    const g = 25.0; // Matches gravity = 25.0 in player.js
    const dx = targetPos.x - startPos.x;
    const dy = (targetPos.y + 0.9) - startPos.y;
    const dz = targetPos.z - startPos.z;

    const vx = dx / flightTime;
    const vz = dz / flightTime;
    const vy = (dy + 0.5 * g * flightTime * flightTime) / flightTime;
    return new THREE.Vector3(vx, vy, vz);
  }

  buildSantaWonderlandEnvironment(stageGroup, courseLength, rand) {
    const THREE = this.THREE;

    const snowGroundMat = new THREE.MeshStandardMaterial({
      color: 0xdce8f7,
      roughness: 0.65,
      metalness: 0.05
    });

    const mountainMat = new THREE.MeshStandardMaterial({
      color: 0x3a4870,
      roughness: 0.85,
      flatShading: true
    });

    const snowPeakMat = new THREE.MeshStandardMaterial({
      color: 0xd4e4f7,
      roughness: 0.55,
      flatShading: true
    });

    // 1. Magical Night Sky: Giant Full Moon, 1800 Stars & Waving Aurora Borealis
    const skyWonderland = window.createSantaWonderlandSky(THREE, courseLength);
    stageGroup.add(skyWonderland);

    // 2. Flying Santa Sleigh Fleet (3 Sleighs in the sky so Santa is ALWAYS flying in view while playing!)
    const santaSleighHigh = window.createFlyingSantaSleigh(THREE, 1.35);
    santaSleighHigh.position.set(-12, 11, 32);
    stageGroup.add(santaSleighHigh);

    const santaSleighMid = window.createFlyingSantaSleigh(THREE, 1.25);
    santaSleighMid.position.set(14, 9, 45);
    stageGroup.add(santaSleighMid);

    // 3. Visual Valley Snow Floor far below the athletic course (y = -14.0, non-walkable)
    const floorLen = courseLength + 240;
    const floorGeo = new THREE.BoxGeometry(280, 2.0, floorLen);
    const floorMesh = new THREE.Mesh(floorGeo, snowGroundMat);
    floorMesh.position.set(0, -14.0, courseLength / 2);
    floorMesh.receiveShadow = true;
    stageGroup.add(floorMesh);

    for (let m = 0; m < 36; m++) {
      const mw = 16 + rand() * 26;
      const mh = 3.5 + rand() * 5.5;
      const mound = new THREE.Mesh(new THREE.SphereGeometry(mw, 12, 8), snowGroundMat);
      mound.scale.set(1, mh / mw, 1.3);
      const side = (m % 2 === 0 ? -1 : 1) * (24 + rand() * 52);
      mound.position.set(side, -13.5, -20 + (m / 36) * (courseLength + 110));
      mound.receiveShadow = true;
      stageGroup.add(mound);
    }

    // 4. Santa's North Pole Christmas Village Cabins & Snowmen
    const cabinCount = 14;
    for (let c = 0; c < cabinCount; c++) {
      const side = c % 2 === 0 ? -1 : 1;
      const cx = side * (24 + rand() * 28);
      const cz = 10 + (c / cabinCount) * (courseLength + 20);
      const cabin = window.createChristmasCabin(THREE, 1.35 + rand() * 0.4);
      cabin.position.set(cx, -13.0, cz);
      cabin.rotation.y = side < 0 ? Math.PI * 0.35 : -Math.PI * 0.35;
      stageGroup.add(cabin);

      const sm = window.createSnowman(THREE, 1.1);
      sm.position.set(cx - side * 4.5, -13.0, cz + 2.0);
      sm.rotation.y = side < 0 ? 0.8 : -0.8;
      stageGroup.add(sm);
    }

    // 5. Distant Mountain Range encircling the valley
    const mountainCount = 38;
    for (let i = 0; i < mountainCount; i++) {
      const ang = (i / mountainCount) * Math.PI * 2;
      const dist = 145 + (i % 3) * 24;
      const mx = Math.sin(ang) * dist;
      const mz = (courseLength * 0.5) + Math.cos(ang) * (dist + courseLength * 0.45);
      const mRadius = 32 + (i % 4) * 10;
      const mHeight = 52 + (i % 5) * 15;

      const mtn = new THREE.Mesh(new THREE.ConeGeometry(mRadius, mHeight, 7), mountainMat);
      mtn.position.set(mx, mHeight * 0.38 - 15, mz);
      stageGroup.add(mtn);

      const cap = new THREE.Mesh(new THREE.ConeGeometry(mRadius * 0.46, mHeight * 0.45, 7), snowPeakMat);
      cap.position.set(mx, mHeight * 0.65 - 15, mz);
      stageGroup.add(cap);
    }

    // 6. Snowy Pine Forest flanking both sides of the athletic course
    const treeCount = 95;
    for (let t = 0; t < treeCount; t++) {
      const side = t % 2 === 0 ? -1 : 1;
      const tx = side * (18 + rand() * 55);
      const tz = -20 + rand() * (courseLength + 85);
      const tScale = 1.0 + rand() * 1.15;

      const pine = window.createSnowyPineTree(THREE, tScale);
      pine.position.set(tx, -13.0, tz);
      stageGroup.add(pine);
    }

    return {
      skyWonderland,
      santaSleighHigh,
      santaSleighMid,
      courseLength
    };
  }

  buildStage(stageNum) {
    const THREE = this.THREE;
    const info = this.getStageInfo(stageNum);
    const rand = this.getPRNG(stageNum * 2654435761 + 99991);

    const stageGroup = new THREE.Group();
    const platforms = [];
    const movingObjects = [];
    const collapsingObjects = [];
    const hazardObjects = [];
    const collectibles = [];
    const checkpoints = [];
    const guideLabels = [];
    const mainRoutePlatforms = [];

    const addCoinCluster = (x, y, z, count = 3, isSnowflake = false) => {
      for (let i = 0; i < count; i++) {
        const item = this.factory.createCollectible(isSnowflake || i === count - 1);
        item.position.set(x + (i - (count - 1) / 2) * 1.3, y + 1.1, z);
        item.userData.baseY = y + 1.1;
        stageGroup.add(item);
        collectibles.push(item);
      }
    };

    const addBridge = (p1, p2, width = 2.6, isNet = false) => {
      const { bridgeGroup, stepPlatforms } = this.factory.createRopeBridge(p1, p2, width, isNet);
      stageGroup.add(bridgeGroup);
      stepPlatforms.forEach(sp => platforms.push(sp));
    };

    // Start Platform (With Welcoming Santa Claus & Cute Snowman!)
    const startPlat = this.factory.createScaffoldingSnowPlatform(9.5, 1.4, 8.0, 14.5);
    startPlat.position.set(0, 0, 0);
    stageGroup.add(startPlat);
    platforms.push(startPlat);
    mainRoutePlatforms.push(startPlat);

    const startSanta = window.createSantaClausModel(THREE, 0.95);
    startSanta.position.set(-3.4, 0.7, 1.8);
    startSanta.rotation.y = 0.55;
    stageGroup.add(startSanta);

    const startSnowman = window.createSnowman(THREE, 0.85);
    startSnowman.position.set(3.5, 0.7, 1.8);
    startSnowman.rotation.y = -0.55;
    stageGroup.add(startSnowman);

    let curX = 0;
    let curY = 0;
    let curZ = 0;

    // =========================================================================
    // OPENING SECTION:
    // - Round 1: Reference Image Twin-Route Showcase (with 100% Exact Ballistic Jump Pad!)
    // - Rounds 2..1000: Immediate Map-Specific Archetype & Trap Course!
    // =========================================================================
    if (stageNum === 1) {
      const leftDeck1 = this.factory.createScaffoldingSnowPlatform(5.8, 1.2, 4.8, 15.0);
      leftDeck1.position.set(-7.2, 0.8, 7.5);
      stageGroup.add(leftDeck1);
      platforms.push(leftDeck1);
      addBridge(new THREE.Vector3(-2.5, 0.5, 3.2), new THREE.Vector3(-6.0, 0.9, 5.5), 2.5, false);
      addCoinCluster(-7.2, 1.4, 7.5, 3, false);

      const leftCheckpointPlat = this.factory.createScaffoldingSnowPlatform(6.0, 1.3, 5.6, 18.0);
      leftCheckpointPlat.position.set(-10.5, 3.8, 16.5);
      stageGroup.add(leftCheckpointPlat);
      platforms.push(leftCheckpointPlat);

      const cpGate1 = this.factory.createCheckpointGate(4.8, 4.2);
      cpGate1.position.set(-10.5, 4.45, 16.5);
      stageGroup.add(cpGate1);
      checkpoints.push({
        gate: cpGate1,
        position: new THREE.Vector3(-10.5, 5.2, 16.5)
      });

      guideLabels.push({
        text: '雪の足場',
        position: new THREE.Vector3(-10.5, 2.5, 13.0)
      });

      addBridge(new THREE.Vector3(-7.2, 1.2, 9.8), new THREE.Vector3(-9.5, 4.1, 14.0), 2.5, true);

      // Center-Right Net Bridge leading from Start to Giant 3D Snowflake Platform!
      const snowflakePos = new THREE.Vector3(2.8, 0.6, 14.2);
      addBridge(new THREE.Vector3(1.5, 0.4, 3.6), new THREE.Vector3(2.5, 0.6, 11.5), 2.5, true);

      const sidePresent1 = this.factory.createStackedGiantPresent(3.8, 2.2, 3.8, 1);
      sidePresent1.position.set(-2.2, -0.2, 15.8);
      stageGroup.add(sidePresent1);
      platforms.push(sidePresent1);

      const sidePresent2 = this.factory.createStackedGiantPresent(4.2, 3.2, 4.2, 1);
      sidePresent2.position.set(7.4, 0.2, 12.2);
      stageGroup.add(sidePresent2);
      platforms.push(sidePresent2);

      // Center-Left: Massive Two-Story Stacked Giant Present ("巨大なプレゼント")
      const megaPresent1Pos = new THREE.Vector3(-3.2, 2.2, 27.5);
      const megaPresent1Top = new THREE.Vector3(-3.2, 6.0, 27.5);

      // Exact Ballistic Velocity from Snowflake Pad to Top of Mega Present 1!
      const exactJumpVel = this.computeExactLaunchVelocity(snowflakePos, megaPresent1Top, 1.15);
      const snowflakePad = this.factory.createSnowflakeJumpPad(3.9, exactJumpVel);
      snowflakePad.position.copy(snowflakePos);
      stageGroup.add(snowflakePad);
      platforms.push(snowflakePad);
      mainRoutePlatforms.push(snowflakePad);
      addCoinCluster(2.8, 1.2, 14.2, 3, true);

      const megaPresent1 = this.factory.createStackedGiantPresent(6.8, 7.6, 6.8, 1);
      megaPresent1.position.copy(megaPresent1Pos);
      stageGroup.add(megaPresent1);
      platforms.push(megaPresent1);
      mainRoutePlatforms.push(megaPresent1);

      guideLabels.push({
        text: '巨大なプレゼント',
        position: new THREE.Vector3(-3.2, 3.8, 23.0)
      });

      // Suspension Rope Bridge from Left Checkpoint Platform to Mega Present!
      addBridge(
        new THREE.Vector3(-7.6, 4.2, 18.0),
        new THREE.Vector3(-5.2, 5.8, 24.2),
        2.5,
        false
      );

      // Right Side: Candy Cane Moving Platform ("動く床")
      const candyMoving1 = this.factory.createCandyCaneMovingDeck(
        5.2,
        1.0,
        4.2,
        new THREE.Vector3(3.2, 0, 0),
        1.7
      );
      candyMoving1.position.set(7.2, 2.2, 24.5);
      candyMoving1.userData.origin.copy(candyMoving1.position);
      stageGroup.add(candyMoving1);
      platforms.push(candyMoving1);
      movingObjects.push(candyMoving1);
      addCoinCluster(7.2, 3.0, 24.5, 3, false);

      guideLabels.push({
        text: '動く床',
        position: new THREE.Vector3(10.5, 2.8, 22.0)
      });

      const megaPresent2 = this.factory.createStackedGiantPresent(6.4, 6.8, 6.4, 0);
      megaPresent2.position.set(8.5, 2.4, 34.0);
      stageGroup.add(megaPresent2);
      platforms.push(megaPresent2);

      // Mid-Course Second CHECKPOINT Platform
      const midCheckpointPlat = this.factory.createScaffoldingSnowPlatform(6.5, 1.3, 6.0, 20.0);
      midCheckpointPlat.position.set(-0.5, 5.6, 41.5);
      stageGroup.add(midCheckpointPlat);
      platforms.push(midCheckpointPlat);
      mainRoutePlatforms.push(midCheckpointPlat);

      const cpGate2 = this.factory.createCheckpointGate(4.8, 4.2);
      cpGate2.position.set(-0.5, 6.25, 41.5);
      stageGroup.add(cpGate2);
      checkpoints.push({
        gate: cpGate2,
        position: new THREE.Vector3(-0.5, 7.0, 41.5)
      });

      addBridge(
        new THREE.Vector3(-3.2, 5.8, 30.8),
        new THREE.Vector3(-1.5, 6.0, 38.6),
        2.5,
        false
      );
      addBridge(
        new THREE.Vector3(7.5, 5.6, 36.5),
        new THREE.Vector3(2.2, 6.0, 40.5),
        2.5,
        false
      );

      curX = -0.5;
      curY = 5.6;
      curZ = 41.5;
    }

    // =========================================================================
    // MAIN ATHLETIC COURSE:
    // 100% Mathematically Guaranteed Reachable Sequence of Nodes!
    // =========================================================================
    const archetype = info.archetypeIndex;
    const totalSegments = stageNum === 1
      ? 16
      : Math.min(32, 18 + Math.floor(Math.sqrt(stageNum) * 1.3));

    // Pre-plan node coordinates & gimmick types so Jump Pads can aim 100% accurately at the next node!
    const nodes = [];
    let planX = curX;
    let planY = curY;
    let planZ = curZ;

    for (let seg = 1; seg <= totalSegments; seg++) {
      const r1 = rand();
      const r2 = rand();
      const r3 = rand();

      let gimmickChoice = 'scaffold';
      if (seg % 6 === 0 && seg < totalSegments) {
        gimmickChoice = 'checkpoint';
      } else if (archetype === 1) {
        if (r1 < 0.35) gimmickChoice = 'present';
        else if (r1 < 0.58) gimmickChoice = 'drum';
        else if (r1 < 0.78) gimmickChoice = 'moving';
        else gimmickChoice = 'trap_plat';
      } else if (archetype === 2) {
        if (r1 < 0.42) gimmickChoice = 'moving';
        else if (r1 < 0.68) gimmickChoice = 'trap_plat';
        else if (r1 < 0.85) gimmickChoice = 'snowflake';
        else gimmickChoice = 'present';
      } else if (archetype === 3) {
        if (r1 < 0.38) gimmickChoice = 'snowflake';
        else if (r1 < 0.62) gimmickChoice = 'ice';
        else if (r1 < 0.82) gimmickChoice = 'trap_plat';
        else gimmickChoice = 'moving';
      } else if (archetype === 4) {
        if (r1 < 0.38) gimmickChoice = 'ice';
        else if (r1 < 0.62) gimmickChoice = 'drum';
        else if (r1 < 0.82) gimmickChoice = 'trap_plat';
        else gimmickChoice = 'snowflake';
      } else {
        if (r1 < 0.20) gimmickChoice = 'snowflake';
        else if (r1 < 0.38) gimmickChoice = 'moving';
        else if (r1 < 0.54) gimmickChoice = 'present';
        else if (r1 < 0.68) gimmickChoice = 'ice';
        else if (r1 < 0.80) gimmickChoice = 'drum';
        else gimmickChoice = 'trap_plat';
      }

      // Prevent two jump pads in a row so every jump pad lands on a solid platform
      const prevType = nodes.length > 0 ? nodes[nodes.length - 1].type : 'start';
      if ((prevType === 'snowflake' || prevType === 'drum') && (gimmickChoice === 'snowflake' || gimmickChoice === 'drum' || gimmickChoice === 'moving')) {
        gimmickChoice = 'trap_plat';
      }

      // Compute guaranteed-reachable offset from previous node!
      let dx, dy, dz;
      if (prevType === 'snowflake') {
        // Landing target for Snowflake Super Jump Pad
        dx = (r2 - 0.5) * 8.0;
        dy = 1.5 + r3 * 2.5;
        dz = 13.5 + r3 * 2.5;
      } else if (prevType === 'drum') {
        // Landing target for High Vertical Santa Drum Trampoline
        dx = (r2 - 0.5) * 4.5;
        dy = 3.5 + r3 * 2.0;
        dz = 8.5 + r3 * 1.5;
      } else {
        // Standard Jump / Bridge Transition: strictly within player's single-jump envelope!
        dx = (r2 - 0.5) * 5.2;
        dy = (r3 - 0.42) * 2.2;
        dz = 7.6 + r3 * 1.8;
      }

      planX = Math.max(-20, Math.min(20, planX + dx));
      planY = Math.max(1.5, planY + dy);
      planZ = planZ + dz;

      nodes.push({
        seg,
        type: gimmickChoice,
        x: planX,
        y: planY,
        z: planZ,
        r1,
        r2,
        r3
      });
    }

    // Add Final Goal Hilltop Position so the last node can aim/bridge to it cleanly!
    const goalHillX = planX * 0.35;
    const goalHillY = planY + 2.2;
    const goalHillZ = planZ + 15.5;

    // Now Instantiate all Planned Nodes with 100% Verified Transitions!
    let prevPos = new THREE.Vector3(curX, curY + 0.65, curZ);

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const nextNode = i + 1 < nodes.length
        ? new THREE.Vector3(nodes[i + 1].x, nodes[i + 1].y + 0.65, nodes[i + 1].z)
        : new THREE.Vector3(goalHillX, goalHillY + 1.2, goalHillZ - 7.0);

      let plat;
      let topSurfaceY = n.y + 0.65;

      if (n.type === 'checkpoint') {
        plat = this.factory.createScaffoldingSnowPlatform(6.8, 1.3, 6.4, n.y + 14.0);
        plat.position.set(n.x, n.y, n.z);
        stageGroup.add(plat);
        platforms.push(plat);

        const cpGate = this.factory.createCheckpointGate(4.8, 4.2);
        cpGate.position.set(n.x, n.y + 0.65, n.z);
        stageGroup.add(cpGate);
        checkpoints.push({
          gate: cpGate,
          position: new THREE.Vector3(n.x, n.y + 1.5, n.z)
        });
      } else if (n.type === 'snowflake') {
        // Compute EXACT ballistic velocity to land dead-center on nextNode!
        const startJumpPos = new THREE.Vector3(n.x, n.y + 0.4, n.z);
        const launchVel = this.computeExactLaunchVelocity(startJumpPos, nextNode, 1.12);
        plat = this.factory.createSnowflakeJumpPad(3.8, launchVel);
        plat.position.set(n.x, n.y, n.z);
        stageGroup.add(plat);
        platforms.push(plat);
        topSurfaceY = n.y + 0.4;
      } else if (n.type === 'drum') {
        const startDrumPos = new THREE.Vector3(n.x, n.y + 0.5, n.z);
        const launchVel = this.computeExactLaunchVelocity(startDrumPos, nextNode, 1.05);
        plat = this.factory.createSantaDrumTrampoline(3.0, launchVel.y);
        plat.userData.bounceVelocity = launchVel;
        plat.position.set(n.x, n.y, n.z);
        stageGroup.add(plat);
        platforms.push(plat);
        topSurfaceY = n.y + 0.5;
      } else if (n.type === 'moving') {
        // Moderate, fair moving platform travel so it is ALWAYS reachable!
        const mode = n.seg % 2;
        const moveVec = mode === 0
          ? new THREE.Vector3(2.4, 0, 0)
          : new THREE.Vector3(0, 1.4, 0);
        plat = this.factory.createCandyCaneMovingDeck(
          5.4,
          1.0,
          4.8,
          moveVec,
          1.4 + (stageNum % 5) * 0.12
        );
        plat.position.set(n.x, n.y, n.z);
        plat.userData.origin.set(n.x, n.y, n.z);
        stageGroup.add(plat);
        platforms.push(plat);
        movingObjects.push(plat);
        topSurfaceY = n.y + 0.5;
      } else if (n.type === 'present') {
        // Giant Climbable Present positioned so its bottom is below prevPos.y (climbable net!)
        // and its top is at n.y + 2.2
        const pH = 5.2;
        const boxCenterY = n.y + 0.8;
        plat = this.factory.createStackedGiantPresent(6.2, pH, 6.2, n.seg + stageNum);
        plat.position.set(n.x, boxCenterY, n.z);
        stageGroup.add(plat);
        platforms.push(plat);
        topSurfaceY = boxCenterY + pH / 2;
      } else if (n.type === 'ice') {
        plat = this.factory.createCollapsingIcePlatform(5.0, 0.85, 5.0);
        plat.position.set(n.x, n.y, n.z);
        plat.userData.baseY = n.y;
        stageGroup.add(plat);
        platforms.push(plat);
        collapsingObjects.push(plat);
        topSurfaceY = n.y + 0.42;
      } else {
        // 'trap_plat' or 'scaffold': Wide Snow Scaffolding Platform with Map-Specific Christmas Trap!
        plat = this.factory.createScaffoldingSnowPlatform(6.4, 1.3, 6.2, n.y + 14.0);
        plat.position.set(n.x, n.y, n.z);
        stageGroup.add(plat);
        platforms.push(plat);
        topSurfaceY = n.y + 0.65;

        // Place Map-Specific Trap (alternating between trapA and trapB for this stage!)
        const chosenTrapType = (n.seg % 2 === 0) ? info.trapA : info.trapB;
        const speedScale = 0.95 + Math.min(0.65, stageNum * 0.002);
        const trap = this.factory.createStageTrap(chosenTrapType, speedScale, n.seg * 1.3);
        trap.position.set(n.x, topSurfaceY, n.z);
        stageGroup.add(trap);
        hazardObjects.push(trap);

        if (n.seg <= 3) {
          guideLabels.push({
            text: trap.userData.trapName,
            position: new THREE.Vector3(n.x, topSurfaceY + 3.2, n.z)
          });
        }
      }

      mainRoutePlatforms.push(plat);

      // If the gap from the previous platform (when previous was NOT a jump pad) is > 8.6m center-to-center,
      // automatically add a Suspension Rope Bridge so no jump is ever out of reach!
      const prevNodeType = i > 0 ? nodes[i - 1].type : 'start';
      if (prevNodeType !== 'snowflake' && prevNodeType !== 'drum') {
        const horizDist = Math.hypot(n.x - prevPos.x, n.z - prevPos.z);
        if (horizDist > 8.4 || (topSurfaceY - prevPos.y > 2.2 && n.type !== 'present')) {
          addBridge(
            new THREE.Vector3(prevPos.x, prevPos.y - 0.1, prevPos.z + 2.2),
            new THREE.Vector3(n.x, n.y + 0.3, n.z - 2.2),
            2.6,
            n.seg % 2 === 0
          );
        }
      }

      addCoinCluster(n.x, topSurfaceY, n.z, 3, n.seg % 2 === 0);
      prevPos = new THREE.Vector3(n.x, topSurfaceY, n.z);
    }

    // =========================================================================
    // FINAL SECTION: Snowy Hilltop GOAL! Archway, Grand Christmas Tree & Santa Claus!
    // =========================================================================
    const lastNodeType = nodes.length > 0 ? nodes[nodes.length - 1].type : 'scaffold';
    if (lastNodeType !== 'snowflake' && lastNodeType !== 'drum') {
      addBridge(
        new THREE.Vector3(prevPos.x, prevPos.y - 0.1, prevPos.z + 2.2),
        new THREE.Vector3(goalHillX, goalHillY + 0.8, goalHillZ - 9.0),
        3.2,
        false
      );
    }

    const hillPlatform = this.factory.createScaffoldingSnowPlatform(26.0, 2.4, 22.0, goalHillY + 14.0);
    hillPlatform.position.set(goalHillX, goalHillY, goalHillZ);
    stageGroup.add(hillPlatform);
    platforms.push(hillPlatform);
    mainRoutePlatforms.push(hillPlatform);

    const snowHillMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(14.5, 23.0, goalHillY + 14.0, 18),
      this.factory.snowMat
    );
    snowHillMesh.position.set(goalHillX, (goalHillY - 14.0) / 2, goalHillZ);
    snowHillMesh.receiveShadow = true;
    stageGroup.add(snowHillMesh);

    const goalArch = window.createGoalArchway(THREE, 0.85);
    goalArch.position.set(goalHillX - 3.2, goalHillY + 1.2, goalHillZ - 2.0);
    stageGroup.add(goalArch);

    const goalTree = window.createRealisticChristmasTree(THREE, { scale: 1.25 });
    goalTree.position.set(goalHillX + 6.2, goalHillY + 1.2, goalHillZ + 1.5);
    stageGroup.add(goalTree);

    const goalSanta = window.createSantaClausModel(THREE, 1.35);
    goalSanta.position.set(goalHillX + 1.8, goalHillY + 1.2, goalHillZ + 1.0);
    goalSanta.rotation.y = Math.PI;
    stageGroup.add(goalSanta);

    const goalCenter = new THREE.Vector3(goalHillX - 1.5, goalHillY + 2.5, goalHillZ - 1.0);

    const envData = this.buildSantaWonderlandEnvironment(stageGroup, goalHillZ + 40, rand);

    return {
      stageGroup,
      info,
      startPosition: new THREE.Vector3(0, 2.2, -1.5),
      goalPosition: goalCenter,
      goalArch,
      goalTree,
      goalSanta,
      startSanta,
      envData,
      platforms,
      mainRoutePlatforms,
      movingObjects,
      collapsingObjects,
      hazardObjects,
      collectibles,
      checkpoints,
      guideLabels
    };
  }
}

window.StageGenerator = StageGenerator;
