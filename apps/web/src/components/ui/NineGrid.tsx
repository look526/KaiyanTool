import { Badge } from './Badge';

interface NineGridPanel {
  id: string;
  position: number;
  prompt: string;
  imageUrl: string | null;
}

interface NineGridPanelComponentProps {
  panel: NineGridPanel;
  isActive: boolean;
  onClick: () => void;
  onPromptChange: (prompt: string) => void;
  onDelete: () => void;
  disabled?: boolean;
}

export function NineGridPanelComponent({
  panel,
  isActive,
  onClick,
  onPromptChange,
  onDelete,
  disabled = false,
}: NineGridPanelComponentProps) {
  return (
    <div
      className={`nine-grid-panel ${isActive ? 'active' : ''}`}
      onClick={onClick}
      style={{
        border: isActive ? '2px solid #3b82f6' : '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        backgroundColor: '#fff',
      }}
    >
      <div
        style={{
          aspectRatio: '1',
          backgroundColor: panel.imageUrl ? '#f3f4f6' : '#1f2937',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {panel.imageUrl ? (
          <img
            src={panel.imageUrl}
            alt={`Panel ${panel.position + 1}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div style={{ color: '#6b7280', fontSize: '24px', fontWeight: 'bold' }}>
            {panel.position + 1}
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
          }}
        >
          <Badge variant="default">{panel.position + 1}</Badge>
        </div>
        {panel.imageUrl && (
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
            }}
          >
            <Badge variant="success">已生成</Badge>
          </div>
        )}
      </div>
      <div style={{ padding: '12px' }}>
        <textarea
          value={panel.prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="输入提示词..."
          disabled={disabled}
          style={{
            width: '100%',
            minHeight: '60px',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            padding: '8px',
            fontSize: '12px',
            resize: 'vertical',
            opacity: disabled ? 0.5 : 1,
          }}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          disabled={disabled}
          style={{
            marginTop: '8px',
            padding: '4px 8px',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
          }}
        >
          删除
        </button>
      </div>
    </div>
  );
}

interface NineGridGridProps {
  panels: NineGridPanel[];
  activePanelId: string | null;
  onPanelClick: (panelId: string) => void;
  onPanelPromptChange: (panelId: string, prompt: string) => void;
  onPanelDelete: (panelId: string) => void;
  disabled?: boolean;
}

export function NineGridGrid({
  panels,
  activePanelId,
  onPanelClick,
  onPanelPromptChange,
  onPanelDelete,
  disabled = false,
}: NineGridGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        padding: '16px',
      }}
    >
      {panels.map((panel) => (
        <NineGridPanelComponent
          key={panel.id}
          panel={panel}
          isActive={activePanelId === panel.id}
          onClick={() => onPanelClick(panel.id)}
          onPromptChange={(prompt) => onPanelPromptChange(panel.id, prompt)}
          onDelete={() => onPanelDelete(panel.id)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

interface NineGridEmptyProps {
  onAddPanel: () => void;
  disabled?: boolean;
}

export function NineGridEmpty({ onAddPanel, disabled = false }: NineGridEmptyProps) {
  return (
    <div
      style={{
        gridColumn: 'span 3',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
        border: '2px dashed #e5e7eb',
        borderRadius: '12px',
        color: '#6b7280',
      }}
    >
      <div style={{ marginBottom: '16px', fontSize: '48px' }}>🎬</div>
      <div style={{ marginBottom: '16px' }}>还没有九宫格面板</div>
      <button
        onClick={onAddPanel}
        disabled={disabled}
        style={{
          padding: '12px 24px',
          backgroundColor: '#3b82f6',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        添加第一个面板
      </button>
    </div>
  );
}
