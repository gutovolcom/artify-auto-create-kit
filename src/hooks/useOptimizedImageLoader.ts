
import { useState, useCallback, useRef } from 'react';

interface ImageLoadingState {
  isLoading: boolean;
  progress: number;
  error: string | null;
  isLoaded: boolean;
  imageElement: HTMLImageElement | null;
}

interface ImageCacheEntry {
  element: HTMLImageElement;
  timestamp: number;
  size: number;
}

export const useOptimizedImageLoader = () => {
  const [loadingState, setLoadingState] = useState<ImageLoadingState>({
    isLoading: false,
    progress: 0,
    error: null,
    isLoaded: false,
    imageElement: null
  });

  // Simple image cache to avoid reloading same images
  const imageCache = useRef<Map<string, ImageCacheEntry>>(new Map());
  const maxCacheSize = 50; // Max 50 cached images
  const maxCacheAge = 10 * 60 * 1000; // 10 minutes

  const cleanupCache = useCallback(() => {
    const now = Date.now();
    const entriesToDelete: string[] = [];

    imageCache.current.forEach((entry, url) => {
      if (now - entry.timestamp > maxCacheAge) {
        entriesToDelete.push(url);
      }
    });

    entriesToDelete.forEach(url => {
      imageCache.current.delete(url);
    });

    // If still over limit, remove oldest entries
    if (imageCache.current.size > maxCacheSize) {
      const sortedEntries = Array.from(imageCache.current.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = sortedEntries.slice(0, imageCache.current.size - maxCacheSize);
      toRemove.forEach(([url]) => {
        imageCache.current.delete(url);
      });
    }

    console.log('🧹 Image cache cleaned, size:', imageCache.current.size);
  }, []);

  const loadImageWithProgress = useCallback(async (
    imageUrl: string,
    onProgress?: (progress: number) => void
  ): Promise<HTMLImageElement> => {
    // Check cache first
    const cached = imageCache.current.get(imageUrl);
    if (cached && Date.now() - cached.timestamp < maxCacheAge) {
      console.log('📦 Using cached image:', imageUrl);
      setLoadingState({
        isLoading: false,
        progress: 100,
        error: null,
        isLoaded: true,
        imageElement: cached.element
      });
      return cached.element;
    }

    setLoadingState({
      isLoading: true,
      progress: 0,
      error: null,
      isLoaded: false,
      imageElement: null
    });

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      // Simulate progress for better UX (since we can't get real progress for images)
      let progressInterval: NodeJS.Timeout;
      let currentProgress = 0;
      
      const simulateProgress = () => {
        if (currentProgress < 90) {
          currentProgress += Math.random() * 20;
          currentProgress = Math.min(90, currentProgress);
          
          setLoadingState(prev => ({
            ...prev,
            progress: currentProgress
          }));
          
          onProgress?.(currentProgress);
        }
      };

      progressInterval = setInterval(simulateProgress, 100);

      img.onload = () => {
        clearInterval(progressInterval);
        
        // Complete the progress
        setLoadingState({
          isLoading: false,
          progress: 100,
          error: null,
          isLoaded: true,
          imageElement: img
        });
        
        onProgress?.(100);

        // Cache the loaded image
        cleanupCache();
        imageCache.current.set(imageUrl, {
          element: img,
          timestamp: Date.now(),
          size: img.naturalWidth * img.naturalHeight * 4 // Rough size estimation
        });

        console.log('✅ Image loaded and cached:', imageUrl);
        resolve(img);
      };

      img.onerror = (error) => {
        clearInterval(progressInterval);
        
        const errorMessage = 'Failed to load image';
        setLoadingState({
          isLoading: false,
          progress: 0,
          error: errorMessage,
          isLoaded: false,
          imageElement: null
        });

        console.error('❌ Image loading failed:', imageUrl, error);
        reject(new Error(errorMessage));
      };

      // Add timeout for very slow loading images
      const timeout = setTimeout(() => {
        clearInterval(progressInterval);
        
        const errorMessage = 'Image loading timeout';
        setLoadingState({
          isLoading: false,
          progress: 0,
          error: errorMessage,
          isLoaded: false,
          imageElement: null
        });

        reject(new Error(errorMessage));
      }, 30000); // 30 second timeout

      img.onload = () => {
        clearTimeout(timeout);
        img.onload = null; // Prevent double execution
      };

      img.src = imageUrl;
    });
  }, [cleanupCache]);

  const preloadImages = useCallback(async (imageUrls: string[]) => {
    console.log('🚀 Preloading', imageUrls.length, 'images');
    
    const loadPromises = imageUrls.map(url => 
      loadImageWithProgress(url).catch(error => {
        console.warn('⚠️ Failed to preload image:', url, error);
        return null;
      })
    );

    const results = await Promise.allSettled(loadPromises);
    const successCount = results.filter(result => result.status === 'fulfilled' && result.value).length;
    
    console.log('✅ Preloaded', successCount, '/', imageUrls.length, 'images');
    return successCount;
  }, [loadImageWithProgress]);

  const getCacheStats = useCallback(() => {
    const totalSize = Array.from(imageCache.current.values())
      .reduce((sum, entry) => sum + entry.size, 0);
    
    return {
      cachedImages: imageCache.current.size,
      totalCacheSize: totalSize,
      maxCacheSize,
      maxCacheAge
    };
  }, []);

  const clearCache = useCallback(() => {
    imageCache.current.clear();
    console.log('🧹 Image cache cleared');
  }, []);

  return {
    loadingState,
    loadImageWithProgress,
    preloadImages,
    getCacheStats,
    clearCache,
    cleanupCache
  };
};
