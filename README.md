# Recipe Finder 🍳

A modern web application built with Next.js that helps you discover and save your favorite recipes using the Spoonacular API. Search by cuisine, meal type, ingredients, and more!

## ✨ Features

### 🎲 Random Recipe Discovery

- Get instant random recipe suggestions
- View detailed recipe information including:
  - Ready time and servings
  - Cuisine and dish type
  - Main ingredients list
  - Direct link to full recipe instructions

### 🔍 Advanced Search

- **Filter by Cuisine:** Italian, Mexican, Chinese, Indian, and 20+ more
- **Filter by Meal Type:** Breakfast, Lunch, Dinner, Snack, Dessert
- **Include/Exclude Ingredients:** Find recipes with or without specific ingredients
- **Time & Servings:** Set maximum ready time and number of servings
- View search results in an organized grid layout

### ⭐ Favorites System

- Save recipes to your favorites with one click
- Star icon on each recipe card for quick access
- All favorites stored locally in your browser (localStorage)
- Dedicated favorites page to review saved recipes
- Favorites counter in navigation header
- Persistent storage - favorites remain after closing browser

### 📱 Responsive Design

- Mobile-friendly interface
- Clean, modern UI with smooth animations
- Intuitive navigation between Home, Search, and Favorites
- Active page highlighting in navigation

