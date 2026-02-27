'use client';

import { useEffect, useState } from 'react';
import { Recipe } from '../services/spoonacularApi';

const FAVORITES_KEY = 'recipe-favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favorites from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        try {
          setFavorites(JSON.parse(stored));
        } catch (error) {
          console.error('Failed to parse favorites:', error);
          localStorage.removeItem(FAVORITES_KEY);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
  }, [favorites, isLoaded]);

  const addFavorite = (recipe: Recipe) => {
    setFavorites((prev) => {
      // Prevent duplicates
      if (prev.some((fav) => fav.id === recipe.id)) {
        return prev;
      }
      return [...prev, recipe];
    });
  };

  const removeFavorite = (recipeId: number) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== recipeId));
  };

  const toggleFavorite = (recipe: Recipe) => {
    if (isFavorite(recipe.id)) {
      removeFavorite(recipe.id);
    } else {
      addFavorite(recipe);
    }
  };

  const isFavorite = (recipeId: number): boolean => {
    return favorites.some((fav) => fav.id === recipeId);
  };

  const clearFavorites = () => {
    setFavorites([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(FAVORITES_KEY);
    }
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    isLoaded,
  };
}
