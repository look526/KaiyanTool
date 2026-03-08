import React, { useState } from 'react';
import {
  GlassButton,
  GlassCard,
  GlassInput,
  GlassSelect,
  PageHeader,
  SearchBar,
  Typography,
  H1,
  H2,
  H3,
  Body1,
  Body2,
  LoadingState,
  Grid,
  ResponsiveGrid,
  useBreakpoint,
  FeedbackToast,
  EmptyState,
  type GlassSelectOption,
} from '@/components/ui';

export const DesignSystemShowcase: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedValue, setSelectedValue] = useState('');
  const { isMobile } = useBreakpoint();

  const filterOptions: GlassSelectOption[] = [
    { value: 'all', label: '全部' },
    { value: 'active', label: '活跃' },
    { value: 'inactive', label: '非活跃' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      padding: isMobile ? '16px' : '32px',
    }}>
      <PageHeader
        title="设计系统示例"
        subtitle="展示 KaiyanTool 设计系统的核心组件"
        breadcrumbs={[
          { label: '首页', href: '/' },
          { label: '设计系统' },
        ]}
        actions={
          <GlassButton variant="primary" size="md">
            操作按钮
          </GlassButton>
        }
      />

      <div style={{ marginTop: '32px' }}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="搜索组件..."
          filters={[
            {
              key: 'status',
              label: '状态',
              options: filterOptions,
              value: selectedValue,
              onChange: setSelectedValue,
            },
          ]}
        />
      </div>

      <div style={{ marginTop: '40px' }}>
        <H2 gutterBottom>排版示例</H2>
        <Grid cols={1} gap={24}>
          <GlassCard padding="lg">
            <H1>主标题 H1 - 36px</H1>
            <H2>副标题 H2 - 30px</H2>
            <H3>三级标题 H3 - 24px</H3>
            <Typography variant="h4">四级标题 H4 - 20px</Typography>
            <Typography variant="h5">五级标题 H5 - 18px</Typography>
            <Typography variant="h6">六级标题 H6 - 16px</Typography>
            <div style={{ marginTop: '16px' }}>
              <Body1>正文内容 Body1 - 16px</Body1>
              <Body2>次要内容 Body2 - 14px</Body2>
              <Typography variant="caption">说明文字 Caption - 12px</Typography>
              <Typography variant="overline">标签文字 Overline - 12px UPPERCASE</Typography>
            </div>
          </GlassCard>
        </Grid>
      </div>

      <div style={{ marginTop: '40px' }}>
        <H2 gutterBottom>按钮示例</H2>
        <Grid cols={1} gap={24}>
          <GlassCard padding="lg">
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <GlassButton variant="primary" size="sm">
                Primary Small
              </GlassButton>
              <GlassButton variant="primary" size="md">
                Primary Medium
              </GlassButton>
              <GlassButton variant="primary" size="lg">
                Primary Large
              </GlassButton>
              <GlassButton variant="primary" size="xl">
                Primary Extra Large
              </GlassButton>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <GlassButton variant="secondary" size="md">
                Secondary
              </GlassButton>
              <GlassButton variant="danger" size="md">
                Danger
              </GlassButton>
              <GlassButton variant="success" size="md">
                Success
              </GlassButton>
              <GlassButton variant="outline" size="md">
                Outline
              </GlassButton>
              <GlassButton variant="ghost" size="md">
                Ghost
              </GlassButton>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <GlassButton variant="primary" size="md" loading>
                Loading
              </GlassButton>
              <GlassButton variant="primary" size="md" disabled>
                Disabled
              </GlassButton>
            </div>
          </GlassCard>
        </Grid>
      </div>

      <div style={{ marginTop: '40px' }}>
        <H2 gutterBottom>输入框示例</H2>
        <Grid cols={1} gap={24}>
          <GlassCard padding="lg">
            <GlassInput
              variant="default"
              size="md"
              placeholder="默认输入框"
              helperText="这是帮助文本"
            />
            <div style={{ marginTop: '16px' }}>
              <GlassInput
                variant="search"
                size="md"
                placeholder="搜索框"
              />
            </div>
            <div style={{ marginTop: '16px' }}>
              <GlassInput
                variant="default"
                size="md"
                placeholder="带图标的输入框"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                  </svg>
                }
              />
            </div>
            <div style={{ marginTop: '16px' }}>
              <GlassInput
                variant="default"
                size="md"
                placeholder="错误状态"
                error
                helperText="这是错误提示"
              />
            </div>
          </GlassCard>
        </Grid>
      </div>

      <div style={{ marginTop: '40px' }}>
        <H2 gutterBottom>下拉选择示例</H2>
        <Grid cols={1} gap={24}>
          <GlassCard padding="lg">
            <GlassSelect
              options={filterOptions}
              value={selectedValue}
              onChange={(e) => setSelectedValue(e.target.value)}
              placeholder="请选择状态"
              helperText="这是下拉选择框"
            />
          </GlassCard>
        </Grid>
      </div>

      <div style={{ marginTop: '40px' }}>
        <H2 gutterBottom>卡片示例</H2>
        <ResponsiveGrid
          xs={1}
          sm={2}
          md={3}
          lg={4}
          gap={24}
        >
          {[1, 2, 3, 4].map((item) => (
            <GlassCard key={item} variant="default" interactive padding="lg">
              <H3>卡片 {item}</H3>
              <Body2>这是一个可交互的玻璃态卡片</Body2>
            </GlassCard>
          ))}
        </ResponsiveGrid>
      </div>

      <div style={{ marginTop: '40px' }}>
        <H2 gutterBottom>卡片变体</H2>
        <ResponsiveGrid
          xs={1}
          sm={2}
          md={2}
          lg={4}
          gap={24}
        >
          <GlassCard variant="default" padding="lg">
            <H3>Default</H3>
            <Body2>默认卡片样式</Body2>
          </GlassCard>
          <GlassCard variant="elevated" padding="lg">
            <H3>Elevated</H3>
            <Body2>提升卡片样式</Body2>
          </GlassCard>
          <GlassCard variant="outlined" padding="lg">
            <H3>Outlined</H3>
            <Body2>边框卡片样式</Body2>
          </GlassCard>
          <GlassCard variant="glass" padding="lg">
            <H3>Glass</H3>
            <Body2>毛玻璃卡片样式</Body2>
          </GlassCard>
        </ResponsiveGrid>
      </div>

      <div style={{ marginTop: '40px' }}>
        <H2 gutterBottom>加载状态示例</H2>
        <Grid cols={1} gap={24}>
          <GlassCard padding="lg">
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              <div>
                <Body2 gutterBottom>Spinner Small</Body2>
                <LoadingState size="sm" variant="spinner" />
              </div>
              <div>
                <Body2 gutterBottom>Spinner Medium</Body2>
                <LoadingState size="md" variant="spinner" />
              </div>
              <div>
                <Body2 gutterBottom>Spinner Large</Body2>
                <LoadingState size="lg" variant="spinner" />
              </div>
              <div>
                <Body2 gutterBottom>Dots</Body2>
                <LoadingState size="md" variant="dots" />
              </div>
              <div>
                <Body2 gutterBottom>Pulse</Body2>
                <LoadingState size="md" variant="pulse" />
              </div>
            </div>
          </GlassCard>
        </Grid>
      </div>

      <div style={{ marginTop: '40px' }}>
        <H2 gutterBottom>反馈系统示例</H2>
        <Grid cols={1} gap={24}>
          <GlassCard padding="lg">
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <GlassButton
                variant="success"
                size="md"
                onClick={() => {
                  alert('Success toast');
                }}
              >
                Success Toast
              </GlassButton>
              <GlassButton
                variant="danger"
                size="md"
                onClick={() => {
                  alert('Error toast');
                }}
              >
                Error Toast
              </GlassButton>
              <GlassButton
                variant="secondary"
                size="md"
                onClick={() => {
                  alert('Info toast');
                }}
              >
                Info Toast
              </GlassButton>
            </div>
          </GlassCard>
        </Grid>
      </div>

      <div style={{ marginTop: '40px' }}>
        <H2 gutterBottom>空状态示例</H2>
        <Grid cols={1} gap={24}>
          <GlassCard padding="none">
            <EmptyState
              title="暂无数据"
              description="当前没有任何内容，点击下方按钮创建新内容"
              action={{
                label: '创建内容',
                onClick: () => alert('创建内容'),
              }}
            />
          </GlassCard>
        </Grid>
      </div>

      <div style={{ marginTop: '40px', marginBottom: '40px' }}>
        <H2 gutterBottom>响应式示例</H2>
        <Body2 gutterBottom>
          当前屏幕尺寸: {isMobile ? '移动端' : '桌面端'}
        </Body2>
        <ResponsiveGrid
          xs={1}
          sm={2}
          md={3}
          lg={4}
          gap={16}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <GlassCard key={item} variant="glass" padding="md">
              <Body2>项目 {item}</Body2>
            </GlassCard>
          ))}
        </ResponsiveGrid>
      </div>
    </div>
  );
};
