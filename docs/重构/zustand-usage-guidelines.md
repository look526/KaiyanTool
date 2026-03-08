# Zustand 使用规范

本文档定义了 KaiyanTool 项目中 Zustand 的正确使用方式。

## 什么时候使用 Zustand

Zustand 适用于以下场景：

### ✅ 正确使用场景

| 场景 | 说明 | 示例 |
|------|------|------|
| **用户偏好设置** | 需要持久化的客户端配置 | 主题、语言、字体大小 |
| **UI 状态** | 跨组件共享的 UI 状态 | 侧边栏展开、模态框 |
| **认证 Token** | 客户端认证状态 | token、refreshToken |
| **表单状态** | 复杂表单的多处共享 | 多步表单向导 |

### ❌ 错误使用场景

| 场景 | 为什么错误 | 正确做法 |
|------|------------|----------|
| **用户数据** | 服务器数据，应该自动缓存 | 使用 React Query |
| **项目列表** | 服务器数据，需要缓存失效 | 使用 React Query |
| **AI 配置** | 服务器数据，可能被多人修改 | 使用 React Query |

## 状态分层原则

```
┌─────────────────────────────────────────────────────────────┐
│  React Query (Server State)                                 │
│  - user, projects, aiProviders, settings                    │
│  - 自动缓存失效                                              │
│  - staleTime, gcTime 管理                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Zustand (Client State)                                     │
│  - token, rememberMe, sessionExpired                       │
│  - theme, language, accentColor                            │
│  - sidebarOpen, activeModal                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  useState (UI State)                                        │
│  - 表单输入、展开/折叠、临时状态                            │
└─────────────────────────────────────────────────────────────┘
```

## 目录结构

```
src/
├── core/
│   └── store/
│       ├── auth.store.ts          # 认证状态 (token)
│       ├── ui.store.ts            # UI 状态 (sidebar, modal)
│       └── preferences.store.ts   # 用户偏好 (theme, language)
│
└── modules/
    └── auth/
        └── hooks/
            └── useCurrentUser.ts  # 用户数据 (React Query)
```

## 代码示例

### ✅ 正确的 Zustand Store

```typescript
// core/store/ui.store.ts - UI 状态
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UIState {
  sidebarOpen: boolean;
  activeModal: string | null;
  setSidebarOpen: (open: boolean) => void;
  openModal: (modal: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      sidebarOpen: true,
      activeModal: null,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      openModal: (modal) => set({ activeModal: modal }),
      closeModal: () => set({ activeModal: null }),
    }),
    { name: 'UIStore' }
  )
);
```

```typescript
// core/store/preferences.store.ts - 用户偏好
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface PreferencesState {
  theme: 'light' | 'dark';
  language: string;
  accentColor: string;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (lang: string) => void;
  setAccentColor: (color: string) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  devtools(
    persist(
      (set) => ({
        theme: 'dark',
        language: 'zh-CN',
        accentColor: '#007AFF',
        setTheme: (theme) => set({ theme }),
        setLanguage: (language) => set({ language }),
        setAccentColor: (accentColor) => set({ accentColor }),
      }),
      { name: 'kaiyan-preferences' }
    ),
    { name: 'PreferencesStore' }
  )
);
```

### ❌ 错误的 Zustand Store

```typescript
// 错误示例 - 在 Zustand 中存储服务器数据
interface AuthState {
  user: User | null;  // ❌ 服务器数据
  projects: Project[]; // ❌ 服务器数据
  loading: boolean;
}

// 正确做法：使用 React Query
function useCurrentUser() {
  return useQuery({
    queryKey: ['user', 'current'],
    queryFn: () => apiClient.getCurrentUser(),
  });
}
```

## DevTools 配置

```typescript
import { devtools } from 'zustand/middleware';

export const useStore = create<State & Actions>()(
  devtools(
    (set) => ({
      // ... state and actions
    }),
    { 
      name: 'StoreName',
      enabled: process.env.NODE_ENV !== 'production', // 生产环境禁用
    }
  )
);
```

## 持久化配置

```typescript
import { persist } from 'zustand/middleware';

export const usePreferencesStore = create<State>()(
  persist(
    (set) => ({
      // ... state
    }),
    {
      name: 'storage-key', // localStorage key
      partialize: (state) => ({ /* 只持久化部分字段 */ }),
    }
  )
);
```

## 常见错误

### 错误 1: 在 Zustand 中存储用户

```typescript
// ❌ 错误
const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

// ✅ 正确
const useAuthStore = create((set) => ({
  token: null,
  setTokens: (token) => set({ token }),
}));

function useCurrentUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => api.getCurrentUser(),
  });
}
```

### 错误 2: 在 Zustand 中存储项目列表

```typescript
// ❌ 错误
const useProjectStore = create((set) => ({
  projects: [],
  setProjects: (projects) => set({ projects }),
}));

// ✅ 正确
function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => api.getProjects(),
  });
}
```

## 总结

| 规则 | 说明 |
|------|------|
| 服务器数据 → React Query | 自动缓存失效 |
| 客户端偏好 → Zustand | 手动管理，持久化 |
| UI 状态 → useState | 组件级 |
| 永远不存 user 对象 | 用户数据在 React Query |
