import { useState } from 'react';

interface ApiError {
  message: string;
  isAuthError: boolean;
}

export const useApiError = () => {
  const [error, setError] = useState<ApiError | null>(null);

  const handleApiError = (error: unknown) => {
    if (error instanceof Error) {
      setError({
        message: error.message,
        isAuthError: error.message === 'Authentication required'
      });
    } else {
      setError({
        message: 'An unexpected error occurred',
        isAuthError: false
      });
    }
  };

  const clearError = () => setError(null);

  return { error, handleApiError, clearError };
};

export const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || 'An error occurred');
  }
  return response.json();
}; 