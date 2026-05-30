const cacheStore = new Map();

export const getCachedValue = (key) => {
    const entry = cacheStore.get(key);
    if (!entry) return null;

    const { value, expiresAt } = entry;
    if (Date.now() > expiresAt) {
        cacheStore.delete(key);
        return null;
    }

    return value;
};

export const setCachedValue = (key, value, ttlMs = 2 * 60 * 1000) => {
    cacheStore.set(key, {
        value,
        expiresAt: Date.now() + ttlMs,
    });
};

export const deleteCacheKey = (key) => {
    cacheStore.delete(key);
};

export const clearCachePrefix = (prefix) => {
    for (const key of cacheStore.keys()) {
        if (key.startsWith(prefix)) {
            cacheStore.delete(key);
        }
    }
};

export const clearAllCache = () => {
    cacheStore.clear();
};
