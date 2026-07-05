const Dashboard = {
  demoIntakes: [
    { name: "Ramipril", strength: "5 mg", time: "08:00", amount: "1 Tablette", pillClass: "pill-white", stock: 84 },
    { name: "Metformin", strength: "850 mg", time: "12:00", amount: "1 Tablette", pillClass: "pill-pink", stock: 42 },
    { name: "Vitamin D", strength: "1000 IE", time: "20:00", amount: "1 Kapsel", pillClass: "pill-yellow", stock: 60 }
  ],
  init() { this.renderDate(); this.renderIntakes(); },
  renderDate() {
    const label = document.getElementById("todayLabel");
    if (!label) return;
    label.textContent = new Intl.DateTimeFormat("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(new Date());
  },
  renderIntakes() {
    const container = document.getElementById("intakeCards");
    if (!container) return;
    container.innerHTML = this.demoIntakes.map(item => `
      <article class="intake-card">
        <div class="intake-top"><span class="intake-time-badge">${item.time}</span><span class="stock-badge">Bestand: ${item.stock}</span></div>
        <div class="med-visual-wrap"><div class="pill-visual ${item.pillClass}"></div></div>
        <div><h3>${item.name} ${item.strength}</h3><p>${item.amount}</p></div>
        <div class="stock-line"><span style="width:${Math.min(item.stock, 100)}%"></span></div>
        <button class="intake-button" type="button">Jetzt einnehmen</button>
      </article>
    `).join("");
  }
};
