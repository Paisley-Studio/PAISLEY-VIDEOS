# VIDEO 1 — Before We Code: Think Like a Creator

**Runtime:** ~8 min · **Code introduced:** none · **Students need:** paper, pencil

## Objective
Students learn that every product starts with thinking, not code. By the end they can look at a finished product, break it into parts, plan it on paper, list what they need, and name the jobs of HTML, CSS, JavaScript and AI.

## Lesson flow
1. Cold open: the finished game (0:00–0:35)
2. The question (0:35–1:00)
3. See the end first: break the game apart (1:00–1:50)
4. Plan before you build: the paper sketch (1:50–3:10)
5. Ask questions about the product (3:10–4:10)
6. Three building blocks: exists / looks / does → HTML / CSS / JS (4:10–5:15)
7. Gather your resources (5:15–5:55)
8. Bring back the computer: the build path (5:55–6:40)
9. Where AI fits (6:40–7:35)
10. Student task and preview (7:35–8:10)

**Global style notes (all five videos):** Quicksand everywhere. Warm off-white canvas (`#fdf6ec`), with the game's own palette as accents: dino orange `#f08a4b`, cactus green `#2d6a4f`, sky `#dff1f7`, accent yellow `#ffb703`, ink `#2b2b2b`. Shapes are soft rounded rectangles that spring in. Labels are hand-lettered for paper scenes and Quicksand Bold for digital scenes. Sound is soft whooshes, pencil scratches, pops and a light "tick" for each reveal. No neon, no robots, no glitch effects.

---

## Script

### Scene 1 — Cold open: the finished game
**VISUAL:** Full-screen gameplay of the finished game (`checkpoints/video-5-ai`). The dino runs, clouds drift and the ground scrolls. Jump over cactus 1 (soft *boing*), then cactus 2. The score ticks up. At 100 a small speed-lines effect plays and the game visibly speeds up. A near-miss, then a crash: the dino flashes red, a low *thud*, and the "Game Over" card pops in. The cursor clicks "Play Again" and the game restarts.
**SFX:** footstep loop, jump boings, score ticks, crash thud, button pop.
**NARRATOR:** *(over the last two seconds)* —

### Scene 2 — The question
**VISUAL:** Freeze-frame mid-jump. The frame desaturates slightly and the camera pulls back so the game becomes a "screen" floating on the canvas.
**NARRATOR:**
> "You just saw a game."
> "But here's the interesting question..."
> "How do you actually make something like this?"

**VISUAL:** A laptop slides in with a blank code editor and a blinking cursor. Big text types out: *"Just start coding?"* Then a soft red strike-through.
> "Do you open your computer and immediately start writing code?"
> "No."

**VISUAL:** Laptop slides away. One word fills the screen in Quicksand Bold, letter by letter: **THINK.**
> **"You start by thinking."**

### Scene 3 — See the end first
**VISUAL:** The frozen game "explodes" into eight labelled pieces that float apart like an exploded diagram, each with a rounded tag:
**PLAYER** (dino) · **WORLD** (sky + clouds) · **OBSTACLES** (cactus) · **CONTROLS** (a Space-bar key graphic) · **SCORE** (counter) · **RULES** (a small card: "hit = lose") · **GAME OVER** (card) · **RESTART** (button)
**NARRATOR:**
> "Good creators start by understanding the thing they're going to build."
> "A finished product can look complicated."
> "But creators learn to break complicated things into smaller pieces."

**VISUAL:** Pieces snap back together into the game, then apart again to show it's reversible.
> "Eight pieces. That's all this game really is."

### Scene 4 — Plan before you build
**VISUAL:** Hard cut to a top-down shot of a desk: paper, pencil, no computer. (Live-action hands, or illustrated hands over a paper texture.) The pencil writes **DINO RUNNER** at the top.
**SFX:** pencil scratch.
**NARRATOR:**
> "Before we build it digitally, we're going to design it on paper."

**VISUAL:** The sketch draws itself: a rectangle for the game area, a line for the ground, a blobby dino on the left, a cactus on the right, "Score: 0" in the top corner, and a "Play Again" button drawn in the middle with a dashed outline. Hand-lettered labels and arrows animate on:
- **Dinosaur** → *jumps* (curved arrow over the cactus)
- **Obstacle** → *moves toward player* (arrow pointing left)
- **Score** → *goes up while you survive*
- **Collision** → *Game Over* (a little star burst where dino meets cactus)
- **Restart button** → *play again*

> "It doesn't have to be beautiful. Look at this dinosaur. It's basically a potato with legs."
> "That's fine. The point isn't art. The point is to make the idea visible."

**VISUAL:** Four quick beats on the paper. The pencil circles the dino, an eraser rubs out the cactus and redraws it bigger, a "?" appears next to an empty corner, and a second pair of hands points at the page.
> "When you put your idea on paper, you can see it."
> "You can change it."
> "You can spot what's missing."
> "And you can explain it to somebody else."

**VISUAL:** Paper slides to the side. Big statement text on the canvas, one line at a time, with a gentle underline animation:
> **"This is how all your development and product building should start."**
> **"Don't start by building. Start by understanding what you're building."**

**VISUAL:** Small icons fade in under the statement (website, app, game, shop, sketchbook) to show it applies to everything.

### Scene 5 — Ask questions about the product
**VISUAL:** The paper sketch sits on the left. On the right, question cards flip in one at a time. Each answer is hand-written underneath, and an arrow links it to the matching part of the sketch.

| Card | Answer | Links to |
|---|---|---|
| What are we making? | A Dino Runner game | the title |
| Who is using it? | The player | a little person icon by the keyboard |
| What can the player do? | Jump and avoid obstacles | the jump arrow |
| What happens in the game? | Obstacles move toward the player | the left arrow |
| How does the player know they're doing well? | The score goes up | the score |
| What happens when the dino hits an obstacle? | Game Over | the star burst |
| What happens next? | The player can restart | the button |

