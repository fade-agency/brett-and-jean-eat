'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface Photo {
  id: string
  url: string
  is_featured: boolean
  sort_order: number
}

interface PhotoViewerProps {
  photos: Photo[]
  initialIndex: number
  onClose: () => void
}

export default function PhotoViewer({ photos, initialIndex, onClose }: PhotoViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }

    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [currentIndex])

  function handlePrev() {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
  }

  function handleNext() {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
  }

  const currentPhoto = photos[currentIndex]

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Photo Counter */}
      <div className="absolute top-4 left-4 z-10 px-4 py-2 bg-black/50 rounded-full text-white text-sm font-medium">
        {currentIndex + 1} / {photos.length}
      </div>

      {/* Previous Button */}
      {photos.length > 1 && (
        <button
          onClick={handlePrev}
          className="absolute left-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}

      {/* Photo */}
      <div className="relative max-w-7xl max-h-[90vh] mx-4">
        <img
          src={currentPhoto.url}
          alt=""
          className="max-w-full max-h-[90vh] w-auto h-auto object-contain"
        />
      </div>

      {/* Next Button */}
      {photos.length > 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}

      {/* Bottom Thumbnail Strip */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-lg max-w-[90vw] overflow-x-auto">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => setCurrentIndex(index)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${
                index === currentIndex 
                  ? 'ring-2 ring-white scale-110' 
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={photo.url}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  )
}