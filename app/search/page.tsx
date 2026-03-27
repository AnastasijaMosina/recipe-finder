'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
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
  const [cuisineType, setCuisineType] = useState('');
  const [includeIngredients, setIncludeIngredients] = useState('');
  const [excludeIngredients, setExcludeIngredients] = useState('');
  const [mealType, setMealType] = useState('');
  const [maxReadyTime, setMaxReadyTime] = useState('');
  const [submittedFilters, setSubmittedFilters] = useState<SearchFilters | null>(null);

  const router = useRouter();

  const searchKey = ['recipe-search', submittedFilters] as const;

  const {
    data: searchResults = [],
    error: searchError,
    isPending,
    isFetching,
  } = useQuery({
    queryKey: searchKey,
    queryFn: ({ queryKey }) => {
      const [, filters] = queryKey;
      if (!filters) {
        return Promise.resolve([]);
      }
      return spoonacularApi.searchRecipes(filters);
    },
    enabled: !!submittedFilters,
    placeholderData: keepPreviousData,
  });

  const isSearching = isPending || isFetching;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    setSubmittedFilters({
      cuisine: cuisineType || undefined,
      includeIngredients: includeIngredients || undefined,
      excludeIngredients: excludeIngredients || undefined,
      type: mealType || undefined,
      maxReadyTime: maxReadyTime || undefined,
    });
  };

  return (
    <main className="recipe-main">
      <div className="search-container">
        <button onClick={() => router.push('/')} className="btn btn-primary btn-small">
          ← Back to Home
        </button>
        <RecipeSearchForm
          cuisineType={cuisineType}
          setCuisineType={setCuisineType}
          includeIngredients={includeIngredients}
          setIncludeIngredients={setIncludeIngredients}
          excludeIngredients={excludeIngredients}
          setExcludeIngredients={setExcludeIngredients}
          mealType={mealType}
          setMealType={setMealType}
          maxReadyTime={maxReadyTime}
          setMaxReadyTime={setMaxReadyTime}
          onSubmit={handleSearch}
          isSearching={isSearching}
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
