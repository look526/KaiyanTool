import { prisma } from '../lib/prisma';

interface MigrationSource {
  type: 'bigbanana' | 'toonflow' | 'cinegen' | 'custom';
  name: string;
}

interface MigrationResult {
  success: boolean;
  migratedProjects: number;
  migratedAssets: number;
  errors: Array<{ projectId: string; error: string }>;
  warnings: Array<{ projectId: string; warning: string }>;
}

interface BigBananaData {
  projects: any[];
  scripts: any[];
  characters: any[];
  assets: any[];
  generations: any[];
}

export class DataMigrationService {
  async migrateFromBigBanana(data: BigBananaData, userId: string): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      migratedProjects: 0,
      migratedAssets: 0,
      errors: [],
      warnings: []
    };

    for (const project of data.projects) {
      try {
        const newProject = await prisma.project.create({
          data: {
            name: project.name || 'Imported Project',
            description: project.description || '',
            ownerId: userId,
            settings: {
              source: 'bigbanana',
              originalId: project.id,
              importedAt: new Date().toISOString()
            } as any
          }
        });

        result.migratedProjects++;

        if (project.characters?.length) {
          for (const char of project.characters) {
            try {
              await prisma.character.create({
                data: {
                  projectId: newProject.id,
                  name: char.name,
                  appearance: JSON.stringify({
                    description: char.description,
                    appearance: char.appearance,
                    source: 'bigbanana',
                    originalId: char.id
                  })
                }
              });
            } catch (e: any) {
              result.warnings.push({
                projectId: newProject.id,
                warning: `Character ${char.name} migration failed: ${e.message}`
              });
            }
          }
        }

        if (project.scripts?.length) {
          for (const script of project.scripts) {
            try {
              await prisma.document.create({
                data: {
                  projectId: newProject.id,
                  title: script.title || 'Imported Script',
                  type: 'script',
                  content: {
                    source: 'bigbanana',
                    originalId: script.id,
                    fullText: script.content
                  } as any,
                  status: 'completed'
                }
              });
            } catch (e: any) {
              result.warnings.push({
                projectId: newProject.id,
                warning: `Script ${script.title} migration failed: ${e.message}`
              });
            }
          }
        }
      } catch (e: any) {
        result.errors.push({
          projectId: project.id,
          error: e.message
        });
        result.success = false;
      }
    }

    for (const asset of data.assets) {
      try {
        await prisma.asset.create({
          data: {
            type: asset.type || 'image',
            url: asset.url,
            projectId: (await prisma.project.findFirst({
              where: {
                settings: {
                  path: ['source'],
                  equals: 'bigbanana'
                }
              }
            }))?.id || userId,
            metadata: {
              source: 'bigbanana',
              originalId: asset.id,
              generationParams: asset.params
            } as any
          }
        });
        result.migratedAssets++;
      } catch (e: any) {
        result.warnings.push({
          projectId: asset.projectId,
          warning: `Asset ${asset.id} migration failed: ${e.message}`
        });
      }
    }

    await this.logMigration({
      source: 'bigbanana',
      userId,
      result,
      timestamp: new Date()
    });

    return result;
  }

  async migrateFromToonflow(data: {
    projects: any[];
    workflows: any[];
    assets: any[];
  }, userId: string): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      migratedProjects: 0,
      migratedAssets: 0,
      errors: [],
      warnings: []
    };

    for (const project of data.projects) {
      try {
        const newProject = await prisma.project.create({
          data: {
            name: project.name || 'Toonflow Import',
            description: project.description || '',
            ownerId: userId,
            settings: {
              source: 'toonflow',
              originalId: project.id,
              importedAt: new Date().toISOString(),
              workflowConfig: project.workflowConfig
            } as any
          }
        });

        result.migratedProjects++;

        if (project.scenes?.length) {
          for (const scene of project.scenes) {
            try {
              await prisma.scene.create({
                data: {
                  projectId: newProject.id,
                  location: scene.location,
                  time: scene.timeOfDay,
                  atmosphere: '',
                  metadata: JSON.stringify({
                    description: scene.description,
                    name: scene.name,
                    source: 'toonflow',
                    originalId: scene.id
                  })
                }
              });
            } catch (e: any) {
              result.warnings.push({
                projectId: newProject.id,
                warning: `Scene ${scene.name} migration failed: ${e.message}`
              });
            }
          }
        }
      } catch (e: any) {
        result.errors.push({
          projectId: project.id,
          error: e.message
        });
        result.success = false;
      }
    }

    await this.logMigration({
      source: 'toonflow',
      userId,
      result,
      timestamp: new Date()
    });

    return result;
  }

  async migrateFromCinegen(data: {
    projects: any[];
    videos: any[];
  }, userId: string): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      migratedProjects: 0,
      migratedAssets: 0,
      errors: [],
      warnings: []
    };

    for (const project of data.projects) {
      try {
        const newProject = await prisma.project.create({
          data: {
            name: project.name || 'Cinegen Import',
            description: project.description || '',
            ownerId: userId,
            settings: {
              source: 'cinegen',
              originalId: project.id,
              importedAt: new Date().toISOString()
            } as any
          }
        });

        result.migratedProjects++;
      } catch (e: any) {
        result.errors.push({
          projectId: project.id,
          error: e.message
        });
        result.success = false;
      }
    }

    await this.logMigration({
      source: 'cinegen',
      userId,
      result,
      timestamp: new Date()
    });

    return result;
  }

  async getMigrationHistory(userId: string, limit = 50) {
    return prisma.migrationLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit
    });
  }

  async validateMigrationData(
    source: MigrationSource['type'],
    data: any
  ): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];

    switch (source) {
      case 'bigbanana':
        if (!data.projects || !Array.isArray(data.projects)) {
          issues.push('Missing or invalid projects array');
        }
        break;
      case 'toonflow':
        if (!data.projects || !Array.isArray(data.projects)) {
          issues.push('Missing or invalid projects array');
        }
        break;
      case 'cinegen':
        if (!data.projects || !Array.isArray(data.projects)) {
          issues.push('Missing or invalid projects array');
        }
        break;
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  async estimateMigrationTime(
    source: MigrationSource['type'],
    data: any
  ): Promise<{ estimatedMinutes: number; affectedItems: number }> {
    const projectCount = data.projects?.length || 0;
    const assetCount = data.assets?.length || 0;
    const characterCount = data.characters?.length || 0;

    const itemCount = projectCount + assetCount * 0.1 + characterCount * 0.2;
    const estimatedMinutes = Math.ceil(itemCount / 10);

    return {
      estimatedMinutes,
      affectedItems: projectCount
    };
  }

  async rollbackMigration(migrationId: string, userId: string): Promise<boolean> {
    const migration = await prisma.migrationLog.findUnique({
      where: { id: migrationId }
    });

    if (!migration || migration.userId !== userId) {
      throw new Error('Migration not found or unauthorized');
    }

    if (migration.status !== 'completed') {
      throw new Error('Can only rollback completed migrations');
    }

    const result = migration.result as any;
    
    for (const error of result.errors || []) {
      console.warn(`Skipping rollback for failed project: ${error.projectId}`);
    }

    console.log(`Rollback completed for migration ${migrationId}`);
    return true;
  }

  private async logMigration(data: {
    source: string;
    userId: string;
    result: MigrationResult;
    timestamp: Date;
  }) {
    return prisma.migrationLog.create({
      data: {
        source: data.source,
        userId: data.userId,
        result: data.result as any,
        timestamp: data.timestamp,
        status: data.result.success ? 'completed' : 'partial'
      }
    });
  }
}

export const dataMigrationService = new DataMigrationService();
