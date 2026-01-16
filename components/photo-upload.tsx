'use client'

import { useState } from 'react'
import { Camera, X, Star } from 'lucide-react'

export interface Photo {
  file: File
  preview: string
  isFeatured: boolean
}

interface PhotoUploadProps {
  onPhotosChange?: (photos: Photo[]) => void
  maxPhotos?: number
}

export default function PhotoUpload({ 
  onPhotosChange,
  maxPhotos = 5 
}: PhotoUploadProps) {
  const [photos, setPhotos] = useState<Photo[]>([])

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    
    if (photos.length + files.length > maxPhotos) {
      alert(`Maximum ${maxPhotos} photos allowed`)
      return
    }

    const newPhotos = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isFeatured: photos.length === 0 // First photo is featured by default
    }))

    const updatedPhotos = [...photos, ...newPhotos]
    setPhotos(updatedPhotos)
    onPhotosChange?.(updatedPhotos)
  }

  function removePhoto(index: number) {
    const wasFeatured = photos[index].isFeatured
    const updatedPhotos = photos.filter((_, i) => i !== index)
    
    // If removed photo was featured, make first photo featured
    if (wasFeatured && updatedPhotos.length > 0) {
      updatedPhotos[0].isFeatured = true
    }
    
    setPhotos(updatedPhotos)
    onPhotosChange?.(updatedPhotos)
  }

  function setFeatured(index: number) {
    const updatedPhotos = photos.map((photo, i) => ({
      ...photo,
      isFeatured: i === index
    }))
    setPhotos(updatedPhotos)
    onPhotosChange?.(updatedPhotos)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Photos (Max {maxPhotos})
      </label>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={photo.preview}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              
              {/* Featured Badge */}
              {photo.isFeatured && (
                <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Featured
                </div>
              )}

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Set Featured Button */}
              {!photo.isFeatured && (
                <button
                  type="button"
                  onClick={() => setFeatured(index)}
                  className="absolute bottom-2 left-2 right-2 bg-white/90 hover:bg-white text-gray-700 px-2 py-1 rounded text-xs font-medium"
                >
                  Set as Featured
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {photos.length < maxPhotos && (
        <label className="flex items-center justify-center gap-2 w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
          <Camera className="w-6 h-6 text-gray-400" />
          <span className="text-gray-600">
            {photos.length === 0 ? 'Add Photos' : `Add More (${maxPhotos - photos.length} remaining)`}
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      )}

      <p className="mt-2 text-xs text-gray-500">
        First photo is featured by default. Click "Set as Featured" to change.
      </p>
    </div>
  )
}
