import type { RecipeSearchFilters } from '../schemas/searchFiltersSchema';

export function applyRecipeSearchFilters(
  params: URLSearchParams,
  filters: RecipeSearchFilters
): void {
  if (filters.cuisine) params.set('cuisine', filters.cuisine);
  if (filters.includeIngredients) params.set('includeIngredients', filters.includeIngredients);
  if (filters.excludeIngredients) params.set('excludeIngredients', filters.excludeIngredients);
  if (filters.type) params.set('type', filters.type);
  if (filters.maxReadyTime) params.set('maxReadyTime', filters.maxReadyTime);
}
