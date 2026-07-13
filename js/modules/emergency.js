
const EmergencyModule = {
  render() {
    const person = DataStore.get("person");
    const meds = DataStore.get("medications").filter(m=>m.active);
    document.getElementById("view-emergency").innerHTML = `
      <div class="page-card">
        <div class="page-title"><h2>Notfall</h2><button class="secondary-button" data-route-inline="more">← Zurück</button></div>
        <div class="notice">Diese Angaben dienen nur als Übersicht. Bei einem medizinischen Notfall den örtlichen Notruf wählen.</div>
        <div class="emergency-grid">
          <article class="emergency-card"><h3>💊 Medikamente</h3><p>${meds.map(m=>`${UI.escape(m.name)} ${UI.escape(m.strength)} · ${UI.escape(m.dosage)}`).join("<br>")}</p></article>
          <article class="emergency-card"><h3>⚠️ Allergien</h3><p>${UI.escape(person.allergies)}</p></article>
          <article class="emergency-card"><h3>☎️ Notfallkontakt</h3><p>${UI.escape(person.emergencyContact)}</p></article>
          <article class="emergency-card"><h3>👨‍⚕️ Hausarzt</h3><p>${UI.escape(person.doctor)}</p></article>
          <article class="emergency-card"><h3>🏥 Krankenkasse</h3><p>${UI.escape(person.insurance)}</p></article>
        </div>
      </div>`;
    document.querySelectorAll("[data-route-inline]").forEach(b=>b.addEventListener("click",()=>Router.go(b.dataset.routeInline)));
  }
};
