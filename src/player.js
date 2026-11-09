// player.js - 3D Character, Platformer Physics, Input Handling, and Camera Controls

class Player {
  constructor(THREE, scene) {
    this.THREE = THREE;
    this.scene = scene;

    // Movement & Physics
    this.position = new THREE.Vector3(0, 3, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.radius = 0.55;
    this.height = 1.6;

    this.isGrounded = false;
    this.groundPlatform = null;
    this.currentFriction = 0.85;

    // Coyote time & Jump buffer
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;

    // Controls input state
    this.input = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false
    };

    // Camera parameters
    this.cameraYaw = 0;
    this.cameraPitch = 0.28;
    this.cameraDistance = 7.0;

    this.createModel();
    this.createShadow();
  }

  createModel() {
    const THREE = this.THREE;
    this.mesh = new THREE.Group();

    // Body (Puffy Winter Coat - Red)
    const coatMat = new THREE.MeshStandardMaterial({
      color: 0xcc2222,
      roughness: 0.6
    });
    const bodyGeo = new THREE.CylinderGeometry(0.42, 0.48, 0.8, 12);
    const bodyMesh = new THREE.Mesh(bodyGeo, coatMat);
    bodyMesh.position.y = 0.7;
    bodyMesh.castShadow = true;
    this.mesh.add(bodyMesh);

    // Coat White Trim at bottom
    const trimMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.8 });
    const trimGeo = new THREE.TorusGeometry(0.46, 0.08, 6, 16);
    trimGeo.rotateX(Math.PI / 2);
    const trimMesh = new THREE.Mesh(trimGeo, trimMat);
    trimMesh.position.y = 0.32;
    this.mesh.add(trimMesh);

    // Head
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xffd2b3,
      roughness: 0.6
    });
    const headGeo = new THREE.SphereGeometry(0.35, 12, 12);
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.y = 1.3;
    headMesh.castShadow = true;
    this.mesh.add(headMesh);

    // Cute Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const eyeGeo = new THREE.SphereGeometry(0.05, 6, 6);
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.12, 1.34, 0.3);
    this.mesh.add(eyeL);

    const eyeR = eyeL.clone();
    eyeR.position.x = 0.12;
    this.mesh.add(eyeR);

    // Green Scarf
    const scarfMat = new THREE.MeshStandardMaterial({ color: 0x1e824c, roughness: 0.6 });
    const scarfGeo = new THREE.TorusGeometry(0.33, 0.1, 8, 16);
    scarfGeo.rotateX(Math.PI / 2);
    const scarfMesh = new THREE.Mesh(scarfGeo, scarfMat);
    scarfMesh.position.y = 1.05;
    this.mesh.add(scarfMesh);

    // Santa Hat
    const hatGroup = new THREE.Group();
    hatGroup.position.set(0, 1.52, 0);

    const hatBandGeo = new THREE.TorusGeometry(0.32, 0.08, 6, 16);
    hatBandGeo.rotateX(Math.PI / 2);
    const hatBand = new THREE.Mesh(hatBandGeo, trimMat);
    hatGroup.add(hatBand);

    const hatConeGeo = new THREE.ConeGeometry(0.32, 0.65, 12);
    hatConeGeo.translate(0, 0.3, -0.08);
    hatConeGeo.rotateX(-0.25);
    const hatCone = new THREE.Mesh(hatConeGeo, coatMat);
    hatGroup.add(hatCone);

    const pompomGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const pompom = new THREE.Mesh(pompomGeo, trimMat);
    pompom.position.set(0, 0.62, -0.22);
    hatGroup.add(pompom);

    this.mesh.add(hatGroup);

    // Boots
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x2b1e1a, roughness: 0.7 });
    const bootGeo = new THREE.BoxGeometry(0.24, 0.22, 0.35);
    const bootL = new THREE.Mesh(bootGeo, bootMat);
    bootL.position.set(-0.22, 0.11, 0.05);
    bootL.castShadow = true;
    this.mesh.add(bootL);

    const bootR = bootL.clone();
    bootR.position.x = 0.22;
    this.mesh.add(bootR);

    this.scene.add(this.mesh);
  }

  // Visual drop shadow underneath player for precise 3D jump landing
  createShadow() {
    const THREE = this.THREE;
    const shadowGeo = new THREE.CircleGeometry(0.55, 16);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x050d18,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    });
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.scene.add(this.shadowMesh);
  }

  reset(pos) {
    this.position.copy(pos);
    this.velocity.set(0, 0, 0);
    this.isGrounded = false;
    this.groundPlatform = null;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
  }

  update(delta, stage) {
    const THREE = this.THREE;

    // 1. Timers
    if (this.isGrounded) {
      this.coyoteTimer = 0.14;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - delta);
    }
    this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - delta);

    // 2. Camera-relative movement direction
    const camDirX = Math.sin(this.cameraYaw);
    const camDirZ = Math.cos(this.cameraYaw);
    const camRightX = Math.sin(this.cameraYaw + Math.PI / 2);
    const camRightZ = Math.cos(this.cameraYaw + Math.PI / 2);

    let moveX = 0;
    let moveZ = 0;
    if (this.input.forward) {
      moveX -= camDirX;
      moveZ -= camDirZ;
    }
    if (this.input.backward) {
      moveX += camDirX;
      moveZ += camDirZ;
    }
    if (this.input.left) {
      moveX -= camRightX;
      moveZ -= camRightZ;
    }
    if (this.input.right) {
      moveX += camRightX;
      moveZ += camRightZ;
    }

    const moveLen = Math.hypot(moveX, moveZ);
    if (moveLen > 0.001) {
      moveX /= moveLen;
      moveZ /= moveLen;
    }

    // 3. Acceleration & Friction
    const maxSpeed = 10.5;
    const accel = this.isGrounded ? (this.currentFriction < 0.1 ? 16 : 48) : 22;
    const friction = this.isGrounded ? this.currentFriction : 0.98;

    if (moveLen > 0.001) {
      this.velocity.x += moveX * accel * delta;
      this.velocity.z += moveZ * accel * delta;

      // Rotate model towards movement direction
      const targetAngle = Math.atan2(moveX, moveZ);
      this.mesh.rotation.y = targetAngle;
    } else if (this.isGrounded) {
      // Natural braking
      this.velocity.x *= Math.pow(friction, delta * 30);
      this.velocity.z *= Math.pow(friction, delta * 30);
    }

    // Speed clamp on horizontal plane
    const hSpeed = Math.hypot(this.velocity.x, this.velocity.z);
    if (hSpeed > maxSpeed) {
      this.velocity.x = (this.velocity.x / hSpeed) * maxSpeed;
      this.velocity.z = (this.velocity.z / hSpeed) * maxSpeed;
    }

    // 4. Jump physics
    const gravity = 28.0;
    const jumpSpeed = 12.5;

    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
      this.velocity.y = jumpSpeed;
      this.isGrounded = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      if (window.soundManager) window.soundManager.playJump();
    }

    // Apply gravity
    this.velocity.y -= gravity * delta;

    // Apply moving platform motion if standing on one
    if (this.isGrounded && this.groundPlatform && this.groundPlatform.userData.type === GimmickType.MOVING_PLATFORM) {
      const deltaPos = this.groundPlatform.userData.deltaPos;
      if (deltaPos) {
        this.position.add(deltaPos);
      }
    }

    // Move player position
    this.position.x += this.velocity.x * delta;
    this.position.y += this.velocity.y * delta;
    this.position.z += this.velocity.z * delta;

    // 5. Collision with platforms
    this.checkPlatformCollisions(stage);

    // Update 3D visual position
    this.mesh.position.copy(this.position);

    // Update Drop Shadow
    this.updateShadow(stage);

    // Bobbing animation while moving
    if (this.isGrounded && hSpeed > 0.5) {
      this.mesh.position.y += Math.abs(Math.sin(Date.now() * 0.014)) * 0.12;
    }
  }

  checkPlatformCollisions(stage) {
    const pX = this.position.x;
    const pY = this.position.y;
    const pZ = this.position.z;
    const r = this.radius;

    let landed = false;
    let newFriction = 0.85;

    const platforms = stage.platforms;
    for (let i = 0; i < platforms.length; i++) {
      const plat = platforms[i];
      const b = plat.userData.bounds;
      const bPos = plat.position;

      // Platform Box bounds
      const minX = bPos.x - b.w / 2 - r;
      const maxX = bPos.x + b.w / 2 + r;
      const minZ = bPos.z - b.d / 2 - r;
      const maxZ = bPos.z + b.d / 2 + r;
      const topY = bPos.y + b.h / 2;

      // Check horizontal overlap
      if (pX >= minX && pX <= maxX && pZ >= minZ && pZ <= maxZ) {
        // Landing on top surface
        const prevY = pY - this.velocity.y * 0.016; // approximate previous Y
        if (pY <= topY + 0.15 && prevY >= topY - 0.4 && this.velocity.y <= 0) {
          this.position.y = topY;
          this.velocity.y = 0;
          landed = true;
          this.groundPlatform = plat;
          newFriction = plat.userData.friction !== undefined ? plat.userData.friction : 0.85;

          // Special Gimmick Triggers
          if (plat.userData.type === GimmickType.BOUNCE_PRESENT) {
            // Trampoline present super bounce!
            this.velocity.y = plat.userData.bounceForce || 24;
            landed = false;
            this.groundPlatform = null;
            if (window.soundManager) window.soundManager.playBounce();
          } else if (plat.userData.type === GimmickType.CRUMBLE) {
            // Trigger crumble countdown
            plat.userData.steppedOn = true;
          }
          break;
        }
      }
    }

    if (landed && !this.isGrounded) {
      // Just landed from air
      if (window.soundManager) window.soundManager.playLand();
    }

    this.isGrounded = landed;
    this.currentFriction = newFriction;
    if (!landed) {
      this.groundPlatform = null;
    }
  }

  updateShadow(stage) {
    // Cast shadow to the nearest platform below player
    const pX = this.position.x;
    const pY = this.position.y;
    const pZ = this.position.z;

    let highestYBelow = -999;
    for (let i = 0; i < stage.platforms.length; i++) {
      const plat = stage.platforms[i];
      const b = plat.userData.bounds;
      const pos = plat.position;

      if (
        pX >= pos.x - b.w / 2 &&
        pX <= pos.x + b.w / 2 &&
        pZ >= pos.z - b.d / 2 &&
        pZ <= pos.z + b.d / 2
      ) {
        const topY = pos.y + b.h / 2;
        if (topY <= pY + 0.2 && topY > highestYBelow) {
          highestYBelow = topY;
        }
      }
    }

    if (highestYBelow > -900) {
      this.shadowMesh.visible = true;
      this.shadowMesh.position.set(pX, highestYBelow + 0.02, pZ);
      const heightAbove = Math.max(0, pY - highestYBelow);
      const scale = Math.max(0.2, 1.0 - heightAbove * 0.06);
      this.shadowMesh.scale.set(scale, scale, scale);
      this.shadowMesh.material.opacity = Math.max(0.1, 0.5 - heightAbove * 0.03);
    } else {
      this.shadowMesh.visible = false;
    }
  }

  // Camera follow update
  updateCamera(camera) {
    const target = this.position.clone().add(new THREE.Vector3(0, 1.2, 0));

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
