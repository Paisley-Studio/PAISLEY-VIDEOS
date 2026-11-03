# VIDEO 4 — Make It Come Alive: JavaScript

**Runtime:** ~11 min · **File:** `script.js` · **Starts from:** `checkpoints/video-3-css/` · **Ends at:** `checkpoints/video-4-javascript/` (a working game)

## Objective
Students turn the "WHAT IT DOES" column into JavaScript. Each behaviour is added one at a time, and they see the link between **code and behaviour** after every step. By the end they have a working Dino Runner they can change.

## Lesson flow
1. Recap: the beautiful car with no engine (0:00–0:40)
2. Find the game pieces: variables (0:40–1:50)
3. Keyboard input (1:50–2:40)
4. Jumping + the game loop: "Houston, we have a problem" (2:40–4:30)
5. Gravity + landing (4:30–5:50)
6. Moving the obstacle (5:50–7:00)
7. Collision detection (7:00–8:15)
8. Score (8:15–8:50)
9. Game Over + restart (8:50–10:10)
10. Play it + challenges (10:10–11:00)

**Visual system:** The editor/browser split, with new code highlighted in **yellow** (the JS colour). Every step ends with the **SHOW CODE → EXPLAIN IT → RUN IT → SEE WHAT CHANGED** strip, with the current stage lit. When the narrator explains a line, an arrow links that line to the thing it affects in the browser. Variables appear as labelled "boxes" in a side panel whose values update live (for example `playerY: 0 → 34 → 87 → 140 → 87 → 0`). This is the key visual metaphor for the whole video.

> **Teaching rule:** students add each new variable to the **GAME SETTINGS** or **GAME STATE** section at the top as they need it. The final layout matches the numbered sections in the starter comment.

---

## Script

### Scene 1 — Recap
**VISUAL:** The styled game. A Space key is pressed and nothing happens. The **WHAT IT DOES** column from Video 1 slides in (jumps, moves, detects collision, increases score, ends the game, restarts) and highlights yellow.
**NARRATOR:**
> "We've created the structure."
> "We've designed the appearance."
> "Now we need to teach the game what to do."
> "And we'll do it one behaviour at a time, straight down this list."

### Scene 2 — Find the game pieces (variables)
```js
// ---------- 1. FIND THE GAME PIECES ----------
const game = document.getElementById("game");
const gameArea = document.getElementById("game-area");
const player = document.getElementById("player");
const obstacle = document.getElementById("obstacle");
const scoreText = document.getElementById("score");
const startText = document.getElementById("start-text");
const message = document.getElementById("message");
const restartButton = document.getElementById("restart-button");

console.log(player);
```
**VISUAL:** For each line, a "grabber" hand reaches from the code into the HTML and pulls out the element by its name tag (the id stickers from Video 2), dropping it into a labelled box.
**NARRATOR:**
> "Remember the id name tags from the HTML video? This is why we made them."
> "document.getElementById means 'go into the page and find the thing called player.' We store it in a box called a variable, so we can use it later."
> "const means this box will always hold the same thing. The player is always the player."

**RUN:** Open the console (F12). `<div id="player">` is printed.
> "The console is JavaScript's notepad. It printed our player, so JavaScript has found it."

### Scene 3 — Keyboard input
```js
// ---------- 4. KEYBOARD INPUT ----------
document.addEventListener("keydown", function (event) {
  if (event.code !== "Space") {
    return; // we only care about the Space bar
  }

  event.preventDefault(); // stop Space from scrolling the page

  console.log("Space pressed!");
});
```
**VISUAL:** An "ear" icon attaches to the page and a Space-bar graphic pulses. Each press sends a ripple into the ear.
**NARRATOR:**
> "We need the computer to know when the player presses Space."
> "addEventListener means 'listen'. Every time a key goes down, run this function."
> "If it's not the Space key, return. That means stop, do nothing. Otherwise, print a message."

**RUN:** Press Space three times and the console shows "Space pressed!" ×3. Press "A" and nothing appears.
> "The game can hear us now."

### Scene 4 — Jumping + the game loop
Add to the top sections:
```js
// ---------- 2. GAME SETTINGS (try changing these!) ----------
const groundLevel = 50;   // where the dino stands (matches "bottom" in style.css)
const jumpPower = 15;     // how strong the jump is

// ---------- 3. GAME STATE (things that change while we play) ----------
let playerY = 0;          // how high the dino is above the ground
let playerVelocity = 0;   // how fast the dino is moving up (+) or down (-)
let isJumping = false;
let isRunning = false;
```
> "Settings are numbers *we* choose. State is information that changes while you play. That's why it uses let instead of const: let means the value can change."

