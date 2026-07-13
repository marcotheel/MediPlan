
const UI = {
  timer:null,
  toast(message) {
    const el = document.getElementById("toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(this.timer);
    this.timer = setTimeout(() => el.classList.remove("show"), 2600);
  },
  modal(html) {
    document.getElementById("modalRoot").innerHTML = `
      <div class="modal-backdrop" data-modal-close>
        <div class="modal" role="dialog" aria-modal="true">${html}</div>
      </div>`;
    document.querySelector("[data-modal-close]").addEventListener("click", e => {
      if (e.target.hasAttribute("data-modal-close")) UI.closeModal();
    });
  },
  closeModal() {
    document.getElementById("modalRoot").innerHTML = "";
  },
  escape(value="") {
    return String(value)
      .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
      .replaceAll('"',"&quot;").replaceAll("'","&#039;");
  },
  download(filename, text, type="application/json") {
    const blob = new Blob([text], {type});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  },
  pill(med) {
    if (med.image) return `<img src="${med.image}" alt="" class="preview-image">`;
    return `<div class="pill ${med.pill || "white"}"></div>`;
  }
};
