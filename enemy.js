
const Enemy = {
    images: {},
    enemies: [],
    imageReady: false,

    elapsedTime: 0,
    spawnTimer: 0,
    lastTime: 0,
    spawnInterval: 1.5,

    types: {
        fish: {
            hp: 2,
            speed: 1,
            size: 56,
            damage: 1
        },
        pufferfish: {
            hp: 5,
            speed: 0.65,
            size: 76,
            damage: 2
        },
        seagull: {
            hp: 2,
            speed: 2,
            size: 64,
            damage: 1
        },
        turtle: {
            hp: 18,
            speed: 0.45,
            size: 96,
            damage: 2
        },
        shark: {
            hp: 35,
            speed: 1.35,
            size: 128,
            damage: 4
        }
    },

    init() {
        const files = {
            fish: "fish.png",
            pufferfish: "pufferfish.png",
            seagull: "seagull.png",
            turtle: "turtle.png",
            shark: "shark.png"
        };

        for (const type in files) {
            const img = new Image();
            img.src = files[type];
            this.images[type] = img;
        }

        this.imageReady = true;
        this.lastTime = performance.now();
    },

    updateDifficulty() {
        this.spawnInterval = Math.max(
            0.5,
            1.5 - this.elapsedTime / 600
        );
    },

    chooseType() {
        const time = this.elapsedTime;

        const random = Math.random();

        if (time < 120) {
            return "fish";
        }

        if (time < 240) {
            return random < 0.75 ? "fish" : "pufferfish";
        }

        if (time < 360) {
            if (random < 0.45) return "fish";
            if (random < 0.75) return "pufferfish";
            return "seagull";
        }

        if (time < 480) {
            if (random < 0.25) return "fish";
            if (random < 0.50) return "pufferfish";
            if (random < 0.75) return "seagull";
            return "turtle";
        }

        if (random < 0.15) return "fish";
        if (random < 0.35) return "pufferfish";
        if (random < 0.55) return "seagull";
        if (random < 0.75) return "turtle";
        return "shark";
    },

    spawn(ctx) {
        const type = this.chooseType();
        const info = this.types[type];

        const margin = 80;
        const side = Math.floor(Math.random() * 4);

        let x;
        let y;

        if (side === 0) {
            x = Math.random() * ctx.canvas.width;
            y = -margin;
        } else if (side === 1) {
            x = ctx.canvas.width + margin;
            y = Math.random() * ctx.canvas.height;
        } else if (side === 2) {
            x = Math.random() * ctx.canvas.width;
            y = ctx.canvas.height + margin;
        } else {
            x = -margin;
            y = Math.random() * ctx.canvas.height;
        }

        this.enemies.push({
            type: type,
            x: x,
            y: y,
            hp: info.hp,
            angle: 0,
            size: info.size,
            speed: info.speed,
            damage: info.damage,
            hitTimer: 0
        });
    },

    update(targetX, targetY, ctx, moveX = 0, moveY = 0) {
        const now = performance.now();
        const dt = Math.min((now - this.lastTime) / 1000, 0.05);
        this.lastTime = now;

        if (this.elapsedTime >= 600) return;

        this.elapsedTime += dt;
        this.spawnTimer += dt;

        this.updateDifficulty();

        // 적 생성
        while (this.spawnTimer >= this.spawnInterval) {
            this.spawn(ctx);
            this.spawnTimer -= this.spawnInterval;
        }

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];

            // 배가 움직이면 적도 반대 방향으로 이동
            enemy.x -= moveX * 60 * dt;
            enemy.y -= moveY * 60 * dt;

            // 배와 적 사이의 방향 계산
            const dx = targetX - enemy.x;
            const dy = targetY - enemy.y;

            // 적이 배를 바라보도록 회전
            enemy.angle = Math.atan2(dy, dx) + Math.PI / 2;

            const distance = Math.sqrt(dx * dx + dy * dy);

            // 배를 향해 이동
            if (distance > 0) {
                enemy.x += Math.cos(enemy.angle) * enemy.speed * 60 * dt;
                enemy.y += Math.sin(enemy.angle) * enemy.speed * 60 * dt;
            }

            // 배와 충돌했는지 확인
            if (distance < enemy.size / 2 + 25) {
                if (enemy.hitTimer <= 0) {
                    Ship.takeDamage(enemy.damage);
                    enemy.hitTimer = 1;
                }
            }

            if (enemy.hitTimer > 0) {
                enemy.hitTimer -= dt;
            }
        }
    },

    draw(ctx) {
        for (const enemy of this.enemies) {
            const img = this.images[enemy.type];

            if (!img || !img.complete || img.naturalWidth === 0) {
                continue;
            }

            ctx.save();

            ctx.translate(enemy.x, enemy.y);

            // 이미지가 오른쪽을 바라보는 기준으로 회전
            ctx.rotate(enemy.angle);

            ctx.drawImage(
                img,
                -enemy.size / 2,
                -enemy.size / 2,
                enemy.size,
                enemy.size
            );

            ctx.restore();

            // 거북이와 상어 체력 표시
            if (enemy.type === "turtle" || enemy.type === "shark") {
                const maxHp = this.types[enemy.type].hp;
                const barWidth = enemy.size;
                const hpRatio = Math.max(0, enemy.hp / maxHp);

                ctx.fillStyle = "red";
                ctx.fillRect(
                    enemy.x - barWidth / 2,
                    enemy.y - enemy.size / 2 - 10,
                    barWidth,
                    5
                );

                ctx.fillStyle = "lime";
                ctx.fillRect(
                    enemy.x - barWidth / 2,
                    enemy.y - enemy.size / 2 - 10,
                    barWidth * hpRatio,
                    5
                );
            }
        }
    }
};
