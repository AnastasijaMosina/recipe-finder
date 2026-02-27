'use client';

import { useFavorites } from '../hooks/useFavorites';
import { Recipe } from '../services/spoonacularApi';

interface FavoriteButtonProps {
  recipe: Recipe;
  className?: string;
}

export default function FavoriteButton({ recipe, className = '' }: FavoriteButtonProps) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorited = isFavorite(recipe.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // ="Don't do the default thing this event normally does"
    e.stopPropagation(); // = "Don't tell parent elements about this event"
    toggleFavorite(recipe);
  };

  return (
    <button
      onClick={handleClick}
      className={`favorite-btn ${favorited ? 'favorited' : ''} ${className}`}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      {favorited ? '⭐' : '☆'}
    </button>
  );
}
