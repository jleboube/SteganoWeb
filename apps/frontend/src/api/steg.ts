import api from './client';

type EncodeResponse = {
  mimeType: string;
  data: string;
  metadata: {
    usedFreeCredit: boolean;
    nanoBananaApplied: boolean;
  };
};

export const encodeImage = async (payload: {
  image: File;
  message: string;
  mode: 'ALGORITHM' | 'AI';
  prompt?: string;
}) => {
  const formData = new FormData();
  formData.append('image', payload.image);
  formData.append('message', payload.message);
  formData.append('mode', payload.mode);
  if (payload.prompt) {
    formData.append('prompt', payload.prompt);
  }

  const { data } = await api.post<EncodeResponse>('/api/steg/encode', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  const byteCharacters = atob(data.data);
  const byteNumbers = new Array(byteCharacters.length).fill(null).map((_, i) => byteCharacters.charCodeAt(i));
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: data.mimeType });
};

export const decodeImage = async (payload: { image: File; mode: 'ALGORITHM' | 'AI' }) => {
  const formData = new FormData();
  formData.append('image', payload.image);
  formData.append('mode', payload.mode);
  const { data } = await api.post<{ message: string; metadata?: { method?: string; usedFreeCredit?: boolean } }>(
    '/api/steg/decode',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
  );
  return data;
};
