import { NextResponse } from 'next/server';
import { Recipe } from '../../../services/spoonacularApi';
import { mapSpoonacularError, errorResponse, ApiError } from '../../../utils/apiErrorHandler';
import { fetchWithRetry } from '../../../utils/fetchUtils';

const API_BASE_URL = 'https://api.spoonacular.com';
const API_KEY = process.env.SPOONACULAR_API_KEY || '';

interface RandomRecipeResponse {
  recipes: Recipe[];
}

export async function GET() {
  if (!API_KEY) {
    const error = new ApiError(500, 'Server configuration error. Please contact support.');
    return errorResponse(error);
  }

  try {
    const response = await fetchWithRetry(
      `${API_BASE_URL}/recipes/random?apiKey=${API_KEY}&number=1`,
      {
        next: { revalidate: 0 },
      }
    );

    if (!response.ok) {
      const mappedError = mapSpoonacularError(response.status);
      return errorResponse(mappedError);
    }

    const data: RandomRecipeResponse = await response.json();
    const recipe = data.recipes?.[0];

    if (!recipe) {
      const error = new ApiError(502, 'No recipe available. Please try again.');
      return errorResponse(error);
    }

    return NextResponse.json({ recipe });
  } catch (err) {
    const error = new ApiError(500, 'An unexpected error occurred. Please try again.', String(err));
    return errorResponse(error);
  }
}
