
const IntakesModule = {
  cardHtml(intake, med) {
    return `<article class="card">
      <div class="card-top">
        <span class="time-badge">${intake.scheduledTime}</span>
        <span>Bestand: ${med.stock}</span>
      </div>
      <div class="med-visual">${UI.pill(med)}</div>
      <h3>${UI.escape(med.name)} ${UI.escape(med.strength)}</h3>
      <p>${intake.amount} ${UI.escape(med.unit)}</p>
      <div class="stock-track"><div class="stock-bar" style="width:${Math.min(med.stock,100)}%"></div></div>
      <button class="primary-button" data-intake-id="${intake.id}">Jetzt einnehmen</button>
    </article>`;
  },
  confirm(id) {
    const intakes = DataStore.getTodayIntakes();
    const item = intakes.find(i => i.id === id);
    if (!item || item.status === "done") {
      UI.toast("Diese Einnahme wurde bereits bestätigt.");
      return;
    }
    const meds = DataStore.get("medications");
    const med = meds.find(m => m.id === item.medicationId);
    item.status = "done";
    item.confirmedAt = new Date().toISOString();
    med.stock = Math.max(0, med.stock - item.amount);
    DataStore.setTodayIntakes(intakes);
    DataStore.set("medications", meds);
    Router.refresh();
    if (Router.current !== "dashboard") DashboardModule.render();
    UI.toast(`${med.name} wurde bestätigt.`);
  },
  render() {
    const meds = DataStore.get("medications");
    const intakes = DataStore.getTodayIntakes();
    const open = intakes.filter(i=>i.status==="open");
    document.getElementById("view-intakes").innerHTML = `
      <div class="page-card">
        <div class="page-title"><h2>Einnahmen heute</h2><button class="secondary-button" data-route-inline="dashboard">← Zurück</button></div>
        <div class="cards">${open.map(i=>this.cardHtml(i, meds.find(m=>m.id===i.medicationId))).join("")}</div>
        ${open.length ? "" : `<div class="empty-state"><h3>✅ Alles erledigt</h3><p>Keine Einnahme mehr offen.</p></div>`}
        <section class="section">
          <p class="eyebrow">Protokoll</p>
          <div class="list">
            ${intakes.slice().sort((a,b)=>a.scheduledTime.localeCompare(b.scheduledTime)).map(i=>{
              const med = meds.find(m=>m.id===i.medicationId);
              const confirmed = i.confirmedAt ? new Date(i.confirmedAt).toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"}) : "";
              return `<article class="list-card">
                <div class="list-visual">${UI.pill(med)}</div>
                <div><h3>${i.scheduledTime} · ${UI.escape(med.name)} ${UI.escape(med.strength)}</h3><p>${i.amount} ${UI.escape(med.unit)}</p></div>
                <div class="${i.status==="done"?"status-ok":"status-warn"}">${i.status==="done"?`✔ ${confirmed}`:"Offen"}</div>
              </article>`;
            }).join("")}
          </div>
        </section>
      </div>`;
    DashboardModule.bind();
  }
};
