const API_BASE_URL = '/api/recipes';

export interface Recipe {
  id: number;
  title: string;
  image: string;
  imageType: string;
  servings: number;
  readyInMinutes: number;
  sourceUrl: string;
  summary: string;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
  instructions: string;
  extendedIngredients: Ingredient[];
}

export interface Ingredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
  original: string;
}

export interface RandomRecipeResponse {
  recipes: Recipe[];
}

interface RandomRecipeApiResponse {
  recipe?: Recipe;
  error?: string;
}

interface SearchRecipeApiResponse {
  results?: Recipe[];
  error?: string;
}

export const spoonacularApi = {
  async getRandomRecipe(): Promise<Recipe> {
    const response = await fetch(`${API_BASE_URL}/random`);

    if (!response.ok) {
      let message = `Failed to fetch random recipe: ${response.statusText}`;
      try {
        const errorData: RandomRecipeApiResponse = await response.json();
        if (errorData.error) {
          message = errorData.error;
        }
      } catch {
        // Ignore JSON parse failures and use status text fallback
      }
      throw new Error(message);
    }

    const data: RandomRecipeApiResponse = await response.json();

    if (!data.recipe) {
      throw new Error('No recipe returned.');
    }

    return data.recipe;
  },

  async searchRecipes(params: {
    cuisine?: string;
    includeIngredients?: string;
    excludeIngredients?: string;
    type?: string;
    maxReadyTime?: string;
  }): Promise<Recipe[]> {
    const queryParams = new URLSearchParams();

    if (params.cuisine) queryParams.append('cuisine', params.cuisine);
    if (params.includeIngredients)
      queryParams.append('includeIngredients', params.includeIngredients);
    if (params.excludeIngredients)
      queryParams.append('excludeIngredients', params.excludeIngredients);
    if (params.type) queryParams.append('type', params.type);
    if (params.maxReadyTime) queryParams.append('maxReadyTime', params.maxReadyTime);

    // Add random offset between 0 and 100
    // const randomOffset = Math.floor(Math.random() * 101);
    // queryParams.append('offset', randomOffset.toString());
    const response = await fetch(`${API_BASE_URL}/search?${queryParams.toString()}`);

    if (!response.ok) {
      let message = `Failed to search recipes: ${response.statusText}`;
      try {
        const errorData: SearchRecipeApiResponse = await response.json();
        if (errorData.error) {
          message = errorData.error;
        }
      } catch {
        // Ignore JSON parse failures and use status text fallback
      }
      throw new Error(message);
    }

    const data: SearchRecipeApiResponse = await response.json();
    return data.results || [];
  },
};
