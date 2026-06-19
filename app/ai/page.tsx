'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ErrorMessage from '../components/ErrorMessage';
import type { SearchQueryParams } from '../domain/search/searchFiltersSchema';

type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type AiConversationResponse = {
  assistantReply: string;
  followUpQuestions: string[];
  possibleAnswers: string[];
  extractedFilters?: SearchQueryParams;
  isReadyToSearch: boolean;
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
  const [messages, setMessages] = useState<ConversationMessage[]>([
    {
      role: 'assistant',
      content:
        'Tell me what you are craving, and I will ask follow-up questions until we can search.',
    },
  ]);
  const [input, setInput] = useState('');
  const [possibleAnswers, setPossibleAnswers] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchQueryParams>({});
  const [readyToSearch, setReadyToSearch] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const visibleFilterItems = useMemo(
    () => FILTER_FIELDS.filter(({ key }) => Boolean(filters[key])),
    [filters]
  );

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || isSubmitting) {
      return;
    }

    setErrorMessage(null);

    const trimmedMessage = userMessage.trim();
    const history = messages;

    setMessages((prev) => [...prev, { role: 'user', content: trimmedMessage }]);
    setInput('');
    setIsSubmitting(true);

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

      const data: AiConversationResponse = await response.json();

      setMessages((prev) => [...prev, { role: 'assistant', content: data.assistantReply }]);
      setPossibleAnswers(data.possibleAnswers);
      setReadyToSearch(data.isReadyToSearch);
      setFilters(data.extractedFilters ?? {});
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unexpected error.');
    } finally {
      setIsSubmitting(false);
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

        <section className="ai-chat-thread" aria-live="polite">
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
      </div>
    </main>
  );
};

export default AiPage;
