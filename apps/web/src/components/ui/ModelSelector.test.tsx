import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ModelSelector, ContentType } from './ModelSelector/ModelSelector';
import * as apiClientModule from '../../lib/api-client';

vi.mock('../../lib/api-client', () => ({
  apiClient: {
    getAIProviders: vi.fn(),
    getModelPreferences: vi.fn(),
    setDefaultModels: vi.fn(),
    recordModelUsage: vi.fn(),
    testModel: vi.fn(),
  },
}));

const mockGetAIProviders = apiClientModule.apiClient.getAIProviders as any;
const mockGetModelPreferences = apiClientModule.apiClient.getModelPreferences as any;
const mockRecordModelUsage = apiClientModule.apiClient.recordModelUsage as any;
const mockTestModel = apiClientModule.apiClient.testModel as any;

describe('ModelSelector', () => {
  const defaultProps = {
    contentType: 'text' as ContentType,
    onChange: vi.fn(),
    placeholder: '选择模型',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAIProviders.mockResolvedValue({
      providers: [
        {
          id: 'provider-1',
          type: 'openai',
          name: 'OpenAI',
          models: [
            {
              id: 'model-1',
              name: 'gpt-4',
              type: 'text',
              capabilities: ['text-generation', 'code'],
            },
            {
              id: 'model-2',
              name: 'gpt-3.5-turbo',
              type: 'text',
              capabilities: ['text-generation'],
            },
          ],
        },
      ],
    });
    mockGetModelPreferences.mockResolvedValue({
      defaultModels: { text: 'model-1' },
      lastUsedModels: { text: 'model-2' },
      modelParameters: {},
    });
  });

  it('renders correctly with placeholder', () => {
    render(<ModelSelector {...defaultProps} />);
    expect(screen.getByText('选择模型')).toBeInTheDocument();
  });

  it('displays selected model name when value is provided', () => {
    render(<ModelSelector {...defaultProps} value="model-1" />);
    expect(screen.getByText('gpt-4')).toBeInTheDocument();
  });

  it('opens dropdown on click', async () => {
    render(<ModelSelector {...defaultProps} />);
    
    const trigger = screen.getByText('选择模型');
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('可用模型')).toBeInTheDocument();
    });
  });

  it('displays default model when showDefault is true', async () => {
    render(<ModelSelector {...defaultProps} showDefault={true} />);
    
    const trigger = screen.getByText('选择模型');
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('默认模型')).toBeInTheDocument();
      expect(screen.getByText('gpt-4')).toBeInTheDocument();
    });
  });

  it('displays last used model when showLastUsed is true', async () => {
    render(<ModelSelector {...defaultProps} showLastUsed={true} />);
    
    const trigger = screen.getByText('选择模型');
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('最近使用')).toBeInTheDocument();
      expect(screen.getByText('gpt-3.5-turbo')).toBeInTheDocument();
    });
  });

  it('filters models based on search input', async () => {
    render(<ModelSelector {...defaultProps} />);
    
    const trigger = screen.getByText('选择模型');
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('可用模型')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('搜索模型...');
    fireEvent.change(searchInput, { target: { value: 'gpt-4' } });

    await waitFor(() => {
      expect(screen.getByText('gpt-4')).toBeInTheDocument();
      expect(screen.queryByText('gpt-3.5-turbo')).not.toBeInTheDocument();
    });
  });

  it('calls onChange when model is selected', async () => {
    const onChange = vi.fn();
    render(<ModelSelector {...defaultProps} onChange={onChange} />);
    
    const trigger = screen.getByText('选择模型');
    fireEvent.click(trigger);

    await waitFor(() => {
      const modelOption = screen.getByText('gpt-3.5-turbo');
      fireEvent.click(modelOption);
    });

    expect(onChange).toHaveBeenCalledWith('model-2');
  });

  it('records model usage when model is selected', async () => {
    const onChange = vi.fn();
    render(<ModelSelector {...defaultProps} onChange={onChange} />);
    
    const trigger = screen.getByText('选择模型');
    fireEvent.click(trigger);

    await waitFor(() => {
      const modelOption = screen.getByText('gpt-3.5-turbo');
      fireEvent.click(modelOption);
    });

    expect(mockRecordModelUsage).toHaveBeenCalledWith({
      modelId: 'model-2',
      contentType: 'text',
      success: true,
    });
  });

  it('shows loading state while fetching models', () => {
    mockGetAIProviders.mockImplementation(() => new Promise(() => {}));
    
    render(<ModelSelector {...defaultProps} />);
    
    expect(screen.getByText('加载中...')).toBeInTheDocument();
  });

  it('shows no models message when no models match search', async () => {
    mockGetAIProviders.mockResolvedValue({
      providers: [
        {
          id: 'provider-1',
          type: 'openai',
          name: 'OpenAI',
          models: [
            {
              id: 'model-1',
              name: 'gpt-4',
              type: 'text',
            },
          ],
        },
      ],
    });

    render(<ModelSelector {...defaultProps} />);
    
    const trigger = screen.getByText('选择模型');
    fireEvent.click(trigger);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('搜索模型...');
      fireEvent.change(searchInput, { target: { value: 'non-existent' } });
    });

    await waitFor(() => {
      expect(screen.getByText('未找到匹配的模型')).toBeInTheDocument();
    });
  });

  it('displays model capabilities', async () => {
    render(<ModelSelector {...defaultProps} />);
    
    const trigger = screen.getByText('选择模型');
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('text-generation')).toBeInTheDocument();
      expect(screen.getByText('code')).toBeInTheDocument();
    });
  });

  it('is disabled when disabled prop is true', () => {
    render(<ModelSelector {...defaultProps} disabled={true} />);
    
    const trigger = screen.getByText('选择模型');
    expect(trigger).toHaveStyle({ cursor: 'not-allowed', opacity: '0.6' });
  });

  it('supports keyboard navigation', async () => {
    render(<ModelSelector {...defaultProps} />);
    
    const trigger = screen.getByText('选择模型');
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('可用模型')).toBeInTheDocument();
    });

    fireEvent.keyDown(trigger, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByText('可用模型')).not.toBeInTheDocument();
    });
  });

  it('handles refresh button click', async () => {
    const onRefreshModels = vi.fn();
    render(<ModelSelector {...defaultProps} onRefreshModels={onRefreshModels} />);
    
    const trigger = screen.getByText('选择模型');
    fireEvent.click(trigger);

    await waitFor(() => {
      const refreshButton = screen.getByTitle('刷新模型列表');
      fireEvent.click(refreshButton);
    });

    expect(onRefreshModels).toHaveBeenCalled();
  });

  it('handles settings button click', async () => {
    const onManageModels = vi.fn();
    render(<ModelSelector {...defaultProps} onManageModels={onManageModels} />);
    
    const trigger = screen.getByText('选择模型');
    fireEvent.click(trigger);

    await waitFor(() => {
      const settingsButton = screen.getByTitle('管理模型');
      fireEvent.click(settingsButton);
    });

    expect(onManageModels).toHaveBeenCalled();
  });

  it('closes dropdown after selection', async () => {
    render(<ModelSelector {...defaultProps} />);
    
    const trigger = screen.getByText('选择模型');
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('可用模型')).toBeInTheDocument();
    });

    const modelOption = screen.getByText('gpt-3.5-turbo');
    fireEvent.click(modelOption);

    await waitFor(() => {
      expect(screen.queryByText('可用模型')).not.toBeInTheDocument();
    });
  });
});
