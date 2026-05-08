import { Recipe } from '../services/spoonacularApi';
import RecipeCard from './RecipeCard';
import RecipeCardSkeleton from './RecipeCardSkeleton';

interface SearchResultsProps {
  results: Recipe[];
  isLoading?: boolean;
}

export default function SearchResults({ results, isLoading }: SearchResultsProps) {
  if (isLoading) {
    return (
      <section className="search-results" aria-label="Loading search results" aria-busy="true">
        <div className="search-results-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (results.length === 0) return null;

  return (
    <section className="search-results" aria-label="Search results">
      <h2 className="search-results-title">Search Results ({results.length} recipes found)</h2>
      <div className="search-results-grid">
        {results.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </section>
  );
}
