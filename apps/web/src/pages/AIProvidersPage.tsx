import { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Zap,
  Settings,
  TestTube,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronRight,
  FileText,
  Image,
  Video,
  Mic,
  Book,
  Network,
  List,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Info,
  Shield,
  Cpu,
  LayoutGrid,
  Square,
  CheckSquare,
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import Breadcrumb from '../components/Breadcrumb';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Modal } from '../components/ui/ModalModern';
import { Input } from '../components/ui/input';
import { apiClient } from '../lib/api';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../components/ui/Toast';

const CONTENT_TYPES = [
  { value: 'text', label: '文本生成', icon: FileText, color: '#6366f1' },
  { value: 'image', label: '图像生成', icon: Image, color: '#ec4899' },
  { value: 'video', label: '视频生成', icon: Video, color: '#10b981' },
  { value: 'audio', label: '音频生成', icon: Mic, color: '#f59e0b' },
  { value: 'script', label: '剧本创作', icon: Book, color: '#8b5cf6' },
  { value: 'novel', label: '小说创作', icon: Sparkles, color: '#06b6d4' },
  { value: 'storyline', label: '故事线', icon: Network, color: '#ef4444' },
  { value: 'outline', label: '大纲生成', icon: List, color: '#84cc16' },
];

const PROVIDER_TYPES = [
  { value: 'zhipu', label: '智谱 AI', icon: Zap, color: '#6366f1', description: '国产大语言模型领导者' },
  { value: 'openai', label: 'OpenAI', icon: Sparkles, color: '#10b981', description: '全球领先的AI研究实验室' },
  { value: 'anthropic', label: 'Anthropic', icon: Globe, color: '#f59e0b', description: '安全可靠的AI助手' },
  { value: 'deepseek', label: 'DeepSeek', icon: Lock, color: '#ec4899', description: '深度求索AI模型' },
];

interface AIProviderModel {
  id: string;
  name: string;
  types: string[];
  description?: string;
  capabilities: string[];
}

interface AIProvider {
  id: string;
  type: string;
  apiKey: string;
  baseUrl: string | null;
  enabled: boolean;
  models: AIProviderModel[];
  createdAt: string;
  updatedAt: string;
}

