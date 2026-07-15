const DB_NAME = 'TodoApp';
const DB_VERSION = 1;

let dbInstance = null;

function open() {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;

      if (!db.objectStoreNames.contains('todos')) {
        const store = db.createObjectStore('todos', { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('dueDate', 'dueDate', { unique: false });
        store.createIndex('completed', 'completed', { unique: false });
      }

      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };

    req.onsuccess = (e) => {
      dbInstance = e.target.result;
      resolve(dbInstance);
    };

    req.onerror = (e) => reject(e.target.error);
  });
}

function tx(storeName, mode) {
  return open().then((db) => db.transaction(storeName, mode).objectStore(storeName));
}

function reqToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ── Todos ──

async function getAllTodos() {
  const store = await tx('todos', 'readonly');
  const todos = await reqToPromise(store.getAll());
  return todos;
}

async function addTodo(todo) {
  const store = await tx('todos', 'readwrite');
  return reqToPromise(store.add(todo));
}

async function updateTodo(todo) {
  const store = await tx('todos', 'readwrite');
  return reqToPromise(store.put(todo));
}

async function deleteTodo(id) {
  const store = await tx('todos', 'readwrite');
  return reqToPromise(store.delete(id));
}

// ── Settings ──

async function getSetting(key) {
  const store = await tx('settings', 'readonly');
  const result = await reqToPromise(store.get(key));
  return result ? result.value : null;
}

async function setSetting(key, value) {
  const store = await tx('settings', 'readwrite');
  return reqToPromise(store.put({ key, value }));
}

export default {
  open,
  getAllTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  getSetting,
  setSetting
};
