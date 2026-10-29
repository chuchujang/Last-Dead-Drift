
const Sea = {
  images: [],
  imageReady: false,

  // 타일 한 개의 크기
  tileSize: 256,

  // 바다 배경의 이동 위치
  offsetX: 0,
  offsetY: 0,

  // 타일 배치
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

    const columns = 9;
    const rows = 9;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const shuffled = this.shuffleImages();

        this.tiles.push({
          x: x * this.tileSize,
          y: y * this.tileSize,
          image: shuffled[(x + y) % shuffled.length]
        });
      }
    }
  },

  // 배의 움직임에 맞춰 바다 이동
  update(moveX, moveY) {
    this.offsetX -= moveX;
    this.offsetY -= moveY;
  },

  // 바다 배경 그리기
  draw(ctx) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const size = this.tileSize;

    // 이미지 로딩 중에는 임시 바다색 표시
    if (!this.imageReady || this.tiles.length === 0) {
      ctx.fillStyle = "#123b4a";
      ctx.fillRect(0, 0, width, height);
      return;
    }

    const columns = 9;
    const rows = 9;

    // 음수 위치에서도 올바르게 계산
    const mod = (value, divisor) => {
      return ((value % divisor) + divisor) % divisor;
    };

    // 화면에 보이는 첫 타일의 위치
    const startX = -mod(this.offsetX, size);
    const startY = -mod(this.offsetY, size);

    // 현재 배경이 어느 타일만큼 이동했는지 계산
    const firstCol = Math.floor(this.offsetX / size);
    const firstRow = Math.floor(this.offsetY / size);

    // 화면 전체를 타일로 채우기
    for (
      let screenY = startY, rowIndex = 0;
      screenY < height;
      screenY += size, rowIndex++
    ) {
      for (
        let screenX = startX, colIndex = 0;
        screenX < width;
        screenX += size, colIndex++
      ) {
        const worldCol = mod(
          firstCol + colIndex,
          columns
        );

        const worldRow = mod(
          firstRow + rowIndex,
          rows
        );

        const tile = this.tiles[
          worldRow * columns + worldCol
        ];

        if (tile && tile.image) {
          // 소수점 좌표로 인한 틈을 줄이기
          const drawX = Math.floor(screenX);
          const drawY = Math.floor(screenY);

          ctx.drawImage(
            tile.image,
            drawX,
            drawY,
            size + 1,
            size + 1
          );
        }
      }
    }
  }
};
