const STORAGE_KEY = "lesestjerner-progress-v1";

const levels = [
  {
    name: "Bokstavgjenkjenning",
    tasks: [
      { prompt: "Trykk på bokstaven A", choices: ["A", "O", "M"], answer: "A" },
      { prompt: "Hvilken bokstav lager lyden b?", choices: ["D", "B", "P"], answer: "B" },
      { prompt: "Finn bokstaven S", choices: ["S", "F", "T"], answer: "S" }
    ]
  },
  {
    name: "Ordlesing",
    tasks: [
      { prompt: "Hvilket ord er et dyr?", choices: ["katt", "bord", "sol"], answer: "katt" },
      { prompt: "Velg ordet som betyr noe du kan drikke", choices: ["melk", "sko", "tre"], answer: "melk" },
      { prompt: "Hvilket ord kan du spise?", choices: ["eple", "stol", "blyant"], answer: "eple" }
    ]
  },
  {
    name: "Setningsforståelse",
    tasks: [
      {
        prompt: "Les: 'Ali har en blå ball.' Hvilken farge har ballen?",
        choices: ["Blå", "Grønn", "Rød"],
        answer: "Blå"
      },
      {
        prompt: "Les: 'Katten sover i stolen.' Hvor sover katten?",
        choices: ["I stolen", "I bilen", "På taket"],
        answer: "I stolen"
      },
      {
        prompt: "Les: 'Sara løper fort til skolen.' Hva gjør Sara?",
        choices: ["Løper", "Sover", "Spiser"],
        answer: "Løper"
      }
    ]
  },
  {
    name: "Enkle leseoppgaver",
    tasks: [
      {
        prompt: "Les og velg riktig slutt: 'Jeg pusser ____ før jeg legger meg.'",
        choices: ["tennene", "taket", "jakken"],
        answer: "tennene"
      },
      {
        prompt: "Hvilken setning er riktig?",
        choices: [
          "Solen skinner på himmelen.",
          "Solen spiser en stol.",
          "Solen sover i skoen."
        ],
        answer: "Solen skinner på himmelen."
      },
      {
        prompt: "Velg ordet som passer: 'Vi leser en ____ sammen.'",
        choices: ["bok", "sky", "sykkel"],
        answer: "bok"
      }
    ]
  }
];

const badgeMilestones = [
  { stars: 3, name: "Bokstavhelt" },
  { stars: 6, name: "Ordvenn" },
  { stars: 9, name: "Setningsmester" },
  { stars: 12, name: "Lesestjerne" }
];

const state = loadProgress();

const el = {
  playerLevel: document.getElementById("playerLevel"),
  starCount: document.getElementById("starCount"),
  badgeCount: document.getElementById("badgeCount"),
  progressBar: document.getElementById("progressBar"),
  badgeShelf: document.getElementById("badgeShelf"),
  taskTitle: document.getElementById("taskTitle"),
  taskInstruction: document.getElementById("taskInstruction"),
  taskContent: document.getElementById("taskContent"),
  answerButtons: document.getElementById("answerButtons"),
  feedback: document.getElementById("feedback"),
  nextTask: document.getElementById("nextTask"),
  rewardAnimation: document.getElementById("rewardAnimation"),
  resetProgress: document.getElementById("resetProgress")
};

function loadProgress() {
  const fallback = {
    levelIndex: 0,
    taskIndex: 0,
    stars: 0,
    badges: []
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function currentTask() {
  return levels[state.levelIndex].tasks[state.taskIndex];
}

function renderProgress() {
  el.playerLevel.textContent = String(state.levelIndex + 1);
  el.starCount.textContent = String(state.stars);
  el.badgeCount.textContent = String(state.badges.length);

  const totalTasks = levels.reduce((sum, level) => sum + level.tasks.length, 0);
  const doneTasks = levels
    .slice(0, state.levelIndex)
    .reduce((sum, level) => sum + level.tasks.length, 0) + state.taskIndex;

  const percentage = Math.min(100, Math.round((doneTasks / totalTasks) * 100));
  el.progressBar.style.width = `${percentage}%`;

  el.badgeShelf.textContent = state.badges.length
    ? `Dine merker: ${state.badges.join(" • ")}`
    : "Ingen merker ennå. Spill for å tjene dine første!";
}

function renderTask() {
  const level = levels[state.levelIndex];
  const task = currentTask();

  el.taskTitle.textContent = `Nivå ${state.levelIndex + 1}: ${level.name}`;
  el.taskInstruction.textContent = `Oppgave ${state.taskIndex + 1} av ${level.tasks.length}`;
  el.taskContent.textContent = task.prompt;
  el.feedback.textContent = "";
  el.feedback.className = "feedback";
  el.nextTask.disabled = true;

  el.answerButtons.innerHTML = "";
  task.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.className = "answer";
    button.textContent = choice;
    button.addEventListener("click", () => handleAnswer(button, choice));
    el.answerButtons.appendChild(button);
  });
}

function earnBadges() {
  for (const milestone of badgeMilestones) {
    if (state.stars >= milestone.stars && !state.badges.includes(milestone.name)) {
      state.badges.push(milestone.name);
      showReward(`Nytt merke: ${milestone.name} 🏅`);
    }
  }
}

function handleAnswer(button, choice) {
  const buttons = [...el.answerButtons.querySelectorAll("button")];
  buttons.forEach((btn) => (btn.disabled = true));

  const correct = currentTask().answer;
  if (choice === correct) {
    button.classList.add("correct");
    state.stars += 1;
    el.feedback.textContent = "Supert! Det var riktig 🎉";
    el.feedback.classList.add("good");
    showReward("Stjerne vunnet! ⭐");
    earnBadges();
  } else {
    button.classList.add("wrong");
    const correctButton = buttons.find((btn) => btn.textContent === correct);
    if (correctButton) correctButton.classList.add("correct");
    el.feedback.textContent = `Godt forsøk! Riktig svar var: ${correct}`;
    el.feedback.classList.add("bad");
  }

  el.nextTask.disabled = false;
  saveProgress();
  renderProgress();
}

function goToNextTask() {
  const level = levels[state.levelIndex];
  const isLastTaskInLevel = state.taskIndex >= level.tasks.length - 1;

  if (!isLastTaskInLevel) {
    state.taskIndex += 1;
  } else if (state.levelIndex < levels.length - 1) {
    state.levelIndex += 1;
    state.taskIndex = 0;
    showReward(`Nivå fullført! Nå starter nivå ${state.levelIndex + 1} 🚀`);
  } else {
    state.levelIndex = 0;
    state.taskIndex = 0;
    showReward("Fantastisk! Du fullførte hele spillet! 🌈");
  }

  saveProgress();
  renderProgress();
  renderTask();
}

function showReward(message) {
  el.rewardAnimation.textContent = message;
  el.rewardAnimation.classList.add("show");
  window.setTimeout(() => el.rewardAnimation.classList.remove("show"), 1400);
}

function resetAllProgress() {
  state.levelIndex = 0;
  state.taskIndex = 0;
  state.stars = 0;
  state.badges = [];
  saveProgress();
  renderProgress();
  renderTask();
  showReward("Fremgang nullstilt. Klar for ny runde! 🔄");
}

el.nextTask.addEventListener("click", goToNextTask);
el.resetProgress.addEventListener("click", resetAllProgress);

renderProgress();
renderTask();
