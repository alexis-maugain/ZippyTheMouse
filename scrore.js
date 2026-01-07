let score = 0;

function increaseScore(points) {
    score += points;
    updateScoreDisplay();
}

function updateScoreDisplay() {
    document.getElementById('scoreDisplay').innerText = `Score: ${score}`;
}

function setupScoreSystem() {
    let scoreDisplay = document.createElement('div');
    scoreDisplay.id = 'scoreDisplay';
    scoreDisplay.style.position = 'absolute';
    scoreDisplay.style.top = '10px';
    scoreDisplay.style.right = '10px';
    scoreDisplay.style.color = 'white';
    scoreDisplay.style.fontSize = '24px';
    document.body.appendChild(scoreDisplay);
    updateScoreDisplay();
}

