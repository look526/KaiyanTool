import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import { WorkflowProvider, WorkflowStepId } from '../contexts/WorkflowContext';
import { WorkflowSidebar } from '../components/workflow/WorkflowSidebar';

const STEP_ROUTES: Record<WorkflowStepId, string> = {
  script: 'script',
  characters: 'characters',
  items: 'items',
  scenes: 'scenes',
  storyboard: 'shots',
};

export function ProjectLayout() {
  const navigate = useNavigate();
  const { id, projectId } = useParams<{ id: string; projectId: string }>();
  const location = useLocation();
  
  const projectUuid = id || projectId;

  const handleStepChange = (step: WorkflowStepId) => {
    if (projectUuid) {
      navigate(`/projects/${projectUuid}/${STEP_ROUTES[step]}`);
    }
  };

  return (
    <WorkflowProvider>
      <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-base)' }}>
        <WorkflowSidebar onStepChange={handleStepChange} />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Outlet />
        </main>
      </div>
    </WorkflowProvider>
  );
}
