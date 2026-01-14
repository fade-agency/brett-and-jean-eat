# 🚀 Quick Start Guide

Get "Brett & Jean Eat" running in 15 minutes!

## Step 1: Create Supabase Project (5 min)

1. Go to https://supabase.com and create free account
2. Click "New Project"
3. Name it "brett-jean-eat"
4. Choose a database password (write it down!)
5. Select closest region
6. Click "Create new project"
7. Wait ~2 minutes for it to spin up

## Step 2: Set Up Database (3 min)

1. In Supabase dashboard, click "SQL Editor" in left sidebar
2. Click "New Query"
3. Open the `supabase-schema.sql` file from this project
4. Copy ALL the text (Cmd+A, Cmd+C)
5. Paste into Supabase SQL Editor
6. Click "Run" button (bottom right)
7. You should see "Success. No rows returned"

## Step 3: Create Photo Storage (2 min)

1. In Supabase, click "Storage" in left sidebar
2. Click "Create a new bucket"
3. Name: `experience-photos`
4. Toggle "Private bucket" to ON
5. Click "Create bucket"
6. Click on the bucket you just created
7. Go to "Policies" tab
8. Click "New Policy"
9. Choose "Custom" and paste these three policies:

**Upload Policy:**
```sql
CREATE POLICY "Users can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'experience-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**View Policy:**
```sql
CREATE POLICY "Users can view their own photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'experience-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**Delete Policy:**
```sql
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'experience-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## Step 4: Get Your API Keys (1 min)

1. In Supabase, click "Project Settings" (gear icon at bottom of sidebar)
2. Click "API" in the settings menu
3. You'll see two things:
   - **Project URL** - copy this
   - **anon public** key - copy this

## Step 5: Install App (3 min)

Open Terminal and run these commands:

```bash
cd brett-jean-eat
npm install
```

Wait for it to finish (might take 2-3 minutes).

## Step 6: Add Your API Keys (1 min)

1. In VS Code (or your editor), find the file `.env.local.example`
2. Make a copy and name it `.env.local`
3. Open `.env.local`
4. Replace the placeholders with your real values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-key-here
```

Save the file.

## Step 7: Run It! (1 min)

In Terminal:

```bash
npm run dev
```

Open your browser and go to: http://localhost:3000

You should see the app! 🎉

## Step 8: Create Your Account

1. Click "Sign up"
2. Enter your email and password
3. Check your email
4. Click the confirmation link
5. Go back to the app and log in

## Done! 🎊

You're ready to start adding restaurants, meals, and wishlist items!

---

## Troubleshooting

**"Invalid API key" error:**
- Check your `.env.local` file has the correct values
- Make sure there are no extra spaces
- Restart the dev server (`npm run dev`)

**Can't sign up:**
- Check your email spam folder
- Make sure you clicked the confirmation link

**Database errors:**
- Make sure you ran the ENTIRE `supabase-schema.sql` file
- Check in Supabase Table Editor that tables exist

**Need help?**
Read the full README.md for detailed troubleshooting and explanations!
