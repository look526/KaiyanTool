import React, { useState } from 'react';
import { Modal } from './Modal';
import { FileText, Check, X } from 'lucide-react';

interface FormatConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  formatted_text: string;
  metadata?: {
    episodes: number;
    minutes_per_episode: number;
  };
}

export function FormatConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  formatted_text,
  metadata,
}: FormatConfirmDialogProps) {
  const [confirmHover, setConfirmHover] = useState(false);
  const [cancelHover, setCancelHover] = useState(false);

  const preview_text = formatted_text.length > 500 
    ? formatted_text.substring(0, 500) + '...' 
    : formatted_text;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="剧本格式转换完成" maxWidth="600px">
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(16, 185, 129, 0.2)',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Check style={{ width: '20px', height: '20px', color: '#fff' }} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
              转换成功
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {metadata ? `${metadata.episodes} 集，每集 ${metadata.minutes_per_episode} 分钟` : '剧本格式转换完成'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
        }}>
          <FileText style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
            预览（前500字）
          </span>
        </div>
        <div style={{
          background: 'var(--bg-hover)',
          borderRadius: '12px',
          padding: '16px',
          maxHeight: '200px',
          overflow: 'auto',
          fontFamily: 'monospace',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          border: '1px solid var(--border-primary)',
          lineHeight: '1.6',
        }}>
          {preview_text}
        </div>
        <div style={{
          marginTop: '8px',
          fontSize: '12px',
          color: 'var(--text-muted)',
        }}>
          共 {formatted_text.length} 字符
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '10px',
            border: '1px solid var(--border-primary)',
            background: cancelHover ? 'var(--bg-hover)' : 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={() => setCancelHover(true)}
          onMouseLeave={() => setCancelHover(false)}
        >
          <X style={{ width: '16px', height: '16px' }} />
          取消
        </button>
        <button
          onClick={onConfirm}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '10px',
            border: 'none',
            background: confirmHover
              ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
              : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: confirmHover
              ? '0 8px 24px rgba(16, 185, 129, 0.4)'
              : '0 4px 14px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={() => setConfirmHover(true)}
          onMouseLeave={() => setConfirmHover(false)}
        >
          <FileText style={{ width: '16px', height: '16px' }} />
          保存为剧本
        </button>
      </div>
    </Modal>
  );
}
