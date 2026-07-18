'use client';

import { createContext, useContext } from 'react';
import { useFavorites as useLocalFavorites } from './useFavorites';
import { Recipe } from '../../services/spoonacularApi';

interface FavoritesContextType {
  favorites: Recipe[];
  addFavorite: (recipe: Recipe) => void;
  removeFavorite: (recipeId: number) => void;
  toggleFavorite: (recipe: Recipe) => void;
  isFavorite: (recipeId: number) => boolean;
  clearFavorites: () => void;
  isLoaded: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const favoritesHook = useLocalFavorites();

  return <FavoritesContext.Provider value={favoritesHook}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
}
