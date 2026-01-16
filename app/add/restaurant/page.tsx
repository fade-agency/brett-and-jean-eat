'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
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

  // Form state
  const [name, setName] = useState('')
  const [experienceDate, setExperienceDate] = useState(new Date().toISOString().split('T')[0])
  const [cuisine, setCuisine] = useState<Cuisine | ''>('')
  const [priceRange, setPriceRange] = useState<'$' | '$$' | '$$$' | '$$$$' | ''>('')
  const [address, setAddress] = useState('')
  const [website, setWebsite] = useState('')
  const [brettRating, setBrettRating] = useState<number | null>(null)
  const [jeanRating, setJeanRating] = useState<number | null>(null)
  const [dishesOrdered, setDishesOrdered] = useState('')
  const [cost, setCost] = useState('')
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState('')
  const [photos, setPhotos] = useState<Photo[]>([])
  const [createdBy, setCreatedBy] = useState<'Brett' | 'Jean' | null>(null)

  useEffect(() => {
    async function loadUserName() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.display_name) {
        setCreatedBy(user.user_metadata.display_name)
      }
    }
    loadUserName()
  }, [])

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

      const { data: experience, error: expError } = await supabase
        .from('experiences')
        .insert({
          user_id: user.id,
          type: 'restaurant',
          name,
          experience_date: experienceDate,
          notes,
          tags: tags ? tags.split(',').map(t => t.trim()) : null,
          created_by: createdBy,
        })
        .select()
        .single()

      if (expError) throw expError

      const { error: detailsError } = await supabase
        .from('restaurant_details')
        .insert({
          experience_id: experience.id,
          cuisine: cuisine || null,
          price_range: priceRange || null,
          address: address || null,
          website: website || null,
          brett_rating: brettRating,
          jean_rating: jeanRating,
          dishes_ordered: dishesOrdered || null,
          cost: cost ? parseFloat(cost) : null,
        })

      if (detailsError) throw detailsError

      if (photos.length > 0) {
        for (let i = 0; i < photos.length; i++) {
          const photo = photos[i]
          const fileExt = photo.file.name.split('.').pop()
          const fileName = `${experience.id}-${Date.now()}-${i}.${fileExt}`
          const filePath = `${user.id}/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('experience-photos')
            .upload(filePath, photo.file)

          if (uploadError) throw uploadError

          const { error: dbError } = await supabase
            .from('photos')
            .insert({
              experience_id: experience.id,
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
            <h1 className="text-2xl font-bold text-gray-900">Add Restaurant Experience</h1>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., Desano Pizza"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Visited *
              </label>
              <input
                type="date"
                value={experienceDate}
                onChange={(e) => setExperienceDate(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

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
                placeholder="Any other thoughts about this experience? Would you return?"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Restaurant'}
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