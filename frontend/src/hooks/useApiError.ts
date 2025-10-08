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
    let errorMessage = 'An error occurred';
    let errorData: any = null;
    
    try {
      errorData = await response.json();
      errorMessage = errorData?.message || errorData?.detail || response.statusText;
    } catch {
      errorMessage = response.statusText || 'An error occurred';
    }
    
    const error = new Error(errorMessage);
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }
  return response.json();
}; 