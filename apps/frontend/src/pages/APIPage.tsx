import { Link } from 'react-router-dom';

const APIPage = () => {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 space-y-10">
      <header className="space-y-3 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-accent">SteganoWeb API</p>
        <h1 className="font-display text-4xl uppercase tracking-wide text-white">Programmatic Access</h1>
        <p className="text-white/70">
          Use API keys to automate image encoding and verification, integrate with browser extensions, or plug steganography into
          your existing pipelines.
        </p>
      </header>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
        <h2 className="font-display text-2xl uppercase tracking-wide text-white">Authentication</h2>
        <p className="mt-3 text-sm text-white/70">
          Generate API keys from your <span className="text-white">Dashboard → API Access</span>. Send the key in the
          <code className="ml-2 rounded bg-black/60 px-2 py-1 text-xs">X-API-Key</code> header (or `Authorization: Bearer`)
          with every request. Keys inherit your credit balance and daily free edit. Rotate keys anytime from the dashboard.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-2xl bg-black/70 p-4 text-xs text-white/80">
{`X-API-Key: sk_live_abcd1234...`}
        </pre>
      </section>

      <section className="rounded-3xl border border-white/10 bg-black/50 p-6 shadow-xl">
        <h2 className="font-display text-2xl uppercase tracking-wide text-white">Endpoints</h2>
        <div className="mt-4 space-y-6 text-sm text-white/70">
          <div>
            <p className="font-semibold text-white">POST /api/public/steg/encode</p>
            <p>Embed a hidden message into an image. Provide the original image as a base64 string (JPEG or PNG).</p>
            <pre className="mt-3 overflow-x-auto rounded-2xl bg-white/10 p-4 text-xs text-white/90">
{`{
  "imageBase64": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "message": "Trust no one.",
  "useNanoBanana": false
}`}
            </pre>
            <p className="mt-2">Response:</p>
            <pre className="mt-2 overflow-x-auto rounded-2xl bg-white/10 p-4 text-xs text-white/90">
{`{
  "mimeType": "image/png",
  "data": "iVBORw0KGgoAAAANS...",
  "metadata": {
    "usedFreeCredit": false,
    "nanoBananaApplied": false
  }
}`}
            </pre>
          </div>

          <div>
            <p className="font-semibold text-white">POST /api/public/steg/decode</p>
            <p>Extract a hidden message from a steganographic image.</p>
            <pre className="mt-3 overflow-x-auto rounded-2xl bg-white/10 p-4 text-xs text-white/90">
{`{
  "imageBase64": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}`}
            </pre>
            <p className="mt-2">Response:</p>
            <pre className="mt-2 overflow-x-auto rounded-2xl bg-white/10 p-4 text-xs text-white/90">
{`{
  "message": "Trust no one."
}`}
            </pre>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-accent/30 bg-white/5 p-6 shadow-xl">
        <h2 className="font-display text-2xl uppercase tracking-wide text-white">Usage Notes</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-sm text-white/70">
          <li>Images must be PNG or JPEG and ≤ 5MB after base64 decoding.</li>
          <li>Messages allow up to 1,000 characters. Sanitization strips control characters.</li>
          <li>Every successful encode consumes one credit. Daily free edits are applied automatically.</li>
          <li>Failed requests do not consume credits.</li>
          <li>Rotate and revoke keys from the dashboard. Revoked keys stop working immediately.</li>
        </ul>
      </section>

      <section className="rounded-3xl border border-white/10 bg-black/50 p-6 shadow-xl">
        <h2 className="font-display text-2xl uppercase tracking-wide text-white">Example: Chrome Extension</h2>
        <p className="mt-3 text-sm text-white/70">
          Use the decode endpoint to scan images on any page. Fetch the image, convert it to base64, and send it to the API using
          your SteganoWeb key. Combine this with the browser's content scripts to flag hidden messages in real time.
        </p>
      </section>
    </div>
  );
};

export default APIPage;
