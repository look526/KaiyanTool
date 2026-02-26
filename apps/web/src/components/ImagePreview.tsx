import { useState } from 'react'
import { Modal } from './ui/Modal'

interface ImagePreviewProps {
  src: string
  alt?: string
  className?: string
}

export function ImagePreview({ src, alt = 'Preview', className = '' }: ImagePreviewProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`
          w-full h-full object-cover rounded-lg cursor-pointer
          hover:opacity-90 transition-opacity
          ${className}
        `}
        onClick={() => setIsOpen(true)}
      />

      <Modal open={isOpen} onClose={() => setIsOpen(false)} size="lg">
        <img
          src={src}
          alt={alt}
          className="w-full h-auto max-h-[80vh] object-contain"
        />
      </Modal>
    </>
  )
}
