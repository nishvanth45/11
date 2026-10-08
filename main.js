// =====================================================
// Dugout 11 - website skeleton
// Simple hash-based navigation + localStorage for a
// temporary manager and settings. No game logic yet.
// =====================================================

// ---------- Storage keys ----------
const STORAGE_KEYS = {
  career: "dugout11_career",
  settings: "dugout11_settings",
};

const DEFAULT_SETTINGS = {
  sound: true,
  notifications: true,
  theme: "dark",
};

// ---------- Storage helpers ----------
function loadData(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getCareer() {
  return loadData(STORAGE_KEYS.career);
}

function getSettings() {
  return { ...DEFAULT_SETTINGS, ...(loadData(STORAGE_KEYS.settings) || {}) };
}

// ---------- Navigation ----------
const screens = document.querySelectorAll("[data-screen]");
const navLinks = document.querySelectorAll("[data-link]");
const topbar = document.getElementById("topbar");
const nav = document.getElementById("nav");
const navToggle = document.getElementById("navToggle");

// Runs every time a screen is opened (add new screens here later)
const screenHandlers = new Map([
  ["home", renderHome],
  ["new-career", resetCareerForm],
  ["dashboard", renderDashboard],
  ["settings", renderSettings],
]);

function showScreen() {
  let name = location.hash.replace("#", "") || "home";
  if (!document.querySelector(`[data-screen="${name}"]`)) name = "home";

  screens.forEach((s) => (s.hidden = s.dataset.screen !== name));
  navLinks.forEach((a) => a.classList.toggle("active", a.dataset.link === name));

  // Top bar is hidden on Home to keep the landing look
  topbar.hidden = name === "home";
  closeMenu();

  const handler = screenHandlers.get(name);
  if (handler) handler();
  window.scrollTo(0, 0);
}

function closeMenu() {
  nav.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
}

navToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
});

window.addEventListener("hashchange", showScreen);

// Any element with data-go="screen" navigates to that screen
document.addEventListener("click", (e) => {
  const target = e.target.closest("[data-go]");
  if (target) location.hash = "#" + target.dataset.go;
});

// ---------- HOME ----------
function renderHome() {
  const hasCareer = Boolean(getCareer());
  document.getElementById("continueBtn").hidden = !hasCareer;
  document.getElementById("loadCareerBtn").hidden = hasCareer;
  document.getElementById("newCareerBtn").classList.toggle("btn-primary", !hasCareer);
  document.getElementById("homeMessage").textContent = "";
}

document.getElementById("loadCareerBtn").addEventListener("click", () => {
  if (getCareer()) {
    location.hash = "#dashboard";
  } else {
    document.getElementById("homeMessage").textContent = "No saved career found. Start a New Career.";
  }
});

// ---------- NEW CAREER ----------
const careerForm = document.getElementById("careerForm");
const formError = document.getElementById("formError");

function resetCareerForm() {
  formError.textContent = "";
}

careerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(careerForm);
  const name = data.get("name").trim();
  const age = Number(data.get("age"));

  if (!name) {
    formError.textContent = "Please enter a manager name.";
    return;
  }
  if (!age || age < 25 || age > 75) {
    formError.textContent = "Age must be between 25 and 75.";
    return;
  }

  if (getCareer() && !confirm("This will replace your current career. Continue?")) return;

  // Temporary placeholder career (no game logic)
  const career = {
    manager: {
      name,
      age,
      nationality: data.get("nationality"),
      experience: data.get("experience"),
      style: data.get("style"),
    },
    club: "Unemployed",
    reputation: "Unknown",
    season: new Date().getFullYear(),
    createdAt: new Date().toISOString(),
  };

  saveData(STORAGE_KEYS.career, career);
  careerForm.reset();
  location.hash = "#dashboard";
});

// ---------- DASHBOARD ----------
function renderDashboard() {
  const career = getCareer();
  document.getElementById("noCareer").hidden = Boolean(career);
  document.getElementById("dashboardContent").hidden = !career;
  if (!career) return;

  const m = career.manager;
  document.getElementById("dashName").textContent = m.name;
  document.getElementById("dashClub").textContent = career.club;
  document.getElementById("dashReputation").textContent = career.reputation;
  document.getElementById("dashSeason").textContent = career.season;

  // Placeholder inbox messages
  const messages = [
    `Welcome to Dugout 11, ${m.name}!`,
    `Profile: ${m.age} yrs · ${m.nationality} · ${m.experience} · ${m.style}`,
    "You are currently unemployed. Club offers will appear here.",
  ];
  const inbox = document.getElementById("dashInbox");
  inbox.innerHTML = "";
  messages.forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text;
    inbox.appendChild(li);
  });
}

// ---------- SETTINGS ----------
const soundInput = document.getElementById("settingSound");
const notifInput = document.getElementById("settingNotifications");
const themeInput = document.getElementById("settingTheme");
const settingsMessage = document.getElementById("settingsMessage");

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

function renderSettings() {
  const s = getSettings();
  soundInput.checked = s.sound;
  notifInput.checked = s.notifications;
  themeInput.value = s.theme;
  settingsMessage.textContent = "";
}

function saveSettings() {
  const s = {
    sound: soundInput.checked,
    notifications: notifInput.checked,
    theme: themeInput.value,
  };
  saveData(STORAGE_KEYS.settings, s);
  applyTheme(s.theme);
  settingsMessage.textContent = "Settings saved";
}

[soundInput, notifInput, themeInput].forEach((el) => el.addEventListener("change", saveSettings));

document.getElementById("resetCareerBtn").addEventListener("click", () => {
  if (!getCareer()) {
    settingsMessage.textContent = "There is no career to reset.";
    return;
  }
  if (confirm("Delete your current career? This cannot be undone.")) {
    localStorage.removeItem(STORAGE_KEYS.career);
    settingsMessage.textContent = "Career reset.";
  }
});

// ---------- Init ----------
applyTheme(getSettings().theme);
document.getElementById("year").textContent = new Date().getFullYear();
showScreen();
