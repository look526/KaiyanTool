import { prisma } from '../lib/prisma';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  videoUrl: string;
  thumbnailUrl?: string;
  chapters: Array<{
    id: string;
    title: string;
    startTime: number;
    endTime: number;
  }>;
  tags: string[];
  prerequisites: string[];
  relatedTutorials: string[];
}

interface UserProgress {
  tutorialId: string;
  userId: string;
  progress: number;
  completed: boolean;
  watchedDuration: number;
  lastWatchedAt: Date;
  completedAt?: Date;
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
        orderBy: { createdAt: 'desc' },
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
    tutorialId: string,
    userId: string,
    progressData: {
      progress: number;
      completed: boolean;
      watchedDuration: number;
    }
  ): Promise<UserProgress> {
    const existing = await prisma.tutorialProgress.findUnique({
      where: {
        tutorialId_userId: { tutorialId, userId }
      }
    });

    if (existing) {
      return prisma.tutorialProgress.update({
        where: { id: existing.id },
        data: {
          progress: progressData.progress,
          completed: progressData.completed,
          watchedDuration: progressData.watchedDuration,
          lastWatchedAt: new Date(),
          completedAt: progressData.completed ? new Date() : existing.completedAt
        }
      }) as any;
    }

    return prisma.tutorialProgress.create({
      data: {
        tutorialId,
        userId,
        progress: progressData.progress,
        completed: progressData.completed,
        watchedDuration: progressData.watchedDuration,
        lastWatchedAt: new Date()
      }
    }) as any;
  }

  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return prisma.tutorialProgress.findMany({
      where: { userId },
      orderBy: { lastWatchedAt: 'desc' }
    }) as any;
  }

  async getRecommendations(userId: string): Promise<Tutorial[]> {
    const completedTutorials = await prisma.tutorialProgress.findMany({
      where: { userId, completed: true },
      select: { tutorialId: true }
    });

    const completedIds = completedTutorials.map((t: any) => t.tutorialId);

    const tutorials = await prisma.videoTutorial.findMany({
      where: {
        id: { notIn: completedIds },
        prerequisites: {
          hasSome: completedIds
        }
      },
      take: 5
    });

    if (tutorials.length < 5) {
      const additional = await prisma.videoTutorial.findMany({
        where: {
          id: { notIn: [...completedIds, ...tutorials.map((t: any) => t.id)] }
        },
        take: 5 - tutorials.length,
        orderBy: { views: 'desc' }
      });
      
      return [...tutorials, ...additional].map((t: any) => this.mapToTutorial(t));
    }

    return tutorials.map((t: any) => this.mapToTutorial(t));
  }

  async createTutorial(data: Partial<Tutorial>): Promise<Tutorial> {
    const tutorial = await prisma.videoTutorial.create({
      data: {
        title: data.title!,
        description: data.description!,
        category: data.category!,
        level: data.level!,
        duration: data.duration!,
        videoUrl: data.videoUrl!,
        thumbnailUrl: data.thumbnailUrl,
        chapters: data.chapters as any,
        tags: data.tags || [],
        prerequisites: data.prerequisites || [],
        relatedTutorials: data.relatedTutorials || []
      }
    });

    return this.mapToTutorial(tutorial);
  }

  async recordView(tutorialId: string): Promise<void> {
    await prisma.videoTutorial.update({
      where: { id: tutorialId },
      data: { views: { increment: 1 } }
    });
  }

  async rateTutorial(
    tutorialId: string,
    userId: string,
    rating: number,
    comment?: string
  ): Promise<void> {
    await prisma.tutorialRating.create({
      data: {
        tutorialId,
        userId,
        rating,
        comment
      }
    });
  }

  async getTutorialStats(tutorialId: string): Promise<{
    totalViews: number;
    averageRating: number;
    completionRate: number;
    totalRatings: number;
  }> {
    const [tutorial, ratings] = await Promise.all([
      prisma.videoTutorial.findUnique({
        where: { id: tutorialId },
        select: { views: true }
      }),
      prisma.tutorialRating.aggregate({
        where: { tutorialId },
        _avg: { rating: true },
        _count: { rating: true }
      })
    ]);

    const completedCount = await prisma.tutorialProgress.count({
      where: { tutorialId, completed: true }
    });

    const totalProgress = await prisma.tutorialProgress.count({
      where: { tutorialId }
    });

    return {
      totalViews: tutorial?.views || 0,
      averageRating: ratings._avg.rating || 0,
      completionRate: totalProgress > 0 ? (completedCount / totalProgress) * 100 : 0,
      totalRatings: ratings._count.rating
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
      videoUrl: t.videoUrl,
      thumbnailUrl: t.thumbnailUrl,
      chapters: t.chapters || [],
      tags: t.tags || [],
      prerequisites: t.prerequisites || [],
      relatedTutorials: t.relatedTutorials || []
    };
  }
}

export const videoTutorialService = new VideoTutorialService();
