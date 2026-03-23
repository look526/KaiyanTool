import { useState, useCallback } from 'react';

export interface HistoryState {
  nodes: any[];
  edges: any[];
}

const MAX_HISTORY = 50;

export function useHistory(initialState: HistoryState) {
  const [undoStack, setUndoStack] = useState<HistoryState[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryState[]>([]);

  const pushState = useCallback((state: HistoryState) => {
    setUndoStack(prev => {
      const newStack = [...prev, state];
      if (newStack.length > MAX_HISTORY) {
        newStack.shift();
      }
      return newStack;
    });
    setRedoStack([]);
  }, []);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return null;

    setUndoStack(prev => {
      const newUndoStack = [...prev];
      const previousState = newUndoStack.pop();

      if (previousState) {
        setRedoStack(redo => [...redo, previousState]);
      }

      return newUndoStack;
    });

    return undoStack[undoStack.length - 1];
  }, [undoStack]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return null;

    setRedoStack(prev => {
      const newRedoStack = [...prev];
      const nextState = newRedoStack.pop();

      if (nextState) {
        setUndoStack(undo => [...undo, nextState]);
      }

      return newRedoStack;
    });

    return redoStack[redoStack.length - 1];
  }, [redoStack]);

  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  const clear = useCallback(() => {
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  return {
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
  };
}