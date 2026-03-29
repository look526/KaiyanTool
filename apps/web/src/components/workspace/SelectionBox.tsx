const accentColor = '#8b5cf6';

interface SelectionBoxProps {
  selectionBox: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null;
}

export function SelectionBox({ selectionBox }: SelectionBoxProps) {
  if (!selectionBox) return null;

  return (
    <div style={{
      position: 'absolute',
      left: Math.min(selectionBox.startX, selectionBox.endX),
      top: Math.min(selectionBox.startY, selectionBox.endY),
      width: Math.abs(selectionBox.endX - selectionBox.startX),
      height: Math.abs(selectionBox.endY - selectionBox.startY),
      background: `${accentColor}20`,
      border: `1px solid ${accentColor}`,
      borderRadius: '8px',
      pointerEvents: 'none',
    }} />
  );
}
