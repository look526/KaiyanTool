import React, { useState } from 'react'
import { Settings, Sliders, Layers, Image as ImageIcon, Upload } from 'lucide-react'
import { SEEDREAM_ASPECT_RATIOS, SEEDREAM_RESOLUTIONS } from '../types/seedream.types'

interface ImageGenerationSettingsProps {
  onSettingsChange: (settings: ImageSettings) => void
  disabled?: boolean
}

export interface ImageSettings {
  aspectRatio: '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | '3:2' | '2:3' | '21:9' | '9:21'
  resolution: '2K' | '3K'
  count: number
  enableReference: boolean
  referenceImages: string[]
}

export function ImageGenerationSettings({ onSettingsChange, disabled }: ImageGenerationSettingsProps) {
  const [settings, setSettings] = useState<ImageSettings>({
    aspectRatio: '1:1',
    resolution: '2K',
    count: 1,
    enableReference: false,
    referenceImages: [],
  })

  const updateSetting = <K extends keyof ImageSettings>(
    key: K,
    value: ImageSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    onSettingsChange(newSettings)
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">图片生成设置</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon className="w-5 h-5 text-gray-600" />
            <label className="text-sm font-semibold text-gray-700">宽高比</label>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {SEEDREAM_ASPECT_RATIOS.slice(0, 6).map((ratio) => (
              <button
                key={ratio.value}
                onClick={() => updateSetting('aspectRatio', ratio.value)}
                disabled={disabled}
                className={`
                  p-3 rounded-lg border-2 transition-all text-center
                  ${settings.aspectRatio === ratio.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                title={ratio.description}
              >
                <div className="text-2xl mb-1">{ratio.icon}</div>
                <div className="text-xs font-medium">{ratio.label}</div>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {SEEDREAM_ASPECT_RATIOS.slice(6).map((ratio) => (
              <button
                key={ratio.value}
                onClick={() => updateSetting('aspectRatio', ratio.value)}
                disabled={disabled}
                className={`
                  p-3 rounded-lg border-2 transition-all text-center
                  ${settings.aspectRatio === ratio.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                title={ratio.description}
              >
                <div className="text-2xl mb-1">{ratio.icon}</div>
                <div className="text-xs font-medium">{ratio.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sliders className="w-5 h-5 text-gray-600" />
            <label className="text-sm font-semibold text-gray-700">分辨率</label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {SEEDREAM_RESOLUTIONS.map((res) => (
              <button
                key={res.value}
                onClick={() => updateSetting('resolution', res.value)}
                disabled={disabled}
                className={`
                  p-4 rounded-lg border-2 transition-all text-center
                  ${settings.resolution === res.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className="text-lg font-semibold mb-1">{res.label}</div>
                <div className="text-xs text-gray-500">{res.size}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {res.value === '2K' ? res.maxSize1x1 : res.maxSize16x9}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-5 h-5 text-gray-600" />
          <label className="text-sm font-semibold text-gray-700">
            生成数量: <span className="text-blue-600 font-bold">{settings.count}</span> 张
          </label>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={settings.count}
          onChange={(e) => updateSetting('count', parseInt(e.target.value))}
          disabled={disabled}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>1张</span>
          <span>10张</span>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enableReference}
            onChange={(e) => updateSetting('enableReference', e.target.checked)}
            disabled={disabled}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <span className="text-sm font-semibold text-gray-700">启用图生图参考</span>
            <p className="text-xs text-gray-500 mt-1">
              选择参考图片，AI将基于参考图风格生成新图片
            </p>
          </div>
        </label>

        {settings.enableReference && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <Upload className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">上传参考图片</span>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-2">点击或拖拽上传图片</p>
              <p className="text-xs text-gray-500">
                支持 JPG、PNG 格式，最多10张，每张不超过10MB
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
