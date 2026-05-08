import { describe, expect, it } from 'vitest';
import {
  mapFiltersToFormValues,
  mapFormValuesToFilters,
  normalizeSearchFilters,
} from './searchMappers';

describe('searchMappers', () => {
  it('maps form values to normalized search filters', () => {
    const filters = mapFormValuesToFilters({
      cuisineType: 'italian',
      includeIngredients: 'tomato, basil',
      excludeIngredients: '',
      mealType: 'main course',
      maxReadyTime: '30',
    });

    expect(filters).toEqual({
      cuisine: 'italian',
      includeIngredients: 'tomato, basil',
      type: 'main course',
      maxReadyTime: '30',
    });
  });

  it('drops invalid maxReadyTime during normalization', () => {
    const filters = normalizeSearchFilters({
      cuisine: 'thai',
      maxReadyTime: '0',
    });

    expect(filters).toEqual({});
  });

  it('maps filters to complete form values with defaults', () => {
    const formValues = mapFiltersToFormValues({
      cuisine: 'mexican',
      includeIngredients: 'beans',
      type: 'dinner',
    });

    expect(formValues).toEqual({
      cuisineType: 'mexican',
      includeIngredients: 'beans',
      excludeIngredients: '',
      mealType: 'dinner',
      maxReadyTime: '',
    });
  });
});
