import { useState, useEffect, useCallback } from 'react';
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
  Sparkles,
  Grid,
  List
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
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [hoveredAsset, setHoveredAsset] = useState<string | null>(null);
  const [uploadHover, setUploadHover] = useState(false);

  const loadAssets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAssets(filter === 'all' ? undefined : filter, search || undefined);
      setAssets(data);
    } catch (error) {
      console.error('Failed to load assets:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const newAsset = await apiClient.uploadAssetGlobal(file);
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
      await apiClient.delete(`/assets/${assetId}`);
      setAssets(prev => prev.filter(a => a.id !== assetId));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image style={{ width: '32px', height: '32px', color: '#6366f1' }} />;
      case 'video': return <Video style={{ width: '32px', height: '32px', color: '#ec4899' }} />;
      case 'audio': return <Music style={{ width: '32px', height: '32px', color: '#14b8a6' }} />;
      default: return <FileText style={{ width: '32px', height: '32px', color: '#f59e0b' }} />;
    }
  };

  const getAssetColor = (type: string) => {
    switch (type) {
      case 'image': return 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';
      case 'video': return 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)';
      case 'audio': return 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)';
      default: return 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)';
    }
  };

  const getAssetTypeLabel = (type: string) => {
    switch (type) {
      case 'image': return '图片';
      case 'video': return '视频';
      case 'audio': return '音频';
      case 'character': return '角色';
      case 'scene': return '场景';
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
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-page)',
    }}>
      <header style={{
        height: '72px',
        borderBottom: '1px solid var(--border-primary)',
        background: 'var(--bg-header)',
        backdropFilter: 'blur(20px)',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
          }}>
            <Image style={{ width: '24px', height: '24px', color: '#fff' }} />
          </div>
          <div>
            <h1 style={{
              fontSize: '22px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '0 0 2px 0',
            }}>素材库</h1>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              管理所有项目中的素材文件
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '18px',
              height: '18px',
              color: 'var(--text-muted)',
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
                padding: '10px 16px 10px 44px',
                width: '280px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-primary)',
                borderRadius: '10px',
                outline: 'none',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#6366f1'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-primary)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
            {search && (
              <button
                onClick={clearSearch}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: 'var(--text-muted)',
                }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            )}
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '10px 36px 10px 14px',
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--text-primary)',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-primary)',
              borderRadius: '10px',
              outline: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              backgroundSize: '16px',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#6366f1'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-primary)'
              e.currentTarget.style.boxShadow = 'none'
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
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-primary)',
            borderRadius: '10px',
          }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '8px',
                borderRadius: '8px',
                background: viewMode === 'grid' ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <Grid style={{ width: '18px', height: '18px', color: viewMode === 'grid' ? '#fff' : 'var(--text-muted)' }} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '8px',
                borderRadius: '8px',
                background: viewMode === 'list' ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <List style={{ width: '18px', height: '18px', color: viewMode === 'list' ? '#fff' : 'var(--text-muted)' }} />
            </button>
          </div>

          <label style={{ display: 'inline-block' }}>
            <input
              type="file"
              style={{ display: 'none' }}
              accept="image/*,video/*,audio/*,application/pdf"
              onChange={handleUpload}
              disabled={uploading}
            />
            <button
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'image/*,video/*,audio/*,application/pdf'
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  if (file) {
                    const event = { target: { files: [file] } } as any
                    handleUpload(event)
                  }
                }
                input.click()
              }}
              disabled={uploading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '10px',
                background: uploadHover ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                border: 'none',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '500',
                cursor: uploading ? 'not-allowed' : 'pointer',
                opacity: uploading ? 0.7 : 1,
                transition: 'all 0.2s ease',
                boxShadow: uploadHover ? '0 8px 24px rgba(99, 102, 241, 0.4)' : '0 4px 14px rgba(99, 102, 241, 0.3)',
                transform: uploadHover ? 'translateY(-1px)' : 'translateY(0)',
              }}
              onMouseEnter={() => setUploadHover(true)}
              onMouseLeave={() => setUploadHover(false)}
            >
              {uploading ? (
                <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
              ) : (
                <Upload style={{ width: '16px', height: '16px' }} />
              )}
              {uploading ? '上传中...' : '上传素材'}
            </button>
          </label>
        </div>
      </header>

      <div style={{ flex: 1, padding: '24px 32px', overflow: 'auto' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
          borderRadius: '12px',
          marginBottom: '20px',
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
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Loader2 style={{ width: '32px', height: '32px', color: '#fff', animation: 'spin 1s linear infinite' }} />
            </div>
            <p style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)' }}>加载素材中...</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>正在获取所有项目素材</p>
          </div>
        ) : assets.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 20px',
            gap: '24px',
            background: 'var(--bg-card)',
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
              <Image style={{ width: '48px', height: '48px', color: '#6366f1' }} />
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
            {assets.map((asset) => {
              const isHovered = hoveredAsset === asset.id
              return (
                <div
                  key={asset.id}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: `1px solid ${isHovered ? '#6366f1' : 'var(--border-primary)'}`,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    boxShadow: isHovered ? '0 12px 32px rgba(99, 102, 241, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                    transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                  }}
                  onMouseEnter={() => setHoveredAsset(asset.id)}
                  onMouseLeave={() => setHoveredAsset(null)}
                  onClick={() => window.open(asset.url, '_blank')}
                >
                  <div style={{
                    position: 'relative',
                    aspectRatio: viewMode === 'grid' ? '1/1' : '16/9',
                    background: 'var(--bg-hover)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    {(asset.type === 'image' || asset.type === 'character' || asset.type === 'scene') ? (
                      <img
                        src={(asset as any).thumbnailUrl || asset.url}
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
                      opacity: isHovered ? 1 : 0,
                      transition: 'opacity 0.2s ease',
                    }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(asset.url, '_blank');
                        }}
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(8px)',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Download style={{ width: '16px', height: '16px', color: '#6366f1' }} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(asset.id);
                        }}
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          background: 'rgba(239, 68, 68, 0.9)',
                          backdropFilter: 'blur(8px)',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Trash2 style={{ width: '16px', height: '16px', color: '#fff' }} />
                      </button>
                    </div>
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
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {new Date(asset.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default AssetsPage;
