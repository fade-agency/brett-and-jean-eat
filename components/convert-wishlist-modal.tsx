'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UtensilsCrossed, ChefHat, X } from 'lucide-react'
import { useToast } from './toast-provider'

interface ConvertWishlistModalProps {
  wishlistId: string
  wishlistName: string
  onClose: () => void
}

export default function ConvertWishlistModal({ wishlistId, wishlistName, onClose }: ConvertWishlistModalProps) {
  const supabase = createClient()
  const { showToast } = useToast()
  const [converting, setConverting] = useState(false)
  const [selectedType, setSelectedType] = useState<'restaurant' | 'home_meal' | null>(null)

  async function handleConvert() {
    if (!selectedType) return

    setConverting(true)

    try {
      // Get the wishlist data
      const { data: wishlist } = await supabase
        .from('visits')
        .select(`*, wishlist_details(*), photos(*)`)
        .eq('id', wishlistId)
        .single()

      if (!wishlist) throw new Error('Wishlist not found')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let placeId = null

      // If converting to restaurant, create a place
      if (selectedType === 'restaurant') {
        const { data: newPlace, error: placeError } = await supabase
          .from('places')
          .insert({
            user_id: user.id,
            name: wishlist.name,
            cuisine: wishlist.wishlist_details?.cuisine || null,
          })
          .select()
          .single()

        if (placeError) throw placeError
        placeId = newPlace.id
      }

      // Create new visit
      const { data: newVisit, error: visitError } = await supabase
        .from('visits')
        .insert({
          user_id: user.id,
          place_id: placeId,
          type: selectedType,
          name: wishlist.name,
          visit_date: new Date().toISOString().split('T')[0], // Today's date
          notes: wishlist.notes,
          tags: wishlist.tags,
          created_by: wishlist.created_by,
        })
        .select()
        .single()

      if (visitError) throw visitError

      // Create type-specific details
      if (selectedType === 'restaurant') {
        const { error: detailsError } = await supabase
          .from('restaurant_visit_details')
          .insert({
            visit_id: newVisit.id,
          })
        if (detailsError) throw detailsError
      } else {
        const { error: detailsError } = await supabase
          .from('home_meal_details')
          .insert({
            visit_id: newVisit.id,
            cuisine: wishlist.wishlist_details?.cuisine || null,
          })
        if (detailsError) throw detailsError
      }

      // Copy photos if they exist
      if (wishlist.photos && wishlist.photos.length > 0) {
        for (let i = 0; i < wishlist.photos.length; i++) {
          const photo = wishlist.photos[i]
          
          // Download the original photo
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('experience-photos')
            .download(photo.storage_path)

          if (downloadError) {
            console.error('Error downloading photo:', downloadError)
            continue
          }

          // Upload to new location
          const fileExt = photo.storage_path.split('.').pop()
          const fileName = `${newVisit.id}-${Date.now()}-${i}.${fileExt}`
          const filePath = `${user.id}/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('experience-photos')
            .upload(filePath, fileData)

          if (uploadError) {
            console.error('Error uploading photo:', uploadError)
            continue
          }

          // Create photo record
          await supabase.from('photos').insert({
            visit_id: newVisit.id,
            storage_path: filePath,
            is_featured: photo.is_featured,
            sort_order: photo.sort_order,
          })
        }
      }

      // Delete the wishlist item
      await supabase.from('visits').delete().eq('id', wishlistId)

      showToast('Converted to visited! Redirecting to edit...', 'success')
      
      // Redirect to edit page
      setTimeout(() => {
        window.location.href = selectedType === 'restaurant' 
          ? `/edit/restaurant/${newVisit.id}`
          : `/edit/home-meal/${newVisit.id}`
      }, 1000)

    } catch (err: any) {
      console.error('Conversion error:', err)
      showToast(err.message || 'Failed to convert', 'error')
      setConverting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Mark as Visited</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Convert <span className="font-medium">{wishlistName}</span> to:
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setSelectedType('restaurant')}
            disabled={converting}
            className={`p-4 border-2 rounded-lg transition-all ${
              selectedType === 'restaurant'
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${converting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <UtensilsCrossed className={`w-8 h-8 mx-auto mb-2 ${
              selectedType === 'restaurant' ? 'text-red-500' : 'text-gray-400'
            }`} />
            <div className={`font-medium ${
              selectedType === 'restaurant' ? 'text-red-500' : 'text-gray-700'
            }`}>
              Restaurant
            </div>
          </button>

          <button
            onClick={() => setSelectedType('home_meal')}
            disabled={converting}
            className={`p-4 border-2 rounded-lg transition-all ${
              selectedType === 'home_meal'
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${converting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ChefHat className={`w-8 h-8 mx-auto mb-2 ${
              selectedType === 'home_meal' ? 'text-red-500' : 'text-gray-400'
            }`} />
            <div className={`font-medium ${
              selectedType === 'home_meal' ? 'text-red-500' : 'text-gray-700'
            }`}>
              Home Meal
            </div>
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleConvert}
            disabled={!selectedType || converting}
            className="flex-1 bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {converting ? 'Converting...' : 'Convert'}
          </button>
          <button
            onClick={onClose}
            disabled={converting}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          This will remove it from your wishlist and create a new {selectedType === 'restaurant' ? 'restaurant' : 'home meal'} visit. You'll be able to add ratings and details next.
        </p>
      </div>
    </div>
  )
}