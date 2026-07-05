const Dashboard = {
  demoIntakes: [
    {
      name: "Ramipril",
      strength: "5 mg",
      time: "08:00",
      amount: "1 Tablette",
      icon: "💊"
    },
    {
      name: "Metformin",
      strength: "850 mg",
      time: "12:00",
      amount: "1 Tablette",
      icon: "💊"
    },
    {
      name: "Vitamin D",
      strength: "1000 IE",
      time: "20:00",
      amount: "1 Kapsel",
      icon: "🟡"
    }
  ],

  init() {
    this.renderDate();
    this.renderIntakes();
  },

  renderDate() {
    const label = document.getElementById("todayLabel");
    if (!label) return;

    const formatter = new Intl.DateTimeFormat("de-DE", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric"
    });

    label.textContent = formatter.format(new Date());
  },

  renderIntakes() {
    const container = document.getElementById("intakeCards");
    if (!container) return;

    container.innerHTML = this.demoIntakes.map(item => `
      <article class="intake-card">
        <div class="med-image">${item.icon}</div>
        <div>
          <h3>${item.name} ${item.strength}</h3>
          <p><span class="intake-time">${item.time}</span> · ${item.amount}</p>
        </div>
        <button class="intake-button" type="button">Jetzt einnehmen</button>
      </article>
    `).join("");
  }
};
