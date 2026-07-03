import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadLastSearchFilters, saveLastSearchFilters } from './searchStorage';

const STORAGE_KEY = 'recipe-finder:last-search-filters';

describe('searchStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('saves normalized filters to localStorage', () => {
    saveLastSearchFilters({
      cuisine: 'indian',
      includeIngredients: 'chickpeas',
      excludeIngredients: '',
      type: 'lunch',
      maxReadyTime: '25',
    });

    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(
      JSON.stringify({
        cuisine: 'indian',
        includeIngredients: 'chickpeas',
        type: 'lunch',
        maxReadyTime: '25',
      })
    );
  });

  it('removes key when filters are empty/invalid', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ cuisine: 'old' }));

    saveLastSearchFilters({
      maxReadyTime: '0',
    });

    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('loads and validates stored filters', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        cuisine: 'japanese',
        includeIngredients: 'rice',
        type: 'dinner',
        maxReadyTime: '20',
      })
    );

    expect(loadLastSearchFilters()).toEqual({
      cuisine: 'japanese',
      includeIngredients: 'rice',
      type: 'dinner',
      maxReadyTime: '20',
    });
  });

  it('cleans up malformed stored data and returns null', () => {
    window.localStorage.setItem(STORAGE_KEY, '{bad-json');

    expect(loadLastSearchFilters()).toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('dispatches update event when saving', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    saveLastSearchFilters({ cuisine: 'greek' });

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
  });
});
