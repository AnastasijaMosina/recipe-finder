import type { SearchQueryParams } from '../../domain/search/searchFiltersSchema';
import { normalizeSearchFilters } from '../searchMappers';

/**
 * Normalizes AI-extracted filters to the exact query shape used by the existing search API.
 */
export const mapAiFiltersToSearchParams = (filters: SearchQueryParams): SearchQueryParams =>
  normalizeSearchFilters(filters);
