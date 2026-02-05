const STORAGE_KEY = "lesestjerner-profiles-v2";

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

const el = {
  authCard: document.getElementById("authCard"),
  gameShell: document.getElementById("gameShell"),
  usernameInput: document.getElementById("usernameInput"),
  passwordInput: document.getElementById("passwordInput"),
  createProfileBtn: document.getElementById("createProfileBtn"),
  loginBtn: document.getElementById("loginBtn"),
  authFeedback: document.getElementById("authFeedback"),
  logoutBtn: document.getElementById("logoutBtn"),
  activeUser: document.getElementById("activeUser"),
  levelStatus: document.getElementById("levelStatus"),
  levelButtons: document.getElementById("levelButtons"),
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
  historyList: document.getElementById("historyList"),
  resetProgress: document.getElementById("resetProgress")
};

const appState = {
  profiles: loadProfiles(),
  activeUser: null,
  selectedLevel: null,
  taskIndex: 0
};

function blankProgress() {
  return {
    stars: 0,
    badges: [],
    unlockedLevels: [0],
    completedLevels: [],
    history: []
  };
}

function loadProfiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { activeUser: null, users: {} };
  } catch {
    return { activeUser: null, users: {} };
  }
}

function saveProfiles() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.profiles));
}

function setAuthFeedback(message, type = "good") {
  el.authFeedback.textContent = message;
  el.authFeedback.className = `feedback ${type}`;
}

function getAuthValues() {
  return {
    username: el.usernameInput.value.trim(),
    password: el.passwordInput.value
  };
}

function createProfile() {
  const { username, password } = getAuthValues();
  if (!username || !password) {
    setAuthFeedback("Skriv både brukernavn og passord.", "bad");
    return;
  }

  if (appState.profiles.users[username]) {
    setAuthFeedback("Brukernavn finnes allerede. Prøv å logge inn.", "bad");
    return;
  }

  appState.profiles.users[username] = {
    password,
    progress: blankProgress()
  };
  appState.profiles.activeUser = username;
  saveProfiles();
  loginUser(username);
  showReward("Profil opprettet! Velkommen 🌟");
}

function loginProfile() {
  const { username, password } = getAuthValues();
  const user = appState.profiles.users[username];

  if (!user || user.password !== password) {
    setAuthFeedback("Feil brukernavn eller passord.", "bad");
    return;
  }

  appState.profiles.activeUser = username;
  saveProfiles();
  loginUser(username);
  showReward("Innlogging vellykket 👋");
}

function loginUser(username) {
  appState.activeUser = username;
  appState.selectedLevel = null;
  appState.taskIndex = 0;
  el.activeUser.textContent = username;
  el.authCard.hidden = true;
  el.gameShell.hidden = false;
  el.logoutBtn.hidden = false;
  el.usernameInput.value = "";
  el.passwordInput.value = "";
  setAuthFeedback("");
  renderAll();
}

function logoutUser() {
  appState.activeUser = null;
  appState.selectedLevel = null;
  appState.taskIndex = 0;
  appState.profiles.activeUser = null;
  saveProfiles();

  el.gameShell.hidden = true;
  el.authCard.hidden = false;
  el.logoutBtn.hidden = true;
  setAuthFeedback("Du er logget ut.", "good");
}

function activeProgress() {
  if (!appState.activeUser) return null;
  const user = appState.profiles.users[appState.activeUser];
  if (!user.progress) user.progress = blankProgress();
  return user.progress;
}

function currentTask() {
  if (appState.selectedLevel === null) return null;
  return levels[appState.selectedLevel].tasks[appState.taskIndex];
}

function renderLevelButtons() {
  const progress = activeProgress();
  el.levelButtons.innerHTML = "";

  levels.forEach((level, index) => {
    const button = document.createElement("button");
    const unlocked = progress.unlockedLevels.includes(index);
    const lockedBySelection = appState.selectedLevel !== null && appState.selectedLevel !== index;
    button.className = "secondary level-button";
    button.textContent = `Nivå ${index + 1}: ${level.name}`;
    button.disabled = !unlocked || lockedBySelection;

    if (appState.selectedLevel === index) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => selectLevel(index));
    el.levelButtons.appendChild(button);
  });
}

function renderProgress() {
  const progress = activeProgress();
  el.starCount.textContent = String(progress.stars);
  el.badgeCount.textContent = String(progress.badges.length);

  const totalTasks = levels.reduce((sum, level) => sum + level.tasks.length, 0);
  const completedTasks = progress.completedLevels.reduce(
    (sum, levelIndex) => sum + levels[levelIndex].tasks.length,
    0
  );
  const percentage = Math.round((completedTasks / totalTasks) * 100);
  el.progressBar.style.width = `${percentage}%`;

  el.badgeShelf.textContent = progress.badges.length
    ? `Dine merker: ${progress.badges.join(" • ")}`
    : "Ingen merker ennå. Spill for å tjene dine første!";
}

