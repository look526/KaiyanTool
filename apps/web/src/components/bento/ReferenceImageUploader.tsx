import React, { useState, useCallback } from 'react';
import { BentoCardMedium } from './BentoCardMedium';
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';

export interface ReferenceImage {
  id: string;
  file: File;
  preview: string;
  strength?: number;
}

interface ReferenceImageUploaderProps {
  images: ReferenceImage[];
  onUpload: (images: File[]) => void;
  onRemove: (id: string) => void;
  onStrengthChange?: (id: string, strength: number) => void;
  maxImages?: number;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

export function ReferenceImageUploader({
  images,
  onUpload,
  onRemove,
  onStrengthChange,
  maxImages = 4,
  accept = 'image/*',
  maxSizeMB = 10,
  className = ''
}: ReferenceImageUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const validateFile = useCallback((file: File): string | null => {
    if (!accept.includes(file.type) && !accept.includes('*')) {
      return '不支持的文件类型';
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `文件大小不能超过 ${maxSizeMB}MB`;
    }
    return null;
  }, [accept, maxSizeMB]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else if (validFiles.length < maxImages - images.length) {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      console.warn('Upload errors:', errors);
    }

    if (validFiles.length > 0) {
      setUploading(true);
      setTimeout(() => {
        onUpload(validFiles);
        setUploading(false);
      }, 300);
    }
  }, [images.length, maxImages, onUpload, validateFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];

    files.forEach((file) => {
      const error = validateFile(file);
      if (!error && validFiles.length < maxImages - images.length) {
        validFiles.push(file);
      }
    });

    if (validFiles.length > 0) {
      setUploading(true);
      setTimeout(() => {
        onUpload(validFiles);
        setUploading(false);
      }, 300);
    }

    e.target.value = '';
  }, [images.length, maxImages, onUpload, validateFile]);

  return (
    <BentoCardMedium className={`reference-uploader ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold">参考图</h3>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {images.length}/{maxImages}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <img
              src={image.preview}
              alt={`参考图${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={() => onRemove(image.id)}
                className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        ))}

        {images.length < maxImages && (
          <label
            className={`
              aspect-square rounded-lg border-2 border-dashed 
              flex flex-col items-center justify-center cursor-pointer
              transition-all duration-300
              ${dragOver 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
              }
              ${uploading ? 'pointer-events-none opacity-50' : ''}
            `}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept={accept}
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <Plus className="w-6 h-6 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">
              {uploading ? '上传中...' : '添加图片'}
            </span>
          </label>
        )}
      </div>

      {onStrengthChange && images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">参考强度</label>
            <span className="text-xs text-gray-500">
              {images[0]?.strength || 50}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            defaultValue={50}
            onChange={(e) => {
              const strength = parseInt(e.target.value);
              images.forEach(img => onStrengthChange(img.id, strength));
            }}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>弱</span>
            <span>中</span>
            <span>强</span>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-3">
        支持 JPG、PNG、WEBP 格式，最大 {maxSizeMB}MB
      </p>
    </BentoCardMedium>
  );
}

export default ReferenceImageUploader;
