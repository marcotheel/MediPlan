
const Router = {
  current:"dashboard",
  titles:{
    dashboard:"Guten Morgen, Mama 👋",
    intakes:"Einnahmen heute",
    cabinet:"Medikamentenschrank",
    calendar:"Kalender",
    more:"Mehr",
    emergency:"Notfall",
    "admin-login":"Admin-Bereich",
    admin:"Admin-Dashboard",
    import:"Plan importieren",
    settings:"Einstellungen"
  },
  modules:{},
  register(route, module) { this.modules[route] = module; },
  init() {
    document.querySelectorAll("[data-route]").forEach(btn => {
      btn.addEventListener("click", () => this.go(btn.dataset.route));
    });
  },
  go(route) {
    this.current = route;
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active-view"));
    document.getElementById(`view-${route}`).classList.add("active-view");
    document.querySelectorAll(".nav-button").forEach(b => {
      b.classList.toggle("active", b.dataset.route === route);
    });
    document.getElementById("pageTitle").textContent = this.titles[route] || "MediPlan";
    const module = this.modules[route];
    if (module?.render) module.render();
    window.scrollTo({top:0, behavior:"smooth"});
  },
  refresh() {
    const module = this.modules[this.current];
    if (module?.render) module.render();
  }
};
