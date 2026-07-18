import { expect, test } from '@playwright/test';

test('search -> favorite -> verify favorites page', async ({ page }) => {
  await page.route('**/api/recipes/search**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        results: [
          {
            id: 9001,
            title: 'E2E Tomato Soup',
            image: '',
            imageType: 'jpg',
            servings: 2,
            readyInMinutes: 25,
            sourceUrl: 'https://example.com/tomato-soup',
            summary: 'Simple soup',
            cuisines: ['italian'],
            dishTypes: ['soup'],
            diets: [],
            instructions: 'Cook and serve.',
            extendedIngredients: [
              {
                id: 1,
                name: 'Tomato',
                amount: 3,
                unit: 'pcs',
                original: '3 tomatoes',
              },
            ],
          },
        ],
      }),
    });
  });

  await page.goto('/search');

  await page.evaluate(() => {
    window.localStorage.clear();
  });

  await page.selectOption('#cuisineType', 'italian');
  await page.selectOption('#mealType', 'soup');

  await page.getByRole('button', { name: '🔍 Search Recipes' }).click();

  await expect(page.getByText('Search Results (1 recipes found)')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'E2E Tomato Soup' })).toBeVisible();

  await page.getByRole('button', { name: 'Add to favorites' }).click();
  await expect(page.getByRole('button', { name: 'Remove from favorites' })).toBeVisible();

  await page.getByRole('link', { name: /Favorites/ }).click();

  await expect(page.getByRole('heading', { name: '⭐ My Favorite Recipes' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'E2E Tomato Soup' })).toBeVisible();
});
