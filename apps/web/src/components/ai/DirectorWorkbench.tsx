import { useState } from 'react';
import { Grid, Settings, Play, Layers, Camera, Zap, Eye, Monitor } from 'lucide-react';

interface Shot {
  id: string;
  sequence: number;
  type: 'establishing' | 'wide' | 'medium' | 'closeup' | 'extreme-closeup' | 'insert';
  description: string;
  startFrame?: string;
  endFrame?: string;
  status: 'pending' | 'ready' | 'generating' | 'completed';
}

interface DirectorWorkbenchProps {
  projectId: string;
  shots: Shot[];
  onShotUpdate?: (shot: Shot) => void;
  onGenerateShot?: (shotId: string, type: 'start' | 'end' | 'video') => void;
}

const shotTypes = [
  { value: 'establishing', label: '建立镜头', icon: '🏙️' },
  { value: 'wide', label: '全景', icon: '🌄' },
  { value: 'medium', label: '中景', icon: '👤' },
  { value: 'closeup', label: '近景', icon: '🎭' },
  { value: 'extreme-closeup', label: '特写', icon: '👁️' },
  { value: 'insert', label: '插入镜头', icon: '📍' }
] as const;

export function DirectorWorkbench({
  shots: initialShots,
  onShotUpdate,
  onGenerateShot
}: DirectorWorkbenchProps) {
  const [shots, setShots] = useState<Shot[]>(initialShots);
  const [selectedShot, setSelectedShot] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSettings, setShowSettings] = useState(false);

  const selectedShotData = shots.find(s => s.id === selectedShot);

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Monitor className="w-6 h-6 text-blue-400" />
          <h2 className="text-lg font-semibold">导演工作台</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-gray-700'
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-gray-700'
            }`}
          >
            <Layers className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors ${
              showSettings ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-gray-700'
            }`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-4 overflow-auto">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-3 gap-4">
              {shots.map((shot) => (
                <ShotCard
                  key={shot.id}
                  shot={shot}
                  isSelected={selectedShot === shot.id}
                  onSelect={() => setSelectedShot(shot.id)}
                  onGenerate={onGenerateShot}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {shots.map((shot) => (
                <ShotListItem
                  key={shot.id}
                  shot={shot}
                  isSelected={selectedShot === shot.id}
                  onSelect={() => setSelectedShot(shot.id)}
                  onGenerate={onGenerateShot}
                />
              ))}
            </div>
          )}
        </div>

        {selectedShotData && (
          <div className="w-80 border-l border-gray-700 p-4 overflow-auto">
            <ShotDetailPanel
              shot={selectedShotData}
              onUpdate={(shot) => {
                setShots(prev => prev.map(s => s.id === shot.id ? shot : s));
                onShotUpdate?.(shot);
              }}
              onGenerate={onGenerateShot}
            />
          </div>
        )}
      </div>

      {showSettings && (
        <WorkbenchSettings onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

interface ShotCardProps {
  shot: Shot;
  isSelected: boolean;
  onSelect: () => void;
  onGenerate?: (shotId: string, type: 'start' | 'end' | 'video') => void;
}

function ShotCard({ shot, isSelected, onSelect, onGenerate }: ShotCardProps) {
  const typeInfo = shotTypes.find(t => t.value === shot.type);

  return (
    <div
      onClick={onSelect}
      className={`relative bg-gray-800 rounded-xl overflow-hidden cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-gray-600'
      }`}
    >
      <div className="aspect-video relative">
        {shot.startFrame ? (
          <img src={shot.startFrame} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-700">
            <Camera className="w-12 h-12 text-gray-500" />
          </div>
        )}

        <div className="absolute top-2 left-2">
          <span className="px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded text-xs">
            {typeInfo?.icon} {typeInfo?.label}
          </span>
        </div>

        <div className="absolute top-2 right-2">
          {shot.status === 'completed' && (
            <span className="px-2 py-0.5 bg-green-500/80 backdrop-blur-sm rounded text-xs">
              ✓ 完成
            </span>
          )}
          {shot.status === 'generating' && (
            <span className="px-2 py-0.5 bg-blue-500/80 backdrop-blur-sm rounded text-xs animate-pulse">
              生成中...
            </span>
          )}
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">镜头 {shot.sequence}</span>
          <span className="text-xs text-gray-400">{shot.type}</span>
        </div>
        <p className="text-xs text-gray-400 line-clamp-2">{shot.description}</p>

        {shot.status === 'ready' && onGenerate && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onGenerate(shot.id, 'start');
              }}
              className="flex-1 py-1.5 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition-colors"
            >
              起始帧
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onGenerate(shot.id, 'end');
              }}
              className="flex-1 py-1.5 text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded transition-colors"
            >
              结束帧
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ShotListItem({ shot, isSelected, onSelect, onGenerate }: ShotCardProps) {
  const typeInfo = shotTypes.find(t => t.value === shot.type);

  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-500/20' : 'hover:bg-gray-800'
      }`}
    >
      <div className="w-24 h-14 bg-gray-700 rounded overflow-hidden flex-shrink-0">
        {shot.startFrame ? (
          <img src={shot.startFrame} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Camera className="w-6 h-6 text-gray-500" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">镜头 {shot.sequence}</span>
          <span className="text-xs text-gray-400">{typeInfo?.label}</span>
        </div>
        <p className="text-sm text-gray-400 truncate">{shot.description}</p>
      </div>

      <div className="flex items-center gap-2">
        {shot.status === 'ready' && onGenerate && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onGenerate(shot.id, 'start');
              }}
              className="px-3 py-1 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded"
            >
              起始帧
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onGenerate(shot.id, 'end');
              }}
              className="px-3 py-1 text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded"
            >
              结束帧
            </button>
          </>
        )}
        {shot.status === 'completed' && (
          <button className="px-3 py-1 text-xs bg-green-500/20 text-green-400 rounded">
            <Play className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

interface ShotDetailPanelProps {
  shot: Shot;
  onUpdate: (shot: Shot) => void;
  onGenerate?: (shotId: string, type: 'start' | 'end' | 'video') => void;
}

function ShotDetailPanel({ shot, onUpdate, onGenerate }: ShotDetailPanelProps) {
  const [editDescription, setEditDescription] = useState(shot.description);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Layers className="w-5 h-5 text-blue-400" />
        <h3 className="font-semibold">镜头详情</h3>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">镜头类型</label>
        <select
          value={shot.type}
          onChange={(e) => onUpdate({ ...shot, type: e.target.value as Shot['type'] })}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
        >
          {shotTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.icon} {type.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">镜头描述</label>
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          onBlur={() => onUpdate({ ...shot, description: editDescription })}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg min-h-[80px] resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="aspect-video bg-gray-700 rounded-lg overflow-hidden">
          {shot.startFrame ? (
            <img src={shot.startFrame} alt="Start" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
              <Camera className="w-8 h-8 mb-1" />
              <span className="text-xs">起始帧</span>
            </div>
          )}
        </div>
        <div className="aspect-video bg-gray-700 rounded-lg overflow-hidden">
          {shot.endFrame ? (
            <img src={shot.endFrame} alt="End" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
              <Camera className="w-8 h-8 mb-1" />
              <span className="text-xs">结束帧</span>
            </div>
          )}
        </div>
      </div>

      {shot.startFrame && shot.endFrame && onGenerate && (
        <button
          onClick={() => onGenerate(shot.id, 'video')}
          className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
        >
          <Zap className="w-5 h-5" />
          生成视频
        </button>
      )}

      <div className="flex items-center gap-2 text-sm text-gray-400 pt-4 border-t border-gray-700">
        <Eye className="w-4 h-4" />
        <span>上下文感知已启用</span>
      </div>
      <p className="text-xs text-gray-500">
        生成时将自动参考当前场景和角色服装图，确保画面一致性。
      </p>
    </div>
  );
}

function WorkbenchSettings({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-96 max-w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">工作台设置</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">×</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" defaultChecked className="rounded" />
              启用上下文感知生成
            </label>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" defaultChecked className="rounded" />
              自动保存进度
            </label>
          </div>
          <div>
            <label className="block text-sm mb-2">默认视频时长</label>
            <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg">
              <option value="3">3 秒</option>
              <option value="5">5 秒</option>
              <option value="8">8 秒</option>
              <option value="10">10 秒</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
