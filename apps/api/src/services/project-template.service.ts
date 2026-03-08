import { prisma } from '../lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

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

    const now = new Date();
    const template = await prisma.projectTemplate.create({
      data: {
        id: crypto.randomUUID(),
        name: validated.name,
        description: validated.description,
        category: validated.category,
        config: validated.settings as any,
        is_public: validated.isPublic,
        created_by: userId,
        created_at: now,
        updated_at: now
      }
    });

    if (validated.defaultAssets?.length) {
      for (const asset of validated.defaultAssets) {
        switch (asset.type) {
          case 'character':
            await prisma.character.create({
              data: {
                id: crypto.randomUUID(),
                project_id: null,
                name: asset.name,
                appearance: JSON.stringify({
                  description: asset.description || '',
                  prompt: asset.prompt
                }),
                created_at: new Date(),
                updated_at: new Date()
              }
            });
            break;
          case 'scene':
            await prisma.scene.create({
              data: {
                id: crypto.randomUUID(),
                project_id: null,
                location: asset.name || '',
                time: '未知',
                atmosphere: asset.description || '',
                reference_images: [],
                created_at: new Date(),
                updated_at: new Date()
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
      where.is_public = isPublic;
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
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.projectTemplate.count({ where })
    ]);

    return { templates, total, hasMore: offset + templates.length < total };
  }

  async getTemplate(templateId: string) {
    const template = await prisma.projectTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      throw new Error('Template not found');
    }

    return template;
  }

  async useTemplate(templateId: string, userId: string, projectName?: string) {
    const template = await this.getTemplate(templateId);

    const now = new Date();
    const project = await prisma.project.create({
      data: {
        id: crypto.randomUUID(),
        name: projectName || `New ${template.name} Project`,
        description: `Created from template: ${template.name}`,
        settings: template.config as any,
        owner_id: userId,
        created_at: now,
        updated_at: now
      }
    });

    return project;
  }

  async updateTemplate(templateId: string, userId: string, input: Partial<z.infer<typeof CreateTemplateSchema>>) {
    const template = await prisma.projectTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      throw new Error('Template not found');
    }

    if (template.created_by !== userId) {
      throw new Error('Not authorized to update this template');
    }

    const updated = await prisma.projectTemplate.update({
      where: { id: templateId },
      data: {
        name: input.name,
        description: input.description,
        category: input.category,
        config: input.settings as any,
        updated_at: new Date()
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

    if (template.created_by !== userId) {
      throw new Error('Not authorized to delete this template');
    }

    await prisma.projectTemplate.delete({
      where: { id: templateId }
    });

    return { success: true };
  }

  async duplicateTemplate(templateId: string, userId: string, newName?: string) {
    const original = await this.getTemplate(templateId);

    const now = new Date();
    const duplicate = await prisma.projectTemplate.create({
      data: {
        id: crypto.randomUUID(),
        name: newName || `${original.name} (Copy)`,
        description: original.description,
        category: original.category,
        config: original.config,
        is_public: false,
        created_by: userId,
        created_at: now,
        updated_at: now
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
      where: { is_public: true },
      orderBy: {
        usage_count: 'desc'
      },
      take: limit
    });

    return templates;
  }
}

export const projectTemplateService = new ProjectTemplateService();
