// Enhanced cache with localStorage persistence for faster loads
const cache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes - longer cache for instant loading
const STALE_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours - show stale data if available
const STORAGE_PREFIX = 'undp_cache_';

// Load cache from localStorage on initialization
const loadCacheFromStorage = () => {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        const cacheKey = key.replace(STORAGE_PREFIX, '');
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          cache.set(cacheKey, parsed);
        }
      }
    }
  } catch (error) {
    console.warn('Failed to load cache from localStorage:', error);
  }
};

// Initialize cache from localStorage
loadCacheFromStorage();

export const getCachedData = (key, allowStale = true) => {
  // Check memory cache first (fastest)
  const cached = cache.get(key);
  if (cached) {
    const age = Date.now() - cached.timestamp;
    // Return fresh cache
    if (age < CACHE_DURATION) {
      return cached.data;
    }
    // Return stale cache if allowed (for instant display)
    if (allowStale && age < STALE_CACHE_DURATION) {
      return cached.data;
    }
  }
  
  // Check localStorage as fallback
  try {
    const stored = localStorage.getItem(STORAGE_PREFIX + key);
    if (stored) {
      const parsed = JSON.parse(stored);
      const age = Date.now() - parsed.timestamp;
      if (age < CACHE_DURATION || (allowStale && age < STALE_CACHE_DURATION)) {
        // Restore to memory cache
        cache.set(key, parsed);
        return parsed.data;
      }
    }
  } catch (error) {
    // Silently fail
  }
  
  return null;
};

export const setCachedData = (key, data) => {
  const cacheEntry = {
    data,
    timestamp: Date.now(),
  };
  
  // Store in memory cache
  cache.set(key, cacheEntry);
  
  // Persist to localStorage (async, don't block)
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(cacheEntry));
  } catch (error) {
    // If localStorage is full, clear old entries
    if (error.name === 'QuotaExceededError') {
      clearOldCacheEntries();
      try {
        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(cacheEntry));
      } catch (e) {
        // Still fail, just use memory cache
      }
    }
  }
};

// Clear old cache entries from localStorage
const clearOldCacheEntries = () => {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          const age = Date.now() - parsed.timestamp;
          if (age > STALE_CACHE_DURATION) {
            keysToRemove.push(key);
          }
        }
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    // Silently fail
  }
};

export const clearCache = (key) => {
  if (key) {
    cache.delete(key);
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
    } catch (error) {
      // Silently fail
    }
  } else {
    cache.clear();
    try {
      // Clear all cache entries from localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      // Silently fail
    }
  }
};

// Preload data on app start
export const preloadData = async (fetchFn, key) => {
  const cached = getCachedData(key, true);
  if (cached) {
    return cached;
  }
  try {
    const data = await fetchFn();
    setCachedData(key, data);
    return data;
  } catch (error) {
    console.error('Preload error:', error);
    return [];
  }
};
