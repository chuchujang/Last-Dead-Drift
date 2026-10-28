const Ship = {
  // 배의 화면 위치
  x: 400,
  y: 300,

  // 배의 방향
  angle: 0,

  // 회전 관성
  angularVelocity: 0,
  rotationAcceleration: 0.002,
  maxRotationSpeed: 0.06,
  rotationFriction: 0.97,

  // 전진 및 후진 관성
  velocity: 0,
  acceleration: 0.12,
  maxForwardSpeed: 3,
  maxReverseSpeed: -1.5,
  movementFriction: 0.985,

  // 배의 체력
  maxHealth: 100,
  health: 100,

  // 배 이미지
  images: [],
  image: null,
  currentImageState: 1,
  width: 40,
  height: 120,

  // 초기 설정
  init() {
    this.images = [
      new Image(),
      new Image(),
      new Image()
    ];

    this.images[0].src = "ship1.png";
    this.images[1].src = "ship2.png";
    this.images[2].src = "ship3.png";

    this.image = this.images[0];
    this.updateDamageImage();
  },

  // 체력에 따라 배 이미지 선택
  updateDamageImage() {
    const healthRate = this.health / this.maxHealth;

    let newState;

    if (healthRate > 0.6) {
      newState = 1;
    } else if (healthRate > 0.3) {
      newState = 2;
    } else {
      newState = 3;
    }

    this.currentImageState = newState;
    this.image = this.images[newState - 1];
  },

  // 배가 피해를 입을 때 호출
  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    this.updateDamageImage();
  },

  // 배 체력 회복
  heal(amount) {
    this.health = Math.min(
      this.maxHealth,
      this.health + amount
    );

    this.updateDamageImage();
  },

  // 키 입력에 따른 움직임
  update(keys) {
    // A / D: 회전
    if (keys["a"]) {
      this.angularVelocity -= this.rotationAcceleration;
    }

    if (keys["d"]) {
      this.angularVelocity += this.rotationAcceleration;
    }

    this.angularVelocity = Math.max(
      -this.maxRotationSpeed,
      Math.min(this.maxRotationSpeed, this.angularVelocity)
    );

    if (!keys["a"] && !keys["d"]) {
      this.angularVelocity *= this.rotationFriction;
    }

    this.angle += this.angularVelocity;

    // W: 전진
    if (keys["w"]) {
      this.velocity += this.acceleration;
    }

    // S: 후진
    if (keys["s"]) {
      this.velocity -= this.acceleration;
    }

    this.velocity = Math.max(
      this.maxReverseSpeed,
      Math.min(this.maxForwardSpeed, this.velocity)
    );

    if (!keys["w"] && !keys["s"]) {
      this.velocity *= this.movementFriction;
    }

    // 배의 이동 방향
    this.moveX = Math.sin(this.angle) * this.velocity;
    this.moveY = -Math.cos(this.angle) * this.velocity;
  },

  // 화면에 배 그리기
  draw(ctx) {
    // 배를 화면 중앙에 고정
    this.x = ctx.canvas.width / 2;
    this.y = ctx.canvas.height / 2;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    if (
      this.image &&
      this.image.complete &&
      this.image.naturalWidth > 0
    ) {
      ctx.drawImage(
        this.image,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );
    }

    ctx.restore();
  }
};
