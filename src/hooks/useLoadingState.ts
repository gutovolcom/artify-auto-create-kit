
import { useState } from "react";

interface LoadingState {
  [key: string]: boolean;
}

export const useLoadingState = (initialStates: string[] = []) => {
  const [loadingStates, setLoadingStates] = useState<LoadingState>(() => {
    const initial: LoadingState = {};
    initialStates.forEach(state => {
      initial[state] = false;
    });
    return initial;
  });

  const setLoading = (key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading
    }));
  };

  const isLoading = (key: string) => loadingStates[key] || false;

  const isAnyLoading = () => Object.values(loadingStates).some(Boolean);

  return {
    setLoading,
    isLoading,
    isAnyLoading,
    loadingStates
  };
};
