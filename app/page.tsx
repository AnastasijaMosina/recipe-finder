'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './css/recipeSearch.css';
import { spoonacularApi, Recipe } from './services/spoonacularApi';
import RandomRecipeButton from './components/RandomRecipeButton';
import RecipeCard from './components/RecipeCard';
import ErrorMessage from './components/ErrorMessage';
import DetailedSearchButton from './components/DetailedSearchButton';

export default function Home() {
  const router = useRouter();

  const [randomRecipe, setRandomRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRandomRecipe = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const recipe = await spoonacularApi.getRandomRecipe();
      setRandomRecipe(recipe);
      console.log('Random Recipe:', recipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recipe');
      console.error('Error fetching random recipe:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="recipe-main">
      <RandomRecipeButton onClick={handleRandomRecipe} isLoading={isLoading} />

      {error && <ErrorMessage message={error} />}

      {randomRecipe && <RecipeCard recipe={randomRecipe} variant="featured" />}

      <DetailedSearchButton onClick={() => router.push('/search')} />
    </main>
  );
}
