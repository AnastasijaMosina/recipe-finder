import { describe, expect, it } from 'vitest';
import { extractFiltersFromConversation } from './ruleBasedFilterExtractor';

describe('ruleBasedFilterExtractor', () => {
  it('resets previous filters when user says they changed their mind', () => {
    const filters = extractFiltersFromConversation({
      conversationHistory: [
        { role: 'user', content: 'I want italian dinner with chicken under 30 minutes' },
      ],
      latestUserMessage: 'I changed my mind. Make it mexican lunch with tofu under 20 minutes',
      baseFilters: {},
    });

    expect(filters).toEqual({
      cuisine: 'mexican',
      type: 'lunch',
      includeIngredients: 'tofu',
      maxReadyTime: '20',
    });
  });

  it('resets previous filters when user asks to forget previous requests', () => {
    const filters = extractFiltersFromConversation({
      conversationHistory: [
        { role: 'user', content: 'I want breakfast with egg and exclude dairy' },
      ],
      latestUserMessage: 'Forget previous requests. I need dinner with fish',
      baseFilters: {},
    });

    expect(filters).toEqual({
      type: 'dinner',
      includeIngredients: 'fish',
    });
  });

  it('rewrites includeIngredients by default when user provides a new value', () => {
    const filters = extractFiltersFromConversation({
      conversationHistory: [{ role: 'user', content: 'Dinner with chicken' }],
      latestUserMessage: 'Use beef instead',
      baseFilters: {},
    });

    expect(filters).toEqual({
      type: 'dinner',
      includeIngredients: 'beef',
    });
  });

  it('keeps previous ingredients when user explicitly indicates addition', () => {
    const filters = extractFiltersFromConversation({
      conversationHistory: [{ role: 'user', content: 'Lunch with chicken' }],
      latestUserMessage: 'Also add beef as extra',
      baseFilters: {},
    });

    expect(filters).toEqual({
      type: 'lunch',
      includeIngredients: 'chicken,beef',
    });
  });

  it('rewrites excluded ingredients unless user indicates addition', () => {
    const filters = extractFiltersFromConversation({
      conversationHistory: [{ role: 'user', content: 'No dairy' }],
      latestUserMessage: 'Avoid nuts',
      baseFilters: {},
    });

    expect(filters).toEqual({
      excludeIngredients: 'nuts',
    });
  });

  it('handles typoed changed-mind phrase and replaces prior filters', () => {
    const filters = extractFiltersFromConversation({
      conversationHistory: [
        { role: 'user', content: 'I want mediterranean dinner with chicken under 30 minutes' },
      ],
      latestUserMessage:
        'i chaged my mind. i want to search for desert recipes for chocolate and strawberry',
      baseFilters: {},
    });

    expect(filters).toEqual({
      type: 'dessert',
      includeIngredients: 'chocolate,strawberry',
    });
  });

  it('clears maxReadyTime when user asks to forget about time limit', () => {
    const filters = extractFiltersFromConversation({
      conversationHistory: [
        { role: 'user', content: 'I want mexican dinner with beef under 25 minutes' },
      ],
      latestUserMessage: 'forget about time limit',
      baseFilters: {},
    });

    expect(filters).toEqual({
      cuisine: 'mexican',
      type: 'dinner',
      includeIngredients: 'beef',
    });
  });
});
