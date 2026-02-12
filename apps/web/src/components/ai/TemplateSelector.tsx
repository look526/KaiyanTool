import { useState } from 'react';
import { Copy, FolderOpen, Star, Eye, Download, X } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  downloads: number;
  rating: number;
  createdAt: string;
  createdBy?: {
    name: string;
    avatar?: string;
  };
  _count?: {
    usedBy: number;
  };
}

interface TemplateSelectorProps {
  templates: Template[];
  onSelect: (templateId: string) => void;
  onCreateFromProject?: () => void;
}

const categories = [
  { id: 'all', name: '全部' },
  { id: 'film', name: '电影' },
  { id: 'short', name: '短视频' },
  { id: 'animation', name: '动画' },
  { id: 'commercial', name: '商业' },
  { id: 'education', name: '教育' },
  { id: 'gaming', name: '游戏' }
];

export function TemplateSelector({
  templates,
  onSelect,
  onCreateFromProject
}: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold">项目模板</h3>
          </div>
          {onCreateFromProject && (
            <button
              onClick={onCreateFromProject}
              className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center gap-1"
            >
              <Copy className="w-4 h-4" />
              从项目创建
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索模板..."
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 grid grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
        {filteredTemplates.map(template => (
          <TemplateCard
            key={template.id}
            template={template}
            onClick={() => onSelect(template.id)}
          />
        ))}
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  onClick
}: {
  template: Template;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors group"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
          {template.category}
        </span>
        {template.isPublic && (
          <Eye className="w-4 h-4 text-green-500" />
        )}
      </div>

      <h4 className="font-medium mb-1 group-hover:text-blue-500 transition-colors">{template.name}</h4>
      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{template.description}</p>

      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Download className="w-3 h-3" />
          {template.downloads}
        </span>
        <span className="flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-500" />
          {template.rating.toFixed(1)}
        </span>
        <span>{template._count?.usedBy || 0}次使用</span>
      </div>

      {template.createdBy && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs">
            {template.createdBy.name[0]}
          </div>
          <span className="text-xs text-gray-500">{template.createdBy.name}</span>
        </div>
      )}
    </div>
  );
}

interface TemplateCreatorProps {
  onCreate: (template: {
    name: string;
    description: string;
    category: string;
    tags: string[];
    isPublic: boolean;
  }) => void;
  onCancel: () => void;
}

export function TemplateCreator({ onCreate, onCancel }: TemplateCreatorProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('film');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const handleCreate = () => {
    if (!name.trim()) return;

    onCreate({
      name: name.trim(),
      description: description.trim(),
      category,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      isPublic
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-[500px] max-w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">创建项目模板</h3>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">模板名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入模板名称..."
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述模板用途..."
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg min-h-[80px] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">分类</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              {categories.slice(1).map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">标签（逗号分隔）</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="电影, 短片, 剧情..."
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">公开模板（其他用户可使用）</span>
          </label>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            取消
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="flex-1 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
          >
            创建模板
          </button>
        </div>
      </div>
    </div>
  );
}
