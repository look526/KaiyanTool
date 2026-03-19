import { describe, expect, it } from 'vitest';
import { resolveWorkflowStepFromPath } from './resolveWorkflowStepFromPath';

describe('resolveWorkflowStepFromPath', () => {
  it('?????????????', () => {
    expect(resolveWorkflowStepFromPath('/projects/demo/episodes/episode-1')).toBe('storyboard');
  });

  it('??????????????', () => {
    expect(resolveWorkflowStepFromPath('/projects/demo/episodes/episode-1/timeline')).toBe('storyboard');
  });

  it('?????????????', () => {
    expect(resolveWorkflowStepFromPath('/projects/demo/shots')).toBe('storyboard');
  });

  it('?????????????', () => {
    expect(resolveWorkflowStepFromPath('/projects/demo/unknown')).toBe('script');
  });
});
