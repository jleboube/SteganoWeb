import api from './client';

export const fetchDashboardSummary = async () => {
  const { data } = await api.get<{
    user: {
      id: string;
      email: string;
      credits: number;
      emailVerified: boolean;
      freeEditAvailable: boolean;
      createdAt: string;
    };
    purchases: Array<{
      id: string;
      packageType: 'PACK_25' | 'PACK_50' | 'PACK_100';
      creditsPurchased: number;
      amountCents: number;
      currency: string;
      status: 'PENDING' | 'COMPLETED' | 'CANCELED' | 'DISABLED';
      createdAt: string;
    }>;
    usage: Record<string, number>;
  }>("/api/dashboard/summary");

  return data;
};
