import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SearchResults from './SearchResults';
import { useFavorites } from '../domain/favorites/FavoritesContext';

vi.mock('../domain/favorites/FavoritesContext', () => ({
  useFavorites: vi.fn(),
}));

vi.mocked(useFavorites).mockReturnValue({
  favorites: [],
  addFavorite: vi.fn(),
  removeFavorite: vi.fn(),
  toggleFavorite: vi.fn(),
  isFavorite: () => false,
  clearFavorites: vi.fn(),
  isLoaded: true,
});

const recipe = {
  id: 1,
  title: 'Pasta Bolognese',
  image: '',
  imageType: 'jpg',
  servings: 4,
  readyInMinutes: 45,
  sourceUrl: 'https://example.com',
  summary: '',
  cuisines: [],
  dishTypes: [],
  diets: [],
  instructions: '',
  extendedIngredients: [],
};

describe('SearchResults', () => {
  it('renders nothing when results are empty and not loading', () => {
    const { container } = render(<SearchResults results={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders recipe cards for each result', () => {
    render(<SearchResults results={[recipe]} />);

    expect(screen.getByRole('heading', { name: 'Pasta Bolognese' })).toBeInTheDocument();
    expect(screen.getByText('Search Results (1 recipes found)')).toBeInTheDocument();
  });

  it('renders skeleton cards while loading instead of results', () => {
    render(<SearchResults results={[]} isLoading={true} />);

    const section = screen.getByRole('region', { name: 'Loading search results' });
    expect(section).toHaveAttribute('aria-busy', 'true');
    // 6 skeleton cards rendered
    expect(section.querySelectorAll('.recipe-card')).toHaveLength(6);
  });

  it('renders skeleton cards even when stale results are present', () => {
    render(<SearchResults results={[recipe]} isLoading={true} />);

    expect(screen.queryByText('Search Results')).not.toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Loading search results' })
    ).toBeInTheDocument();
  });
});
