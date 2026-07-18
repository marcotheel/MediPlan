
const DocumentsModule = {
  items: [],

  typeLabels: {
    doctor_report: "Arztbericht",
    discharge: "Entlassbrief",
    laboratory: "Laborbericht",
    prescription: "Rezept",
    imaging: "Röntgen / MRT / CT",
    vaccination: "Impfunterlage",
    other: "Sonstiges"
  },

  async render() {
    const view = document.getElementById("view-documents");

    view.innerHTML = `
      <div class="page-card">
        <div class="page-title">
          <h2>Dokumente & Arztberichte</h2>
          <button class="secondary-button" data-route-inline="more">← Zurück</button>
        </div>

        <div class="notice">
          Dokumente werden ausschließlich lokal auf diesem Gerät gespeichert.
          Es erfolgt kein automatischer Upload an einen Server.
        </div>

        <div class="document-actions">
          <button class="primary-button" data-add-document>
            📷 Dokument fotografieren
          </button>

          <button class="secondary-button" data-select-document>
            🖼️ Bild auswählen
          </button>
        </div>

        <input
          id="documentCameraInput"
          class="hidden"
          type="file"
          accept="image/*"
          capture="environment"
        >

        <input
          id="documentFileInput"
          class="hidden"
          type="file"
          accept="image/*"
          multiple
        >

        <section class="section">
          <div class="section-head">
            <div>
              <p class="eyebrow">Gespeicherte Unterlagen</p>
              <h2>Dokumentenübersicht</h2>
            </div>
            <span id="documentCount" class="mds-badge mds-badge--info">0 Dokumente</span>
          </div>

          <div id="documentList" class="document-list">
            <div class="empty-state">
              <h3>Dokumente werden geladen …</h3>
            </div>
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

    await this.refreshList();
  },

  async refreshList() {
    const list = document.getElementById("documentList");
    const count = document.getElementById("documentCount");

    if (!list || !count) return;

    try {
      this.items = await DocumentStorage.getAll();
      count.textContent = `${this.items.length} Dokument${this.items.length === 1 ? "" : "e"}`;

      if (!this.items.length) {
        list.innerHTML = `
          <div class="empty-state">
            <h3>📄 Noch keine Dokumente</h3>
            <p>Fotografiere einen Arztbericht oder wähle ein vorhandenes Bild aus.</p>
          </div>`;
        return;
      }

      list.innerHTML = this.items.map(item => this.cardHtml(item)).join("");

      document.querySelectorAll("[data-open-document]").forEach(button => {
        button.addEventListener("click", () => {
          this.openDocument(button.dataset.openDocument);
        });
      });

      document.querySelectorAll("[data-delete-document]").forEach(button => {
        button.addEventListener("click", () => {
          this.deleteDocument(button.dataset.deleteDocument);
        });
      });
    } catch (error) {
      list.innerHTML = `
        <div class="empty-state">
          <h3>Dokumente konnten nicht geladen werden</h3>
          <p>${UI.escape(error.message)}</p>
        </div>`;
    }
  },

  cardHtml(item) {
    const date = item.documentDate
      ? new Date(`${item.documentDate}T00:00:00`).toLocaleDateString("de-DE")
      : "Ohne Datum";

    return `<article class="document-card">
      <button
        class="document-preview-button"
        data-open-document="${item.id}"
        aria-label="${UI.escape(item.title)} öffnen"
      >
        <img
          class="document-thumbnail"
          src="${item.imageData}"
          alt=""
        >
      </button>

      <div class="document-card-content">
        <span class="mds-badge mds-badge--info">
          ${UI.escape(this.typeLabels[item.type] || this.typeLabels.other)}
        </span>

        <h3>${UI.escape(item.title)}</h3>

        <p>
          ${date}
          ${item.doctor ? ` · ${UI.escape(item.doctor)}` : ""}
        </p>

        ${item.notes
          ? `<p class="document-notes">${UI.escape(item.notes)}</p>`
          : ""}
      </div>

      <div class="document-card-actions">
        <button
          class="chip-button"
          data-open-document="${item.id}"
        >
          Öffnen
        </button>

        <button
          class="danger-button"
          data-delete-document="${item.id}"
        >
          Löschen
        </button>
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

    const firstFile = files[0];

    try {
      const imageData = await DocumentStorage.fileToDataUrl(firstFile);
      this.openMetadataForm({
        imageData,
        originalName: firstFile.name || "Kameraaufnahme"
      });
    } catch (error) {
      UI.toast("Das Bild konnte nicht gelesen werden.");
    }
  },

  openMetadataForm(draft) {
    const today = DataStore.today();

    UI.modal(`
      <h2>Dokument speichern</h2>

      <img
        class="document-form-preview"
        src="${draft.imageData}"
        alt="Vorschau des Dokuments"
      >

      <form id="documentForm" class="form-grid">
        <div class="form-field">
          <label>Titel</label>
          <input
            name="title"
            required
            value="${UI.escape(
              draft.originalName
                .replace(/\.[^.]+$/, "")
                .replaceAll("_", " ")
            )}"
            placeholder="z. B. Arztbericht Kardiologie"
          >
        </div>

        <div class="form-grid two">
          <div class="form-field">
            <label>Dokumenttyp</label>
            <select name="type">
              ${Object.entries(this.typeLabels).map(([value, label]) =>
                `<option value="${value}">${UI.escape(label)}</option>`
              ).join("")}
            </select>
          </div>

          <div class="form-field">
            <label>Dokumentdatum</label>
            <input
              name="documentDate"
              type="date"
              value="${today}"
            >
          </div>
        </div>

        <div class="form-field">
          <label>Arzt / Praxis / Klinik</label>
          <input
            name="doctor"
            placeholder="z. B. Dr. Müller oder Klinikum"
          >
        </div>

        <div class="form-field">
          <label>Notiz</label>
          <textarea
            name="notes"
            rows="4"
            placeholder="Optionaler Hinweis zum Dokument"
          ></textarea>
        </div>

        <div class="form-actions">
          <button
            type="button"
            class="secondary-button"
            data-close-document-form
          >
            Abbrechen
          </button>

          <button class="primary-button">
            Dokument speichern
          </button>
        </div>
      </form>`);

    document.querySelector("[data-close-document-form]").addEventListener(
      "click",
      UI.closeModal
    );

    document.getElementById("documentForm").addEventListener(
      "submit",
      async event => {
        event.preventDefault();

        const form = new FormData(event.currentTarget);
        const documentItem = {
          id: `document_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          title: String(form.get("title") || "").trim(),
          type: String(form.get("type") || "other"),
          documentDate: String(form.get("documentDate") || ""),
          doctor: String(form.get("doctor") || "").trim(),
          notes: String(form.get("notes") || "").trim(),
          imageData: draft.imageData,
          createdAt: new Date().toISOString()
        };

        try {
          await DocumentStorage.save(documentItem);
          UI.closeModal();
          await this.refreshList();
          UI.toast("Dokument wurde gespeichert.");
        } catch (error) {
          UI.toast("Dokument konnte nicht gespeichert werden.");
        }
      }
    );
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
      <div class="document-viewer">
        <div class="document-viewer-head">
          <div>
            <span class="mds-badge mds-badge--info">
              ${UI.escape(this.typeLabels[item.type] || this.typeLabels.other)}
            </span>
            <h2>${UI.escape(item.title)}</h2>
            <p>
              ${date}
              ${item.doctor ? ` · ${UI.escape(item.doctor)}` : ""}
            </p>
          </div>

          <button
            class="secondary-button"
            data-close-document-viewer
          >
            Schließen
          </button>
        </div>

        <img
          class="document-full-image"
          src="${item.imageData}"
          alt="${UI.escape(item.title)}"
        >

        ${item.notes
          ? `<div class="notice">${UI.escape(item.notes)}</div>`
          : ""}
      </div>`);

    document.querySelector("[data-close-document-viewer]").addEventListener(
      "click",
      UI.closeModal
    );
  },

  async deleteDocument(id) {
    const item = await DocumentStorage.get(id);
    if (!item) return;

    if (!confirm(`Dokument „${item.title}“ wirklich löschen?`)) {
      return;
    }

    try {
      await DocumentStorage.delete(id);
      await this.refreshList();
      UI.toast("Dokument wurde gelöscht.");
    } catch (error) {
      UI.toast("Dokument konnte nicht gelöscht werden.");
    }
  }
};
