import { ModelCapability } from '../../types/ai';

interface ModelParametersProps {
  capabilities: ModelCapability[];
  showVEO3Params?: boolean;
  value: Record<string, any>;
  onChange: (params: Record<string, any>) => void;
}

export function ModelParameters({ capabilities, showVEO3Params = false, value, onChange }: ModelParametersProps) {
  const updateParam = (key: string, val: any) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {capabilities.includes('video') && (
        <>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
              视频时长 (秒)
            </label>
            <input
              type="number"
              min={5}
              max={20}
              value={value.duration || 10}
              onChange={e => updateParam('duration', Number(e.target.value))}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-primary)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '13px',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
              宽高比
            </label>
            <select
              value={value.aspect_ratio || '16:9'}
              onChange={e => updateParam('aspect_ratio', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-primary)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '13px',
              }}
            >
              <option value="16:9">16:9 (横屏)</option>
              <option value="9:16">9:16 (竖屏)</option>
              <option value="1:1">1:1 (方形)</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
              起始图片 URL
            </label>
            <input
              type="text"
              value={value.image_urls?.[0] || ''}
              onChange={e => updateParam('image_urls', [e.target.value])}
              placeholder="可选"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-primary)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '13px',
              }}
            />
          </div>
          {showVEO3Params && (
            <>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                  结束图片 URL
                </label>
                <input
                  type="text"
                  value={value.end_image_url || ''}
                  onChange={e => updateParam('end_image_url', e.target.value)}
                  placeholder="可选 (VEO3)"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                  Prompt 强度: {value.prompt_strength ?? 0.8}
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={value.prompt_strength || 0.8}
                  onChange={e => updateParam('prompt_strength', Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
