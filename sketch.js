let isGameStarted = false;
let isGameOver = false; // Variable to track if the game is over
let isWin = false; // Variable to track if the player wins
let lasers, mouseShooter, ground;
let enemySpawned = false, flyingEnemySpawned = false, bothEnemiesSpawned = false;
let gravity = 0.5, velocityY = 0, jumpForce = -15, isJumping = false;
let projectiles = [];
let isMousePressed = false;
let platforms = []; // Array to hold platforms
let waveTransition = false;

function setup() {
    new Canvas();
    displayMode('maxed');

    lasers = new Group();
    lasers.image = 'assets/asteroids_bullet.png';

    mouseShooter = new Sprite(width / 2, height - 50, 70, 80, 'static');
    mouseShooter.image = 'assets/zippy.svg';

    ground = new Sprite(width / 2, height - 10, width, 20, 'static');
    ground.color = 'blue';

    setupScoreSystem();

    // Create platforms
    /*
    platforms.push(new Sprite(width / 4, height - 100, 100, 20, 'static'));
    platforms.push(new Sprite(width / 2, height - 200, 100, 20, 'static'));
    platforms.push(new Sprite(3 * width / 4, height - 300, 100, 20, 'static'));
    */

    // Create platforms
    let minDistance = 250; // Minimum distance between platforms
    for (let i = 0; i < 5; i++) {
        let x, y;
        let validPosition = false;
        while (!validPosition) {
            x = random(width);
            y = random(height - 400, height - 150);
            validPosition = true;
            for (let platform of platforms) {
                if (dist(x, y, platform.x, platform.y) < minDistance) {
                    validPosition = false;
                }
            }
        }
        let platformType = random([1, 2]); // Randomly choose between two platform types
        if (platformType === 1) {
            platforms.push(new Sprite(x, y, 150, 100, 'static'));
        } else {
            platforms.push(new Sprite(x, y, 220, 130, 'static'));
        }
    }

    for (let platform of platforms) {
        if (platform.w === 150) {
            platform.image = 'assets/info_box.svg';
        } else {
            platform.image = 'assets/warning_box.svg';
        }
    }


    // Create a moving platform
    movingPlatform = new Sprite(width / 2, height - 150, 203, 110, 'kinematic'); // Kinematic to allow movement
    movingPlatform.image = 'assets/error_box.svg';
    movingPlatform.direction = 1; // Initialize direction (1 for right, -1 for left)
    movingPlatform.y = height - 400;

    document.getElementById("startScreen").style.display = "block";
    document.getElementById("gameCanvas").style.display = "none";
    document.getElementById("GOVideoScreen").style.display = "none"; // Hide game over screen initially
    document.getElementById("WINVideoScreen").style.display = "none";
    // Ajout de l'événement pour démarrer le jeu
    document.getElementById("startButton").addEventListener("click", startNewGame);
}

function applyGravity() {
    velocityY += gravity;
    mouseShooter.y += velocityY;

    if (mouseShooter.y + mouseShooter.h / 2 > ground.y - ground.h / 2) {
        mouseShooter.y = ground.y - ground.h / 2 - mouseShooter.h / 2;
        velocityY = 0;
        isJumping = false;
    }

    for (let platform of platforms) {
        if (mouseShooter.y + mouseShooter.h / 2 > platform.y - platform.h / 2 &&
            mouseShooter.y - mouseShooter.h / 2 < platform.y + platform.h / 2 &&
            mouseShooter.x + mouseShooter.w / 2 > platform.x - platform.w / 2 &&
            mouseShooter.x - mouseShooter.w / 2 < platform.x + platform.w / 2) {
            mouseShooter.y = platform.y - platform.h / 2 - mouseShooter.h / 2;
            velocityY = 0;
            isJumping = false;
        }
    }
}

