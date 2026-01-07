let enemies = [];
let enemyProjectiles = [];
let enemySpawnInterval = 10000; // Interval between enemy spawns in milliseconds
let lastEnemySpawnTime = 0;

function spawnEnemy() {
    let groupSize = floor(random(5, 9)); // Random number of enemies between 5 and 8
    for (let i = 0; i < groupSize; i++) {
        let enemy = new Sprite(width + 50 + i * 60, height - 60, 50, 50, 'dynamic'); // Adjusted height and spacing
        let folderIndex = floor(random(0, 4)); // Random folder index between 0 and 3
        enemy.image = `assets/enemy/${folderIndex}/0.svg`; // Set initial image from random folder
        enemy.velocityX = -2;
        enemy.velocityY = 0; // Initial vertical velocity
        enemy.health = 30; // Add health property
        enemies.push(enemy);

        // Animate enemy images
        let frameIndex = 0;
        setInterval(() => {
            enemy.image = `assets/enemy/${folderIndex}/${frameIndex}.svg`;
            frameIndex = (frameIndex + 1) % 2; // Cycle between 0 and 1
        }, 150);
    }
}

function enemyShoot(enemy) {
    let projectile = new Sprite(enemy.x, enemy.y, 10, 10, 'dynamic');
    projectile.image = `assets/projectilevirus.svg`
    let angle = atan2(mouseShooter.y - enemy.y, mouseShooter.x - enemy.x);
    projectile.velocityX = cos(angle) * 5;
    projectile.velocityY = sin(angle) * 5;
    enemyProjectiles.push(projectile);
}
function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        let enemy = enemies[i];
        enemy.x += enemy.velocityX;
        enemy.velocityY += gravity; // Apply gravity
        enemy.y += enemy.velocityY;

        // Add random movement
        enemy.velocityX += random(-0.1, 0.1);
        enemy.velocityY += random(-0.1, 0.1);

        // Check collision with ground
        if (enemy.y + enemy.h / 2 > ground.y - ground.h / 2) {
            enemy.y = ground.y - ground.h / 2 - enemy.h / 2;
            enemy.velocityY = 0;
        }

        // Remove enemy if it goes out of bounds
        if (enemy.x < -50) {
            enemy.remove();
            enemies.splice(i, 1);
        }

        // Check collision with projectiles
        for (let j = projectiles.length - 1; j >= 0; j--) {
            let p = projectiles[j];
            if (p.collides(enemy)) {
                enemy.health -= 10; // Decrease health
                p.remove();
                projectiles.splice(j, 1);
                if (enemy.health <= 0) {
                    enemy.remove();
                    increaseScore(100)
                    enemies.splice(i, 1);
                }
                break;
            }
        }

        // Enemy shooting logic
        if (random() < 0.005) { // 1% chance to shoot each frame
            enemyShoot(enemy);
        }

        // Draw health bar above enemy
        drawEnemyHealthBar(enemy);
    }


    // Update enemy projectiles
    for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
        let p = enemyProjectiles[i];
        p.x += p.velocityX;
        p.y += p.velocityY;

        // Remove projectile if it goes out of bounds
        if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
            p.remove();
            enemyProjectiles.splice(i, 1);
        }

        // Check collision with mouse shooter
        if (p.collides(mouseShooter)) {
            // Handle collision with mouse shooter
            p.remove();
            enemyProjectiles.splice(i, 1);
            // Add logic to handle damage to mouse shooter
            mouseShooter.health -= 10; // Decrease health
            if (mouseShooter.health <= 0) {
                // Handle game over logic
                mouseShooter.remove();
                document.getElementById('GOVideoScreen').style.display = 'block';
                noLoop(); // Stop the draw loop
            }
        }
    }
}


function drawEnemyHealthBar(enemy) {
    let healthBarWidth = enemy.w;
    let healthBarHeight = 5;
    let healthBarX = enemy.x - healthBarWidth / 2;
    let healthBarY = enemy.y - enemy.h / 2 - 10;

    fill(255, 0, 0);
    rect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

    fill(0, 255, 0);
    rect(healthBarX, healthBarY, healthBarWidth * (enemy.health / 30), healthBarHeight); // Adjusted to max health of 30

}

