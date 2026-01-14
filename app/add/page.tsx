'use client'

import Link from 'next/link'
import { UtensilsCrossed, ChefHat, Star, ArrowLeft } from 'lucide-react'

export default function AddPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Add New Experience
          </h1>
          <p className="text-gray-600">
            What would you like to log?
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Restaurant Option */}
          <Link
            href="/add/restaurant"
            className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all hover:scale-105 border-2 border-transparent hover:border-red-500"
          >
            <div className="text-red-500 mb-4">
              <UtensilsCrossed className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
              Restaurant
            </h2>
            <p className="text-gray-600 text-sm text-center">
              Log a dining experience at a restaurant
            </p>
          </Link>

          {/* Home Meal Option */}
          <Link
            href="/add/home-meal"
            className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all hover:scale-105 border-2 border-transparent hover:border-red-500"
          >
            <div className="text-red-500 mb-4">
              <ChefHat className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
              Home Meal
            </h2>
            <p className="text-gray-600 text-sm text-center">
              Log something you cooked at home
            </p>
          </Link>

          {/* Wishlist Option */}
          <Link
            href="/add/wishlist"
            className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all hover:scale-105 border-2 border-transparent hover:border-red-500"
          >
            <div className="text-red-500 mb-4">
              <Star className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
              Wishlist
            </h2>
            <p className="text-gray-600 text-sm text-center">
              Save a place or recipe to try later
            </p>
          </Link>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>You can add photos and details on the next screen</p>
        </div>
      </main>
    </div>
  )
}
