const nameInput = document.getElementById("nameInput");
const startBtn = document.getElementById("startBtn");
const authFeedback = document.getElementById("authFeedback");

function setFeedback(message, type = "good") {
  authFeedback.textContent = message;
  authFeedback.className = `feedback ${type}`;
}

startBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  if (!name) {
    setFeedback("Skriv inn et navn først.", "bad");
    return;
  }

  const data = loadData();
  if (!data.users[name]) {
    data.users[name] = { progress: blankProgress() };
  }
  data.activeUser = name;
  saveData(data);

  sessionStorage.removeItem("lesestjerner-current-category");
  sessionStorage.removeItem("lesestjerner-current-level");
  sessionStorage.removeItem("lesestjerner-current-task");

  window.location.href = "levels.html";
});

const active = getActiveUserData();
if (active) {
  window.location.href = "levels.html";
}
