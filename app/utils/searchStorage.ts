import {
  searchQueryParamsSchema,
  type RecipeSearchFilters,
} from '../domain/search/searchFiltersSchema';
import { normalizeSearchFilters } from '../services/searchMappers';

const LAST_SEARCH_FILTERS_KEY = 'recipe-finder:last-search-filters';
const LAST_SEARCH_FILTERS_EVENT = 'recipe-finder:last-search-filters-updated';

let cachedRawFilters: string | null | undefined;
let cachedParsedFilters: RecipeSearchFilters | null = null;

const hasAnyFilterValue = (filters: RecipeSearchFilters) => Object.values(filters).some(Boolean);

export const loadLastSearchFilters = (): RecipeSearchFilters | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedFilters = window.localStorage.getItem(LAST_SEARCH_FILTERS_KEY);

  if (storedFilters === cachedRawFilters) {
    return cachedParsedFilters;
  }

  cachedRawFilters = storedFilters;

  if (!storedFilters) {
    cachedParsedFilters = null;
    return null;
  }

  try {
    const parsedFilters = searchQueryParamsSchema.safeParse(JSON.parse(storedFilters));

    if (!parsedFilters.success || !hasAnyFilterValue(parsedFilters.data)) {
      window.localStorage.removeItem(LAST_SEARCH_FILTERS_KEY);
      cachedRawFilters = null;
      cachedParsedFilters = null;
      return null;
    }

    cachedParsedFilters = parsedFilters.data;
    return parsedFilters.data;
  } catch {
    window.localStorage.removeItem(LAST_SEARCH_FILTERS_KEY);
    cachedRawFilters = null;
    cachedParsedFilters = null;
    return null;
  }
};

export const saveLastSearchFilters = (filters: RecipeSearchFilters) => {
  if (typeof window === 'undefined') {
    return;
  }

  const normalizedFilters = normalizeSearchFilters(filters);

  if (!hasAnyFilterValue(normalizedFilters)) {
    window.localStorage.removeItem(LAST_SEARCH_FILTERS_KEY);
    cachedRawFilters = null;
    cachedParsedFilters = null;
    window.dispatchEvent(new Event(LAST_SEARCH_FILTERS_EVENT));
    return;
  }

  const serializedFilters = JSON.stringify(normalizedFilters);
  window.localStorage.setItem(LAST_SEARCH_FILTERS_KEY, serializedFilters);
  cachedRawFilters = serializedFilters;
  cachedParsedFilters = normalizedFilters;
  window.dispatchEvent(new Event(LAST_SEARCH_FILTERS_EVENT));
};
