'use client';

import { useRouter } from 'next/navigation';
import useSWRMutation from 'swr/mutation';
import { spoonacularApi } from './services/spoonacularApi';
import RandomRecipeButton from './components/RandomRecipeButton';
import RecipeCard from './components/RecipeCard';
import ErrorMessage from './components/ErrorMessage';
import DetailedSearchButton from './components/DetailedSearchButton';

const randomRecipeFetcher = async () => {
  return spoonacularApi.getRandomRecipe();
};

export default function Home() {
  const router = useRouter();

  const {
    data: randomRecipe,
    error,
    isMutating: isLoading,
    trigger,
  } = useSWRMutation('random-recipe', randomRecipeFetcher);

  const handleRandomRecipe = async () => {
    await trigger();
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
