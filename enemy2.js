let flyingEnemies = [];
let flyingEnemyProjectiles = [];
let flyingEnemySpawnInterval = 10000; // Interval between enemy spawns in milliseconds
let lastFlyingEnemySpawnTime = 0;

function spawnFlyingEnemy() {
    let groupSize = floor(random(2, 4)); // Random number of enemies between 5 and 8
    for (let i = 0; i < groupSize; i++) {
        let flyingEnemy = new Sprite(width + 50 + i * 60, random(50, height / 2 - 50), 30, 30, 'dynamic'); // Adjusted height and spacing
        flyingEnemy.image = 'assets/enemy2/0.svg'; // Initial image
        flyingEnemy.velocityX = -2;
        flyingEnemy.velocityY = 0; // Initial vertical velocity
        flyingEnemy.health = 30; // Add health property
        flyingEnemies.push(flyingEnemy);

        let frameIndex = 0;
        setInterval(() => {
            flyingEnemy.image = `assets/enemy2/${frameIndex}.svg`;
            frameIndex = (frameIndex + 1) % 2 // Ensure frameIndex cycles 
        }, 150);
    }
}

function flyingEnemyShoot(flyingEnemy) {
    let projectile = new Sprite(flyingEnemy.x, flyingEnemy.y, 10, 10, 'dynamic');
    projectile.image = `assets/projectileemail.svg`
    let angle = atan2(mouseShooter.y - flyingEnemy.y, mouseShooter.x - flyingEnemy.x);
    projectile.velocityX = cos(angle) * 5;
    projectile.velocityY = sin(angle) * 5;
    flyingEnemyProjectiles.push(projectile);
}

function updateFlyingEnemies() {
    for (let i = flyingEnemies.length - 1; i >= 0; i--) {
        let flyingEnemy = flyingEnemies[i];
        flyingEnemy.x += flyingEnemy.velocityX;
        flyingEnemy.velocityY += gravity; // Apply gravity
        flyingEnemy.y += flyingEnemy.velocityY;

        // Add random movement to keep the enemy above the mouseShooter and within canvas bounds
        flyingEnemy.velocityY = random(-0.5, 0.5); // Slight vertical movement for flying effect
        flyingEnemy.velocityX += random(-0.1, 0.1); // Slight horizontal movement for flying effect

        // Ensure the enemy stays above the mouseShooter
        if (flyingEnemy.y > mouseShooter.y - 50) {
            flyingEnemy.y = mouseShooter.y - 50;
            flyingEnemy.velocityY = -abs(flyingEnemy.velocityY); // Move upwards
        }

        // Ensure the enemy stays within the canvas bounds
        if (flyingEnemy.y < 0) {
            flyingEnemy.y = 0;
            flyingEnemy.velocityY = abs(flyingEnemy.velocityY); // Move downwards
        }

        // Check collision with ground
        if (flyingEnemy.y + flyingEnemy.h / 2 > ground.y - ground.h / 2) {
            flyingEnemy.y = ground.y - ground.h / 2 - flyingEnemy.h / 2;
            flyingEnemy.velocityY = 0;
        }

        // Remove enemy if it goes out of bounds
        if (flyingEnemy.x < -50) {
            flyingEnemy.remove();
            flyingEnemies.splice(i, 1);
        }

        // Check collision with projectiles
        for (let j = projectiles.length - 1; j >= 0; j--) {
            let p = projectiles[j];
            if (p.collides(flyingEnemy)) {
                flyingEnemy.health -= 15; // Decrease health
                p.remove();
                projectiles.splice(j, 1);
                if (flyingEnemy.health <= 0) {
                    flyingEnemy.remove();
                    increaseScore(250)
                    flyingEnemies.splice(i, 1);
                }
                break;
            }
        }

        // Enemy shooting logic
        if (random() < 0.005) { // 1% chance to shoot each frame
            flyingEnemyShoot(flyingEnemy);
        }

        // Draw health bar above enemy
        drawFlyingEnemyHealthBar(flyingEnemy);
    }

    // Update enemy projectiles
    for (let i = flyingEnemyProjectiles.length - 1; i >= 0; i--) {
        let p = flyingEnemyProjectiles[i];
        p.x += p.velocityX;
        p.y += p.velocityY;

        // Remove projectile if it goes out of bounds
        if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
            p.remove();
            flyingEnemyProjectiles.splice(i, 1);
        }

        // Check collision with mouse shooter
        if (p.collides(mouseShooter)) {
            // Handle collision with mouse shooter
            p.remove();
            flyingEnemyProjectiles.splice(i, 1);
            // Add logic to handle damage to mouse shooter
            mouseShooter.health -= 10; // Decrease health
            if (mouseShooter.health <= 0) {
                // Handle game over logic
                mouseShooter.remove();
                document.getElementById('GOScreen').style.display = 'block';
                noLoop(); // Stop the draw loop
            }
        }
    }
}

function drawFlyingEnemyHealthBar(flyingEnemy) {
    let healthBarWidth = flyingEnemy.w;
    let healthBarHeight = 5;
    let healthBarX = flyingEnemy.x - healthBarWidth / 2;
    let healthBarY = flyingEnemy.y - flyingEnemy.h / 2 - 10;

    fill(255, 0, 0);
    rect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

    fill(0, 255, 0);
    rect(healthBarX, healthBarY, healthBarWidth * (flyingEnemy.health / 30), healthBarHeight); // Adjusted to max health of 30
}
