'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UtensilsCrossed, ChefHat } from 'lucide-react'

export default function AddWishlistPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [name, setName] = useState('')
  const [wishlistType, setWishlistType] = useState<'restaurant' | 'recipe' | ''>('')
  const [source, setSource] = useState('')
  const [url, setUrl] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Validate wishlist type is selected
      if (!wishlistType) {
        throw new Error('Please select whether this is a restaurant or recipe')
      }

      // Create experience
      const { data: experience, error: expError } = await supabase
        .from('experiences')
        .insert({
          user_id: user.id,
          type: 'wishlist',
          name,
          experience_date: null, // Wishlist items don't have dates
          notes,
          tags: tags ? tags.split(',').map(t => t.trim()) : null,
        })
        .select()
        .single()

      if (expError) throw expError

      // Create wishlist details
      const { error: detailsError } = await supabase
        .from('wishlist_details')
        .insert({
          experience_id: experience.id,
          wishlist_type: wishlistType,
          source: source || null,
          url: url || null,
          priority: priority,
        })

      if (detailsError) throw detailsError

      // Success! Redirect to home
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
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href="/add" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Add to Wishlist
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type Selection */}
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

            {/* Name */}
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

            {/* Priority */}
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

            {/* Source */}
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

            {/* URL */}
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

            {/* Tags */}
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

            {/* Notes */}
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

            {/* Submit Button */}
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