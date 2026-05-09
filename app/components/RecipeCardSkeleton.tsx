interface RecipeCardSkeletonProps {
  count?: number;
}

export default function RecipeCardSkeleton({ count = 6 }: RecipeCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <article key={index} className="recipe-card recipe-card-skeleton" aria-hidden="true">
          <div className="recipe-card-skeleton-image skeleton-block" />
          <div className="recipe-card-content">
            <div className="recipe-card-skeleton-title skeleton-block" />
            <div className="recipe-card-skeleton-line skeleton-block" />
            <div className="recipe-card-skeleton-line recipe-card-skeleton-line-short skeleton-block" />
          </div>
        </article>
      ))}
    </>
  );
}
