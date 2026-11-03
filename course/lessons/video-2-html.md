# VIDEO 2 — Build the Structure: HTML

**Runtime:** ~8 min · **File:** `index.html` · **Starts from:** `dino-game/` (starter) · **Ends at:** `checkpoints/video-2-html/`

## Objective
Students turn the "WHAT EXISTS" column from their paper plan into real HTML elements. By the end, every piece of the game exists on the page. It looks plain, and that's expected.

## Lesson flow
1. Recap: paper plan → "what exists" (0:00–0:30)
2. Open the project: three files, three jobs (0:30–1:30)
3. Tour the starter `index.html` (1:30–2:30)
4. Build piece by piece, using CODE → BROWSER → RESULT for each (2:30–6:45)
5. Plain-looking? Good. (6:45–7:30)
6. Checkpoint + preview (7:30–8:00)

**Visual system for coding scenes:** The editor sits on the left (about 60%) and a live browser on the right (about 40%). New code types in line by line, with the new lines highlighted in a soft orange band (HTML colour). After each step a **CODE → BROWSER → RESULT** strip animates along the bottom, and a callout arrow points from the new line to the new thing in the browser. Each new element gets a small *pop* sound when it appears in the browser.

---

## Script

### Scene 1 — Recap
**VISUAL:** The paper plan from Video 1 slides in. The **WHAT EXISTS** column highlights in orange and its items tick down: player, obstacles, ground, score, buttons, game area.
**NARRATOR:**
> "Last time we planned our game on paper. Today we start building, and we start with this column: what exists."
> "HTML creates the things that exist in our game."

### Scene 2 — Open the project
**VISUAL:** A folder icon opens into a tree that draws itself:
```text
dino-game/
├── index.html   ← the things that EXIST   (orange)
├── style.css    ← how they LOOK            (blue)
└── script.js    ← what they DO             (yellow)
```
**NARRATOR:**
> "Here's the project you downloaded. Three files, and you already know their jobs."
> "index.html holds the pieces. style.css makes them look good. script.js makes them do things."
> "To see our game, just double-click index.html and it opens in your browser."

**VISUAL:** The cursor double-clicks. The browser opens to an empty white page.
> "Right now? Nothing. A blank page. Let's fix that."

### Scene 3 — Tour the starter `index.html`
**VISUAL:** The starter file scrolls slowly. Three callouts zoom in, one at a time:
1. `<head>` → *"Information about the page: its title, the Quicksand font, and a link to our CSS file."*
2. `<main id="game">` → *"The box our whole game lives in."*
3. `<script src="script.js">` → *"The link to our JavaScript, for later."*

**NARRATOR:**
> "The top part, the head, is information about the page. You don't see it. It connects our font and our CSS file."
> "Down here is the body. That's what you *do* see. And inside it is one empty box called game. Every piece of our game goes in here."

**VISUAL:** Zoom into the TODO comment inside `<main>`.
> "See this green text? That's a comment. The browser ignores it. It's a note for us. And look, it's our paper plan, written as a to-do list."

**Teaching beat (tags):** A tag animates open and closed: `<h1>` + `</h1>`, with labels "opening tag" and "closing tag" and the content in between.
> "HTML is made of tags. An opening tag, some content, and a closing tag with a slash. Think of them as labelled boxes."

### Scene 4 — Build piece by piece

> Delete the TODO comment as you replace it, or keep it at the top. Either is fine.

**Step 1 — The title**
```html
    <!-- 1. The title -->
    <h1>Dino Runner</h1>
```
**BROWSER:** "Dino Runner" appears in big bold text. *(pop)*
> "h1 means 'heading number one', the biggest heading. Save, refresh… and there's our title. We have now created the title."

**Teaching beat:** Show the save → refresh loop as a tiny animated icon cycle (💾 → ↻). Repeat it whenever the browser changes.
> "Remember this loop: save the file, refresh the browser. You'll do it a hundred times."

**Step 2 — The score**
```html
    <!-- 2. The score -->
    <div id="score-board">
      <span>Score: <span id="score">0</span></span>
    </div>
```
**BROWSER:** "Score: 0" appears.
> "A div is a general-purpose box. A span is a small box for a bit of text."
> "See this, `id="score"`? An id is a name tag. Later JavaScript will say 'find the thing called score and change its number.' Without a name, it can't find it."

**VISUAL:** A name-tag sticker slaps onto the "0" in the browser, reading `score`.

