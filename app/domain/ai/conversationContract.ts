import { z } from 'zod';
import { searchQueryParamsSchema, type RecipeSearchFilters } from '../search/searchFiltersSchema';

export const aiMissingSlotSchema = z.enum([
  'cuisine',
  'type',
  'includeIngredients',
  'excludeIngredients',
  'maxReadyTime',
]);

export type AiMissingSlot = z.infer<typeof aiMissingSlotSchema>;

export const aiConversationStateSchema = z.object({
  intentText: z.string().trim(),
  extractedFilters: searchQueryParamsSchema.default({}),
  missingSlots: z.array(aiMissingSlotSchema).default([]),
  followUpQuestions: z.array(z.string().trim().min(1)).default([]),
  isReadyToSearch: z.boolean().default(false),
});

export type AiConversationState = z.infer<typeof aiConversationStateSchema>;

export const createInitialAiConversationState = (): AiConversationState => ({
  intentText: '',
  extractedFilters: {},
  missingSlots: [],
  followUpQuestions: [],
  isReadyToSearch: false,
});

export const parseAiConversationState = (input: unknown): AiConversationState =>
  aiConversationStateSchema.parse(input);

export const safeParseAiConversationState = (input: unknown) =>
  aiConversationStateSchema.safeParse(input);

export type ExtractedAiFilters = RecipeSearchFilters;