**NARRATOR:** *(reads each question with a beat before the answer)*
> "These questions come before the code. If you can't answer them, you're not ready to build yet. And that's okay. It just means you keep thinking."

### Scene 6 — Break it into building blocks
**VISUAL:** Three columns build on screen, each a rounded card with items popping in as bullet chips:

**WHAT EXISTS** — player · obstacles · ground · score · buttons · game area
**WHAT IT LOOKS LIKE** — colours · sizes · positions · shapes · spacing · layout
**WHAT IT DOES** — jumps · moves · detects collision · increases score · ends the game · restarts

**NARRATOR:**
> "Every product can be split into three questions. What exists? What does it look like? And what does it do?"

**VISUAL:** A label slides onto the top of each column, colour-coded (these colours stay consistent all series):
- **HTML** (orange) → *creates the structure*
- **CSS** (blue) → *controls how it looks*
- **JavaScript** (yellow) → *controls behaviour*

> "On the web, each question has its own language."
> "HTML creates the things that exist."
> "CSS decides what they look like."
> "And JavaScript decides what they do."

**VISUAL:** Analogy montage, about 3 seconds each. A house frame being built (HTML), the house painted and furnished (CSS), and lights switching on and a door opening (JS).
> "Think of a house. HTML is the walls. CSS is the paint and furniture. JavaScript is the electricity. It makes things happen."
> "You don't need any code yet. Just remember the three jobs."

### Scene 7 — Gather your resources
**VISUAL:** A cork-board or mood-board slides in. Cards pin themselves on with a small *thunk*: characters · obstacles · background · sounds · fonts · buttons · code · game rules · ideas.
**NARRATOR:**
> "Here's another creator habit: know what you need before you start."

**VISUAL:** Small source tags attach to the cards: *draw it* (pencil icon) on characters, *build it with CSS* (blue) on the cactus, *Quicksand from Google Fonts* on fonts, *write it* on rules, *code it* on code, *ask AI for ideas* on ideas, *find it (with permission)* on sounds.
> "Resources can come from lots of places. You might draw them, build them with CSS, write the code yourself, use AI to explore ideas, or find them from a source you're allowed to use."
> "The important thing isn't where they come from. It's knowing what you need."

### Scene 8 — Bring back the computer
**VISUAL:** Split screen. The paper plan is on the left. On the right a laptop opens to an empty project folder with `index.html`, `style.css` and `script.js` (empty files with grey icons).
**NARRATOR:** *(steady build in energy)*
> "Now we have an idea."
> "We've seen the finished product."
> "We've planned it."
> "We've designed it."
> "We've broken it into parts."
> "We know what we need."
> **"Now we're ready to build."**

**VISUAL:** A vertical path draws itself down the screen, node by node, each with a *tick*:
**IDEA ↓ PLAN ↓ DESIGN ↓ BUILDING BLOCKS ↓ HTML ↓ CSS ↓ JAVASCRIPT ↓ TEST ↓ IMPROVE**
A soft loop arrow curves from IMPROVE back up to TEST.

### Scene 9 — Where AI fits
**VISUAL:** A toolbox opens with a pencil, paper, a code editor and a browser. One more tool slides in: a simple chat window labelled **Claude** (clean UI only, no robot faces).
**NARRATOR:**
> "There's one more tool in a creator's toolbox: AI."
> "But notice *when* we brought it in. After the thinking."

**VISUAL:** Three chat bubbles appear one at a time. Each is tagged with what the student brought:

1. Tag **CLEAR REQUIREMENT**: *"I need my dinosaur to jump when I press Space."* → Claude: *"Here's how a key press can trigger a jump…"*
2. Tag **A PROBLEM**: *"My collision isn't working."* → Claude: *"Let's check what each box's position is…"*
3. Tag **AN IDEA**: *"I want the game to get faster as the score goes up."* → Claude: *"Let's think through the logic first…"*

> "When you have a clear requirement, AI can help explain how to do it."
> "When you have a problem, AI can help you investigate it."
> "When you have an idea, AI can help you think it through."

**VISUAL:** A crossed-out bubble: ~~"Make me a game."~~ Then a loop of five rounded chips: **ASK → UNDERSTAND → TEST → CHECK → IMPROVE**
> "Notice what we didn't say: 'Make me a game.'"
> "The better you understand your project, the better you can use AI."
> "AI can help you build faster."
> "But the idea, the decisions and the understanding still belong to you."

### Scene 10 — Student task + preview
**VISUAL:** "YOUR TURN" title card. A checklist animates onto a paper texture.
**NARRATOR:**
> "Your turn. Grab some paper and design your own version."

**Draw:** your player · an obstacle · the game area · the score · a restart button · what happens when the player hits an obstacle

**Then answer:**
1. What will my game look like?
2. What can the player do?
3. What happens when the player makes a mistake?
4. What do I need to build it?
5. What could make my version different?

> "Maybe your player is a cat. Maybe the obstacles are puddles. Maybe it's a robot running on Mars. It's your design."
> "Keep your design. We're going to use it."

**VISUAL:** The paper slides next to an open `index.html`, and the camera pushes in on the empty `<main>` tag.
> "Next, we're going to take this design and build its structure using HTML."

---

## What students do
- Watch, then pause and draw their own paper design.
- Answer the five questions on the same sheet.

## End-of-video checkpoint
- [ ] I have a paper sketch with a player, obstacle, game area, score and restart button
- [ ] I've labelled what each part does
- [ ] I answered the five questions
- [ ] I can say what HTML, CSS and JavaScript are each for
- [ ] I can explain why we plan before we build
