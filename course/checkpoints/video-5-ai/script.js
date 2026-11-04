/* =========================================
   DINO RUNNER — script.js
   This file controls what the game DOES.
   ========================================= */


// ---------- 1. FIND THE GAME PIECES ----------
// We grab the things we made in index.html so JavaScript can control them.
const game = document.getElementById("game");
const gameArea = document.getElementById("game-area");
const player = document.getElementById("player");
const obstacle = document.getElementById("obstacle");
const scoreText = document.getElementById("score");
const bestText = document.getElementById("best"); // VIDEO 5
const startText = document.getElementById("start-text");
const message = document.getElementById("message");
const restartButton = document.getElementById("restart-button");


// ---------- 2. GAME SETTINGS (try changing these!) ----------
const groundLevel = 50;   // where the dino stands (matches "bottom" in style.css)
const jumpPower = 15;     // how strong the jump is
const gravity = 0.8;      // how fast the dino falls back down
const startSpeed = 6;     // VIDEO 5: the speed at the start of every game
let gameSpeed = startSpeed; // how fast the obstacle moves right now


// ---------- 3. GAME STATE (things that change while we play) ----------
let playerY = 0;          // how high the dino is above the ground
let playerVelocity = 0;   // how fast the dino is moving up (+) or down (-)
let isJumping = false;
let obstacleX = 600;      // how far the obstacle is from the left side
let score = 0;
let bestScore = 0;        // VIDEO 5: the highest score so far
let isRunning = false;
let isGameOver = false;


// ---------- 4. KEYBOARD INPUT ----------
// Listen for the player pressing a key.
document.addEventListener("keydown", function (event) {
  if (event.code !== "Space") {
    return; // we only care about the Space bar
  }

  event.preventDefault(); // stop Space from scrolling the page

  if (isGameOver) {
    restartGame();
    return;
  }

  if (!isRunning) {
    startGame();
  }

  jump();
});


// ---------- 5. JUMPING ----------
function jump() {
  if (isJumping) {
    return; // no jumping while already in the air
  }

  playerVelocity = jumpPower; // push the dino upwards
  isJumping = true;
}


// ---------- 6. GRAVITY + MOVING THE PLAYER ----------
function updatePlayer() {
  playerY = playerY + playerVelocity;          // move up or down
  playerVelocity = playerVelocity - gravity;   // gravity pulls down a little every frame

  // Landed back on the ground?
  if (playerY <= 0) {
    playerY = 0;
    playerVelocity = 0;
    isJumping = false;
  }

  player.style.bottom = (groundLevel + playerY) + "px";
}


// ---------- 7. MOVING THE OBSTACLE ----------
function updateObstacle() {
  obstacleX = obstacleX - gameSpeed; // move left

  // Gone off the left side? Send it back to the right.
  if (obstacleX < -50) {
    obstacleX = gameArea.clientWidth + Math.random() * 300;
  }

  obstacle.style.left = obstacleX + "px";
}


// ---------- 8. COLLISION DETECTION ----------
// Are the player's box and the obstacle's box overlapping?
function isColliding() {
  const p = player.getBoundingClientRect();
  const o = obstacle.getBoundingClientRect();
  const padding = 8; // makes the game a little more forgiving

  const overlapLeftRight = p.right - padding > o.left && p.left + padding < o.right;
  const overlapUpDown = p.bottom - padding > o.top;

  return overlapLeftRight && overlapUpDown;
}


// ---------- 9. SCORE ----------
function updateScore() {
  score = score + 0.1; // a little bit every frame you survive
  scoreText.textContent = Math.floor(score);
}


// ---------- 9b. SPEED UP (added in Video 5 with Claude's help) ----------
// Every 100 points the "level" goes up by 1, and the game gets 1 faster.
//   0-99 points   -> level 0 -> speed 6
//   100-199 points -> level 1 -> speed 7
//   200-299 points -> level 2 -> speed 8
function updateSpeed() {
  const level = Math.floor(score / 100);
  gameSpeed = startSpeed + level;
}


// ---------- 10. THE GAME LOOP ----------
// This runs about 60 times every second.
function gameLoop() {
  if (!isRunning) {
    return;
  }

  updatePlayer();
  updateObstacle();
  updateScore();
  updateSpeed(); // VIDEO 5

  if (isColliding()) {
    gameOver();
    return;
  }

  requestAnimationFrame(gameLoop); // run again on the next frame
}


// ---------- 11. START, GAME OVER, RESTART ----------
function startGame() {
  isRunning = true;
  obstacleX = gameArea.clientWidth; // obstacle starts at the right edge
  startText.classList.add("hidden");
  game.classList.add("running");    // starts the CSS running animations
  requestAnimationFrame(gameLoop);
}

function gameOver() {
  isRunning = false;
  isGameOver = true;
  game.classList.remove("running");
  player.classList.add("crashed");
  message.classList.remove("hidden");

  // VIDEO 5: is this a new best score?
  if (score > bestScore) {
    bestScore = Math.floor(score);
    bestText.textContent = bestScore;
  }
}

function restartGame() {
  // Put everything back to how it started
  playerY = 0;
  playerVelocity = 0;
  isJumping = false;
  score = 0;
  gameSpeed = startSpeed; // VIDEO 5: back to normal speed
  isGameOver = false;
  scoreText.textContent = 0;

  player.classList.remove("crashed");
  message.classList.add("hidden");
  restartButton.blur(); // so pressing Space later doesn't "click" the button again

  startGame();
}

restartButton.addEventListener("click", restartGame);
