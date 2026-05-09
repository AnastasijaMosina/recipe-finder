import RecipeCardSkeleton from '../components/RecipeCardSkeleton';
import SearchFormSkeleton from '../components/SearchFormSkeleton';

export default function Loading() {
  return (
    <main className="recipe-main" aria-label="Loading search page">
      <div className="search-container">
        <h1 className="search-title search-results-title-skeleton skeleton-block" />

        <SearchFormSkeleton />

        <section className="search-results" aria-hidden="true">
          <h2 className="search-results-title search-results-title-skeleton skeleton-block" />
          <div className="search-results-grid">
            <RecipeCardSkeleton count={6} />
          </div>
        </section>
      </div>
    </main>
  );
}
