// Dugout 11 - main menu (placeholder actions only)

const messageEl = document.getElementById("message");

// Each button's data-action maps to a function here.
// Replace these placeholders with real screens later.
const actions = {
  "new-career": () => showMessage("New Career - coming soon"),
  "load-career": () => showMessage("Load Career - coming soon"),
  "settings": () => showMessage("Settings - coming soon"),
};

function showMessage(text) {
  messageEl.textContent = text;
}

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = actions[button.dataset.action];
    if (action) action();
  });
});

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();
