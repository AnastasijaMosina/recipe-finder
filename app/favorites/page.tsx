'use client';

import { useRouter } from 'next/navigation';
import { useFavorites } from '../hooks/useFavorites';
import RecipeCard from '../components/RecipeCard';
import '../css/recipeSearch.css';

export default function FavoritesPage() {
  const router = useRouter();
  const { favorites, isLoaded } = useFavorites();

  if (!isLoaded) {
    return (
      <main className="recipe-main">
        <div className="search-container">
          <p>Loading favorites...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="recipe-main">
      <div className="search-container">
        <div style={{ marginBottom: '2rem' }}>
          <button onClick={() => router.push('/')} className="btn btn-primary btn-small">
            ← Back to Home
          </button>
        </div>

        <h1 className="search-title">⭐ My Favorite Recipes</h1>

        {favorites.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#6b7280' }}>
            <p style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>No favorite recipes yet!</p>
            <p>Start exploring recipes and click the star icon to save your favorites.</p>
          </div>
        ) : (
          <div className="search-results">
            <p className="search-page-description">
              You have {favorites.length} saved recipe{favorites.length !== 1 ? 's' : ''}
            </p>
            <div className="search-results-grid">
              {favorites.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} variant="default" />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
