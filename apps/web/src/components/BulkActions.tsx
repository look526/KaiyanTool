import React, { useState, useCallback } from 'react';
import { Square, CheckSquare, Trash2 } from 'lucide-react';

interface UseBulkSelectReturn {
  selectedIds: Set<string>;
  toggleSelect: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  isAllSelected: (totalCount: number) => boolean;
  BulkActions: React.FC<{ 
    totalCount: number; 
    onDelete: () => Promise<void>; 
    deleteLabel?: string;
  }>;
}

export function useBulkSelect(): UseBulkSelectReturn {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    if (selectedIds.size === ids.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(ids));
    }
  }, [selectedIds.size]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isAllSelected = useCallback((totalCount: number) => {
    return selectedIds.size === totalCount && totalCount > 0;
  }, [selectedIds.size]);

  const BulkActions: React.FC<{ 
    totalCount: number; 
    onDelete: () => Promise<void>; 
    deleteLabel?: string;
  }> = ({ totalCount, onDelete, deleteLabel = '删除' }) => {
    if (totalCount === 0) return null;

    return (
      <>
        <button
          onClick={() => selectAll(Array.from(
            selectedIds.size === totalCount ? [] : selectedIds.size === 0 
              ? [] 
              : selectedIds
          ))}
          style={{
            background: 'var(--bg-hover)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '10px',
            padding: '10px 18px',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {isAllSelected(totalCount) ? (
            <CheckSquare style={{ width: '16px', height: '16px' }} />
          ) : (
            <Square style={{ width: '16px', height: '16px' }} />
          )}
          {selectedIds.size > 0 ? `${selectedIds.size}/${totalCount}` : '全选'}
        </button>
        {selectedIds.size > 0 && (
          <button
            onClick={onDelete}
            style={{
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 18px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Trash2 style={{ width: '16px', height: '16px' }} />
            {deleteLabel} ({selectedIds.size})
          </button>
        )}
      </>
    );
  };

  return {
    selectedIds,
    toggleSelect,
    selectAll: (ids: string[]) => selectAll(ids),
    clearSelection,
    isAllSelected,
    BulkActions,
  };
}

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange }) => (
  <div
    onClick={onChange}
    style={{ cursor: 'pointer', padding: '4px' }}
  >
    {checked ? (
      <CheckSquare style={{ width: '20px', height: '20px', color: '#8b5cf6' }} />
    ) : (
      <Square style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />
    )}
  </div>
);
