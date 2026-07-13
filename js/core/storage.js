
const Storage = {
  get(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key) {
    localStorage.removeItem(key);
  },
  exportAll() {
    const payload = {};
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith("mediplan_")) payload[key] = localStorage.getItem(key);
    }
    return payload;
  },
  importAll(payload) {
    Object.entries(payload).forEach(([key, value]) => {
      if (key.startsWith("mediplan_")) localStorage.setItem(key, value);
    });
  }
};
