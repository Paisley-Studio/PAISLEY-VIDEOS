# VIDEO 5 — Build Smarter With AI: Claude

**Runtime:** ~10 min · **Files:** all three · **Starts from:** `checkpoints/video-4-javascript/` · **Ends at:** `checkpoints/video-5-ai/`

## Objective
Students learn to use Claude as a **thinking partner, not a replacement**. They write context-rich prompts and use Claude to understand, debug, add a feature, brainstorm and redesign. Every answer goes through **READ → UNDERSTAND → TEST → QUESTION → IMPROVE**.

## Lesson flow
1. Why AI now (0:00–0:50)
2. Bad prompt vs. good prompt (0:50–2:30)
3. Use case 1 — Understanding (2:30–3:30)
4. Use case 2 — Debugging (3:30–5:00)
5. Use case 3 — Adding a feature: speed-up (5:00–6:50)
6. Use case 4 — Improvement ideas: best score (6:50–7:50)
7. Use case 5 — Design: jungle theme (7:50–8:40)
8. The journey + final message (8:40–10:00)

**Visual system:** The Claude chat window sits on the right in a clean, realistic chat UI with no robot imagery. Prompts type in at reading speed. The student's code and browser are on the left. Each Claude answer is followed by the five-step chip bar **READ · UNDERSTAND · TEST · QUESTION · IMPROVE**, and the relevant chip lights up as the student does it. Prompt parts are colour-coded throughout: *What I'm building* (orange), *What I have* (blue), *What I understand* (yellow), *What I want* (green), *What I need* (purple).

> **Production note:** record real Claude sessions with these prompts. The "sample answer" summaries below show what the answer should cover. Use the real wording on screen, trimmed for length.

---

## Script

### Scene 1 — Why AI now
**VISUAL:** Side by side: the student's paper plan from Video 1 and the working game from Video 4.
**NARRATOR:**
> "Now you know what you're building."
> "You understand the building blocks."
> "You understand the code."
> "Now let's see how AI can help us build faster."

**VISUAL:** Flashback chip: the Video 1 line *"The better you understand your project, the better you can use AI."*
> "Remember this? Four videos ago it was a promise. Now you can see why. You know what to ask, and you'll know if the answer makes sense."

