import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import HomePage from './pages/HomePage'
import TestPage from './pages/TestPage'
import SimpleTest from './pages/SimpleTest'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { ToastProvider } from './components/ui/Toast'

// 懒加载组件
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const CreateProjectPage = lazy(() => import('./pages/CreateProjectPage'))
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'))
const ScriptEditorPage = lazy(() => import('./pages/ScriptEditorPage'))
const ScriptViewerPage = lazy(() => import('./pages/ScriptViewerPage'))
const NovelEditorPage = lazy(() => import('./pages/NovelEditorPage'))
const NovelsPage = lazy(() => import('./pages/NovelsPage'))
const StorylinePage = lazy(() => import('./pages/StorylinePage'))
const CharactersPage = lazy(() => import('./pages/CharactersPage'))
const ScenesPage = lazy(() => import('./pages/ScenesPage'))
const ProjectMembersPage = lazy(() => import('./pages/ProjectMembersPage'))
const AIProvidersPage = lazy(() => import('./pages/AIProvidersPage'))
const ShotsPage = lazy(() => import('./pages/ShotsPage'))
const PanelsPage = lazy(() => import('./pages/PanelsPage'))
const VideoMergePage = lazy(() => import('./pages/VideoMergePage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'))
const DocumentDetailPage = lazy(() => import('./pages/DocumentDetailPage'))
const DocumentCreatePage = lazy(() => import('./pages/DocumentCreatePage'))
const TeamPage = lazy(() => import('./pages/TeamPage'))

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

function LoadingComponent() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: 'var(--bg-base)'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid var(--border-primary)',
          borderTop: '4px solid var(--accent)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{
          fontSize: '16px',
          color: 'var(--text-tertiary)',
          fontWeight: '500'
        }}>
          加载中...
        </span>
      </div>
    </div>
  );
}

function AppContent() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingComponent />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/simple" element={<SimpleTest />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
          <Route path="/projects/new" element={<ProtectedRoute><CreateProjectPage /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
          <Route path="/projects/:projectId/script" element={<ProtectedRoute><ScriptEditorPage /></ProtectedRoute>} />
          <Route path="/projects/:projectId/scripts/:scriptId" element={<ProtectedRoute><ScriptViewerPage /></ProtectedRoute>} />
          <Route path="/projects/:projectId/scripts/:scriptId/edit" element={<ProtectedRoute><ScriptEditorPage /></ProtectedRoute>} />
          <Route path="/projects/:id/novel" element={<ProtectedRoute><NovelEditorPage /></ProtectedRoute>} />
          <Route path="/projects/:id/novels" element={<ProtectedRoute><NovelsPage /></ProtectedRoute>} />
          <Route path="/projects/:projectId/storyline" element={<ProtectedRoute><StorylinePage /></ProtectedRoute>} />
          <Route path="/projects/:id/characters" element={<ProtectedRoute><CharactersPage /></ProtectedRoute>} />
          <Route path="/projects/:id/scenes" element={<ProtectedRoute><ScenesPage /></ProtectedRoute>} />
          <Route path="/projects/:id/members" element={<ProtectedRoute><ProjectMembersPage /></ProtectedRoute>} />
          <Route path="/projects/:id/shots" element={<ProtectedRoute><ShotsPage /></ProtectedRoute>} />
          <Route path="/projects/:id/video-merge" element={<ProtectedRoute><VideoMergePage /></ProtectedRoute>} />
          <Route path="/shots/:id/panels" element={<ProtectedRoute><PanelsPage /></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute><TeamPage /></ProtectedRoute>} />
          <Route path="/settings/ai" element={<ProtectedRoute><AIProvidersPage /></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
          <Route path="/documents/create" element={<ProtectedRoute><DocumentCreatePage /></ProtectedRoute>} />
          <Route path="/documents/:id" element={<ProtectedRoute><DocumentDetailPage /></ProtectedRoute>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
