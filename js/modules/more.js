
const MoreModule = {
  render() {
    document.getElementById("view-more").innerHTML = `
      <div class="page-card">
        <div class="page-title"><h2>Mehr</h2><button class="secondary-button" data-route-inline="dashboard">← Zurück</button></div>
        <div class="menu-list">
          <button class="menu-item" data-route-inline="emergency"><span>🆘 Notfallbereich</span><span>›</span></button>
          <button class="menu-item" data-route-inline="import"><span>📷 Plan importieren</span><span>›</span></button>
          <button class="menu-item" data-route-inline="settings"><span>⚙️ Einstellungen & Backup</span><span>›</span></button>
          <button class="menu-item" data-route-inline="admin-login"><span>🔒 Admin-Bereich</span><span>›</span></button>
          <button class="menu-item"><span>ℹ️ Über MediPlan</span><span>v1.0.0</span></button>
        </div>
      </div>`;
    document.querySelectorAll("[data-route-inline]").forEach(b=>b.addEventListener("click",()=>Router.go(b.dataset.routeInline)));
  }
};