function handleMovement() {
    if (keyIsDown(90) && !isJumping) { // Z key
        velocityY = jumpForce;
        isJumping = true;
    }

    if (keyIsDown(32) && !isJumping) { // Spacebar key
        velocityY = jumpForce;
        isJumping = true;
    }

    if (keyIsDown(83)) mouseShooter.y = min(mouseShooter.y + 5, height - mouseShooter.h / 2); // S key
    if (keyIsDown(81)) {
        mouseShooter.x = max(mouseShooter.x - 5, mouseShooter.w / 2); // Q key
        mouseShooter.mirror.x = true; // Flip image horizontally
        let frameIndex = Math.floor(frameCount / 4) % 8; // Slower animation by changing frame every 4 frames
        mouseShooter.image = `assets/zippy/${frameIndex}.svg`;
    } else if (keyIsDown(68)) {
        mouseShooter.x = min(mouseShooter.x + 5, width - mouseShooter.w / 2); // D key
        mouseShooter.mirror.x = false; // Reset image orientation
        let frameIndex = Math.floor(frameCount / 4) % 8; // Slower animation by changing frame every 4 frames
        mouseShooter.image = `assets/zippy/${frameIndex}.svg`;
    } else {
        mouseShooter.image = 'assets/zippy.svg'; // Reset to default image
    }

    // Ensure mouseShooter stays within the canvas vertically
    mouseShooter.y = max(mouseShooter.y, mouseShooter.h / 2);
}

function handleShooting() {
    if (mouseIsPressed && !isMousePressed) {
        isMousePressed = true;
        let projectile = new Sprite(mouseShooter.x, mouseShooter.y, 10, 10);
        projectile.image = 'assets/projectilesouris.svg';
        let angle = atan2(mouseY - mouseShooter.y, mouseX - mouseShooter.x);
        projectile.velocityX = cos(angle) * 10;
        projectile.velocityY = sin(angle) * 10;
        projectiles.push(projectile);
    } else if (!mouseIsPressed) {
        isMousePressed = false;
    }
}

function updateMovingPlatform() {
    // Move platform horizontally between two points
    let platformSpeed = 2;
    let leftLimit = width / 4; // Left boundary
    let rightLimit = (3 * width) / 4; // Right boundary

    // Update platform's horizontal position
    movingPlatform.x += platformSpeed * movingPlatform.direction;

    // Reverse direction if hitting boundaries
    if (movingPlatform.x >= rightLimit || movingPlatform.x <= leftLimit) {
        movingPlatform.direction *= -1; // Change direction
    }

    // Handle falling and landing from below or above the moving platform
    let isAbovePlatform =
        mouseShooter.y + mouseShooter.h / 2 <= movingPlatform.y - movingPlatform.h / 2 + 5 &&
        mouseShooter.y + mouseShooter.h / 2 > movingPlatform.y - movingPlatform.h / 2 - 5; // Tolerance for landing
    let isHorizontallyAligned =
        mouseShooter.x + mouseShooter.w / 2 > movingPlatform.x - movingPlatform.w / 2 &&
        mouseShooter.x - mouseShooter.w / 2 < movingPlatform.x + movingPlatform.w / 2;

    if (isHorizontallyAligned) {
        // If falling and within the vertical range of the platform, land on it
        if (velocityY > 0 && isAbovePlatform) {
            // Player is above the platform and falling, land on the platform
            mouseShooter.y = movingPlatform.y - movingPlatform.h / 2 - mouseShooter.h / 2; // Correct vertical position
            velocityY = 0; // Stop falling
            isJumping = false; // Reset jumping state
        }
        // Handle landing from below the platform
        else if (velocityY > 0 && mouseShooter.y + mouseShooter.h / 2 > movingPlatform.y - movingPlatform.h / 2) {
            // Check if the player is falling through and landing on the platform
            if (
                mouseShooter.y + mouseShooter.h / 2 <= movingPlatform.y - movingPlatform.h / 2 + 5 &&
                mouseShooter.y + mouseShooter.h / 2 > movingPlatform.y - movingPlatform.h / 2 - 5
            ) {
                mouseShooter.y = movingPlatform.y - movingPlatform.h / 2 - mouseShooter.h / 2; // Adjust the position to land on the platform
                velocityY = 0; // Stop falling
                isJumping = false; // Reset jumping state
            }
        }
    }

    // If no landing occurs, normal gravity behavior
    if (velocityY > 0 && !isAbovePlatform) {
        // Let the player continue falling if no platform detected above
        velocityY = max(velocityY, 0);
    }

    // Move player horizontally with the moving platform (if landed)
    if (velocityY === 0 && isAbovePlatform && isHorizontallyAligned) {
        mouseShooter.x += platformSpeed * movingPlatform.direction; // Horizontal movement with the platform
    }
}

