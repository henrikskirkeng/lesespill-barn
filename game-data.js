const STORAGE_KEY = "lesestjerner-profiles-v5";

const levels = [
  { name: "Bokstavgjenkjenning", tasks: [
    { prompt: "Trykk på bokstaven A", choices: ["A", "O", "M"], answer: "A" },
    { prompt: "Hvilken bokstav lager lyden b?", choices: ["D", "B", "P"], answer: "B" },
    { prompt: "Finn bokstaven S", choices: ["S", "F", "T"], answer: "S" }
  ]},
  { name: "Ordlesing", tasks: [
    { prompt: "Hvilket ord er et dyr?", choices: ["katt", "bord", "sol"], answer: "katt" },
    { prompt: "Velg ordet som betyr noe du kan drikke", choices: ["melk", "sko", "tre"], answer: "melk" },
    { prompt: "Hvilket ord kan du spise?", choices: ["eple", "stol", "blyant"], answer: "eple" }
  ]},
  { name: "Setningsforståelse", tasks: [
    { prompt: "Les: 'Ali har en blå ball.' Hvilken farge har ballen?", choices: ["Blå", "Grønn", "Rød"], answer: "Blå" },
    { prompt: "Les: 'Katten sover i stolen.' Hvor sover katten?", choices: ["I stolen", "I bilen", "På taket"], answer: "I stolen" },
    { prompt: "Les: 'Sara løper fort til skolen.' Hva gjør Sara?", choices: ["Løper", "Sover", "Spiser"], answer: "Løper" }
  ]},
  { name: "Enkle leseoppgaver", tasks: [
    { prompt: "Les og velg riktig slutt: 'Jeg pusser ____ før jeg legger meg.'", choices: ["tennene", "taket", "jakken"], answer: "tennene" },
    { prompt: "Hvilken setning er riktig?", choices: ["Solen skinner på himmelen.", "Solen spiser en stol.", "Solen sover i skoen."], answer: "Solen skinner på himmelen." },
    { prompt: "Velg ordet som passer: 'Vi leser en ____ sammen.'", choices: ["bok", "sky", "sykkel"], answer: "bok" }
  ]}
];

const badgeMilestones = [
  { stars: 3, name: "Bokstavhelt" },
  { stars: 6, name: "Ordvenn" },
  { stars: 9, name: "Setningsmester" },
  { stars: 12, name: "Lesestjerne" }
];

function blankProgress() {
  return { stars: 0, badges: [], unlockedLevels: [0], completedLevels: [], history: [] };
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

function getActiveUserData() {
  const data = loadData();
  if (!data.activeUser || !data.users[data.activeUser]) return null;
  if (!data.users[data.activeUser].progress) {
    data.users[data.activeUser].progress = blankProgress();
    saveData(data);
  }
  return { data, name: data.activeUser, progress: data.users[data.activeUser].progress };
}

function progressPercent(progress) {
  const totalTasks = levels.reduce((sum, level) => sum + level.tasks.length, 0);
  const doneTasks = progress.completedLevels.reduce((sum, idx) => sum + levels[idx].tasks.length, 0);
  return Math.round((doneTasks / totalTasks) * 100);
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
