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
      _todayActivity,
      _weekActivity,
      _monthActivity,
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
      ownedProjects,
      totalContributions,
      todayContributions,
      weekContributions,
      monthContributions,
      topProjects,
      recentActivity
    ] = await Promise.all([
      prisma.project.findMany({ where: { ownerId: userId }, select: { id: true } }),
      prisma.projectMember.findMany({ where: { userId }, select: { projectId: true } }),
      this.getUserContributions(userId, today),
      this.getUserContributions(userId, weekStart),
      this.getUserContributions(userId, monthStart),
      this.getTopProjectsByUser(userId, 5),
      this.getRecentUserActivity(userId, 10)
    ]);

    const allProjectIds = new Set([
      ...ownedProjects.map(p => p.id),
      ...totalContributions.map(m => m.projectId)
    ]);

    return {
      projects: allProjectIds.size,
      collaborations: totalContributions.length,
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
    _userId: string,
    _eventType: string,
    _metadata?: Record<string, any>
  ) {
    throw new Error('analyticsEvent model not implemented');
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

  private async getActivityCount(_projectId: string, _since: Date): Promise<number> {
    return 0;
  }

  private async getUserContributions(_userId: string, _since: Date): Promise<number> {
    return 0;
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
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        _count: { select: { contents: true } }
      }
    });

    return projects.map(p => ({
      id: p.id,
      name: p.name,
      assetCount: p._count.contents
    }));
  }

  private async getTopProjectsByUser(userId: string, limit: number) {
    const [ownedProjects, memberProjects] = await Promise.all([
      prisma.project.findMany({
        where: { ownerId: userId },
        take: limit,
        select: {
          id: true,
          name: true,
        }
      }),
      prisma.projectMember.findMany({
        where: { userId },
        take: limit,
        include: {
          project: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      })
    ]);

    const owned = ownedProjects.map(p => ({
      id: p.id,
      name: p.name,
      role: 'owner' as const,
      assetCount: 0
    }));

    const member = memberProjects.map(m => ({
      id: m.project.id,
      name: m.project.name,
      role: m.role,
      assetCount: 0
    }));

    const allProjects = [...owned, ...member];
    const uniqueProjects = allProjects.filter((project, index, self) =>
      index === self.findIndex(p => p.id === project.id)
    );

    for (const project of uniqueProjects) {
      const assetCount = await prisma.asset.count({
        where: { projectId: project.id }
      });
      project.assetCount = assetCount;
    }

    return uniqueProjects.slice(0, limit);
  }

  private async getTopUsers(limit: number) {
    const users = await prisma.user.findMany({
      take: limit,
      orderBy: {
        members: { _count: 'desc' }
      },
      select: {
        id: true,
        name: true,
        _count: { select: { members: true } }
      }
    });

    return users.map(u => ({
      id: u.id,
      name: u.name,
      projectCount: u._count.members
    }));
  }

  private async getRecentUserActivity(_userId: string, _limit: number) {
    return [];
  }
}

export const analyticsService = new AnalyticsService();
