import React, { useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = '600px' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      backgroundColor: 'rgba(0, 0, 0, 0.5)', 
      backdropFilter: 'blur(4px)',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      zIndex: 1000,
      padding: '20px',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-elevated)',
        borderRadius: '20px',
        maxWidth,
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        border: '1px solid var(--border-primary)',
        animation: 'modalIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }} onClick={(e) => e.stopPropagation()}>
        <ModalHeader title={title} onClose={onClose} />
        <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
          {children}
        </div>
      </div>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  const [closeHover, setCloseHover] = useState(false);

  return (
    <div style={{ 
      padding: '24px', 
      borderBottom: '1px solid var(--border-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>{title}</h2>
      <button 
        onClick={onClose}
        style={{
          background: closeHover ? 'var(--bg-hover)' : 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '8px',
          fontSize: '20px',
          borderRadius: '8px',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={() => setCloseHover(true)}
        onMouseLeave={() => setCloseHover(false)}
      >
        ×
      </button>
    </div>
  );
}

interface DownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  title: string;
  onApply: () => void;
}

export function DownloadDialog({ isOpen, onClose, content, title, onApply }: DownloadDialogProps) {
  const [applyHover, setApplyHover] = useState(false);
  const [downloadHover, setDownloadHover] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title || '剧本'}_改编.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="转换结果">
      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.6' }}>
        转换结果较长（{content.length} 字符），建议下载文件保存。
      </p>
      
      <div style={{ 
        background: 'var(--bg-hover)', 
        borderRadius: '12px', 
        padding: '16px',
        maxHeight: '200px',
        overflow: 'auto',
        marginBottom: '20px',
        fontFamily: 'monospace',
        fontSize: '12px',
        color: 'var(--text-muted)',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {content.substring(0, 1000)}...
      </div>
      
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button
          onClick={onApply}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            border: '1px solid var(--border-primary)',
            background: applyHover ? 'var(--bg-hover)' : 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={() => setApplyHover(true)}
          onMouseLeave={() => setApplyHover(false)}
        >
          应用到编辑器
        </button>
        <button
          onClick={handleDownload}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            border: 'none',
            background: downloadHover 
              ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
              : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: downloadHover ? '0 8px 24px rgba(99, 102, 241, 0.4)' : '0 4px 14px rgba(99, 102, 241, 0.3)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={() => setDownloadHover(true)}
          onMouseLeave={() => setDownloadHover(false)}
        >
          下载文件
        </button>
      </div>
    </Modal>
  );
}
