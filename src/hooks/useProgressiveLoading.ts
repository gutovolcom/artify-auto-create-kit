
import { useState, useCallback, useRef, useEffect } from 'react';

interface LoadingStep {
  id: string;
  name: string;
  progress: number;
  status: 'pending' | 'loading' | 'completed' | 'error';
  startTime?: number;
  endTime?: number;
  error?: string;
}

interface ProgressiveLoadingConfig {
  steps: Array<{
    id: string;
    name: string;
    estimatedDuration?: number;
  }>;
  onComplete?: () => void;
  onError?: (error: string) => void;
  onStepComplete?: (stepId: string) => void;
}

export const useProgressiveLoading = (config: ProgressiveLoadingConfig) => {
  const [steps, setSteps] = useState<LoadingStep[]>(
    config.steps.map(step => ({
      ...step,
      progress: 0,
      status: 'pending' as const
    }))
  );
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null);
  
  const startTime = useRef<number | null>(null);
  const stepTimings = useRef<Record<string, number>>({});
  
  const updateStepProgress = useCallback((stepId: string, progress: number) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, progress: Math.min(100, Math.max(0, progress)) }
        : step
    ));
  }, []);

  const markStepCompleted = useCallback((stepId: string) => {
    setSteps(prev => prev.map(step => {
      if (step.id === stepId) {
        const completedStep = {
          ...step,
          progress: 100,
          status: 'completed' as const,
          endTime: Date.now()
        };
        
        // Store timing for estimation
        if (completedStep.startTime) {
          stepTimings.current[stepId] = completedStep.endTime - completedStep.startTime;
        }
        
        return completedStep;
      }
      return step;
    }));
    
    config.onStepComplete?.(stepId);
  }, [config]);

  const markStepError = useCallback((stepId: string, error: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status: 'error' as const, error, endTime: Date.now() }
        : step
    ));
    
    config.onError?.(error);
  }, [config]);

  const startStep = useCallback((stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status: 'loading' as const, startTime: Date.now() }
        : step
    ));
  }, []);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    startTime.current = Date.now();
    setCurrentStepIndex(0);
    setOverallProgress(0);
    
    // Reset all steps
    setSteps(prev => prev.map(step => ({
      ...step,
      progress: 0,
      status: 'pending' as const,
      startTime: undefined,
      endTime: undefined,
      error: undefined
    })));
    
    console.log('🚀 Progressive loading started');
  }, []);

  const completeLoading = useCallback(() => {
    setIsLoading(false);
    setOverallProgress(100);
    setEstimatedTimeRemaining(null);
    
    const totalTime = startTime.current ? Date.now() - startTime.current : 0;
    console.log('✅ Progressive loading completed in', totalTime, 'ms');
    
    config.onComplete?.();
  }, [config]);

  // Calculate overall progress and time estimation
  useEffect(() => {
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    const currentStepProgress = steps[currentStepIndex]?.progress || 0;
    
    const progress = completedSteps > 0 
      ? (completedSteps / steps.length) * 100 + (currentStepProgress / steps.length)
      : currentStepProgress / steps.length;
    
    setOverallProgress(Math.min(100, progress));
    
    // Estimate time remaining
    if (isLoading && startTime.current) {
      const elapsed = Date.now() - startTime.current;
      const progressRatio = progress / 100;
      
      if (progressRatio > 0.1) { // Only estimate after 10% progress
        const estimatedTotal = elapsed / progressRatio;
        const remaining = Math.max(0, estimatedTotal - elapsed);
        setEstimatedTimeRemaining(remaining);
      }
    }
  }, [steps, currentStepIndex, isLoading]);

  // Auto-advance to next step when current is completed
  useEffect(() => {
    const currentStep = steps[currentStepIndex];
    if (currentStep?.status === 'completed' && currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else if (currentStep?.status === 'completed' && currentStepIndex === steps.length - 1) {
      completeLoading();
    }
  }, [steps, currentStepIndex, completeLoading]);

  const getCurrentStep = useCallback(() => {
    return steps[currentStepIndex];
  }, [steps, currentStepIndex]);

  const getStepByIndex = useCallback((index: number) => {
    return steps[index];
  }, [steps]);

  const getStepById = useCallback((id: string) => {
    return steps.find(step => step.id === id);
  }, [steps]);

  const resetLoading = useCallback(() => {
    setIsLoading(false);
    setCurrentStepIndex(0);
    setOverallProgress(0);
    setEstimatedTimeRemaining(null);
    startTime.current = null;
    stepTimings.current = {};
    
    setSteps(prev => prev.map(step => ({
      ...step,
      progress: 0,
      status: 'pending' as const,
      startTime: undefined,
      endTime: undefined,
      error: undefined
    })));
  }, []);

  return {
    steps,
    isLoading,
    overallProgress,
    estimatedTimeRemaining,
    currentStep: getCurrentStep(),
    currentStepIndex,
    
    // Actions
    startLoading,
    completeLoading,
    resetLoading,
    startStep,
    updateStepProgress,
    markStepCompleted,
    markStepError,
    
    // Getters
    getCurrentStep,
    getStepByIndex,
    getStepById,
    
    // Stats
    completedStepsCount: steps.filter(s => s.status === 'completed').length,
    errorStepsCount: steps.filter(s => s.status === 'error').length,
    totalSteps: steps.length
  };
};
