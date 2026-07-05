const Router = {
  current: "dashboard",

  init() {
    document.querySelectorAll(".nav-item").forEach(button => {
      button.addEventListener("click", () => {
        this.go(button.dataset.page);
      });
    });
  },

  go(page) {
    this.current = page;

    document.querySelectorAll(".nav-item").forEach(button => {
      button.classList.toggle("active", button.dataset.page === page);
    });

    console.log("Aktive Seite:", page);
  }
};
