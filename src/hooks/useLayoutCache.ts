
import { useState, useCallback, useRef } from 'react';

interface LayoutCacheEntry {
  data: any;
  timestamp: number;
  version: number;
}

interface LayoutCacheConfig {
  maxAge?: number; // milliseconds
  maxSize?: number; // number of entries
}

export const useLayoutCache = (config: LayoutCacheConfig = {}) => {
  const { maxAge = 5 * 60 * 1000, maxSize = 50 } = config; // 5 minutes default
  
  const cacheRef = useRef<Map<string, LayoutCacheEntry>>(new Map());
  const [cacheVersion, setCacheVersion] = useState(0);

  const getCacheKey = useCallback((templateId: string, formatName: string) => {
    return `${templateId}-${formatName}`;
  }, []);

  const isValidEntry = useCallback((entry: LayoutCacheEntry): boolean => {
    const now = Date.now();
    const isNotExpired = (now - entry.timestamp) < maxAge;
    const isCurrentVersion = entry.version === cacheVersion;
    
    return isNotExpired && isCurrentVersion;
  }, [maxAge, cacheVersion]);

  const get = useCallback((templateId: string, formatName: string) => {
    const key = getCacheKey(templateId, formatName);
    const entry = cacheRef.current.get(key);
    
    if (entry && isValidEntry(entry)) {
      console.log('📦 Cache hit for layout:', key);
      return entry.data;
    }
    
    if (entry) {
      console.log('🗑️ Removing expired cache entry:', key);
      cacheRef.current.delete(key);
    }
    
    return null;
  }, [getCacheKey, isValidEntry]);

  const set = useCallback((templateId: string, formatName: string, data: any) => {
    const key = getCacheKey(templateId, formatName);
    
    // Clean up expired entries if cache is getting full
    if (cacheRef.current.size >= maxSize) {
      const keysToDelete: string[] = [];
      
      cacheRef.current.forEach((entry, entryKey) => {
        if (!isValidEntry(entry)) {
          keysToDelete.push(entryKey);
        }
      });
      
      keysToDelete.forEach(keyToDelete => {
        cacheRef.current.delete(keyToDelete);
      });
      
      // If still at capacity, remove oldest entries
      if (cacheRef.current.size >= maxSize) {
        const sortedEntries = Array.from(cacheRef.current.entries())
          .sort((a, b) => a[1].timestamp - b[1].timestamp);
        
        const toRemove = sortedEntries.slice(0, Math.floor(maxSize * 0.3));
        toRemove.forEach(([keyToDelete]) => {
          cacheRef.current.delete(keyToDelete);
        });
      }
    }
    
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now(),
      version: cacheVersion
    });
    
    console.log('💾 Cached layout:', key, 'Cache size:', cacheRef.current.size);
  }, [getCacheKey, maxSize, isValidEntry, cacheVersion]);

  const invalidate = useCallback((templateId?: string, formatName?: string) => {
    if (templateId && formatName) {
      const key = getCacheKey(templateId, formatName);
      const deleted = cacheRef.current.delete(key);
      console.log('🗑️ Invalidated specific cache entry:', key, 'Deleted:', deleted);
    } else {
      // Invalidate all by incrementing version
      setCacheVersion(prev => prev + 1);
      console.log('🗑️ Invalidated all cache entries, new version:', cacheVersion + 1);
    }
  }, [getCacheKey, cacheVersion]);

  const clear = useCallback(() => {
    cacheRef.current.clear();
    setCacheVersion(prev => prev + 1);
    console.log('🧹 Cleared all cache entries');
  }, []);

  const getStats = useCallback(() => {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;
    
    cacheRef.current.forEach(entry => {
      if (isValidEntry(entry)) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    });
    
    return {
      totalEntries: cacheRef.current.size,
      validEntries,
      expiredEntries,
      cacheVersion
    };
  }, [isValidEntry, cacheVersion]);

  return {
    get,
    set,
    invalidate,
    clear,
    getStats
  };
};
