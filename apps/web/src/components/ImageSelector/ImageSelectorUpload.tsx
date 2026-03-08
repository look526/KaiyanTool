import React from 'react';
import { Upload } from 'lucide-react';
import { apiClient } from '../../lib/api';
import { useToast } from '../ui/Toast';

interface ImageSelectorUploadProps {
  projectId: string;
  currentView: 'front' | 'side' | 'top';
  shouldUseThreeViews: boolean;
  threeViewsValue: { front: string | null; side: string | null; top: string | null };
  onThreeViewsChange?: (views: { front: string | null; side: string | null; top: string | null }) => void;
  onChange: (url: string | null) => void;
  onClose: () => void;
}

/**
 * Upload tab for ImageSelector
 */
export function ImageSelectorUpload({
  projectId,
  currentView,
  shouldUseThreeViews,
  threeViewsValue,
  onThreeViewsChange,
  onChange,
  onClose,
}: ImageSelectorUploadProps) {
  const { addToast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await apiClient.uploadImage(file, projectId);
      
      if (shouldUseThreeViews) {
        if (onThreeViewsChange) {
          onThreeViewsChange({
            ...threeViewsValue,
            [currentView]: result.url
          });
        }
      } else {
        onChange(result.url);
        onClose();
      }
    } catch (error) {
      console.error('Upload failed:', error);
      addToast({
        type: 'error',
        title: '上传失败',
        message: '请稍后重试',
      });
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-10 text-center cursor-pointer transition-all duration-200">
      <label className="flex flex-col items-center cursor-pointer">
        <Upload className="w-12 h-12 text-gray-500 dark:text-gray-400 mb-3" />
        <p className="text-base text-primary-900 dark:text-primary-100 mb-2">点击或拖拽上传图片</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">支持 JPG、PNG、WebP、GIF 格式</p>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
      </label>
    </div>
  );
}
