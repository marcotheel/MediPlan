
const CabinetModule = {
  render() {
    const meds = DataStore.get("medications");
    document.getElementById("view-cabinet").innerHTML = `
      <div class="page-card">
        <div class="page-title"><h2>Medikamentenschrank</h2><button class="secondary-button" data-route-inline="dashboard">← Zurück</button></div>
        <div class="list">
          ${meds.map(m => {
            const status = m.stock <= m.minStock ? "Nachbestellen" : "Bestand OK";
            return `<article class="list-card">
              <div class="list-visual">${UI.pill(m)}</div>
              <div>
                <h3>${UI.escape(m.name)} ${UI.escape(m.strength)}</h3>
                <p>${m.stock} ${UI.escape(m.unit)} · ${UI.escape(m.dosage)} · Ablauf: ${UI.escape(m.expiry || "-")}</p>
                <div class="stock-track"><div class="stock-bar" style="width:${Math.min(m.stock,100)}%"></div></div>
              </div>
              <div class="${m.stock<=m.minStock?"status-warn":"status-ok"}">${status}</div>
            </article>`;
          }).join("")}
        </div>
      </div>`;
    document.querySelectorAll("[data-route-inline]").forEach(b=>b.addEventListener("click",()=>Router.go(b.dataset.routeInline)));
  }
};
