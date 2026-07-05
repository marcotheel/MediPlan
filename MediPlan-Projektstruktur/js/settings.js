const Settings = {
  theme: "light",
  setTheme(theme) {
    this.theme = theme;
    document.body.classList.toggle("dark", theme === "dark");
    MediPlanStorage.set("theme", theme);
  }
};
