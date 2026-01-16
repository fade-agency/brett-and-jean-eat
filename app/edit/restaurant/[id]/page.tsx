'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { ArrowLeft, X, Star, Coffee, Sun, Moon, Cookie } from 'lucide-react'
import PhotoUpload, { Photo } from '@/components/photo-upload'
import { Cuisine } from '@/types'

const CUISINES: Cuisine[] = [
  'American', 'Italian', 'Mexican', 'Chinese', 'Japanese', 
  'Indian', 'Thai', 'Middle Eastern', 'Mediterranean', 'Korean', 
  'Vietnamese', 'French', 'Caribbean', 'Latin American', 'African', 'Spanish'
]

export default function EditRestaurantPage() {
  const params = useParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  const [placeId, setPlaceId] = useState<string | null>(null)
  const [placeName, setPlaceName] = useState('')
  const [cuisine, setCuisine] = useState<Cuisine | ''>('')
  const [priceRange, setPriceRange] = useState<'$' | '$$' | '$$$' | '$$$$' | ''>('')
  const [address, setAddress] = useState('')
  const [website, setWebsite] = useState('')
  
  const [visitDate, setVisitDate] = useState('')
  const [mealTime, setMealTime] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack' | ''>('')
  const [brettRating, setBrettRating] = useState<number | null>(null)
  const [jeanRating, setJeanRating] = useState<number | null>(null)
  const [dishesOrdered, setDishesOrdered] = useState('')
  const [cost, setCost] = useState('')
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState('')
  const [newPhotos, setNewPhotos] = useState<Photo[]>([])
  const [existingPhotos, setExistingPhotos] = useState<any[]>([])
  const [photoUrlsMap, setPhotoUrlsMap] = useState<{ [key: string]: string }>({})
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([])
  const [draggedPhotoId, setDraggedPhotoId] = useState<string | null>(null)
  const [createdBy, setCreatedBy] = useState<'Brett' | 'Jean' | null>(null)

  useEffect(() => {
    loadVisit()
  }, [])

  async function loadVisit() {
    const { data } = await supabase
      .from('visits')
      .select(`
        *,
        place:places(*),
        restaurant_visit_details(*),
        photos(*)
      `)
      .eq('id', params.id)
      .single()

    if (data) {
      setPlaceId(data.place_id)
      setPlaceName(data.place?.name || data.name)
      setCuisine(data.place?.cuisine || '')
      setPriceRange(data.place?.price_range || '')
      setAddress(data.place?.address || '')
      setWebsite(data.place?.website || '')
      
      setVisitDate(data.visit_date)
      setMealTime(data.meal_time || '')
      setNotes(data.notes || '')
      setTags(data.tags ? data.tags.join(', ') : '')
      setCreatedBy(data.created_by)

      if (data.restaurant_visit_details) {
        setBrettRating(data.restaurant_visit_details.brett_rating)
        setJeanRating(data.restaurant_visit_details.jean_rating)
        setDishesOrdered(data.restaurant_visit_details.dishes_ordered || '')
        setCost(data.restaurant_visit_details.cost?.toString() || '')
      }

      if (data.photos?.length > 0) {
        setExistingPhotos(data.photos.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)))
        const urls: { [key: string]: string } = {}
        for (const photo of data.photos) {
          const { data: urlData } = supabase.storage.from('experience-photos').getPublicUrl(photo.storage_path)
          if (urlData) urls[photo.id] = urlData.publicUrl
        }
        setPhotoUrlsMap(urls)
      }
    }
    setLoading(false)
  }

  function handleSetFeatured(photoId: string) {
    setExistingPhotos(existingPhotos.map(photo => ({
      ...photo,
      is_featured: photo.id === photoId
    })))
  }

  function handleDragStart(photoId: string) {
    setDraggedPhotoId(photoId)
  }

  function handleDragOver(e: React.DragEvent, photoId: string) {
    e.preventDefault()
    if (!draggedPhotoId || draggedPhotoId === photoId) return
    
    const draggedIndex = existingPhotos.findIndex(p => p.id === draggedPhotoId)
    const targetIndex = existingPhotos.findIndex(p => p.id === photoId)
    if (draggedIndex === -1 || targetIndex === -1) return
    
    const newPhotos = [...existingPhotos]
    const [draggedPhoto] = newPhotos.splice(draggedIndex, 1)
    newPhotos.splice(targetIndex, 0, draggedPhoto)
    setExistingPhotos(newPhotos.map((photo, index) => ({ ...photo, sort_order: index })))
  }

  function handleDragEnd() {
    setDraggedPhotoId(null)
  }

  async function handleSave() {
    setSaving(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Update place info
      if (placeId) {
        await supabase.from('places').update({
          name: placeName,
          cuisine: cuisine || null,
          price_range: priceRange || null,
          address: address || null,
          website: website || null,
        }).eq('id', placeId)
      }

      // Update visit
      await supabase.from('visits').update({
        name: placeName, // Keep for backwards compatibility
        visit_date: visitDate,
        meal_time: mealTime || null,
        notes,
        tags: tags ? tags.split(',').map(t => t.trim()) : null,
      }).eq('id', params.id)

      // Update visit details
      await supabase.from('restaurant_visit_details').update({
        brett_rating: brettRating,
        jean_rating: jeanRating,
        dishes_ordered: dishesOrdered || null,
        cost: cost ? parseFloat(cost) : null,
      }).eq('visit_id', params.id)

      // Update photos
      for (const photo of existingPhotos.filter(p => !photosToDelete.includes(p.id))) {
        await supabase.from('photos').update({
          is_featured: photo.is_featured,
          sort_order: photo.sort_order
        }).eq('id', photo.id)
      }

      // Delete photos
      for (const photoId of photosToDelete) {
        const photo = existingPhotos.find(p => p.id === photoId)
        if (photo) {
          await supabase.storage.from('experience-photos').remove([photo.storage_path])
          await supabase.from('photos').delete().eq('id', photoId)
        }
      }

      // Upload new photos
      if (newPhotos.length > 0) {
        const currentMaxOrder = Math.max(0, ...existingPhotos.filter(p => !photosToDelete.includes(p.id)).map(p => p.sort_order || 0))
        for (let i = 0; i < newPhotos.length; i++) {
          const photo = newPhotos[i]
          const fileExt = photo.file.name.split('.').pop()
          const fileName = `${params.id}-${Date.now()}-${i}.${fileExt}`
          const filePath = `${user.id}/${fileName}`
          await supabase.storage.from('experience-photos').upload(filePath, photo.file)
          await supabase.from('photos').insert({
            visit_id: params.id,
            storage_path: filePath,
            is_featured: photo.isFeatured,
            sort_order: currentMaxOrder + i + 1
          })
        }
      }

      window.location.href = `/experience/${params.id}`
    } catch (err: any) {
      setError(err.message || 'Failed to save')
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b p-4">
        <button 
          type="button"
          onClick={() => window.location.href = `/experience/${params.id}`} 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </header>

      <main className="max-w-2xl mx-auto p-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Edit Restaurant Visit</h1>
            {createdBy && <div className="text-sm text-gray-600">Added by <span className="font-medium">{createdBy}</span></div>}
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name *</label>
              <input type="text" value={placeName} onChange={(e) => setPlaceName(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine Type</label>
                <select value={cuisine} onChange={(e) => setCuisine(e.target.value as Cuisine)} className="w-full px-4 py-2 border rounded-lg">
                  <option value="">Select cuisine...</option>
                  {CUISINES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <select value={priceRange} onChange={(e) => setPriceRange(e.target.value as any)} className="w-full px-4 py-2 border rounded-lg">
                  <option value="">Select...</option>
                  <option value="$">$ - Under $15</option>
                  <option value="$$">$$ - $15-30</option>
                  <option value="$$$">$$$ - $30-60</option>
                  <option value="$$$$">$$$$ - $60+</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-4 py-2 border rounded-lg" rows={2} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Visit Details</h3>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Visited *</label>
                  <input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meal Time</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: 'breakfast', icon: Coffee, label: 'Breakfast' },
                      { value: 'lunch', icon: Sun, label: 'Lunch' },
                      { value: 'dinner', icon: Moon, label: 'Dinner' },
                      { value: 'snack', icon: Cookie, label: 'Snack' }
                    ].map(({ value, icon: Icon, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setMealTime(value as any)}
                        className={`p-2 border-2 rounded-lg transition-all ${
                          mealTime === value
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        title={label}
                      >
                        <Icon className={`w-5 h-5 mx-auto ${mealTime === value ? 'text-red-500' : 'text-gray-400'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Ratings</label>
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Brett</span>
                    <span className="text-sm font-medium">{brettRating || 'Not rated'}</span>
                  </div>
                  <input type="range" min="1" max="5" step="0.5" value={brettRating || 3} onChange={(e) => setBrettRating(parseFloat(e.target.value))} className="w-full" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Jean</span>
                    <span className="text-sm font-medium">{jeanRating || 'Not rated'}</span>
                  </div>
                  <input type="range" min="1" max="5" step="0.5" value={jeanRating || 3} onChange={(e) => setJeanRating(parseFloat(e.target.value))} className="w-full" />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">What Did You Order?</label>
                <textarea value={dishesOrdered} onChange={(e) => setDishesOrdered(e.target.value)} className="w-full px-4 py-2 border rounded-lg" rows={3} />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Cost</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-gray-500">$</span>
                  <input type="number" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} className="w-full pl-8 pr-4 py-2 border rounded-lg" />
                </div>
              </div>

              {existingPhotos.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
                  <p className="text-sm text-gray-600 mb-3">💡 Drag to reorder • Click star for featured</p>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {existingPhotos.filter(p => !photosToDelete.includes(p.id)).map((photo) => (
                      <div key={photo.id} className={`relative aspect-square cursor-move ${draggedPhotoId === photo.id ? 'opacity-50' : ''}`} draggable onDragStart={() => handleDragStart(photo.id)} onDragOver={(e) => handleDragOver(e, photo.id)} onDragEnd={handleDragEnd}>
                        <img src={photoUrlsMap[photo.id]} alt="" className="w-full h-full object-cover rounded-lg" />
                        <button type="button" onClick={() => handleSetFeatured(photo.id)} className={`absolute top-2 left-2 p-1.5 rounded-full ${photo.is_featured ? 'bg-yellow-400' : 'bg-white/80'}`}>
                          <Star className={`w-4 h-4 ${photo.is_featured ? 'fill-current' : ''}`} />
                        </button>
                        <button type="button" onClick={() => setPhotosToDelete([...photosToDelete, photo.id])} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full">
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">#{photo.sort_order + 1}</div>
                      </div>
                    ))}
                  </div>
                  {photosToDelete.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-red-600 mb-2">To delete ({photosToDelete.length})</p>
                      <div className="grid grid-cols-3 gap-4">
                        {existingPhotos.filter(p => photosToDelete.includes(p.id)).map((photo) => (
                          <div key={photo.id} className="relative aspect-square">
                            <img src={photoUrlsMap[photo.id]} alt="" className="w-full h-full object-cover rounded-lg opacity-30" />
                            <button type="button" onClick={() => setPhotosToDelete(photosToDelete.filter(id => id !== photo.id))} className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">Undo</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <PhotoUpload onPhotosChange={setNewPhotos} maxPhotos={5} />

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-4 py-2 border rounded-lg" rows={4} />
              </div>
            </div>

            <div className="flex gap-4">
              <button type="button" onClick={handleSave} disabled={saving} className="flex-1 bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={() => window.location.href = `/experience/${params.id}`} className="px-6 py-3 border text-gray-700 rounded-lg font-medium hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}