
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

        // 체력이 0 이하이거나 제거 표시된 적 삭제
        this.enemies = this.enemies.filter(
            enemy => !enemy.remove && enemy.hp > 0
        );

        const now = performance.now();
        const dt = Math.min((now - this.lastTime) / 1000, 0.05);
        this.lastTime = now;

        if (this.elapsedTime >= 600) return;

        this.elapsedTime += dt;
        this.spawnTimer += dt;

        this.updateDifficulty();

        while (this.spawnTimer >= this.spawnInterval) {
            this.spawn(ctx);
            this.spawnTimer -= this.spawnInterval;
        }

        // 배의 실제 이동 방향을 직접 가져오기
        const shipMoveX = Ship.moveX;
        const shipMoveY = Ship.moveY;

        // 1. 배가 움직이는 방향과 같은 방향으로 적 이동
        for (const enemy of this.enemies) {
            enemy.x += shipMoveX * 60 * dt * 1.5;
            enemy.y += shipMoveY * 60 * dt * 1.5;

            // 적이 배를 추적
            const dx = targetX - enemy.x;
            const dy = targetY - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
                const moveAngle = Math.atan2(dy, dx);

                enemy.x += Math.cos(moveAngle) * enemy.speed * 60 * dt;
                enemy.y += Math.sin(moveAngle) * enemy.speed * 60 * dt;

                enemy.angle = moveAngle - Math.PI / 2;
            }
        }

        // 2. 몹끼리 겹치지 않도록 밀어내기
        for (let pass = 0; pass < 4; pass++) {
            for (let i = 0; i < this.enemies.length; i++) {
                for (let j = i + 1; j < this.enemies.length; j++) {
                    const enemy = this.enemies[i];
                    const other = this.enemies[j];

                    const dx = enemy.x - other.x;
                    const dy = enemy.y - other.y;

                    const distance = Math.sqrt(dx * dx + dy * dy);

                    const minDistance =
                        (enemy.size + other.size) * 0.3;

                    if (distance < minDistance) {
                        let pushX;
                        let pushY;
                        let overlap;

                        if (distance === 0) {
                            pushX = 1;
                            pushY = 0;
                            overlap = minDistance;
                        } else {
                            pushX = dx / distance;
                            pushY = dy / distance;
                            overlap = minDistance - distance;
                        }

                        const pushAmount = overlap * 0.5;

                        enemy.x += pushX * pushAmount;
                        enemy.y += pushY * pushAmount;

                        other.x -= pushX * pushAmount;
                        other.y -= pushY * pushAmount;
                    }
                }
            }
        }

        // 3. 배와 몹의 충돌 확인
        for (const enemy of this.enemies) {
            const dx = targetX - enemy.x;
            const dy = targetY - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

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

            if (enemy.remove || enemy.hp <= 0) {
                continue;
            }

            const img = this.images[enemy.type];

            if (!img || !img.complete || img.naturalWidth === 0) {
                continue;
            }

            const scale = enemy.size / Math.max(
                img.naturalWidth,
                img.naturalHeight
            );

            const width = img.naturalWidth * scale;
            const height = img.naturalHeight * scale;

            ctx.save();

            ctx.translate(enemy.x, enemy.y);
            ctx.rotate(enemy.angle);

            ctx.drawImage(
                img,
                -width / 2,
                -height / 2,
                width,
                height
            );

            ctx.restore();

            // 거북이와 상어 체력 표시
            if (enemy.type === "turtle" || enemy.type === "shark") {
                const maxHp = this.types[enemy.type].hp;
                const hpRatio = Math.max(0, enemy.hp / maxHp);
                const barWidth = enemy.size;

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
