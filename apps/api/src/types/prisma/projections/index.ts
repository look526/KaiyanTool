/**
 * Centralized type exports for Prisma projections
 * 
 * This module provides a single entry point for all projection types
 * with explicit exports for better IDE support and tree-shaking.
 */

/**
 * Project-related types
 */
export type {
  ProjectOwner,
  ProjectMember,
  ProjectCount,
  ProjectListItem,
  ProjectDetail,
  ProjectWithMembers,
  Shot,
  ProjectWithShots,
} from './project.types';

export {
  isProjectDetail,
  isProjectWithMembers,
  isProjectWithShots,
} from './project.types';

/**
 * AI Provider-related types
 */
export type {
  AIProviderListItem,
  AIProviderWithModels,
  AIProviderModelProjection,
} from './ai-provider.types';

/**
 * Character-related types
 */
export type {
  CharacterListItem,
} from './character.types';

/**
 * User-related types
 */
export type {
  UserListItem,
  UserDetail,
} from './user.types';
