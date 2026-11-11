// stage-generator.js - 1000 Unique Long-Form Athletic Rounds + Santa Claus Wonderland Sky, Flying Sleighs & Village

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
        sub: 'サンタの雪渓谷・ツインルートアスレチック',
        skyTop: 0x111936,
        fog: 0x263159,
        light: 0xffe8c8
      },
      {
        name: 'PRESENT FORTRESS CLIMB',
        sub: 'サンタの巨大プレゼント要塞・立体登攀',
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
        sub: '赤鼻のトナカイ山脈・空中吊り橋と回転バー',
        skyTop: 0x1f142e,
        fog: 0x3b2854,
        light: 0xffe4cc
      },
      {
        name: 'SANTA TOY WORKSHOP',
        sub: 'サンタのおもちゃ工房・大仕掛けアスレチック',
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

    const idx = (stageNum - 1) % archetypes.length;
    const theme = archetypes[idx];
    return {
      stageNum,
      archetypeIndex: idx,
      title: `ROUND ${stageNum} / 1000: ${theme.name}`,
      subtitle: theme.sub,
      theme
    };
  }

  // Builds the Magical Santa Claus Wonderland Background:
  // - Full Moon + Twinkling Stars + Shimmering Aurora Borealis
  // - Flying Santa Claus Sleighs with 6 Reindeer + Rudolph (glowing red nose!)
  // - Cozy Lit Santa's Village Log Cabins, Illuminated Christmas Trees, Snowmen, and Snowy Mountains
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

    // 2. Flying Santa Sleighs with Reindeer & Rudolph in the Sky!
    const santaSleighHigh = window.createFlyingSantaSleigh(THREE, 1.45);
    santaSleighHigh.position.set(-25, 34, 45);
    stageGroup.add(santaSleighHigh);

    const santaSleighMid = window.createFlyingSantaSleigh(THREE, 1.25);
    santaSleighMid.position.set(28, 26, courseLength * 0.55);
    stageGroup.add(santaSleighMid);

    // 3. Visual Valley Snow Floor far below the athletic course (y = -14.0, non-walkable)
    const floorLen = courseLength + 240;
    const floorGeo = new THREE.BoxGeometry(280, 2.0, floorLen);
    const floorMesh = new THREE.Mesh(floorGeo, snowGroundMat);
    floorMesh.position.set(0, -14.0, courseLength / 2);
    floorMesh.receiveShadow = true;
    stageGroup.add(floorMesh);

    // Snow Hills along the valley
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

    // 4. Santa's North Pole Christmas Village Cabins, Illuminated Village Trees & Snowmen!
    const cabinCount = 14;
    for (let c = 0; c < cabinCount; c++) {
      const side = c % 2 === 0 ? -1 : 1;
      const cx = side * (24 + rand() * 28);
      const cz = 10 + (c / cabinCount) * (courseLength + 20);
      const cabin = window.createChristmasCabin(THREE, 1.35 + rand() * 0.4);
      cabin.position.set(cx, -13.0, cz);
      cabin.rotation.y = side < 0 ? Math.PI * 0.35 : -Math.PI * 0.35;
      stageGroup.add(cabin);

      // Cute Snowman outside each cabin
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

    // Start Platform (With Welcoming Santa Claus & Cute Snowman!)
    const startPlat = this.factory.createScaffoldingSnowPlatform(9.5, 1.4, 8.0, 14.5);
    startPlat.position.set(0, 0, 0);
    stageGroup.add(startPlat);
    platforms.push(startPlat);

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
    // - Round 1 features the Reference Image Twin-Route Showcase
    // - Rounds 2..1000 immediately launch into their unique Archetype Opening!
    // =========================================================================
    if (stageNum === 1) {
      const leftDeck1 = this.factory.createScaffoldingSnowPlatform(5.8, 1.2, 4.8, 15.0);
      leftDeck1.position.set(-7.2, 0.8, 7.5);
      stageGroup.add(leftDeck1);
      platforms.push(leftDeck1);
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

      const snowflakePos = new THREE.Vector3(2.8, 0.6, 14.2);
      addBridge(new THREE.Vector3(1.5, 0.4, 3.6), new THREE.Vector3(2.5, 0.6, 11.2), 2.4, true);

      const sidePresent1 = this.factory.createStackedGiantPresent(3.8, 2.2, 3.8, 1);
      sidePresent1.position.set(-2.2, -0.2, 15.8);
      stageGroup.add(sidePresent1);
      platforms.push(sidePresent1);

      const sidePresent2 = this.factory.createStackedGiantPresent(4.2, 3.2, 4.2, 1);
      sidePresent2.position.set(7.4, 0.2, 12.2);
      stageGroup.add(sidePresent2);
      platforms.push(sidePresent2);

      const snowflakePad = this.factory.createSnowflakeJumpPad(
        3.9,
        new THREE.Vector3(-1.2, 20.5, 14.5)
      );
      snowflakePad.position.copy(snowflakePos);
      stageGroup.add(snowflakePad);
      platforms.push(snowflakePad);
      addCoinCluster(2.8, 1.2, 14.2, 3, true);

      const megaPresent1 = this.factory.createStackedGiantPresent(6.8, 7.6, 6.8, 1);
      megaPresent1.position.set(-3.2, 2.2, 27.5);
      stageGroup.add(megaPresent1);
      platforms.push(megaPresent1);

      guideLabels.push({
        text: '巨大なプレゼント',
        position: new THREE.Vector3(-3.2, 3.8, 23.0)
      });

      addBridge(
        new THREE.Vector3(-7.6, 4.2, 18.0),
        new THREE.Vector3(-5.2, 5.6, 24.2),
        2.4,
        false
      );

      const candyMoving1 = this.factory.createCandyCaneMovingDeck(
        5.2,
        1.0,
        4.2,
        new THREE.Vector3(4.2, 0, 0),
        1.9
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

      const megaPresent2 = this.factory.createStackedGiantPresent(6.4, 6.8, 6.4, 0);
      megaPresent2.position.set(10.5, 2.4, 34.5);
      stageGroup.add(megaPresent2);
      platforms.push(megaPresent2);

      const midCheckpointPlat = this.factory.createScaffoldingSnowPlatform(6.5, 1.3, 6.0, 20.0);
      midCheckpointPlat.position.set(-0.5, 5.6, 41.5);
      stageGroup.add(midCheckpointPlat);
      platforms.push(midCheckpointPlat);

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
        2.4,
        false
      );
      addBridge(
        new THREE.Vector3(8.5, 5.6, 36.5),
        new THREE.Vector3(2.4, 6.0, 40.5),
        2.4,
        false
      );

      curX = -0.5;
      curY = 5.6;
      curZ = 41.5;
    }

    // =========================================================================
    // MAIN ATHLETIC COURSE: Long, Varied, Multi-Checkpoint Course (18 to 32 Segments!)
    // Every round has its own Archetype Bias + Unique Seed so no two rounds repeat!
    // =========================================================================
    const archetype = info.archetypeIndex;
    const totalSegments = stageNum === 1
      ? 16
      : Math.min(34, 20 + Math.floor(Math.sqrt(stageNum) * 1.4));

    for (let seg = 1; seg <= totalSegments; seg++) {
      const r1 = rand();
      const r2 = rand();
      const r3 = rand();

      // Determine next platform coordinates with exciting zig-zags & vertical climbs
      const lateralSpread = 12.0 + (archetype % 3) * 2.5;
      const nextX = Math.max(-22, Math.min(22, curX + (r1 - 0.5) * lateralSpread));
      let nextY = Math.max(1.5, curY + (r2 - 0.36) * 3.8);
      let nextZ = curZ + 9.2 + r3 * 4.2;

      // Choose Gimmick Type based on Round Archetype + Random Roll
      let gimmickChoice = 'scaffold';
      if (archetype === 1) {
        // Present Fortress Climb: Heavy on Stacked Climbable Presents & Drum Trampolines
        if (r1 < 0.42) gimmickChoice = 'present';
        else if (r1 < 0.65) gimmickChoice = 'drum';
        else if (r1 < 0.82) gimmickChoice = 'moving';
        else gimmickChoice = 'snowflake';
      } else if (archetype === 2) {
        // Candy Cane Express: Heavy on Moving Candy Decks & Spinning Hazards
        if (r1 < 0.48) gimmickChoice = 'moving';
        else if (r1 < 0.68) gimmickChoice = 'scaffold_sweeper';
        else if (r1 < 0.85) gimmickChoice = 'snowflake';
        else gimmickChoice = 'present';
      } else if (archetype === 3) {
        // Aurora Snowflake Canyon: Heavy on Long Snowflake Super Jumps & Moving Decks
        if (r1 < 0.44) gimmickChoice = 'snowflake';
        else if (r1 < 0.68) gimmickChoice = 'ice';
        else if (r1 < 0.85) gimmickChoice = 'moving';
        else gimmickChoice = 'present';
      } else if (archetype === 4) {
        // North Pole Ice Glacier: Heavy on Collapsing Ice & Santa Drums
        if (r1 < 0.42) gimmickChoice = 'ice';
        else if (r1 < 0.66) gimmickChoice = 'drum';
        else if (r1 < 0.84) gimmickChoice = 'snowflake';
        else gimmickChoice = 'moving';
      } else {
        // Balanced Grand Mix
        if (r1 < 0.22) gimmickChoice = 'snowflake';
        else if (r1 < 0.44) gimmickChoice = 'moving';
        else if (r1 < 0.62) gimmickChoice = 'present';
        else if (r1 < 0.76) gimmickChoice = 'ice';
        else if (r1 < 0.88) gimmickChoice = 'drum';
        else gimmickChoice = 'scaffold_sweeper';
      }

      // Every 6th segment is a guaranteed Checkpoint Platform!
      if (seg % 6 === 0 && seg < totalSegments) {
        gimmickChoice = 'checkpoint';
      }

      let plat;
      if (gimmickChoice === 'checkpoint') {
        plat = this.factory.createScaffoldingSnowPlatform(6.6, 1.3, 6.2, nextY + 14.0);
        plat.position.set(nextX, nextY, nextZ);
        stageGroup.add(plat);
        platforms.push(plat);

        const cpGate = this.factory.createCheckpointGate(4.8, 4.2);
        cpGate.position.set(nextX, nextY + 0.65, nextZ);
        stageGroup.add(cpGate);
        checkpoints.push({
          gate: cpGate,
          position: new THREE.Vector3(nextX, nextY + 1.5, nextZ)
        });
      } else if (gimmickChoice === 'snowflake') {
        const jumpVec = new THREE.Vector3(
          (rand() - 0.5) * 6.0,
          20.0 + rand() * 3.0,
          13.5 + rand() * 3.0
        );
        plat = this.factory.createSnowflakeJumpPad(3.6, jumpVec);
        plat.position.set(nextX, nextY, nextZ);
        stageGroup.add(plat);
        platforms.push(plat);
        nextZ += 3.5; // Extra forward clearance after jump pad
      } else if (gimmickChoice === 'moving') {
        const mode = seg % 3;
        const moveVec = mode === 0
          ? new THREE.Vector3(4.5 + rand() * 3.5, 0, 0)
          : (mode === 1 ? new THREE.Vector3(0, 3.2, 0) : new THREE.Vector3(3.2, 1.8, 2.0));
        plat = this.factory.createCandyCaneMovingDeck(
          4.8,
          1.0,
          4.2,
          moveVec,
          1.6 + rand() * 1.1 + Math.min(1.4, stageNum * 0.005)
        );
        plat.position.set(nextX, nextY, nextZ);
        plat.userData.origin.set(nextX, nextY, nextZ);
        stageGroup.add(plat);
        platforms.push(plat);
        movingObjects.push(plat);
      } else if (gimmickChoice === 'present') {
        const pH = 5.4 + (seg % 3) * 1.4;
        plat = this.factory.createStackedGiantPresent(6.0, pH, 6.0, seg + stageNum);
        plat.position.set(nextX, nextY, nextZ);
        stageGroup.add(plat);
        platforms.push(plat);
        nextY += pH * 0.38;
      } else if (gimmickChoice === 'ice') {
        plat = this.factory.createCollapsingIcePlatform(4.5, 0.85, 4.5);
        plat.position.set(nextX, nextY, nextZ);
        plat.userData.baseY = nextY;
        stageGroup.add(plat);
        platforms.push(plat);
        collapsingObjects.push(plat);
      } else if (gimmickChoice === 'drum') {
        plat = this.factory.createSantaDrumTrampoline(2.9, 22.0);
        plat.position.set(nextX, nextY, nextZ);
        stageGroup.add(plat);
        platforms.push(plat);
        nextY += 3.5;
      } else {
        plat = this.factory.createScaffoldingSnowPlatform(5.8, 1.3, 5.6, nextY + 14.0);
        plat.position.set(nextX, nextY, nextZ);
        stageGroup.add(plat);
        platforms.push(plat);

        if (r2 < 0.65) {
          const sweeper = this.factory.createSpinningSweeper(5.4, 1.8 + (stageNum % 5) * 0.35);
          sweeper.position.set(nextX, nextY + 1.35, nextZ);
          stageGroup.add(sweeper);
          hazardObjects.push(sweeper);
        }
      }

      // Add floating guide labels on Rounds 2+ for the opening gimmicks too
      if (stageNum > 1 && seg <= 3) {
        const labelMap = {
          present: '巨大なプレゼント',
          moving: '動く床',
          snowflake: '雪の結晶ジャンプ',
          ice: '氷の崩れる足場',
          drum: 'サンタの太鼓トランポリン',
          scaffold_sweeper: '雪の足場'
        };
        if (labelMap[gimmickChoice]) {
          guideLabels.push({
            text: labelMap[gimmickChoice],
            position: new THREE.Vector3(nextX, nextY + 2.6, nextZ - 2.0)
          });
        }
      }

      // Connect wider or steeper gaps with Suspension Rope Bridges
      const distXZ = Math.hypot(nextX - curX, nextZ - curZ);
      if (distXZ > 11.2 && gimmickChoice !== 'snowflake' && gimmickChoice !== 'drum') {
        addBridge(
          new THREE.Vector3(curX, curY + 0.4, curZ + 2.5),
          new THREE.Vector3(nextX, plat.position.y + 0.4, plat.position.z - 2.5),
          2.4,
          seg % 2 === 0
        );
      }

      // Add Collectible Coins & Snowflakes
      addCoinCluster(
        plat.position.x,
        plat.position.y + (plat.userData.bounds.h / 2),
        plat.position.z,
        3,
        seg % 2 === 0
      );

      curX = plat.position.x;
      curY = plat.position.y;
      curZ = plat.position.z;
    }

    // =========================================================================
    // FINAL SECTION: Snowy Hilltop GOAL! Archway, Grand Christmas Tree & Santa Claus!
    // =========================================================================
    const goalHillX = curX * 0.35;
    const goalHillY = curY + 3.2;
    const goalHillZ = curZ + 17.5;

    addBridge(
      new THREE.Vector3(curX, curY + 0.5, curZ + 2.5),
      new THREE.Vector3(goalHillX, goalHillY + 0.8, goalHillZ - 9.5),
      3.2,
      false
    );

    const hillPlatform = this.factory.createScaffoldingSnowPlatform(26.0, 2.4, 22.0, goalHillY + 14.0);
    hillPlatform.position.set(goalHillX, goalHillY, goalHillZ);
    stageGroup.add(hillPlatform);
    platforms.push(hillPlatform);

    const snowHillMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(14.5, 23.0, goalHillY + 14.0, 18),
      this.factory.snowMat
    );
    snowHillMesh.position.set(goalHillX, (goalHillY - 14.0) / 2, goalHillZ);
    snowHillMesh.receiveShadow = true;
    stageGroup.add(snowHillMesh);

    // 1. Illuminated "GOAL!" Rainbow Archway
    const goalArch = window.createGoalArchway(THREE, 0.85);
    goalArch.position.set(goalHillX - 3.2, goalHillY + 1.2, goalHillZ - 2.0);
    stageGroup.add(goalArch);

    // 2. Grand Illuminated Realistic Christmas Tree
    const goalTree = window.createRealisticChristmasTree(THREE, { scale: 1.25 });
    goalTree.position.set(goalHillX + 6.2, goalHillY + 1.2, goalHillZ + 1.5);
    stageGroup.add(goalTree);

    // 3. Santa Claus & Snowmen Celebrating at the Goal Plaza!
    const goalSanta = window.createSantaClausModel(THREE, 1.35);
    goalSanta.position.set(goalHillX + 1.8, goalHillY + 1.2, goalHillZ + 1.0);
    goalSanta.rotation.y = Math.PI;
    stageGroup.add(goalSanta);

    const goalCenter = new THREE.Vector3(goalHillX - 1.5, goalHillY + 2.5, goalHillZ - 1.0);

    // Build Santa's Wonderland Environment (Moon, Aurora, Flying Sleighs, Village, Mountains)
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
