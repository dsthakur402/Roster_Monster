import { getValidToken } from './auth';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export const fetchWithAuth = async (url: string, options: FetchOptions = {}): Promise<Response> => {
  const { skipAuth = false, headers: originalHeaders = {}, ...rest } = options;
  
  // Create a new headers object
  const headers = new Headers(originalHeaders);

  if (!skipAuth) {
    const token = await getValidToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...rest,
    headers
  });

  return response;
}; 