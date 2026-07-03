import { NextRequest, NextResponse } from 'next/server';
import { Recipe } from '../../../services/spoonacularApi';
import { mapSpoonacularError, errorResponse, ApiError } from '../../../utils/apiErrorHandler';
import { fetchWithRetry } from '../../../utils/fetchUtils';
import { searchQueryParamsSchema } from '../../../domain/search/searchFiltersSchema';

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
    const parsed = searchQueryParamsSchema.safeParse({
      cuisine: incoming.get('cuisine') ?? undefined,
      includeIngredients: incoming.get('includeIngredients') ?? undefined,
      excludeIngredients: incoming.get('excludeIngredients') ?? undefined,
      type: incoming.get('type') ?? undefined,
      maxReadyTime: incoming.get('maxReadyTime') ?? undefined,
    });

    if (!parsed.success) {
      return errorResponse(
        new ApiError(400, 'Invalid search parameters. Please check your input.')
      );
    }

    const queryParams = new URLSearchParams();

    queryParams.set('apiKey', API_KEY);

    const { cuisine, includeIngredients, excludeIngredients, type, maxReadyTime } = parsed.data;

    if (cuisine) queryParams.set('cuisine', cuisine);
    if (includeIngredients) queryParams.set('includeIngredients', includeIngredients);
    if (excludeIngredients) queryParams.set('excludeIngredients', excludeIngredients);
    if (type) queryParams.set('type', type);
    if (maxReadyTime) queryParams.set('maxReadyTime', maxReadyTime);

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
