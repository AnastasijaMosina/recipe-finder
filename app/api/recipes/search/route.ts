import { NextRequest, NextResponse } from 'next/server';
import { Recipe } from '../../../services/spoonacularApi';

const API_BASE_URL = 'https://api.spoonacular.com';
const API_KEY =
  process.env.SPOONACULAR_API_KEY || process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY || '';

interface SearchRecipeResponse {
  results?: Recipe[];
}

export async function GET(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'Spoonacular API key is not configured.' }, { status: 500 });
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

    const response = await fetch(
      `${API_BASE_URL}/recipes/complexSearch?${queryParams.toString()}`,
      {
        next: { revalidate: 0 },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to search recipes: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data: SearchRecipeResponse = await response.json();

    return NextResponse.json({ results: data.results || [] });
  } catch {
    return NextResponse.json({ error: 'Unexpected error searching recipes.' }, { status: 500 });
  }
}
