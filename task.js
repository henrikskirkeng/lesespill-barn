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
  nextTask: document.getElementById("nextTask"),
  backToLevelsBtn: document.getElementById("backToLevelsBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  rewardAnimation: document.getElementById("rewardAnimation")
};

function showReward(message) {
  el.rewardAnimation.textContent = message;
  el.rewardAnimation.classList.add("show");
  window.setTimeout(() => el.rewardAnimation.classList.remove("show"), 1400);
}

function getLevelIndex() {
  const raw = sessionStorage.getItem("lesestjerner-current-level");
  const parsed = Number(raw);
  if (Number.isNaN(parsed)) return null;
  return parsed;
}

let levelIndex = getLevelIndex();
let taskIndex = Number(sessionStorage.getItem("lesestjerner-current-task") || "0");

if (!getActiveUserData()) {
  window.location.href = "login.html";
}
if (levelIndex === null || !levels[levelIndex]) {
  window.location.href = "levels.html";
}

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

  const level = levels[levelIndex];
  const task = level.tasks[taskIndex];

  renderProgress(ctx.progress, ctx.name);
  el.taskTitle.textContent = `Nivå ${levelIndex + 1}: ${level.name}`;
  el.taskInstruction.textContent = `Oppgave ${taskIndex + 1} av ${level.tasks.length}`;
  el.taskContent.textContent = task.prompt;
  el.feedback.textContent = "";
  el.feedback.className = "feedback";
  el.nextTask.disabled = true;
  el.answerButtons.innerHTML = "";

  task.choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.className = "answer";
    btn.textContent = choice;
    btn.addEventListener("click", () => onAnswer(btn, choice));
    el.answerButtons.appendChild(btn);
  });
}

function onAnswer(button, choice) {
  const ctx = getActiveUserData();
  const data = ctx.data;
  const progress = ctx.progress;

  const buttons = [...el.answerButtons.querySelectorAll("button")];
  buttons.forEach((btn) => (btn.disabled = true));

  const correct = levels[levelIndex].tasks[taskIndex].answer;
  if (choice === correct) {
    button.classList.add("correct");
    progress.stars += 1;
    el.feedback.textContent = "Supert! Riktig svar 🎉";
    el.feedback.classList.add("good");
    showReward("Stjerne vunnet! ⭐");

    const newBadges = applyBadges(progress);
    if (newBadges.length) showReward(`Nytt merke: ${newBadges.join(", ")} 🏅`);
  } else {
    button.classList.add("wrong");
    const correctButton = buttons.find((btn) => btn.textContent === correct);
    if (correctButton) correctButton.classList.add("correct");
    el.feedback.textContent = `Godt forsøk! Riktig svar var: ${correct}`;
    el.feedback.classList.add("bad");
  }

  saveData(data);
  renderProgress(progress, ctx.name);
  el.nextTask.disabled = false;
}

el.nextTask.addEventListener("click", () => {
  const ctx = getActiveUserData();
  const data = ctx.data;
  const progress = ctx.progress;
  const lastTask = taskIndex >= levels[levelIndex].tasks.length - 1;

  if (!lastTask) {
    taskIndex += 1;
    sessionStorage.setItem("lesestjerner-current-task", String(taskIndex));
    renderTask();
    return;
  }

  if (!progress.completedLevels.includes(levelIndex)) progress.completedLevels.push(levelIndex);
  const nextLevel = levelIndex + 1;
  if (levels[nextLevel] && !progress.unlockedLevels.includes(nextLevel)) progress.unlockedLevels.push(nextLevel);

  progress.history.push({
    when: new Date().toLocaleString("no-NO"),
    text: `Fullførte nivå ${levelIndex + 1}: ${levels[levelIndex].name}`
  });

  saveData(data);
  sessionStorage.removeItem("lesestjerner-current-level");
  sessionStorage.removeItem("lesestjerner-current-task");
  window.location.href = "levels.html";
});

el.backToLevelsBtn.addEventListener("click", () => {
  sessionStorage.removeItem("lesestjerner-current-level");
  sessionStorage.removeItem("lesestjerner-current-task");
  window.location.href = "levels.html";
});

el.logoutBtn.addEventListener("click", () => {
  const data = loadData();
  data.activeUser = null;
  saveData(data);
  sessionStorage.removeItem("lesestjerner-current-level");
  sessionStorage.removeItem("lesestjerner-current-task");
  window.location.href = "login.html";
});

renderTask();
