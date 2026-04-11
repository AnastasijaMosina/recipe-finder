import {
  searchQueryParamsSchema,
  type RecipeSearchFilters,
  type RecipeSearchFormValues,
} from '../domain/search/searchFiltersSchema';

export const normalizeSearchFilters = (filters: RecipeSearchFilters): RecipeSearchFilters => {
  const parsedFilters = searchQueryParamsSchema.safeParse({
    cuisine: filters.cuisine || undefined,
    includeIngredients: filters.includeIngredients || undefined,
    excludeIngredients: filters.excludeIngredients || undefined,
    type: filters.type || undefined,
    maxReadyTime: filters.maxReadyTime || undefined,
  });

  if (!parsedFilters.success) {
    return {};
  }

  return parsedFilters.data;
};

export const mapFormValuesToFilters = (values: RecipeSearchFormValues): RecipeSearchFilters =>
  normalizeSearchFilters({
    cuisine: values.cuisineType || undefined,
    includeIngredients: values.includeIngredients || undefined,
    excludeIngredients: values.excludeIngredients || undefined,
    type: values.mealType || undefined,
    maxReadyTime: values.maxReadyTime || undefined,
  });

export const mapFiltersToFormValues = (
  filters?: RecipeSearchFilters | null
): RecipeSearchFormValues => ({
  cuisineType: filters?.cuisine ?? '',
  includeIngredients: filters?.includeIngredients ?? '',
  excludeIngredients: filters?.excludeIngredients ?? '',
  mealType: filters?.type ?? '',
  maxReadyTime: filters?.maxReadyTime ?? '',
});
