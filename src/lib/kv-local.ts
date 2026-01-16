// Local development mock for Vercel KV
// Used when KV_REST_API_URL is not configured

type StoredItem = { value: any; expiry?: number };
const store = new Map<string, StoredItem>();

export const kvLocal = {
  async get<T>(key: string): Promise<T | null> {
    const item = store.get(key);
    if (!item) return null;
    if (item.expiry && Date.now() > item.expiry) {
      store.delete(key);
      return null;
    }
    return item.value as T;
  },

  async set(key: string, value: any, options?: { ex?: number }): Promise<void> {
    store.set(key, {
      value,
      expiry: options?.ex ? Date.now() + options.ex * 1000 : undefined
    });
  },

  async del(key: string): Promise<void> {
    store.delete(key);
  }
};

let warned = false;
export function warnLocalKv() {
  if (!warned) {
    console.warn('Warning: Using local KV mock. Data will not persist between restarts.');
    warned = true;
  }
}
