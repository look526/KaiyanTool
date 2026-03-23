import { prisma } from '../lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export interface CreateWorkspaceInput {
  user_id: string;
  name?: string;
  config?: Record<string, any>;
}

export interface CreateNodeInput {
  workspace_id: string;
  type: string;
  position_x?: number;
  position_y?: number;
  config?: Record<string, any>;
  content?: Record<string, any>;
  output_url?: string;
  history?: any[];
  labels?: string[];
  is_starred?: boolean;
}

export interface CreateEdgeInput {
  workspace_id: string;
  source_node_id: string;
  target_node_id: string;
}

export interface NodeHistoryEntry {
  content: any;
  output_url?: string;
  timestamp: Date;
}

export async function getWorkspacesByUser(userId: string) {
  return prisma.workspace.findMany({
    where: { user_id: userId },
    include: {
      CanvasNode: true,
      CanvasEdge: true,
    },
    orderBy: { created_at: 'desc' },
  });
}

export async function getWorkspaceById(workspaceId: string) {
  return prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      CanvasNode: true,
      CanvasEdge: true,
    },
  });
}

export async function createWorkspace(input: CreateWorkspaceInput) {
  return prisma.workspace.create({
    data: {
      id: uuidv4(),
      user_id: input.user_id,
      name: input.name || '默认工作台',
      config: input.config || {},
      updated_at: new Date(),
    },
  });
}

export async function updateWorkspace(workspaceId: string, data: { name?: string; config?: Record<string, any>; snapshot?: any }) {
  return prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.config && { config: data.config }),
      ...(data.snapshot !== undefined && { snapshot: data.snapshot }),
      updated_at: new Date(),
    },
  });
}

export async function deleteWorkspace(workspaceId: string) {
  return prisma.workspace.delete({
    where: { id: workspaceId },
  });
}

export async function createCanvasNode(input: CreateNodeInput) {
  return prisma.canvasNode.create({
    data: {
      id: uuidv4(),
      workspace_id: input.workspace_id,
      type: input.type,
      position_x: input.position_x || 0,
      position_y: input.position_y || 0,
      config: input.config || {},
      content: input.content || null,
      output_url: input.output_url || null,
      history: input.history || [],
      labels: input.labels || [],
      is_starred: input.is_starred || false,
      updated_at: new Date(),
    },
  });
}

export async function updateCanvasNode(nodeId: string, data: {
  position_x?: number;
  position_y?: number;
  config?: Record<string, any>;
  content?: Record<string, any>;
  output_url?: string;
  history?: any[];
  labels?: string[];
  is_starred?: boolean;
}) {
  return prisma.canvasNode.update({
    where: { id: nodeId },
    data: {
      ...(data.position_x !== undefined && { position_x: data.position_x }),
      ...(data.position_y !== undefined && { position_y: data.position_y }),
      ...(data.config && { config: data.config }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.output_url !== undefined && { output_url: data.output_url }),
      ...(data.history && { history: data.history }),
      ...(data.labels && { labels: data.labels }),
      ...(data.is_starred !== undefined && { is_starred: data.is_starred }),
      updated_at: new Date(),
    },
  });
}

export async function deleteCanvasNode(nodeId: string) {
  await prisma.canvasEdge.deleteMany({
    where: {
      OR: [
        { source_node_id: nodeId },
        { target_node_id: nodeId },
      ],
    },
  });

  return prisma.canvasNode.delete({
    where: { id: nodeId },
  });
}

export async function getCanvasNodes(workspaceId: string) {
  return prisma.canvasNode.findMany({
    where: { workspace_id: workspaceId },
    orderBy: { created_at: 'asc' },
  });
}

export async function createCanvasEdge(input: CreateEdgeInput) {
  const existing = await prisma.canvasEdge.findFirst({
    where: {
      workspace_id: input.workspace_id,
      source_node_id: input.source_node_id,
      target_node_id: input.target_node_id,
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.canvasEdge.create({
    data: {
      id: uuidv4(),
      workspace_id: input.workspace_id,
      source_node_id: input.source_node_id,
      target_node_id: input.target_node_id,
    },
  });
}

export async function deleteCanvasEdge(edgeId: string) {
  return prisma.canvasEdge.delete({
    where: { id: edgeId },
  });
}

export async function getCanvasEdges(workspaceId: string) {
  return prisma.canvasEdge.findMany({
    where: { workspace_id: workspaceId },
    orderBy: { created_at: 'asc' },
  });
}

export async function addNodeHistory(nodeId: string, entry: NodeHistoryEntry) {
  const node = await prisma.canvasNode.findUnique({
    where: { id: nodeId },
  });

  if (!node) {
    throw new Error('Node not found');
  }

  const history = Array.isArray(node.history) ? node.history : [];
  history.push(entry);

  if (history.length > 50) {
    history.shift();
  }

  return prisma.canvasNode.update({
    where: { id: nodeId },
    data: {
      history,
      updated_at: new Date(),
    },
  });
}

export async function getNodeHistory(nodeId: string) {
  const node = await prisma.canvasNode.findUnique({
    where: { id: nodeId },
    select: { history: true },
  });

  return node?.history || [];
}

export async function updateNodeStar(nodeId: string, isStarred: boolean) {
  return prisma.canvasNode.update({
    where: { id: nodeId },
    data: {
      is_starred: isStarred,
      updated_at: new Date(),
    },
  });
}

export async function updateNodeLabels(nodeId: string, labels: string[]) {
  return prisma.canvasNode.update({
    where: { id: nodeId },
    data: {
      labels,
      updated_at: new Date(),
    },
  });
}

export async function exportWorkspace(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      CanvasNode: true,
      CanvasEdge: true,
    },
  });

  if (!workspace) {
    throw new Error('Workspace not found');
  }

  return {
    id: workspace.id,
    name: workspace.name,
    config: workspace.config,
    nodes: workspace.CanvasNode,
    edges: workspace.CanvasEdge,
    exportedAt: new Date().toISOString(),
  };
}

export async function importWorkspace(userId: string, data: {
  name?: string;
  config?: Record<string, any>;
  nodes: any[];
  edges: any[];
}) {
  const workspace = await prisma.workspace.create({
    data: {
      id: uuidv4(),
      user_id: userId,
      name: data.name || '导入工作台',
      config: data.config || {},
      updated_at: new Date(),
    },
  });

  const nodeIdMap = new Map<string, string>();

  for (const node of data.nodes) {
    const newNode = await prisma.canvasNode.create({
      data: {
        id: uuidv4(),
        workspace_id: workspace.id,
        type: node.type,
        position_x: node.position_x,
        position_y: node.position_y,
        config: node.config || {},
        content: node.content || null,
        output_url: node.output_url || null,
        history: Array.isArray(node.history) ? node.history : [],
        labels: Array.isArray(node.labels) ? node.labels : [],
        is_starred: node.is_starred || false,
        updated_at: new Date(),
      },
    });
    nodeIdMap.set(node.id, newNode.id);
  }

  for (const edge of data.edges) {
    const newSourceId = nodeIdMap.get(edge.source_node_id);
    const newTargetId = nodeIdMap.get(edge.target_node_id);

    if (newSourceId && newTargetId) {
      await prisma.canvasEdge.create({
        data: {
          id: uuidv4(),
          workspace_id: workspace.id,
          source_node_id: newSourceId,
          target_node_id: newTargetId,
        },
      });
    }
  }

  return workspace;
}