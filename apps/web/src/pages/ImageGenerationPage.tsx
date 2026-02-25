import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { apiClient } from '../lib/api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card } from '../components/ui/card'
import { Select } from '../components/ui/Select'
import { 
  Image as ImageIcon, 
  Loader2, 
  Download, 
  RefreshCw,
  Sparkles
} from 'lucide-react'

const STYLE_PRESETS = [
  { value: 'cinematic', label: '电影风格' },
  { value: 'anime', label: '动漫风格' },
  { value: 'realistic', label: '写实风格' },
  { value: 'illustration', label: '插画风格' },
  { value: 'watercolor', label: '水彩风格' },
]

const SIZE_PRESETS = [
  { value: '1024x576', label: '16:9 宽屏', width: 1024, height: 576 },
  { value: '1024x1024', label: '1:1 方形', width: 1024, height: 1024 },
  { value: '576x1024', label: '9:16 竖屏', width: 576, height: 1024 },
  { value: '768x768', label: '3:4 竖屏', width: 768, height: 768 },
]

export function ImageGenerationPage() {
  const { id } = useParams<{ id: string }>()
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [style, setStyle] = useState('cinematic')
  const [size, setSize] = useState('1024x576')
  const [generating, setGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim() || !id) return

    const [width, height] = size.split('x').map(Number)

    setGenerating(true)
    setGeneratedImage(null)

    try {
      const result = await apiClient.generateImage({
        prompt,
        negativePrompt,
        width,
        height,
        style,
        projectId: id
      })
      setGeneratedImage(result.asset.url)
    } catch (error) {
      console.error('Failed to generate image:', error)
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!generatedImage) return
    const link = document.createElement('a')
    link.href = generatedImage
    link.download = `generated-${Date.now()}.png`
    link.click()
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
          <ImageIcon className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold">图像生成</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                图像描述 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="描述你想要的图像内容（英文效果更好）..."
                className="min-h-[120px] w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                建议使用英文描述，可获得更好的生成效果
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                负面提示词
              </label>
              <textarea
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="不想出现在图像中的元素..."
                className="min-h-[80px] w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">风格</label>
                <Select
                  value={style}
                  onChange={(value) => setStyle(Array.isArray(value) ? value[0] : value)}
                  options={STYLE_PRESETS.map(p => ({ value: p.value, label: p.label }))}
                  placeholder="选择风格"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">尺寸</label>
                <Select
                  value={size}
                  onChange={(value) => setSize(Array.isArray(value) ? value[0] : value)}
                  options={SIZE_PRESETS.map(p => ({ value: p.value, label: p.label }))}
                  placeholder="选择尺寸"
                />
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || generating}
              className="w-full"
              size="lg"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  生成图像
                </>
              )}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">生成结果</h2>
            {generatedImage && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleGenerate}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  重新生成
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-1" />
                  下载
                </Button>
              </div>
            )}
          </div>

          <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
            {generating ? (
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-500" />
                <p className="text-gray-500">AI 正在创作中...</p>
              </div>
            ) : generatedImage ? (
              <img
                src={generatedImage}
                alt="Generated"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-center text-gray-400">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>输入描述并点击生成</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ImageGenerationPage;
