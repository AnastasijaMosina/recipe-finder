'use client';

import { useForm } from 'react-hook-form';
import { CUISINES, MEAL_TYPES } from '../constants/cuisines';

interface RecipeSearchFormValues {
  cuisineType: string;
  includeIngredients: string;
  excludeIngredients: string;
  mealType: string;
  maxReadyTime: string;
}

interface SearchFilters {
  cuisine?: string;
  includeIngredients?: string;
  excludeIngredients?: string;
  type?: string;
  maxReadyTime?: string;
}

interface RecipeSearchFormProps {
  onSubmit: (filters: SearchFilters) => void;
  isSearching: boolean;
}

export default function RecipeSearchForm({ onSubmit, isSearching }: RecipeSearchFormProps) {
  const { register, handleSubmit } = useForm<RecipeSearchFormValues>({
    defaultValues: {
      cuisineType: '',
      includeIngredients: '',
      excludeIngredients: '',
      mealType: '',
      maxReadyTime: '',
    },
  });

  const onFormSubmit = (values: RecipeSearchFormValues) => {
    onSubmit({
      cuisine: values.cuisineType || undefined,
      includeIngredients: values.includeIngredients || undefined,
      excludeIngredients: values.excludeIngredients || undefined,
      type: values.mealType || undefined,
      maxReadyTime: values.maxReadyTime || undefined,
    });
  };

  return (
    <div className="search-container">
      <h2 className="search-title">Search for a Recipe</h2>

      <form onSubmit={handleSubmit(onFormSubmit)} className="search-form">
        {/* Cuisine Type */}
        <div className="form-field">
          <label htmlFor="cuisineType" className="form-label">
            Cuisine Type
          </label>
          <select id="cuisineType" {...register('cuisineType')} className="form-select">
            <option value="">Select cuisine type...</option>
            {CUISINES.map((cuisine) => (
              <option key={cuisine} value={cuisine.toLowerCase()}>
                {cuisine}
              </option>
            ))}
          </select>
        </div>

        {/* Include Ingredients */}
        <div className="form-field">
          <label htmlFor="includeIngredients" className="form-label">
            Ingredients to Include
          </label>
          <input
            type="text"
            id="includeIngredients"
            {...register('includeIngredients')}
            placeholder="e.g., chicken, tomatoes, garlic"
            className="form-input"
          />
          <p className="form-helper-text">Separate multiple ingredients with commas</p>
        </div>

        {/* Exclude Ingredients */}
        <div className="form-field">
          <label htmlFor="excludeIngredients" className="form-label">
            Ingredients to Exclude
          </label>
          <input
            type="text"
            id="excludeIngredients"
            {...register('excludeIngredients')}
            placeholder="e.g., nuts, dairy, shellfish"
            className="form-input"
          />
          <p className="form-helper-text">Separate multiple ingredients with commas</p>
        </div>

        {/* Meal Type */}
        <div className="form-field">
          <label htmlFor="mealType" className="form-label">
            Meal Type
          </label>
          <select id="mealType" {...register('mealType')} className="form-select">
            <option value="">Select meal type...</option>
            {MEAL_TYPES.map((type) => (
              <option key={type} value={type.toLowerCase()}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Max Ready Time */}
        <div className="form-field">
          <label htmlFor="maxReadyTime" className="form-label">
            Max Cooking Time (minutes)
          </label>
          <input
            type="number"
            id="maxReadyTime"
            {...register('maxReadyTime')}
            placeholder="e.g., 30"
            min="1"
            className="form-input"
          />
          <p className="form-helper-text">Maximum time in minutes to prepare the recipe</p>
        </div>

        {/* Search Button */}
        <div className="search-btn-container">
          <button
            type="submit"
            className="btn btn-primary btn-medium btn-full-width"
            disabled={isSearching}
          >
            {isSearching ? '⏳ Searching...' : '🔍 Search Recipes'}
          </button>
        </div>
      </form>
    </div>
  );
}
