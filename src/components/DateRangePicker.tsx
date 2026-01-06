import { useState, useRef, useEffect } from 'react';
import { useFilters, DateRange } from '../contexts/FilterContext';

export function DateRangePicker() {
  const { dateRange, setDateRange } = useFilters();
  const [isOpen, setIsOpen] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPresetDates = (preset: DateRange['preset']): { start: Date | null; end: Date | null } => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (preset) {
      case 'last7': {
        const start = new Date(today);
        start.setDate(start.getDate() - 7);
        return { start, end: today };
      }
      case 'last30': {
        const start = new Date(today);
        start.setDate(start.getDate() - 30);
        return { start, end: today };
      }
      case 'last90': {
        const start = new Date(today);
        start.setDate(start.getDate() - 90);
        return { start, end: today };
      }
      case 'ytd': {
        const start = new Date(now.getFullYear(), 0, 1);
        return { start, end: today };
      }
      default:
        return { start: null, end: null };
    }
  };

  const handlePresetSelect = (preset: DateRange['preset']) => {
    if (preset === 'custom') {
      return;
    }
    const dates = getPresetDates(preset);
    setDateRange({ ...dates, preset });
    if (preset !== 'custom') {
      setIsOpen(false);
    }
  };

  const handleCustomApply = () => {
    const start = customStart ? new Date(customStart) : null;
    const end = customEnd ? new Date(customEnd) : null;
    setDateRange({ start, end, preset: 'custom' });
    setIsOpen(false);
  };

  const getDisplayLabel = () => {
    switch (dateRange.preset) {
      case 'last7':
        return 'Last 7 days';
      case 'last30':
        return 'Last 30 days';
      case 'last90':
        return 'Last 90 days';
      case 'ytd':
        return 'Year to date';
      case 'custom':
        if (dateRange.start && dateRange.end) {
          return `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`;
        }
        return 'Custom range';
      default:
        return 'All time';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{getDisplayLabel()}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
          <div className="p-2">
            {[
              { preset: 'all' as const, label: 'All time' },
              { preset: 'last7' as const, label: 'Last 7 days' },
              { preset: 'last30' as const, label: 'Last 30 days' },
              { preset: 'last90' as const, label: 'Last 90 days' },
              { preset: 'ytd' as const, label: 'Year to date' }
            ].map(({ preset, label }) => (
              <button
                key={preset}
                onClick={() => handlePresetSelect(preset)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  dateRange.preset === preset
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 p-3">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Custom Range
            </div>
            <div className="flex gap-2 mb-3">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-400 self-center">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleCustomApply}
              disabled={!customStart || !customEnd}
              className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Apply Custom Range
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
