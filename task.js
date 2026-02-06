const el = {
  activeUser: document.getElementById("activeUser"),
  starCount: document.getElementById("starCount"),
  badgeCount: document.getElementById("badgeCount"),
  progressBar: document.getElementById("progressBar"),
  badgeShelf: document.getElementById("badgeShelf"),
  taskTitle: document.getElementById("taskTitle"),
  taskInstruction: document.getElementById("taskInstruction"),
  taskContent: document.getElementById("taskContent"),
  answerButtons: document.getElementById("answerButtons"),
  feedback: document.getElementById("feedback"),
  backToLevelsBtn: document.getElementById("backToLevelsBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  rewardAnimation: document.getElementById("rewardAnimation")
};

function showReward(message) {
  el.rewardAnimation.textContent = message;
  el.rewardAnimation.classList.add("show");
  window.setTimeout(() => el.rewardAnimation.classList.remove("show"), 1400);
}

const categoryKey = sessionStorage.getItem("lesestjerner-current-category");
let levelIndex = Number(sessionStorage.getItem("lesestjerner-current-level"));
let taskIndex = Number(sessionStorage.getItem("lesestjerner-current-task") || "0");

if (!getActiveUserData()) window.location.href = "login.html";
if (!categoryKey || !gameCategories[categoryKey]) window.location.href = "levels.html";
if (Number.isNaN(levelIndex) || !gameCategories[categoryKey].levels[levelIndex]) window.location.href = "levels.html";

function renderProgress(progress, name) {
  el.activeUser.textContent = name;
  el.starCount.textContent = String(progress.stars);
  el.badgeCount.textContent = String(progress.badges.length);
  el.progressBar.style.width = `${progressPercent(progress)}%`;
  el.badgeShelf.textContent = progress.badges.length
    ? `Dine merker: ${progress.badges.join(" • ")}`
    : "Ingen merker ennå. Spill for å tjene dine første!";
}

function renderTask() {
  const ctx = getActiveUserData();
  if (!ctx) return;

  const level = gameCategories[categoryKey].levels[levelIndex];
  const task = level.tasks[taskIndex];
  renderProgress(ctx.progress, ctx.name);

  el.taskTitle.textContent = `${gameCategories[categoryKey].title} – Nivå ${levelIndex + 1}: ${level.name}`;
  el.taskInstruction.textContent = `Oppgave ${taskIndex + 1} av ${level.tasks.length}`;
  el.taskContent.textContent = task.prompt;
  el.feedback.textContent = "";
  el.feedback.className = "feedback";
  el.answerButtons.innerHTML = "";

  task.choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.className = "answer";
    btn.textContent = choice;
    btn.addEventListener("click", () => onAnswer(btn, choice));
    el.answerButtons.appendChild(btn);
  });
}

function advanceAfterCorrect() {
  const ctx = getActiveUserData();
  const data = ctx.data;
  const progress = ctx.progress;
  const categoryProgress = progress.categories[categoryKey];
  const levelTasks = gameCategories[categoryKey].levels[levelIndex].tasks;
  const lastTask = taskIndex >= levelTasks.length - 1;

  if (!lastTask) {
    taskIndex += 1;
    sessionStorage.setItem("lesestjerner-current-task", String(taskIndex));
    renderTask();
    return;
  }

  if (!categoryProgress.completedLevels.includes(levelIndex)) {
    categoryProgress.completedLevels.push(levelIndex);
  }

  const nextLevel = levelIndex + 1;
  if (gameCategories[categoryKey].levels[nextLevel] && !categoryProgress.unlockedLevels.includes(nextLevel)) {
    categoryProgress.unlockedLevels.push(nextLevel);
  }

  categoryProgress.history.push({
    when: new Date().toLocaleString("no-NO"),
    text: `Fullførte nivå ${levelIndex + 1}: ${gameCategories[categoryKey].levels[levelIndex].name}`
  });

  saveData(data);
  sessionStorage.removeItem("lesestjerner-current-level");
  sessionStorage.removeItem("lesestjerner-current-task");
  window.location.href = "levels.html";
}

function onAnswer(button, choice) {
  const ctx = getActiveUserData();
  const data = ctx.data;
  const progress = ctx.progress;

  const current = gameCategories[categoryKey].levels[levelIndex].tasks[taskIndex];

  if (choice === current.answer) {
    [...el.answerButtons.querySelectorAll("button")].forEach((btn) => (btn.disabled = true));
    button.classList.add("correct");
    progress.stars += 1;
    el.feedback.textContent = "Supert! Riktig svar 🎉";
    el.feedback.classList.add("good");

    const newBadges = applyBadges(progress);
    if (newBadges.length) showReward(`Nytt merke: ${newBadges.join(", ")} 🏅`);

    saveData(data);
    renderProgress(progress, ctx.name);
    window.setTimeout(advanceAfterCorrect, 700);
    return;
  }

  button.classList.add("wrong");
  button.disabled = true;
  el.feedback.textContent = "Prøv igjen!";
  el.feedback.classList.add("bad");
}

el.backToLevelsBtn.addEventListener("click", () => {
  sessionStorage.removeItem("lesestjerner-current-level");
  sessionStorage.removeItem("lesestjerner-current-task");
  window.location.href = "levels.html";
});

el.logoutBtn.addEventListener("click", () => {
  const data = loadData();
  data.activeUser = null;
  saveData(data);
  sessionStorage.removeItem("lesestjerner-current-category");
  sessionStorage.removeItem("lesestjerner-current-level");
  sessionStorage.removeItem("lesestjerner-current-task");
  window.location.href = "login.html";
});

renderTask();
