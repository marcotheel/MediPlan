const Settings = {
  init() {
    const savedTheme = MediPlanStorage.get("theme", "light");
    this.setTheme(savedTheme);

    const toggle = document.getElementById("themeToggle");
    if (toggle) {
      toggle.addEventListener("click", () => {
        const next = document.body.classList.contains("dark") ? "light" : "dark";
        this.setTheme(next);
      });
    }
  },

  setTheme(theme) {
    document.body.classList.toggle("dark", theme === "dark");
    MediPlanStorage.set("theme", theme);

    const toggle = document.getElementById("themeToggle");
    if (toggle) {
      toggle.textContent = theme === "dark" ? "☀️" : "🌙";
    }
  }
};
