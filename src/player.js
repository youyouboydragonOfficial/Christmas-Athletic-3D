// player.js - Articulated Winter Parkour Character (Rainbow Puffer Jacket) + Climbing, Dash, Stamina/HP & Instant Fall Death

function createWinterCharacterMesh(THREE, palette = null) {
  const root = new THREE.Group();

  const stripeCols = palette || [0xffcc00, 0x00e5ff, 0xff2a85, 0x7c4dff];
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x00838f, roughness: 0.65 });
  const bootMat = new THREE.MeshStandardMaterial({ color: 0x263238, roughness: 0.7 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xffd1b3, roughness: 0.55 });
  const gloveMat = new THREE.MeshStandardMaterial({ color: 0x00b0ff, roughness: 0.5 });

  // Torso (Segmented Rainbow Puffer Jacket matching the reference image!)
  const torsoGroup = new THREE.Group();
  torsoGroup.position.y = 1.05;
  for (let i = 0; i < 4; i++) {
    const segMat = new THREE.MeshStandardMaterial({
      color: stripeCols[i % stripeCols.length],
      roughness: 0.42
    });
    const rTop = 0.36 - (i === 3 ? 0.04 : 0);
    const rBot = 0.38 - i * 0.01;
    const seg = new THREE.Mesh(
      new THREE.CylinderGeometry(rTop, rBot, 0.21, 14),
      segMat
    );
    seg.position.y = -0.3 + i * 0.2;
    seg.castShadow = true;
    torsoGroup.add(seg);
  }

  // Puffy Yellow Collar / Hood on back of neck
  const hoodMat = new THREE.MeshStandardMaterial({ color: 0xffd600, roughness: 0.45 });
  const hood = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.11, 8, 16), hoodMat);
  hood.rotation.x = Math.PI / 2 + 0.2;
  hood.position.set(0, 0.44, -0.05);
  torsoGroup.add(hood);
  root.add(torsoGroup);

  // Head & Striped Pom-Pom Beanie
  const headGroup = new THREE.Group();
  headGroup.position.y = 1.72;

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 14), skinMat);
  head.castShadow = true;
  headGroup.add(head);

  // Beanie Hat layers
  const beanieCols = [0x00e5ff, 0xffd600, 0xff2a85];
  beanieCols.forEach((col, idx) => {
    const bRing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.29 - idx * 0.05, 0.30 - idx * 0.04, 0.12, 14),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.6 })
    );
    bRing.position.y = 0.12 + idx * 0.1;
    headGroup.add(bRing);
  });

  const pompom = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0xff4081, roughness: 0.8 })
  );
  pompom.position.y = 0.44;
  headGroup.add(pompom);
  root.add(headGroup);

  // Articulated Arms (Left & Right)
  const makeArm = (side) => {
    const armPivot = new THREE.Group();
    armPivot.position.set(side * 0.44, 1.38, 0);

    for (let s = 0; s < 3; s++) {
      const sleeve = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.10, 0.18, 10),
        new THREE.MeshStandardMaterial({ color: stripeCols[(s + 1) % stripeCols.length], roughness: 0.45 })
      );
      sleeve.position.y = -0.1 - s * 0.16;
      sleeve.castShadow = true;
      armPivot.add(sleeve);
    }

    const glove = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), gloveMat);
    glove.position.y = -0.58;
    armPivot.add(glove);

    return armPivot;
  };

  const leftArm = makeArm(-1);
  const rightArm = makeArm(1);
  root.add(leftArm);
  root.add(rightArm);

  // Articulated Legs (Left & Right)
  const makeLeg = (side) => {
    const legPivot = new THREE.Group();
    legPivot.position.set(side * 0.19, 0.72, 0);

    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.38, 10), pantsMat);
    thigh.position.y = -0.19;
    thigh.castShadow = true;
    legPivot.add(thigh);

    // Colorful leg warmer stripes
    const warmer = new THREE.Mesh(
      new THREE.CylinderGeometry(0.125, 0.12, 0.22, 10),
      new THREE.MeshStandardMaterial({ color: 0xff2a85, roughness: 0.5 })
    );
    warmer.position.y = -0.45;
    legPivot.add(warmer);

    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 0.34), bootMat);
    boot.position.set(0, -0.63, 0.04);
    boot.castShadow = true;
    legPivot.add(boot);

    return legPivot;
  };

  const leftLeg = makeLeg(-1);
  const rightLeg = makeLeg(1);
  root.add(leftLeg);
  root.add(rightLeg);

  root.userData = { torsoGroup, headGroup, leftArm, rightArm, leftLeg, rightLeg };
  return root;
}