## 🛠️ Technologies

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe code
- **React 19** - Latest React features
- **Spoonacular API** - Recipe data provider
- **CSS Modules** - Scoped styling
- **localStorage API** - Client-side data persistence

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js 18.0 or higher** ([Download](https://nodejs.org/))
- **npm, yarn, pnpm, or bun** (package manager)
- **Spoonacular API Key** ([Get free key](https://spoonacular.com/food-api))

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/recipe-finder.git
cd recipe-finder
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
# .env.local
SPOONACULAR_API_KEY=your_api_key_here
```

**Get your API key:**

1. Go to [Spoonacular API](https://spoonacular.com/food-api)
2. Sign up for a free account
3. Navigate to your [Dashboard](https://spoonacular.com/food-api/console#Dashboard)
4. Copy your API key
5. Paste it in `.env.local`

**Free tier includes:**

- 150 requests per day
- Access to all recipe endpoints

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
recipe-finder/
├── app/
│   ├── components/          # Reusable React components
│   │   ├── Header.tsx           # Navigation header
│   │   ├── RecipeCard.tsx       # Recipe display card (featured & grid variants)
│   │   ├── FavoriteButton.tsx   # Star button for favoriting
│   │   ├── RecipeSearchForm.tsx # Search form with filters
│   │   ├── SearchResults.tsx    # Search results grid
│   │   ├── RandomRecipeButton.tsx
│   │   ├── DetailedSearchButton.tsx
│   │   └── ErrorMessage.tsx
│   ├── css/                 # Stylesheets
│   │   ├── globals.css          # Global styles
│   │   └── recipeSearch.css     # Component-specific styles
│   ├── hooks/               # Custom React hooks
│   │   └── useFavorites.tsx     # Favorites management hook
│   ├── services/            # API integration
│   │   └── spoonacularApi.ts    # Spoonacular API client
│   ├── constants/           # App constants
│   │   └── cuisines.ts          # Available cuisine types
│   ├── favorites/           # Favorites page route
│   │   └── page.tsx
│   ├── search/              # Search page route
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── public/                  # Static assets
├── .env.local               # Environment variables (create this)
├── next.config.ts           # Next.js configuration
├── package.json             # Dependencies
└── tsconfig.json            # TypeScript configuration
```

## 💻 Usage Guide

### Home Page (`/`)

1. **Get Random Recipe:**
   - Click the large "Get Random Recipe" button
   - View a featured recipe card with:
     - Large recipe image on the left
     - Recipe details on the right (time, servings, cuisine, ingredients)
     - Star icon to add to favorites
     - "View Full Recipe →" button to see complete instructions

2. **Navigate to Search:**
   - Click "Detailed Search" button to access advanced search

### Search Page (`/search`)

1. **Use Search Filters:**
   - Select cuisine type from dropdown (Italian, Mexican, etc.)
   - Choose meal type (Breakfast, Lunch, Dinner, etc.)
   - Enter ingredients to include (comma-separated)
   - Enter ingredients to exclude (comma-separated)
   - Set maximum ready time (in minutes)
   - Set number of servings

2. **View Results:**
   - Results appear in a responsive grid
   - Each card shows: image, title, time, servings
   - Click star to add/remove from favorites
   - Click "View Recipe →" for full instructions

### Favorites Page (`/favorites`)

1. **View Saved Recipes:**
   - See all your favorited recipes in one place
   - Count of total favorites displayed
   - Same grid layout as search results

2. **Manage Favorites:**
   - Click star icon again to remove from favorites
   - Favorites persist even after closing browser

## 🔑 Environment Variables

| Variable              | Description                                 | Required |
| --------------------- | ------------------------------------------- | -------- |
| `SPOONACULAR_API_KEY` | Your Spoonacular API key (server-side only) | Yes      |

**Note:** Keep this key server-side only (no `NEXT_PUBLIC_` prefix).

## 🌐 API Endpoints Used

This app uses the following Spoonacular API endpoints:

- **Random Recipes:** `GET /recipes/random`
- **Complex Search:** `GET /recipes/complexSearch`

**API Documentation:** [https://spoonacular.com/food-api/docs](https://spoonacular.com/food-api/docs)

## 🎨 Key Features Explained

### Favorites System (localStorage)

- **Storage:** Browser's localStorage (5-10MB capacity)
- **Persistence:** Data survives page refresh and browser restart
- **Scope:** Per browser, per device (not synced across devices)
- **Data Stored:** Full recipe objects (id, title, image, ingredients, etc.)

### Custom Hook: `useFavorites`

```typescript
const {
  favorites, // Array of favorite recipes
  toggleFavorite, // Add/remove recipe
  isFavorite, // Check if recipe is favorited
  clearFavorites, // Remove all favorites
} = useFavorites();
```

### Recipe Card Variants

- **Featured:** Large card with side-by-side layout (image left, info right)
- **Default:** Grid card with stacked layout (image top, info bottom)

## 🚨 Troubleshooting

### "localStorage is not defined" Error

- This is normal during server-side rendering
- The app checks `typeof window !== 'undefined'` before accessing localStorage

### API Rate Limit Exceeded

- Free tier: 150 requests/day
- Upgrade plan or wait 24 hours for reset
- Cache responses locally to reduce API calls

### Images Not Loading

- Check `next.config.ts` has `img.spoonacular.com` in `remotePatterns`
- Verify internet connection
- Check browser console for CORS errors

### No Search Results

- Try broader search criteria
- Remove some filters
- Check if API key is valid

## 📝 Scripts

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start development server (port 3000) |
| `npm run build` | Build for production                 |
| `npm start`     | Start production server              |
| `npm run lint`  | Run ESLint                           |

## 🔒 Security Notes

- ⚠️ Never commit `.env.local` to version control
- ⚠️ API key is exposed in client-side code (use backend proxy for production)
- ✅ `.gitignore` excludes sensitive files
- ✅ Free API tier has rate limiting built-in

## 🚀 Future Enhancements

- [ ] User authentication (login/signup)
- [ ] Backend API to hide Spoonacular key
- [ ] Recipe detail page with full instructions
- [ ] Shopping list generator
- [ ] Meal planning calendar
- [ ] Share recipes via social media
- [ ] Print recipe feature
- [ ] Dark mode toggle
- [ ] Recipe notes and ratings
- [ ] Export favorites as PDF

## 📄 License

MIT License - feel free to use this project for learning or personal use.

## 👤 Author

Your Name

- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)

## 🙏 Acknowledgments

- [Spoonacular API](https://spoonacular.com/food-api) for recipe data
- [Next.js](https://nextjs.org/) for the amazing framework
- [Vercel](https://vercel.com) for fonts and hosting platform

---

**Enjoy discovering new recipes! 🍽️**
