'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, UtensilsCrossed, ChefHat, Star, DollarSign, Coffee, Sun, Moon, Cookie, Calendar as CalendarIcon } from 'lucide-react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'

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

export default function HistoryPage() {
  const supabase = createClient()
  const [visits, setVisits] = useState<any[]>([])
  const [filteredVisits, setFilteredVisits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'restaurant' | 'home_meal'>('all')
  const [jumpToDate, setJumpToDate] = useState('')
  const [photoUrls, setPhotoUrls] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    loadVisits()
  }, [])

  useEffect(() => {
    filterVisits()
  }, [visits, filter])

  async function loadVisits() {
    setLoading(true)
    
    const { data, error } = await supabase
      .from('visits')
      .select(`
        *,
        place:places(*),
        restaurant_visit_details(*),
        home_meal_details(*),
        photos(*)
      `)
      .not('visit_date', 'is', null)
      .order('visit_date', { ascending: false })

    if (error) {
      console.error('Error loading visits:', error)
    } else {
      setVisits(data || [])
      
      const urls: { [key: string]: string } = {}
      for (const visit of data || []) {
        const featuredPhoto = visit.photos?.find((p: any) => p.is_featured) || visit.photos?.[0]
        if (featuredPhoto) {
          const { data: urlData } = supabase.storage
            .from('experience-photos')
            .getPublicUrl(featuredPhoto.storage_path)
          
          if (urlData) {
            urls[visit.id] = urlData.publicUrl
          }
        }
      }
      setPhotoUrls(urls)
    }
    
    setLoading(false)
  }

  function filterVisits() {
    let filtered = [...visits]

    if (filter !== 'all') {
      filtered = filtered.filter(v => v.type === filter)
    }

    setFilteredVisits(filtered)
  }

  function handleJumpToDate() {
    if (!jumpToDate) return

    const targetDate = jumpToDate
    const element = document.getElementById(`date-${targetDate}`)
    
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // Highlight briefly
      element.classList.add('bg-yellow-50')
      setTimeout(() => element.classList.remove('bg-yellow-50'), 2000)
    } else {
      alert('No visits found for this date')
    }
  }

  // Group visits by date
  const visitsByDate: { [key: string]: any[] } = {}
  filteredVisits.forEach(visit => {
    const date = visit.visit_date
    if (!visitsByDate[date]) {
      visitsByDate[date] = []
    }
    visitsByDate[date].push(visit)
  })

  const sortedDates = Object.keys(visitsByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  )

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'restaurant':
        return <UtensilsCrossed className="w-5 h-5" />
      case 'home_meal':
        return <ChefHat className="w-5 h-5" />
      default:
        return <UtensilsCrossed className="w-5 h-5" />
    }
  }

  const getRatings = (visit: any) => {
    if (visit.type === 'restaurant' && visit.restaurant_visit_details) {
      return {
        brett: visit.restaurant_visit_details.brett_rating,
        jean: visit.restaurant_visit_details.jean_rating
      }
    }
    if (visit.type === 'home_meal' && visit.home_meal_details) {
      return {
        brett: visit.home_meal_details.brett_rating,
        jean: visit.home_meal_details.jean_rating
      }
    }
    return { brett: null, jean: null }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Food Timeline</h1>
              <p className="text-sm text-gray-600">Chronological history of your meals</p>
            </div>
          </div>

          {/* Jump to Date */}
          <div className="flex gap-3 mb-3">
            <div className="flex-1 flex gap-2">
              <input
                type="date"
                value={jumpToDate}
                onChange={(e) => setJumpToDate(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Jump to date..."
              />
              <button
                onClick={handleJumpToDate}
                disabled={!jumpToDate}
                className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Go
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex gap-2">
            {['all', 'restaurant', 'home_meal'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === f
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'All' : f === 'restaurant' ? 'Restaurants' : 'Home Meals'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading timeline...</p>
          </div>
        ) : sortedDates.length === 0 ? (
          <div className="text-center py-16">
            <CalendarIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No meals logged yet</h3>
            <p className="text-gray-600 mb-6">Start tracking your food journey!</p>
            <Link
              href="/add"
              className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors shadow-lg"
            >
              Add Your First Meal
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDates.map((date) => (
              <div key={date} id={`date-${date}`} className="scroll-mt-24 transition-colors duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                    <CalendarIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {visitsByDate[date].length} meal{visitsByDate[date].length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 ml-6 border-l-2 border-gray-200 pl-6">
                  {visitsByDate[date].map((visit: any) => {
                    const ratings = getRatings(visit)
                    const displayName = visit.place?.name || visit.name
                    const details = visit.type === 'restaurant' ? visit.restaurant_visit_details : visit.home_meal_details

                    return (
                      <Link
                        key={visit.id}
                        href={`/experience/${visit.id}`}
                        className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                      >
                        <div className="flex">
                          {photoUrls[visit.id] && (
                            <div className="w-24 h-24 flex-shrink-0">
                              <img
                                src={photoUrls[visit.id]}
                                alt={displayName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          <div className="flex-1 p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2 flex-1">
                                {getTypeIcon(visit.type)}
                                <h3 className="font-semibold">{displayName}</h3>
                                {visit.meal_time && (
                                  <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                                    {getMealTimeIcon(visit.meal_time)}
                                    {getMealTimeLabel(visit.meal_time)}
                                  </span>
                                )}
                              </div>
                            </div>

                            {(ratings.brett || ratings.jean) && (
                              <div className="flex gap-2 mb-2">
                                {ratings.brett && (
                                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded text-xs">
                                    <span className="text-blue-700 font-medium">Brett:</span>
                                    <span className="text-blue-900 font-semibold">{ratings.brett}</span>
                                  </div>
                                )}
                                {ratings.jean && (
                                  <div className="flex items-center gap-1 px-2 py-1 bg-pink-50 rounded text-xs">
                                    <span className="text-pink-700 font-medium">Jean:</span>
                                    <span className="text-pink-900 font-semibold">{ratings.jean}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              {visit.place?.cuisine && (
                                <span className="px-2 py-1 bg-gray-100 rounded">{visit.place.cuisine}</span>
                              )}
                              {details?.cuisine && !visit.place?.cuisine && (
                                <span className="px-2 py-1 bg-gray-100 rounded">{details.cuisine}</span>
                              )}
                              {details?.cost && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  ${details.cost.toFixed(2)}
                                </span>
                              )}
                            </div>

                            {visit.notes && (
                              <p className="text-gray-600 text-sm line-clamp-1 mt-2">{visit.notes}</p>
                            )}
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}