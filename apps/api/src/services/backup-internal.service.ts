import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { getOrCreateDefaultEpisode } from '../utils/episode-resolver';

export interface BackupData {
  id: string;
  projectId: string;
  timestamp: Date;
  data: any;
  size: number;
}

export async function createBackup(options: {
  projectId: string;
  includeAssets: boolean;
  includeHistory: boolean;
}): Promise<{ id: string; size: number }> {
  const project = await prisma.project.findUnique({
    where: { id: options.projectId },
    include: {
      Shot: true,
      Character: true,
      Scene: true,
      Document: true,
      ProjectMember: {
        include: {
          User: { select: { id: true, name: true, email: true } }
        }
      }
    }
  });

  if (!project) {
    throw new Error('Project not found');
  }

  const backupData: BackupData = {
    id: `backup_${Date.now()}`,
    projectId: options.projectId,
    timestamp: new Date(),
    data: {
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        settings: project.settings,
        created_at: project.created_at,
        updated_at: project.updated_at
      },
      shots: project.Shot.map((shot, idx) => ({
        id: shot.id,
        sequence: idx + 1,
        actionSummary: shot.action_summary,
        cameraMovement: shot.camera_movement,
        startPrompt: shot.start_prompt,
        endPrompt: shot.end_prompt,
        startImageUrl: shot.start_image_url,
        endImageUrl: shot.end_image_url,
        videoUrl: shot.video_url,
        duration: shot.duration,
        aspectRatio: shot.aspect_ratio,
        visualStyle: shot.visual_style,
        created_at: shot.created_at,
        updated_at: shot.updated_at
      })),
      characters: project.Character.map(char => ({
        id: char.id,
        name: char.name,
        appearance: char.appearance,
        created_at: char.created_at,
        updated_at: char.updated_at
      })),
      scenes: project.Scene.map(scene => ({
        id: scene.id,
        location: scene.location,
        time: scene.time,
        description: scene.description,
        reference_images: scene.reference_images,
        created_at: scene.created_at,
        updated_at: scene.updated_at
      })),
      documents: project.Document.map(doc => ({
        id: doc.id,
        title: doc.title,
        type: doc.type,
        content: doc.content,
        status: doc.status,
        created_at: doc.created_at,
        updated_at: doc.updated_at
      })),
      members: project.ProjectMember.map(m => ({
        userId: m.user_id,
        role: m.role
      }))
    },
    size: 0
  };

  if (options.includeHistory) {
    const history = await prisma.projectVersion.findMany({
      where: { project_id: options.projectId },
      orderBy: { version: 'desc' },
      take: 100
    });

    backupData.data.history = history.map(h => ({
      version: h.version,
      name: h.name,
      description: h.description,
      tags: h.tags,
      created_at: h.created_at
    }));
  }

  if (options.includeAssets) {
    const assets = await prisma.asset.findMany({
      where: { project_id: options.projectId }
    });

    backupData.data.assets = assets.map(a => ({
      id: a.id,
      type: a.type,
      name: typeof a.metadata === 'object' && a.metadata !== null ? (a.metadata as any).name : undefined,
      url: a.url,
      thumbnailUrl: typeof a.metadata === 'object' && a.metadata !== null ? (a.metadata as any).thumbnailUrl : undefined,
      metadata: a.metadata,
      createdAt: a.created_at
    }));
  }

  const jsonString = JSON.stringify(backupData);
  backupData.size = new Blob([jsonString]).size;

  const key = `backups/${options.projectId}/${backupData.id}.json`;
  await uploadToStorage(key, jsonString);

  return { id: backupData.id, size: backupData.size };
}

export async function listBackups(projectId: string): Promise<Array<{
  id: string;
  timestamp: Date;
  size: number;
}>> {
  const backups = await prisma.backup.findMany({
    where: { project_id: projectId },
    orderBy: { created_at: 'desc' },
    take: 50
  });

  return backups.map(b => ({
    id: b.backup_id,
    timestamp: b.created_at,
    size: Number(b.size)
  }));
}

export async function getBackup(backupId: string): Promise<BackupData | null> {
  const backup = await prisma.backup.findFirst({
    where: { backup_id: backupId }
  });

  if (!backup) return null;

  const key = `backups/${backup.project_id}/${backupId}.json`;
  const data = await downloadFromStorage(key);

  if (!data) return null;

  return JSON.parse(data);
}

