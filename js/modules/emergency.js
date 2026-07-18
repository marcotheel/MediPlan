
const EmergencyModule = {
  contactHtml(contact, number) {
    const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(" ");
    const phone = String(contact.phone || "").trim();

    return `<article class="emergency-card emergency-contact-card">
      <h3>☎️ Kontakt ${number}</h3>
      <dl class="contact-details">
        <div><dt>Vorname</dt><dd>${UI.escape(contact.firstName || "Nicht hinterlegt")}</dd></div>
        <div><dt>Nachname</dt><dd>${UI.escape(contact.lastName || "Nicht hinterlegt")}</dd></div>
        <div><dt>Telefon</dt><dd>
          ${phone
            ? `<a class="phone-link" href="tel:${UI.escape(phone.replace(/[^+0-9]/g,""))}">${UI.escape(phone)}</a>`
            : "Nicht hinterlegt"}
        </dd></div>
      </dl>
      ${phone
        ? `<a class="primary-button emergency-call-button" href="tel:${UI.escape(phone.replace(/[^+0-9]/g,""))}">Jetzt anrufen</a>`
        : ""}
    </article>`;
  },

  doctorHtml(doctor, number) {
    const phone = String(doctor.phone || "").trim();

    return `<article class="emergency-card emergency-contact-card">
      <h3>👨‍⚕️ Hausarzt ${number}</h3>
      <dl class="contact-details">
        <div><dt>Vorname</dt><dd>${UI.escape(doctor.firstName || "Nicht hinterlegt")}</dd></div>
        <div><dt>Nachname</dt><dd>${UI.escape(doctor.lastName || "Nicht hinterlegt")}</dd></div>
        <div><dt>Telefon</dt><dd>
          ${phone
            ? `<a class="phone-link" href="tel:${UI.escape(phone.replace(/[^+0-9]/g,""))}">${UI.escape(phone)}</a>`
            : "Nicht hinterlegt"}
        </dd></div>
      </dl>
      ${phone
        ? `<a class="primary-button emergency-call-button" href="tel:${UI.escape(phone.replace(/[^+0-9]/g,""))}">Praxis anrufen</a>`
        : ""}
    </article>`;
  },

  render() {
    const person = DataStore.get("person");
    const meds = DataStore.get("medications").filter(med => med.active);
    const contacts = Array.isArray(person.emergencyContacts)
      ? person.emergencyContacts.slice(0,2)
      : [];
    const doctors = Array.isArray(person.doctors)
      ? person.doctors.slice(0,2)
      : [];

    while (contacts.length < 2) {
      contacts.push({firstName:"", lastName:"", phone:""});
    }
    while (doctors.length < 2) {
      doctors.push({firstName:"", lastName:"", phone:""});
    }

    document.getElementById("view-emergency").innerHTML = `
      <div class="page-card">
        <div class="page-title">
          <h2>Notfall</h2>
          <button class="secondary-button" data-route-inline="more">← Zurück</button>
        </div>

        <div class="notice">
          Diese Angaben dienen als schnelle Übersicht. Bei einem akuten medizinischen
          Notfall den örtlichen Notruf wählen.
        </div>

        <section class="section">
          <p class="eyebrow">Kontakte</p>
          <div class="emergency-grid">
            ${contacts.map((contact,index) => this.contactHtml(contact,index+1)).join("")}
          </div>
        </section>

        <section class="section">
          <p class="eyebrow">Hausärzte</p>
          <div class="emergency-grid">
            ${doctors.map((doctor,index) => this.doctorHtml(doctor,index+1)).join("")}
          </div>
        </section>

        <section class="section">
          <p class="eyebrow">Medizinische Informationen</p>
          <div class="emergency-grid">
            <article class="emergency-card">
              <h3>💊 Medikamente</h3>
              <p>${meds.map(med =>
                `${UI.escape(med.name)} ${UI.escape(med.strength)} · ${UI.escape(med.dosage)}`
              ).join("<br>")}</p>
            </article>

            <article class="emergency-card">
              <h3>⚠️ Allergien</h3>
              <p>${UI.escape(person.allergies)}</p>
            </article>

            <article class="emergency-card">
              <h3>🏥 Krankenkasse</h3>
              <p>${UI.escape(person.insurance)}</p>
            </article>
          </div>
        </section>
      </div>`;

    document.querySelectorAll("[data-route-inline]").forEach(button => {
      button.addEventListener("click", () => Router.go(button.dataset.routeInline));
    });
  }
};
