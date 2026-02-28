import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { apiClient } from '../lib/api-client';
import {
  ArrowLeft,
  FileText,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  File,
  FolderOpen,
  Sparkles,
  Save,
  Eye,
  Info,
  CheckCircle,
  AlertCircle,
  Type,
  AlignLeft,
  Tag,
  Clock,
  Wand2,
  ChevronDown,
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  type: string;
  status: string;
}

const DOCUMENT_TYPES: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string; description: string }> = {
  general: { 
    icon: File, 
    color: '#64748b', 
    bgColor: 'rgba(100, 116, 139, 0.1)', 
    label: '通用文档',
    description: '适用于各类通用文档'
  },
  script: { 
    icon: FileCode, 
    color: '#8b5cf6', 
    bgColor: 'rgba(139, 92, 246, 0.1)', 
    label: '剧本',
    description: '电影、电视剧或短视频剧本'
  },
  novel: { 
    icon: FileText, 
    color: '#3b82f6', 
    bgColor: 'rgba(59, 130, 246, 0.1)', 
    label: '小说',
    description: '长篇或短篇小说创作'
  },
  outline: { 
    icon: FileText, 
    color: '#10b981', 
    bgColor: 'rgba(16, 185, 129, 0.1)', 
    label: '大纲',
    description: '故事大纲或剧情梗概'
  },
  storyline: { 
    icon: FileText, 
    color: '#f59e0b', 
    bgColor: 'rgba(245, 158, 11, 0.1)', 
    label: '故事线',
    description: '故事发展脉络梳理'
  },
  notes: { 
    icon: FileText, 
    color: '#ec4899', 
    bgColor: 'rgba(236, 72, 153, 0.1)', 
    label: '笔记',
    description: '创作灵感和想法记录'
  },
};

const STATUS_OPTIONS: Record<string, { color: string; bgColor: string; label: string }> = {
  draft: { color: '#64748b', bgColor: 'rgba(100, 116, 139, 0.1)', label: '草稿' },
  in_progress: { color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)', label: '进行中' },
  completed: { color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)', label: '已完成' },
  review: { color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)', label: '待审核' },
};

const DocumentCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    projectId: '',
    title: '',
    content: '',
    type: 'general',
    status: 'draft',
  });
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<Record<string, number>>({
    type: -1,
    status: -1,
    project: -1,
  });

  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const projectDropdownRef = useRef<HTMLDivElement>(null);

  const typeKeys = Object.keys(DOCUMENT_TYPES);
  const statusKeys = Object.keys(STATUS_OPTIONS);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getProjects();
      setProjects(response || []);
    } catch (err) {
      setError('Failed to load projects');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.projectId || !formData.title || !formData.content) {
      setError('请填写所有必填字段');
      setTouched({ projectId: true, title: true, content: true });
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const data = await apiClient.createDocumentV2({ 
        projectId: formData.projectId, 
        title: formData.title, 
        content: formData.content, 
        type: formData.type,
        status: formData.status
      });
      navigate(`/documents/${data.id}`);
    } catch (err) {
      setError('创建文档失败，请重试');
      console.error('Error creating document:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProject = useMemo(() => {
    return projects.find((p) => p.id === formData.projectId);
  }, [projects, formData.projectId]);

  const selectedType = DOCUMENT_TYPES[formData.type] || DOCUMENT_TYPES.general;
  const TypeIcon = selectedType.icon;
  const selectedStatus = STATUS_OPTIONS[formData.status] || STATUS_OPTIONS.draft;

  const handleDropdownKeyDown = (
    e: React.KeyboardEvent,
    dropdownType: 'type' | 'status' | 'project',
    items: string[],
    isOpen: boolean,
    setIsOpen: (open: boolean) => void
  ) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex({ ...focusedIndex, [dropdownType]: 0 });
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex({
          ...focusedIndex,
          [dropdownType]: Math.min(focusedIndex[dropdownType] + 1, items.length - 1),
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex({
          ...focusedIndex,
          [dropdownType]: Math.max(focusedIndex[dropdownType] - 1, 0),
        });
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex[dropdownType] >= 0) {
          const selectedKey = items[focusedIndex[dropdownType]];
          if (dropdownType === 'type') {
            setFormData({ ...formData, type: selectedKey });
          } else if (dropdownType === 'status') {
            setFormData({ ...formData, status: selectedKey });
          } else if (dropdownType === 'project') {
            setFormData({ ...formData, projectId: selectedKey });
          }
          setIsOpen(false);
          setFocusedIndex({ ...focusedIndex, [dropdownType]: -1 });
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setFocusedIndex({ ...focusedIndex, [dropdownType]: -1 });
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target as Node)) {
        setShowTypeDropdown(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setShowStatusDropdown(false);
      }
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(e.target as Node)) {
        setShowProjectDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const characterCount = formData.content.length;
  const wordCount = formData.content.trim() ? formData.content.trim().split(/\s+/).length : 0;

  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (touched.projectId && !formData.projectId) errors.projectId = '请选择项目';
    if (touched.title && !formData.title) errors.title = '请输入标题';
    if (touched.title && formData.title && formData.title.length < 2) errors.title = '标题至少需要2个字符';
    if (touched.content && !formData.content) errors.content = '请输入内容';
    if (touched.content && formData.content && formData.content.length < 10) errors.content = '内容至少需要10个字符';
    return errors;
  }, [touched, formData]);

  const isFormValid = formData.projectId && formData.title.length >= 2 && formData.content.length >= 10;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', padding: '32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <LoadingSpinner size="large" />
          </div>
        </div>
      </div>
    );
  }

  if (error && projects.length === 0) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', padding: '32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '400px',
            textAlign: 'center',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
            }}>
              <AlertCircle style={{ width: '40px', height: '40px', color: '#ef4444' }} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
              加载失败
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              {error}
            </p>
            <Button onClick={fetchProjects}>重试</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: 'var(--bg-base)' }}>
      <div style={{
          background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-base) 100%)',
          padding: '24px 32px',
          borderBottom: '1px solid var(--border-primary)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
                <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  创建新文档
                </h1>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  为您的项目添加新的创作内容
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
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
                  e.currentTarget.style.borderColor = 'var(--accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                }}
              >
                <Eye style={{ width: '16px', height: '16px' }} />
                预览
              </button>
              <button
                onClick={handleCreateDocument}
                disabled={submitting || !isFormValid}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  height: '44px',
                  padding: '0 24px',
                  background: isFormValid 
                    ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
                    : 'var(--bg-hover)',
                  border: 'none',
                  borderRadius: '12px',
                  color: isFormValid ? 'white' : 'var(--text-muted)',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: isFormValid ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  boxShadow: isFormValid ? '0 4px 12px rgba(139, 92, 246, 0.3)' : 'none',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="small" />
                    创建中...
                  </>
                ) : (
                  <>
                    <Save style={{ width: '16px', height: '16px' }} />
                    创建文档
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px' }}>
            <div>
              <Card style={{ padding: '32px', marginBottom: '24px' }}>
                <div style={{ marginBottom: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <FolderOpen style={{ width: '18px', height: '18px', color: 'var(--accent)' }} />
                    <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                      基本信息
                    </h2>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                    选择项目并设置文档的基本属性
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                  <div>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: 'var(--text-primary)',
                      marginBottom: '10px',
                    }}>
                      所属项目 <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <button
                        type="button"
                        onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                        style={{
                          width: '100%',
                          height: '48px',
                          padding: '0 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: 'var(--bg-surface)',
                          border: `1px solid ${validationErrors.projectId ? '#ef4444' : 'var(--border-primary)'}`,
                          borderRadius: '12px',
                          color: selectedProject ? 'var(--text-primary)' : 'var(--text-muted)',
                          fontSize: '14px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {selectedProject ? (
                            <>
                              <FolderOpen style={{ width: '16px', height: '16px', color: 'var(--accent)' }} />
                              {selectedProject.name}
                            </>
                          ) : (
                            '选择项目...'
                          )}
                        </span>
                        <ChevronDown style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                      </button>
                      {showProjectDropdown && (
                        <div style={{
                          position: 'absolute',
                          top: 'calc(100% + 4px)',
                          left: 0,
                          right: 0,
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-primary)',
                          borderRadius: '12px',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                          zIndex: 20,
                          maxHeight: '240px',
                          overflowY: 'auto',
                        }}>
                          {projects.map((project) => (
                            <button
                              key={project.id}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, projectId: project.id });
                                setShowProjectDropdown(false);
                                setTouched({ ...touched, projectId: true });
                              }}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                backgroundColor: formData.projectId === project.id ? 'var(--bg-hover)' : 'transparent',
                                border: 'none',
                                color: 'var(--text-primary)',
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                textAlign: 'left',
                              }}
                            >
                              <FolderOpen style={{ width: '16px', height: '16px', color: 'var(--accent)' }} />
                              <span style={{ flex: 1 }}>{project.name}</span>
                              <span style={{
                                padding: '2px 8px',
                                fontSize: '11px',
                                color: 'var(--text-secondary)',
                                backgroundColor: 'var(--bg-hover)',
                                borderRadius: '6px',
                              }}>
                                {project.type}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {validationErrors.projectId && (
                      <p style={{ fontSize: '12px', color: '#ef4444', margin: '6px 0 0' }}>
                        {validationErrors.projectId}
                      </p>
                    )}
                  </div>

                  <div>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: 'var(--text-primary)',
                      marginBottom: '10px',
                    }}>
                      文档标题 <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Type style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '16px',
                        height: '16px',
                        color: 'var(--text-muted)',
                      }} />
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        onBlur={(e) => {
                          setTouched({ ...touched, title: true });
                          e.currentTarget.style.borderColor = validationErrors.title ? '#ef4444' : 'var(--border-primary)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = validationErrors.title ? '#ef4444' : 'var(--accent)';
                          e.currentTarget.style.boxShadow = validationErrors.title 
                            ? '0 0 0 3px rgba(239, 68, 68, 0.1)' 
                            : '0 0 0 3px rgba(139, 92, 246, 0.1)';
                        }}
                        placeholder="输入文档标题..."
                        style={{
                          width: '100%',
                          height: '48px',
                          padding: '0 16px 0 42px',
                          backgroundColor: 'var(--bg-surface)',
                          border: `1px solid ${validationErrors.title ? '#ef4444' : 'var(--border-primary)'}`,
                          borderRadius: '12px',
                          color: 'var(--text-primary)',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                        }}
                      />
                    </div>
                    {validationErrors.title && (
                      <p style={{ fontSize: '12px', color: '#ef4444', margin: '6px 0 0' }}>
                        {validationErrors.title}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: 'var(--text-primary)',
                      marginBottom: '10px',
                    }}>
                      <Tag style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
                      文档类型
                    </label>
                    <div style={{ position: 'relative' }} ref={typeDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                        onKeyDown={(e) => handleDropdownKeyDown(e, 'type', typeKeys, showTypeDropdown, setShowTypeDropdown)}
                        aria-expanded={showTypeDropdown}
                        aria-haspopup="listbox"
                        style={{
                          width: '100%',
                          height: '48px',
                          padding: '0 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: selectedType.bgColor,
                          border: `1px solid ${selectedType.color}30`,
                          borderRadius: '12px',
                          color: selectedType.color,
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <TypeIcon style={{ width: '16px', height: '16px' }} />
                          {selectedType.label}
                        </span>
                        <ChevronDown style={{ width: '16px', height: '16px' }} />
                      </button>
                      {showTypeDropdown && (
                        <div 
                          role="listbox"
                          style={{
                          position: 'absolute',
                          top: 'calc(100% + 4px)',
                          left: 0,
                          right: 0,
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-primary)',
                          borderRadius: '12px',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                          zIndex: 20,
                          padding: '8px',
                        }}>
                        {Object.entries(DOCUMENT_TYPES).map(([key, config], index) => {
                          const ConfigIcon = config.icon;
                          const isFocused = focusedIndex.type === index;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, type: key });
                                setShowTypeDropdown(false);
                              }}
                              role="option"
                              aria-selected={formData.type === key}
                              style={{
                                width: '100%',
                                padding: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                backgroundColor: formData.type === key ? config.bgColor : isFocused ? 'var(--bg-hover)' : 'transparent',
                                border: 'none',
                                borderRadius: '10px',
                                color: formData.type === key ? config.color : 'var(--text-primary)',
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                textAlign: 'left',
                              }}
                            >
                              <ConfigIcon style={{ width: '18px', height: '18px' }} />
                              <div>
                                <div style={{ fontWeight: '500' }}>{config.label}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                  {config.description}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: 'var(--text-primary)',
                      marginBottom: '10px',
                    }}>
                      <Clock style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
                      初始状态
                    </label>
                    <div style={{ position: 'relative' }} ref={statusDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                        onKeyDown={(e) => handleDropdownKeyDown(e, 'status', statusKeys, showStatusDropdown, setShowStatusDropdown)}
                        aria-expanded={showStatusDropdown}
                        aria-haspopup="listbox"
                        style={{
                          width: '100%',
                          height: '48px',
                          padding: '0 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: selectedStatus.bgColor,
                          border: `1px solid ${selectedStatus.color}30`,
                          borderRadius: '12px',
                          color: selectedStatus.color,
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {selectedStatus.label}
                        </span>
                        <ChevronDown style={{ width: '16px', height: '16px' }} />
                      </button>
                      {showStatusDropdown && (
                        <div 
                          role="listbox"
                          style={{
                          position: 'absolute',
                          top: 'calc(100% + 4px)',
                          left: 0,
                          right: 0,
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-primary)',
                          borderRadius: '12px',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                          zIndex: 20,
                          padding: '8px',
                        }}>
                        {Object.entries(STATUS_OPTIONS).map(([key, config], index) => {
                          const isFocused = focusedIndex.status === index;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, status: key });
                                setShowStatusDropdown(false);
                              }}
                              role="option"
                              aria-selected={formData.status === key}
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                backgroundColor: formData.status === key ? config.bgColor : isFocused ? 'var(--bg-hover)' : 'transparent',
                                border: 'none',
                                borderRadius: '8px',
                                color: formData.status === key ? config.color : 'var(--text-primary)',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                textAlign: 'left',
                              }}
                            >
                              {config.label}
                            </button>
                          );
                        })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              <Card style={{ padding: '32px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <AlignLeft style={{ width: '18px', height: '18px', color: 'var(--accent)' }} />
                      <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                        文档内容
                      </h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {characterCount} 字符 · {wordCount} 词
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                    编写您的文档内容，支持富文本格式
                  </p>
                </div>

                <div style={{ position: 'relative' }}>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    onBlur={() => setTouched({ ...touched, content: true })}
                    placeholder="开始编写您的文档内容...

提示：
• 使用清晰的段落结构
• 可以添加标题、列表等格式
• 支持富文本编辑"
                    style={{
                      width: '100%',
                      minHeight: '400px',
                      padding: '20px',
                      backgroundColor: 'var(--bg-surface)',
                      border: `1px solid ${validationErrors.content ? '#ef4444' : 'var(--border-primary)'}`,
                      borderRadius: '12px',
                      color: 'var(--text-primary)',
                      fontSize: '15px',
                      lineHeight: '1.7',
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
                </div>
                {validationErrors.content && (
                  <p style={{ fontSize: '12px', color: '#ef4444', margin: '8px 0 0' }}>
                    {validationErrors.content}
                  </p>
                )}
              </Card>
            </div>

            <div>
              <Card style={{ padding: '24px', marginBottom: '20px', position: 'sticky', top: '120px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
                  文档预览
                </h3>
                
                <div style={{
                  padding: '20px',
                  backgroundColor: 'var(--bg-hover)',
                  borderRadius: '12px',
                  marginBottom: '20px',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px',
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: selectedType.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <TypeIcon style={{ width: '20px', height: '20px', color: selectedType.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {formData.title || '未命名文档'}
                      </h4>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: '500',
                        color: selectedStatus.color,
                        backgroundColor: selectedStatus.bgColor,
                        borderRadius: '6px',
                        marginTop: '4px',
                      }}>
                        {selectedStatus.label}
                      </span>
                    </div>
                  </div>
                  <p style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5',
                    margin: 0,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {formData.content || '文档内容将在这里显示...'}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>类型</span>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>
                      {selectedType.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>项目</span>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>
                      {selectedProject?.name || '未选择'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>字数</span>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>
                      {wordCount} 词
                    </span>
                  </div>
                </div>
              </Card>

              <Card style={{ padding: '24px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <Wand2 style={{ width: '16px', height: '16px', color: 'var(--accent)' }} />
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                    AI 助手
                  </h3>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: '1.5' }}>
                  使用 AI 助手帮助您生成内容大纲、润色文字或扩展创意
                </p>
                <button
                  type="button"
                  style={{
                    width: '100%',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    backgroundColor: 'var(--bg-hover)',
                    border: '1px dashed var(--border-primary)',
                    borderRadius: '12px',
                    color: 'var(--text-secondary)',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.color = 'var(--accent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <Sparkles style={{ width: '16px', height: '16px' }} />
                  AI 生成内容
                </button>
              </Card>

              <div style={{
                padding: '16px',
                backgroundColor: 'rgba(139, 92, 246, 0.05)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Info style={{ width: '14px', height: '14px', color: '#8b5cf6' }} />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#8b5cf6' }}>提示</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>
                  文档创建后可以随时编辑和修改。您可以先保存草稿，稍后再完善内容。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '14px 24px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          color: '#dc2626',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 100,
        }}>
          <AlertCircle style={{ width: '18px', height: '18px' }} />
          {error}
        </div>
      )}
    </div>
  );
};

export default DocumentCreatePage;
