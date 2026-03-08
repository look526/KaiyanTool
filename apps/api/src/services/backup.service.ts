import { prisma } from '../lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';
import { createBackup, restoreBackup, deleteBackup } from './backup-internal.service';

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

    if (project.owner_id !== userId) {
      throw new Error('Only owner can create backups');
    }

    const backup = await createBackup({
      projectId: validated.projectId,
      includeAssets: validated.includeAssets,
      includeHistory: validated.includeHistory
    });

    await prisma.backup.create({
      data: {
        id: crypto.randomUUID(),
        project_id: validated.projectId,
        backup_id: backup.id,
        description: validated.description,
        size: backup.size,
        created_by: userId,
        created_at: new Date()
      }
    });

    return backup;
  }

  async listBackups(projectId: string, options?: { limit?: number; offset?: number }) {
    const { limit = 20, offset = 0 } = options || {};

    const [backups, total] = await Promise.all([
      prisma.backup.findMany({
        where: { project_id: projectId },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.backup.count({ where: { project_id: projectId } })
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
      where: { id: backup.project_id }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    if (project.owner_id !== userId) {
      throw new Error('Only owner can restore backups');
    }

    const result = await restoreBackup(backup.backup_id);

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
      where: { id: backup.project_id }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    if (project.owner_id !== userId) {
      throw new Error('Only owner can delete backups');
    }

    await deleteBackup(backup.backup_id);

    await prisma.backup.delete({
      where: { id: backupId }
    });

    return { success: true };
  }

  async getBackupDetails(backupId: string) {
    const backup = await prisma.backup.findUnique({
      where: { id: backupId }
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
        id: crypto.randomUUID(),
        project_id: projectId,
        frequency: schedule.frequency,
        time: schedule.time,
        include_assets: schedule.includeAssets,
        retention_days: schedule.retentionDays,
        last_run: null,
        next_run: this.calculateNextRun(schedule),
        created_by: userId,
        created_at: new Date(),
        updated_at: new Date()
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
      data.next_run = this.calculateNextRun(schedule as any);
    }
    if (schedule.includeAssets !== undefined) data.include_assets = schedule.includeAssets;
    if (schedule.retentionDays) data.retention_days = schedule.retentionDays;
    if (schedule.enabled !== undefined) data.enabled = schedule.enabled;
    data.updated_at = new Date();

    await prisma.backupSchedule.update({
      where: { id: scheduleId },
      data
    });

    return { success: true };
  }

  async getBackupSchedules(projectId: string) {
    const schedules = await prisma.backupSchedule.findMany({
      where: { project_id: projectId },
      orderBy: { created_at: 'desc' }
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
      where: { project_id: projectId, enabled: true }
    });

    if (!schedules) return { cleaned: 0 };

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - schedules.retention_days);

    const oldBackups = await prisma.backup.findMany({
      where: {
        project_id: projectId,
        created_at: { lt: cutoffDate }
      }
    });

    for (const backup of oldBackups) {
      await deleteBackup(backup.backup_id);
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
      case 'weekly': {
        const daysUntilMonday = (8 - next.getDay()) % 7 || 7;
        next.setDate(next.getDate() + daysUntilMonday);
        break;
      }
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        next.setDate(1);
        break;
    }

    return next;
  }
}

export const backupService = new BackupService();
