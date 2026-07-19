
const DocumentsModule = {
  items: [],
  searchTerm: "",
  categoryFilter: "all",

  typeLabels: {
    doctor_report: "Arztbericht",
    prescription: "Rezept",
    referral: "Überweisung",
    laboratory: "Laborwerte",
    imaging: "MRT / CT / Röntgen",
    ekg: "EKG",
    vaccination: "Impfungen",
    hospital: "Krankenhaus",
    discharge: "Entlassbrief",
    other: "Sonstiges"
  },

  typeIcons: {
    doctor_report: "📄",
    prescription: "💊",
    referral: "🩺",
    laboratory: "🧪",
    imaging: "🩻",
    ekg: "❤️",
    vaccination: "💉",
    hospital: "🏥",
    discharge: "🏨",
    other: "📁"
  },

  async render() {
    const view = document.getElementById("view-documents");

    view.innerHTML = `
      <div class="page-card document-center">
        <div class="page-title">
          <div>
            <p class="eyebrow">Dokumenten-Center</p>
            <h2>Dokumente & Arztberichte</h2>
          </div>
          <button class="secondary-button" data-route-inline="more">← Zurück</button>
        </div>

        <div class="notice">
          Dokumente werden lokal auf diesem Gerät gespeichert. OCR ist vorbereitet
          und wird in der nächsten Version automatisch ausgeführt.
        </div>

        <section class="document-toolbar">
          <input id="documentSearch" class="document-search" type="search"
            placeholder="Dokumente, Arzt oder Notiz durchsuchen …"
            value="${UI.escape(this.searchTerm)}">

          <select id="documentCategoryFilter" class="document-filter">
            <option value="all">Alle Kategorien</option>
            ${Object.entries(this.typeLabels).map(([value,label]) =>
              `<option value="${value}" ${this.categoryFilter===value?"selected":""}>${UI.escape(label)}</option>`
            ).join("")}
          </select>

          <button class="primary-button" data-add-document>📷 Fotografieren</button>
          <button class="secondary-button" data-select-document>🖼️ Bild auswählen</button>
        </section>

        <input id="documentCameraInput" class="hidden" type="file" accept="image/*" capture="environment">
        <input id="documentFileInput" class="hidden" type="file" accept="image/*" multiple>

        <section class="document-stats">
          <article><strong id="documentCount">0</strong><span>Dokumente</span></article>
          <article><strong id="documentYearCount">0</strong><span>Jahre</span></article>
          <article><strong id="documentCategoryCount">0</strong><span>Kategorien</span></article>
        </section>

        <section class="section">
          <div id="documentArchive" class="document-archive">
            <div class="empty-state"><h3>Dokumente werden geladen …</h3></div>
          </div>
        </section>
      </div>`;

    document.querySelectorAll("[data-route-inline]").forEach(button => {
      button.addEventListener("click", () => Router.go(button.dataset.routeInline));
    });

    document.querySelector("[data-add-document]").addEventListener("click", () => {
      document.getElementById("documentCameraInput").click();
    });

    document.querySelector("[data-select-document]").addEventListener("click", () => {
      document.getElementById("documentFileInput").click();
    });

    document.getElementById("documentCameraInput").addEventListener("change", event => {
      this.handleFiles(event.target.files);
      event.target.value = "";
    });

    document.getElementById("documentFileInput").addEventListener("change", event => {
      this.handleFiles(event.target.files);
      event.target.value = "";
    });

    document.getElementById("documentSearch").addEventListener("input", event => {
      this.searchTerm = event.target.value;
      this.renderArchive();
    });

    document.getElementById("documentCategoryFilter").addEventListener("change", event => {
      this.categoryFilter = event.target.value;
      this.renderArchive();
    });

    await this.refreshList();
  },

  async refreshList() {
    try {
      this.items = await DocumentStorage.getAll();
      this.renderArchive();
    } catch (error) {
      const archive = document.getElementById("documentArchive");
      if (archive) archive.innerHTML = `<div class="empty-state"><h3>Dokumente konnten nicht geladen werden</h3><p>${UI.escape(error.message)}</p></div>`;
    }
  },

  filteredItems() {
    const term = this.searchTerm.trim().toLowerCase();
    return this.items.filter(item => {
      const categoryOk = this.categoryFilter === "all" || item.type === this.categoryFilter;
      const text = [
        item.title, item.doctor, item.notes, item.ocrText, item.hospital,
        ...(item.keywords || [])
      ].join(" ").toLowerCase();
      return categoryOk && (!term || text.includes(term));
    });
  },

  renderArchive() {
    const archive = document.getElementById("documentArchive");
    if (!archive) return;

    const filtered = this.filteredItems();
    const years = [...new Set(this.items.map(item =>
      (item.documentDate || item.createdAt || "").slice(0,4)
    ).filter(Boolean))];
    const categories = [...new Set(this.items.map(item => item.type).filter(Boolean))];

    document.getElementById("documentCount").textContent = this.items.length;
    document.getElementById("documentYearCount").textContent = years.length;
    document.getElementById("documentCategoryCount").textContent = categories.length;

    if (!filtered.length) {
      archive.innerHTML = `<div class="empty-state"><h3>📄 Keine passenden Dokumente</h3><p>Suche oder Kategorie ändern oder ein neues Dokument erfassen.</p></div>`;
      return;
    }

    const grouped = filtered.reduce((groups,item) => {
      const year = (item.documentDate || item.createdAt || "Unbekannt").slice(0,4) || "Unbekannt";
      (groups[year] ||= []).push(item);
      return groups;
    }, {});

    archive.innerHTML = Object.keys(grouped).sort((a,b)=>b.localeCompare(a)).map(year => `
      <section class="document-year-group">
        <div class="document-year-head">
          <h3>${UI.escape(year)}</h3>
          <span>${grouped[year].length} Dokument${grouped[year].length===1?"":"e"}</span>
        </div>
        <div class="document-grid">
          ${grouped[year].map(item => this.cardHtml(item)).join("")}
        </div>
      </section>
    `).join("");

    document.querySelectorAll("[data-open-document]").forEach(button => {
      button.addEventListener("click", () => this.openDocument(button.dataset.openDocument));
    });
    document.querySelectorAll("[data-delete-document]").forEach(button => {
      button.addEventListener("click", () => this.deleteDocument(button.dataset.deleteDocument));
    });
  },

  cardHtml(item) {
    const date = item.documentDate
      ? new Date(`${item.documentDate}T00:00:00`).toLocaleDateString("de-DE")
      : "Ohne Datum";

    return `<article class="document-center-card">
      <button class="document-center-preview" data-open-document="${item.id}" aria-label="${UI.escape(item.title)} öffnen">
        <img src="${item.imageData}" alt="">
        <span class="document-type-icon">${this.typeIcons[item.type] || "📁"}</span>
      </button>

      <div class="document-center-content">
        <span class="mds-badge mds-badge--info">${UI.escape(this.typeLabels[item.type] || this.typeLabels.other)}</span>
        <h3>${UI.escape(item.title)}</h3>
        <p>${date}${item.doctor ? ` · ${UI.escape(item.doctor)}` : ""}</p>
        <div class="document-meta-row">
          <span>${item.ocrFinished ? "OCR abgeschlossen" : "OCR vorbereitet"}</span>
          ${item.personName ? `<span>${UI.escape(item.personName)}</span>` : ""}
        </div>
      </div>

      <div class="document-center-actions">
        <button class="chip-button" data-open-document="${item.id}">Öffnen</button>
        <button class="danger-button" data-delete-document="${item.id}">Löschen</button>
      </div>
    </article>`;
  },

  async handleFiles(fileList) {
    const files = [...(fileList || [])].filter(file =>
      String(file.type || "").startsWith("image/")
    );

    if (!files.length) {
      UI.toast("Bitte ein Bild auswählen.");
      return;
    }

    try {
      const imageData = await DocumentStorage.fileToDataUrl(files[0]);
      this.openMetadataForm({
        imageData,
        originalName: files[0].name || "Kameraaufnahme"
      });
    } catch {
      UI.toast("Das Bild konnte nicht gelesen werden.");
    }
  },

  openMetadataForm(draft) {
    const today = DataStore.today();

    UI.modal(`
      <h2>Dokument speichern</h2>
      <img class="document-form-preview" src="${draft.imageData}" alt="Vorschau des Dokuments">

      <form id="documentForm" class="form-grid">
        <div class="form-field">
          <label>Titel</label>
          <input name="title" required
            value="${UI.escape(draft.originalName.replace(/\.[^.]+$/,"").replaceAll("_"," "))}"
            placeholder="z. B. Arztbericht Kardiologie">
        </div>

        <div class="form-grid two">
          <div class="form-field">
            <label>Kategorie</label>
            <select name="type">
              ${Object.entries(this.typeLabels).map(([value,label]) =>
                `<option value="${value}">${UI.escape(label)}</option>`
              ).join("")}
            </select>
          </div>
          <div class="form-field">
            <label>Dokumentdatum</label>
            <input name="documentDate" type="date" value="${today}">
          </div>
        </div>

        <div class="form-grid two">
          <div class="form-field"><label>Arzt / Praxis</label><input name="doctor"></div>
          <div class="form-field"><label>Klinik / Einrichtung</label><input name="hospital"></div>
        </div>

        <div class="form-field">
          <label>Schlagwörter</label>
          <input name="keywords" placeholder="z. B. Herz, Kontrolle, Labor">
        </div>

        <div class="form-field">
          <label>Notiz</label>
          <textarea name="notes" rows="4"></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="secondary-button" data-close-document-form>Abbrechen</button>
          <button class="primary-button">Dokument speichern</button>
        </div>
      </form>`);

    document.querySelector("[data-close-document-form]").addEventListener("click", UI.closeModal);

    document.getElementById("documentForm").addEventListener("submit", async event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const activePerson = DataStore.get("person");

      const documentItem = {
        id: `document_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
        title: String(form.get("title") || "").trim(),
        type: String(form.get("type") || "other"),
        documentDate: String(form.get("documentDate") || ""),
        doctor: String(form.get("doctor") || "").trim(),
        hospital: String(form.get("hospital") || "").trim(),
        notes: String(form.get("notes") || "").trim(),
        keywords: String(form.get("keywords") || "").split(",").map(value => value.trim()).filter(Boolean),
        imageData: draft.imageData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        personId: activePerson.id,
        personName: activePerson.displayName ||
          [activePerson.firstName, activePerson.lastName].filter(Boolean).join(" "),
        ocrText: "",
        ocrFinished: false,
        ocrLanguage: "deu",
        extractedMedications: []
      };

      try {
        await DocumentStorage.save(documentItem);
        UI.closeModal();
        await this.refreshList();
        UI.toast("Dokument wurde gespeichert.");
      } catch {
        UI.toast("Dokument konnte nicht gespeichert werden.");
      }
    });
  },

  async openDocument(id) {
    const item = await DocumentStorage.get(id);
    if (!item) {
      UI.toast("Dokument wurde nicht gefunden.");
      return;
    }

    const date = item.documentDate
      ? new Date(`${item.documentDate}T00:00:00`).toLocaleDateString("de-DE")
      : "Ohne Datum";

    UI.modal(`
      <div class="document-detail-view">
        <div class="document-viewer-head">
          <div>
            <span class="mds-badge mds-badge--info">${UI.escape(this.typeLabels[item.type] || this.typeLabels.other)}</span>
            <h2>${UI.escape(item.title)}</h2>
            <p>${date}${item.doctor ? ` · ${UI.escape(item.doctor)}` : ""}${item.hospital ? ` · ${UI.escape(item.hospital)}` : ""}</p>
          </div>
          <button class="secondary-button" data-close-document-viewer>Schließen</button>
        </div>

        <img class="document-full-image" src="${item.imageData}" alt="${UI.escape(item.title)}">

        <section class="document-detail-section">
          <h3>Notizen</h3>
          <p>${item.notes ? UI.escape(item.notes) : "Keine Notiz hinterlegt."}</p>
        </section>

        <section class="document-detail-section">
          <h3>OCR-Text</h3>
          <div class="ocr-placeholder">
            ${item.ocrFinished
              ? `<p>${UI.escape(item.ocrText || "")}</p>`
              : `<p>Texterkennung ist vorbereitet und wird in v0.6.1 automatisch ausgeführt.</p>`}
          </div>
        </section>

        <section class="document-detail-section">
          <h3>Schlagwörter</h3>
          <div class="document-keywords">
            ${(item.keywords || []).length
              ? item.keywords.map(keyword => `<span class="mds-badge mds-badge--success">${UI.escape(keyword)}</span>`).join("")
              : "Keine Schlagwörter hinterlegt."}
          </div>
        </section>
      </div>`);

    document.querySelector("[data-close-document-viewer]").addEventListener("click", UI.closeModal);
  },

  async deleteDocument(id) {
    const item = await DocumentStorage.get(id);
    if (!item) return;
    if (!confirm(`Dokument „${item.title}“ wirklich löschen?`)) return;

    try {
      await DocumentStorage.delete(id);
      await this.refreshList();
      UI.toast("Dokument wurde gelöscht.");
    } catch {
      UI.toast("Dokument konnte nicht gelöscht werden.");
    }
  }
};