Add functions:
```js
// ---------- 5. JUMPING ----------
function jump() {
  if (isJumping) {
    return; // no jumping while already in the air
  }

  playerVelocity = jumpPower; // push the dino upwards
  isJumping = true;
}

// ---------- 6. MOVING THE PLAYER ----------
function updatePlayer() {
  playerY = playerY + playerVelocity; // move up or down
  player.style.bottom = (groundLevel + playerY) + "px";
}

// ---------- 10. THE GAME LOOP ----------
function gameLoop() {
  if (!isRunning) {
    return;
  }

  updatePlayer();

  requestAnimationFrame(gameLoop); // run again on the next frame
}

// ---------- 11. START ----------
function startGame() {
  isRunning = true;
  requestAnimationFrame(gameLoop);
}
```
Replace the `console.log` in the keyboard listener with:
```js
  if (!isRunning) {
    startGame();
  }

  jump();
```
**VISUAL (game loop):** A circular "flip-book" diagram. Each page is one frame, and the loop spins: *update player → draw → next frame*, with a counter showing "60 times per second".
**NARRATOR:**
> "A function is a set of instructions with a name. jump is a function. It says: if you're already jumping, stop. Otherwise, push the dino upwards."
> "But games don't happen once. They happen over and over, like a flip-book. That's the game loop. requestAnimationFrame says 'run me again on the next frame', about sixty times a second."
> "Remember in the CSS video, when we changed bottom and the dino moved? updatePlayer does exactly that. Sixty times a second."

**RUN:** Press Space. The dino rockets up… and off the top of the screen, never to return. A comedic slide-whistle SFX plays. The side panel shows `playerY` climbing: 15, 30, 45 … 900 …
> "Houston, we have a problem. We pushed the dino up, but nothing ever pulls it back down."
> "That's actually great news. The code is doing *exactly* what we told it. We just haven't told it about gravity."

### Scene 5 — Gravity + landing
Add to settings: `const gravity = 0.8; // how fast the dino falls back down`

Add one line inside `updatePlayer`, right after the first line:
```js
  playerVelocity = playerVelocity - gravity; // gravity pulls down a little every frame
```
**VISUAL:** Velocity as an arrow on the dino that shrinks each frame (15 → 14.2 → 13.4 … 0) and then flips to point down and grows. A ball-toss diagram sits beside it.
**NARRATOR:**
> "Now we need the dinosaur to come back down."
> "Every frame, gravity takes a little bit off the upward speed. Eventually it's zero, the very top of the jump, and then it goes negative and the dino falls."

**RUN:** Press Space. The dino goes up in a lovely arc… and falls straight through the ground. *(falling whistle)*
> "Ha. Better! But now it doesn't know where the ground is. Let's tell it."

Add the landing check inside `updatePlayer`, before the `player.style.bottom` line:
```js
  // Landed back on the ground?
  if (playerY <= 0) {
    playerY = 0;
    playerVelocity = 0;
    isJumping = false;
  }
```
**RUN:** A perfect jump and landing. *(soft thud)* Jump again and again.
> "If the dino is at or below the ground, put it on the ground, stop it moving, and let it jump again."
> "See what we did? We ran it, saw a problem, figured out why, and fixed it. That's how real developers work."

**VISUAL:** "Remember this!" callout. *This is the bug we'll investigate with Claude in Video 5.*

### Scene 6 — Moving the obstacle
Add: `let gameSpeed = 6;` (settings) and `let obstacleX = 600;` (state).
```js
// ---------- 7. MOVING THE OBSTACLE ----------
function updateObstacle() {
  obstacleX = obstacleX - gameSpeed; // move left

  // Gone off the left side? Send it back to the right.
  if (obstacleX < -50) {
    obstacleX = gameArea.clientWidth + Math.random() * 300;
  }

  obstacle.style.left = obstacleX + "px";
}
```
Add `updateObstacle();` to `gameLoop` after `updatePlayer();`. Update `startGame`:
```js
function startGame() {
  isRunning = true;
  obstacleX = gameArea.clientWidth; // obstacle starts at the right edge
  startText.classList.add("hidden");
  game.classList.add("running");    // starts the CSS running animations
  requestAnimationFrame(gameLoop);
}
```
**VISUAL:** A number line along the game area with `obstacleX` marked. It counts down 600 → 594 → 588… and when it goes past −50 it teleports back to the right with a little *swoosh*. `Math.random()` is shown as a dice roll adding a random gap.
**NARRATOR:**
> "Every frame, the cactus moves 6 pixels to the left. When it disappears off the left edge, we send it back to the right, plus a random extra gap so you can't predict it."
> "And look, the start text disappears, the ground starts scrolling and the legs start running. Remember those CSS animations waiting for a class called running? JavaScript just switched them on."

**RUN:** Press Space. The world comes alive. The cactus slides past and passes straight through the dino. *(ghost "wooo" SFX)*
> "One small problem. Our dino is a ghost."

