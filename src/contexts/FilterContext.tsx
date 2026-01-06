import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Vertical, Status, IssueCategory, AccountHealth } from '../data/types';

export interface DateRange {
  start: Date | null;
  end: Date | null;
  preset: 'last7' | 'last30' | 'last90' | 'ytd' | 'custom' | 'all';
}

export interface ChartFilters {
  vertical: Vertical | null;
  status: Status | null;
  issueCategory: IssueCategory | null;
  accountHealth: AccountHealth | null;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: ChartFilters;
  dateRange: DateRange;
}

interface FilterContextType {
  chartFilters: ChartFilters;
  setChartFilter: <K extends keyof ChartFilters>(key: K, value: ChartFilters[K]) => void;
  clearChartFilters: () => void;
  hasActiveChartFilters: boolean;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  presets: FilterPreset[];
  savePreset: (name: string) => void;
  loadPreset: (id: string) => void;
  deletePreset: (id: string) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

const defaultDateRange: DateRange = {
  start: null,
  end: null,
  preset: 'all'
};

const defaultChartFilters: ChartFilters = {
  vertical: null,
  status: null,
  issueCategory: null,
  accountHealth: null
};

export function FilterProvider({ children }: { children: ReactNode }) {
  const [chartFilters, setChartFilters] = useState<ChartFilters>(defaultChartFilters);
  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange);
  const [presets, setPresets] = useState<FilterPreset[]>(() => {
    const saved = localStorage.getItem('filterPresets');
    return saved ? JSON.parse(saved) : [];
  });

  const setChartFilter = useCallback(<K extends keyof ChartFilters>(key: K, value: ChartFilters[K]) => {
    setChartFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearChartFilters = useCallback(() => {
    setChartFilters(defaultChartFilters);
  }, []);

  const hasActiveChartFilters = Object.values(chartFilters).some(v => v !== null);

  const savePreset = useCallback((name: string) => {
    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name,
      filters: chartFilters,
      dateRange
    };
    const updated = [...presets, newPreset];
    setPresets(updated);
    localStorage.setItem('filterPresets', JSON.stringify(updated));
  }, [chartFilters, dateRange, presets]);

  const loadPreset = useCallback((id: string) => {
    const preset = presets.find(p => p.id === id);
    if (preset) {
      setChartFilters(preset.filters);
      setDateRange(preset.dateRange);
    }
  }, [presets]);

  const deletePreset = useCallback((id: string) => {
    const updated = presets.filter(p => p.id !== id);
    setPresets(updated);
    localStorage.setItem('filterPresets', JSON.stringify(updated));
  }, [presets]);

  return (
    <FilterContext.Provider value={{
      chartFilters,
      setChartFilter,
      clearChartFilters,
      hasActiveChartFilters,
      dateRange,
      setDateRange,
      presets,
      savePreset,
      loadPreset,
      deletePreset
    }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}
