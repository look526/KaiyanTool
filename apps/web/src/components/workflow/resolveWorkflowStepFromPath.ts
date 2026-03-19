import type { WorkflowStepId } from '../../contexts/WorkflowContext';

/**
 * @description ??????????????????????
 */
export function resolveWorkflowStepFromPath(pathname: string): WorkflowStepId {
  const path = pathname.toLowerCase();

  if (path.includes('/storyboard') || path.includes('/shots') || path.includes('/episodes/')) {
    return 'storyboard';
  }

  if (path.includes('/storyline') || path.includes('/outline')) {
    return 'storyline';
  }

  if (path.includes('/characters')) {
    return 'characters';
  }

  if (path.includes('/items')) {
    return 'items';
  }

  if (path.includes('/scenes')) {
    return 'scenes';
  }

  if (path.includes('/script')) {
    return 'script';
  }

  return 'script';
}
