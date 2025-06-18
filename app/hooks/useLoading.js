import { useState, useCallback, useRef } from 'react';

export const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const abortControllerRef = useRef(null);

  const startLoading = useCallback(() => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    abortControllerRef.current = null;
  }, []);
  
  const withLoading = useCallback(async (asyncFunction, options = {}) => {
    const { timeout = 30000, onError } = options; // 30 second default timeout
    
    try {
      startLoading();
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Operation timed out'));
        }, timeout);
      });

      // Race between the async function and timeout
      const result = await Promise.race([
        asyncFunction(),
        timeoutPromise
      ]);
      
      return result;
    } catch (error) {
      console.error('Loading operation failed:', error);
      if (onError) {
        onError(error);
      }
      throw error;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading,
    cleanup,
    abortController: abortControllerRef.current
  };
};

// Hook for managing multiple loading states
export const useMultipleLoading = (keys = []) => {
  const [loadingStates, setLoadingStates] = useState(
    keys.reduce((acc, key) => ({ ...acc, [key]: false }), {})
  );
  const abortControllersRef = useRef({});

  const startLoading = useCallback((key) => {
    // Cancel any ongoing request for this key
    if (abortControllersRef.current[key]) {
      abortControllersRef.current[key].abort();
    }
    abortControllersRef.current[key] = new AbortController();
    
    setLoadingStates(prev => ({ ...prev, [key]: true }));
  }, []);

  const stopLoading = useCallback((key) => {
    setLoadingStates(prev => ({ ...prev, [key]: false }));
    abortControllersRef.current[key] = null;
  }, []);

  const withLoading = useCallback(async (key, asyncFunction, options = {}) => {
    const { timeout = 30000, onError } = options;
    
    try {
      startLoading(key);
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Operation ${key} timed out`));
        }, timeout);
      });

      const result = await Promise.race([
        asyncFunction(),
        timeoutPromise
      ]);
      
      return result;
    } catch (error) {
      console.error(`Loading operation ${key} failed:`, error);
      if (onError) {
        onError(error);
      }
      throw error;
    } finally {
      stopLoading(key);
    }
  }, [startLoading, stopLoading]);

  const isLoading = useCallback((key) => loadingStates[key] || false, [loadingStates]);
  const isAnyLoading = useCallback(() => Object.values(loadingStates).some(Boolean), [loadingStates]);

  // Cleanup all ongoing operations
  const cleanup = useCallback(() => {
    Object.values(abortControllersRef.current).forEach(controller => {
      if (controller) {
        controller.abort();
      }
    });
    abortControllersRef.current = {};
  }, []);

  return {
    loadingStates,
    isLoading,
    isAnyLoading,
    startLoading,
    stopLoading,
    withLoading,
    cleanup
  };
}; 

