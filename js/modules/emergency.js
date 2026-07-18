
const EmergencyModule = {
  phoneHref(phone) {
    return String(phone || "").replace(/[^+0-9]/g, "");
  },

  contactHtml(contact, number) {
    const phone = String(contact.phone || "").trim();

    return `<article class="emergency-card emergency-contact-card">
      <h3>☎️ Notfallkontakt ${number}</h3>
      <dl class="contact-details">
        <div><dt>Vorname</dt><dd>${UI.escape(contact.firstName || "Nicht hinterlegt")}</dd></div>
        <div><dt>Nachname</dt><dd>${UI.escape(contact.lastName || "Nicht hinterlegt")}</dd></div>
        <div><dt>Beziehung</dt><dd>${UI.escape(contact.relationship || "Nicht hinterlegt")}</dd></div>
        <div><dt>Telefon</dt><dd>
          ${phone
            ? `<a class="phone-link" href="tel:${UI.escape(this.phoneHref(phone))}">${UI.escape(phone)}</a>`
            : "Nicht hinterlegt"}
        </dd></div>
      </dl>
      ${phone
        ? `<a class="primary-button emergency-call-button" href="tel:${UI.escape(this.phoneHref(phone))}">Kontakt anrufen</a>`
        : ""}
    </article>`;
  },

  doctorHtml(doctor) {
    const phone = String(doctor.phone || "").trim();

    return `<article class="emergency-card emergency-contact-card">
      <h3>👨‍⚕️ Hausarzt</h3>
      <dl class="contact-details">
        <div><dt>Vorname</dt><dd>${UI.escape(doctor.firstName || "Nicht hinterlegt")}</dd></div>
        <div><dt>Nachname</dt><dd>${UI.escape(doctor.lastName || "Nicht hinterlegt")}</dd></div>
        <div><dt>Praxis</dt><dd>${UI.escape(doctor.practice || "Nicht hinterlegt")}</dd></div>
        <div><dt>Adresse</dt><dd>${UI.escape(doctor.address || "Nicht hinterlegt")}</dd></div>
        <div><dt>Telefon</dt><dd>
          ${phone
            ? `<a class="phone-link" href="tel:${UI.escape(this.phoneHref(phone))}">${UI.escape(phone)}</a>`
            : "Nicht hinterlegt"}
        </dd></div>
      </dl>
      ${phone
        ? `<a class="primary-button emergency-call-button" href="tel:${UI.escape(this.phoneHref(phone))}">Praxis anrufen</a>`
        : ""}
    </article>`;
  },

  render() {
    const person = DataStore.get("person");
    const meds = DataStore.get("medications").filter(med => med.active);
    const contacts = Array.isArray(person.emergencyContacts)
      ? person.emergencyContacts.slice(0,2)
      : [];

    while (contacts.length < 2) {
      contacts.push({
        firstName:"",
        lastName:"",
        phone:"",
        relationship:""
      });
    }

    const doctor = person.doctor || {
      firstName:"",
      lastName:"",
      phone:"",
      practice:"",
      address:""
    };

    const contact1Phone = String(contacts[0].phone || "").trim();
    const doctorPhone = String(doctor.phone || "").trim();

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

        <section class="emergency-quick-actions">
          <a class="emergency-quick-button emergency-quick-button--red" href="tel:112">
            <strong>112</strong>
            <span>Notruf</span>
          </a>

          ${doctorPhone
            ? `<a class="emergency-quick-button emergency-quick-button--blue"
                 href="tel:${UI.escape(this.phoneHref(doctorPhone))}">
                 <strong>Hausarzt</strong><span>Praxis anrufen</span>
               </a>`
            : `<div class="emergency-quick-button emergency-quick-button--disabled">
                 <strong>Hausarzt</strong><span>Keine Nummer hinterlegt</span>
               </div>`}

          ${contact1Phone
            ? `<a class="emergency-quick-button emergency-quick-button--orange"
                 href="tel:${UI.escape(this.phoneHref(contact1Phone))}">
                 <strong>Kontakt 1</strong><span>Direkt anrufen</span>
               </a>`
            : `<div class="emergency-quick-button emergency-quick-button--disabled">
                 <strong>Kontakt 1</strong><span>Keine Nummer hinterlegt</span>
               </div>`}
        </section>

        <section class="section">
          <p class="eyebrow">Betreute Person</p>
          <div class="emergency-grid">
            <article class="emergency-card">
              <h3>👤 Persönliche Daten</h3>
              <dl class="contact-details">
                <div><dt>Vorname</dt><dd>${UI.escape(person.firstName || "Nicht hinterlegt")}</dd></div>
                <div><dt>Nachname</dt><dd>${UI.escape(person.lastName || "Nicht hinterlegt")}</dd></div>
                <div><dt>Geburtsdatum</dt><dd>${person.birthDate ? new Date(`${person.birthDate}T00:00:00`).toLocaleDateString("de-DE") : "Nicht hinterlegt"}</dd></div>
                <div><dt>Blutgruppe</dt><dd>${UI.escape(person.bloodGroup || "Nicht hinterlegt")}</dd></div>
                <div><dt>Größe</dt><dd>${person.heightCm ? `${UI.escape(person.heightCm)} cm` : "Nicht hinterlegt"}</dd></div>
                <div><dt>Gewicht</dt><dd>${person.weightKg ? `${UI.escape(person.weightKg)} kg` : "Nicht hinterlegt"}</dd></div>
              </dl>
            </article>
          </div>
        </section>

        <section class="section">
          <p class="eyebrow">Notfallkontakte</p>
          <div class="emergency-grid">
            ${contacts.map((contact,index) => this.contactHtml(contact,index+1)).join("")}
          </div>
        </section>

        <section class="section">
          <p class="eyebrow">Hausarzt</p>
          <div class="emergency-grid emergency-grid--single">
            ${this.doctorHtml(doctor)}
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
