import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { PageHero } from '../components/ui/PageHero';
import { StatCard } from '../components/ui/StatCard';

interface Document {
  id: string;
  projectId: string;
  title: string;
  content: string | null;
  type: string;
  createdAt: string;
  updatedAt: string;
  status?: string;
  project?: { id: string; name: string };
}

const DOCUMENT_TYPES: Record<string, { gradient: string; label: string }> = {
  script: { gradient: 'linear-gradient(135deg, #ba9eff 0%, #8455ef 100%)', label: '剧本' },
  novel: { gradient: 'linear-gradient(135deg, #34b5fa 0%, #17a8ec 100%)', label: '小说' },
  outline: { gradient: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)', label: '大纲' },
  storyboard: { gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', label: '故事板' },
  video: { gradient: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)', label: '视频' },
  audio: { gradient: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)', label: '音频' },
  general: { gradient: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)', label: '文档' },
};

const STATUS_CONFIG: Record<string, { bgColor: string; label: string }> = {
  draft: { bgColor: 'rgba(100, 116, 139, 0.15)', label: '草稿' },
  pending: { bgColor: 'rgba(245, 158, 11, 0.15)', label: '待处理' },
  in_progress: { bgColor: 'rgba(52, 181, 250, 0.15)', label: '进行中' },
  completed: { bgColor: 'rgba(52, 211, 153, 0.15)', label: '已完成' },
  published: { bgColor: 'rgba(186, 158, 255, 0.15)', label: '已发布' },
};

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'oldest' | 'title' | 'updated';

const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [filterHovered, setFilterHovered] = useState(false);
  const [createHover, setCreateHover] = useState(false);

  const colors = isDark ? {
    bgBase: '#070d1f',
    bgSurface: '#0c1326',
    bgElevated: '#171f36',
    bgGlass: 'rgba(28, 37, 62, 0.4)',
    bgGlassHover: 'rgba(255, 255, 255, 0.06)',
    textPrimary: '#dfe4fe',
    textSecondary: 'rgba(223, 228, 254, 0.6)',
    textMuted: '#a5aac2',
    border: 'rgba(255, 255, 255, 0.06)',
    borderHover: 'rgba(139, 92, 246, 0.25)',
    accent: '#8b5cf6',
    accentLight: '#a78bfa',
    accentDim: '#7c3aed',
    glow: 'rgba(139, 92, 246, 0.12)',
    inputBg: 'rgba(255, 255, 255, 0.04)',
  } : {
    bgBase: '#f8fafc',
    bgSurface: '#f1f5f9',
    bgElevated: '#ffffff',
    bgGlass: 'rgba(255, 255, 255, 0.8)',
    bgGlassHover: 'rgba(0, 0, 0, 0.04)',
    textPrimary: '#18181b',
    textSecondary: 'rgba(24, 24, 27, 0.6)',
    textMuted: 'rgba(24, 24, 27, 0.5)',
    border: 'rgba(0, 0, 0, 0.06)',
    borderHover: 'rgba(139, 92, 246, 0.25)',
    accent: '#7c3aed',
    accentLight: '#8b5cf6',
    accentDim: '#6d28d9',
    glow: 'rgba(139, 92, 246, 0.08)',
    inputBg: 'rgba(0, 0, 0, 0.04)',
  };

  useEffect(() => { fetchDocuments(); }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/documents', { headers: { 'Content-Type': 'application/json' } });
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      setDocuments(data.documents || data || []);
    } catch (err) {
      setError('加载文档失败');
      console.error('Error fetching documents:', err);
    } finally { setLoading(false); }
  };

  const handleCreateDocument = () => navigate('/documents/create');
  const handleDocumentClick = (document: Document) => navigate(`/documents/${document.id}`);
  const getDocumentTypeConfig = (type: string) => DOCUMENT_TYPES[type] || DOCUMENT_TYPES.general;
  const getStatusConfig = (status: string) => STATUS_CONFIG[status] || STATUS_CONFIG.draft;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays} 天前`;
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const filteredAndSortedDocuments = useMemo(() => {
    let result = [...documents];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((doc) =>
        doc.title.toLowerCase().includes(query) ||
        (doc.content?.toLowerCase().includes(query) ?? false) ||
        (doc.project?.name.toLowerCase().includes(query) ?? false)
      );
    }
    if (selectedType) result = result.filter((doc) => doc.type === selectedType);
    switch (sortBy) {
      case 'newest': result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case 'oldest': result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break;
      case 'title': result.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN')); break;
      case 'updated': result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()); break;
    }
    return result;
  }, [documents, searchQuery, sortBy, selectedType]);

  const uniqueTypes = useMemo(() => Array.from(new Set(documents.map((doc) => doc.type))), [documents]);

  const stats = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    documents.forEach(doc => { typeCounts[doc.type] = (typeCounts[doc.type] || 0) + 1; });
    return { total: documents.length, typeCounts };
  }, [documents]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${colors.bgBase} 0%, ${colors.bgSurface} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: `0 8px 32px ${colors.accent}40`, animation: 'pulse 2s infinite' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'white' }}>auto_awesome</span>
          </div>
          <p style={{ color: colors.textSecondary, fontSize: '15px' }}>加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${colors.bgBase} 0%, ${colors.bgSurface} 100%)`, padding: '24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#ef4444' }}>description</span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: colors.textPrimary, marginBottom: '8px' }}>加载失败</h2>
          <p style={{ fontSize: '14px', color: colors.textMuted, marginBottom: '24px' }}>{error}</p>
          <button onClick={fetchDocuments} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '14px', background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`, color: 'white', border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: `0 8px 24px ${colors.accent}40` }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span> 重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${colors.bgBase} 0%, ${colors.bgSurface} 50%, ${colors.bgElevated} 100%)`, position: 'relative', overflowX: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: '20%', width: '60%', height: '400px', background: `radial-gradient(ellipse at center, ${colors.glow} 0%, transparent 70%)`, pointerEvents: 'none' }} />

      <main style={{ marginLeft: '256px', position: 'relative', zIndex: 1, padding: '112px 48px 48px' }}>
        <PageHero
          title="DOCUMENTS"
          subtitle="管理您的文档"
          icon={<span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'white' }}>description</span>}
          stats={[
            { value: stats.total, label: '全部文档' },
            { value: stats.typeCounts['script'] || 0, label: '剧本' },
            { value: stats.typeCounts['novel'] || 0, label: '小说' },
          ]}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', minWidth: '280px' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: colors.textMuted }}>search</span>
              <input type="text" placeholder="搜索文档..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', height: '44px', padding: '0 16px 0 44px', border: `1px solid ${colors.border}`, borderRadius: '14px', background: colors.inputBg, color: colors.textPrimary, fontSize: '14px', outline: 'none' }} />
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} style={{ height: '44px', padding: '0 36px 0 16px', fontSize: '13px', background: colors.inputBg, border: `1px solid ${colors.border}`, borderRadius: '14px', color: colors.textPrimary, cursor: 'pointer', outline: 'none' }}>
              <option value="newest">最新创建</option>
              <option value="oldest">最早创建</option>
              <option value="updated">最近更新</option>
              <option value="title">按标题</option>
            </select>
            <button onClick={() => setShowFilters(!showFilters)} onMouseEnter={() => setFilterHovered(true)} onMouseLeave={() => setFilterHovered(false)} style={{ height: '44px', width: '44px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px', background: showFilters ? colors.accent : (filterHovered ? colors.bgGlassHover : colors.inputBg), border: `1px solid ${colors.border}`, color: showFilters ? 'white' : colors.textSecondary, cursor: 'pointer' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>filter_list</span>
            </button>
            <div style={{ display: 'flex', background: colors.inputBg, border: `1px solid ${colors.border}`, borderRadius: '14px', overflow: 'hidden' }}>
              <button onClick={() => setViewMode('grid')} style={{ height: '44px', width: '44px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: viewMode === 'grid' ? colors.accent : 'transparent', border: 'none', color: viewMode === 'grid' ? 'white' : colors.textSecondary, cursor: 'pointer' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>grid_view</span>
              </button>
              <button onClick={() => setViewMode('list')} style={{ height: '44px', width: '44px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: viewMode === 'list' ? colors.accent : 'transparent', border: 'none', color: viewMode === 'list' ? 'white' : colors.textSecondary, cursor: 'pointer' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>view_list</span>
              </button>
            </div>
          </div>
          <button onClick={handleCreateDocument} onMouseEnter={() => setCreateHover(true)} onMouseLeave={() => setCreateHover(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 28px', borderRadius: '16px', fontSize: '14px', fontWeight: 600, border: 'none', background: createHover ? `linear-gradient(135deg, ${colors.accentDim} 0%, ${colors.accent} 100%)` : `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`, color: 'white', cursor: 'pointer', boxShadow: `0 8px 24px ${colors.accent}30`, transform: createHover ? 'translateY(-2px)' : 'translateY(0)', transition: 'all 0.3s ease' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span> 新建文档
          </button>
        </div>

        {showFilters && uniqueTypes.length > 0 && (
          <div style={{ marginBottom: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => setSelectedType(null)} style={{ height: '36px', padding: '0 16px', fontSize: '13px', fontWeight: 500, background: selectedType === null ? colors.accent : colors.inputBg, border: `1px solid ${colors.border}`, borderRadius: '10px', color: selectedType === null ? 'white' : colors.textSecondary, cursor: 'pointer' }}>全部</button>
            {uniqueTypes.map((type) => {
              const config = getDocumentTypeConfig(type);
              return (
                <button key={type} onClick={() => setSelectedType(selectedType === type ? null : type)} style={{ height: '36px', padding: '0 14px', fontSize: '13px', fontWeight: 500, background: selectedType === type ? colors.accent : 'transparent', border: `1px solid ${selectedType === type ? colors.accent : colors.border}`, borderRadius: '10px', color: selectedType === type ? 'white' : colors.textSecondary, cursor: 'pointer' }}>
                  {config.label}
                </button>
              );
            })}
          </div>
        )}

        {filteredAndSortedDocuments.length === 0 ? (
          <div style={{ background: colors.bgGlass, borderRadius: '24px', padding: '80px 32px', textAlign: 'center', border: `1px solid ${colors.border}` }}>
            <div style={{ width: '96px', height: '96px', borderRadius: '24px', background: colors.bgGlassHover, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '40px', color: colors.textMuted }}>note_add</span>
            </div>
            <p style={{ fontSize: '18px', fontWeight: 600, color: colors.textPrimary, marginBottom: '8px' }}>{searchQuery ? '未找到匹配的文档' : '暂无文档'}</p>
            <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '24px' }}>{searchQuery ? '尝试调整搜索条件或筛选器' : '点击右上角创建您的第一个文档'}</p>
            {!searchQuery && (
              <button onClick={handleCreateDocument} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '14px', background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`, color: 'white', border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: `0 8px 24px ${colors.accent}30` }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span> 新建文档
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            {filteredAndSortedDocuments.map((document) => {
              const typeConfig = getDocumentTypeConfig(document.type);
              const statusConfig = getStatusConfig(document.status || 'draft');
              const isHovered = hoveredCard === document.id;
              return (
                <div key={document.id} onClick={() => handleDocumentClick(document)} onMouseEnter={() => setHoveredCard(document.id)} onMouseLeave={() => setHoveredCard(null)} style={{ background: colors.bgGlass, borderRadius: '24px', overflow: 'hidden', cursor: 'pointer', border: `1px solid ${isHovered ? colors.borderHover : colors.border}`, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)', boxShadow: isHovered ? `0 30px 60px ${colors.accent}20` : 'none' }}>
                  <div style={{ height: '120px', background: typeConfig.gradient, opacity: 0.15 }} />
                  <div style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                      <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: typeConfig.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 20px ${colors.accent}30` }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '26px', color: 'white' }}>description</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: colors.textPrimary, margin: '0 0 8px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{document.title}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 600, color: colors.accent, background: `${colors.accent}20`, borderRadius: '6px' }}>{typeConfig.label}</span>
                          <span style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 600, color: colors.textSecondary, background: statusConfig.bgColor, borderRadius: '6px' }}>{statusConfig.label}</span>
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: '13px', color: colors.textSecondary, lineHeight: 1.6, margin: '0 0 16px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '42px' }}>
                      {(document.content || '').substring(0, 100).replace(/<[^>]*>/g, '')}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: colors.bgGlassHover, borderRadius: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px', color: colors.textMuted }}>schedule</span>
                        <span style={{ fontSize: '12px', color: colors.textSecondary }}>{formatDate(document.updatedAt)}</span>
                      </div>
                      {document.project && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', fontSize: '11px', fontWeight: 500, color: colors.textSecondary, background: colors.bgGlass, borderRadius: '6px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>folder_open</span>
                          {document.project.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredAndSortedDocuments.map((document) => {
              const typeConfig = getDocumentTypeConfig(document.type);
              const statusConfig = getStatusConfig(document.status || 'draft');
              const isHovered = hoveredCard === document.id;
              return (
                <div key={document.id} onClick={() => handleDocumentClick(document)} onMouseEnter={() => setHoveredCard(document.id)} onMouseLeave={() => setHoveredCard(null)} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px 24px', background: colors.bgGlass, borderRadius: '18px', cursor: 'pointer', border: `1px solid ${isHovered ? colors.borderHover : colors.border}`, transition: 'all 0.25s ease', transform: isHovered ? 'translateX(6px)' : 'translateX(0)', boxShadow: isHovered ? `0 12px 32px ${colors.accent}15` : 'none' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: typeConfig.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '26px', color: 'white' }}>description</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 600, color: colors.textPrimary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{document.title}</h3>
                      <span style={{ padding: '3px 8px', fontSize: '10px', fontWeight: 600, color: colors.accent, background: `${colors.accent}20`, borderRadius: '4px' }}>{typeConfig.label}</span>
                      <span style={{ padding: '3px 8px', fontSize: '10px', fontWeight: 600, color: colors.textSecondary, background: statusConfig.bgColor, borderRadius: '4px' }}>{statusConfig.label}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {(document.content || '').substring(0, 80).replace(/<[^>]*>/g, '')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                    {document.project && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', fontSize: '12px', fontWeight: 500, color: colors.textSecondary, background: colors.bgGlassHover, borderRadius: '8px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>folder_open</span>
                        {document.project.name}
                      </span>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px', color: colors.textMuted }}>schedule</span>
                      <span style={{ fontSize: '12px', color: colors.textSecondary }}>{formatDate(document.updatedAt)}</span>
                    </div>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: colors.textMuted }}>chevron_right</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredAndSortedDocuments.length > 0 && (
          <div style={{ marginTop: '32px', padding: '16px 0', borderTop: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'center' }}>
            <span style={{ fontSize: '13px', color: colors.textMuted }}>
              显示 {filteredAndSortedDocuments.length} 个文档
              {selectedType && ` · 类型: ${getDocumentTypeConfig(selectedType).label}`}
            </span>
          </div>
        )}
      </main>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
      `}</style>
    </div>
  );
};

export default DocumentsPage;
