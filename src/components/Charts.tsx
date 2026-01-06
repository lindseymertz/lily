import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import type { ServiceRequest, Vertical, Status, IssueCategory, AccountHealth } from '../data/types';
import { useFilters } from '../contexts/FilterContext';

interface ChartsProps {
  data: ServiceRequest[];
}

const COLORS: Record<string, string> = {
  Restaurant: '#3B82F6',
  Fuel: '#10B981',
  Grocery: '#F59E0B',
  Resolved: '#22C55E',
  'In Progress': '#EAB308',
  'API Error': '#EF4444',
  'Billing Inquiry': '#3B82F6',
  'Refund Request': '#8B5CF6',
  'Network Issues': '#F97316',
  'Software Integration': '#06B6D4',
  Advocate: '#22C55E',
  Engaged: '#3B82F6',
  Neutral: '#9CA3AF',
  Skeptic: '#F97316',
  'Churn Risk': '#EF4444',
};

const DIMMED_OPACITY = 0.3;

function ChartCard({ title, children, isActive }: { title: string; children: React.ReactNode; isActive?: boolean }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border transition-all duration-300 p-6 ${
      isActive
        ? 'border-blue-400 dark:border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/50'
        : 'border-gray-100 dark:border-gray-700'
    }`}>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
        {title}
        {isActive && (
          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full">
            Active Filter
          </span>
        )}
      </h3>
      {children}
    </div>
  );
}

export function Charts({ data }: ChartsProps) {
  const { chartFilters, setChartFilter, clearChartFilters, hasActiveChartFilters, dateRange } = useFilters();

  const filteredData = useMemo(() => {
    let result = data;

    if (dateRange.preset !== 'all' && (dateRange.start || dateRange.end)) {
      result = result.filter(d => {
        const date = new Date(d.requestDate);
        if (dateRange.start && date < dateRange.start) return false;
        if (dateRange.end && date > dateRange.end) return false;
        return true;
      });
    }

    return result;
  }, [data, dateRange]);

  const verticalData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach(item => {
      counts[item.vertical] = (counts[item.vertical] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach(item => {
      counts[item.status] = (counts[item.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach(item => {
      counts[item.issueCategory] = (counts[item.issueCategory] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const healthData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach(item => {
      counts[item.accountHealth] = (counts[item.accountHealth] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const avgResolutionByVertical = useMemo(() => {
    const totals: Record<string, { sum: number; count: number }> = {};
    filteredData.forEach(item => {
      if (!totals[item.vertical]) {
        totals[item.vertical] = { sum: 0, count: 0 };
      }
      totals[item.vertical].sum += item.timeToResolution;
      totals[item.vertical].count += 1;
    });
    return Object.entries(totals).map(([name, { sum, count }]) => ({
      name,
      value: Math.round(sum / count)
    }));
  }, [filteredData]);

  const handleVerticalClick = (entry: { name?: string }) => {
    if (!entry.name) return;
    if (chartFilters.vertical === entry.name) {
      setChartFilter('vertical', null);
    } else {
      setChartFilter('vertical', entry.name as Vertical);
    }
  };

  const handleStatusClick = (entry: { name?: string }) => {
    if (!entry.name) return;
    if (chartFilters.status === entry.name) {
      setChartFilter('status', null);
    } else {
      setChartFilter('status', entry.name as Status);
    }
  };

  const handleCategoryClick = (entry: { name?: string }) => {
    if (!entry.name) return;
    if (chartFilters.issueCategory === entry.name) {
      setChartFilter('issueCategory', null);
    } else {
      setChartFilter('issueCategory', entry.name as IssueCategory);
    }
  };

  const handleHealthClick = (entry: { name?: string }) => {
    if (!entry.name) return;
    if (chartFilters.accountHealth === entry.name) {
      setChartFilter('accountHealth', null);
    } else {
      setChartFilter('accountHealth', entry.name as AccountHealth);
    }
  };

  const getBarOpacity = (name: string, activeFilter: string | null) => {
    if (!activeFilter) return 1;
    return name === activeFilter ? 1 : DIMMED_OPACITY;
  };

  const tooltipStyle = {
    backgroundColor: 'white',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  };

  return (
    <div className="mb-8">
      {hasActiveChartFilters && (
        <div className="mb-4 flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="text-sm text-blue-700 dark:text-blue-300">
            Chart filters active:
            {chartFilters.vertical && <span className="ml-2 font-medium">{chartFilters.vertical}</span>}
            {chartFilters.status && <span className="ml-2 font-medium">{chartFilters.status}</span>}
            {chartFilters.issueCategory && <span className="ml-2 font-medium">{chartFilters.issueCategory}</span>}
            {chartFilters.accountHealth && <span className="ml-2 font-medium">{chartFilters.accountHealth}</span>}
          </span>
          <button
            onClick={clearChartFilters}
            className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear chart filters
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <ChartCard title="Requests by Vertical" isActive={!!chartFilters.vertical}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={verticalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:opacity-20" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} className="dark:fill-gray-400" />
              <YAxis tick={{ fontSize: 12 }} className="dark:fill-gray-400" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar
                dataKey="value"
                radius={[4, 4, 0, 0]}
                cursor="pointer"
                onClick={(data) => handleVerticalClick(data)}
              >
                {verticalData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[entry.name] || '#6B7280'}
                    opacity={getBarOpacity(entry.name, chartFilters.vertical)}
                    className="transition-opacity duration-200"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Status Breakdown" isActive={!!chartFilters.status}>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={false}
                cursor="pointer"
                onClick={(data) => handleStatusClick(data)}
              >
                {statusData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[entry.name] || '#6B7280'}
                    opacity={getBarOpacity(entry.name, chartFilters.status)}
                    className="transition-opacity duration-200"
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Issue Category Distribution" isActive={!!chartFilters.issueCategory}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:opacity-20" />
              <XAxis type="number" tick={{ fontSize: 12 }} className="dark:fill-gray-400" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} className="dark:fill-gray-400" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar
                dataKey="value"
                radius={[0, 4, 4, 0]}
                cursor="pointer"
                onClick={(data) => handleCategoryClick(data)}
              >
                {categoryData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[entry.name] || '#6B7280'}
                    opacity={getBarOpacity(entry.name, chartFilters.issueCategory)}
                    className="transition-opacity duration-200"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Account Health Distribution" isActive={!!chartFilters.accountHealth}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={healthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:opacity-20" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={50} className="dark:fill-gray-400" />
              <YAxis tick={{ fontSize: 12 }} className="dark:fill-gray-400" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar
                dataKey="value"
                radius={[4, 4, 0, 0]}
                cursor="pointer"
                onClick={(data) => handleHealthClick(data)}
              >
                {healthData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[entry.name] || '#6B7280'}
                    opacity={getBarOpacity(entry.name, chartFilters.accountHealth)}
                    className="transition-opacity duration-200"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Avg Resolution Time by Vertical (hours)" isActive={!!chartFilters.vertical}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={avgResolutionByVertical}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:opacity-20" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} className="dark:fill-gray-400" />
              <YAxis tick={{ fontSize: 12 }} className="dark:fill-gray-400" />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => [`${value}h`, 'Avg Resolution']}
              />
              <Bar
                dataKey="value"
                radius={[4, 4, 0, 0]}
                cursor="pointer"
                onClick={(data) => handleVerticalClick(data)}
              >
                {avgResolutionByVertical.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[entry.name] || '#6B7280'}
                    opacity={getBarOpacity(entry.name, chartFilters.vertical)}
                    className="transition-opacity duration-200"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
