// Offline data synchronization utility

// IndexedDB database name and version
const DB_NAME = "pomo-ai-doro-db";
const DB_VERSION = 1;

// Store names
const STORES = {
  TASKS: "tasks",
  SESSIONS: "sessions",
  SYNC_QUEUE: "sync-queue",
};

// Initialize the database
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB not supported"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      reject(new Error("Error opening IndexedDB"));
    };

    request.onsuccess = (event) => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;

      // Create tasks store
      if (!db.objectStoreNames.contains(STORES.TASKS)) {
        const taskStore = db.createObjectStore(STORES.TASKS, { keyPath: "id" });
        taskStore.createIndex("userId", "userId", { unique: false });
        taskStore.createIndex("status", "status", { unique: false });
        taskStore.createIndex("updatedAt", "updatedAt", { unique: false });
      }

      // Create sessions store
      if (!db.objectStoreNames.contains(STORES.SESSIONS)) {
        const sessionStore = db.createObjectStore(STORES.SESSIONS, {
          keyPath: "id",
        });
        sessionStore.createIndex("userId", "userId", { unique: false });
        sessionStore.createIndex("startTime", "startTime", { unique: false });
      }

      // Create sync queue store
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, {
          keyPath: "id",
          autoIncrement: true,
        });
        syncStore.createIndex("timestamp", "timestamp", { unique: false });
        syncStore.createIndex("endpoint", "endpoint", { unique: false });
      }
    };
  });
};

// Add an item to a store
export const addItem = <T>(storeName: string, item: T): Promise<T> => {
  return new Promise((resolve, reject) => {
    initDB()
      .then((db) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.add(item);

        request.onsuccess = () => {
          resolve(item);
        };

        request.onerror = () => {
          reject(new Error(`Error adding item to ${storeName}`));
        };
      })
      .catch(reject);
  });
};

// Get all items from a store
export const getAllItems = <T>(storeName: string): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    initDB()
      .then((db) => {
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          reject(new Error(`Error getting items from ${storeName}`));
        };
      })
      .catch(reject);
  });
};

// Get an item by ID
export const getItemById = <T>(
  storeName: string,
  id: string
): Promise<T | null> => {
  return new Promise((resolve, reject) => {
    initDB()
      .then((db) => {
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.get(id);

        request.onsuccess = () => {
          resolve(request.result || null);
        };

        request.onerror = () => {
          reject(new Error(`Error getting item from ${storeName}`));
        };
      })
      .catch(reject);
  });
};

// Update an item
export const updateItem = <T>(storeName: string, item: T): Promise<T> => {
  return new Promise((resolve, reject) => {
    initDB()
      .then((db) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.put(item);

        request.onsuccess = () => {
          resolve(item);
        };

        request.onerror = () => {
          reject(new Error(`Error updating item in ${storeName}`));
        };
      })
      .catch(reject);
  });
};

// Delete an item
export const deleteItem = (storeName: string, id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    initDB()
      .then((db) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(new Error(`Error deleting item from ${storeName}`));
        };
      })
      .catch(reject);
  });
};

// Add an API request to the sync queue
export const addToSyncQueue = (request: {
  endpoint: string;
  method: string;
  body: any;
  timestamp: number;
}): Promise<void> => {
  return addItem(STORES.SYNC_QUEUE, request).then(() => {});
};

// Process the sync queue when online
export const processSyncQueue = async (): Promise<void> => {
  if (!navigator.onLine) {
    return;
  }

  try {
    const queue = await getAllItems<{
      id?: number;
      endpoint: string;
      method: string;
      body: any;
      timestamp: number;
    }>(STORES.SYNC_QUEUE);

    // Sort by timestamp (oldest first)
    queue.sort((a, b) => a.timestamp - b.timestamp);

    for (const item of queue) {
      try {
        await fetch(item.endpoint, {
          method: item.method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(item.body),
        });

        // If successful, remove from queue
        if (item.id) {
          await deleteItem(STORES.SYNC_QUEUE, item.id.toString());
        }
      } catch (error) {
        console.error("Error processing sync item:", error);
        // Leave in queue to try again later
      }
    }
  } catch (error) {
    console.error("Error processing sync queue:", error);
  }
};

// Listen for online events to sync data
export const setupOfflineSync = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  // Initialize the database
  initDB().catch(console.error);

  // Process sync queue when coming online
  window.addEventListener("online", () => {
    processSyncQueue();
  });

  // Check if we're online now and process queue
  if (navigator.onLine) {
    processSyncQueue();
  }
};

// Helper function to handle API requests with offline support
export const offlineFetch = async <T>(
  endpoint: string,
  method: string = "GET",
  body?: any
): Promise<T> => {
  // If online, try to fetch from the network
  if (navigator.onLine) {
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // If fetch fails, fall back to offline data
      console.error("Network request failed:", error);

      // For GET requests, try to get from IndexedDB
      if (method === "GET") {
        // Determine the store name based on the endpoint
        let storeName = "";
        if (endpoint.includes("/tasks")) {
          storeName = STORES.TASKS;
        } else if (endpoint.includes("/sessions")) {
          storeName = STORES.SESSIONS;
        }

        if (storeName) {
          // Extract ID from endpoint if it exists
          const idMatch = endpoint.match(/\/([a-zA-Z0-9-]+)$/);
          if (idMatch && idMatch[1]) {
            return getItemById(storeName, idMatch[1]) as Promise<T>;
          } else {
            return getAllItems(storeName) as Promise<T>;
          }
        }
      } else {
        // For non-GET requests, add to sync queue
        await addToSyncQueue({
          endpoint,
          method,
          body,
          timestamp: Date.now(),
        });

        // Return optimistic response
        if (body && body.id) {
          return body as T;
        }
      }

      throw error;
    }
  } else {
    // If offline, handle accordingly
    if (method === "GET") {
      // Determine the store name based on the endpoint
      let storeName = "";
      if (endpoint.includes("/tasks")) {
        storeName = STORES.TASKS;
      } else if (endpoint.includes("/sessions")) {
        storeName = STORES.SESSIONS;
      }

      if (storeName) {
        // Extract ID from endpoint if it exists
        const idMatch = endpoint.match(/\/([a-zA-Z0-9-]+)$/);
        if (idMatch && idMatch[1]) {
          return getItemById(storeName, idMatch[1]) as Promise<T>;
        } else {
          return getAllItems(storeName) as Promise<T>;
        }
      }
    } else {
      // For non-GET requests, add to sync queue
      await addToSyncQueue({
        endpoint,
        method,
        body,
        timestamp: Date.now(),
      });

      // Return optimistic response
      if (body && body.id) {
        return body as T;
      }
    }

    throw new Error("Offline and no cached data available");
  }
};