export async function restoreBackup(backupId: string): Promise<{
  success: boolean;
  restoredAt: Date;
}> {
  const backup = await getBackup(backupId);

  if (!backup) {
    throw new Error('Backup not found');
  }

  const projectId = backup.projectId;
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.shot.deleteMany({ where: { project_id: projectId } });
    await tx.character.deleteMany({ where: { project_id: projectId } });
    await tx.scene.deleteMany({ where: { project_id: projectId } });
    await tx.document.deleteMany({ where: { project_id: projectId } });

    const episode = await getOrCreateDefaultEpisode(projectId);

    if (backup.data.scenes?.length) {
      await tx.scene.createMany({
        data: backup.data.scenes.map((s: any) => ({
          id: s.id || crypto.randomUUID(),
          episode_id: episode.id,
          project_id: projectId,
          location: s.location || '',
          time: s.time || '',
          description: s.description ?? s.atmosphere ?? null,
          reference_images: s.reference_images || s.referenceImages || [],
          scene_order: s.scene_order ?? 0,
          created_at: s.created_at ? new Date(s.created_at) : now,
          updated_at: s.updated_at ? new Date(s.updated_at) : now,
        })),
      });
    }

    if (backup.data.characters?.length) {
      await tx.character.createMany({
        data: backup.data.characters.map((c: any) => ({
          id: c.id || crypto.randomUUID(),
          project_id: projectId,
          name: c.name,
          age: c.age ?? null,
          gender: c.gender ?? null,
          appearance: c.appearance || '',
          reference_images: c.reference_images || [],
          created_at: c.created_at ? new Date(c.created_at) : now,
          updated_at: c.updated_at ? new Date(c.updated_at) : now,
        })),
      });
    }

    if (backup.data.shots?.length) {
      await tx.shot.createMany({
        data: backup.data.shots.map((s: any) => ({
          id: s.id || crypto.randomUUID(),
          project_id: projectId,
          episode_id: episode.id,
          scene_id: null,
          action_summary: s.actionSummary || s.action_summary || '',
          camera_movement: s.cameraMovement ?? s.camera_movement ?? null,
          start_prompt: s.startPrompt ?? s.start_prompt ?? null,
          end_prompt: s.endPrompt ?? s.end_prompt ?? null,
          start_image_url: s.startImageUrl ?? s.start_image_url ?? null,
          end_image_url: s.endImageUrl ?? s.end_image_url ?? null,
          video_url: s.videoUrl ?? s.video_url ?? null,
          duration: s.duration ?? 8,
          aspect_ratio: s.aspectRatio ?? s.aspect_ratio ?? '16:9',
          visual_style: s.visualStyle ?? s.visual_style ?? null,
          created_at: s.created_at ? new Date(s.created_at) : now,
          updated_at: s.updated_at ? new Date(s.updated_at) : now,
        })),
      });
    }

    if (backup.data.documents?.length) {
      await tx.document.createMany({
        data: backup.data.documents.map((d: any) => ({
          id: d.id || crypto.randomUUID(),
          project_id: projectId,
          title: d.title,
          type: d.type ?? 'general',
          content: d.content ?? '',
          status: d.status ?? 'draft',
          created_at: d.created_at ? new Date(d.created_at) : now,
          updated_at: d.updated_at ? new Date(d.updated_at) : now,
        })),
      });
    }

    if (backup.data.project?.settings) {
      await tx.project.update({
        where: { id: projectId },
        data: {
          settings: backup.data.project.settings
        }
      });
    }
  });

  return {
    success: true,
    restoredAt: new Date()
  };
}

export async function deleteBackup(backupId: string): Promise<void> {
  const backup = await prisma.backup.findFirst({
    where: { backup_id: backupId }
  });

  if (backup) {
    const key = `backups/${backup.project_id}/${backupId}.json`;
    await deleteFromStorage(key);
  }
}

export async function downloadBackupFile(backupId: string): Promise<{
  filename: string;
  data: string;
  contentType: string;
} | null> {
  const backup = await getBackup(backupId);

  if (!backup) return null;

  return {
    filename: `backup_${backup.projectId}_${backup.timestamp.getTime()}.json`,
    data: JSON.stringify(backup, null, 2),
    contentType: 'application/json'
  };
}

export async function importBackupFile(
  fileContent: string,
  _userId: string,
  targetProjectId?: string
): Promise<{ success: boolean; projectId: string }> {
  const backupData: BackupData = JSON.parse(fileContent);

  const projectId = targetProjectId || backupData.projectId;

  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    throw new Error('Target project not found');
  }

  await restoreBackup(backupData.id);

  return {
    success: true,
    projectId
  };
}

async function uploadToStorage(key: string, _data: string): Promise<void> {
  console.log(`Uploading backup to: ${key}`);
}

async function downloadFromStorage(key: string): Promise<string | null> {
  console.log(`Downloading backup from: ${key}`);
  return null;
}

async function deleteFromStorage(key: string): Promise<void> {
  console.log(`Deleting backup from: ${key}`);
}
