import { useState } from 'react';
import { Sparkles, Copy, Check, RefreshCw, ArrowRightLeft, X, Loader2 } from 'lucide-react';
import { Button } from './button';
import { Card } from './card';
import { apiClient } from '../../lib/api';
import { useToast } from './Toast';

interface PromptPolisherProps {
  value: string;
  onChange: (value: string) => void;
  type?: 'image' | 'video' | 'character';
  style?: string;
  placeholder?: string;
  showNegativePrompt?: boolean;
  negativeValue?: string;
  onNegativeChange?: (value: string) => void;
}

export function PromptPolisher({
  value,
  onChange,
  type = 'image',
  style,
  placeholder = '输入提示词...',
  showNegativePrompt = true,
  negativeValue = '',
  onNegativeChange,
}: PromptPolisherProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();

  const handlePolish = async () => {
    if (!value.trim()) {
      addToast({
        type: 'error',
        title: '提示词不能为空',
        message: '请先输入需要润色的提示词',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.polishPrompt(value, type, style);
      setResult(response);
      setShowResult(true);
    } catch (error) {
      addToast({
        type: 'error',
        title: '润色失败',
        message: '无法润色提示词，请稍后重试',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = async () => {
    if (!value.trim()) {
      addToast({
        type: 'error',
        title: '提示词不能为空',
        message: '请先输入需要扩展的提示词',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.expandPrompt(value, type);
      setResult(response);
      setShowResult(true);
    } catch (error) {
      addToast({
        type: 'error',
        title: '扩展失败',
        message: '无法扩展提示词，请稍后重试',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!value.trim()) {
      addToast({
        type: 'error',
        title: '提示词不能为空',
        message: '请先输入需要翻译的提示词',
      });
      return;
    }

    try {
      setLoading(true);
      const hasChinese = /[\u4e00-\u9fa5]/.test(value);
      const targetLanguage = hasChinese ? 'english' : 'chinese';
      const response = await apiClient.translatePrompt(value, targetLanguage);
      setResult(response);
      setShowResult(true);
    } catch (error) {
      addToast({
        type: 'error',
        title: '翻译失败',
        message: '无法翻译提示词，请稍后重试',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNegative = async () => {
    if (!value.trim()) {
      addToast({
        type: 'error',
        title: '提示词不能为空',
        message: '请先输入正向提示词',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.generateNegativePrompt(value, type);
      setResult(response);
      setShowResult(true);
    } catch (error) {
      addToast({
        type: 'error',
        title: '生成失败',
        message: '无法生成负面提示词，请稍后重试',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPolished = () => {
    if (result?.polished) {
      onChange(result.polished);
      if (showNegativePrompt && result.negative && onNegativeChange) {
        onNegativeChange(result.negative);
      }
      setShowResult(false);
      addToast({
        type: 'success',
        title: '已应用',
        message: '润色后的提示词已应用',
      });
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePolish}
            disabled={loading || !value.trim()}
          >
            {loading ? (
              <Loader2 style={{ width: '14px', height: '14px', marginRight: '6px', animation: 'spin 1s linear infinite' }} />
            ) : (
              <Sparkles style={{ width: '14px', height: '14px', marginRight: '6px' }} />
            )}
            润色
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExpand}
            disabled={loading || !value.trim()}
          >
            <RefreshCw style={{ width: '14px', height: '14px', marginRight: '6px' }} />
            扩展
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTranslate}
            disabled={loading || !value.trim()}
          >
            <ArrowRightLeft style={{ width: '14px', height: '14px', marginRight: '6px' }} />
            翻译
          </Button>
          {showNegativePrompt && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateNegative}
              disabled={loading || !value.trim()}
            >
              生成负面词
            </Button>
          )}
        </div>
      </div>

      {showResult && result && (
        <Card
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '8px',
            padding: '16px',
            zIndex: 100,
            maxHeight: '400px',
            overflowY: 'auto',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>AI 优化结果</h4>
            <button
              onClick={() => setShowResult(false)}
              style={{
                padding: '4px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--text-muted)',
              }}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>

          {result.polished && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)' }}>润色后</span>
                <button
                  onClick={() => handleCopy(result.polished)}
                  style={{
                    padding: '2px 6px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {copied ? <Check style={{ width: '12px', height: '12px' }} /> : <Copy style={{ width: '12px', height: '12px' }} />}
                  {copied ? '已复制' : '复制'}
                </button>
              </div>
              <div
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-hover)',
                  borderRadius: '6px',
                  fontSize: '13px',
                  lineHeight: '1.5',
                }}
              >
                {result.polished}
              </div>
            </div>
          )}

          {result.translated && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)' }}>翻译结果</span>
                <button
                  onClick={() => handleCopy(result.translated)}
                  style={{
                    padding: '2px 6px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {copied ? <Check style={{ width: '12px', height: '12px' }} /> : <Copy style={{ width: '12px', height: '12px' }} />}
                  {copied ? '已复制' : '复制'}
                </button>
              </div>
              <div
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-hover)',
                  borderRadius: '6px',
                  fontSize: '13px',
                  lineHeight: '1.5',
                }}
              >
                {result.translated}
              </div>
            </div>
          )}

          {result.negative && showNegativePrompt && (
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                负面提示词
              </span>
              <div
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '6px',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  color: '#ef4444',
                }}
              >
                {result.negative}
              </div>
            </div>
          )}

          {result.variations && result.variations.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                变体建议
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {result.variations.map((v: string, i: number) => (
                  <div
                    key={i}
                    style={{
                      padding: '6px 10px',
                      backgroundColor: 'var(--bg-hover)',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}
                  >
                    {v}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.expanded && (
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                扩展后
              </span>
              <div
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-hover)',
                  borderRadius: '6px',
                  fontSize: '13px',
                  lineHeight: '1.5',
                }}
              >
                {result.expanded}
              </div>
            </div>
          )}

          {(result.polished || result.translated || result.expanded) && (
            <Button onClick={handleApplyPolished} style={{ width: '100%', marginTop: '8px' }}>
              应用到输入框
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
