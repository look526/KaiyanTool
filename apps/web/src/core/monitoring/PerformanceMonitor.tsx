import React, { useEffect, useState } from 'react'
import { reportWebVitals, type Metric } from './web-vitals'

interface VitalData {
  [key: string]: {
    value: number
    rating: string
    delta: number
  }
}

export const PerformanceMonitor: React.FC = () => {
  const [vitals, setVitals] = useState<VitalData>({})
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!import.meta.env.DEV) return

    reportWebVitals({
      reportToConsole: true,
      reportCallback: (metric: Metric) => {
        setVitals((prev) => ({
          ...prev,
          [metric.name]: {
            value: metric.value,
            rating: metric.rating,
            delta: metric.delta,
          },
        }))
      },
    })
  }, [])

  if (!import.meta.env.DEV) return null

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'text-green-500'
      case 'needs-improvement':
        return 'text-yellow-500'
      case 'poor':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const formatValue = (name: string, value: number) => {
    if (name === 'CLS') return value.toFixed(3)
    return `${Math.round(value)}ms`
  }

  return (
    <>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors"
      >
        ⚡
      </button>

      {isVisible && (
        <div className="fixed bottom-20 right-4 z-50 w-72 bg-gray-900 text-white rounded-lg shadow-2xl p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span>⚡</span> Web Vitals
          </h3>
          <div className="space-y-2">
            {Object.entries(vitals).map(([name, data]) => (
              <div key={name} className="flex justify-between items-center text-sm">
                <span className="text-gray-400">{name}</span>
                <span className={`font-mono ${getRatingColor(data.rating)}`}>
                  {formatValue(name, data.value)}
                </span>
              </div>
            ))}
            {Object.keys(vitals).length === 0 && (
              <p className="text-gray-500 text-sm">Waiting for metrics...</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
