import { useState, useEffect } from 'react';
import { X, Save, FileText, Users, MapPin, Package, Check, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';

interface SceneItem {
  id: string;
  number: number;
  heading: string;
  location: string;
  time?: string;
  description?: string;
  characters: string[];
  dialogues: Array<{ characterName: string; text: string }>;
  actions: Array<{ description: string; type: string }>;
  items?: Array<{ name: string; size: string; shape: string; color: string }>;
}

interface CharacterItem {
  id: string;
  name: string;
  description?: string;
  lines: number;
  personality?: string[];
  costume?: {
    type: string;
    color: string;
    material: string;
    decoration: string;
  };
  appearance?: {
    hairStyle: string;
    facialFeatures: string;
    bodyProportion: string;
    otherDetails: string[];
  };
}

interface ParsePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    segmentId: string;
    scenes: SceneItem[];
    characters: CharacterItem[];
  };
  onSave: () => void;
}

export function ParsePreview({ isOpen, onClose, data, onSave }: ParsePreviewProps) {
  const [activeTab, setActiveTab] = useState<'scenes' | 'characters'>('scenes');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      validateData();
    }
  }, [isOpen, data]);

  const validateData = () => {
    const errors: string[] = [];

    data.scenes.forEach((scene, index) => {
      if (!scene.heading) {
        errors.push(`场景 ${index + 1}：缺少场景标题`);
      }
      if (!scene.location) {
        errors.push(`场景 ${index + 1}：缺少地点信息`);
      }
      if (scene.description && scene.description.length < 150) {
        errors.push(`场景 ${index + 1}：描述长度不足150字（当前${scene.description.length}字）`);
      }
      if (scene.description && scene.description.length > 300) {
        errors.push(`场景 ${index + 1}：描述长度超过300字（当前${scene.description.length}字）`);
      }
    });

    data.characters.forEach((character, index) => {
      if (!character.name) {
        errors.push(`角色 ${index + 1}：缺少角色名称`);
      }
      if (!character.personality || character.personality.length < 3) {
        errors.push(`角色 ${character.name || index + 1}：性格特质少于3个`);
      }
      if (!character.costume || !character.costume.type) {
        errors.push(`角色 ${character.name || index + 1}：缺少服装信息`);
      }
      if (!character.appearance || !character.appearance.hairStyle) {
        errors.push(`角色 ${character.name || index + 1}：缺少相貌信息`);
      }
    });

    setValidationErrors(errors);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">解析结果预览</h2>
            <p className="text-sm text-gray-500 mt-1">
              共解析到 {data.scenes.length} 个场景，{data.characters.length} 个角色
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {validationErrors.length > 0 && (
          <div className="mx-6 mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800 mb-2">格式验证警告</h3>
                <ul className="space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-sm text-yellow-700">
                      • {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('scenes')}
            className={`flex-1 py-3 px-6 font-medium transition-colors ${
              activeTab === 'scenes'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              场景列表 ({data.scenes.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('characters')}
            className={`flex-1 py-3 px-6 font-medium transition-colors ${
              activeTab === 'characters'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              角色列表 ({data.characters.length})
            </div>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'scenes' ? (
            <div className="space-y-6">
              {data.scenes.map((scene, index) => (
                <div
                  key={scene.id}
                  className="bg-gray-50 rounded-lg p-6 border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium">
                          场景 {scene.number}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {scene.heading}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {scene.location}
                        </span>
                        {scene.time && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {scene.time}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {scene.description && (
                    <div className="mb-4 p-3 bg-white rounded border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        场景描述
                        {scene.description.length >= 150 && scene.description.length <= 300 && (
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            ✓ 格式正确
                          </span>
                        )}
                        {scene.description.length < 150 && (
                          <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                            ✗ 过短（{scene.description.length}字）
                          </span>
                        )}
                        {scene.description.length > 300 && (
                          <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                            ✗ 过长（{scene.description.length}字）
                          </span>
                        )}
                      </h4>
                      <p className="text-gray-800 leading-relaxed">{scene.description}</p>
                    </div>
                  )}
                  {scene.characters.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">出场角色</h4>
                      <div className="flex flex-wrap gap-2">
                        {scene.characters.map((char) => (
                          <span
                            key={char}
                            className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                          >
                            {char}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {scene.dialogues.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">对话</h4>
                      <div className="space-y-2">
                        {scene.dialogues.map((dialogue, idx) => (
                          <div key={idx} className="bg-white rounded p-3 border border-gray-200">
                            <span className="font-semibold text-blue-600">
                              {dialogue.characterName}：
                            </span>
                            <span className="text-gray-800">{dialogue.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {scene.actions.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">动作</h4>
                      <div className="space-y-1">
                        {scene.actions.map((action, idx) => (
                          <div key={idx} className="text-gray-700">
                            • {action.description}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {scene.items && scene.items.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">物品信息</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {scene.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-white rounded p-3 border border-gray-200"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Package className="w-4 h-4 text-orange-600" />
                              <span className="font-medium text-gray-900">
                                {item.name}
                              </span>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div>尺寸：{item.size}</div>
                              <div>形状：{item.shape}</div>
                              <div>颜色：{item.color}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {data.characters.map((character, index) => (
                <div
                  key={character.id}
                  className="bg-gray-50 rounded-lg p-6 border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded font-medium">
                          角色 {index + 1}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {character.name}
                        </h3>
                      </div>
                      <div className="text-sm text-gray-600">
                        对话行数：{character.lines}
                      </div>
                    </div>
                  </div>
                  {character.description && (
                    <div className="mb-4 p-3 bg-white rounded border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        角色描述
                      </h4>
                      <p className="text-gray-800 leading-relaxed">
                        {character.description}
                      </p>
                    </div>
                  )}
                  {character.personality && character.personality.length >= 3 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        性格特征
                        {character.personality.length >= 3 && (
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            ✓ 满足要求（{character.personality.length}个特质）
                          </span>
                        )}
                        {character.personality.length < 3 && (
                          <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                            ✗ 不足（{character.personality.length}个特质）
                          </span>
                        )}
                      </h4>
                      <div className="space-y-2">
                        {character.personality.map((trait, idx) => (
                          <div
                            key={idx}
                            className="bg-white rounded p-2 border border-gray-200 text-sm text-gray-700"
                          >
                            {trait}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {character.costume && (
                    <div className="mb-4 grid grid-cols-2 gap-3">
                      <div className="bg-white rounded p-3 border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          服装信息
                        </h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>类型：{character.costume.type}</div>
                          <div>颜色：{character.costume.color}</div>
                          <div>材质：{character.costume.material}</div>
                          <div>装饰：{character.costume.decoration}</div>
                        </div>
                      </div>
                      {character.appearance && (
                        <div className="bg-white rounded p-3 border border-gray-200">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            相貌特征
                            {character.appearance.otherDetails &&
                              character.appearance.otherDetails.length >= 3 && (
                                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                  ✓ 满足要求（{character.appearance.otherDetails.length + 3}个细节）
                                </span>
                              )}
                          </h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div>发型：{character.appearance.hairStyle}</div>
                            <div>五官：{character.appearance.facialFeatures}</div>
                            <div>身材：{character.appearance.bodyProportion}</div>
                            {character.appearance.otherDetails &&
                              character.appearance.otherDetails.map((detail, idx) => (
                                <div key={idx}>其他：{detail}</div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button
            onClick={onClose}
            variant="outline"
          >
            返回编辑器
          </Button>
          <Button
            onClick={onSave}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            <Save className="w-4 h-4" />
            保存解析结果
          </Button>
        </div>
      </div>
    </div>
  );
}
