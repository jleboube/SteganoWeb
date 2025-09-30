import api from './client';

export type ApiKey = {
  id: string;
  name: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastUsedAt: string | null;
  keyPrefix: string;
};

export const listApiKeys = async () => {
  const { data } = await api.get<{ apiKeys: ApiKey[] }>('/api/api-keys');
  return data.apiKeys;
};

export const createApiKey = async (payload: { name?: string }) => {
  const { data } = await api.post<{ secret: string; apiKey: ApiKey }>('/api/api-keys', payload);
  return data;
};

export const revokeApiKey = async (id: string) => {
  await api.delete(`/api/api-keys/${id}`);
};
