# VIDEO 3 — Make It Look Like a Game: CSS

**Runtime:** ~9 min · **File:** `style.css` · **Starts from:** `checkpoints/video-2-html/` · **Ends at:** `checkpoints/video-3-css/`

## Objective
Students turn the "WHAT IT LOOKS LIKE" column into CSS. They learn that CSS chooses an element by name and then sets its colour, size, position and shape. By the end the game looks finished but doesn't move or respond yet.

## Lesson flow
1. Recap: plain page vs. finished look (0:00–0:40)
2. How a CSS rule works (0:40–1:40)
3. Colours as variables (1:40–2:20)
4. Page, container, score (2:20–3:10)
5. The world: game area + ground (3:10–4:20)
6. The player: position, size, shape (4:20–6:00)
7. The obstacle (6:00–6:40)
8. Clouds + CSS animation (6:40–7:20)
9. Messages, button, hiding things, plus a real bug (7:20–8:30)
10. Before/after + checkpoint (8:30–9:00)

**Visual system:** The editor and browser are split as in Video 2, but new code highlights in **blue** (the CSS colour). For "property demos," a slider appears on screen and the property value changes live as the slider moves (for example `width: 44px → 120px`), with the element resizing in sync. Each finished section gets a satisfying *click* as it locks into place.

---

## Script

### Scene 1 — Recap
**VISUAL:** Before/after wipe. The plain HTML page (left) and the finished styled game (right) are split by a draggable divider that slides back and forth once.
**NARRATOR:**
> "Our HTML has created the pieces. Now we need to decide what those pieces look like."
> "Same HTML. Same pieces. The only difference between these two is CSS."

**VISUAL:** The **WHAT IT LOOKS LIKE** column from Video 1 highlights in blue: colours, sizes, positions, shapes, spacing, layout.

### Scene 2 — How a CSS rule works
**VISUAL:** One rule builds itself, with each part labelled by an animated bracket:
```css
#player {              /* WHO  → the selector: "find the thing called player" */
  width: 44px;         /* WHAT → property : value */
}
```
**NARRATOR:**
> "Every CSS rule has two parts. First, *who* you're styling. That's the selector. Then *what* you're changing, inside the curly brackets."
> "The hash symbol means id. So #player means 'the thing with the id player', the one we made last video."
> "A dot means class. So .cloud means 'every cloud.'"

**VISUAL:** A connecting line draws from `#player` in the CSS to `id="player"` in the HTML.

### Scene 3 — Colours as variables
```css
:root {
  --background: #fdf6ec;
  --sky: #dff1f7;
  --ground: #5c4a3d;
  --player: #f08a4b;
  --obstacle: #2d6a4f;
  --text: #2b2b2b;
  --accent: #ffb703;
  --danger: #d64545;
}
```
**VISUAL:** Each line spawns a colour swatch chip that floats into a palette tray.
**NARRATOR:**
> "First, we pick our colours and give them names. These are called variables."
> "Later we'll use var(--player) instead of typing the colour code again and again. Want an orange dino to be purple? Change one line."
> "This is our design system: decisions we make once and use everywhere."

### Scene 4 — Page, container, score
Type sections 2–4 (`body`, `#game`, `h1`, `#score-board`).
**BROWSER:** The background warms up, everything centres, the font switches to Quicksand, and the score goes bold.
> "display: flex with justify-content and align-items: center puts our game right in the middle of the screen."
> "max-width: 800px stops the game getting too wide on big screens."

### Scene 5 — The world: game area + ground
```css
#game-area {
  position: relative;
  height: 300px;
  background: var(--sky);
  border: 3px solid var(--text);
  border-radius: 20px;
  overflow: hidden;
}
```
**BROWSER:** A sky-blue rounded box appears. *(whoosh)*
> "Now the world appears. It's 300 pixels tall, sky blue, with a border and rounded corners."

**PROPERTY DEMO — border-radius:** Slider from `0px → 20px → 150px`. Corners go sharp, then soft, then pill-shaped.
> "border-radius rounds the corners. Small number, slightly round. Big number, very round. Shape changes!"

**PROPERTY DEMO — background:** The sky value cycles `#dff1f7 → #ffd6a5 (sunset) → #1d2d44 (night)`.
> "Change the background and you change the whole environment. Daytime, sunset, night."

**Teaching beat (positioning):** An animated diagram shows `position: relative` on the game area as a "map" with a coordinate origin. Children with `position: absolute` get placed using `left`, `bottom` and so on, measured from that map's edges.
> "position: relative turns the game area into a map. Anything inside with position: absolute can be placed exactly. 'Sixty pixels from the left, fifty from the bottom.'"

Then type `#ground`:
**BROWSER:** A brown strip appears along the bottom, with stripes.
> "The ground: 40 pixels tall, stuck to the bottom with bottom: 0. Those stripes will help us see it move later."

### Scene 6 — The player
Type `#player` (no pseudo-elements yet).
**BROWSER:** An orange rounded block appears standing on the ground. *(pop + tiny bounce)*
> "And here's our player! Position absolute, 60 pixels from the left, 50 from the bottom, 44 wide, 52 tall, orange."

