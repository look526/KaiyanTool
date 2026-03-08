import React, { useState, useMemo, useCallback } from 'react';
import { ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';

export interface Column<T = any> {
  key: string;
  title: string;
  dataIndex?: string;
  width?: string | number;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  fixed?: 'left' | 'right' | boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  className?: string;
}

export interface TableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  rowKey?: string | ((record: T) => string);
  loading?: boolean;
  bordered?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  size?: 'small' | 'medium' | 'large';
  showHeader?: boolean;
  emptyText?: React.ReactNode;
  pagination?: boolean | {
    pageSize?: number;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    pageSizeOptions?: number[];
    total?: number;
    current?: number;
    onChange?: (page: number, pageSize: number) => void;
    onShowSizeChange?: (current: number, size: number) => void;
  };
  rowSelection?: boolean | {
    selectedRowKeys?: string[];
    onChange?: (selectedRowKeys: string[], selectedRows: T[]) => void;
    onSelect?: (record: T, selected: boolean, selectedRows: T[]) => void;
    getCheckboxProps?: (record: T) => { disabled?: boolean; };
  };
  onRow?: (record: T, index: number) => {
    onClick?: (e: React.MouseEvent) => void;
    onDoubleClick?: (e: React.MouseEvent) => void;
    onMouseEnter?: (e: React.MouseEvent) => void;
    onMouseLeave?: (e: React.MouseEvent) => void;
    style?: React.CSSProperties;
    className?: string;
  };
  className?: string;
  scroll?: {
    x?: number | string;
    y?: number | string;
  };
}

type SortDirection = 'ascend' | 'descend' | null;

