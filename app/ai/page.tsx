'use client';

import { FormEvent, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import ErrorMessage from '../components/ErrorMessage';
import SearchResults from '../components/SearchResults';
import type { SearchQueryParams } from '../domain/search/searchFiltersSchema';
import {
  type AiConversationTurnResult,
  useAiConversation,
} from '../domain/ai/AiConversationContext';
import { spoonacularApi } from '../services/spoonacularApi';
import { mapAiFiltersToSearchParams } from '../services/ai/aiSearchAdapter';

type AiConversationResponse = AiConversationTurnResult & {
  followUpQuestions?: string[];
};

const FILTER_FIELDS: Array<{ key: keyof SearchQueryParams; label: string }> = [
  { key: 'cuisine', label: 'Cuisine' },
  { key: 'type', label: 'Meal Type' },
  { key: 'includeIngredients', label: 'Include Ingredients' },
  { key: 'excludeIngredients', label: 'Exclude Ingredients' },
  { key: 'maxReadyTime', label: 'Max Ready Time (min)' },
];

const AiPage = () => {
  const router = useRouter();
  const chatThreadRef = useRef<HTMLElement | null>(null);
  const { state, setInput, startSubmit, applyAssistantResponse, setError, finishSubmit } =
    useAiConversation();

  const { messages, input, possibleAnswers, filters, readyToSearch, errorMessage, isSubmitting } =
    state;

  const normalizedSearchFilters = useMemo(() => mapAiFiltersToSearchParams(filters), [filters]);
  const hasSearchFilters = Object.values(normalizedSearchFilters).some(Boolean);
  const searchKey =
    readyToSearch && hasSearchFilters
      ? (['ai-recipe-search', normalizedSearchFilters] as const)
      : null;

  const {
    data: searchResults = [],
    error: searchError,
    isLoading: isSearching,
    isValidating,
  } = useSWR(searchKey, ([, searchFilters]) => spoonacularApi.searchRecipes(searchFilters), {
    keepPreviousData: true,
    revalidateIfStale: false,
  });

  const isSearchBusy = isSearching || isValidating;

  const visibleFilterItems = useMemo(
    () => FILTER_FIELDS.filter(({ key }) => Boolean(filters[key])),
    [filters]
  );

  useEffect(() => {
    const threadElement = chatThreadRef.current;

    if (!threadElement) {
      return;
    }

    threadElement.scrollTo({
      top: threadElement.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages.length]);

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || isSubmitting) {
      return;
    }

    const trimmedMessage = userMessage.trim();
    const history = messages;

    startSubmit(trimmedMessage);

    try {
      const response = await fetch('/api/ai/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationHistory: history,
          latestUserMessage: trimmedMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response. Please try again.');
      }

      const responseJson: Partial<AiConversationResponse> = await response.json();

      applyAssistantResponse({
        assistantReply: responseJson.assistantReply ?? 'I could not generate a response.',
        possibleAnswers: responseJson.possibleAnswers ?? [],
        extractedFilters: responseJson.extractedFilters,
        isReadyToSearch: responseJson.isReadyToSearch ?? false,
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unexpected error.');
    } finally {
      finishSubmit();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendMessage(input);
  };

  return (
    <main className="recipe-main">
      <div className="search-container ai-chat-layout">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="btn btn-primary btn-small"
          aria-label="Go back to the home page"
        >
          ← Back to Home
        </button>

        <h2 className="search-title">AI Recipe Chat</h2>
        <p className="ai-chat-subtitle">
          Describe your craving, then refine details through follow-up prompts.
        </p>

        <section ref={chatThreadRef} className="ai-chat-thread" aria-live="polite">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`ai-message ai-message-${message.role}`}
              aria-label={`${message.role} message`}
            >
              <p className="ai-message-role">
                {message.role === 'assistant' ? 'Assistant' : 'You'}
              </p>
              <p>{message.content}</p>
            </div>
          ))}
        </section>

        {errorMessage && <ErrorMessage message={errorMessage} />}

        <form onSubmit={handleSubmit} className="ai-chat-input-row" aria-busy={isSubmitting}>
          <label htmlFor="ai-input" className="sr-only">
            Describe your recipe preferences
          </label>
          <input
            id="ai-input"
            type="text"
            className="form-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Example: I want a quick chicken dinner with no dairy"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className="btn btn-primary btn-medium"
            disabled={isSubmitting || input.trim().length === 0}
          >
            {isSubmitting ? 'Sending...' : 'Send'}
          </button>
        </form>

        {possibleAnswers.length > 0 && (
          <section aria-label="Possible answers">
            <h3 className="ai-panel-title">Possible Answers</h3>
            <div className="ai-chip-list">
              {possibleAnswers.map((answer, index) => (
                <button
                  type="button"
                  key={`${answer}-${index}`}
                  className="btn btn-secondary ai-chip"
                  onClick={() => setInput(answer)}
                >
                  {answer}
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="ai-filters-panel" aria-label="Interpreted filters">
          <div className="ai-filters-header">
            <h3 className="ai-panel-title">Interpreted Filters</h3>
            <span className={`ai-ready-pill ${readyToSearch ? 'is-ready' : 'not-ready'}`}>
              {readyToSearch ? 'Ready to search' : 'Needs more details'}
            </span>
          </div>

          {visibleFilterItems.length === 0 ? (
            <p className="form-helper-text">No filters interpreted yet.</p>
          ) : (
            <ul className="ai-filter-list">
              {visibleFilterItems.map(({ key, label }) => (
                <li key={key}>
                  <span>{label}:</span> {filters[key]}
                </li>
              ))}
            </ul>
          )}
        </section>

        {searchError && (
          <ErrorMessage
            message={
              searchError instanceof Error ? searchError.message : 'Failed to search recipes'
            }
          />
        )}

        <SearchResults results={searchResults} isLoading={isSearchBusy} />
      </div>
    </main>
  );
};

export default AiPage;
