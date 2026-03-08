import { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';
import { queryKeys } from '../../core/api/client';
import { useToast } from '../../components/ui/Toast';
import { useCurrentUser } from '../../modules/auth/hooks/useCurrentUser';
import type { AIProvider, AIProviderModel } from '../../types';
import { INITIAL_PROVIDER_FORM_DATA, INITIAL_MODEL_FORM_DATA } from './constants';

export function useAIProvidersPage() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const { data: userData } = useCurrentUser();
  const isAdmin = userData?.user?.role === 'admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set());
  const [visibleApiKeys, setVisibleApiKeys] = useState<Set<string>>(new Set());
  
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null);
  const [editingModel, setEditingModel] = useState<AIProviderModel | null>(null);
  const [selectedProviderForModel, setSelectedProviderForModel] = useState<AIProvider | null>(null);
  
  const [providerFormData, setProviderFormData] = useState(INITIAL_PROVIDER_FORM_DATA);
  const [modelFormData, setModelFormData] = useState(INITIAL_MODEL_FORM_DATA);
  
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testingModel, setTestingModel] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: queryKeys.aiProviders.all,
    queryFn: () => apiClient.getAIProviders(),
    staleTime: 5 * 60 * 1000,
  });

  const providers = useMemo(() => {
    if (!data) return [];
    const providersArray = Array.isArray(data) ? data : (data as any).providers;
    return Array.isArray(providersArray) ? providersArray : [];
  }, [data]);

  const filteredProviders = useMemo(() => {
    if (!Array.isArray(providers)) return [];
    return providers.filter((p: any) =>
      p.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.models?.some((m: AIProviderModel) => m.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [providers, searchQuery]);

  const toggleProviderExpand = useCallback((id: string) => {
    setExpandedProviders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }, []);

  const toggleApiKeyVisibility = useCallback((id: string) => {
    setVisibleApiKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }, []);

  const openAddProviderModal = useCallback(() => {
    setEditingProvider(null);
    setProviderFormData(INITIAL_PROVIDER_FORM_DATA);
    setShowProviderModal(true);
  }, []);

  const openEditProviderModal = useCallback((provider: AIProvider) => {
    setEditingProvider(provider);
    setProviderFormData({
      type: provider.type,
      api_key: provider.api_key || '',
      base_url: (provider as any).base_url || '',
      enabled: provider.enabled ?? true,
    });
    setShowProviderModal(true);
  }, []);

  const closeProviderModal = useCallback(() => {
    setShowProviderModal(false);
    setEditingProvider(null);
    setProviderFormData(INITIAL_PROVIDER_FORM_DATA);
  }, []);

  const openAddModelModal = useCallback((provider: AIProvider) => {
    setSelectedProviderForModel(provider);
    setEditingModel(null);
    setModelFormData(INITIAL_MODEL_FORM_DATA);
    setShowModelModal(true);
  }, []);

  const openEditModelModal = useCallback((provider: AIProvider, model: AIProviderModel) => {
    setSelectedProviderForModel(provider);
    setEditingModel(model);
    setModelFormData({
      name: model.name,
      model_id: (model as any).model_id,
      types: model.types || [],
      description: (model as any).description || '',
      capabilities: (model as any).capabilities || [],
      enabled: (model as any).enabled ?? true,
    });
    setShowModelModal(true);
  }, []);

  const closeModelModal = useCallback(() => {
    setShowModelModal(false);
    setSelectedProviderForModel(null);
    setEditingModel(null);
    setModelFormData(INITIAL_MODEL_FORM_DATA);
  }, []);

  const handleSaveProvider = useCallback(async () => {
    if (!providerFormData.api_key.trim()) {
      addToast({ title: '错误', message: '请输入 API 密钥', type: 'error' });
      return;
    }
    setSaving(true);
    try {
      if (editingProvider) {
        await apiClient.updateAIProvider(editingProvider.id, providerFormData);
        addToast({ title: '更新成功', message: '提供商配置已更新', type: 'success' });
      } else {
        await apiClient.createAIProvider(providerFormData);
        addToast({ title: '添加成功', message: '新提供商已添加', type: 'success' });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.aiProviders.all });
      closeProviderModal();
    } catch (error: any) {
      addToast({ title: '操作失败', message: error.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  }, [providerFormData, editingProvider, addToast, queryClient, closeProviderModal]);

  const handleDeleteProvider = useCallback(async (id: string) => {
    if (!confirm('确定要删除此提供商吗？所有关联的模型也将被删除。')) return;
    try {
      await apiClient.deleteAIProvider(id);
      addToast({ title: '删除成功', message: '提供商已删除', type: 'success' });
      queryClient.invalidateQueries({ queryKey: queryKeys.aiProviders.all });
    } catch (error: any) {
      addToast({ title: '删除失败', message: error.message, type: 'error' });
    }
  }, [addToast, queryClient]);

  const handleTestProvider = useCallback(async (id: string) => {
    setTestingProvider(id);
    try {
      await apiClient.testAIProvider(id);
      addToast({ title: '连接成功', message: 'API 连接测试通过', type: 'success' });
    } catch (error: any) {
      addToast({ title: '连接失败', message: error.message, type: 'error' });
    } finally {
      setTestingProvider(null);
    }
  }, [addToast]);

  const handleSaveModel = useCallback(async () => {
    if (!selectedProviderForModel) return;
    if (!modelFormData.name.trim() || !modelFormData.model_id.trim()) {
      addToast({ title: '错误', message: '请填写模型名称和 ID', type: 'error' });
      return;
    }
    setSaving(true);
    try {
      const modelData = {
        name: modelFormData.name,
        model_id: modelFormData.model_id,
        types: modelFormData.types,
        description: modelFormData.description,
        capabilities: modelFormData.capabilities,
        enabled: modelFormData.enabled,
        maxTokens: 4096,
      };
      if (editingModel) {
        await apiClient.updateAIProviderModel(selectedProviderForModel.id, editingModel.id, modelData);
        addToast({ title: '更新成功', message: '模型配置已更新', type: 'success' });
      } else {
        await apiClient.createAIProviderModel(selectedProviderForModel.id, modelData);
        addToast({ title: '添加成功', message: '新模型已添加', type: 'success' });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.aiProviders.all });
      closeModelModal();
    } catch (error: any) {
      addToast({ title: '操作失败', message: error.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  }, [selectedProviderForModel, modelFormData, editingModel, addToast, queryClient, closeModelModal]);

  const handleDeleteModel = useCallback(async (provider: AIProvider, model: AIProviderModel) => {
    if (!confirm('确定要删除此模型吗？')) return;
    try {
      await apiClient.deleteAIProviderModel(provider.id, model.id);
      addToast({ title: '删除成功', message: '模型已删除', type: 'success' });
      queryClient.invalidateQueries({ queryKey: queryKeys.aiProviders.all });
    } catch (error: any) {
      addToast({ title: '删除失败', message: error.message, type: 'error' });
    }
  }, [addToast, queryClient]);

  const handleTestModel = useCallback(async (modelId: string) => {
    setTestingModel(modelId);
    try {
      const result = await apiClient.testAIProviderModel(modelId);
      if (result.success) {
        addToast({ title: '测试成功', message: '模型测试通过', type: 'success' });
      } else {
        addToast({ title: '测试失败', message: result.message || '模型测试失败', type: 'error' });
      }
    } catch (error: any) {
      addToast({ title: '测试失败', message: error.message, type: 'error' });
    } finally {
      setTestingModel(null);
    }
  }, [addToast]);

  const handleSetAssistantDefault = useCallback(async (modelId: string) => {
    try {
      await apiClient.setAssistantDefaultModel(modelId);
      addToast({ title: '设置成功', message: '已设为 AI 助手默认模型', type: 'success' });
      queryClient.invalidateQueries({ queryKey: queryKeys.aiProviders.all });
    } catch (error: any) {
      addToast({ title: '设置失败', message: error.message, type: 'error' });
    }
  }, [addToast, queryClient]);

  const handleUnsetAssistantDefault = useCallback(async (modelId: string) => {
    try {
      await apiClient.unsetAssistantDefaultModel(modelId);
      addToast({ title: '取消成功', message: '已取消 AI 助手默认模型', type: 'success' });
      queryClient.invalidateQueries({ queryKey: queryKeys.aiProviders.all });
    } catch (error: any) {
      addToast({ title: '取消失败', message: error.message, type: 'error' });
    }
  }, [addToast, queryClient]);

  return {
    providers,
    filteredProviders,
    isLoading,
    isAdmin,
    searchQuery,
    setSearchQuery,
    expandedProviders,
    toggleProviderExpand,
    visibleApiKeys,
    toggleApiKeyVisibility,
    showProviderModal,
    showModelModal,
    editingProvider,
    editingModel,
    selectedProviderForModel,
    providerFormData,
    setProviderFormData,
    modelFormData,
    setModelFormData,
    saving,
    testingProvider,
    testingModel,
    openAddProviderModal,
    openEditProviderModal,
    closeProviderModal,
    openAddModelModal,
    openEditModelModal,
    closeModelModal,
    handleSaveProvider,
    handleDeleteProvider,
    handleTestProvider,
    handleSaveModel,
    handleDeleteModel,
    handleTestModel,
    handleSetAssistantDefault,
    handleUnsetAssistantDefault,
    refetch,
  };
}
