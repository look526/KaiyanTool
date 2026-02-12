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
      },
      settings: true
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
      shots: project.shots.map(shot => ({
        id: shot.id,
        sequence: shot.sequence,
        title: shot.title,
        description: shot.description,
        prompt: (shot as any).prompt,
        duration: shot.duration,
        status: shot.status,
        metadata: shot.metadata,
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
        name: scene.name,
        description: scene.description,
        location: scene.location,
        timeOfDay: scene.timeOfDay,
        metadata: scene.metadata,
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

  await prisma.$transaction(async (tx) => {
    await tx.shot.deleteMany({ where: { projectId } });
    await tx.character.deleteMany({ where: { projectId } });
    await tx.scene.deleteMany({ where: { projectId } });
    await tx.document.deleteMany({ where: { projectId: projectId } });
    await tx.comment.deleteMany({ where: { projectId } });

    if (backup.data.shots?.length) {
      await tx.shot.createMany({
        data: backup.data.shots.map((s: any) => ({
          projectId,
          ...s
        }))
      });
    }

    if (backup.data.characters?.length) {
      await tx.character.createMany({
        data: backup.data.characters.map((c: any) => ({
          projectId,
          ...c
        }))
      });
    }

    if (backup.data.scenes?.length) {
      await tx.scene.createMany({
        data: backup.data.scenes.map((s: any) => ({
          projectId,
          ...s
        }))
      });
    }

    if (backup.data.documents?.length) {
      await tx.document.createMany({
        data: backup.data.documents.map((d: any) => ({
          projectId,
          ...d
        }))
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
  userId: string,
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

async function uploadToStorage(key: string, data: string): Promise<void> {
  console.log(`Uploading backup to: ${key}`);
}

async function downloadFromStorage(key: string): Promise<string | null> {
  console.log(`Downloading backup from: ${key}`);
  return null;
}

async function deleteFromStorage(key: string): Promise<void> {
  console.log(`Deleting backup from: ${key}`);
}
