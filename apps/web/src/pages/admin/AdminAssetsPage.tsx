import React, { useEffect, useState } from 'react';
import { api } from '../../core/api/client';
import { 
  Image, Video, Music, FileText, Trash2, Search, 
  ExternalLink, ChevronLeft, ChevronRight, X, Check
} from 'lucide-react';

interface Asset {
  id: string;
  type: string;
  url: string;
  projectId: string;
  category: string | null;
  source: string | null;
  createdAt: string;
}

interface AssetStats {
  total: number;
  byType: Array<{ type: string; count: number }>;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [stats, setStats] = useState<AssetStats | null>(null);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchAssets = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', '20');
      if (search) params.append('search', search);
      if (typeFilter) params.append('type', typeFilter);

      const response = await api.get<{ assets: Asset[]; pagination: Pagination }>(
        `/api/admin/assets?${params.toString()}`
      );
      setAssets(response.assets);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get<AssetStats>('/api/admin/assets/stats');
      setStats(response);
    } catch (error) {
      console.error('Failed to fetch asset stats:', error);
    }
  };

  useEffect(() => {
    fetchAssets();
    fetchStats();
  }, [typeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAssets(1);
  };

  const handleDeleteAsset = async (assetId: string) => {
    try {
      await api.delete(`/api/admin/assets/${assetId}`);
      fetchAssets(pagination.page);
      fetchStats();
    } catch (error) {
      console.error('Failed to delete asset:', error);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedAssets.length === 0) return;
    try {
      await api.post('/api/admin/assets/batch-delete', { ids: selectedAssets });
      setSelectedAssets([]);
      fetchAssets(pagination.page);
      fetchStats();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to batch delete assets:', error);
    }
  };

  const toggleSelectAll = () => {
    if (selectedAssets.length === assets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(assets.map(a => a.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedAssets.includes(id)) {
      setSelectedAssets(selectedAssets.filter(a => a !== id));
    } else {
      setSelectedAssets([...selectedAssets, id]);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image size={20} />;
      case 'video': return <Video size={20} />;
      case 'audio': return <Music size={20} />;
      default: return <FileText size={20} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'image': return '图片';
      case 'video': return '视频';
      case 'audio': return '音频';
      case 'document': return '文档';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'image': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'rgba(16, 185, 129, 0.3)' };
      case 'video': return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' };
      case 'audio': return { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', border: 'rgba(139, 92, 246, 0.3)' };
      default: return { bg: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: 'var(--border-primary)' };
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '44px',
    padding: '0 16px',
    fontSize: '14px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-primary)',
    borderRadius: '12px',
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'all 0.2s ease',
  };

  const selectStyle: React.CSSProperties = {
    height: '44px',
    padding: '0 36px 0 16px',
    fontSize: '14px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-primary)',
    borderRadius: '12px',
    color: 'var(--text-primary)',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          素材管理
        </h2>
        {selectedAssets.length > 0 && (
          <button
            onClick={() => setShowDeleteModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
            }}
          >
            <Trash2 size={18} />
            删除选中 ({selectedAssets.length})
          </button>
        )}
      </div>

      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-primary)',
            borderRadius: '14px',
            padding: '20px',
          }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>总素材数</p>
            <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {stats.total}
            </p>
          </div>
          {stats.byType.slice(0, 3).map((t) => (
            <div key={t.type} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-primary)',
              borderRadius: '14px',
              padding: '20px',
            }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                {getTypeLabel(t.type)}
              </p>
              <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {t.count}
              </p>
            </div>
          ))}
        </div>
      )}

      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-primary)',
        borderRadius: '16px',
        padding: '20px',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', flex: 1 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)',
              }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索素材..."
                style={{ ...inputStyle, paddingLeft: '44px' }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '0 20px',
                height: '44px',
                background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 122, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              搜索
            </button>
          </form>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={selectStyle}
          >
            <option value="">所有类型</option>
            <option value="image">图片</option>
            <option value="video">视频</option>
            <option value="audio">音频</option>
            <option value="document">文档</option>
          </select>
        </div>
      </div>

      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-primary)',
        borderRadius: '16px',
        overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--bg-secondary)' }}>
              <tr>
                <th style={{ padding: '14px 16px', textAlign: 'left', width: '50px' }}>
                  <input
                    type="checkbox"
                    checked={selectedAssets.length === assets.length && assets.length > 0}
                    onChange={toggleSelectAll}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                  />
                </th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>预览</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>类型</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>分类</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>来源</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>上传时间</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>操作</th>
              </tr>
            </thead>
            <tbody style={{ borderTop: '1px solid var(--border-primary)' }}>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    加载中...
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    暂无素材数据
                  </td>
                </tr>
              ) : (
                assets.map((asset) => {
                  const typeStyle = getTypeColor(asset.type);
                  return (
                    <tr 
                      key={asset.id} 
                      style={{ 
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px' }}>
                        <input
                          type="checkbox"
                          checked={selectedAssets.includes(asset.id)}
                          onChange={() => toggleSelect(asset.id)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                        />
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '10px',
                          background: 'var(--bg-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                        }}>
                          {asset.type === 'image' ? (
                            <img src={asset.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ color: typeStyle.color }}>{getTypeIcon(asset.type)}</div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 12px',
                          fontSize: '12px',
                          fontWeight: 500,
                          borderRadius: '100px',
                          background: typeStyle.bg,
                          color: typeStyle.color,
                          border: `1px solid ${typeStyle.border}`,
                        }}>
                          {getTypeIcon(asset.type)}
                          {getTypeLabel(asset.type)}
                        </span>
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        {asset.category || '未分类'}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        {asset.source || '上传'}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        {new Date(asset.createdAt).toLocaleDateString('zh-CN')}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <a
                            href={asset.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: 'var(--color-primary)',
                              fontSize: '14px',
                              fontWeight: 500,
                              textDecoration: 'none',
                              transition: 'color 0.2s ease',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                          >
                            <ExternalLink size={16} />
                          </a>
                          <button
                            onClick={() => handleDeleteAsset(asset.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              fontSize: '14px',
                              fontWeight: 500,
                              cursor: 'pointer',
                              padding: '4px',
                              transition: 'color 0.2s ease',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#dc2626'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#ef4444'}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
              共 {pagination.total} 个素材
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => fetchAssets(pagination.page - 1)}
                disabled={pagination.page === 1}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 14px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: pagination.page === 1 ? 'var(--text-tertiary)' : 'var(--text-primary)',
                  cursor: pagination.page === 1 ? 'not-allowed' : 'pointer',
                  opacity: pagination.page === 1 ? 0.5 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                <ChevronLeft size={16} />
                上一页
              </button>
              <span style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchAssets(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 14px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: pagination.page === pagination.totalPages ? 'var(--text-tertiary)' : 'var(--text-primary)',
                  cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer',
                  opacity: pagination.page === pagination.totalPages ? 0.5 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                下一页
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: '20px',
            padding: '28px',
            width: '100%',
            maxWidth: '420px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
              确认删除
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
              确定要删除选中的 <strong style={{ color: '#ef4444' }}>{selectedAssets.length}</strong> 个素材吗？此操作不可撤销。
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  padding: '10px 20px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-surface)'}
              >
                取消
              </button>
              <button
                onClick={handleBatchDelete}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
