// ============================================
// NUMBER MATCH — script.js
// ============================================

const numberWords = {
  1: "One", 2: "Two", 3: "Three", 4: "Four",
  5: "Five", 6: "Six", 7: "Seven", 8: "Eight"
};

// 1. Find the parts of the page we need.
const gameGrid = document.getElementById("gameGrid");
const difficulty = document.getElementById("difficulty");
const movesDisplay = document.getElementById("moves");
const matchedDisplay = document.getElementById("matched");
const timerDisplay = document.getElementById("timer");
const progressFill = document.getElementById("progressFill");
const gameMessage = document.getElementById("gameMessage");
const restartButton = document.getElementById("restartButton");
const winOverlay = document.getElementById("winOverlay");
const finalMoves = document.getElementById("finalMoves");
const finalTime = document.getElementById("finalTime");
const playAgainButton = document.getElementById("playAgainButton");

// 2. Variables: what the game needs to remember.
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matchedPairs = 0;
let totalPairs = Number(difficulty.value);
let seconds = 0;
let timerInterval = null;
let hasStarted = false;
let mismatchTimeout = null;
let winTimeout = null;

// 3. Browser-generated sound effects (Web Audio API).
let audioContext = null;

function playTone(frequency, duration = 0.11, type = "sine", volume = 0.045) {
  try {
    audioContext = audioContext ||
      new (window.AudioContext || window.webkitAudioContext)();

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(volume, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    // The game still works if Web Audio is unavailable.
  }
}

// 4. The timer.
// Start the timer when the first card is selected.
function startTimer() {
  if (hasStarted) return;

  hasStarted = true;

  timerInterval = setInterval(() => {
    seconds += 1;
    timerDisplay.textContent = formatTime(seconds);
  }, 1000);
}

// Stop the timer.
function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

// Convert seconds into minutes and seconds, like 01:05.
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const remainingSeconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}

// 5. The cards.
// Create matching number pairs and shuffle them.
function createDeck(pairCount) {
  const values = Array.from({ length: pairCount }, (_, index) => index + 1);

  return shuffle([...values, ...values]);
}

// Shuffle the cards randomly.
function shuffle(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [shuffled[index], shuffled[randomIndex]] =
      [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

// Create an individual memory card.
function createCard(number, index) {
  const card = document.createElement("button");

  card.type = "button";
  card.className = "memory-card";
  card.dataset.number = String(number);
  card.dataset.index = String(index);
  card.setAttribute("aria-label", `Card ${index + 1}, face down`);
  card.setAttribute("aria-pressed", "false");

  card.innerHTML = `
    <span class="card-inner">
      <span class="card-face card-back" aria-hidden="true">
        <span class="back-symbol">?</span>
        <span class="back-caption">FLIP ME</span>
      </span>
      <span class="card-face card-front" aria-hidden="true">
        <span class="number-circle">${number}</span>
        <span class="number-word">${numberWords[number]}</span>
      </span>
    </span>
  `;

  card.addEventListener("click", () => flipCard(card));

  return card;
}

// Build the game board.
function buildBoard() {
  gameGrid.innerHTML = "";

  const deck = createDeck(totalPairs);

  deck.forEach((number, index) => {
    gameGrid.appendChild(createCard(number, index));
  });

  updateStats();
}

// 6. Playing the game.
// Handle card flipping.
function flipCard(card) {
  if (
    lockBoard ||
    card === firstCard ||
    card.classList.contains("is-matched") ||
    card.classList.contains("is-flipped")
  ) {
    return;
  }

  startTimer();

  card.classList.add("is-flipped");
  card.setAttribute("aria-pressed", "true");
  card.setAttribute("aria-label", `Number ${card.dataset.number}, ${numberWords[card.dataset.number]}`);

  playTone(520, 0.07, "triangle");

  if (!firstCard) {
    firstCard = card;
    setMessage("Great! Now find its matching number.");
    return;
  }

  secondCard = card;

  moves += 1;

  updateStats();

  checkForMatch();
}

// Check whether the selected cards match.
function checkForMatch() {
  const isMatch = firstCard.dataset.number === secondCard.dataset.number;

  if (isMatch) {
    firstCard.classList.add("is-matched");
    secondCard.classList.add("is-matched");

    firstCard.disabled = true;
    secondCard.disabled = true;

    matchedPairs += 1;

    playTone(740, 0.13, "sine", 0.055);
    setMessage("Yes! You found a matching pair. Well done!");

    resetTurn();
    updateStats();

    if (matchedPairs === totalPairs) {
      finishGame();
    }
  } else {
    lockBoard = true;

    setMessage("Not a match this time. Have another try!");
    playTone(220, 0.16, "sine", 0.035);

    mismatchTimeout = setTimeout(() => {
      firstCard.classList.remove("is-flipped");
      secondCard.classList.remove("is-flipped");

      firstCard.setAttribute("aria-pressed", "false");
      secondCard.setAttribute("aria-pressed", "false");

      firstCard.setAttribute("aria-label", "Face-down memory card");
      secondCard.setAttribute("aria-label", "Face-down memory card");

      resetTurn();
    }, 850);
  }
}

// Reset the current turn.
function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

// 7. Showing progress.
// Update moves, matches, timer and progress.
function updateStats() {
  movesDisplay.textContent = moves;
  matchedDisplay.innerHTML = `${matchedPairs} <small>/ ${totalPairs}</small>`;
  timerDisplay.textContent = formatTime(seconds);
  progressFill.style.width = `${(matchedPairs / totalPairs) * 100}%`;
}

// Update the message displayed below the cards.
function setMessage(message) {
  gameMessage.textContent = message;
}

// 8. Winning and starting again.
// Finish the game when all pairs are matched.
function finishGame() {
  stopTimer();

  finalMoves.textContent = moves;
  finalTime.textContent = formatTime(seconds);

  setMessage("Amazing! You matched every pair.");

  winTimeout = setTimeout(() => {
    winOverlay.classList.add("show");
    winOverlay.setAttribute("aria-hidden", "false");

    playTone(660, 0.16, "sine", 0.05);
    setTimeout(() => playTone(830, 0.2, "sine", 0.05), 130);
    setTimeout(() => playTone(990, 0.24, "sine", 0.05), 280);

    playAgainButton.focus();
  }, 450);
}

// Start a fresh game.
function startNewGame() {
  clearTimeout(mismatchTimeout);
  clearTimeout(winTimeout);
  stopTimer();

  firstCard = null;
  secondCard = null;
  lockBoard = false;

  moves = 0;
  matchedPairs = 0;
  seconds = 0;
  hasStarted = false;

  totalPairs = Number(difficulty.value);

  winOverlay.classList.remove("show");
  winOverlay.setAttribute("aria-hidden", "true");

  setMessage("Choose any card to begin!");

  buildBoard();
}

// Button event listeners.
restartButton.addEventListener("click", startNewGame);
playAgainButton.addEventListener("click", startNewGame);
difficulty.addEventListener("change", startNewGame);

// Start the game when the page loads.
startNewGame();
