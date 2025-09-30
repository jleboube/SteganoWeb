import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCta = () => {
    if (!user) {
      navigate('/register');
      return;
    }
    navigate('/steganography');
  };

  return (
    <div className="overflow-hidden">
      <section className="relative flex flex-col items-center justify-center px-6 pt-24 pb-32 text-center">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-4xl space-y-6"
        >
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-accent">
            SteganoWeb · Hide Your Words In Plain Sight
          </p>
          <h1 className="font-display text-5xl uppercase tracking-wide text-white drop-shadow-xl md:text-6xl">
            Unlock the Hidden: SteganoWeb – Hide Messages in Plain Sight!
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/70">
            Slip secrets into selfies, watermark your masterpieces, or smuggle jokes into memes. SteganoWeb wraps your words in
            pixels while keeping things fast, intuitive, and downright electrifying.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={handleCta}
              className="rounded-full bg-accent px-8 py-4 text-sm font-semibold uppercase tracking-wide text-black shadow-[0_0_40px_-12px_rgba(0,245,160,0.85)] transition hover:scale-105"
            >
              Steganography My Image
            </button>
            <p className="text-sm uppercase tracking-[0.3em] text-white/50">
              One Steganography edit is free, sign up for more.
            </p>
          </div>
        </motion.div>
      </section>

      <section id="honest" className="border-t border-white/5 bg-white/5 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl uppercase tracking-wide text-accent">Honest Reasons to Hide In Plain Sight</h2>
            <p className="mt-4 text-white/70">
              SteganoWeb keeps your noble missions safe. Whether you&apos;re training the next generation of digital sleuths or
              protecting vulnerable sources, we&apos;ve got you.
            </p>
          </div>
          <div className="space-y-6">
            {[{
              title: 'Educational',
              description: 'Teach cryptography, watermark digital art, and explore digital forensics hands-on.'
            },
            {
              title: 'Secure Communication',
              description: 'Journalists and sources embed context within images for safer sharing in hostile environments.'
            },
            {
              title: 'Fun & Family',
              description: 'Hide Easter eggs in memes, build puzzle hunts, or stash heartwarming notes in photo albums.'
            }].map((item) => (
              <div key={item.title} className="rounded-3xl border border-accent/30 bg-black/40 p-6 shadow-xl">
                <h3 className="font-display text-xl uppercase tracking-wide text-white">{item.title}</h3>
                <p className="mt-2 text-white/60">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="nefarious" className="border-t border-white/5 bg-black/50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl uppercase tracking-wide text-primary">Nefarious Shenanigans (With a Wink)</h2>
            <p className="mt-4 text-white/60">
              Not that we&apos;re condoning anything, but we know you&apos;ll find creative ways to hide your mischief.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[{
              title: 'Sneaky Messaging',
              description: 'Slide past censors and filters like a digital ninja (you didn’t hear it from us).'
            },
            {
              title: 'Pranks',
              description: 'Slip inside jokes into the group chat images and watch confusion unfold.'
            },
            {
              title: 'Evasion',
              description: 'Keep nosey scrollers guessing by burying secrets in their feed.'
            }].map((item) => (
              <motion.div
                key={item.title}
                whileHover={{ scale: 1.03 }}
                className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-lg"
              >
                <h3 className="font-display text-xl uppercase tracking-wide text-white">{item.title}</h3>
                <p className="mt-2 text-white/60">{item.description}</p>
              </motion.div>
            ))}
          </div>
          <p className="mt-8 text-center text-xs uppercase tracking-[0.35em] text-red-300/70">
            SteganoWeb promotes ethical use; misuse is at your own risk and may violate laws.
          </p>
        </div>
      </section>

      <section id="how-it-works" className="border-t border-white/5 bg-white/5 py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-2">
          <div className="space-y-6">
            <h2 className="font-display text-3xl uppercase tracking-wide text-accent">How SteganoWeb Works</h2>
            <ol className="space-y-4 text-left text-white/70">
              <li>
                <span className="font-semibold text-accent">1.</span> Upload a JPEG or PNG up to 5MB.
              </li>
              <li>
                <span className="font-semibold text-accent">2.</span> Type up to 1000 characters of hidden brilliance.
              </li>
              <li>
                <span className="font-semibold text-accent">3.</span> Download your stealthy image and share it anywhere.
              </li>
              <li>
                <span className="font-semibold text-accent">4.</span> Need to confirm? Upload the image to extract its hidden text instantly.
              </li>
            </ol>
            <p className="text-sm text-white/50">
              Optional: flip on our tongue-in-cheek "Nano Banana" AI enhancer for extra flair when it launches.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/50 p-8 shadow-2xl">
            <h3 className="font-display text-xl uppercase tracking-wide text-white">Why Choose SteganoWeb?</h3>
            <ul className="mt-6 space-y-4 text-white/70">
              <li>⚡ Lightning-fast embedding and verification.</li>
              <li>🛡️ Server-side processing with sandbox isolation.</li>
              <li>🔐 Rate-limited, secure, and privacy-minded.</li>
              <li>🎨 Neon-charged interface that feels like a secret club.</li>
            </ul>
            <button
              onClick={handleCta}
              className="mt-8 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-[0_0_50px_-15px_rgba(138,43,226,0.9)] transition hover:scale-105"
            >
              Start Hiding Messages
            </button>
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 bg-black/50 py-20">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl space-y-3">
            <h2 className="font-display text-3xl uppercase tracking-wide text-primary">Need an API?</h2>
            <p className="text-white/70">
              Generate API keys from your dashboard and call our encode/decode endpoints from extensions, automations, or your own
              services. Every request respects your credit balance and daily free edit.
            </p>
          </div>
          <Link
            to="/api"
            className="rounded-full bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-black transition hover:scale-105"
          >
            Read the API Docs
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
