const el = {
  activeUser: document.getElementById("activeUser"),
  starCount: document.getElementById("starCount"),
  badgeCount: document.getElementById("badgeCount"),
  progressBar: document.getElementById("progressBar"),
  badgeShelf: document.getElementById("badgeShelf"),
  partButtons: document.getElementById("partButtons"),
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

  el.partButtons.innerHTML = "";
  gameData.parts.forEach((part, index) => {
    const btn = document.createElement("button");
    const unlocked = ctx.progress.unlockedParts.includes(index);
    const completed = ctx.progress.completedParts.includes(index);
    btn.className = "secondary level-button";
    btn.disabled = !unlocked;
    btn.textContent = completed ? `✅ ${part.name}` : part.name;
    btn.addEventListener("click", () => {
      sessionStorage.setItem("lesestjerner-current-part", String(index));
      sessionStorage.setItem("lesestjerner-current-step", "0");
      window.location.href = "task.html";
    });
    el.partButtons.appendChild(btn);
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
  sessionStorage.removeItem("lesestjerner-current-part");
  sessionStorage.removeItem("lesestjerner-current-step");
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
