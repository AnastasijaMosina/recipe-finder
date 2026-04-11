'use client';

import { createContext, useContext, useMemo } from 'react';
import { useFavorites as useLocalFavorites } from '../hooks/useFavorites';
import { Recipe } from '../services/spoonacularApi';

interface FavoritesStateContextType {
  favorites: Recipe[];
  favoriteIds: Set<number>;
  favoritesCount: number;
  isLoaded: boolean;
}

interface FavoritesActionsContextType {
  addFavorite: (recipe: Recipe) => void;
  removeFavorite: (recipeId: number) => void;
  toggleFavorite: (recipe: Recipe) => void;
  isFavorite: (recipeId: number) => boolean;
  clearFavorites: () => void;
}

type FavoritesContextType = FavoritesStateContextType & FavoritesActionsContextType;

const FavoritesStateContext = createContext<FavoritesStateContextType | undefined>(undefined);
const FavoritesActionsContext = createContext<FavoritesActionsContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const {
    favorites,
    favoriteIds,
    favoritesCount,
    isLoaded,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
  } = useLocalFavorites();

  const stateValue = useMemo(
    () => ({
      favorites,
      favoriteIds,
      favoritesCount,
      isLoaded,
    }),
    [favorites, favoriteIds, favoritesCount, isLoaded]
  );

  const actionsValue = useMemo(
    () => ({
      addFavorite,
      removeFavorite,
      toggleFavorite,
      isFavorite,
      clearFavorites,
    }),
    [addFavorite, removeFavorite, toggleFavorite, isFavorite, clearFavorites]
  );

  return (
    <FavoritesStateContext.Provider value={stateValue}>
      <FavoritesActionsContext.Provider value={actionsValue}>
        {children}
      </FavoritesActionsContext.Provider>
    </FavoritesStateContext.Provider>
  );
}

function useFavoritesStateContext() {
  const context = useContext(FavoritesStateContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
}

function useFavoritesActionsContext() {
  const context = useContext(FavoritesActionsContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
}

export function useFavorites() {
  return {
    ...useFavoritesStateContext(),
    ...useFavoritesActionsContext(),
  } satisfies FavoritesContextType;
}

export function useFavoritesCount() {
  return useFavoritesStateContext().favoritesCount;
}

export function useFavoritesList() {
  return useFavoritesStateContext().favorites;
}

export function useFavoritesLoaded() {
  return useFavoritesStateContext().isLoaded;
}

export function useFavoriteActions() {
  const { addFavorite, removeFavorite, toggleFavorite, clearFavorites } =
    useFavoritesActionsContext();

  return {
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearFavorites,
  };
}

export function useIsFavorite(recipeId: number) {
  return useFavoritesStateContext().favoriteIds.has(recipeId);
}
