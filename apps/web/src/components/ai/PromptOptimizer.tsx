import { useState } from 'react';
import { Search, Star, Copy, Save, X, Tag, Clock } from 'lucide-react';

interface PromptTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  tags: string[];
  usageCount: number;
  isFavorite: boolean;
  createdAt: string;
}

interface PromptOptimizerProps {
  initialPrompt?: string;
  onOptimize: (prompt: string) => Promise<string>;
  onSave?: (prompt: string, name: string, category: string) => void;
}

const defaultTemplates: PromptTemplate[] = [
  {
    id: '1',
    name: '电影感人像',
    content: 'cinematic portrait, 35mm film, shallow depth of field, soft natural lighting, dramatic shadows, moody atmosphere, high contrast, film grain',
    category: '人物',
    tags: ['人像', '电影感', '35mm'],
    usageCount: 128,
    isFavorite: true,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: '梦幻场景',
    content: 'dreamy atmosphere, soft ethereal lighting, pastel colors, magical glow, floating elements, fantasy landscape, enchanted forest',
    category: '场景',
    tags: ['梦幻', '魔法', '幻想'],
    usageCount: 89,
    isFavorite: false,
    createdAt: '2024-01-20'
  },
  {
    id: '3',
    name: '赛博朋克',
    content: 'cyberpunk city, neon lights, rain, reflections, futuristic architecture, holograms, high tech, low life, dramatic lighting',
    category: '风格',
    tags: ['赛博朋克', '科幻', '霓虹'],
    usageCount: 256,
    isFavorite: true,
    createdAt: '2024-02-01'
  }
];

export function PromptOptimizer({ initialPrompt = '', onOptimize, onSave }: PromptOptimizerProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [templates, setTemplates] = useState<PromptTemplate[]>(defaultTemplates);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveCategory, setSaveCategory] = useState('未分类');

  const categories = ['全部', '人物', '场景', '风格', '特效', '其他'];

  const handleOptimize = async () => {
    if (!prompt.trim()) return;
    
    setIsOptimizing(true);
    try {
      const result = await onOptimize(prompt);
      setOptimizedPrompt(result);
    } finally {
      setIsOptimizing(false);
    }
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || selectedCategory === '全部' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const useTemplate = (template: PromptTemplate) => {
    setPrompt(template.content);
    setTemplates(prev =>
      prev.map(t =>
        t.id === template.id ? { ...t, usageCount: t.usageCount + 1 } : t
      )
    );
  };

  const toggleFavorite = (id: string) => {
    setTemplates(prev =>
      prev.map(t => t.id === id ? { ...t, isFavorite: !t.isFavorite } : t)
    );
  };

  const handleSave = () => {
    if (!saveName.trim() || !optimizedPrompt.trim()) return;
    
    onSave?.(optimizedPrompt, saveName, saveCategory);
    setShowSaveDialog(false);
    setSaveName('');
    setSaveCategory('未分类');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold flex items-center gap-2">
          <Tag className="w-5 h-5 text-blue-500" />
          提示词优化器
        </h3>
      </div>

      <div className="flex">
        <div className="w-1/2 p-4 border-r border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">原始提示词</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="输入你的原始提示词..."
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 min-h-[120px] resize-none"
              />
            </div>

            <button
              onClick={handleOptimize}
              disabled={isOptimizing || !prompt.trim()}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isOptimizing ? (
                <>优化中...</>
              ) : (
                <>AI 优化</>
              )}
            </button>

            {optimizedPrompt && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">优化后提示词</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigator.clipboard.writeText(optimizedPrompt)}
                      className="p-1 text-gray-400 hover:text-blue-500"
                      title="复制"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowSaveDialog(true)}
                      className="p-1 text-gray-400 hover:text-green-500"
                      title="保存到模板"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300 whitespace-pre-wrap">
                    {optimizedPrompt}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-1/2 p-4">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索提示词模板..."
                className="flex-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat === '全部' ? null : cat)}
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                    selectedCategory === cat || (cat === '全部' && !selectedCategory)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFavorite(template.id)}
                      className={template.isFavorite ? 'text-yellow-500' : 'text-gray-300'}
                    >
                      <Star className="w-4 h-4" />
                    </button>
                    <span className="font-medium text-sm">{template.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded">
                      {template.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {template.usageCount}次
                    </span>
                    <button
                      onClick={() => useTemplate(template)}
                      className="px-2 py-0.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      使用
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{template.content}</p>
                <div className="flex gap-1 mt-2">
                  {template.tags.map(tag => (
                    <span key={tag} className="text-xs px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">保存到模板库</h4>
              <button onClick={() => setShowSaveDialog(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">模板名称</label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="输入模板名称..."
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">分类</label>
                <select
                  value={saveCategory}
                  onChange={(e) => setSaveCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  {categories.slice(1).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSave}
                disabled={!saveName.trim()}
                className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
