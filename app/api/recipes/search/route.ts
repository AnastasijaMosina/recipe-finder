import { NextRequest, NextResponse } from 'next/server';
import { Recipe } from '../../../services/spoonacularApi';
import { mapSpoonacularError, errorResponse, ApiError } from '../../../utils/apiErrorHandler';
import { fetchWithRetry } from '../../../utils/fetchUtils';

const API_BASE_URL = 'https://api.spoonacular.com';
const API_KEY = process.env.SPOONACULAR_API_KEY || '';

interface SearchRecipeResponse {
  results?: Recipe[];
}

export async function GET(request: NextRequest) {
  if (!API_KEY) {
    const error = new ApiError(500, 'Server configuration error. Please contact support.');
    return errorResponse(error);
  }

  try {
    const incoming = request.nextUrl.searchParams;
    const queryParams = new URLSearchParams();

    queryParams.set('apiKey', API_KEY);

    const allowedParams = [
      'cuisine',
      'includeIngredients',
      'excludeIngredients',
      'type',
      'maxReadyTime',
    ];

    for (const key of allowedParams) {
      const value = incoming.get(key);
      if (value) {
        queryParams.set(key, value);
      }
    }

    queryParams.set('number', '10');
    queryParams.set('addRecipeInformation', 'true');

    const response = await fetchWithRetry(
      `${API_BASE_URL}/recipes/complexSearch?${queryParams.toString()}`,
      {
        next: { revalidate: 0 },
      }
    );

    if (!response.ok) {
      const mappedError = mapSpoonacularError(response.status);
      return errorResponse(mappedError);
    }

    const data: SearchRecipeResponse = await response.json();

    return NextResponse.json({ results: data.results || [] });
  } catch (err) {
    const error = new ApiError(500, 'An unexpected error occurred. Please try again.', String(err));
    return errorResponse(error);
  }
}
