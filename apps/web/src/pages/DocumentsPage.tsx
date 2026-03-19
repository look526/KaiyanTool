import React, { useState, useEffect, useMemo } from 'react';

import { useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

import { useTheme } from '../contexts/ThemeContext';

import { GlassButton } from '../components/ui/GlassButton';

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



const DOCUMENT_TYPES: Record<string, { icon: React.ElementType; color: string; gradient: string; bgColor: string; borderColor: string; label: string }> = {

  script: { icon: FileCode, color: 'colors.accent', gradient: 'linear-gradient(135deg, colors.accent 0%, colors.accentLight 100%)', bgColor: 'colors.accentBg', borderColor: 'colors.borderHover', label: '剧本' },

  novel: { icon: FileText, color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', bgColor: 'rgba(59, 130, 246, 0.12)', borderColor: 'rgba(59, 130, 246, 0.25)', label: '小说' },

  outline: { icon: FileSpreadsheet, color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', bgColor: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.25)', label: '大纲' },

  storyboard: { icon: FileImage, color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', bgColor: 'rgba(245, 158, 11, 0.12)', borderColor: 'rgba(245, 158, 11, 0.25)', label: '故事板' },

  video: { icon: FileVideo, color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', bgColor: 'rgba(239, 68, 68, 0.12)', borderColor: 'rgba(239, 68, 68, 0.25)', label: '视频' },

  audio: { icon: FileAudio, color: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', bgColor: 'rgba(236, 72, 153, 0.12)', borderColor: 'rgba(236, 72, 153, 0.25)', label: '音频' },

  general: { icon: File, color: '#64748b', gradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)', bgColor: 'rgba(100, 116, 139, 0.12)', borderColor: 'rgba(100, 116, 139, 0.25)', label: '文档' },

};



const STATUS_CONFIG: Record<string, { color: string; bgColor: string; borderColor: string; label: string }> = {

  draft: { color: '#64748b', bgColor: 'rgba(100, 116, 139, 0.12)', borderColor: 'rgba(100, 116, 139, 0.2)', label: '草稿' },

  pending: { color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.12)', borderColor: 'rgba(245, 158, 11, 0.2)', label: '待处理' },

  in_progress: { color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.12)', borderColor: 'rgba(59, 130, 246, 0.2)', label: '进行中' },

  completed: { color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.2)', label: '已完成' },

  published: { color: 'colors.accent', bgColor: 'colors.accentBg', borderColor: 'rgba(139, 92, 246, 0.2)', label: '已发布' },

};



type ViewMode = 'grid' | 'list';

type SortOption = 'newest' | 'oldest' | 'title' | 'updated';



const DocumentsPage: React.FC = () => {

  const navigate = useNavigate();

  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';

  

  const accentColor = '#8b5cf6';

  const accentLight = '#a78bfa';

  

  const colors = isDark ? {

    bgPrimary: 'rgba(5, 5, 10, 0.95)',

    bgSecondary: 'rgba(255, 255, 255, 0.03)',

    bgGlass: 'rgba(255, 255, 255, 0.04)',

    bgGlassHover: 'rgba(255, 255, 255, 0.06)',

    bgSurface: 'rgba(255, 255, 255, 0.05)',

    textPrimary: '#fafafa',

    textSecondary: 'rgba(250, 250, 250, 0.6)',

    textMuted: 'rgba(250, 250, 250, 0.4)',

    border: 'rgba(255, 255, 255, 0.06)',

    borderHover: 'rgba(139, 92, 246, 0.25)',

    accent: '#8b5cf6',

    accentLight: '#a78bfa',

    accentBg: 'rgba(139, 92, 246, 0.12)',

  } : {

    bgPrimary: 'rgba(255, 255, 255, 0.92)',

    bgSecondary: 'rgba(0, 0, 0, 0.02)',

    bgGlass: 'rgba(0, 0, 0, 0.02)',

    bgGlassHover: 'rgba(0, 0, 0, 0.04)',

    bgSurface: 'rgba(0, 0, 0, 0.03)',

    textPrimary: '#18181b',

    textSecondary: 'rgba(24, 24, 27, 0.6)',

    textMuted: 'rgba(24, 24, 27, 0.4)',

    border: 'rgba(0, 0, 0, 0.06)',

    borderHover: 'rgba(139, 92, 246, 0.25)',

    accent: '#8b5cf6',

    accentLight: '#a78bfa',

    accentBg: 'rgba(139, 92, 246, 0.12)',

  };

  

  const [documents, setDocuments] = useState<Document[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const [selectedType, setSelectedType] = useState<string | null>(null);

  const [showFilters, setShowFilters] = useState(false);

  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const [refreshHovered, setRefreshHovered] = useState(false);

  const [filterHovered, setFilterHovered] = useState(false);



  useEffect(() => {

    fetchDocuments();

  }, []);



  const fetchDocuments = async () => {

    try {

      setLoading(true);

      setError(null);

      const response = await fetch('/api/documents', {

        headers: {

          'Content-Type': 'application/json',

        },

      });

      

      if (!response.ok) {

        throw new Error('Failed to fetch documents');

      }

      

      const data = await response.json();

      setDocuments(data.documents || data || []);

    } catch (err) {

      setError('加载文档失败');

      console.error('Error fetching documents:', err);

    } finally {

      setLoading(false);

    }

  };



  const handleCreateDocument = () => {

    navigate('/documents/create');

  };



  const handleDocumentClick = (document: Document) => {

    navigate(`/documents/${document.id}`);

  };



  const getDocumentTypeConfig = (type: string) => {

    return DOCUMENT_TYPES[type] || DOCUMENT_TYPES.general;

  };



  const getStatusConfig = (status: string) => {

    return STATUS_CONFIG[status] || STATUS_CONFIG.draft;

  };



  const formatDate = (dateString: string) => {

    const date = new Date(dateString);

    const now = new Date();

    const diffMs = now.getTime() - date.getTime();

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));



    if (diffDays === 0) {

      return '今天';

    } else if (diffDays === 1) {

      return '昨天';

    } else if (diffDays < 7) {

      return `${diffDays} 天前`;

    } else {

      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });

    }

  };



  const filteredAndSortedDocuments = useMemo(() => {

    let result = [...documents];



    if (searchQuery) {

      const query = searchQuery.toLowerCase();

      result = result.filter(

        (doc) =>

          doc.title.toLowerCase().includes(query) ||

          (doc.content?.toLowerCase().includes(query) ?? false) ||

          (doc.project?.name.toLowerCase().includes(query) ?? false)

      );

    }



    if (selectedType) {

      result = result.filter((doc) => doc.type === selectedType);

    }



    switch (sortBy) {

      case 'newest':

        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        break;

      case 'oldest':

        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        break;

      case 'title':

        result.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));

        break;

      case 'updated':

        result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        break;

    }



    return result;

  }, [documents, searchQuery, sortBy, selectedType]);



  const uniqueTypes = useMemo(() => {

    const types = new Set(documents.map((doc) => doc.type));

    return Array.from(types);

  }, [documents]);



  const stats = useMemo(() => {

    const typeCounts: Record<string, number> = {};

    documents.forEach(doc => {

      typeCounts[doc.type] = (typeCounts[doc.type] || 0) + 1;

    });

    return {

      total: documents.length,

      typeCounts,

    };

  }, [documents]);



  if (loading) {

    return (

      <div style={{

        minHeight: '100vh',

        display: 'flex',

        alignItems: 'center',

        justifyContent: 'center',

        background: 'var(--bg-base)',

      }}>

        <div style={{ textAlign: 'center' }}>

          <div style={{

            width: '48px',

            height: '48px',

            border: '3px solid colors.border',

            borderTopColor: 'colors.accent',

            borderRadius: '50%',

            animation: 'spin 1s linear infinite',

            margin: '0 auto 16px',

          }} />

          <p style={{ color: 'colors.textMuted', fontSize: '14px' }}>加载中...</p>

        </div>

      </div>

    );

  }



  if (error) {

    return (

      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '24px' }}>

        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

          <div style={{

            display: 'flex',

            flexDirection: 'column',

            alignItems: 'center',

            justifyContent: 'center',

            minHeight: '400px',

            textAlign: 'center',

          }}>

            <div style={{

              width: '80px',

              height: '80px',

              borderRadius: '24px',

              background: 'rgba(239, 68, 68, 0.1)',

              display: 'flex',

              alignItems: 'center',

              justifyContent: 'center',

              marginBottom: '24px',

            }}>

              <FileText style={{ width: '40px', height: '40px', color: '#ef4444' }} />

            </div>

            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'colors.textPrimary', marginBottom: '8px' }}>

              加载失败

            </h2>

            <p style={{ fontSize: '14px', color: 'colors.textMuted', marginBottom: '24px' }}>

              {error}

            </p>

            <GlassButton onClick={fetchDocuments}>

              <RefreshCw style={{ width: '16px', height: '16px' }} />

              重试

            </GlassButton>

          </div>

        </div>

      </div>

    );

  }



  return (

    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

      <div style={{

        background: 'var(--bg-elevated)',

        backdropFilter: 'blur(20px)',

        borderBottom: '1px solid colors.border',

        position: 'sticky',

        top: 0,

        zIndex: 40,

      }}>

        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px 24px' }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

              <div style={{

                padding: '12px',

                borderRadius: '14px',

                background: 'linear-gradient(135deg, colors.accent 0%, colors.accentLight 100%)',

                boxShadow: '0 4px 14px var(--accent-shadow)',

              }}>

                <FolderOpen style={{ width: '24px', height: '24px', color: 'white' }} />

              </div>

              <div>

                <h1 style={{ fontSize: '22px', fontWeight: '600', color: 'colors.textPrimary', margin: 0 }}>文档管理</h1>

                <p style={{ fontSize: '13px', color: 'colors.textMuted', margin: 0 }}>共 {documents.length} 个文档</p>

              </div>

            </div>



            <GlassButton onClick={handleCreateDocument} variant="primary">

              <Plus style={{ width: '18px', height: '18px' }} />

              新建文档

            </GlassButton>

          </div>



          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>

            <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>

              <Search style={{

                position: 'absolute',

                left: '12px',

                top: '50%',

                transform: 'translateY(-50%)',

                width: '16px',

                height: '16px',

                color: 'colors.textMuted',

              }} />

              <input

                type="text"

                placeholder="搜索文档..."

                value={searchQuery}

                onChange={(e) => setSearchQuery(e.target.value)}

                style={{

                  width: '100%',

                  height: '40px',

                  padding: '0 12px 0 36px',

                  border: '1px solid colors.border',

                  borderRadius: '10px',

                  background: 'var(--bg-input)',

                  color: 'colors.textPrimary',

                  fontSize: '13px',

                  outline: 'none',

                  transition: 'all 0.2s ease',

                }}

                onFocus={(e) => {

                  e.currentTarget.style.borderColor = 'colors.accent';

                  e.currentTarget.style.boxShadow = '0 0 0 3px colors.accentBg';

                }}

                onBlur={(e) => {

                  e.currentTarget.style.borderColor = 'colors.border';

                  e.currentTarget.style.boxShadow = 'none';

                }}

              />

            </div>



            <select

              value={sortBy}

              onChange={(e) => setSortBy(e.target.value as SortOption)}

              style={{

                height: '40px',

                padding: '0 32px 0 12px',

                fontSize: '13px',

                backgroundColor: 'var(--bg-input)',

                border: '1px solid colors.border',

                borderRadius: '10px',

                color: 'colors.textPrimary',

                cursor: 'pointer',

                outline: 'none',

                appearance: 'none',

                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,

                backgroundRepeat: 'no-repeat',

                backgroundPosition: 'right 10px center',

              }}

            >

              <option value="newest">最新创建</option>
              <option value="oldest">最早创建</option>
              <option value="updated">最近更新</option>
              <option value="title">按标题</option>

            </select>



            <GlassButton

              onClick={() => setShowFilters(!showFilters)}

              style={{

                height: '40px',

                width: '40px',

                padding: 0,

                display: 'flex',

                alignItems: 'center',

                justifyContent: 'center',

                backgroundColor: showFilters ? 'colors.accent' : (filterHovered ? 'colors.bgGlassHover' : 'var(--bg-input)'),

                border: '1px solid colors.border',

                borderRadius: '10px',

                color: showFilters ? 'white' : 'colors.textMuted',

                cursor: 'pointer',

                transition: 'all 0.2s ease',

              }}

              onMouseEnter={() => setFilterHovered(true)}

              onMouseLeave={() => setFilterHovered(false)}

            >

              <Filter style={{ width: '16px', height: '16px' }} />

            </GlassButton>



            <div style={{

              display: 'flex',

              backgroundColor: 'var(--bg-input)',

              border: '1px solid colors.border',

              borderRadius: '10px',

              overflow: 'hidden',

            }}>

              <GlassButton

                onClick={() => setViewMode('grid')}

                style={{

                  height: '40px',

                  width: '40px',

                  padding: 0,

                  display: 'flex',

                  alignItems: 'center',

                  justifyContent: 'center',

                  backgroundColor: viewMode === 'grid' ? 'colors.accent' : 'transparent',

                  border: 'none',

                  color: viewMode === 'grid' ? 'white' : 'colors.textMuted',

                  cursor: 'pointer',

                  transition: 'all 0.2s ease',

                }}

              >

                <Grid3x3 style={{ width: '16px', height: '16px' }} />

              </GlassButton>

              <GlassButton

                onClick={() => setViewMode('list')}

                style={{

                  height: '40px',

                  width: '40px',

                  padding: 0,

                  display: 'flex',

                  alignItems: 'center',

                  justifyContent: 'center',

                  backgroundColor: viewMode === 'list' ? 'colors.accent' : 'transparent',

                  border: 'none',

                  color: viewMode === 'list' ? 'white' : 'colors.textMuted',

                  cursor: 'pointer',

                  transition: 'all 0.2s ease',

                }}

              >

                <List style={{ width: '16px', height: '16px' }} />

              </GlassButton>

            </div>

          </div>



          {showFilters && uniqueTypes.length > 0 && (

            <div style={{

              marginTop: '16px',

              display: 'flex',

              gap: '8px',

              flexWrap: 'wrap',

            }}>

              <GlassButton

                onClick={() => setSelectedType(null)}

                style={{

                  height: '36px',

                  padding: '0 14px',

                  fontSize: '13px',

                  fontWeight: '500',

                  backgroundColor: selectedType === null ? 'colors.accent' : 'var(--bg-input)',

                  border: '1px solid colors.border',

                  borderRadius: '8px',

                  color: selectedType === null ? 'white' : 'colors.textSecondary',

                  cursor: 'pointer',

                  transition: 'all 0.2s ease',

                }}

              >

                全部类型

              </GlassButton>

              {uniqueTypes.map((type) => {

                const config = getDocumentTypeConfig(type);

                const ConfigIcon = config.icon;

                return (

                  <GlassButton

                    key={type}

                    onClick={() => setSelectedType(selectedType === type ? null : type)}

                    style={{

                      height: '36px',

                      padding: '0 14px',

                      fontSize: '13px',

                      fontWeight: '500',

                      backgroundColor: selectedType === type ? config.color : config.bgColor,

                      border: `1px solid ${selectedType === type ? config.color : config.borderColor}`,

                      borderRadius: '8px',

                      color: selectedType === type ? 'white' : config.color,

                      cursor: 'pointer',

                      transition: 'all 0.2s ease',

                      display: 'flex',

                      alignItems: 'center',

                      gap: '6px',

                    }}

                  >

                    <ConfigIcon style={{ width: '14px', height: '14px' }} />

                    {config.label}

                  </GlassButton>

                );

              })}

            </div>

          )}

        </div>

      </div>



      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>

        <div style={{

          display: 'grid',

          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',

          gap: '16px',

          marginBottom: '24px',

        }}>

          <StatCard

            icon={FileText}

            color="colors.accent"

            bgColor="colors.accentBg"

            label="总文档"

            value={stats.total}

          />

          {Object.entries(stats.typeCounts).slice(0, 3).map(([type, count]) => {

            const config = getDocumentTypeConfig(type);

            const Icon = config.icon;

            return (

              <StatCard

                key={type}

                icon={Icon}

                color={config.color}

                bgColor={config.bgColor}

                label={config.label}

                value={count}

              />

            );

          })}

        </div>



        {filteredAndSortedDocuments.length === 0 ? (

          <div style={{

            background: 'colors.bgSurface',

            borderRadius: '20px',

            padding: '64px 32px',

            border: '1px solid colors.border',

            textAlign: 'center',

          }}>

            <div style={{

              width: '80px',

              height: '80px',

              borderRadius: '24px',

              background: 'colors.bgGlassHover',

              display: 'flex',

              alignItems: 'center',

              justifyContent: 'center',

              margin: '0 auto 20px',

            }}>

              <FilePlus style={{ width: '36px', height: '36px', color: 'colors.textMuted' }} />

            </div>

            <p style={{ fontSize: '16px', fontWeight: '500', color: 'colors.textPrimary', marginBottom: '8px' }}>

              {searchQuery ? '未找到匹配的文档' : '暂无文档'}

            </p>

            <p style={{ fontSize: '14px', color: 'colors.textMuted', marginBottom: '24px' }}>

              {searchQuery ? '尝试调整搜索条件或筛选器' : '点击右上角创建您的第一个文档'}

            </p>

            {!searchQuery && (

              <GlassButton variant="primary" onClick={handleCreateDocument}>

                <Plus style={{ width: '16px', height: '16px' }} />

                新建文档

              </GlassButton>

            )}

          </div>

        ) : viewMode === 'grid' ? (

          <div style={{

            display: 'grid',

            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',

            gap: '20px',

          }}>

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

            marginTop: '24px',

            padding: '16px 0',

            borderTop: '1px solid colors.border',

            display: 'flex',

            justifyContent: 'space-between',

            alignItems: 'center',

          }}>

            <span style={{ fontSize: '14px', color: 'colors.textMuted' }}>
              显示 {filteredAndSortedDocuments.length} 个文档
              {selectedType && ` · 类型: ${getDocumentTypeConfig(selectedType).label}`}
            </span>

          </div>

        )}

      </div>



      <style>

        {`

          @keyframes spin {

            from { transform: rotate(0deg); }

            to { transform: rotate(360deg); }

          }

        `}

      </style>

    </div>

  );

};



