import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { QueryProvider } from './core/query/QueryProvider'
import HomePage from './pages/HomePage'
import TestPage from './pages/TestPage'
import SimpleTest from './pages/SimpleTest'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { ToastProvider } from './components/ui/Toast'
import PageTransition from './components/PageTransition'

const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const CreateProjectPage = lazy(() => import('./pages/CreateProjectPage'))
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'))
const EpisodesPage = lazy(() => import('./pages/EpisodesPage'))
const EpisodeDetailPage = lazy(() => import('./pages/EpisodeDetailPage'))
const ScriptEditorPage = lazy(() => import('./pages/ScriptEditorPage'))
const ScriptViewerPage = lazy(() => import('./pages/ScriptViewerPage'))
const NovelEditorPage = lazy(() => import('./pages/NovelEditorPage'))
const NovelsPage = lazy(() => import('./pages/NovelsPage'))
const StorylinePage = lazy(() => import('./pages/StorylinePage'))
const OutlinePage = lazy(() => import('./pages/OutlinePage'))
const CharactersPage = lazy(() => import('./pages/CharactersPage'))
const ScenesPage = lazy(() => import('./pages/ScenesPage'))
const ProjectMembersPage = lazy(() => import('./pages/ProjectMembersPage'))
const AIProvidersPage = lazy(() => import('./pages/AIProvidersPage').then(m => ({ default: m.AIProvidersPage })))
const PanelsPage = lazy(() => import('./pages/PanelsPage'))
const VideoMergePage = lazy(() => import('./pages/VideoMergePage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'))
const DocumentDetailPage = lazy(() => import('./pages/DocumentDetailPage'))
const DocumentCreatePage = lazy(() => import('./pages/DocumentCreatePage'))
const TeamPage = lazy(() => import('./pages/TeamPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const ModelConfigurationPage = lazy(() => import('./pages/ModelConfigurationPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const SecuritySettingsPage = lazy(() => import('./pages/SecuritySettingsPage'))
const AppearanceSettingsPage = lazy(() => import('./pages/AppearanceSettingsPage'))
const NotificationSettingsPage = lazy(() => import('./pages/NotificationSettingsPage'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))
const ItemsPageSimple = lazy(() => import('./pages/ItemsPageSimple'))
const HelpPage = lazy(() => import('./pages/HelpPage'))
const AssetsPage = lazy(() => import('./pages/AssetsPage'))
const ImageGenerationPage = lazy(() => import('./pages/ImageGenerationPage'))
const VideoGenerationPage = lazy(() => import('./pages/VideoGenerationPage'))
const ButtonShowcasePage = lazy(() => import('./pages/ButtonShowcasePage'))
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'))
const AdminAssetsPage = lazy(() => import('./pages/admin/AdminAssetsPage'))
const AdminLogsPage = lazy(() => import('./pages/admin/AdminLogsPage'))
const APIDashboardPage = lazy(() => import('./pages/APIDashboardPage'))
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout').then(module => ({ default: module.DashboardLayout })))
const ProjectLayout = lazy(() => import('./layouts/ProjectLayout').then(module => ({ default: module.ProjectLayout })))

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

function App() {
  return (
    <ThemeProvider>
      <QueryProvider>
        <ToastProvider>
          <BrowserRouter>
            <AuthProvider>
              <PageTransition>
                <Suspense fallback={<LoadingComponent />}>
                  <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/test" element={<TestPage />} />
                  <Route path="/simple" element={<SimpleTest />} />
                  <Route path="/buttons" element={<ButtonShowcasePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="assets" element={<AdminAssetsPage />} />
                    <Route path="logs" element={<AdminLogsPage />} />
                    <Route path="api" element={<APIDashboardPage />} />
                  </Route>
                  
                  <Route path="/projects/new" element={<ProtectedRoute><CreateProjectPage /></ProtectedRoute>} />
                  <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />

                  <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                    <Route path="/help" element={<HelpPage />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/assets" element={<AssetsPage />} />
                    <Route path="/image-generation" element={<ImageGenerationPage />} />
                    <Route path="/video-generation" element={<VideoGenerationPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/team" element={<TeamPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/settings/ai" element={<AIProvidersPage />} />
                    <Route path="/settings/models" element={<ModelConfigurationPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings/security" element={<SecuritySettingsPage />} />
                    <Route path="/settings/appearance" element={<AppearanceSettingsPage />} />
                    <Route path="/settings/notifications" element={<NotificationSettingsPage />} />
                    <Route path="/documents" element={<DocumentsPage />} />
                    <Route path="/documents/create" element={<DocumentCreatePage />} />
                    <Route path="/documents/:id" element={<DocumentDetailPage />} />
                  </Route>

                  <Route element={<ProtectedRoute><ProjectLayout /></ProtectedRoute>}>
                    <Route path="/projects/:projectId/editor" element={<ScriptEditorPage />} />
                    <Route path="/projects/:projectId/script" element={<ScriptEditorPage />} />
                    <Route path="/projects/:projectId/scripts/:scriptId" element={<ScriptViewerPage />} />
                    <Route path="/projects/:projectId/scripts/:scriptId/edit" element={<ScriptEditorPage />} />
                    <Route path="/projects/:id/novel" element={<NovelEditorPage />} />
                    <Route path="/projects/:id/novels" element={<NovelsPage />} />
                    <Route path="/projects/:projectId/storyline" element={<StorylinePage />} />
                    <Route path="/projects/:projectId/outline" element={<OutlinePage />} />
                    <Route path="/projects/:id/characters" element={<CharactersPage />} />
                    <Route path="/projects/:id/scenes" element={<ScenesPage />} />
                    <Route path="/projects/:id/members" element={<ProjectMembersPage />} />
                    <Route path="/projects/:id/shots" element={<EpisodesPage />} />
                    <Route path="/projects/:projectId/episodes/:episodeId" element={<EpisodeDetailPage />} />
                    <Route path="/projects/:id/items" element={<ItemsPageSimple />} />
                    <Route path="/projects/:id/video-merge" element={<VideoMergePage />} />
                  </Route>
                  <Route path="/shots/:id/panels" element={<ProtectedRoute><PanelsPage /></ProtectedRoute>} />
                </Routes>
              </Suspense>
            </PageTransition>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}

export default App
