import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { apiClient } from '../lib/api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card } from '../components/ui/card'
import { Select } from '../components/ui/Select'
import { 
  Video, 
  Loader2, 
  Download, 
  Play,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react'

const DURATION_OPTIONS = [
  { value: '4', label: '4秒' },
  { value: '8', label: '8秒' },
  { value: '16', label: '16秒' },
]

export function VideoGenerationPage() {
  const { id } = useParams<{ id: string }>()
  const [prompt, setPrompt] = useState('')
  const [duration, setDuration] = useState('4')
  const [generating, setGenerating] = useState(false)
  const [queue, setQueue] = useState<any[]>([])
  const [loadingQueue, setLoadingQueue] = useState(true)

  const loadQueue = async () => {
    if (!id) return
    try {
      const data = await apiClient.getProjectVideoQueue(id)
      setQueue(data)
    } catch (error) {
      console.error('Failed to load queue:', error)
    } finally {
      setLoadingQueue(false)
    }
  }

  useEffect(() => {
    loadQueue()
    const interval = setInterval(loadQueue, 5000)
    return () => clearInterval(interval)
  }, [id])

  const handleGenerate = async () => {
    if (!prompt.trim() || !id) return

    setGenerating(true)

    try {
      await apiClient.generateVideoFromPrompt({
        prompt,
        duration,
        projectId: id
      })
      await loadQueue()
    } catch (error) {
      console.error('Failed to generate video:', error)
    } finally {
      setGenerating(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'processing':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
          <Video className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold">视频生成</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                视频描述 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="描述你想要的视频内容..."
                className="min-h-[120px] w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">时长</label>
              <Select
                value={duration}
                onChange={(value) => setDuration(Array.isArray(value) ? value[0] : value)}
                options={DURATION_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))}
                placeholder="选择时长"
              />
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
                  <Play className="w-5 h-5 mr-2" />
                  生成视频
                </>
              )}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">生成队列</h2>
            <Button variant="outline" size="sm" onClick={loadQueue}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          {loadingQueue ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : queue.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>暂无生成任务</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {queue.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  {getStatusIcon(task.status)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {task.params?.prompt || '视频生成任务'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(task.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {task.status === 'completed' && task.params?.url && (
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default VideoGenerationPage;
