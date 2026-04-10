'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import '../css/recipeSearch.css';
import RecipeSearchForm from '../components/RecipeSearchForm';
import SearchResults from '../components/SearchResults';
import ErrorMessage from '../components/ErrorMessage';
import { spoonacularApi } from '../services/spoonacularApi';

interface SearchFilters {
  cuisine?: string;
  includeIngredients?: string;
  excludeIngredients?: string;
  type?: string;
  maxReadyTime?: string;
}

const SearchPage = () => {
  const [submittedFilters, setSubmittedFilters] = useState<SearchFilters | null>(null);

  const router = useRouter();

  const searchKey = submittedFilters ? (['recipe-search', submittedFilters] as const) : null;

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

  const handleSearch = (filters: SearchFilters) => {
    setSubmittedFilters(filters);
  };

  return (
    <main className="recipe-main">
      <div className="search-container">
        <button onClick={() => router.push('/')} className="btn btn-primary btn-small">
          ← Back to Home
        </button>
        <RecipeSearchForm onSubmit={handleSearch} isSearching={isSearching} />

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
