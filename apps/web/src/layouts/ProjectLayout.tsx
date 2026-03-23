import { useEffect } from 'react';
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import { WorkflowProvider, WorkflowStepId } from '../contexts/WorkflowContext';
import { WorkflowSidebar } from '../components/workflow/WorkflowSidebar';

const STEP_ROUTES: Record<WorkflowStepId, string> = {
  script: 'script',
  storyline: 'storyline',
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

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      htmlHeight: html.style.height,
      bodyHeight: body.style.height,
    };
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    html.style.height = '100%';
    body.style.height = '100%';
    return () => {
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      html.style.height = prev.htmlHeight;
      body.style.height = prev.bodyHeight;
    };
  }, []);

  return (
    <WorkflowProvider>
      <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-base)' }}>
        <WorkflowSidebar onStepChange={handleStepChange} />
        <main style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Outlet />
        </main>
      </div>
    </WorkflowProvider>
  );
}
