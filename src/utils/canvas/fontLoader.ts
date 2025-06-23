
// Font loading utilities with proper race condition handling
const fontLoadingPromises = new Map<string, Promise<boolean>>();
const loadedFonts = new Set<string>();

export interface FontConfig {
  family: string;
  size: number;
  weight?: string;
  style?: string;
}

// Ensure font is loaded before measurement or rendering
export const ensureFontLoaded = async (config: FontConfig): Promise<boolean> => {
  const fontKey = `${config.family}-${config.size}-${config.weight || 'normal'}-${config.style || 'normal'}`;
  
  // Return immediately if already loaded
  if (loadedFonts.has(fontKey)) {
    return true;
  }
  
  // Return existing promise if already loading
  if (fontLoadingPromises.has(fontKey)) {
    return fontLoadingPromises.get(fontKey)!;
  }
  
  // Create new loading promise
  const loadingPromise = loadFont(config, fontKey);
  fontLoadingPromises.set(fontKey, loadingPromise);
  
  return loadingPromise;
};

const loadFont = async (config: FontConfig, fontKey: string): Promise<boolean> => {
  try {
    const fontString = `${config.weight || 'normal'} ${config.style || 'normal'} ${config.size}px ${config.family}`;
    
    // Check if font is already available
    if (document.fonts.check(fontString)) {
      loadedFonts.add(fontKey);
      return true;
    }
    
    console.log(`🔤 Loading font: ${fontString}`);
    
    // Load the font with timeout
    const loadPromise = document.fonts.load(fontString);
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Font loading timeout')), 5000)
    );
    
    await Promise.race([loadPromise, timeoutPromise]);
    
    // Verify font is now loaded
    const isLoaded = document.fonts.check(fontString);
    if (isLoaded) {
      loadedFonts.add(fontKey);
      console.log(`✅ Font loaded successfully: ${fontString}`);
    } else {
      console.warn(`⚠️ Font check failed after loading: ${fontString}`);
    }
    
    return isLoaded;
  } catch (error) {
    console.error(`❌ Font loading failed: ${config.family}`, error);
    // Don't cache failed loads - allow retry
    fontLoadingPromises.delete(fontKey);
    return false;
  }
};

// Batch load multiple fonts
export const batchLoadFonts = async (configs: FontConfig[]): Promise<boolean[]> => {
  const promises = configs.map(config => ensureFontLoaded(config));
  return Promise.all(promises);
};

// Clear font cache (useful for testing)
export const clearFontCache = () => {
  fontLoadingPromises.clear();
  loadedFonts.clear();
  console.log('🧹 Font cache cleared');
};
