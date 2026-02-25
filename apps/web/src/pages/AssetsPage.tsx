import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../lib/api-client';
import { Button } from '../components/ui/button-new';
import { 
  Upload, 
  Image, 
  Video, 
  FileText, 
  Music, 
  Trash2, 
  Search,
  Loader2,
  X,
  Download,
  MoreVertical,
  Sparkles,
  Grid,
  List,
  Filter
} from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  type: string;
  mimeType?: string;
  size?: number;
  url: string;
  thumbnailUrl?: string;
  createdAt: string;
}

function AssetsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const loadAssets = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await apiClient.getProjectAssets(projectId, filter === 'all' ? undefined : filter, search || undefined);
      setAssets(data);
    } catch (error) {
      console.error('Failed to load assets:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId, filter, search]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !projectId) return;

    try {
      setUploading(true);
      const newAsset = await apiClient.uploadAsset(projectId, file);
      setAssets(prev => [newAsset, ...prev]);
    } catch (error) {
      console.error('Failed to upload:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (assetId: string) => {
    if (!confirm('确定要删除这个素材吗？')) return;
    try {
      await apiClient.deleteAsset(assetId);
      setAssets(prev => prev.filter(a => a.id !== assetId));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image style={{ width: '32px', height: '32px', color: 'var(--accent)' }} />;
      case 'video': return <Video style={{ width: '32px', height: '32px', color: 'var(--accent)' }} />;
      case 'audio': return <Music style={{ width: '32px', height: '32px', color: 'var(--accent)' }} />;
      default: return <FileText style={{ width: '32px', height: '32px', color: 'var(--accent)' }} />;
    }
  };

  const getAssetColor = (type: string) => {
    switch (type) {
      case 'image': return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'video': return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
      case 'audio': return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
      default: return 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';
    }
  };

  const getAssetTypeLabel = (type: string) => {
    switch (type) {
      case 'image': return '图片';
      case 'video': return '视频';
      case 'audio': return '音频';
      default: return '文档';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const clearSearch = () => {
    setSearch('');
  };

  return (
    <div style={{
      padding: '32px',
      maxWidth: '1600px',
      margin: '0 auto',
      minHeight: 'calc(100vh - 64px)',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent) 100%)',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
            }}>
              <Sparkles style={{ width: '28px', height: '28px', color: 'var(--accent-on)' }} />
            </div>
            <div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                margin: 0,
                letterSpacing: '-0.02em',
              }}>
                素材库
              </h1>
              <p style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                margin: '4px 0 0 0',
              }}>
                管理项目中的所有素材文件
              </p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}>
              <Search style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '18px',
                height: '18px',
                color: 'var(--text-tertiary)',
                pointerEvents: 'none',
              }} />
              <input
                type="text"
                placeholder="搜索素材..."
                value={search}
                onChange={handleSearch}
                style={{
                  paddingLeft: '44px',
                  paddingRight: search ? '44px' : '16px',
                  padding: '12px 16px',
                  width: '280px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              {search && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={clearSearch}
                  aria-label="清除搜索"
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }}
                  icon={<X size={14} />}
                />
              )}
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-primary)',
                borderRadius: '12px',
                outline: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '16px',
                paddingRight: '40px',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-primary)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <option value="all">全部类型</option>
              <option value="image">图片</option>
              <option value="video">视频</option>
              <option value="audio">音频</option>
              <option value="document">文档</option>
            </select>

            <div style={{
              display: 'flex',
              gap: '4px',
              padding: '4px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-primary)',
              borderRadius: '12px',
            }}>
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="icon-sm"
                onClick={() => setViewMode('grid')}
                aria-label="网格视图"
                icon={<Grid size={18} />}
              />
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="icon-sm"
                onClick={() => setViewMode('list')}
                aria-label="列表视图"
                icon={<List size={18} />}
              />
            </div>

            <label style={{
              display: 'inline-block',
            }}>
              <input
                type="file"
                style={{ display: 'none' }}
                accept="image/*,video/*,audio/*,application/pdf"
                onChange={handleUpload}
                disabled={uploading}
              />
              <Button
                variant="primary"
                disabled={uploading}
                loading={uploading}
                icon={uploading ? <Loader2 size={16} /> : <Upload size={16} />}
              >
                {uploading ? '上传中...' : '上传素材'}
              </Button>
            </label>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-primary)',
          borderRadius: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              共 <strong style={{ color: 'var(--text-primary)' }}>{assets.length}</strong> 个素材
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 20px',
            gap: '16px',
          }}>
            <Loader2 style={{ width: '48px', height: '48px', color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>加载素材中...</p>
          </div>
        ) : assets.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 20px',
            gap: '24px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-primary)',
            borderRadius: '16px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
            }}>
              <Image style={{ width: '48px', height: '48px', color: 'var(--accent)' }} />
            </div>
            <div style={{ textAlign: 'center', maxWidth: '400px' }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                margin: '0 0 8px 0',
              }}>
                暂无素材
              </h3>
              <p style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                margin: 0,
              }}>
                点击"上传素材"按钮开始添加您的第一个素材文件
              </p>
            </div>
          </div>
        ) : (
          <div style={{
            display: viewMode === 'grid' ? 'grid' : 'flex',
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : undefined,
            flexDirection: viewMode === 'list' ? 'column' : undefined,
            gap: '16px',
          }}>
            {assets.map((asset) => (
              <div
                key={asset.id}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.12)';
                  e.currentTarget.style.borderColor = 'var(--accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                }}
                onClick={() => window.open(asset.url, '_blank')}
              >
                <div style={{
                  position: 'relative',
                  aspectRatio: viewMode === 'grid' ? '1/1' : '16/9',
                  background: 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}>
                  {asset.type === 'image' && asset.thumbnailUrl ? (
                    <img
                      src={asset.thumbnailUrl || asset.url}
                      alt={asset.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                      background: getAssetColor(asset.type),
                    }}>
                      {getAssetIcon(asset.type)}
                    </div>
                  )}

                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    display: 'flex',
                    gap: '8px',
                  }}>
                    <span style={{
                      padding: '6px 12px',
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'white',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      {getAssetTypeLabel(asset.type)}
                    </span>
                  </div>

                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    display: 'flex',
                    gap: '8px',
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                  }}>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(asset.url, '_blank');
                      }}
                      aria-label="下载素材"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)' }}
                      icon={<Download size={16} />}
                    />
                    <Button
                      variant="danger"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(asset.id);
                      }}
                      aria-label="删除素材"
                      style={{ backgroundColor: 'rgba(239, 68, 68, 0.9)', backdropFilter: 'blur(8px)' }}
                      icon={<Trash2 size={16} />}
                    />
                  </div>

                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0, 0, 0, 0.4) 0%, transparent 50%)',
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                    pointerEvents: 'none',
                  }} />
                </div>

                <div style={{
                  padding: viewMode === 'grid' ? '16px' : '12px 16px',
                }}>
                  <p style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    margin: '0 0 4px 0',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }} title={asset.name}>
                    {asset.name}
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                  }}>
                    <span>{formatFileSize(asset.size)}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                      {new Date(asset.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AssetsPage;
