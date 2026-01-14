'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Star, UtensilsCrossed, ChefHat, Star as StarOutline, Trash2 } from 'lucide-react'

export default function ExperiencePage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [experience, setExperience] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadExperience()
  }, [])

  async function loadExperience() {
    const { data, error } = await supabase
      .from('experiences')
      .select(`
        *,
        restaurant_details(*),
        home_meal_details(*),
        wishlist_details(*),
        photos(*)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error loading experience:', error)
    } else {
      setExperience(data)
    }
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this experience? This cannot be undone.')) {
      return
    }

    setDeleting(true)
    const { error } = await supabase
      .from('experiences')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting:', error)
      alert('Error deleting experience')
      setDeleting(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (!experience) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Experience not found</h2>
          <Link href="/" className="text-red-500 hover:text-red-600">
            Go back home
          </Link>
        </div>
      </div>
    )
  }

  const getTypeIcon = () => {
    switch (experience.type) {
      case 'restaurant':
        return <UtensilsCrossed className="w-6 h-6" />
      case 'home_meal':
        return <ChefHat className="w-6 h-6" />
      case 'wishlist':
        return <StarOutline className="w-6 h-6" />
    }
  }

  const getTypeLabel = () => {
    switch (experience.type) {
      case 'restaurant':
        return 'Restaurant'
      case 'home_meal':
        return 'Home Cooked'
      case 'wishlist':
        return 'Wishlist'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header Section */}
          <div className="p-6 border-b">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-red-500">
                  {getTypeIcon()}
                </div>
                <div>
                  <div className="text-sm text-gray-500">{getTypeLabel()}</div>
                  <h1 className="text-3xl font-bold text-gray-900">{experience.name}</h1>
                </div>
              </div>
              {experience.is_favorite && (
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              )}
            </div>

            <div className="text-gray-600">
              {experience.experience_date ? (
                <span>{new Date(experience.experience_date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              ) : (
                <span className="text-gray-400">On wishlist</span>
              )}
            </div>

            {experience.tags && experience.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {experience.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Wishlist Details */}
          {experience.type === 'wishlist' && experience.wishlist_details && (
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Wishlist Details</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Type</div>
                  <div className="text-gray-900 capitalize flex items-center gap-2">
                    {experience.wishlist_details.wishlist_type === 'restaurant' ? (
                      <>
                        <UtensilsCrossed className="w-4 h-4" />
                        Restaurant to Visit
                      </>
                    ) : (
                      <>
                        <ChefHat className="w-4 h-4" />
                        Recipe to Cook
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500">Priority</div>
                  <div className="text-gray-900">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      experience.wishlist_details.priority === 'high'
                        ? 'bg-red-100 text-red-800'
                        : experience.wishlist_details.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {experience.wishlist_details.priority.charAt(0).toUpperCase() + experience.wishlist_details.priority.slice(1)}
                    </span>
                  </div>
                </div>

                {experience.wishlist_details.source && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Source</div>
                    <div className="text-gray-900">{experience.wishlist_details.source}</div>
                  </div>
                )}

                {experience.wishlist_details.url && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Link</div>
                    <a 
                      href={experience.wishlist_details.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-500 hover:text-red-600 break-all"
                    >
                      {experience.wishlist_details.url}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Home Meal Details */}
          {experience.type === 'home_meal' && experience.home_meal_details && (
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Meal Details</h2>
              
              {/* Rating */}
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-red-500">
                  {experience.home_meal_details.rating}
                </div>
                <div className="text-sm text-gray-600">How it turned out</div>
              </div>

              <div className="space-y-4">
                {experience.home_meal_details.recipe_name && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Recipe Name</div>
                    <div className="text-gray-900">{experience.home_meal_details.recipe_name}</div>
                  </div>
                )}

                {experience.home_meal_details.difficulty && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Difficulty</div>
                    <div className="text-gray-900 capitalize">{experience.home_meal_details.difficulty}</div>
                  </div>
                )}

                {experience.home_meal_details.servings && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Servings</div>
                    <div className="text-gray-900">{experience.home_meal_details.servings}</div>
                  </div>
                )}

                {experience.home_meal_details.cook_time_minutes && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Cook Time</div>
                    <div className="text-gray-900">{experience.home_meal_details.cook_time_minutes} minutes</div>
                  </div>
                )}

                {experience.home_meal_details.ingredients && experience.home_meal_details.ingredients.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-2">Ingredients</div>
                    <ul className="list-disc list-inside space-y-1 text-gray-900">
                      {experience.home_meal_details.ingredients.map((ingredient: string, idx: number) => (
                        <li key={idx}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {experience.home_meal_details.instructions && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-2">Instructions</div>
                    <div className="text-gray-900 whitespace-pre-line">{experience.home_meal_details.instructions}</div>
                  </div>
                )}

                {experience.home_meal_details.source && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Recipe Source</div>
                    <div className="text-gray-900">{experience.home_meal_details.source}</div>
                  </div>
                )}

                <div>
                  <div className="text-sm font-medium text-gray-500">Would Make Again?</div>
                  <div className="text-gray-900">{experience.home_meal_details.would_make_again ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Restaurant Details */}
          {experience.type === 'restaurant' && experience.restaurant_details && (
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Restaurant Details</h2>
              
              {/* Ratings */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {experience.restaurant_details.rating_food}
                  </div>
                  <div className="text-sm text-gray-600">Food</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {experience.restaurant_details.rating_service}
                  </div>
                  <div className="text-sm text-gray-600">Service</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {experience.restaurant_details.rating_ambiance}
                  </div>
                  <div className="text-sm text-gray-600">Ambiance</div>
                </div>
              </div>

              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-red-500">
                  {experience.restaurant_details.overall_rating}
                </div>
                <div className="text-sm text-gray-600">Overall Rating</div>
              </div>

              <div className="space-y-4">
                {experience.restaurant_details.cuisine && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Cuisine</div>
                    <div className="text-gray-900">{experience.restaurant_details.cuisine}</div>
                  </div>
                )}

                {experience.restaurant_details.price_range && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Price Range</div>
                    <div className="text-gray-900">{experience.restaurant_details.price_range}</div>
                  </div>
                )}

                {experience.restaurant_details.dishes_ordered && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">What We Ordered</div>
                    <div className="text-gray-900">{experience.restaurant_details.dishes_ordered}</div>
                  </div>
                )}

                {experience.restaurant_details.cost && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Total Cost</div>
                    <div className="text-gray-900">${experience.restaurant_details.cost}</div>
                  </div>
                )}

                {experience.restaurant_details.address && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Address</div>
                    <div className="text-gray-900 whitespace-pre-line">{experience.restaurant_details.address}</div>
                  </div>
                )}

                {experience.restaurant_details.phone && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Phone</div>
                    <div className="text-gray-900">{experience.restaurant_details.phone}</div>
                  </div>
                )}

                {experience.restaurant_details.website && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Website</div>
                    <a 
                      href={experience.restaurant_details.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-500 hover:text-red-600"
                    >
                      {experience.restaurant_details.website}
                    </a>
                  </div>
                )}

                <div>
                  <div className="text-sm font-medium text-gray-500">Visit Count</div>
                  <div className="text-gray-900">{experience.restaurant_details.visit_count} time(s)</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500">Would Return?</div>
                  <div className="text-gray-900">{experience.restaurant_details.would_return ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {experience.notes && (
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Notes</h2>
              <p className="text-gray-700 whitespace-pre-line">{experience.notes}</p>
            </div>
          )}

          {/* Photos */}
          {experience.photos && experience.photos.length > 0 && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Photos ({experience.photos.length})</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {experience.photos.map((photo: any) => (
                  <div
                    key={photo.id}
                    className="aspect-square rounded-lg bg-gray-100"
                  >
                    {/* Photo will be loaded here */}
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg"></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Added {new Date(experience.created_at).toLocaleDateString()}
        </div>
      </main>
    </div>
  )
}