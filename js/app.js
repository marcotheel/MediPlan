
document.addEventListener("DOMContentLoaded", () => {
  DataStore.init();
  SettingsModule.apply();

  Router.register("dashboard",DashboardModule);
  Router.register("intakes",IntakesModule);
  Router.register("cabinet",CabinetModule);
  Router.register("calendar",CalendarModule);
  Router.register("more",MoreModule);
  Router.register("emergency",EmergencyModule);
  Router.register("admin-login",{render:()=>AdminModule.renderLogin()});
  Router.register("admin",AdminModule);
  Router.register("import",ImporterModule);
  Router.register("settings",SettingsModule);

  Router.init();
  Router.go("dashboard");

  document.getElementById("todayLabel").textContent = new Intl.DateTimeFormat("de-DE",{
    weekday:"long",day:"2-digit",month:"long",year:"numeric"
  }).format(new Date());

  document.getElementById("menuButton").addEventListener("click",()=>Router.go("more"));
  document.getElementById("themeButton").addEventListener("click",()=>{
    const s=DataStore.get("settings");
    s.theme=s.theme==="dark"?"light":"dark";
    DataStore.set("settings",s);
    SettingsModule.apply(s);
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js").catch(console.error);
  }
});