interface StatCardProps {

  icon: React.ElementType;

  color: string;

  bgColor: string;

  label: string;

  value: number;

}



const StatCard = ({ icon: Icon, color, bgColor, label, value }: StatCardProps) => {

  const [isHovered, setIsHovered] = useState(false);



  return (

    <div

      style={{

        background: 'colors.bgSurface',

        borderRadius: '16px',

        padding: '20px',

        border: '1px solid colors.border',

        backdropFilter: 'blur(20px)',

        transition: 'all 0.2s ease',

        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',

        boxShadow: isHovered ? '0 8px 24px rgba(0, 0, 0, 0.08)' : 'none',

      }}

      onMouseEnter={() => setIsHovered(true)}

      onMouseLeave={() => setIsHovered(false)}

    >

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>

        <div style={{

          width: '40px',

          height: '40px',

          borderRadius: '10px',

          background: bgColor,

          display: 'flex',

          alignItems: 'center',

          justifyContent: 'center',

        }}>

          <Icon style={{ width: '20px', height: '20px', color }} />

        </div>

        <span style={{ fontSize: '13px', color: 'colors.textMuted', fontWeight: '500' }}>{label}</span>

      </div>

      <div style={{ fontSize: '32px', fontWeight: '700', color }}>{value}</div>

    </div>

  );

};



