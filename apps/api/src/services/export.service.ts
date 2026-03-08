import { prisma } from '../lib/prisma';
import JSZip from 'jszip';
import logger from '../lib/logger';
import crypto from 'crypto';

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
          project_id: project.id,
          location: scene.location,
          time: scene.time,
          atmosphere: scene.mood || '',
          reference_images: scene.referenceImages || [],
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      sceneMap.set(scene.id, created.id);
    }

    for (const shot of exportData.shots) {
      await prisma.shot.create({
        data: {
          id: crypto.randomUUID(),
          project_id: project.id,
          scene_id: sceneMap.get(shot.sceneId),
          character_id: shot.characterId ? characterMap.get(shot.characterId) : null,
          chapter_number: shot.chapterNumber,
          episode_number: shot.episodeNumber,
          segment_id: shot.segmentId,
          cell_id: shot.cellId,
          action_summary: shot.actionSummary,
          camera_movement: shot.cameraMovement,
          start_prompt: shot.startPrompt,
          end_prompt: shot.endPrompt,
          start_image_url: shot.startImageUrl,
          end_image_url: shot.endImageUrl,
          duration: shot.duration,
          aspect_ratio: shot.aspectRatio,
          visual_style: shot.visualStyle,
          video_url: shot.videoUrl,
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
