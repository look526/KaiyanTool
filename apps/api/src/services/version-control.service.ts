import { prisma } from '../lib/prisma';
import { z } from 'zod';

const CreateSnapshotSchema = z.object({
  projectId: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional()
});

const DiffSchema = z.object({
  versionId1: z.string(),
  versionId2: z.string()
});

const RevertSchema = z.object({
  versionId: z.string()
});

export class VersionControlService {
  async createSnapshot(input: z.infer<typeof CreateSnapshotSchema>) {
    const validated = CreateSnapshotSchema.parse(input);

    const project = await prisma.project.findUnique({
      where: { id: validated.projectId },
      include: {
        shots: true,
        characters: true,
        scenes: true,
        documents: true
      }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const snapshotData = {
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        settings: project.settings as Record<string, any>
      },
      shots: project.shots.map(shot => ({
        id: shot.id,
        sequence: shot.sequence,
        title: shot.title,
        description: shot.description,
        prompt: (shot as any).prompt,
        duration: shot.duration,
        status: shot.status,
        metadata: shot.metadata as Record<string, any>
      })),
      characters: project.characters.map(char => ({
        id: char.id,
        name: char.name,
        description: char.description,
        appearance: char.appearance,
        metadata: char.metadata as Record<string, any>
      })),
      scenes: project.scenes.map(scene => ({
        id: scene.id,
        name: scene.name,
        description: scene.description,
        location: scene.location,
        timeOfDay: scene.timeOfDay,
        metadata: scene.metadata as Record<string, any>
      })),
      documents: project.documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        type: doc.type,
        content: doc.content
      }))
    };

    const latestVersion = await prisma.projectVersion.findFirst({
      where: { projectId: validated.projectId },
      orderBy: { version: 'desc' }
    });

    const snapshot = await prisma.projectVersion.create({
      data: {
        projectId: validated.projectId,
        version: (latestVersion?.version || 0) + 1,
        name: validated.name || `Version ${((latestVersion?.version || 0) + 1)}`,
        description: validated.description,
        tags: validated.tags || [],
        snapshot: snapshotData as any,
        createdBy: validated.projectId
      }
    });

    return snapshot;
  }

  async getVersionHistory(projectId: string, options?: { limit?: number; offset?: number }) {
    const { limit = 50, offset = 0 } = options || {};

    const versions = await prisma.projectVersion.findMany({
      where: { projectId },
      orderBy: { version: 'desc' },
      take: limit,
      skip: offset
    });

    const total = await prisma.projectVersion.count({
      where: { projectId }
    });

    return { versions, total, hasMore: offset + versions.length < total };
  }

  async getVersion(versionId: string) {
    const version = await prisma.projectVersion.findUnique({
      where: { id: versionId }
    });

    if (!version) {
      throw new Error('Version not found');
    }

    return version;
  }

  async compareVersions(input: z.infer<typeof DiffSchema>) {
    const [version1, version2] = await Promise.all([
      this.getVersion(input.versionId1),
      this.getVersion(input.versionId2)
    ]);

    const data1 = version1.snapshot as any;
    const data2 = version2.snapshot as any;

    const differences = {
      shots: this.diffArrays(data1.shots, data2.shots, 'id'),
      characters: this.diffArrays(data1.characters, data2.characters, 'id'),
      scenes: this.diffArrays(data1.scenes, data2.scenes, 'id'),
      assets: this.diffArrays(data1.assets, data2.assets, 'id'),
      projectSettings: this.diffObjects(data1.project, data2.project)
    };

    return {
      version1: { id: version1.id, name: version1.name, version: version1.version },
      version2: { id: version2.id, name: version2.name, version: version2.version },
      differences,
      summary: this.generateDiffSummary(differences)
    };
  }

  async revertToVersion(input: z.infer<typeof RevertSchema>) {
    const targetVersion = await this.getVersion(input.versionId);

    if (!targetVersion.snapshot) {
      throw new Error('Version data not found');
    }

    const data = targetVersion.snapshot as any;
    const projectId = targetVersion.projectId;

    await prisma.$transaction([
      prisma.shot.deleteMany({
        where: { projectId }
      }),

      prisma.character.deleteMany({
        where: { projectId }
      }),

      prisma.scene.deleteMany({
        where: { projectId }
      })
    ]);

    if (data.shots?.length) {
      await prisma.shot.createMany({
        data: data.shots.map((shot: any) => ({
          projectId,
          sequence: shot.sequence,
          title: shot.title,
          description: shot.description,
          prompt: shot.prompt,
          duration: shot.duration,
          status: shot.status,
          metadata: shot.metadata
        }))
      });
    }

    if (data.characters?.length) {
      await prisma.character.createMany({
        data: data.characters.map((char: any) => ({
          projectId,
          name: char.name,
          description: char.description,
          appearance: char.appearance,
          metadata: char.metadata
        }))
      });
    }

    if (data.scenes?.length) {
      await prisma.scene.createMany({
        data: data.scenes.map((scene: any) => ({
          projectId,
          name: scene.name,
          description: scene.description,
          location: scene.location,
          timeOfDay: scene.timeOfDay,
          metadata: scene.metadata
        }))
      });
    }

    if (data.project?.settings) {
      await prisma.project.update({
        where: { id: projectId },
        data: {
          settings: data.project.settings
        }
      });
    }

    await this.createSnapshot({
      projectId,
      name: `Revert to v${targetVersion.version}`,
      description: `Reverted from current version to v${targetVersion.version}`
    });

    return { success: true, revertedToVersion: targetVersion.version };
  }

  async deleteVersion(versionId: string) {
    const version = await prisma.projectVersion.findUnique({
      where: { id: versionId }
    });

    if (!version) {
      throw new Error('Version not found');
    }

    const versionCount = await prisma.projectVersion.count({
      where: { projectId: version.projectId }
    });

    if (versionCount <= 1) {
      throw new Error('Cannot delete the only version');
    }

    await prisma.projectVersion.delete({
      where: { id: versionId }
    });

    return { success: true };
  }

  async addTag(versionId: string, tag: string) {
    const version = await prisma.projectVersion.findUnique({
      where: { id: versionId }
    });

    if (!version) {
      throw new Error('Version not found');
    }

    const tags = [...new Set([...(version.tags || []), tag])];

    await prisma.projectVersion.update({
      where: { id: versionId },
      data: { tags }
    });

    return { success: true, tags };
  }

  async removeTag(versionId: string, tag: string) {
    const version = await prisma.projectVersion.findUnique({
      where: { id: versionId }
    });

    if (!version) {
      throw new Error('Version not found');
    }

    const tags = (version.tags || []).filter(t => t !== tag);

    await prisma.projectVersion.update({
      where: { id: versionId },
      data: { tags }
    });

    return { success: true, tags };
  }

  private generateHash(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  private diffArrays(arr1: any[], arr2: any[], key: string) {
    const map1 = new Map(arr1.map(item => [item[key], item]));
    const map2 = new Map(arr2.map(item => [item[key], item]));

    const added = arr2.filter(item => !map1.has(item[key]));
    const removed = arr1.filter(item => !map2.has(item[key]));
    const modified = arr2.filter(item => {
      const original = map1.get(item[key]);
      return original && JSON.stringify(original) !== JSON.stringify(item);
    });

    return { added, removed, modified, addedCount: added.length, removedCount: removed.length, modifiedCount: modified.length };
  }

  private diffObjects(obj1: any, obj2: any) {
    const keys1 = new Set(Object.keys(obj1 || {}));
    const keys2 = new Set(Object.keys(obj2 || {}));

    const added = [...keys2].filter(k => !keys1.has(k));
    const removed = [...keys1].filter(k => !keys2.has(k));
    const modified = [...keys1].filter(k => keys2.has(k) && obj1[k] !== obj2[k]);

    return { added, removed, modified };
  }

  private generateDiffSummary(differences: any) {
    const totalChanges = 
      differences.shots.addedCount + differences.shots.removedCount + differences.shots.modifiedCount +
      differences.characters.addedCount + differences.characters.removedCount + differences.characters.modifiedCount +
      differences.scenes.addedCount + differences.scenes.removedCount + differences.scenes.modifiedCount +
      differences.assets.addedCount + differences.assets.removedCount + differences.assets.modifiedCount +
      differences.projectSettings.added.length + differences.projectSettings.removed.length + differences.projectSettings.modified.length;

    return {
      totalChanges,
      majorChanges: differences.shots.modifiedCount + differences.characters.modifiedCount,
      minorChanges: differences.assets.modifiedCount
    };
  }
}

export const versionControlService = new VersionControlService();
