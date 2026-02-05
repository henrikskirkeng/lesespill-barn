const STORAGE_KEY = "lesestjerner-profiles-v3";

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
      { prompt: "Les: 'Ali har en blå ball.' Hvilken farge har ballen?", choices: ["Blå", "Grønn", "Rød"], answer: "Blå" },
      { prompt: "Les: 'Katten sover i stolen.' Hvor sover katten?", choices: ["I stolen", "I bilen", "På taket"], answer: "I stolen" },
      { prompt: "Les: 'Sara løper fort til skolen.' Hva gjør Sara?", choices: ["Løper", "Sover", "Spiser"], answer: "Løper" }
    ]
  },
  {
    name: "Enkle leseoppgaver",
    tasks: [
      { prompt: "Les og velg riktig slutt: 'Jeg pusser ____ før jeg legger meg.'", choices: ["tennene", "taket", "jakken"], answer: "tennene" },
      { prompt: "Hvilken setning er riktig?", choices: ["Solen skinner på himmelen.", "Solen spiser en stol.", "Solen sover i skoen."], answer: "Solen skinner på himmelen." },
      { prompt: "Velg ordet som passer: 'Vi leser en ____ sammen.'", choices: ["bok", "sky", "sykkel"], answer: "bok" }
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
  loginView: document.getElementById("loginView"),
  levelView: document.getElementById("levelView"),
  taskView: document.getElementById("taskView"),
  usernameInput: document.getElementById("usernameInput"),
  passwordInput: document.getElementById("passwordInput"),
  createProfileBtn: document.getElementById("createProfileBtn"),
  loginBtn: document.getElementById("loginBtn"),
  authFeedback: document.getElementById("authFeedback"),
  logoutBtn: document.getElementById("logoutBtn"),
  activeUserLevel: document.getElementById("activeUserLevel"),
  activeUserTask: document.getElementById("activeUserTask"),
  levelButtons: document.getElementById("levelButtons"),
  historyList: document.getElementById("historyList"),
  resetProgress: document.getElementById("resetProgress"),
  taskTitle: document.getElementById("taskTitle"),
  taskInstruction: document.getElementById("taskInstruction"),
  taskContent: document.getElementById("taskContent"),
  answerButtons: document.getElementById("answerButtons"),
  feedback: document.getElementById("feedback"),
  nextTask: document.getElementById("nextTask"),
  backToLevelsBtn: document.getElementById("backToLevelsBtn"),
  rewardAnimation: document.getElementById("rewardAnimation"),
  progress: {
    level: {
      stars: document.getElementById("starCountLevel"),
      badges: document.getElementById("badgeCountLevel"),
      bar: document.getElementById("progressBarLevel"),
      shelf: document.getElementById("badgeShelfLevel")
    },
    task: {
      stars: document.getElementById("starCountTask"),
      badges: document.getElementById("badgeCountTask"),
      bar: document.getElementById("progressBarTask"),
      shelf: document.getElementById("badgeShelfTask")
    }
  }
};

const appState = {
  data: loadData(),
  activeUser: null,
  selectedLevel: null,
  taskIndex: 0
};

function blankProgress() {
  return { stars: 0, badges: [], unlockedLevels: [0], completedLevels: [], history: [] };
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { activeUser: null, users: {} };
  } catch {
    return { activeUser: null, users: {} };
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.data));
}

function setView(view) {
  el.loginView.hidden = view !== "login";
  el.levelView.hidden = view !== "levels";
  el.taskView.hidden = view !== "task";
}

function progressForActiveUser() {
  if (!appState.activeUser) return null;
  const user = appState.data.users[appState.activeUser];
  if (!user.progress) user.progress = blankProgress();
  return user.progress;
}

function setAuthFeedback(message, type = "good") {
  el.authFeedback.textContent = message;
  el.authFeedback.className = `feedback ${type}`;
}

function authValues() {
  return {
    username: el.usernameInput.value.trim(),
    password: el.passwordInput.value
  };
}

function createProfile() {
  const { username, password } = authValues();
  if (!username || !password) {
    setAuthFeedback("Skriv både brukernavn og passord.", "bad");
    return;
  }
  if (appState.data.users[username]) {
    setAuthFeedback("Brukernavn finnes allerede. Prøv å logge inn.", "bad");
    return;
  }

  appState.data.users[username] = { password, progress: blankProgress() };
  appState.data.activeUser = username;
  saveData();
  loginUser(username);
  showReward("Profil opprettet! 🌟");
}

function loginProfile() {
  const { username, password } = authValues();
  const user = appState.data.users[username];
  if (!user || user.password !== password) {
    setAuthFeedback("Feil brukernavn eller passord.", "bad");
    return;
  }

  appState.data.activeUser = username;
  saveData();
  loginUser(username);
  showReward("Innlogging vellykket 👋");
}

function loginUser(username) {
  appState.activeUser = username;
  appState.selectedLevel = null;
  appState.taskIndex = 0;
  el.logoutBtn.hidden = false;
  el.activeUserLevel.textContent = username;
  el.activeUserTask.textContent = username;
  el.usernameInput.value = "";
  el.passwordInput.value = "";
  setAuthFeedback("");
  renderLevelPage();
  setView("levels");
}

function logoutUser() {
  appState.activeUser = null;
  appState.selectedLevel = null;
  appState.taskIndex = 0;
  appState.data.activeUser = null;
  saveData();
  el.logoutBtn.hidden = true;
  setView("login");
  setAuthFeedback("Du er logget ut.", "good");
}

