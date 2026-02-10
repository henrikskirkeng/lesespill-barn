const STORAGE_KEY = "lesestjerner-autostart-v1";

const gameData = {
  title: "Norsk",
  parts: [
    {
      name: "Del 1: Sorter ikoner til riktig bokstav",
      type: "sort-icon-to-letter",
      prompt: "Dra ikonene til riktig bokstav-kasse ut fra første bokstav i ordet.",
      bins: [
        { id: "B", label: "B-kassen" },
        { id: "S", label: "S-kassen" }
      ],
      items: [
        { id: "bil", label: "Bil", icon: "🚗", binId: "B" },
        { id: "bamse", label: "Bamse", icon: "🧸", binId: "B" },
        { id: "sol", label: "Sol", icon: "☀️", binId: "S" },
        { id: "sekk", label: "Sekk", icon: "🎒", binId: "S" }
      ]
    },
    {
      name: "Del 2: Sett inn riktig bokstav",
      type: "fill-letter",
      prompt: "Finn riktig bokstav som mangler i ordet.",
      tasks: [
        { text: "B _ l", choices: ["a", "i", "o"], answer: "i" },
        { text: "S _ l", choices: ["u", "o", "e"], answer: "o" },
        { text: "B _ mse", choices: ["a", "i", "u"], answer: "a" }
      ]
    },
    {
      name: "Del 3: Sorter ord til riktig ikon",
      type: "sort-word-to-icon",
      prompt: "Dra ordene til riktig ikon-kasse.",
      bins: [
        { id: "car", label: "🚗 Bil" },
        { id: "bear", label: "🧸 Bamse" },
        { id: "sun", label: "☀️ Sol" },
        { id: "bag", label: "🎒 Sekk" }
      ],
      items: [
        { id: "word-bil", text: "Bil", binId: "car" },
        { id: "word-bamse", text: "Bamse", binId: "bear" },
        { id: "word-sol", text: "Sol", binId: "sun" },
        { id: "word-sekk", text: "Sekk", binId: "bag" }
      ]
    }
  ]
};

const badgeMilestones = [
  { stars: 3, name: "Bokstavhelt" },
  { stars: 6, name: "Ordvenn" },
  { stars: 10, name: "Norskmester" }
];

function blankProgress() {
  return {
    playerName: "Spiller",
    stars: 0,
    badges: [],
    completedParts: [],
    history: [],
    currentPart: 0,
    currentStep: 0
  };
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : blankProgress();
  } catch {
    return blankProgress();
  }
}

function saveData(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function normalizeProgress(progress) {
  if (typeof progress.playerName !== "string") progress.playerName = "Spiller";
  if (typeof progress.stars !== "number") progress.stars = 0;
  if (!Array.isArray(progress.badges)) progress.badges = [];
  if (!Array.isArray(progress.completedParts)) progress.completedParts = [];
  if (!Array.isArray(progress.history)) progress.history = [];
  if (typeof progress.currentPart !== "number") progress.currentPart = 0;
  if (typeof progress.currentStep !== "number") progress.currentStep = 0;
}

function getProgress() {
  const progress = loadData();
  normalizeProgress(progress);
  saveData(progress);
  return progress;
}

function progressPercent(progress) {
  return Math.round((progress.completedParts.length / gameData.parts.length) * 100);
}

function applyBadges(progress) {
  const newlyEarned = [];
  badgeMilestones.forEach((milestone) => {
    if (progress.stars >= milestone.stars && !progress.badges.includes(milestone.name)) {
      progress.badges.push(milestone.name);
      newlyEarned.push(milestone.name);
    }
  });
  return newlyEarned;
}
