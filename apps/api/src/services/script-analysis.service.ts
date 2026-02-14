import { z } from 'zod';
import { scriptAnalysisAgent } from '../agents/script-analysis.agent';
import { prisma } from '../lib/prisma';

const ScriptAnalysisSchema = z.object({
  scriptContent: z.string().min(100, '剧本内容至少需要100字符'),
  targetDuration: z.number().optional().default(180),
  includeShots: z.boolean().optional().default(true)
});

const VisualPromptSchema = z.object({
  sceneDescription: z.string().min(10),
  characters: z.array(z.string()).min(1),
  sceneImageId: z.string().optional(),
  characterImageIds: z.array(z.string()).optional()
});

export async function analyzeScript(input: z.infer<typeof ScriptAnalysisSchema>) {
  const validated = ScriptAnalysisSchema.parse(input);

  const result = await scriptAnalysisAgent.analyzeScript(
    validated.scriptContent,
    {
      targetDuration: validated.targetDuration,
      includeShots: validated.includeShots
    }
  );

  const analysis = await prisma.scriptAnalysis.create({
    data: {
      projectId: 'default',
      content: validated.scriptContent,
      themes: [],
      characters: result.characters || [] as any,
      plotPoints: result.scenes || [] as any
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
    validated.sceneDescription,
    validated.characters,
    visualContext
  );

  await prisma.visualPrompt.create({
    data: {
      projectId: '',
      prompt,
      type: 'general'
    }
  });

  return { prompt };
}

export async function getAnalysisHistory(projectId: string) {
  const analyses = await prisma.scriptAnalysis.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  return analyses;
}

async function buildContext(input: z.infer<typeof VisualPromptSchema>) {
  const context: {
    sceneImage?: string;
    characterImages?: string[];
  } = {};

  if (input.sceneImageId) {
    const image = await prisma.asset.findUnique({
      where: { id: input.sceneImageId }
    });
    if (image?.url) {
      context.sceneImage = image.url;
    }
  }

  if (input.characterImageIds?.length) {
    const images = await prisma.asset.findMany({
      where: {
        id: { in: input.characterImageIds }
      }
    });
    context.characterImages = images.map(i => i.url).filter(Boolean);
  }

  return context;
}
