import { useState } from 'react';
import { Search, Download, Upload, Star, Heart, Share2, X, ExternalLink } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  downloads: number;
  rating: number;
  isFavorite: boolean;
  previewUrl?: string;
}

interface TemplateMarketplaceProps {
  onUseTemplate: (template: Template) => void;
  onImportTemplate: (template: Template) => void;
  onExportTemplate: (template: Template) => void;
}

const featuredTemplates: Template[] = [
  {
    id: '1',
    name: '电影级人像',
    description: '专业电影质感人像摄影提示词，包含经典电影构图和光线',
    content: 'cinematic portrait, 35mm film, shallow depth of field, soft natural lighting, dramatic shadows, moody atmosphere, high contrast, film grain, anamorphic flares, vintage color grading',
    category: '人物',
    tags: ['人像', '电影感', '35mm', '光影'],
    author: 'Studio AI',
    downloads: 12580,
    rating: 4.9,
    isFavorite: true
  },
  {
    id: '2',
    name: '赛博朋克城市',
    description: '霓虹灯光与未来科技感的城市夜景',
    content: 'cyberpunk city, neon lights, rain, reflections, futuristic architecture, holograms, high tech low life, dramatic lighting, volumetric fog, rain puddles, reflections',
    category: '场景',
    tags: ['赛博朋克', '科幻', '霓虹', '夜景'],
    author: 'FutureArt',
    downloads: 8932,
    rating: 4.8,
    isFavorite: false
  },
  {
    id: '3',
    name: '梦幻森林',
    description: '童话般的梦幻森林场景，适合奇幻题材',
    content: 'dreamy forest, ethereal lighting, soft pastels, floating particles, magical glow, enchanted atmosphere, fairy tale, soft focus, morning mist, dew drops',
    category: '场景',
    tags: ['梦幻', '森林', '奇幻', '童话'],
    author: 'FantasyAI',
    downloads: 7234,
    rating: 4.7,
    isFavorite: true
  },
  {
    id: '4',
    name: '产品展示',
    description: '专业电商产品摄影提示词',
    content: 'professional product photography, clean background, studio lighting, soft shadows, commercial grade, e-commerce ready, high detail, clean composition, commercial photography',
    category: '产品',
    tags: ['产品', '电商', '商业', '摄影'],
    author: 'ProPhoto',
    downloads: 15678,
    rating: 4.9,
    isFavorite: false
  }
];

const categories = ['全部', '人物', '场景', '风格', '产品', '特效', '建筑', '自然'];

export function TemplateMarketplace({ onUseTemplate, onImportTemplate, onExportTemplate }: TemplateMarketplaceProps) {
  const [templates, setTemplates] = useState<Template[]>(featuredTemplates);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: '',
    category: '人物',
    tags: ''
  });

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === '全部' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (id: string) => {
    setTemplates(templates.map(t =>
      t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
    ));
  };

  const handleUploadTemplate = () => {
    if (!newTemplate.name.trim() || !newTemplate.content.trim()) return;

    const template: Template = {
      id: `custom_${Date.now()}`,
      name: newTemplate.name,
      description: '自定义模板',
      content: newTemplate.content,
      category: newTemplate.category,
      tags: newTemplate.tags.split(',').map(t => t.trim()).filter(Boolean),
      author: '我',
      downloads: 0,
      rating: 0,
      isFavorite: false
    };

    setTemplates([template, ...templates]);
    setShowUploadDialog(false);
    setNewTemplate({ name: '', content: '', category: '人物', tags: '' });
    onImportTemplate(template);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold">提示词模板市场</h3>
          </div>
          <button
            onClick={() => setShowUploadDialog(true)}
            className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-1 transition-colors"
          >
            <Upload className="w-4 h-4" />
            上传模板
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索模板..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                  {template.category}
                </span>
                {template.isFavorite && (
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleFavorite(template.id)}
                  className="p-1 text-gray-400 hover:text-yellow-500"
                >
                  <Heart className={`w-4 h-4 ${template.isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                </button>
                <button className="p-1 text-gray-400 hover:text-blue-500">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h4 className="font-medium mb-1">{template.name}</h4>
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{template.description}</p>

            <div className="flex flex-wrap gap-1 mb-3">
              {template.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
              <span>by {template.author}</span>
              <span className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                {template.downloads.toLocaleString()}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onUseTemplate(template)}
                className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
              >
                使用模板
              </button>
              <button
                onClick={() => onExportTemplate(template)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showUploadDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-[500px] max-w-full">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">上传自定义模板</h4>
              <button onClick={() => setShowUploadDialog(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">模板名称</label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="输入模板名称..."
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">分类</label>
                <select
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  {categories.slice(1).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">提示词内容</label>
                <textarea
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                  placeholder="输入提示词内容..."
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg min-h-[100px] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">标签（逗号分隔）</label>
                <input
                  type="text"
                  value={newTemplate.tags}
                  onChange={(e) => setNewTemplate({ ...newTemplate, tags: e.target.value })}
                  placeholder="人像, 电影感, 光影..."
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowUploadDialog(false)}
                  className="flex-1 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  取消
                </button>
                <button
                  onClick={handleUploadTemplate}
                  disabled={!newTemplate.name.trim() || !newTemplate.content.trim()}
                  className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
                >
                  上传并使用
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
