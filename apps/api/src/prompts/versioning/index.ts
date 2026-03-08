import { prisma } from '../../lib/prisma';
import { PromptTemplate } from '../types';
import { promptRegistry } from '../registry';

export interface PromptVersion {
  id: string;
  prompt_id: string;
  version: string;
  template: string;
  variables: any[];
  created_at: Date;
  author: string;
  changelog: string;
}

export class PromptVersionManager {
  async saveVersion(
    promptId: string,
    version: string,
    template: string,
    author: string,
    changelog: string,
    variables: any[] = []
  ): Promise<PromptVersion> {
    const promptVersion = await (prisma as any).promptVersion.create({
      data: {
        prompt_id: promptId,
        version,
        template,
        author,
        changelog,
        variables: variables as any
      }
    });

    return {
      id: promptVersion.id,
      prompt_id: promptVersion.prompt_id,
      version: promptVersion.version,
      template: promptVersion.template,
      variables: promptVersion.variables as any,
      created_at: promptVersion.created_at,
      author: promptVersion.author,
      changelog: promptVersion.changelog
    };
  }

  async getVersion(promptId: string, version: string): Promise<PromptVersion | null> {
    const promptVersion = await (prisma as any).promptVersion.findUnique({
      where: {
        prompt_id_version: {
          prompt_id: promptId,
          version
        }
      }
    });

    if (!promptVersion) {
      return null;
    }

    return {
      id: promptVersion.id,
      prompt_id: promptVersion.prompt_id,
      version: promptVersion.version,
      template: promptVersion.template,
      variables: promptVersion.variables as any,
      created_at: promptVersion.created_at,
      author: promptVersion.author,
      changelog: promptVersion.changelog
    };
  }

  async getVersions(promptId: string): Promise<PromptVersion[]> {
    const promptVersions = await (prisma as any).promptVersion.findMany({
      where: { prompt_id: promptId },
      orderBy: { created_at: 'desc' }
    });

    return promptVersions.map(pv => ({
      id: pv.id,
      prompt_id: pv.prompt_id,
      version: pv.version,
      template: pv.template,
      variables: pv.variables as any,
      created_at: pv.created_at,
      author: pv.author,
      changelog: pv.changelog
    }));
  }

  async getLatestVersion(promptId: string): Promise<PromptVersion | null> {
    const promptVersion = await (prisma as any).promptVersion.findFirst({
      where: { prompt_id: promptId },
      orderBy: { created_at: 'desc' }
    });

    if (!promptVersion) {
      return null;
    }

    return {
      id: promptVersion.id,
      prompt_id: promptVersion.prompt_id,
      version: promptVersion.version,
      template: promptVersion.template,
      variables: promptVersion.variables as any,
      created_at: promptVersion.created_at,
      author: promptVersion.author,
      changelog: promptVersion.changelog
    };
  }

  async rollback(promptId: string, toVersion: string, author: string): Promise<PromptTemplate> {
    const targetVersion = await this.getVersion(promptId, toVersion);

    if (!targetVersion) {
      throw new Error(`Version ${toVersion} not found for prompt ${promptId}`);
    }

    const currentPrompt = promptRegistry.get(promptId);
    if (!currentPrompt) {
      throw new Error(`Prompt ${promptId} not found in registry`);
    }

    const newVersion = this.incrementVersion(currentPrompt.version, 'patch');

    await this.saveVersion(
      promptId,
      newVersion,
      targetVersion.template,
      author,
      `Rollback to version ${toVersion}`,
      targetVersion.variables
    );

    const updatedPrompt: PromptTemplate = {
      ...currentPrompt,
      userPromptTemplate: targetVersion.template,
      version: newVersion,
      variables: targetVersion.variables,
      updatedAt: new Date().toISOString()
    };

    promptRegistry.register(updatedPrompt);

    return updatedPrompt;
  }

  async compareVersions(
    promptId: string,
    versionA: string,
    versionB: string
  ): Promise<{
    versionA: PromptVersion;
    versionB: PromptVersion;
    diff: string[];
  }> {
    const [vA, vB] = await Promise.all([
      this.getVersion(promptId, versionA),
      this.getVersion(promptId, versionB)
    ]);

    if (!vA || !vB) {
      throw new Error('One or both versions not found');
    }

    const diff = this.computeDiff(vA.template, vB.template);

    return {
      versionA: vA,
      versionB: vB,
      diff
    };
  }

  private computeDiff(templateA: string, templateB: string): string[] {
    const linesA = templateA.split('\n');
    const linesB = templateB.split('\n');
    const diff: string[] = [];

    const maxLength = Math.max(linesA.length, linesB.length);

    for (let i = 0; i < maxLength; i++) {
      const lineA = linesA[i] || '';
      const lineB = linesB[i] || '';

      if (lineA !== lineB) {
        if (lineA === '') {
          diff.push(`+ ${lineB}`);
        } else if (lineB === '') {
          diff.push(`- ${lineA}`);
        } else {
          diff.push(`- ${lineA}`);
          diff.push(`+ ${lineB}`);
        }
      }
    }

    return diff;
  }

  private incrementVersion(version: string, type: 'major' | 'minor' | 'patch'): string {
    const parts = version.split('.').map(Number);
    
    if (parts.length !== 3 || parts.some(isNaN)) {
      return '1.0.0';
    }

    switch (type) {
      case 'major':
        return `${parts[0] + 1}.0.0`;
      case 'minor':
        return `${parts[0]}.${parts[1] + 1}.0`;
      case 'patch':
        return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
      default:
        return version;
    }
  }

  async createAutoVersion(
    promptId: string,
    changes: 'major' | 'minor' | 'patch',
    author: string,
    changelog: string
  ): Promise<PromptVersion> {
    const currentPrompt = promptRegistry.get(promptId);
    if (!currentPrompt) {
      throw new Error(`Prompt ${promptId} not found`);
    }

    const newVersion = this.incrementVersion(currentPrompt.version, changes);

    return await this.saveVersion(
      promptId,
      newVersion,
      currentPrompt.userPromptTemplate || '',
      author,
      changelog,
      currentPrompt.variables
    );
  }
}

export const promptVersionManager = new PromptVersionManager();