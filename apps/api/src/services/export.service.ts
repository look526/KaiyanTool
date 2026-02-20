import { prisma } from '../lib/prisma';
import JSZip from 'jszip';
import logger from '../lib/logger';

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
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const characters = await prisma.character.findMany({
      where: { projectId },
    });

    const scenes = await prisma.scene.findMany({
      where: { projectId },
    });

    const shots = await prisma.shot.findMany({
      where: { projectId },
      include: {
        scene: true,
        character: true,
      },
    });

    const nineGridPanels = await prisma.nineGridPanel.findMany({
      where: { shot: { projectId } },
    });

    const documents = await prisma.document.findMany({
      where: { projectId },
    });

    const members = await prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
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
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
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
        ownerId: userId,
        name: `${exportData.project.name} (Imported)`,
        description: exportData.project.description,
        type: exportData.project.type,
      },
    });

    const characterMap = new Map<string, string>();
    for (const character of exportData.characters) {
      const created = await prisma.character.create({
        data: {
          projectId: project.id,
          name: character.name,
          appearance: character.appearance,
          referenceImages: character.referenceImages || []
        },
      });
      characterMap.set(character.id, created.id);
    }

    const sceneMap = new Map<string, string>();
    for (const scene of exportData.scenes) {
      const created = await prisma.scene.create({
        data: {
          projectId: project.id,
          location: scene.location,
          time: scene.time,
          atmosphere: scene.mood || '',
          referenceImages: scene.referenceImages || []
        },
      });
      sceneMap.set(scene.id, created.id);
    }

    for (const shot of exportData.shots) {
      await prisma.shot.create({
        data: {
          projectId: project.id,
          sceneId: sceneMap.get(shot.sceneId),
          characterId: shot.characterId ? characterMap.get(shot.characterId) : null,
          chapterNumber: shot.chapterNumber,
          episodeNumber: shot.episodeNumber,
          segmentId: shot.segmentId,
          cellId: shot.cellId,
          actionSummary: shot.actionSummary,
          cameraMovement: shot.cameraMovement,
          startPrompt: shot.startPrompt,
          endPrompt: shot.endPrompt,
          startImageUrl: shot.startImageUrl,
          endImageUrl: shot.endImageUrl,
          duration: shot.duration,
          aspectRatio: shot.aspectRatio,
          visualStyle: shot.visualStyle,
          videoUrl: shot.videoUrl,
        },
      });
    }

    for (const document of exportData.documents) {
      await prisma.document.create({
        data: {
          projectId: project.id,
          title: document.title,
          content: document.content,
          type: document.type,
        },
      });
    }

    logger.info('Project imported', { userId, projectId: project.id, projectName: exportData.project.name });

    return project;
  }
}

export const exportService = new ExportService();
