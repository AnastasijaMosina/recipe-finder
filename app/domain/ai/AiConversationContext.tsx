'use client';

import { createContext, useContext, useMemo, useReducer } from 'react';
import type { SearchQueryParams } from '../search/searchFiltersSchema';
import {
  DEFAULT_LANGUAGE,
  detectSupportedLanguage,
  type SupportedLanguage,
} from './conversationLanguage';

export type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type AiConversationTurnResult = {
  assistantReply: string;
  possibleAnswers: string[];
  extractedFilters?: SearchQueryParams;
  isReadyToSearch: boolean;
};

type AiConversationState = {
  messages: ConversationMessage[];
  input: string;
  possibleAnswers: string[];
  filters: SearchQueryParams;
  readyToSearch: boolean;
  errorMessage: string | null;
  isSubmitting: boolean;
  language: SupportedLanguage;
};

type AiConversationAction =
  | { type: 'set_input'; payload: string }
  | { type: 'set_language'; payload: SupportedLanguage }
  | { type: 'start_submit'; payload: { userMessage: string } }
  | { type: 'apply_assistant_response'; payload: AiConversationTurnResult }
  | { type: 'set_error'; payload: string }
  | { type: 'finish_submit' };

const initialState: AiConversationState = {
  messages: [
    {
      role: 'assistant',
      content:
        'Tell me what you are craving, and I will suggest possible answers until we can search.',
    },
  ],
  input: '',
  possibleAnswers: [],
  filters: {},
  readyToSearch: false,
  errorMessage: null,
  isSubmitting: false,
  language: DEFAULT_LANGUAGE,
};

const aiConversationReducer = (
  state: AiConversationState,
  action: AiConversationAction
): AiConversationState => {
  switch (action.type) {
    case 'set_input':
      return {
        ...state,
        input: action.payload,
      };

    case 'set_language':
      return {
        ...state,
        language: action.payload,
      };

    case 'start_submit':
      return {
        ...state,
        errorMessage: null,
        input: '',
        isSubmitting: true,
        possibleAnswers: [],
        messages: [...state.messages, { role: 'user', content: action.payload.userMessage }],
      };

    case 'apply_assistant_response':
      return {
        ...state,
        messages: [
          ...state.messages,
          { role: 'assistant', content: action.payload.assistantReply },
        ],
        possibleAnswers: action.payload.possibleAnswers,
        readyToSearch: action.payload.isReadyToSearch,
        filters: action.payload.extractedFilters ?? state.filters,
      };

    case 'set_error':
      return {
        ...state,
        errorMessage: action.payload,
      };

    case 'finish_submit':
      return {
        ...state,
        isSubmitting: false,
      };

    default:
      return state;
  }
};

type AiConversationContextType = {
  state: AiConversationState;
  setInput: (value: string) => void;
  setLanguage: (language: SupportedLanguage) => void;
  startSubmit: (userMessage: string) => void;
  applyAssistantResponse: (response: AiConversationTurnResult) => void;
  setError: (message: string) => void;
  finishSubmit: () => void;
};

const AiConversationContext = createContext<AiConversationContextType | undefined>(undefined);

export function AiConversationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(
    aiConversationReducer,
    undefined,
    (): AiConversationState => ({
      ...initialState,
      language:
        typeof navigator !== 'undefined'
          ? detectSupportedLanguage(navigator.language)
          : DEFAULT_LANGUAGE,
    })
  );

  const value = useMemo<AiConversationContextType>(
    () => ({
      state,
      setInput: (input) => dispatch({ type: 'set_input', payload: input }),
      setLanguage: (language) => dispatch({ type: 'set_language', payload: language }),
      startSubmit: (userMessage) => dispatch({ type: 'start_submit', payload: { userMessage } }),
      applyAssistantResponse: (response) =>
        dispatch({ type: 'apply_assistant_response', payload: response }),
      setError: (message) => dispatch({ type: 'set_error', payload: message }),
      finishSubmit: () => dispatch({ type: 'finish_submit' }),
    }),
    [state]
  );

  return <AiConversationContext.Provider value={value}>{children}</AiConversationContext.Provider>;
}

export function useAiConversation() {
  const context = useContext(AiConversationContext);
  if (!context) {
    throw new Error('useAiConversation must be used within AiConversationProvider');
  }

  return context;
}
