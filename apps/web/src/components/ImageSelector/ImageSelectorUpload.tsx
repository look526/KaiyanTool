import React from 'react';
import { Upload } from 'lucide-react';
import { apiClient } from '../../lib/api';
import { useToast } from '../ui/Toast';
import { useTheme } from '../../contexts/ThemeContext';
import { GlassButton } from '../ui/GlassButton';

interface ImageSelectorUploadProps {
  projectId: string;
  currentView: 'front' | 'side' | 'top';
  shouldUseThreeViews: boolean;
  threeViewsValue: { front: string | null; side: string | null; top: string | null };
  onThreeViewsChange?: (views: { front: string | null; side: string | null; top: string | null }) => void;
  onChange: (url: string | null) => void;
  onClose: () => void;
}

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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [isDragging, setIsDragging] = React.useState(false);

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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;

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
    <div style={{ padding: '16px 0' }}>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging ? '#8b5cf6' : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          borderRadius: '16px',
          padding: '48px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragging 
            ? 'rgba(139, 92, 246, 0.08)' 
            : isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
          transition: 'all 0.25s ease',
        }}
      >
        <label style={{ cursor: 'pointer', display: 'block' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Upload style={{ width: '28px', height: '28px', color: '#8b5cf6' }} />
          </div>
          <p style={{
            fontSize: '15px',
            fontWeight: '600',
            color: isDark ? '#fafafa' : '#18181b',
            marginBottom: '8px',
          }}>
            点击或拖拽上传图片
          </p>
          <p style={{
            fontSize: '13px',
            color: isDark ? 'rgba(250,250,250,0.4)' : 'rgba(24,24,27,0.4)',
          }}>
            支持 JPG、PNG、WebP、GIF 格式
          </p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleUpload}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      <div style={{ 
        marginTop: '24px', 
        padding: '16px', 
        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        borderRadius: '12px',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
      }}>
        <p style={{
          fontSize: '13px',
          color: isDark ? 'rgba(250,250,250,0.5)' : 'rgba(24,24,27,0.5)',
          textAlign: 'center',
        }}>
          未选择任何文件
        </p>
      </div>
    </div>
  );
}