**PROPERTY DEMO — width:** Slider `44px → 120px`. The dino gets wide.
> "Change the width, the object changes size."

**PROPERTY DEMO — position:** `left: 60px → 400px` slides the dino across; `bottom: 50px → 200px` lifts it into the sky.
> "Change the position, the object moves. Hold on to that idea. In the next video, JavaScript will change `bottom` sixty times a second… and that's how jumping works."

**VISUAL:** That last line gets a yellow "remember this" sticky-note callout.

Type `#player::before` (eye) and `#player::after` (legs).
**BROWSER:** An eye appears, then two little legs. *(two small pops)*
> "::before and ::after let us add extra shapes to an element without new HTML. One is the eye. The other is a leg, and box-shadow makes a copy of it to make the second leg. Sneaky, but simple."

Type `#player.crashed` rules.
> "And a crashed style. When the dino has a class called crashed, it turns red. Nothing adds that class yet. JavaScript will, when we hit something."

**DEMO:** In Inspect, manually add `crashed` to the player and it turns red. Remove it and it's orange again.

### Scene 7 — The obstacle
Type `#obstacle`, `::before` and `::after`.
**BROWSER:** A green cactus with two arms appears on the right. *(pop)*
> "Same idea for the cactus: a rounded green rectangle, plus two arms."
> "Challenge for later: your paper design might have a rock, a puddle, a fence. You now know enough to build it."

### Scene 8 — Clouds + CSS animation
Type `.cloud`, `.cloud-one`, `.cloud-two`, then the `@keyframes drift` rule.
**BROWSER:** Two white clouds drift slowly across the sky. *(soft airy whoosh)*
> "keyframes describe an animation: *from* here, *to* there. We tell the cloud to drift from the right side to the left side over 18 seconds, forever."
> "So CSS *can* animate things. But notice: the clouds don't care what you do. They can't react to a key press. They can't tell if you crashed. That's behaviour, and behaviour needs JavaScript."

Type `@keyframes scroll-ground`, `@keyframes run`, and the two `#game.running` rules.
> "These last rules make the ground scroll and the legs run, but *only* when the game has a class called running. JavaScript adds that class in the next video."

**DEMO:** Add `class="running"` to `<main>` in Inspect. The ground scrolls and the legs move. Remove it and they stop.

### Scene 9 — Messages, button, hiding things (+ a real bug)
Type `#start-text`, `#message`, `#message h2`, `button`, `button:hover`.
**BROWSER:** Text centres in the sky, the yellow pill button lifts on hover, and the Game Over overlay covers the game.
> "Our button gets a pill shape and a little lift when you hover."

Type:
```css
.hidden {
  display: none;
}
```
**BROWSER:** Game Over… is *still showing.* A record-scratch SFX plays and the screen freezes.
> "Wait. We said 'hide anything with the class hidden'. Our Game Over box has that class. But it's still there. Why?"

**VISUAL:** Two rules face off like a tug-of-war: `#message { display: flex }` vs `.hidden { display: none }`. The id side is bigger and wins.
> "Both rules are trying to set display. CSS has a rule for this: an id is more specific than a class, so the id wins."
> "This is debugging. Something doesn't do what we expected, so we look at *why*."

Fix:
```css
/* !important means "this rule wins", even over the #message rule above */
.hidden {
  display: none !important;
}
```
**BROWSER:** Game Over disappears. *(satisfying click)*
> "!important tells CSS 'this one wins'. Use it rarely, but for hiding things it's exactly what we want."

### Scene 10 — Before/after + checkpoint
**VISUAL:** Big transformation reveal. Start on the plain Video 2 page, then each section of CSS "paints" onto it in a fast sequence (background → world → ground → dino → cactus → clouds), ending on the styled game with a gentle zoom. Label: **PLAIN STRUCTURE → STYLED GAME**.
**NARRATOR:**
> "It looks like a game! But press Space…"

**VISUAL:** The Space key graphic is pressed. Nothing happens. A cricket-chirp SFX plays.
> "Nothing. CSS can control the appearance, and even some animation, but our game still doesn't have its real behaviour."
> "It's like a beautiful car with no engine. Next video, we build the engine: JavaScript."

---

## Code introduced
Full file: `checkpoints/video-3-css/style.css`. Sections typed in this order: 1 colours → 2 page → 3 container → 4 score → 5 game area → 6 ground → 7 player → 8 obstacle → 9 clouds → 10 messages → 11 button → 12 hiding → 13 animations.

**New ideas:** selectors (`#id`, `.class`, `element`), property: value, CSS variables, flexbox centring, `position: relative / absolute`, `left` / `bottom`, `border-radius`, `::before` / `::after`, `@keyframes`, specificity (id beats class), `!important`.

## What students do
- Build each section and refresh after each.
- Make it theirs: change the `:root` colours to match their paper design.
- **Mini challenges:** make the dino taller · make the cactus a different shape · make it a night-time game · give the button a different hover effect.

## End-of-video checkpoint
- [ ] Game is centred, uses Quicksand, has a sky, ground, orange dino with eye and legs, and a cactus
- [ ] Clouds drift
- [ ] "Press SPACE to start" shows; **Game Over does NOT show**
- [ ] Pressing Space does nothing (that's expected!)
