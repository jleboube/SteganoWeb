const ComingSoonPage = () => {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-10 shadow-xl">
        <h1 className="font-display text-4xl uppercase tracking-wide text-white">Packages Launching Soon</h1>
        <p className="mt-4 text-white/70">
          Stripe Checkout is wired, tested, and ready – we&apos;ve simply disabled live purchases for the MVP launch. Keep your eyes on
          the dashboard for the go-live toggle.
        </p>
        <p className="mt-2 text-xs uppercase tracking-[0.3em] text-white/40">
          MVP Focus: polish the core steganography experience before taking payments.
        </p>
      </div>
    </div>
  );
};

export default ComingSoonPage;
