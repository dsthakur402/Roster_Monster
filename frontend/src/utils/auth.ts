import { User } from '../types/user';

const TOKEN_KEY = 'authToken';
const USER_KEY = 'user';

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
};

export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

export const setUser = (user: User): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const removeUser = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_KEY);
};

export const clearAuth = (): void => {
  removeToken();
  removeUser();
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const getValidToken = async (): Promise<string | null> => {
  const token = getToken();
  if (!token) return null;

  // Here you could add token validation logic
  // For example, checking expiration or making a validation request
  return token;
};
