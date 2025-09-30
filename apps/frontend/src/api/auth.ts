import api from './client';

export type AuthUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  emailVerified: boolean;
  credits: number;
  freeEditsUsedAt: string | null;
  createdAt: string;
};

export const register = async (payload: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) => {
  const { data } = await api.post<{ user: AuthUser }>('/api/auth/register', payload);
  return data.user;
};

export const login = async (payload: { email: string; password: string }) => {
  const { data } = await api.post<{ user: AuthUser }>('/api/auth/login', payload);
  return data.user;
};

export const logout = async () => {
  await api.post('/api/auth/logout');
};

export const fetchCurrentUser = async () => {
  const { data } = await api.get<{ user: AuthUser }>('/api/auth/me');
  return data.user;
};

export const requestPasswordReset = async (email: string) => {
  await api.post('/api/auth/request-password-reset', { email });
};

export const resetPassword = async (token: string, password: string) => {
  await api.post('/api/auth/reset-password', { token, password });
};

export const verifyEmail = async (token: string) => {
  await api.post('/api/auth/verify-email', { token });
};
