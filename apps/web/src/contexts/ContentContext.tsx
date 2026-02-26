import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ContentMode = 'script' | 'novel' | 'adaptation';

export interface ContentContextType {
  mode: ContentMode;
  setMode: (mode: ContentMode) => void;
  
  scriptContent: string;
  setScriptContent: (content: string) => void;
  scriptTitle: string;
  setScriptTitle: (title: string) => void;
  
  novelContent: string;
  setNovelContent: (content: string) => void;
  novelTitle: string;
  setNovelTitle: (title: string) => void;
  
  selectedChapterId: string | null;
  setSelectedChapterId: (id: string | null) => void;
  
  lastSaved: Date | null;
  setLastSaved: (date: Date | null) => void;
  
  autoSaveEnabled: boolean;
  setAutoSaveEnabled: (enabled: boolean) => void;
  
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
  
  saveToLocalStorage: (mode: ContentMode) => void;
  loadFromLocalStorage: (mode: ContentMode) => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children, projectId }: { children: ReactNode; projectId: string }) {
  const [mode, setMode] = useState<ContentMode>('script');
  
  const [scriptContent, setScriptContent] = useState('');
  const [scriptTitle, setScriptTitle] = useState('');
  
  const [novelContent, setNovelContent] = useState('');
  const [novelTitle, setNovelTitle] = useState('');
  
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const saveToLocalStorage = useCallback((currentMode: ContentMode) => {
    if (currentMode === 'script') {
      localStorage.setItem(`script-${projectId}`, JSON.stringify({
        title: scriptTitle,
        content: scriptContent,
        timestamp: Date.now(),
      }));
    } else if (currentMode === 'novel') {
      localStorage.setItem(`novel-${projectId}`, JSON.stringify({
        title: novelTitle,
        content: novelContent,
        timestamp: Date.now(),
      }));
    }
    setLastSaved(new Date());
  }, [projectId, scriptTitle, scriptContent, novelTitle, novelContent]);

  const loadFromLocalStorage = useCallback((currentMode: ContentMode) => {
    const key = currentMode === 'script' ? `script-${projectId}` : `novel-${projectId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (currentMode === 'script') {
          setScriptTitle(data.title || '');
          setScriptContent(data.content || '');
        } else {
          setNovelTitle(data.title || '');
          setNovelContent(data.content || '');
        }
        setLastSaved(new Date(data.timestamp));
      } catch (err) {
        console.error('加载本地存储失败:', err);
      }
    }
  }, [projectId]);

  const value = {
    mode,
    setMode,
    scriptContent,
    setScriptContent,
    scriptTitle,
    setScriptTitle,
    novelContent,
    setNovelContent,
    novelTitle,
    setNovelTitle,
    selectedChapterId,
    setSelectedChapterId,
    lastSaved,
    setLastSaved,
    autoSaveEnabled,
    setAutoSaveEnabled,
    isSaving,
    setIsSaving,
    saveToLocalStorage,
    loadFromLocalStorage,
  };

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}