interface SorterState {
  columnKey: string | null;
  direction: SortDirection;
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  rowKey = 'id',
  loading = false,
  bordered = false,
  striped = false,
  hoverable = true,
  size = 'medium',
  showHeader = true,
  emptyText = '暂无数据',
  pagination = false,
  rowSelection,
  onRow,
  className,
  scroll,
}: TableProps<T>) {
  const [sorter, setSorter] = useState<SorterState>({ columnKey: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  const isPagination = pagination === true || (typeof pagination === 'object');
  const paginationConfig = typeof pagination === 'object' ? pagination : {};

  const getRowKey = useCallback((record: T) => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey] as string;
  }, [rowKey]);

  const sortedData = useMemo(() => {
    const result = [...data];

    if (sorter.columnKey && sorter.direction) {
      result.sort((a, b) => {
        const aValue = a[sorter.columnKey!];
        const bValue = b[sorter.columnKey!];

        if (aValue === bValue) return 0;

        const comparison = typeof aValue === 'number' && typeof bValue === 'number'
          ? aValue - bValue
          : String(aValue).localeCompare(String(bValue));

        return sorter.direction === 'ascend' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, sorter]);

  const paginatedData = useMemo(() => {
    if (!isPagination) return sortedData;

    const effectivePageSize = paginationConfig.pageSize || pageSize;
    const start = (currentPage - 1) * effectivePageSize;
    return sortedData.slice(start, start + effectivePageSize);
  }, [sortedData, isPagination, currentPage, pageSize, paginationConfig]);

  const totalPages = useMemo(() => {
    if (!isPagination) return 1;
    const effectivePageSize = paginationConfig.pageSize || pageSize;
    return Math.ceil(sortedData.length / effectivePageSize);
  }, [sortedData, isPagination, pageSize, paginationConfig]);

  const handleSort = (columnKey: string) => {
    setSorter(prev => ({
      columnKey,
      direction: prev.columnKey === columnKey
        ? prev.direction === 'ascend' ? 'descend' : 'ascend'
        : 'ascend'
    }));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allKeys = paginatedData.map(record => getRowKey(record));
      const enabledKeys = allKeys.filter(key => {
        const props = (rowSelection as any)?.getCheckboxProps?.(paginatedData.find(r => getRowKey(r) === key)) || {};
        return !props?.disabled;
      });
      setSelectedRowKeys(prev => [...new Set([...prev, ...enabledKeys])]);
    } else {
      const currentKeys = paginatedData.map(record => getRowKey(record));
      setSelectedRowKeys(prev => prev.filter(key => !currentKeys.includes(key)));
    }
  };

  const handleSelectRow = (record: T, checked: boolean) => {
    const key = getRowKey(record);
    setSelectedRowKeys(prev => {
      const newKeys = checked ? [...prev, key] : prev.filter(k => k !== key);
      (rowSelection as any)?.onChange?.(newKeys, paginatedData.filter(r => newKeys.includes(getRowKey(r))));
      return newKeys;
    });
  };

  const getCheckboxProps = (record: T) => {
    if (rowSelection && typeof rowSelection === 'object' && 'getCheckboxProps' in rowSelection) {
      return (rowSelection as any).getCheckboxProps(record);
    }
    return { disabled: false };
  };

  const isSelected = (record: T) => {
    return selectedRowKeys.includes(getRowKey(record));
  };

  const isIndeterminate = () => {
    const visibleKeys = paginatedData.map(r => getRowKey(r));
    const selectedInView = visibleKeys.filter(k => selectedRowKeys.includes(k));
    return selectedInView.length > 0 && selectedInView.length < visibleKeys.length;
  };

  const isAllSelected = () => {
    if (paginatedData.length === 0) return false;
    const visibleKeys = paginatedData.map(r => getRowKey(r));
    const enabledKeys = visibleKeys.filter(key => {
      const record = paginatedData.find(r => getRowKey(r) === key);
      return record && !getCheckboxProps(record)?.disabled;
    });
    return enabledKeys.length > 0 && enabledKeys.every(key => selectedRowKeys.includes(key));
  };

  const SIZE_CONFIG = {
    small: { height: '36px', padding: '0 12px', fontSize: '13px' },
    medium: { height: '44px', padding: '0 16px', fontSize: '14px' },
    large: { height: '52px', padding: '0 20px', fontSize: '15px' },
  };

  const renderSortIcon = (columnKey: string) => {
    if (sorter.columnKey !== columnKey) {
      return <ArrowUpDown style={{ width: '14px', height: '14px', color: 'var(--text-tertiary)', opacity: 0.5 }} />;
    }
    return sorter.direction === 'ascend'
      ? <ChevronUp style={{ width: '14px', height: '14px', color: 'var(--accent)' }} />
      : <ChevronDown style={{ width: '14px', height: '14px', color: 'var(--accent)' }} />;
  };

  const renderCell = (column: Column<T>, record: T, index: number) => {
    const value = column.dataIndex ? record[column.dataIndex] : record[column.key];
    if (column.render) {
      return column.render(value, record, index);
    }
    return value;
  };

  const renderEmpty = () => {
    if (typeof emptyText === 'string') {
      return (
        <div style={{
          padding: '48px 0',
          textAlign: 'center',
          color: 'var(--text-tertiary)',
          fontSize: '14px',
        }}>
          {emptyText}
        </div>
      );
    }
    return emptyText;
  };

  const renderPagination = () => {
    if (!isPagination) return null;

    const effectivePageSize = paginationConfig.pageSize || pageSize;
    const total = paginationConfig.total || sortedData.length;

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderTop: '1px solid var(--border-primary)',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
        }}>
          共 {total} 条
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              color: currentPage === 1 ? 'var(--text-tertiary)' : 'var(--text-primary)',
              opacity: currentPage === 1 ? 0.5 : 1,
            }}
          >
            <ChevronUp style={{ width: '16px', height: '16px', transform: 'rotate(-90deg)' }} />
          </div>
          <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
            {currentPage} / {totalPages}
          </span>
          <div
            onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              color: currentPage === totalPages ? 'var(--text-tertiary)' : 'var(--text-primary)',
              opacity: currentPage === totalPages ? 0.5 : 1,
            }}
          >
            <ChevronUp style={{ width: '16px', height: '16px', transform: 'rotate(90deg)' }} />
          </div>
          {(paginationConfig.showSizeChanger !== false) && (
            <select
              value={effectivePageSize}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                setPageSize(newSize);
                setCurrentPage(1);
                paginationConfig.onShowSizeChange?.(1, newSize);
              }}
              style={{
                height: '28px',
                padding: '0 24px 0 8px',
                fontSize: '13px',
                backgroundColor: 'var(--bg-base)',
                border: '1px solid var(--border-primary)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 6px center',
              }}
            >
              {[10, 20, 50, 100].map(size => (
                <option key={size} value={size}>{size}条/页</option>
              ))}
            </select>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={className} style={{ backgroundColor: 'var(--bg-base)', borderRadius: '8px', overflow: 'hidden' }}>
      <style>{`
        @keyframes table-enter {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        style={{
          overflow: 'auto',
          maxHeight: scroll?.y || 'none',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: SIZE_CONFIG[size].fontSize,
            animation: 'table-enter 0.2s ease-out',
          }}
        >
          {showHeader && (
            <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <tr>
                {rowSelection && (
                  <th style={{
                    width: '48px',
                    padding: '0 12px',
                    height: SIZE_CONFIG[size].height,
                    textAlign: 'center',
                    borderBottom: bordered ? '1px solid var(--border-primary)' : 'none',
                  }}>
                    <input
                      type="checkbox"
                      checked={isAllSelected()}
                      ref={(input) => {
                        if (input) {
                          input.indeterminate = isIndeterminate();
                        }
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                )}
                {columns.map(column => (
                  <th
                    key={column.key}
                    style={{
                      padding: SIZE_CONFIG[size].padding,
                      height: SIZE_CONFIG[size].height,
                      textAlign: column.align || 'left',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      width: column.width,
                      minWidth: column.minWidth,
                      borderBottom: bordered ? '1px solid var(--border-primary)' : '1px solid var(--border-secondary)',
                      cursor: column.sortable ? 'pointer' : 'default',
                    }}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: column.align === 'right' ? 'flex-end' : column.align === 'center' ? 'center' : 'flex-start', gap: '6px' }}>
                      <span>{column.title}</span>
                      {column.sortable && renderSortIcon(column.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (rowSelection ? 1 : 0)} style={{ padding: '48px 0', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-tertiary)' }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid var(--border-primary)',
                      borderTopColor: 'var(--accent)',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                    加载中...
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (rowSelection ? 1 : 0)}>
                  {renderEmpty()}
                </td>
              </tr>
            ) : (
              paginatedData.map((record, index) => {
                const rowProps = onRow?.(record, index) || {};
                const isRowSelected = isSelected(record);

                return (
                  <tr
                    key={getRowKey(record)}
                    {...rowProps}
                    onClick={(e) => rowProps.onClick?.(e)}
                    onDoubleClick={(e) => rowProps.onDoubleClick?.(e)}
                    style={{
                      ...rowProps.style,
                      backgroundColor: isRowSelected
                        ? 'var(--accent-bg)'
                        : striped && index % 2 === 1
                        ? 'var(--bg-secondary)'
                        : 'transparent',
                      cursor: hoverable ? 'pointer' : 'default',
                      transition: 'background-color 0.15s ease',
                      ...(rowProps.className && { className: rowProps.className }),
                    }}
                    onMouseEnter={(e) => {
                      if (hoverable && !isRowSelected) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                      }
                      rowProps.onMouseEnter?.(e);
                    }}
                    onMouseLeave={(e) => {
                      if (hoverable && !isRowSelected) {
                        e.currentTarget.style.backgroundColor = striped && index % 2 === 1
                          ? 'var(--bg-secondary)'
                          : 'transparent';
                      }
                      rowProps.onMouseLeave?.(e);
                    }}
                  >
                    {rowSelection && (
                      <td style={{
                        padding: '0 12px',
                        height: SIZE_CONFIG[size].height,
                        textAlign: 'center',
                        borderBottom: bordered ? '1px solid var(--border-primary)' : '1px solid var(--border-secondary)',
                      }}>
                        <input
                          type="checkbox"
                          checked={isRowSelected}
                          disabled={getCheckboxProps(record)?.disabled}
                          onChange={(e) => handleSelectRow(record, e.target.checked)}
                          style={{ cursor: getCheckboxProps(record)?.disabled ? 'not-allowed' : 'pointer' }}
                        />
                      </td>
                    )}
                    {columns.map(column => (
                      <td
                        key={column.key}
                        style={{
                          padding: SIZE_CONFIG[size].padding,
                          textAlign: column.align || 'left',
                          color: 'var(--text-primary)',
                          borderBottom: bordered ? '1px solid var(--border-primary)' : '1px solid var(--border-secondary)',
                          maxWidth: column.width,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          ...(column.fixed && {
                            position: 'sticky',
                            left: column.fixed === 'left' ? (rowSelection ? 48 : 0) : undefined,
                            right: column.fixed === 'right' ? 0 : undefined,
                            zIndex: 1,
                            backgroundColor: 'var(--bg-base)',
                          }),
                        }}
                      >
                        {renderCell(column, record, index)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {renderPagination()}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