### Scene 2 — Bad prompt vs. good prompt
**VISUAL:** A chat box. The student types `make me a dino game`. Claude returns a huge wall of unfamiliar code (canvas, classes, things they've never seen). The scroll bar shrinks to a tiny sliver. *(deflating trombone, very short)*
**NARRATOR:**
> "You *could* ask this. And you'd get a game. But it's not *your* game. It's not your design, you don't understand it, and when it breaks, you're stuck."

**VISUAL:** Clear the chat. The five-part prompt builds one coloured block at a time:

> **1. WHAT I'M BUILDING** — I am building a Dino Runner game using HTML, CSS and JavaScript.
> **2. WHAT I ALREADY HAVE** — I already have the game structure, styling and basic JavaScript. The dino jumps, obstacles move, there's a score, Game Over and restart.
> **3. WHAT I UNDERSTAND** — HTML creates the elements, CSS controls their appearance and JavaScript controls behaviour.
> **4. WHAT I WANT** — I want the game to get faster as the score goes up.
> **5. WHAT I NEED** — Explain the logic first, then show me only the code I need to add, and tell me where it goes.

> "Here's how a creator asks. Five parts."
> "What I'm building. What I already have. What I understand. What I want. And what I need back."
> "Look at the last one: 'explain the logic first.' You're not asking AI to think *for* you. You're asking it to think *with* you."

**VISUAL:** Five-part template card (students should screenshot this).

### Scene 3 — Use case 1: UNDERSTANDING
**VISUAL:** The student highlights `isColliding()` in their code, copies it and pastes it into Claude.

**PROMPT:**
> I'm a beginner building a Dino Runner game in JavaScript. Explain what this function is doing in simple language, line by line.
> *(paste `isColliding` function)*

**SAMPLE ANSWER COVERS:** getBoundingClientRect gives each box's edges · the padding shrinks the boxes so near-misses are fair · two checks, side-to-side overlap and up-down overlap · a crash only happens when both are true.

**NARRATOR:**
> "Use AI like a patient tutor. Any line you don't fully get, ask."
**VISUAL:** The **READ** and **UNDERSTAND** chips light up. The student follows up: *"What happens if I make padding 30?"* Claude: *"The boxes shrink a lot, so you could pass through the edge of the cactus."* The student tries `padding = 30` and clips through the cactus edge. **TEST** lights up.
> "And then test it. Don't just believe it. See it."

### Scene 4 — Use case 2: DEBUGGING
**VISUAL:** "BUG REPORT" card. The student's dino jumps… and falls through the ground. (Setup: they accidentally deleted the landing check in `updatePlayer`.)

Broken code:
```js
function updatePlayer() {
  playerY = playerY + playerVelocity;
  playerVelocity = playerVelocity - gravity;

  player.style.bottom = (groundLevel + playerY) + "px";
}
```

**PROMPT:**
> My dinosaur jumps but doesn't return to the ground correctly. It falls through the floor and disappears, and I can't jump again. Here is my code. Help me identify the problem and explain why it is happening before you give me the fix.
> *(paste `updatePlayer` and `jump`)*

**SAMPLE ANSWER COVERS:** gravity keeps making velocity more negative, so `playerY` keeps going down forever · there's nothing that says "stop at the ground" · `isJumping` never goes back to false, which is why you can't jump again · fix: an `if (playerY <= 0)` check that resets `playerY`, `playerVelocity` and `isJumping`.

**NARRATOR:**
> "Notice: we described *what we expected*, *what actually happened*, and gave the code. That's a great bug report."
> "And we asked 'why' before 'fix'. If you only take the fix, you'll make the same mistake next week. If you understand the why, you won't."

**VISUAL:** Flashback to Video 4 Scene 5. It's the same bug we fixed ourselves. **QUESTION** chip: *"Does Claude's answer match what we learned? Yes. Same fix, same reason."*
> "You already knew this one. That's how you can tell when AI is right, and when it isn't."

### Scene 5 — Use case 3: ADDING A FEATURE (speed-up)
**PROMPT** (the full five-part prompt from Scene 2, with a sharper "want"):
> I am building a Dino Runner using HTML, CSS and JavaScript. I already have the structure, styling and a working game loop. The obstacle moves using a variable called gameSpeed. I want the game speed to increase every time the player reaches another 100 points. Explain the logic first, then show me only the code I need to add and where it goes.
> *(paste the settings section and gameLoop)*

**SAMPLE ANSWER COVERS:** The logic: level = score ÷ 100, rounded down; speed = starting speed + level · keep a `startSpeed` so restart can reset · add an `updateSpeed()` function and call it in the game loop · reset `gameSpeed` in `restartGame`.

**VISUAL:** A logic table animates before any code:
| Score | Level (score ÷ 100, rounded down) | Speed |
|---|---|---|
| 0–99 | 0 | 6 |
| 100–199 | 1 | 7 |
| 200–299 | 2 | 8 |

**Code the student adds:**
```js
// settings: replace  let gameSpeed = 6;  with
const startSpeed = 6;       // the speed at the start of every game
let gameSpeed = startSpeed; // how fast the obstacle moves right now

// new function
function updateSpeed() {
  const level = Math.floor(score / 100);
  gameSpeed = startSpeed + level;
}

// in gameLoop, after updateScore();
updateSpeed();

// in restartGame
gameSpeed = startSpeed;
```
**NARRATOR:**
> "Logic first. Before any code, we can check the idea in a table. Does it make sense? Yes."
> "Then the code is short, and every line matches the logic."

**TEST:** Play to 100 and the game visibly speeds up. Crash, restart, and it's back to normal speed. *(level-up chime at 100)*
**QUESTION beat:** The student asks Claude, *"Will this get impossibly fast eventually?"* Claude suggests a maximum, such as `Math.min(startSpeed + level, 14)`. **IMPROVE** lights up.
> "Question it. Then improve it. You're the one deciding."

### Scene 6 — Use case 4: IMPROVEMENT IDEAS
**PROMPT:**
> Here is my Dino Runner game. Suggest three ways I could make this game more interesting without changing its core gameplay. Keep the ideas simple enough for a beginner, and tell me which file each idea would change.

**SAMPLE ANSWER (three cards flip in):** 1. a **best score** that's remembered between rounds (HTML + JS) · 2. **different obstacles**, like a short cactus and a tall cactus (CSS + JS) · 3. a **day/night** sky change every 500 points (CSS + JS).

**NARRATOR:**
> "AI is great for ideas. But *you* choose. Which one fits your paper plan?"

**VISUAL:** The student circles "best score" on their paper plan and adds it to the sketch. *(pencil sound)* Then the build is quick, with Claude-guided code appearing:
```html
<!-- index.html: inside #score-board -->
<span>Best: <span id="best">0</span></span>
```
```js
// script.js
const bestText = document.getElementById("best");
let bestScore = 0;

// inside gameOver()
if (score > bestScore) {
  bestScore = Math.floor(score);
  bestText.textContent = bestScore;
}
```
> "See how the idea went back onto paper first? Even with AI, the process doesn't change."

### Scene 7 — Use case 5: DESIGN
**PROMPT:**
> I want to redesign my Dino Runner to have a jungle theme. What parts of my HTML and CSS would I need to change? I use CSS variables in :root for my colours.

**SAMPLE ANSWER COVERS:** Most of it is the `:root` colours: sky, ground, player, obstacle · optionally reshape `#obstacle` into a log or rock · optionally add vines as new elements in HTML · no JavaScript changes needed, because behaviour doesn't change when appearance does.

**VISUAL:** Swap the `:root` block (jungle palette in `checkpoints/video-5-ai/style.css`). The whole game re-skins in one smooth colour transition. *(lush ambient whoosh)*
**NARRATOR:**
> "One block of colours and the whole world changes. Remember making colour variables in Video 3? *This* is why."
> "And notice what Claude said: no JavaScript changes. Appearance and behaviour are separate jobs. You knew that since Video 1."

**VISUAL:** Recap montage. All five use-case labels stack up as chips: **UNDERSTANDING · DEBUGGING · FEATURES · IDEAS · DESIGN**. Then the five-step bar pulses three times:
> **READ IT. UNDERSTAND IT. TEST IT. QUESTION IT. IMPROVE IT.**

### Scene 8 — The journey + final message
**VISUAL:** The completed game plays: jungle or classic theme, speed-ups, best score. It freezes on a mid-jump frame, echoing the very first shot of Video 1.

Then the journey draws itself left to right as a path of rounded nodes, each with a thumbnail from the series:
**IDEA → PAPER PLAN → HTML → CSS → JAVASCRIPT → WORKING GAME → AI → IMPROVED GAME**

**NARRATOR:** *(slower, warm, confident)*
> "You didn't just make a game."
> "You learned a process."
> "You started with an idea."
> "You imagined the finished product."
> "You put it on paper."
> "You broke it into pieces."
> "You built those pieces."
> "You tested them."
> "You solved problems."
> "And then you used AI to help you go further."

**VISUAL:** The path lifts away. The same node shapes rearrange into new outlines: a website, a phone app, a shop front, a sketchbook, a blank "?" card.
> **"That process can be used to build far more than games."**
> **"It can help you build websites, apps, tools, businesses, creative projects and ideas that don't exist yet."**

**VISUAL:** Three words, one at a time, centre screen, Quicksand Bold:
> **"You imagine it. You plan it. You build it."**

**END CARD:** Paisley Tech Studio logo · *"Now go build something that doesn't exist yet."*

---

## What students do
- Use all five prompt types on their own version of the game.
- Add the speed-up feature and one improvement of their choice.
- Write down one thing Claude got wrong or that they had to question.

## End-of-video checkpoint
- [ ] I can write a five-part prompt (building / have / understand / want / need)
- [ ] I used Claude to explain a function, then tested what it told me
- [ ] I fixed a bug by asking "why" first
- [ ] My game speeds up every 100 points and resets on restart
- [ ] I added at least one improvement of my own choosing
- [ ] I can explain every line I added
