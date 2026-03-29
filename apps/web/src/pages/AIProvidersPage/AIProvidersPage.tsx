import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Search, RefreshCw, ArrowLeft, Settings, Sparkles, Plus } from 'lucide-react';
import { useAIProvidersPage } from './useAIProvidersPage';
import { ProviderHeader } from './ProviderHeader';
import { ProviderCard } from './ProviderCard';
import { ProviderModal } from './ProviderModal';
import { ModelModal } from './ModelModal';
import { EmptyState } from './EmptyState';
import { TestProgressPanel } from './TestProgressPanel';
import { useTheme } from '../../contexts/ThemeContext';
import type { AIProvider } from '../../types';

export default function AIProvidersPage() {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [refreshHover, setRefreshHover] = useState(false);
  const [backHover, setBackHover] = useState(false);

  const {
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
  } = useAIProvidersPage();

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const isTablet = typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024;

  // 色彩变量
  const colors = isDark ? {
    bgPrimary: 'rgba(5, 5, 10, 0.95)',
    bgSecondary: 'rgba(255, 255, 255, 0.03)',
    bgGlass: 'rgba(255, 255, 255, 0.04)',
    bgGlassHover: 'rgba(255, 255, 255, 0.06)',
    textPrimary: '#fafafa',
    textSecondary: 'rgba(250, 250, 250, 0.6)',
    textMuted: 'rgba(250, 250, 250, 0.4)',
    border: 'rgba(255, 255, 255, 0.06)',
    borderHover: 'rgba(139, 92, 246, 0.25)',
  } : {
    bgPrimary: 'rgba(255, 255, 255, 0.92)',
    bgSecondary: 'rgba(0, 0, 0, 0.02)',
    bgGlass: 'rgba(0, 0, 0, 0.02)',
    bgGlassHover: 'rgba(0, 0, 0, 0.04)',
    textPrimary: '#18181b',
    textSecondary: 'rgba(24, 24, 27, 0.6)',
    textMuted: 'rgba(24, 24, 27, 0.4)',
    border: 'rgba(0, 0, 0, 0.06)',
    borderHover: 'rgba(139, 92, 246, 0.25)',
  };

  // 强调色
  const accentColor = '#8b5cf6';
  const accentLight = '#a78bfa';
  const accentGlow = '#c4b5fd';

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: isDark 
          ? 'linear-gradient(180deg, #05050a 0%, #0a0a12 50%, #0f0f1a 100%)'
          : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* 装饰光晕 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(ellipse at 20% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)',
          pointerEvents: 'none',
        }} />
        
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '24px',
            background: `linear-gradient(135deg, ${accentColor} 0%, ${accentLight} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: `0 8px 24px ${accentColor}40`,
          }}>
            <Loader2 style={{ 
              animation: 'spin 1s linear infinite', 
              color: '#ffffff',
              width: 32,
              height: 32,
            }} />
          </div>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: colors.textPrimary, 
            margin: '0 0 8px 0',
          }}>加载中</h3>
          <p style={{ 
            color: colors.textMuted, 
            fontSize: '14px',
            margin: 0,
          }}>正在加载 AI 服务提供商配置...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg-page)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* 顶部栏 */}
      <div style={{
        background: 'var(--bg-header)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-primary)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)',
            }}>
              <Settings style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <div>
              <h1 style={{ 
                fontSize: '22px', 
                fontWeight: '600', 
                color: 'var(--text-primary)', 
                margin: 0,
              }}>
                AI 服务提供商
              </h1>
              <p style={{ 
                color: 'var(--text-muted)', 
                margin: '2px 0 0',
                fontSize: '13px',
              }}>
                管理您的 AI 服务提供商和模型配置
              </p>
            </div>
          </div>

          <button
            onClick={openAddProviderModal}
            style={{
              height: '44px',
              padding: '0 20px',
              fontSize: '14px',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(139, 92, 246, 0.3)';
            }}
          >
            <Plus style={{ width: '18px', height: '18px' }} />
            添加提供商
          </button>
        </div>
      </div>

      <main style={{ flex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
          <ProviderHeader 
            providers={filteredProviders as any} 
            isMobile={isMobile} 
            isTablet={isTablet} 
           
            colors={colors}
           
          />

          <div style={{ 
            marginBottom: '32px', 
            display: 'flex', 
            gap: '16px', 
            alignItems: 'center',
            flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
              <Search style={{ 
                position: 'absolute', 
                left: '16px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: colors.textMuted,
                zIndex: 1,
              }} size={20} />
              <input
                type="text"
                placeholder="搜索提供商或模型..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '52px',
                  padding: '0 24px 0 48px',
                  background: colors.bgGlass,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '16px',
                  fontSize: '14px',
                  color: colors.textPrimary,
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: isDark 
                    ? '0 8px 24px rgba(0, 0, 0, 0.15)'
                    : '0 4px 12px rgba(0, 0, 0, 0.05)',
                  backdropFilter: 'blur(20px)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = accentColor;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}15, 0 8px 24px ${accentColor}10`;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.boxShadow = isDark 
                    ? '0 8px 24px rgba(0, 0, 0, 0.15)'
                    : '0 4px 12px rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              />
            </div>
            <button
              onClick={() => refetch()}
              onMouseEnter={() => setRefreshHover(true)}
              onMouseLeave={() => setRefreshHover(false)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                padding: '0 28px',
                height: '52px',
                background: refreshHover ? colors.bgGlassHover : colors.bgGlass,
                border: `1px solid ${refreshHover ? accentColor : colors.border}`,
                borderRadius: '16px',
                fontSize: '14px',
                fontWeight: '600',
                color: refreshHover ? accentColor : colors.textPrimary,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: refreshHover 
                  ? `0 8px 24px ${accentColor}20` 
                  : isDark 
                    ? '0 8px 24px rgba(0, 0, 0, 0.15)'
                    : '0 4px 12px rgba(0, 0, 0, 0.05)',
                transform: refreshHover ? 'translateY(-2px)' : 'translateY(0)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <RefreshCw 
                size={20} 
                style={{ 
                  animation: refreshHover ? 'spin 0.5s linear infinite' : 'none',
                  transition: 'all 0.3s ease',
                }} 
              />
              刷新
            </button>
          </div>

          {filteredProviders.length === 0 ? (
            <EmptyState 
              type="providers" 
              onAddProvider={openAddProviderModal}
             
              colors={colors}
             
            />
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(440px, 1fr))', 
              gap: '28px',
              marginTop: '16px',
            }}>
              {filteredProviders.map((provider: any) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  isExpanded={expandedProviders.has(provider.id)}
                  isApiKeyVisible={visibleApiKeys.has(provider.id)}
                  isAdmin={isAdmin}
                  onToggleExpand={toggleProviderExpand}
                  onToggleApiKeyVisibility={toggleApiKeyVisibility}
                  onEdit={openEditProviderModal}
                  onDelete={handleDeleteProvider}
                  onTest={handleTestProvider}
                  onAddModel={openAddModelModal}
                  onEditModel={openEditModelModal}
                  onDeleteModel={handleDeleteModel}
                  onTestModel={handleTestModel}
                  onSetAssistantDefault={handleSetAssistantDefault}
                  onUnsetAssistantDefault={handleUnsetAssistantDefault}
                  testingProvider={testingProvider}
                  testingModel={testingModel}
                  isMobile={isMobile}
                  isTablet={isTablet}
                 
                  colors={colors}
                 
                />
              ))}
            </div>
          )}

          <ProviderModal
            open={showProviderModal}
            onClose={closeProviderModal}
            onSave={handleSaveProvider}
            formData={providerFormData}
            onFormDataChange={setProviderFormData}
            saving={saving}
            isEdit={!!editingProvider}
            isMobile={isMobile}
           
            colors={colors}
           
          />

          <ModelModal
            open={showModelModal}
            onClose={closeModelModal}
            onSave={handleSaveModel}
            modelFormData={modelFormData}
            onModelFormDataChange={setModelFormData}
            saving={saving}
            isEdit={!!selectedProviderForModel?.models?.some((m) => m.id === modelFormData.model_id)}
            providerType={selectedProviderForModel?.type || ''}
           
            colors={colors}
           
          />
        </div>
      </main>

      <TestProgressPanel
        testingProvider={testingProvider}
        testingModel={testingModel}
       
       
      />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}