function renderProgressWidgets() {
  const progress = progressForActiveUser();
  const totalTasks = levels.reduce((sum, level) => sum + level.tasks.length, 0);
  const doneTasks = progress.completedLevels.reduce((sum, idx) => sum + levels[idx].tasks.length, 0);
  const percentage = Math.round((doneTasks / totalTasks) * 100);
  const badgeText = progress.badges.length
    ? `Dine merker: ${progress.badges.join(" • ")}`
    : "Ingen merker ennå. Spill for å tjene dine første!";

  [el.progress.level, el.progress.task].forEach((widget) => {
    widget.stars.textContent = String(progress.stars);
    widget.badges.textContent = String(progress.badges.length);
    widget.bar.style.width = `${percentage}%`;
    widget.shelf.textContent = badgeText;
  });
}

function renderLevelButtons() {
  const progress = progressForActiveUser();
  el.levelButtons.innerHTML = "";

  levels.forEach((level, index) => {
    const btn = document.createElement("button");
    btn.className = "secondary level-button";
    const unlocked = progress.unlockedLevels.includes(index);
    const completed = progress.completedLevels.includes(index);
    btn.disabled = !unlocked;
    btn.textContent = completed
      ? `✅ Nivå ${index + 1}: ${level.name}`
      : `Nivå ${index + 1}: ${level.name}`;
    btn.addEventListener("click", () => startLevel(index));
    el.levelButtons.appendChild(btn);
  });
}

function renderHistory() {
  const progress = progressForActiveUser();
  el.historyList.innerHTML = "";
  if (progress.history.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Ingen historikk ennå.";
    el.historyList.appendChild(li);
    return;
  }

  progress.history.slice().reverse().slice(0, 8).forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = `${entry.when} – ${entry.text}`;
    el.historyList.appendChild(li);
  });
}

function renderLevelPage() {
  renderProgressWidgets();
  renderLevelButtons();
  renderHistory();
}

function currentTask() {
  return levels[appState.selectedLevel].tasks[appState.taskIndex];
}

function startLevel(levelIndex) {
  appState.selectedLevel = levelIndex;
  appState.taskIndex = 0;
  renderTaskPage();
  setView("task");
}

function renderTaskPage() {
  const level = levels[appState.selectedLevel];
  const task = currentTask();
  el.taskTitle.textContent = `Nivå ${appState.selectedLevel + 1}: ${level.name}`;
  el.taskInstruction.textContent = `Oppgave ${appState.taskIndex + 1} av ${level.tasks.length}`;
  el.taskContent.textContent = task.prompt;
  el.feedback.textContent = "";
  el.feedback.className = "feedback";
  el.nextTask.disabled = true;
  el.answerButtons.innerHTML = "";

  task.choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.className = "answer";
    btn.textContent = choice;
    btn.addEventListener("click", () => handleAnswer(btn, choice));
    el.answerButtons.appendChild(btn);
  });

  renderProgressWidgets();
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
  const progress = progressForActiveUser();
  const buttons = [...el.answerButtons.querySelectorAll("button")];
  buttons.forEach((btn) => (btn.disabled = true));

  const correct = currentTask().answer;
  if (choice === correct) {
    button.classList.add("correct");
    progress.stars += 1;
    el.feedback.textContent = "Supert! Riktig svar 🎉";
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

  saveData();
  renderProgressWidgets();
  el.nextTask.disabled = false;
}

function addHistory(text) {
  const progress = progressForActiveUser();
  progress.history.push({ when: new Date().toLocaleString("no-NO"), text });
}

function goNextTask() {
  const progress = progressForActiveUser();
  const levelTasks = levels[appState.selectedLevel].tasks;
  const atLast = appState.taskIndex >= levelTasks.length - 1;

  if (!atLast) {
    appState.taskIndex += 1;
    renderTaskPage();
    return;
  }

  const finishedLevel = appState.selectedLevel;
  if (!progress.completedLevels.includes(finishedLevel)) {
    progress.completedLevels.push(finishedLevel);
  }

  const nextLevel = finishedLevel + 1;
  if (levels[nextLevel] && !progress.unlockedLevels.includes(nextLevel)) {
    progress.unlockedLevels.push(nextLevel);
  }

  addHistory(`Fullførte nivå ${finishedLevel + 1}: ${levels[finishedLevel].name}`);
  saveData();
  appState.selectedLevel = null;
  appState.taskIndex = 0;
  renderLevelPage();
  setView("levels");
  showReward(`Nivå ${finishedLevel + 1} fullført! Velg neste nivå 🚀`);
}

function backToLevels() {
  appState.selectedLevel = null;
  appState.taskIndex = 0;
  renderLevelPage();
  setView("levels");
}

function resetProgress() {
  const user = appState.data.users[appState.activeUser];
  user.progress = blankProgress();
  user.progress.history.push({ when: new Date().toLocaleString("no-NO"), text: "Fremgang nullstilt" });
  saveData();
  renderLevelPage();
  showReward("Fremgang nullstilt 🔄");
}

function showReward(message) {
  el.rewardAnimation.textContent = message;
  el.rewardAnimation.classList.add("show");
  window.setTimeout(() => el.rewardAnimation.classList.remove("show"), 1400);
}

el.createProfileBtn.addEventListener("click", createProfile);
el.loginBtn.addEventListener("click", loginProfile);
el.logoutBtn.addEventListener("click", logoutUser);
el.nextTask.addEventListener("click", goNextTask);
el.backToLevelsBtn.addEventListener("click", backToLevels);
el.resetProgress.addEventListener("click", resetProgress);

if (appState.data.activeUser && appState.data.users[appState.data.activeUser]) {
  loginUser(appState.data.activeUser);
} else {
  setView("login");
}
