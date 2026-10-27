const Ship = {
  x: 400,
  y: 300,
  angle: 0,
  rotationSpeed: 0.05,
  width: 80,
  height: 120,
  image: new Image(),

  init() {
    this.image.src = "ship.png";
  },

  update(keys) {
    // A: 왼쪽 회전
    if (keys["a"]) {
      this.angle -= this.rotationSpeed;
    }

    // D: 오른쪽 회전
    if (keys["d"]) {
      this.angle += this.rotationSpeed;
    }
  },

  draw(ctx) {
    ctx.save();

    // 배를 화면 중앙에 고정
    this.x = ctx.canvas.width / 2;
    this.y = ctx.canvas.height / 2;

    // 배 중심을 기준으로 회전
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // 배 이미지 그리기
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
