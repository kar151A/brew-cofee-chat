const BrewDB = (() => {
  const DB_NAME = "brewCoffeeDB";
  const DB_VERSION = 1;
  const USER_STORE = "users";
  const HISTORY_STORE = "history";

  let dbPromise;

  function open() {
    if (dbPromise) {
      return dbPromise;
    }

    dbPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains(USER_STORE)) {
          const users = db.createObjectStore(USER_STORE, { keyPath: "id" });
          users.createIndex("email", "email", { unique: true });
        }

        if (!db.objectStoreNames.contains(HISTORY_STORE)) {
          const history = db.createObjectStore(HISTORY_STORE, { keyPath: "id" });
          history.createIndex("userId", "userId", { unique: false });
          history.createIndex("createdAt", "createdAt", { unique: false });
        }
      };
    });

    return dbPromise;
  }

  function requestToPromise(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function createUser(user) {
    const db = await open();
    const payload = {
      ...user,
      id: user.id || crypto.randomUUID()
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(USER_STORE, "readwrite");
      const store = transaction.objectStore(USER_STORE);
      const request = store.add(payload);

      request.onsuccess = () => resolve(payload);
      request.onerror = () => reject(request.error);
    });
  }

  async function getUserByEmail(email) {
    const db = await open();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(USER_STORE, "readonly");
      const store = transaction.objectStore(USER_STORE);
      const index = store.index("email");
      const request = index.get(email);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async function getUserByCredentials(email, password) {
    const user = await getUserByEmail(email);
    return user && user.password === password ? user : null;
  }

  async function addHistoryEntry(entry) {
    const db = await open();
    const payload = {
      ...entry,
      id: entry.id || crypto.randomUUID(),
      createdAt: entry.createdAt || new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(HISTORY_STORE, "readwrite");
      const store = transaction.objectStore(HISTORY_STORE);
      const request = store.add(payload);

      request.onsuccess = () => resolve(payload);
      request.onerror = () => reject(request.error);
    });
  }

  async function getHistoryByUser(userId) {
    const db = await open();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(HISTORY_STORE, "readonly");
      const store = transaction.objectStore(HISTORY_STORE);
      const index = store.index("userId");
      const request = index.getAll(userId);

      request.onsuccess = () => {
        const results = (request.result || []).sort((a, b) =>
          b.createdAt.localeCompare(a.createdAt)
        );
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  return {
    open,
    createUser,
    getUserByEmail,
    getUserByCredentials,
    addHistoryEntry,
    getHistoryByUser
  };
})();
