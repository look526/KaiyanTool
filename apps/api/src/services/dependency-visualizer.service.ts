import { Feature } from './progress-tracking.service';
import logger from '../lib/logger';

export interface DependencyNode {
  id: string;
  description: string;
  status: 'failing' | 'passing' | 'in_progress';
  priority: 'high' | 'medium' | 'low';
  dependencies: string[];
  level: number;
  depends_on: string[];
  blocks: string[];
}

export interface DependencyEdge {
  from: string;
  to: string;
  status: 'blocked' | 'active' | 'completed';
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  levels: Map<number, string[]>;
  critical_path: string[];
  circular_dependencies: string[][];
}

export interface VisualizationOptions {
  include_completed?: boolean;
  max_depth?: number;
  focus_on?: string[];
  group_by_status?: boolean;
  group_by_priority?: boolean;
}

export class DependencyVisualizerService {
  generateDependencyGraph(
    features: Feature[],
    options: VisualizationOptions = {}
  ): DependencyGraph {
    try {
      const nodes = this.buildNodes(features, options);
      const edges = this.buildEdges(features, nodes);
      const levels = this.calculateLevels(nodes);
      const criticalPath = this.findCriticalPath(nodes, edges);
      const circularDependencies = this.detectCircularDependencies(nodes, edges);

      const graph: DependencyGraph = {
        nodes,
        edges,
        levels,
        critical_path: criticalPath,
        circular_dependencies: circularDependencies,
      };

      logger.info('Dependency graph generated', {
        node_count: nodes.length,
        edge_count: edges.length,
        levels_count: levels.size,
        critical_path_length: criticalPath.length,
        circular_deps: circularDependencies.length,
      });

      return graph;
    } catch (error) {
      logger.error('Failed to generate dependency graph', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  generateMermaidDiagram(graph: DependencyGraph): string {
    const lines: string[] = [];
    
    lines.push('graph TD');
    lines.push('  subgraph Features');

    for (const node of graph.nodes) {
      const statusEmoji = this.getStatusEmoji(node.status);
      const priorityEmoji = this.getPriorityEmoji(node.priority);
      const label = `${statusEmoji} ${priorityEmoji} ${node.description.substring(0, 50)}${node.description.length > 50 ? '...' : ''}`;
      
      lines.push(`    ${node.id}["${label}"]`);
    }

    lines.push('');

    for (const edge of graph.edges) {
      const edgeStyle = this.getEdgeStyle(edge);
      lines.push(`    ${edge.from} ${edgeStyle} ${edge.to}`);
    }

    lines.push('  end');

    if (graph.levels.size > 0) {
      lines.push('');
      lines.push('  subgraph Levels');
      
      const sortedLevels = Array.from(graph.levels.entries())
        .sort(([a], [b]) => a - b);

      for (const [level, featureIds] of sortedLevels) {
        lines.push(`    L${level}["Level ${level}"]`);
        featureIds.forEach(id => {
          lines.push(`    ${id} -.-> L${level}`);
        });
      }
      
      lines.push('  end');
    }

    return lines.join('\n');
  }

  generatePlantUMLDiagram(graph: DependencyGraph): string {
    const lines: string[] = [];
    
    lines.push('@startuml');
    lines.push('skinparam monochrome true');
    lines.push('skinparam activityBackgroundColor #FEFECE');
    lines.push('skinparam activityBorderColor #9A916B');
    lines.push('');

    for (const node of graph.nodes) {
      const nodeType = this.getNodeType(node);
      const label = `${node.description.substring(0, 60)}${node.description.length > 60 ? '...' : ''}`;
      
      lines.push(`object "${node.id}" as ${nodeType} {`);
      lines.push(`  Status: ${node.status}`);
      lines.push(`  Priority: ${node.priority}`);
      lines.push(`  Level: ${node.level}`);
      lines.push(`  Description: ${label}`);
      lines.push('}');
      lines.push('');
    }

    for (const edge of graph.edges) {
      const arrowStyle = edge.status === 'completed' ? '#line:bold' : '#line:plain';
      lines.push(`"${edge.from}" ${arrowStyle}--> "${edge.to}"`);
    }

    lines.push('@enduml');

    return lines.join('\n');
  }

  generateDOTFormat(graph: DependencyGraph): string {
    const lines: string[] = [];
    
    lines.push('digraph DependencyGraph {');
    lines.push('  rankdir=LR;');
    lines.push('  node [shape=box, style=rounded];');
    lines.push('');

    for (const node of graph.nodes) {
      const nodeColor = this.getNodeColor(node);
      const label = node.description.substring(0, 50);
      
      lines.push(`  "${node.id}" [label="${label}", fillcolor="${nodeColor}", fontsize=10];`);
    }

    lines.push('');

    for (const edge of graph.edges) {
      const edgeColor = edge.status === 'completed' ? '#green' : 
                        edge.status === 'blocked' ? '#red' : '#black';
      const edgeStyle = edge.status === 'completed' ? 'bold' : 'solid';
      
      lines.push(`  "${edge.from}" -> "${edge.to}" [color="${edgeColor}", style=${edgeStyle}];`);
    }

    if (graph.critical_path.length > 0) {
      lines.push('');
      lines.push('  subgraph cluster_critical_path {');
      lines.push('    label="Critical Path";');
      lines.push('    color=blue;');
      lines.push('    style=dashed;');
      
      for (let i = 0; i < graph.critical_path.length - 1; i++) {
        const from = graph.critical_path[i];
        const to = graph.critical_path[i + 1];
        lines.push(`    "${from}" -> "${to}" [color=blue, penwidth=2];`);
      }
      
      lines.push('  }');
    }

    lines.push('}');

    return lines.join('\n');
  }

  generateLevelReport(graph: DependencyGraph): string {
    const lines: string[] = [];
    
    lines.push('='.repeat(80));
    lines.push('FEATURE DEPENDENCY LEVELS');
    lines.push('='.repeat(80));
    lines.push('');

    const sortedLevels = Array.from(graph.levels.entries())
      .sort(([a], [b]) => a - b);

    for (const [level, featureIds] of sortedLevels) {
      lines.push(`Level ${level} (${featureIds.length} features):`);
      lines.push('-'.repeat(80));
      
      const levelNodes = featureIds
        .map(id => graph.nodes.find(n => n.id === id))
        .filter(n => n !== undefined);

      const groupedByStatus = {
        failing: levelNodes.filter(n => n.status === 'failing'),
        in_progress: levelNodes.filter(n => n.status === 'in_progress'),
        passing: levelNodes.filter(n => n.status === 'passing'),
      };

      lines.push(`  ❌ Not Started (${groupedByStatus.failing.length}):`);
      groupedByStatus.failing.forEach(node => {
        lines.push(`     [${node.priority.toUpperCase()}] ${node.description}`);
      });

      lines.push('');
      lines.push(`  🔄 In Progress (${groupedByStatus.in_progress.length}):`);
      groupedByStatus.in_progress.forEach(node => {
        lines.push(`     [${node.priority.toUpperCase()}] ${node.description}`);
      });

      lines.push('');
      lines.push(`  ✅ Completed (${groupedByStatus.passing.length}):`);
      groupedByStatus.passing.forEach(node => {
        lines.push(`     [${node.priority.toUpperCase()}] ${node.description}`);
      });

      lines.push('');
      lines.push('');
    }

    if (graph.critical_path.length > 0) {
      lines.push('='.repeat(80));
      lines.push('CRITICAL PATH');
      lines.push('='.repeat(80));
      lines.push('');
      
      graph.critical_path.forEach((featureId, index) => {
        const node = graph.nodes.find(n => n.id === featureId);
        if (node) {
          lines.push(`${index + 1}. [${node.priority.toUpperCase()}] ${node.description}`);
          if (node.level !== undefined) {
            lines.push(`    Level: ${node.level}`);
          }
          lines.push('');
        }
      });
    }

    if (graph.circular_dependencies.length > 0) {
      lines.push('='.repeat(80));
      lines.push('⚠️  CIRCULAR DEPENDENCIES DETECTED');
      lines.push('='.repeat(80));
      lines.push('');
      
      graph.circular_dependencies.forEach((cycle, index) => {
        lines.push(`Cycle ${index + 1}: ${cycle.join(' → ')}`);
        lines.push('');
      });
    }

    lines.push('='.repeat(80));

    return lines.join('\n');
  }

  generateDependencyMatrix(features: Feature[]): string[][] {
    const sortedFeatures = [...features].sort((a, b) => 
      a.id.localeCompare(b.id)
    );

    const matrix: string[][] = [];
    const header = ['Feature', 'Status', 'Priority', 'Dependencies', 'Blocks'];
    matrix.push(header);

    for (const feature of sortedFeatures) {
      const deps = feature.dependencies?.join(', ') || 'None';
      const blockedBy = this.findBlockedBy(feature.id, sortedFeatures).join(', ') || 'None';
      
      matrix.push([
        feature.id,
        feature.status,
        feature.priority,
        deps,
        blockedBy,
      ]);
    }

    return matrix;
  }

  getExecutionPlan(
    features: Feature[],
    maxParallel: number = 3
  ): {
    parallel_batches: string[][];
    total_duration_estimate: number;
    recommended_batch_size: number;
  } {
    const graph = this.generateDependencyGraph(features);
    const batches: string[][] = [];
    const usedFeatures = new Set<string>();

    for (const [level, featureIds] of graph.levels.entries()) {
      const availableFeatures = featureIds.filter(id => !usedFeatures.has(id));
      
      if (availableFeatures.length > 0) {
        const batchSize = Math.min(maxParallel, availableFeatures.length);
        const batch = availableFeatures.slice(0, batchSize);
        
        batches.push(batch);
        batch.forEach(id => usedFeatures.add(id));
      }
    }

    const avgComplexity = this.calculateAverageComplexity(features);
    const avgDuration = this.estimateDurationFromComplexity(avgComplexity);
    const totalDuration = batches.length * avgDuration;

    return {
      parallel_batches: batches,
      total_duration_estimate: totalDuration,
      recommended_batch_size: Math.min(maxParallel, Math.ceil(features.length / batches.length)),
    };
  }

  getBlockedFeatures(featureId: string, features: Feature[]): Feature[] {
    return features.filter(f => 
      f.dependencies?.includes(featureId) && f.status === 'failing'
    );
  }

  getBlockingFeatures(featureId: string, features: Feature[]): Feature[] {
    const feature = features.find(f => f.id === featureId);
    if (!feature || !feature.dependencies) {
      return [];
    }

    return feature.dependencies
      .map(depId => features.find(f => f.id === depId))
      .filter(f => f !== undefined) as Feature[];
  }

  private buildNodes(features: Feature[], options: VisualizationOptions): DependencyNode[] {
    const nodes: DependencyNode[] = [];

    for (const feature of features) {
      if (options.include_completed === false && feature.status === 'passing') {
        continue;
      }

      if (options.focus_on && options.focus_on.length > 0) {
        if (!options.focus_on.includes(feature.id)) {
          continue;
        }
      }

      nodes.push({
        id: feature.id,
        description: feature.description,
        status: feature.status,
        priority: feature.priority,
        dependencies: feature.dependencies || [],
        level: 0,
        depends_on: feature.dependencies || [],
        blocks: [],
      });
    }

    return nodes;
  }

  private buildEdges(features: Feature[], nodes: DependencyNode[]): DependencyEdge[] {
    const edges: DependencyEdge[] = [];
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    for (const node of nodes) {
      for (const depId of node.dependencies) {
        const depNode = nodeMap.get(depId);
        
        if (depNode) {
          const status: DependencyEdge['status'] = 
            depNode.status === 'passing' ? 'completed' :
            node.status === 'passing' ? 'completed' :
            node.status === 'in_progress' ? 'active' : 'blocked';

          edges.push({
            from: depId,
            to: node.id,
            status,
          });

          node.depends_on.push(depId);
          depNode.blocks.push(node.id);
        }
      }
    }

    return edges;
  }

  private calculateLevels(nodes: DependencyNode[]): Map<number, string[]> {
    const levels = new Map<number, string[]>();
    const visited = new Set<string>();

    const calculateNodeLevel = (nodeId: string, currentLevel: number = 0): number => {
      if (visited.has(nodeId)) {
        return 0;
      }

      visited.add(nodeId);

      const node = nodes.find(n => n.id === nodeId);
      if (!node) {
        return currentLevel;
      }

      let maxDepLevel = currentLevel;

      for (const depId of node.depends_on) {
        const depLevel = calculateNodeLevel(depId, currentLevel + 1);
        maxDepLevel = Math.max(maxDepLevel, depLevel);
      }

      return maxDepLevel;
    };

    for (const node of nodes) {
      const level = calculateNodeLevel(node.id);
      node.level = level;

      if (!levels.has(level)) {
        levels.set(level, []);
      }

      levels.get(level)!.push(node.id);
    }

    return levels;
  }

  private findCriticalPath(nodes: DependencyNode[], edges: DependencyEdge[]): string[] {
    const longestPath: string[] = [];
    const memo = new Map<string, number>();

    const calculateLongestPath = (nodeId: string): number => {
      if (memo.has(nodeId)) {
        return memo.get(nodeId)!;
      }

      const node = nodes.find(n => n.id === nodeId);
      if (!node || node.status === 'passing') {
        return 0;
      }

      const dependentNodes = edges
        .filter(e => e.from === nodeId)
        .map(e => e.to)
        .filter(toId => {
          const toNode = nodes.find(n => n.id === toId);
          return toNode && toNode.status !== 'passing';
        });

      if (dependentNodes.length === 0) {
        return 1;
      }

      const maxPath = Math.max(
        0,
        ...dependentNodes.map(dep => 1 + calculateLongestPath(dep))
      );

      memo.set(nodeId, maxPath);
      return maxPath;
    };

    const findPath = (nodeId: string, path: string[]): void => {
      path.push(nodeId);

      const dependentNodes = edges
        .filter(e => e.from === nodeId)
        .map(e => e.to)
        .filter(toId => {
          const toNode = nodes.find(n => n.id === toId);
          return toNode && toNode.status !== 'passing';
        });

      if (dependentNodes.length === 0) {
        return;
      }

      const bestDependent = dependentNodes.reduce((best, dep) => {
        const depPathLength = calculateLongestPath(dep);
        const bestPathLength = calculateLongestPath(best);
        return depPathLength > bestPathLength ? dep : best;
      }, dependentNodes[0]);

      findPath(bestDependent, path);
    };

    const startNodes = nodes.filter(n => 
      n.depends_on.length === 0 || 
      n.depends_on.every(depId => {
        const depNode = nodes.find(n => n.id === depId);
        return depNode && depNode.status === 'passing';
      })
    );

    for (const startNode of startNodes) {
      const path: string[] = [];
      findPath(startNode.id, path);

      if (path.length > longestPath.length) {
        longestPath.length = 0;
        longestPath.push(...path);
      }
    }

    return longestPath;
  }

  private detectCircularDependencies(
    nodes: DependencyNode[],
    edges: DependencyEdge[]
  ): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const detectCycle = (nodeId: string, path: string[] = []): boolean => {
      if (recursionStack.has(nodeId)) {
        const cycleStart = path.indexOf(nodeId);
        const cycle = path.slice(cycleStart);
        cycles.push([...cycle, nodeId]);
        return true;
      }

      if (visited.has(nodeId)) {
        return false;
      }

      visited.add(nodeId);
      recursionStack.add(nodeId);
      path.push(nodeId);

      const dependents = edges
        .filter(e => e.from === nodeId)
        .map(e => e.to);

      for (const dependent of dependents) {
        detectCycle(dependent, [...path]);
      }

      recursionStack.delete(nodeId);
      path.pop();

      return false;
    };

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        detectCycle(node.id);
      }
    }

    return cycles;
  }

