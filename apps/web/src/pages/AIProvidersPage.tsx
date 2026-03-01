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
  Shield,
  Cpu,
  LayoutGrid,
  Square,
  CheckSquare,
  Key,
  Server,
} from 'lucide-react';
import { Button } from '../components/ui/button-new';
import { apiClient } from '../lib/api';
import { useToast } from '../components/ui/Toast';

const CONTENT_TYPES = [
  { value: 'text', label: '文本生成', icon: FileText, color: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' },
  { value: 'image', label: '图像生成', icon: Image, color: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' },
  { value: 'video', label: '视频生成', icon: Video, color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
  { value: 'audio', label: '音频生成', icon: Mic, color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
  { value: 'script', label: '剧本创作', icon: Book, color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },
  { value: 'novel', label: '小说创作', icon: Sparkles, color: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' },
  { value: 'storyline', label: '故事线', icon: Network, color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
  { value: 'outline', label: '大纲生成', icon: List, color: '#84cc16', gradient: 'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)' },
];

const PROVIDER_TYPES = [
  { value: 'zhipu', label: '智谱 AI', icon: Zap, color: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', description: '国产大语言模型领导者' },
  { value: 'openai', label: 'OpenAI', icon: Sparkles, color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', description: '全球领先的AI研究实验室' },
  { value: 'anthropic', label: 'Anthropic', icon: Globe, color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', description: '安全可靠的AI助手' },
  { value: 'deepseek', label: 'DeepSeek', icon: Lock, color: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', description: '深度求索AI模型' },
  { value: 'seedream', label: '豆包 Seedream', icon: Image, color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', description: '字节跳动 Seedream 图像生成' },
];

const PREDEFINED_MODELS = [
  { value: 'glm-4', label: 'GLM-4', provider: 'zhipu', description: '智谱GLM-4 旗舰模型', types: ['text', 'script', 'novel', 'storyline', 'outline'] },
  { value: 'glm-4-plus', label: 'GLM-4 Plus', provider: 'zhipu', description: '智谱GLM-4 增强版', types: ['text', 'script', 'novel', 'storyline', 'outline'] },
  { value: 'glm-4-air', label: 'GLM-4 Air', provider: 'zhipu', description: '智谱GLM-4 轻量版', types: ['text', 'script', 'novel', 'storyline', 'outline'] },
  { value: 'glm-3-turbo', label: 'GLM-3 Turbo', provider: 'zhipu', description: '智谱GLM-3 高速版', types: ['text', 'script', 'novel', 'storyline', 'outline'] },
  { value: 'glm-4-flash', label: 'GLM-4 Flash', provider: 'zhipu', description: '智谱GLM-4 极速版', types: ['text', 'script', 'novel', 'storyline', 'outline'] },
  { value: 'glm-4v', label: 'GLM-4V', provider: 'zhipu', description: '智谱GLM-4 视觉模型', types: ['text', 'image'] },
  { value: 'glm-4v-plus', label: 'GLM-4V Plus', provider: 'zhipu', description: '智谱GLM-4V 增强版', types: ['text', 'image'] },
  { value: 'cogview-3', label: 'CogView-3', provider: 'zhipu', description: '智谱图像生成模型', types: ['image'] },
  { value: 'cogview-3-plus', label: 'CogView-3 Plus', provider: 'zhipu', description: '智谱图像生成增强版', types: ['image'] },
  { value: 'gpt-4', label: 'GPT-4', provider: 'openai', description: 'OpenAI GPT-4 旗舰模型', types: ['text', 'script', 'novel', 'storyline', 'outline'] },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', provider: 'openai', description: 'OpenAI GPT-4 高速版', types: ['text', 'script', 'novel', 'storyline', 'outline'] },
  { value: 'gpt-4o', label: 'GPT-4o', provider: 'openai', description: 'OpenAI GPT-4o 旗舰模型', types: ['text', 'image', 'script', 'novel', 'storyline', 'outline'] },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini', provider: 'openai', description: 'OpenAI GPT-4o 轻量版', types: ['text', 'script', 'novel', 'storyline', 'outline'] },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', provider: 'openai', description: 'OpenAI GPT-3.5 Turbo', types: ['text', 'script', 'novel', 'storyline', 'outline'] },
  { value: 'dall-e-3', label: 'DALL-E 3', provider: 'openai', description: 'OpenAI 图像生成模型', types: ['image'] },
  { value: 'dall-e-2', label: 'DALL-E 2', provider: 'openai', description: 'OpenAI 图像生成模型', types: ['image'] },
  { value: 'gemini-pro', label: 'Gemini Pro', provider: 'google', description: 'Google Gemini Pro', types: ['text', 'script', 'novel', 'storyline', 'outline'] },
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', provider: 'google', description: 'Google Gemini 1.5 Pro', types: ['text', 'image', 'script', 'novel', 'storyline', 'outline'] },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', provider: 'google', description: 'Google Gemini 1.5 快速版', types: ['text', 'script', 'novel', 'storyline', 'outline'] },
  { value: 'imagen-3', label: 'Imagen 3', provider: 'google', description: 'Google 图像生成模型', types: ['image'] },
  { value: 'imagen-3-fast', label: 'Imagen 3 Fast', provider: 'google', description: 'Google 图像生成快速版', types: ['image'] },
  { value: 'claude-3-opus', label: 'Claude 3 Opus', provider: 'anthropic', description: 'Anthropic Claude 3 旗舰版', types: ['text', 'script', 'novel', 'storyline', 'outline'] },
  { value: 'claude-3.5-sonnet', label: 'Claude 3.5 Sonnet', provider: 'anthropic', description: 'Anthropic Claude 3.5 高性能版', types: ['text', 'script', 'novel', 'storyline', 'outline'] },
  { value: 'claude-3-haiku', label: 'Claude 3 Haiku', provider: 'anthropic', description: 'Anthropic Claude 3 轻量版', types: ['text', 'script', 'novel', 'storyline', 'outline'] },
  { value: 'claude-sonnet-4', label: 'Claude Sonnet 4', provider: 'anthropic', description: 'Anthropic Claude 最新版', types: ['text', 'script', 'novel', 'storyline', 'outline'] },
  { value: 'deepseek-chat', label: 'DeepSeek Chat', provider: 'deepseek', description: 'DeepSeek 对话模型', types: ['text', 'script', 'novel', 'storyline', 'outline'] },
  { value: 'deepseek-coder', label: 'DeepSeek Coder', provider: 'deepseek', description: 'DeepSeek 编程模型', types: ['text', 'script'] },
  { value: 'doubao-seedream-5-0', label: 'Seedream 5.0', provider: 'seedream', description: '字节跳动 Seedream 5.0', types: ['image'] },
  { value: 'kling-1.0', label: 'Kling 1.0', provider: 'kling', description: '快手可灵视频生成', types: ['video'] },
  { value: 'kling-1.5', label: 'Kling 1.5', provider: 'kling', description: '快手可灵视频生成增强版', types: ['video'] },
  { value: 'custom', label: '自定义', provider: 'all', description: '手动输入模型名称', types: [] },
];

interface AIProviderModel {
  id: string;
  name: string;
  types: string[];
  description?: string;
  capabilities: string[];
  isAssistantDefault?: boolean;
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
  const [testingModel, setTestingModel] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: 'zhipu',
    apiKey: '',
    baseUrl: '',
    enabled: true,
  });

  const [modelFormData, setModelFormData] = useState({
    name: '',
    customName: '',
    types: [] as string[],
    description: '',
    capabilities: [] as string[],
  });
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAIProviders();
      setProviders(data.providers as any);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error || error?.message || '无法加载 AI 提供商列表';
      addToast({ type: 'error', title: '加载失败', message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProvider = async () => {
    if (!formData.type || !formData.apiKey) {
      addToast({ type: 'error', title: '验证失败', message: '请填写必填字段' });
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
      addToast({ type: 'success', title: '添加成功', message: 'AI 提供商已成功添加' });
      setShowAddModal(false);
      resetForm();
      loadProviders();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error || error?.message || '无法添加 AI 提供商';
      addToast({ type: 'error', title: '添加失败', message: errorMsg });
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
      addToast({ type: 'success', title: '更新成功', message: 'AI 提供商已成功更新' });
      setShowEditModal(false);
      setEditingProvider(null);
      resetForm();
      loadProviders();
    } catch (error: any) {
      addToast({ type: 'error', title: '更新失败', message: error.message || '无法更新 AI 提供商' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProvider = async (id: string) => {
    if (!confirm('确定要删除此 AI 提供商吗？此操作不可恢复。')) return;
    try {
      await apiClient.deleteAIProvider(id);
      addToast({ type: 'success', title: '删除成功', message: 'AI 提供商已成功删除' });
      loadProviders();
    } catch (error: any) {
      addToast({ type: 'error', title: '删除失败', message: error.message || '无法删除 AI 提供商' });
    }
  };

  const handleTestProvider = async (id: string) => {
    try {
      setTestingProvider(id);
      const result = await apiClient.testAIProvider(id);
      if (result.success) {
        addToast({ type: 'success', title: '测试成功', message: '连接成功，AI 提供商可用' });
      } else {
        addToast({ type: 'error', title: '测试失败', message: result.message || '连接失败' });
      }
    } catch (error: any) {
      addToast({ type: 'error', title: '测试失败', message: error.message || '无法连接到 AI 提供商' });
    } finally {
      setTestingProvider(null);
    }
  };

  const handleAddModel = async () => {
    if (!selectedProvider || !modelFormData.name) {
      addToast({ type: 'error', title: '验证失败', message: '请填写模型名称' });
      return;
    }
    if (modelFormData.name === 'custom' && !modelFormData.customName) {
      addToast({ type: 'error', title: '验证失败', message: '请输入自定义模型名称' });
      return;
    }
    if (modelFormData.name === 'custom' && modelFormData.types.length === 0) {
      addToast({ type: 'error', title: '验证失败', message: '请选择至少一个内容类型' });
      return;
    }
    try {
      setSaving(true);
      let finalName = modelFormData.name;
      let finalTypes = modelFormData.types;

      if (modelFormData.name === 'custom') {
        finalName = modelFormData.customName;
      } else {
        const predefinedModel = PREDEFINED_MODELS.find(m => m.value === modelFormData.name);
        if (predefinedModel && predefinedModel.types.length > 0) {
          finalTypes = predefinedModel.types;
        }
      }

      const submitData = {
        name: finalName,
        types: finalTypes,
        description: modelFormData.description,
        capabilities: modelFormData.capabilities,
      };
      await apiClient.createAIProviderModel(selectedProvider.id, submitData);
      addToast({ type: 'success', title: '添加成功', message: '模型已成功添加' });
      setShowModelModal(false);
      setModelFormData({ name: '', customName: '', types: [], description: '', capabilities: [] });
      loadProviders();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error || error?.message || '无法添加模型';
      addToast({ type: 'error', title: '添加失败', message: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  const handleEditModel = async () => {
    if (!editingModel || !selectedProvider) return;
    try {
      setSaving(true);
      let finalTypes = modelFormData.types;

      const predefinedModel = PREDEFINED_MODELS.find(m => m.value === editingModel.name);
      if (predefinedModel && predefinedModel.types.length > 0) {
        finalTypes = predefinedModel.types;
      }

      const submitData = {
        name: modelFormData.name || editingModel.name,
        types: finalTypes,
        description: modelFormData.description,
        capabilities: modelFormData.capabilities,
      };
      await apiClient.updateAIProviderModel(selectedProvider.id, editingModel.id, submitData);
      addToast({ type: 'success', title: '更新成功', message: '模型已成功更新' });
      setShowModelModal(false);
      setEditingModel(null);
      setModelFormData({ name: '', customName: '', types: [], description: '', capabilities: [] });
      loadProviders();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error || error?.message || '无法更新模型';
      addToast({ type: 'error', title: '更新失败', message: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteModel = async (providerId: string, modelId: string) => {
    if (!confirm('确定要删除此模型吗？')) return;
    try {
      await apiClient.deleteAIProviderModel(providerId, modelId);
      addToast({ type: 'success', title: '删除成功', message: '模型已成功删除' });
      loadProviders();
    } catch (error: any) {
      addToast({ type: 'error', title: '删除失败', message: error.message || '无法删除模型' });
    }
  };

  const handleSetAssistantDefault = async (modelId: string) => {};

  const handleUnsetAssistantDefault = async (modelId: string) => {};

  const handleTestModel = async (modelId: string) => {
    try {
      setTestingModel(modelId);
      const result = await apiClient.testAIProviderModel(modelId);
      if (result.success) {
        addToast({ type: 'success', title: '测试成功', message: `模型 "${result.model?.name}" 可正常使用` });
      } else {
        addToast({ type: 'error', title: '测试失败', message: result.message || '无法访问此模型' });
      }
    } catch (error: any) {
      addToast({ type: 'error', title: '测试失败', message: error.message || '无法测试此模型' });
    } finally {
      setTestingModel(null);
    }
  };

  const resetForm = () => {
    setFormData({ type: 'zhipu', apiKey: '', baseUrl: '', enabled: true });
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedProviders);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedProviders(newExpanded);
  };

  const toggleApiKeyVisibility = (id: string) => {
    const newVisible = new Set(showApiKey);
    if (newVisible.has(id)) newVisible.delete(id);
    else newVisible.add(id);
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
    setModelFormData({ name: '', customName: '', types: [], description: '', capabilities: [] });
    setShowModelModal(true);
  };

  const openEditModelModal = (provider: AIProvider, model: AIProviderModel) => {
    setSelectedProvider(provider);
    setEditingModel(model);
    setModelFormData({
      name: model.name,
      customName: '',
      types: model.types || [],
      description: model.description || '',
      capabilities: model.capabilities,
    });
    setShowModelModal(true);
  };

  const getProviderInfo = (type: string) => PROVIDER_TYPES.find((p) => p.value === type) || PROVIDER_TYPES[0];
  const getContentTypeInfo = (type: string) => CONTENT_TYPES.find((c) => c.value === type) || CONTENT_TYPES[0];
  const getFirstContentTypeInfo = (types: string[]) => {
    if (!types || types.length === 0) return CONTENT_TYPES[0];
    return CONTENT_TYPES.find((c) => c.value === types[0]) || CONTENT_TYPES[0];
  };

  const stats = {
    total: providers.length,
    models: providers.reduce((acc, p) => acc + (p.models?.length || 0), 0),
    enabled: providers.filter(p => p.enabled).length,
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)' }}>
        <Loader2 style={{ width: '48px', height: '48px', animation: 'spin 1s linear infinite', color: '#6366f1' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <div style={{
        background: 'var(--bg-header)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-primary)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                padding: '12px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
              }}>
                <Cpu style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>AI 服务提供商</h1>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>管理您的 AI 服务提供商和模型配置</p>
              </div>
            </div>

            <Button
              onClick={() => { resetForm(); setShowAddModal(true); }}
              style={{
                height: '44px',
                padding: '0 20px',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Plus style={{ width: '18px', height: '18px' }} />
              添加提供商
            </Button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Server style={{ width: '20px', height: '20px', color: '#6366f1' }} />
              </div>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>提供商</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-primary)' }}>{stats.total}</div>
          </div>

          <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LayoutGrid style={{ width: '20px', height: '20px', color: '#8b5cf6' }} />
              </div>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>模型总数</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#8b5cf6' }}>{stats.models}</div>
          </div>

          <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle style={{ width: '20px', height: '20px', color: '#10b981' }} />
              </div>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>已启用</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>{stats.enabled}</div>
          </div>
        </div>

        {providers.length === 0 ? (
          <div style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '64px 32px', border: '1px solid var(--border-primary)', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Cpu style={{ width: '36px', height: '36px', color: 'var(--text-muted)' }} />
            </div>
            <p style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '8px' }}>暂无 AI 服务提供商</p>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>添加您的第一个 AI 服务提供商开始使用</p>
            <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
              <Plus style={{ width: '16px', height: '16px', marginRight: '6px' }} />
              添加提供商
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {providers.map((provider) => {
              const providerInfo = getProviderInfo(provider.type);
              const isExpanded = expandedProviders.has(provider.id);
              const isApiKeyVisible = showApiKey.has(provider.id);
              const isHovered = hoveredCard === provider.id;

              return (
                <div
                  key={provider.id}
                  style={{
                    background: 'var(--bg-card)',
                    borderRadius: '20px',
                    border: `1px solid ${isExpanded ? providerInfo.color : 'var(--border-primary)'}`,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    boxShadow: isHovered && !isExpanded ? '0 8px 30px rgba(0,0,0,0.12)' : 'none',
                  }}
                  onMouseEnter={() => setHoveredCard(provider.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flex: 1 }}>
                        <div style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '18px',
                          background: providerInfo.gradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 8px 24px ${providerInfo.color}30`,
                          position: 'relative',
                          flexShrink: 0,
                        }}>
                          <providerInfo.icon style={{ width: '32px', height: '32px', color: 'white' }} />
                          <div style={{
                            position: 'absolute',
                            bottom: '-4px',
                            right: '-4px',
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            background: provider.enabled ? '#10b981' : '#ef4444',
                            border: '3px solid var(--bg-card)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            {provider.enabled ? <CheckCircle style={{ width: '12px', height: '12px', color: 'white' }} /> : <XCircle style={{ width: '12px', height: '12px', color: 'white' }} />}
                          </div>
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>{providerInfo.label}</h3>
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '600',
                              background: provider.enabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: provider.enabled ? '#10b981' : '#ef4444',
                            }}>
                              {provider.enabled ? '已启用' : '已禁用'}
                            </span>
                          </div>
                          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>{providerInfo.description}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                              <LayoutGrid style={{ width: '14px', height: '14px' }} />
                              {provider.models?.length || 0} 个模型
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                              <RefreshCw style={{ width: '14px', height: '14px' }} />
                              {new Date(provider.updatedAt).toLocaleDateString('zh-CN')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => toggleExpand(provider.id)}
                          style={{
                            height: '40px',
                            padding: '0 16px',
                            borderRadius: '10px',
                            border: `1px solid ${isExpanded ? providerInfo.color : 'var(--border-primary)'}`,
                            background: isExpanded ? `${providerInfo.color}15` : 'transparent',
                            color: isExpanded ? providerInfo.color : 'var(--text-secondary)',
                            fontSize: '13px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {isExpanded ? <ChevronDown style={{ width: '16px', height: '16px' }} /> : <ChevronRight style={{ width: '16px', height: '16px' }} />}
                          {isExpanded ? '收起' : '展开'}
                        </button>
                        <button
                          onClick={() => handleTestProvider(provider.id)}
                          disabled={testingProvider === provider.id}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            border: '1px solid var(--border-primary)',
                            background: 'transparent',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {testingProvider === provider.id ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <TestTube style={{ width: '16px', height: '16px' }} />}
                        </button>
                        <button
                          onClick={() => openEditModal(provider)}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            border: '1px solid var(--border-primary)',
                            background: 'transparent',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <Edit2 style={{ width: '16px', height: '16px' }} />
                        </button>
                        <button
                          onClick={() => handleDeleteProvider(provider.id)}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <Trash2 style={{ width: '16px', height: '16px' }} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ borderTop: '1px solid var(--border-primary)', padding: '24px', background: 'var(--bg-hover)' }}>
                      <div style={{ marginBottom: '24px', padding: '20px', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Key style={{ width: '18px', height: '18px', color: providerInfo.color }} />
                            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>API 密钥</span>
                          </div>
                          <button
                            onClick={() => toggleApiKeyVisibility(provider.id)}
                            style={{
                              height: '32px',
                              padding: '0 12px',
                              borderRadius: '8px',
                              border: `1px solid ${providerInfo.color}`,
                              background: 'transparent',
                              color: providerInfo.color,
                              fontSize: '12px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            {isApiKeyVisible ? <EyeOff style={{ width: '14px', height: '14px' }} /> : <Eye style={{ width: '14px', height: '14px' }} />}
                            {isApiKeyVisible ? '隐藏' : '显示'}
                          </button>
                        </div>
                        <div style={{
                          fontFamily: 'monospace',
                          fontSize: '13px',
                          color: 'var(--text-secondary)',
                          padding: '12px 16px',
                          background: 'var(--bg-page)',
                          borderRadius: '8px',
                          wordBreak: 'break-all',
                        }}>
                          {isApiKeyVisible ? provider.apiKey : '•'.repeat(40)}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <LayoutGrid style={{ width: '18px', height: '18px', color: providerInfo.color }} />
                          模型列表
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '400' }}>({provider.models?.length || 0})</span>
                        </h4>
                        <button
                          onClick={() => openAddModelModal(provider)}
                          style={{
                            height: '38px',
                            padding: '0 16px',
                            borderRadius: '10px',
                            border: 'none',
                            background: providerInfo.gradient,
                            color: 'white',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: `0 4px 12px ${providerInfo.color}30`,
                          }}
                        >
                          <Plus style={{ width: '16px', height: '16px' }} />
                          添加模型
                        </button>
                      </div>

                      {!provider.models || provider.models.length === 0 ? (
                        <div style={{ padding: '48px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '14px', border: '1px dashed var(--border-primary)' }}>
                          <LayoutGrid style={{ width: '32px', height: '32px', color: 'var(--text-muted)', marginBottom: '12px' }} />
                          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>暂无模型，点击上方按钮添加</p>
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
                          {provider.models.map((model) => {
                            const contentTypeInfo = getFirstContentTypeInfo(model.types);
                            return (
                              <div
                                key={model.id}
                                style={{
                                  padding: '20px',
                                  background: 'var(--bg-card)',
                                  borderRadius: '16px',
                                  border: '1px solid var(--border-primary)',
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                                    <div style={{
                                      width: '48px',
                                      height: '48px',
                                      borderRadius: '14px',
                                      background: contentTypeInfo.gradient,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      boxShadow: `0 4px 12px ${contentTypeInfo.color}25`,
                                    }}>
                                      <contentTypeInfo.icon style={{ width: '24px', height: '24px', color: 'white' }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>{model.name}</div>
                                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {model.types?.slice(0, 3).map((type, idx) => {
                                          const typeInfo = getContentTypeInfo(type);
                                          return (
                                            <span key={idx} style={{
                                              padding: '3px 8px',
                                              borderRadius: '6px',
                                              fontSize: '11px',
                                              fontWeight: '600',
                                              background: `${typeInfo.color}15`,
                                              color: typeInfo.color,
                                            }}>
                                              {typeInfo.label}
                                            </span>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <button
                                      onClick={() => openEditModelModal(provider, model)}
                                      style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border-primary)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                      <Edit2 style={{ width: '14px', height: '14px' }} />
                                    </button>
                                    <button
                                      onClick={() => handleTestModel(model.id)}
                                      disabled={testingModel === model.id}
                                      style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                      {testingModel === model.id ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <TestTube style={{ width: '14px', height: '14px' }} />}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteModel(provider.id, model.id)}
                                      style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                      <Trash2 style={{ width: '14px', height: '14px' }} />
                                    </button>
                                  </div>
                                </div>

                                {model.description && (
                                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 12px 0', lineHeight: '1.5' }}>{model.description}</p>
                                )}

                                {model.capabilities?.length > 0 && (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {model.capabilities.map((cap, idx) => (
                                      <span key={idx} style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '500', background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
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

      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }} onClick={() => setShowAddModal(false)}>
          <div style={{ background: 'var(--bg-card)', borderRadius: '24px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflow: 'auto', border: '1px solid var(--border-primary)', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', borderBottom: '1px solid var(--border-primary)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>添加 AI 服务提供商</h2>
              <button onClick={() => setShowAddModal(false)} style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid var(--border-primary)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '10px' }}>选择提供商类型</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {PROVIDER_TYPES.map((provider) => {
                    const isSelected = formData.type === provider.value;
                    return (
                      <div
                        key={provider.value}
                        onClick={() => setFormData({ ...formData, type: provider.value })}
                        style={{
                          padding: '16px',
                          borderRadius: '14px',
                          border: `2px solid ${isSelected ? provider.color : 'var(--border-primary)'}`,
                          background: isSelected ? `${provider.color}10` : 'var(--bg-hover)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: provider.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <provider.icon style={{ width: '20px', height: '20px', color: 'white' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{provider.label}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{provider.description}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>API 密钥</label>
                <input
                  type="password"
                  placeholder="请输入您的 API 密钥"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  style={{ width: '100%', height: '44px', padding: '0 14px', borderRadius: '10px', border: '1px solid var(--border-primary)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>自定义 API 地址（可选）</label>
                <input
                  type="text"
                  placeholder="https://api.example.com"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                  style={{ width: '100%', height: '44px', padding: '0 14px', borderRadius: '10px', border: '1px solid var(--border-primary)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--bg-hover)', borderRadius: '12px' }}>
                <input type="checkbox" id="enabled" checked={formData.enabled} onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#6366f1' }} />
                <label htmlFor="enabled" style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', cursor: 'pointer', margin: 0 }}>立即启用此提供商</label>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setShowAddModal(false)} style={{ flex: 1, height: '48px', fontSize: '14px', fontWeight: '500', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)', borderRadius: '12px', cursor: 'pointer' }}>取消</button>
                <button onClick={handleAddProvider} disabled={saving} style={{ flex: 1, height: '48px', fontSize: '14px', fontWeight: '600', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)' }}>
                  {saving ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: '16px', height: '16px' }} />}
                  {saving ? '保存中...' : '保存配置'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }} onClick={() => setShowEditModal(false)}>
          <div style={{ background: 'var(--bg-card)', borderRadius: '24px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflow: 'auto', border: '1px solid var(--border-primary)', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', borderBottom: '1px solid var(--border-primary)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>编辑 AI 服务提供商</h2>
              <button onClick={() => setShowEditModal(false)} style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid var(--border-primary)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '10px' }}>选择提供商类型</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {PROVIDER_TYPES.map((provider) => {
                    const isSelected = formData.type === provider.value;
                    return (
                      <div
                        key={provider.value}
                        onClick={() => setFormData({ ...formData, type: provider.value })}
                        style={{
                          padding: '16px',
                          borderRadius: '14px',
                          border: `2px solid ${isSelected ? provider.color : 'var(--border-primary)'}`,
                          background: isSelected ? `${provider.color}10` : 'var(--bg-hover)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: provider.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <provider.icon style={{ width: '20px', height: '20px', color: 'white' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{provider.label}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{provider.description}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>API 密钥</label>
                <input
                  type="password"
                  placeholder="请输入您的 API 密钥"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  style={{ width: '100%', height: '44px', padding: '0 14px', borderRadius: '10px', border: '1px solid var(--border-primary)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>自定义 API 地址（可选）</label>
                <input
                  type="text"
                  placeholder="https://api.example.com"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                  style={{ width: '100%', height: '44px', padding: '0 14px', borderRadius: '10px', border: '1px solid var(--border-primary)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--bg-hover)', borderRadius: '12px' }}>
                <input type="checkbox" id="enabled-edit" checked={formData.enabled} onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#6366f1' }} />
                <label htmlFor="enabled-edit" style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', cursor: 'pointer', margin: 0 }}>立即启用此提供商</label>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setShowEditModal(false)} style={{ flex: 1, height: '48px', fontSize: '14px', fontWeight: '500', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)', borderRadius: '12px', cursor: 'pointer' }}>取消</button>
                <button onClick={handleUpdateProvider} disabled={saving} style={{ flex: 1, height: '48px', fontSize: '14px', fontWeight: '600', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)' }}>
                  {saving ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: '16px', height: '16px' }} />}
                  {saving ? '保存中...' : '保存配置'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModelModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }} onClick={() => setShowModelModal(false)}>
          <div style={{ background: 'var(--bg-card)', borderRadius: '24px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto', border: '1px solid var(--border-primary)', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', borderBottom: '1px solid var(--border-primary)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>{editingModel ? '编辑模型配置' : '添加新模型'}</h2>
              <button onClick={() => setShowModelModal(false)} style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid var(--border-primary)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>模型名称</label>
                {!showCustomInput ? (
                  <div style={{ position: 'relative' }}>
                    <select
                      value={modelFormData.name}
                      onChange={(e) => {
                        const selectedModel: any = PREDEFINED_MODELS.find(m => m.value === e.target.value);
                        if (selectedModel?.value === 'custom') {
                          setShowCustomInput(true);
                          setModelFormData({ ...modelFormData, name: 'custom', customName: '', types: [] });
                        } else {
                          setShowCustomInput(false);
                          setModelFormData({ ...modelFormData, name: selectedModel?.value || e.target.value, customName: '', types: [] });
                        }
                      }}
                      style={{ width: '100%', height: '44px', padding: '0 36px 0 14px', borderRadius: '10px', border: '1px solid var(--border-primary)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box', cursor: 'pointer', appearance: 'none' }}
                    >
                      <option value="">选择预定义模型</option>
                      {PREDEFINED_MODELS.map((model) => (
                        <option key={model.value} value={model.value}>
                          {model.label} - {model.description}
                        </option>
                      ))}
                    </select>
                    <ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="输入自定义模型名称"
                      value={modelFormData.customName}
                      onChange={(e) => setModelFormData({ ...modelFormData, customName: e.target.value })}
                      style={{ flex: 1, height: '44px', padding: '0 14px', borderRadius: '10px', border: '1px solid var(--border-primary)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    />
                    <button
                      onClick={() => setShowCustomInput(false)}
                      style={{
                        height: '44px',
                        padding: '0 16px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-primary)',
                        background: 'var(--bg-hover)',
                        color: 'var(--text-secondary)',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                      }}
                    >
                      返回选择
                    </button>
                  </div>
                )}
              </div>

              {modelFormData.name === 'custom' && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '10px' }}>选择内容类型（必选）</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {CONTENT_TYPES.map((type) => {
                    const isSelected = modelFormData.types.includes(type.value);
                    return (
                      <div
                        key={type.value}
                        onClick={() => {
                          const newTypes = isSelected ? modelFormData.types.filter(t => t !== type.value) : [...modelFormData.types, type.value];
                          setModelFormData({ ...modelFormData, types: newTypes });
                        }}
                        style={{
                          padding: '12px',
                          borderRadius: '12px',
                          border: `2px solid ${isSelected ? type.color : 'var(--border-primary)'}`,
                          background: isSelected ? `${type.color}10` : 'var(--bg-hover)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {isSelected ? <CheckSquare style={{ width: '18px', height: '18px', color: type.color }} /> : <Square style={{ width: '18px', height: '18px', color: 'var(--text-muted)' }} />}
                        <type.icon style={{ width: '16px', height: '16px', color: isSelected ? type.color : 'var(--text-muted)' }} />
                        <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{type.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>模型描述（可选）</label>
                <textarea
                  placeholder="简要描述此模型的用途、特点和适用场景"
                  value={modelFormData.description}
                  onChange={(e) => setModelFormData({ ...modelFormData, description: e.target.value })}
                  style={{ width: '100%', minHeight: '100px', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-primary)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '14px', resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>能力标签（可选）</label>
                <input
                  type="text"
                  placeholder="例如：对话, 创作, 翻译, 代码（用逗号分隔）"
                  value={modelFormData.capabilities.join(', ')}
                  onChange={(e) => setModelFormData({ ...modelFormData, capabilities: e.target.value.split(',').map(c => c.trim()).filter(c => c) })}
                  style={{ width: '100%', height: '44px', padding: '0 14px', borderRadius: '10px', border: '1px solid var(--border-primary)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setShowModelModal(false)} style={{ flex: 1, height: '48px', fontSize: '14px', fontWeight: '500', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)', borderRadius: '12px', cursor: 'pointer' }}>取消</button>
                <button onClick={editingModel ? handleEditModel : handleAddModel} disabled={saving} style={{ flex: 1, height: '48px', fontSize: '14px', fontWeight: '600', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)' }}>
                  {saving ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: '16px', height: '16px' }} />}
                  {saving ? '保存中...' : '保存模型'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
