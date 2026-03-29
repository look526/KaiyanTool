import { prisma } from '../lib/prisma';
import JSZip from 'jszip';
import logger from '../lib/logger';
import crypto from 'crypto';
import { getOrCreateDefaultEpisode } from '../utils/episode-resolver';

interface ProjectExportData {
  project: any;
  characters: any[];
  scenes: any[];
  shots: any[];
  nineGridPanels: any[];
  documents: any[];
  members: any[];
}

class ExportService {
  async exportProject(projectId: string, userId: string): Promise<Buffer> {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { owner_id: userId },
          { ProjectMember: { some: { user_id: userId } } },
        ],
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const characters = await prisma.character.findMany({
      where: { project_id: projectId },
    });

    const scenes = await prisma.scene.findMany({
      where: { project_id: projectId },
    });

    const shots = await prisma.shot.findMany({
      where: { project_id: projectId },
      include: {
        Scene: true,
        Character: true,
      },
    });

    const nineGridPanels = await prisma.nineGridPanel.findMany({
      where: { Shot: { project_id: projectId } },
    });

    const documents = await prisma.document.findMany({
      where: { project_id: projectId },
    });

    const members = await prisma.projectMember.findMany({
      where: { project_id: projectId },
      include: {
        User: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    const exportData: ProjectExportData = {
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        type: project.type,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
      },
      characters,
      scenes,
      shots,
      nineGridPanels,
      documents,
      members,
    };

    const zip = new JSZip();
    zip.file('project.json', JSON.stringify(exportData, null, 2));
    zip.file('export-info.json', JSON.stringify({
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      projectName: project.name,
    }, null, 2));

    const buffer = await zip.generateAsync({ type: 'nodebuffer' });
    logger.info('Project exported', { userId, projectId, projectName: project.name });

    return buffer;
  }

  async importProject(buffer: Buffer, userId: string): Promise<any> {
    const zip = await JSZip.loadAsync(buffer);

    const projectJson = await zip.file('project.json')?.async('string');
    if (!projectJson) {
      throw new Error('Invalid export file: project.json not found');
    }

    const exportData: ProjectExportData = JSON.parse(projectJson);

    const project = await prisma.project.create({
      data: {
        id: crypto.randomUUID(),
        owner_id: userId,
        name: `${exportData.project.name} (Imported)`,
        description: exportData.project.description,
        type: exportData.project.type,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    const defaultEpisode = await getOrCreateDefaultEpisode(project.id);

    const characterMap = new Map<string, string>();
    for (const character of exportData.characters) {
      const created = await prisma.character.create({
        data: {
          id: crypto.randomUUID(),
          project_id: project.id,
          name: character.name,
          appearance: character.appearance,
          reference_images: character.referenceImages || [],
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      characterMap.set(character.id, created.id);
    }

    const sceneMap = new Map<string, string>();
    for (const scene of exportData.scenes) {
      const created = await prisma.scene.create({
        data: {
          id: crypto.randomUUID(),
          episode_id: defaultEpisode.id,
          project_id: project.id,
          location: scene.location,
          time: scene.time || '',
          description:
            scene.description ??
            scene.mood ??
            (scene as { atmosphere?: string }).atmosphere ??
            null,
          scene_order: scene.scene_order ?? 0,
          reference_images: scene.reference_images || scene.referenceImages || [],
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      sceneMap.set(scene.id, created.id);
    }

    for (const shot of exportData.shots) {
      const s = shot as Record<string, unknown>;
      const legacySceneId = (s.scene_id ?? s.sceneId) as string | undefined;
      const mappedSceneId = legacySceneId ? sceneMap.get(legacySceneId) : undefined;
      const charKey = (s.character_id ?? s.characterId) as string | undefined;
      await prisma.shot.create({
        data: {
          id: crypto.randomUUID(),
          project_id: project.id,
          episode_id: defaultEpisode.id,
          scene_id: mappedSceneId ?? null,
          character_id: charKey ? characterMap.get(charKey) ?? null : null,
          chapter_number: (s.chapter_number ?? s.chapterNumber) as number | null | undefined,
          episode_number: (s.episode_number ?? s.episodeNumber) as number | null | undefined,
          segment_id: (s.segment_id ?? s.segmentId) as number | null | undefined,
          cell_id: (s.cell_id ?? s.cellId) as number | null | undefined,
          action_summary: String(s.action_summary ?? s.actionSummary ?? ''),
          camera_movement: (s.camera_movement ?? s.cameraMovement) as string | null | undefined,
          start_prompt: (s.start_prompt ?? s.startPrompt) as string | null | undefined,
          end_prompt: (s.end_prompt ?? s.endPrompt) as string | null | undefined,
          start_image_url: (s.start_image_url ?? s.startImageUrl) as string | null | undefined,
          end_image_url: (s.end_image_url ?? s.endImageUrl) as string | null | undefined,
          duration: (s.duration as number | undefined) ?? 8,
          aspect_ratio: ((s.aspect_ratio ?? s.aspectRatio) as string | undefined) ?? '16:9',
          visual_style: (s.visual_style ?? s.visualStyle) as string | null | undefined,
          video_url: (s.video_url ?? s.videoUrl) as string | null | undefined,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    }

    for (const document of exportData.documents) {
      await prisma.document.create({
        data: {
          id: crypto.randomUUID(),
          project_id: project.id,
          title: document.title,
          content: document.content,
          type: document.type,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    }

    logger.info('Project imported', { userId, projectId: project.id, projectName: exportData.project.name });

    return project;
  }
}

export const exportService = new ExportService();
