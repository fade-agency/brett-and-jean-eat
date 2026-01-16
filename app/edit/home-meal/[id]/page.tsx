'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { ArrowLeft, X, Star } from 'lucide-react'
import PhotoUpload, { Photo } from '@/components/photo-upload'
import { Cuisine } from '@/types'

const CUISINES: Cuisine[] = [
  'American', 'Italian', 'Mexican', 'Chinese', 'Japanese', 
  'Indian', 'Thai', 'Middle Eastern', 'Mediterranean', 'Korean', 
  'Vietnamese', 'French', 'Caribbean', 'Latin American', 'African', 'Spanish'
]

export default function EditHomeMealPage() {
  const params = useParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [experienceDate, setExperienceDate] = useState('')
  const [cuisine, setCuisine] = useState<Cuisine | ''>('')
  const [ingredients, setIngredients] = useState('')
  const [instructions, setInstructions] = useState('')
  const [cookTime, setCookTime] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | ''>('')
  const [servings, setServings] = useState('')
  const [brettRating, setBrettRating] = useState<number | null>(null)
  const [jeanRating, setJeanRating] = useState<number | null>(null)
  const [source, setSource] = useState('')
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState('')
  const [newPhotos, setNewPhotos] = useState<Photo[]>([])
  const [existingPhotos, setExistingPhotos] = useState<any[]>([])
  const [photoUrlsMap, setPhotoUrlsMap] = useState<{ [key: string]: string }>({})
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([])
  const [draggedPhotoId, setDraggedPhotoId] = useState<string | null>(null)
  const [createdBy, setCreatedBy] = useState<'Brett' | 'Jean' | null>(null)

  useEffect(() => {
    loadExperience()
  }, [])

  async function loadExperience() {
    const { data } = await supabase
      .from('experiences')
      .select(`*, home_meal_details(*), photos(*)`)
      .eq('id', params.id)
      .single()

    if (data) {
      setName(data.name)
      setExperienceDate(data.experience_date)
      setNotes(data.notes || '')
      setTags(data.tags ? data.tags.join(', ') : '')
      setCreatedBy(data.created_by)

      if (data.home_meal_details) {
        setCuisine(data.home_meal_details.cuisine || '')
        setIngredients(data.home_meal_details.ingredients ? data.home_meal_details.ingredients.join('\n') : '')
        setInstructions(data.home_meal_details.instructions || '')
        setCookTime(data.home_meal_details.cook_time_minutes?.toString() || '')
        setDifficulty(data.home_meal_details.difficulty || '')
        setServings(data.home_meal_details.servings?.toString() || '')
        setBrettRating(data.home_meal_details.brett_rating)
        setJeanRating(data.home_meal_details.jean_rating)
        setSource(data.home_meal_details.source || '')
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

      await supabase.from('experiences').update({
        name,
        experience_date: experienceDate,
        notes,
        tags: tags ? tags.split(',').map(t => t.trim()) : null,
      }).eq('id', params.id)

      await supabase.from('home_meal_details').update({
        cuisine: cuisine || null,
        ingredients: ingredients ? ingredients.split('\n').filter(i => i.trim()) : null,
        instructions: instructions || null,
        cook_time_minutes: cookTime ? parseInt(cookTime) : null,
        difficulty: difficulty || null,
        servings: servings ? parseInt(servings) : null,
        brett_rating: brettRating,
        jean_rating: jeanRating,
        source: source || null,
      }).eq('experience_id', params.id)

      for (const photo of existingPhotos.filter(p => !photosToDelete.includes(p.id))) {
        await supabase.from('photos').update({
          is_featured: photo.is_featured,
          sort_order: photo.sort_order
        }).eq('id', photo.id)
      }

      for (const photoId of photosToDelete) {
        const photo = existingPhotos.find(p => p.id === photoId)
        if (photo) {
          await supabase.storage.from('experience-photos').remove([photo.storage_path])
          await supabase.from('photos').delete().eq('id', photoId)
        }
      }

      if (newPhotos.length > 0) {
        const currentMaxOrder = Math.max(0, ...existingPhotos.filter(p => !photosToDelete.includes(p.id)).map(p => p.sort_order || 0))
        for (let i = 0; i < newPhotos.length; i++) {
          const photo = newPhotos[i]
          const fileExt = photo.file.name.split('.').pop()
          const fileName = `${params.id}-${Date.now()}-${i}.${fileExt}`
          const filePath = `${user.id}/${fileName}`
          await supabase.storage.from('experience-photos').upload(filePath, photo.file)
          await supabase.from('photos').insert({
            experience_id: params.id,
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
            <h1 className="text-2xl font-bold">Edit Home Meal</h1>
            {createdBy && <div className="text-sm text-gray-600">Added by <span className="font-medium">{createdBy}</span></div>}
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meal Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Cooked *</label>
              <input type="date" value={experienceDate} onChange={(e) => setExperienceDate(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine Type</label>
              <select
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value as Cuisine)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Select cuisine...</option>
                {CUISINES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)} className="w-full px-4 py-2 border rounded-lg">
                  <option value="">Select...</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Servings</label>
                <input type="number" min="1" value={servings} onChange={(e) => setServings(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cook Time (min)</label>
                <input type="number" min="1" value={cookTime} onChange={(e) => setCookTime(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>

            <div>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients (one per line)</label>
              <textarea value={ingredients} onChange={(e) => setIngredients(e.target.value)} className="w-full px-4 py-2 border rounded-lg font-mono text-sm" rows={6} placeholder="2 cups flour&#10;1 tsp salt&#10;3 eggs" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
              <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} className="w-full px-4 py-2 border rounded-lg" rows={6} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recipe Source</label>
              <input type="text" value={source} onChange={(e) => setSource(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g., Grandma's cookbook, NYT Cooking" />
            </div>

            {existingPhotos.length > 0 && (
              <div>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="italian, comfort food, weeknight" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-4 py-2 border rounded-lg" rows={4} />
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