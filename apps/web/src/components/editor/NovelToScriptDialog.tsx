import React, { useState } from 'react';
import { Modal } from './Modal';

interface ScriptOptions {
  episodes: number;
  durationPerEpisode: number;
  genre: 'short_drama' | 'tv_series' | 'movie' | 'web_series';
  targetAudience: 'children' | 'teen' | 'adult' | 'general';
  tone: 'comedy' | 'tragedy' | 'action' | 'romance' | 'suspense' | 'drama' | 'sci_fi' | 'horror';
  focus: 'plot' | 'dialogue' | 'emotion' | 'action';
  keepNarrator: boolean;
  dialogueStyle: 'natural' | 'classical' | 'modern';
  includeShotList: boolean;
  endingType: 'closed' | 'open' | 'happy' | 'sad';
  customPrompt: string;
  enableCustomPrompt: boolean;
}

interface NovelToScriptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConvert: (options: ScriptOptions) => void;
  isConverting: boolean;
  novelText: string;
  editorContent: string;
}

const GENRE_OPTIONS = [
  { value: 'short_drama', label: '短剧' },
  { value: 'tv_series', label: '电视剧' },
  { value: 'movie', label: '电影' },
  { value: 'web_series', label: '网剧' },
];

const AUDIENCE_OPTIONS = [
  { value: 'general', label: '全年龄' },
  { value: 'children', label: '儿童' },
  { value: 'teen', label: '青少年' },
  { value: 'adult', label: '成人' },
];

const TONE_OPTIONS = [
  { value: 'drama', label: '剧情' },
  { value: 'comedy', label: '喜剧' },
  { value: 'action', label: '动作' },
  { value: 'romance', label: '爱情' },
  { value: 'suspense', label: '悬疑' },
  { value: 'tragedy', label: '悲剧' },
  { value: 'sci_fi', label: '科幻' },
  { value: 'horror', label: '恐怖' },
];

const FOCUS_OPTIONS = [
  { value: 'plot', label: '剧情' },
  { value: 'dialogue', label: '台词' },
  { value: 'emotion', label: '情感' },
  { value: 'action', label: '动作' },
];

const DIALOGUE_STYLE_OPTIONS = [
  { value: 'natural', label: '自然口语' },
  { value: 'classical', label: '古典雅致' },
  { value: 'modern', label: '现代时尚' },
];

const ENDING_TYPE_OPTIONS = [
  { value: 'closed', label: '闭合式' },
  { value: 'open', label: '开放式' },
  { value: 'happy', label: '大团圆' },
  { value: 'sad', label: '悲剧收尾' },
];

