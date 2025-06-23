
import { useState, useEffect, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  canvasOperations: number;
  frameRate: number;
  isLagging: boolean;
}

interface PerformanceThresholds {
  maxRenderTime: number;
  maxMemoryUsage: number;
  minFrameRate: number;
}

export const usePerformanceMonitor = (thresholds: Partial<PerformanceThresholds> = {}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    canvasOperations: 0,
    frameRate: 60,
    isLagging: false
  });

  const frameCount = useRef(0);
  const lastFrameTime = useRef(performance.now());
  const operationCount = useRef(0);
  const monitoringActive = useRef(false);

  const defaultThresholds: PerformanceThresholds = {
    maxRenderTime: 16, // 60fps target
    maxMemoryUsage: 100 * 1024 * 1024, // 100MB
    minFrameRate: 30,
    ...thresholds
  };

  const measureRenderTime = useCallback((callback: () => void) => {
    const startTime = performance.now();
    callback();
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    setMetrics(prev => ({
      ...prev,
      renderTime,
      isLagging: renderTime > defaultThresholds.maxRenderTime
    }));

    return renderTime;
  }, [defaultThresholds.maxRenderTime]);

  const trackCanvasOperation = useCallback(() => {
    operationCount.current += 1;
    setMetrics(prev => ({
      ...prev,
      canvasOperations: operationCount.current
    }));
  }, []);

  const getMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize;
    }
    return 0;
  }, []);

  const calculateFrameRate = useCallback(() => {
    const now = performance.now();
    const delta = now - lastFrameTime.current;
    
    if (delta >= 1000) { // Update every second
      const fps = Math.round((frameCount.current * 1000) / delta);
      frameCount.current = 0;
      lastFrameTime.current = now;
      
      setMetrics(prev => ({
        ...prev,
        frameRate: fps,
        isLagging: fps < defaultThresholds.minFrameRate
      }));
      
      return fps;
    }
    
    frameCount.current++;
    return metrics.frameRate;
  }, [defaultThresholds.minFrameRate, metrics.frameRate]);

  const startMonitoring = useCallback(() => {
    if (monitoringActive.current) return;
    
    monitoringActive.current = true;
    console.log('🔍 Performance monitoring started');
    
    const monitor = () => {
      if (!monitoringActive.current) return;
      
      calculateFrameRate();
      
      const memoryUsage = getMemoryUsage();
      setMetrics(prev => ({
        ...prev,
        memoryUsage
      }));
      
      requestAnimationFrame(monitor);
    };
    
    requestAnimationFrame(monitor);
  }, [calculateFrameRate, getMemoryUsage]);

  const stopMonitoring = useCallback(() => {
    monitoringActive.current = false;
    console.log('🔍 Performance monitoring stopped');
  }, []);

  const getPerformanceReport = useCallback(() => {
    const isPerformant = 
      metrics.renderTime <= defaultThresholds.maxRenderTime &&
      metrics.memoryUsage <= defaultThresholds.maxMemoryUsage &&
      metrics.frameRate >= defaultThresholds.minFrameRate;

    return {
      ...metrics,
      isPerformant,
      recommendations: [
        metrics.renderTime > defaultThresholds.maxRenderTime && 'Consider debouncing UI updates',
        metrics.memoryUsage > defaultThresholds.maxMemoryUsage && 'Memory usage is high - consider cleanup',
        metrics.frameRate < defaultThresholds.minFrameRate && 'Frame rate is low - reduce canvas operations'
      ].filter(Boolean)
    };
  }, [metrics, defaultThresholds]);

  const resetMetrics = useCallback(() => {
    operationCount.current = 0;
    frameCount.current = 0;
    lastFrameTime.current = performance.now();
    
    setMetrics({
      renderTime: 0,
      memoryUsage: 0,
      canvasOperations: 0,
      frameRate: 60,
      isLagging: false
    });
    
    console.log('📊 Performance metrics reset');
  }, []);

  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return {
    metrics,
    measureRenderTime,
    trackCanvasOperation,
    startMonitoring,
    stopMonitoring,
    getPerformanceReport,
    resetMetrics,
    isMonitoring: monitoringActive.current
  };
};
