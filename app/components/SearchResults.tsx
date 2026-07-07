import { Recipe } from '../services/spoonacularApi';
import RecipeCard from './RecipeCard';
import RecipeCardSkeleton from './RecipeCardSkeleton';

interface SearchResultsProps {
  results: Recipe[];
  isLoading: boolean;
}

export default function SearchResults({ results, isLoading }: SearchResultsProps) {
  if (isLoading && results.length === 0) {
    return (
      <section className="search-results" aria-label="Loading search results" aria-live="polite">
        <h2 className="search-results-title search-results-title-skeleton skeleton-block" />
        <div className="search-results-grid">
          <RecipeCardSkeleton count={6} />
        </div>
      </section>
    );
  }

  if (results.length === 0) return null;

  return (
    <section className="search-results" aria-labelledby="search-results-title" aria-live="polite">
      <h2 id="search-results-title" className="search-results-title">
        Search Results ({results.length} recipes found)
      </h2>
      <div className="search-results-grid">
        {results.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </section>
  );
}
