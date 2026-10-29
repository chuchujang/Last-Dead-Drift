const Sea = {
  // 바다 이미지 4개
  images: [],
  imageReady: false,

  // 타일 하나의 크기
  tileSize: 256,

  // 바다 배경의 이동 위치
  offsetX: 0,
  offsetY: 0,

  // 타일 배치에 사용할 이미지 순서
  tiles: [],

  // 바다 이미지 불러오기
  init() {
    const filenames = [
      "sea1.png",
      "sea2.png",
      "sea3.png",
      "sea4.png"
    ];

    this.images = filenames.map((filename) => {
      const img = new Image();
      img.src = filename;
      return img;
    });

    // 이미지 4개가 모두 준비되면 배치 시작
    Promise.all(
      this.images.map((img) => {
        return new Promise((resolve, reject) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }

          img.onload = () => resolve();
          img.onerror = () => {
            reject(new Error("바다 이미지 불러오기 실패: " + img.src));
          };
        });
      })
    )
      .then(() => {
        this.imageReady = true;
        this.createTiles();
      })
      .catch((error) => {
        console.error(error);
      });
  },

  // 이미지 순서를 무작위로 섞기
  shuffleImages() {
    const shuffled = [...this.images];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [shuffled[i], shuffled[j]] = [
        shuffled[j],
        shuffled[i]
      ];
    }

    return shuffled;
  },

  // 바다 타일 배치표 만들기
  createTiles() {
    this.tiles = [];

    // 넉넉한 크기의 바다 타일 배치표
    const columns = 9;
    const rows = 9;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        // 각 줄마다 무작위 순서로 배치
        const shuffled = this.shuffleImages();

        this.tiles.push({
          x: x * this.tileSize,
          y: y * this.tileSize,
          image: shuffled[(x + y) % shuffled.length]
        });
      }
    }
  },

  // 배의 움직임에 따라 바다 이동
  update(moveX, moveY) {
    this.offsetX -= moveX;
    this.offsetY -= moveY;
  },

  // 바다 배경 그리기
  draw(ctx) {
    if (!this.imageReady) {
      ctx.fillStyle = "#123b4a";
      ctx.fillRect(
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
      );
      return;
    }

    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    const worldWidth = 9 * this.tileSize;
    const worldHeight = 9 * this.tileSize;

    // 배경이 무한히 이어지는 것처럼 반복
    const startX =
      ((this.offsetX % this.tileSize) + this.tileSize)
      % this.tileSize - this.tileSize;

    const startY =
      ((this.offsetY % this.tileSize) + this.tileSize)
      % this.tileSize - this.tileSize;

    const baseX =
      ((this.offsetX % worldWidth) + worldWidth)
      % worldWidth;

    const baseY =
      ((this.offsetY % worldHeight) + worldHeight)
      % worldHeight;

    for (
      let screenY = startY, tileRow = 0;
      screenY < height;
      screenY += this.tileSize, tileRow++
    ) {
      for (
        let screenX = startX, tileCol = 0;
        screenX < width;
        screenX += this.tileSize, tileCol++
      ) {
        const worldX =
          ((tileCol * this.tileSize - baseX) % worldWidth
            + worldWidth) % worldWidth;

        const worldY =
          ((tileRow * this.tileSize - baseY) % worldHeight
            + worldHeight) % worldHeight;

        const col = Math.floor(worldX / this.tileSize);
        const row = Math.floor(worldY / this.tileSize);

        const tile = this.tiles[
          row * 9 + col
        ];

        if (tile && tile.image) {
          ctx.drawImage(
            tile.image,
            screenX,
            screenY,
            this.tileSize,
            this.tileSize
          );
        }
      }
    }
  }
};
