'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UtensilsCrossed, ChefHat } from 'lucide-react'
import { Cuisine } from '@/types'

const CUISINES: Cuisine[] = [
  'American', 'Italian', 'Mexican', 'Chinese', 'Japanese', 
  'Indian', 'Thai', 'Middle Eastern', 'Mediterranean', 'Korean', 
  'Vietnamese', 'French', 'Caribbean', 'Latin American', 'African', 'Spanish'
]

export default function AddWishlistPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [name, setName] = useState('')
  const [wishlistType, setWishlistType] = useState<'restaurant' | 'recipe' | ''>('')
  const [cuisine, setCuisine] = useState<Cuisine | ''>('')
  const [source, setSource] = useState('')
  const [url, setUrl] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState('')
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

      if (!wishlistType) {
        throw new Error('Please select whether this is a restaurant or recipe')
      }

      const { data: experience, error: expError } = await supabase
        .from('experiences')
        .insert({
          user_id: user.id,
          type: 'wishlist',
          name,
          experience_date: null,
          notes,
          tags: tags ? tags.split(',').map(t => t.trim()) : null,
          created_by: createdBy,
        })
        .select()
        .single()

      if (expError) throw expError

      const { error: detailsError } = await supabase
        .from('wishlist_details')
        .insert({
          experience_id: experience.id,
          wishlist_type: wishlistType,
          cuisine: cuisine || null,
          source: source || null,
          url: url || null,
          priority: priority,
        })

      if (detailsError) throw detailsError

      router.push('/')
      router.refresh()
    } catch (err: any) {
      console.error('Error adding wishlist item:', err)
      setError(err.message || 'Failed to add wishlist item')
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
            <h1 className="text-2xl font-bold text-gray-900">Add to Wishlist</h1>
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
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What type of wishlist item? *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setWishlistType('restaurant')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    wishlistType === 'restaurant'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <UtensilsCrossed className={`w-8 h-8 mx-auto mb-2 ${
                    wishlistType === 'restaurant' ? 'text-red-500' : 'text-gray-400'
                  }`} />
                  <div className={`font-medium ${
                    wishlistType === 'restaurant' ? 'text-red-500' : 'text-gray-700'
                  }`}>
                    Restaurant
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Place to visit</div>
                </button>

                <button
                  type="button"
                  onClick={() => setWishlistType('recipe')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    wishlistType === 'recipe'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <ChefHat className={`w-8 h-8 mx-auto mb-2 ${
                    wishlistType === 'recipe' ? 'text-red-500' : 'text-gray-400'
                  }`} />
                  <div className={`font-medium ${
                    wishlistType === 'recipe' ? 'text-red-500' : 'text-gray-700'
                  }`}>
                    Recipe
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Recipe to cook</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {wishlistType === 'restaurant' ? 'Restaurant Name' : wishlistType === 'recipe' ? 'Recipe/Dish Name' : 'Name'} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder={
                  wishlistType === 'restaurant' 
                    ? 'e.g., Uchi Sushi, Joe\'s Pizza' 
                    : wishlistType === 'recipe'
                    ? 'e.g., Homemade Ramen, Beef Wellington'
                    : 'Enter name...'
                }
              />
            </div>

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
                Priority *
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPriority('low')}
                  className={`py-2 px-4 rounded-lg border-2 transition-all ${
                    priority === 'low'
                      ? 'border-gray-400 bg-gray-50 text-gray-900 font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  Low
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('medium')}
                  className={`py-2 px-4 rounded-lg border-2 transition-all ${
                    priority === 'medium'
                      ? 'border-yellow-400 bg-yellow-50 text-yellow-900 font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  Medium
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('high')}
                  className={`py-2 px-4 rounded-lg border-2 transition-all ${
                    priority === 'high'
                      ? 'border-red-400 bg-red-50 text-red-900 font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  High
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Where did you hear about it?
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., Sarah recommended it, saw on Instagram, food blog"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {wishlistType === 'restaurant' ? 'Restaurant Website/Link' : wishlistType === 'recipe' ? 'Recipe URL' : 'Website/Link'}
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder={
                  wishlistType === 'restaurant'
                    ? 'https://restaurant-website.com'
                    : wishlistType === 'recipe'
                    ? 'https://recipe-url.com'
                    : 'https://...'
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="date-night, sushi, upscale, special-occasion (comma separated)"
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
                placeholder="Why do you want to try this? Any specific dishes? Special occasion?"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Add to Wishlist'}
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