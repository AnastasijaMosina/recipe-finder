import { NextResponse } from 'next/server';
import { Recipe } from '../../../services/spoonacularApi';

const API_BASE_URL = 'https://api.spoonacular.com';
const API_KEY = process.env.SPOONACULAR_API_KEY || '';

interface RandomRecipeResponse {
  recipes: Recipe[];
}

export async function GET() {
  if (!API_KEY) {
    return NextResponse.json(
      { error: 'Spoonacular API key is not configured. Set SPOONACULAR_API_KEY.' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${API_BASE_URL}/recipes/random?apiKey=${API_KEY}&number=1`, {
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch random recipe: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data: RandomRecipeResponse = await response.json();
    const recipe = data.recipes?.[0];

    if (!recipe) {
      return NextResponse.json({ error: 'No recipe returned from Spoonacular.' }, { status: 502 });
    }

    return NextResponse.json({ recipe });
  } catch {
    return NextResponse.json(
      { error: 'Unexpected error fetching random recipe.' },
      { status: 500 }
    );
  }
}
