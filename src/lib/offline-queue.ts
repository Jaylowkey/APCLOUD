const DB_NAME = "apcloud-offline";
const STORE_NAME = "pending-uploads";
const DB_VERSION = 1;

export type PendingUpload = {
  id: string;
  userId: string;
  albumId: string | null;
  name: string;
  type: string;
  size: number;
  blob: Blob;
  createdAt: number;
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
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

export async function enqueueUpload(item: PendingUpload): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  db.close();
}

export async function getPendingUploads(userId: string): Promise<PendingUpload[]> {
  const db = await openDB();
  const items = await new Promise<PendingUpload[]>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).index("userId").getAll(userId);
    request.onsuccess = () => resolve(request.result as PendingUpload[]);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return items.sort((a, b) => a.createdAt - b.createdAt);
}

export async function removePendingUpload(id: string): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  db.close();
}