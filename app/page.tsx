'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PlusCircle, UtensilsCrossed, ChefHat, Star, LogOut, Settings, DollarSign, Search, ArrowUpDown } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDistance } from 'date-fns'

export default function HomePage() {
  const [experiences, setExperiences] = useState<any[]>([])
  const [filteredExperiences, setFilteredExperiences] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'restaurant' | 'home_meal' | 'wishlist'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'rating'>('date')
  const [photoUrls, setPhotoUrls] = useState<{ [key: string]: string }>({})
  const [userName, setUserName] = useState<string>('')
  const [showMenu, setShowMenu] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadUser()
    loadExperiences()
  }, [filter])

  useEffect(() => {
    filterAndSortExperiences()
  }, [experiences, searchQuery, sortBy])

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.user_metadata?.display_name) {
      setUserName(user.user_metadata.display_name)
    } else if (user?.email) {
      setUserName(user.email.split('@')[0])
    }
  }

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
      
      const urls: { [key: string]: string } = {}
      for (const exp of data || []) {
        const featuredPhoto = exp.photos?.find((p: any) => p.is_featured) || exp.photos?.[0]
        if (featuredPhoto) {
          const { data: urlData } = supabase.storage
            .from('experience-photos')
            .getPublicUrl(featuredPhoto.storage_path)
          
          if (urlData) {
            urls[exp.id] = urlData.publicUrl
          }
        } else {
          urls[exp.id] = '/default-restaurant.svg'
        }
      }
      setPhotoUrls(urls)
    }
    
    setLoading(false)
  }

  function filterAndSortExperiences() {
    let filtered = [...experiences]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(exp =>
        exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'rating':
          const aRating = getRatings(a)
          const bRating = getRatings(b)
          const aAvg = aRating.brett && aRating.jean ? (aRating.brett + aRating.jean) / 2 : (aRating.brett || aRating.jean || 0)
          const bAvg = bRating.brett && bRating.jean ? (bRating.brett + bRating.jean) / 2 : (bRating.brett || bRating.jean || 0)
          return bAvg - aAvg
        case 'date':
        default:
          return new Date(b.experience_date || b.created_at).getTime() - new Date(a.experience_date || a.created_at).getTime()
      }
    })

    setFilteredExperiences(filtered)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
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
        return <UtensilsCrossed className="w-5 h-5" />
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

  const getRatings = (exp: any) => {
    if (exp.type === 'restaurant' && exp.restaurant_details) {
      return {
        brett: exp.restaurant_details.brett_rating,
        jean: exp.restaurant_details.jean_rating
      }
    }
    if (exp.type === 'home_meal' && exp.home_meal_details) {
      return {
        brett: exp.home_meal_details.brett_rating,
        jean: exp.home_meal_details.jean_rating
      }
    }
    return { brett: null, jean: null }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Brett & Jean Eat</h1>
              <p className="text-sm text-gray-600">Our food journey 🍽️</p>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">Hi {userName}!</div>
                  <div className="text-xs text-gray-500">Click for options</div>
                </div>
              </button>

              {showMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-40">
                    <Link
                      href="/update-password"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowMenu(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Change Password
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="bg-white border-b sticky top-[89px] z-10">
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

      {/* Search & Sort Bar */}
      <div className="bg-white border-b sticky top-[145px] z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search experiences..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white cursor-pointer"
              >
                <option value="date">Date</option>
                <option value="name">Name</option>
                <option value="rating">Rating</option>
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <LoadingSkeletons />
        ) : filteredExperiences.length === 0 ? (
          searchQuery ? (
            <div className="text-center py-16">
              <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-6">Try searching for something else</p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-red-500 hover:text-red-600 font-medium"
              >
                Clear search
              </button>
            </div>
          ) : (
            <EmptyState filter={filter} />
          )
        ) : (
          <div className="space-y-4">
            {filteredExperiences.map((exp: any) => {
              const ratings = getRatings(exp)
              const featuredPhotoUrl = photoUrls[exp.id]
              const details = exp.type === 'restaurant' ? exp.restaurant_details : exp.home_meal_details
              
              return (
                <Link
                  key={exp.id}
                  href={`/experience/${exp.id}`}
                  className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="flex">
                    {featuredPhotoUrl && (
                      <div className="w-32 h-32 flex-shrink-0">
                        <img
                          src={featuredPhotoUrl}
                          alt={exp.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          {getTypeIcon(exp.type)}
                          <h3 className="font-semibold text-lg">{exp.name}</h3>
                        </div>
                        {exp.is_favorite && (
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 flex-shrink-0" />
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
                        {exp.created_by && (
                          <>
                            {' · '}
                            <span className="text-gray-500">by {exp.created_by}</span>
                          </>
                        )}
                      </div>

                      {(ratings.brett || ratings.jean) && (
                        <div className="flex gap-3 mb-2">
                          {ratings.brett && (
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded text-sm">
                              <span className="text-blue-700 font-medium">Brett:</span>
                              <span className="text-blue-900 font-semibold">{ratings.brett}</span>
                            </div>
                          )}
                          {ratings.jean && (
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-pink-50 rounded text-sm">
                              <span className="text-pink-700 font-medium">Jean:</span>
                              <span className="text-pink-900 font-semibold">{ratings.jean}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {details && (
                        <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                          {details.cuisine && (
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                              {details.cuisine}
                            </span>
                          )}
                          {details.price_range && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              <span className="text-xs">{details.price_range}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {exp.notes && (
                        <p className="text-gray-700 text-sm line-clamp-2 mb-2">{exp.notes}</p>
                      )}

                      {exp.tags && exp.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {exp.tags.slice(0, 3).map((tag: string) => (
                            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                          {exp.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                              +{exp.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>

      {/* Floating Add Button */}
      <Link
        href="/add"
        className="fixed bottom-6 right-6 bg-red-500 text-white p-4 rounded-full shadow-lg hover:bg-red-600 transition-all hover:scale-110 z-30"
      >
        <PlusCircle className="w-6 h-6" />
      </Link>
    </div>
  )
}

function LoadingSkeletons() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
          <div className="flex">
            <div className="w-32 h-32 bg-gray-200" />
            <div className="flex-1 p-4">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="flex gap-2 mb-2">
                <div className="h-6 bg-gray-200 rounded w-16" />
                <div className="h-6 bg-gray-200 rounded w-16" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ filter }: { filter: string }) {
  const messages = {
    all: {
      icon: UtensilsCrossed,
      title: "No experiences yet",
      subtitle: "Start tracking your food journey!",
    },
    restaurant: {
      icon: UtensilsCrossed,
      title: "No restaurants yet",
      subtitle: "Add your first restaurant experience!",
    },
    home_meal: {
      icon: ChefHat,
      title: "No home meals yet",
      subtitle: "Start documenting your cooking adventures!",
    },
    wishlist: {
      icon: Star,
      title: "No wishlist items yet",
      subtitle: "Add places you want to try!",
    }
  }

  const config = messages[filter as keyof typeof messages] || messages.all
  const Icon = config.icon

  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-6">
        <Icon className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{config.title}</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">{config.subtitle}</p>
      <Link
        href="/add"
        className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors shadow-lg"
      >
        <PlusCircle className="w-5 h-5" />
        <span>Add Experience</span>
      </Link>
    </div>
  )
}