import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { mentionsApi, type MentionItem } from '../../core/api/modules/mentions/mentions-api';
import { User, MapPin, Package, Image } from 'lucide-react';

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  projectId: string;
  disabled?: boolean;
  rows?: number;
}

const TRIGGERS = [
  { char: '@', type: 'character' as const, label: '角色' },
  { char: '#', type: 'scene' as const, label: '场景' },
  { char: '$', type: 'item' as const, label: '物品' },
  { char: '*', type: 'asset' as const, label: '素材' },
] as const;

const TYPE_ICONS: Record<string, React.ReactNode> = {
  character: <User style={{ width: '14px', height: '14px' }} />,
  scene: <MapPin style={{ width: '14px', height: '14px' }} />,
  item: <Package style={{ width: '14px', height: '14px' }} />,
  asset: <Image style={{ width: '14px', height: '14px' }} />,
};

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  character: { bg: 'rgba(139, 92, 246, 0.12)', text: '#8b5cf6', border: 'rgba(139, 92, 246, 0.3)' },
  scene: { bg: 'rgba(16, 185, 129, 0.12)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' },
  item: { bg: 'rgba(245, 158, 11, 0.12)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' },
  asset: { bg: 'rgba(59, 130, 246, 0.12)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' },
};

function findActiveMention(textBeforeCursor: string): {
  index: number;
  char: string;
  type: MentionItem['type'];
  query: string;
} | null {
  let best: { index: number; char: string; type: MentionItem['type'] } | null = null;
  for (const t of TRIGGERS) {
    const idx = textBeforeCursor.lastIndexOf(t.char);
    if (idx === -1) continue;
    const after = textBeforeCursor.slice(idx + 1);
    if (/\s/.test(after)) continue;
    if (!best || idx > best.index) {
      best = { index: idx, char: t.char, type: t.type };
    }
  }
  if (!best) return null;
  const query = textBeforeCursor.slice(best.index + 1);
  return { index: best.index, char: best.char, type: best.type, query };
}

