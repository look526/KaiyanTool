import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CanvasNode {
  id: string;
  position_x: number;
  position_y: number;
  type: string;
}

interface MiniMapProps {
  nodes: CanvasNode[];
  canvasOffset: { x: number; y: number };
  zoom: number;
  canvasWidth: number;
  canvasHeight: number;
  onNavigate: (x: number, y: number) => void;
  isDark: boolean;
  colors: Record<string, string>;
}

const MINIMAP_WIDTH = 180;
const MINIMAP_HEIGHT = 120;
const NODE_WIDTH = 240;
const NODE_HEIGHT = 180;

export default function MiniMap({
  nodes,
  canvasOffset,
  zoom,
  canvasWidth,
  canvasHeight,
  onNavigate,
  isDark,
  colors,
}: MiniMapProps) {
  const [collapsed, setCollapsed] = React.useState(false);

  if (nodes.length < 5 && !collapsed) {
    return null;
  }

  let minX = 0, minY = 0, maxX = 1000, maxY = 1000;
  nodes.forEach(node => {
    minX = Math.min(minX, node.position_x);
    minY = Math.min(minY, node.position_y);
    maxX = Math.max(maxX, node.position_x + NODE_WIDTH);
    maxY = Math.max(maxY, node.position_y + NODE_HEIGHT);
  });

  const padding = 50;
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;

  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;

  const scaleX = MINIMAP_WIDTH / contentWidth;
  const scaleY = MINIMAP_HEIGHT / contentHeight;
  const scale = Math.min(scaleX, scaleY, 0.15);

  const viewportWidth = (canvasWidth / zoom) * scale;
  const viewportHeight = (canvasHeight / zoom) * scale;
  const viewportX = (-canvasOffset.x / zoom - minX) * scale;
  const viewportY = (-canvasOffset.y / zoom - minY) * scale;

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const worldX = clickX / scale + minX;
    const worldY = clickY / scale + minY;

    onNavigate(worldX - canvasWidth / 2 / zoom, worldY - canvasHeight / 2 / zoom);
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'text': return '#8b5cf6';
      case 'image': return '#10b981';
      case 'video': return '#f59e0b';
      default: return '#8b5cf6';
    }
  };

  return (
    <div style={{
      position: 'absolute',
      right: '16px',
      bottom: '80px',
      zIndex: 15,
    }}>
      {!collapsed && (
        <div
          onClick={handleClick}
          style={{
            width: `${MINIMAP_WIDTH}px`,
            height: `${MINIMAP_HEIGHT}px`,
            background: colors.bgPrimary,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            overflow: 'hidden',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <svg width={MINIMAP_WIDTH} height={MINIMAP_HEIGHT}>
            {nodes.map(node => (
              <rect
                key={node.id}
                x={(node.position_x - minX) * scale}
                y={(node.position_y - minY) * scale}
                width={NODE_WIDTH * scale}
                height={NODE_HEIGHT * scale}
                fill={getNodeColor(node.type)}
                fillOpacity={0.6}
                rx={2}
              />
            ))}
            <rect
              x={viewportX}
              y={viewportY}
              width={viewportWidth}
              height={viewportHeight}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth={1.5}
              rx={2}
            />
          </svg>
        </div>
      )}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          border: `1px solid ${colors.border}`,
          background: colors.bgPrimary,
          backdropFilter: 'blur(20px)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.textMuted,
          marginTop: collapsed ? 0 : '8px',
        }}
      >
        {collapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
    </div>
  );
}