import { useState } from 'react'
import { ImagePreview } from './ImagePreview'

interface GridGalleryProps {
  images: string[]
  gap?: number
  rounded?: boolean
  className?: string
}

export function GridGallery({ images, gap = 8, rounded = true, className = '' }: GridGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  if (images.length === 0) {
    return (
      <div className={`
        w-full h-64 flex items-center justify-center
        border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl
        text-gray-500 dark:text-gray-400
        ${className}
      `}>
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    )
  }

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gap: `${gap}px`,
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridTemplateRows: 'repeat(2, 100px)'
  }

  if (images.length <= 1) {
    gridStyles.gridTemplateColumns = '1fr'
    gridStyles.gridTemplateRows = '200px'
  } else if (images.length <= 2) {
    gridStyles.gridTemplateColumns = 'repeat(2, 1fr)'
    gridStyles.gridTemplateRows = '150px'
  } else if (images.length <= 4) {
    gridStyles.gridTemplateColumns = 'repeat(2, 1fr)'
    gridStyles.gridTemplateRows = 'repeat(2, 100px)'
  }

  return (
    <div style={gridStyles} className={className}>
      {images.slice(0, 6).map((src, index) => (
        <div
          key={index}
          className={`
            relative overflow-hidden
            ${rounded ? 'rounded-lg' : ''}
            ${images.length > 5 && index === 5 ? 'group' : ''}
          `}
          style={{
            gridRow: images.length > 5 && index === 5 ? '1 / span 2' : undefined,
            gridColumn: images.length > 5 && index === 5 ? '3 / 4' : undefined
          }}
        >
          <ImagePreview src={src} alt={`Gallery image ${index + 1}`} />

          {images.length > 5 && index === 5 && (
            <div
              className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer"
              onClick={() => setSelectedImage(src)}
            >
              <span className="text-white text-xl font-bold">+{images.length - 5}</span>
            </div>
          )}
        </div>
      ))}

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center cursor-pointer"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Full preview"
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setSelectedImage(null)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