function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        let p = projectiles[i];
        p.x += p.velocityX;
        p.y += p.velocityY;

        // Check collision with platforms
        for (let platform of platforms) {
            if (p.x + p.w / 2 > platform.x - platform.w / 2 &&
                p.x - p.w / 2 < platform.x + platform.w / 2 &&
                p.y + p.h / 2 > platform.y - platform.h / 2 &&
                p.y - p.h / 2 < platform.y + platform.h / 2) {
                p.remove(); // Remove the projectile from display
                projectiles.splice(i, 1); // Remove the projectile from the array
                break; // Exit the loop since the projectile is removed
            }
        }

        // Remove projectile if it goes out of bounds
        if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
            p.remove(); // Remove the projectile from display
            projectiles.splice(i, 1); // Remove the projectile from the array
        }
    }
}

function checkCollisions() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        let p = projectiles[i];
        // Add collision checks with other objects if needed
    }
}

function showWinScreen() {
    console.log("Displaying win screen");
    document.getElementById("gameCanvas").style.display = "none"; // Hide the game
    document.getElementById("WINVideoScreen").style.display = "block"; // Show win screen
}

function restartGame() {
    console.log("Restarting the game");
    document.getElementById("WINVideoScreen").style.display = "none"; // Hide the win screen
    document.getElementById("gameCanvas").style.display = "block"; // Show the game canvas

    // Reset game variables
    isGameStarted = true;
    isGameOver = false;
    isWin = false;

    // Reset sprite states
    mouseShooter.x = width / 2;
    mouseShooter.y = height - 30;
    mouseShooter.health = 100;
    velocityY = 0;
    isJumping = false;

    // Reset projectiles
    projectiles.forEach(p => p.remove());
    projectiles = [];

    console.log("Game restarted successfully");
}

// Example: Call `showWinScreen` when the player wins
function checkWinCondition() {
    if (isWin) {
        showWinScreen();
    }
}

function drawMouseShooterHealthBar() {
    let healthBarWidth = mouseShooter.w + mouseShooter.w * 2;
    let healthBarHeight = 10;
    let healthBarX = mouseShooter.x - healthBarWidth / 2;
    let healthBarY = mouseShooter.y - mouseShooter.h / 2 - 20;

    fill(255, 0, 0);
    rect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

    fill(0, 255, 0);
    rect(healthBarX, healthBarY, healthBarWidth * (mouseShooter.health / 100), healthBarHeight);
}

let isVideoCompleted = false;

// Event listener for the "Start the game" button
document.getElementById("startButton").addEventListener("click", startVideo);

function startNewGame() {
    if (!isVideoCompleted) {
        return; // Prevent game start if the video hasn't ended yet
    }

    // Game initialization logic
    mouseShooter.y = height - 30;
    mouseShooter.health = 100; // Reset health
    velocityY = 0;
    isJumping = false;
    isGameStarted = true;
    isGameOver = false;
    isWin = false;

    // Show the game canvas
    document.getElementById("gameCanvas").style.display = "block"; // Show canvas

    // Hide game over screen (if visible)
    document.getElementById("GOVideoScreen").style.display = "none"; // Hide game over screen

    // Make sure game logic doesn't run until after video ends
    if (isGameStarted) {
        // Start running game logic here (e.g., your p5.js or game logic)
    }
}

function startVideo() {
    const startScreen = document.getElementById("startScreen");
    const startVideo = document.getElementById("startVideo");

    // Hide the start screen and show the video
    startScreen.style.display = "none";
    startVideo.style.display = "block"; // Show video

    // Play the video
    startVideo.play();

    // Wait for the video to end before starting the game
    startVideo.onended = function () {
        startVideo.style.display = "none"; // Hide video after it finishes
        isVideoCompleted = true; // Set flag to true when the video ends
        startNewGame(); // Start the game after the video ends
    };
}

// Function to trigger the end of the game
function endGame() {
    isGameStarted = false;
    isGameOver = true;
  
    // Hide the game canvas and show the game over video
    document.getElementById("gameCanvas").style.display = "none"; // Hide the game canvas
    showGameOver(); // Show the game over video
  }
  
  // Function to show the game over video and the restart button after it finishes
  function showGameOver() {
    const gameOverVideo = document.getElementById("gameOverVideo");
    const restartButton = document.getElementById("restartButton");
    const GOVideoScreen = document.getElementById("GOVideoScreen");

    // Show the game over video screen
    GOVideoScreen.style.display = "flex"; // Show the video screen

    // Ensure the video plays
    gameOverVideo.play();

    // When the video ends, show the restart button
    gameOverVideo.onended = function () {
        restartButton.style.display = "block"; // Show the restart button after the video ends
    };
}