  private findBlockedBy(featureId: string, features: Feature[]): string[] {
    return features
      .filter(f => f.dependencies?.includes(featureId) && f.status === 'failing')
      .map(f => f.id);
  }

  private calculateAverageComplexity(features: Feature[]): 'low' | 'medium' | 'high' | 'very_high' {
    const complexityScores = {
      low: 1,
      medium: 2,
      high: 3,
      very_high: 4,
    };

    const avgScore = features.reduce((sum, f) => {
      const keywords = f.description.toLowerCase();
      let complexity = 'medium';
      
      if (keywords.includes('implement') || keywords.includes('integrate')) {
        complexity = 'high';
      } else if (keywords.includes('migrate') || keywords.includes('rebuild')) {
        complexity = 'very_high';
      } else if (keywords.includes('display') || keywords.includes('show')) {
        complexity = 'low';
      }
      
      return sum + complexityScores[complexity];
    }, 0) / features.length;

    if (avgScore < 1.5) return 'low';
    if (avgScore < 2.5) return 'medium';
    if (avgScore < 3.5) return 'high';
    return 'very_high';
  }

  private estimateDurationFromComplexity(
    complexity: 'low' | 'medium' | 'high' | 'very_high'
  ): number {
    const durations = {
      low: 15 * 60 * 1000,
      medium: 30 * 60 * 1000,
      high: 60 * 60 * 1000,
      very_high: 120 * 60 * 1000,
    };

    return durations[complexity];
  }

  private getStatusEmoji(status: string): string {
    const emojis = {
      failing: '❌',
      in_progress: '🔄',
      passing: '✅',
    };
    return emojis[status as keyof typeof emojis] || '⚪';
  }

  private getPriorityEmoji(priority: string): string {
    const emojis = {
      high: '🔴',
      medium: '🟡',
      low: '🟢',
    };
    return emojis[priority as keyof typeof emojis] || '⚪';
  }

  private getEdgeStyle(edge: DependencyEdge): string {
    switch (edge.status) {
      case 'completed':
        return '==>';
      case 'blocked':
        return '-.->';
      case 'active':
      default:
        return '-->';
    }
  }

  private getNodeType(node: DependencyNode): string {
    switch (node.status) {
      case 'passing':
        return 'completed_feature';
      case 'in_progress':
        return 'active_feature';
      case 'failing':
      default:
        return 'pending_feature';
    }
  }

  private getNodeColor(node: DependencyNode): string {
    switch (node.status) {
      case 'passing':
        return '#90EE90';
      case 'in_progress':
        return '#FFD700';
      case 'failing':
      default:
        return '#FF6B6B';
    }
  }
}

export const dependencyVisualizerService = new DependencyVisualizerService();
