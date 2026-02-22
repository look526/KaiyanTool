import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { ModalModern } from '../components/ui/ModalModern';
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
  { value: 'zhipu', label: '智谱 AI', icon: Zap, color: '#6366f1' },
  { value: 'openai', label: 'OpenAI', icon: Sparkles, color: '#10b981' },
  { value: 'anthropic', label: 'Anthropic', icon: Globe, color: '#f59e0b' },
  { value: 'deepseek', label: 'DeepSeek', icon: Lock, color: '#ec4899' },
];

interface AIProviderModel {
  id: string;
  name: string;
  type: string;
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
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    type: 'zhipu',
    apiKey: '',
    baseUrl: '',
    enabled: true,
  });

  const [modelFormData, setModelFormData] = useState({
    name: '',
    type: 'text',
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
      setProviders(data);
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
      });

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
      });

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
        type: 'text',
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
        type: 'text',
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
      type: 'text',
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
      type: model.type,
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{
            marginBottom: '32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '800',
                color: 'var(--text-primary)',
                marginBottom: '8px',
                margin: '0 0 8px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}>
                <Zap style={{ width: '32px', height: '32px', color: 'var(--accent)' }} />
                AI 服务提供商
              </h1>
              <p style={{ fontSize: '16px', color: 'var(--text-tertiary)', margin: 0 }}>
                管理您的 AI 服务提供商和模型配置
              </p>
            </div>

            <Button
              size="lg"
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              style={{ height: '48px', padding: '0 32px' }}
            >
              <Plus style={{ width: '18px', height: '18px' }} />
              <span style={{ marginLeft: '10px' }}>添加提供商</span>
            </Button>
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
          ) : providers.length === 0 ? (
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
              >
                <Plus style={{ width: '18px', height: '18px' }} />
                <span style={{ marginLeft: '10px' }}>添加提供商</span>
              </Button>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {providers.map((provider) => {
                const providerInfo = getProviderInfo(provider.type);
                const isExpanded = expandedProviders.has(provider.id);
                const isApiKeyVisible = showApiKey.has(provider.id);

                return (
                  <Card key={provider.id} style={{
                    padding: '24px',
                    border: '1px solid var(--border-primary)',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.2s ease',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: isExpanded ? '20px' : '0',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                        <div style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '16px',
                          backgroundColor: `${providerInfo.color}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <providerInfo.icon style={{ width: '28px', height: '28px', color: providerInfo.color }} />
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <h3 style={{
                              fontSize: '18px',
                              fontWeight: '700',
                              color: 'var(--text-primary)',
                              margin: 0,
                            }}>
                              {providerInfo.label}
                            </h3>
                            {provider.enabled ? (
                              <span style={{
                                padding: '4px 12px',
                                backgroundColor: 'var(--success-bg)',
                                color: 'var(--success-text)',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: '600',
                              }}>
                                已启用
                              </span>
                            ) : (
                              <span style={{
                                padding: '4px 12px',
                                backgroundColor: 'var(--error-bg)',
                                color: 'var(--error-text)',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: '600',
                              }}>
                                已禁用
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: 'var(--text-tertiary)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Settings style={{ width: '14px', height: '14px' }} />
                              {provider.models.length} 个模型
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <RefreshCw style={{ width: '14px', height: '14px' }} />
                              {new Date(provider.updatedAt).toLocaleDateString('zh-CN')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleExpand(provider.id)}
                          style={{ height: '40px', padding: '0 16px' }}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronDown style={{ width: '16px', height: '16px' }} />
                              <span style={{ marginLeft: '8px' }}>收起</span>
                            </>
                          ) : (
                            <>
                              <ChevronRight style={{ width: '16px', height: '16px' }} />
                              <span style={{ marginLeft: '8px' }}>展开</span>
                            </>
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestProvider(provider.id)}
                          disabled={testingProvider === provider.id}
                          style={{ height: '40px', padding: '0 16px' }}
                        >
                          {testingProvider === provider.id ? (
                            <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                          ) : (
                            <TestTube style={{ width: '16px', height: '16px' }} />
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(provider)}
                          style={{ height: '40px', padding: '0 16px' }}
                        >
                          <Edit2 style={{ width: '16px', height: '16px' }} />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProvider(provider.id)}
                          style={{ height: '40px', padding: '0 16px' }}
                        >
                          <Trash2 style={{ width: '16px', height: '16px' }} />
                        </Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{
                        paddingTop: '20px',
                        borderTop: '1px solid var(--border-primary)',
                      }}>
                        <div style={{
                          marginBottom: '20px',
                          padding: '16px',
                          backgroundColor: 'var(--bg-surface)',
                          borderRadius: '12px',
                          border: '1px solid var(--border-primary)',
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '12px',
                          }}>
                            <span style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: 'var(--text-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}>
                              <Lock style={{ width: '16px', height: '16px' }} />
                              API 密钥
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleApiKeyVisibility(provider.id)}
                              style={{ height: '32px', padding: '0 12px' }}
                            >
                              {isApiKeyVisible ? (
                                <EyeOff style={{ width: '14px', height: '14px' }} />
                              ) : (
                                <Eye style={{ width: '14px', height: '14px' }} />
                              )}
                            </Button>
                          </div>
                          <div style={{
                            fontFamily: 'monospace',
                            fontSize: '13px',
                            color: 'var(--text-primary)',
                            wordBreak: 'break-all',
                            letterSpacing: '0.5px',
                          }}>
                            {isApiKeyVisible ? provider.apiKey : '•'.repeat(40)}
                          </div>
                        </div>

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '20px',
                        }}>
                          <h4 style={{
                            fontSize: '16px',
                            fontWeight: '700',
                            color: 'var(--text-primary)',
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}>
                            <Settings style={{ width: '20px', height: '20px' }} />
                            模型列表
                          </h4>

                          <Button
                            size="sm"
                            onClick={() => openAddModelModal(provider)}
                          >
                            <Plus style={{ width: '16px', height: '16px' }} />
                            <span style={{ marginLeft: '8px' }}>添加模型</span>
                          </Button>
                        </div>

                        {provider.models.length === 0 ? (
                          <div style={{
                            padding: '48px',
                            textAlign: 'center',
                            backgroundColor: 'var(--bg-surface)',
                            borderRadius: '12px',
                            border: '2px dashed var(--border-secondary)',
                          }}>
                            <Settings style={{ width: '48px', height: '48px', marginBottom: '16px', display: 'inline-block', color: 'var(--text-muted)' }} />
                            <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', margin: 0 }}>
                              暂无模型，点击上方按钮添加
                            </p>
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                            {provider.models.map((model) => {
                              const contentTypeInfo = getContentTypeInfo(model.type);
                              return (
                                <div key={model.id} style={{
                                  padding: '20px',
                                  backgroundColor: 'var(--bg-surface)',
                                  borderRadius: '12px',
                                  border: '1px solid var(--border-primary)',
                                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                                  transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'translateY(-4px)';
                                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.08)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                                }}
                                >
                                  <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '12px',
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                                      <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        backgroundColor: `${contentTypeInfo.color}20`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}>
                                        <contentTypeInfo.icon style={{ width: '20px', height: '20px', color: contentTypeInfo.color }} />
                                      </div>
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                          fontSize: '15px',
                                          fontWeight: '700',
                                          color: 'var(--text-primary)',
                                          marginBottom: '4px',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                        }}>
                                          {model.name}
                                        </div>
                                        <div style={{
                                          fontSize: '12px',
                                          color: 'var(--text-tertiary)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '6px',
                                        }}>
                                          <contentTypeInfo.icon style={{ width: '12px', height: '12px' }} />
                                          {contentTypeInfo.label}
                                        </div>
                                      </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '6px' }}>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEditModelModal(provider, model)}
                                        style={{ height: '32px', padding: '0 10px' }}
                                      >
                                        <Edit2 style={{ width: '14px', height: '14px' }} />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDeleteModel(provider.id, model.id)}
                                        style={{ height: '32px', padding: '0 10px' }}
                                      >
                                        <Trash2 style={{ width: '14px', height: '14px' }} />
                                      </Button>
                                    </div>
                                  </div>

                                  {model.description && (
                                    <p style={{
                                      fontSize: '13px',
                                      color: 'var(--text-tertiary)',
                                      marginBottom: '12px',
                                      margin: '0 0 12px 0',
                                      lineHeight: '1.6',
                                    }}>
                                      {model.description}
                                    </p>
                                  )}

                                  {model.capabilities.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                      {model.capabilities.map((cap, idx) => (
                                        <span key={idx} style={{
                                          padding: '4px 10px',
                                          backgroundColor: `${contentTypeInfo.color}15`,
                                          color: contentTypeInfo.color,
                                          borderRadius: '12px',
                                          fontSize: '11px',
                                          fontWeight: '600',
                                          textTransform: 'uppercase',
                                          letterSpacing: '0.5px',
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
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <ModalModern
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="添加 AI 服务提供商"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              marginBottom: '8px',
            }}>
              提供商类型
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {PROVIDER_TYPES.map((provider) => (
                <div
                  key={provider.value}
                  onClick={() => setFormData({ ...formData, type: provider.value })}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: `2px solid ${formData.type === provider.value ? provider.color : 'var(--border-primary)'}`,
                    backgroundColor: formData.type === provider.value ? `${provider.color}10` : 'var(--bg-surface)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                  onMouseEnter={(e) => {
                    if (formData.type !== provider.value) {
                      e.currentTarget.style.borderColor = provider.color;
                      e.currentTarget.style.backgroundColor = `${provider.color}05`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (formData.type !== provider.value) {
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                    }
                  }}
                >
                  <provider.icon style={{ width: '24px', height: '24px', color: provider.color }} />
                  <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {provider.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              marginBottom: '8px',
            }}>
              API 密钥
            </label>
            <Input
              type="password"
              placeholder="请输入 API 密钥"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text-tertiary)',
              marginBottom: '8px',
            }}>
              自定义 API 地址（可选）
            </label>
            <Input
              type="text"
              placeholder="https://api.example.com"
              value={formData.baseUrl}
              onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '12px',
            border: '1px solid var(--border-primary)',
          }}>
            <input
              type="checkbox"
              id="enabled"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="enabled" style={{
              fontSize: '14px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              margin: 0,
            }}>
              启用此提供商
            </label>
          </div>

          <div style={{
            padding: '16px',
            backgroundColor: 'var(--info-bg)',
            borderRadius: '12px',
            border: '1px solid var(--info-border)',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
          }}>
            <Info style={{ width: '20px', height: '20px', color: 'var(--info-text)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--info-text)',
                marginBottom: '4px',
              }}>
                提示
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', lineHeight: '1.6' }}>
                添加提供商后，您可以配置多个模型，每个模型可以支持不同的内容类型（文本、图像、视频等）。
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              style={{ height: '44px', padding: '0 24px' }}
            >
              取消
            </Button>
            <Button
              onClick={handleAddProvider}
              disabled={saving}
              style={{ height: '44px', padding: '0 32px' }}
            >
              {saving ? (
                <>
                  <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                  <span style={{ marginLeft: '8px' }}>保存中...</span>
                </>
              ) : (
                <>
                  <Save style={{ width: '16px', height: '16px' }} />
                  <span style={{ marginLeft: '8px' }}>保存</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </ModalModern>

      <ModalModern
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingProvider(null);
          resetForm();
        }}
        title="编辑 AI 服务提供商"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              marginBottom: '8px',
            }}>
              提供商类型
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {PROVIDER_TYPES.map((provider) => (
                <div
                  key={provider.value}
                  onClick={() => setFormData({ ...formData, type: provider.value })}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: `2px solid ${formData.type === provider.value ? provider.color : 'var(--border-primary)'}`,
                    backgroundColor: formData.type === provider.value ? `${provider.color}10` : 'var(--bg-surface)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                  onMouseEnter={(e) => {
                    if (formData.type !== provider.value) {
                      e.currentTarget.style.borderColor = provider.color;
                      e.currentTarget.style.backgroundColor = `${provider.color}05`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (formData.type !== provider.value) {
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                    }
                  }}
                >
                  <provider.icon style={{ width: '24px', height: '24px', color: provider.color }} />
                  <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {provider.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              marginBottom: '8px',
            }}>
              API 密钥
            </label>
            <Input
              type="password"
              placeholder="请输入 API 密钥"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text-tertiary)',
              marginBottom: '8px',
            }}>
              自定义 API 地址（可选）
            </label>
            <Input
              type="text"
              placeholder="https://api.example.com"
              value={formData.baseUrl}
              onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '12px',
            border: '1px solid var(--border-primary)',
          }}>
            <input
              type="checkbox"
              id="enabled-edit"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="enabled-edit" style={{
              fontSize: '14px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              margin: 0,
            }}>
              启用此提供商
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                setEditingProvider(null);
                resetForm();
              }}
              style={{ height: '44px', padding: '0 24px' }}
            >
              取消
            </Button>
            <Button
              onClick={handleUpdateProvider}
              disabled={saving}
              style={{ height: '44px', padding: '0 32px' }}
            >
              {saving ? (
                <>
                  <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                  <span style={{ marginLeft: '8px' }}>保存中...</span>
                </>
              ) : (
                <>
                  <Save style={{ width: '16px', height: '16px' }} />
                  <span style={{ marginLeft: '8px' }}>保存</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </ModalModern>

      <ModalModern
        isOpen={showModelModal}
        onClose={() => {
          setShowModelModal(false);
          setEditingModel(null);
          setModelFormData({
            name: '',
            type: 'text',
            description: '',
            capabilities: [],
          });
        }}
        title={editingModel ? '编辑模型' : '添加模型'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              marginBottom: '8px',
            }}>
              模型名称
            </label>
            <Input
              type="text"
              placeholder="例如：GLM-4.7"
              value={modelFormData.name}
              onChange={(e) => setModelFormData({ ...modelFormData, name: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              marginBottom: '8px',
            }}>
              内容类型
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {CONTENT_TYPES.map((type) => (
                <div
                  key={type.value}
                  onClick={() => setModelFormData({ ...modelFormData, type: type.value })}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: `2px solid ${modelFormData.type === type.value ? type.color : 'var(--border-primary)'}`,
                    backgroundColor: modelFormData.type === type.value ? `${type.color}10` : 'var(--bg-surface)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                  onMouseEnter={(e) => {
                    if (modelFormData.type !== type.value) {
                      e.currentTarget.style.borderColor = type.color;
                      e.currentTarget.style.backgroundColor = `${type.color}05`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (modelFormData.type !== type.value) {
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                    }
                  }}
                >
                  <type.icon style={{ width: '24px', height: '24px', color: type.color }} />
                  <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {type.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text-tertiary)',
              marginBottom: '8px',
            }}>
              描述（可选）
            </label>
            <textarea
              placeholder="描述此模型的用途和特点"
              value={modelFormData.description}
              onChange={(e) => setModelFormData({ ...modelFormData, description: e.target.value })}
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border-primary)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-primary)';
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text-tertiary)',
              marginBottom: '8px',
            }}>
              能力标签（可选）
            </label>
            <Input
              type="text"
              placeholder="例如：对话, 创作, 翻译（用逗号分隔）"
              value={modelFormData.capabilities.join(', ')}
              onChange={(e) => setModelFormData({
                ...modelFormData,
                capabilities: e.target.value.split(',').map(c => c.trim()).filter(c => c),
              })}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button
              variant="outline"
              onClick={() => {
                setShowModelModal(false);
                setEditingModel(null);
                setModelFormData({
                  name: '',
                  type: 'text',
                  description: '',
                  capabilities: [],
                });
              }}
              style={{ height: '44px', padding: '0 24px' }}
            >
              取消
            </Button>
            <Button
              onClick={editingModel ? handleEditModel : handleAddModel}
              disabled={saving}
              style={{ height: '44px', padding: '0 32px' }}
            >
              {saving ? (
                <>
                  <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                  <span style={{ marginLeft: '8px' }}>保存中...</span>
                </>
              ) : (
                <>
                  <Save style={{ width: '16px', height: '16px' }} />
                  <span style={{ marginLeft: '8px' }}>保存</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </ModalModern>
    </div>
  );
}
