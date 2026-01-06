import { useState, useEffect, useMemo, useCallback } from 'react';
import { serviceRequests } from './data/data';
import { KPICards } from './components/KPICards';
import { Charts } from './components/Charts';
import { DataTable } from './components/DataTable';
import { CommandPalette } from './components/CommandPalette';
import { DateRangePicker } from './components/DateRangePicker';
import { FilterPresets } from './components/FilterPresets';
import { SLASettings } from './components/SLASettings';
import { KPICardsSkeleton, ChartsSkeleton, TableSkeleton } from './components/LoadingSkeletons';
import { DarkModeProvider, useDarkMode } from './contexts/DarkModeContext';
import { FilterProvider, useFilters } from './contexts/FilterContext';
import { SLAProvider } from './contexts/SLAContext';
import { exportToCSV, exportToExcel } from './utils/export';
import type { ServiceRequest } from './data/types';

function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}

function ExportButtons({ data }: { data: ServiceRequest[] }) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => exportToCSV(data)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export CSV
      </button>
      <button
        onClick={() => exportToExcel(data)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export Excel
      </button>
    </div>
  );
}

function DashboardContent() {
  const [isLoading, setIsLoading] = useState(true);
  const { chartFilters, dateRange } = useFilters();

  // Simulate initial data loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Filter data based on current filters for export
  const filteredData = useMemo(() => {
    let result = serviceRequests;

    // Date range filter
    if (dateRange.preset !== 'all' && (dateRange.start || dateRange.end)) {
      result = result.filter(d => {
        const date = new Date(d.requestDate);
        if (dateRange.start && date < dateRange.start) return false;
        if (dateRange.end && date > dateRange.end) return false;
        return true;
      });
    }

    // Chart filters
    if (chartFilters.vertical) {
      result = result.filter(d => d.vertical === chartFilters.vertical);
    }
    if (chartFilters.status) {
      result = result.filter(d => d.status === chartFilters.status);
    }
    if (chartFilters.issueCategory) {
      result = result.filter(d => d.issueCategory === chartFilters.issueCategory);
    }
    if (chartFilters.accountHealth) {
      result = result.filter(d => d.accountHealth === chartFilters.accountHealth);
    }

    return result;
  }, [chartFilters, dateRange]);

  const handleExportCSV = useCallback(() => {
    exportToCSV(filteredData);
  }, [filteredData]);

  const handleExportExcel = useCallback(() => {
    exportToExcel(filteredData);
  }, [filteredData]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <CommandPalette onExportCSV={handleExportCSV} onExportExcel={handleExportExcel} />

      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">B2B Customer Service Dashboard</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Service request analytics and tracking</p>
            </div>
            <div className="flex items-center gap-3">
              <kbd className="hidden md:inline-flex items-center px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                ⌘K
              </kbd>
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-6 py-6">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <DateRangePicker />
          <FilterPresets />
          <SLASettings />
          <div className="flex-1" />
          <ExportButtons data={filteredData} />
        </div>

        {/* KPI Cards */}
        {isLoading ? (
          <KPICardsSkeleton />
        ) : (
          <KPICards data={serviceRequests} />
        )}

        {/* Charts */}
        {isLoading ? (
          <ChartsSkeleton />
        ) : (
          <Charts data={serviceRequests} />
        )}

        {/* Data Table */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Service Requests</h2>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <DataTable data={serviceRequests} />
          )}
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-8 transition-colors duration-300">
        <div className="max-w-[1800px] mx-auto px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
          B2B Customer Service Dashboard
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <DarkModeProvider>
      <FilterProvider>
        <SLAProvider>
          <DashboardContent />
        </SLAProvider>
      </FilterProvider>
    </DarkModeProvider>
  );
}

export default App;
