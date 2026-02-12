export interface Column<T> {
  key: string
  title: string
  width?: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  render?: (value: any, row: T, index: number) => React.ReactNode
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  empty?: React.ReactNode
  onRowClick?: (row: T, index: number) => void
  onSort?: (column: string, direction: 'asc' | 'desc') => void
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  loading,
  empty,
  onRowClick,
  onSort,
  sortColumn,
  sortDirection
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="w-full p-8 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="w-full p-8 text-center">
        {empty || (
          <div>
            <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400">暂无数据</p>
          </div>
        )}
      </div>
    )
  }

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  const handleSort = (column: Column<T>) => {
    if (!column.sortable || !onSort) return

    const direction =
      sortColumn === column.key && sortDirection === 'asc' ? 'desc' : 'asc'
    onSort(column.key, direction)
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800">
            {columns.map((column) => (
              <th
                key={column.key}
                style={{ width: column.width }}
                onClick={() => handleSort(column)}
                className={`
                  px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300
                  ${alignClasses[column.align || 'left']}
                  ${column.sortable && onSort ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors' : ''}
                `}
              >
                <div className="flex items-center gap-2">
                  <span>{column.title}</span>
                  {column.sortable && sortColumn === column.key && (
                    <svg className={`w-3 h-3 transition-transform duration-200 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              onClick={() => onRowClick?.(row, index)}
              className={`
                border-b border-gray-200 dark:border-gray-700
                ${onRowClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors' : ''}
              `}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`
                    px-4 py-3 text-sm text-gray-900 dark:text-gray-100
                    ${alignClasses[column.align || 'left']}
                  `}
                >
                  {column.render ? column.render(row[column.key], row, index) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
