const Island = {
  islands: [],
  spawnTimer: 0,
  spawnInterval: 60,
  islandSize: 100,
  shopOpen: false,
  wasEPressed: false,
  wasEscapePressed: false,

  init() {
    this.islands = [];
    this.spawnTimer = 0;
    this.shopOpen = false;
  },

  // 일정 시간마다 새로운 섬 생성
  spawn(sea) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 1000 + Math.random() * 400;

    // 바다 좌표를 기준으로 섬 위치 결정
    const worldX = -sea.offsetX + Math.cos(angle) * distance;
    const worldY = -sea.offsetY + Math.sin(angle) * distance;

    this.islands.push({
      x: worldX,
      y: worldY,
      size: this.islandSize
    });
  },

  update(deltaTime, sea, keys) {
    this.spawnTimer += deltaTime;

    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer -= this.spawnInterval;
      this.spawn(sea);
    }

    // 화면 중앙에 있는 배와 가장 가까운 섬 찾기
    let nearestDistance = Infinity;

    for (const island of this.islands) {
      const screenX = island.x + sea.offsetX;
      const screenY = island.y + sea.offsetY;

      const distance = Math.hypot(screenX, screenY);

      if (distance < nearestDistance) {
        nearestDistance = distance;
      }
    }

    // 섬 근처에서는 E 키로 상점 이용
    const nearIsland = nearestDistance < 150;
    const ePressed = Boolean(keys["e"]);
    const escapePressed = Boolean(keys["escape"]);

    if (ePressed && !this.wasEPressed && nearIsland) {
      this.shopOpen = !this.shopOpen;
    }

    if (escapePressed && !this.wasEscapePressed) {
      this.shopOpen = false;
    }

    // 섬에서 멀어지면 상점 자동 닫기
    if (!nearIsland) {
      this.shopOpen = false;
    }

    this.wasEPressed = ePressed;
    this.wasEscapePressed = escapePressed;
  },

  draw(ctx, sea) {
    for (const island of this.islands) {
      const x = island.x + sea.offsetX;
      const y = island.y + sea.offsetY;

      // 화면에서 너무 멀면 그리지 않기
      if (
        x < -200 || x > ctx.canvas.width + 200 ||
        y < -200 || y > ctx.canvas.height + 200
      ) {
        continue;
      }

      // 모래 해변
      ctx.fillStyle = "#b6a16a";
      ctx.beginPath();
      ctx.ellipse(
        x, y,
        island.size,
        island.size * 0.72,
        0.2, 0, Math.PI * 2
      );
      ctx.fill();

      // 섬 내부
      ctx.fillStyle = "#587d43";
      ctx.beginPath();
      ctx.ellipse(
        x, y,
        island.size * 0.78,
        island.size * 0.53,
        0.2, 0, Math.PI * 2
      );
      ctx.fill();

      // 임시 보급품 상점 표시
      ctx.fillStyle = "#554536";
      ctx.fillRect(x - 15, y - 12, 30, 24);

      ctx.fillStyle = "#d4c49a";
      ctx.fillRect(x - 9, y - 6, 18, 12);
    }

    // 상점 창
    if (this.shopOpen) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fillRect(200, 150, 400, 300);

      ctx.strokeStyle = "#b6a16a";
      ctx.lineWidth = 3;
      ctx.strokeRect(200, 150, 400, 300);

      ctx.textAlign = "center";

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px sans-serif";
      ctx.fillText("섬 보급 상점", 400, 200);

      ctx.font = "18px sans-serif";
      ctx.fillText("보급 상점에 도착했다!", 400, 255);
      ctx.fillText("아이템 거래 기능은 다음 단계에서 추가", 400, 300);

      ctx.font = "16px sans-serif";
      ctx.fillText("ESC 키: 상점 닫기", 400, 400);
    }
  }
};
