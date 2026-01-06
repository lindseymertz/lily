import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import type { ServiceRequest } from '../data/types';

export interface SLAThresholds {
  responseTimeHours: number;
  resolutionTimeHours: number;
}

interface SLAContextType {
  thresholds: SLAThresholds;
  setThresholds: (thresholds: SLAThresholds) => void;
  isBreachingResponse: (request: ServiceRequest) => boolean;
  isBreachingResolution: (request: ServiceRequest) => boolean;
  isBreachingSLA: (request: ServiceRequest) => boolean;
  getBreachCount: (data: ServiceRequest[]) => number;
}

const SLAContext = createContext<SLAContextType | undefined>(undefined);

const defaultThresholds: SLAThresholds = {
  responseTimeHours: 12,
  resolutionTimeHours: 72
};

export function SLAProvider({ children }: { children: ReactNode }) {
  const [thresholds, setThresholds] = useState<SLAThresholds>(() => {
    const saved = localStorage.getItem('slaThresholds');
    return saved ? JSON.parse(saved) : defaultThresholds;
  });

  useEffect(() => {
    localStorage.setItem('slaThresholds', JSON.stringify(thresholds));
  }, [thresholds]);

  const isBreachingResponse = (request: ServiceRequest) => {
    return request.timeToRespond > thresholds.responseTimeHours;
  };

  const isBreachingResolution = (request: ServiceRequest) => {
    return request.timeToResolution > thresholds.resolutionTimeHours;
  };

  const isBreachingSLA = (request: ServiceRequest) => {
    return isBreachingResponse(request) || isBreachingResolution(request);
  };

  const getBreachCount = (data: ServiceRequest[]) => {
    return data.filter(isBreachingSLA).length;
  };

  const value = useMemo(() => ({
    thresholds,
    setThresholds,
    isBreachingResponse,
    isBreachingResolution,
    isBreachingSLA,
    getBreachCount
  }), [thresholds]);

  return (
    <SLAContext.Provider value={value}>
      {children}
    </SLAContext.Provider>
  );
}

export function useSLA() {
  const context = useContext(SLAContext);
  if (!context) {
    throw new Error('useSLA must be used within a SLAProvider');
  }
  return context;
}
