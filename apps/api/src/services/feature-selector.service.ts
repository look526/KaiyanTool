import { Feature } from './progress-tracking.service';
import { featureListService } from './feature-list.service';
import logger from '../lib/logger';

export interface FeatureScore {
  feature: Feature;
  score: number;
  reasons: string[];
}

export interface SelectionCriteria {
  max_features?: number;
  max_complexity?: 'low' | 'medium' | 'high' | 'very_high';
  min_priority?: 'high' | 'medium' | 'low';
  include_dependencies?: boolean;
  session_time_limit?: number;
  focus_on_in_progress?: boolean;
}

export class FeatureSelectorService {
  async selectFeatures(
    projectId: string,
    availableFeatures: Feature[],
    criteria: SelectionCriteria
  ): Promise<Feature[]> {
    try {
      const maxFeatures = criteria.max_features || 3;

      let candidateFeatures = [...availableFeatures];

      if (criteria.focus_on_in_progress) {
        const inProgressFeatures = candidateFeatures.filter(
          f => f.status === 'in_progress'
        );
        
        if (inProgressFeatures.length > 0) {
          logger.info('Focusing on in-progress features', {
            count: inProgressFeatures.length,
          });
          
          return inProgressFeatures.slice(0, maxFeatures);
        }
      }

      const scoredFeatures = await this.scoreFeatures(
        projectId,
        candidateFeatures,
        criteria
      );

      scoredFeatures.sort((a, b) => b.score - a.score);

      const selectedFeatures = this.selectOptimalCombination(
        scoredFeatures,
        maxFeatures,
        criteria
      );

      logger.info('Features selected', {
        total_candidates: candidateFeatures.length,
        selected_count: selectedFeatures.length,
        selected_ids: selectedFeatures.map(f => f.id),
        scores: selectedFeatures.map(f => 
          scoredFeatures.find(s => s.feature.id === f.id)?.score || 0
        ),
      });

      return selectedFeatures;
    } catch (error) {
      logger.error('Failed to select features', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return availableFeatures.slice(0, criteria.max_features || 3);
    }
  }

  private async scoreFeatures(
    projectId: string,
    features: Feature[],
    criteria: SelectionCriteria
  ): Promise<FeatureScore[]> {
    const complexityMap = this.estimateComplexity(features);
    const dependencyGraph = this.buildDependencyGraph(features);

    const scoredFeatures: FeatureScore[] = [];

    for (const feature of features) {
      const score = await this.calculateFeatureScore(
        feature,
        complexityMap,
        dependencyGraph,
        criteria
      );

      scoredFeatures.push(score);
    }

    return scoredFeatures;
  }

  private async calculateFeatureScore(
    feature: Feature,
    complexityMap: Map<string, 'low' | 'medium' | 'high' | 'very_high'>,
    dependencyGraph: Map<string, string[]>,
    criteria: SelectionCriteria
  ): Promise<FeatureScore> {
    const reasons: string[] = [];
    let score = 0;

    const priorityScore = this.getPriorityScore(feature.priority);
    reasons.push(`Priority [${feature.priority}]: +${priorityScore}`);
    score += priorityScore;

    const complexity = complexityMap.get(feature.id) || 'medium';
    const complexityScore = this.getComplexityScore(complexity);
    reasons.push(`Complexity [${complexity}]: +${complexityScore}`);
    score += complexityScore;

    const dependencyScore = this.getDependencyScore(
      feature,
      dependencyGraph,
      criteria
    );
    reasons.push(`Dependencies: +${dependencyScore}`);
    score += dependencyScore;

    const blockedByScore = this.getBlockedByScore(feature, dependencyGraph);
    reasons.push(`Blocked by: +${blockedByScore}`);
    score += blockedByScore;

    const depthScore = this.getDepthScore(feature, dependencyGraph);
    reasons.push(`Dependency depth: +${depthScore}`);
    score += depthScore;

    const complexityLimit = criteria.max_complexity;
    if (complexityLimit) {
      const complexityOrder = {
        low: 1,
        medium: 2,
        high: 3,
        very_high: 4,
      };

      if (complexityOrder[complexity] > complexityOrder[complexityLimit]) {
        score -= 50;
        reasons.push(`Complexity limit exceeded: -50`);
      }
    }

    const minPriority = criteria.min_priority;
    if (minPriority) {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      
      if (priorityOrder[feature.priority] < priorityOrder[minPriority]) {
        score -= 30;
        reasons.push(`Priority below minimum: -30`);
      }
    }

    return {
      feature,
      score,
      reasons,
    };
  }

  private selectOptimalCombination(
    scoredFeatures: FeatureScore[],
    maxFeatures: number,
    criteria: SelectionCriteria
  ): Feature[] {
    if (scoredFeatures.length <= maxFeatures) {
      return scoredFeatures.map(s => s.feature);
    }

    const selected: Feature[] = [];
    const selectedIds = new Set<string>();

    for (const scored of scoredFeatures) {
      if (selected.length >= maxFeatures) {
        break;
      }

      const feature = scored.feature;

      if (selectedIds.has(feature.id)) {
        continue;
      }

      if (!criteria.include_dependencies && feature.dependencies) {
        const hasUnmetDependency = feature.dependencies.some(
          dep => !selectedIds.has(dep)
        );

        if (hasUnmetDependency) {
          continue;
        }
      }

      selected.push(feature);
      selectedIds.add(feature.id);
    }

    if (selected.length === 0 && scoredFeatures.length > 0) {
      return [scoredFeatures[0].feature];
    }

    return selected;
  }

  private getPriorityScore(priority: string): number {
    const scores = { high: 50, medium: 30, low: 10 };
    return scores[priority as keyof typeof scores] || 20;
  }

  private getComplexityScore(
    complexity: 'low' | 'medium' | 'high' | 'very_high'
  ): number {
    const scores = {
      low: 40,
      medium: 20,
      high: 0,
      very_high: -20,
    };
    return scores[complexity];
  }

  private getDependencyScore(
    feature: Feature,
    dependencyGraph: Map<string, string[]>,
    criteria: SelectionCriteria
  ): number {
    if (!feature.dependencies || feature.dependencies.length === 0) {
      return 30;
    }

    if (criteria.include_dependencies) {
      return 10 + feature.dependencies.length * 2;
    }

    return -10 * feature.dependencies.length;
  }

  private getBlockedByScore(
    feature: Feature,
    dependencyGraph: Map<string, string[]>
  ): number {
    const blockingFeatures = Array.from(dependencyGraph.entries())
      .filter(([_, deps]) => deps.includes(feature.id))
      .map(([id]) => id);

    if (blockingFeatures.length === 0) {
      return 20;
    }

    return -10 * blockingFeatures.length;
  }

  private getDepthScore(
    feature: Feature,
    dependencyGraph: Map<string, string[]>
  ): number {
    const depth = this.calculateDependencyDepth(feature.id, dependencyGraph);
    return Math.max(0, 20 - depth * 5);
  }

  private calculateDependencyDepth(
    featureId: string,
    dependencyGraph: Map<string, string[]>,
    visited = new Set<string>()
  ): number {
    if (visited.has(featureId)) {
      return 0;
    }

    visited.add(featureId);

    const dependencies = dependencyGraph.get(featureId) || [];
    
    if (dependencies.length === 0) {
      return 0;
    }

    const childDepths = dependencies.map(dep =>
      this.calculateDependencyDepth(dep, dependencyGraph, visited)
    );

    return 1 + Math.max(...childDepths);
  }

  private estimateComplexity(
    features: Feature[]
  ): Map<string, 'low' | 'medium' | 'high' | 'very_high'> {
    const complexityResults = featureListService.estimateComplexity(features);
    const complexityMap = new Map<
      string,
      'low' | 'medium' | 'high' | 'very_high'
    >();

    complexityResults.forEach(({ feature, complexity }) => {
      complexityMap.set(feature.id, complexity);
    });

    return complexityMap;
  }

  private buildDependencyGraph(features: Feature[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();

    features.forEach(feature => {
      graph.set(feature.id, feature.dependencies || []);
    });

    return graph;
  }

  async suggestOptimalBatchSize(
    availableFeatures: Feature[],
    sessionTimeLimit: number
  ): Promise<number> {
    const complexityMap = this.estimateComplexity(availableFeatures);

    const complexityTimeMap: Record<string, number> = {
      low: 15 * 60 * 1000,
      medium: 30 * 60 * 1000,
      high: 60 * 60 * 1000,
      very_high: 120 * 60 * 1000,
    };

    let optimalSize = 1;
    let bestUtilization = 0;

    for (let batchSize = 1; batchSize <= 5; batchSize++) {
      const batchComplexities = availableFeatures
        .slice(0, batchSize)
        .map(f => complexityMap.get(f.id) || 'medium');

      const estimatedTime = batchComplexities.reduce(
        (sum, complexity) => sum + complexityTimeMap[complexity],
        0
      );

      const utilization = Math.min(estimatedTime / sessionTimeLimit, 1);

      if (utilization > bestUtilization && utilization <= 1) {
        bestUtilization = utilization;
        optimalSize = batchSize;
      }
    }

    logger.info('Optimal batch size calculated', {
      available_features: availableFeatures.length,
      time_limit: sessionTimeLimit,
      optimal_size: optimalSize,
      utilization: (bestUtilization * 100).toFixed(1) + '%',
    });

    return optimalSize;
  }

  getFeatureRecommendations(projectId: string): {
    quick_wins: Feature[];
    high_value: Feature[];
    blockers: Feature[];
  } {
    const quickWins: Feature[] = [];
    const highValue: Feature[] = [];
    const blockers: Feature[] = [];

    return { quick_wins: quickWins, high_value, blockers };
  }
}

export const featureSelectorService = new FeatureSelectorService();