**Step 3 — The game area**
```html
    <!-- 3. The game area: the world our dinosaur lives in -->
    <div id="game-area">

    </div>
```
**BROWSER:** Nothing visible changes. A dashed outline overlay shows where the empty box is.
> "Now the world. An empty box called game-area. You can't see it yet because it's empty and has no style. But it's there. Everything in the game world goes *inside* this box."

**VISUAL:** Nesting diagram: `main#game` contains `h1`, `#score-board` and `#game-area`, drawn as boxes inside boxes.

**Step 4 — Clouds, player, obstacle, ground** (inside `#game-area`)
```html
      <!-- Clouds in the sky -->
      <div class="cloud cloud-one"></div>
      <div class="cloud cloud-two"></div>

      <!-- The player -->
      <div id="player"></div>

      <!-- The obstacle -->
      <div id="obstacle"></div>

      <!-- The ground -->
      <div id="ground"></div>
```
**BROWSER:** Still visually empty. The dashed-outline overlay reveals four little boxes stacked inside.
> "We have now created the player. And the obstacle. And the ground. And two clouds."
> "Wait, where are they? They're empty boxes with no size and no colour, so they're invisible. That's CSS's job, next video. But they exist."

**VISUAL:** Quick DevTools moment. Right-click → Inspect, then hover `#player` and the browser highlights a tiny strip.
> "Here's a creator trick: right-click, Inspect. Hover over player, and there it is. It exists."

**Teaching beat:** `id` vs `class` side by side.
> "Notice the clouds use class, not id. An id is for one unique thing; there's only one player. A class is for a group; we can have lots of clouds."

**Step 5 — Start message**
```html
      <!-- The start message -->
      <p id="start-text">Press SPACE to start</p>
```
**BROWSER:** "Press SPACE to start" appears. *(pop)*
> "p means paragraph, a line of text. This tells the player how to begin."

**Step 6 — Game Over + restart button**
```html
      <!-- The Game Over message and restart button -->
      <div id="message" class="hidden">
        <h2>Game Over</h2>
        <button id="restart-button">Play Again</button>
      </div>
```
**BROWSER:** "Game Over" and a grey "Play Again" button appear.
> "And finally, the end of the game: a Game Over heading and a real button you can click."
> "We gave this box a class called hidden. Right now it does nothing. It's still showing. In the next video we'll use CSS to hide it, and in Video 4, JavaScript will show it at exactly the right moment."

### Scene 5 — Plain-looking? Good.
**VISUAL:** Split screen. The paper plan is on the left and the plain HTML page on the right. Animated lines connect each sketch item to its HTML element: dino ↔ `#player`, cactus ↔ `#obstacle`, score ↔ `#score`, button ↔ `#restart-button`.
**NARRATOR:**
> "It doesn't look like a game yet. But compare it to the plan. Every single thing we drew now exists."
> "That's what HTML does. It doesn't make things pretty and it doesn't make them move. It makes them *exist*."

**VISUAL:** The full finished `index.html` scrolls by once, with the colour-coded sections glowing in turn.

### Scene 6 — Checkpoint + preview
**VISUAL:** Checklist card (below).
> "Before the next video, check your page has everything on this list. If something's missing, compare your code with the checkpoint file."
> "Next time, we take these plain pieces and make them look like a real game, with CSS."

**VISUAL:** Teaser. The plain page morphs for half a second into the styled game, then snaps back.

---

## Code introduced
Final `<main>` contents. The full file is `checkpoints/video-2-html/index.html`.
```html
  <main id="game">
    <h1>Dino Runner</h1>
    <div id="score-board">
      <span>Score: <span id="score">0</span></span>
    </div>
    <div id="game-area">
      <div class="cloud cloud-one"></div>
      <div class="cloud cloud-two"></div>
      <div id="player"></div>
      <div id="obstacle"></div>
      <div id="ground"></div>
      <p id="start-text">Press SPACE to start</p>
      <div id="message" class="hidden">
        <h2>Game Over</h2>
        <button id="restart-button">Play Again</button>
      </div>
    </div>
  </main>
```
**New ideas:** tags (opening/closing), `h1` `h2` `p` `div` `span` `button`, `id` vs `class`, nesting, comments, save → refresh, Inspect.

## What students do
- Build each element in order, refreshing after each one.
- Use Inspect to find the invisible `#player`.
- **Mini challenge:** change the title to your own game name from your paper plan. Change the button text.

## End-of-video checkpoint
Your browser shows: **title**, **Score: 0**, **Press SPACE to start**, **Game Over**, and a **Play Again** button. Inspect shows `#player`, `#obstacle`, `#ground` and two clouds inside `#game-area`.
