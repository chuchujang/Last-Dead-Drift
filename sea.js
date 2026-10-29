const Sea = {
  images: [],
  imageReady: false,

  // 바다 타일 한 칸의 크기
  tileSize: 256,

  // 바다의 이동 위치
  offsetX: 0,
  offsetY: 0,

  // 바다 타일 목록
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

    Promise.all(
      this.images.map((img) => {
        return new Promise((resolve, reject) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }

          img.onload = () => resolve();

          img.onerror = () => {
            reject(
              new Error("바다 이미지 불러오기 실패: " + img.src)
            );
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

  // 이미지 순서 무작위로 섞기
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

    const columns = 9;
    const rows = 9;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const shuffled = this.shuffleImages();

        this.tiles.push({
          image: shuffled[(x + y) % shuffled.length]
        });
      }
    }
  },

  // 배의 이동에 따라 바다 움직이기
  update(moveX, moveY) {
    this.offsetX -= moveX;
    this.offsetY -= moveY;
  },

  // 바다 그리기
  draw(ctx) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const size = this.tileSize;

    if (!this.imageReady || this.tiles.length === 0) {
      ctx.fillStyle = "#123b4a";
      ctx.fillRect(0, 0, width, height);
      return;
    }

    const columns = 9;
    const rows = 9;

    // 음수 좌표도 올바르게 계산
    const mod = (value, divisor) => {
      return ((value % divisor) + divisor) % divisor;
    };

    // 화면 왼쪽 위에 해당하는 월드 타일 위치
    const firstCol = Math.floor(-this.offsetX / size);
    const firstRow = Math.floor(-this.offsetY / size);

    // 타일의 화면 위치를 정수로 맞춰 틈 방지
    const startX = Math.floor(
      this.offsetX + firstCol * size
    );

    const startY = Math.floor(
      this.offsetY + firstRow * size
    );

    // 픽셀 아트 이미지의 흐림 방지
    ctx.imageSmoothingEnabled = false;

    for (
      let screenY = startY, worldRow = firstRow;
      screenY < height;
      screenY += size, worldRow++
    ) {
      for (
        let screenX = startX, worldCol = firstCol;
        screenX < width;
        screenX += size, worldCol++
      ) {
        const col = mod(worldCol, columns);
        const row = mod(worldRow, rows);

        const tile = this.tiles[row * columns + col];

        if (tile && tile.image) {
          // 이웃한 타일끼리 2픽셀 겹쳐 그리기
          ctx.drawImage(
            tile.image,
            Math.floor(screenX),
            Math.floor(screenY),
            size + 2,
            size + 2
          );
        }
      }
    }
  }
};