export function MentionInput({
  value,
  onChange,
  placeholder = '输入内容，使用 @ 角色 · # 场景 · $ 物品 · * 图片素材',
  projectId,
  disabled = false,
  rows = 4,
}: MentionInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [mentions, setMentions] = useState<MentionItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeKind, setActiveKind] = useState<MentionItem['type']>('character');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mentionStartRef = useRef<number>(0);
  const triggerCharRef = useRef<string>('@');
  const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchMentions = useCallback(
    async (searchQuery: string, resourceType: MentionItem['type']) => {
      try {
        setLoading(true);
        const results = await mentionsApi.getMentions(projectId, searchQuery, resourceType);
        setMentions(results);
        setSelectedIndex(0);
      } catch (error) {
        console.error('Failed to fetch mentions:', error);
        setMentions([]);
      } finally {
        setLoading(false);
      }
    },
    [projectId]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart ?? 0;
    onChange(newValue);

    const textBeforeCursor = newValue.slice(0, cursorPos);
    const active = findActiveMention(textBeforeCursor);

    if (active) {
      mentionStartRef.current = active.index;
      triggerCharRef.current = active.char;
      setActiveKind(active.type);
      setQuery(active.query);
      setIsOpen(true);

      if (fetchTimerRef.current) {
        clearTimeout(fetchTimerRef.current);
      }
      fetchTimerRef.current = setTimeout(() => {
        fetchMentions(active.query, active.type);
      }, 140);
      return;
    }

    setIsOpen(false);
    setQuery('');
  };

  const insertMention = (mention: MentionItem) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart ?? 0;
    const textBeforeCursor = value.slice(0, mentionStartRef.current);
    const textAfterCursor = value.slice(cursorPos);
    const trigger = triggerCharRef.current;
    const mentionText = `${trigger}${mention.name} `;

    const newValue = textBeforeCursor + mentionText + textAfterCursor;
    onChange(newValue);

    setIsOpen(false);
    setQuery('');
    setMentions([]);

    setTimeout(() => {
      const newCursorPos = mentionStartRef.current + mentionText.length;
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isOpen || mentions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % mentions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + mentions.length) % mentions.length);
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (mentions[selectedIndex]) {
          insertMention(mentions[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setQuery('');
        break;
    }
  };

  const filteredMentions = useMemo(() => {
    if (!query) return mentions;
    const q = query.toLowerCase();
    return mentions.filter((m) => m.name.toLowerCase().includes(q));
  }, [mentions, query]);

  const activeKindLabel = useMemo(
    () => TRIGGERS.find((t) => t.type === activeKind)?.label ?? '资源',
    [activeKind]
  );

  const activeTriggerChar = useMemo(
    () => TRIGGERS.find((t) => t.type === activeKind)?.char ?? '@',
    [activeKind]
  );

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '4px',
    maxHeight: '240px',
    overflowY: 'auto',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-primary)',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
    zIndex: 1000,
  };

  const mentionItemStyle = (index: number): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    cursor: 'pointer',
    background: index === selectedIndex ? 'var(--bg-hover)' : 'transparent',
    borderBottom: index < filteredMentions.length - 1 ? '1px solid var(--border-primary)' : 'none',
    transition: 'all 0.15s ease',
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (fetchTimerRef.current) {
        clearTimeout(fetchTimerRef.current);
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        style={{
          width: '100%',
          minHeight: `${rows * 24 + 24}px`,
          padding: '12px 14px',
          fontSize: '14px',
          lineHeight: '1.6',
          borderRadius: '12px',
          border: '1px solid var(--border-primary)',
          background: 'var(--bg-page)',
          color: 'var(--text-primary)',
          resize: 'vertical',
          outline: 'none',
          fontFamily: 'inherit',
          transition: 'all 0.2s ease',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-primary)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />

      {isOpen && (
        <div ref={dropdownRef} style={dropdownStyle}>
          <div
            style={{
              padding: '8px 12px',
              fontSize: '11px',
              color: 'var(--text-muted)',
              borderBottom: '1px solid var(--border-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontWeight: 600, color: TYPE_COLORS[activeKind]?.text ?? 'inherit' }}>
              {activeTriggerChar} {activeKindLabel}
            </span>
            <span>↑↓ 选择 · Enter / Tab 插入 · Esc 关闭</span>
          </div>
          {loading ? (
            <div style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '13px' }}>
              加载中...
            </div>
          ) : filteredMentions.length === 0 ? (
            <div style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '13px' }}>
              {query ? `未找到匹配的${activeKindLabel}` : `暂无${activeKindLabel}，可先在本项目创建`}
            </div>
          ) : (
            filteredMentions.map((mention, index) => {
              const colors = TYPE_COLORS[mention.type] || TYPE_COLORS.asset;
              return (
                <div
                  key={`${mention.type}-${mention.id}`}
                  style={mentionItemStyle(index)}
                  onClick={() => insertMention(mention)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: colors.bg,
                      color: colors.text,
                    }}
                  >
                    {TYPE_ICONS[mention.type] || TYPE_ICONS.asset}
                  </span>
                  <span style={{ flex: 1 }}>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {mention.name}
                    </span>
                    <span
                      style={{
                        marginLeft: '8px',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontSize: '10px',
                        fontWeight: 600,
                        background: colors.bg,
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      {mention.type === 'character'
                        ? '角色'
                        : mention.type === 'scene'
                          ? '场景'
                          : mention.type === 'item'
                            ? '物品'
                            : '素材'}
                    </span>
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}

      <div
        style={{
          marginTop: '8px',
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginRight: '4px' }}>快捷提及</span>
        {TRIGGERS.map((t) => (
          <span
            key={t.char}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 10px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 600,
              background: TYPE_COLORS[t.type].bg,
              color: TYPE_COLORS[t.type].text,
              border: `1px solid ${TYPE_COLORS[t.type].border}`,
            }}
          >
            {TYPE_ICONS[t.type]}
            <span>{t.char}</span>
            <span style={{ opacity: 0.85 }}>{t.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
