import { useState } from 'react';

interface ApiError {
  message: string;
  isAuthError: boolean;
}

export const useApiError = () => {
  const [error, setError] = useState<ApiError | null>(null);

  const handleApiError = (error: any) => {
    if (error.status === 401 || error.status === 403) {
      setError({
        message: 'Your session has expired. Please log in again.',
        isAuthError: true
      });
    } else {
      setError({
        message: error.message || 'An unexpected error occurred. Please try again.',
        isAuthError: false
      });
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    error,
    handleApiError,
    clearError
  };
};

export const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error: any = new Error('API request failed');
    error.status = response.status;
    try {
      const data = await response.json();
      error.message = data.message || response.statusText;
    } catch {
      error.message = response.statusText;
    }
    throw error;
  }
  return response.json();
}; 