import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Sidebar } from '../components/Sidebar';
import { apiClient } from '../lib/api-client';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Save,
  X,
  FileText,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  File,
  Calendar,
  Clock,
  MoreHorizontal,
  Sparkles,
  Share2,
  Copy,
  Download
} from 'lucide-react';

interface Document {
  id: string;
  projectId: string;
  title: string;
  content: string | null;
  type: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
  };
}

const DOCUMENT_TYPES: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  script: { icon: FileCode, color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)', label: '剧本' },
  novel: { icon: FileText, color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)', label: '小说' },
  outline: { icon: FileText, color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)', label: '大纲' },
  storyline: { icon: FileText, color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)', label: '故事线' },
  notes: { icon: FileText, color: '#ec4899', bgColor: 'rgba(236, 72, 159, 0.1)', label: '笔记' },
  general: { icon: File, color: '#64748b', bgColor: 'rgba(100, 116, 139, 0.1)', label: '文档' },
};

const STATUS_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  draft: { color: '#64748b', bgColor: 'rgba(100, 116, 139, 0.1)', label: '草稿' },
  in_progress: { color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)', label: '进行中' },
  completed: { color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)', label: '已完成' },
  review: { color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)', label: '待审核' },
};

const DocumentDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    content: '',
    type: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDocument();
    }
  }, [id]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!id) return;
      const data = await apiClient.getDocumentById(id);
      setDocument(data);
      setEditData({
        title: data.title,
        content: data.content || '',
        type: data.type,
      });
    } catch (err) {
      setError('加载文档失败');
      console.error('Error fetching document:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDocument = async () => {
    try {
      setSaving(true);
      if (!id) return;
      const data = await apiClient.updateDocumentById(id, editData);
      setDocument(data);
      setIsEditing(false);
    } catch (err) {
      setError('更新文档失败');
      console.error('Error updating document:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDocument = async () => {
    try {
      setSaving(true);
      if (!id) return;
      await apiClient.deleteDocumentById(id);
      navigate('/documents');
    } catch (err) {
      setError('删除文档失败');
      console.error('Error deleting document:', err);
    } finally {
      setSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  const getDocumentTypeConfig = (type: string) => {
    return DOCUMENT_TYPES[type] || DOCUMENT_TYPES.general;
  };

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex' }}>
        <Sidebar />
        <div style={{ flex: 1, padding: '32px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <EmptyState
              title="文档未找到"
              description={error || '您查找的文档不存在'}
              action={{ label: '返回文档列表', onClick: () => navigate('/documents') }}
            />
          </div>
        </div>
      </div>
    );
  }

  const typeConfig = getDocumentTypeConfig(document.type);
  const statusConfig = getStatusConfig(document.status || 'draft');
  const TypeIcon = typeConfig.icon;
  const characterCount = editData.content.length;
  const wordCount = editData.content.trim() ? editData.content.trim().split(/\s+/).length : 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{
          background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-base) 100%)',
          padding: '24px 32px',
          borderBottom: '1px solid var(--border-primary)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                  onClick={() => navigate('/documents')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    height: '40px',
                    padding: '0 16px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '10px',
                    color: 'var(--text-secondary)',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <ArrowLeft style={{ width: '16px', height: '16px' }} />
                  返回
                </button>
                <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-primary)' }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: typeConfig.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <TypeIcon style={{ width: '16px', height: '16px', color: typeConfig.color }} />
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.title}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        placeholder="文档标题"
                        style={{
                          fontSize: '20px',
                          fontWeight: '700',
                          color: 'var(--text-primary)',
                          backgroundColor: 'transparent',
                          border: 'none',
                          outline: 'none',
                          width: '100%',
                        }}
                      />
                    ) : (
                      <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                        {document.title}
                      </h1>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
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
                      gap: '4px',
                      padding: '3px 10px',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: statusConfig.color,
                      backgroundColor: statusConfig.bgColor,
                      borderRadius: '6px',
                    }}>
                      {statusConfig.label}
                    </span>
                    {document.project && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 10px',
                        fontSize: '11px',
                        fontWeight: '500',
                        color: 'var(--text-secondary)',
                        backgroundColor: 'var(--bg-hover)',
                        borderRadius: '6px',
                      }}>
                        {document.project.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        height: '44px',
                        padding: '0 20px',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: '12px',
                        color: 'var(--text-secondary)',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                      }}
                    >
                      <X style={{ width: '16px', height: '16px' }} />
                      取消
                    </button>
                    <button
                      onClick={handleUpdateDocument}
                      disabled={saving}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        height: '44px',
                        padding: '0 24px',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                        opacity: saving ? 0.7 : 1,
                      }}
                    >
                      {saving ? (
                        <>
                          <LoadingSpinner size="small" />
                          保存中...
                        </>
                      ) : (
                        <>
                          <Save style={{ width: '16px', height: '16px' }} />
                          保存
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        height: '44px',
                        padding: '0 20px',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
                      }}
                    >
                      <Edit3 style={{ width: '16px', height: '16px' }} />
                      编辑
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        height: '44px',
                        padding: '0 20px',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: '12px',
                        color: '#ef4444',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                        e.currentTarget.style.borderColor = '#ef4444';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                      }}
                    >
                      <Trash2 style={{ width: '16px', height: '16px' }} />
                      删除
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '32px', overflowY: 'auto' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px' }}>
            <div>
              <Card style={{ padding: '32px', marginBottom: '24px' }}>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <FileText style={{ width: '18px', height: '18px', color: 'var(--accent)' }} />
                    <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                      文档内容
                    </h2>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                    {isEditing ? '编辑您的文档内容' : '查看您的文档内容'}
                  </p>
                </div>

                {isEditing ? (
                  <textarea
                    value={editData.content}
                    onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                    placeholder="开始编写您的文档内容..."
                    style={{
                      width: '100%',
                      minHeight: '500px',
                      padding: '20px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '12px',
                      color: 'var(--text-primary)',
                      fontSize: '15px',
                      lineHeight: '1.8',
                      outline: 'none',
                      resize: 'vertical',
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                    }}
                  />
                ) : (
                  <div style={{
                    fontSize: '16px',
                    lineHeight: '1.8',
                    color: 'var(--text-primary)',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {document.content || '暂无内容'}
                  </div>
                )}
              </Card>
            </div>

            <div>
              <Card style={{ padding: '24px', marginBottom: '20px', position: 'sticky', top: '120px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <Sparkles style={{ width: '16px', height: '16px', color: 'var(--accent)' }} />
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                    文档信息
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    backgroundColor: 'var(--bg-hover)',
                    borderRadius: '10px',
                  }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>字符数</span>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {characterCount.toLocaleString()}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    backgroundColor: 'var(--bg-hover)',
                    borderRadius: '10px',
                  }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>词数</span>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {wordCount.toLocaleString()}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    backgroundColor: 'var(--bg-hover)',
                    borderRadius: '10px',
                  }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>类型</span>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: typeConfig.color }}>
                      {typeConfig.label}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    backgroundColor: 'var(--bg-hover)',
                    borderRadius: '10px',
                  }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>状态</span>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: statusConfig.color }}>
                      {statusConfig.label}
                    </span>
                  </div>

                  <div style={{ height: '1px', backgroundColor: 'var(--border-primary)', margin: '8px 0' }} />

                  <div>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      创建时间
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                        {new Date(document.createdAt).toLocaleString('zh-CN')}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      更新时间
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                        {new Date(document.updatedAt).toLocaleString('zh-CN')}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
                  快捷操作
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    style={{
                      width: '100%',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '0 16px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '10px',
                      color: 'var(--text-secondary)',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                  >
                    <Share2 style={{ width: '16px', height: '16px' }} />
                    分享
                  </button>
                  <button
                    style={{
                      width: '100%',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '0 16px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '10px',
                      color: 'var(--text-secondary)',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                  >
                    <Copy style={{ width: '16px', height: '16px' }} />
                    复制
                  </button>
                  <button
                    style={{
                      width: '100%',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '0 16px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '10px',
                      color: 'var(--text-secondary)',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                  >
                    <Download style={{ width: '16px', height: '16px' }} />
                    导出
                  </button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <Card style={{
            width: '100%',
            maxWidth: '440px',
            padding: '28px',
            margin: '20px',
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
              删除文档
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 24px 0', lineHeight: '1.6' }}>
              确定要删除这个文档吗？此操作不可撤销，文档内容将永久丢失。
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  height: '44px',
                  padding: '0 24px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '12px',
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                }}
              >
                取消
              </button>
              <button
                onClick={handleDeleteDocument}
                disabled={saving}
                style={{
                  height: '44px',
                  padding: '0 24px',
                  backgroundColor: '#ef4444',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? (
                  <>
                    <LoadingSpinner size="small" />
                    删除中...
                  </>
                ) : '确认删除'}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DocumentDetailPage;
