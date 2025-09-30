import { Link } from 'react-router-dom';

const EmailVerificationGate = ({ email }: { email: string }) => {
  return (
    <div className="mx-auto flex h-[60vh] w-full max-w-xl flex-col items-center justify-center gap-6 rounded-3xl border border-accent/40 bg-white/5 p-10 text-center shadow-lg">
      <h2 className="font-display text-3xl uppercase tracking-wide text-accent">Verify Your Email</h2>
      <p className="text-white/70">
        We sent a verification link to <span className="text-white font-semibold">{email}</span>. Click the link to unlock
        steganography features.
      </p>
      <p className="text-xs text-white/40">
        Didn&apos;t get it? Check your spam folder or request a new link from your dashboard.
      </p>
      <Link
        to="/dashboard"
        className="rounded-full bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-black transition hover:scale-105"
      >
        Back to Dashboard
      </Link>
    </div>
  );
};

export default EmailVerificationGate;
