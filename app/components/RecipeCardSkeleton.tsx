import { memo } from 'react';

interface RecipeCardSkeletonProps {
  variant?: 'default' | 'featured';
}

function RecipeCardSkeleton({ variant = 'default' }: RecipeCardSkeletonProps) {
  if (variant === 'featured') {
    return (
      <div className="recipe-card-featured" aria-hidden="true" aria-busy="true">
        <div className="recipe-card-featured-content">
          <div className="recipe-card-featured-image-wrapper">
            <div className="skeleton skeleton-featured-image" />
          </div>
          <div className="recipe-card-featured-info">
            <div className="skeleton skeleton-title-lg" />
            <div className="recipe-card-featured-details">
              <div className="skeleton skeleton-text" />
              <div className="skeleton skeleton-text" />
              <div className="skeleton skeleton-text" />
              <div className="skeleton skeleton-text skeleton-text-short" />
            </div>
          </div>
        </div>
        <div className="skeleton skeleton-featured-btn" />
      </div>
    );
  }

  return (
    <div className="recipe-card" aria-hidden="true" aria-busy="true">
      <div className="skeleton skeleton-card-image" />
      <div className="recipe-card-content">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-text skeleton-text-short" />
        <div className="skeleton skeleton-text skeleton-text-short" />
        <div className="skeleton skeleton-link" />
      </div>
    </div>
  );
}

export default memo(RecipeCardSkeleton);
