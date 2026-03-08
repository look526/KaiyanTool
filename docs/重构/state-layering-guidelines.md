# 状态分层指南

本文档定义了 KaiyanTool 项目中的状态管理规范。

## 状态分类

| 类型 | 存储位置 | 持久化 | 同步方式 | 示例 |
|------|----------|--------|----------|------|
| **Server State** | React Query | 无 | 自动 | 用户数据、项目列表、AI配置 |
| **Client State** | Zustand | localStorage | 手动 | 用户偏好、主题、语言设置 |
| **UI State** | useState | 无 | 组件内 | 弹窗状态、表单输入、展开/折叠 |

## 核心规则

### ⚠️ 关键规则：Server 数据只能在 React Query 中

**永远不要在 Zustand 中存储服务器获取的数据！**

| ❌ 错误 | ✅ 正确 |
|---------|---------|
| `authStore.user` | `useCurrentUser()` |
| `store.projects` | `useProjects()` |
| `store.aiProviders` | `useAIProviders()` |

### 原因

- React Query 有内置缓存失效机制
- Server 数据需要自动同步
- Zustand 存储重复数据会导致陈旧数据

## 使用指南

### 1. Server State (React Query)

```typescript
// modules/auth/hooks/useCurrentUser.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { queryKeys } from '@/core/api/query-keys';

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.currentUser,
    queryFn: () => apiClient.getCurrentUser(),
    staleTime: 5 * 60 * 1000,
  });
}
```

```typescript
// modules/project/hooks/useProjects.ts
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => apiClient.createProject(data),
    onSuccess: () => {
      // 失效缓存
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}
```

### 2. Client State (Zustand)

```typescript
// core/store/ui.store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      sidebarOpen: true,
      theme: 'dark',
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'UIStore' }
  )
);
```

```typescript
// core/store/preferences.store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface PreferencesState {
  accentColor: string;
  fontSize: 'sm' | 'md' | 'lg';
  setAccentColor: (color: string) => void;
  setFontSize: (size: 'sm' | 'md' | 'lg') => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  devtools(
    persist(
      (set) => ({
        accentColor: '#007AFF',
        fontSize: 'md',
        setAccentColor: (color) => set({ accentColor: color }),
        setFontSize: (size) => set({ fontSize: size }),
      }),
      { name: 'kaiyan-preferences' }
    ),
    { name: 'PreferencesStore' }
  )
);
```

### 3. UI State (useState)

```typescript
// 组件内部使用
function MyComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // ...
}
```

## 决策树

```
数据是否来自 API 或数据库？
├── 是 → 使用 React Query (Server State)
│   ├── 用户数据 (currentUser, profile)
│   ├── 项目列表 (projects)
│   └── 任何服务器数据
│
└── 否 → 是否需要跨会话持久化？
    ├── 是 → 使用 Zustand + persist (Client State)
    │   ├── 用户偏好 (主题、语言)
    │   └── UI 状态 (侧边栏、弹窗)
    │
    └── 否 → 是否为组件特定？
        ├── 是 → 使用 useState (UI State)
        └── 否 → 使用 Zustand (UI State)
```

## 目录结构

```
src/
├── core/
│   └── store/
│       ├── auth.store.ts      # 仅 token/session
│       ├── ui.store.ts        # UI 状态
│       └── preferences.store.ts  # 持久化偏好
│
└── modules/
    ├── auth/
    │   └── hooks/
    │       └── useCurrentUser.ts  # React Query
    ├── project/
    │   └── hooks/
    │       ├── useProjects.ts      # React Query
    │       └── useCreateProject.ts # React Query mutation
    └── ai-provider/
        └── hooks/
            └── useAIProviders.ts   # React Query
```

## 注意事项

1. **禁止在 Zustand 中存储用户对象** - 用户数据必须通过 React Query 获取
2. **所有 mutations 必须有 onSuccess 缓存失效** - 确保数据同步
3. **使用 queryKeys 作为唯一事实来源** - 便于缓存管理
4. **仅在开发环境启用 DevTools** - 生产环境禁用
