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
  rewardAnimation: document.getElementById("rewardAnimation"),
  resetBtn: document.getElementById("resetBtn")
};

let selectedButton = null;

function showReward(message) {
  el.rewardAnimation.textContent = message;
  el.rewardAnimation.classList.add("show");
  window.setTimeout(() => el.rewardAnimation.classList.remove("show"), 1400);
}

function getPartAndStep(progress) {
  const partIndex = Math.min(Math.max(progress.currentPart, 0), gameData.parts.length - 1);
  let stepIndex = Math.max(progress.currentStep, 0);

  const part = gameData.parts[partIndex];
  if (part.type === "fill-letter") {
    stepIndex = Math.min(stepIndex, part.tasks.length - 1);
  } else {
    stepIndex = 0;
  }

  return { partIndex, stepIndex };
}

function renderProgress(progress) {
  el.activeUser.textContent = progress.playerName;
  el.starCount.textContent = String(progress.stars);
  el.badgeCount.textContent = String(progress.badges.length);
  el.progressBar.style.width = `${progressPercent(progress)}%`;
  el.badgeShelf.textContent = progress.badges.length
    ? `Dine merker: ${progress.badges.join(" • ")}`
    : "Ingen merker ennå. Spill for å tjene dine første!";
}

function completeCurrentPart(progress, partIndex) {
  if (!progress.completedParts.includes(partIndex)) {
    progress.completedParts.push(partIndex);
  }

  progress.history.push({
    when: new Date().toLocaleString("no-NO"),
    text: `Fullførte ${gameData.parts[partIndex].name}`
  });

  if (partIndex < gameData.parts.length - 1) {
    progress.currentPart = partIndex + 1;
    progress.currentStep = 0;
  } else {
    progress.currentPart = 0;
    progress.currentStep = 0;
    showReward("Fantastisk! Du fullførte alle tre deler 🌟");
  }

  saveData(progress);
  renderTask();
}

function giveStarAndBadges(progress) {
  progress.stars += 1;
  const newBadges = applyBadges(progress);
  if (newBadges.length) {
    showReward(`Nytt merke: ${newBadges.join(", ")} 🏅`);
  }
  saveData(progress);
  renderProgress(progress);
}

function handleDropChoice(button, binId, items, progress, partIndex) {
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

    if (correctCount >= items.length) {
      giveStarAndBadges(progress);
      showReward("Flott sortert! ✅");
      window.setTimeout(() => completeCurrentPart(progress, partIndex), 700);
    }
    return;
  }

  button.classList.add("wrong");
  window.setTimeout(() => button.classList.remove("wrong"), 450);
  el.feedback.textContent = "Nesten! Prøv en annen kasse.";
  el.feedback.className = "feedback bad";
}

function renderSortPanel(task, itemRenderer, progress, partIndex) {
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
      handleDropChoice(selectedButton, bin.id, task.items, progress, partIndex);
    });

    box.addEventListener("click", () => {
      if (!selectedButton) return;
      handleDropChoice(selectedButton, bin.id, task.items, progress, partIndex);
    });

    binsWrap.appendChild(box);
  });

  panel.appendChild(itemsWrap);
  panel.appendChild(binsWrap);
  el.answerButtons.appendChild(panel);
  el.feedback.textContent = `Sorter ${task.items.length} elementer i riktig kasse.`;
  el.feedback.className = "feedback";
}

function renderFillLetterTask(part, stepIndex, progress, partIndex) {
  const task = part.tasks[stepIndex];
  el.taskContent.textContent = task.text;
  el.answerButtons.innerHTML = "";

  task.choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.className = "answer";
    btn.textContent = choice;
    btn.addEventListener("click", () => {
      if (choice === task.answer) {
        [...el.answerButtons.querySelectorAll("button")].forEach((x) => (x.disabled = true));
        btn.classList.add("correct");
        el.feedback.textContent = "Riktig bokstav! 🎉";
        el.feedback.className = "feedback good";

        giveStarAndBadges(progress);

        if (stepIndex < part.tasks.length - 1) {
          progress.currentStep = stepIndex + 1;
          saveData(progress);
          window.setTimeout(renderTask, 650);
        } else {
          window.setTimeout(() => completeCurrentPart(progress, partIndex), 650);
        }
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
  const progress = getProgress();
  const { partIndex, stepIndex } = getPartAndStep(progress);
  const part = gameData.parts[partIndex];

  renderProgress(progress);
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
        btn.classList.add("answer", "icon-item");
        btn.setAttribute("aria-label", item.label);
        btn.title = item.label;
        const icon = document.createElement("span");
        icon.className = "icon-emoji";
        icon.textContent = item.icon;
        btn.appendChild(icon);
      },
      progress,
      partIndex
    );
    return;
  }

  if (part.type === "sort-word-to-icon") {
    renderSortPanel(
      part,
      (btn, item) => {
        btn.textContent = item.text;
      },
      progress,
      partIndex
    );
    return;
  }

  renderFillLetterTask(part, stepIndex, progress, partIndex);
}

el.resetBtn.addEventListener("click", () => {
  const next = blankProgress();
  saveData(next);
  renderTask();
  showReward("Spillet er startet på nytt 🔄");
});

renderTask();
