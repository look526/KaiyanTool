import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Trash2,
  X,
  Loader2,
  Download,
  GripVertical,
  Check,
  Film,
  RefreshCw
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { apiClient } from '../lib/api';
import { useToast } from '../components/ui/Toast';
import { uiConfig } from '../config';

interface Video {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string | null;
  status: string;
  duration: number;
  format: string;
  createdAt: string;
  shot?: {
    id: string;
    actionSummary: string;
    scene?: {
      name: string;
    };
    character?: {
      name: string;
    };
  };
}

interface MergeTask {
  id: string;
  status: string;
  outputUrl: string | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
}

export default function VideoMergePage() {
  const { id: projectId } = useParams<{ id: string }>();
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideoIds, setSelectedVideoIds] = useState<Set<string>>(new Set());
  const [selectedVideos, setSelectedVideos] = useState<Video[]>([]);
  const [mergeTask, setMergeTask] = useState<MergeTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [merging, setMerging] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const { addToast } = useToast();

  const loadVideos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getProjectVideos(projectId!);
      setVideos(data);
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const checkMergeStatus = useCallback(async () => {
    if (!mergeTask || mergeTask.status === 'completed' || mergeTask.status === 'failed') {
      return;
    }

    try {
      const status = await apiClient.getMergeTaskStatus(mergeTask.id);
      setMergeTask(status);

      if (status.status === 'pending' || status.status === 'processing') {
        setTimeout(checkMergeStatus, uiConfig.videoMergePollingInterval);
      }
    } catch (error) {
      console.error('Failed to check merge status:', error);
    }
  }, [mergeTask]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  useEffect(() => {
    checkMergeStatus();
  }, [checkMergeStatus]);

  const handleToggleVideo = (video: Video) => {
    const newSelected = new Set(selectedVideoIds);
    if (newSelected.has(video.id)) {
      newSelected.delete(video.id);
    } else {
      newSelected.add(video.id);
    }
    setSelectedVideoIds(newSelected);

    const newSelectedVideos = videos.filter(v => newSelected.has(v.id));
    setSelectedVideos(newSelectedVideos);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === targetIndex) return;

    const newSelectedVideos = [...selectedVideos];
    const [draggedVideo] = newSelectedVideos.splice(draggingIndex!, 1);
    newSelectedVideos.splice(targetIndex, 0, draggedVideo);

    setSelectedVideos(newSelectedVideos);
    setDraggingIndex(null);
  };

  const handleRemoveFromSelection = (videoId: string) => {
    const newSelected = new Set(selectedVideoIds);
    newSelected.delete(videoId);
    setSelectedVideoIds(newSelected);
    setSelectedVideos(selectedVideos.filter(v => v.id !== videoId));
  };

  const handleStartMerge = async () => {
    if (selectedVideos.length < 2) {
      addToast({
        type: 'warning',
        title: '无法合并',
        message: '请至少选择2个视频进行合并。',
      });
      return;
    }

    try {
      setMerging(true);
      const task = await apiClient.createVideoMergeTask(projectId!, selectedVideos.map(v => v.id));
      setMergeTask(task);
    } catch (error) {
      console.error('Failed to create merge task:', error);
      addToast({
        type: 'error',
        title: '创建失败',
        message: '合并任务创建失败，请稍后重试。',
      });
    } finally {
      setMerging(false);
    }
  };

  const handleDeleteVideo = async () => {
    if (!videoToDelete) return;

    try {
      await apiClient.deleteVideo(videoToDelete);
      await loadVideos();
      handleCloseDeleteModal();
    } catch (error) {
      console.error('Failed to delete video:', error);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setVideoToDelete(null);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'var(--success)';
      case 'processing': return 'var(--accent)';
      case 'failed': return 'var(--error)';
      default: return 'var(--text-tertiary)';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '完成';
      case 'processing': return '处理中';
      case 'failed': return '失败';
      case 'pending': return '等待中';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 style={{ width: '48px', height: '48px', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <header style={{
          height: '64px',
          borderBottom: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-elevated)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to={`/projects/${projectId}/shots`} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'var(--text-muted)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
            >
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
            </Link>
            <div>
              <h1 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                margin: '0 0 4px 0',
              }}>视频拼接</h1>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                共 {videos.length} 个视频
              </div>
            </div>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
            <div>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '16px',
                margin: '0 0 16px 0',
              }}>项目视频</h2>

              {videos.length === 0 ? (
                <Card style={{ padding: '48px', textAlign: 'center' }}>
                  <Film style={{ width: '64px', height: '64px', color: 'var(--text-muted)', marginBottom: '16px', margin: '0 auto 16px auto' }} />
                  <p style={{ color: 'var(--text-tertiary)', fontSize: '16px', margin: 0 }}>
                    暂无视频
                  </p>
                </Card>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '16px',
                }}>
                  {videos.map((video) => (
                    <Card
                      key={video.id}
                      style={{
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: selectedVideoIds.has(video.id) ? '2px solid var(--accent)' : '1px solid var(--border-primary)',
                        transition: 'all 0.2s ease',
                      }}
                      onClick={() => handleToggleVideo(video)}
                      onMouseEnter={(e) => {
                        if (!selectedVideoIds.has(video.id)) {
                          e.currentTarget.style.borderColor = 'var(--accent)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!selectedVideoIds.has(video.id)) {
                          e.currentTarget.style.borderColor = 'var(--border-primary)';
                        }
                      }}
                    >
                      {selectedVideoIds.has(video.id) && (
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--accent)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 1,
                        }}>
                          <Check style={{ width: '16px', height: '16px', color: 'white' }} />
                        </div>
                      )}
                      <div style={{
                        position: 'relative',
                        aspectRatio: '16/9',
                        backgroundColor: 'var(--bg-hover)',
                      }}>
                        {video.thumbnailUrl ? (
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            color: 'var(--text-muted)',
                          }}>
                            <Film style={{ width: '48px', height: '48px' }} />
                          </div>
                        )}
                        <div style={{
                          position: 'absolute',
                          bottom: '8px',
                          right: '8px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--overlay-dark)',
                          color: 'white',
                          fontSize: '12px',
                        }}>
                          {formatDuration(video.duration)}
                        </div>
                      </div>
                      <div style={{ padding: '12px' }}>
                        <h3 style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          margin: '0 0 4px 0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {video.title}
                        </h3>
                        {video.shot && (
                          <p style={{
                            fontSize: '12px',
                            color: 'var(--text-tertiary)',
                            margin: '0 0 8px 0',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {video.shot.actionSummary}
                          </p>
                        )}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}>
                          <span style={{
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                          }}>
                            {formatDate(video.createdAt)}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: `${getStatusColor(video.status)}20`,
                            color: getStatusColor(video.status),
                          }}>
                            {getStatusText(video.status)}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '16px',
                margin: '0 0 16px 0',
              }}>已选择 ({selectedVideos.length})</h2>

              <Card style={{ padding: '16px', marginBottom: '16px' }}>
                {selectedVideos.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '32px 16px',
                    color: 'var(--text-tertiary)',
                    fontSize: '14px',
                  }}>
                    从左侧选择视频添加到此列表
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {selectedVideos.map((video, index) => (
                      <div
                        key={video.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--bg-hover)',
                          cursor: 'grab',
                          border: draggingIndex === index ? '2px dashed var(--accent)' : '1px solid transparent',
                        }}
                      >
                        <GripVertical style={{ width: '16px', height: '16px', color: 'var(--text-muted)', flexShrink: 0 }} />
                        <div style={{
                          width: '48px',
                          height: '27px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--bg-elevated)',
                          flexShrink: 0,
                          overflow: 'hidden',
                        }}>
                          {video.thumbnailUrl ? (
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: '100%',
                              color: 'var(--text-muted)',
                            }}>
                              <Film style={{ width: '16px', height: '16px' }} />
                            </div>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: '13px',
                            fontWeight: '500',
                            color: 'var(--text-primary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {video.title}
                          </div>
                          <div style={{
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                          }}>
                            {formatDuration(video.duration)}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFromSelection(video.id)}
                          style={{
                            padding: '6px',
                            borderRadius: '6px',
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                            e.currentTarget.style.color = 'var(--error)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--text-muted)';
                          }}
                        >
                          <X style={{ width: '16px', height: '16px' }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  onClick={handleStartMerge}
                  disabled={selectedVideos.length < 2 || merging || (mergeTask && (mergeTask.status === 'pending' || mergeTask.status === 'processing')) || false}
                  style={{ width: '100%', marginTop: '16px' }}
                >
                  {merging ? (
                    <>
                      <Loader2 style={{ width: '16px', height: '16px', marginRight: '8px', animation: 'spin 1s linear infinite' }} />
                      创建任务中...
                    </>
                  ) : mergeTask && (mergeTask.status === 'pending' || mergeTask.status === 'processing') ? (
                    <>
                      <Loader2 style={{ width: '16px', height: '16px', marginRight: '8px', animation: 'spin 1s linear infinite' }} />
                      处理中...
                    </>
                  ) : (
                    <>
                      <Film style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                      开始拼接
                    </>
                  )}
                </Button>
              </Card>

              {mergeTask && (
                <Card style={{ padding: '16px' }}>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '12px',
                    margin: '0 0 12px 0',
                  }}>合并任务</h3>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px',
                  }}>
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: getStatusColor(mergeTask.status),
                    }} />
                    <span style={{
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                    }}>
                      {getStatusText(mergeTask.status)}
                    </span>
                  </div>

                  {mergeTask.errorMessage && (
                    <div style={{
                      padding: '10px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--error-light)',
                      color: 'var(--error)',
                      fontSize: '12px',
                      marginBottom: '12px',
                    }}>
                      {mergeTask.errorMessage}
                    </div>
                  )}

                  {mergeTask.status === 'completed' && mergeTask.outputUrl && (
                    <Button
                      onClick={() => window.open(mergeTask!.outputUrl!, '_blank')}
                      style={{ width: '100%' }}
                    >
                      <Download style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                      下载合并视频
                    </Button>
                  )}

                  {mergeTask.status === 'failed' && (
                    <Button
                      onClick={handleStartMerge}
                      variant="outline"
                      style={{ width: '100%' }}
                    >
                      <RefreshCw style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                      重试
                    </Button>
                  )}
                </Card>
              )}
            </div>
          </div>
        </div>

        {showDeleteModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--overlay-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={handleCloseDeleteModal}
          >
            <Card style={{
              padding: '32px',
              maxWidth: '448px',
              width: '100%',
              margin: '24px',
            }}
            onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '12px',
                margin: '0 0 12px 0',
              }}>确认删除视频</h2>
              <p style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                marginBottom: '24px',
                lineHeight: '1.6',
              }}>
                您确定要删除此视频吗？此操作不可撤销。
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Button
                  variant="outline"
                  style={{ flex: 1 }}
                  onClick={handleCloseDeleteModal}
                >
                  取消
                </Button>
                <Button
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--error)',
                    borderColor: 'var(--error)',
                  }}
                  onClick={handleDeleteVideo}
                >
                  <Trash2 style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                  删除
                </Button>
              </div>
            </Card>
          </div>
        )}
    </div>
  );
}
