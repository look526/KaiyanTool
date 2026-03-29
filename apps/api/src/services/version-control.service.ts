import { prisma } from '../lib/prisma';
import crypto from 'crypto';
import { getOrCreateDefaultEpisode } from '../utils/episode-resolver';
import { z } from 'zod';

const CreateSnapshotSchema = z.object({
  project_id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional()
});

const DiffSchema = z.object({
  version_id_1: z.string(),
  version_id_2: z.string()
});

const RevertSchema = z.object({
  version_id: z.string()
});

export class VersionControlService {
  async createSnapshot(input: z.infer<typeof CreateSnapshotSchema>) {
    const validated = CreateSnapshotSchema.parse(input);

    const project = await prisma.project.findUnique({
      where: { id: validated.project_id },
      include: {
        Shot: true,
        Character: true,
        Scene: true,
        Document: true
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
      shots: project.Shot.map(shot => ({
        id: shot.id,
        episode_id: shot.episode_id,
        scene_id: shot.scene_id,
        character_id: shot.character_id,
        chapter_number: shot.chapter_number,
        episode_number: shot.episode_number,
        segment_id: shot.segment_id,
        cell_id: shot.cell_id,
        action_summary: shot.action_summary,
        camera_movement: shot.camera_movement,
        start_prompt: shot.start_prompt,
        end_prompt: shot.end_prompt,
        start_image_url: shot.start_image_url,
        end_image_url: shot.end_image_url,
        video_url: shot.video_url,
        duration: shot.duration,
        aspect_ratio: shot.aspect_ratio,
        visual_style: shot.visual_style
      })),
      characters: project.Character.map(char => ({
        id: char.id,
        name: char.name,
        age: char.age,
        gender: char.gender,
        appearance: char.appearance,
        reference_images: char.reference_images
      })),
      scenes: project.Scene.map(scene => ({
        id: scene.id,
        location: scene.location,
        time: scene.time,
        description: scene.description,
        scene_order: scene.scene_order,
        reference_images: scene.reference_images
      })),
      documents: project.Document.map(doc => ({
        id: doc.id,
        title: doc.title,
        type: doc.type,
        content: doc.content
      }))
    };

    const latestVersion = await prisma.projectVersion.findFirst({
      where: { project_id: validated.project_id },
      orderBy: { version: 'desc' }
    });

    const snapshot = await prisma.projectVersion.create({
      data: {
        id: crypto.randomUUID(),
        project_id: validated.project_id,
        version: (latestVersion?.version || 0) + 1,
        name: validated.name || `Version ${((latestVersion?.version || 0) + 1)}`,
        description: validated.description,
        tags: validated.tags || [],
        snapshot: snapshotData as any,
        created_by: 'system',
        created_at: new Date()
      }
    });

    return snapshot;
  }

  async getVersionHistory(project_id: string, options?: { limit?: number; offset?: number }) {
    const { limit = 50, offset = 0 } = options || {};

    const versions = await prisma.projectVersion.findMany({
      where: { project_id: project_id },
      orderBy: { version: 'desc' },
      take: limit,
      skip: offset
    });

    const total = await prisma.projectVersion.count({
      where: { project_id: project_id }
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
      this.getVersion(input.version_id_1),
      this.getVersion(input.version_id_2)
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
    const targetVersion = await this.getVersion(input.version_id);

    if (!targetVersion.snapshot) {
      throw new Error('Version data not found');
    }

    const data = targetVersion.snapshot as any;
    const projectId = targetVersion.project_id;

    await prisma.$transaction([
      prisma.shot.deleteMany({
        where: { project_id: projectId }
      }),

      prisma.character.deleteMany({
        where: { project_id: projectId }
      }),

      prisma.scene.deleteMany({
        where: { project_id: projectId }
      })
    ]);

    const defaultEpisode = await getOrCreateDefaultEpisode(projectId);
    const now = new Date();

    if (data.scenes?.length) {
      await prisma.scene.createMany({
        data: data.scenes.map((scene: any) => ({
          id: scene.id || crypto.randomUUID(),
          episode_id: defaultEpisode.id,
          project_id: projectId,
          location: scene.location || '',
          time: scene.time || '',
          description: scene.description ?? scene.atmosphere ?? null,
          scene_order: scene.scene_order ?? 0,
          reference_images: scene.reference_images || [],
          updated_at: now,
        })),
      });
    }

    if (data.characters?.length) {
      await prisma.character.createMany({
        data: data.characters.map((char: any) => ({
          id: char.id || crypto.randomUUID(),
          project_id: projectId,
          name: char.name,
          age: char.age ?? null,
          gender: char.gender ?? null,
          appearance: char.appearance || '',
          reference_images: char.reference_images || [],
          updated_at: now,
        }))
      });
    }

    if (data.shots?.length) {
      await prisma.shot.createMany({
        data: data.shots.map((shot: any) => ({
          id: shot.id || crypto.randomUUID(),
          project_id: projectId,
          episode_id: shot.episode_id || defaultEpisode.id,
          scene_id: shot.scene_id ?? null,
          character_id: shot.character_id ?? null,
          chapter_number: shot.chapter_number ?? null,
          episode_number: shot.episode_number ?? null,
          segment_id: shot.segment_id ?? null,
          cell_id: shot.cell_id ?? null,
          action_summary: shot.action_summary || '',
          camera_movement: shot.camera_movement ?? null,
          start_prompt: shot.start_prompt ?? null,
          end_prompt: shot.end_prompt ?? null,
          start_image_url: shot.start_image_url ?? null,
          end_image_url: shot.end_image_url ?? null,
          video_url: shot.video_url ?? null,
          duration: shot.duration ?? 8,
          aspect_ratio: shot.aspect_ratio ?? '16:9',
          visual_style: shot.visual_style ?? null,
          updated_at: now,
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
      project_id: projectId,
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
      where: { project_id: version.project_id }
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
