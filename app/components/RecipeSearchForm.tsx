'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CUISINES, MEAL_TYPES } from '../constants/cuisines';
import {
  recipeSearchFormSchema,
  type RecipeSearchFormValues,
  type RecipeSearchFilters,
} from '../domain/search/searchFiltersSchema';
import { loadLastSearchFilters, saveLastSearchFilters } from '../utils/searchStorage';
import { mapFiltersToFormValues, mapFormValuesToFilters } from '../services/searchMappers';

interface RecipeSearchFormProps {
  onSubmit: (filters: RecipeSearchFilters) => void;
  isSearching: boolean;
  defaultValues?: Partial<RecipeSearchFormValues>;
}

export default function RecipeSearchForm({
  onSubmit,
  isSearching,
  defaultValues,
}: RecipeSearchFormProps) {
  const savedFilters = loadLastSearchFilters();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RecipeSearchFormValues>({
    resolver: zodResolver(recipeSearchFormSchema),
    defaultValues: mapFiltersToFormValues({
      cuisine: defaultValues?.cuisineType,
      includeIngredients: defaultValues?.includeIngredients,
      excludeIngredients: defaultValues?.excludeIngredients,
      type: defaultValues?.mealType,
      maxReadyTime: defaultValues?.maxReadyTime,
    }),
  });

  useEffect(() => {
    reset({
      cuisineType: defaultValues?.cuisineType ?? '',
      includeIngredients: defaultValues?.includeIngredients ?? '',
      excludeIngredients: defaultValues?.excludeIngredients ?? '',
      mealType: defaultValues?.mealType ?? '',
      maxReadyTime: defaultValues?.maxReadyTime ?? '',
    });
  }, [defaultValues, reset]);

  const onFormSubmit = (values: RecipeSearchFormValues) => {
    const filters = mapFormValuesToFilters(values);

    saveLastSearchFilters(filters);
    onSubmit(filters);
  };

  const handleLoadLastSearch = () => {
    if (!savedFilters) {
      return;
    }

    reset(mapFiltersToFormValues(savedFilters));
  };

  return (
    <div className="search-container">
      <h2 className="search-title">Search for a Recipe</h2>

      <div className="search-helper-actions">
        <button
          type="button"
          className="btn btn-secondary btn-small"
          onClick={handleLoadLastSearch}
          disabled={!savedFilters}
          aria-label="Restore your previous search criteria"
        >
          Load last search
        </button>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="search-form">
        {/* Cuisine Type */}
        <div className="form-field">
          <label htmlFor="cuisineType" className="form-label">
            Cuisine Type *
          </label>
          <select
            id="cuisineType"
            {...register('cuisineType')}
            className="form-select"
            aria-invalid={Boolean(errors.cuisineType)}
            aria-describedby={errors.cuisineType ? 'cuisineType-error' : undefined}
          >
            <option value="">Select cuisine type...</option>
            {CUISINES.map((cuisine) => (
              <option key={cuisine} value={cuisine.toLowerCase()}>
                {cuisine}
              </option>
            ))}
          </select>
          {errors.cuisineType && (
            <p className="form-error-message" id="cuisineType-error">
              {errors.cuisineType.message}
            </p>
          )}
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
            Meal Type *
          </label>
          <select
            id="mealType"
            {...register('mealType')}
            className="form-select"
            aria-invalid={Boolean(errors.mealType)}
            aria-describedby={errors.mealType ? 'mealType-error' : undefined}
          >
            <option value="">Select meal type...</option>
            {MEAL_TYPES.map((type) => (
              <option key={type} value={type.toLowerCase()}>
                {type}
              </option>
            ))}
          </select>
          {errors.mealType && (
            <p className="form-error-message" id="mealType-error">
              {errors.mealType.message}
            </p>
          )}
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
            aria-invalid={Boolean(errors.maxReadyTime)}
            aria-describedby={errors.maxReadyTime ? 'maxReadyTime-error' : 'maxReadyTime-helper'}
          />
          {errors.maxReadyTime ? (
            <p className="form-error-message" id="maxReadyTime-error">
              {errors.maxReadyTime.message}
            </p>
          ) : (
            <p className="form-helper-text" id="maxReadyTime-helper">
              Maximum time in minutes to prepare the recipe
            </p>
          )}
        </div>

        {/* Search Button */}
        <div className="search-btn-container">
          <button
            type="submit"
            className="btn btn-primary btn-medium btn-full-width"
            disabled={isSearching}
            aria-busy={isSearching}
          >
            {isSearching ? '⏳ Searching...' : '🔍 Search Recipes'}
          </button>
        </div>
      </form>
    </div>
  );
}
