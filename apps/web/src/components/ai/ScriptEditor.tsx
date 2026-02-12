import { useState } from 'react';
import { Save, Edit2, Eye, User, MessageSquare, Clapperboard, Sparkles } from 'lucide-react';

interface ScriptElement {
  id: string;
  type: 'scene' | 'character' | 'shot' | 'dialogue' | 'action';
  content: string;
  metadata?: Record<string, any>;
}

interface ScriptEditorProps {
  initialScript?: ScriptElement[];
  onSave: (script: ScriptElement[]) => Promise<void>;
  onAutoGenerate: () => Promise<ScriptElement[]>;
}

export function ScriptEditor({ initialScript = [], onSave, onAutoGenerate }: ScriptEditorProps) {
  const [script, setScript] = useState<ScriptElement[]>(initialScript);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  const addElement = (type: ScriptElement['type'], defaultContent = '') => {
    const newElement: ScriptElement = {
      id: `element_${Date.now()}`,
      type,
      content: defaultContent
    };
    setScript([...script, newElement]);
    setEditingId(newElement.id);
    setEditContent(defaultContent);
  };

  const updateElement = (id: string, content: string, metadata?: Record<string, any>) => {
    setScript(script.map(el => 
      el.id === id ? { ...el, content, metadata: { ...el.metadata, ...metadata } } : el
    ));
  };

  const deleteElement = (id: string) => {
    setScript(script.filter(el => el.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(script);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoGenerate = async () => {
    setIsGenerating(true);
    try {
      const generated = await onAutoGenerate();
      setScript(generated);
    } finally {
      setIsGenerating(false);
    }
  };

  const getElementIcon = (type: ScriptElement['type']) => {
    switch (type) {
      case 'scene':
        return <Clapperboard className="w-4 h-4 text-orange-500" />;
      case 'character':
        return <User className="w-4 h-4 text-blue-500" />;
      case 'shot':
        return <Eye className="w-4 h-4 text-purple-500" />;
      case 'dialogue':
        return <MessageSquare className="w-4 h-4 text-green-500" />;
      case 'action':
        return <Sparkles className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getElementLabel = (type: ScriptElement['type']) => {
    switch (type) {
      case 'scene':
        return '场景';
      case 'character':
        return '角色';
      case 'shot':
        return '镜头';
      case 'dialogue':
        return '台词';
      case 'action':
        return '动作';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold">剧本手动编辑</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
              className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Eye className="w-4 h-4" />
              {viewMode === 'edit' ? '预览' : '编辑'}
            </button>
            <button
              onClick={handleAutoGenerate}
              disabled={isGenerating}
              className="px-3 py-1.5 text-sm bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg flex items-center gap-1 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? '生成中...' : 'AI 增强'}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <span className="text-sm text-gray-500">添加元素：</span>
          <button
            onClick={() => addElement('scene', '新场景...')}
            className="px-3 py-1 text-sm bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
          >
            场景
          </button>
          <button
            onClick={() => addElement('character', '新角色...')}
            className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          >
            角色
          </button>
          <button
            onClick={() => addElement('shot', '镜头描述...')}
            className="px-3 py-1 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
          >
            镜头
          </button>
          <button
            onClick={() => addElement('action', '动作描述...')}
            className="px-3 py-1 text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
          >
            动作
          </button>
          <button
            onClick={() => addElement('dialogue', '台词内容...')}
            className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
          >
            台词
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
        {script.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Clapperboard className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>剧本为空，点击上方按钮添加元素</p>
            <p className="text-sm mt-2">或使用「AI 增强」自动生成</p>
          </div>
        ) : (
          script.map((element, index) => (
            <div
              key={element.id}
              className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex-shrink-0 mt-1">
                {getElementIcon(element.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-500">
                    {getElementLabel(element.type)} {index + 1}
                  </span>
                  {element.metadata?.prompt && (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                      有视觉提示词
                    </span>
                  )}
                </div>

                {editingId === element.id ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onBlur={() => {
                      updateElement(element.id, editContent);
                      setEditingId(null);
                    }}
                    autoFocus
                    className="w-full px-3 py-2 border border-blue-500 rounded-lg bg-white dark:bg-gray-800 min-h-[60px] resize-none"
                  />
                ) : (
                  <p
                    onClick={() => {
                      setEditingId(element.id);
                      setEditContent(element.content);
                    }}
                    className="text-sm text-gray-700 dark:text-gray-300 cursor-text"
                  >
                    {element.content}
                  </p>
                )}
              </div>

              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingId(element.id);
                    setEditContent(element.content);
                  }}
                  className="p-1.5 text-gray-400 hover:text-blue-500 rounded"
                  title="编辑"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteElement(element.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded"
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {script.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>共 {script.length} 个元素</span>
            <div className="flex gap-4">
              <span>{script.filter(e => e.type === 'scene').length} 场景</span>
              <span>{script.filter(e => e.type === 'shot').length} 镜头</span>
              <span>{script.filter(e => e.type === 'character').length} 角色</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Trash2({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}
