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
  { keyword: 'desert', value: 'dessert' },
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
  'nuts',
  'gluten',
  'shellfish',
  'chocolate',
  'strawberry',
] as const;

const RESET_INTENT_PATTERNS: RegExp[] = [
  /\bforget\s+(?:everything|all|that|it|previous|before|earlier)\b/i,
  /\bignore\s+(?:everything|all|that|it|previous|before|earlier)\b/i,
  /\bstart\s+over\b/i,
  /\bfrom\s+scratch\b/i,
  /\bscratch\s+that\b/i,
  /\bi\s+cha(?:n)?g\w*\s+my\s+mind\b/i,
  /\bcha(?:n)?g\w*\s+my\s+mind\b/i,
];

const ADDITIVE_INTENT_PATTERNS: RegExp[] = [
  /\b(?:also|too|plus)\b/i,
  /\bas\s+well\b/i,
  /\bin\s+addition\b/i,
  /\b(?:add|adding|added)\b/i,
  /\b(?:extra|additional)\b/i,
];

const CLEAR_TIME_PATTERNS: RegExp[] = [
  /\bforget\s+about\s+(?:the\s+)?time\s+limit\b/i,
  /\bno\s+time\s+limit\b/i,
  /\bwithout\s+(?:a\s+)?time\s+limit\b/i,
  /\bremove\s+(?:the\s+)?time\s+limit\b/i,
  /\bignore\s+(?:the\s+)?time\s+limit\b/i,
];

const STOP_WORDS = new Set([
  'i',
  'want',
  'to',
  'search',
  'for',
  'recipe',
  'recipes',
  'make',
  'it',
  'with',
  'and',
  'or',
  'the',
  'a',
  'an',
  'some',
  'please',
  'about',
  'meal',
  'type',
  'cuisine',
  'yes',
  'yeah',
  'yep',
  'ok',
  'okay',
  'sure',
  'anything',
  'whatever',
]);

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

const normalizeIngredientToken = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\s-]/gu, '')
    .replace(/\s+/g, ' ');

