import React from 'react';
import { Search, Loader2, Zap } from 'lucide-react';
import styles from '../ModelSelector.module.css';

export interface ModelSelectorSearchProps {
  search_value: string;
  on_search_change: (value: string) => void;
  loading: boolean;
  on_refresh?: () => void;
}

export function ModelSelectorSearch({
  search_value,
  on_search_change,
  loading,
  on_refresh,
}: ModelSelectorSearchProps) {
  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchInputWrapper}>
        <Search className={styles.searchIcon} />
        <input
          type="text"
          value={search_value}
          onChange={(e) => on_search_change(e.target.value)}
          placeholder="搜索模型..."
          className={styles.searchInput}
        />
        {on_refresh && (
          <button
            onClick={on_refresh}
            disabled={loading}
            className={styles.refreshButton}
          >
            {loading ? (
              <Loader2 className={styles.spinner} />
            ) : (
              <Zap className={styles.refreshIcon} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
