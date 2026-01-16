export type Cuisine = 
  | 'American' | 'Italian' | 'Mexican' | 'Chinese' | 'Japanese'
  | 'Indian' | 'Thai' | 'Middle Eastern' | 'Mediterranean' | 'Korean'
  | 'Vietnamese' | 'French' | 'Caribbean' | 'Latin American' | 'African' | 'Spanish'

export type MealTime = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface Place {
  id: string
  user_id: string
  name: string
  cuisine: Cuisine | null
  address: string | null
  website: string | null
  price_range: '$' | '$$' | '$$$' | '$$$$' | null
  created_at: string
  updated_at: string
}

export interface Visit {
  id: string
  user_id: string
  place_id: string | null
  type: 'restaurant' | 'home_meal' | 'wishlist'
  name: string
  visit_date: string | null
  meal_time: MealTime | null
  notes: string | null
  tags: string[] | null
  created_by: 'Brett' | 'Jean' | null
  is_favorite: boolean
  visit_number: number
  created_at: string
  updated_at: string
}

export interface RestaurantVisitDetails {
  id: string
  visit_id: string
  brett_rating: number | null
  jean_rating: number | null
  dishes_ordered: string | null
  cost: number | null
  created_at: string
}

export interface HomeMealDetails {
  id: string
  visit_id: string
  cuisine: Cuisine | null
  ingredients: string[] | null
  instructions: string | null
  cook_time_minutes: number | null
  difficulty: 'easy' | 'medium' | 'hard' | null
  servings: number | null
  brett_rating: number | null
  jean_rating: number | null
  source: string | null
  created_at: string
}

export interface WishlistDetails {
  id: string
  visit_id: string
  wishlist_type: 'restaurant' | 'recipe' | null
  cuisine: Cuisine | null
  source: string | null
  url: string | null
  priority: 'low' | 'medium' | 'high'
  created_at: string
}

export interface Photo {
  id: string
  visit_id: string
  storage_path: string
  is_featured: boolean
  sort_order: number
  created_at: string
}