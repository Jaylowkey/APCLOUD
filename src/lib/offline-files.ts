const DB_NAME = "apcloud-offline-files";
const STORE_NAME = "saved-files";

export type SavedOfflineFile = {
  id: string;
  userId: string;
  name: string;
  type: string;
  size: number;
  blob: Blob;
  savedAt: number;
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("userId", "userId", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveOfflineFile(file: SavedOfflineFile): Promise<void> {
  const db = await openDB();
  try {
    await new Promise<void>((resolve, reject) => {
      const request = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(file);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
}

export async function listOfflineFiles(userId: string): Promise<SavedOfflineFile[]> {
  const db = await openDB();
  try {
    return await new Promise<SavedOfflineFile[]>((resolve, reject) => {
      const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).index("userId").getAll(userId);
      request.onsuccess = () => resolve((request.result as SavedOfflineFile[]).sort((a,b) => b.savedAt-a.savedAt));
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
}

export async function getOfflineFile(id: string, userId: string): Promise<SavedOfflineFile | null> {
  const db = await openDB();
  try {
    return await new Promise<SavedOfflineFile | null>((resolve, reject) => {
      const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(id);
      request.onsuccess = () => {
        const file = request.result as SavedOfflineFile | undefined;
        resolve(file?.userId === userId ? file : null);
      };
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
}

export async function removeOfflineFile(id: string, userId: string): Promise<void> {
  const db = await openDB();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);
      request.onsuccess = () => {
        if ((request.result as SavedOfflineFile | undefined)?.userId === userId) store.delete(id);
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally { db.close(); }
}
