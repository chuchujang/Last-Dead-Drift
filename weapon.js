const Weapon = {
  bullets: [],

  // 공격 설정
  fireInterval: 1,       // 1초마다 발사
  bulletSpeed: 7,        // 총알 속도
  bulletDamage: 1,        // 총알 피해량
  bulletWidth: 12,        // 총알 가로 길이
  bulletHeight: 5,         // 총알 세로 길이

  fireTimer: 0,

  // 무기 초기화
  init() {
    this.bullets = [];
    this.fireTimer = 0;
  },

  // 가장 가까운 적 찾기
  findNearestEnemy(shipX, shipY) {
    if (typeof Enemy === "undefined") return null;

    let nearest = null;
    let nearestDistance = Infinity;

    for (const enemy of Enemy.enemies) {
      if (enemy.exploding || enemy.remove) continue;

      const dx = enemy.x - shipX;
      const dy = enemy.y - shipY;
      const distance = Math.hypot(dx, dy);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = enemy;
      }
    }

    return nearest;
  },

  // 총알 발사
  shoot(shipX, shipY, enemy) {
    if (!enemy) return;

    const dx = enemy.x - shipX;
    const dy = enemy.y - shipY;
    const distance = Math.hypot(dx, dy);

    if (distance === 0) return;

    this.bullets.push({
      x: shipX,
      y: shipY,
      vx: (dx / distance) * this.bulletSpeed,
      vy: (dy / distance) * this.bulletSpeed,
      damage: this.bulletDamage
    });
  },

  // 총알 이동 및 충돌 확인
  update(dt, shipX, shipY) {
    if (typeof Enemy === "undefined") return;

    // 자동 발사 타이머
    this.fireTimer += dt;

    if (this.fireTimer >= this.fireInterval) {
      const target = this.findNearestEnemy(shipX, shipY);

      if (target) {
        this.shoot(shipX, shipY, target);
        this.fireTimer = 0;
      }
    }

    // 총알 이동
    for (const bullet of this.bullets) {
      bullet.x += bullet.vx;
      bullet.y += bullet.vy;

      // 적과 충돌 확인
      for (const enemy of Enemy.enemies) {
        if (enemy.exploding || enemy.remove) continue;

        const dx = enemy.x - bullet.x;
        const dy = enemy.y - bullet.y;
        const distance = Math.hypot(dx, dy);

        if (distance < enemy.size / 2 + 6) {
          enemy.hp -= bullet.damage;
          bullet.remove = true;

          // 적 체력이 0이면 제거
          if (enemy.hp <= 0) {
            enemy.remove = true;
          }

          break;
        }
      }
    }

    // 화면 밖으로 나간 총알 제거
    this.bullets = this.bullets.filter((bullet) => {
      return (
        !bullet.remove &&
        bullet.x > -50 &&
        bullet.x < 850 &&
        bullet.y > -50 &&
        bullet.y < 650
      );
    });
  },

  // 총알 그리기
  draw(ctx) {
    ctx.fillStyle = "#FFD83D";

    for (const bullet of this.bullets) {
      ctx.fillRect(
        bullet.x - this.bulletWidth / 2,
        bullet.y - this.bulletHeight / 2,
        this.bulletWidth,
        this.bulletHeight
      );
    }
  }
};
