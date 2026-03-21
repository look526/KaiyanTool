import { providerManager } from './ai/provider.manager';
import { Feature } from './progress-tracking.service';
import logger from '../lib/logger';

export interface GenerateFeaturesOptions {
  taskDescription: string;
  projectContext?: string;
  constraints?: string[];
  technologies?: string[];
  existingFeatures?: string[];
  providerId: string;
}

export class FeatureListService {
  async generateFeatureList(options: GenerateFeaturesOptions): Promise<Feature[]> {
    try {
      const prompt = this.buildFeatureGenerationPrompt(options);
        
      const provider = providerManager.getProvider(options.providerId);
      if (!provider) {
        throw new Error(`Provider not found: ${options.providerId}`);
      }

      const response = await provider.chat([
        { role: 'system', content: 'You are an expert software architect and product manager who excels at breaking down complex tasks into granular, testable features.' },
        { role: 'user', content: prompt },
      ]);

      const features = this.parseFeaturesFromResponse(response.content);
      
      logger.info('Feature list generated', {
        features_count: features.length,
        task_description: options.taskDescription,
      });

      return features;
    } catch (error) {
      logger.error('Failed to generate feature list', {
        task_description: options.taskDescription,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async refineFeatureList(
    features: Feature[],
    feedback: string,
    providerId: string
  ): Promise<Feature[]> {
    try {
      const prompt = this.buildFeatureRefinementPrompt(features, feedback);
      
      const provider = providerManager.getProvider(options.providerId);
      if (!provider) {
        throw new Error(`Provider not found: ${options.providerId}`);
      }

      const response = await provider.chat([
        { role: 'system', content: 'You are an expert software architect who refines feature lists based on feedback.' },
        { role: 'user', content: prompt },
      ]);

      const refinedFeatures = this.parseFeaturesFromResponse(response.content);
      
      logger.info('Feature list refined', {
        original_count: features.length,
        refined_count: refinedFeatures.length,
      });

      return refinedFeatures;
    } catch (error) {
      logger.error('Failed to refine feature list', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async prioritizeFeatures(
    features: Feature[],
    priorities: Record<string, 'high' | 'medium' | 'low'>,
    providerId: string
  ): Promise<Feature[]> {
    const updatedFeatures = features.map(feature => ({
      ...feature,
      priority: priorities[feature.id] || feature.priority,
    }));

    logger.info('Features prioritized', {
      features_count: updatedFeatures.length,
    });

    return updatedFeatures;
  }

  async validateFeatures(
    features: Feature[],
    projectContext: string,
    providerId: string
  ): Promise<{ valid: Feature[]; issues: Array<{ feature: Feature; issue: string }> }> {
    try {
      const prompt = this.buildFeatureValidationPrompt(features, projectContext);
      
      const provider = providerManager.getProvider(options.providerId);
      if (!provider) {
        throw new Error(`Provider not found: ${options.providerId}`);
      }

      const response = await provider.chat([
        { role: 'system', content: 'You are an expert code reviewer who validates feature completeness and correctness.' },
        { role: 'user', content: prompt },
      ]);

      const validation = this.parseValidationResponse(response.content, features);
      
      logger.info('Features validated', {
        valid_count: validation.valid.length,
        issues_count: validation.issues.length,
      });

      return validation;
    } catch (error) {
      logger.error('Failed to validate features', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  estimateComplexity(features: Feature[]): Array<{ feature: Feature; complexity: 'low' | 'medium' | 'high' | 'very_high' }> {
    return features.map(feature => {
      const complexity = this.analyzeComplexity(feature.description);
      return { feature, complexity };
    });
  }

  groupFeaturesByCategory(features: Feature[]): Record<string, Feature[]> {
    const groups: Record<string, Feature[]> = {};

    features.forEach(feature => {
      const category = this.categorizeFeature(feature.description);
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(feature);
    });

    return groups;
  }

  private buildFeatureGenerationPrompt(options: GenerateFeaturesOptions): string {
    let prompt = `I need you to break down the following task into a comprehensive list of granular, testable features.

Task Description:
${options.taskDescription}

`;

    if (options.projectContext) {
      prompt += `Project Context:
${options.projectContext}

`;
    }

    if (options.technologies && options.technologies.length > 0) {
      prompt += `Technologies/Stack:
${options.technologies.join(', ')}

`;
    }

    if (options.constraints && options.constraints.length > 0) {
      prompt += `Constraints:
${options.constraints.map(c => `- ${c}`).join('\n')}

`;
    }

    if (options.existingFeatures && options.existingFeatures.length > 0) {
      prompt += `Existing Features (already implemented):
${options.existingFeatures.map(f => `- ${f}`).join('\n')}

`;
    }

    prompt += `Requirements:
1. Generate at least 20-30 granular features
2. Each feature should be specific, measurable, and testable
3. Features should follow the pattern: "A user can [action] and see [result]"
4. Include UI features, backend features, API endpoints, database changes, etc.
5. Consider edge cases and error handling
6. Think about accessibility, performance, and security
7. Features should be independent as much as possible

Output Format:
Return a JSON array with this exact structure:
[
  {
    "id": "feature_1",
    "description": "A user can perform X action and see Y result",
    "priority": "high",
    "dependencies": ["feature_2"]
  }
]

Priorities: Use "high" for critical path features, "medium" for important but not blocking features, "low" for nice-to-have features.
Dependencies: Only include if a feature strictly cannot be implemented without another feature being completed first.

Please generate the feature list now:`;

    return prompt;
  }

  private buildFeatureRefinementPrompt(features: Feature[], feedback: string): string {
    return `I have the following feature list:

${JSON.stringify(features, null, 2)}

Feedback on the current feature list:
${feedback}

Please refine the feature list based on this feedback. You can:
- Add missing features
- Remove redundant features
- Combine or split features
- Adjust priorities
- Update descriptions for clarity

Return the refined feature list in the same JSON format:`;
  }

  private buildFeatureValidationPrompt(features: Feature[], projectContext: string): string {
    return `Please review the following feature list for completeness and correctness:

Project Context:
${projectContext}

Features:
${features.map(f => `- ${f.id}: ${f.description}`).join('\n')}

For each feature, check:
1. Is the description clear and specific?
2. Is the feature testable?
3. Is the priority appropriate?
4. Are the dependencies correct?
5. Is the feature scope appropriate (not too broad, not too narrow)?

Return a JSON response with this structure:
{
  "valid": ["feature_1", "feature_2"],
  "issues": [
    {
      "feature_id": "feature_3",
      "issue": "Description is too vague - needs more specificity"
    }
  ]
}`;
  }

  private parseFeaturesFromResponse(content: string): Feature[] {
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const features = JSON.parse(jsonMatch[0]);
      
      return features.map((f: any, index: number) => ({
        id: f.id || `feature_${index + 1}`,
        description: f.description || '',
        status: 'failing' as const,
        priority: f.priority || 'medium',
        dependencies: f.dependencies || [],
      }));
    } catch (error) {
      logger.error('Failed to parse features from response', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error('Failed to parse features from AI response');
    }
  }

  private parseValidationResponse(content: string, features: Feature[]): { valid: Feature[]; issues: Array<{ feature: Feature; issue: string }> } {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in response');
      }

      const validation = JSON.parse(jsonMatch[0]);
      const validFeatureIds = new Set(validation.valid || []);
      
      const validFeatures = features.filter(f => validFeatureIds.has(f.id));
      const issues = (validation.issues || []).map((issue: any) => ({
        feature: features.find(f => f.id === issue.feature_id) || features[0],
        issue: issue.issue || 'Unknown issue',
      }));

      return { valid: validFeatures, issues };
    } catch (error) {
      logger.error('Failed to parse validation from response', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return { valid: features, issues: [] };
    }
  }

  private analyzeComplexity(description: string): 'low' | 'medium' | 'high' | 'very_high' {
    const lowComplexityKeywords = ['display', 'show', 'render', 'view'];
    const highComplexityKeywords = ['integrate', 'implement', 'optimize', 'refactor', 'architecture'];
    const veryHighComplexityKeywords = ['migrate', 'rebuild', 'rewrite', 'system', 'infrastructure'];

    const lowerDesc = description.toLowerCase();

    if (veryHighComplexityKeywords.some(k => lowerDesc.includes(k))) {
      return 'very_high';
    }
    if (highComplexityKeywords.some(k => lowerDesc.includes(k))) {
      return 'high';
    }
    if (lowComplexityKeywords.some(k => lowerDesc.includes(k))) {
      return 'low';
    }
    return 'medium';
  }

  private categorizeFeature(description: string): string {
    const lowerDesc = description.toLowerCase();

    if (lowerDesc.includes('api') || lowerDesc.includes('endpoint') || lowerDesc.includes('backend')) {
      return 'Backend/API';
    }
    if (lowerDesc.includes('ui') || lowerDesc.includes('interface') || lowerDesc.includes('component')) {
      return 'UI/UX';
    }
    if (lowerDesc.includes('database') || lowerDesc.includes('data') || lowerDesc.includes('storage')) {
      return 'Database';
    }
    if (lowerDesc.includes('auth') || lowerDesc.includes('security') || lowerDesc.includes('permission')) {
      return 'Security';
    }
    if (lowerDesc.includes('test') || lowerDesc.includes('validation') || lowerDesc.includes('quality')) {
      return 'Quality Assurance';
    }
    if (lowerDesc.includes('performance') || lowerDesc.includes('optimization') || lowerDesc.includes('cache')) {
      return 'Performance';
    }

    return 'General';
  }
}

export const featureListService = new FeatureListService();
