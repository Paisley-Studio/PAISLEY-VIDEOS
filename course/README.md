# Paisley Tech Studio — Dino Runner Build Series

One project, five videos, one continuous build:
**THOUGHT → PAPER → STRUCTURE → DESIGN → CODE → WORKING GAME → AI-ASSISTED PRODUCT**

Plain HTML, CSS and JavaScript. No frameworks, no build tools, no libraries. **To run it, double-click `index.html`.**

## Folder guide

```text
course/
├── dino-game/                ← GIVE THIS TO STUDENTS (the starter project)
│   ├── index.html            empty <main> + a to-do list of what to build
│   ├── style.css             section plan + Quicksand font only
│   └── script.js             section plan + "connected!" console message
│
├── checkpoints/              ← TEACHER REFERENCE: the project at the end of each video
│   ├── video-2-html/         full HTML, starter CSS/JS     (plain page)
│   ├── video-3-css/          full HTML + CSS, starter JS   (looks like a game, doesn't move)
│   ├── video-4-javascript/   all three files               (working game)
│   └── video-5-ai/           + speed-up, best score, jungle theme option
│
└── lessons/                  ← THE FIVE VIDEO SCRIPTS
    ├── video-1-think-like-a-creator.md
    ├── video-2-html.md
    ├── video-3-css.md
    ├── video-4-javascript.md
    └── video-5-ai-with-claude.md
```

Students never restart. They open `dino-game/` in Video 2 and keep adding to the same three files until Video 5. If a student gets lost, they can copy the checkpoint for the video they just finished and carry on.

The finished game (`checkpoints/video-5-ai`) is also the gameplay footage for the Video 1 cold open.

---

## The five videos at a glance

| # | Title | Plan column | File | Student ends with |
|---|---|---|---|---|
| 1 | Before We Code: Think Like a Creator | all three | paper | A paper design + 5 answers |
| 2 | Build the Structure: HTML | WHAT EXISTS | `index.html` | Every piece exists (plain) |
| 3 | Make It Look Like a Game: CSS | WHAT IT LOOKS LIKE | `style.css` | Styled game, no behaviour |
| 4 | Make It Come Alive: JavaScript | WHAT IT DOES | `script.js` | Working Dino Runner |
| 5 | Build Smarter With AI: Claude | all three | all | Their own improved version |

Running colour code across all videos: **HTML = orange · CSS = blue · JavaScript = yellow**.

---

## Code progression

### Video 1 → no code
Paper plan only. Students learn the three jobs: HTML = what exists, CSS = what it looks like, JS = what it does.

### Video 2 → HTML structure (`index.html`)
Added inside `<main id="game">`, in this order:
1. `<h1>` title
2. `#score-board` with `#score`
3. `#game-area` (the world)
4. `.cloud` ×2, `#player`, `#obstacle`, `#ground`
5. `#start-text`
6. `#message.hidden` with `<h2>Game Over</h2>` and `#restart-button`

### Video 3 → CSS styling (`style.css`)
1. `:root` colour variables
2. `body` (centring, Quicksand) → 3. `#game` → 4. `#score-board`
5. `#game-area` (`position: relative`, rounded world) → 6. `#ground`
7. `#player` + eye (`::before`) + legs (`::after`) + `.crashed`
8. `#obstacle` cactus + arms
9. `.cloud` + `@keyframes drift` (CSS-only animation)
10. `#start-text`, `#message` overlay → 11. `button`
12. `.hidden` (includes the specificity bug and the `!important` fix)
13. `@keyframes scroll-ground` / `run`, triggered by `#game.running`

### Video 4 → JavaScript behaviour (`script.js`)
Each step is runnable, and the first two "fail" on purpose:
1. Grab pieces with `getElementById` → console check
2. `keydown` listener → console "Space pressed!"
3. `jump()` + `updatePlayer()` + `gameLoop()` + `startGame()` → **dino flies off the screen**
4. Gravity line → **dino falls through the floor** → landing check → perfect jump
5. `updateObstacle()` + full `startGame()` (hides start text, adds `running`)
6. `isColliding()` + simple `gameOver()` → game freezes on hit
7. `updateScore()`
8. Full `gameOver()` (classes) + `restartGame()` + button + Space-to-restart

### Video 5 → AI-assisted changes
| Change | Files | Prompt used |
|---|---|---|
| Speed +1 every 100 points (`startSpeed`, `updateSpeed()`, reset on restart) | JS | Adding a feature |
| Best score (`#best`, `bestScore` in `gameOver`) | HTML + JS | Improvement ideas |
| Jungle theme (swap the `:root` colours; commented block provided) | CSS | Design |
| Landing-check bug investigated and explained | JS | Debugging |

Every Video 5 addition is marked `// VIDEO 5` in `checkpoints/video-5-ai`.

---

## AI prompts for Video 5 (student handout)

### The five-part prompt template
```text
1. WHAT I'M BUILDING:  I am building ...
2. WHAT I ALREADY HAVE: I already have ...
3. WHAT I UNDERSTAND:   I understand that ...
4. WHAT I WANT:         I want to ...
5. WHAT I NEED:         Explain the logic first, then show me the code I need and where it goes.
```

### 1. Understanding
```text
I'm a beginner building a Dino Runner game in JavaScript. Explain what this
function is doing in simple language, line by line.

[paste the isColliding function]
```
Follow-up: `What would happen if I changed padding to 30?`

### 2. Debugging
```text
My dinosaur jumps but doesn't return to the ground correctly. It falls through
the floor and disappears, and I can't jump again. Here is my code. Help me
identify the problem and explain why it is happening before you give me the fix.

[paste updatePlayer and jump]
```

### 3. Adding a feature
```text
I am building a Dino Runner using HTML, CSS and JavaScript. I already have the
structure, styling and a working game loop. The obstacle moves using a variable
called gameSpeed. I want the game speed to increase every time the player reaches
another 100 points. Explain the logic first, then show me only the code I need
to add and where it goes.

[paste the settings section and gameLoop]
```
Follow-up: `Will this get impossibly fast eventually? How could I stop that?`

### 4. Improvement
```text
Here is my Dino Runner game. Suggest three ways I could make this game more
interesting without changing its core gameplay. Keep the ideas simple enough
for a beginner, and tell me which file each idea would change.
```

### 5. Design
```text
I want to redesign my Dino Runner to have a jungle theme. What parts of my HTML
and CSS would I need to change? I use CSS variables in :root for my colours.
```

### After every answer
**READ IT → UNDERSTAND IT → TEST IT → QUESTION IT → IMPROVE IT**

---

## Notes for teachers
- **Frame rate:** the game moves a fixed amount per frame, so on 120 Hz screens it runs about twice as fast. It's left this way to keep the code simple. It's also a good extension prompt for older students: *"My game runs faster on my friend's computer than on mine. Here is my game loop. Why might that be?"*
- **Space + button focus:** `restartButton.blur()` stops Space from "clicking" the button again after a mouse click. If a student removes it and sees double restarts, that's another real bug to explore with Claude.
- **Touch devices:** the game is keyboard-only. "Make it jump when I tap the screen" is a good Video 5 extension.
