import { prisma } from '../lib/prisma';

export async function createSceneConcept(
  projectId: string,
  data: {
    name: string;
    description: string;
    prompt?: string;
  }
) {
  return prisma.sceneConcept.create({
    data: {
      projectId,
      name: data.name,
      description: data.description,
      prompt: data.prompt
    }
  });
}

export async function generateSceneConcept(
  projectId: string,
  sceneDescription: string
) {
  const { ScriptAnalysisAgent } = await import('../agents/script-analysis.agent');
  const agent = new ScriptAnalysisAgent();

  const prompt = await agent.generateVisualPrompt(sceneDescription, []);

  const concept = await prisma.sceneConcept.create({
    data: {
      projectId,
      name: 'Auto-generated',
      description: sceneDescription,
      prompt
    }
  });

  return { concept, prompt };
}

export async function getSceneConcepts(projectId: string) {
  return prisma.sceneConcept.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function checkSceneContinuity(
  sceneConceptId: string,
  assets: string[]
) {
  const concept = await prisma.sceneConcept.findUnique({
    where: { id: sceneConceptId }
  });

  if (!concept) {
    throw new Error('Scene concept not found');
  }

  const report = {
    conceptId: sceneConceptId,
    prompt: concept.prompt,
    consistency: 0,
    issues: [] as string[],
    recommendations: [] as string[]
  };

  for (const assetId of assets) {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId }
    });

    if (!asset) continue;

    if (concept.prompt && asset.prompt) {
      const similarity = calculateSimilarity(
        concept.prompt,
        asset.prompt
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
