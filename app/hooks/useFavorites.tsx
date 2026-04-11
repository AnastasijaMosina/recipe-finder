'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Recipe } from '../services/spoonacularApi';

const FAVORITES_KEY = 'recipe-favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Recipe[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }

    const stored = window.localStorage.getItem(FAVORITES_KEY);

    if (!stored) {
      return [];
    }

    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to parse favorites:', error);
      window.localStorage.removeItem(FAVORITES_KEY);
      return [];
    }
  });
  const [isLoaded] = useState(true);

  const favoriteIds = useMemo(() => new Set(favorites.map((favorite) => favorite.id)), [favorites]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
  }, [favorites]);

  const addFavorite = useCallback((recipe: Recipe) => {
    setFavorites((prev) => {
      if (prev.some((fav) => fav.id === recipe.id)) {
        return prev;
      }
      return [...prev, recipe];
    });
  }, []);

  const removeFavorite = useCallback((recipeId: number) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== recipeId));
  }, []);

  const toggleFavorite = useCallback((recipe: Recipe) => {
    setFavorites((prev) => {
      if (prev.some((favorite) => favorite.id === recipe.id)) {
        return prev.filter((favorite) => favorite.id !== recipe.id);
      }

      return [...prev, recipe];
    });
  }, []);

  const isFavorite = useCallback(
    (recipeId: number): boolean => {
      return favoriteIds.has(recipeId);
    },
    [favoriteIds]
  );

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(FAVORITES_KEY);
    }
  }, []);

  return useMemo(
    () => ({
      favorites,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      isFavorite,
      clearFavorites,
      isLoaded,
      favoriteIds,
      favoritesCount: favorites.length,
    }),
    [
      favorites,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      isFavorite,
      clearFavorites,
      isLoaded,
      favoriteIds,
    ]
  );
}
