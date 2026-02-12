import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image as ImageIcon, Wand2, RefreshCw } from 'lucide-react';

interface VisualPromptGeneratorProps {
  projectId: string;
  onGenerate: (params: {
    prompt: string;
    characterRef?: string;
    sceneRef?: string;
    width?: number;
    height?: number;
  }) => Promise<void>;
}

export function VisualPromptGenerator({ onGenerate }: VisualPromptGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [characterRef, setCharacterRef] = useState<string | null>(null);
  const [sceneRef, setSceneRef] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState('16:9');

  const onDropCharacter = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCharacterRef(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const onDropScene = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSceneRef(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps: getCharacterProps, getInputProps: getCharacterInput } = useDropzone({
    onDrop: onDropCharacter,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    maxFiles: 1
  });

  const { getRootProps: getSceneProps, getInputProps: getSceneInput } = useDropzone({
    onDrop: onDropScene,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    maxFiles: 1
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      await onGenerate({
        prompt,
        characterRef: characterRef || undefined,
        sceneRef: sceneRef || undefined,
        width: aspectRatio === '16:9' ? 1024 : aspectRatio === '9:16' ? 576 : 1024,
        height: aspectRatio === '16:9' ? 576 : aspectRatio === '9:16' ? 1024 : 1024
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold mb-4">AI 图像生成</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">提示词</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="描述你想要的画面...（例如：一个年轻女孩在樱花树下，微笑，阳光明媚）"
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 min-h-[100px] resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">角色参考图</label>
            <div
              {...getCharacterProps()}
              className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors"
            >
              <input {...getCharacterInput()} />
              {characterRef ? (
                <img src={characterRef} alt="Character ref" className="max-h-32 mx-auto rounded" />
              ) : (
                <div className="py-8">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">点击或拖拽上传角色参考</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">场景参考图</label>
            <div
              {...getSceneProps()}
              className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors"
            >
              <input {...getSceneInput()} />
              {sceneRef ? (
                <img src={sceneRef} alt="Scene ref" className="max-h-32 mx-auto rounded" />
              ) : (
                <div className="py-8">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">点击或拖拽上传场景参考</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">宽高比</label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
            >
              <option value="16:9">16:9 横向</option>
              <option value="9:16">9:16 纵向</option>
              <option value="1:1">1:1 正方形</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              生成图像
            </>
          )}
        </button>
      </div>
    </div>
  );
}
