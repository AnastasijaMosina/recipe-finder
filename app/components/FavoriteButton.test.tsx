import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FavoriteButton from './FavoriteButton';
import { useFavorites } from '../domain/favorites/FavoritesContext';

vi.mock('../domain/favorites/FavoritesContext', () => ({
  useFavorites: vi.fn(),
}));

const mockedUseFavorites = vi.mocked(useFavorites);

describe('FavoriteButton', () => {
  const recipe = {
    id: 42,
    title: 'Test Recipe',
    image: '',
    imageType: '',
    servings: 2,
    readyInMinutes: 20,
    sourceUrl: '',
    summary: '',
    cuisines: [],
    dishTypes: [],
    diets: [],
    instructions: '',
    extendedIngredients: [],
  };

  it('renders as not favorited when recipe is not in favorites', () => {
    mockedUseFavorites.mockReturnValue({
      favorites: [],
      addFavorite: vi.fn(),
      removeFavorite: vi.fn(),
      toggleFavorite: vi.fn(),
      isFavorite: () => false,
      clearFavorites: vi.fn(),
      isLoaded: true,
    });

    render(<FavoriteButton recipe={recipe} />);

    const button = screen.getByRole('button', { name: 'Add to favorites' });
    expect(button).toHaveTextContent('☆');
    expect(button).toHaveAttribute('title', 'Add to favorites');
  });

  it('renders as favorited when recipe is in favorites', () => {
    mockedUseFavorites.mockReturnValue({
      favorites: [recipe],
      addFavorite: vi.fn(),
      removeFavorite: vi.fn(),
      toggleFavorite: vi.fn(),
      isFavorite: () => true,
      clearFavorites: vi.fn(),
      isLoaded: true,
    });

    render(<FavoriteButton recipe={recipe} />);

    const button = screen.getByRole('button', { name: 'Remove from favorites' });
    expect(button).toHaveTextContent('⭐');
    expect(button).toHaveAttribute('title', 'Remove from favorites');
  });

  it('calls toggleFavorite with the current recipe on click', () => {
    const toggleFavorite = vi.fn();

    mockedUseFavorites.mockReturnValue({
      favorites: [],
      addFavorite: vi.fn(),
      removeFavorite: vi.fn(),
      toggleFavorite,
      isFavorite: () => false,
      clearFavorites: vi.fn(),
      isLoaded: true,
    });

    render(<FavoriteButton recipe={recipe} />);

    fireEvent.click(screen.getByRole('button', { name: 'Add to favorites' }));

    expect(toggleFavorite).toHaveBeenCalledWith(recipe);
    expect(toggleFavorite).toHaveBeenCalledTimes(1);
  });
});
