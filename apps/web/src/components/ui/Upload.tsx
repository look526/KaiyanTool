import React, { useState, useRef, useCallback } from 'react';
import { X, File, Image, Film, Music, FileText, CheckCircle, AlertCircle, Plus } from 'lucide-react';

export type UploadFileStatus = 'pending' | 'uploading' | 'success' | 'error';

export interface UploadFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  preview?: string;
  status: UploadFileStatus;
  percent?: number;
  error?: string;
  originFile?: File;
}

export interface UploadProps {
  action?: string;
  name?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxCount?: number;
  directory?: boolean;
  draggable?: boolean;
  listType?: 'text' | 'picture' | 'picture-card';
  fileList?: UploadFile[];
  defaultFileList?: UploadFile[];
  onChange?: (fileList: UploadFile[]) => void;
  onRemove?: (file: UploadFile) => void;
  onPreview?: (file: UploadFile) => void;
  onDrop?: (files: File[]) => void;
  beforeUpload?: (file: File, fileList: File[]) => boolean | Promise<boolean>;
  customRequest?: (option: {
    onProgress: (percent: number) => void;
    onSuccess: (response: any) => void;
    onError: (error: Error) => void;
    file: File;
  }) => void;
  disabled?: boolean;
  className?: string;
  tip?: React.ReactNode;
  children?: React.ReactNode;
}

export interface UploadDraggerProps extends UploadProps {
  height?: number;
  children?: React.ReactNode;
}

const FILE_TYPE_ICONS: Record<string, React.ReactNode> = {
  'image': <Image style={{ width: '40px', height: '40px', color: 'var(--accent)' }} />,
  'video': <Film style={{ width: '40px', height: '40px', color: 'var(--primary)' }} />,
  'audio': <Music style={{ width: '40px', height: '40px', color: 'var(--success)' }} />,
  'pdf': <FileText style={{ width: '40px', height: '40px', color: 'var(--error)' }} />,
  'default': <File style={{ width: '40px', height: '40px', color: 'var(--text-tertiary)' }} />,
};