export function NovelToScriptDialog({
  isOpen,
  onClose,
  onConvert,
  isConverting,
  novelText,
  editorContent,
}: NovelToScriptDialogProps) {
  const [scriptOptions, setScriptOptions] = useState<ScriptOptions>({
    episodes: 12,
    durationPerEpisode: 45,
    genre: 'short_drama',
    targetAudience: 'general',
    tone: 'drama',
    focus: 'plot',
    keepNarrator: true,
    dialogueStyle: 'natural',
    includeShotList: false,
    endingType: 'closed',
    customPrompt: '',
    enableCustomPrompt: false,
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setScriptOptions(prev => ({ ...prev, customPrompt: text }));
      };
      reader.readAsText(file);
    }
  };

  const contentLength = novelText.length || editorContent.length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="小说转剧本" maxWidth="600px">
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
          上传小说文件
        </label>
        <FileUploadArea onUpload={handleFileUpload} hasFile={!!novelText} />
      </div>

      {(novelText || editorContent) && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '12px', 
          background: 'var(--bg-hover)', 
          borderRadius: '8px',
          fontSize: '12px',
          color: 'var(--text-muted)',
        }}>
          {novelText ? `已加载小说内容：${novelText.length} 字符` : `编辑器内容：${editorContent.length} 字符`}
        </div>
      )}
      
      <NumberInputRow 
        label="目标集数" 
        value={scriptOptions.episodes} 
        onChange={(v) => setScriptOptions(prev => ({ ...prev, episodes: v }))}
        suffix="集"
        min={1}
        max={100}
      />

      <NumberInputRow 
        label="每集时长" 
        value={scriptOptions.durationPerEpisode} 
        onChange={(v) => setScriptOptions(prev => ({ ...prev, durationPerEpisode: v }))}
        suffix="分钟"
        min={1}
        max={180}
      />

      <OptionSelector 
        label="作品类型" 
        options={GENRE_OPTIONS} 
        value={scriptOptions.genre} 
        onChange={(v) => setScriptOptions(prev => ({ ...prev, genre: v as any }))}
      />

      <OptionSelector 
        label="目标受众" 
        options={AUDIENCE_OPTIONS} 
        value={scriptOptions.targetAudience} 
        onChange={(v) => setScriptOptions(prev => ({ ...prev, targetAudience: v as any }))}
      />

      <OptionSelector 
        label="剧情基调" 
        options={TONE_OPTIONS} 
        value={scriptOptions.tone} 
        onChange={(v) => setScriptOptions(prev => ({ ...prev, tone: v as any }))}
      />

      <OptionSelector 
        label="改编重点" 
        options={FOCUS_OPTIONS} 
        value={scriptOptions.focus} 
        onChange={(v) => setScriptOptions(prev => ({ ...prev, focus: v as any }))}
      />

      <OptionSelector 
        label="对话风格" 
        options={DIALOGUE_STYLE_OPTIONS} 
        value={scriptOptions.dialogueStyle} 
        onChange={(v) => setScriptOptions(prev => ({ ...prev, dialogueStyle: v as any }))}
      />

      <OptionSelector 
        label="结局类型" 
        options={ENDING_TYPE_OPTIONS} 
        value={scriptOptions.endingType} 
        onChange={(v) => setScriptOptions(prev => ({ ...prev, endingType: v as any }))}
      />

      <CheckboxRow 
        label="保留旁白叙述" 
        checked={scriptOptions.keepNarrator} 
        onChange={(v) => setScriptOptions(prev => ({ ...prev, keepNarrator: v }))}
      />

      <CheckboxRow 
        label="包含分镜列表" 
        checked={scriptOptions.includeShotList} 
        onChange={(v) => setScriptOptions(prev => ({ ...prev, includeShotList: v }))}
      />

      <CheckboxRow 
        label="自定义提示词（关闭所有选项）" 
        checked={scriptOptions.enableCustomPrompt} 
        onChange={(v) => setScriptOptions(prev => ({ ...prev, enableCustomPrompt: v }))}
      />

      {scriptOptions.enableCustomPrompt && (
        <textarea
          value={scriptOptions.customPrompt}
          onChange={(e) => setScriptOptions(prev => ({ ...prev, customPrompt: e.target.value }))}
          placeholder="请输入自定义提示词，描述您希望如何将小说转换为剧本..."
          style={{
            width: '100%',
            minHeight: '120px',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid var(--border-primary)',
            background: 'var(--bg-input)',
            color: 'var(--text-primary)',
            fontSize: '14px',
            resize: 'vertical',
            marginBottom: '20px',
          }}
        />
      )}

      <ConversionSummary options={scriptOptions} />

      <DialogActions 
        onCancel={onClose} 
        onConvert={() => onConvert(scriptOptions)} 
        isConverting={isConverting} 
        disabled={!novelText && !editorContent}
      />
    </Modal>
  );
}

function FileUploadArea({ onUpload, hasFile }: { onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; hasFile: boolean }) {
  const [hover, setHover] = useState(false);

  return (
    <div style={{
      border: `2px dashed ${hover ? '#6366f1' : 'var(--border-primary)'}`,
      borderRadius: '12px',
      padding: '24px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      background: hasFile ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-surface)',
    }}
    onClick={() => document.getElementById('novel-file-input')?.click()}
    onMouseEnter={() => setHover(true)}
    onMouseLeave={() => setHover(false)}
    >
      <input 
        id="novel-file-input"
        type="file" 
        accept=".txt,.md,.novel"
        style={{ display: 'none' }}
        onChange={onUpload}
      />
      {hasFile ? (
        <div>
          <div style={{ color: '#10b981', fontSize: '24px', marginBottom: '8px' }}>✓</div>
          <div style={{ color: 'var(--text-primary)', fontWeight: '500' }}>文件已加载</div>
        </div>
      ) : (
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '24px', marginBottom: '8px' }}>📄</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            点击上传小说文件（支持 .txt, .md）
          </div>
        </div>
      )}
    </div>
  );
}