const splitIngredientPhrase = (value: string): string[] =>
  value
    .split(/,|\band\b|\bor\b|\bfor\b|\//i)
    .map(normalizeIngredientToken)
    .filter(
      (token) =>
        token.length > 1 &&
        token.length <= 40 &&
        !STOP_WORDS.has(token) &&
        !/\brecipes?\b/.test(token) &&
        !/^\d+$/.test(token)
    );

const hasNegativeIngredientPattern = (normalized: string, keyword: string): boolean => {
  const escapedKeyword = escapeRegex(keyword);
  const keywordPattern = `${escapedKeyword}(?:es|s)?`;

  return new RegExp(
    `\\b(?:no|without|exclude|excluding|avoid|except|anything\\s+except|anything\\s+but)\\s+${keywordPattern}\\b`
  ).test(normalized);
};

const extractMaxReadyTime = (text: string): string | undefined => {
  const underMatches = [
    ...text.matchAll(/(?:under|less than)\s+(\d{1,3})\s*(?:minutes|minute|mins|min)?/gi),
  ];
  const lastUnderMatch = underMatches.at(-1);
  if (lastUnderMatch?.[1]) {
    return lastUnderMatch[1];
  }

  const minutesMatches = [...text.matchAll(/(\d{1,3})\s*(?:minutes|minute|mins|min)\b/gi)];
  const lastMinutesMatch = minutesMatches.at(-1);
  if (lastMinutesMatch?.[1]) {
    return lastMinutesMatch[1];
  }

  return undefined;
};

const extractCuisine = (normalized: string): string | undefined => {
  let matchedCuisine: string | undefined;
  let lastMatchIndex = -1;

  for (const cuisine of CUISINES) {
    const normalizedCuisine = cuisine.toLowerCase();
    const matchIndex = normalized.lastIndexOf(normalizedCuisine);

    if (matchIndex > lastMatchIndex) {
      lastMatchIndex = matchIndex;
      matchedCuisine = normalizedCuisine;
    }
  }

  return matchedCuisine;
};

const extractMealType = (normalized: string): string | undefined => {
  let matchedMealType: string | undefined;
  let lastMatchIndex = -1;

  for (const { keyword, value } of MEAL_TYPE_KEYWORDS) {
    const matchIndex = normalized.lastIndexOf(keyword);

    if (matchIndex > lastMatchIndex) {
      lastMatchIndex = matchIndex;
      matchedMealType = value;
    }
  }

  return matchedMealType;
};

const extractExcludedIngredients = (normalized: string): string[] => {
  const results: string[] = [];

  for (const keyword of COMMON_INGREDIENT_KEYWORDS) {
    const isExcluded = hasNegativeIngredientPattern(normalized, keyword);

    if (isExcluded) {
      results.push(keyword);
    }
  }

  const clauseMatches = [
    ...normalized.matchAll(
      /\b(?:no|without|exclude|excluding|avoid)\s+([a-z\s,-]+?)(?=\b(?:with|for|under|less than|in|on|please)\b|[.!?]|$)/gi
    ),
  ];

  for (const match of clauseMatches) {
    const clause = match[1];
    if (!clause) {
      continue;
    }

    addUnique(results, splitIngredientPhrase(clause));
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

  const clauseMatches = [
    ...normalized.matchAll(
      /\b(?:with|include|including|for)\s+([a-z\s,-]+?)(?=\b(?:under|less than|without|no|exclude|excluding|avoid|in|on|please)\b|[.!?]|$)/gi
    ),
  ];

  for (const match of clauseMatches) {
    const clause = match[1];
    if (!clause) {
      continue;
    }

    const tokens = splitIngredientPhrase(clause).filter(
      (ingredient) => !excludedIngredients.includes(ingredient)
    );
    addUnique(results, tokens);
  }

  return results;
};

const extractStandaloneIngredientReply = (
  normalized: string,
  currentFilters: SearchQueryParams,
  excludedIngredients: string[]
): string[] => {
  const wordCount = normalized.split(/\s+/).filter(Boolean).length;
  const hasStructuredMatch = Boolean(
    extractCuisine(normalized) ||
    extractMealType(normalized) ||
    extractMaxReadyTime(normalized) ||
    excludedIngredients.length > 0 ||
    RESET_INTENT_PATTERNS.some((pattern) => pattern.test(normalized)) ||
    CLEAR_TIME_PATTERNS.some((pattern) => pattern.test(normalized))
  );

  if (hasStructuredMatch || wordCount === 0 || wordCount > 3 || /\brecipes?\b/i.test(normalized)) {
    return [];
  }

  const currentIncluded = splitCsv(currentFilters.includeIngredients);
  const tokens = splitIngredientPhrase(normalized).filter(
    (ingredient) =>
      !excludedIngredients.includes(ingredient) && !currentIncluded.includes(ingredient)
  );

  if (tokens.length === 0 || tokens.length > 3) {
    return [];
  }

  return tokens;
};

const mergeTextIntoFilters = (
  currentFilters: SearchQueryParams,
  text: string
): SearchQueryParams => {
  const normalized = text.toLowerCase();
  const shouldTreatAsAdditive = ADDITIVE_INTENT_PATTERNS.some((pattern) =>
    pattern.test(normalized)
  );
  const shouldClearMaxReadyTime = CLEAR_TIME_PATTERNS.some((pattern) => pattern.test(normalized));

  const currentIncluded = splitCsv(currentFilters.includeIngredients);
  const currentExcluded = splitCsv(currentFilters.excludeIngredients);

  const extractedExcluded = extractExcludedIngredients(normalized);
  const extractedIncluded = extractIncludedIngredients(normalized, extractedExcluded);
  const extractedStandaloneIngredients =
    extractedIncluded.length === 0
      ? extractStandaloneIngredientReply(normalized, currentFilters, extractedExcluded)
      : [];

  const nextExcluded = shouldTreatAsAdditive
    ? [...currentExcluded]
    : extractedExcluded.length > 0
      ? [...extractedExcluded]
      : currentExcluded;
  const nextIncluded = shouldTreatAsAdditive
    ? [...currentIncluded]
    : extractedIncluded.length > 0
      ? [...extractedIncluded]
      : extractedStandaloneIngredients.length > 0
        ? [...extractedStandaloneIngredients]
        : currentIncluded;

  if (shouldTreatAsAdditive) {
    addUnique(nextExcluded, extractedExcluded);
    addUnique(nextIncluded, extractedIncluded);
    addUnique(nextIncluded, extractedStandaloneIngredients);
  }

  // Excluded ingredients should never remain in includeIngredients.
  const filteredIncluded = nextIncluded.filter((ingredient) => !nextExcluded.includes(ingredient));

  const nextCuisine = extractCuisine(normalized) ?? currentFilters.cuisine;
  const nextMealType = extractMealType(normalized) ?? currentFilters.type;
  const nextMaxReadyTime = shouldClearMaxReadyTime
    ? undefined
    : (extractMaxReadyTime(text) ?? currentFilters.maxReadyTime);

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
    (currentFilters, message) => {
      const shouldResetFilters = RESET_INTENT_PATTERNS.some((pattern) => pattern.test(message));
      const nextBase = shouldResetFilters ? {} : currentFilters;

      return mergeTextIntoFilters(nextBase, message);
    },
    {
      ...baseFilters,
    }
  );
};
