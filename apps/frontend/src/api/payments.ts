import api from './client';

export const startCheckout = async (packageType: 'PACK_25' | 'PACK_50' | 'PACK_100') => {
  const { data } = await api.post<{ url: string }>('/api/payments/checkout', { packageType });
  return data.url;
};
