'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import './css/recipeSearch.css';
import { spoonacularApi } from './services/spoonacularApi';
import RandomRecipeButton from './components/RandomRecipeButton';
import RecipeCard from './components/RecipeCard';
import ErrorMessage from './components/ErrorMessage';
import DetailedSearchButton from './components/DetailedSearchButton';

export default function Home() {
  const router = useRouter();

  const {
    data: randomRecipe,
    error,
    isPending: isLoading,
    mutateAsync,
  } = useMutation({
    mutationKey: ['random-recipe'],
    mutationFn: spoonacularApi.getRandomRecipe,
  });

  const handleRandomRecipe = async () => {
    await mutateAsync();
  };

  return (
    <main className="recipe-main">
      <RandomRecipeButton onClick={handleRandomRecipe} isLoading={isLoading} />

      {error && (
        <ErrorMessage message={error instanceof Error ? error.message : 'Failed to fetch recipe'} />
      )}

      {randomRecipe && <RecipeCard recipe={randomRecipe} variant="featured" />}

      <DetailedSearchButton onClick={() => router.push('/search')} />
    </main>
  );
}
