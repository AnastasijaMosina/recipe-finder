'use client';

import { useRouter } from 'next/navigation';
import '../css/recipeSearch.css';
import RecipeSearchForm from '../components/RecipeSearchForm';
import SearchResults from '../components/SearchResults';
import ErrorMessage from '../components/ErrorMessage';
import { useState } from 'react';
import { Recipe, spoonacularApi } from '../services/spoonacularApi';

const SearchPage = () => {
  const [cuisineType, setCuisineType] = useState('');
  const [includeIngredients, setIncludeIngredients] = useState('');
  const [excludeIngredients, setExcludeIngredients] = useState('');
  const [mealType, setMealType] = useState('');
  const [maxReadyTime, setMaxReadyTime] = useState('');
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);

    try {
      const results = await spoonacularApi.searchRecipes({
        cuisine: cuisineType,
        includeIngredients: includeIngredients,
        excludeIngredients: excludeIngredients,
        type: mealType,
        maxReadyTime: maxReadyTime,
      });
      setSearchResults(results);
      console.log('Search Results:', results);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Failed to search recipes');
      console.error('Error searching recipes:', err);
    } finally {
      setIsSearching(false);
    }
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

        {searchError && <ErrorMessage message={searchError} style={{ marginTop: '1.5rem' }} />}

        <SearchResults results={searchResults} />
      </div>
    </main>
  );
};

export default SearchPage;
