
const DashboardModule = {
  render() {
    const meds = DataStore.get("medications");
    const intakes = DataStore.getTodayIntakes();
    const events = DataStore.get("events");

    const open = intakes.filter(item => item.status === "open")
      .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    const done = intakes.length - open.length;
    const percent = intakes.length ? Math.round(done / intakes.length * 100) : 100;
    const todayEvents = events
      .filter(event => event.date === DataStore.today())
      .sort((a,b) => a.time.localeCompare(b.time));

    const lowStock = meds
      .filter(med => med.stock <= Math.max(med.minStock, 12))
      .sort((a,b) => a.stock - b.stock);

    const next = open[0];
    const nextMed = next ? meds.find(med => med.id === next.medicationId) : null;
    const warningCount = meds.filter(med => med.stock <= med.minStock).length;

    document.getElementById("view-dashboard").innerHTML = `
      <section class="dashboard-overview mds-enter">
        <article class="dashboard-next">
          <div class="dashboard-next-copy">
            <div class="dashboard-next-label">
              ${Components.icon("calendar")}
              <span>Nächste Einnahme</span>
            </div>
            <strong class="dashboard-next-time">${next ? next.scheduledTime : "✓"}</strong>
            <h2 class="dashboard-next-med">
              ${nextMed ? `${UI.escape(nextMed.name)} ${UI.escape(nextMed.strength)}` : "Für heute erledigt"}
            </h2>
            <p class="dashboard-next-dose">
              ${nextMed ? `${next.amount} ${UI.escape(nextMed.unit)}` : "Keine Einnahme mehr offen"}
            </p>
            ${next ? `<button class="primary-button" data-intake-id="${next.id}">Jetzt einnehmen ✓</button>` : ""}
          </div>
          <div class="dashboard-next-visual">
            ${nextMed ? UI.pill(nextMed) : "✅"}
          </div>
        </article>

        <article class="dashboard-stat">
          ${Components.icon("calendar")}
          <strong>${todayEvents.length}</strong>
          <p>Termine heute</p>
        </article>

        <article class="dashboard-stat">
          ${Components.icon("heart")}
          <strong>${done} / ${intakes.length}</strong>
          <p>Einnahmen erledigt</p>
        </article>

        <article class="dashboard-stat">
          ${Components.icon("menu")}
          <strong>${warningCount}</strong>
          <p>Hinweise offen</p>
        </article>

        <article class="dashboard-stat">
          ${Components.icon("box")}
          <strong>${lowStock.length}</strong>
          <p>Bestände niedrig</p>
        </article>
      </section>

      <section class="dashboard-grid mds-enter">
        <article class="dashboard-panel">
          <div class="dashboard-panel-head">
            <div class="dashboard-panel-title">
              ${Components.icon("pill")}
              <h2>Offene Einnahmen</h2>
            </div>
            <button class="chip-button" data-route-inline="intakes">Alle anzeigen</button>
          </div>

          ${open.length ? open.slice(0,3).map(intake => {
            const med = meds.find(item => item.id === intake.medicationId);
            return `<div class="dashboard-row">
              <div class="dashboard-row-time">${intake.scheduledTime}</div>
              <div>
                <h3>${UI.escape(med.name)} ${UI.escape(med.strength)}</h3>
                <p>${intake.amount} ${UI.escape(med.unit)}</p>
              </div>
              ${Components.badge("Geplant","info")}
            </div>`;
          }).join("") : Components.emptyState("Alles erledigt","Für heute sind keine Einnahmen mehr offen.")}

          <div class="progress-wrap">
            <div class="progress-head">
              <span>${done} von ${intakes.length} Einnahmen erledigt</span>
              <strong>${percent} %</strong>
            </div>
            <div class="progress-track"><div class="progress-bar" style="width:${percent}%"></div></div>
          </div>
        </article>

        <article class="dashboard-panel">
          <div class="dashboard-panel-head">
            <div class="dashboard-panel-title">
              ${Components.icon("calendar")}
              <h2>Heute – Termine</h2>
            </div>
            <button class="chip-button" data-route-inline="calendar">Alle anzeigen</button>
          </div>

          ${todayEvents.length ? todayEvents.slice(0,3).map(event => `
            <div class="dashboard-row">
              <div class="dashboard-row-time">${event.time}</div>
              <div>
                <h3>${UI.escape(event.title)}</h3>
                <p>${UI.escape(event.location || "")}</p>
              </div>
              <span>›</span>
            </div>`).join("") : Components.emptyState("Keine Termine","Für heute sind keine Termine eingetragen.")}
        </article>

        <article class="dashboard-panel">
          <div class="dashboard-panel-head">
            <div class="dashboard-panel-title">
              ${Components.icon("box")}
              <h2>Bestand – Niedrig</h2>
            </div>
            <button class="chip-button" data-route-inline="cabinet">Alle anzeigen</button>
          </div>

          ${lowStock.length ? lowStock.slice(0,4).map(med => `
            <div class="dashboard-row">
              <div class="list-visual">${UI.pill(med)}</div>
              <div>
                <h3>${UI.escape(med.name)} ${UI.escape(med.strength)}</h3>
                <p>${UI.escape(med.form || med.unit)}</p>
              </div>
              <div class="stock-number ${med.stock <= med.minStock ? "danger" : "warning"}">${med.stock}</div>
            </div>`).join("") : Components.emptyState("Bestand ausreichend","Aktuell ist keine Nachbestellung notwendig.")}
        </article>
      </section>`;

    this.bind();
  },

  bind() {
    document.querySelectorAll("[data-intake-id]").forEach(button => {
      button.addEventListener("click", () => IntakesModule.confirm(button.dataset.intakeId));
    });

    document.querySelectorAll("[data-route-inline]").forEach(button => {
      button.addEventListener("click", () => Router.go(button.dataset.routeInline));
    });
  }
};
