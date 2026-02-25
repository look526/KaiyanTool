import { useState } from 'react';
import { 
  Maximize2, 
  Eraser, 
  Palette, 
  User, 
  Sun, 
  Image as ImageIcon,
  Film,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../ui/Toast';
import { apiClient } from '../../lib/api-client';

interface ImageEnhancementPanelProps {
  imageId: string;
  imageUrl: string;
  onComplete?: (result: any) => void;
}

type EnhancementType = 'super-resolution' | 'upscale' | 'inpainting' | 'background-removal' | 'face-enhancement' | 'color-correction' | 'style-transfer' | 'image-to-video';

interface EnhancementOption {
  id: EnhancementType;
  label: string;
  description: string;
  icon: React.ReactNode;
  params?: Record<string, any>;
}

export function ImageEnhancementPanel({ imageId, imageUrl, onComplete }: ImageEnhancementPanelProps) {
  const { theme } = useTheme();
  const { addToast } = useToast();
  
  const [selectedEnhancement, setSelectedEnhancement] = useState<EnhancementType | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const [scale, setScale] = useState(2);
  const [maskPrompt, setMaskPrompt] = useState('');
  const [strength, setStrength] = useState(50);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [tint, setTint] = useState(0);

  const textColor = theme === 'dark' ? '#ffffff' : '#0f172a';
  const mutedTextColor = theme === 'dark' ? '#a1a1aa' : '#64748b';
  const cardBg = theme === 'dark' ? '#18181b' : '#ffffff';
  const borderColor = theme === 'dark' ? '#27272a' : '#e2e8f0';
  const inputBg = theme === 'dark' ? '#18181b' : '#f8fafc';

  const enhancementOptions: EnhancementOption[] = [
    {
      id: 'super-resolution',
      label: '超分辨率',
      description: '提升图像清晰度和细节',
      icon: <Maximize2 className="w-5 h-5" />,
    },
    {
      id: 'upscale',
      label: '图像放大',
      description: '无损放大图像尺寸',
      icon: <Maximize2 className="w-5 h-5" />,
    },
    {
      id: 'background-removal',
      label: '背景移除',
      description: '自动去除图像背景',
      icon: <Eraser className="w-5 h-5" />,
    },
    {
      id: 'face-enhancement',
      label: '人脸增强',
      description: '改善人脸图像质量',
      icon: <User className="w-5 h-5" />,
    },
    {
      id: 'color-correction',
      label: '色彩校正',
      description: '调整图像色彩和明暗',
      icon: <Palette className="w-5 h-5" />,
    },
    {
      id: 'style-transfer',
      label: '风格迁移',
      description: '应用艺术风格到图像',
      icon: <ImageIcon className="w-5 h-5" />,
    },
    {
      id: 'image-to-video',
      label: '图生视频',
      description: '将静态图像转为动态视频',
      icon: <Film className="w-5 h-5" />,
    },
  ];

  const handleEnhance = async () => {
    if (!selectedEnhancement) return;
    
    setProcessing(true);
    setResult(null);
    
    try {
      let response;
      
      switch (selectedEnhancement) {
        case 'super-resolution':
          response = await apiClient.superResolution(imageId, scale);
          break;
        case 'upscale':
          response = await apiClient.upscaleImage(imageId, scale);
          break;
        case 'inpainting':
          response = await apiClient.inpainting(imageId, maskPrompt);
          break;
        case 'background-removal':
          response = await apiClient.removeBackground(imageId);
          break;
        case 'face-enhancement':
          response = await apiClient.faceEnhancement(imageId, strength / 100);
          break;
        case 'color-correction':
          response = await apiClient.colorCorrection(imageId, {
            brightness,
            contrast,
            saturation,
            temperature,
            tint,
          });
          break;
        case 'style-transfer':
          response = await apiClient.styleTransfer(imageId, undefined, strength / 100);
          break;
        case 'image-to-video':
          throw new Error('Image to video functionality not yet implemented');
          break;
        default:
          throw new Error('Unknown enhancement type');
      }

      setResult(response);
      addToast({
        type: 'success',
        title: '处理成功',
        message: '图像处理完成！',
      });
      onComplete?.(response);
    } catch (error) {
      addToast({
        type: 'error',
        title: '处理失败',
        message: error instanceof Error ? error.message : '处理失败',
      });
    } finally {
      setProcessing(false);
    }
  };

  const renderParams = () => {
    switch (selectedEnhancement) {
      case 'super-resolution':
      case 'upscale':
        return (
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: textColor, fontWeight: 500 }}>
              放大倍数
            </label>
            <select
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: inputBg,
                border: `1px solid ${borderColor}`,
                borderRadius: '8px',
                color: textColor,
              }}
            >
              <option value={2}>2x (1024px)</option>
              <option value={4}>4x (2048px)</option>
              <option value={8}>8x (4096px)</option>
            </select>
          </div>
        );
      
      case 'inpainting':
        return (
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: textColor, fontWeight: 500 }}>
              修复提示词
            </label>
            <textarea
              value={maskPrompt}
              onChange={(e) => setMaskPrompt(e.target.value)}
              placeholder="描述你想要添加或修改的内容..."
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: inputBg,
                border: `1px solid ${borderColor}`,
                borderRadius: '8px',
                color: textColor,
                minHeight: '80px',
                resize: 'vertical',
              }}
            />
          </div>
        );
      
      case 'face-enhancement':
      case 'style-transfer':
        return (
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: textColor, fontWeight: 500 }}>
              强度: {strength}%
            </label>
            <input
              type="range"
              min={1}
              max={100}
              value={strength}
              onChange={(e) => setStrength(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        );
      
      case 'color-correction':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', color: textColor, fontSize: '14px' }}>
                亮度: {brightness}
              </label>
              <input
                type="range"
                min={-100}
                max={100}
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', color: textColor, fontSize: '14px' }}>
                对比度: {contrast}
              </label>
              <input
                type="range"
                min={-100}
                max={100}
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', color: textColor, fontSize: '14px' }}>
                饱和度: {saturation}
              </label>
              <input
                type="range"
                min={-100}
                max={100}
                value={saturation}
                onChange={(e) => setSaturation(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', color: textColor, fontSize: '14px' }}>
                色温: {temperature}
              </label>
              <input
                type="range"
                min={-100}
                max={100}
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card style={{ padding: '20px', backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
      <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: textColor }}>
        图像增强
      </h3>
      
      <div style={{ marginBottom: '20px' }}>
        <img
          src={imageUrl}
          alt="Preview"
          style={{
            width: '100%',
            maxHeight: '200px',
            objectFit: 'contain',
            borderRadius: '8px',
            backgroundColor: inputBg,
          }}
        />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' }}>
        {enhancementOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => {
              setSelectedEnhancement(option.id);
              setResult(null);
            }}
            style={{
              padding: '12px',
              backgroundColor: selectedEnhancement === option.id 
                ? (theme === 'dark' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)')
                : inputBg,
              border: `1px solid ${selectedEnhancement === option.id ? '#6366f1' : borderColor}`,
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ color: selectedEnhancement === option.id ? '#6366f1' : mutedTextColor }}>
                {option.icon}
              </span>
              <span style={{ color: textColor, fontWeight: 500, fontSize: '14px' }}>
                {option.label}
              </span>
            </div>
            <p style={{ color: mutedTextColor, fontSize: '12px', margin: 0 }}>
              {option.description}
            </p>
          </button>
        ))}
      </div>
      
      {selectedEnhancement && (
        <div style={{ marginBottom: '16px' }}>
          {renderParams()}
        </div>
      )}
      
      {selectedEnhancement && (
        <Button
          onClick={handleEnhance}
          disabled={processing || !selectedEnhancement}
          style={{ width: '100%', height: '44px' }}
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              处理中...
            </>
          ) : (
            '开始处理'
          )}
        </Button>
      )}
      
      {result && (
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: inputBg, borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span style={{ color: textColor, fontWeight: 500 }}>处理完成</span>
          </div>
          {result.enhancedAsset?.url && (
            <img
              src={result.enhancedAsset.url}
              alt="Result"
              style={{ width: '100%', borderRadius: '8px' }}
            />
          )}
        </div>
      )}
    </Card>
  );
}
