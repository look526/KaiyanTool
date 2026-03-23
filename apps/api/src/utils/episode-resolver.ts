import crypto from 'crypto';
import { prisma } from '../lib/prisma';

interface EpisodeResolutionParams {
  project_id: string;
  scene_id?: string;
  episode_id?: string;
  episode_number?: number | null;
}

interface ResolvedEpisode {
  id: string;
  project_id: string;
  episode_number: number;
}

/**
 * 获取项目的默认分集；如果项目还没有分集则自动创建第一集。
 */
export async function getOrCreateDefaultEpisode(
  project_id: string
): Promise<ResolvedEpisode> {
  const existingEpisode = await prisma.episode.findFirst({
    where: { project_id },
    orderBy: { episode_number: 'asc' },
    select: {
      id: true,
      project_id: true,
      episode_number: true,
    },
  });

  if (existingEpisode) {
    return existingEpisode;
  }

  return prisma.episode.create({
    data: {
      id: crypto.randomUUID(),
      project_id,
      title: '第一集',
      episode_number: 1,
      updated_at: new Date(),
    },
    select: {
      id: true,
      project_id: true,
      episode_number: true,
    },
  });
}

/**
 * 为项目级分镜创建解析目标分集，优先级依次为场景、显式分集、分集序号、默认分集。
 */
export async function resolveEpisodeForProject(
  params: EpisodeResolutionParams
): Promise<ResolvedEpisode | null> {
  const { project_id, scene_id, episode_id, episode_number } = params;

  if (scene_id) {
    const scene = await prisma.scene.findFirst({
      where: {
        id: scene_id,
        OR: [
          { project_id },
          { Episode: { project_id } },
        ],
      },
      select: {
        episode_id: true,
        Episode: {
          select: {
            project_id: true,
            episode_number: true,
          },
        },
      },
    });

    if (!scene?.Episode) {
      return null;
    }

    return {
      id: scene.episode_id,
      project_id: scene.Episode.project_id,
      episode_number: scene.Episode.episode_number,
    };
  }

  if (episode_id) {
    const episode = await prisma.episode.findFirst({
      where: {
        id: episode_id,
        project_id,
      },
      select: {
        id: true,
        project_id: true,
        episode_number: true,
      },
    });

    if (episode) {
      return episode;
    }
  }

  if (typeof episode_number === 'number') {
    const episode = await prisma.episode.findFirst({
      where: {
        project_id,
        episode_number,
      },
      select: {
        id: true,
        project_id: true,
        episode_number: true,
      },
    });

    if (episode) {
      return episode;
    }
  }

  return getOrCreateDefaultEpisode(project_id);
}
