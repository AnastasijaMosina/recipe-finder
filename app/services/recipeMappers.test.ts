import { describe, expect, it } from 'vitest';
import { normalizeRecipe, normalizeRecipes } from './recipeMappers';

describe('recipeMappers', () => {
  it('normalizes a recipe payload with safe fallbacks', () => {
    const normalized = normalizeRecipe({
      id: 101,
      title: 'Pasta',
      image: 'img.jpg',
      imageType: 'jpg',
      servings: 2,
      readyInMinutes: 30,
      sourceUrl: 'https://example.com',
      summary: 'Tasty',
      cuisines: ['italian', 123],
      dishTypes: ['main course'],
      diets: ['vegetarian'],
      instructions: 'Boil',
      extendedIngredients: [
        {
          id: 1,
          name: 'Tomato',
          amount: 2,
          unit: 'pcs',
          original: '2 tomatoes',
        },
        {
          bad: 'shape',
        },
      ],
    });

    expect(normalized.id).toBe(101);
    expect(normalized.title).toBe('Pasta');
    expect(normalized.cuisines).toEqual(['italian']);
    expect(normalized.extendedIngredients).toEqual([
      {
        id: 1,
        name: 'Tomato',
        amount: 2,
        unit: 'pcs',
        original: '2 tomatoes',
      },
      {
        id: 0,
        name: '',
        amount: 0,
        unit: '',
        original: '',
      },
    ]);
  });

  it('throws when recipe payload is not an object', () => {
    expect(() => normalizeRecipe(null)).toThrow('Invalid recipe payload.');
  });

  it('normalizes arrays and returns empty for non-array payloads', () => {
    const normalizedList = normalizeRecipes([
      {
        id: 1,
        title: 'Soup',
      },
      {
        id: 2,
        title: 'Rice',
      },
    ]);

    expect(normalizedList).toHaveLength(2);
    expect(normalizedList[0].title).toBe('Soup');
    expect(normalizeRecipes('invalid')).toEqual([]);
  });
});
