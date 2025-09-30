const normalizeBaseUrl = (input?: string) => {
  if (!input) {
    return '';
  }
  return input.endsWith('/') ? input.slice(0, -1) : input;
};

const isLocalhost = (hostname: string) =>
  hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';

export const getApiBaseUrl = () => {
  const configured = normalizeBaseUrl(import.meta.env.VITE_API_URL as string | undefined);

  if (typeof window === 'undefined') {
    return configured || 'http://localhost:4000';
  }

  const currentOrigin = normalizeBaseUrl(window.location.origin);

  if (!configured) {
    return currentOrigin;
  }

  try {
    const configuredHost = new URL(configured).hostname;
    if (!isLocalhost(window.location.hostname) && isLocalhost(configuredHost)) {
      return currentOrigin;
    }
  } catch (_error) {
    return currentOrigin;
  }

  return configured;
};
