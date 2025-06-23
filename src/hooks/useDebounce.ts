
import { useState, useEffect, useCallback, useRef } from 'react';

interface DebounceOptions {
  delay?: number;
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

export const useDebounce = <T>(
  value: T,
  delay: number = 300
): [T, T, boolean] => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    setIsDebouncing(true);
    
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return [debouncedValue, value, isDebouncing];
};

export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  options: DebounceOptions = {}
): [T, () => void, boolean] => {
  const {
    delay = 300,
    leading = false,
    trailing = true,
    maxWait
  } = options;

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallTimeRef = useRef<number | null>(null);
  const lastInvokeTimeRef = useRef<number | null>(null);
  const [isPending, setIsPending] = useState(false);

  const invokeCallback = useCallback((...args: Parameters<T>) => {
    lastInvokeTimeRef.current = Date.now();
    setIsPending(false);
    return callback(...args);
  }, [callback]);

  const leadingEdge = useCallback((...args: Parameters<T>) => {
    lastInvokeTimeRef.current = Date.now();
    setIsPending(true);
    
    if (leading) {
      return invokeCallback(...args);
    }
  }, [leading, invokeCallback]);

  const remainingWait = useCallback((time: number) => {
    const timeSinceLastCall = time - (lastCallTimeRef.current || 0);
    const timeSinceLastInvoke = time - (lastInvokeTimeRef.current || 0);
    const timeWaiting = delay - timeSinceLastCall;
    
    return maxWait === undefined 
      ? timeWaiting 
      : Math.min(timeWaiting, maxWait - timeSinceLastInvoke);
  }, [delay, maxWait]);

  const shouldInvoke = useCallback((time: number) => {
    const timeSinceLastCall = time - (lastCallTimeRef.current || 0);
    const timeSinceLastInvoke = time - (lastInvokeTimeRef.current || 0);
    
    return (
      lastCallTimeRef.current === null ||
      timeSinceLastCall >= delay ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  }, [delay, maxWait]);

  const trailingEdge = useCallback((...args: Parameters<T>) => {
    if (trailing && lastCallTimeRef.current !== null) {
      return invokeCallback(...args);
    }
    setIsPending(false);
  }, [trailing, invokeCallback]);

  const timerExpired = useCallback((...args: Parameters<T>) => {
    const time = Date.now();
    
    if (shouldInvoke(time)) {
      return trailingEdge(...args);
    }
    
    // Restart the timer
    const remaining = remainingWait(time);
    timeoutRef.current = setTimeout(() => timerExpired(...args), remaining);
  }, [shouldInvoke, trailingEdge, remainingWait]);

  const debouncedFunction = useCallback((...args: Parameters<T>) => {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);
    
    lastCallTimeRef.current = time;
    
    if (isInvoking) {
      if (timeoutRef.current === null) {
        return leadingEdge(...args);
      }
      
      if (maxWait !== undefined) {
        // Handle maxWait
        timeoutRef.current = setTimeout(() => timerExpired(...args), delay);
        maxTimeoutRef.current = setTimeout(() => trailingEdge(...args), maxWait);
        return leadingEdge(...args);
      }
    }
    
    if (timeoutRef.current === null) {
      timeoutRef.current = setTimeout(() => timerExpired(...args), delay);
    }
    
    setIsPending(true);
  }, [shouldInvoke, leadingEdge, delay, maxWait, timerExpired, trailingEdge]) as T;

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
    
    lastCallTimeRef.current = null;
    lastInvokeTimeRef.current = null;
    setIsPending(false);
  }, []);

  const flush = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current === null) {
      return;
    }
    
    cancel();
    return invokeCallback(...args);
  }, [cancel, invokeCallback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return [debouncedFunction, cancel, isPending];
};

export const useThrottledCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 100
): [T, () => void] => {
  const [debouncedFn, cancel] = useDebouncedCallback(callback, {
    delay,
    leading: true,
    trailing: false
  });

  return [debouncedFn, cancel];
};
