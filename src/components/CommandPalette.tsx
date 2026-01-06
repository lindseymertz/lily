import { useState, useEffect, useCallback, useRef } from 'react';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useFilters } from '../contexts/FilterContext';
import type { Vertical, Status } from '../data/types';

interface Command {
  id: string;
  label: string;
  category: string;
  action: () => void;
  shortcut?: string;
}

interface CommandPaletteProps {
  onExportCSV: () => void;
  onExportExcel: () => void;
}

export function CommandPalette({ onExportCSV, onExportExcel }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { setChartFilter, clearChartFilters } = useFilters();

  const commands: Command[] = [
    // Dark mode
    {
      id: 'toggle-dark',
      label: isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      category: 'Appearance',
      action: toggleDarkMode,
      shortcut: '⌘D'
    },
    // Filters - Verticals
    {
      id: 'filter-restaurant',
      label: 'Filter by Restaurant',
      category: 'Quick Filters',
      action: () => setChartFilter('vertical', 'Restaurant' as Vertical)
    },
    {
      id: 'filter-fuel',
      label: 'Filter by Fuel',
      category: 'Quick Filters',
      action: () => setChartFilter('vertical', 'Fuel' as Vertical)
    },
    {
      id: 'filter-grocery',
      label: 'Filter by Grocery',
      category: 'Quick Filters',
      action: () => setChartFilter('vertical', 'Grocery' as Vertical)
    },
    // Filters - Status
    {
      id: 'filter-resolved',
      label: 'Filter by Resolved',
      category: 'Quick Filters',
      action: () => setChartFilter('status', 'Resolved' as Status)
    },
    {
      id: 'filter-in-progress',
      label: 'Filter by In Progress',
      category: 'Quick Filters',
      action: () => setChartFilter('status', 'In Progress' as Status)
    },
    // Clear filters
    {
      id: 'clear-filters',
      label: 'Clear All Filters',
      category: 'Quick Filters',
      action: clearChartFilters,
      shortcut: '⌘⇧C'
    },
    // Export
    {
      id: 'export-csv',
      label: 'Export to CSV',
      category: 'Export',
      action: onExportCSV,
      shortcut: '⌘E'
    },
    {
      id: 'export-excel',
      label: 'Export to Excel',
      category: 'Export',
      action: onExportExcel,
      shortcut: '⌘⇧E'
    }
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsOpen(prev => !prev);
      setSearch('');
      setSelectedIndex(0);
    }
    if (isOpen) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        e.preventDefault();
        filteredCommands[selectedIndex].action();
        setIsOpen(false);
      }
    }
  }, [isOpen, filteredCommands, selectedIndex]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  if (!isOpen) return null;

  let flatIndex = -1;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={() => setIsOpen(false)}
      />
      <div className="relative min-h-screen flex items-start justify-center pt-[15vh] px-4">
        <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden transition-all transform">
          <div className="flex items-center px-4 border-b border-gray-200 dark:border-gray-700">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a command or search..."
              className="w-full px-4 py-4 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-700 rounded">
              ESC
            </kbd>
          </div>

          <div className="max-h-80 overflow-y-auto py-2">
            {Object.entries(groupedCommands).map(([category, cmds]) => (
              <div key={category}>
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {category}
                </div>
                {cmds.map((cmd) => {
                  flatIndex++;
                  const isSelected = flatIndex === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      className={`w-full px-4 py-2 flex items-center justify-between text-left transition-colors ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => {
                        cmd.action();
                        setIsOpen(false);
                      }}
                    >
                      <span>{cmd.label}</span>
                      {cmd.shortcut && (
                        <kbd className="text-xs font-medium text-gray-400 dark:text-gray-500">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
            {filteredCommands.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                No commands found
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">↵</kbd>
                to select
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">⌘K</kbd>
              to toggle
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