function displayWaveMessage(message) {
    let waveMessage = document.createElement('div');
    waveMessage.innerText = message;
    waveMessage.style.position = 'absolute';
    waveMessage.style.top = '50%';
    waveMessage.style.left = '50%';
    waveMessage.style.transform = 'translate(-50%, -50%)';
    waveMessage.style.color = 'white';
    waveMessage.style.fontSize = '48px';
    waveMessage.style.zIndex = '1000';
    document.body.appendChild(waveMessage);

    setTimeout(() => {
        document.body.removeChild(waveMessage);
    }, 2000); // Display message for 2 seconds
}

// function checkBossDefeat() {
//     if (bossSpawned && boss.health <= 0) {
//         boss.remove();
//         bossSpawned = false;
//         isWin = true;
//         document.getElementById("WINScreen").style.display = "block";
//         document.getElementById("gameCanvas").style.display = "none";
//         noLoop(); // Stop the draw loop
//     }
// }

function draw() {
    let bgImage = loadImage('assets/bliss.svg');
    background(bgImage);

    if (isGameStarted) {
        applyGravity();
        handleMovement();
        handleShooting();
        updateProjectiles();

        // Spawn enemies based on score with pauses between waves
        if (score < 700 && !enemySpawned) {
            if (!waveTransition) {
                waveTransition = true;
                setTimeout(() => {
                    enemies.forEach(enemy => enemy.remove());
                    enemies = [];
                    spawnEnemy();
                    enemySpawned = true;
                    mouseShooter.health = 100; // Reset health
                    waveTransition = false;
                }, 2000); // 2 seconds pause between waves
                displayWaveMessage("Wave 1");
            }
        } else if (score >= 700 && score < 1500 && !flyingEnemySpawned) {
            if (!waveTransition) {
                waveTransition = true;
                setTimeout(() => {
                    enemies.forEach(enemy => enemy.remove());
                    enemies = [];
                    flyingEnemies.forEach(enemy => enemy.remove());
                    flyingEnemies = [];
                    spawnFlyingEnemy();
                    flyingEnemySpawned = true;
                    mouseShooter.health = 100; // Reset health
                    waveTransition = false;
                }, 2000); // 2 seconds pause between waves
                displayWaveMessage("Wave 2");
            }
        } else if (score >= 1500 && score < 2200 && !bothEnemiesSpawned) {
            if (!waveTransition) {
                waveTransition = true;
                setTimeout(() => {
                    enemies.forEach(enemy => enemy.remove());
                    flyingEnemies.forEach(enemy => enemy.remove());
                    enemies = [];
                    flyingEnemies = [];
                    spawnEnemy();
                    spawnFlyingEnemy();
                    bothEnemiesSpawned = true;
                    mouseShooter.health = 100; // Reset health
                    waveTransition = false;
                }, 2000); // 2 seconds pause between waves
                displayWaveMessage("Wave 3");
            }
        } else if (score >= 2200 && !bossSpawned) {
            if (!waveTransition) {
                waveTransition = true;
                setTimeout(() => {
                    enemies.forEach(enemy => enemy.remove());
                    flyingEnemies.forEach(enemy => enemy.remove());
                    enemies = [];
                    flyingEnemies = [];
                    spawnBoss();
                    bossSpawned = true;
                    mouseShooter.health = 100; // Reset health
                    waveTransition = false;
                }, 2000); // 2 seconds pause between waves
                displayWaveMessage("Boss Wave");
            }
        }

        updateEnemies(); // Update enemies
        updateFlyingEnemies();

        checkCollisions();

        drawMouseShooterHealthBar(); // Draw the health bar for mouseShooter
        updateMovingPlatform();

        updateBoss();

        if (millis() - lastEnemySpawnTime > enemySpawnInterval && !bossSpawned) {
            spawnEnemy();
            enemySpawned = true;
            lastEnemySpawnTime = millis();
        }
    }
}
