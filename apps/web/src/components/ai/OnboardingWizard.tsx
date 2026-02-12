import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Check, Sparkles, FileText, Image, Video, Download, X, Play } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface OnboardingWizardProps {
  onComplete: () => void;
  onSkip: () => void;
}

const steps: TutorialStep[] = [
  {
    id: 'welcome',
    title: '欢迎使用 AI 内容创作平台',
    description: '一个强大的 AI 驱动的内容创作工具，帮助您从灵感到成片全流程自动化。',
    icon: <Sparkles className="w-12 h-12 text-purple-500" />
  },
  {
    id: 'script',
    title: '智能剧本创作',
    description: '输入您的小说或故事创意，AI 将自动拆解为专业分镜脚本，包含场景、角色、镜头等结构化信息。',
    icon: <FileText className="w-12 h-12 text-blue-500" />
  },
  {
    id: 'assets',
    title: '角色与场景资产',
    description: '生成角色定妆照和场景概念图，确保全片视觉风格统一，角色形象一致。',
    icon: <Image className="w-12 h-12 text-green-500" />
  },
  {
    id: 'director',
    title: '导演工作台',
    description: '在网格化界面中管理所有镜头，精准控制起始帧和结束帧，AI 自动生成平滑过渡视频。',
    icon: <Video className="w-12 h-12 text-orange-500" />
  },
  {
    id: 'export',
    title: '专业导出',
    description: '一键导出所有关键帧和视频片段，支持 Premiere Pro 和 After Effects 格式。',
    icon: <Download className="w-12 h-12 text-cyan-500" />
  }
];

export function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('hasSeenOnboarding');
    if (seen) {
      setHasSeenOnboarding(true);
      onSkip();
    }
  }, [onSkip]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setIsVisible(false);
    onSkip();
  };

  if (hasSeenOnboarding || !isVisible) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-500" />
              <span className="text-sm text-gray-500">
                步骤 {currentStep + 1} / {steps.length}
              </span>
            </div>
            <button
              onClick={handleSkip}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  index <= currentStep
                    ? 'bg-purple-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-full">
              {step.icon}
            </div>

            <h2 className="text-2xl font-bold mb-3">{step.title}</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              {step.description}
            </p>

            {step.action && (
              <button
                onClick={step.action.onClick}
                className="mt-6 px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                {step.action.label}
              </button>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentStep === 0
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              上一步
            </button>

            <div className="flex gap-2">
              {steps.map((s, index) => (
                <div
                  key={s.id}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-purple-500'
                      : index < currentStep
                      ? 'bg-green-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <Check className="w-5 h-5" />
                  开始使用
                </>
              ) : (
                <>
                  下一步
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TooltipTour() {
  return null;
}

export function ContextualHelp() {
  return null;
}