interface DocumentCardProps {

  document: Document;

  typeConfig: { icon: React.ElementType; color: string; gradient: string; bgColor: string; borderColor: string; label: string };

  statusConfig: { color: string; bgColor: string; borderColor: string; label: string };

  TypeIcon: React.ElementType;

  isHovered: boolean;

  onHover: (hovered: boolean) => void;

  onClick: () => void;

  formatDate: (date: string) => string;

}



const DocumentCard = ({ document, typeConfig, statusConfig, TypeIcon, isHovered, onHover, onClick, formatDate }: DocumentCardProps) => {

  return (

    <div

      onClick={onClick}

      style={{

        background: 'colors.bgSurface',

        border: '1px solid colors.border',

        borderRadius: '20px',

        overflow: 'hidden',

        cursor: 'pointer',

        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

        transform: isHovered ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)',

        boxShadow: isHovered ? '0 20px 40px rgba(0, 0, 0, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.04)',

        position: 'relative',

      }}

      onMouseEnter={() => onHover(true)}

      onMouseLeave={() => onHover(false)}

    >

      <div style={{

        position: 'absolute',

        top: 0,

        left: 0,

        right: 0,

        height: '100%',

        background: `linear-gradient(180deg, ${typeConfig.color}08 0%, transparent 30%)`,

        pointerEvents: 'none',

      }} />



      <div style={{ padding: '24px', position: 'relative', zIndex: 1 }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>

          <div style={{

            width: '56px',

            height: '56px',

            borderRadius: '16px',

            background: typeConfig.gradient,

            display: 'flex',

            alignItems: 'center',

            justifyContent: 'center',

            flexShrink: 0,

            boxShadow: `0 8px 20px ${typeConfig.color}30`,

          }}>

            <TypeIcon style={{ width: '28px', height: '28px', color: 'white' }} />

          </div>

          <div style={{ flex: 1, minWidth: 0 }}>

            <h3 style={{

              fontSize: '17px',

              fontWeight: '700',

              color: 'colors.textPrimary',

              margin: '0 0 8px 0',

              overflow: 'hidden',

              textOverflow: 'ellipsis',

              whiteSpace: 'nowrap',

              letterSpacing: '-0.01em',

            }}>

              {document.title}

            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>

              <span style={{

                display: 'inline-flex',

                alignItems: 'center',

                gap: '4px',

                padding: '4px 12px',

                fontSize: '12px',

                fontWeight: '600',

                color: typeConfig.color,

                backgroundColor: typeConfig.bgColor,

                border: `1px solid ${typeConfig.borderColor}`,

                borderRadius: '8px',

              }}>

                {typeConfig.label}

              </span>

              <span style={{

                display: 'inline-flex',

                alignItems: 'center',

                gap: '4px',

                padding: '4px 12px',

                fontSize: '12px',

                fontWeight: '600',

                color: statusConfig.color,

                backgroundColor: statusConfig.bgColor,

                border: `1px solid ${statusConfig.borderColor}`,

                borderRadius: '8px',

              }}>

                {statusConfig.label}

              </span>

            </div>

          </div>

        </div>



        <p style={{

          fontSize: '14px',

          color: 'colors.textSecondary',

          lineHeight: '1.7',

          margin: '0 0 20px 0',

          display: '-webkit-box',

          WebkitLineClamp: 2,

          WebkitBoxOrient: 'vertical',

          overflow: 'hidden',

          minHeight: '48px',

        }}>

          {(document.content || '').substring(0, 120).replace(/<[^>]*>/g, '')}

          {(document.content?.length || 0) > 120 && '...'}

        </p>



        <div style={{

          display: 'flex',

          justifyContent: 'space-between',

          alignItems: 'center',

          padding: '14px 16px',

          background: 'colors.bgGlassHover',

          borderRadius: '12px',

        }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

            <Clock style={{ width: '14px', height: '14px', color: 'colors.textMuted' }} />

            <span style={{ fontSize: '13px', color: 'colors.textSecondary', fontWeight: '500' }}>

              {formatDate(document.updatedAt)}

            </span>

          </div>

          {document.project && (

            <span style={{

              display: 'inline-flex',

              alignItems: 'center',

              gap: '6px',

              padding: '6px 12px',

              fontSize: '12px',

              fontWeight: '600',

              color: 'colors.textSecondary',

              backgroundColor: 'colors.bgSurface',

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

  typeConfig: { icon: React.ElementType; color: string; gradient: string; bgColor: string; borderColor: string; label: string };

  statusConfig: { color: string; bgColor: string; borderColor: string; label: string };

  TypeIcon: React.ElementType;

  isHovered: boolean;

  onHover: (hovered: boolean) => void;

  onClick: () => void;

  formatDate: (date: string) => string;

}



const DocumentListItem = ({ document, typeConfig, statusConfig, TypeIcon, isHovered, onHover, onClick, formatDate }: DocumentListItemProps) => {

  return (

    <div

      onClick={onClick}

      style={{

        display: 'flex',

        alignItems: 'center',

        gap: '20px',

        background: 'colors.bgSurface',

        border: '1px solid colors.border',

        borderRadius: '16px',

        padding: '20px 24px',

        cursor: 'pointer',

        transition: 'all 0.2s ease',

        transform: isHovered ? 'translateX(4px)' : 'translateX(0)',

        boxShadow: isHovered ? '0 8px 24px rgba(0, 0, 0, 0.08)' : 'none',

      }}

      onMouseEnter={() => onHover(true)}

      onMouseLeave={() => onHover(false)}

    >

      <div style={{

        width: '52px',

        height: '52px',

        borderRadius: '14px',

        background: typeConfig.gradient,

        display: 'flex',

        alignItems: 'center',

        justifyContent: 'center',

        flexShrink: 0,

        boxShadow: `0 6px 16px ${typeConfig.color}25`,

      }}>

        <TypeIcon style={{ width: '26px', height: '26px', color: 'white' }} />

      </div>



      <div style={{ flex: 1, minWidth: 0 }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>

          <h3 style={{

            fontSize: '16px',

            fontWeight: '600',

            color: 'colors.textPrimary',

            margin: 0,

            overflow: 'hidden',

            textOverflow: 'ellipsis',

            whiteSpace: 'nowrap',

          }}>

            {document.title}

          </h3>

          <span style={{

            display: 'inline-flex',

            alignItems: 'center',

            padding: '3px 10px',

            fontSize: '11px',

            fontWeight: '600',

            color: typeConfig.color,

            backgroundColor: typeConfig.bgColor,

            borderRadius: '6px',

          }}>

            {typeConfig.label}

          </span>

          <span style={{

            display: 'inline-flex',

            alignItems: 'center',

            padding: '3px 10px',

            fontSize: '11px',

            fontWeight: '600',

            color: statusConfig.color,

            backgroundColor: statusConfig.bgColor,

            borderRadius: '6px',

          }}>

            {statusConfig.label}

          </span>

        </div>

        <p style={{

          fontSize: '13px',

          color: 'colors.textMuted',

          margin: 0,

          overflow: 'hidden',

          textOverflow: 'ellipsis',

          whiteSpace: 'nowrap',

        }}>

          {(document.content || '').substring(0, 80).replace(/<[^>]*>/g, '')}

        </p>

      </div>



      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>

        {document.project && (

          <span style={{

            display: 'inline-flex',

            alignItems: 'center',

            gap: '6px',

            padding: '6px 14px',

            fontSize: '13px',

            fontWeight: '500',

            color: 'colors.textSecondary',

            backgroundColor: 'colors.bgGlassHover',

            borderRadius: '8px',

          }}>

            <FolderOpen style={{ width: '14px', height: '14px' }} />

            {document.project.name}

          </span>

        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '80px' }}>

          <Clock style={{ width: '14px', height: '14px', color: 'colors.textMuted' }} />

          <span style={{ fontSize: '13px', color: 'colors.textSecondary', fontWeight: '500' }}>

            {formatDate(document.updatedAt)}

          </span>

        </div>

        <ChevronRight style={{ width: '18px', height: '18px', color: 'colors.textMuted' }} />

      </div>

    </div>

  );

};



export default DocumentsPage;





