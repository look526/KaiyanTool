import React, { useState } from 'react';
import { History, RotateCcw, Tag, Trash2, Download, GitBranch, Eye, Clock, ChevronRight, Search, Filter } from 'lucide-react';

interface Version {
  id: string;
  version: number;
  name: string;
  description?: string;
  tags: string[];
  hash: string;
  createdAt: string;
  createdBy?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface VersionHistoryProps {
  projectId: string;
  versions: Version[];
  onRevert: (versionId: string) => void;
  onCompare: (versionId1: string, versionId2: string) => void;
  onAddTag: (versionId: string, tag: string) => void;
  onDelete: (versionId: string) => void;
  onCreateSnapshot: () => void;
}

export function VersionHistory({
  projectId,
  versions,
  onRevert,
  onCompare,
  onAddTag,
  onDelete,
  onCreateSnapshot
}: VersionHistoryProps) {
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [showTagDialog, setShowTagDialog] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);

  const handleVersionSelect = (versionId: string) => {
    if (selectedVersions.length === 2) {
      setSelectedVersions([versionId]);
    } else if (selectedVersions.includes(versionId)) {
      setSelectedVersions(selectedVersions.filter(v => v !== versionId));
    } else {
      setSelectedVersions([...selectedVersions, versionId]);
    }
  };

  const handleCompare = () => {
    if (selectedVersions.length === 2) {
      onCompare(selectedVersions[0], selectedVersions[1]);
    }
  };

  const handleAddTag = (versionId: string) => {
    if (newTag.trim()) {
      onAddTag(versionId, newTag.trim());
      setShowTagDialog(null);
      setNewTag('');
    }
  };

  const filteredVersions = versions.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         v.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !filterTag || v.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  const allTags = [...new Set(versions.flatMap(v => v.tags))];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold">版本历史</h3>
            <span className="text-sm text-gray-500">({versions.length} 个版本)</span>
          </div>
          <button
            onClick={onCreateSnapshot}
            className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-1"
          >
            <GitBranch className="w-4 h-4" />
            保存快照
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索版本..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm"
            />
          </div>
          {allTags.length > 0 && (
            <select
              value={filterTag || ''}
              onChange={(e) => setFilterTag(e.target.value || null)}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm"
            >
              <option value="">全部标签</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          )}
        </div>

        {selectedVersions.length === 2 && (
          <button
            onClick={handleCompare}
            className="w-full py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            比较选中版本
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
        {filteredVersions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>暂无版本历史</p>
            <p className="text-sm mt-2">创建第一个快照开始追踪版本变化</p>
          </div>
        ) : (
          filteredVersions.map((version) => (
            <div
              key={version.id}
              className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${
                selectedVersions.includes(version.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedVersions.includes(version.id)}
                  onChange={() => handleVersionSelect(version.id)}
                  className="mt-1 rounded"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">v{version.version}</span>
                    <span className="text-sm text-gray-500">{version.name}</span>
                    {version.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  {version.description && (
                    <p className="text-sm text-gray-500 mb-2">{version.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(version.createdAt).toLocaleString()}
                    </span>
                    {version.createdBy && (
                      <span>{version.createdBy.name}</span>
                    )}
                    <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded">
                      {version.hash}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowTagDialog(version.id)}
                    className="p-2 text-gray-400 hover:text-blue-500"
                    title="添加标签"
                  >
                    <Tag className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onRevert(version.id)}
                    className="p-2 text-gray-400 hover:text-green-500"
                    title="回滚到此版本"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(version.id)}
                    className="p-2 text-gray-400 hover:text-red-500"
                    title="删除版本"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showTagDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96">
            <h4 className="font-semibold mb-4">添加标签</h4>
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="输入标签..."
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowTagDialog(null)}
                className="flex-1 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={() => handleAddTag(showTagDialog)}
                disabled={!newTag.trim()}
                className="flex-1 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface VersionDiffProps {
  version1: { id: string; name: string; version: number };
  version2: { id: string; name: string; version: number };
  differences: {
    shots: { addedCount: number; removedCount: number; modifiedCount: number };
    characters: { addedCount: number; removedCount: number; modifiedCount: number };
    scenes: { addedCount: number; removedCount: number; modifiedCount: number };
    assets: { addedCount: number; removedCount: number; modifiedCount: number };
  };
  summary: {
    totalChanges: number;
    majorChanges: number;
    minorChanges: number;
  };
}

export function VersionDiff({
  version1,
  version2,
  differences,
  summary
}: VersionDiffProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
            v{version1.version}
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
          <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
            v{version2.version}
          </div>
        </div>
        <div className="text-sm text-gray-500">
          共 {summary.totalChanges} 处变更
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{differences.shots.modifiedCount}</div>
          <div className="text-sm text-gray-500">镜头修改</div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{differences.characters.modifiedCount}</div>
          <div className="text-sm text-gray-500">角色修改</div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">{differences.scenes.modifiedCount}</div>
          <div className="text-sm text-gray-500">场景修改</div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
          <div className="text-2xl font-bold text-cyan-600">{differences.assets.modifiedCount}</div>
          <div className="text-sm text-gray-500">素材修改</div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <span className="text-red-600">删除的内容</span>
          <span className="font-medium">
            {differences.shots.removedCount + differences.characters.removedCount + differences.scenes.removedCount} 项
          </span>
        </div>
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <span className="text-green-600">新增的内容</span>
          <span className="font-medium">
            {differences.shots.addedCount + differences.characters.addedCount + differences.scenes.addedCount} 项
          </span>
        </div>
      </div>
    </div>
  );
}
