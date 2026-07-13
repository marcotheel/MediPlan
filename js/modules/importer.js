
const ImporterModule = {
  recognizedText:"",
  parsed:[],

  render() {
    document.getElementById("view-import").innerHTML = `
      <div class="page-card">
        <div class="page-title"><h2>Medikamentenplan importieren</h2><button class="secondary-button" data-route-inline="more">← Zurück</button></div>
        <div class="notice">Erkannte Angaben werden niemals automatisch aktiv. Vor dem Speichern ist eine Admin-Prüfung erforderlich.</div>
        <div class="import-methods">
          <button class="import-method" data-photo><strong>📷 Foto / Bild</strong><small>Plan fotografieren oder Bild auswählen</small></button>
          <button class="import-method" data-barcode><strong>▦ Barcode / DataMatrix</strong><small>Mit der Kamera scannen, sofern unterstützt</small></button>
          <button class="import-method" data-manual><strong>⌨️ Text eingeben</strong><small>Erkannten Text manuell einfügen</small></button>
          <button class="import-method" data-pack><strong>📦 Packung fotografieren</strong><small>Verpackung per OCR auslesen</small></button>
        </div>
        <input id="imageInput" class="hidden" type="file" accept="image/*" capture="environment">
        <div id="importWork" class="section"></div>
      </div>`;
    document.querySelectorAll("[data-route-inline]").forEach(b=>b.addEventListener("click",()=>Router.go(b.dataset.routeInline)));
    document.querySelector("[data-photo]").addEventListener("click",()=>document.getElementById("imageInput").click());
    document.querySelector("[data-pack]").addEventListener("click",()=>document.getElementById("imageInput").click());
    document.getElementById("imageInput").addEventListener("change",e=>this.handleImage(e.target.files[0]));
    document.querySelector("[data-manual]").addEventListener("click",()=>this.manual());
    document.querySelector("[data-barcode]").addEventListener("click",()=>this.scanBarcode());
  },

  async handleImage(file) {
    if (!file) return;
    const work = document.getElementById("importWork");
    const url = URL.createObjectURL(file);
    work.innerHTML = `<img src="${url}" class="preview-image"><div class="ocr-progress">Texterkennung wird vorbereitet…</div>`;
    if (!window.Tesseract) {
      work.innerHTML += `<p>OCR-Bibliothek konnte nicht geladen werden.</p>`;
      return;
    }
    try {
      const result = await Tesseract.recognize(file,"deu",{
        logger:m=>{
          const p = work.querySelector(".ocr-progress");
          if (p && m.status) p.textContent = `${m.status}${m.progress ? ` · ${Math.round(m.progress*100)} %` : ""}`;
        }
      });
      this.recognizedText = result.data.text || "";
      this.showText();
    } catch (err) {
      work.innerHTML += `<p>Texterkennung fehlgeschlagen: ${UI.escape(err.message)}</p>`;
    }
  },

  manual() {
    document.getElementById("importWork").innerHTML = `
      <div class="form-field"><label>Text des Medikamentenplans</label><textarea id="manualText" rows="12" placeholder="Ramipril 5 mg 1-0-0&#10;Metformin 850 mg 1-0-1"></textarea></div>
      <button class="primary-button" data-parse>Text auswerten</button>`;
    document.querySelector("[data-parse]").addEventListener("click",()=>{
      this.recognizedText = document.getElementById("manualText").value;
      this.showText();
    });
  },

  showText() {
    document.getElementById("importWork").innerHTML = `
      <div class="form-field"><label>Erkannter Text</label><textarea id="recognizedText" rows="12">${UI.escape(this.recognizedText)}</textarea></div>
      <button class="primary-button" data-parse>Medikamente erkennen</button>`;
    document.querySelector("[data-parse]").addEventListener("click",()=>{
      this.recognizedText = document.getElementById("recognizedText").value;
      this.parsed = this.parse(this.recognizedText);
      this.showPreview();
    });
  },

  parse(text) {
    const lines = text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
    return lines.map(line=>{
      const dose = line.match(/(\d+(?:[.,]\d+)?)\s*-\s*(\d+(?:[.,]\d+)?)\s*-\s*(\d+(?:[.,]\d+)?)(?:\s*-\s*(\d+(?:[.,]\d+)?))?/);
      const strength = line.match(/(\d+(?:[.,]\d+)?)\s*(mg|µg|mcg|g|IE|I\.E\.)/i);
      const name = line.replace(dose?.[0]||"","").replace(strength?.[0]||"","").replace(/\s+/g," ").trim();
      const d = dose ? [dose[1],dose[2],dose[3],dose[4]||"0"].map(v=>Number(String(v).replace(",","."))) : [1,0,0,0];
      const times = [];
      if (d[0]>0) times.push({time:"08:00",amount:d[0]});
      if (d[1]>0) times.push({time:"12:00",amount:d[1]});
      if (d[2]>0) times.push({time:"18:00",amount:d[2]});
      if (d[3]>0) times.push({time:"22:00",amount:d[3]});
      return {name:name||"Unbekannt",strength:strength?`${strength[1]} ${strength[2]}`:"",dosage:d.join("-"),times};
    }).filter(x=>x.name!=="Unbekannt" || x.strength);
  },

  showPreview() {
    const work = document.getElementById("importWork");
    if (!this.parsed.length) {
      work.innerHTML = `<div class="empty-state"><h3>Keine Medikamente sicher erkannt</h3><p>Text prüfen oder manuell eingeben.</p></div>`;
      return;
    }
    work.innerHTML = `
      <h3>Erkannte Medikamente – Admin-Prüfung</h3>
      <div class="list">
        ${this.parsed.map((m,i)=>`<article class="list-card">
          <div class="list-visual">💊</div>
          <div><h3>${UI.escape(m.name)} ${UI.escape(m.strength)}</h3><p>Dosierung: ${UI.escape(m.dosage)} · Zeiten: ${m.times.map(t=>`${t.time} (${t.amount})`).join(", ")}</p></div>
          <label><input type="checkbox" data-import-check="${i}" checked> übernehmen</label>
        </article>`).join("")}
      </div>
      <div class="form-actions section"><button class="primary-button" data-save-import>Nach Admin-Prüfung übernehmen</button></div>`;
    document.querySelector("[data-save-import]").addEventListener("click",()=>this.save());
  },

  save() {
    if (!AdminModule.unlocked) {
      UI.toast("Bitte zuerst im Admin-Bereich anmelden.");
      Router.go("admin-login");
      return;
    }
    const selected = [...document.querySelectorAll("[data-import-check]:checked")].map(x=>this.parsed[Number(x.dataset.importCheck)]);
    const meds = DataStore.get("medications");
    selected.forEach(m=>{
      const first = m.times[0] || {time:"08:00",amount:1};
      meds.push({
        id:`med_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
        name:m.name,strength:m.strength,form:"Tablette",description:"",
        dosage:m.dosage,time:first.time,amount:first.amount,unit:"Tablette",
        stock:0,minStock:10,expiry:"",active:true,pill:"white",image:""
      });
    });
    DataStore.set("medications",meds);
    DataStore.resetToday();
    UI.toast(`${selected.length} Medikament(e) übernommen.`);
    Router.go("admin");
  },

  async scanBarcode() {
    const work = document.getElementById("importWork");
    if (!("BarcodeDetector" in window)) {
      work.innerHTML = `<div class="empty-state"><h3>Barcode-Scan nicht unterstützt</h3><p>Bitte Foto/OCR oder manuelle Eingabe verwenden.</p></div>`;
      return;
    }
    work.innerHTML = `<video id="scanVideo" autoplay playsinline style="width:100%;border-radius:18px"></video><p class="ocr-progress">Kamera wird gestartet…</p>`;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});
      const video = document.getElementById("scanVideo");
      video.srcObject = stream;
      const detector = new BarcodeDetector({formats:["qr_code","data_matrix","ean_13","ean_8","code_128"]});
      const timer = setInterval(async()=>{
        try {
          const codes = await detector.detect(video);
          if (codes.length) {
            clearInterval(timer); stream.getTracks().forEach(t=>t.stop());
            work.innerHTML = `<div class="empty-state"><h3>Code erkannt</h3><p>${UI.escape(codes[0].rawValue)}</p></div>`;
          }
        } catch {}
      },700);
    } catch (err) {
      work.innerHTML = `<div class="empty-state"><h3>Kamera konnte nicht geöffnet werden</h3><p>${UI.escape(err.message)}</p></div>`;
    }
  }
};
