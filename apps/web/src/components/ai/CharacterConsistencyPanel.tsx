import { useState } from 'react';
import { Plus, Eye, Trash2, Image as ImageIcon, Star } from 'lucide-react';

interface CharacterRef {
  id: string;
  type: 'base' | 'outfit' | 'expression' | 'angle';
  imageUrl: string;
  prompt: string;
  name?: string;
}

interface CharacterConsistencyPanelProps {
  characterId: string;
  characterName: string;
  refs: CharacterRef[];
  onAddRef: (type: CharacterRef['type'], imageUrl: string, prompt: string, name?: string) => void;
  onDeleteRef: (refId: string) => void;
  onSelectRef: (ref: CharacterRef) => void;
}

export function CharacterConsistencyPanel({
  characterName,
  refs,
  onAddRef,
  onDeleteRef,
  onSelectRef
}: CharacterConsistencyPanelProps) {
  const [activeTab, setActiveTab] = useState<'base' | 'outfit' | 'expression' | 'angle'>('base');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newRefType, setNewRefType] = useState<CharacterRef['type']>('base');
  const [newRefImage, setNewRefImage] = useState('');
  const [newRefPrompt, setNewRefPrompt] = useState('');
  const [newRefName, setNewRefName] = useState('');

  const baseRefs = refs.filter(r => r.type === 'base');
  const outfitRefs = refs.filter(r => r.type === 'outfit');
  const expressionRefs = refs.filter(r => r.type === 'expression');
  const angleRefs = refs.filter(r => r.type === 'angle');

  const handleAddRef = () => {
    if (!newRefImage.trim() || !newRefPrompt.trim()) return;
    onAddRef(newRefType, newRefImage, newRefPrompt, newRefName || undefined);
    setShowAddDialog(false);
    setNewRefImage('');
    setNewRefPrompt('');
    setNewRefName('');
  };

  const tabs = [
    { id: 'base', label: '定妆照', icon: '🎭', count: baseRefs.length },
    { id: 'outfit', label: '服装', icon: '👗', count: outfitRefs.length },
    { id: 'expression', label: '表情', icon: '😊', count: expressionRefs.length },
    { id: 'angle', label: '角度', icon: '📐', count: angleRefs.length }
  ] as const;

  const currentRefs = {
    base: baseRefs,
    outfit: outfitRefs,
    expression: expressionRefs,
    angle: angleRefs
  }[activeTab];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold">{characterName} - 一致性参考</h3>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span className="flex items-center justify-center gap-1">
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                  {tab.count}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {currentRefs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>暂无{tabs.find(t => t.id === activeTab)?.label}参考</p>
            <button
              onClick={() => {
                setNewRefType(activeTab);
                setShowAddDialog(true);
              }}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              添加参考图
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => {
                setNewRefType(activeTab);
                setShowAddDialog(true);
              }}
              className="aspect-square rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors"
            >
              <Plus className="w-8 h-8 mb-1" />
              <span className="text-sm">添加</span>
            </button>
            {currentRefs.map(ref => (
              <div
                key={ref.id}
                className="relative group aspect-square rounded-lg overflow-hidden cursor-pointer"
                onClick={() => onSelectRef(ref)}
              >
                <img src={ref.imageUrl} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <button className="p-1.5 bg-white/20 hover:bg-white/30 rounded text-white">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRef(ref.id);
                    }}
                    className="p-1.5 bg-red-500/50 hover:bg-red-500/70 rounded text-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {ref.name && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="text-xs text-white truncate">{ref.name}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-[500px] max-w-full">
            <h4 className="font-semibold mb-4">
              添加{tabs.find(t => t.id === newRefType)?.label}参考
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">参考图 URL</label>
                <input
                  type="text"
                  value={newRefImage}
                  onChange={(e) => setNewRefImage(e.target.value)}
                  placeholder="输入图片 URL 或上传..."
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
                />
              </div>
              {newRefType === 'outfit' && (
                <div>
                  <label className="block text-sm mb-1">服装名称</label>
                  <input
                    type="text"
                    value={newRefName}
                    onChange={(e) => setNewRefName(e.target.value)}
                    placeholder="例如：日常装、战斗装、礼服..."
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm mb-1">提示词</label>
                <textarea
                  value={newRefPrompt}
                  onChange={(e) => setNewRefPrompt(e.target.value)}
                  placeholder="描述这张参考图的特征..."
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg min-h-[80px] resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddDialog(false)}
                  className="flex-1 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  取消
                </button>
                <button
                  onClick={handleAddRef}
                  disabled={!newRefImage.trim() || !newRefPrompt.trim()}
                  className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
