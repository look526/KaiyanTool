import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  totalItems?: number;
  showPageSize?: boolean;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  showInfo?: boolean;
  className?: string;
}

const PAGE_SIZE = 5;

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize = 10,
  totalItems,
  showPageSize = false,
  pageSizeOptions = [10, 20, 50, 100],
  onPageSizeChange,
  showInfo = false,
  className,
}: PaginationProps) {
  const [isHovering, setIsHovering] = useState<number | null>(null);

  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const showPages = 7;
    const half = Math.floor(showPages / 2);

    if (totalPages <= showPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - half);
      const end = Math.min(totalPages, start + showPages - 1);

      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push('...');
        }
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }

    return pages;
  }, [currentPage, totalPages]);

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, page: number | string) => {
    if (typeof page === 'number') {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handlePageClick(page);
      }
    }
  };

  const renderPageButton = (page: number | string) => {
    if (typeof page === 'string') {
      return (
        <div
          key="ellipsis"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            color: 'var(--text-tertiary)',
          }}
        >
          <MoreHorizontal style={{ width: '16px', height: '16px' }} />
        </div>
      );
    }

    const isActive = page === currentPage;
    const isHovered = page === isHovering;

    return (
      <div
        key={page}
        onClick={() => handlePageClick(page)}
        onKeyDown={(e) => handleKeyDown(e, page)}
        tabIndex={isActive ? -1 : 0}
        role="button"
        aria-label={`第 ${page} 页`}
        aria-current={isActive ? 'page' : undefined}
        onMouseEnter={() => setIsHovering(page)}
        onMouseLeave={() => setIsHovering(null)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '32px',
          height: '32px',
          padding: '0 8px',
          fontSize: '14px',
          fontWeight: isActive ? '600' : '400',
          borderRadius: '6px',
          cursor: isActive ? 'default' : 'pointer',
          backgroundColor: isActive
            ? 'var(--accent)'
            : isHovered
            ? 'var(--bg-hover)'
            : 'transparent',
          color: isActive ? '#fff' : 'var(--text-primary)',
          transition: 'all 0.15s ease',
          outline: 'none',
        }}
      >
        {page}
      </div>
    );
  };

  const startItem = totalItems ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = totalItems ? Math.min(currentPage * pageSize, totalItems) : 0;

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '8px 0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          onClick={() => currentPage > 1 && handlePageClick(currentPage - 1)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handlePageClick(currentPage - 1);
            }
          }}
          tabIndex={currentPage === 1 ? -1 : 0}
          role="button"
          aria-label="上一页"
          aria-disabled={currentPage === 1}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            backgroundColor: 'transparent',
            color: currentPage === 1 ? 'var(--text-tertiary)' : 'var(--text-primary)',
            transition: 'all 0.15s ease',
            opacity: currentPage === 1 ? 0.5 : 1,
            outline: 'none',
          }}
        >
          <ChevronLeft style={{ width: '18px', height: '18px' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {pageNumbers.map((page) => renderPageButton(page))}
        </div>

        <div
          onClick={() => currentPage < totalPages && handlePageClick(currentPage + 1)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handlePageClick(currentPage + 1);
            }
          }}
          tabIndex={currentPage === totalPages ? -1 : 0}
          role="button"
          aria-label="下一页"
          aria-disabled={currentPage === totalPages}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            backgroundColor: 'transparent',
            color: currentPage === totalPages ? 'var(--text-tertiary)' : 'var(--text-primary)',
            transition: 'all 0.15s ease',
            opacity: currentPage === totalPages ? 0.5 : 1,
            outline: 'none',
          }}
        >
          <ChevronRight style={{ width: '18px', height: '18px' }} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {showInfo && totalItems && (
          <div style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
          }}>
            显示 {startItem}-{endItem} 条，共 {totalItems} 条
          </div>
        )}

        {showPageSize && onPageSizeChange && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
            }}>
              每页
            </span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{
                height: '32px',
                padding: '0 28px 0 10px',
                fontSize: '14px',
                backgroundColor: 'var(--bg-base)',
                border: '1px solid var(--border-primary)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
              }}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        {totalPages > PAGE_SIZE && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
            }}>
              前往
            </span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const value = e.target.value;
                const page = parseInt(value, 10);
                if (value === '') return;
                if (page >= 1 && page <= totalPages) {
                  onPageChange(page);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const input = e.currentTarget;
                  const page = parseInt(input.value, 10);
                  if (page >= 1 && page <= totalPages) {
                    onPageChange(page);
                  } else {
                    input.value = String(currentPage);
                  }
                }
              }}
              onBlur={(e) => {
                const page = parseInt(e.target.value, 10);
                if (isNaN(page) || page < 1) {
                  e.target.value = String(currentPage);
                } else if (page > totalPages) {
                  e.target.value = String(totalPages);
                  onPageChange(totalPages);
                }
              }}
              style={{
                width: '56px',
                height: '32px',
                padding: '0 8px',
                fontSize: '14px',
                textAlign: 'center',
                backgroundColor: 'var(--bg-base)',
                border: '1px solid var(--border-primary)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                outline: 'none',
                MozAppearance: 'textfield',
              }}
            />
            <span style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
            }}>
              页
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
