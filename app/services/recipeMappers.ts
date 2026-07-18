import type { Ingredient, Recipe } from './spoonacularApi';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeString(value: unknown, fallback: string = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function normalizeNumber(value: unknown, fallback: number = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function normalizeRequiredPositiveNumber(value: unknown, fieldName: string): number {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }

  throw new Error(`Invalid ${fieldName}.`);
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function normalizeIngredient(input: unknown): Ingredient {
  if (!isRecord(input)) {
    return {
      id: 0,
      name: '',
      amount: 0,
      unit: '',
      original: '',
    };
  }

  return {
    id: normalizeNumber(input.id),
    name: normalizeString(input.name),
    amount: normalizeNumber(input.amount),
    unit: normalizeString(input.unit),
    original: normalizeString(input.original),
  };
}

export function normalizeRecipe(input: unknown): Recipe {
  if (!isRecord(input)) {
    throw new Error('Invalid recipe payload.');
  }

  const ingredientsRaw = Array.isArray(input.extendedIngredients) ? input.extendedIngredients : [];

  return {
    id: normalizeRequiredPositiveNumber(input.id, 'recipe id'),
    title: normalizeString(input.title, 'Untitled recipe'),
    image: normalizeString(input.image),
    imageType: normalizeString(input.imageType),
    servings: normalizeNumber(input.servings),
    readyInMinutes: normalizeNumber(input.readyInMinutes),
    sourceUrl: normalizeString(input.sourceUrl),
    summary: normalizeString(input.summary),
    cuisines: normalizeStringArray(input.cuisines),
    dishTypes: normalizeStringArray(input.dishTypes),
    diets: normalizeStringArray(input.diets),
    instructions: normalizeString(input.instructions),
    extendedIngredients: ingredientsRaw.map(normalizeIngredient),
  };
}

export function normalizeRecipes(input: unknown): Recipe[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.flatMap((item) => {
    try {
      return [normalizeRecipe(item)];
    } catch {
      return [];
    }
  });
}
