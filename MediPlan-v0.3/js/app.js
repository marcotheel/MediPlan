document.addEventListener("DOMContentLoaded", () => {
  Settings.init();
  Dashboard.init();
  Router.init();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js").catch(console.error);
  }
});
