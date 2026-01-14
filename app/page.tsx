'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Experience } from '@/types'
import { PlusCircle, UtensilsCrossed, ChefHat, Star } from 'lucide-react'
import Link from 'next/link'
import { formatDistance } from 'date-fns'

export default function HomePage() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'restaurant' | 'home_meal' | 'wishlist'>('all')
  const supabase = createClient()

  useEffect(() => {
    loadExperiences()
  }, [filter])

  async function loadExperiences() {
    setLoading(true)
    
    let query = supabase
      .from('experiences')
      .select(`
        *,
        restaurant_details(*),
        home_meal_details(*),
        wishlist_details(*),
        photos(*)
      `)
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('type', filter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error loading experiences:', error)
    } else {
      setExperiences(data || [])
    }
    
    setLoading(false)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'restaurant':
        return <UtensilsCrossed className="w-5 h-5" />
      case 'home_meal':
        return <ChefHat className="w-5 h-5" />
      case 'wishlist':
        return <Star className="w-5 h-5" />
      default:
        return null
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'restaurant':
        return 'Restaurant'
      case 'home_meal':
        return 'Home Cooked'
      case 'wishlist':
        return 'Wishlist'
      default:
        return type
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Brett & Jean Eat</h1>
          <p className="text-sm text-gray-600">Our food journey 🍽️</p>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="bg-white border-b sticky top-[73px] z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-3">
            {['all', 'restaurant', 'home_meal', 'wishlist'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === f
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'All' : getTypeLabel(f)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading experiences...</p>
          </div>
        ) : experiences.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <UtensilsCrossed className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No experiences yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start tracking your food journey!
            </p>
            <Link
              href="/add"
              className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              Add First Experience
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {experiences.map((exp: any) => (
              <Link
                key={exp.id}
                href={`/experience/${exp.id}`}
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(exp.type)}
                      <h3 className="font-semibold text-lg">{exp.name}</h3>
                    </div>
                    {exp.is_favorite && (
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    {exp.experience_date ? (
                      <span>{new Date(exp.experience_date).toLocaleDateString()}</span>
                    ) : (
                      <span className="text-gray-400">On wishlist</span>
                    )}
                    {' · '}
                    <span className="text-gray-400">
                      {formatDistance(new Date(exp.created_at), new Date(), { addSuffix: true })}
                    </span>
                  </div>

                  {exp.notes && (
                    <p className="text-gray-700 text-sm line-clamp-2 mb-2">{exp.notes}</p>
                  )}

                  {exp.tags && exp.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {exp.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {exp.photos && exp.photos.length > 0 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto">
                      {exp.photos.slice(0, 3).map((photo: any) => (
                        <div
                          key={photo.id}
                          className="w-20 h-20 rounded-lg bg-gray-100 flex-shrink-0"
                        >
                          {/* Photo will be loaded here */}
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg"></div>
                        </div>
                      ))}
                      {exp.photos.length > 3 && (
                        <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 text-sm font-medium">
                          +{exp.photos.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Floating Add Button */}
      <Link
        href="/add"
        className="fixed bottom-6 right-6 bg-red-500 text-white p-4 rounded-full shadow-lg hover:bg-red-600 transition-all hover:scale-110"
      >
        <PlusCircle className="w-6 h-6" />
      </Link>
    </div>
  )
}
