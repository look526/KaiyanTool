import React, { useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  type?: 'character' | 'scene' | 'general';
  placeholder?: string;
  maxSize?: number;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  type = 'general',
  placeholder = '点击上传图像',
  maxSize = 5 * 1024 * 1024,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutedTextColor = theme === 'dark' ? '#a1a1aa' : '#64748b';
  const borderColor = theme === 'dark' ? '#27272a' : '#e2e8f0';
  const inputBg = theme === 'dark' ? '#09090b' : '#f8fafc';

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      setError('仅支持 JPEG、PNG、WebP 格式的图片');
      return;
    }

    if (file.size > maxSize) {
      setError(`文件大小不能超过 ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const endpoint = type === 'character' 
        ? '/upload/images/character' 
        : type === 'scene' 
          ? '/upload/images/scene' 
          : '/upload/images';

      const response = await fetch(`${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('上传失败');
      }

      const data = await response.json();
      onChange(data.url);
    } catch (err) {
      console.error('上传失败:', err);
      setError('上传失败，请重试');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange(null);
    setError(null);
  };

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={disabled || uploading}
      />

      {value ? (
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '320px',
          aspectRatio: '16/9',
          borderRadius: '12px',
          overflow: 'hidden',
          border: `2px solid ${borderColor}`,
        }}>
          <img
            src={value}
            alt="上传的图片"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          {!disabled && (
            <button
              onClick={handleRemove}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.9)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
              }}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={handleClick}
          disabled={disabled || uploading}
          style={{
            width: '100%',
            maxWidth: '320px',
            aspectRatio: '16/9',
            borderRadius: '12px',
            border: `2px dashed ${borderColor}`,
            backgroundColor: inputBg,
            color: mutedTextColor,
            cursor: disabled || uploading ? 'not-allowed' : 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            transition: 'all 0.2s ease',
            opacity: disabled ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!disabled && !uploading) {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.color = 'var(--accent)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = borderColor;
            e.currentTarget.style.color = mutedTextColor;
          }}
        >
          {uploading ? (
            <Loader2 style={{ width: '32px', height: '32px' }} className="animate-spin" />
          ) : (
            <>
              <Upload style={{ width: '40px', height: '40px', color: mutedTextColor }} />
              <span style={{ fontSize: '14px' }}>{placeholder}</span>
            </>
          )}
        </button>
      )}

      {error && (
        <p style={{
          marginTop: '8px',
          fontSize: '13px',
          color: '#dc2626',
          textAlign: 'center',
        }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