export default function AIProvidersPage() {
  const { theme } = useTheme();
  const { addToast } = useToast();
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;

  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null);
  const [editingModel, setEditingModel] = useState<AIProviderModel | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | null>(null);
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set());
  const [showApiKey, setShowApiKey] = useState<Set<string>>(new Set());
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testingModel, setTestingModel] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    type: 'zhipu',
    apiKey: '',
    baseUrl: '',
    enabled: true,
  });

  const [modelFormData, setModelFormData] = useState({
    name: '',
    types: [] as string[],
    description: '',
    capabilities: [] as string[],
  });

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAIProviders();
      setProviders(data.providers as any);
    } catch (error) {
      console.error('加载 AI 提供商失败:', error);
      addToast({
        type: 'error',
        title: '加载失败',
        message: '无法加载 AI 提供商列表',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProvider = async () => {
    if (!formData.type || !formData.apiKey) {
      addToast({
        type: 'error',
        title: '验证失败',
        message: '请填写必填字段',
      });
      return;
    }

    try {
      setSaving(true);
      await apiClient.createAIProvider({
        type: formData.type,
        apiKey: formData.apiKey,
        baseUrl: formData.baseUrl || undefined,
        enabled: formData.enabled,
      } as any);

      addToast({
        type: 'success',
        title: '添加成功',
        message: 'AI 提供商已成功添加',
      });

      setShowAddModal(false);
      resetForm();
      loadProviders();
    } catch (error: any) {
      console.error('添加 AI 提供商失败:', error);
      addToast({
        type: 'error',
        title: '添加失败',
        message: error.message || '无法添加 AI 提供商，请检查输入信息',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProvider = async () => {
    if (!editingProvider) return;

    try {
      setSaving(true);
      await apiClient.updateAIProvider(editingProvider.id, {
        type: formData.type,
        apiKey: formData.apiKey,
        baseUrl: formData.baseUrl || undefined,
        enabled: formData.enabled,
      } as any);

      addToast({
        type: 'success',
        title: '更新成功',
        message: 'AI 提供商已成功更新',
      });

      setShowEditModal(false);
      setEditingProvider(null);
      resetForm();
      loadProviders();
    } catch (error: any) {
      console.error('更新 AI 提供商失败:', error);
      addToast({
        type: 'error',
        title: '更新失败',
        message: error.message || '无法更新 AI 提供商',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProvider = async (id: string) => {
    if (!confirm('确定要删除此 AI 提供商吗？此操作不可恢复。')) return;

    try {
      await apiClient.deleteAIProvider(id);
      addToast({
        type: 'success',
        title: '删除成功',
        message: 'AI 提供商已成功删除',
      });
      loadProviders();
    } catch (error: any) {
      console.error('删除 AI 提供商失败:', error);
      addToast({
        type: 'error',
        title: '删除失败',
        message: error.message || '无法删除 AI 提供商',
      });
    }
  };

  const handleTestProvider = async (id: string) => {
    try {
      setTestingProvider(id);
      const result = await apiClient.testAIProvider(id);

      if (result.success) {
        addToast({
          type: 'success',
          title: '测试成功',
          message: '连接成功，AI 提供商可用',
        });
      } else {
        addToast({
          type: 'error',
          title: '测试失败',
          message: result.message || '连接失败',
        });
      }
    } catch (error: any) {
      console.error('测试 AI 提供商失败:', error);
      addToast({
        type: 'error',
        title: '测试失败',
        message: error.message || '无法连接到 AI 提供商',
      });
    } finally {
      setTestingProvider(null);
    }
  };

  const handleAddModel = async () => {
    if (!selectedProvider || !modelFormData.name) {
      addToast({
        type: 'error',
        title: '验证失败',
        message: '请填写模型名称',
      });
      return;
    }

    try {
      setSaving(true);
      await apiClient.createAIProviderModel(selectedProvider.id, modelFormData);

      addToast({
        type: 'success',
        title: '添加成功',
        message: '模型已成功添加',
      });

      setShowModelModal(false);
      setModelFormData({
        name: '',
        types: [],
        description: '',
        capabilities: [],
      });
      loadProviders();
    } catch (error: any) {
      console.error('添加模型失败:', error);
      addToast({
        type: 'error',
        title: '添加失败',
        message: error.message || '无法添加模型',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditModel = async () => {
    if (!editingModel || !selectedProvider) return;

    try {
      setSaving(true);
      await apiClient.updateAIProviderModel(selectedProvider.id, editingModel.id, modelFormData);

      addToast({
        type: 'success',
        title: '更新成功',
        message: '模型已成功更新',
      });

      setShowModelModal(false);
      setEditingModel(null);
      setModelFormData({
        name: '',
        types: [],
        description: '',
        capabilities: [],
      });
      loadProviders();
    } catch (error: any) {
      console.error('更新模型失败:', error);
      addToast({
        type: 'error',
        title: '更新失败',
        message: error.message || '无法更新模型',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteModel = async (providerId: string, modelId: string) => {
    if (!confirm('确定要删除此模型吗？')) return;
    try {
      await apiClient.deleteAIProviderModel(providerId, modelId);
      addToast({
        type: 'success',
        title: '删除成功',
        message: '模型已成功删除',
      });
      loadProviders();
    } catch (error: any) {
      console.error('删除模型失败:', error);
      addToast({
        type: 'error',
        title: '删除失败',
        message: error.message || '无法删除模型',
      });
    }
  };

  const handleTestModel = async (modelId: string) => {
    try {
      setTestingModel(modelId);
      const result = await apiClient.testAIProviderModel(modelId);
      if (result.success) {
        const responseText = result.testResult?.response || '无回复';
        const usageInfo = result.testResult?.usage 
          ? ` (使用: ${result.testResult.usage.totalTokens} tokens)` 
          : '';
        addToast({
          type: 'success',
          title: '测试成功',
          message: `模型 "${result.model.name}" 可正常使用。回复: "${responseText}"${usageInfo}`,
        });
      } else {
        addToast({
          type: 'error',
          title: '测试失败',
          message: result.message || '无法访问此模型',
        });
      }
    } catch (error: any) {
      console.error('测试模型失败:', error);
      addToast({
        type: 'error',
        title: '测试失败',
        message: error.message || '无法测试此模型',
      });
    } finally {
      setTestingModel(null);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'zhipu',
      apiKey: '',
      baseUrl: '',
      enabled: true,
    });
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedProviders);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedProviders(newExpanded);
  };

  const toggleApiKeyVisibility = (id: string) => {
    const newVisible = new Set(showApiKey);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setShowApiKey(newVisible);
  };

  const openEditModal = (provider: AIProvider) => {
    setEditingProvider(provider);
    setFormData({
      type: provider.type,
      apiKey: provider.apiKey,
      baseUrl: provider.baseUrl || '',
      enabled: provider.enabled,
    });
    setShowEditModal(true);
  };

  const openAddModelModal = (provider: AIProvider) => {
    setSelectedProvider(provider);
    setEditingModel(null);
    setModelFormData({
      name: '',
      types: [],
      description: '',
      capabilities: [],
    });
    setShowModelModal(true);
  };

  const openEditModelModal = (provider: AIProvider, model: AIProviderModel) => {
    setSelectedProvider(provider);
    setEditingModel(model);
    setModelFormData({
      name: model.name,
      types: model.types || [],
      description: model.description || '',
      capabilities: model.capabilities,
    });
    setShowModelModal(true);
  };

  const getProviderInfo = (type: string) => {
    return PROVIDER_TYPES.find((p) => p.value === type) || PROVIDER_TYPES[0];
  };

  const getContentTypeInfo = (type: string) => {
    return CONTENT_TYPES.find((c) => c.value === type) || CONTENT_TYPES[0];
  };

  const getFirstContentTypeInfo = (types: string[]) => {
    if (!types || types.length === 0) return CONTENT_TYPES[0];
    return CONTENT_TYPES.find((c) => c.value === types[0]) || CONTENT_TYPES[0];
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex' }}>
      <Sidebar />

      <main style={{ 
        flex: 1, 
        padding: isMobile ? '16px' : isTablet ? '24px' : '40px', 
        overflowY: 'auto',
        background: 'linear-gradient(135deg, var(--bg-base) 0%, var(--bg-secondary) 100%)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <Breadcrumb items={[
            { label: '首页', path: '/' },
            { label: '设置', path: '/settings' },
            { label: 'AI 服务提供商' },
          ]} />
          <div style={{
            marginBottom: isMobile ? '24px' : '48px',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'flex-start',
            gap: isMobile ? '20px' : 0,
          }}>
            <div style={{ flex: 1, width: isMobile ? '100%' : 'auto' }}>
              <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '12px' : '20px', marginBottom: '16px', flexDirection: isMobile ? 'column' : 'row' }}>
                <div style={{
                  width: isMobile ? '48px' : '64px',
                  height: isMobile ? '48px' : '64px',
                  borderRadius: isMobile ? '14px' : '20px',
                  background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(181, 147, 107, 0.3)',
                }}>
                  <Zap style={{ width: isMobile ? '24px' : '32px', height: isMobile ? '24px' : '32px', color: '#ffffff' }} />
                </div>
                <div>
                  <h1 style={{
                    fontSize: isMobile ? '24px' : '36px',
                    fontWeight: '800',
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                    margin: '0 0 8px 0',
                    letterSpacing: '-0.5px',
                  }}>
                    AI 服务提供商
                  </h1>
                  <p style={{ fontSize: isMobile ? '14px' : '15px', color: 'var(--text-tertiary)', margin: 0, lineHeight: '1.6' }}>
                    管理您的 AI 服务提供商和模型配置，轻松连接多个AI服务
                  </p>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                gap: isMobile ? '12px' : '24px',
                marginTop: '24px',
                padding: isMobile ? '16px' : '20px',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: '16px',
                border: '1px solid var(--border-primary)',
                flexDirection: isMobile ? 'column' : 'row',
                flexWrap: 'wrap',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--success-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Cpu style={{ width: '20px', height: '20px', color: 'var(--success)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1 }}>
                      {providers?.length || 0}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                      已配置提供商
                    </div>
                  </div>
                </div>
                <div style={{ width: isMobile ? '100%' : '1px', height: isMobile ? '1px' : 'auto', backgroundColor: 'var(--border-secondary)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--info-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <LayoutGrid style={{ width: '20px', height: '20px', color: 'var(--info)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1 }}>
                      {providers?.reduce((acc, p) => acc + (p.models?.length || 0), 0) || 0}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                      模型总数
                    </div>
                  </div>
                </div>
                <div style={{ width: isMobile ? '100%' : '1px', height: isMobile ? '1px' : 'auto', backgroundColor: 'var(--border-secondary)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--success-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <CheckCircle style={{ width: '20px', height: '20px', color: 'var(--success)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1 }}>
                      {providers?.filter(p => p.enabled).length || 0}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                      已启用服务
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px',
            }}>
              <Loader2 style={{ width: '48px', height: '48px', animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
            </div>
          ) : !providers || providers.length === 0 ? (
            <Card style={{
              padding: '64px',
              textAlign: 'center',
              border: '2px dashed var(--border-secondary)',
            }}>
              <Settings style={{ width: '80px', height: '80px', marginBottom: '24px', display: 'inline-block', color: 'var(--text-muted)' }} />
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '12px',
                margin: '0 0 12px 0',
              }}>
                暂无 AI 服务提供商
              </h2>
              <p style={{ fontSize: '16px', color: 'var(--text-tertiary)', marginBottom: '32px' }}>
                添加您的第一个 AI 服务提供商开始使用
              </p>
              <Button
                size="lg"
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
                style={{
                  background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
                  border: 'none',
                  padding: '16px 36px',
                  fontSize: '16px',
                  fontWeight: '700',
                  borderRadius: '16px',
                  boxShadow: '0 8px 24px rgba(181, 147, 107, 0.35)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(181, 147, 107, 0.45)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(181, 147, 107, 0.35)';
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%)',
                  pointerEvents: 'none',
                }} />
                <Plus style={{ width: '22px', height: '22px', strokeWidth: 2.5, position: 'relative', zIndex: 1 }} />
                <span style={{ marginLeft: '8px', position: 'relative', zIndex: 1 }}>添加提供商</span>
              </Button>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {providers.map((provider) => {
                const providerInfo = getProviderInfo(provider.type);
                const isExpanded = expandedProviders.has(provider.id);
                const isApiKeyVisible = showApiKey.has(provider.id);

                return (
                  <Card key={provider.id} style={{
                    padding: isMobile ? '20px' : '32px',
                    border: `1px solid ${isExpanded ? providerInfo.color : 'var(--border-primary)'}`,
                    boxShadow: isExpanded ? `0 8px 32px ${providerInfo.color}15` : '0 2px 16px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    if (!isExpanded) {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = `0 12px 40px ${providerInfo.color}20`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isExpanded) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 16px rgba(0, 0, 0, 0.04)';
                    }
                  }}>
                    {isExpanded && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: `linear-gradient(90deg, ${providerInfo.color} 0%, ${providerInfo.color}80 100%)`,
                      }} />
                    )}
                    
                    <div style={{
                      display: 'flex',
                      flexDirection: isMobile ? 'column' : 'row',
                      justifyContent: 'space-between',
                      alignItems: isMobile ? 'flex-start' : 'flex-start',
                      marginBottom: isExpanded ? '32px' : '0',
                      gap: isMobile ? '16px' : 0,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? '16px' : '24px', flex: 1, width: isMobile ? '100%' : 'auto' }}>
                        <div style={{
                          width: isMobile ? '56px' : '72px',
                          height: isMobile ? '56px' : '72px',
                          borderRadius: isMobile ? '16px' : '20px',
                          background: `linear-gradient(135deg, ${providerInfo.color} 0%, ${providerInfo.color}cc 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 8px 24px ${providerInfo.color}30`,
                          position: 'relative',
                          flexShrink: 0,
                        }}>
                          <providerInfo.icon style={{ width: isMobile ? '28px' : '36px', height: isMobile ? '28px' : '36px', color: '#ffffff' }} />
                          <div style={{
                            position: 'absolute',
                            bottom: '-4px',
                            right: '-4px',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: provider.enabled ? 'var(--success)' : 'var(--error)',
                            border: '3px solid var(--bg-surface)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            {provider.enabled ? (
                              <CheckCircle style={{ width: '14px', height: '14px', color: '#ffffff' }} />
                            ) : (
                              <XCircle style={{ width: '14px', height: '14px', color: '#ffffff' }} />
                            )}
                          </div>
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
                            <h3 style={{
                              fontSize: '22px',
                              fontWeight: '800',
                              color: 'var(--text-primary)',
                              margin: 0,
                              letterSpacing: '-0.3px',
                            }}>
                              {providerInfo.label}
                            </h3>
                            {provider.enabled ? (
                              <span style={{
                                padding: '6px 16px',
                                backgroundColor: 'var(--success-bg)',
                                color: 'var(--success)',
                                borderRadius: '24px',
                                fontSize: '13px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}>
                                <CheckCircle style={{ width: '14px', height: '14px' }} />
                                已启用
                              </span>
                            ) : (
                              <span style={{
                                padding: '6px 16px',
                                backgroundColor: 'var(--error-bg)',
                                color: 'var(--error)',
                                borderRadius: '24px',
                                fontSize: '13px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}>
                                <XCircle style={{ width: '14px', height: '14px' }} />
                                已禁用
                              </span>
                            )}
                          </div>

                          <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', margin: 0, marginBottom: '12px', lineHeight: '1.6' }}>
                            {providerInfo.description}
                          </p>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '14px', color: 'var(--text-tertiary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'var(--bg-surface)', borderRadius: '12px' }}>
                              <LayoutGrid style={{ width: '16px', height: '16px', color: providerInfo.color }} />
                              <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>
                                {provider.models?.length || 0} 个模型
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'var(--bg-surface)', borderRadius: '12px' }}>
                              <RefreshCw style={{ width: '16px', height: '16px', color: 'var(--text-tertiary)' }} />
                              <span>
                                {new Date(provider.updatedAt).toLocaleDateString('zh-CN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: isMobile ? 'flex-start' : 'flex-end' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleExpand(provider.id)}
                          style={{ 
                            height: '44px', 
                            padding: isMobile ? '0 12px' : '0 20px',
                            fontSize: '14px',
                            fontWeight: '600',
                            borderColor: isExpanded ? providerInfo.color : 'var(--border-primary)',
                            color: isExpanded ? providerInfo.color : 'var(--text-tertiary)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = providerInfo.color;
                            e.currentTarget.style.color = providerInfo.color;
                            e.currentTarget.style.backgroundColor = `${providerInfo.color}08`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = isExpanded ? providerInfo.color : 'var(--border-primary)';
                            e.currentTarget.style.color = isExpanded ? providerInfo.color : 'var(--text-tertiary)';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronDown style={{ width: '18px', height: '18px' }} />
                              <span style={{ marginLeft: '8px' }}>收起</span>
                            </>
                          ) : (
                            <>
                              <ChevronRight style={{ width: '18px', height: '18px' }} />
                              <span style={{ marginLeft: '8px' }}>展开</span>
                            </>
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestProvider(provider.id)}
                          disabled={testingProvider === provider.id}
                          style={{ height: '44px', padding: '0 16px', width: '44px' }}
                          aria-label="测试连接"
                        >
                          {testingProvider === provider.id ? (
                            <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                          ) : (
                            <TestTube style={{ width: '18px', height: '18px' }} />
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(provider)}
                          style={{ height: '44px', padding: '0 16px', width: '44px' }}
                          aria-label="编辑提供商"
                        >
                          <Edit2 style={{ width: '18px', height: '18px' }} />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProvider(provider.id)}
                          style={{ 
                            height: '44px', 
                            padding: '0 16px', 
                            width: '44px',
                            borderColor: 'var(--error)',
                            color: 'var(--error)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--error-bg)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          aria-label="删除提供商"
                        >
                          <Trash2 style={{ width: '18px', height: '18px' }} />
                        </Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{
                        paddingTop: '32px',
                        borderTop: '1px solid var(--border-primary)',
                        animation: 'slideDown 0.3s ease-out',
                      }}>
                        <style>{`
                          @keyframes slideDown {
                            from {
                              opacity: 0;
                              transform: translateY(-10px);
                            }
                            to {
                              opacity: 1;
                              transform: translateY(0);
                            }
                          }
                        `}</style>
                        
                        <div style={{
                          marginBottom: '28px',
                          padding: '24px',
                          backgroundColor: 'var(--bg-surface)',
                          borderRadius: '16px',
                          border: `1px solid ${providerInfo.color}30`,
                          position: 'relative',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            background: `linear-gradient(90deg, ${providerInfo.color} 0%, ${providerInfo.color}80 100%)`,
                          }} />
                          
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px',
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                            }}>
                              <div style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '12px',
                                backgroundColor: `${providerInfo.color}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                                <Shield style={{ width: '22px', height: '22px', color: providerInfo.color }} />
                              </div>
                              <span style={{
                                fontSize: '16px',
                                fontWeight: '700',
                                color: 'var(--text-primary)',
                              }}>
                                API 密钥
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleApiKeyVisibility(provider.id)}
                              style={{ 
                                height: '40px', 
                                padding: '0 16px',
                                borderColor: providerInfo.color,
                                color: providerInfo.color,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = `${providerInfo.color}10`;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              {isApiKeyVisible ? (
                                <>
                                  <EyeOff style={{ width: '18px', height: '18px' }} />
                                  <span style={{ marginLeft: '8px' }}>隐藏</span>
                                </>
                              ) : (
                                <>
                                  <Eye style={{ width: '18px', height: '18px' }} />
                                  <span style={{ marginLeft: '8px' }}>显示</span>
                                </>
                              )}
                            </Button>
                          </div>
                          <div style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '14px',
                            color: 'var(--text-primary)',
                            wordBreak: 'break-all',
                            letterSpacing: '0.5px',
                            padding: '16px',
                            backgroundColor: 'var(--bg-base)',
                            borderRadius: '12px',
                            border: '1px solid var(--border-primary)',
                            lineHeight: '1.6',
                          }}>
                            {isApiKeyVisible ? provider.apiKey : '•'.repeat(48)}
                          </div>
                        </div>

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '24px',
                        }}>
                          <h4 style={{
                            fontSize: '20px',
                            fontWeight: '800',
                            color: 'var(--text-primary)',
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                          }}>
                            <div style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '12px',
                              backgroundColor: `${providerInfo.color}15`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <LayoutGrid style={{ width: '22px', height: '22px', color: providerInfo.color }} />
                            </div>
                            模型列表
                            <span style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: 'var(--text-tertiary)',
                              marginLeft: '12px',
                            }}>
                              ({provider.models?.length || 0})
                            </span>
                          </h4>

                          <Button
                            onClick={() => openAddModelModal(provider)}
                            style={{
                              height: '44px',
                              padding: '0 24px',
                              background: `linear-gradient(135deg, ${providerInfo.color} 0%, ${providerInfo.color}cc 100%)`,
                              border: 'none',
                              boxShadow: `0 4px 12px ${providerInfo.color}30`,
                            }}
                          >
                            <Plus style={{ width: '18px', height: '18px', color: '#ffffff' }} />
                            <span style={{ marginLeft: '10px', fontWeight: '600', color: '#ffffff' }}>添加模型</span>
                          </Button>
                        </div>

                        {!provider.models || provider.models.length === 0 ? (
                          <div style={{
                            padding: '64px',
                            textAlign: 'center',
                            backgroundColor: 'var(--bg-surface)',
                            borderRadius: '16px',
                            border: '2px dashed var(--border-secondary)',
                            transition: 'all 0.3s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = providerInfo.color;
                            e.currentTarget.style.backgroundColor = `${providerInfo.color}05`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-secondary)';
                            e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                          }}>
                            <div style={{
                              width: '64px',
                              height: '64px',
                              borderRadius: '20px',
                              backgroundColor: `${providerInfo.color}15`,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: '20px',
                            }}>
                              <LayoutGrid style={{ width: '32px', height: '32px', color: providerInfo.color }} />
                            </div>
                            <h3 style={{
                              fontSize: '18px',
                              fontWeight: '700',
                              color: 'var(--text-primary)',
                              marginBottom: '12px',
                              margin: '0 0 12px 0',
                            }}>
                              暂无模型
                            </h3>
                            <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', margin: 0, lineHeight: '1.6' }}>
                              点击上方"添加模型"按钮开始配置您的第一个AI模型
                            </p>
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                            {provider.models.map((model) => {
                              const contentTypeInfo = getFirstContentTypeInfo(model.types);
                              return (
                                <div key={model.id} style={{
                                  padding: '24px',
                                  backgroundColor: 'var(--bg-surface)',
                                  borderRadius: '16px',
                                  border: `1px solid ${contentTypeInfo.color}30`,
                                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                  position: 'relative',
                                  overflow: 'hidden',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'translateY(-6px)';
                                  e.currentTarget.style.boxShadow = `0 12px 32px ${contentTypeInfo.color}20`;
                                  e.currentTarget.style.borderColor = contentTypeInfo.color;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.04)';
                                  e.currentTarget.style.borderColor = `${contentTypeInfo.color}30`;
                                }}>
                                  <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '3px',
                                    background: `linear-gradient(90deg, ${contentTypeInfo.color} 0%, ${contentTypeInfo.color}80 100%)`,
                                  }} />
                                  
                                  <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '16px',
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                                      <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '14px',
                                        background: `linear-gradient(135deg, ${contentTypeInfo.color} 0%, ${contentTypeInfo.color}cc 100%)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: `0 4px 12px ${contentTypeInfo.color}30`,
                                      }}>
                                        <contentTypeInfo.icon style={{ width: '24px', height: '24px', color: '#ffffff' }} />
                                      </div>
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                          fontSize: '17px',
                                          fontWeight: '800',
                                          color: 'var(--text-primary)',
                                          marginBottom: '8px',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                          letterSpacing: '-0.2px',
                                        }}>
                                          {model.name}
                                        </div>
                                        {model.types && model.types.length > 0 && (
                                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                                            {model.types.map((type, idx) => {
                                              const typeInfo = getContentTypeInfo(type);
                                              return (
                                                <div key={idx} style={{
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  gap: '4px',
                                                  padding: '4px 10px',
                                                  borderRadius: '12px',
                                                  backgroundColor: `${typeInfo.color}15`,
                                                  color: typeInfo.color,
                                                  fontSize: '11px',
                                                  fontWeight: '600',
                                                  textTransform: 'uppercase',
                                                  letterSpacing: '0.3px',
                                                }}>
                                                  <typeInfo.icon style={{ width: '12px', height: '12px' }} />
                                                  {typeInfo.label}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px' }}>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEditModelModal(provider, model)}
                                        style={{ 
                                          height: '36px', 
                                          padding: '0 12px',
                                          borderColor: contentTypeInfo.color,
                                          color: contentTypeInfo.color,
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.backgroundColor = `${contentTypeInfo.color}10`;
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                        aria-label={`编辑模型 ${model.name}`}
                                      >
                                        <Edit2 style={{ width: '16px', height: '16px' }} />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleTestModel(model.id)}
                                        disabled={testingModel === model.id}
                                        style={{ 
                                          height: '36px', 
                                          padding: '0 12px',
                                          borderColor: 'var(--success)',
                                          color: 'var(--success)',
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.backgroundColor = 'var(--success-bg)';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                        aria-label={`测试模型 ${model.name}`}
                                      >
                                        {testingModel === model.id ? (
                                          <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                                        ) : (
                                          <TestTube style={{ width: '16px', height: '16px' }} />
                                        )}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDeleteModel(provider.id, model.id)}
                                        style={{ 
                                          height: '36px', 
                                          padding: '0 12px',
                                          borderColor: 'var(--error)',
                                          color: 'var(--error)',
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.backgroundColor = 'var(--error-bg)';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                        aria-label={`删除模型 ${model.name}`}
                                      >
                                        <Trash2 style={{ width: '16px', height: '16px' }} />
                                      </Button>
                                    </div>
                                  </div>

                                  {model.description && (
                                    <p style={{
                                      fontSize: '14px',
                                      color: 'var(--text-secondary)',
                                      marginBottom: '16px',
                                      margin: '0 0 16px 0',
                                      lineHeight: '1.6',
                                    }}>
                                      {model.description}
                                    </p>
                                  )}

                                  {model.capabilities.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                      {model.capabilities.map((cap, idx) => (
                                        <span key={idx} style={{
                                          padding: '6px 14px',
                                          backgroundColor: `${contentTypeInfo.color}12`,
                                          color: contentTypeInfo.color,
                                          borderRadius: '16px',
                                          fontSize: '12px',
                                          fontWeight: '600',
                                          textTransform: 'uppercase',
                                          letterSpacing: '0.5px',
                                          transition: 'all 0.2s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.backgroundColor = `${contentTypeInfo.color}20`;
                                          e.currentTarget.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.backgroundColor = `${contentTypeInfo.color}12`;
                                          e.currentTarget.style.transform = 'translateY(0)';
                                        }}>
                                          {cap}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Modal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="添加 AI 服务提供商"
        size="large"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '15px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '16px',
            }}>
              选择提供商类型
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
              {PROVIDER_TYPES.map((provider) => {
                const isSelected = formData.type === provider.value;
                return (
                  <div
                    key={provider.value}
                    onClick={() => setFormData({ ...formData, type: provider.value })}
                    style={{
                      padding: isMobile ? '16px' : '24px',
                      borderRadius: '16px',
                      border: `2px solid ${isSelected ? provider.color : 'var(--border-primary)'}`,
                      backgroundColor: isSelected ? `${provider.color}08` : 'var(--bg-surface)',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: isMobile ? '12px' : '16px',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = provider.color;
                        e.currentTarget.style.backgroundColor = `${provider.color}05`;
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = `0 8px 24px ${provider.color}15`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                        e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    {isSelected && (
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: provider.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <CheckCircle style={{ width: '16px', height: '16px', color: '#ffffff' }} />
                      </div>
                    )}
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: `linear-gradient(135deg, ${provider.color} 0%, ${provider.color}cc 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 12px ${provider.color}30`,
                    }}>
                      <provider.icon style={{ width: '24px', height: '24px', color: '#ffffff' }} />
                    </div>
                    <div>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: 'var(--text-primary)',
                        marginBottom: '4px',
                      }}>
                        {provider.label}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: 'var(--text-tertiary)',
                        lineHeight: '1.5',
                      }}>
                        {provider.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '15px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '12px',
            }}>
              API 密钥
            </label>
            <Input
              type="password"
              placeholder="请输入您的 API 密钥"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              style={{ 
                width: '100%',
                fontSize: '14px',
                padding: '14px 16px',
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '15px',
              fontWeight: '700',
              color: 'var(--text-secondary)',
              marginBottom: '12px',
            }}>
              自定义 API 地址（可选）
            </label>
            <Input
              type="text"
              placeholder="https://api.example.com"
              value={formData.baseUrl}
              onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
              style={{ 
                width: '100%',
                fontSize: '14px',
                padding: '14px 16px',
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '20px',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '14px',
            border: '1px solid var(--border-primary)',
          }}>
            <input
              type="checkbox"
              id="enabled"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--accent)' }}
            />
            <label htmlFor="enabled" style={{
              fontSize: '15px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              margin: 0,
            }}>
              立即启用此提供商
            </label>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: 'var(--info-bg)',
            borderRadius: '14px',
            border: `1px solid var(--info-border)`,
            display: 'flex',
            gap: '16px',
            alignItems: 'flex-start',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: 'var(--info)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Info style={{ width: '22px', height: '22px', color: '#ffffff' }} />
            </div>
            <div>
              <div style={{
                fontSize: '15px',
                fontWeight: '700',
                color: 'var(--info-text)',
                marginBottom: '8px',
              }}>
                使用提示
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                添加提供商后，您可以配置多个模型，每个模型可以支持不同的内容类型（文本、图像、视频等）。
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '8px' }}>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              style={{ 
                height: '48px', 
                padding: '0 28px',
                fontSize: '15px',
                fontWeight: '600',
              }}
            >
              取消
            </Button>
            <Button
              onClick={handleAddProvider}
              disabled={saving}
              style={{ 
                height: '48px', 
                padding: '0 36px',
                fontSize: '15px',
                fontWeight: '600',
                background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
                boxShadow: '0 4px 16px rgba(181, 147, 107, 0.3)',
                border: 'none',
              }}
            >
              {saving ? (
                <>
                  <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                  <span style={{ marginLeft: '10px' }}>保存中...</span>
                </>
              ) : (
                <>
                  <Save style={{ width: '18px', height: '18px' }} />
                  <span style={{ marginLeft: '10px' }}>保存配置</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingProvider(null);
          resetForm();
        }}
        title="编辑 AI 服务提供商"
        size="large"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '15px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '16px',
            }}>
              选择提供商类型
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
              {PROVIDER_TYPES.map((provider) => {
                const isSelected = formData.type === provider.value;
                return (
                  <div
                    key={provider.value}
                    onClick={() => setFormData({ ...formData, type: provider.value })}
                    style={{
                      padding: isMobile ? '16px' : '24px',
                      borderRadius: '16px',
                      border: `2px solid ${isSelected ? provider.color : 'var(--border-primary)'}`,
                      backgroundColor: isSelected ? `${provider.color}08` : 'var(--bg-surface)',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: isMobile ? '12px' : '16px',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = provider.color;
                        e.currentTarget.style.backgroundColor = `${provider.color}05`;
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = `0 8px 24px ${provider.color}15`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                        e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    {isSelected && (
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: provider.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <CheckCircle style={{ width: '16px', height: '16px', color: '#ffffff' }} />
                      </div>
                    )}
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: `linear-gradient(135deg, ${provider.color} 0%, ${provider.color}cc 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 12px ${provider.color}30`,
                    }}>
                      <provider.icon style={{ width: '24px', height: '24px', color: '#ffffff' }} />
                    </div>
                    <div>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: 'var(--text-primary)',
                        marginBottom: '4px',
                      }}>
                        {provider.label}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: 'var(--text-tertiary)',
                        lineHeight: '1.5',
                      }}>
                        {provider.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '15px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '12px',
            }}>
              API 密钥
            </label>
            <Input
              type="password"
              placeholder="请输入您的 API 密钥"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              style={{ 
                width: '100%',
                fontSize: '14px',
                padding: '14px 16px',
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '15px',
              fontWeight: '700',
              color: 'var(--text-secondary)',
              marginBottom: '12px',
            }}>
              自定义 API 地址（可选）
            </label>
            <Input
              type="text"
              placeholder="https://api.example.com"
              value={formData.baseUrl}
              onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
              style={{ 
                width: '100%',
                fontSize: '14px',
                padding: '14px 16px',
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '20px',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '14px',
            border: '1px solid var(--border-primary)',
          }}>
            <input
              type="checkbox"
              id="enabled-edit"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--accent)' }}
            />
            <label htmlFor="enabled-edit" style={{
              fontSize: '15px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              margin: 0,
            }}>
              立即启用此提供商
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '8px', flexDirection: isMobile ? 'column' : 'row' }}>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                setEditingProvider(null);
                resetForm();
              }}
              style={{ 
                height: '48px', 
                padding: '0 28px',
                fontSize: '15px',
                fontWeight: '600',
                width: isMobile ? '100%' : 'auto',
              }}
            >
              取消
            </Button>
            <Button
              onClick={handleUpdateProvider}
              disabled={saving}
              style={{ 
                height: '48px', 
                padding: '0 36px',
                fontSize: '15px',
                fontWeight: '600',
                background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
                boxShadow: '0 4px 16px rgba(181, 147, 107, 0.3)',
                border: 'none',
                width: isMobile ? '100%' : 'auto',
              }}
            >
              {saving ? (
                <>
                  <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                  <span style={{ marginLeft: '10px' }}>保存中...</span>
                </>
              ) : (
                <>
                  <Save style={{ width: '18px', height: '18px' }} />
                  <span style={{ marginLeft: '10px' }}>保存配置</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={showModelModal}
        onClose={() => {
          setShowModelModal(false);
          setEditingModel(null);
          setModelFormData({
            name: '',
            types: [],
            description: '',
            capabilities: [],
          });
        }}
        title={editingModel ? '编辑模型配置' : '添加新模型'}
        size="large"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '15px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '12px',
            }}>
              模型名称
            </label>
            <Input
              type="text"
              placeholder="例如：GLM-4.7、GPT-4"
              value={modelFormData.name}
              onChange={(e) => setModelFormData({ ...modelFormData, name: e.target.value })}
              style={{ 
                width: '100%',
                fontSize: '14px',
                padding: '14px 16px',
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '15px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '16px',
            }}>
              选择内容类型（可多选）
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              {CONTENT_TYPES.map((type) => {
                const isSelected = modelFormData.types.includes(type.value);
                return (
                  <div
                    key={type.value}
                    onClick={() => {
                      const newTypes = isSelected
                        ? modelFormData.types.filter(t => t !== type.value)
                        : [...modelFormData.types, type.value];
                      setModelFormData({ ...modelFormData, types: newTypes });
                    }}
                    style={{
                      padding: '20px',
                      borderRadius: '14px',
                      border: `2px solid ${isSelected ? type.color : 'var(--border-primary)'}`,
                      backgroundColor: isSelected ? `${type.color}08` : 'var(--bg-surface)',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = type.color;
                        e.currentTarget.style.backgroundColor = `${type.color}05`;
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = `0 8px 24px ${type.color}15`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                        e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      flexShrink: 0,
                    }}>
                      {isSelected ? (
                        <CheckSquare style={{ width: '24px', height: '24px', color: type.color }} />
                      ) : (
                        <Square style={{ width: '24px', height: '24px', color: 'var(--text-tertiary)' }} />
                      )}
                    </div>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: `linear-gradient(135deg, ${type.color} 0%, ${type.color}cc 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 12px ${type.color}30`,
                    }}>
                      <type.icon style={{ width: '20px', height: '20px', color: '#ffffff' }} />
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {type.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '15px',
              fontWeight: '700',
              color: 'var(--text-secondary)',
              marginBottom: '12px',
            }}>
              模型描述（可选）
            </label>
            <textarea
              placeholder="简要描述此模型的用途、特点和适用场景"
              value={modelFormData.description}
              onChange={(e) => setModelFormData({ ...modelFormData, description: e.target.value })}
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid var(--border-primary)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                lineHeight: '1.6',
                fontFamily: 'var(--font-sans)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(181, 147, 107, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-primary)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '15px',
              fontWeight: '700',
              color: 'var(--text-secondary)',
              marginBottom: '12px',
            }}>
              能力标签（可选）
            </label>
            <Input
              type="text"
              placeholder="例如：对话, 创作, 翻译, 代码（用逗号分隔）"
              value={modelFormData.capabilities.join(', ')}
              onChange={(e) => setModelFormData({
                ...modelFormData,
                capabilities: e.target.value.split(',').map(c => c.trim()).filter(c => c),
              })}
              style={{ 
                width: '100%',
                fontSize: '14px',
                padding: '14px 16px',
              }}
            />
            <p style={{
              fontSize: '13px',
              color: 'var(--text-tertiary)',
              marginTop: '8px',
              margin: '8px 0 0 0',
              lineHeight: '1.5',
            }}>
              这些标签将帮助用户更好地了解模型的能力
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '8px' }}>
            <Button
              variant="outline"
              onClick={() => {
                setShowModelModal(false);
                setEditingModel(null);
                setModelFormData({
                  name: '',
                  types: [],
                  description: '',
                  capabilities: [],
                });
              }}
              style={{ 
                height: '48px', 
                padding: '0 28px',
                fontSize: '15px',
                fontWeight: '600',
              }}
            >
              取消
            </Button>
            <Button
              onClick={editingModel ? handleEditModel : handleAddModel}
              disabled={saving}
              style={{ 
                height: '48px', 
                padding: '0 36px',
                fontSize: '15px',
                fontWeight: '600',
                background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
                boxShadow: '0 4px 16px rgba(181, 147, 107, 0.3)',
                border: 'none',
              }}
            >
              {saving ? (
                <>
                  <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                  <span style={{ marginLeft: '10px' }}>保存中...</span>
                </>
              ) : (
                <>
                  <Save style={{ width: '18px', height: '18px' }} />
                  <span style={{ marginLeft: '10px' }}>保存模型</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
