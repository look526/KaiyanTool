import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Settings,
  Key,
  Check,
  XCircle,
  Server,
  Zap
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Card } from '../components/ui/card';
import { useToast } from '../components/ui/Toast';
import { Modal, ConfirmModal } from '../components/ui/ModalModern';
import { apiClient, type AIProvider } from '../lib/api';

interface ProviderFormData {
  type: 'openai' | 'google' | 'zhipu' | 'antsk';
  apiKey: string;
  baseUrl: string;
}

export default function AIProvidersPage() {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<string | null>(null);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message?: string }>>({});
  const { addToast } = useToast();

  const [form, setForm] = useState<ProviderFormData>({
    type: 'openai',
    apiKey: '',
    baseUrl: ''
  });

  const loadProviders = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAIProviders();
      setProviders(data.providers);
    } catch (error) {
      console.error('Failed to load AI providers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const handleSave = async () => {
    if (!form.apiKey) return;

    try {
      if (editingProvider) {
        await apiClient.updateAIProvider(editingProvider.id, {
          type: form.type,
          apiKey: form.apiKey,
          baseUrl: form.baseUrl
        });
      } else {
        await apiClient.createAIProvider({
          type: form.type,
          apiKey: form.apiKey,
          baseUrl: form.baseUrl
        });
      }
      await loadProviders();
      handleCloseModal();
      addToast({
        type: 'success',
        title: '保存成功',
        message: 'AI提供商已保存'
      });
    } catch (error) {
      console.error('Failed to save provider:', error);
      addToast({
        type: 'error',
        title: '保存失败',
        message: '请稍后重试。',
      });
    }
  };

  const handleDelete = async () => {
    if (!providerToDelete) return;

    try {
      await apiClient.deleteAIProvider(providerToDelete);
      await loadProviders();
      handleCloseDeleteModal();
      addToast({
        type: 'success',
        title: '删除成功',
        message: 'AI提供商已删除'
      });
    } catch (error) {
      console.error('Failed to delete provider:', error);
      addToast({
        type: 'error',
        title: '删除失败',
        message: '请稍后重试。',
      });
    }
  };

  const handleTest = async (providerId: string) => {
    try {
      setTestingProvider(providerId);
      await apiClient.testAIProvider(providerId);
      setTestResults({
        ...testResults,
        [providerId]: {
          success: true,
          message: '连接成功'
        }
      });
    } catch (error) {
      setTestResults({
        ...testResults,
        [providerId]: {
          success: false,
          message: '连接失败'
        }
      });
    } finally {
      setTestingProvider(null);
    }
  };

  const handleOpenModal = (provider?: AIProvider) => {
    console.log('handleOpenModal called', provider);
    if (provider) {
      setEditingProvider(provider);
      setForm({
        type: provider.type as any,
        apiKey: '',
        baseUrl: ''
      });
    } else {
      setEditingProvider(null);
      setForm({
        type: 'openai',
        apiKey: '',
        baseUrl: ''
      });
    }
    setShowModal(true);
    console.log('showModal set to true');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProvider(null);
    setForm({
      type: 'openai',
      apiKey: '',
      baseUrl: ''
    });
  };

  const handleOpenDeleteModal = (providerId: string) => {
    setProviderToDelete(providerId);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setProviderToDelete(null);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex' }}>
        <Sidebar />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 style={{ width: '48px', height: '48px', animation: 'spin 1s linear infinite' }} />
        </main>
      </div>
    );
  }

  const PROVIDER_TYPES = {
    openai: { name: 'OpenAI', icon: Zap, color: '#10a37f' },
    google: { name: 'Google', icon: Server, color: '#4285f4' },
    zhipu: { name: '智普AI', icon: Server, color: '#ff6b6b' },
    antsk: { name: 'AntSK', icon: Settings, color: '#6366f1' }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex' }}>
      <Sidebar />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
            <Link to="/" style={{
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
              }}>AI提供商</h1>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                共 {providers.length} 个提供商
              </div>
            </div>
          </div>

          <button
            onClick={() => handleOpenModal()}
            style={{
              height: '38px',
              padding: '0 20px',
              fontSize: '14px',
              fontWeight: '500',
              background: 'var(--accent)',
              color: 'var(--accent-on)',
              border: 'none',
              borderRadius: '9px',
              cursor: 'pointer',
              boxShadow: 'none',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent-hover)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--accent)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            添加提供商
          </button>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {providers.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
            }}>
              <Settings style={{ width: '64px', height: '64px', color: 'var(--text-muted)', marginBottom: '16px' }} />
              <p style={{ color: 'var(--text-tertiary)', fontSize: '16px', marginBottom: '24px' }}>
                暂无AI提供商，点击右上角添加
              </p>
              <button
                onClick={() => handleOpenModal()}
                style={{
                  height: '38px',
                  padding: '0 20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  background: 'var(--accent)',
                  color: 'var(--accent-on)',
                  border: 'none',
                  borderRadius: '9px',
                  cursor: 'pointer',
                  boxShadow: 'none',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--accent-hover)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--accent)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                添加提供商
              </button>
            </div>
          ) : (
            <div style={{
              maxWidth: '1000px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
              gap: '20px'
            }}>
              {providers.map((provider) => {
                const typeConfig = PROVIDER_TYPES[provider.type as keyof typeof PROVIDER_TYPES];
                const Icon = typeConfig.icon;
                const testResult = testResults[provider.id];

                return (
                  <Card key={provider.id} style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '10px',
                          background: `linear-gradient(135deg, ${typeConfig.color}20 0%, ${typeConfig.color}40 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Icon style={{ width: '24px', height: '24px', color: typeConfig.color }} />
                        </div>
                        <div>
                          <h3 style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                            margin: '0 0 4px 0',
                          }}>
                            {typeConfig.name}
                          </h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{
                              fontSize: '12px',
                              color: 'var(--text-muted)',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: 'var(--bg-hover)',
                            }}>
                              {typeConfig.name}
                            </span>
                            {provider.isActive && (
                              <span style={{
                                fontSize: '12px',
                                color: '#10b981',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}>
                                <Check style={{ width: '12px', height: '12px' }} />
                                已启用
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleTest(provider.id)}
                          disabled={testingProvider === provider.id}
                          style={{
                            padding: '6px',
                            borderRadius: '6px',
                            border: 'none',
                            background: 'transparent',
                            color: testingProvider === provider.id ? 'var(--text-muted)' : 'var(--text-primary)',
                            cursor: testingProvider === provider.id ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (testingProvider !== provider.id) {
                              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          {testingProvider === provider.id ? (
                            <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
                          ) : (
                            <Key style={{ width: '14px', height: '14px' }} />
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenModal(provider)}
                          style={{
                            padding: '6px',
                            borderRadius: '6px',
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
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
                          <Edit2 style={{ width: '14px', height: '14px' }} />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(provider.id)}
                          style={{
                            padding: '6px',
                            borderRadius: '6px',
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                            e.currentTarget.style.color = '#ef4444';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--text-muted)';
                          }}
                        >
                          <Trash2 style={{ width: '14px', height: '14px' }} />
                        </button>
                      </div>
                    </div>

                    {testResult && (
                      <div style={{
                        padding: '10px 12px',
                        borderRadius: '6px',
                        backgroundColor: testResult.success ? '#10b98110' : '#ef444410',
                        border: `1px solid ${testResult.success ? '#10b98140' : '#ef444440'}`,
                        marginBottom: '12px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {testResult.success ? (
                            <Check style={{ width: '14px', height: '14px', color: '#10b981' }} />
                          ) : (
                            <XCircle style={{ width: '14px', height: '14px', color: '#ef4444' }} />
                          )}
                          <span style={{
                            fontSize: '13px',
                            color: testResult.success ? '#10b981' : '#ef4444',
                          }}>
                            {testResult.message}
                          </span>
                        </div>
                      </div>
                    )}

                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                      创建于 {new Date(provider.createdAt).toLocaleDateString('zh-CN')}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <Modal
          open={showModal}
          onClose={handleCloseModal}
          title={editingProvider ? '编辑提供商' : '添加提供商'}
          size="medium"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>

            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--text-primary)',
                marginBottom: '8px',
              }}>
                提供商类型 *
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['openai', 'google', 'zhipu', 'antsk'].map((type) => {
                  const typeConfig = PROVIDER_TYPES[type as keyof typeof PROVIDER_TYPES];

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => (type !== 'google' && type !== 'antsk') && setForm({ ...form, type: type as any })}
                      disabled={type === 'google' || type === 'antsk'}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: `2px solid ${form.type === type ? typeConfig.color : 'var(--border-primary)'}`,
                        backgroundColor: form.type === type ? `${typeConfig.color}10` : 'var(--bg-base)',
                        color: (type === 'google' || type === 'antsk') ? 'var(--text-tertiary)' : 'var(--text-primary)',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: (type === 'google' || type === 'antsk') ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s ease',
                        opacity: (type === 'google' || type === 'antsk') ? 0.5 : 1,
                      }}
                    >
                      {typeConfig.name}
                      {(type === 'google' || type === 'antsk') && (
                        <span style={{ fontSize: '10px', marginLeft: '4px', opacity: 0.7 }}>即将推出</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--text-primary)',
                marginBottom: '8px',
              }}>
                API密钥 *
              </label>
              <input
                type="password"
                value={form.apiKey}
                onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                placeholder="sk-..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-primary)',
                  backgroundColor: 'var(--bg-base)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  transition: 'all 0.15s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-bg)';
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
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--text-primary)',
                marginBottom: '8px',
              }}>
                基础URL（可选）
              </label>
              <input
                type="text"
                value={form.baseUrl}
                onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
                placeholder="例如：https://api.openai.com/v1"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-primary)',
                  backgroundColor: 'var(--bg-base)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  transition: 'all 0.15s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-bg)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
              <button
                style={{
                  flex: 1,
                  height: '44px',
                  padding: '0 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onClick={handleCloseModal}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                取消
              </button>
              <button
                style={{
                  flex: 1,
                  height: '44px',
                  padding: '0 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  background: 'var(--accent)',
                  color: 'var(--accent-on)',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: !form.apiKey ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                  opacity: !form.apiKey ? 0.5 : 1,
                }}
                onClick={handleSave}
                disabled={!form.apiKey}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.background = 'var(--accent-hover)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.background = 'var(--accent)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {editingProvider ? '保存更改' : '添加提供商'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showDeleteModal && (
        <ConfirmModal
          open={showDeleteModal}
          onClose={handleCloseDeleteModal}
          onConfirm={handleDelete}
          title="确认删除提供商"
          description="您确定要删除此AI提供商吗？此操作不可撤销。"
          confirmText="删除"
          cancelText="取消"
          confirmVariant="danger"
          icon="error"
        />
      )}
    </div>
  );
}
