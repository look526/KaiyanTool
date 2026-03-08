import { prisma } from '../lib/prisma';
import crypto from 'crypto';

export async function createSceneConcept(
  project_id: string,
  data: {
    name: string;
    description: string;
    prompt?: string;
  }
) {
  const now = new Date();
  return prisma.sceneConcept.create({
    data: {
      id: crypto.randomUUID(),
      project_id,
      name: data.name,
      description: data.description,
      location: '',
      ai_prompt: data.prompt,
      created_at: now,
      updated_at: now
    }
  });
}

export async function generateSceneConcept(
  project_id: string,
  sceneDescription: string
) {
  const { ScriptAnalysisAgent } = await import('../agents/script-analysis.agent');
  const agent = new ScriptAnalysisAgent();

  const prompt = await agent.generateVisualPrompt(sceneDescription, []);

  const now = new Date();
  const concept = await prisma.sceneConcept.create({
    data: {
      id: crypto.randomUUID(),
      project_id,
      name: 'Auto-generated',
      description: sceneDescription,
      location: '',
      ai_prompt: prompt,
      created_at: now,
      updated_at: now
    }
  });

  return { concept, prompt };
}

export async function getSceneConcepts(project_id: string) {
  return prisma.sceneConcept.findMany({
    where: { project_id: project_id },
    orderBy: { created_at: 'desc' }
  });
}

export async function checkSceneContinuity(
  scene_concept_id: string,
  assets: string[]
) {
  const concept = await prisma.sceneConcept.findUnique({
    where: { id: scene_concept_id }
  });

  if (!concept) {
    throw new Error('Scene concept not found');
  }

  const report = {
    concept_id: scene_concept_id,
    prompt: concept.ai_prompt,
    consistency: 0,
    issues: [] as string[],
    recommendations: [] as string[]
  };

  for (const assetId of assets) {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId }
    });

    if (!asset) continue;

    const assetMetadata = asset.metadata as Record<string, any>;
    if (concept.ai_prompt && assetMetadata?.prompt) {
      const similarity = calculateSimilarity(
        concept.ai_prompt,
        assetMetadata.prompt
      );

      if (similarity < 0.6) {
        report.issues.push(`Asset ${assetId} has low similarity with scene concept`);
        report.recommendations.push('Consider regenerating with scene reference');
      }
    }
  }

  report.consistency = Math.max(0, 1 - report.issues.length * 0.2);

  return report;
}

function calculateSimilarity(prompt1: string, prompt2: string): number {
  const words1 = new Set(prompt1.toLowerCase().split(/\s+/));
  const words2 = new Set(prompt2.toLowerCase().split(/\s+/));

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}
