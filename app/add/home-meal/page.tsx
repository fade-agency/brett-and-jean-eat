'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AddHomeMealPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [name, setName] = useState('')
  const [experienceDate, setExperienceDate] = useState(new Date().toISOString().split('T')[0])
  const [recipeName, setRecipeName] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [instructions, setInstructions] = useState('')
  const [cookTime, setCookTime] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | ''>('')
  const [servings, setServings] = useState('')
  const [rating, setRating] = useState(5)
  const [source, setSource] = useState('')
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

      // Create experience
      const { data: experience, error: expError } = await supabase
        .from('experiences')
        .insert({
          user_id: user.id,
          type: 'home_meal',
          name,
          experience_date: experienceDate,
          notes,
          tags: tags ? tags.split(',').map(t => t.trim()) : null,
        })
        .select()
        .single()

      if (expError) throw expError

      // Create home meal details
      const { error: detailsError } = await supabase
        .from('home_meal_details')
        .insert({
          experience_id: experience.id,
          recipe_name: recipeName || null,
          ingredients: ingredients ? ingredients.split('\n').filter(i => i.trim()) : null,
          instructions: instructions || null,
          cook_time_minutes: cookTime ? parseInt(cookTime) : null,
          difficulty: difficulty || null,
          servings: servings ? parseInt(servings) : null,
          rating: rating,
          source: source || null,
        })

      if (detailsError) throw detailsError

      // Success! Redirect to home
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
            Add Home Meal
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Meal Name */}
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
                placeholder="e.g., Thai Red Curry, Homemade Pizza"
              />
            </div>

            {/* Date Cooked */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Cooked *
              </label>
              <input
                type="date"
                value={experienceDate}
                onChange={(e) => setExperienceDate(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Recipe Name (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipe Name (if different from meal name)
              </label>
              <input
                type="text"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., Jamie Oliver's 15-Minute Thai Red Curry"
              />
            </div>

            {/* Difficulty, Servings, Cook Time */}
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
                  placeholder="30"
                />
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                How Did It Turn Out? *
              </label>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Rating</span>
                <span className="text-lg font-medium text-gray-900">{rating} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={rating}
                onChange={(e) => setRating(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Didn't work</span>
                <span>Perfect!</span>
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ingredients
              </label>
              <textarea
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm"
                rows={6}
                placeholder="List ingredients (one per line):
2 cups rice
1 lb chicken breast
1 can coconut milk
2 tbsp red curry paste
1 cup vegetables"
              />
              <p className="mt-1 text-xs text-gray-500">One ingredient per line</p>
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={6}
                placeholder="How did you make it?

1. Cook rice according to package
2. Sauté chicken until golden
3. Add curry paste and coconut milk
4. Simmer for 10 minutes
5. Add vegetables and cook until tender"
              />
            </div>

            {/* Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipe Source
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., Jamie Oliver cookbook, seriouseats.com, Mom's recipe"
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
                placeholder="thai, curry, weeknight-dinner, spicy (comma separated)"
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
                placeholder="Any other thoughts? Would you make it again? What would you change?"
              />
            </div>

            {/* Submit Button */}
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