'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import '../css/recipeSearch.css';
import RecipeSearchForm from '../components/RecipeSearchForm';
import SearchResults from '../components/SearchResults';
import ErrorMessage from '../components/ErrorMessage';
import { spoonacularApi } from '../services/spoonacularApi';
import type { RecipeSearchFilters } from '../schemas/searchFiltersSchema';

const SearchPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL is the single source of truth for active filters
  const filtersFromUrl: RecipeSearchFilters = {
    cuisine: searchParams.get('cuisine') ?? undefined,
    includeIngredients: searchParams.get('includeIngredients') ?? undefined,
    excludeIngredients: searchParams.get('excludeIngredients') ?? undefined,
    type: searchParams.get('type') ?? undefined,
    maxReadyTime: searchParams.get('maxReadyTime') ?? undefined,
  };

  const hasFilters = Object.values(filtersFromUrl).some(Boolean);
  const searchKey = hasFilters ? (['recipe-search', filtersFromUrl] as const) : null;

  const {
    data: searchResults = [],
    error: searchError,
    isLoading,
    isValidating,
  } = useSWR(searchKey, ([, filters]) => spoonacularApi.searchRecipes(filters), {
    keepPreviousData: true,
    revalidateIfStale: false,
  });

  const isSearching = isLoading || isValidating;

  const handleSearch = (filters: RecipeSearchFilters) => {
    const params = new URLSearchParams();
    if (filters.cuisine) params.set('cuisine', filters.cuisine);
    if (filters.includeIngredients) params.set('includeIngredients', filters.includeIngredients);
    if (filters.excludeIngredients) params.set('excludeIngredients', filters.excludeIngredients);
    if (filters.type) params.set('type', filters.type);
    if (filters.maxReadyTime) params.set('maxReadyTime', filters.maxReadyTime);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <main className="recipe-main">
      <div className="search-container">
        <button onClick={() => router.push('/')} className="btn btn-primary btn-small">
          ← Back to Home
        </button>
        <RecipeSearchForm
          onSubmit={handleSearch}
          isSearching={isSearching}
          defaultValues={{
            cuisineType: filtersFromUrl.cuisine ?? '',
            includeIngredients: filtersFromUrl.includeIngredients ?? '',
            excludeIngredients: filtersFromUrl.excludeIngredients ?? '',
            mealType: filtersFromUrl.type ?? '',
            maxReadyTime: filtersFromUrl.maxReadyTime ?? '',
          }}
        />

        {searchError && (
          <ErrorMessage
            message={
              searchError instanceof Error ? searchError.message : 'Failed to search recipes'
            }
            style={{ marginTop: '1.5rem' }}
          />
        )}

        <SearchResults results={searchResults} />
      </div>
    </main>
  );
};

export default SearchPage;
