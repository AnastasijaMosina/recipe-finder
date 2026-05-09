'use client';

import { useFavorites } from '../domain/favorites/FavoritesContext';
import { Recipe } from '../services/spoonacularApi';

interface FavoriteButtonProps {
  recipe: Recipe;
  className?: string;
}

export default function FavoriteButton({ recipe, className = '' }: FavoriteButtonProps) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorited = isFavorite(recipe.id);
  const buttonLabel = favorited
    ? `Remove ${recipe.title} from favorites`
    : `Add ${recipe.title} to favorites`;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // ="Don't do the default thing this event normally does"
    e.stopPropagation(); // = "Don't tell parent elements about this event"
    toggleFavorite(recipe);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`favorite-btn ${favorited ? 'favorited' : ''} ${className}`}
      aria-label={buttonLabel}
      aria-pressed={favorited}
      title={buttonLabel}
    >
      <span aria-hidden="true">{favorited ? '⭐' : '☆'}</span>
      <span className="sr-only">{buttonLabel}</span>
    </button>
  );
}
