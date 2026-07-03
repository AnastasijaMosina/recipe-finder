import type { AiMissingSlot } from '../../domain/ai/conversationContract';
import type { RecipeSearchFilters } from '../../domain/search/searchFiltersSchema';

const SLOT_QUESTIONS: Record<AiMissingSlot, string> = {
  type: 'What meal type do you want (breakfast, lunch, dinner, snack)?',
  cuisine: 'Any preferred cuisine (Italian, Mexican, Asian, etc.)?',
  includeIngredients: 'Which main ingredients would you like to include?',
  excludeIngredients: 'Any ingredients you want to avoid?',
  maxReadyTime: 'How many minutes do you have to prepare the meal?',
};

const SLOT_POSSIBLE_ANSWERS: Record<AiMissingSlot, string[]> = {
  type: ['breakfast', 'lunch', 'dinner', 'snack'],
  cuisine: ['italian', 'mexican', 'asian', 'mediterranean'],
  includeIngredients: ['chicken', 'beef', 'fish', 'tofu'],
  excludeIngredients: ['dairy', 'nuts', 'gluten', 'shellfish'],
  maxReadyTime: ['15', '30', '45', '60'],
};

export const OPTIONAL_PREFERENCE_SLOTS: ReadonlyArray<AiMissingSlot> = [
  'cuisine',
  'includeIngredients',
  'excludeIngredients',
];

export type OptionalPreferenceSlot = (typeof OPTIONAL_PREFERENCE_SLOTS)[number];

const hasValue = (value?: string): boolean => value !== undefined && value.trim() !== '';

const hasSecondaryPreference = (filters: RecipeSearchFilters): boolean =>
  hasValue(filters.cuisine) ||
  hasValue(filters.includeIngredients) ||
  hasValue(filters.excludeIngredients);

/**
 * Required data contract before search:
 * 1) meal type is required
 * 2) at least one of cuisine/includeIngredients/excludeIngredients is required
 */
export const detectMissingSlots = (
  filters: RecipeSearchFilters,
  declinedOptionalSlots: ReadonlyArray<AiMissingSlot> = []
): AiMissingSlot[] => {
  if (!hasValue(filters.type)) {
    // Ask for meal type first to keep the conversation focused.
    return ['type'];
  }

  if (!hasSecondaryPreference(filters)) {
    const nextOptionalSlot = OPTIONAL_PREFERENCE_SLOTS.find(
      (slot) => !declinedOptionalSlots.includes(slot)
    );

    // If all optional slots were declined, force one final required preference request.
    return nextOptionalSlot ? [nextOptionalSlot] : ['includeIngredients'];
  }

  return [];
};

/**
 * Returns true when enough filter data is present to run a recipe search.
 * Requires meal type AND at least one secondary preference.
 */
export const isReadyToSearch = (filters: RecipeSearchFilters): boolean =>
  hasValue(filters.type) && hasSecondaryPreference(filters);

/**
 * Maps missing slot keys to human-readable follow-up questions.
 */
export const generateFollowUpQuestions = (missingSlots: AiMissingSlot[]): string[] =>
  missingSlots.map((slot) => SLOT_QUESTIONS[slot]);

/**
 * Returns quick reply options for the current missing slot.
 * Uses the first missing slot to keep suggestions focused.
 */
export const generatePossibleAnswers = (missingSlots: AiMissingSlot[]): string[] => {
  const firstMissingSlot = missingSlots[0];
  if (!firstMissingSlot) {
    return [];
  }

  return SLOT_POSSIBLE_ANSWERS[firstMissingSlot];
};

export const detectAskedSlotFromAssistantMessage = (
  assistantMessage: string
): AiMissingSlot | undefined => {
  const normalizedMessage = assistantMessage.toLowerCase();
  const matchedEntry = Object.entries(SLOT_QUESTIONS).find(([, question]) =>
    normalizedMessage.includes(question.toLowerCase())
  );

  return matchedEntry?.[0] as AiMissingSlot | undefined;
};

export const isNegativePreferenceAnswer = (answer: string): boolean =>
  /^(?:\s)*(?:no|nope|nah|none|nothing|skip|no\s+preference|any|whatever|don't\s+care|dont\s+care|anything\s+is\s+fine|anything\s+except\b|anything\s+but\b|non|nein|nee|aucun|aucune|peu\s+importe|keine|kein|egal|ninguno|ninguna|sin\s+preferencia|cualquier|nessuno|nessuna|qualunque|não|nao|nenhum|nenhuma|qualquer|tanto\s+faz)/i.test(
    answer.trim()
  );
