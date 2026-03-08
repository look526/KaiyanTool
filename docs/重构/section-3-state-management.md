# 状态管理重构文档 (Section 3)

## 概述

本文档详细描述了 KaiyanTool 项目状态管理架构的重构方案，基于 `frontend-design` 技能的设计理念，采用**河流系统**概念来组织不同类型的状态。

## 设计理念

采用 **"河流系统"** 隐喻：

| 状态类型 | 隐喻 | 管理工具 | 特性 |
|---------|------|---------|------|
| Server State | 上游水流 | React Query | 自动同步、自动缓存 |
| Client State | 湖泊 | Zustand | 手动同步、持久化 |
| UI State | 蒸发降雨 | useState | 组件级、临时 |

核心原则：**Structured Contract** - 每个状态切片声明其生命周期、持久化规则和同步契约。

---

## 目录结构

```
state/
├── server/                    # Server state (React Query)
│   ├── queries/
│   │   ├── useProjects.ts
│   │   ├── useAIProviders.ts
│   │   └── ...
│   ├── mutations/
│   │   ├── useCreateProject.ts
│   │   └── ...
│   └── contracts/            # Query contracts (type-safe guarantees)
│       ├── project.contracts.ts
│       └── index.ts
├── client/                    # Client state (Zustand)
│   ├── auth.store.ts          # Authentication state (tokens only)
│   ├── preferences.store.ts   # User preferences (persisted)
│   ├── ui.store.ts            # UI state (sidebar, modals)
│   └── stores.ts              # Store composition
├── ui/                       # UI state (React useState)
│   └── (component-specific)
├── sync/                     # Cross-store synchronization
│   ├── event-bus.ts           # Event-driven communication
│   └── reconciler.ts         # State reconciliation
├── types/
│   ├── server-state.ts
│   ├── client-state.ts
│   └── contracts.ts
└── index.ts
```

---

## 核心实现

### 1. 状态契约定义

```typescript
// state/types/contracts.ts
import { z } from 'zod';

export const ServerStateContract = z.object({
  source: z.literal('server'),
  ttl: z.number().min(0),
  staleWhileRevalidate: z.boolean().optional(),
  persistence: z.literal('none'),
});

export const ClientStateContract = z.object({
  source: z.literal('client'),
  persistence: z.enum(['none', 'localStorage', 'sessionStorage', 'indexedDB']),
  hydration: z.enum(['eager', 'lazy']).default('eager'),
  syncWithServer: z.boolean().optional(),
});

export const UIStateContract = z.object({
  source: z.literal('ui'),
  persistence: z.literal('none'),
  ephemeral: z.literal(true),
});

export type StateContract = z.infer<typeof ServerStateContract> | 
                           z.infer<typeof ClientStateContract> | 
                           z.infer<typeof UIStateContract>;

// state/server/contracts/project.contracts.ts
export const ProjectQueryContract = {
  list: {
    ttl: 2 * 60 * 1000,
    staleWhileRevalidate: true,
  },
  detail: {
    ttl: 5 * 60 * 1000,
  },
  members: {
    ttl: 60 * 1000,
  },
} as const satisfies Record<string, { ttl: number; staleWhileRevalidate?: boolean }>;

export const ProjectMutationContract = {
  create: {
    optimisticUpdates: ['projects.list'],
    rollbackOnError: true,
  },
  update: {
    optimisticUpdates: ['projects.detail', 'projects.list'],
    rollbackOnError: true,
  },
  delete: {
    optimisticUpdates: ['projects.list'],
    invalidates: ['projects.detail'],
  },
} as const;
```

### 2. UI Store

```typescript
// state/client/stores.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UIState {
  sidebarOpen: boolean;
  activeModal: string | null;
  selectedProjectId: string | null;
  theme: 'light' | 'dark' | 'system';
}

interface UIActions {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openModal: (modal: string) => void;
  closeModal: () => void;
  setSelectedProject: (id: string | null) => void;
  setTheme: (theme: UIState['theme']) => void;
}

export const useUIStore = create<UIState & UIActions>()(
  devtools(
    (set) => ({
      sidebarOpen: true,
      activeModal: null,
      selectedProjectId: null,
      theme: 'dark',

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      openModal: (modal) => set({ activeModal: modal }),
      closeModal: () => set({ activeModal: null }),
      setSelectedProject: (id) => set({ selectedProjectId: id }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'UIStore' }
  )
);
```

