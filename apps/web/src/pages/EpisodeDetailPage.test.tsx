import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getEpisodeMock = vi.fn();
const getShotsMock = vi.fn();
const updateShotMock = vi.fn();
const generateShotMock = vi.fn();
const getCharactersMock = vi.fn();
const getAIProvidersMock = vi.fn();
const useParamsMock = vi.fn();

vi.mock('react-router-dom', () => ({
  useParams: () => useParamsMock(),
}));

vi.mock('../core/api/modules', () => ({
  episodesApi: {
    getEpisode: (...args: unknown[]) => getEpisodeMock(...args),
  },
  shotsApi: {
    getShots: (...args: unknown[]) => getShotsMock(...args),
    updateShot: (...args: unknown[]) => updateShotMock(...args),
    generateShot: (...args: unknown[]) => generateShotMock(...args),
  },
}));

vi.mock('../core/api/modules/ai-providers', () => ({
  aiProvidersApi: {
    getAIProviders: (...args: unknown[]) => getAIProvidersMock(...args),
  },
}));

vi.mock('../core/api/modules/characters', () => ({
  charactersApi: {
    getCharacters: (...args: unknown[]) => getCharactersMock(...args),
  },
}));

vi.mock('../components/episode/ShotNineGridWorkbench', () => ({
  ShotNineGridWorkbench: () => <div>九宫格工作台占位</div>,
}));

vi.mock('../components/ImageSelector', () => ({
  ImageSelector: () => <div>素材选择器占位</div>,
}));

import EpisodeDetailPage from './EpisodeDetailPage';

describe('EpisodeDetailPage 视频闭环', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useParamsMock.mockReturnValue({
      projectId: 'project-1',
      episodeId: 'episode-1',
    });

    getEpisodeMock.mockResolvedValue({
      id: 'episode-1',
      title: '第 1 集',
      episode_number: 1,
    });

    getCharactersMock.mockResolvedValue([]);
    getAIProvidersMock.mockResolvedValue([
      {
        id: 'provider-1',
        name: 'OpenAI',
        type: 'openai',
        enabled: true,
      },
    ]);
  });

  it('当开始帧和结束帧都存在时，显示可点击的生成视频按钮', async () => {
    getShotsMock.mockResolvedValue([
      {
        id: 'shot-1',
        episode_id: 'episode-1',
        scene_id: null,
        action_summary: '角色起身走向窗边',
        camera_movement: '缓慢推进',
        start_prompt: '开始帧提示词',
        end_prompt: '结束帧提示词',
        start_image_url: 'https://example.com/start.png',
        end_image_url: 'https://example.com/end.png',
        model: null,
        aspect_ratio: '16:9',
        resolution: '1080p',
        duration: 5,
        status: 'pending',
        video_url: null,
        created_at: '2026-03-18T00:00:00.000Z',
        updated_at: '2026-03-18T00:00:00.000Z',
      },
    ]);

    render(<EpisodeDetailPage />);

    const button = await screen.findByRole('button', { name: '生成视频' });
    expect((button as HTMLButtonElement).disabled).toBe(false);
  });

  it('点击生成视频后，立即展示成片预览', async () => {
    getShotsMock.mockResolvedValue([
      {
        id: 'shot-1',
        episode_id: 'episode-1',
        scene_id: null,
        action_summary: '角色起身走向窗边',
        camera_movement: '缓慢推进',
        start_prompt: '开始帧提示词',
        end_prompt: '结束帧提示词',
        start_image_url: 'https://example.com/start.png',
        end_image_url: 'https://example.com/end.png',
        model: null,
        aspect_ratio: '16:9',
        resolution: '1080p',
        duration: 5,
        status: 'pending',
        video_url: null,
        created_at: '2026-03-18T00:00:00.000Z',
        updated_at: '2026-03-18T00:00:00.000Z',
      },
    ]);

    updateShotMock.mockImplementation(async (_shotId: string, payload: Record<string, unknown>) => ({
      id: 'shot-1',
      episode_id: 'episode-1',
      scene_id: null,
      action_summary: payload.action_summary,
      camera_movement: payload.camera_movement,
      start_prompt: payload.start_prompt,
      end_prompt: payload.end_prompt,
      start_image_url: payload.start_image_url,
      end_image_url: payload.end_image_url,
      visual_style: payload.visual_style,
      model: null,
      aspect_ratio: '16:9',
      resolution: '1080p',
      duration: 5,
      status: 'pending',
      video_url: null,
      created_at: '2026-03-18T00:00:00.000Z',
      updated_at: '2026-03-18T00:00:00.000Z',
    }));

    generateShotMock.mockResolvedValue({
      video_url: 'https://example.com/video.mp4',
      duration: 5,
      resolution: '1080p',
      shot: {
        id: 'shot-1',
        episode_id: 'episode-1',
        scene_id: null,
        action_summary: '角色起身走向窗边',
        camera_movement: '缓慢推进',
        start_prompt: '开始帧提示词',
        end_prompt: '结束帧提示词',
        start_image_url: 'https://example.com/start.png',
        end_image_url: 'https://example.com/end.png',
        model: null,
        aspect_ratio: '16:9',
        resolution: '1080p',
        duration: 5,
        status: 'completed',
        video_url: 'https://example.com/video.mp4',
        created_at: '2026-03-18T00:00:00.000Z',
        updated_at: '2026-03-18T00:00:00.000Z',
      },
    });

    render(<EpisodeDetailPage />);

    const button = await screen.findByRole('button', { name: '生成视频' });
    fireEvent.click(button);

    await waitFor(() => {
      expect(generateShotMock).toHaveBeenCalledWith(
        'shot-1',
        expect.objectContaining({ provider_id: 'openai' })
      );
    });

    expect(await screen.findByText('成片预览')).toBeTruthy();
    expect(document.querySelector('video')).toBeTruthy();
  });
});
