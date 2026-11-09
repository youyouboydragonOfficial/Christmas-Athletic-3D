// stage-generator.js - Procedural 1000+ Stage Generation with Stage-Unique Gimmicks & Themes

class StageGenerator {
  constructor(THREE, gimmickFactory) {
    this.THREE = THREE;
    this.factory = gimmickFactory;
  }

  // Seeded Random Generator (Mulberry32)
  getPRNG(seed) {
    let s = seed >>> 0;
    return function() {
      s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Get metadata for any stage from 1 to 1000+
  getStageInfo(stageNum) {
    const biomes = [
      { name: "Frosty Pine Forest", sky: 0x0f1c30, fog: 0x162b46, light: 0xccddee },
      { name: "Santa's Secret Peaks", sky: 0x181028, fog: 0x2d1e3d, light: 0xffe4cc },
      { name: "Crystal Glacier Falls", sky: 0x0a1a2e, fog: 0x123048, light: 0xbde8ff },
      { name: "Aurora Wonderland", sky: 0x051b24, fog: 0x0a333a, light: 0xafffe0 },
      { name: "Midnight Toy Workshop", sky: 0x200f15, fog: 0x3d1a22, light: 0xffd1ba },
      { name: "The Grand Star Spire", sky: 0x100a26, fog: 0x221344, light: 0xfff0aa }
    ];

    const biomeIdx = Math.floor(((stageNum - 1) % 1000) / 167) % biomes.length;
    const biome = biomes[biomeIdx];

    // Determine featured gimmicks for this stage
    const gimmickTags = [];
    if (stageNum % 2 === 1) gimmickTags.push("Icy Slippery Platforms");
    if (stageNum % 2 === 0 || stageNum > 20) gimmickTags.push("Crumbling Snow");
    if (stageNum % 3 === 0 || stageNum === 1) gimmickTags.push("Trampoline Present Super Jumps");
    if (stageNum % 4 === 0 || stageNum > 50) gimmickTags.push("Moving Sleds");
    if (stageNum % 5 === 0 || stageNum > 100) gimmickTags.push("Rotating Candy Obstacles");
    if (stageNum % 7 === 0 || stageNum > 150) gimmickTags.push("Falling Icicles");
    if (stageNum % 10 === 0) gimmickTags.push("Blizzard Crosswinds");

    if (gimmickTags.length === 0) {
      gimmickTags.push("Snow Ascents & Bounces");
    }

    return {
      stageNum: stageNum,
      title: `Stage ${stageNum}: ${biome.name}`,
      biome: biome,
      featuredGimmicks: gimmickTags.slice(0, 3).join(" • "),
      parTime: Math.min(180, 25 + Math.floor(stageNum * 0.15))
    };
  }

  // Generate Stage Mesh, Platforms, and Interactive Objects
  buildStage(stageNum) {
    const THREE = this.THREE;
    const info = this.getStageInfo(stageNum);
    const rand = this.getPRNG(stageNum * 9973 + 12345);

    const stageGroup = new THREE.Group();
    const platforms = [];
    const movingObjects = [];
    const hazardObjects = [];
    const collectibleBells = [];

    // Stage length / platform count scales with progression
    const stepCount = Math.min(45, 14 + Math.floor(Math.sqrt(stageNum) * 2.2));

    // 1. Starting Platform
    const startPlat = this.factory.createNormalPlatform(7, 1.5, 7);
    startPlat.position.set(0, 0, 0);
    stageGroup.add(startPlat);
    platforms.push(startPlat);

    // Track path generation
    let curX = 0;
    let curY = 0;
    let curZ = 0;
    let curAngle = 0; // heading angle in radians

    // Step by step platform placement
    for (let step = 1; step <= stepCount; step++) {
      // Advance position
      const progress = step / stepCount;
      const angleDelta = (rand() - 0.5) * 1.1;
      curAngle += angleDelta;

      // Distance and elevation jump
      const dist = 5.0 + rand() * (3.5 + Math.min(2.5, stageNum * 0.01));
      const yDelta = (rand() - 0.3) * (2.8 + Math.min(1.8, stageNum * 0.015));

      curX += Math.sin(curAngle) * dist;
      curY = Math.max(0, curY + yDelta);
      curZ += Math.cos(curAngle) * dist;

      // Platform size: gets slightly narrower on later stages
      const pW = Math.max(2.4, 4.5 - progress * 1.5 + (rand() - 0.5) * 1.0);
      const pD = Math.max(2.4, 4.5 - progress * 1.5 + (rand() - 0.5) * 1.0);
      const pH = 1.0;

      // Choose gimmick based on stage number, progress, and seed
      const roll = rand();
      let platType = GimmickType.NORMAL;

      if ((stageNum % 2 === 1 || stageNum > 30) && roll < 0.28) {
        platType = GimmickType.ICE;
      } else if ((stageNum % 2 === 0 || stageNum > 20) && roll >= 0.28 && roll < 0.52) {
        platType = GimmickType.CRUMBLE;
      } else if ((stageNum % 3 === 0 || step === 4 || roll > 0.82) && roll < 0.70) {
        platType = GimmickType.BOUNCE_PRESENT;
      } else if ((stageNum % 4 === 0 || stageNum > 40) && roll >= 0.70 && roll < 0.88) {
        platType = GimmickType.MOVING_PLATFORM;
      }

      let plat;
      if (platType === GimmickType.ICE) {
        plat = this.factory.createIcePlatform(pW, pH, pD);
      } else if (platType === GimmickType.CRUMBLE) {
        plat = this.factory.createCrumblePlatform(pW, pH, pD);
        plat.userData.originalY = curY;
      } else if (platType === GimmickType.BOUNCE_PRESENT) {
        plat = this.factory.createBouncePresent(pW, pH * 1.2, pD, 24);
      } else if (platType === GimmickType.MOVING_PLATFORM) {
        // Horizontal or vertical patrol
        const moveAxis = rand() > 0.5 ? 'x' : 'z';
        const travel = new THREE.Vector3(
          moveAxis === 'x' ? 4.5 + rand() * 3 : 0,
          0,
          moveAxis === 'z' ? 4.5 + rand() * 3 : 0
        );
        plat = this.factory.createMovingPlatform(pW, pH, pD, travel, 1.5 + rand() * 1.0);
        plat.userData.origin.set(curX, curY, curZ);
        movingObjects.push(plat);
      } else {
        plat = this.factory.createNormalPlatform(pW, pH, pD);
      }

      plat.position.set(curX, curY, curZ);
      stageGroup.add(plat);
      platforms.push(plat);

      // Collectible Bell placement (scattered along path)
      if (rand() > 0.35 && platType !== GimmickType.BOUNCE_PRESENT) {
        const bell = this.factory.createCollectibleBell();
        bell.position.set(curX, curY + 1.6, curZ);
        bell.userData.baseY = curY + 1.6;
        stageGroup.add(bell);
        collectibleBells.push(bell);
      }

      // Rotating Candy Hazard / Obstacle
      if ((stageNum % 5 === 0 || stageNum > 60) && rand() < 0.25) {
        const beam = this.factory.createRotatingBeam(5.0 + rand() * 3.0, 0.38, 'y', 1.2 + rand());
        beam.position.set(curX, curY + 1.2, curZ);
        stageGroup.add(beam);
        hazardObjects.push(beam);
      }

      // Falling Icicle Hazard
      if ((stageNum % 7 === 0 || stageNum > 80) && rand() < 0.22) {
        const icicle = this.factory.createFallingIcicle(3.2, 0.45);
        icicle.position.set(curX, curY + 7.5, curZ);
        icicle.userData.originalPos.copy(icicle.position);
        stageGroup.add(icicle);
        hazardObjects.push(icicle);
      }
    }

    // 2. Goal Platform & Realistic Christmas Tree
    const goalX = curX + Math.sin(curAngle) * 7.0;
    const goalY = curY + 0.5;
    const goalZ = curZ + Math.cos(curAngle) * 7.0;

    const goalPlat = this.factory.createNormalPlatform(9.5, 2.0, 9.5);
    goalPlat.position.set(goalX, goalY, goalZ);
    stageGroup.add(goalPlat);
    platforms.push(goalPlat);

    // Realistic Christmas Tree at Goal
    const tree = window.createRealisticChristmasTree(this.THREE, {
      scale: 1.15,
      isGoal: true
    });
    tree.position.set(goalX, goalY + 1.0, goalZ);
    stageGroup.add(tree);

    // Goal Trigger Box around Top Star
    const goalStarPos = new THREE.Vector3(
      goalX,
      goalY + 1.0 + tree.userData.goalPosition.y,
      goalZ
    );

    return {
      stageGroup: stageGroup,
      info: info,
      startPosition: new THREE.Vector3(0, 3.0, 0),
      goalPosition: goalStarPos,
      goalTree: tree,
      platforms: platforms,
      movingObjects: movingObjects,
      hazardObjects: hazardObjects,
      collectibleBells: collectibleBells
    };
  }
}

window.StageGenerator = StageGenerator;
