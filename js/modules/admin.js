
const AdminModule = {
  pinBuffer:"",
  unlocked:false,
  activeTab:"medications",

  renderLogin() {
    this.pinBuffer = "";
    document.getElementById("view-admin-login").innerHTML = `
      <div class="page-card">
        <div class="page-title"><h2>Admin-Bereich</h2><button class="secondary-button" data-route-inline="more">← Zurück</button></div>
        <div class="empty-state">
          <h3>🔒 PIN eingeben</h3>
          <div id="pinDots" class="pin-dots">○ ○ ○ ○</div>
          <div class="pin-grid">
            ${[1,2,3,4,5,6,7,8,9,"←",0,"✓"].map(v=>`<button data-pin="${v}">${v}</button>`).join("")}
          </div>
          <p>Standard-PIN: 1234</p>
        </div>
      </div>`;
    document.querySelectorAll("[data-pin]").forEach(b=>b.addEventListener("click",()=>this.pinInput(b.dataset.pin)));
    document.querySelectorAll("[data-route-inline]").forEach(b=>b.addEventListener("click",()=>Router.go(b.dataset.routeInline)));
  },

  pinInput(value) {
    if (value === "←") this.pinBuffer = this.pinBuffer.slice(0,-1);
    else if (value === "✓") {
      const settings = DataStore.get("settings");
      if (this.pinBuffer === settings.adminPin) {
        this.unlocked = true; Router.go("admin"); UI.toast("Admin-Bereich geöffnet.");
      } else {
        this.pinBuffer = ""; UI.toast("PIN ist falsch.");
      }
    } else if (this.pinBuffer.length < 4) this.pinBuffer += value;
    const dots = document.getElementById("pinDots");
    if (dots) dots.textContent = Array.from({length:4},(_,i)=>i<this.pinBuffer.length?"●":"○").join(" ");
  },

  render() {
    if (!this.unlocked) { Router.go("admin-login"); return; }
    document.getElementById("view-admin").innerHTML = `
      <div class="page-card">
        <div class="page-title"><h2>Admin-Dashboard</h2><button class="secondary-button" data-lock>Abmelden</button></div>
        <div class="admin-tabs">
          <button class="admin-tab ${this.activeTab==="medications"?"active":""}" data-tab="medications">Medikamente</button>
          <button class="admin-tab ${this.activeTab==="person"?"active":""}" data-tab="person">Person</button>
          <button class="admin-tab ${this.activeTab==="imports"?"active":""}" data-tab="imports">Import</button>
        </div>
        <div id="adminContent"></div>
      </div>`;
    document.querySelector("[data-lock]").addEventListener("click",()=>{this.unlocked=false;Router.go("more");});
    document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>{this.activeTab=b.dataset.tab;this.render();}));
    this.renderTab();
  },

  renderTab() {
    if (this.activeTab === "medications") this.renderMedications();
    if (this.activeTab === "person") this.renderPerson();
    if (this.activeTab === "imports") document.getElementById("adminContent").innerHTML = `
      <div class="empty-state"><h3>Import & Freigabe</h3><p>Erkannte Medikamente werden vor der Übernahme geprüft.</p><button class="primary-button" data-open-import>Import öffnen</button></div>`;
    const openImport = document.querySelector("[data-open-import]");
    if (openImport) openImport.addEventListener("click",()=>Router.go("import"));
  },

  renderMedications() {
    const meds = DataStore.get("medications");
    document.getElementById("adminContent").innerHTML = `
      <div class="form-actions"><button class="primary-button" data-add-med>+ Medikament</button></div>
      <div class="list section">
        ${meds.map(m=>`<article class="list-card">
          <div class="list-visual">${UI.pill(m)}</div>
          <div><h3>${UI.escape(m.name)} ${UI.escape(m.strength)}</h3><p>${UI.escape(m.dosage)} · ${UI.escape(m.time)} · Bestand ${m.stock}</p></div>
          <div><button class="chip-button" data-edit-med="${m.id}">Bearbeiten</button> <button class="danger-button" data-delete-med="${m.id}">Löschen</button></div>
        </article>`).join("")}
      </div>`;
    document.querySelector("[data-add-med]").addEventListener("click",()=>this.openMedicationForm());
    document.querySelectorAll("[data-edit-med]").forEach(b=>b.addEventListener("click",()=>this.openMedicationForm(b.dataset.editMed)));
    document.querySelectorAll("[data-delete-med]").forEach(b=>b.addEventListener("click",()=>this.deleteMedication(b.dataset.deleteMed)));
  },

  openMedicationForm(id=null) {
    const meds = DataStore.get("medications");
    const med = id ? meds.find(m=>m.id===id) : {name:"",strength:"",form:"Tablette",dosage:"1-0-0",time:"08:00",amount:1,unit:"Tablette",stock:0,minStock:10,expiry:"",pill:"white",active:true};
    UI.modal(`<h2>${id?"Medikament bearbeiten":"Medikament hinzufügen"}</h2>
      <form id="medForm" class="form-grid">
        <div class="form-grid two">
          <div class="form-field"><label>Name</label><input name="name" required value="${UI.escape(med.name)}"></div>
          <div class="form-field"><label>Stärke</label><input name="strength" required value="${UI.escape(med.strength)}"></div>
        </div>
        <div class="form-grid two">
          <div class="form-field"><label>Dosierung</label><input name="dosage" required value="${UI.escape(med.dosage)}"></div>
          <div class="form-field"><label>Uhrzeit</label><input type="time" name="time" required value="${UI.escape(med.time)}"></div>
        </div>
        <div class="form-grid two">
          <div class="form-field"><label>Menge</label><input type="number" min="0.1" step="0.1" name="amount" required value="${med.amount}"></div>
          <div class="form-field"><label>Einheit</label><input name="unit" required value="${UI.escape(med.unit)}"></div>
        </div>
        <div class="form-grid two">
          <div class="form-field"><label>Bestand</label><input type="number" min="0" name="stock" required value="${med.stock}"></div>
          <div class="form-field"><label>Mindestbestand</label><input type="number" min="0" name="minStock" required value="${med.minStock}"></div>
        </div>
        <div class="form-field"><label>Ablaufdatum</label><input type="date" name="expiry" value="${UI.escape(med.expiry||"")}"></div>
        <div class="form-field"><label>Darstellung</label><select name="pill">
          ${["white","pink","yellow","blue"].map(p=>`<option ${p===med.pill?"selected":""}>${p}</option>`).join("")}
        </select></div>
        <div class="form-actions"><button type="button" class="secondary-button" data-close>Abbrechen</button><button class="primary-button">Änderung prüfen</button></div>
      </form>`);
    document.querySelector("[data-close]").addEventListener("click",UI.closeModal);
    document.getElementById("medForm").addEventListener("submit",e=>{
      e.preventDefault();
      const f = new FormData(e.currentTarget);
      const updated = {...med,
        id:id || `med_${Date.now()}`,
        name:f.get("name"),strength:f.get("strength"),dosage:f.get("dosage"),time:f.get("time"),
        amount:Number(f.get("amount")),unit:f.get("unit"),stock:Number(f.get("stock")),
        minStock:Number(f.get("minStock")),expiry:f.get("expiry"),pill:f.get("pill"),active:true
      };
      this.confirmMedication(updated, !!id);
    });
  },

  confirmMedication(updated, editing) {
    UI.modal(`<h2>Änderung bestätigen</h2>
      <div class="notice">Bitte Name, Stärke, Dosierung und Uhrzeit sorgfältig prüfen.</div>
      <div class="list-card"><div class="list-visual">${UI.pill(updated)}</div><div>
        <h3>${UI.escape(updated.name)} ${UI.escape(updated.strength)}</h3>
        <p>Dosierung: ${UI.escape(updated.dosage)} · Uhrzeit: ${UI.escape(updated.time)} · Menge: ${updated.amount} ${UI.escape(updated.unit)}</p>
      </div></div>
      <div class="form-actions section"><button class="secondary-button" data-cancel>Abbrechen</button><button class="primary-button" data-confirm>Übernehmen</button></div>`);
    document.querySelector("[data-cancel]").addEventListener("click",UI.closeModal);
    document.querySelector("[data-confirm]").addEventListener("click",()=>{
      let meds = DataStore.get("medications");
      if (editing) meds = meds.map(m=>m.id===updated.id?updated:m); else meds.push(updated);
      DataStore.set("medications",meds);
      DataStore.resetToday();
      UI.closeModal(); this.render(); UI.toast("Medikament gespeichert.");
    });
  },

  deleteMedication(id) {
    if (!confirm("Medikament wirklich löschen?")) return;
    DataStore.set("medications",DataStore.get("medications").filter(m=>m.id!==id));
    DataStore.resetToday(); this.render(); UI.toast("Medikament gelöscht.");
  },

  renderPerson() {
    const person = DataStore.get("person");
    const contacts = Array.isArray(person.emergencyContacts)
      ? person.emergencyContacts.slice(0, 2)
      : [];

    while (contacts.length < 2) {
      contacts.push({
        id: `contact_${contacts.length + 1}`,
        firstName: "",
        lastName: "",
        phone: "",
        relationship: ""
      });
    }

    const doctor = person.doctor || {
      id: "doctor_1",
      firstName: "",
      lastName: "",
      phone: "",
      practice: "",
      address: ""
    };

    document.getElementById("adminContent").innerHTML = `
      <form id="personForm" class="form-grid">
        <section class="admin-form-section">
          <h3>Betreute Person</h3>

          <div class="form-grid two">
            <div class="form-field">
              <label>Vorname</label>
              <input name="firstName" required value="${UI.escape(person.firstName || "")}">
            </div>

            <div class="form-field">
              <label>Nachname</label>
              <input name="lastName" value="${UI.escape(person.lastName || "")}">
            </div>
          </div>

          <div class="form-grid two">
            <div class="form-field">
              <label>Geburtsdatum</label>
              <input type="date" name="birthDate" value="${UI.escape(person.birthDate || "")}">
            </div>

            <div class="form-field">
              <label>Geschlecht</label>
              <select name="gender">
                <option value="">Keine Angabe</option>
                <option value="female" ${person.gender === "female" ? "selected" : ""}>Weiblich</option>
                <option value="male" ${person.gender === "male" ? "selected" : ""}>Männlich</option>
                <option value="diverse" ${person.gender === "diverse" ? "selected" : ""}>Divers</option>
              </select>
            </div>
          </div>

          <div class="form-grid two">
            <div class="form-field">
              <label>Blutgruppe</label>
              <select name="bloodGroup">
                <option value="">Nicht hinterlegt</option>
                ${["0+","0-","A+","A-","B+","B-","AB+","AB-"].map(value =>
                  `<option value="${value}" ${person.bloodGroup === value ? "selected" : ""}>${value}</option>`
                ).join("")}
              </select>
            </div>

            <div class="form-field">
              <label>Größe in cm</label>
              <input type="number" min="0" max="250" name="heightCm" value="${UI.escape(person.heightCm || "")}">
            </div>
          </div>

          <div class="form-field">
            <label>Gewicht in kg</label>
            <input type="number" min="0" max="500" step="0.1" name="weightKg" value="${UI.escape(person.weightKg || "")}">
          </div>
        </section>

        <section class="admin-form-section">
          <h3>Notfallkontakt 1</h3>
          <div class="form-grid two">
            <div class="form-field"><label>Vorname</label><input name="contact1FirstName" value="${UI.escape(contacts[0].firstName)}"></div>
            <div class="form-field"><label>Nachname</label><input name="contact1LastName" value="${UI.escape(contacts[0].lastName)}"></div>
          </div>
          <div class="form-grid two">
            <div class="form-field"><label>Telefonnummer</label><input type="tel" name="contact1Phone" value="${UI.escape(contacts[0].phone)}"></div>
            <div class="form-field"><label>Beziehung</label><input name="contact1Relationship" value="${UI.escape(contacts[0].relationship)}"></div>
          </div>
        </section>

        <section class="admin-form-section">
          <h3>Notfallkontakt 2</h3>
          <div class="form-grid two">
            <div class="form-field"><label>Vorname</label><input name="contact2FirstName" value="${UI.escape(contacts[1].firstName)}"></div>
            <div class="form-field"><label>Nachname</label><input name="contact2LastName" value="${UI.escape(contacts[1].lastName)}"></div>
          </div>
          <div class="form-grid two">
            <div class="form-field"><label>Telefonnummer</label><input type="tel" name="contact2Phone" value="${UI.escape(contacts[1].phone)}"></div>
            <div class="form-field"><label>Beziehung</label><input name="contact2Relationship" value="${UI.escape(contacts[1].relationship)}"></div>
          </div>
        </section>

        <section class="admin-form-section">
          <h3>Hausarzt</h3>
          <div class="form-grid two">
            <div class="form-field"><label>Vorname</label><input name="doctorFirstName" value="${UI.escape(doctor.firstName)}"></div>
            <div class="form-field"><label>Nachname</label><input name="doctorLastName" value="${UI.escape(doctor.lastName)}"></div>
          </div>
          <div class="form-grid two">
            <div class="form-field"><label>Telefonnummer</label><input type="tel" name="doctorPhone" value="${UI.escape(doctor.phone)}"></div>
            <div class="form-field"><label>Praxisname</label><input name="doctorPractice" value="${UI.escape(doctor.practice)}"></div>
          </div>
          <div class="form-field"><label>Adresse</label><input name="doctorAddress" value="${UI.escape(doctor.address)}"></div>
        </section>

        <div class="form-field">
          <label>Allergien</label>
          <textarea name="allergies">${UI.escape(person.allergies || "")}</textarea>
        </div>

        <div class="form-field">
          <label>Krankenkasse</label>
          <input name="insurance" value="${UI.escape(person.insurance || "")}">
        </div>

        <div class="form-actions">
          <button class="primary-button">Personendaten speichern</button>
        </div>
      </form>`;

    document.getElementById("personForm").addEventListener("submit", event => {
      event.preventDefault();

      const form = new FormData(event.currentTarget);
      const firstName = String(form.get("firstName") || "").trim();
      const lastName = String(form.get("lastName") || "").trim();

      if (!firstName) {
        UI.toast("Bitte einen Vornamen eintragen.");
        return;
      }

      const updatedPerson = {
        ...person,
        firstName,
        lastName,
        displayName: [firstName, lastName].filter(Boolean).join(" "),
        birthDate: String(form.get("birthDate") || ""),
        gender: String(form.get("gender") || ""),
        bloodGroup: String(form.get("bloodGroup") || ""),
        heightCm: String(form.get("heightCm") || ""),
        weightKg: String(form.get("weightKg") || ""),
        allergies: String(form.get("allergies") || "").trim(),
        insurance: String(form.get("insurance") || "").trim(),
        emergencyContacts: [
          {
            id: contacts[0].id || "contact_1",
            firstName: String(form.get("contact1FirstName") || "").trim(),
            lastName: String(form.get("contact1LastName") || "").trim(),
            phone: String(form.get("contact1Phone") || "").trim(),
            relationship: String(form.get("contact1Relationship") || "").trim()
          },
          {
            id: contacts[1].id || "contact_2",
            firstName: String(form.get("contact2FirstName") || "").trim(),
            lastName: String(form.get("contact2LastName") || "").trim(),
            phone: String(form.get("contact2Phone") || "").trim(),
            relationship: String(form.get("contact2Relationship") || "").trim()
          }
        ],
        doctor: {
          id: doctor.id || "doctor_1",
          firstName: String(form.get("doctorFirstName") || "").trim(),
          lastName: String(form.get("doctorLastName") || "").trim(),
          phone: String(form.get("doctorPhone") || "").trim(),
          practice: String(form.get("doctorPractice") || "").trim(),
          address: String(form.get("doctorAddress") || "").trim()
        }
      };

      DataStore.set("person", updatedPerson);

      const title = document.getElementById("pageTitle");
      if (title) {
        title.textContent = App.getGreeting(updatedPerson.firstName);
      }

      UI.toast("Personendaten wurden gespeichert.");
    });
  }
};
