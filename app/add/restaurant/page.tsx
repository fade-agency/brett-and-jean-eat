'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Coffee, Sun, Moon, Cookie } from 'lucide-react'
import PhotoUpload, { Photo } from '@/components/photo-upload'
import { Cuisine } from '@/types'

const CUISINES: Cuisine[] = [
  'American', 'Italian', 'Mexican', 'Chinese', 'Japanese', 
  'Indian', 'Thai', 'Middle Eastern', 'Mediterranean', 'Korean', 
  'Vietnamese', 'French', 'Caribbean', 'Latin American', 'African', 'Spanish'
]

export default function AddRestaurantPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Place selection
  const [existingPlaces, setExistingPlaces] = useState<any[]>([])
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('new')
  const [loadingPlaces, setLoadingPlaces] = useState(true)

  // Place/Restaurant info
  const [placeName, setPlaceName] = useState('')
  const [cuisine, setCuisine] = useState<Cuisine | ''>('')
  const [priceRange, setPriceRange] = useState<'$' | '$$' | '$$$' | '$$$$' | ''>('')
  const [address, setAddress] = useState('')
  const [website, setWebsite] = useState('')

  // Visit info
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0])
  const [mealTime, setMealTime] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack' | ''>('')
  const [brettRating, setBrettRating] = useState<number | null>(null)
  const [jeanRating, setJeanRating] = useState<number | null>(null)
  const [dishesOrdered, setDishesOrdered] = useState('')
  const [cost, setCost] = useState('')
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState('')
  const [photos, setPhotos] = useState<Photo[]>([])
  const [createdBy, setCreatedBy] = useState<'Brett' | 'Jean' | null>(null)

  useEffect(() => {
    loadUserAndPlaces()
  }, [])

  async function loadUserAndPlaces() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.user_metadata?.display_name) {
      setCreatedBy(user.user_metadata.display_name)
    }

    // Load existing places
    const { data: places } = await supabase
      .from('places')
      .select('*')
      .order('name')

    if (places) {
      setExistingPlaces(places)
    }
    setLoadingPlaces(false)
  }

  // When selecting existing place, populate fields
  useEffect(() => {
    if (selectedPlaceId !== 'new') {
      const place = existingPlaces.find(p => p.id === selectedPlaceId)
      if (place) {
        setPlaceName(place.name)
        setCuisine(place.cuisine || '')
        setPriceRange(place.price_range || '')
        setAddress(place.address || '')
        setWebsite(place.website || '')
      }
    } else {
      // Clear fields when creating new
      setPlaceName('')
      setCuisine('')
      setPriceRange('')
      setAddress('')
      setWebsite('')
    }
  }, [selectedPlaceId, existingPlaces])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!createdBy) {
      setError('Could not determine user. Please try logging out and back in.')
      return
    }
    
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let placeId = selectedPlaceId

      // Create new place if needed
      if (selectedPlaceId === 'new') {
        const { data: newPlace, error: placeError } = await supabase
          .from('places')
          .insert({
            user_id: user.id,
            name: placeName,
            cuisine: cuisine || null,
            price_range: priceRange || null,
            address: address || null,
            website: website || null,
          })
          .select()
          .single()

        if (placeError) throw placeError
        placeId = newPlace.id
      }

      // Create visit
      const { data: visit, error: visitError } = await supabase
        .from('visits')
        .insert({
          user_id: user.id,
          place_id: placeId,
          type: 'restaurant',
          name: placeName, // Keep for backwards compatibility/search
          visit_date: visitDate,
          meal_time: mealTime || null,
          notes,
          tags: tags ? tags.split(',').map(t => t.trim()) : null,
          created_by: createdBy,
        })
        .select()
        .single()

      if (visitError) throw visitError

      // Create visit details
      const { error: detailsError } = await supabase
        .from('restaurant_visit_details')
        .insert({
          visit_id: visit.id,
          brett_rating: brettRating,
          jean_rating: jeanRating,
          dishes_ordered: dishesOrdered || null,
          cost: cost ? parseFloat(cost) : null,
        })

      if (detailsError) throw detailsError

      // Upload photos
      if (photos.length > 0) {
        for (let i = 0; i < photos.length; i++) {
          const photo = photos[i]
          const fileExt = photo.file.name.split('.').pop()
          const fileName = `${visit.id}-${Date.now()}-${i}.${fileExt}`
          const filePath = `${user.id}/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('experience-photos')
            .upload(filePath, photo.file)

          if (uploadError) throw uploadError

          const { error: dbError } = await supabase
            .from('photos')
            .insert({
              visit_id: visit.id,
              storage_path: filePath,
              is_featured: photo.isFeatured,
              sort_order: i
            })

          if (dbError) throw dbError
        }
      }

      router.push('/')
      router.refresh()
    } catch (err: any) {
      console.error('Error adding restaurant:', err)
      setError(err.message || 'Failed to add restaurant')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href="/add" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Add Restaurant Visit</h1>
            {createdBy && (
              <div className="text-sm text-gray-600">
                Adding as <span className="font-medium text-gray-900">{createdBy}</span>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Place Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant *
              </label>
              {loadingPlaces ? (
                <div className="text-sm text-gray-500">Loading restaurants...</div>
              ) : (
                <select
                  value={selectedPlaceId}
                  onChange={(e) => setSelectedPlaceId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-3"
                >
                  <option value="new">+ Add New Restaurant</option>
                  {existingPlaces.map((place) => (
                    <option key={place.id} value={place.id}>
                      {place.name} {place.cuisine && `(${place.cuisine})`}
                    </option>
                  ))}
                </select>
              )}

              {selectedPlaceId === 'new' && (
                <input
                  type="text"
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., Desano Pizza"
                />
              )}
            </div>

            {selectedPlaceId === 'new' && (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cuisine Type
                    </label>
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range
                    </label>
                    <select
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value as any)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      <option value="$">$ - Under $15</option>
                      <option value="$$">$$ - $15-30</option>
                      <option value="$$$">$$$ - $30-60</option>
                      <option value="$$$$">$$$$ - $60+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={2}
                    placeholder="Street address, city, state"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>
              </>
            )}

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Visit Details</h3>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Visited *
                  </label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meal Time
                  </label>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Ratings
                </label>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Brett's Rating</span>
                    <span className="text-sm font-medium text-gray-900">
                      {brettRating ? brettRating : 'Not rated'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.5"
                    value={brettRating || 3}
                    onChange={(e) => setBrettRating(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>5</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Jean's Rating</span>
                    <span className="text-sm font-medium text-gray-900">
                      {jeanRating ? jeanRating : 'Not rated'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.5"
                    value={jeanRating || 3}
                    onChange={(e) => setJeanRating(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>5</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Both can rate - just leave blank if you haven't rated yet
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What Did You Order?
                </label>
                <textarea
                  value={dishesOrdered}
                  onChange={(e) => setDishesOrdered(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={3}
                  placeholder="e.g., Margherita pizza, Caesar salad, tiramisu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Cost
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <PhotoUpload
                onPhotosChange={setPhotos}
                maxPhotos={5}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="date-night, italian, outdoor-seating (comma separated)"
                />
                <p className="mt-1 text-xs text-gray-500">Separate tags with commas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={4}
                  placeholder="Any other thoughts about this visit? Would you return?"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Visit'}
              </button>
              <Link
                href="/add"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}