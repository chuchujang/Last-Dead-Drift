const Enemy = {
  images: {},
  enemies: [],
  imageReady: false,

  // 10분 게임 난이도 설정
  elapsedTime: 0,
  spawnTimer: 0,
  lastTime: 0,
  spawnInterval: 1.5,
  maxEnemies: 8,

  // 적 종류별 능력치
  types: {
    fish: {
      name: "작은 물고기",
      image: "fish.png",
      hp: 2,
      speed: 1.0,
      size: 28,
      damage: 1
    },
    pufferfish: {
      name: "복어",
      image: "pufferfish.png",
      hp: 5,
      speed: 0.65,
      size: 38,
      damage: 2
    },
    seagull: {
      name: "갈매기",
      image: "seagull.png",
      hp: 2,
      speed: 2.0,
      size: 32,
      damage: 1
    },
    turtle: {
      name: "거북이",
      image: "turtle.png",
      hp: 18,
      speed: 0.45,
      size: 48,
      damage: 2
    },
    shark: {
      name: "강화된 상어",
      image: "shark.png",
      hp: 35,
      speed: 1.35,
      size: 64,
      damage: 4
    }
  },

  // 적 이미지 불러오기
  init() {
    this.images = {};
    this.enemies = [];
    this.elapsedTime = 0;
    this.spawnTimer = 0;
    this.lastTime = 0;
    this.imageReady = false;

    const filenames = [
      this.types.fish.image,
      this.types.pufferfish.image,
      this.types.seagull.image,
      this.types.turtle.image,
      this.types.shark.image
    ];

    Promise.all(
      filenames.map((filename) => {
        return new Promise((resolve, reject) => {
          const img = new Image();

          img.onload = () => {
            this.images[filename] = img;
            resolve();
          };

          img.onerror = () => {
            reject(
              new Error("적 이미지 불러오기 실패: " + filename)
            );
          };

          img.src = filename;
        });
      })
    )
      .then(() => {
        this.imageReady = true;
        console.log("적 이미지 5종류 준비 완료!");
      })
      .catch((error) => {
        console.error(error);
      });
  },

  // 시간에 따른 난이도 조절
  updateDifficulty() {
    const minutes = this.elapsedTime / 60;

    // 처음 1.5초 간격, 후반에는 0.5초 간격
    this.spawnInterval = Math.max(
      0.5,
      1.5 - minutes * 0.1
    );

    // 초반 8마리에서 후반 최대 50마리
    this.maxEnemies = Math.min(
      50,
      8 + Math.floor(this.elapsedTime / 12)
    );
  },

  // 시간에 맞는 적 선택
  chooseType() {
    const t = this.elapsedTime;
    const roll = Math.random();

    // 0~2분: 작은 물고기만 등장
    if (t < 120) {
      return this.types.fish;
    }

    // 2~4분: 복어 추가
    if (t < 240) {
      if (roll < 0.75) return this.types.fish;
      return this.types.pufferfish;
    }

    // 4~6분: 갈매기 추가
    if (t < 360) {
      if (roll < 0.50) return this.types.fish;
      if (roll < 0.75) return this.types.pufferfish;
      return this.types.seagull;
    }

    // 6~8분: 거북이 추가
    if (t < 480) {
      if (roll < 0.35) return this.types.fish;
      if (roll < 0.58) return this.types.pufferfish;
      if (roll < 0.83) return this.types.seagull;
      return this.types.turtle;
    }

    // 8~10분: 모든 적 등장, 상어 확률 증가
    if (roll < 0.20) return this.types.fish;
    if (roll < 0.38) return this.types.pufferfish;
    if (roll < 0.62) return this.types.seagull;
    if (roll < 0.80) return this.types.turtle;

    return this.types.shark;
  },

  // 화면 가장자리에서 적 생성
  spawn(ctx) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const margin = 40;

    const side = Math.floor(Math.random() * 4);

    let x;
    let y;

    if (side === 0) {
      x = Math.random() * width;
      y = -margin;
    } else if (side === 1) {
      x = width + margin;
      y = Math.random() * height;
    } else if (side === 2) {
      x = Math.random() * width;
      y = height + margin;
    } else {
      x = -margin;
      y = Math.random() * height;
    }

    const type = this.chooseType();

    this.enemies.push({
      type: type,
      x: x,
      y: y,
      hp: type.hp,
      maxHp: type.hp,
      speed: type.speed,
      size: type.size,
      damage: type.damage,
      exploding: false,
      explosionTime: 0,
      hitCooldown: 0
    });
  },

  // 적 이동 및 배와의 충돌 확인
  update(targetX, targetY, ctx) {
    if (!this.imageReady) return;

    const now = Date.now();

    if (this.lastTime === 0) {
      this.lastTime = now;
      return;
    }

    // 초 단위 경과 시간 계산
    const dt = Math.min(
      (now - this.lastTime) / 1000,
      0.05
    );

    this.lastTime = now;
    this.elapsedTime += dt;

    // 10분이 지나면 적 생성 중단
    if (this.elapsedTime >= 600) {
      this.elapsedTime = 600;
      return;
    }

    this.updateDifficulty();

    // 적 생성
    this.spawnTimer += dt;

    while (
      this.spawnTimer >= this.spawnInterval &&
      this.enemies.length < this.maxEnemies
    ) {
      this.spawn(ctx);
      this.spawnTimer -= this.spawnInterval;
    }

    // 모든 적 이동
    for (const enemy of this.enemies) {
      if (enemy.exploding) {
        enemy.explosionTime -= dt;

        if (enemy.explosionTime <= 0) {
          enemy.remove = true;
        }

        continue;
      }

      enemy.hitCooldown = Math.max(
        0,
        enemy.hitCooldown - dt
      );

      const dx = targetX - enemy.x;
      const dy = targetY - enemy.y;
      const distance = Math.hypot(dx, dy);

      // 배를 향해 추격
      if (distance > 0) {
        enemy.x +=
          (dx / distance) * enemy.speed * 60 * dt;

        enemy.y +=
          (dy / distance) * enemy.speed * 60 * dt;
      }

      // 배와 접촉했는지 확인
      const collisionDistance = enemy.size / 2 + 20;

      if (distance < collisionDistance) {
        if (enemy.type === this.types.pufferfish) {
          // 복어 폭발
          enemy.exploding = true;
          enemy.explosionTime = 0.35;

          if (
            typeof Ship !== "undefined" &&
            typeof Ship.takeDamage === "function"
          ) {
            Ship.takeDamage(enemy.damage);
          }
        } else if (
          enemy.hitCooldown <= 0 &&
          typeof Ship !== "undefined" &&
          typeof Ship.takeDamage === "function"
        ) {
          Ship.takeDamage(enemy.damage);
          enemy.hitCooldown = 1;
        }
      }
    }

    this.enemies = this.enemies.filter(
      (enemy) => !enemy.remove
    );
  },

  // 적 그리기
  draw(ctx) {
    if (!this.imageReady) return;

    for (const enemy of this.enemies) {
      const img = this.images[enemy.type.image];

      if (!img) continue;

      if (enemy.exploding) {
        // 복어의 방사능 폭발 효과
        const progress =
          1 - enemy.explosionTime / 0.35;

        ctx.beginPath();

        ctx.arc(
          enemy.x,
          enemy.y,
          enemy.size * progress + 8,
          0,
          Math.PI * 2
        );

        ctx.fillStyle = "rgba(120, 255, 60, 0.65)";
        ctx.fill();

        continue;
      }

      // 적 이미지 표시
      ctx.drawImage(
        img,
        enemy.x - enemy.size / 2,
        enemy.y - enemy.size / 2,
        enemy.size,
        enemy.size
      );

      // 거북이와 상어의 체력 막대
      if (
        enemy.type === this.types.turtle ||
        enemy.type === this.types.shark
      ) {
        const barWidth = enemy.size;
        const barHeight = 4;

        const hpRatio = Math.max(
          0,
          enemy.hp / enemy.maxHp
        );

        ctx.fillStyle = "#442222";

        ctx.fillRect(
          enemy.x - barWidth / 2,
          enemy.y - enemy.size / 2 - 8,
          barWidth,
          barHeight
        );

        ctx.fillStyle = "#55dd55";

        ctx.fillRect(
          enemy.x - barWidth / 2,
          enemy.y - enemy.size / 2 - 8,
          barWidth * hpRatio,
          barHeight
        );
      }
    }
  }
};
