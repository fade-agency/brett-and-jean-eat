# Brett & Jean Eat 🍽️

A Progressive Web App (PWA) for tracking your food journey - restaurants visited, meals cooked at home, and your culinary wishlist.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8)

---

## 🎯 Features

### Three Content Types:
1. **🍽️ Restaurants** - Track dining experiences
   - Rate food, service, and ambiance
   - Log what you ordered, cost, location
   - Track visit count
   - Would you return?

2. **👨‍🍳 Home Meals** - Log your cooking
   - Save recipes with ingredients and instructions
   - Rate how it turned out
   - Track cook time, difficulty, servings
   - Remember the source (cookbook, website, etc.)

3. **⭐ Wishlist** - Places and recipes to try
   - Save restaurants you want to visit
   - Save recipes you want to cook
   - Set priority levels
   - Move to "done" when completed

### Core Features:
- ✅ Photo uploads (multiple per experience)
- ✅ Timeline view of all experiences
- ✅ Filter by type (restaurants, cooking, wishlist)
- ✅ Search across all experiences
- ✅ Tags for organization
- ✅ Favorite marking
- ✅ Mobile-first design
- ✅ PWA (install to home screen)
- ✅ Offline support (coming soon)
- ✅ Multi-user support (you + Jean)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier is fine)
- Basic terminal/command line knowledge

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New Project"
3. Choose a name, database password, and region
4. Wait ~2 minutes for project to be created
5. Go to **Project Settings > API**
6. Copy your **Project URL** and **anon public key**

### 2. Set Up Database

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase-schema.sql` from this project
4. Paste it into the SQL Editor
5. Click **Run** to create all tables and policies

### 3. Create Storage Bucket for Photos

1. In Supabase dashboard, go to **Storage**
2. Click **Create Bucket**
3. Name it: `experience-photos`
4. Make it **Private** (not public)
5. Click **Create bucket**

### 4. Set Up Storage Policies

Still in Storage, click on the `experience-photos` bucket, then go to **Policies**:

**Policy 1: Upload**
```sql
CREATE POLICY "Users can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'experience-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 2: View**
```sql
CREATE POLICY "Users can view their own photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'experience-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 3: Delete**
```sql
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'experience-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 5. Install Dependencies

```bash
cd brett-jean-eat
npm install
```

### 6. Configure Environment Variables

1. Copy the example env file:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 8. Create Your Account

1. Click "Sign Up" 
2. Enter your email and password
3. Check your email for verification link
4. Verify your email
5. Log in!

---

## 📁 Project Structure

```
brett-jean-eat/
├── app/                        # Next.js 14 App Router
│   ├── page.tsx               # Home page (timeline view)
│   ├── layout.tsx             # Root layout
│   ├── globals.css            # Global styles
│   ├── add/                   # Add new experience pages
│   ├── experience/[id]/       # View/edit individual experience
│   └── auth/                  # Login/signup pages
├── components/                # Reusable React components
│   ├── ui/                    # Basic UI components
│   └── experiences/           # Experience-specific components
├── lib/                       # Utilities and helpers
│   ├── supabase/             # Supabase clients
│   └── utils/                # Helper functions
├── types/                     # TypeScript type definitions
│   └── index.ts              # All app types
├── public/                    # Static files
│   ├── manifest.json         # PWA manifest
│   └── icons/                # App icons
├── supabase-schema.sql       # Database schema
└── package.json              # Dependencies
```

---

## 🎨 Customization

### Change Colors

Edit `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      primary: {
        // Change these hex values to your brand colors
        500: '#ef4444', // Main color
        600: '#dc2626', // Darker shade
        // ... etc
      },
    },
  },
},
```

### Change App Name

1. **In code:** Edit `app/layout.tsx` - change title and description
2. **PWA manifest:** Edit `public/manifest.json` - change name
3. **Package:** Edit `package.json` - change name

---

## 📱 PWA Features

### Install to Home Screen

**On iPhone:**
1. Open the app in Safari
2. Tap the Share button
3. Scroll and tap "Add to Home Screen"
4. Tap "Add"

**On Android:**
1. Open the app in Chrome
2. Tap the three dots menu
3. Tap "Install app" or "Add to Home Screen"
4. Tap "Install"

### Offline Support (Coming Soon)

The app will work offline using service workers. Currently in development.

---

## 🔐 Security

### Row Level Security (RLS)

All database tables use Supabase Row Level Security to ensure:
- Users can only see their own data
- Users can only modify their own data
- Photos are private to the user who uploaded them

### Authentication

- Email/password auth via Supabase
- Session management handled automatically
- Secure cookie-based sessions

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click "Deploy"

Your app will be live at: `https://your-app-name.vercel.app`

### Custom Domain

