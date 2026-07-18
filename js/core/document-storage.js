
const DocumentStorage = {
  dbName: "MediPlanDocuments",
  storeName: "documents",
  version: 1,

  open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = event => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, {
            keyPath: "id"
          });
          store.createIndex("createdAt", "createdAt", { unique: false });
          store.createIndex("documentDate", "documentDate", { unique: false });
          store.createIndex("type", "type", { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async getAll() {
    const db = await this.open();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const items = request.result || [];
        items.sort((a, b) =>
          String(b.documentDate || b.createdAt)
            .localeCompare(String(a.documentDate || a.createdAt))
        );
        resolve(items);
      };

      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => db.close();
    });
  },

  async get(id) {
    const db = await this.open();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readonly");
      const request = transaction.objectStore(this.storeName).get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => db.close();
    });
  },

  async save(documentItem) {
    const db = await this.open();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readwrite");
      transaction.objectStore(this.storeName).put(documentItem);

      transaction.oncomplete = () => {
        db.close();
        resolve(documentItem);
      };

      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  },

  async delete(id) {
    const db = await this.open();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readwrite");
      transaction.objectStore(this.storeName).delete(id);

      transaction.oncomplete = () => {
        db.close();
        resolve();
      };

      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  },

  async clear() {
    const db = await this.open();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readwrite");
      transaction.objectStore(this.storeName).clear();

      transaction.oncomplete = () => {
        db.close();
        resolve();
      };

      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  },

  fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
};
