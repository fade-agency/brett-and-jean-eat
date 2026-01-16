// types/index.ts
// Type definitions for Brett & Jean Eat

export type Cuisine = string;
export type ExperienceType = 'restaurant' | 'home_meal' | 'wishlist';
export type PriceRange = '$' | '$$' | '$$$' | '$$$$';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Priority = 'low' | 'medium' | 'high';
export type WishlistType = 'restaurant' | 'recipe';

// Core Experience type
export interface Experience {
  id: string;
  user_id: string;
  type: ExperienceType;
  name: string;
  experience_date: string | null;
  notes: string | null;
  tags: string[] | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

// Restaurant details
export interface RestaurantDetails {
  experience_id: string;
  cuisine: string | null;
  price_range: PriceRange | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  rating_food: number | null;
  rating_service: number | null;
  rating_ambiance: number | null;
  overall_rating: number | null;
  dishes_ordered: string | null;
  cost: number | null;
  visit_count: number;
  would_return: boolean;
}

// Home meal details
export interface HomeMealDetails {
  experience_id: string;
  recipe_name: string | null;
  ingredients: string[] | null;
  instructions: string | null;
  cook_time_minutes: number | null;
  difficulty: Difficulty | null;
  servings: number | null;
  rating: number | null;
  would_make_again: boolean;
  source: string | null;
}

// Wishlist details
export interface WishlistDetails {
  experience_id: string;
  wishlist_type: WishlistType;
  source: string | null;
  url: string | null;
  priority: Priority;
}

// Photo
export interface Photo {
  id: string;
  experience_id: string;
  storage_path: string;
  caption: string | null;
  sort_order: number;
  uploaded_at: string;
}

// Combined types for fetching
export interface RestaurantExperience extends Experience {
  restaurant_details: RestaurantDetails | null;
  photos: Photo[];
}

export interface HomeMealExperience extends Experience {
  home_meal_details: HomeMealDetails | null;
  photos: Photo[];
}

export interface WishlistExperience extends Experience {
  wishlist_details: WishlistDetails | null;
  photos: Photo[];
}

// Union type for any experience with details
export type FullExperience = RestaurantExperience | HomeMealExperience | WishlistExperience;

// Form data types (for creating/updating)
export interface CreateRestaurantData {
  name: string;
  experience_date: string;
  notes?: string;
  tags?: string[];
  cuisine?: string;
  price_range?: PriceRange;
  address?: string;
  phone?: string;
  website?: string;
  rating_food: number;
  rating_service: number;
  rating_ambiance: number;
  dishes_ordered?: string;
  cost?: number;
}

export interface CreateHomeMealData {
  name: string;
  experience_date: string;
  notes?: string;
  tags?: string[];
  recipe_name?: string;
  ingredients?: string[];
  instructions?: string;
  cook_time_minutes?: number;
  difficulty?: Difficulty;
  servings?: number;
  rating: number;
  source?: string;
}

export interface CreateWishlistData {
  name: string;
  notes?: string;
  tags?: string[];
  wishlist_type: WishlistType;
  source?: string;
  url?: string;
  priority?: Priority;
}

// Filter options
export interface FilterOptions {
  type?: ExperienceType | 'all';
  search?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  favoriteOnly?: boolean;
}
