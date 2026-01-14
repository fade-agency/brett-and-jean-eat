-- Brett & Jean Eat Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- EXPERIENCES TABLE (Core table for all food experiences)
-- =============================================
CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('restaurant', 'home_meal', 'wishlist')),
  name TEXT NOT NULL,
  experience_date DATE, -- null for wishlist items
  notes TEXT,
  tags TEXT[], -- Array of tags like ['date-night', 'spicy', 'quick-meal']
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX experiences_user_id_idx ON experiences(user_id);
CREATE INDEX experiences_type_idx ON experiences(type);
CREATE INDEX experiences_date_idx ON experiences(experience_date DESC);
CREATE INDEX experiences_created_idx ON experiences(created_at DESC);

-- =============================================
-- RESTAURANT DETAILS TABLE
-- =============================================
CREATE TABLE restaurant_details (
  experience_id UUID PRIMARY KEY REFERENCES experiences(id) ON DELETE CASCADE,
  cuisine TEXT,
  price_range TEXT CHECK (price_range IN ('$', '$$', '$$$', '$$$$')),
  address TEXT,
  phone TEXT,
  website TEXT,
  rating_food DECIMAL(2,1) CHECK (rating_food >= 1 AND rating_food <= 5),
  rating_service DECIMAL(2,1) CHECK (rating_service >= 1 AND rating_service <= 5),
  rating_ambiance DECIMAL(2,1) CHECK (rating_ambiance >= 1 AND rating_ambiance <= 5),
  overall_rating DECIMAL(2,1) GENERATED ALWAYS AS (
    (rating_food + rating_service + rating_ambiance) / 3
  ) STORED,
  dishes_ordered TEXT,
  cost DECIMAL(10,2),
  visit_count INT DEFAULT 1,
  would_return BOOLEAN DEFAULT true
);

-- =============================================
-- HOME MEAL DETAILS TABLE
-- =============================================
CREATE TABLE home_meal_details (
  experience_id UUID PRIMARY KEY REFERENCES experiences(id) ON DELETE CASCADE,
  recipe_name TEXT,
  ingredients TEXT[], -- Array of ingredients
  instructions TEXT,
  cook_time_minutes INT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  servings INT,
  rating DECIMAL(2,1) CHECK (rating >= 1 AND rating <= 5),
  would_make_again BOOLEAN DEFAULT true,
  source TEXT -- "Jamie Oliver cookbook", "seriouseats.com", "Mom's recipe"
);

-- =============================================
-- WISHLIST DETAILS TABLE
-- =============================================
CREATE TABLE wishlist_details (
  experience_id UUID PRIMARY KEY REFERENCES experiences(id) ON DELETE CASCADE,
  wishlist_type TEXT NOT NULL CHECK (wishlist_type IN ('restaurant', 'recipe')),
  source TEXT, -- Where you heard about it
  url TEXT, -- Link to recipe or restaurant
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium'
);

-- =============================================
-- PHOTOS TABLE
-- =============================================
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE NOT NULL,
  storage_path TEXT NOT NULL, -- Path in Supabase Storage
  caption TEXT,
  sort_order INT DEFAULT 0,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX photos_experience_id_idx ON photos(experience_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_meal_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Experiences policies
CREATE POLICY "Users can view their own experiences"
  ON experiences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own experiences"
  ON experiences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own experiences"
  ON experiences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own experiences"
  ON experiences FOR DELETE
  USING (auth.uid() = user_id);

-- Restaurant details policies
CREATE POLICY "Users can view their own restaurant details"
  ON restaurant_details FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM experiences 
    WHERE experiences.id = restaurant_details.experience_id 
    AND experiences.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own restaurant details"
  ON restaurant_details FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM experiences 
    WHERE experiences.id = restaurant_details.experience_id 
    AND experiences.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own restaurant details"
  ON restaurant_details FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM experiences 
    WHERE experiences.id = restaurant_details.experience_id 
    AND experiences.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own restaurant details"
  ON restaurant_details FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM experiences 
    WHERE experiences.id = restaurant_details.experience_id 
    AND experiences.user_id = auth.uid()
  ));

-- Home meal details policies
CREATE POLICY "Users can view their own home meal details"
  ON home_meal_details FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM experiences 
    WHERE experiences.id = home_meal_details.experience_id 
    AND experiences.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own home meal details"
  ON home_meal_details FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM experiences 
    WHERE experiences.id = home_meal_details.experience_id 
    AND experiences.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own home meal details"
  ON home_meal_details FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM experiences 
    WHERE experiences.id = home_meal_details.experience_id 
    AND experiences.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own home meal details"
  ON home_meal_details FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM experiences 
    WHERE experiences.id = home_meal_details.experience_id 
    AND experiences.user_id = auth.uid()
  ));

-- Wishlist details policies
CREATE POLICY "Users can view their own wishlist details"
  ON wishlist_details FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM experiences 
    WHERE experiences.id = wishlist_details.experience_id 
    AND experiences.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own wishlist details"
  ON wishlist_details FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM experiences 
    WHERE experiences.id = wishlist_details.experience_id 
    AND experiences.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own wishlist details"
  ON wishlist_details FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM experiences 
    WHERE experiences.id = wishlist_details.experience_id 
    AND experiences.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own wishlist details"
  ON wishlist_details FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM experiences 
    WHERE experiences.id = wishlist_details.experience_id 
    AND experiences.user_id = auth.uid()
  ));

-- Photos policies
CREATE POLICY "Users can view photos of their experiences"
  ON photos FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM experiences 
    WHERE experiences.id = photos.experience_id 
    AND experiences.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert photos to their experiences"
  ON photos FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM experiences 
    WHERE experiences.id = photos.experience_id 
    AND experiences.user_id = auth.uid()
  ));

CREATE POLICY "Users can update photos of their experiences"
  ON photos FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM experiences 
    WHERE experiences.id = photos.experience_id 
    AND experiences.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete photos of their experiences"
  ON photos FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM experiences 
    WHERE experiences.id = photos.experience_id 
    AND experiences.user_id = auth.uid()
  ));

-- =============================================
-- STORAGE BUCKET FOR PHOTOS
-- =============================================
-- Run this in Supabase Storage dashboard or via SQL:
-- 1. Create a bucket called 'experience-photos'
-- 2. Set it to private (not public)
-- 3. Add the following storage policies:

-- Storage policies (run after creating bucket in Supabase dashboard)
-- Users can upload photos
-- CREATE POLICY "Users can upload photos"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'experience-photos' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Users can view their own photos
-- CREATE POLICY "Users can view their own photos"
-- ON storage.objects FOR SELECT
-- USING (
--   bucket_id = 'experience-photos' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Users can delete their own photos
-- CREATE POLICY "Users can delete their own photos"
-- ON storage.objects FOR DELETE
-- USING (
--   bucket_id = 'experience-photos' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for experiences table
CREATE TRIGGER update_experiences_updated_at
  BEFORE UPDATE ON experiences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================
-- Uncomment to insert sample data for testing

-- INSERT INTO experiences (user_id, type, name, experience_date, notes, tags, is_favorite)
-- VALUES 
--   (auth.uid(), 'restaurant', 'Desano Pizza', '2024-01-10', 'Amazing wood-fired pizza!', ARRAY['italian', 'date-night', 'pizza'], true),
--   (auth.uid(), 'home_meal', 'Thai Red Curry', '2024-01-12', 'Turned out great!', ARRAY['thai', 'spicy', 'curry'], false),
--   (auth.uid(), 'wishlist', 'Uchi Sushi', null, 'Heard amazing things from Sarah', ARRAY['sushi', 'upscale'], false);
