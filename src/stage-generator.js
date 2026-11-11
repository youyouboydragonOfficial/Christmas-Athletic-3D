// stage-generator.js - Full Snowy Valley Landscape + Iconic Multi-Route Athletic Course (Stages 1 to 1000)

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
    const themes = [
      {
        name: 'CHRISTMAS ATHLETIC',
        sub: '雪の渓谷・ツインルートアスレチック',
        skyTop: 0x1b2448,
        fog: 0x3b3d68,
        light: 0xffe4c4,
        gimmickDesc: '雪の足場・巨大プレゼント登攀・雪の結晶大ジャンプ・キャンディ動く床'
      },
      {
        name: 'CANDY CANE CANYON',
        sub: 'キャンディケーン渓谷の空中ブランコ',
        skyTop: 0x281845,
        fog: 0x4a2c6b,
        light: 0xffd6e8,
        gimmickDesc: '高速キャンディ動く床・回転キャンディバー・連続吊り橋'
      },
      {
        name: 'SNOWFLAKE CITADEL',
        sub: '氷晶の要塞とスーパージャンプ',
        skyTop: 0x0f253e,
        fog: 0x23496d,
        light: 0xd0f0ff,
        gimmickDesc: '連続雪の結晶ジャンプ台・クライミングタワー・氷上ダッシュ'
      },
      {
        name: 'SANTA PEAK FINALE',
        sub: '聖夜の頂・グランドツリークライム',
        skyTop: 0x181538,
        fog: 0x34285a,
        light: 0xfff0b8,
        gimmickDesc: '立体プレゼント要塞・高速動く床・超長距離アスレチック'
      }
    ];

    const theme = themes[(stageNum - 1) % themes.length];
    return {
      stageNum,
      title: `STAGE ${stageNum}: ${theme.name}`,
      subtitle: theme.sub,
      theme,
      featuredGimmicks: theme.gimmickDesc
    };
  }

  // Creates the continuous Snowy Valley Ground, Distant Mountains, and Pine Forest
  buildValleyEnvironment(stageGroup, courseLength, rand) {
    const THREE = this.THREE;

    const snowGroundMat = new THREE.MeshStandardMaterial({
      color: 0xdce8f7,
      roughness: 0.65,
      metalness: 0.05
    });

    const mountainMat = new THREE.MeshStandardMaterial({
      color: 0x45527a,
      roughness: 0.85,
      flatShading: true
    });

    const snowPeakMat = new THREE.MeshStandardMaterial({
      color: 0xc5d6ec,
      roughness: 0.6,
      flatShading: true
    });

    // 1. Main Valley Snow Floor (Walkable safety floor at y = -5.5)
    const floorLen = courseLength + 180;
    const floorGeo = new THREE.BoxGeometry(220, 2.0, floorLen);
    const floorMesh = new THREE.Mesh(floorGeo, snowGroundMat);
    floorMesh.position.set(0, -6.5, courseLength / 2);
    floorMesh.receiveShadow = true;
    stageGroup.add(floorMesh);

    // Gentle Snow Mounds along the valley floor
    for (let m = 0; m < 28; m++) {
      const mw = 14 + rand() * 22;
      const mh = 2.5 + rand() * 4.5;
      const mound = new THREE.Mesh(
        new THREE.SphereGeometry(mw, 12, 8),
        snowGroundMat
      );
      mound.scale.set(1, mh / mw, 1.3);
      const side = (m % 2 === 0 ? -1 : 1) * (22 + rand() * 45);
      mound.position.set(side, -6.2, -10 + (m / 28) * (courseLength + 80));
      mound.receiveShadow = true;
      stageGroup.add(mound);
    }

    // 2. Distant Mountain Range encircling the valley
    const mountainCount = 32;
    for (let i = 0; i < mountainCount; i++) {
      const ang = (i / mountainCount) * Math.PI * 2;
      const dist = 125 + (i % 3) * 20;
      const mx = Math.sin(ang) * dist;
      const mz = (courseLength * 0.55) + Math.cos(ang) * (dist + courseLength * 0.35);
      const mRadius = 28 + (i % 4) * 9;
      const mHeight = 42 + (i % 5) * 12;

      const mtn = new THREE.Mesh(new THREE.ConeGeometry(mRadius, mHeight, 7), mountainMat);
      mtn.position.set(mx, mHeight * 0.38 - 8, mz);
      stageGroup.add(mtn);

      const cap = new THREE.Mesh(new THREE.ConeGeometry(mRadius * 0.46, mHeight * 0.45, 7), snowPeakMat);
      cap.position.set(mx, mHeight * 0.65 - 8, mz);
      stageGroup.add(cap);
    }

    // 3. Snowy Pine Forest flanking both sides of the athletic course
    const treeCount = 75;
    for (let t = 0; t < treeCount; t++) {
      const side = t % 2 === 0 ? -1 : 1;
      const tx = side * (16 + rand() * 48);
      const tz = -15 + rand() * (courseLength + 65);
      const tScale = 0.85 + rand() * 0.95;

      const pine = window.createSnowyPineTree(THREE, tScale);
      pine.position.set(tx, -5.5, tz);
      stageGroup.add(pine);
    }
  }

  buildStage(stageNum) {
    const THREE = this.THREE;
    const info = this.getStageInfo(stageNum);
    const rand = this.getPRNG(stageNum * 104729 + 777);

    const stageGroup = new THREE.Group();
    const platforms = [];
    const movingObjects = [];
    const hazardObjects = [];
    const collectibles = [];
    const checkpoints = [];
    const guideLabels = [];
    const aiWaypoints = [];

    const addCoinCluster = (x, y, z, count = 3, isSnowflake = false) => {
      for (let i = 0; i < count; i++) {
        const item = this.factory.createCollectible(isSnowflake || i === count - 1);
        item.position.set(x + (i - (count - 1) / 2) * 1.3, y + 1.1, z);
        item.userData.baseY = y + 1.1;
        stageGroup.add(item);
        collectibles.push(item);
      }
    };

    const addBridge = (p1, p2, width = 2.5, isNet = false) => {
      const { bridgeGroup, stepPlatforms } = this.factory.createRopeBridge(p1, p2, width, isNet);
      stageGroup.add(bridgeGroup);
      stepPlatforms.forEach(sp => platforms.push(sp));
    };

    // =========================================================================
    // SECTION 1: Iconic Opening Showcase (Exact Match to the Reference Image!)
    // =========================================================================

    // Start Elevated Snow Deck (Bottom foreground in the screenshot)
    const startPlat = this.factory.createScaffoldingSnowPlatform(9.5, 1.4, 7.5, 6.5);
    startPlat.position.set(0, 0, 0);
    stageGroup.add(startPlat);
    platforms.push(startPlat);
    aiWaypoints.push(new THREE.Vector3(0, 1.0, 0));

    // Left Foreground Wooden Snow Deck ("雪の足場" #1 with Gold Coins)
    const leftDeck1 = this.factory.createScaffoldingSnowPlatform(5.8, 1.2, 4.8, 7.0);
    leftDeck1.position.set(-7.2, 0.8, 7.5);
    stageGroup.add(leftDeck1);
    platforms.push(leftDeck1);
    addCoinCluster(-7.2, 1.4, 7.5, 3, false);

    // Net Ramp connecting Start/LeftDeck1 to Left Elevated Checkpoint Platform
    const leftCheckpointPlat = this.factory.createScaffoldingSnowPlatform(6.0, 1.3, 5.6, 10.0);
    leftCheckpointPlat.position.set(-10.5, 3.8, 16.5);
    stageGroup.add(leftCheckpointPlat);
    platforms.push(leftCheckpointPlat);

    // Glowing CHECKPOINT Gate #1 on Left Elevated Platform
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
    addBridge(new THREE.Vector3(1.5, 0.4, 3.6), new THREE.Vector3(2.5, 0.6, 11.2), 2.4, true);

    // Small Red Present beside Snowflake Pad (just like the screenshot!)
    const sidePresent1 = this.factory.createStackedGiantPresent(3.8, 2.2, 3.8, 1);
    sidePresent1.position.set(-2.2, -0.2, 15.8);
    stageGroup.add(sidePresent1);
    platforms.push(sidePresent1);

    const sidePresent2 = this.factory.createStackedGiantPresent(4.2, 3.2, 4.2, 1);
    sidePresent2.position.set(7.4, 0.2, 12.2);
    stageGroup.add(sidePresent2);
    platforms.push(sidePresent2);

    // Centerpiece: Giant 3D Crystalline Snowflake Jump Pad!
    // Launches player on a high glowing arc towards the Giant Present / Candy Moving Deck!
    const snowflakePad = this.factory.createSnowflakeJumpPad(
      3.9,
      new THREE.Vector3(-1.2, 20.5, 14.5)
    );
    snowflakePad.position.copy(snowflakePos);
    stageGroup.add(snowflakePad);
    platforms.push(snowflakePad);
    addCoinCluster(2.8, 1.2, 14.2, 3, true);
    aiWaypoints.push(new THREE.Vector3(2.8, 1.5, 14.2));

    // Center-Left: Massive Two-Story Stacked Giant Present ("巨大なプレゼント") with Net & Ladder!
    const megaPresent1 = this.factory.createStackedGiantPresent(6.8, 7.6, 6.8, 1);
    megaPresent1.position.set(-3.2, 2.2, 27.5);
    stageGroup.add(megaPresent1);
    platforms.push(megaPresent1);
    aiWaypoints.push(new THREE.Vector3(-3.2, 6.5, 27.5));

    guideLabels.push({
      text: '巨大なプレゼント',
      position: new THREE.Vector3(-3.2, 3.8, 23.0)
    });

    // Suspension Rope Bridge from Left Checkpoint Platform to Mega Present!
    addBridge(
      new THREE.Vector3(-7.6, 4.2, 18.0),
      new THREE.Vector3(-5.2, 5.6, 24.2),
      2.4,
      false
    );

    // Right Side: Candy Cane Moving Platform ("動く床") & Second Giant Green Present!
    const candyMoving1 = this.factory.createCandyCaneMovingDeck(
      5.2,
      1.0,
      4.2,
      new THREE.Vector3(4.2, 0, 0),
      1.8 + Math.min(1.5, stageNum * 0.01)
    );
    candyMoving1.position.set(8.8, 2.8, 24.5);
    candyMoving1.userData.origin.copy(candyMoving1.position);
    stageGroup.add(candyMoving1);
    platforms.push(candyMoving1);
    movingObjects.push(candyMoving1);
    addCoinCluster(8.8, 3.5, 24.5, 3, false);

    guideLabels.push({
      text: '動く床',
      position: new THREE.Vector3(12.2, 2.8, 22.0)
    });

    // Giant Green Present on Right behind Moving Deck
    const megaPresent2 = this.factory.createStackedGiantPresent(6.4, 6.8, 6.4, 0);
    megaPresent2.position.set(10.5, 2.4, 34.5);
    stageGroup.add(megaPresent2);
    platforms.push(megaPresent2);

    // Mid-Course Second CHECKPOINT Platform (Center-Back in screenshot)
    const midCheckpointPlat = this.factory.createScaffoldingSnowPlatform(6.5, 1.3, 6.0, 12.0);
    midCheckpointPlat.position.set(-0.5, 5.6, 41.5);
    stageGroup.add(midCheckpointPlat);
    platforms.push(midCheckpointPlat);
    aiWaypoints.push(new THREE.Vector3(-0.5, 6.5, 41.5));

    const cpGate2 = this.factory.createCheckpointGate(4.8, 4.2);
    cpGate2.position.set(-0.5, 6.25, 41.5);
    stageGroup.add(cpGate2);
    checkpoints.push({
      gate: cpGate2,
      position: new THREE.Vector3(-0.5, 7.0, 41.5)
    });

    // Rope Bridges connecting Mega Present 1 & Mega Present 2 to Mid Checkpoint
    addBridge(
      new THREE.Vector3(-3.2, 5.8, 30.8),
      new THREE.Vector3(-1.5, 6.0, 38.6),
      2.4,
      false
    );
    addBridge(
      new THREE.Vector3(8.5, 5.6, 36.5),
      new THREE.Vector3(2.4, 6.0, 40.5),
      2.4,
      false
    );

    // =========================================================================
    // SECTION 2: Stage-Specific Procedural Middle Course (1000 Unique Stages!)
    // =========================================================================
    let curX = -0.5;
    let curY = 5.6;
    let curZ = 41.5;

    // Stage 1 has 4 additional dynamic segments before the Goal Hill; later stages scale up!
    const extraSegments = Math.min(26, 4 + Math.floor(Math.sqrt(stageNum) * 1.6));

    for (let seg = 1; seg <= extraSegments; seg++) {
      const roll = rand();
      const nextX = curX + (rand() - 0.5) * 11.0;
      const nextY = Math.max(2.0, curY + (rand() - 0.32) * 3.2);
      const nextZ = curZ + 9.5 + rand() * 4.5;

      let plat;
      if (roll < 0.25) {
        // Snowflake Super Jump Pad
        const jumpVec = new THREE.Vector3(
          (nextX - curX) * 0.8,
          19.5,
          12.5
        );
        plat = this.factory.createSnowflakeJumpPad(3.5, jumpVec);
      } else if (roll < 0.5) {
        // Candy Cane Moving Deck
        const moveVec = new THREE.Vector3(
          rand() > 0.4 ? 4.5 + rand() * 3.0 : 0,
          rand() <= 0.4 ? 2.8 : 0,
          0
        );
        plat = this.factory.createCandyCaneMovingDeck(
          4.8,
          1.0,
          4.0,
          moveVec,
          1.6 + rand() * 1.2 + Math.min(1.5, stageNum * 0.008)
        );
        plat.userData.origin.set(nextX, nextY, nextZ);
        movingObjects.push(plat);
      } else if (roll < 0.75) {
        // Giant Stacked Climbable Present
        plat = this.factory.createStackedGiantPresent(5.8, 5.6, 5.8, seg + stageNum);
      } else {
        // Scaffolding Snow Platform (with optional spinning sweeper on higher stages!)
        plat = this.factory.createScaffoldingSnowPlatform(5.6, 1.3, 5.4, nextY + 6.0);
        if (stageNum > 1 && rand() < 0.45) {
          const sweeper = this.factory.createSpinningSweeper(5.2, 1.8 + (stageNum % 5) * 0.3);
          sweeper.position.set(nextX, nextY + 1.35, nextZ);
          stageGroup.add(sweeper);
          hazardObjects.push(sweeper);
        }
      }

      plat.position.set(nextX, nextY, nextZ);
      stageGroup.add(plat);
      platforms.push(plat);

      // Connect some segments with Rope Bridges
      if (seg % 3 === 1 && roll >= 0.25) {
        addBridge(
          new THREE.Vector3(curX, curY + 0.4, curZ + 2.5),
          new THREE.Vector3(nextX, nextY + 0.4, nextZ - 2.5),
          2.3,
          seg % 2 === 0
        );
      }

      // Checkpoint every 6 segments on longer stages
      if (seg % 6 === 0) {
        const cp = this.factory.createCheckpointGate(4.6, 4.0);
        cp.position.set(nextX, nextY + 0.65, nextZ);
        stageGroup.add(cp);
        checkpoints.push({
          gate: cp,
          position: new THREE.Vector3(nextX, nextY + 1.5, nextZ)
        });
      }

      addCoinCluster(nextX, nextY + (plat.userData.bounds.h / 2), nextZ, 3, seg % 2 === 0);
      aiWaypoints.push(new THREE.Vector3(nextX, nextY + (plat.userData.bounds.h / 2) + 0.5, nextZ));

      curX = nextX;
      curY = nextY;
      curZ = nextZ;
    }

    // =========================================================================
    // SECTION 3: Snowy Hilltop GOAL! Archway & Grand Christmas Tree Plaza
    // =========================================================================
    const goalHillX = curX * 0.4;
    const goalHillY = curY + 3.2;
    const goalHillZ = curZ + 16.5;

    // Final Approach Bridge / Launch Pad to the Goal Hilltop
    addBridge(
      new THREE.Vector3(curX, curY + 0.5, curZ + 2.5),
      new THREE.Vector3(goalHillX, goalHillY + 0.8, goalHillZ - 9.5),
      3.2,
      false
    );

    // Giant Snowy Hilltop Platform (Matching the top-right hill in the reference image!)
    const hillPlatform = this.factory.createScaffoldingSnowPlatform(24.0, 2.4, 20.0, goalHillY + 7.0);
    hillPlatform.position.set(goalHillX, goalHillY, goalHillZ);
    stageGroup.add(hillPlatform);
    platforms.push(hillPlatform);

    // Visual Rounded Snow Hill Mound around the Goal Platform
    const snowHillMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(13.5, 22.0, goalHillY + 7.0, 18),
      this.factory.snowMat
    );
    snowHillMesh.position.set(goalHillX, (goalHillY - 5.5) / 2, goalHillZ);
    snowHillMesh.receiveShadow = true;
    stageGroup.add(snowHillMesh);

    // 1. Illuminated "GOAL!" Rainbow Archway (Center-Left of Hilltop)
    const goalArch = window.createGoalArchway(THREE, 0.85);
    goalArch.position.set(goalHillX - 3.2, goalHillY + 1.2, goalHillZ - 2.0);
    stageGroup.add(goalArch);

    // 2. Grand Illuminated Realistic Christmas Tree (Right of GOAL! Archway, exact match to image!)
    const goalTree = window.createRealisticChristmasTree(THREE, { scale: 1.25 });
    goalTree.position.set(goalHillX + 6.2, goalHillY + 1.2, goalHillZ + 1.5);
    stageGroup.add(goalTree);

    const goalCenter = new THREE.Vector3(goalHillX - 1.5, goalHillY + 2.5, goalHillZ - 1.0);
    aiWaypoints.push(goalCenter.clone());

    // Build Surrounding Valley, Mountains, and Snowy Forest
    this.buildValleyEnvironment(stageGroup, goalHillZ + 30, rand);

    // Also allow player to climb back up from the valley snow floor (-5.5) via Rescue Jump Pads
    for (let r = 0; r < 4; r++) {
      const rz = 12 + (r / 3) * (goalHillZ - 20);
      const rescuePad = this.factory.createSnowflakeJumpPad(3.2, new THREE.Vector3(0, 23, 8));
      rescuePad.position.set(0, -5.1, rz);
      stageGroup.add(rescuePad);
      platforms.push(rescuePad);
    }

    return {
      stageGroup,
      info,
      startPosition: new THREE.Vector3(0, 2.2, -1.5),
      goalPosition: goalCenter,
      goalArch,
      goalTree,
      platforms,
      movingObjects,
      hazardObjects,
      collectibles,
      checkpoints,
      guideLabels,
      aiWaypoints
    };
  }
}

window.StageGenerator = StageGenerator;
