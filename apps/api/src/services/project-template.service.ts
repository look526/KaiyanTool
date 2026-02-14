import { prisma } from '../lib/prisma';
import { z } from 'zod';

const CreateTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string(),
  settings: z.record(z.string(), z.any()),
  defaultAssets: z.array(z.object({
    type: z.enum(['character', 'scene', 'shot_template']),
    name: z.string(),
    description: z.string().optional(),
    prompt: z.string().optional()
  })).optional(),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).optional()
});

export class ProjectTemplateService {
  async createTemplate(userId: string, input: z.infer<typeof CreateTemplateSchema>) {
    const validated = CreateTemplateSchema.parse(input);

    const template = await prisma.projectTemplate.create({
      data: {
        name: validated.name,
        description: validated.description,
        category: validated.category,
        config: validated.settings as any,
        isPublic: validated.isPublic,
        createdBy: userId
      }
    });

    if (validated.defaultAssets?.length) {
      for (const asset of validated.defaultAssets) {
        switch (asset.type) {
          case 'character':
            await prisma.character.create({
              data: {
                projectId: '',
                name: asset.name,
                appearance: JSON.stringify({
                  description: asset.description || '',
                  prompt: asset.prompt
                })
              }
            });
            break;
          case 'scene':
            await prisma.scene.create({
              data: {
                projectId: '',
                description: asset.description || '',
                metadata: JSON.stringify({
                  name: asset.name
                })
              }
            });
            break;
        }
      }
    }

    return template;
  }

  async getTemplates(options?: {
    category?: string;
    isPublic?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const { category, isPublic = true, search, limit = 20, offset = 0 } = options || {};

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (isPublic !== undefined) {
      where.isPublic = isPublic;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } }
      ];
    }

    const [templates, total] = await Promise.all([
      prisma.projectTemplate.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          createdBy: {
            select: { id: true, name: true, avatar: true }
          },
          _count: {
            select: { usedBy: true }
          }
        }
      }),
      prisma.projectTemplate.count({ where })
    ]);

    return { templates, total, hasMore: offset + templates.length < total };
  }

  async getTemplate(templateId: string) {
    const template = await prisma.projectTemplate.findUnique({
      where: { id: templateId },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      }
    });

    if (!template) {
      throw new Error('Template not found');
    }

    return template;
  }

  async useTemplate(templateId: string, userId: string, projectName?: string) {
    const template = await this.getTemplate(templateId);

    const project = await prisma.project.create({
      data: {
        name: projectName || `New ${template.name} Project`,
        description: `Created from template: ${template.name}`,
        settings: template.settings as any,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'owner'
          }
        }
      }
    });

    if (template.defaultAssets?.length) {
      for (const asset of template.defaultAssets) {
        switch (asset.type) {
          case 'character':
            await prisma.character.create({
              data: {
                projectId: project.id,
                name: asset.name,
                appearance: JSON.stringify({
                  description: asset.description || '',
                  prompt: asset.prompt
                })
              }
            });
            break;
          case 'scene':
            await prisma.scene.create({
              data: {
                projectId: project.id,
                description: asset.description || '',
                metadata: JSON.stringify({
                  name: asset.name
                })
              }
            });
            break;
        }
      }
    }

    return project;
  }

  async updateTemplate(templateId: string, userId: string, input: Partial<z.infer<typeof CreateTemplateSchema>>) {
    const template = await prisma.projectTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      throw new Error('Template not found');
    }

    if (template.createdBy !== userId) {
      throw new Error('Not authorized to update this template');
    }

    const updated = await prisma.projectTemplate.update({
      where: { id: templateId },
      data: {
        name: input.name,
        description: input.description,
        category: input.category,
        config: input.settings as any
      }
    });

    return updated;
  }

  async deleteTemplate(templateId: string, userId: string) {
    const template = await prisma.projectTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      throw new Error('Template not found');
    }

    if (template.createdBy !== userId) {
      throw new Error('Not authorized to delete this template');
    }

    await prisma.projectTemplate.delete({
      where: { id: templateId }
    });

    return { success: true };
  }

  async duplicateTemplate(templateId: string, userId: string, newName?: string) {
    const original = await this.getTemplate(templateId);

    const duplicate = await prisma.projectTemplate.create({
      data: {
        name: newName || `${original.name} (Copy)`,
        description: original.description,
        category: original.category,
        config: original.settings as any,
        defaultAssets: original.defaultAssets as any,
        isPublic: false,
        tags: original.tags || [],
        createdBy: userId
      }
    });

    return duplicate;
  }

  async getCategories() {
    const categories = await prisma.projectTemplate.groupBy({
      by: ['category'],
      _count: { id: true }
    });

    return categories.map(c => ({
      name: c.category,
      count: c._count.id
    }));
  }

  async getPopularTemplates(limit = 10) {
    const templates = await prisma.projectTemplate.findMany({
      where: { isPublic: true },
      include: {
        _count: { select: { usedBy: true } },
        createdBy: { select: { id: true, name: true, avatar: true } }
      },
      orderBy: {
        usedBy: { _count: 'desc' }
      },
      take: limit
    });

    return templates;
  }
}

export const projectTemplateService = new ProjectTemplateService();
