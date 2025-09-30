import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../api/auth';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>(token ? 'verifying' : 'idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!token) {
        return;
      }
      try {
        setStatus('verifying');
        await verifyEmail(token);
        setStatus('success');
      } catch (err: any) {
        setError(err.response?.data?.error ?? 'Unable to verify email.');
        setStatus('error');
      }
    };
    void run();
  }, [token]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="rounded-3xl border border-accent/30 bg-white/5 p-10 shadow-xl">
        <h1 className="font-display text-4xl uppercase tracking-wide text-white">Verify Your Email</h1>
        {email && <p className="mt-2 text-white/70">We sent a verification link to <strong>{email}</strong>.</p>}

        {status === 'idle' && (
          <p className="mt-4 text-sm text-white/60">
            Click the link in your inbox to verify. Keep this tab open – it&apos;ll update once you&apos;re confirmed.
          </p>
        )}

        {status === 'verifying' && (
          <p className="mt-4 text-sm text-accent">Confirming your identity… hang tight.</p>
        )}

        {status === 'success' && (
          <div className="mt-6 space-y-4">
            <p className="text-lg text-accent">Email verified! Steganography powers unlocked.</p>
            <a
              href="/steganography"
              className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-black transition hover:scale-105"
            >
              Start Hiding Messages
            </a>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-red-300">{error}</p>
            <p className="text-xs text-white/40">Request a new link from your dashboard or contact support.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
