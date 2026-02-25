import { useState, useCallback, useEffect } from 'react';
import { HistoryItem } from '../components/script/GenerationHistory';

const HISTORY_KEY = 'script-generation-history';
const MAX_HISTORY_ITEMS = 50;

export function useGenerationHistory(projectId: string) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    loadHistory();
  }, [projectId]);

  const loadHistory = useCallback(() => {
    try {
      const saved = localStorage.getItem(`${HISTORY_KEY}-${projectId}`);
      if (saved) {
        const items = JSON.parse(saved) as HistoryItem[];
        setHistory(items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
      }
    } catch (err) {
      console.error('加载历史记录失败:', err);
    }
  }, [projectId]);

  const addToHistory = useCallback((item: Omit<HistoryItem, 'id'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    setHistory(prev => {
      const updated = [newItem, ...prev].slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem(`${HISTORY_KEY}-${projectId}`, JSON.stringify(updated));
      return updated;
    });
  }, [projectId]);

  const deleteFromHistory = useCallback((id: string) => {
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem(`${HISTORY_KEY}-${projectId}`, JSON.stringify(updated));
      return updated;
    });
  }, [projectId]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(`${HISTORY_KEY}-${projectId}`);
  }, [projectId]);

  return {
    history,
    addToHistory,
    deleteFromHistory,
    clearHistory,
    reloadHistory: loadHistory,
  };
}
