import { Recipe } from '../services/spoonacularApi';
import RecipeCard from './RecipeCard';

interface SearchResultsProps {
  results: Recipe[];
}

export default function SearchResults({ results }: SearchResultsProps) {
  if (results.length === 0) return null;

  return (
    <div className="search-results">
      <h2 className="search-results-title">Search Results ({results.length} recipes found)</h2>
      <div className="search-results-grid">
        {results.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
