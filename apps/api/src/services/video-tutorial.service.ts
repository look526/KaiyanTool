import { prisma } from '../lib/prisma';
import crypto from 'crypto';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  video_url: string;
  thumbnail_url?: string;
  chapters: Array<{
    id: string;
    title: string;
    start_time: number;
    end_time: number;
  }>;
  tags: string[];
  prerequisites: string[];
  related_tutorials: string[];
}

interface UserProgress {
  tutorial_id: string;
  user_id: string;
  progress: number;
  completed: boolean;
  watched_duration: number;
  last_watched_at: Date;
  completed_at?: Date;
}

export class VideoTutorialService {
  async getCategories(): Promise<Array<{ id: string; name: string; count: number }>> {
    const categories = await prisma.videoTutorial.groupBy({
      by: ['category'],
      _count: { id: true }
    });

    return categories.map((c: any) => ({
      id: c.category,
      name: this.getCategoryName(c.category),
      count: c._count.id
    }));
  }

  async getTutorials(options?: {
    category?: string;
    level?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ tutorials: Tutorial[]; total: number }> {
    const { category, level, search, limit = 20, offset = 0 } = options || {};

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (level) {
      where.level = level;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } }
      ];
    }

    const [tutorials, total] = await Promise.all([
      prisma.videoTutorial.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.videoTutorial.count({ where })
    ]);

    return {
      tutorials: tutorials.map((t: any) => this.mapToTutorial(t)),
      total
    };
  }

  async getTutorial(id: string): Promise<Tutorial | null> {
    const tutorial = await prisma.videoTutorial.findUnique({
      where: { id }
    });

    if (!tutorial) {
      return null;
    }

    return this.mapToTutorial(tutorial);
  }

  async updateProgress(
    tutorial_id: string,
    user_id: string,
    progress_data: {
      progress: number;
      completed: boolean;
      watched_duration: number;
    }
  ): Promise<UserProgress> {
    const existing = await prisma.tutorialProgress.findUnique({
      where: {
        tutorial_id_user_id: { tutorial_id, user_id }
      }
    });

    if (existing) {
      return prisma.tutorialProgress.update({
        where: { id: existing.id },
        data: {
          progress: progress_data.progress,
          completed: progress_data.completed,
          watched_duration: progress_data.watched_duration,
          last_watched_at: new Date(),
          completed_at: progress_data.completed ? new Date() : existing.completed_at
        }
      }) as any;
    }

    const now = new Date();
    return prisma.tutorialProgress.create({
      data: {
        id: crypto.randomUUID(),
        tutorial_id,
        user_id,
        progress: progress_data.progress,
        completed: progress_data.completed,
        watched_duration: progress_data.watched_duration,
        last_watched_at: now,
        created_at: now,
        updated_at: now
      }
    }) as any;
  }

  async getUserProgress(user_id: string): Promise<UserProgress[]> {
    return prisma.tutorialProgress.findMany({
      where: { user_id },
      orderBy: { last_watched_at: 'desc' }
    }) as any;
  }

  async getRecommendations(user_id: string): Promise<Tutorial[]> {
    const completed_tutorials = await prisma.tutorialProgress.findMany({
      where: { user_id, completed: true },
      select: { tutorial_id: true }
    });

    const completed_ids = completed_tutorials.map((t: any) => t.tutorial_id);

    const tutorials = await prisma.videoTutorial.findMany({
      where: {
        id: { notIn: completed_ids },
        prerequisites: {
          hasSome: completed_ids
        }
      },
      take: 5
    });

    if (tutorials.length < 5) {
      const additional = await prisma.videoTutorial.findMany({
        where: {
          id: { notIn: [...completed_ids, ...tutorials.map((t: any) => t.id)] }
        },
        take: 5 - tutorials.length,
        orderBy: { views: 'desc' }
      });
      
      return [...tutorials, ...additional].map((t: any) => this.mapToTutorial(t));
    }

    return tutorials.map((t: any) => this.mapToTutorial(t));
  }

  async createTutorial(data: Partial<Tutorial>): Promise<Tutorial> {
    const now = new Date();
    const tutorial = await prisma.videoTutorial.create({
      data: {
        id: crypto.randomUUID(),
        title: data.title!,
        description: data.description!,
        category: data.category!,
        level: data.level!,
        duration: data.duration!,
        video_url: data.video_url!,
        thumbnail_url: data.thumbnail_url,
        chapters: data.chapters as any,
        tags: data.tags || [],
        prerequisites: data.prerequisites || [],
        related_tutorials: data.related_tutorials || [],
        created_at: now,
        updated_at: now
      }
    });

    return this.mapToTutorial(tutorial);
  }

  async recordView(tutorial_id: string): Promise<void> {
    await prisma.videoTutorial.update({
      where: { id: tutorial_id },
      data: { views: { increment: 1 } }
    });
  }

  async rateTutorial(
    tutorial_id: string,
    user_id: string,
    rating: number,
    comment?: string
  ): Promise<void> {
    await prisma.tutorialRating.create({
      data: {
        id: crypto.randomUUID(),
        tutorial_id,
        user_id,
        rating,
        comment
      }
    });
  }

  async getTutorialStats(tutorial_id: string): Promise<{
    total_views: number;
    average_rating: number;
    completion_rate: number;
    total_ratings: number;
  }> {
    const [tutorial, ratings] = await Promise.all([
      prisma.videoTutorial.findUnique({
        where: { id: tutorial_id },
        select: { views: true }
      }),
      prisma.tutorialRating.aggregate({
        where: { tutorial_id },
        _avg: { rating: true },
        _count: { rating: true }
      })
    ]);

    const completed_count = await prisma.tutorialProgress.count({
      where: { tutorial_id, completed: true }
    });

    const total_progress = await prisma.tutorialProgress.count({
      where: { tutorial_id }
    });

    return {
      total_views: tutorial?.views || 0,
      average_rating: ratings._avg.rating || 0,
      completion_rate: total_progress > 0 ? (completed_count / total_progress) * 100 : 0,
      total_ratings: ratings._count.rating
    };
  }

  private getCategoryName(category: string): string {
    const names: Record<string, string> = {
      'getting-started': '快速入门',
      'script-analysis': '剧本分析',
      'character-design': '角色设计',
      'scene-concept': '场景概念',
      'storyboard': '分镜设计',
      'image-generation': '图像生成',
      'video-generation': '视频生成',
      'editing': '后期编辑',
      'export': '导出发布',
      'advanced': '高级技巧',
      'workflow': '工作流程'
    };

    return names[category] || category;
  }

  private mapToTutorial(t: any): Tutorial {
    return {
      id: t.id,
      title: t.title,
      description: t.description,
      category: t.category,
      level: t.level,
      duration: t.duration,
      video_url: t.video_url,
      thumbnail_url: t.thumbnail_url,
      chapters: t.chapters || [],
      tags: t.tags || [],
      prerequisites: t.prerequisites || [],
      related_tutorials: t.related_tutorials || []
    };
  }
}

export const videoTutorialService = new VideoTutorialService();
