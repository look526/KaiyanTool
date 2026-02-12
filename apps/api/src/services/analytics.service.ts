import { prisma } from '../lib/prisma';
import { startOfDay, subDays, startOfWeek, startOfMonth, format } from 'date-fns';

export class AnalyticsService {
  async getProjectAnalytics(projectId: string) {
    const now = new Date();
    const today = startOfDay(now);
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);

    const [
      totalAssets,
      totalShots,
      totalCharacters,
      totalScenes,
      todayActivity,
      weekActivity,
      monthActivity,
      assetBreakdown,
      generationStats
    ] = await Promise.all([
      prisma.asset.count({ where: { projectId } }),
      prisma.shot.count({ where: { projectId } }),
      prisma.character.count({ where: { projectId } }),
      prisma.scene.count({ where: { projectId } }),
      this.getActivityCount(projectId, today),
      this.getActivityCount(projectId, weekStart),
      this.getActivityCount(projectId, monthStart),
      this.getAssetBreakdown(projectId),
      this.getGenerationStats(projectId)
    ]);

    return {
      overview: {
        totalAssets,
        totalShots,
        totalCharacters,
        totalScenes
      },
      activity: {
        today: todayActivity,
        thisWeek: weekActivity,
        thisMonth: monthActivity
      },
      assets: assetBreakdown,
      generations: generationStats
    };
  }

  async getUserAnalytics(userId: string) {
    const now = new Date();
    const today = startOfDay(now);
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);

    const [
      projectCount,
      totalContributions,
      todayContributions,
      weekContributions,
      monthContributions,
      topProjects,
      recentActivity
    ] = await Promise.all([
      prisma.project.count({ where: { ownerId: userId } }),
      prisma.projectMember.count({ where: { userId } }),
      this.getUserContributions(userId, today),
      this.getUserContributions(userId, weekStart),
      this.getUserContributions(userId, monthStart),
      this.getTopProjectsByUser(userId, 5),
      this.getRecentUserActivity(userId, 10)
    ]);

    return {
      projects: projectCount,
      collaborations: totalContributions,
      contributions: {
        today: todayContributions,
        thisWeek: weekContributions,
        thisMonth: monthContributions
      },
      topProjects,
      recentActivity
    };
  }

  async getPlatformAnalytics() {
    const now = new Date();
    const today = startOfDay(now);
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);

    const [
      totalUsers,
      totalProjects,
      totalAssets,
      totalGenerations,
      dailyStats,
      topProjects,
      topUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.asset.count(),
      prisma.renderTask.count({ where: { status: 'completed' } }),
      this.getDailyStats(7),
      this.getTopProjects(10),
      this.getTopUsers(10)
    ]);

    return {
      totals: {
        users: totalUsers,
        projects: totalProjects,
        assets: totalAssets,
        generations: totalGenerations
      },
      recentActivity: {
        dailyStats,
        topProjects,
        topUsers
      }
    };
  }

  async trackEvent(
    userId: string,
    eventType: string,
    metadata?: Record<string, any>
  ) {
    await prisma.analyticsEvent.create({
      data: {
        userId,
        eventType,
        metadata: metadata as any,
        timestamp: new Date()
      }
    });
  }

  async getGenerationReport(projectId: string, days: number = 30) {
    const startDate = subDays(new Date(), days);
    
    const generations = await prisma.renderTask.findMany({
      where: {
        projectId,
        createdAt: { gte: startDate },
        status: { in: ['completed', 'failed'] }
      },
      orderBy: { createdAt: 'desc' }
    });

    const byDate: Record<string, { success: number; failed: number; total: number }> = {};
    
    for (let i = 0; i < days; i++) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      byDate[date] = { success: 0, failed: 0, total: 0 };
    }

    generations.forEach(gen => {
      const date = format(gen.createdAt, 'yyyy-MM-dd');
      if (byDate[date]) {
        byDate[date].total++;
        if (gen.status === 'completed') {
          byDate[date].success++;
        } else {
          byDate[date].failed++;
        }
      }
    });

    const dailyData = Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        ...data,
        successRate: data.total > 0 ? (data.success / data.total) * 100 : 0
      }));

    const summary = {
      total: generations.length,
      success: generations.filter(g => g.status === 'completed').length,
      failed: generations.filter(g => g.status === 'failed').length,
      successRate: generations.length > 0
        ? (generations.filter(g => g.status === 'completed').length / generations.length) * 100
        : 0
    };

    return {
      period: { start: startDate, end: new Date(), days },
      summary,
      dailyData
    };
  }

  async getCostReport(projectId: string, days: number = 30) {
    const startDate = subDays(new Date(), days);
    
    const tasks = await prisma.renderTask.findMany({
      where: {
        projectId,
        createdAt: { gte: startDate },
        status: 'completed'
      },
      select: {
        type: true,
        createdAt: true,
        params: true
      }
    });

    const costsByType: Record<string, { count: number; estimatedCost: number }> = {
      image: { count: 0, estimatedCost: 0 },
      video: { count: 0, estimatedCost: 0 },
      'video-interpolation': { count: 0, estimatedCost: 0 }
    };

    const costPerTask = {
      image: 0.02,
      video: 0.5,
      'video-interpolation': 0.3
    };

    tasks.forEach(task => {
      const type = task.type;
      if (costsByType[type]) {
        costsByType[type].count++;
        costsByType[type].estimatedCost += costPerTask[type] || 0;
      }
    });

    const totalCost = Object.values(costsByType).reduce((sum, c) => sum + c.estimatedCost, 0);

    return {
      period: { start: startDate, end: new Date(), days },
      byType: costsByType,
      totalEstimatedCost: totalCost,
      taskCount: tasks.length
    };
  }

  private async getActivityCount(projectId: string, since: Date): Promise<number> {
    return prisma.activity.count({
      where: {
        projectId,
        createdAt: { gte: since }
      }
    });
  }

  private async getUserContributions(userId: string, since: Date): Promise<number> {
    return prisma.activity.count({
      where: {
        userId,
        createdAt: { gte: since }
      }
    });
  }

  private async getAssetBreakdown(projectId: string) {
    const [images, videos, audio, documents] = await Promise.all([
      prisma.asset.count({ where: { projectId, type: 'image' } }),
      prisma.asset.count({ where: { projectId, type: 'video' } }),
      prisma.asset.count({ where: { projectId, type: 'audio' } }),
      prisma.asset.count({ where: { projectId, type: 'document' } })
    ]);

    return { images, videos, audio, documents };
  }

  private async getGenerationStats(projectId: string) {
    const [pending, processing, completed, failed] = await Promise.all([
      prisma.renderTask.count({ where: { projectId, status: 'pending' } }),
      prisma.renderTask.count({ where: { projectId, status: 'processing' } }),
      prisma.renderTask.count({ where: { projectId, status: 'completed' } }),
      prisma.renderTask.count({ where: { projectId, status: 'failed' } })
    ]);

    return { pending, processing, completed, failed };
  }

  private async getDailyStats(days: number) {
    const stats: Array<{ date: string; projects: number; assets: number; generations: number }> = [];

    for (let i = 0; i < days; i++) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');

      const [projects, assets, generations] = await Promise.all([
        prisma.project.count({
          where: { createdAt: { gte: startOfDay(date), lt: new Date(date.getTime() + 86400000) } }
        }),
        prisma.asset.count({
          where: { createdAt: { gte: startOfDay(date), lt: new Date(date.getTime() + 86400000) } }
        }),
        prisma.renderTask.count({
          where: {
            status: 'completed',
            completedAt: { gte: startOfDay(date), lt: new Date(date.getTime() + 86400000) }
          }
        })
      ]);

      stats.push({ date: dateStr, projects, assets, generations });
    }

    return stats.reverse();
  }

  private async getTopProjects(limit: number) {
    const projects = await prisma.project.findMany({
      take: limit,
      orderBy: {
        assets: { _count: 'desc' }
      },
      select: {
        id: true,
        name: true,
        _count: { select: { assets: true } }
      }
    });

    return projects.map(p => ({
      id: p.id,
      name: p.name,
      assetCount: p._count.assets
    }));
  }

  private async getTopProjectsByUser(userId: string, limit: number) {
    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      take: limit,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            _count: { select: { assets: true } }
          }
        }
      }
    });

    return memberships.map(m => ({
      id: m.project.id,
      name: m.project.name,
      role: m.role,
      assetCount: m.project._count.assets
    }));
  }

  private async getTopUsers(limit: number) {
    const users = await prisma.user.findMany({
      take: limit,
      orderBy: {
        projects: { _count: 'desc' }
      },
      select: {
        id: true,
        name: true,
        _count: { select: { projects: true } }
      }
    });

    return users.map(u => ({
      id: u.id,
      name: u.name,
      projectCount: u._count.projects
    }));
  }

  private async getRecentUserActivity(userId: string, limit: number) {
    const activities = await prisma.activity.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        description: true,
        projectId: true,
        createdAt: true
      }
    });

    return activities;
  }
}

export const analyticsService = new AnalyticsService();
