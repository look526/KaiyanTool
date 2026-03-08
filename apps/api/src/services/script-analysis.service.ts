import { z } from 'zod';
import { scriptAnalysisAgent } from '../agents/script-analysis.agent';
import { prisma } from '../lib/prisma';
import crypto from 'crypto';

const ScriptAnalysisSchema = z.object({
  script_content: z.string().min(100, '剧本内容至少需要100字符'),
  target_duration: z.number().optional().default(180),
  include_shots: z.boolean().optional().default(true)
});

const VisualPromptSchema = z.object({
  scene_description: z.string().min(10),
  characters: z.array(z.string()).min(1),
  scene_image_id: z.string().optional(),
  character_image_ids: z.array(z.string()).optional()
});

export async function analyzeScript(input: z.infer<typeof ScriptAnalysisSchema>) {
  const validated = ScriptAnalysisSchema.parse(input);

  const result = await scriptAnalysisAgent.analyzeScript(
    validated.script_content,
    {
      targetDuration: validated.target_duration
    }
  );

  const now = new Date();
  const analysis = await prisma.scriptAnalysis.create({
    data: {
      id: crypto.randomUUID(),
      project_id: 'default',
      content: validated.script_content,
      themes: [],
      characters: result.characters || [] as any,
      plotPoints: result.scenes || [] as any,
      created_at: now,
      updated_at: now
    }
  });

  return {
    id: analysis.id,
    ...result
  };
}

export async function generateVisualPrompt(input: z.infer<typeof VisualPromptSchema>) {
  const validated = VisualPromptSchema.parse(input);

  const visualContext = await buildContext(validated);

  const prompt = await scriptAnalysisAgent.generateVisualPrompt(
    validated.scene_description,
    validated.characters,
    visualContext
  );

  await prisma.visualPrompt.create({
    data: {
      id: crypto.randomUUID(),
      project_id: '',
      prompt,
      type: 'general',
      created_at: new Date(),
      updated_at: new Date()
    }
  });

  return { prompt };
}

export async function getAnalysisHistory(project_id: string) {
  const analyses = await prisma.scriptAnalysis.findMany({
    where: { project_id: project_id },
    orderBy: { created_at: 'desc' },
    take: 20
  });

  return analyses;
}

async function buildContext(input: z.infer<typeof VisualPromptSchema>) {
  const context: {
    sceneImage?: string;
    characterImages?: string[];
  } = {};

  if (input.scene_image_id) {
    const image = await prisma.asset.findUnique({
      where: { id: input.scene_image_id }
    });
    if (image?.url) {
      context.sceneImage = image.url;
    }
  }

  if (input.character_image_ids?.length) {
    const images = await prisma.asset.findMany({
      where: {
        id: { in: input.character_image_ids }
      }
    });
    context.characterImages = images.map(i => i.url).filter(Boolean);
  }

  return context;
}
