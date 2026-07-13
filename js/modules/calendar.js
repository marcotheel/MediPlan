
const CalendarModule = {
  render() {
    const events = DataStore.get("events").slice().sort((a,b)=>`${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
    document.getElementById("view-calendar").innerHTML = `
      <div class="page-card">
        <div class="page-title">
          <h2>Kalender</h2>
          <div><button class="primary-button" data-add-event>+ Termin</button> <button class="secondary-button" data-route-inline="dashboard">← Zurück</button></div>
        </div>
        <div class="timeline">
          ${events.length ? events.map(e=>`<article class="timeline-item">
            <time>${new Date(`${e.date}T00:00:00`).toLocaleDateString("de-DE")} · ${e.time}</time>
            <h3>${UI.escape(e.title)}</h3>
            <p>${UI.escape(e.location || "")}</p>
          </article>`).join("") : `<div class="empty-state"><h3>Keine Termine</h3></div>`}
        </div>
      </div>`;
    document.querySelector("[data-add-event]").addEventListener("click",()=>this.openForm());
    document.querySelectorAll("[data-route-inline]").forEach(b=>b.addEventListener("click",()=>Router.go(b.dataset.routeInline)));
  },
  openForm() {
    UI.modal(`<h2>Termin hinzufügen</h2>
      <form id="eventForm" class="form-grid">
        <div class="form-field"><label>Titel</label><input name="title" required></div>
        <div class="form-grid two">
          <div class="form-field"><label>Datum</label><input type="date" name="date" required></div>
          <div class="form-field"><label>Uhrzeit</label><input type="time" name="time" required></div>
        </div>
        <div class="form-field"><label>Ort / Hinweis</label><input name="location"></div>
        <div class="form-actions"><button type="button" class="secondary-button" data-close>Abbrechen</button><button class="primary-button">Speichern</button></div>
      </form>`);
    document.querySelector("[data-close]").addEventListener("click",UI.closeModal);
    document.getElementById("eventForm").addEventListener("submit", e=>{
      e.preventDefault();
      const f = new FormData(e.currentTarget);
      const events = DataStore.get("events");
      events.push({id:`evt_${Date.now()}`,title:f.get("title"),date:f.get("date"),time:f.get("time"),location:f.get("location"),type:"other"});
      DataStore.set("events",events);
      UI.closeModal(); this.render(); UI.toast("Termin gespeichert.");
    });
  }
};