function renderHistory() {
  const progress = activeProgress();
  el.historyList.innerHTML = "";

  if (progress.history.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Ingen historikk ennå. Fullfør et nivå for å få første linje.";
    el.historyList.appendChild(li);
    return;
  }

  progress.history.slice().reverse().slice(0, 8).forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = `${entry.when} – ${entry.text}`;
    el.historyList.appendChild(li);
  });
}

function renderTask() {
  if (appState.selectedLevel === null) {
    el.taskTitle.textContent = "Oppgave";
    el.taskInstruction.textContent = "Velg et nivå først.";
    el.taskContent.textContent = "👈 Velg nivå for å begynne.";
    el.answerButtons.innerHTML = "";
    el.feedback.textContent = "";
    el.nextTask.disabled = true;
    el.levelStatus.textContent = "Velg et nivå for å starte.";
    return;
  }

  const level = levels[appState.selectedLevel];
  const task = currentTask();

  el.taskTitle.textContent = `Nivå ${appState.selectedLevel + 1}: ${level.name}`;
  el.taskInstruction.textContent = `Oppgave ${appState.taskIndex + 1} av ${level.tasks.length}`;
  el.levelStatus.textContent = `Du spiller nivå ${appState.selectedLevel + 1}. Fullfør nivået før du velger et nytt.`;
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

function selectLevel(levelIndex) {
  appState.selectedLevel = levelIndex;
  appState.taskIndex = 0;
  renderLevelButtons();
  renderTask();
}

function earnBadges(progress) {
  for (const milestone of badgeMilestones) {
    if (progress.stars >= milestone.stars && !progress.badges.includes(milestone.name)) {
      progress.badges.push(milestone.name);
      showReward(`Nytt merke: ${milestone.name} 🏅`);
    }
  }
}

function handleAnswer(button, choice) {
  const progress = activeProgress();
  const buttons = [...el.answerButtons.querySelectorAll("button")];
  buttons.forEach((btn) => (btn.disabled = true));

  const correct = currentTask().answer;
  if (choice === correct) {
    button.classList.add("correct");
    progress.stars += 1;
    el.feedback.textContent = "Supert! Det var riktig 🎉";
    el.feedback.classList.add("good");
    showReward("Stjerne vunnet! ⭐");
    earnBadges(progress);
  } else {
    button.classList.add("wrong");
    const correctButton = buttons.find((btn) => btn.textContent === correct);
    if (correctButton) correctButton.classList.add("correct");
    el.feedback.textContent = `Godt forsøk! Riktig svar var: ${correct}`;
    el.feedback.classList.add("bad");
  }

  el.nextTask.disabled = false;
  saveProfiles();
  renderProgress();
}

function recordHistory(text) {
  const progress = activeProgress();
  const when = new Date().toLocaleString("no-NO");
  progress.history.push({ when, text });
}

function goToNextTask() {
  if (appState.selectedLevel === null) return;

  const progress = activeProgress();
  const level = levels[appState.selectedLevel];
  const isLastTaskInLevel = appState.taskIndex >= level.tasks.length - 1;

  if (!isLastTaskInLevel) {
    appState.taskIndex += 1;
    renderTask();
    return;
  }

  const completed = appState.selectedLevel;
  if (!progress.completedLevels.includes(completed)) {
    progress.completedLevels.push(completed);
  }

  const nextLevel = completed + 1;
  if (levels[nextLevel] && !progress.unlockedLevels.includes(nextLevel)) {
    progress.unlockedLevels.push(nextLevel);
  }

  recordHistory(`Fullførte nivå ${completed + 1}: ${levels[completed].name}`);
  showReward(`Nivå ${completed + 1} fullført! Velg neste nivå 🚀`);

  appState.selectedLevel = null;
  appState.taskIndex = 0;

  saveProfiles();
  renderAll();
}

function resetAllProgress() {
  const user = appState.profiles.users[appState.activeUser];
  user.progress = blankProgress();
  recordHistory("Fremgang nullstilt");
  appState.selectedLevel = null;
  appState.taskIndex = 0;
  saveProfiles();
  renderAll();
  showReward("Fremgang nullstilt. Klar for ny runde! 🔄");
}

function renderAll() {
  renderProgress();
  renderLevelButtons();
  renderTask();
  renderHistory();
}

function showReward(message) {
  el.rewardAnimation.textContent = message;
  el.rewardAnimation.classList.add("show");
  window.setTimeout(() => el.rewardAnimation.classList.remove("show"), 1400);
}

el.createProfileBtn.addEventListener("click", createProfile);
el.loginBtn.addEventListener("click", loginProfile);
el.logoutBtn.addEventListener("click", logoutUser);
el.nextTask.addEventListener("click", goToNextTask);
el.resetProgress.addEventListener("click", resetAllProgress);

if (appState.profiles.activeUser && appState.profiles.users[appState.profiles.activeUser]) {
  loginUser(appState.profiles.activeUser);
}
