const el = {
  activeUser: document.getElementById("activeUser"),
  starCount: document.getElementById("starCount"),
  badgeCount: document.getElementById("badgeCount"),
  progressBar: document.getElementById("progressBar"),
  badgeShelf: document.getElementById("badgeShelf"),
  categoryButtons: document.getElementById("categoryButtons"),
  levelButtons: document.getElementById("levelButtons"),
  historyList: document.getElementById("historyList"),
  logoutBtn: document.getElementById("logoutBtn"),
  resetProgress: document.getElementById("resetProgress")
};

let selectedCategory = Object.keys(gameCategories)[0];

const active = getActiveUserData();
if (!active) window.location.href = "login.html";

function render() {
  const ctx = getActiveUserData();
  if (!ctx) return;

  el.activeUser.textContent = ctx.name;
  el.starCount.textContent = String(ctx.progress.stars);
  el.badgeCount.textContent = String(ctx.progress.badges.length);
  el.progressBar.style.width = `${progressPercent(ctx.progress)}%`;
  el.badgeShelf.textContent = ctx.progress.badges.length
    ? `Dine merker: ${ctx.progress.badges.join(" • ")}`
    : "Ingen merker ennå. Spill for å tjene dine første!";

  renderCategories(ctx);
  renderLevels(ctx);
  renderHistory(ctx);
}

function renderCategories(ctx) {
  el.categoryButtons.innerHTML = "";
  Object.entries(gameCategories).forEach(([key, category]) => {
    const btn = document.createElement("button");
    btn.className = "secondary level-button";
    btn.textContent = category.title;
    if (selectedCategory === key) btn.classList.add("active-category");
    btn.addEventListener("click", () => {
      selectedCategory = key;
      renderLevels(ctx);
      renderHistory(ctx);
      renderCategories(ctx);
    });
    el.categoryButtons.appendChild(btn);
  });
}

function renderLevels(ctx) {
  el.levelButtons.innerHTML = "";
  const category = gameCategories[selectedCategory];
  const catProgress = ctx.progress.categories[selectedCategory];

  category.levels.forEach((level, index) => {
    const btn = document.createElement("button");
    const unlocked = catProgress.unlockedLevels.includes(index);
    const completed = catProgress.completedLevels.includes(index);
    btn.className = "secondary level-button";
    btn.disabled = !unlocked;
    btn.textContent = completed ? `✅ Nivå ${index + 1}: ${level.name}` : `Nivå ${index + 1}: ${level.name}`;
    btn.addEventListener("click", () => {
      sessionStorage.setItem("lesestjerner-current-category", selectedCategory);
      sessionStorage.setItem("lesestjerner-current-level", String(index));
      sessionStorage.setItem("lesestjerner-current-task", "0");
      window.location.href = "task.html";
    });
    el.levelButtons.appendChild(btn);
  });
}

function renderHistory(ctx) {
  const catProgress = ctx.progress.categories[selectedCategory];
  el.historyList.innerHTML = "";

  if (catProgress.history.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Ingen historikk i denne kategorien ennå.";
    el.historyList.appendChild(li);
    return;
  }

  catProgress.history.slice().reverse().slice(0, 8).forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = `${entry.when} – ${entry.text}`;
    el.historyList.appendChild(li);
  });
}

el.logoutBtn.addEventListener("click", () => {
  const data = loadData();
  data.activeUser = null;
  saveData(data);
  sessionStorage.removeItem("lesestjerner-current-category");
  sessionStorage.removeItem("lesestjerner-current-level");
  sessionStorage.removeItem("lesestjerner-current-task");
  window.location.href = "login.html";
});

el.resetProgress.addEventListener("click", () => {
  const data = loadData();
  const name = data.activeUser;
  data.users[name].progress = blankProgress();
  const cat = selectedCategory;
  data.users[name].progress.categories[cat].history.push({
    when: new Date().toLocaleString("no-NO"),
    text: `Fremgang nullstilt i ${gameCategories[cat].title}`
  });
  saveData(data);
  render();
});

render();
