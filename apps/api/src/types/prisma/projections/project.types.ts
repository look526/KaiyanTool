/**
 * Project-related type definitions
 * 
 * This module defines all project-related types using composition
 * instead of inheritance to avoid circular references and complexity.
 */

/**
 * Base project owner information
 */
export interface ProjectOwner {
  id: string;
  email?: string;
  name: string | null;
}

/**
 * Base project member information
 */
export interface ProjectMember {
  role: 'owner' | 'editor' | 'viewer';
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

/**
 * Project count statistics
 */
export interface ProjectCount {
  shots: number;
  characters: number;
  members?: number;
}

/**
 * Base project list item with common fields
 */
export interface ProjectListItem {
  id: string;
  name: string;
  description: string | null;
  type: 'script' | 'novel' | 'mixed';
  status: string;
  createdAt: Date;
  updatedAt: Date;
  thumbnailUrl: string | null;
  owner: ProjectOwner;
  members?: ProjectMember[];
  count?: ProjectCount;
}

/**
 * Project detail with settings
 * Uses composition instead of inheritance
 */
export interface ProjectDetail {
  project: ProjectListItem;
  settings?: Record<string, unknown>;
}

/**
 * Project with members list
 * Uses composition instead of inheritance
 */
export interface ProjectWithMembers {
  project: ProjectListItem;
  members: ProjectMember[];
}

/**
 * Shot information
 */
export interface Shot {
  id: string;
  actionSummary: string;
  startImageUrl: string | null;
  endImageUrl: string | null;
  videoUrl: string | null;
  createdAt: Date;
}

/**
 * Project with shots list
 * Uses composition instead of inheritance
 */
export interface ProjectWithShots {
  project: ProjectListItem;
  shots: Shot[];
}

/**
 * Type guards for project types
 */
export function isProjectDetail(value: unknown): value is ProjectDetail {
  return (
    typeof value === 'object' &&
    value !== null &&
    'project' in value
  );
}

export function isProjectWithMembers(value: unknown): value is ProjectWithMembers {
  return (
    typeof value === 'object' &&
    value !== null &&
    'project' in value &&
    'members' in value
  );
}

export function isProjectWithShots(value: unknown): value is ProjectWithShots {
  return (
    typeof value === 'object' &&
    value !== null &&
    'project' in value &&
    'shots' in value
  );
}
