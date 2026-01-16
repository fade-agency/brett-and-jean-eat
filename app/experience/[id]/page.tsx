'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Edit2, Trash2, Star, MapPin, Globe, DollarSign, Clock, Users, ChefHat, UtensilsCrossed, Coffee, Sun, Moon, Cookie } from 'lucide-react'
import PhotoViewer from '@/components/photo-viewer'
import ConvertWishlistModal from '@/components/convert-wishlist-modal'

const getMealTimeIcon = (mealTime: string | null) => {
  switch (mealTime) {
    case 'breakfast': return <Coffee className="w-4 h-4" />
    case 'lunch': return <Sun className="w-4 h-4" />
    case 'dinner': return <Moon className="w-4 h-4" />
    case 'snack': return <Cookie className="w-4 h-4" />
    default: return null
  }
}

const getMealTimeLabel = (mealTime: string | null) => {
  if (!mealTime) return null
  return mealTime.charAt(0).toUpperCase() + mealTime.slice(1)
}

export default function ExperienceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [visit, setVisit] = useState<any>(null)
  const [photos, setPhotos] = useState<any[]>([])
  const [deleting, setDeleting] = useState(false)
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false)
  const [photoViewerIndex, setPhotoViewerIndex] = useState(0)
  const [showConvertModal, setShowConvertModal] = useState(false)

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
        home_meal_details(*),
        wishlist_details(*),
        photos(*)
      `)
      .eq('id', params.id)
      .single()

    if (data) {
      setVisit(data)
      if (data.photos?.length > 0) {
        const sortedPhotos = data.photos.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
        const photosWithUrls = sortedPhotos.map((photo: any) => ({
          ...photo,
          url: supabase.storage.from('experience-photos').getPublicUrl(photo.storage_path).data.publicUrl
        }))
        setPhotos(photosWithUrls)
      } else {
        // Use default image if no photos
        setPhotos([{
          id: 'default',
          url: '/default-restaurant.svg',
          is_featured: true,
          sort_order: 0
        }])
      }
    }
    setLoading(false)
  }

  async function handleDelete() {
    const typeLabel = visit.type === 'restaurant' ? 'restaurant visit' : visit.type === 'home_meal' ? 'home meal' : 'wishlist item'
    if (!confirm(`Delete this ${typeLabel}? This cannot be undone.`)) return
    
    setDeleting(true)
    try {
      for (const photo of photos) {
        if (photo.id !== 'default') {
          await supabase.storage.from('experience-photos').remove([photo.storage_path])
        }
      }
      await supabase.from('visits').delete().eq('id', params.id)
      window.location.href = '/'
    } catch (err) {
      alert('Failed to delete')
      setDeleting(false)
    }
  }

  function handleEdit() {
    const editPath = visit.type === 'home_meal' 
      ? `/edit/home-meal/${params.id}` 
      : visit.type === 'wishlist'
      ? `/edit/wishlist/${params.id}`
      : `/edit/restaurant/${params.id}`
    window.location.href = editPath
  }

  function openPhotoViewer(index: number) {
    setPhotoViewerIndex(index)
    setPhotoViewerOpen(true)
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
  }

  if (!visit) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Not found</div>
  }

  const details = visit.type === 'restaurant' 
    ? visit.restaurant_visit_details 
    : visit.type === 'home_meal'
    ? visit.home_meal_details
    : visit.wishlist_details

  const featuredPhoto = photos.find(p => p.is_featured) || photos[0]
  const avgRating = details?.brett_rating && details?.jean_rating 
    ? ((details.brett_rating + details.jean_rating) / 2).toFixed(1)
    : details?.brett_rating || details?.jean_rating || null

  const displayName = visit.place?.name || visit.name

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => window.location.href = '/'} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="flex gap-2">
            {visit.type === 'wishlist' && (
              <button 
                onClick={() => setShowConvertModal(true)} 
                className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg border border-green-600"
              >
                <Star className="w-4 h-4" />
                <span>Mark as Visited</span>
              </button>
            )}
            <button onClick={handleEdit} className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg">
              <Edit2 className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50">
              <Trash2 className="w-4 h-4" />
              <span>{deleting ? 'Deleting...' : 'Delete'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {featuredPhoto && (
          <div 
            className="mb-6 rounded-xl overflow-hidden cursor-pointer group relative"
            onClick={() => openPhotoViewer(0)}
          >
            <img src={featuredPhoto.url} alt={displayName} className="w-full h-96 object-cover transition-transform group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 px-4 py-2 rounded-lg text-sm font-medium">
                Click to view full size
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{displayName}</h1>
              <div className="flex items-center gap-2 text-gray-600">
                <span>
                  {visit.visit_date 
                    ? new Date(visit.visit_date).toLocaleDateString()
                    : 'On wishlist'}
                </span>
                {visit.meal_time && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm">
                      {getMealTimeIcon(visit.meal_time)}
                      <span>{getMealTimeLabel(visit.meal_time)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            {avgRating && (
              <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="text-xl font-bold text-gray-900">{avgRating}</span>
              </div>
            )}
          </div>

          {/* Restaurant-specific fields */}
          {visit.type === 'restaurant' && details && (
            <>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {visit.place?.cuisine && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="font-medium">Cuisine:</span>
                    <span>{visit.place.cuisine}</span>
                  </div>
                )}
                {visit.place?.price_range && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <DollarSign className="w-4 h-4" />
                    <span>{visit.place.price_range}</span>
                  </div>
                )}
              </div>

              {details.dishes_ordered && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">What We Ordered</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{details.dishes_ordered}</p>
                </div>
              )}

              {details.cost && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Total Cost</h3>
                  <p className="text-2xl font-bold text-gray-900">${details.cost.toFixed(2)}</p>
                </div>
              )}

              {visit.place?.address && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{visit.place.address}</p>
                </div>
              )}

              {visit.place?.website && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Website
                  </h3>
                  <a href={visit.place.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {visit.place.website}
                  </a>
                </div>
              )}
            </>
          )}

          {/* Home Meal-specific fields */}
          {visit.type === 'home_meal' && details && (
            <>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {details.cuisine && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="font-medium">Cuisine:</span>
                    <span>{details.cuisine}</span>
                  </div>
                )}
                {details.difficulty && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <ChefHat className="w-4 h-4" />
                    <span className="capitalize">{details.difficulty}</span>
                  </div>
                )}
                {details.servings && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users className="w-4 h-4" />
                    <span>{details.servings} servings</span>
                  </div>
                )}
                {details.cook_time_minutes && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4" />
                    <span>{details.cook_time_minutes} min</span>
                  </div>
                )}
              </div>

              {details.ingredients && details.ingredients.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Ingredients</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {details.ingredients.map((ingredient: string, i: number) => (
                      <li key={i} className="text-gray-700">{ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}

              {details.instructions && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Instructions</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{details.instructions}</p>
                </div>
              )}

              {details.source && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Recipe Source</h3>
                  <p className="text-gray-700">{details.source}</p>
                </div>
              )}
            </>
          )}

          {/* Wishlist-specific fields */}
          {visit.type === 'wishlist' && details && (
            <>
              {details.wishlist_type && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Type</h3>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                    {details.wishlist_type === 'restaurant' ? (
                      <>
                        <UtensilsCrossed className="w-4 h-4" />
                        <span className="text-sm font-medium capitalize">{details.wishlist_type}</span>
                      </>
                    ) : (
                      <>
                        <ChefHat className="w-4 h-4" />
                        <span className="text-sm font-medium capitalize">{details.wishlist_type}</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {details.cuisine && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Cuisine</h3>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">{details.cuisine}</span>
                </div>
              )}

              {details.priority && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Priority</h3>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-medium ${
                    details.priority === 'high' 
                      ? 'bg-red-100 text-red-800' 
                      : details.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <span className="capitalize">{details.priority}</span>
                  </div>
                </div>
              )}

              {details.source && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Where We Heard About It</h3>
                  <p className="text-gray-700">{details.source}</p>
                </div>
              )}

              {details.url && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {details.wishlist_type === 'recipe' ? 'Recipe Link' : 'Website'}
                  </h3>
                  <a href={details.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                    {details.url}
                  </a>
                </div>
              )}
            </>
          )}

          {/* Ratings (for restaurant and home_meal) */}
          {(visit.type === 'restaurant' || visit.type === 'home_meal') && (details?.brett_rating || details?.jean_rating) && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Ratings</h3>
              <div className="space-y-2">
                {details.brett_rating && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Brett</span>
                    <div className="flex items-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < details.brett_rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                      ))}
                      <span className="text-sm font-medium">{details.brett_rating}</span>
                    </div>
                  </div>
                )}
                {details.jean_rating && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Jean</span>
                    <div className="flex items-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < details.jean_rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                      ))}
                      <span className="text-sm font-medium">{details.jean_rating}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {visit.notes && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{visit.notes}</p>
            </div>
          )}

          {visit.tags && visit.tags.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {visit.tags.map((tag: string) => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {photos.length > 0 && photos[0].id !== 'default' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-medium text-gray-900 mb-4">Photos ({photos.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo, index) => (
                <div 
                  key={photo.id} 
                  className="relative aspect-square cursor-pointer group"
                  onClick={() => openPhotoViewer(index)}
                >
                  <img src={photo.url} alt="" className="w-full h-full object-cover rounded-lg transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                  {photo.is_featured && (
                    <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Featured
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {visit.created_by && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Added by {visit.created_by}
          </div>
        )}
      </main>

      {photoViewerOpen && (
        <PhotoViewer
          photos={photos}
          initialIndex={photoViewerIndex}
          onClose={() => setPhotoViewerOpen(false)}
        />
      )}

      {showConvertModal && (
        <ConvertWishlistModal
          wishlistId={params.id as string}
          wishlistName={displayName}
          onClose={() => setShowConvertModal(false)}
        />
      )}
    </div>
  )
}