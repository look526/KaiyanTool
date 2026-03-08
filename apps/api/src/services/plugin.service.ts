import { prisma } from '../lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

const RegisterPluginSchema = z.object({
  name: z.string().min(1).max(100),
  version: z.string(),
  description: z.string().optional(),
  entry_point: z.string(),
  permissions: z.array(z.string()),
  settings: z.record(z.string(), z.any()).optional()
});

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  entry_point: string;
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
  async registerPlugin(userId: string, input: z.infer<typeof RegisterPluginSchema>) {
    const validated = RegisterSchema.parse(input);

    const existing = await prisma.plugin.findFirst({
      where: {
        OR: [
          { name: validated.name },
          { entry_point: validated.entry_point }
        ]
      }
    });

    if (existing) {
      throw new Error('Plugin already registered');
    }

    const plugin = await prisma.plugin.create({
      data: {
        id: crypto.randomUUID(),
        name: validated.name,
        version: validated.version,
        description: validated.description,
        entry_point: validated.entry_point,
        permissions: validated.permissions,
        settings: validated.settings as any,
        manifest: {
          name: validated.name,
          version: validated.version,
          entry_point: validated.entry_point,
          permissions: validated.permissions
        } as any,
        created_by: userId,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date()
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
      where.created_by = options.userId;
    }

    const plugins = await prisma.plugin.findMany({
      where,
      orderBy: { created_at: 'desc' }
    });

    return plugins;
  }

  async getPlugin(plugin_id: string) {
    const plugin = await prisma.plugin.findUnique({
      where: { id: plugin_id }
    });

    if (!plugin) {
      throw new Error('Plugin not found');
    }

    return plugin;
  }

  async updatePlugin(plugin_id: string, userId: string, input: Partial<z.infer<typeof RegisterSchema>>) {
    const plugin = await prisma.plugin.findUnique({
      where: { id: plugin_id }
    });

    if (!plugin) {
      throw new Error('Plugin not found');
    }

    if (plugin.created_by !== userId) {
      throw new Error('Not authorized');
    }

    const updated = await prisma.plugin.update({
      where: { id: plugin_id },
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

  async deletePlugin(plugin_id: string, userId: string) {
    const plugin = await prisma.plugin.findUnique({
      where: { id: plugin_id }
    });

    if (!plugin) {
      throw new Error('Plugin not found');
    }

    if (plugin.created_by !== userId) {
      throw new Error('Not authorized');
    }

    await prisma.plugin.delete({
      where: { id: plugin_id }
    });

    return { success: true };
  }

  async enablePlugin(plugin_id: string) {
    const plugin = await prisma.plugin.findUnique({
      where: { id: plugin_id }
    });

    if (!plugin) {
      throw new Error('Plugin not found');
    }

    await prisma.plugin.update({
      where: { id: plugin_id },
      data: { status: 'active' }
    });

    return { success: true };
  }

  async disablePlugin(plugin_id: string) {
    const plugin = await prisma.plugin.findUnique({
      where: { id: plugin_id }
    });

    if (!plugin) {
      throw new Error('Plugin not found');
    }

    await prisma.plugin.update({
      where: { id: plugin_id },
      data: { status: 'inactive' }
    });

    return { success: true };
  }

  async installPlugin(plugin_id: string, project_id: string, userId: string) {
    const plugin = await prisma.plugin.findUnique({
      where: { id: plugin_id }
    });

    if (!plugin) {
      throw new Error('Plugin not found');
    }

    if (plugin.status !== 'active') {
      throw new Error('Plugin is not active');
    }

    const existing = await prisma.projectPlugin.findFirst({
      where: {
        plugin_id,
        project_id
      }
    });

    if (existing) {
      throw new Error('Plugin already installed');
    }

    const installation = await prisma.projectPlugin.create({
      data: {
        id: crypto.randomUUID(),
        plugin_id,
        project_id,
        installed_by: userId,
        settings: {},
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    return installation;
  }

  async uninstallPlugin(plugin_id: string, project_id: string) {
    await prisma.projectPlugin.deleteMany({
      where: {
        plugin_id: plugin_id,
        project_id: project_id
      }
    });

    return { success: true };
  }

  async getProjectPlugins(project_id: string) {
    const plugins = await prisma.projectPlugin.findMany({
      where: { project_id: project_id }
    });

    return plugins;
  }

  async configurePlugin(
    plugin_id: string,
    project_id: string,
    settings: Record<string, any>
  ) {
    await prisma.projectPlugin.updateMany({
      where: {
        plugin_id: plugin_id,
        project_id: project_id
      },
      data: { settings: settings as any }
    });

    return { success: true };
  }

  async getPluginHooks(project_id: string, event: string) {
    const projectPlugins = await prisma.projectPlugin.findMany({
      where: { project_id: project_id }
    });

    const hooks: PluginHook[] = [];

    for (const pp of projectPlugins) {
      const plugin = await prisma.plugin.findUnique({
        where: { id: pp.plugin_id }
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
    project_id: string,
    event: string,
    data: any,
    hook: PluginHook
  ) {
    const result = await this.executePluginFunction(
      hook.handler,
      { project_id, event, data }
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
        is_public: true
      },
      orderBy: { installations: 'desc' },
      take: 50
    });

    return plugins;
  }

  async publishPlugin(plugin_id: string) {
    await prisma.plugin.update({
      where: { id: plugin_id },
      data: { is_public: true }
    });

    return { success: true };
  }

  async unpublishPlugin(plugin_id: string) {
    await prisma.plugin.update({
      where: { id: plugin_id },
      data: { is_public: false }
    });

    return { success: true };
  }
}

const RegisterSchema = z.object({
  name: z.string().min(1).max(100),
  version: z.string(),
  description: z.string().optional(),
  entry_point: z.string(),
  permissions: z.array(z.string()),
  settings: z.record(z.string(), z.any()).optional()
});

export const pluginService = new PluginService();
