/**
 * Keeps the uploaded drawing readable after a reload.
 *
 * A `blob:` preview URL dies with the page, and the server copy is on another
 * origin — react-pdf fetches it directly, so a missing CORS header there ends
 * as "Failed to load this drawing" on the canvas. Stashing the file itself in
 * IndexedDB means a refresh re-creates a local blob URL and renders exactly
 * what was uploaded, with no second network hop to fail.
 */

const DB_NAME = "quantifypro-drawings";
const DB_VERSION = 1;
const STORE = "files";

/** Two days is longer than any single takeoff session and keeps the quota sane. */
const MAX_AGE_MS = 2 * 24 * 60 * 60 * 1000;

interface CachedDrawing {
  id: string;
  blob: Blob;
  name: string;
  type: string;
  savedAt: number;
}

const supported = () => typeof window !== "undefined" && "indexedDB" in window;

function openDb(): Promise<IDBDatabase | null> {
  if (!supported()) return Promise.resolve(null);

  return new Promise((resolve) => {
    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch {
      resolve(null);
      return;
    }

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    // Private-browsing modes and full quotas both land here. The flow still
    // works for the current page; only the after-refresh restore is lost.
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });
}

function transact<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T | null> {
  return openDb().then(
    (db) =>
      new Promise<T | null>((resolve) => {
        if (!db) {
          resolve(null);
          return;
        }
        try {
          const tx = db.transaction(STORE, mode);
          const request = run(tx.objectStore(STORE));
          request.onsuccess = () => resolve(request.result ?? null);
          request.onerror = () => resolve(null);
          tx.oncomplete = () => db.close();
        } catch {
          resolve(null);
        }
      }),
  );
}

export async function cacheDrawingFile(id: string, file: File): Promise<void> {
  const record: CachedDrawing = {
    id,
    blob: file,
    name: file.name,
    type: file.type,
    savedAt: Date.now(),
  };
  await transact("readwrite", (store) => store.put(record) as IDBRequest<unknown>);
}

/** A fresh object URL for a cached drawing, or null if it isn't there. */
export async function readCachedDrawingUrl(id: string): Promise<string | null> {
  const record = await transact<CachedDrawing>(
    "readonly",
    (store) => store.get(id) as IDBRequest<CachedDrawing>,
  );
  if (!record?.blob) return null;

  if (Date.now() - record.savedAt > MAX_AGE_MS) {
    void removeCachedDrawing(id);
    return null;
  }

  return URL.createObjectURL(record.blob);
}

/**
 * Store a drawing that was just pulled back from the server, so the next
 * reload reads it locally instead of downloading it again.
 */
export async function cacheDrawingFromUrl(
  id: string,
  url: string,
  name: string,
  type?: string,
): Promise<void> {
  try {
    const blob = await (await fetch(url)).blob();
    await cacheDrawingFile(id, new File([blob], name, { type: type || blob.type }));
  } catch {
    // Caching is an optimisation — the drawing is already on screen.
  }
}

export async function removeCachedDrawing(id: string): Promise<void> {
  await transact("readwrite", (store) => store.delete(id) as IDBRequest<unknown>);
}

/** Drop anything older than MAX_AGE_MS. Safe to call on every mount. */
export async function pruneCachedDrawings(): Promise<void> {
  const db = await openDb();
  if (!db) return;

  try {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const cursorRequest = store.openCursor();
    const cutoff = Date.now() - MAX_AGE_MS;

    cursorRequest.onsuccess = () => {
      const cursor = cursorRequest.result;
      if (!cursor) return;
      const value = cursor.value as CachedDrawing;
      if (value.savedAt < cutoff) cursor.delete();
      cursor.continue();
    };
    tx.oncomplete = () => db.close();
  } catch {
    db.close();
  }
}
