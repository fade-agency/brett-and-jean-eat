'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { ArrowLeft, UtensilsCrossed, ChefHat } from 'lucide-react'

export default function EditWishlistPage() {
  const params = useParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [wishlistType, setWishlistType] = useState<'restaurant' | 'recipe' | ''>('')
  const [cuisine, setCuisine] = useState('')
  const [source, setSource] = useState('')
  const [url, setUrl] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState('')
  const [createdBy, setCreatedBy] = useState<'Brett' | 'Jean' | null>(null)

  useEffect(() => {
    loadExperience()
  }, [])

  async function loadExperience() {
    const { data } = await supabase
      .from('experiences')
      .select(`*, wishlist_details(*)`)
      .eq('id', params.id)
      .single()

    if (data) {
      setName(data.name)
      setNotes(data.notes || '')
      setTags(data.tags ? data.tags.join(', ') : '')
      setCreatedBy(data.created_by)

      if (data.wishlist_details) {
        setWishlistType(data.wishlist_details.wishlist_type || '')
        setCuisine(data.wishlist_details.cuisine || '')
        setSource(data.wishlist_details.source || '')
        setUrl(data.wishlist_details.url || '')
        setPriority(data.wishlist_details.priority || 'medium')
      }
    }
    setLoading(false)
  }

  async function handleSave() {
    setSaving(true)
    setError('')

    try {
      await supabase.from('experiences').update({
        name,
        notes,
        tags: tags ? tags.split(',').map(t => t.trim()) : null,
      }).eq('id', params.id)

      await supabase.from('wishlist_details').update({
        wishlist_type: wishlistType,
        cuisine: cuisine || null,
        source: source || null,
        url: url || null,
        priority: priority,
      }).eq('experience_id', params.id)

      window.location.href = `/experience/${params.id}`
    } catch (err: any) {
      setError(err.message || 'Failed to save')
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b p-4">
        <button 
          type="button"
          onClick={() => window.location.href = `/experience/${params.id}`} 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </header>

      <main className="max-w-2xl mx-auto p-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Edit Wishlist Item</h1>
            {createdBy && <div className="text-sm text-gray-600">Added by <span className="font-medium">{createdBy}</span></div>}
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Type *</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setWishlistType('restaurant')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    wishlistType === 'restaurant' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <UtensilsCrossed className={`w-8 h-8 mx-auto mb-2 ${wishlistType === 'restaurant' ? 'text-red-500' : 'text-gray-400'}`} />
                  <div className={`font-medium ${wishlistType === 'restaurant' ? 'text-red-500' : 'text-gray-700'}`}>Restaurant</div>
                </button>
                <button
                  type="button"
                  onClick={() => setWishlistType('recipe')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    wishlistType === 'recipe' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <ChefHat className={`w-8 h-8 mx-auto mb-2 ${wishlistType === 'recipe' ? 'text-red-500' : 'text-gray-400'}`} />
                  <div className={`font-medium ${wishlistType === 'recipe' ? 'text-red-500' : 'text-gray-700'}`}>Recipe</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine</label>
              <input type="text" value={cuisine} onChange={(e) => setCuisine(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g., Italian, Japanese, Mexican" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
              <div className="grid grid-cols-3 gap-3">
                {['low', 'medium', 'high'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p as any)}
                    className={`py-2 px-4 rounded-lg border-2 transition-all ${
                      priority === p
                        ? p === 'high' ? 'border-red-400 bg-red-50 text-red-900 font-medium'
                        : p === 'medium' ? 'border-yellow-400 bg-yellow-50 text-yellow-900 font-medium'
                        : 'border-gray-400 bg-gray-50 text-gray-900 font-medium'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Where did you hear about it?</label>
              <input type="text" value={source} onChange={(e) => setSource(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website/Link</label>
              <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="comma separated" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-4 py-2 border rounded-lg" rows={4} />
            </div>

            <div className="flex gap-4">
              <button type="button" onClick={handleSave} disabled={saving} className="flex-1 bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={() => window.location.href = `/experience/${params.id}`} className="px-6 py-3 border text-gray-700 rounded-lg font-medium hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}