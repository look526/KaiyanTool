import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FileText, Users, Package, Map, LayoutGrid, ArrowLeft } from 'lucide-react';
import { WorkflowStepId } from '../../contexts/WorkflowContext';
import { useTheme } from '../../contexts/ThemeContext';

interface StepConfig {
  id: WorkflowStepId;
  name: string;
  icon: React.ElementType;
  description: string;
}

const STEP_CONFIGS: StepConfig[] = [
  { id: 'script', name: '剧本', icon: FileText, description: '创作或导入剧本内容' },
  { id: 'characters', name: '角色', icon: Users, description: '定义角色并生成定妆照' },
  { id: 'items', name: '物品', icon: Package, description: '管理道具和服装' },
  { id: 'scenes', name: '场景', icon: Map, description: '解析场景并生成概念图' },
  { id: 'storyboard', name: '分镜', icon: LayoutGrid, description: '制作分镜并生成视频' },
];

interface WorkflowStepItemProps {
  step: StepConfig;
  isActive: boolean;
  onClick: () => void;
  isLast: boolean;
}

function WorkflowStepItem({ step, isActive, onClick, isLast }: WorkflowStepItemProps) {
  return (
    <div style={{ position: 'relative' }}>
      {!isLast && (
        <div
          style={{
            position: 'absolute',
            left: '19px',
            top: '44px',
            width: '2px',
            height: 'calc(100% - 20px)',
            backgroundColor: 'var(--border-primary)',
            transition: 'all 0.3s ease',
            opacity: isActive ? 0.8 : 0.4,
          }}
        />
      )}
      
      <button
        onClick={onClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
          padding: '16px',
          border: 'none',
          borderRadius: '16px',
          backgroundColor: isActive 
            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)'
            : 'transparent',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          textAlign: 'left',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: isActive ? '0 8px 24px rgba(99, 102, 241, 0.2)' : 'none',
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.1)';
            e.currentTarget.style.transform = 'translateX(4px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.transform = 'translateX(0)';
          }
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            backgroundColor: isActive
              ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
              : 'rgba(139, 92, 246, 0.1)',
            border: `2px solid ${isActive ? '#8b5cf6' : 'var(--border-primary)'}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            flexShrink: 0,
            boxShadow: isActive ? '0 4px 16px rgba(99, 102, 241, 0.4)' : 'none',
          }}
        >
          <step.icon style={{ 
            width: '20px', 
            height: '20px', 
            color: isActive ? 'white' : 'var(--accent)',
            transition: 'all 0.3s ease',
          }} />
        </div>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '4px',
            }}
          >
            <span
              style={{
                fontSize: '14px',
                fontWeight: isActive ? '600' : '500',
                color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                transition: 'all 0.3s ease',
              }}
            >
              {step.name}
            </span>
            {isActive && (
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-500)',
                boxShadow: '0 0 12px rgba(99, 102, 241, 0.6)',
                animation: 'pulse 2s infinite',
              }} />
            )}
          </div>
          
          <div
            style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              transition: 'all 0.3s ease',
            }}
          >
            {step.description}
          </div>
        </div>
      </button>
    </div>
  );
}

interface WorkflowSidebarProps {
  onStepChange?: (step: WorkflowStepId) => void;
}

export function WorkflowSidebar({ onStepChange }: WorkflowSidebarProps) {
  const navigate = useNavigate();
  const { projectId, id } = useParams<{ projectId: string; id: string }>();
  const location = useLocation();
  const projectUuid = projectId || id;
  const { theme } = useTheme();

  const getActiveStep = (): WorkflowStepId => {
    const path = location.pathname;
    if (path.includes('/script')) return 'script';
    if (path.includes('/characters')) return 'characters';
    if (path.includes('/items')) return 'items';
    if (path.includes('/scenes')) return 'scenes';
    if (path.includes('/storyboard') || path.includes('/shots')) return 'storyboard';
    return 'script';
  };

  const activeStep = getActiveStep();

  const handleStepClick = (stepId: WorkflowStepId) => {
    onStepChange?.(stepId);
  };

  const handleBackToProjects = () => {
    navigate('/projects');
  };

  return (
    <div
      style={{
        width: '260px',
        height: '100%',
        backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRight: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.18)'}`,
        boxShadow: theme === 'dark' ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)' : '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 50,
      }}
    >
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <button
          onClick={handleBackToProjects}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            width: '100%',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <ArrowLeft style={{ width: '16px', height: '16px' }} />
          <span style={{ fontSize: '14px', fontWeight: '500' }}>返回项目列表</span>
        </button>
      </div>

      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <h3
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          创作流程
        </h3>
      </div>

      <div
        style={{
          flex: 1,
          padding: '12px',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {STEP_CONFIGS.map((step, index) => (
            <WorkflowStepItem
              key={step.id}
              step={step}
              isActive={activeStep === step.id}
              onClick={() => handleStepClick(step.id)}
              isLast={index === STEP_CONFIGS.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export { STEP_CONFIGS };
