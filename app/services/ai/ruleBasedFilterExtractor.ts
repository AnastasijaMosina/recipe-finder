import { CUISINES } from '../../constants/cuisines';
import type { SearchQueryParams } from '../../domain/search/searchFiltersSchema';

type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type ExtractFromConversationInput = {
  conversationHistory: ConversationMessage[];
  latestUserMessage: string;
  baseFilters?: SearchQueryParams;
};

const MEAL_TYPE_KEYWORDS: Array<{ keyword: string; value: string }> = [
  { keyword: 'breakfast', value: 'breakfast' },
  { keyword: 'lunch', value: 'lunch' },
  { keyword: 'dinner', value: 'dinner' },
  { keyword: 'snack', value: 'snack' },
  { keyword: 'dessert', value: 'dessert' },
  { keyword: 'soup', value: 'soup' },
  { keyword: 'salad', value: 'salad' },
  { keyword: 'appetizer', value: 'appetizer' },
  { keyword: 'main course', value: 'main course' },
  { keyword: 'drink', value: 'drink' },
  { keyword: 'beverage', value: 'beverage' },
];

const COMMON_INGREDIENT_KEYWORDS = [
  'beef',
  'chicken',
  'pork',
  'lamb',
  'turkey',
  'fish',
  'salmon',
  'tuna',
  'shrimp',
  'tofu',
  'mushroom',
  'rice',
  'pasta',
  'egg',
  'potato',
  'tomato',
  'cheese',
  'dairy',
] as const;

const splitCsv = (value?: string): string[] =>
  value
    ? value
        .split(',')
        .map((part) => part.trim().toLowerCase())
        .filter(Boolean)
    : [];

const toCsv = (values: string[]): string | undefined => {
  if (values.length === 0) {
    return undefined;
  }

  return values.join(',');
};

const addUnique = (current: string[], incoming: string[]) => {
  for (const value of incoming) {
    if (!current.includes(value)) {
      current.push(value);
    }
  }
};

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const hasNegativeIngredientPattern = (normalized: string, keyword: string): boolean => {
  const escapedKeyword = escapeRegex(keyword);
  const keywordPattern = `${escapedKeyword}(?:es|s)?`;

  return new RegExp(
    `\\b(?:no|without|exclude|excluding|avoid|except|anything\\s+except|anything\\s+but)\\s+${keywordPattern}\\b`
  ).test(normalized);
};

const extractMaxReadyTime = (text: string): string | undefined => {
  const underMatch = text.match(/(?:under|less than)\s+(\d{1,3})\s*(?:minutes|minute|mins|min)?/i);
  if (underMatch?.[1]) {
    return underMatch[1];
  }

  const minutesMatch = text.match(/(\d{1,3})\s*(?:minutes|minute|mins|min)\b/i);
  if (minutesMatch?.[1]) {
    return minutesMatch[1];
  }

  return undefined;
};

const extractCuisine = (normalized: string): string | undefined => {
  const matched = CUISINES.find((cuisine) => normalized.includes(cuisine.toLowerCase()));
  return matched?.toLowerCase();
};

const extractMealType = (normalized: string): string | undefined => {
  const matched = MEAL_TYPE_KEYWORDS.find(({ keyword }) => normalized.includes(keyword));
  return matched?.value;
};

const extractExcludedIngredients = (normalized: string): string[] => {
  const results: string[] = [];

  for (const keyword of COMMON_INGREDIENT_KEYWORDS) {
    const isExcluded = hasNegativeIngredientPattern(normalized, keyword);

    if (isExcluded) {
      results.push(keyword);
    }
  }

  return results;
};

const extractIncludedIngredients = (
  normalized: string,
  excludedIngredients: string[]
): string[] => {
  const results: string[] = [];

  for (const keyword of COMMON_INGREDIENT_KEYWORDS) {
    if (excludedIngredients.includes(keyword)) {
      continue;
    }

    if (normalized.includes(keyword)) {
      results.push(keyword);
    }
  }

  return results;
};

const mergeTextIntoFilters = (
  currentFilters: SearchQueryParams,
  text: string
): SearchQueryParams => {
  const normalized = text.toLowerCase();

  const nextIncluded = splitCsv(currentFilters.includeIngredients);
  const nextExcluded = splitCsv(currentFilters.excludeIngredients);

  const extractedExcluded = extractExcludedIngredients(normalized);
  const extractedIncluded = extractIncludedIngredients(normalized, extractedExcluded);

  addUnique(nextExcluded, extractedExcluded);
  addUnique(nextIncluded, extractedIncluded);

  // Excluded ingredients should never remain in includeIngredients.
  const filteredIncluded = nextIncluded.filter((ingredient) => !nextExcluded.includes(ingredient));

  const nextCuisine = extractCuisine(normalized) ?? currentFilters.cuisine;
  const nextMealType = extractMealType(normalized) ?? currentFilters.type;
  const nextMaxReadyTime = extractMaxReadyTime(text) ?? currentFilters.maxReadyTime;

  return {
    cuisine: nextCuisine,
    type: nextMealType,
    includeIngredients: toCsv(filteredIncluded),
    excludeIngredients: toCsv(nextExcluded),
    maxReadyTime: nextMaxReadyTime,
  };
};

export const extractFiltersFromConversation = ({
  conversationHistory,
  latestUserMessage,
  baseFilters,
}: ExtractFromConversationInput): SearchQueryParams => {
  const userMessages = conversationHistory
    .filter((message) => message.role === 'user')
    .map((message) => message.content);

  const allMessages = [...userMessages, latestUserMessage];

  return allMessages.reduce<SearchQueryParams>(
    (currentFilters, message) => mergeTextIntoFilters(currentFilters, message),
    {
      ...baseFilters,
    }
  );
};
