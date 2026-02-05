const el = {
  activeUser: document.getElementById("activeUser"),
  starCount: document.getElementById("starCount"),
  badgeCount: document.getElementById("badgeCount"),
  progressBar: document.getElementById("progressBar"),
  badgeShelf: document.getElementById("badgeShelf"),
  levelButtons: document.getElementById("levelButtons"),
  historyList: document.getElementById("historyList"),
  logoutBtn: document.getElementById("logoutBtn"),
  resetProgress: document.getElementById("resetProgress")
};

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

  el.levelButtons.innerHTML = "";
  levels.forEach((level, index) => {
    const btn = document.createElement("button");
    const unlocked = ctx.progress.unlockedLevels.includes(index);
    const completed = ctx.progress.completedLevels.includes(index);
    btn.className = "secondary level-button";
    btn.disabled = !unlocked;
    btn.textContent = completed ? `✅ Nivå ${index + 1}: ${level.name}` : `Nivå ${index + 1}: ${level.name}`;
    btn.addEventListener("click", () => {
      sessionStorage.setItem("lesestjerner-current-level", String(index));
      sessionStorage.setItem("lesestjerner-current-task", "0");
      window.location.href = "task.html";
    });
    el.levelButtons.appendChild(btn);
  });

  el.historyList.innerHTML = "";
  if (ctx.progress.history.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Ingen historikk ennå.";
    el.historyList.appendChild(li);
  } else {
    ctx.progress.history.slice().reverse().slice(0, 8).forEach((entry) => {
      const li = document.createElement("li");
      li.textContent = `${entry.when} – ${entry.text}`;
      el.historyList.appendChild(li);
    });
  }
}

el.logoutBtn.addEventListener("click", () => {
  const data = loadData();
  data.activeUser = null;
  saveData(data);
  window.location.href = "login.html";
});

el.resetProgress.addEventListener("click", () => {
  const data = loadData();
  const name = data.activeUser;
  data.users[name].progress = blankProgress();
  data.users[name].progress.history.push({ when: new Date().toLocaleString("no-NO"), text: "Fremgang nullstilt" });
  saveData(data);
  render();
});

render();
