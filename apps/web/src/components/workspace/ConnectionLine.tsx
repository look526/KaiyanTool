import { CanvasNode, CanvasEdge } from '../../types/workspace';

const accentColor = '#8b5cf6';

interface ConnectionLineProps {
  edges: CanvasEdge[];
  nodes: CanvasNode[];
  onDeleteEdge: (edgeId: string) => void;
}

export function ConnectionLine({ edges, nodes, onDeleteEdge }: ConnectionLineProps) {
  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      <defs>
        <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.6" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="1" />
        </linearGradient>
      </defs>
      {edges.map(edge => {
        const source = nodes.find(n => n.id === edge.source_node_id);
        const target = nodes.find(n => n.id === edge.target_node_id);
        if (!source || !target) return null;

        const x1 = source.position_x + 120;
        const y1 = source.position_y + 50;
        const x2 = target.position_x;
        const y2 = target.position_y + 50;
        const midX = (x1 + x2) / 2;

        return (
          <g key={edge.id} onClick={() => onDeleteEdge(edge.id)} style={{ cursor: 'pointer', pointerEvents: 'auto' }}>
            <path
              d={`M ${x1} ${y1} Q ${midX} ${y1}, ${midX} ${(y1 + y2) / 2} Q ${midX} ${y2}, ${x2} ${y2}`}
              fill="none"
              stroke="url(#edgeGradient)"
              strokeWidth={2}
              strokeDasharray="5,5"
            />
          </g>
        );
      })}
    </svg>
  );
}
