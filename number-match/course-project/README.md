# Number Match: the course project

This is the finished game that students build across the six Paisley Studio videos.
It uses plain HTML, CSS and JavaScript, with no frameworks. Open `index.html` in a browser, or run it in the Paisley IDE.

| File | Job | Built in |
|---|---|---|
| `index.html` | Structure: header, heading, game panel, stats, card grid, message, footer, celebration screen | Video 2 |
| `style.css` | Colours (CSS variables), Quicksand, layout, cards, flip, matched state, phone layout | Video 3 |
| `script.js` | Variables, deck, shuffle, cards, clicks, matching, moves, timer, progress, sounds, difficulty, restart, win | Videos 4–5 |

Difficulty levels: Easy has 4 pairs, Medium has 6 pairs (the default) and Challenge has 8 pairs.
The browser makes the sounds with the Web Audio API, so the game needs no audio files.
Quicksand loads from Google Fonts, so the font needs an internet connection.

## Changes from the original draft
- Colours are flat. This removed the background radial gradients, the progress-bar gradient, the translucent panel and the blur on the win overlay.
- Quicksand is requested at weights 400–700. Google serves Quicksand from 300 to 700 only; the original link asked for 800, which Google silently ignores, so every `font-weight: 800` became `700` (what browsers were already showing).
- Quicksand loads once, through the `<link>` in `index.html`. The duplicate `@import` in `style.css` is gone.
- The page title is `Number Match`, which matches what Video 2 teaches.
- The message text has its own `<span id="gameMessage">`, so `setMessage` only needs to set `textContent`.
- An unused `large-board` class toggle is gone.
- Restarting during the short win delay no longer reopens the win screen.
