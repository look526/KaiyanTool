import { useEffect, useCallback } from 'react';

interface ShortcutConfig {
  key: string;
  handler: () => void;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  /** 默认 true；设为 false 时不调用 preventDefault（如空格键用于平移画布） */
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    const isInputField = target.tagName === 'INPUT' ||
                          target.tagName === 'TEXTAREA' ||
                          target.tagName === 'SELECT' ||
                          target.isContentEditable;

    if (isInputField) {
      return;
    }

    for (const shortcut of shortcuts) {
      const ctrlMatch = shortcut.ctrlKey ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
      const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
      const altMatch = shortcut.altKey ? event.altKey : !event.altKey;
      const keyMatch = event.key === shortcut.key || event.code === shortcut.key;

      if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut.handler();
        break;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
