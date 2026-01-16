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

export default function AddHomeMealPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [name, setName] = useState('')
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0])
  const [mealTime, setMealTime] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack' | ''>('')
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

      const { data: visit, error: visitError } = await supabase
        .from('visits')
        .insert({
          user_id: user.id,
          type: 'home_meal',
          name,
          visit_date: visitDate,
          meal_time: mealTime || null,
          notes,
          tags: tags ? tags.split(',').map(t => t.trim()) : null,
          created_by: createdBy,
        })
        .select()
        .single()

      if (visitError) throw visitError

      const { error: detailsError } = await supabase
        .from('home_meal_details')
        .insert({
          visit_id: visit.id,
          cuisine: cuisine || null,
          ingredients: ingredients ? ingredients.split('\n').filter(i => i.trim()) : null,
          instructions: instructions || null,
          cook_time_minutes: cookTime ? parseInt(cookTime) : null,
          difficulty: difficulty || null,
          servings: servings ? parseInt(servings) : null,
          brett_rating: brettRating,
          jean_rating: jeanRating,
          source: source || null,
        })

      if (detailsError) throw detailsError

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
      console.error('Error adding home meal:', err)
      setError(err.message || 'Failed to add home meal')
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
            <h1 className="text-2xl font-bold text-gray-900">Add Home Meal</h1>
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
                Meal Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., Homemade Lasagna, Chicken Stir Fry"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Cooked *
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

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servings
                </label>
                <input
                  type="number"
                  min="1"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cook Time (min)
                </label>
                <input
                  type="number"
                  min="1"
                  value={cookTime}
                  onChange={(e) => setCookTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="45"
                />
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ingredients (one per line)
              </label>
              <textarea
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm"
                rows={6}
                placeholder="2 cups flour&#10;1 tsp salt&#10;3 eggs&#10;1 cup milk"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={6}
                placeholder="1. Preheat oven to 350°F&#10;2. Mix dry ingredients...&#10;3. ..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipe Source
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., Grandma's cookbook, NYT Cooking, original recipe"
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
                placeholder="comfort-food, weeknight, family-favorite (comma separated)"
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
                placeholder="Any tips, substitutions, or thoughts about this meal?"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Home Meal'}
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