import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FileText, Users, Package, Map, LayoutGrid, ArrowLeft, ChevronRight, Sparkles, Zap, BookOpen } from 'lucide-react';
import { WorkflowStepId } from '../../contexts/WorkflowContext';

interface StepConfig {
  id: WorkflowStepId;
  name: string;
  icon: React.ElementType;
  description: string;
  gradient: string;
  shadow: string;
}

const STEP_CONFIGS: StepConfig[] = [
  { 
    id: 'script', 
    name: '剧本', 
    icon: FileText, 
    description: '创作或导入剧本内容',
    gradient: 'linear-gradient(135deg, #007AFF 0%, #0056CC 100%)',
    shadow: 'rgba(0, 122, 255, 0.4)',
  },
  { 
    id: 'storyline', 
    name: '故事线', 
    icon: BookOpen, 
    description: '生成故事线并产出大纲/剧情结构',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    shadow: 'rgba(99, 102, 241, 0.4)',
  },
  { 
    id: 'characters', 
    name: '角色', 
    icon: Users, 
    description: '定义角色并生成定妆照',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    shadow: 'rgba(16, 185, 129, 0.4)',
  },
  { 
    id: 'items', 
    name: '物品', 
    icon: Package, 
    description: '管理道具和服装',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    shadow: 'rgba(245, 158, 11, 0.4)',
  },
  { 
    id: 'scenes', 
    name: '场景', 
    icon: Map, 
    description: '解析场景并生成概念图',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    shadow: 'rgba(236, 72, 153, 0.4)',
  },
  { 
    id: 'storyboard', 
    name: '分镜', 
    icon: LayoutGrid, 
    description: '制作分镜并生成视频',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    shadow: 'rgba(139, 92, 246, 0.4)',
  },
];

interface WorkflowStepItemProps {
  step: StepConfig;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
  isLast: boolean;
  index: number;
}

