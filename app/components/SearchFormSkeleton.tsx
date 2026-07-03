export default function SearchFormSkeleton() {
  return (
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
  );
}
