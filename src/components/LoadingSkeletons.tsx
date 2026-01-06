export function KPICardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 animate-pulse">
      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
      <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
      <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="mt-4 h-12 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  );
}

export function KPICardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 mb-8">
      {Array.from({ length: 7 }).map((_, i) => (
        <KPICardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 animate-pulse">
      <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
      <div className="h-[250px] bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  );
}

export function ChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
      {Array.from({ length: 5 }).map((_, i) => (
        <ChartSkeleton key={i} />
      ))}
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" /></td>
      <td className="px-4 py-3"><div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" /></td>
      <td className="px-4 py-3"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" /></td>
      <td className="px-4 py-3"><div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" /></td>
      <td className="px-4 py-3"><div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" /></td>
      <td className="px-4 py-3"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" /></td>
      <td className="px-4 py-3"><div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" /></td>
      <td className="px-4 py-3"><div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" /></td>
      <td className="px-4 py-3"><div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" /></td>
    </tr>
  );
}

export function TableSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            {Array.from({ length: 9 }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 10 }).map((_, i) => (
            <TableRowSkeleton key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
