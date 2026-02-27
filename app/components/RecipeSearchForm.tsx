import { CUISINES, MEAL_TYPES } from '../constants/cuisines';

interface RecipeSearchFormProps {
  cuisineType: string;
  setCuisineType: (value: string) => void;
  includeIngredients: string;
  setIncludeIngredients: (value: string) => void;
  excludeIngredients: string;
  setExcludeIngredients: (value: string) => void;
  mealType: string;
  setMealType: (value: string) => void;
  maxReadyTime: string;
  setMaxReadyTime: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSearching: boolean;
}

export default function RecipeSearchForm({
  cuisineType,
  setCuisineType,
  includeIngredients,
  setIncludeIngredients,
  excludeIngredients,
  setExcludeIngredients,
  mealType,
  setMealType,
  maxReadyTime,
  setMaxReadyTime,
  onSubmit,
  isSearching,
}: RecipeSearchFormProps) {
  return (
    <div className="search-container">
      <h2 className="search-title">Search for a Recipe</h2>

      <form onSubmit={onSubmit} className="search-form">
        {/* Cuisine Type */}
        <div className="form-field">
          <label htmlFor="cuisineType" className="form-label">
            Cuisine Type
          </label>
          <select
            id="cuisineType"
            value={cuisineType}
            onChange={(e) => setCuisineType(e.target.value)}
            className="form-select"
          >
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
            value={includeIngredients}
            onChange={(e) => setIncludeIngredients(e.target.value)}
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
            value={excludeIngredients}
            onChange={(e) => setExcludeIngredients(e.target.value)}
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
          <select
            id="mealType"
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            className="form-select"
          >
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
            value={maxReadyTime}
            onChange={(e) => setMaxReadyTime(e.target.value)}
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
