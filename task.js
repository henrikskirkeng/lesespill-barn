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

const categoryKey = sessionStorage.getItem("lesestjerner-current-category");
let levelIndex = Number(sessionStorage.getItem("lesestjerner-current-level"));
let taskIndex = Number(sessionStorage.getItem("lesestjerner-current-task") || "0");
let selectedWordButton = null;

if (!getActiveUserData()) window.location.href = "login.html";
if (!categoryKey || !gameCategories[categoryKey]) window.location.href = "levels.html";
if (Number.isNaN(levelIndex) || !gameCategories[categoryKey].levels[levelIndex]) window.location.href = "levels.html";

function showReward(message) {
  el.rewardAnimation.textContent = message;
  el.rewardAnimation.classList.add("show");
  window.setTimeout(() => el.rewardAnimation.classList.remove("show"), 1400);
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

function completeCurrentTask() {
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

function onMultipleChoiceAnswer(button, choice, task) {
  const ctx = getActiveUserData();
  const data = ctx.data;
  const progress = ctx.progress;

  if (choice === task.answer) {
    [...el.answerButtons.querySelectorAll("button")].forEach((btn) => (btn.disabled = true));
    button.classList.add("correct");
    progress.stars += 1;
    el.feedback.textContent = "Supert! Riktig svar 🎉";
    el.feedback.classList.add("good");

    const newBadges = applyBadges(progress);
    if (newBadges.length) showReward(`Nytt merke: ${newBadges.join(", ")} 🏅`);

    saveData(data);
    renderProgress(progress, ctx.name);
    window.setTimeout(completeCurrentTask, 650);
    return;
  }

  button.classList.add("wrong");
  button.disabled = true;
  el.feedback.textContent = "Prøv igjen!";
  el.feedback.classList.add("bad");
}

function handleDropToBin(wordButton, binId, task, progress, ctx) {
  const target = task.items.find((item) => item.word === wordButton.textContent);
  if (!target) return;

  if (target.binId === binId) {
    wordButton.classList.remove("selected-word");
    wordButton.classList.add("correct");
    wordButton.disabled = true;
    wordButton.draggable = false;
    progress.stars += 1;

    const binWords = el.answerButtons.querySelector(`[data-bin-words='${binId}']`);
    if (binWords) binWords.appendChild(wordButton);

    const sortedNow = el.answerButtons.querySelectorAll(".answer.correct").length;
    el.feedback.textContent = `Riktig! ${sortedNow} av ${task.items.length} sortert.`;
    el.feedback.className = "feedback good";

    const newBadges = applyBadges(progress);
    if (newBadges.length) showReward(`Nytt merke: ${newBadges.join(", ")} 🏅`);

    saveData(ctx.data);
    renderProgress(progress, ctx.name);

    if (sortedNow >= task.items.length) {
      showReward("Flott sortert! ✅");
      window.setTimeout(completeCurrentTask, 700);
    }
    return;
  }

  wordButton.classList.add("wrong");
  window.setTimeout(() => wordButton.classList.remove("wrong"), 450);
  el.feedback.textContent = "Nesten! Prøv en annen bokstav-kasse.";
  el.feedback.className = "feedback bad";
}

function renderSortTask(task) {
  const ctx = getActiveUserData();
  if (!ctx) return;
  const progress = ctx.progress;

  el.taskContent.textContent = `${task.prompt}`;
  el.answerButtons.innerHTML = "";

  const panel = document.createElement("div");
  panel.className = "sort-panel";

  const itemsWrap = document.createElement("div");
  itemsWrap.className = "sort-items";

  task.items.forEach((item) => {
    const wordBtn = document.createElement("button");
    wordBtn.className = "answer";
    wordBtn.textContent = item.word;
    wordBtn.draggable = true;

    wordBtn.addEventListener("dragstart", () => {
      selectedWordButton = wordBtn;
    });

    wordBtn.addEventListener("click", () => {
      if (wordBtn.disabled) return;
      selectedWordButton = wordBtn;
      [...itemsWrap.querySelectorAll("button")].forEach((btn) => btn.classList.remove("selected-word"));
      wordBtn.classList.add("selected-word");
      el.feedback.textContent = `Valgt ord: ${item.word}. Trykk på riktig bokstav-kasse.`;
      el.feedback.className = "feedback";
    });

    itemsWrap.appendChild(wordBtn);
  });

  const binsWrap = document.createElement("div");
  binsWrap.className = "sort-bins";

  task.bins.forEach((bin) => {
    const box = document.createElement("div");
    box.className = "sort-bin";
    box.dataset.bin = bin.id;

    const title = document.createElement("h3");
    title.textContent = bin.label;

    const words = document.createElement("div");
    words.className = "sort-bin-words";
    words.dataset.binWords = bin.id;

    box.appendChild(title);
    box.appendChild(words);

    box.addEventListener("dragover", (event) => event.preventDefault());
    box.addEventListener("drop", (event) => {
      event.preventDefault();
      if (!selectedWordButton) return;
      handleDropToBin(selectedWordButton, bin.id, task, progress, ctx);
    });

    box.addEventListener("click", () => {
      if (!selectedWordButton) return;
      handleDropToBin(selectedWordButton, bin.id, task, progress, ctx);
    });

    binsWrap.appendChild(box);
  });

  panel.appendChild(itemsWrap);
  panel.appendChild(binsWrap);
  el.answerButtons.appendChild(panel);

  el.feedback.textContent = `Sorter ${task.items.length} ord i riktig bokstav-kasse.`;
  el.feedback.className = "feedback";
}

function renderTask() {
  const ctx = getActiveUserData();
  if (!ctx) return;

  const level = gameCategories[categoryKey].levels[levelIndex];
  const task = level.tasks[taskIndex];
  selectedWordButton = null;

  renderProgress(ctx.progress, ctx.name);
  el.taskTitle.textContent = `${gameCategories[categoryKey].title} – Nivå ${levelIndex + 1}: ${level.name}`;
  el.taskInstruction.textContent = `Oppgave ${taskIndex + 1} av ${level.tasks.length}`;
  el.taskContent.textContent = "";
  el.feedback.textContent = "";
  el.feedback.className = "feedback";

  if (task.type === "sort") {
    renderSortTask(task);
    return;
  }

  el.taskContent.textContent = task.prompt;
  el.answerButtons.innerHTML = "";
  task.choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.className = "answer";
    btn.textContent = choice;
    btn.addEventListener("click", () => onMultipleChoiceAnswer(btn, choice, task));
    el.answerButtons.appendChild(btn);
  });
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
