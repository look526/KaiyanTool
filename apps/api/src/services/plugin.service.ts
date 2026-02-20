import { prisma } from '../lib/prisma';
import { z } from 'zod';

const RegisterPluginSchema = z.object({
  name: z.string().min(1).max(100),
  version: z.string(),
  description: z.string().optional(),
  entryPoint: z.string(),
  permissions: z.array(z.string()),
  settings: z.record(z.string(), z.any()).optional()
});

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  entryPoint: string;
  permissions: string[];
  settings?: Record<string, any>;
  hooks: PluginHook[];
}

export interface PluginHook {
  id: string;
  event: string;
  handler: string;
  priority?: number;
}

export class PluginService {
  private plugins: Map<string, PluginManifest> = new Map();

  async registerPlugin(userId: string, input: z.infer<typeof RegisterPluginSchema>) {
    const validated = RegisterSchema.parse(input);

    const existing = await prisma.plugin.findFirst({
      where: {
        OR: [
          { name: validated.name },
          { entryPoint: validated.entryPoint }
        ]
      }
    });

    if (existing) {
      throw new Error('Plugin already registered');
    }

    const plugin = await prisma.plugin.create({
      data: {
        name: validated.name,
        version: validated.version,
        description: validated.description,
        entryPoint: validated.entryPoint,
        permissions: validated.permissions,
        settings: validated.settings as any,
        manifest: {
          name: validated.name,
          version: validated.version,
          entryPoint: validated.entryPoint,
          permissions: validated.permissions
        } as any,
        createdBy: userId,
        status: 'pending'
      }
    });

    return plugin;
  }

  async getPlugins(options?: { status?: string; userId?: string }) {
    const where: any = {};

    if (options?.status) {
      where.status = options.status;
    }

    if (options?.userId) {
      where.createdBy = options.userId;
    }

    const plugins = await prisma.plugin.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true } }
      }
    });

    return plugins;
  }

  async getPlugin(pluginId: string) {
    const plugin = await prisma.plugin.findUnique({
      where: { id: pluginId }
    });

    if (!plugin) {
      throw new Error('Plugin not found');
    }

    return plugin;
  }

  async updatePlugin(pluginId: string, userId: string, input: Partial<z.infer<typeof RegisterSchema>>) {
    const plugin = await prisma.plugin.findUnique({
      where: { id: pluginId }
    });

    if (!plugin) {
      throw new Error('Plugin not found');
    }

    if (plugin.createdBy !== userId) {
      throw new Error('Not authorized');
    }

    const updated = await prisma.plugin.update({
      where: { id: pluginId },
      data: {
        name: input.name,
        version: input.version,
        description: input.description,
        settings: input.settings as any,
        manifest: input as any
      }
    });

    return updated;
  }

  async deletePlugin(pluginId: string, userId: string) {
    const plugin = await prisma.plugin.findUnique({
      where: { id: pluginId }
    });

    if (!plugin) {
      throw new Error('Plugin not found');
    }

    if (plugin.createdBy !== userId) {
      throw new Error('Not authorized');
    }

    await prisma.plugin.delete({
      where: { id: pluginId }
    });

    return { success: true };
  }

  async enablePlugin(pluginId: string) {
    const plugin = await prisma.plugin.findUnique({
      where: { id: pluginId }
    });

    if (!plugin) {
      throw new Error('Plugin not found');
    }

    await prisma.plugin.update({
      where: { id: pluginId },
      data: { status: 'active' }
    });

    return { success: true };
  }

  async disablePlugin(pluginId: string) {
    const plugin = await prisma.plugin.findUnique({
      where: { id: pluginId }
    });

    if (!plugin) {
      throw new Error('Plugin not found');
    }

    await prisma.plugin.update({
      where: { id: pluginId },
      data: { status: 'inactive' }
    });

    return { success: true };
  }

  async installPlugin(pluginId: string, projectId: string, userId: string) {
    const plugin = await prisma.plugin.findUnique({
      where: { id: pluginId }
    });

    if (!plugin) {
      throw new Error('Plugin not found');
    }

    if (plugin.status !== 'active') {
      throw new Error('Plugin is not active');
    }

    const existing = await prisma.projectPlugin.findFirst({
      where: {
        pluginId,
        projectId
      }
    });

    if (existing) {
      throw new Error('Plugin already installed');
    }

    const installation = await prisma.projectPlugin.create({
      data: {
        pluginId,
        projectId,
        installedBy: userId,
        settings: {}
      }
    });

    return installation;
  }

  async uninstallPlugin(pluginId: string, projectId: string) {
    await prisma.projectPlugin.deleteMany({
      where: {
        pluginId,
        projectId
      }
    });

    return { success: true };
  }

  async getProjectPlugins(projectId: string) {
    const plugins = await prisma.projectPlugin.findMany({
      where: { projectId }
    });

    return plugins;
  }

  async configurePlugin(
    pluginId: string,
    projectId: string,
    settings: Record<string, any>
  ) {
    await prisma.projectPlugin.updateMany({
      where: {
        pluginId,
        projectId
      },
      data: { settings: settings as any }
    });

    return { success: true };
  }

  async getPluginHooks(projectId: string, event: string) {
    const projectPlugins = await prisma.projectPlugin.findMany({
      where: { projectId }
    });

    const hooks: PluginHook[] = [];

    for (const pp of projectPlugins) {
      const plugin = await prisma.plugin.findUnique({
        where: { id: pp.pluginId }
      });
      if (plugin && pp.status === 'active' && plugin.manifest) {
        const manifest = plugin.manifest as any;
        if (manifest.hooks) {
          hooks.push(...manifest.hooks.filter((h: any) => h.event === event));
        }
      }
    }

    return hooks.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  async executeHook(
    projectId: string,
    event: string,
    data: any,
    hook: PluginHook
  ) {
    const result = await this.executePluginFunction(
      hook.handler,
      { projectId, event, data }
    );

    return result;
  }

  private async executePluginFunction(
    _handler: string,
    context: any
  ): Promise<any> {
    return context;
  }

  async getMarketplacePlugins() {
    const plugins = await prisma.plugin.findMany({
      where: {
        status: 'active',
        isPublic: true
      },
      orderBy: { installations: 'desc' },
      take: 50
    });

    return plugins;
  }

  async publishPlugin(pluginId: string) {
    await prisma.plugin.update({
      where: { id: pluginId },
      data: { isPublic: true }
    });

    return { success: true };
  }

  async unpublishPlugin(pluginId: string) {
    await prisma.plugin.update({
      where: { id: pluginId },
      data: { isPublic: false }
    });

    return { success: true };
  }
}

const RegisterSchema = z.object({
  name: z.string().min(1).max(100),
  version: z.string(),
  description: z.string().optional(),
  entryPoint: z.string(),
  permissions: z.array(z.string()),
  settings: z.record(z.string(), z.any()).optional()
});

export const pluginService = new PluginService();
