
const Ship = {
  // 배의 화면 위치
  x: 400,
  y: 300,

  // 배의 방향 (라디안)
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

  // 배 이미지
  image: new Image(),
  width: 80,
  height: 120,

  init() {
    this.image.src = "ship.png";
  },

  update(keys) {
    // A / D: 회전 가속
    if (keys["a"]) {
      this.angularVelocity -= this.rotationAcceleration;
    }

    if (keys["d"]) {
      this.angularVelocity += this.rotationAcceleration;
    }

    // 회전 속도 제한
    this.angularVelocity = Math.max(
      -this.maxRotationSpeed,
      Math.min(this.maxRotationSpeed, this.angularVelocity)
    );

    // 키를 놓으면 회전이 서서히 감속
    if (!keys["a"] && !keys["d"]) {
      this.angularVelocity *= this.rotationFriction;
    }

    // 실제 방향 변경
    this.angle += this.angularVelocity;

    // W: 전진 가속
    if (keys["w"]) {
      this.velocity += this.acceleration;
    }

    // S: 후진 가속
    if (keys["s"]) {
      this.velocity -= this.acceleration;
    }

    // 전진과 후진 속도 제한
    this.velocity = Math.max(
      this.maxReverseSpeed,
      Math.min(this.maxForwardSpeed, this.velocity)
    );

    // 키를 놓으면 이동 속도가 서서히 감소
    if (!keys["w"] && !keys["s"]) {
      this.velocity *= this.movementFriction;
    }

    // 이동 방향 계산
    // 배의 뱃머리는 이미지 위쪽을 향한다고 가정
    this.moveX = Math.sin(this.angle) * this.velocity;
    this.moveY = -Math.cos(this.angle) * this.velocity;
  },

  draw(ctx) {
    // 배는 화면 중앙에 고정
    this.x = ctx.canvas.width / 2;
    this.y = ctx.canvas.height / 2;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    if (this.image.complete && this.image.naturalWidth > 0) {
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
