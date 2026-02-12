import { useState, useEffect, useCallback } from 'react';
import { HelpCircle, X, ChevronRight, CheckCircle } from 'lucide-react';

interface TutorialStep {
  id: string;
  target: string;
  title: string;
  content: React.ReactNode;
  position: 'top' | 'bottom' | 'left' | 'right';
}

interface InlineTutorialProps {
  tourId: string;
  steps: TutorialStep[];
  onComplete: () => void;
  onSkip: () => void;
}

export function InlineTutorial({ tourId, steps, onComplete, onSkip }: InlineTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(`tutorial_${tourId}`);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.completed) {
        return;
      }
    }
    setIsVisible(true);
  }, [tourId]);

  const current = steps[currentStep];
  const targetElement = document.querySelector(current?.target);

  useEffect(() => {
    if (current && targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetElement.classList.add('tutorial-highlight');
    }

    return () => {
      document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
      });
    };
  }, [currentStep, current]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps([...completedSteps, current.id]);
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, steps.length, completedSteps, current.id]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleComplete = useCallback(() => {
    localStorage.setItem(`tutorial_${tourId}`, JSON.stringify({ completed: true }));
    setIsVisible(false);
    onComplete();
  }, [tourId, onComplete]);

  const handleSkip = useCallback(() => {
    localStorage.setItem(`tutorial_${tourId}`, JSON.stringify({ completed: false, skipped: true }));
    setIsVisible(false);
    onSkip();
  }, [tourId, onSkip]);

  if (!isVisible || !current || !targetElement) return null;

  const rect = targetElement.getBoundingClientRect();
  const popoverStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999
  };

  switch (current.position) {
    case 'top':
      popoverStyle.top = rect.top - 180;
      popoverStyle.left = rect.left + (rect.width / 2) - 200;
      break;
    case 'bottom':
      popoverStyle.top = rect.bottom + 20;
      popoverStyle.left = rect.left + (rect.width / 2) - 200;
      break;
    case 'left':
      popoverStyle.top = rect.top + (rect.height / 2) - 100;
      popoverStyle.left = rect.right + 20;
      break;
    case 'right':
      popoverStyle.top = rect.top + (rect.height / 2) - 100;
      popoverStyle.left = rect.left - 420;
      break;
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[9998]" />

      <div
        className="absolute bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-[400px] p-6"
        style={popoverStyle}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              {currentStep + 1}
            </div>
            <span className="text-sm text-gray-500">
              {currentStep + 1} / {steps.length}
            </span>
          </div>
          <button
            onClick={handleSkip}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <h3 className="text-lg font-bold mb-2">{current.title}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{current.content}</p>

        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            跳过教程
          </button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                上一步
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-1"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  完成
                </>
              ) : (
                <>
                  {currentStep === steps.length - 2 ? (
                    <>
                      最后一步
                      <ChevronRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      下一步
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-1 mt-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`h-1 flex-1 rounded-full transition-colors ${
                index === currentStep
                  ? 'bg-blue-500'
                  : index < currentStep
                  ? 'bg-green-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>

      <style>{`
        .tutorial-highlight {
          position: relative;
          z-index: 10000 !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5) !important;
          border-radius: 4px !important;
        }
      `}</style>
    </>
  );
}

export function ContextualHelp() {
  const [showHelp, setShowHelp] = useState(false);

  const helpItems = [
    { icon: '🎬', label: '如何创建镜头？', desc: '在导演工作台中点击添加镜头按钮' },
    { icon: '🎭', label: '角色一致性设置', desc: '在角色管理中上传定妆照' },
    { icon: '🖼️', label: '九宫格使用技巧', desc: '批量生成同一场景的多个变体' },
    { icon: '📤', label: '导出到 Premiere', desc: '点击导出按钮选择 PRPROJ 格式' }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setShowHelp(!showHelp)}
        className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
        title="帮助"
      >
        <HelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      {showHelp && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowHelp(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold">快捷帮助</h3>
              <p className="text-sm text-gray-500">常见问题快速解答</p>
            </div>
            <div className="p-2">
              {helpItems.map((item, index) => (
                <button
                  key={index}
                  className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg flex items-start gap-3 transition-colors"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-sm text-gray-500">{item.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button className="w-full py-2 text-sm text-blue-500 hover:text-blue-600">
                查看完整帮助文档 →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function KeyboardShortcuts() {
  const shortcuts = [
    { key: 'Ctrl + S', action: '保存' },
    { key: 'Ctrl + Z', action: '撤销' },
    { key: 'Ctrl + Shift + Z', action: '重做' },
    { key: 'Ctrl + C', action: '复制' },
    { key: 'Ctrl + V', action: '粘贴' },
    { key: 'Delete', action: '删除选中' },
    { key: 'Space', action: '预览' },
    { key: 'Esc', action: '取消/关闭' }
  ];

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <h4 className="font-medium mb-3 flex items-center gap-2">
        <span>⌨️</span> 快捷键
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">{shortcut.action}</span>
            <kbd className="px-2 py-0.5 bg-white dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-500 font-mono text-xs">
              {shortcut.key}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );
}