function NumberInputRow({ label, value, onChange, suffix, min, max }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix: string;
  min: number;
  max: number;
}) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'flex', alignItems: 'center', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
        {label}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 1)}
          style={{
            marginLeft: '12px',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border-primary)',
            background: 'var(--bg-input)',
            color: 'var(--text-primary)',
            width: '80px',
            fontSize: '14px',
          }}
          min={min}
          max={max}
        />
        <span style={{ marginLeft: '8px', color: 'var(--text-muted)' }}>{suffix}</span>
      </label>
    </div>
  );
}

function OptionSelector<T extends string>({ label, options, value, onChange }: {
  label: string;
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
        {label}
      </label>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {options.map(item => (
          <OptionButton 
            key={item.value} 
            label={item.label} 
            selected={value === item.value} 
            onClick={() => onChange(item.value)} 
          />
        ))}
      </div>
    </div>
  );
}

function OptionButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px',
        borderRadius: '8px',
        border: '1px solid var(--border-primary)',
        background: selected 
          ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' 
          : hover ? 'var(--bg-hover)' : 'var(--bg-elevated)',
        color: selected ? '#fff' : 'var(--text-primary)',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: selected ? '600' : '400',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {label}
    </button>
  );
}

function CheckboxRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'flex', alignItems: 'center', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          style={{ marginRight: '8px', width: '16px', height: '16px' }}
        />
        {label}
      </label>
    </div>
  );
}

function ConversionSummary({ options }: { options: ScriptOptions }) {
  const genreLabel = GENRE_OPTIONS.find(g => g.value === options.genre)?.label || '短剧';
  
  return (
    <div style={{ 
      padding: '12px', 
      background: 'var(--bg-hover)', 
      borderRadius: '8px',
      marginBottom: '20px',
      border: '1px solid var(--border-primary)',
    }}>
      <div style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>转换概览</div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
        {options.enableCustomPrompt ? (
          <span>使用自定义提示词转换</span>
        ) : (
          <>
            将小说改编为 <span style={{ color: '#8b5cf6', fontWeight: '600' }}>{options.episodes} 集</span> {genreLabel}，
            每集 <span style={{ color: '#8b5cf6', fontWeight: '600' }}>{options.durationPerEpisode} 分钟</span>，
            总时长约 <span style={{ color: '#8b5cf6', fontWeight: '600' }}>{options.episodes * options.durationPerEpisode} 分钟</span>
          </>
        )}
      </div>
    </div>
  );
}

function DialogActions({ onCancel, onConvert, isConverting, disabled }: {
  onCancel: () => void;
  onConvert: () => void;
  isConverting: boolean;
  disabled: boolean;
}) {
  const [cancelHover, setCancelHover] = useState(false);
  const [convertHover, setConvertHover] = useState(false);

  return (
    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
      <button
        onClick={onCancel}
        style={{
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
        取消
      </button>
      <button
        onClick={onConvert}
        disabled={isConverting || disabled}
        style={{
          padding: '10px 20px',
          borderRadius: '10px',
          border: 'none',
          background: (isConverting || disabled) 
            ? 'rgba(99, 102, 241, 0.5)' 
            : convertHover 
              ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
              : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          color: '#fff',
          cursor: (isConverting || disabled) ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: (isConverting || disabled) ? 'none' : '0 4px 14px rgba(99, 102, 241, 0.3)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={() => setConvertHover(true)}
        onMouseLeave={() => setConvertHover(false)}
      >
        {isConverting ? '转换中...' : '开始转换'}
      </button>
    </div>
  );
}