const getFileType = (file: File | UploadFile): string => {
  if ('type' in file && file.type) {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.includes('pdf')) return 'pdf';
  }
  return 'default';
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export function Upload({
  action,
  name = 'file',
  accept,
  multiple = false,
  maxSize,
  maxCount,
  directory = false,
  draggable = true,
  listType = 'text',
  fileList: controlledFileList,
  defaultFileList = [],
  onChange,
  onRemove,
  onDrop,
  beforeUpload,
  customRequest,
  disabled = false,
  className,
  tip,
}: UploadProps) {
  const [fileList, setFileList] = useState<UploadFile[]>(defaultFileList);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isControlled = controlledFileList !== undefined;

  const currentFileList = isControlled ? controlledFileList : fileList;

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];

    for (const file of fileArray) {
      if (maxSize && file.size > maxSize) {
        console.warn(`文件 "${file.name}" 大小超过限制 (${formatFileSize(maxSize)})`);
        continue;
      }

      if (maxCount && currentFileList.length + validFiles.length >= maxCount) {
        console.warn(`文件数量超过限制 (${maxCount})`);
        break;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    if (beforeUpload) {
      const result = await beforeUpload(validFiles[0], validFiles);
      if (result === false) return;
    }

    const newFiles: UploadFile[] = validFiles.map(file => ({
      id: generateId(),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
      originFile: file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));

    const updatedList = [...currentFileList, ...newFiles].slice(0, maxCount || undefined);

    if (!isControlled) {
      setFileList(updatedList);
    }
    onChange?.(updatedList);

    if (action || customRequest) {
      newFiles.forEach(uploadFile => {
        uploadFile.status = 'uploading';
        if (!isControlled) {
          setFileList([...currentFileList, ...newFiles]);
        }

        const handleProgress = (percent: number) => {
          uploadFile.percent = percent;
          if (!isControlled) {
            setFileList(prev => prev.map(f => f.id === uploadFile.id ? { ...f, percent } : f));
          }
        };

        const handleSuccess = (response: any) => {
          uploadFile.status = 'success';
          uploadFile.url = response?.url || response?.data?.url;
          if (!isControlled) {
            setFileList(prev => prev.map(f => f.id === uploadFile.id ? { ...f, status: 'success', percent: 100 } : f));
          }
          onChange?.(isControlled ? controlledFileList! : [...currentFileList, ...newFiles]);
        };

        const handleError = (error: Error) => {
          uploadFile.status = 'error';
          uploadFile.error = error.message;
          if (!isControlled) {
            setFileList(prev => prev.map(f => f.id === uploadFile.id ? { ...f, status: 'error' } : f));
          }
        };

        if (customRequest) {
          customRequest({
            onProgress: handleProgress,
            onSuccess: handleSuccess,
            onError: handleError,
            file: uploadFile.originFile!,
          });
        } else if (action) {
          const formData = new FormData();
          formData.append(name, uploadFile.originFile!);

          const xhr = new XMLHttpRequest();
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              handleProgress(Math.round((e.loaded / e.total) * 100));
            }
          });
          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                handleSuccess(response);
              } catch {
                handleSuccess({ url: xhr.responseText });
              }
            } else {
              handleError(new Error(`上传失败 (${xhr.status})`));
            }
          });
          xhr.addEventListener('error', () => {
            handleError(new Error('网络错误'));
          });
          xhr.open('POST', action);
          xhr.send(formData);
        }
      });
    }
  }, [action, name, maxSize, maxCount, beforeUpload, customRequest, onChange, isControlled, currentFileList, controlledFileList]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, [disabled]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const dt = e.dataTransfer;
    const files = directory ? dt.files : dt.files;

    onDrop?.(Array.from(files));
    handleFiles(files);
  }, [disabled, directory, onDrop, handleFiles]);

  const handleSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = '';
  }, [handleFiles]);

  const handleRemove = useCallback((file: UploadFile) => {
    if (disabled) return;

    if (file.preview) {
      URL.revokeObjectURL(file.preview);
    }

    const updatedList = currentFileList.filter(f => f.id !== file.id);

    if (!isControlled) {
      setFileList(updatedList);
    }
    onRemove?.(file);
    onChange?.(updatedList);
  }, [disabled, currentFileList, onRemove, onChange, isControlled]);

  const triggerSelect = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const renderUploadButton = () => {
    const content = (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: listType === 'picture-card' ? '8px' : '32px',
          border: `2px dashed ${dragActive ? 'var(--accent)' : 'var(--border-primary)'}`,
          borderRadius: '8px',
          backgroundColor: dragActive ? 'var(--accent-bg)' : 'transparent',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          opacity: disabled ? 0.5 : 1,
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = dragActive ? 'var(--accent)' : 'var(--border-primary)';
            e.currentTarget.style.backgroundColor = dragActive ? 'var(--accent-bg)' : 'transparent';
          }
        }}
      >
        <div style={{
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          background: 'var(--accent-bg)',
          color: 'var(--accent)',
        }}>
          <Plus style={{ width: '24px', height: '24px' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
            点击或拖拽文件到此处上传
          </div>
          {accept && (
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
              支持 {accept.split(',').map(t => t.replace(/^\./, '').toUpperCase()).join(', ')} 格式
            </div>
          )}
          {maxSize && (
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              单个文件大小限制: {formatFileSize(maxSize)}
            </div>
          )}
        </div>
      </div>
    );

    return (
      <div
        onClick={triggerSelect}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
      >
        {content}
      </div>
    );
  };

  const renderFileList = () => {
    if (listType === 'picture-card') {
      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: '8px',
          marginTop: '8px',
        }}>
          {currentFileList.map(file => (
            <div
              key={file.id}
              style={{
                position: 'relative',
                width: '100px',
                height: '100px',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid var(--border-primary)',
              }}
            >
              {file.preview ? (
                <img
                  src={file.preview}
                  alt={file.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--bg-secondary)',
                }}>
                  {FILE_TYPE_ICONS[getFileType(file)]}
                </div>
              )}
              {file.status === 'uploading' && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid rgba(255, 255, 255, 0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }} />
                </div>
              )}
              {file.status === 'error' && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'var(--error)',
                }}>
                  <AlertCircle style={{ width: '24px', height: '24px' }} />
                </div>
              )}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (file.status !== 'uploading') {
                    handleRemove(file);
                  }
                }}
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--error)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: file.status !== 'uploading' ? 'pointer' : 'not-allowed',
                  opacity: 0.8,
                }}
              >
                <X style={{ width: '14px', height: '14px' }} />
              </div>
              {file.status === 'success' && (
                <div style={{
                  position: 'absolute',
                  bottom: '4px',
                  left: '4px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--success)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <CheckCircle style={{ width: '14px', height: '14px' }} />
                </div>
              )}
            </div>
          ))}
          {(!maxCount || currentFileList.length < maxCount) && renderUploadButton()}
        </div>
      );
    }

    return (
      <div style={{ marginTop: '8px' }}>
        {currentFileList.map(file => (
          <div
            key={file.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              border: '1px solid var(--border-primary)',
              borderRadius: '8px',
              marginBottom: '8px',
              backgroundColor: 'var(--bg-base)',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '6px',
              overflow: 'hidden',
              backgroundColor: 'var(--bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {file.preview ? (
                <img src={file.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                FILE_TYPE_ICONS[getFileType(file)]
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {file.name}
              </div>
              <div style={{
                fontSize: '12px',
                color: 'var(--text-tertiary)',
                marginTop: '2px',
              }}>
                {formatFileSize(file.size)}
                {file.status === 'uploading' && ` · ${file.percent}%`}
                {file.status === 'error' && ` · ${file.error || '上传失败'}`}
              </div>
              {file.status === 'uploading' && (
                <div style={{
                  marginTop: '6px',
                  height: '4px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${file.percent || 0}%`,
                    height: '100%',
                    backgroundColor: 'var(--accent)',
                    borderRadius: '2px',
                    transition: 'width 0.2s ease',
                  }} />
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {file.status === 'success' && (
                <CheckCircle style={{ width: '18px', height: '18px', color: 'var(--success)' }} />
              )}
              {file.status === 'error' && (
                <AlertCircle style={{ width: '18px', height: '18px', color: 'var(--error)' }} />
              )}
              <div
                onClick={() => file.status !== 'uploading' && handleRemove(file)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: file.status !== 'uploading' ? 'pointer' : 'not-allowed',
                  color: 'var(--text-tertiary)',
                  transition: 'all 0.15s ease',
                }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </div>
            </div>
          </div>
        ))}
        {(!maxCount || currentFileList.length < maxCount) && (
          <div onClick={triggerSelect} style={{ cursor: 'pointer' }}>
            {renderUploadButton()}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple && !directory}
        {...(directory ? { directory: '', webkitdirectory: '' } : {})}
        onChange={handleSelect}
        style={{ display: 'none' }}
      />
      {!currentFileList.length && draggable ? renderUploadButton() : null}
      {currentFileList.length > 0 && renderFileList()}
      {tip && (
        <div style={{
          fontSize: '12px',
          color: 'var(--text-tertiary)',
          marginTop: '8px',
        }}>
          {tip}
        </div>
      )}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export function UploadDragger({
  height = 180,
  children,
  ...props
}: UploadDraggerProps) {
  return (
    <div
      style={{
        position: 'relative',
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Upload {...props} draggable={false}>
        {children}
      </Upload>
    </div>
  );
}
