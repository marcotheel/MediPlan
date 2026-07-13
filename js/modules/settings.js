
const SettingsModule = {
  render() {
    const s = DataStore.get("settings");
    document.getElementById("view-settings").innerHTML = `
      <div class="page-card">
        <div class="page-title"><h2>Einstellungen & Backup</h2><button class="secondary-button" data-route-inline="more">← Zurück</button></div>
        <div class="form-grid">
          <div class="form-field"><label>Darstellung</label>
            <select id="themeSelect"><option value="light" ${s.theme==="light"?"selected":""}>Hell</option><option value="dark" ${s.theme==="dark"?"selected":""}>Dunkel</option></select>
          </div>
          <div class="form-field"><label>Schriftgröße</label>
            <select id="fontScale"><option value="normal" ${s.fontScale==="normal"?"selected":""}>Normal</option><option value="large" ${s.fontScale==="large"?"selected":""}>Groß</option></select>
          </div>
          <div class="form-actions">
            <button class="primary-button" data-save-settings>Speichern</button>
            <button class="secondary-button" data-export>Backup exportieren</button>
            <label class="secondary-button">Backup importieren<input id="backupInput" class="hidden" type="file" accept=".json"></label>
            <button class="danger-button" data-reset-demo>Demodaten zurücksetzen</button>
          </div>
        </div>
      </div>`;
    document.querySelectorAll("[data-route-inline]").forEach(b=>b.addEventListener("click",()=>Router.go(b.dataset.routeInline)));
    document.querySelector("[data-save-settings]").addEventListener("click",()=>{
      const settings = DataStore.get("settings");
      settings.theme = document.getElementById("themeSelect").value;
      settings.fontScale = document.getElementById("fontScale").value;
      DataStore.set("settings",settings); this.apply(settings); UI.toast("Einstellungen gespeichert.");
    });
    document.querySelector("[data-export]").addEventListener("click",()=>{
      UI.download(`mediplan-backup-${DataStore.today()}.json`,JSON.stringify(Storage.exportAll(),null,2));
    });
    document.getElementById("backupInput").addEventListener("change",e=>this.importBackup(e.target.files[0]));
    document.querySelector("[data-reset-demo]").addEventListener("click",()=>{
      if (confirm("Alle lokalen MediPlan-Daten zurücksetzen?")) {
        DataStore.resetDemo(); location.reload();
      }
    });
  },
  apply(settings=DataStore.get("settings")) {
    document.body.classList.toggle("dark",settings.theme==="dark");
    document.documentElement.style.fontSize = settings.fontScale==="large" ? "112.5%" : "100%";
    document.getElementById("themeButton").textContent = settings.theme==="dark" ? "☀️" : "🌙";
  },
  async importBackup(file) {
    if (!file) return;
    try {
      const payload = JSON.parse(await file.text());
      Storage.importAll(payload); UI.toast("Backup importiert."); setTimeout(()=>location.reload(),700);
    } catch {
      UI.toast("Backup-Datei ist ungültig.");
    }
  }
};
