import React, { useState } from 'react';
import { Download, Share2, Trash2, Copy, Archive, MoreVertical, ChevronDown } from 'lucide-react';

export interface BatchAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  handler: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  danger?: boolean;
}

interface BatchActionBarProps {
  selectedCount: number;
  actions: BatchAction[];
  onClearSelection?: () => void;
  position?: 'top' | 'bottom';
  className?: string;
}

const DEFAULT_ACTIONS: Omit<BatchAction, 'handler'>[] = [
  {
    id: 'download',
    label: '下载选中',
    icon: <Download className="w-4 h-4" />,
  },
  {
    id: 'favorite',
    label: '收藏选中',
    icon: <Share2 className="w-4 h-4" />,
  },
  {
    id: 'copy',
    label: '复制链接',
    icon: <Copy className="w-4 h-4" />,
  },
  {
    id: 'archive',
    label: '归档',
    icon: <Archive className="w-4 h-4" />,
  },
  {
    id: 'delete',
    label: '删除',
    icon: <Trash2 className="w-4 h-4" />,
    danger: true,
  },
];

export function BatchActionBar({
  selectedCount,
  actions,
  onClearSelection,
  position = 'bottom',
  className = ''
}: BatchActionBarProps) {
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };

    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreMenu]);

  const handleAction = async (action: BatchAction) => {
    if (action.disabled || action.loading || loadingActionId) return;

    setLoadingActionId(action.id);
    setShowMoreMenu(false);
    try {
      await action.handler();
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setLoadingActionId(null);
    }
  };

  if (selectedCount === 0) return null;

  const primaryActions = actions.slice(0, 3);
  const moreActions = actions.slice(3);

  return (
    <div
      className={`
        fixed left-1/2 -translate-x-1/2 z-50
        ${position === 'top' ? 'top-4' : 'bottom-4'}
        ${className}
      `}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          已选择 <span className="text-blue-500">{selectedCount}</span> 项
        </span>

        <div className="w-px h-6 bg-gray-200 dark:border-gray-700" />

        <div className="flex items-center gap-2">
          {primaryActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleAction(action)}
              disabled={action.disabled || action.loading || loadingActionId === action.id}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
                transition-all duration-200
                ${action.danger
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
                ${(action.disabled || action.loading || loadingActionId === action.id)
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:scale-105'
                }
              `}
              title={action.label}
            >
              {loadingActionId === action.id || action.loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  {action.icon}
                  <span className="hidden sm:inline">{action.label}</span>
                </>
              )}
            </button>
          ))}

          {moreActions.length > 0 && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="更多操作"
              >
                {showMoreMenu ? (
                  <ChevronDown className="w-4 h-4 rotate-180" />
                ) : (
                  <MoreVertical className="w-4 h-4" />
                )}
              </button>
              
              {showMoreMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {moreActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleAction(action)}
                      disabled={action.disabled || action.loading || loadingActionId === action.id}
                      className={`
                        w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium
                        transition-colors text-left
                        ${action.danger 
                          ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }
                        ${(action.disabled || action.loading || loadingActionId === action.id)
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                        }
                      `}
                    >
                      {loadingActionId === action.id || action.loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          处理中...
                        </>
                      ) : (
                        <>
                          {action.icon}
                          <span>{action.label}</span>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-200 dark:border-gray-700" />

        <button
          onClick={onClearSelection}
          className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          取消选择
        </button>
      </div>
    </div>
  );
}

export { DEFAULT_ACTIONS };
export default BatchActionBar;
