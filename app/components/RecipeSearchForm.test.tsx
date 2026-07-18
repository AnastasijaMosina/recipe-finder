import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RecipeSearchForm from './RecipeSearchForm';
import { loadLastSearchFilters, saveLastSearchFilters } from '../utils/searchStorage';

vi.mock('../utils/searchStorage', () => ({
  loadLastSearchFilters: vi.fn(),
  saveLastSearchFilters: vi.fn(),
}));

const mockedLoadLastSearchFilters = vi.mocked(loadLastSearchFilters);
const mockedSaveLastSearchFilters = vi.mocked(saveLastSearchFilters);

describe('RecipeSearchForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedLoadLastSearchFilters.mockReturnValue(null);
  });

  it('submits mapped filters and persists last search', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<RecipeSearchForm onSubmit={onSubmit} isSearching={false} />);

    await user.selectOptions(screen.getByLabelText('Cuisine Type *'), 'italian');
    await user.type(screen.getByLabelText('Ingredients to Include'), 'tomato, basil');
    await user.selectOptions(screen.getByLabelText('Meal Type *'), 'main course');
    await user.type(screen.getByLabelText('Max Cooking Time (minutes)'), '30');

    await user.click(screen.getByRole('button', { name: '🔍 Search Recipes' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        cuisine: 'italian',
        includeIngredients: 'tomato, basil',
        type: 'main course',
        maxReadyTime: '30',
      });
    });

    expect(mockedSaveLastSearchFilters).toHaveBeenCalledWith({
      cuisine: 'italian',
      includeIngredients: 'tomato, basil',
      type: 'main course',
      maxReadyTime: '30',
    });
  });

  it('disables load button when no saved filters exist', () => {
    render(<RecipeSearchForm onSubmit={vi.fn()} isSearching={false} />);

    expect(
      screen.getByRole('button', { name: 'Restore your previous search criteria' })
    ).toBeDisabled();
  });

  it('loads previous filters into the form when requested', async () => {
    const user = userEvent.setup();

    mockedLoadLastSearchFilters.mockReturnValue({
      cuisine: 'mexican',
      includeIngredients: 'beans',
      excludeIngredients: 'nuts',
      type: 'soup',
      maxReadyTime: '25',
    });

    render(<RecipeSearchForm onSubmit={vi.fn()} isSearching={false} />);

    await user.click(screen.getByRole('button', { name: 'Restore your previous search criteria' }));

    expect(screen.getByLabelText('Cuisine Type *')).toHaveValue('mexican');
    expect(screen.getByLabelText('Ingredients to Include')).toHaveValue('beans');
    expect(screen.getByLabelText('Ingredients to Exclude')).toHaveValue('nuts');
    expect(screen.getByLabelText('Meal Type *')).toHaveValue('soup');
    expect(screen.getByLabelText('Max Cooking Time (minutes)')).toHaveValue(25);
  });
});
