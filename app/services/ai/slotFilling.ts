import type { AiMissingSlot } from '../../domain/ai/conversationContract';
import type { RecipeSearchFilters } from '../../domain/search/searchFiltersSchema';

const SLOT_QUESTIONS: Record<AiMissingSlot, string> = {
  type: 'What meal type do you want (breakfast, lunch, dinner, snack)?',
  cuisine: 'Any preferred cuisine (Italian, Mexican, Asian, etc.)?',
  includeIngredients: 'Which main ingredients would you like to include?',
  excludeIngredients: 'Any ingredients you want to avoid?',
  maxReadyTime: 'How many minutes do you have to prepare the meal?',
};

/**
 * Slots that must be present for a search to run.
 * At least one of these must have a value before isReadyToSearch becomes true.
 */
const MINIMUM_REQUIRED_SLOTS: ReadonlyArray<AiMissingSlot> = ['type', 'includeIngredients'];

/**
 * Returns the slot keys that are still missing from the extracted filters.
 * Only checks the minimum required set — optional slots are not flagged here.
 */
export const detectMissingSlots = (filters: RecipeSearchFilters): AiMissingSlot[] =>
  MINIMUM_REQUIRED_SLOTS.filter((slot) => {
    const value = filters[slot];
    return value === undefined || value === '';
  });

/**
 * Returns true when enough filter data is present to run a recipe search.
 * Requires at least one of the minimum required slots to be filled.
 */
export const isReadyToSearch = (filters: RecipeSearchFilters): boolean =>
  MINIMUM_REQUIRED_SLOTS.some((slot) => {
    const value = filters[slot];
    return value !== undefined && value !== '';
  });

/**
 * Maps missing slot keys to human-readable follow-up questions.
 */
export const generateFollowUpQuestions = (missingSlots: AiMissingSlot[]): string[] =>
  missingSlots.map((slot) => SLOT_QUESTIONS[slot]);