### Scene 7 — Collision detection
```js
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
```
Add to `gameLoop`, after the updates:
```js
  if (isColliding()) {
    gameOver();
    return;
  }
```
And a first, simple `gameOver`:
```js
function gameOver() {
  isRunning = false;
}
```
**VISUAL:** The dino and cactus are drawn as outlined boxes. Two tests light up: **LEFT/RIGHT overlap?** (horizontal bars slide together) and **UP/DOWN overlap?** (vertical bars). Only when *both* are ✅ does a red star burst appear. Then a jump example: left/right ✅, up/down ❌, so no crash.
**NARRATOR:**
> "How does a computer 'see' a crash? It doesn't. It compares boxes."
> "getBoundingClientRect gives us each box's edges: left, right, top, bottom."
> "If the boxes overlap side to side, AND overlap up and down, they've crashed. If you're jumping, they overlap side to side but not up and down, so you're safe."
> "The padding makes the boxes a tiny bit smaller, so a near-miss feels fair."

**RUN:** Run into the cactus and everything freezes. *(thud)*
> "The game knows when we've crashed."

### Scene 8 — Score
Add `let score = 0;` (state).
```js
// ---------- 9. SCORE ----------
function updateScore() {
  score = score + 0.1; // a little bit every frame you survive
  scoreText.textContent = Math.floor(score);
}
```
Add `updateScore();` to `gameLoop`.
**VISUAL:** The panel shows `score: 0.1, 0.2 … 5.9` next to the screen's "Score: 5". `Math.floor` is shown as a knife chopping off the decimal.
**NARRATOR:**
> "Every frame you survive, add a tenth of a point. Math.floor chops off the decimals so the screen shows whole numbers. textContent changes the words on the page."

**RUN:** The score ticks up while running.

### Scene 9 — Game Over + restart
Add `let isGameOver = false;` (state). Replace `gameOver` and add `restartGame`:
```js
function gameOver() {
  isRunning = false;
  isGameOver = true;
  game.classList.remove("running");
  player.classList.add("crashed");
  message.classList.remove("hidden");
}

function restartGame() {
  // Put everything back to how it started
  playerY = 0;
  playerVelocity = 0;
  isJumping = false;
  score = 0;
  isGameOver = false;
  scoreText.textContent = 0;

  player.classList.remove("crashed");
  message.classList.add("hidden");
  restartButton.blur(); // so pressing Space later doesn't "click" the button again

  startGame();
}

restartButton.addEventListener("click", restartGame);
```
In the keyboard listener, before `if (!isRunning)`:
```js
  if (isGameOver) {
    restartGame();
    return;
  }
```
**VISUAL:** Class switches shown as light switches on the elements: `running` OFF on the game, `crashed` ON on the player, `hidden` OFF on the message. Each flip triggers the CSS look we built in Video 3 (red dino, overlay appears).
**NARRATOR:**
> "Here's the beautiful part: we already designed the crash look and the Game Over screen in CSS. JavaScript just flips the switches. Add crashed and the dino turns red. Remove hidden and Game Over appears."
> "Restart puts every piece of state back to the beginning and starts again. You can click the button or just press Space."

**RUN:** Full playthrough: jump, jump, crash → Game Over → click Play Again → playing again → crash → press Space → playing again. *(celebratory chime)*

### Scene 10 — Play it + challenges
**VISUAL:** "IT'S ALIVE" moment. The final code scrolls past with all 11 sections glowing in turn, then cuts to gameplay with the dino and cactus.
**NARRATOR:**
> "That's a working game. And you know what every single line does, because you watched each one change something."
> "Now make it yours. Look at your paper plan. What would you change?"

**VISUAL:** Challenge cards deal out like playing cards, each with a hint of *where* to change it:
| Challenge | Where |
|---|---|
| Change the jump height | `jumpPower` in settings |
| Change the game speed | `gameSpeed` in settings |
| Make gravity feel like the Moon | `gravity` |
| Change the obstacle's look | `#obstacle` in style.css |
| Score twice as fast | `updateScore` |
| Change the background | `--sky` in style.css |
| Turn it into *your* paper design | all three files! |

> "Next time, we bring in Claude, and learn how to use AI to understand our code, fix problems, and add features we haven't learned yet."

---

## Code introduced
Final file: `checkpoints/video-4-javascript/script.js`.

**New ideas:** variables (`const` vs `let`), `getElementById`, the console, event listeners, `if` and `return`, functions, the game loop (`requestAnimationFrame`), velocity and gravity, changing `style` from JS, `Math.random`, bounding-box collision, `classList.add/remove`, `textContent`.

## What students do
- Add each behaviour, run it, and watch it change.
- Enjoy the two "bugs" (flying off the screen, falling through the floor) and understand why they happen.
- Complete at least two challenges and write on their paper plan what they changed.

## End-of-video checkpoint
- [ ] Space starts the game and makes the dino jump; it lands on the ground
- [ ] The cactus moves and comes back at random gaps
- [ ] Hitting the cactus turns the dino red and shows Game Over
- [ ] The score goes up while you survive
- [ ] Play Again (or Space) restarts with score 0
- [ ] I changed at least one setting and saw what happened
