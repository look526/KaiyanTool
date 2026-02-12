import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { createBackup, listBackups, restoreBackup, deleteBackup } from './backup.service';

const CreateBackupSchema = z.object({
  projectId: z.string(),
  includeAssets: z.boolean().default(true),
  includeHistory: z.boolean().default(true),
  description: z.string().optional()
});

export class BackupService {
  async createBackup(userId: string, input: z.infer<typeof CreateBackupSchema>) {
    const validated = CreateBackupSchema.parse(input);

    const project = await prisma.project.findUnique({
      where: { id: validated.projectId }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    if (project.ownerId !== userId) {
      throw new Error('Only owner can create backups');
    }

    const backup = await createBackup({
      projectId: validated.projectId,
      includeAssets: validated.includeAssets,
      includeHistory: validated.includeHistory
    });

    await prisma.backup.create({
      data: {
        projectId: validated.projectId,
        backupId: backup.id,
        description: validated.description,
        size: backup.size,
        createdBy: userId
      }
    });

    return backup;
  }

  async listBackups(projectId: string, options?: { limit?: number; offset?: number }) {
    const { limit = 20, offset = 0 } = options || {};

    const [backups, total] = await Promise.all([
      prisma.backup.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          createdBy: { select: { id: true, name: true, avatar: true } }
        }
      }),
      prisma.backup.count({ where: { projectId } })
    ]);

    return { backups, total, hasMore: offset + backups.length < total };
  }

  async restoreBackup(userId: string, backupId: string) {
    const backup = await prisma.backup.findUnique({
      where: { id: backupId }
    });

    if (!backup) {
      throw new Error('Backup not found');
    }

    const project = await prisma.project.findUnique({
      where: { id: backup.projectId }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    if (project.ownerId !== userId) {
      throw new Error('Only owner can restore backups');
    }

    const result = await restoreBackup(backup.backupId);

    return result;
  }

  async deleteBackup(userId: string, backupId: string) {
    const backup = await prisma.backup.findUnique({
      where: { id: backupId }
    });

    if (!backup) {
      throw new Error('Backup not found');
    }

    const project = await prisma.project.findUnique({
      where: { id: backup.projectId }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    if (project.ownerId !== userId) {
      throw new Error('Only owner can delete backups');
    }

    await deleteBackup(backup.backupId);

    await prisma.backup.delete({
      where: { id: backupId }
    });

    return { success: true };
  }

  async getBackupDetails(backupId: string) {
    const backup = await prisma.backup.findUnique({
      where: { id: backupId },
      include: {
        createdBy: { select: { id: true, name: true, email: true, avatar: true } }
      }
    });

    if (!backup) {
      throw new Error('Backup not found');
    }

    return backup;
  }

  async scheduleAutomaticBackups(
    projectId: string,
    userId: string,
    schedule: {
      frequency: 'daily' | 'weekly' | 'monthly';
      time: string;
      includeAssets: boolean;
      retentionDays: number;
    }
  ) {
    await prisma.backupSchedule.create({
      data: {
        projectId,
        frequency: schedule.frequency,
        time: schedule.time,
        includeAssets: schedule.includeAssets,
        retentionDays: schedule.retentionDays,
        lastRun: null,
        nextRun: this.calculateNextRun(schedule),
        createdBy: userId
      }
    });

    return { success: true };
  }

  async updateBackupSchedule(
    scheduleId: string,
    schedule: Partial<{
      frequency: 'daily' | 'weekly' | 'monthly';
      time: string;
      includeAssets: boolean;
      retentionDays: number;
      enabled: boolean;
    }>
  ) {
    const data: any = {};

    if (schedule.frequency) data.frequency = schedule.frequency;
    if (schedule.time) {
      data.time = schedule.time;
      data.nextRun = this.calculateNextRun(schedule as any);
    }
    if (schedule.includeAssets !== undefined) data.includeAssets = schedule.includeAssets;
    if (schedule.retentionDays) data.retentionDays = schedule.retentionDays;
    if (schedule.enabled !== undefined) data.enabled = schedule.enabled;

    await prisma.backupSchedule.update({
      where: { id: scheduleId },
      data
    });

    return { success: true };
  }

  async getBackupSchedules(projectId: string) {
    const schedules = await prisma.backupSchedule.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    });

    return schedules;
  }

  async deleteBackupSchedule(scheduleId: string) {
    await prisma.backupSchedule.delete({
      where: { id: scheduleId }
    });

    return { success: true };
  }

  async cleanupOldBackups(projectId: string) {
    const schedules = await prisma.backupSchedule.findFirst({
      where: { projectId, enabled: true }
    });

    if (!schedules) return { cleaned: 0 };

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - schedules.retentionDays);

    const oldBackups = await prisma.backup.findMany({
      where: {
        projectId,
        createdAt: { lt: cutoffDate }
      }
    });

    for (const backup of oldBackups) {
      await deleteBackup(backup.backupId);
      await prisma.backup.delete({ where: { id: backup.id } });
    }

    return { cleaned: oldBackups.length };
  }

  private calculateNextRun(schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
  }): Date {
    const now = new Date();
    const [hours, minutes] = schedule.time.split(':').map(Number);

    const next = new Date(now);
    next.setHours(hours, minutes, 0, 0);

    switch (schedule.frequency) {
      case 'daily':
        if (next <= now) {
          next.setDate(next.getDate() + 1);
        }
        break;
      case 'weekly':
        const daysUntilMonday = (8 - next.getDay()) % 7 || 7;
        next.setDate(next.getDate() + daysUntilMonday);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        next.setDate(1);
        break;
    }

    return next;
  }
}

export const backupService = new BackupService();
