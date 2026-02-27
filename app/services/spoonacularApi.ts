const API_BASE_URL = 'https://api.spoonacular.com';
const API_KEY = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY || '';

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

export const spoonacularApi = {
  async getRandomRecipe(): Promise<Recipe> {
    const response = await fetch(`${API_BASE_URL}/recipes/random?apiKey=${API_KEY}&number=1`);

    if (!response.ok) {
      throw new Error(`Failed to fetch random recipe: ${response.statusText}`);
    }

    const data: RandomRecipeResponse = await response.json();
    return data.recipes[0];
  },

  async searchRecipes(params: {
    cuisine?: string;
    includeIngredients?: string;
    excludeIngredients?: string;
    type?: string;
    maxReadyTime?: string;
  }): Promise<Recipe[]> {
    const queryParams = new URLSearchParams();

    if (API_KEY) queryParams.append('apiKey', API_KEY);
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
    queryParams.append('number', '10');
    queryParams.append('addRecipeInformation', 'true');

    const response = await fetch(`${API_BASE_URL}/recipes/complexSearch?${queryParams.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to search recipes: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || [];
  },
};
