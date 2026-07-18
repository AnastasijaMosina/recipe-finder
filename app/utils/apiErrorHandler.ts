import { NextResponse } from 'next/server';

export interface ApiErrorResponse {
  error: string;
  code?: string;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public userMessage: string,
    public internalMessage?: string
  ) {
    super(userMessage);
    this.name = 'ApiError';
  }
}

/**
 * Maps Spoonacular API errors to user-friendly messages
 */
export function mapSpoonacularError(statusCode: number): ApiError {
  switch (statusCode) {
    case 401:
    case 403:
      return new ApiError(401, 'API credentials are invalid. Please check your configuration.');

    case 402:
      return new ApiError(429, 'API quota exceeded. Please try again later or upgrade your plan.');

    case 404:
      return new ApiError(404, 'Recipe not found. Please try a different search.');

    case 429:
      return new ApiError(429, 'Too many requests. Please wait a moment and try again.');

    case 500:
    case 502:
    case 503:
      return new ApiError(
        503,
        'Recipe service is temporarily unavailable. Please try again later.'
      );

    case 504:
      return new ApiError(504, 'Recipe service request timed out. Please try again.');

    default:
      return new ApiError(
        statusCode,
        'An error occurred while fetching recipes. Please try again.'
      );
  }
}

/**
 * Returns a standardized error response
 */
export function errorResponse(error: ApiError | Error | unknown): NextResponse<ApiErrorResponse> {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.userMessage, code: error.name },
      { status: error.statusCode }
    );
  }

  return NextResponse.json(
    { error: 'An unexpected error occurred. Please try again later.' },
    { status: 500 }
  );
}