function WorkflowStepItem({ step, isActive, isCompleted, onClick, isLast, index }: WorkflowStepItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      {!isLast && (
        <div
          style={{
            position: 'absolute',
            left: '23px',
            top: '52px',
            width: '2px',
            height: 'calc(100% - 24px)',
            background: isCompleted || isActive 
              ? step.gradient 
              : 'var(--border-primary)',
            borderRadius: '1px',
            transition: 'all 0.4s ease',
            opacity: isCompleted || isActive ? 0.6 : 0.3,
          }}
        />
      )}
      
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          width: '100%',
          padding: '14px 16px',
          border: 'none',
          borderRadius: '16px',
          background: isActive 
            ? `linear-gradient(135deg, ${step.shadow.replace('0.4', '0.15')} 0%, ${step.shadow.replace('0.4', '0.08')} 100%)`
            : isHovered 
              ? 'var(--bg-hover)' 
              : 'transparent',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          textAlign: 'left',
          position: 'relative',
          overflow: 'hidden',
          transform: isHovered && !isActive ? 'translateX(4px)' : 'translateX(0)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: isActive 
              ? step.gradient 
              : isHovered 
                ? `linear-gradient(135deg, ${step.shadow.replace('0.4', '0.2')} 0%, ${step.shadow.replace('0.4', '0.1')} 100%)`
                : 'var(--bg-secondary)',
            border: isActive 
              ? 'none' 
              : `1px solid ${isHovered ? step.shadow.replace('0.4', '0.4') : 'var(--border-primary)'}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            flexShrink: 0,
            boxShadow: isActive ? `0 8px 24px ${step.shadow}` : 'none',
          }}
        >
          <step.icon style={{ 
            width: '22px', 
            height: '22px', 
            color: isActive ? 'white' : isHovered ? step.shadow.replace('0.4', '1') : 'var(--text-muted)',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: isActive ? step.shadow.replace('0.4', '1') : 'var(--text-muted)',
                  background: isActive ? `${step.shadow.replace('0.4', '0.15')}` : 'var(--bg-secondary)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  transition: 'all 0.3s ease',
                }}
              >
                步骤 {index + 1}
              </span>
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  transition: 'all 0.3s ease',
                }}
              >
                {step.name}
              </span>
            </div>
            {isActive && (
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: step.gradient,
                boxShadow: `0 0 12px ${step.shadow}`,
                animation: 'pulse 2s infinite',
              }} />
            )}
          </div>
          
          <div
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              transition: 'all 0.3s ease',
            }}
          >
            {step.description}
          </div>
        </div>

        <ChevronRight 
          style={{ 
            width: '16px', 
            height: '16px', 
            color: isActive ? step.shadow.replace('0.4', '1') : 'var(--text-muted)',
            opacity: isHovered || isActive ? 1 : 0,
            transform: isHovered ? 'translateX(2px)' : 'translateX(0)',
            transition: 'all 0.3s ease',
          }} 
        />
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
  const [isBackHovered, setIsBackHovered] = useState(false);

  const getActiveStep = (): WorkflowStepId => {
    const path = location.pathname;
    if (path.includes('/script')) return 'script';
    if (path.includes('/storyline') || path.includes('/outline')) return 'storyline';
    if (path.includes('/characters')) return 'characters';
    if (path.includes('/items')) return 'items';
    if (path.includes('/scenes')) return 'scenes';
    if (path.includes('/storyboard') || path.includes('/shots')) return 'storyboard';
    return 'script';
  };

  const activeStep = getActiveStep();
  const activeIndex = STEP_CONFIGS.findIndex(s => s.id === activeStep);

  const handleStepClick = (stepId: WorkflowStepId) => {
    onStepChange?.(stepId);
  };

  const handleBackToProjects = () => {
    navigate('/projects');
  };

  return (
    <div
      style={{
        width: '280px',
        height: '100%',
        background: 'var(--bg-sidebar)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--border-primary)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 50,
      }}
    >
      <div
        style={{
          padding: '20px',
          borderBottom: '1px solid var(--border-primary)',
        }}
      >
        <button
          onClick={handleBackToProjects}
          onMouseEnter={() => setIsBackHovered(true)}
          onMouseLeave={() => setIsBackHovered(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid var(--border-primary)',
            background: isBackHovered ? 'var(--bg-hover)' : 'transparent',
            color: isBackHovered ? 'var(--text-primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            width: '100%',
            transition: 'all 0.2s ease',
            transform: isBackHovered ? 'translateX(-2px)' : 'translateX(0)',
          }}
        >
          <ArrowLeft style={{ width: '16px', height: '16px' }} />
          <span style={{ fontSize: '14px', fontWeight: '500' }}>返回项目列表</span>
        </button>
      </div>

      <div
        style={{
          padding: '20px 20px 16px',
        }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          marginBottom: '8px',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
          }}>
            <Zap style={{ width: '16px', height: '16px', color: 'white' }} />
          </div>
          <div>
            <h3 style={{
              fontSize: '15px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              margin: 0,
            }}>
              创作流程
            </h3>
            <p style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              margin: 0,
            }}>
              步骤 {activeIndex + 1} / {STEP_CONFIGS.length}
            </p>
          </div>
        </div>

        <div style={{
          height: '4px',
          background: 'var(--bg-secondary)',
          borderRadius: '2px',
          overflow: 'hidden',
          marginTop: '12px',
        }}>
          <div style={{
            height: '100%',
            width: `${((activeIndex + 1) / STEP_CONFIGS.length) * 100}%`,
            background: 'linear-gradient(90deg, #007AFF 0%, #8b5cf6 100%)',
            borderRadius: '2px',
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }} />
        </div>
      </div>

      <div
        style={{
          flex: 1,
          padding: '8px 12px',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {STEP_CONFIGS.map((step, index) => (
            <WorkflowStepItem
              key={step.id}
              step={step}
              isActive={activeStep === step.id}
              isCompleted={index < activeIndex}
              onClick={() => handleStepClick(step.id)}
              isLast={index === STEP_CONFIGS.length - 1}
              index={index}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          padding: '16px',
          borderTop: '1px solid var(--border-primary)',
        }}
      >
        <div style={{
          padding: '16px',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
          borderRadius: '14px',
          border: '1px solid rgba(139, 92, 246, 0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Sparkles style={{ width: '16px', height: '16px', color: '#8b5cf6' }} />
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>AI 助手</span>
          </div>
          <p style={{ 
            fontSize: '12px', 
            color: 'var(--text-muted)', 
            margin: 0,
            lineHeight: '1.5',
          }}>
            每个步骤都有 AI 辅助功能，帮助您更高效地完成创作
          </p>
        </div>
      </div>

      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.6;
              transform: scale(1.2);
            }
          }
        `}
      </style>
    </div>
  );
}

export { STEP_CONFIGS };
