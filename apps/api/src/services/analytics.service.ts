import { prisma } from '../lib/prisma';
import { startOfDay, subDays, startOfWeek, startOfMonth, format } from 'date-fns';

export class AnalyticsService {
  async getProjectAnalytics(project_id: string) {
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
      prisma.asset.count({ where: { project_id: project_id } }),
      prisma.shot.count({ where: { project_id: project_id } }),
      prisma.character.count({ where: { project_id: project_id } }),
      prisma.scene.count({ where: { project_id: project_id } }),
      this.getActivityCount(project_id, today),
      this.getActivityCount(project_id, weekStart),
      this.getActivityCount(project_id, monthStart),
      this.getAssetBreakdown(project_id),
      this.getGenerationStats(project_id)
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
      prisma.project.findMany({ where: { owner_id: userId }, select: { id: true } }),
      prisma.projectMember.findMany({ where: { user_id: userId }, select: { project_id: true } }),
      this.getUserContributions(userId, today),
      this.getUserContributions(userId, weekStart),
      this.getUserContributions(userId, monthStart),
      this.getTopProjectsByUser(userId, 5),
      this.getRecentUserActivity(userId, 10)
    ]);

    const allProjectIds = new Set([
      ...ownedProjects.map(p => p.id),
      ...totalContributions.map(m => m.project_id)
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

  async getGenerationReport(project_id: string, days: number = 30) {
    const startDate = subDays(new Date(), days);
    
    const generations = await prisma.renderTask.findMany({
      where: {
        project_id: project_id,
        created_at: { gte: startDate },
        status: { in: ['completed', 'failed'] }
      },
      orderBy: { created_at: 'desc' }
    });

    const byDate: Record<string, { success: number; failed: number; total: number }> = {};
    
    for (let i = 0; i < days; i++) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      byDate[date] = { success: 0, failed: 0, total: 0 };
    }

    generations.forEach(gen => {
      const date = format(gen.created_at, 'yyyy-MM-dd');
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

  async getCostReport(project_id: string, days: number = 30) {
    const startDate = subDays(new Date(), days);
    
    const tasks = await prisma.renderTask.findMany({
      where: {
        project_id: project_id,
        created_at: { gte: startDate },
        status: 'completed'
      },
      select: {
        type: true,
        created_at: true,
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

  private async getActivityCount(_project_id: string, _since: Date): Promise<number> {
    return 0;
  }

  private async getUserContributions(_userId: string, _since: Date): Promise<number> {
    return 0;
  }

  private async getAssetBreakdown(project_id: string) {
    const [images, videos, audio, documents] = await Promise.all([
      prisma.asset.count({ where: { project_id: project_id, type: 'image' } }),
      prisma.asset.count({ where: { project_id: project_id, type: 'video' } }),
      prisma.asset.count({ where: { project_id: project_id, type: 'audio' } }),
      prisma.asset.count({ where: { project_id: project_id, type: 'document' } })
    ]);

    return { images, videos, audio, documents };
  }

  private async getGenerationStats(project_id: string) {
    const [pending, processing, completed, failed] = await Promise.all([
      prisma.renderTask.count({ where: { project_id: project_id, status: 'pending' } }),
      prisma.renderTask.count({ where: { project_id: project_id, status: 'processing' } }),
      prisma.renderTask.count({ where: { project_id: project_id, status: 'completed' } }),
      prisma.renderTask.count({ where: { project_id: project_id, status: 'failed' } })
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
          where: { created_at: { gte: startOfDay(date), lt: new Date(date.getTime() + 86400000) } }
        }),
        prisma.asset.count({
          where: { created_at: { gte: startOfDay(date), lt: new Date(date.getTime() + 86400000) } }
        }),
        prisma.renderTask.count({
          where: {
            status: 'completed',
            completed_at: { gte: startOfDay(date), lt: new Date(date.getTime() + 86400000) }
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
        created_at: 'desc'
      },
      select: {
        id: true,
        name: true
      }
    });

    return projects.map(p => ({
      id: p.id,
      name: p.name,
      assetCount: 0
    }));
  }

  private async getTopProjectsByUser(userId: string, limit: number) {
    const [ownedProjects, memberProjects] = await Promise.all([
      prisma.project.findMany({
        where: { owner_id: userId },
        take: limit,
        select: {
          id: true,
          name: true,
        }
      }),
      prisma.projectMember.findMany({
        where: { user_id: userId },
        take: limit,
        include: {
          Project: {
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
      id: m.Project.id,
      name: m.Project.name,
      role: m.role,
      assetCount: 0
    }));

    const allProjects = [...owned, ...member];
    const uniqueProjects = allProjects.filter((project, index, self) =>
      index === self.findIndex(p => p.id === project.id)
    );

    for (const project of uniqueProjects) {
      const assetCount = await prisma.asset.count({
        where: { project_id: project.id }
      });
      project.assetCount = assetCount;
    }

    return uniqueProjects.slice(0, limit);
  }

  private async getTopUsers(limit: number) {
    const users = await prisma.user.findMany({
      take: limit,
      orderBy: {
        ProjectMember: { _count: 'desc' }
      },
      select: {
        id: true,
        name: true,
        _count: { select: { ProjectMember: true } }
      }
    });

    return users.map(u => ({
      id: u.id,
      name: u.name,
      projectCount: u._count.ProjectMember
    }));
  }

  private async getRecentUserActivity(_userId: string, _limit: number) {
    return [];
  }
}

export const analyticsService = new AnalyticsService();
