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

let selectedButton = null;
let partIndex = Number(sessionStorage.getItem("lesestjerner-current-part"));
let stepIndex = Number(sessionStorage.getItem("lesestjerner-current-step") || "0");

if (!getActiveUserData()) window.location.href = "login.html";
if (Number.isNaN(partIndex) || !gameData.parts[partIndex]) window.location.href = "levels.html";

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

function completePartIfDone() {
  const ctx = getActiveUserData();
  const data = ctx.data;
  const progress = ctx.progress;

  if (!progress.completedParts.includes(partIndex)) {
    progress.completedParts.push(partIndex);
  }

  const nextPart = partIndex + 1;
  if (gameData.parts[nextPart] && !progress.unlockedParts.includes(nextPart)) {
    progress.unlockedParts.push(nextPart);
  }

  progress.history.push({
    when: new Date().toLocaleString("no-NO"),
    text: `Fullførte ${gameData.parts[partIndex].name}`
  });

  saveData(data);
  sessionStorage.removeItem("lesestjerner-current-part");
  sessionStorage.removeItem("lesestjerner-current-step");
  window.location.href = "levels.html";
}

function giveStarAndMaybeBadge(ctx) {
  ctx.progress.stars += 1;
  const newBadges = applyBadges(ctx.progress);
  if (newBadges.length) showReward(`Nytt merke: ${newBadges.join(", ")} 🏅`);
  saveData(ctx.data);
  renderProgress(ctx.progress, ctx.name);
}

function goToNextStep(totalSteps) {
  if (stepIndex < totalSteps - 1) {
    stepIndex += 1;
    sessionStorage.setItem("lesestjerner-current-step", String(stepIndex));
    renderTask();
    return;
  }
  completePartIfDone();
}

function handleDropChoice(button, binId, items, totalSteps) {
  const ctx = getActiveUserData();
  const item = items.find((it) => it.id === button.dataset.itemId);
  if (!item) return;

  if (item.binId === binId) {
    button.classList.remove("selected-word");
    button.classList.add("correct");
    button.disabled = true;
    button.draggable = false;
    const targetContainer = el.answerButtons.querySelector(`[data-bin-words='${binId}']`);
    if (targetContainer) targetContainer.appendChild(button);

    const correctCount = el.answerButtons.querySelectorAll(".answer.correct").length;
    el.feedback.textContent = `Riktig! ${correctCount} av ${items.length} sortert.`;
    el.feedback.className = "feedback good";

    const allDone = correctCount >= items.length;
    if (allDone) {
      giveStarAndMaybeBadge(ctx);
      showReward("Flott sortert! ✅");
      window.setTimeout(() => goToNextStep(totalSteps), 700);
    }
    return;
  }

  button.classList.add("wrong");
  window.setTimeout(() => button.classList.remove("wrong"), 450);
  el.feedback.textContent = "Nesten! Prøv en annen kasse.";
  el.feedback.className = "feedback bad";
}

function renderSortPanel(task, itemRenderer, totalSteps) {
  selectedButton = null;
  el.taskContent.textContent = task.prompt;
  el.answerButtons.innerHTML = "";

  const panel = document.createElement("div");
  panel.className = "sort-panel";

  const itemsWrap = document.createElement("div");
  itemsWrap.className = "sort-items";

  task.items.forEach((item) => {
    const btn = document.createElement("button");
    btn.className = "answer";
    btn.dataset.itemId = item.id;
    btn.draggable = true;
    itemRenderer(btn, item);

    btn.addEventListener("dragstart", () => {
      selectedButton = btn;
    });

    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      selectedButton = btn;
      [...itemsWrap.querySelectorAll("button")].forEach((x) => x.classList.remove("selected-word"));
      btn.classList.add("selected-word");
      el.feedback.textContent = "Valgt element. Trykk på riktig kasse.";
      el.feedback.className = "feedback";
    });

    itemsWrap.appendChild(btn);
  });

  const binsWrap = document.createElement("div");
  binsWrap.className = "sort-bins";

  task.bins.forEach((bin) => {
    const box = document.createElement("div");
    box.className = "sort-bin";

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
      if (!selectedButton) return;
      handleDropChoice(selectedButton, bin.id, task.items, totalSteps);
    });

    box.addEventListener("click", () => {
      if (!selectedButton) return;
      handleDropChoice(selectedButton, bin.id, task.items, totalSteps);
    });

    binsWrap.appendChild(box);
  });

  panel.appendChild(itemsWrap);
  panel.appendChild(binsWrap);
  el.answerButtons.appendChild(panel);
  el.feedback.textContent = `Sorter ${task.items.length} elementer i riktig kasse.`;
  el.feedback.className = "feedback";
}

function renderFillLetterTask(part, totalSteps) {
  const task = part.tasks[stepIndex];
  el.taskContent.textContent = task.text;
  el.answerButtons.innerHTML = "";

  task.choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.className = "answer";
    btn.textContent = choice;
    btn.addEventListener("click", () => {
      if (choice === task.answer) {
        const ctx = getActiveUserData();
        [...el.answerButtons.querySelectorAll("button")].forEach((x) => (x.disabled = true));
        btn.classList.add("correct");
        el.feedback.textContent = "Riktig bokstav! 🎉";
        el.feedback.className = "feedback good";
        giveStarAndMaybeBadge(ctx);
        window.setTimeout(() => goToNextStep(totalSteps), 650);
      } else {
        btn.classList.add("wrong");
        btn.disabled = true;
        el.feedback.textContent = "Prøv igjen!";
        el.feedback.className = "feedback bad";
      }
    });
    el.answerButtons.appendChild(btn);
  });
}

function renderTask() {
  const ctx = getActiveUserData();
  const part = gameData.parts[partIndex];

  renderProgress(ctx.progress, ctx.name);
  el.taskTitle.textContent = `Norsk – ${part.name}`;
  el.taskInstruction.textContent = part.type === "fill-letter"
    ? `Oppgave ${stepIndex + 1} av ${part.tasks.length}`
    : "Sorter alle elementene riktig";
  el.feedback.textContent = "";
  el.feedback.className = "feedback";

  if (part.type === "sort-icon-to-letter") {
    renderSortPanel(
      part,
      (btn, item) => {
        btn.classList.add("icon-item");
        btn.setAttribute("aria-label", item.label);
        btn.title = item.label;
        const icon = document.createElement("span");
        icon.className = "icon-emoji";
        icon.textContent = item.icon;
        btn.appendChild(icon);
      },
      1
    );
    return;
  }

  if (part.type === "sort-word-to-icon") {
    renderSortPanel(
      part,
      (btn, item) => {
        btn.textContent = item.text;
      },
      1
    );
    return;
  }

  if (part.type === "fill-letter") {
    renderFillLetterTask(part, part.tasks.length);
  }
}

el.backToLevelsBtn.addEventListener("click", () => {
  sessionStorage.removeItem("lesestjerner-current-part");
  sessionStorage.removeItem("lesestjerner-current-step");
  window.location.href = "levels.html";
});

el.logoutBtn.addEventListener("click", () => {
  const data = loadData();
  data.activeUser = null;
  saveData(data);
  sessionStorage.removeItem("lesestjerner-current-part");
  sessionStorage.removeItem("lesestjerner-current-step");
  window.location.href = "login.html";
});

renderTask();
