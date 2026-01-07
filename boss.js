let boss;
let bossProjectiles = [];
let bossSpawned = false;

function spawnBoss() {
    boss = new Sprite(width - 50, height / 2, 100, 100, 'static');
    boss.image = 'assets/boss/0.svg'; // Initial image
    boss.velocityX = 0; // Boss does not move
    boss.health = 500; // Boss health
    bossSpawned = true;

    // Set the boss image to cycle through the images
    let frameIndex = 0;
    setInterval(() => {
        boss.image = `assets/boss/${frameIndex}.svg`;
        frameIndex = (frameIndex + 1) % 6 // Ensure frameIndex cycles 
    }, 150);
}

function bossShoot() {
    let patterns = [
        // Pattern 1: Shoot directly at the right side of the screen
        () => {
            let projectile = new Sprite(boss.x, boss.y, 20, 20, 'dynamic');
            projectile.image = 'assets/folder.svg';
            projectile.rotationSpeed = 5;
            let angle = atan2(boss.y - height / 2, boss.x - width); // Aim towards the right side
            projectile.velocityX = cos(angle) * 7;
            projectile.velocityY = sin(angle) * 7;
            bossProjectiles.push(projectile);
        },
        // Pattern 2: Shoot in a narrow spread towards the right
        () => {
            for (let i = -1; i <= 1; i++) {
                let projectile = new Sprite(boss.x, boss.y, 20, 20, 'dynamic');
                projectile.image = 'assets/folder.svg';
                projectile.rotationSpeed = 3;
                let angle = atan2(mouseShooter.y - boss.y, mouseShooter.x - boss.x) + i * PI / 24; // Narrow spread towards the mouseShooter
                projectile.velocityX = cos(angle) * 7;
                projectile.velocityY = sin(angle) * 7;
                bossProjectiles.push(projectile);
            }
        },
        // Pattern 3: Shoot in a fan towards the right
        () => {
            for (let i = -3; i <= 3; i++) {
                let projectile = new Sprite(boss.x, boss.y, 20, 20, 'dynamic');
                projectile.image = 'assets/folder.svg';
                projectile.rotationSpeed = 3;
                let angle = i * PI / 3.5; // Spread in a circle around the boss
                projectile.velocityX = cos(angle) * 7;
                projectile.velocityY = sin(angle) * 7;
                bossProjectiles.push(projectile);
            }
        }
    ];

    // Choose a random pattern to execute
    let randomPattern = random(patterns);
    randomPattern();
}

function updateBoss() {
    // if (!bossSpawned && score > 800) {
    //     spawnBoss();
    // }

    if (bossSpawned) {
        // Boss does not move
        // Boss shooting logic
        if (random() < 0.02) { // 1% chance to shoot each frame
            bossShoot();
        }

        // Check collision with projectiles
        for (let i = projectiles.length - 1; i >= 0; i--) {
            let p = projectiles[i];
            if (p.collides(boss)) {
                boss.health -= 10; // Decrease health
                p.remove();
                projectiles.splice(i, 1);
                if (boss.health <= 0) {
                    boss.remove();
                    document.getElementById("WINVideoScreen").style.display = "block";
                    document.getElementById("gameCanvas").style.display = "none";
                    noLoop()
                    increaseScore(1000);
                    bossSpawned = false;
                }
                break;
            }
        }

        // Draw health bar above boss
        drawBossHealthBar(boss);
    }

    // Update boss projectiles
    for (let i = bossProjectiles.length - 1; i >= 0; i--) {
        let p = bossProjectiles[i];
        p.x += p.velocityX;
        p.y += p.velocityY;

        // Remove projectile if it goes out of bounds
        if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
            p.remove();
            bossProjectiles.splice(i, 1);
        }

        // Check collision with mouse shooter
        if (p.collides(mouseShooter)) {
            p.remove();
            bossProjectiles.splice(i, 1);
            mouseShooter.health -= 20; // Decrease health
            if (mouseShooter.health <= 0) {
                mouseShooter.remove();
                document.getElementById('GOVideoScreen').style.display = 'block';
                noLoop(); // Stop the draw loop
            }
        }
    }
}

function drawBossHealthBar(boss) {
    let healthBarWidth = width * 0.9; // 90% of the canvas width
    let healthBarHeight = 20;
    let healthBarX = (width - healthBarWidth) / 2;
    let healthBarY = 20; // Position at the top of the canvas

    fill(255, 0, 0);
    rect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

    fill(0, 255, 0);
    rect(healthBarX, healthBarY, healthBarWidth * (boss.health / 500), healthBarHeight); // Adjusted to max health of 500
}