### 3. Preferences Store

```typescript
// state/client/preferences.store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface PreferencesState {
  accentColor: string;
  fontSize: 'sm' | 'md' | 'lg';
  language: string;
  autoSave: boolean;
  notifications: boolean;
}

interface PreferencesActions {
  setAccentColor: (color: string) => void;
  setFontSize: (size: PreferencesState['fontSize']) => void;
  setLanguage: (lang: string) => void;
  setAutoSave: (enabled: boolean) => void;
  setNotifications: (enabled: boolean) => void;
  resetPreferences: () => void;
}

const initialState: PreferencesState = {
  accentColor: '#007AFF',
  fontSize: 'md',
  language: 'zh-CN',
  autoSave: true,
  notifications: true,
};

export const usePreferencesStore = create<PreferencesState & PreferencesActions>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setAccentColor: (color) => set({ accentColor: color }),
        setFontSize: (size) => set({ fontSize: size }),
        setLanguage: (lang) => set({ language: lang }),
        setAutoSave: (enabled) => set({ autoSave: enabled }),
        setNotifications: (enabled) => set({ notifications: enabled }),
        resetPreferences: () => set(initialState),
      }),
      {
        name: 'kaiyan-preferences',
      }
    ),
    { name: 'PreferencesStore' }
  )
);
```

### 4. 乐观更新示例

```typescript
// state/server/mutations/useCreateProject.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { queryKeys } from '../../../core/api/client';

interface OptimisticProject {
  id: string;
  tempId: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectData) => apiClient.createProject(data),
    
    onMutate: async (newProject) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.all });

      const previousProjects = queryClient.getQueryData(queryKeys.projects.all);

      const optimisticProject: OptimisticProject = {
        id: `temp-${Date.now()}`,
        tempId: `temp-${Date.now()}`,
        name: newProject.name,
        description: newProject.description,
        createdAt: new Date(),
      };

      queryClient.setQueryData(queryKeys.projects.all, (old: any) => ({
        ...old,
        projects: [optimisticProject, ...(old?.projects || [])],
      }));

      return { previousProjects, optimisticProject };
    },

    onError: (err, newProject, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(queryKeys.projects.all, context.previousProjects);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}
```

### 5. 事件总线

```typescript
// state/sync/event-bus.ts
type EventCallback<T = any> = (data: T) => void;

class StateEventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  subscribe<T>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(callback);
    
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  publish<T>(event: string, data: T): void {
    this.listeners.get(event)?.forEach((callback) => callback(data));
  }
}

export const stateEventBus = new StateEventBus();

export const STATE_EVENTS = {
  PROJECT_CREATED: 'project:created',
  PROJECT_UPDATED: 'project:updated',
  PROJECT_DELETED: 'project:deleted',
  USER_UPDATED: 'user:updated',
  THEME_CHANGED: 'theme:changed',
} as const;
```

### 6. 状态组合 Hook

```typescript
// state/sync/compose.ts
import { useProject } from '../../modules/project/hooks/useProjects';

export function useProjectState(projectId: string | undefined) {
  const { data: project, isLoading, error } = useProject(projectId);
  const { sidebarOpen, activeModal, selectedProjectId, toggleSidebar, openModal, closeModal } = useUIStore();
  
  return {
    project,
    isLoading,
    error,
    sidebarOpen,
    activeModal,
    selectedProjectId,
    toggleSidebar,
    openModal,
    closeModal,
  };
}
```

---

## 决策树

```
Is the data fetched from an API or database?
├── YES → Use React Query (Server State) ⚠️
│   └── ANY user data (currentUser, profile, etc.) goes HERE
└── NO → Does it need to persist across sessions?
    ├── YES → Use Zustand with persist middleware
    │   ├── Preferences → localStorage
    │   ├── Large data → indexedDB
    │   └── Auth tokens → localStorage (or httpOnly cookies)
    └── NO → Is it component-specific?
        ├── YES → Use React useState
        └── NO → Use Zustand (UI State)
```

