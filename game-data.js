const STORAGE_KEY = "lesestjerner-profiles-v7";

const gameCategories = {
  norsk: {
    title: "Norsk",
    levels: [
      {
        name: "Bokstavsortering",
        tasks: [
          {
            type: "sort",
            prompt: "Dra ordene til riktig bokstav-kasse ut fra første bokstav.",
            bins: [
              { id: "B", label: "B-kassen" },
              { id: "S", label: "S-kassen" }
            ],
            items: [
              { word: "Bil", binId: "B" },
              { word: "Bamse", binId: "B" },
              { word: "Sol", binId: "S" },
              { word: "Sekk", binId: "S" }
            ]
          },
          { prompt: "Trykk på bokstaven A", choices: ["A", "O", "M"], answer: "A" },
          { prompt: "Finn bokstaven S", choices: ["S", "F", "T"], answer: "S" }
        ]
      },
      {
        name: "Ordlesing",
        tasks: [
          { prompt: "Hvilket ord er et dyr?", choices: ["katt", "bord", "sol"], answer: "katt" },
          { prompt: "Velg ordet som betyr noe du kan drikke", choices: ["melk", "sko", "tre"], answer: "melk" },
          { prompt: "Hvilket ord kan du spise?", choices: ["eple", "stol", "blyant"], answer: "eple" }
        ]
      }
    ]
  },
  engelsk: {
    title: "Engelsk",
    levels: [
      {
        name: "Letters and words",
        tasks: [
          { prompt: "Tap the letter C", choices: ["C", "K", "G"], answer: "C" },
          { prompt: "Which word means a small pet animal?", choices: ["cat", "table", "sun"], answer: "cat" },
          { prompt: "Choose the color word", choices: ["blue", "chair", "milk"], answer: "blue" }
        ]
      },
      {
        name: "Simple sentences",
        tasks: [
          { prompt: "Read: 'The dog is in the house.' Where is the dog?", choices: ["In the house", "In the car", "At school"], answer: "In the house" },
          { prompt: "Choose the correct sentence", choices: ["The sun is bright.", "The sun eats shoes.", "The sun is a chair."], answer: "The sun is bright." },
          { prompt: "Fill in: 'I read a ____.'", choices: ["book", "banana", "window"], answer: "book" }
        ]
      }
    ]
  },
  matematikk: {
    title: "Matematikk",
    levels: [
      {
        name: "Tallforståelse",
        tasks: [
          { prompt: "Hva er 2 + 1?", choices: ["3", "4", "2"], answer: "3" },
          { prompt: "Hvilket tall er størst?", choices: ["7", "5", "3"], answer: "7" },
          { prompt: "Hva kommer etter 9?", choices: ["8", "10", "11"], answer: "10" }
        ]
      },
      {
        name: "Enkle regnestykker",
        tasks: [
          { prompt: "Hva er 5 - 2?", choices: ["4", "3", "2"], answer: "3" },
          { prompt: "Hva er 3 + 4?", choices: ["8", "7", "6"], answer: "7" },
          { prompt: "Hva er 2 + 2?", choices: ["5", "3", "4"], answer: "4" }
        ]
      }
    ]
  }
};

const badgeMilestones = [
  { stars: 5, name: "Læringsspiren" },
  { stars: 10, name: "Superleser" },
  { stars: 15, name: "Stjernespiller" }
];

function blankCategoryProgress(categoryKey) {
  return {
    unlockedLevels: [0],
    completedLevels: [],
    history: [],
    levelCount: gameCategories[categoryKey].levels.length
  };
}

function blankProgress() {
  return {
    stars: 0,
    badges: [],
    categories: Object.keys(gameCategories).reduce((acc, key) => {
      acc[key] = blankCategoryProgress(key);
      return acc;
    }, {})
  };
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { activeUser: null, users: {} };
  } catch {
    return { activeUser: null, users: {} };
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function normalizeProgress(progress) {
  if (typeof progress.stars !== "number") progress.stars = 0;
  if (!Array.isArray(progress.badges)) progress.badges = [];
  if (!progress.categories) progress.categories = {};

  Object.keys(gameCategories).forEach((key) => {
    if (!progress.categories[key]) progress.categories[key] = blankCategoryProgress(key);
    if (!Array.isArray(progress.categories[key].unlockedLevels)) progress.categories[key].unlockedLevels = [0];
    if (!Array.isArray(progress.categories[key].completedLevels)) progress.categories[key].completedLevels = [];
    if (!Array.isArray(progress.categories[key].history)) progress.categories[key].history = [];
  });
}

function getActiveUserData() {
  const data = loadData();
  if (!data.activeUser || !data.users[data.activeUser]) return null;
  if (!data.users[data.activeUser].progress) data.users[data.activeUser].progress = blankProgress();
  normalizeProgress(data.users[data.activeUser].progress);
  saveData(data);
  return { data, name: data.activeUser, progress: data.users[data.activeUser].progress };
}

function progressPercent(progress) {
  const totalTasks = Object.values(gameCategories).flatMap((cat) => cat.levels).reduce((sum, level) => sum + level.tasks.length, 0);
  const completedTasks = Object.keys(gameCategories).reduce((sum, key) => {
    const category = gameCategories[key];
    const catProgress = progress.categories[key] || blankCategoryProgress(key);
    return sum + catProgress.completedLevels.reduce((inner, levelIndex) => inner + category.levels[levelIndex].tasks.length, 0);
  }, 0);
  return Math.round((completedTasks / totalTasks) * 100);
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
