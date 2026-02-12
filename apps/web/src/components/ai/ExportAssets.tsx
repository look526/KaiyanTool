import { useState } from 'react';
import { Download, FileVideo, Image, CheckCircle, Loader, Settings } from 'lucide-react';

interface ExportAssetsProps {
  projectId: string;
  assets: Array<{
    id: string;
    type: 'image' | 'video';
    url: string;
    thumbnailUrl?: string;
    name?: string;
  }>;
  onExport: (options: {
    includeImages: boolean;
    includeVideos: boolean;
    format: string;
    quality: string;
  }) => Promise<void>;
}

export function ExportAssets({ assets, onExport }: ExportAssetsProps) {
  const [includeImages, setIncludeImages] = useState(true);
  const [includeVideos, setIncludeVideos] = useState(true);
  const [format, setFormat] = useState('zip');
  const [quality, setQuality] = useState('original');
  const [isExporting, setIsExporting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const imageAssets = assets.filter(a => a.type === 'image');
  const videoAssets = assets.filter(a => a.type === 'video');

  const handleExport = async () => {
    if ((!includeImages && !includeVideos) || assets.length === 0) return;
    
    setIsExporting(true);
    try {
      await onExport({ includeImages, includeVideos, format, quality });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-500" />
            导出素材
          </h3>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          共 {imageAssets.length} 张图片，{videoAssets.length} 个视频
        </p>
      </div>

      {showSettings && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">导出格式</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <option value="zip">ZIP 压缩包</option>
                <option value="folder">独立文件夹</option>
                <option value="prproj">Premiere Pro (.prproj)</option>
                <option value="aep">After Effects (.aep)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">质量</label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <option value="original">原始质量</option>
                <option value="high">高质量（压缩）</option>
                <option value="medium">中等质量</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 space-y-4">
        <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <input
            type="checkbox"
            checked={includeImages}
            onChange={(e) => setIncludeImages(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300"
          />
          <Image className="w-5 h-5 text-blue-500" />
          <div className="flex-1">
            <span className="font-medium">导出图片</span>
            <p className="text-sm text-gray-500">共 {imageAssets.length} 张，关键帧和概念图</p>
          </div>
          {includeImages && (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
        </label>

        <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <input
            type="checkbox"
            checked={includeVideos}
            onChange={(e) => setIncludeVideos(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300"
          />
          <FileVideo className="w-5 h-5 text-purple-500" />
          <div className="flex-1">
            <span className="font-medium">导出视频</span>
            <p className="text-sm text-gray-500">共 {videoAssets.length} 个视频片段</p>
          </div>
          {includeVideos && (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
        </label>

        {assets.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">预览素材</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {assets.slice(0, 10).map(asset => (
                <div key={asset.id} className="flex-shrink-0 w-20 h-14 rounded overflow-hidden bg-gray-100">
                  {asset.thumbnailUrl ? (
                    <img src={asset.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {asset.type === 'image' ? (
                        <Image className="w-6 h-6 text-gray-400" />
                      ) : (
                        <FileVideo className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  )}
                </div>
              ))}
              {assets.length > 10 && (
                <div className="flex-shrink-0 w-20 h-14 rounded bg-gray-100 flex items-center justify-center">
                  <span className="text-sm text-gray-500">+{assets.length - 10}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <button
          onClick={handleExport}
          disabled={isExporting || assets.length === 0 || (!includeImages && !includeVideos)}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isExporting ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              导出中...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              导出全部素材
            </>
          )}
        </button>
      </div>
    </div>
  );
}
