import { prisma } from '../lib/prisma';

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
      shots: true,
      characters: true,
      scenes: true,
      documents: true,
      members: {
        include: {
          user: { select: { id: true, name: true, email: true } }
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
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      },
      shots: project.shots.map((shot, idx) => ({
        id: shot.id,
        sequence: idx + 1,
        actionSummary: shot.actionSummary,
        cameraMovement: shot.cameraMovement,
        startPrompt: shot.startPrompt,
        endPrompt: shot.endPrompt,
        startImageUrl: shot.startImageUrl,
        endImageUrl: shot.endImageUrl,
        videoUrl: shot.videoUrl,
        duration: shot.duration,
        aspectRatio: shot.aspectRatio,
        visualStyle: shot.visualStyle,
        createdAt: shot.createdAt,
        updatedAt: shot.updatedAt
      })),
      characters: project.characters.map(char => ({
        id: char.id,
        name: char.name,
        description: char.description,
        appearance: char.appearance,
        metadata: char.metadata,
        createdAt: char.createdAt,
        updatedAt: char.updatedAt
      })),
      scenes: project.scenes.map(scene => ({
        id: scene.id,
        location: scene.location,
        time: scene.time,
        atmosphere: scene.atmosphere,
        referenceImages: scene.referenceImages,
        createdAt: scene.createdAt,
        updatedAt: scene.updatedAt
      })),
      documents: project.documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        type: doc.type,
        content: doc.content,
        status: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
      })),
      members: project.members.map(m => ({
        userId: m.userId,
        role: m.role
      }))
    },
    size: 0
  };

  if (options.includeHistory) {
    const history = await prisma.projectVersion.findMany({
      where: { projectId: options.projectId },
      orderBy: { version: 'desc' },
      take: 100
    });

    backupData.data.history = history.map(h => ({
      version: h.version,
      name: h.name,
      description: h.description,
      tags: h.tags,
      createdAt: h.createdAt
    }));
  }

  if (options.includeAssets) {
    const assets = await prisma.asset.findMany({
      where: { projectId: options.projectId }
    });

    backupData.data.assets = assets.map(a => ({
      id: a.id,
      type: a.type,
      name: a.name,
      url: a.url,
      thumbnailUrl: a.thumbnailUrl,
      metadata: a.metadata,
      createdAt: a.createdAt
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
    where: { projectId },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  return backups.map(b => ({
    id: b.backupId,
    timestamp: b.createdAt,
    size: b.size
  }));
}

export async function getBackup(backupId: string): Promise<BackupData | null> {
  const backup = await prisma.backup.findFirst({
    where: { backupId }
  });

  if (!backup) return null;

  const key = `backups/${backup.projectId}/${backupId}.json`;
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

  await prisma.$transaction(async () => {
    await prisma.shot.deleteMany({ where: { projectId } });
    await prisma.character.deleteMany({ where: { projectId } });
    await prisma.scene.deleteMany({ where: { projectId } });
    await prisma.document.deleteMany({ where: { projectId } });

    if (backup.data.shots?.length) {
      await prisma.shot.createMany({
        data: backup.data.shots.map((s: any) => ({
          projectId,
          actionSummary: s.actionSummary,
          cameraMovement: s.cameraMovement,
          startPrompt: s.startPrompt,
          endPrompt: s.endPrompt,
          startImageUrl: s.startImageUrl,
          endImageUrl: s.endImageUrl,
          duration: s.duration,
          aspectRatio: s.aspectRatio,
          visualStyle: s.visualStyle
        }))
      });
    }

    if (backup.data.characters?.length) {
      await prisma.character.createMany({
        data: backup.data.characters.map((c: any) => ({
          projectId,
          name: c.name,
          description: c.description,
          appearance: c.appearance,
          metadata: c.metadata
        }))
      });
    }

    if (backup.data.scenes?.length) {
      await prisma.scene.createMany({
        data: backup.data.scenes.map((s: any) => ({
          projectId,
          location: s.location,
          time: s.time,
          atmosphere: s.atmosphere,
          referenceImages: s.referenceImages
        }))
      });
    }

    if (backup.data.documents?.length) {
      await prisma.document.createMany({
        data: backup.data.documents.map((d: any) => ({
          projectId,
          title: d.title,
          type: d.type,
          content: d.content,
          status: d.status
        }))
      });
    }

    if (backup.data.project?.settings) {
      await prisma.project.update({
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
    where: { backupId }
  });

  if (backup) {
    const key = `backups/${backup.projectId}/${backupId}.json`;
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
