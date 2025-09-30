import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchDashboardSummary } from '../api/dashboard';
import { createApiKey, listApiKeys, revokeApiKey } from '../api/apiKeys';
import { useState } from 'react';

const DashboardPage = () => {
  const queryClient = useQueryClient();
  const [generatedSecret, setGeneratedSecret] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: fetchDashboardSummary
  });

  const {
    data: apiKeys,
    isLoading: isLoadingKeys
  } = useQuery({
    queryKey: ['api-keys'],
    queryFn: listApiKeys
  });

  const createKeyMutation = useMutation({
    mutationFn: createApiKey,
    onSuccess: ({ secret }) => {
      setGeneratedSecret(secret);
      void queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    }
  });

  const revokeKeyMutation = useMutation({
    mutationFn: revokeApiKey,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-primary"></div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto mt-20 max-w-xl rounded-3xl border border-red-400/40 bg-red-500/10 p-10 text-center">
        <h2 className="font-display text-3xl uppercase tracking-wide text-white">Something went wrong</h2>
        <p className="mt-2 text-sm text-white/60">We couldn&apos;t load your dashboard. Try again shortly.</p>
      </div>
    );
  }

  const { user, purchases, usage } = data;
  const encodeCount = usage.ENCODE ?? 0;
  const decodeCount = usage.DECODE ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-8 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-black/50 p-6 shadow-xl md:col-span-2">
          <h2 className="font-display text-2xl uppercase tracking-wide text-white">Mission Control</h2>
          <p className="mt-2 text-white/60">Welcome back, agent. Your steganography stats await.</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-accent/30 bg-accent/10 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-accent/70">Remaining Credits</p>
              <p className="mt-2 text-3xl font-bold text-accent">{user.credits}</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Daily Free Edit</p>
              <p className="mt-2 text-xl font-semibold text-white">
                {user.freeEditAvailable ? 'Available now' : 'Cooling down'}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Embeds Performed</p>
              <p className="mt-2 text-xl font-semibold text-white">{encodeCount}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Decodes Performed</p>
              <p className="mt-2 text-xl font-semibold text-white">{decodeCount}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/steganography"
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-black transition hover:scale-105"
            >
              Launch Steganography Suite
            </Link>
            <span className="rounded-full border border-white/20 px-4 py-3 text-xs uppercase tracking-[0.3em] text-white/40">
              Payments coming soon – packages are wired but switched off for MVP
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
            <h3 className="font-display text-xl uppercase tracking-wide text-white">Account Overview</h3>
            <dl className="mt-4 space-y-2 text-sm text-white/60">
              <div className="flex justify-between">
                <dt>Email</dt>
                <dd className="text-white">{user.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Status</dt>
                <dd className="text-white">{user.emailVerified ? 'Verified' : 'Pending verification'}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Joined</dt>
                <dd className="text-white">{new Date(user.createdAt).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
            <h3 className="font-display text-xl uppercase tracking-wide text-white">Purchase History</h3>
            {purchases.length === 0 ? (
              <p className="mt-4 text-sm text-white/60">
                No purchases yet. Stripe Checkout is wired up and ready once we flip the production switch.
              </p>
            ) : (
              <ul className="mt-4 space-y-3 text-sm text-white/70">
                {purchases.map((purchase) => (
                  <li key={purchase.id} className="flex justify-between">
                    <span>{purchase.packageType.replace('PACK_', '')} credits</span>
                    <span>
                      ${(purchase.amountCents / 100).toFixed(2)} · {purchase.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-3xl border border-accent/30 bg-black/50 p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl uppercase tracking-wide text-white">API Access</h3>
              <button
                onClick={() => {
                  const name = window.prompt('Label this API key (optional)', 'Chrome Extension');
                  if (createKeyMutation.status === 'pending') return;
                  createKeyMutation.mutate({ name: name ?? undefined });
                }}
                className="rounded-full bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-wide text-black transition hover:scale-105"
              >
                Generate Key
              </button>
            </div>
            <p className="mt-2 text-sm text-white/60">
              Use API keys to access the SteganoWeb encode/decode endpoints programmatically. Keys inherit your credit balance and
              enforce the same daily limits. Refer to the <Link to="/api" className="text-accent underline">API Docs</Link> for
              full details.
            </p>

            {generatedSecret && (
              <div className="mt-4 rounded-2xl border border-accent/40 bg-white/5 p-4 text-left">
                <p className="text-xs uppercase tracking-[0.3em] text-accent/70">New API Key</p>
                <p className="mt-2 text-sm text-white/80">
                  Copy this value now — it will not be shown again.
                </p>
                <textarea
                  readOnly
                  value={generatedSecret}
                  className="mt-3 w-full rounded-xl border border-white/20 bg-black/60 p-3 text-xs text-white"
                  rows={3}
                />
              </div>
            )}

            <div className="mt-6 space-y-3">
              {isLoadingKeys ? (
                <p className="text-sm text-white/60">Loading API keys…</p>
              ) : apiKeys && apiKeys.length > 0 ? (
                apiKeys.map((key) => (
                  <div key={key.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">{key.name ?? 'Unnamed Key'}</p>
                        <p className="text-xs text-white/40">Prefix: {key.keyPrefix}</p>
                      </div>
                      <button
                        disabled={revokeKeyMutation.status === 'pending'}
                        onClick={() => revokeKeyMutation.mutate(key.id)}
                        className="rounded-full border border-red-400/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-300 transition hover:bg-red-400/10 disabled:opacity-60"
                      >
                        Revoke
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-white/50">
                      <span>Created {new Date(key.createdAt).toLocaleString()}</span>
                      {key.lastUsedAt && <span>Last used {new Date(key.lastUsedAt).toLocaleString()}</span>}
                      <span>Status: {key.isActive ? 'Active' : 'Revoked'}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/60">No API keys yet. Generate one to get started.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
