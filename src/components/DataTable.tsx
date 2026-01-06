import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { ServiceRequest, Vertical, Status, IssueCategory, Urgency, Priority, AccountHealth } from '../data/types';
import { useFilters } from '../contexts/FilterContext';
import { useSLA } from '../contexts/SLAContext';

interface DataTableProps {
  data: ServiceRequest[];
}

type SortKey = keyof ServiceRequest;
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 50;

function getStatusColor(status: Status): string {
  return status === 'Resolved'
    ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
}

function getAccountHealthColor(health: AccountHealth): string {
  switch (health) {
    case 'Advocate': return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
    case 'Engaged': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
    case 'Neutral': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    case 'Skeptic': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300';
    case 'Churn Risk': return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}

function getUrgencyColor(urgency: Urgency): string {
  switch (urgency) {
    case 'High': return 'text-red-600 dark:text-red-400';
    case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
    case 'Low': return 'text-green-600 dark:text-green-400';
    default: return 'text-gray-600 dark:text-gray-400';
  }
}

interface ExpandedRowProps {
  item: ServiceRequest;
  onAction: (action: string, item: ServiceRequest) => void;
}

function ExpandedRow({ item, onAction }: ExpandedRowProps) {
  return (
    <tr className="bg-gray-50 dark:bg-gray-900/50">
      <td colSpan={10} className="px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Request Details</h4>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Request Date:</dt>
                <dd className="text-gray-900 dark:text-white font-medium">{new Date(item.requestDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Resolution Date:</dt>
                <dd className="text-gray-900 dark:text-white font-medium">{new Date(item.resolutionDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Site Count:</dt>
                <dd className="text-gray-900 dark:text-white font-medium">{item.siteCount.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Priority:</dt>
                <dd className="text-gray-900 dark:text-white font-medium">{item.priority}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Notes</h4>
            <div className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 min-h-[80px]">
              <em>No notes available for this request.</em>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Quick Actions</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onAction('resolve', item)}
                className="px-3 py-1.5 text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900/60 transition-colors"
              >
                Mark Resolved
              </button>
              <button
                onClick={() => onAction('escalate', item)}
                className="px-3 py-1.5 text-xs font-medium bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded-md hover:bg-orange-200 dark:hover:bg-orange-900/60 transition-colors"
              >
                Escalate
              </button>
              <button
                onClick={() => onAction('note', item)}
                className="px-3 py-1.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
              >
                Add Note
              </button>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

export function DataTable({ data }: DataTableProps) {
  const [search, setSearch] = useState('');
  const [verticalFilter, setVerticalFilter] = useState<Vertical | ''>('');
  const [statusFilter, setStatusFilter] = useState<Status | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | ''>('');
  const [urgencyFilter, setUrgencyFilter] = useState<Urgency | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | ''>('');
  const [healthFilter, setHealthFilter] = useState<AccountHealth | ''>('');
  const [sortKey, setSortKey] = useState<SortKey>('requestDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [focusedRowIndex, setFocusedRowIndex] = useState<number>(-1);

  const tableRef = useRef<HTMLTableElement>(null);
  const { chartFilters, dateRange } = useFilters();
  const { isBreachingSLA, isBreachingResponse, isBreachingResolution } = useSLA();

  // Sync chart filters with local filters
  useEffect(() => {
    if (chartFilters.vertical) {
      setVerticalFilter(chartFilters.vertical);
    }
    if (chartFilters.status) {
      setStatusFilter(chartFilters.status);
    }
    if (chartFilters.issueCategory) {
      setCategoryFilter(chartFilters.issueCategory);
    }
    if (chartFilters.accountHealth) {
      setHealthFilter(chartFilters.accountHealth);
    }
  }, [chartFilters]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Date range filter
      if (dateRange.preset !== 'all' && (dateRange.start || dateRange.end)) {
        const date = new Date(item.requestDate);
        if (dateRange.start && date < dateRange.start) return false;
        if (dateRange.end && date > dateRange.end) return false;
      }

      const matchesSearch = search === '' ||
        item.accountName.toLowerCase().includes(search.toLowerCase()) ||
        item.requestId.toLowerCase().includes(search.toLowerCase());

      const matchesVertical = verticalFilter === '' || item.vertical === verticalFilter;
      const matchesStatus = statusFilter === '' || item.status === statusFilter;
      const matchesCategory = categoryFilter === '' || item.issueCategory === categoryFilter;
      const matchesUrgency = urgencyFilter === '' || item.urgency === urgencyFilter;
      const matchesPriority = priorityFilter === '' || item.priority === priorityFilter;
      const matchesHealth = healthFilter === '' || item.accountHealth === healthFilter;

      // Chart filters (override local filters if set)
      const matchesChartVertical = !chartFilters.vertical || item.vertical === chartFilters.vertical;
      const matchesChartStatus = !chartFilters.status || item.status === chartFilters.status;
      const matchesChartCategory = !chartFilters.issueCategory || item.issueCategory === chartFilters.issueCategory;
      const matchesChartHealth = !chartFilters.accountHealth || item.accountHealth === chartFilters.accountHealth;

      return matchesSearch && matchesVertical && matchesStatus && matchesCategory &&
             matchesUrgency && matchesPriority && matchesHealth &&
             matchesChartVertical && matchesChartStatus && matchesChartCategory && matchesChartHealth;
    });
  }, [data, search, verticalFilter, statusFilter, categoryFilter, urgencyFilter, priorityFilter, healthFilter, chartFilters, dateRange]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }, [filteredData, sortKey, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const toggleRowExpansion = (requestId: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(requestId)) {
        next.delete(requestId);
      } else {
        next.add(requestId);
      }
      return next;
    });
  };

  const handleRowAction = (action: string, item: ServiceRequest) => {
    // Placeholder actions - in a real app these would trigger API calls
    console.log(`Action: ${action} on ${item.requestId}`);
    alert(`${action.charAt(0).toUpperCase() + action.slice(1)} action triggered for ${item.requestId}`);
  };

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (paginatedData.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedRowIndex(prev => Math.min(prev + 1, paginatedData.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedRowIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        if (focusedRowIndex >= 0 && focusedRowIndex < paginatedData.length) {
          e.preventDefault();
          toggleRowExpansion(paginatedData[focusedRowIndex].requestId);
        }
        break;
      case 'Escape':
        setFocusedRowIndex(-1);
        break;
    }
  }, [paginatedData, focusedRowIndex]);

  // Scroll focused row into view
  useEffect(() => {
    if (focusedRowIndex >= 0 && tableRef.current) {
      const rows = tableRef.current.querySelectorAll('tbody tr:not(.expanded-row)');
      if (rows[focusedRowIndex]) {
        rows[focusedRowIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [focusedRowIndex]);

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return <span className="text-gray-300 dark:text-gray-600 ml-1">↕</span>;
    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  const selectClasses = "px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white";

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search by account name or request ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
          />

          <select
            value={verticalFilter}
            onChange={(e) => { setVerticalFilter(e.target.value as Vertical | ''); setCurrentPage(1); }}
            className={selectClasses}
          >
            <option value="">All Verticals</option>
            <option value="Restaurant">Restaurant</option>
            <option value="Fuel">Fuel</option>
            <option value="Grocery">Grocery</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as Status | ''); setCurrentPage(1); }}
            className={selectClasses}
          >
            <option value="">All Status</option>
            <option value="Resolved">Resolved</option>
            <option value="In Progress">In Progress</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value as IssueCategory | ''); setCurrentPage(1); }}
            className={selectClasses}
          >
            <option value="">All Categories</option>
            <option value="API Error">API Error</option>
            <option value="Billing Inquiry">Billing Inquiry</option>
            <option value="Refund Request">Refund Request</option>
            <option value="Network Issues">Network Issues</option>
            <option value="Software Integration">Software Integration</option>
          </select>

          <select
            value={urgencyFilter}
            onChange={(e) => { setUrgencyFilter(e.target.value as Urgency | ''); setCurrentPage(1); }}
            className={selectClasses}
          >
            <option value="">All Urgency</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value as Priority | ''); setCurrentPage(1); }}
            className={selectClasses}
          >
            <option value="">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={healthFilter}
            onChange={(e) => { setHealthFilter(e.target.value as AccountHealth | ''); setCurrentPage(1); }}
            className={selectClasses}
          >
            <option value="">All Account Health</option>
            <option value="Advocate">Advocate</option>
            <option value="Engaged">Engaged</option>
            <option value="Neutral">Neutral</option>
            <option value="Skeptic">Skeptic</option>
            <option value="Churn Risk">Churn Risk</option>
          </select>
        </div>

        <div className="mt-3 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>Showing {paginatedData.length} of {sortedData.length} results</span>
          <span className="text-xs">Use ↑↓ to navigate, Enter to expand, Esc to unfocus</span>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table ref={tableRef} className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300 w-8"></th>
              <th
                className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('requestId')}
              >
                Request ID <SortIcon columnKey="requestId" />
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('accountName')}
              >
                Account <SortIcon columnKey="accountName" />
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('vertical')}
              >
                Vertical <SortIcon columnKey="vertical" />
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('issueCategory')}
              >
                Issue <SortIcon columnKey="issueCategory" />
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('status')}
              >
                Status <SortIcon columnKey="status" />
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('urgency')}
              >
                Urgency <SortIcon columnKey="urgency" />
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('timeToRespond')}
              >
                Response <SortIcon columnKey="timeToRespond" />
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('timeToResolution')}
              >
                Resolution <SortIcon columnKey="timeToResolution" />
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('accountHealth')}
              >
                Health <SortIcon columnKey="accountHealth" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {paginatedData.map((item, index) => (
              <React.Fragment key={item.requestId}>
                <tr
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                    focusedRowIndex === index ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-inset ring-blue-400' : ''
                  } ${isBreachingSLA(item) ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}
                  onClick={() => toggleRowExpansion(item.requestId)}
                >
                  <td className="px-4 py-3">
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${expandedRows.has(item.requestId) ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-900 dark:text-white">
                    {item.requestId}
                    {isBreachingSLA(item) && (
                      <span className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded">
                        SLA
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.accountName}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.vertical}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.issueCategory}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className={`px-4 py-3 font-medium ${getUrgencyColor(item.urgency)}`}>
                    {item.urgency}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    <span className={isBreachingResponse(item) ? 'text-red-600 dark:text-red-400 font-semibold' : ''}>
                      {item.timeToRespond}h
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    <span className={isBreachingResolution(item) ? 'text-red-600 dark:text-red-400 font-semibold' : ''}>
                      {item.timeToResolution}h
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccountHealthColor(item.accountHealth)}`}>
                      {item.accountHealth}
                    </span>
                  </td>
                </tr>
                {expandedRows.has(item.requestId) && (
                  <ExpandedRow item={item} onAction={handleRowAction} />
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
