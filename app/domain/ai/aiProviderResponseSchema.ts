import { z } from 'zod';
import { searchQueryParamsSchema } from '../search/searchFiltersSchema';

export const aiProviderResponseSchema = z.object({
  assistantReply: z.string().trim().min(1),
  followUpQuestions: z.array(z.string().trim().min(1)).default([]),
  extractedFilters: searchQueryParamsSchema.optional(),
  isReadyToSearch: z.boolean(),
});

export type AiProviderResponse = z.infer<typeof aiProviderResponseSchema>;