In Vercel:
1. Go to your project
2. Click "Settings" > "Domains"
3. Add your domain (e.g., `brettandjeaneat.com`)
4. Follow DNS instructions

---

## 🛠️ Development Tips

### Adding New Features

1. **New page:** Create folder in `app/` directory
2. **New component:** Add to `components/` directory
3. **New type:** Add to `types/index.ts`
4. **Database changes:** Update `supabase-schema.sql` and run migration

### Common Tasks

**Add a new field to restaurants:**
1. Update database schema in `supabase-schema.sql`
2. Run the ALTER TABLE command in Supabase SQL editor
3. Update TypeScript types in `types/index.ts`
4. Update forms/displays to show the new field

**Change styling:**
- Global styles: `app/globals.css`
- Component styles: Use Tailwind classes inline
- Theme colors: `tailwind.config.ts`

---

## 🐛 Troubleshooting

### "Invalid API key" error
- Check your `.env.local` file has correct Supabase credentials
- Restart dev server after changing `.env.local`

### Photos not uploading
- Check storage bucket exists and is named `experience-photos`
- Verify storage policies are set correctly
- Check browser console for specific errors

### Login not working
- Verify email confirmation (check spam folder)
- Check Supabase Auth settings allow email/password
- Look for errors in browser console

### Database errors
- Ensure `supabase-schema.sql` was run completely
- Check Supabase Table Editor to verify tables exist
- Verify RLS policies are enabled

---

## 📊 Database Schema Overview

```
experiences (core table)
  ├── restaurant_details (if type = 'restaurant')
  ├── home_meal_details (if type = 'home_meal')
  ├── wishlist_details (if type = 'wishlist')
  └── photos (multiple per experience)
```

Each experience has:
- Basic info (name, date, notes, tags)
- Type-specific details (ratings, ingredients, etc.)
- Associated photos

---

## 🎓 Learning Resources

### Next.js 14
- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Tutorial](https://nextjs.org/learn)

### Supabase
- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### Tailwind CSS
- [Tailwind Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/)

---

## 🗺️ Roadmap

### Phase 1: MVP (Current)
- [x] Database schema
- [x] Authentication
- [x] Basic CRUD operations
- [ ] Photo uploads
- [ ] Complete forms for all types
- [ ] View/edit individual experiences

### Phase 2: Enhanced Features
- [ ] Search functionality
- [ ] Advanced filtering
- [ ] Stats dashboard
- [ ] Export to CSV
- [ ] Move wishlist items to completed

### Phase 3: Social Features
- [ ] Share individual experiences
- [ ] Shared account (Brett + Jean)
- [ ] Collaborative wishlists

### Phase 4: AI Features
- [ ] Recipe recommendations
- [ ] Restaurant suggestions
- [ ] OCR for recipe import
- [ ] Meal planning

---

## 💡 Tips for Brett

### Your Design Strengths
- Focus on making the UI beautiful (you're great at this!)
- Use your 25 years of design experience
- Don't worry about getting TypeScript perfect initially
- The design will differentiate this from competitors

### Learning Next.js
- Components are like PHP includes but reactive
- `useState` = keeping track of changing data
- `useEffect` = do something when page loads or data changes
- Server components vs Client components = just add 'use client' when you need interactivity

### When You Get Stuck
1. Check the browser console (F12)
2. Read the error message carefully
3. Ask me (Claude) - paste the error
4. Check Next.js or Supabase docs

### Working with AI (Me!)
- Show me errors, I'll explain them
- Ask me to write specific components
- Request explanations of any code
- I can help you build ANY feature you want

---

## 📝 Current Status

**What's Built:**
- ✅ Complete database schema
- ✅ TypeScript types
- ✅ Supabase configuration
- ✅ Authentication setup
- ✅ Basic home page (timeline)
- ✅ Project structure
- ✅ PWA manifest

**What's Next:**
1. Create login/signup pages
2. Build add experience forms
3. Build view/edit experience pages
4. Implement photo uploads
5. Add search and filtering
6. Polish the UI (your specialty!)

---

## 🤝 Contributing

This is a personal project, but if you want to:
- Add features
- Fix bugs
- Improve documentation

Just make the changes! It's your project.

---

## 📄 License

This is your personal project - do whatever you want with it!

---

## 🎉 Let's Build This!

You now have a complete starter with:
- Modern tech stack (Next.js 14, TypeScript, Supabase)
- Database designed for your use case
- Authentication ready to go
- Mobile-first, PWA-ready
- Clean architecture to build on

**Next steps:**
1. Run through the Quick Start above
2. Get the app running locally
3. Create your account
4. Start building out the forms and features
5. Make it beautiful (your strength!)

**Need help?** Just ask me to:
- Build a specific component
- Explain how something works
- Debug an error
- Add a new feature

Let's make this amazing! 🚀
