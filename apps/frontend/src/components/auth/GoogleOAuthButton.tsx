import { getApiBaseUrl } from '../../lib/apiBase';

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 18 18" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M9 7.3v3.48h4.84c-.21 1.11-.84 2.05-1.79 2.68v2.23h2.9c1.7-1.56 2.68-3.86 2.68-6.6 0-.63-.05-1.25-.15-1.84H9z"
    />
    <path
      fill="#34A853"
      d="M4.08 10.71l-.64 2.41-2.2.05A8.98 8.98 0 0 1 0 9c0-1.45.35-2.82.97-4.02l1.96.36 1.92 4.39z"
    />
    <path
      fill="#4A90E2"
      d="M17.88 9c0 .6-.05 1.18-.15 1.74-.27 1.51-.99 2.87-2.03 3.93l-2.9-2.23c.56-.36.99-.9 1.22-1.7H9V7.3h8.72c.11.56.16 1.15.16 1.7z"
    />
    <path
      fill="#FBBC05"
      d="M9 2.12c.96 0 1.83.33 2.52.98l1.89-1.89A8.98 8.98 0 0 0 9 0C5.58 0 2.64 1.96 1.33 4.98l2.75 2.13C4.78 4.79 6.7 2.12 9 2.12z"
    />
  </svg>
);

const buildGoogleUrl = () => {
  const base = getApiBaseUrl();
  const suffix = '/api/auth/google';
  if (!base) {
    return suffix;
  }
  return `${base}${suffix}`;
};

const GoogleOAuthButton = ({ label = 'Sign in with Google' }: { label?: string }) => {
  const handleClick = () => {
    const url = buildGoogleUrl();
    window.location.assign(url);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex w-full items-center justify-center gap-3 rounded-full border border-white/20 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-wide text-black shadow hover:shadow-lg transition"
    >
      <GoogleIcon />
      <span className="text-sm font-semibold text-black">{label}</span>
    </button>
  );
};

export default GoogleOAuthButton;
