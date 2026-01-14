# 📋 Development TODO List

## ✅ Completed
- [x] Project setup (Next.js 14, TypeScript, Tailwind)
- [x] Database schema design
- [x] Supabase configuration
- [x] TypeScript types
- [x] Authentication (login/signup)
- [x] Basic home page (timeline view)
- [x] PWA manifest
- [x] Project documentation

## 🎯 Phase 1: MVP Core Features (Priority)

### 1. Add Experience Forms (NEXT UP!)
- [ ] Create `/app/add/page.tsx` - choose experience type
- [ ] Create `/app/add/restaurant/page.tsx` - add restaurant form
- [ ] Create `/app/add/home-meal/page.tsx` - add home meal form
- [ ] Create `/app/add/wishlist/page.tsx` - add wishlist item form
- [ ] Form validation
- [ ] Success/error messages

**Tip:** Start with restaurant form, copy/modify for others.

### 2. Photo Upload Component
- [ ] Create `/components/photo-upload.tsx`
- [ ] File picker (with camera option on mobile)
- [ ] Image preview before upload
- [ ] Upload to Supabase Storage
- [ ] Multiple photo support
- [ ] Loading states

**Tip:** Use HTML input type="file" accept="image/*" capture="environment"

### 3. View Experience Page
- [ ] Create `/app/experience/[id]/page.tsx`
- [ ] Display all experience details
- [ ] Show photos in gallery
- [ ] Edit button
- [ ] Delete button (with confirmation)
- [ ] Different layouts for each type (restaurant/meal/wishlist)

### 4. Edit Experience
- [ ] Create `/app/experience/[id]/edit/page.tsx`
- [ ] Pre-fill form with existing data
- [ ] Update functionality
- [ ] Photo management (add/remove)

### 5. Better Home Page
- [ ] Improve the timeline design
- [ ] Add actual photo loading (not gray boxes)
- [ ] Better empty state
- [ ] Pull to refresh (mobile)
- [ ] Infinite scroll or pagination

## 🚀 Phase 2: Enhanced Features

### Search & Filter
- [ ] Search bar component
- [ ] Search across name, notes, tags
- [ ] Filter by date range
- [ ] Filter by tags
- [ ] Filter by rating
- [ ] Sort options (date, rating, name)

### Tags System
- [ ] Tag autocomplete
- [ ] Popular tags display
- [ ] Click tag to filter
- [ ] Manage tags (edit/delete)

### Stats Dashboard
- [ ] Total experiences count
- [ ] This month's stats
- [ ] Most visited restaurants
- [ ] Most cooked meals
- [ ] Favorite cuisines
- [ ] Charts/visualizations

### Move Wishlist to Complete
- [ ] "Mark as done" button on wishlist items
- [ ] Convert to restaurant or home_meal
- [ ] Pre-fill data from wishlist
- [ ] Track completion rate

## 💅 Phase 3: Polish & UX

### Design Improvements
- [ ] Consistent spacing/sizing
- [ ] Better color palette
- [ ] Loading skeletons
- [ ] Animations/transitions
- [ ] Error boundaries
- [ ] Toast notifications

### Mobile Optimization
- [ ] Test on iPhone
- [ ] Test on Android
- [ ] Bottom navigation?
- [ ] Swipe gestures
- [ ] Pull to refresh

### PWA Features
- [ ] Service worker
- [ ] Offline support
- [ ] Cache strategies
- [ ] Background sync
- [ ] Push notifications (optional)

## 🔧 Phase 4: Advanced Features

### Multi-User (You + Jean)
- [ ] Shared experiences
- [ ] "Brett's pick" vs "Jean's pick" tags
- [ ] Who logged what
- [ ] Collaborative wishlist

### Export/Share
- [ ] Export to CSV
- [ ] Share individual experience (link)
- [ ] Generate PDFs
- [ ] Year in review

### AI Features (Future)
- [ ] Recipe recommendations
- [ ] Restaurant suggestions
- [ ] Meal planning
- [ ] OCR recipe import

## 🐛 Known Issues to Fix

- [ ] Photo placeholders (gray boxes) - need to actually load photos
- [ ] Auth callback route needed for email verification
- [ ] Loading states everywhere
- [ ] Error handling everywhere
- [ ] Form validation messages

## 📝 Documentation to Write

- [ ] Code comments in complex functions
- [ ] Component usage examples
- [ ] Deployment guide
- [ ] How to add new features guide

---

## 🎯 Where to Start?

**For Brett (Complete Beginner to Next.js):**

1. **Start here:** Build the "Add Restaurant" form
   - Create file: `/app/add/restaurant/page.tsx`
   - Copy the login form structure
   - Replace fields with restaurant fields
   - Test adding a restaurant
   - See it appear on home page!

2. **Then:** View restaurant page
   - Create file: `/app/experience/[id]/page.tsx`
   - Fetch the restaurant data
   - Display it nicely

3. **Then:** Photo upload
   - Build the upload component
   - Test it works

4. **Then:** Keep building!

**Ask me (Claude) to:**
- "Build the add restaurant form"
- "Create the photo upload component"
- "Help me understand [concept]"
- "Debug this error: [paste error]"

I'll write the code, you learn and customize it! 🚀
