import { supabase } from '../supabase/config';
import { getCachedData, setCachedData } from './cache';

// Optimized Supabase query helper with instant caching
export const fetchCollection = async (tableName, filters = {}, useCache = true, allowStale = true, maxResults = null) => {
  const cacheKey = `${tableName}_${JSON.stringify(filters)}_${maxResults || 'all'}`;
  
  // Return cached data immediately (even if stale) for instant display
  if (useCache) {
    const cached = getCachedData(cacheKey, allowStale);
    if (cached) {
      // Fetch fresh data in background (don't wait)
      fetchFreshData(tableName, filters, cacheKey, useCache, maxResults).catch(() => {
        // Silently fail background refresh
      });
      return cached;
    }
  }
  
  // No cache, fetch immediately
  return fetchFreshData(tableName, filters, cacheKey, useCache, maxResults);
};

// Fetch fresh data from Supabase with optimizations
const fetchFreshData = async (tableName, filters, cacheKey, useCache, maxResults = null) => {
  try {
    let query = supabase.from(tableName).select('*');
    
    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.createdBy) {
      // Use snake_case for database column name
      query = query.eq('created_by', filters.createdBy);
    }
    
    // Limit results for faster initial load
    if (maxResults) {
      query = query.limit(maxResults);
    }
    
    // Try to add ordering, but don't fail if column doesn't exist
    // Use snake_case column names that match the database
    try {
      if (tableName === 'events') {
        query = query.order('date', { ascending: false });
      } else {
        // Use created_at (snake_case) instead of createdAt
        query = query.order('created_at', { ascending: false });
      }
    } catch (orderError) {
      console.warn(`Could not order ${tableName}, continuing without order`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`Error fetching ${tableName}:`, error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: JSON.stringify(error, null, 2)
      });
      
      // If table doesn't exist, return empty array
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        console.warn(`Table ${tableName} does not exist. Please check your database setup.`);
        return [];
      }
      
      // Return cached data if available
      if (useCache) {
        const cached = getCachedData(cacheKey, true);
        if (cached) return cached;
      }
      return [];
    }
    
    // Cache the result
    if (useCache && data) {
      setCachedData(cacheKey, data);
    }
    
    return data || [];
  } catch (error) {
    console.error(`Error fetching ${tableName}:`, error);
    // Return cached data if available, even if stale
    if (useCache) {
      const cached = getCachedData(cacheKey, true);
      if (cached) return cached;
    }
    // Return empty array instead of throwing for better UX
    return [];
  }
};

// Parallel fetch multiple collections - instant with cache
export const fetchMultipleCollections = async (queries) => {
  // First, try to get all from cache instantly
  const cachedResults = queries.map(({ collectionName, filters, useCache, maxResults }) => {
    if (!useCache) return null;
    const cacheKey = `${collectionName}_${JSON.stringify(filters)}_${maxResults || 'all'}`;
    return getCachedData(cacheKey, true); // Allow stale for instant display
  });
  
  // If all cached, return immediately and refresh in background
  if (cachedResults.every(result => result !== null)) {
    // Refresh all in background (don't wait)
    queries.forEach(({ collectionName, filters, useCache, maxResults }) => {
      if (useCache) {
        const cacheKey = `${collectionName}_${JSON.stringify(filters)}_${maxResults || 'all'}`;
        fetchFreshData(collectionName, filters, cacheKey, useCache, maxResults).catch(() => {});
      }
    });
    return cachedResults;
  }
  
  // Otherwise fetch all in parallel (only missing ones)
  const promises = queries.map(({ collectionName, filters, useCache, maxResults }, index) => {
    // If cached, return immediately
    if (cachedResults[index] !== null) {
      return Promise.resolve(cachedResults[index]);
    }
    // Otherwise fetch
    return fetchCollection(collectionName, filters, useCache, true, maxResults);
  });
  
  return Promise.all(promises);
};