## ⚠️ 关键规则: Server 数据只在 React Query 中

**永远不要在 Zustand 中存储服务器获取的数据!**

| ❌ 错误 (当前) | ✅ 正确 |
|----------------|----------|
| `authStore.user` | `useCurrentUser()` query |
| `store.projects` | `useProjects()` query |
| `store.aiProviders` | `useAIProviders()` query |

**原因:**
- Server 数据应该通过 React Query 自动同步和缓存
- Zustand 没有内置的缓存失效机制
- 重复数据 = 陈旧数据 = Bug

## Auth Store 重构示例

**当前问题代码** (❌):
```typescript
// apps/web/src/core/store/auth.store.ts
interface AuthState {
  user: User | null;  // ❌ 服务器数据，不应在 Zustand 中
  loading: boolean;
  rememberMe: boolean;
  sessionExpired: boolean;
}
```

**重构后代码** (✅):
```typescript
// state/client/auth.store.ts
interface AuthState {
  token: string | null;
  refreshToken: string | null;
  rememberMe: boolean;
  sessionExpired: boolean;
}

interface AuthActions {
  setTokens: (token: string, refreshToken?: string) => void;
  setRememberMe: (rememberMe: boolean) => void;
  setSessionExpired: (expired: boolean) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    persist(
      (set) => ({
        token: null,
        refreshToken: null,
        rememberMe: false,
        sessionExpired: false,

        setTokens: (token, refreshToken) => set({ 
          token, 
          refreshToken: refreshToken || null,
        }),
        
        setRememberMe: (rememberMe) => set({ rememberMe }),
        setSessionExpired: (sessionExpired) => set({ sessionExpired }),
        clearSession: () => set({ 
          token: null, 
          refreshToken: null, 
          sessionExpired: false 
        }),
      }),
      { name: 'kaiyan-auth' }
    ),
    { name: 'AuthStore' }
  )
);
```

**用户数据通过 React Query 获取**:
```typescript
// state/server/queries/useCurrentUser.ts
export function useCurrentUser() {
  return useQuery({
    queryKey: ['user', 'current'],
    queryFn: () => apiClient.getCurrentUser(),
    staleTime: 5 * 60 * 1000,
  });
}
```

---

## 最佳实践

1. **永远不要在 client stores 中复制 server state**
2. **始终为 mutations 实现乐观更新**
3. **实现正确的缓存失效策略**
4. **使用 query keys 作为事实来源**
5. **为状态生命周期定义契约**
6. **使用事件进行跨 store 通信**
7. **仅在开发环境中启用 devtools**

---

## 实施步骤

| 步骤 | 内容 | 时间 |
|------|------|------|
| 1 | 定义状态契约 | 1-2 小时 |
| 2 | 创建状态组合层 | 2-3 小时 |
| 3 | 重构 Client State | 4-6 小时 |
| 4 | 实现 Server State + 乐观更新 | 6-8 小时 |
| 5 | 实现跨 Store 同步 | 3-4 小时 |
| 6 | 集成 DevTools | 1-2 小时 |
| 7 | 编写文档 | 2-3 小时 |

**总计**: 19-28 小时

---

## 验证方法

1. **State Flow Test**: 测试乐观更新和缓存失效
2. **Performance Profiling**: 使用 React DevTools Profiler 测量重渲染
3. **State Persistence Test**: 测试页面重载场景
4. **Type Safety Check**: `npx tsc --noEmit`

---

## 成功标准

- [ ] 状态管理指南文档化和执行
- [ ] 所有 server 数据通过 React Query 管理并带有契约
- [ ] Zustand stores 中仅包含真正的 client state（无重复）
- [ ] 所有 mutations 实现乐观更新
- [ ] 正确的缓存失效策略
- [ ] 状态持久化正常工作
- [ ] 开发环境中 DevTools 配置和工作
- [ ] 通过事件总线进行跨 store 同步
- [ ] 无不必要的重渲染导致的性能回退
- [ ] 类型安全的状态契约
