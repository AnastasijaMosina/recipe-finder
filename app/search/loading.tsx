import RecipeCardSkeleton from '../components/RecipeCardSkeleton';

export default function Loading() {
  return (
    <main className="recipe-main" aria-label="Loading search page">
      <div className="search-container">
        <h1 className="search-title search-results-title-skeleton skeleton-block" />

        <div className="search-form" aria-hidden="true">
          <div className="form-field">
            <div className="recipe-card-skeleton-line recipe-card-skeleton-line-short skeleton-block" />
            <div className="form-input skeleton-block skeleton-input" />
          </div>
          <div className="form-field">
            <div className="recipe-card-skeleton-line recipe-card-skeleton-line-short skeleton-block" />
            <div className="form-input skeleton-block skeleton-input" />
          </div>
          <div className="form-field">
            <div className="recipe-card-skeleton-line recipe-card-skeleton-line-short skeleton-block" />
            <div className="form-input skeleton-block skeleton-input" />
          </div>
        </div>

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
