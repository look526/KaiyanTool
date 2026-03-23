import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { GlassCard } from '../components/ui/GlassCard';
import {
  FileText,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  File,
  Search,
  Grid3x3,
  List,
  Plus,
  Calendar,
  FolderOpen,
  Sparkles,
  SortAsc,
  Filter,
  MoreHorizontal,
  Clock,
  Edit3,
  FilePlus,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

interface Document {
  id: string;
  projectId: string;
  title: string;
  content: string | null;
  type: string;
  createdAt: string;
  updatedAt: string;
  status?: string;
  project?: {
    id: string;
    name: string;
  };
}

const DOCUMENT_TYPES: Record<string, { icon: React.ElementType; gradient: string; bgGradient: string; label: string }> = {
  script: { icon: FileCode, gradient: 'linear-gradient(135deg, #ba9eff 0%, #8455ef 100%)', bgGradient: 'linear-gradient(135deg, rgba(186, 158, 255, 0.15) 0%, rgba(132, 85, 239, 0.1) 100%)', label: '剧本' },
  novel: { icon: FileText, gradient: 'linear-gradient(135deg, #34b5fa 0%, #17a8ec 100%)', bgGradient: 'linear-gradient(135deg, rgba(52, 181, 250, 0.15) 0%, rgba(23, 168, 236, 0.1) 100%)', label: '小说' },
  outline: { icon: FileSpreadsheet, gradient: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)', bgGradient: 'linear-gradient(135deg, rgba(52, 211, 153, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)', label: '大纲' },
  storyboard: { icon: FileImage, gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', bgGradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)', label: '故事板' },
  video: { icon: FileVideo, gradient: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)', bgGradient: 'linear-gradient(135deg, rgba(248, 113, 113, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)', label: '视频' },
  audio: { icon: FileAudio, gradient: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)', bgGradient: 'linear-gradient(135deg, rgba(244, 114, 182, 0.15) 0%, rgba(236, 72, 153, 0.1) 100%)', label: '音频' },
  general: { icon: File, gradient: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)', bgGradient: 'linear-gradient(135deg, rgba(148, 163, 184, 0.15) 0%, rgba(100, 116, 139, 0.1) 100%)', label: '文档' },
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

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/documents', {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      setDocuments(data.documents || data || []);
    } catch (err) {
      setError('加载文档失败');
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = () => navigate('/documents/create');
  const handleDocumentClick = (document: Document) => navigate(`/documents/${document.id}`);
  const getDocumentTypeConfig = (type: string) => DOCUMENT_TYPES[type] || DOCUMENT_TYPES.general;
  const getStatusConfig = (status: string) => STATUS_CONFIG[status] || STATUS_CONFIG.draft;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
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

  const uniqueTypes = useMemo(() => {
    const types = new Set(documents.map((doc) => doc.type));
    return Array.from(types);
  }, [documents]);

  const stats = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    documents.forEach(doc => { typeCounts[doc.type] = (typeCounts[doc.type] || 0) + 1; });
    return { total: documents.length, typeCounts };
  }, [documents]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
            boxShadow: '0 8px 32px var(--accent-shadow)',
            animation: 'pulse 2s infinite',
          }}>
            <Sparkles style={{ width: '28px', height: '28px', color: 'white' }} />
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '24px',
            background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px',
          }}>
            <FileText style={{ width: '40px', height: '40px', color: '#ef4444' }} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>加载失败</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>{error}</p>
          <button onClick={fetchDocuments} style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px',
            borderRadius: '14px', background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)',
            color: 'white', border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 8px 24px var(--accent-shadow)',
          }}>
            <RefreshCw style={{ width: '16px', height: '16px' }} /> 重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', position: 'relative', overflowX: 'hidden' }}>
      <div style={{
        position: 'fixed', top: '-20%', right: '-10%', width: '50%', height: '50%',
        background: 'radial-gradient(ellipse at center, rgba(186, 158, 255, 0.08) 0%, transparent 70%)',
        filter: 'blur(80px)', pointerEvents: 'none',
      }} />

      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: isDark ? 'rgba(7, 13, 31, 0.8)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(24px)',
        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)',
        padding: '24px 48px',
      }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '16px',
                background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px var(--accent-shadow)',
              }}>
                <FolderOpen style={{ width: '26px', height: '26px', color: 'white' }} />
              </div>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>文档管理中心</h1>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>共 {documents.length} 个文档</p>
              </div>
            </div>
            <button onClick={handleCreateDocument} style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px',
              borderRadius: '14px', background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)',
              color: 'white', border: 'none', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 8px 24px var(--accent-shadow)', transition: 'all 0.3s ease',
            }}>
              <Plus style={{ width: '18px', height: '18px' }} /> 新建文档
            </button>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '280px' }}>
              <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: 'var(--text-muted)' }} />
              <input
                type="text" placeholder="搜索文档..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', height: '44px', padding: '0 16px 0 44px',
                  border: isDark ? '1px solid var(--border-primary)' : '1px solid var(--border-primary)',
                  borderRadius: '14px', background: isDark ? 'var(--bg-surface)' : 'var(--bg-elevated)',
                  color: 'var(--text-primary)', fontSize: '14px', outline: 'none', transition: 'all 0.2s ease',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-bg)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} style={{
              height: '44px', padding: '0 36px 0 16px', fontSize: '13px',
              background: isDark ? 'var(--bg-surface)' : 'var(--bg-elevated)',
              border: '1px solid var(--border-primary)', borderRadius: '14px',
              color: 'var(--text-primary)', cursor: 'pointer', outline: 'none', appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236f758b' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
            }}>
              <option value="newest">最新创建</option>
              <option value="oldest">最早创建</option>
              <option value="updated">最近更新</option>
              <option value="title">按标题</option>
            </select>

            <button onClick={() => setShowFilters(!showFilters)} style={{
              height: '44px', width: '44px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '14px', background: showFilters ? 'var(--accent)' : (filterHovered ? 'var(--bg-hover)' : 'var(--bg-surface)'),
              border: '1px solid var(--border-primary)', color: showFilters ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer', transition: 'all 0.2s ease',
            }}
              onMouseEnter={() => setFilterHovered(true)} onMouseLeave={() => setFilterHovered(false)}>
              <Filter style={{ width: '18px', height: '18px' }} />
            </button>

            <div style={{ display: 'flex', background: 'var(--bg-surface)', border: '1px solid var(--border-primary)', borderRadius: '14px', overflow: 'hidden' }}>
              <button onClick={() => setViewMode('grid')} style={{
                height: '44px', width: '44px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: viewMode === 'grid' ? 'var(--accent)' : 'transparent', border: 'none',
                color: viewMode === 'grid' ? 'white' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s ease',
              }}>
                <Grid3x3 style={{ width: '18px', height: '18px' }} />
              </button>
              <button onClick={() => setViewMode('list')} style={{
                height: '44px', width: '44px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: viewMode === 'list' ? 'var(--accent)' : 'transparent', border: 'none',
                color: viewMode === 'list' ? 'white' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s ease',
              }}>
                <List style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
          </div>

          {showFilters && uniqueTypes.length > 0 && (
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={() => setSelectedType(null)} style={{
                height: '36px', padding: '0 16px', fontSize: '13px', fontWeight: 500,
                backgroundColor: selectedType === null ? 'var(--accent)' : 'var(--bg-surface)',
                border: '1px solid var(--border-primary)', borderRadius: '10px',
                color: selectedType === null ? 'white' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s ease',
              }}>全部</button>
              {uniqueTypes.map((type) => {
                const config = getDocumentTypeConfig(type);
                const ConfigIcon = config.icon;
                return (
                  <button key={type} onClick={() => setSelectedType(selectedType === type ? null : type)} style={{
                    height: '36px', padding: '0 14px', fontSize: '13px', fontWeight: 500,
                    backgroundColor: selectedType === type ? 'var(--accent)' : 'transparent',
                    border: `1px solid ${selectedType === type ? 'var(--accent)' : 'var(--border-primary)'}`, borderRadius: '10px',
                    color: selectedType === type ? 'white' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s ease',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    <ConfigIcon style={{ width: '14px', height: '14px' }} /> {config.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      <main style={{ maxWidth: '1600px', margin: '0 auto', padding: '32px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <StatCard icon={FileText} gradient="linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)" label="总文档" value={stats.total} />
          {Object.entries(stats.typeCounts).slice(0, 3).map(([type, count]) => {
            const config = getDocumentTypeConfig(type);
            const Icon = config.icon;
            return <StatCard key={type} icon={Icon} gradient={config.gradient} label={config.label} value={count} />;
          })}
        </div>

        {filteredAndSortedDocuments.length === 0 ? (
          <div style={{
            background: 'var(--bg-surface)', borderRadius: '24px', padding: '80px 32px', textAlign: 'center',
            border: isDark ? '1px solid var(--border-primary)' : '1px solid var(--border-primary)',
          }}>
            <div style={{
              width: '96px', height: '96px', borderRadius: '24px',
              background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
            }}>
              <FilePlus style={{ width: '40px', height: '40px', color: 'var(--text-muted)' }} />
            </div>
            <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              {searchQuery ? '未找到匹配的文档' : '暂无文档'}
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              {searchQuery ? '尝试调整搜索条件或筛选器' : '点击右上角创建您的第一个文档'}
            </p>
            {!searchQuery && (
              <button onClick={handleCreateDocument} style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px',
                borderRadius: '14px', background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)',
                color: 'white', border: 'none', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 8px 24px var(--accent-shadow)',
              }}>
                <Plus style={{ width: '16px', height: '16px' }} /> 新建文档
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
            {filteredAndSortedDocuments.map((document) => {
              const typeConfig = getDocumentTypeConfig(document.type);
              const statusConfig = getStatusConfig(document.status || 'draft');
              const TypeIcon = typeConfig.icon;
              const isHovered = hoveredCard === document.id;
              return (
                <DocumentCard
                  key={document.id}
                  document={document}
                  typeConfig={typeConfig}
                  statusConfig={statusConfig}
                  TypeIcon={TypeIcon}
                  isHovered={isHovered}
                  onHover={(hovered) => setHoveredCard(hovered ? document.id : null)}
                  onClick={() => handleDocumentClick(document)}
                  formatDate={formatDate}
                />
              );
            })}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredAndSortedDocuments.map((document) => {
              const typeConfig = getDocumentTypeConfig(document.type);
              const statusConfig = getStatusConfig(document.status || 'draft');
              const TypeIcon = typeConfig.icon;
              const isHovered = hoveredCard === document.id;
              return (
                <DocumentListItem
                  key={document.id}
                  document={document}
                  typeConfig={typeConfig}
                  statusConfig={statusConfig}
                  TypeIcon={TypeIcon}
                  isHovered={isHovered}
                  onHover={(hovered) => setHoveredCard(hovered ? document.id : null)}
                  onClick={() => handleDocumentClick(document)}
                  formatDate={formatDate}
                />
              );
            })}
          </div>
        )}

        {filteredAndSortedDocuments.length > 0 && (
          <div style={{
            marginTop: '32px', padding: '20px 0',
            borderTop: isDark ? '1px solid var(--border-primary)' : '1px solid var(--border-primary)',
            display: 'flex', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              显示 {filteredAndSortedDocuments.length} 个文档
              {selectedType && ` · 类型: ${getDocumentTypeConfig(selectedType).label}`}
            </span>
          </div>
        )}
      </main>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--accent-bg); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--accent); }
      `}</style>
    </div>
  );
};

interface StatCardProps {
  icon: React.ElementType;
  gradient: string;
  label: string;
  value: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, gradient, label, value }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
      style={{
        background: 'var(--bg-surface)', borderRadius: '20px', padding: '24px',
        border: isHovered ? '1px solid var(--accent)' : '1px solid var(--border-primary)',
        backdropFilter: 'blur(20px)', transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 20px 40px var(--accent-shadow)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '14px', background: gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 20px rgba(186, 158, 255, 0.3)',
        }}>
          <Icon style={{ width: '22px', height: '22px', color: 'white' }} />
        </div>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{value}</div>
    </div>
  );
};

interface DocumentCardProps {
  document: Document;
  typeConfig: { icon: React.ElementType; gradient: string; bgGradient: string; label: string };
  statusConfig: { bgColor: string; label: string };
  TypeIcon: React.ElementType;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
  formatDate: (date: string) => string;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, typeConfig, statusConfig, TypeIcon, isHovered, onHover, onClick, formatDate }) => {
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}
      style={{
        background: 'var(--bg-surface)', borderRadius: '24px', overflow: 'hidden', cursor: 'pointer',
        border: isHovered ? '1px solid var(--accent)' : '1px solid var(--border-primary)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: isHovered ? '0 30px 60px var(--accent-shadow)' : '0 4px 12px rgba(0, 0, 0, 0.08)',
        position: 'relative',
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '120px',
        background: typeConfig.bgGradient, pointerEvents: 'none',
      }} />

      <div style={{ padding: '28px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px', marginBottom: '20px' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '18px', background: typeConfig.gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: '0 12px 24px rgba(186, 158, 255, 0.25)',
          }}>
            <TypeIcon style={{ width: '30px', height: '30px', color: 'white' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px 0',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em',
            }}>
              {document.title}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 12px',
                fontSize: '12px', fontWeight: 600, color: 'var(--accent)', backgroundColor: 'var(--accent-bg)',
                border: '1px solid var(--border-hover)', borderRadius: '8px',
              }}>{typeConfig.label}</span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', padding: '5px 12px',
                fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', backgroundColor: statusConfig.bgColor,
                borderRadius: '8px',
              }}>{statusConfig.label}</span>
            </div>
          </div>
        </div>

        <p style={{
          fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 24px 0',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          minHeight: '48px',
        }}>
          {(document.content || '').substring(0, 120).replace(/<[^>]*>/g, '')}
          {(document.content?.length || 0) > 120 && '...'}
        </p>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px',
          background: 'var(--bg-hover)', borderRadius: '14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{formatDate(document.updatedAt)}</span>
          </div>
          {document.project && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px',
              fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', backgroundColor: 'var(--bg-surface)',
              borderRadius: '8px',
            }}>
              <FolderOpen style={{ width: '12px', height: '12px' }} />
              {document.project.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

interface DocumentListItemProps {
  document: Document;
  typeConfig: { icon: React.ElementType; gradient: string; label: string };
  statusConfig: { bgColor: string; label: string };
  TypeIcon: React.ElementType;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
  formatDate: (date: string) => string;
}

const DocumentListItem: React.FC<DocumentListItemProps> = ({ document, typeConfig, statusConfig, TypeIcon, isHovered, onHover, onClick, formatDate }) => {
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '24px', padding: '24px',
        background: 'var(--bg-surface)', borderRadius: '18px', cursor: 'pointer',
        border: isHovered ? '1px solid var(--accent)' : '1px solid var(--border-primary)',
        transition: 'all 0.25s ease', transform: isHovered ? 'translateX(8px)' : 'translateX(0)',
        boxShadow: isHovered ? '0 12px 32px var(--accent-shadow)' : 'none',
      }}
    >
      <div style={{
        width: '56px', height: '56px', borderRadius: '16px', background: typeConfig.gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        boxShadow: '0 8px 20px rgba(186, 158, 255, 0.2)',
      }}>
        <TypeIcon style={{ width: '28px', height: '28px', color: 'white' }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {document.title}
          </h3>
          <span style={{ display: 'inline-flex', padding: '3px 10px', fontSize: '11px', fontWeight: 600, color: 'var(--accent)', backgroundColor: 'var(--accent-bg)', borderRadius: '6px', flexShrink: 0 }}>{typeConfig.label}</span>
          <span style={{ display: 'inline-flex', padding: '3px 10px', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', backgroundColor: statusConfig.bgColor, borderRadius: '6px', flexShrink: 0 }}>{statusConfig.label}</span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {(document.content || '').substring(0, 80).replace(/<[^>]*>/g, '')}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
        {document.project && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', backgroundColor: 'var(--bg-hover)', borderRadius: '8px' }}>
            <FolderOpen style={{ width: '12px', height: '12px' }} />
            {document.project.name}
          </span>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '80px' }}>
          <Clock style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{formatDate(document.updatedAt)}</span>
        </div>
        <ChevronRight style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />
      </div>
    </div>
  );
};

export default DocumentsPage;