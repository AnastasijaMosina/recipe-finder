import Image from 'next/image';
import { memo } from 'react';
import { Recipe } from '../services/spoonacularApi';
import FavoriteButton from './FavoriteButton';

interface RecipeCardProps {
  recipe: Recipe;
  variant?: 'default' | 'featured';
}

function RecipeCard({ recipe, variant = 'default' }: RecipeCardProps) {
  if (variant === 'featured') {
    return (
      <div className="recipe-card-featured">
        <FavoriteButton recipe={recipe} className="favorite-btn-featured" />
        <div className="recipe-card-featured-content">
          {recipe.image && (
            <div className="recipe-card-featured-image-wrapper">
              <Image
                src={recipe.image}
                alt={recipe.title}
                className="recipe-card-featured-image"
                width={400}
                height={300}
                sizes="(max-width: 768px) 100vw, 400px"
                priority={variant === 'featured'}
              />
            </div>
          )}
          <div className="recipe-card-featured-info">
            <h2 className="recipe-card-featured-title">{recipe.title}</h2>
            <div className="recipe-card-featured-details">
              {recipe.readyInMinutes && (
                <p className="recipe-detail">
                  <strong>⏱️ Ready in:</strong> {recipe.readyInMinutes} minutes
                </p>
              )}
              {recipe.servings && (
                <p className="recipe-detail">
                  <strong>🍽️ Servings:</strong> {recipe.servings}
                </p>
              )}
              {recipe.cuisines && recipe.cuisines.length > 0 && (
                <p className="recipe-detail">
                  <strong>🌍 Cuisine:</strong> {recipe.cuisines.join(', ')}
                </p>
              )}
              {recipe.dishTypes && recipe.dishTypes.length > 0 && (
                <p className="recipe-detail">
                  <strong>🍴 Dish Type:</strong> {recipe.dishTypes.join(', ')}
                </p>
              )}
              {recipe.extendedIngredients && recipe.extendedIngredients.length > 0 && (
                <div className="recipe-detail">
                  <strong>🥘 Ingredients:</strong>
                  <ul className="ingredients-list">
                    {recipe.extendedIngredients.slice(0, 8).map((ingredient, index) => (
                      <li key={index}>{ingredient.name}</li>
                    ))}
                    {recipe.extendedIngredients.length > 8 && (
                      <li className="ingredients-more">
                        +{recipe.extendedIngredients.length - 8} more...
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        {recipe.sourceUrl && (
          <a
            href={recipe.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="recipe-card-featured-link btn btn-primary"
          >
            View Full Recipe →
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="recipe-card">
      <FavoriteButton recipe={recipe} className="favorite-btn-default" />
      {recipe.image && (
        <Image
          src={recipe.image}
          alt={recipe.title}
          className="recipe-card-image"
          width={400}
          height={300}
          sizes="(max-width: 768px) 100vw, 400px"
        />
      )}
      <div className="recipe-card-content">
        <h3 className="recipe-card-title">{recipe.title}</h3>
        {recipe.readyInMinutes && (
          <p className="recipe-card-time">⏱️ {recipe.readyInMinutes} minutes</p>
        )}
        {recipe.servings && <p className="recipe-card-servings">🍽️ Servings: {recipe.servings}</p>}
        {recipe.sourceUrl && (
          <a
            href={recipe.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="recipe-card-link"
          >
            View Recipe →
          </a>
        )}
      </div>
    </div>
  );
}

export default memo(RecipeCard);
