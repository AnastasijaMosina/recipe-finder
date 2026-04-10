import { z } from 'zod';

export const recipeSearchFormSchema = z.object({
  cuisineType: z.string().min(1, 'Cuisine type is required.'),
  includeIngredients: z.string(),
  excludeIngredients: z.string(),
  mealType: z.string().min(1, 'Meal type is required.'),
  maxReadyTime: z
    .string()
    .refine((value) => value === '' || (/^\d+$/.test(value) && Number(value) >= 1), {
      message: 'Must be a positive whole number (minimum 1).',
    }),
});

export type RecipeSearchFormValues = z.infer<typeof recipeSearchFormSchema>;

export const searchQueryParamsSchema = z.object({
  cuisine: z.string().optional(),
  includeIngredients: z.string().optional(),
  excludeIngredients: z.string().optional(),
  type: z.string().optional(),
  maxReadyTime: z
    .string()
    .optional()
    .refine((value) => value === undefined || (/^\d+$/.test(value) && Number(value) >= 1), {
      message: 'maxReadyTime must be a positive whole number.',
    }),
});

export type SearchQueryParams = z.infer<typeof searchQueryParamsSchema>;
