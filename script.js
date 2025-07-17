// --- Minus One Game Logic ---

// Game state variables
let playerLeftChoice = null;
let playerRightChoice = null;
let cpuLeftChoice = null;
let cpuRightChoice = null;
let playerFinal = null;
let cpuFinal = null;
let roundActive = false;

// --- DOM Utility Functions ---

function qs(sel) {
  return document.querySelector(sel);
}

function qsa(sel) {
  return document.querySelectorAll(sel);
}

function resetButtonStates() {
  qsa(".choice, .cpu-left, .cpu-right").forEach(btn => {
    btn.disabled = false;
    btn.classList.remove("locked-choice", "disabled-other");
  });
  qsa('[data-remove]').forEach(btn => {
    btn.hidden = true;
    btn.disabled = false;
    btn.classList.remove("disabled-other");
    btn.innerHTML = "❌";
  });
  qs(".cpu-left").innerText = "---";
  qs(".cpu-right").innerText = "---";
}

// --- Game Setup & Reset ---

function resetGame() {
  playerLeftChoice = null;
  playerRightChoice = null;
  cpuLeftChoice = null;
  cpuRightChoice = null;
  playerFinal = null;
  cpuFinal = null;
  roundActive = false;

  resetButtonStates();

  qs("#captions-paragraph").innerText = "";
  qs("#play-button").disabled = false;
  qs("#play-button").innerText = "LET'S PLAY!";
}

// --- Hand Pick Logic ---

function lockHandButtons(hand, choice) {
  qsa(`[data-hand="${hand}"]`).forEach(btn => {
    if (btn.dataset.choice === choice) {
      btn.classList.add("locked-choice");
      btn.disabled = false;
    } else {
      btn.disabled = true;
      btn.classList.remove("locked-choice");
    }
  });
}

function handlePlayerHandClick(hand, choice) {
  if (!roundActive) return;
  if (hand === "left") playerLeftChoice = choice;
  else playerRightChoice = choice;

  lockHandButtons(hand, choice);

  if (playerLeftChoice && playerRightChoice) {
    triggerCPUChoices();
    showRemoveButtons();
  }
}

function triggerCPUChoices() {
  const rps = ["rock", "paper", "scissors"];
  cpuLeftChoice = rps[Math.floor(Math.random() * 3)];
  cpuRightChoice = rps[Math.floor(Math.random() * 3)];

  const cpuLeftBtn = qs(".cpu-left");
  const cpuRightBtn = qs(".cpu-right");

  cpuLeftBtn.innerText = capitalize(cpuLeftChoice);
  cpuRightBtn.innerText = capitalize(cpuRightChoice);

  cpuLeftBtn.classList.add("locked-choice");
  cpuRightBtn.classList.add("locked-choice");
}

function showRemoveButtons() {
  qs('[data-remove="left"]').hidden = false;
  qs('[data-remove="right"]').hidden = false;
  qs("#captions-paragraph").innerText = "Minus one! (pick one hand to remove)";
}

// --- Remove (Minus One) Logic ---

function handleRemoveClick(hand) {
  // Hide and lock remove buttons
  qsa('[data-remove]').forEach(btn => {
    btn.hidden = true;
    btn.disabled = true;
    btn.classList.add("disabled-other");
  });

  // Fade/discard the hand the player removed
  let removed, remaining;
  if (hand === "left") {
    removed = playerLeftChoice;
    remaining = playerRightChoice;
    // fade left
    fadePlayerHand("left", removed);
    highlightPlayerHand("right", remaining);
  } else {
    removed = playerRightChoice;
    remaining = playerLeftChoice;
    // fade right
    fadePlayerHand("right", removed);
    highlightPlayerHand("left", remaining);
  }
  playerFinal = remaining;

  // CPU removes one hand at random
  let cpuRemoveSide = Math.random() < 0.5 ? "left" : "right";
  let cpuRemoved, cpuRemaining;
  if (cpuRemoveSide === "left") {
    cpuRemoved = cpuLeftChoice;
    cpuRemaining = cpuRightChoice;
    fadeCPUHand("left");
    highlightCPUHand("right");
  } else {
    cpuRemoved = cpuRightChoice;
    cpuRemaining = cpuLeftChoice;
    fadeCPUHand("right");
    highlightCPUHand("left");
  }
  cpuFinal = cpuRemaining;

  // Determine winner and update caption
  displayRoundResult();

  // Disable all player hand buttons after result
  qsa(".choice").forEach(btn => btn.disabled = true);

  // Enable "Play Again"
  qs("#play-button").disabled = false;
  qs("#play-button").innerText = "PLAY AGAIN";
  roundActive = false;
}

function fadePlayerHand(side, choice) {
  qsa(`[data-hand="${side}"]`).forEach(btn => {
    if (btn.dataset.choice === choice) {
      btn.classList.remove("locked-choice");
      btn.classList.add("disabled-other");
      btn.disabled = true;
    }
  });
}

function highlightPlayerHand(side, choice) {
  qsa(`[data-hand="${side}"]`).forEach(btn => {
    if (btn.dataset.choice === choice) {
      btn.classList.add("locked-choice");
      btn.disabled = true;
    }
  });
}

function fadeCPUHand(side) {
  const btn = qs(`.cpu-${side}`);
  btn.classList.remove("locked-choice");
  btn.classList.add("disabled-other");
  btn.disabled = true;
}

function highlightCPUHand(side) {
  const btn = qs(`.cpu-${side}`);
  btn.classList.add("locked-choice");
  btn.disabled = true;
}

// --- Winner Logic ---

function displayRoundResult() {
  let text = rpsCaption(playerFinal, cpuFinal);
  qs("#captions-paragraph").innerText = text;
}

function rpsCaption(player, cpu) {
  if (player === cpu) return "It's a tie!";
  const beats = {
    rock: "scissors",
    paper: "rock",
    scissors: "paper"
  };
  if (beats[player] === cpu) {
    return `${capitalize(player)} beats ${cpu}, you win!`;
  } else {
    return `${capitalize(cpu)} beats ${player}, computer wins!`;
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// --- Event Listeners ---

// Play/Play Again button
qs("#play-button").addEventListener("click", function () {
  resetGame();
  roundActive = true;
  // Disable itself until next round ends
  this.disabled = true;
});

// Reset button
qs("#reset").addEventListener("click", resetGame);

// Hand selection buttons
qsa('[data-hand="left"]').forEach(btn => {
  btn.addEventListener("click", () => {
    if (!btn.disabled && roundActive) {
      handlePlayerHandClick("left", btn.dataset.choice);
    }
  });
});
qsa('[data-hand="right"]').forEach(btn => {
  btn.addEventListener("click", () => {
    if (!btn.disabled && roundActive) {
      handlePlayerHandClick("right", btn.dataset.choice);
    }
  });
});

// Remove hand buttons
qsa('[data-remove]').forEach(btn => {
  btn.addEventListener("click", () => {
    if (!btn.disabled && roundActive) {
      handleRemoveClick(btn.dataset.remove);
    }
  });
});

// On load, reset state
resetGame();
