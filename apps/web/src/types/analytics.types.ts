export interface ProjectAnalytics {
  progress: {
    total: number;
    completed: number;
    percentage: number;
  };
  shotCount: number;
  resourceUsage: {
    characters: number;
    scenes: number;
    items: number;
  };
  teamActivity: {
    activeMembers: number;
    actionsToday: number;
    actionsThisWeek: number;
  };
  generationStats: {
    total: number;
    success: number;
    failed: number;
    successRate: number;
  };
}