class Player {
  constructor(THREE, scene) {
    this.THREE = THREE;
    this.scene = scene;

    this.position = new THREE.Vector3(0, 2.5, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.checkpointPos = new THREE.Vector3(0, 2.5, 0);

    this.radius = 0.52;
    this.height = 1.9;

    this.isGrounded = false;
    this.isClimbing = false;
    this.isDead = false;
    this.deathRespawnTimer = 0;
    this.groundPlatform = null;
    this.currentFriction = 0.88;

    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.jumpsRemaining = 2;

    // HP & Stamina
    this.hp = 100;
    this.maxHp = 100;
    this.stamina = 100;
    this.maxStamina = 100;
    this.invincibleTimer = 0;

    this.animTime = 0;

    this.input = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false,
      dash: false,
      climb: false
    };

    // Camera Orbit (Behind Player looking down the course toward the GOAL!)
    this.cameraYaw = Math.PI;
    this.cameraPitch = 0.26;
    this.cameraDistance = 8.2;

    this.mesh = createWinterCharacterMesh(THREE);
    this.scene.add(this.mesh);
    this.createShadow();
  }

  createShadow() {
    const THREE = this.THREE;
    const shadowGeo = new THREE.CircleGeometry(0.68, 24);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x050b14,
      transparent: true,
      opacity: 0.65,
      depthWrite: false
    });
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.scene.add(this.shadowMesh);
  }

  reset(pos) {
    this.position.copy(pos);
    this.checkpointPos.copy(pos);
    this.velocity.set(0, 0, 0);
    this.isGrounded = false;
    this.isClimbing = false;
    this.isDead = false;
    this.deathRespawnTimer = 0;
    this.hp = 100;
    this.stamina = 100;
    this.cameraYaw = Math.PI;
    this.mesh.rotation.set(0, 0, 0);
  }

  respawnAtCheckpoint() {
    this.position.copy(this.checkpointPos).add(new this.THREE.Vector3(0, 1.2, 0));
    this.velocity.set(0, 0, 0);
    this.isGrounded = false;
    this.isClimbing = false;
    this.isDead = false;
    this.deathRespawnTimer = 0;
    this.hp = 100;
    this.stamina = 100;
    this.mesh.rotation.x = 0;
    this.mesh.rotation.z = 0;
  }

  triggerInstantDeath(onFallDeathCallback) {
    if (this.isDead) return;
    this.isDead = true;
    this.hp = 0;
    this.deathRespawnTimer = 0.45;
    if (window.soundManager) {
      window.soundManager.playFall();
    }
    if (onFallDeathCallback) {
      onFallDeathCallback();
    }
  }

  triggerJump() {
    this.jumpBufferTimer = 0.16;
  }

  update(delta, stage, onCheckpointCallback, onFallDeathCallback) {
    const THREE = this.THREE;

    // Handle Instant-Death Respawn Delay
    if (this.isDead) {
      this.deathRespawnTimer -= delta;
      this.position.y += this.velocity.y * delta;
      this.mesh.rotation.x += 8.0 * delta;
      this.mesh.position.copy(this.position);
      this.shadowMesh.visible = false;
      if (this.deathRespawnTimer <= 0) {
        this.respawnAtCheckpoint();
      }
      return;
    }

    if (this.invincibleTimer > 0) this.invincibleTimer -= delta;

    if (this.isGrounded) {
      this.coyoteTimer = 0.15;
      this.jumpsRemaining = 2;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - delta);
    }
    this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - delta);

    // Camera-relative directions
    const fwdX = -Math.sin(this.cameraYaw);
    const fwdZ = -Math.cos(this.cameraYaw);
    const rightX = -fwdZ;
    const rightZ = fwdX;

    let moveX = 0;
    let moveZ = 0;
    if (this.input.forward) { moveX += fwdX; moveZ += fwdZ; }
    if (this.input.backward) { moveX -= fwdX; moveZ -= fwdZ; }
    if (this.input.left) { moveX -= rightX; moveZ -= rightZ; }
    if (this.input.right) { moveX += rightX; moveZ += rightZ; }

    const moveLen = Math.hypot(moveX, moveZ);
    if (moveLen > 0.001) {
      moveX /= moveLen;
      moveZ /= moveLen;
    }

    // Stamina & Dash calculation
    const isDashing = this.input.dash && moveLen > 0.01 && this.stamina > 5;
    if (isDashing) {
      this.stamina = Math.max(0, this.stamina - 28 * delta);
    } else {
      this.stamina = Math.min(this.maxStamina, this.stamina + 22 * delta);
    }

    const maxSpeed = isDashing ? 9.6 : 6.0;
    const accel = this.isGrounded ? 38 : 24;

    if (moveLen > 0.001) {
      this.velocity.x += moveX * accel * delta;
      this.velocity.z += moveZ * accel * delta;

      const targetAngle = Math.atan2(moveX, moveZ);
      let diff = targetAngle - this.mesh.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.mesh.rotation.y += diff * Math.min(1, delta * 14);
    } else if (this.isGrounded) {
      const stopFactor = this.currentFriction < 0.2 ? 0.92 : 0.02;
      this.velocity.x *= Math.pow(stopFactor, delta * 35);
      this.velocity.z *= Math.pow(stopFactor, delta * 35);
      if (Math.hypot(this.velocity.x, this.velocity.z) < 0.08) {
        this.velocity.x = 0;
        this.velocity.z = 0;
      }
    } else {
      this.velocity.x *= 0.97;
      this.velocity.z *= 0.97;
    }

    // Clamp horizontal speed unless launched by a Snowflake Jump Pad
    const hSpeed = Math.hypot(this.velocity.x, this.velocity.z);
    if (hSpeed > maxSpeed && this.velocity.y < 14) {
      this.velocity.x = (this.velocity.x / hSpeed) * maxSpeed;
      this.velocity.z = (this.velocity.z / hSpeed) * maxSpeed;
    }

    // Jump & Double Jump
    const gravity = 25.0;
    const jumpSpeed = 11.8;

    if (this.jumpBufferTimer > 0) {
      if (this.coyoteTimer > 0 || this.isClimbing) {
        this.velocity.y = jumpSpeed;
        this.isGrounded = false;
        this.isClimbing = false;
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
        this.jumpsRemaining = 1;
        if (window.soundManager) window.soundManager.playJump();
      } else if (this.jumpsRemaining > 0) {
        this.velocity.y = jumpSpeed * 0.92;
        this.jumpsRemaining--;
        this.jumpBufferTimer = 0;
        if (window.soundManager) window.soundManager.playJump();
      }
    }

    // Apply Gravity
    if (!this.isClimbing) {
      this.velocity.y -= gravity * delta;
    }

    // Ride Moving Platforms ("動く床")
    if (this.isGrounded && this.groundPlatform && this.groundPlatform.userData.deltaPos) {
      this.position.add(this.groundPlatform.userData.deltaPos);
    }

    // Integrate Position
    this.position.x += this.velocity.x * delta;
    this.position.y += this.velocity.y * delta;
    this.position.z += this.velocity.z * delta;

    // Platform & Climbing Collisions
    this.checkCollisions(stage, delta);

    // INSTANT DEATH ON FALL ("落下したら即死")
    // All platforms are at y >= -0.2; falling below y = -3.8 is an instant fall death!
    if (this.position.y < -3.8) {
      this.triggerInstantDeath(onFallDeathCallback);
      return;
    }

    // Check Checkpoints
    if (stage.checkpoints) {
      stage.checkpoints.forEach(cp => {
        if (!cp.gate.userData.activated) {
          const d = this.position.distanceTo(cp.position);
          if (d < 3.8) {
            cp.gate.userData.activate();
            this.checkpointPos.copy(cp.position);
            this.hp = this.maxHp;
            if (window.soundManager) window.soundManager.playBell();
            if (onCheckpointCallback) onCheckpointCallback();
          }
        }
      });
    }

    // Update Articulated Character Limb Animation
    this.updateLimbAnimation(delta, hSpeed, isDashing);

    this.mesh.position.copy(this.position);
    this.updateShadow(stage);
  }

  checkCollisions(stage, delta) {
    const pX = this.position.x;
    const pY = this.position.y;
    const pZ = this.position.z;
    const r = this.radius;

    let landed = false;
    let climbing = false;
    let newFriction = 0.88;

    const platforms = stage.platforms;
    for (let i = 0; i < platforms.length; i++) {
      const plat = platforms[i];
      const b = plat.userData.bounds;
      if (!b) continue;
      const pos = plat.position;

      const minX = pos.x - b.w / 2 - r;
      const maxX = pos.x + b.w / 2 + r;
      const minZ = pos.z - b.d / 2 - r;
      const maxZ = pos.z + b.d / 2 + r;
      const topY = pos.y + b.h / 2;
      const botY = pos.y - b.h / 2;

      if (pX >= minX && pX <= maxX && pZ >= minZ && pZ <= maxZ) {
        // 1. Check landing on top
        const prevY = pY - this.velocity.y * delta;
        if (pY <= topY + 0.25 && prevY >= topY - 0.55 && this.velocity.y <= 0) {
          this.position.y = topY;
          this.velocity.y = 0;
          landed = true;
          this.groundPlatform = plat;
          newFriction = plat.userData.friction !== undefined ? plat.userData.friction : 0.88;

          // Snowflake Super Jump Pad Launch!
          if (plat.userData.type === GimmickType.SNOWFLAKE_PAD && plat.userData.bounceVelocity) {
            const bv = plat.userData.bounceVelocity;
            this.velocity.set(bv.x, bv.y, bv.z);
            landed = false;
            this.groundPlatform = null;
            this.jumpsRemaining = 2;
            if (window.soundManager) window.soundManager.playBounce();
          }
          break;
        }

        // 2. Check Climbing on Giant Presents (Net / Ladder on side faces!)
        if (plat.userData.isClimbable && pY >= botY - 0.5 && pY < topY - 0.1) {
          const wantClimb = this.input.forward || this.input.jump || this.input.climb;
          if (wantClimb) {
            climbing = true;
            this.velocity.y = 6.8;
            this.position.y += this.velocity.y * delta;
            if (this.position.y >= topY - 0.15) {
              this.position.y = topY + 0.1;
              this.velocity.y = 4.0;
              climbing = false;
              landed = true;
            }
            break;
          }
        }
      }
    }

    if (landed && !this.isGrounded) {
      if (window.soundManager) window.soundManager.playLand();
    }

    this.isGrounded = landed;
    this.isClimbing = climbing;
    this.currentFriction = newFriction;
    if (!landed) {
      this.groundPlatform = null;
    }
  }

  updateLimbAnimation(delta, hSpeed, isDashing) {
    const parts = this.mesh.userData;
    if (!parts) return;

    if (this.isClimbing) {
      this.animTime += delta * 14;
      parts.leftArm.rotation.x = -Math.PI * 0.75 + Math.sin(this.animTime) * 0.45;
      parts.rightArm.rotation.x = -Math.PI * 0.75 - Math.sin(this.animTime) * 0.45;
      parts.leftLeg.rotation.x = Math.sin(this.animTime) * 0.45;
      parts.rightLeg.rotation.x = -Math.sin(this.animTime) * 0.45;
      parts.torsoGroup.rotation.x = -0.1;
    } else if (!this.isGrounded) {
      // Dynamic Mid-Air Parkour Pose (Matching the reference image!)
      parts.leftArm.rotation.z = 0.85;
      parts.rightArm.rotation.z = -0.85;
      parts.leftArm.rotation.x = -0.35;
      parts.rightArm.rotation.x = -0.35;
      parts.leftLeg.rotation.x = -0.45;
      parts.rightLeg.rotation.x = 0.35;
      parts.torsoGroup.rotation.x = 0.12;
    } else if (hSpeed > 0.35) {
      const rate = isDashing ? 18 : 12;
      this.animTime += delta * rate;
      const swing = Math.sin(this.animTime) * (isDashing ? 0.85 : 0.62);

      parts.leftArm.rotation.z = 0.12;
      parts.rightArm.rotation.z = -0.12;
      parts.leftArm.rotation.x = swing;
      parts.rightArm.rotation.x = -swing;
      parts.leftLeg.rotation.x = -swing;
      parts.rightLeg.rotation.x = swing;
      parts.torsoGroup.rotation.x = isDashing ? 0.22 : 0.08;
    } else {
      this.animTime += delta * 3;
      parts.leftArm.rotation.set(0, 0, 0.1);
      parts.rightArm.rotation.set(0, 0, -0.1);
      parts.leftLeg.rotation.set(0, 0, 0);
      parts.rightLeg.rotation.set(0, 0, 0);
      parts.torsoGroup.rotation.x = 0;
    }
  }

  updateShadow(stage) {
    const pX = this.position.x;
    const pY = this.position.y;
    const pZ = this.position.z;

    let highestYBelow = -999;
    for (let i = 0; i < stage.platforms.length; i++) {
      const plat = stage.platforms[i];
      const b = plat.userData.bounds;
      if (!b) continue;
      const pos = plat.position;

      if (
        pX >= pos.x - b.w / 2 &&
        pX <= pos.x + b.w / 2 &&
        pZ >= pos.z - b.d / 2 &&
        pZ <= pos.z + b.d / 2
      ) {
        const topY = pos.y + b.h / 2;
        if (topY <= pY + 0.3 && topY > highestYBelow) {
          highestYBelow = topY;
        }
      }
    }

    if (highestYBelow > -100) {
      this.shadowMesh.visible = true;
      this.shadowMesh.position.set(pX, highestYBelow + 0.03, pZ);
      const heightAbove = Math.max(0, pY - highestYBelow);
      const scale = Math.max(0.3, 1.0 - heightAbove * 0.04);
      this.shadowMesh.scale.set(scale, scale, scale);
      this.shadowMesh.material.opacity = Math.max(0.2, 0.68 - heightAbove * 0.025);
    } else {
      this.shadowMesh.visible = false;
    }
  }

  updateCamera(camera) {
    const target = this.position.clone().add(new this.THREE.Vector3(0, 1.45, 0));
    const hDist = this.cameraDistance * Math.cos(this.cameraPitch);
    const vDist = this.cameraDistance * Math.sin(this.cameraPitch);

    const camX = target.x + hDist * Math.sin(this.cameraYaw);
    const camY = target.y + vDist;
    const camZ = target.z + hDist * Math.cos(this.cameraYaw);

    camera.position.set(camX, camY, camZ);
    camera.lookAt(target);
  }
}

window.Player = Player;
