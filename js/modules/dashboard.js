
const DashboardModule = {
  render() {
    const meds = DataStore.get("medications");
    const intakes = DataStore.getTodayIntakes();
    const open = intakes.filter(i => i.status === "open");
    const done = intakes.length - open.length;
    const percent = intakes.length ? Math.round(done / intakes.length * 100) : 100;
    const warnings = meds.filter(m => m.stock <= m.minStock).length;
    const next = open.slice().sort((a,b) => a.scheduledTime.localeCompare(b.scheduledTime))[0];
    const nextMed = next ? meds.find(m => m.id === next.medicationId) : null;

    document.getElementById("view-dashboard").innerHTML = `
      <section class="hero">
        <div>
          <p class="eyebrow">Dein Tag</p>
          <h2>${open.length ? `Heute noch ${open.length} Einnahme${open.length===1?"":"n"}` : "Alles erledigt"}</h2>
          <p>${open.length ? "Alles ist vorbereitet. Bestätige einfach die nächste Einnahme." : "Alle heutigen Einnahmen wurden bestätigt."}</p>
          <div class="progress-wrap">
            <div class="progress-head"><strong>${done} von ${intakes.length} erledigt</strong><span>${percent} %</span></div>
            <div class="progress-track"><div class="progress-bar" style="width:${percent}%"></div></div>
          </div>
          <button class="secondary-button" data-action="reset-day">Testdaten für heute zurücksetzen</button>
        </div>
        <div class="hero-side">
          <div class="next-card">
            <span>Nächste Einnahme</span>
            <strong class="time">${next ? next.scheduledTime : "✓"}</strong>
            <div class="next-med">
              ${nextMed ? UI.pill(nextMed) : "✅"}
              <div>
                <strong>${nextMed ? `${UI.escape(nextMed.name)} ${UI.escape(nextMed.strength)}` : "Für heute erledigt"}</strong>
                <small>${nextMed ? `${next.amount} ${UI.escape(nextMed.unit)}` : "Keine Einnahme mehr offen"}</small>
              </div>
            </div>
          </div>
          <div class="stats-grid">
            <div class="stat-card"><b>💊</b><strong>${open.length}</strong><small>Offen</small></div>
            <div class="stat-card"><b>📅</b><strong>${DataStore.get("events").filter(e=>e.date===DataStore.today()).length}</strong><small>Termin heute</small></div>
            <div class="stat-card"><b>📦</b><strong>${warnings ? "Prüfen" : "OK"}</strong><small>Bestand</small></div>
            <div class="stat-card"><b>⚠️</b><strong>${warnings}</strong><small>Hinweise</small></div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section-head">
          <div><p class="eyebrow">Jetzt wichtig</p><h2>Offene Einnahmen</h2></div>
          <button class="chip-button" data-route-inline="intakes">Protokoll</button>
        </div>
        <div class="cards">
          ${open.map(i => IntakesModule.cardHtml(i, meds.find(m=>m.id===i.medicationId))).join("")}
        </div>
        ${open.length ? "" : `<div class="empty-state"><h3>✅ Alles erledigt</h3><p>Alle heutigen Einnahmen wurden bestätigt.</p></div>`}
      </section>

      <section class="section emergency-grid">
        <button class="menu-item" data-route-inline="calendar"><span>📅 Nächster Termin</span><span>›</span></button>
        <button class="menu-item" data-route-inline="emergency"><span>🆘 Notfall</span><span>›</span></button>
      </section>`;

    this.bind();
  },
  bind() {
    document.querySelectorAll("[data-intake-id]").forEach(btn => {
      btn.addEventListener("click", () => IntakesModule.confirm(btn.dataset.intakeId));
    });
    document.querySelectorAll("[data-route-inline]").forEach(btn => {
      btn.addEventListener("click", () => Router.go(btn.dataset.routeInline));
    });
    const reset = document.querySelector("[data-action='reset-day']");
    if (reset) reset.addEventListener("click", () => {
      if (confirm("Heutige Einnahmen zurücksetzen?")) {
        DataStore.resetToday(); Router.refresh(); UI.toast("Heutige Testdaten wurden zurückgesetzt.");
      }
    });
  }
};
