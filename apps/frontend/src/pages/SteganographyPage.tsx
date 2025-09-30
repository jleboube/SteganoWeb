import { useEffect, useMemo, useState } from 'react';
import { useController, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { encodeImage, decodeImage } from '../api/steg';

const encodeFileSchema = z
  .any()
  .refine((value): value is File => value instanceof File, 'Image is required')
  .refine((file) => file.size <= 15 * 1024 * 1024, 'Max 15MB');

const decodeFileSchema = z
  .any()
  .refine((value): value is File => value instanceof File, 'Image is required')
  .refine((file) => file.size <= 25 * 1024 * 1024, 'Max 25MB');

const messageSchema = z.string().min(1, 'Message is required').max(1000, 'Max 1000 characters');

const encodeSchema = z.object({
  image: encodeFileSchema,
  message: messageSchema
});

const decodeSchema = z.object({
  image: decodeFileSchema
});

type EncodeForm = z.infer<typeof encodeSchema>;
type DecodeForm = z.infer<typeof decodeSchema>;
type ActionType = 'ENCODE' | 'DECODE';
type ModeType = 'ALGORITHM' | 'AI';

const ACTION_COPY: Record<ActionType, { title: string; description: string }> = {
  ENCODE: {
    title: 'Encode Message in Photo',
    description: 'Hide secret text within an image using either our algorithm or Gemini-powered AI.'
  },
  DECODE: {
    title: 'Decode Message from Photo',
    description: 'Reveal hidden text from any image using deterministic extraction or our AI assistant.'
  }
};

const MODE_COPY: Record<ModeType, { title: string; subtitle: string; body: string }> = {
  ALGORITHM: {
    title: 'Use Our Algorithm',
    subtitle: 'SteganoWeb LSB Encoder',
    body: 'Pure pixel-based steganography. Perfect for deterministic testing. Free allowance: 15 encodes and 15 decodes per day.'
  },
  AI: {
    title: 'Use AI',
    subtitle: 'Gemini 2.5 Enhancement',
    body: 'Let Google Gemini enhance and analyse images. Free allowance: 1 encode and 1 decode per day; credits apply beyond that.'
  }
};

const ModeBadge = ({ mode }: { mode: ModeType }) => (
  <span className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/60">
    {mode === 'AI' ? 'AI FLOW' : 'ALGORITHM FLOW'}
  </span>
);

const InfoBanner = ({ action, mode }: { action: ActionType; mode: ModeType }) => {
  const description = useMemo(() => {
    if (mode === 'ALGORITHM') {
      return action === 'ENCODE'
        ? 'Limit: 15 encodes per day (free). Paid credits unlock additional operations.'
        : 'Limit: 15 decodes per day (free). Paid credits unlock additional operations.';
    }
    return action === 'ENCODE'
      ? 'Limit: 1 AI encode per day (free). Additional AI encodes consume credits.'
      : 'Limit: 1 AI decode per day (free). Additional AI decodes consume credits.';
  }, [action, mode]);

  return (
    <div className="rounded-3xl border border-accent/40 bg-black/40 p-4 text-sm text-white/70 shadow">
      <ModeBadge mode={mode} />
      <p className="mt-2 text-white/70">{description}</p>
    </div>
  );
};

const SteganographyPage = () => {
  const queryClient = useQueryClient();
  const [action, setAction] = useState<ActionType | null>(null);
  const [mode, setMode] = useState<ModeType | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [decodeResult, setDecodeResult] = useState<{ message: string; method?: string } | null>(null);

  const {
    control: encodeControl,
    handleSubmit: handleEncodeSubmit,
    formState: { errors: encodeErrors, isSubmitting: isEncoding },
    reset: resetEncode
  } = useForm<EncodeForm>({
    resolver: zodResolver(encodeSchema)
  });

  const {
    control: decodeControl,
    handleSubmit: handleDecodeSubmit,
    formState: { errors: decodeErrors, isSubmitting: isDecoding },
    reset: resetDecode
  } = useForm<DecodeForm>({
    resolver: zodResolver(decodeSchema)
  });

  const {
    field: encodeImageField,
    fieldState: encodeImageFieldState
  } = useController({ name: 'image', control: encodeControl });
  const { field: encodeMessageField } = useController({ name: 'message', control: encodeControl });

  const {
    field: decodeImageField,
    fieldState: decodeImageFieldState
  } = useController({ name: 'image', control: decodeControl });

  const encodeMutation = useMutation({
    mutationFn: encodeImage,
    onSuccess: (blob) => {
      setDecodeResult(null);
      setDownloadUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return URL.createObjectURL(blob);
      });
      // Refresh dashboard data to update encode count
      void queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
    }
  });

  const decodeMutation = useMutation({
    mutationFn: decodeImage,
    onSuccess: (data) => {
      setDownloadUrl(null);
      setDecodeResult({ message: data.message, method: data.metadata?.method });
      // Refresh dashboard data to update decode count
      void queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
    }
  });

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const onEncodeSubmit = async (values: EncodeForm) => {
    if (!mode) return;

    encodeMutation.reset();
    setDownloadUrl(null); // Clear previous result before new encode
    await encodeMutation.mutateAsync({
      image: values.image,
      message: values.message,
      mode
    });
    resetEncode({ message: '' });
  };

  const onDecodeSubmit = async (values: DecodeForm) => {
    if (!mode) return;

    decodeMutation.reset();
    setDecodeResult(null); // Clear previous result before new decode
    await decodeMutation.mutateAsync({
      image: values.image,
      mode
    });
    resetDecode();
  };

  const handleBack = () => {
    if (decodeMutation.isPending || encodeMutation.isPending) {
      return;
    }
    if (mode) {
      setMode(null);
      setDecodeResult(null);
      setDownloadUrl(null);
      resetEncode({ message: '' });
      resetDecode();
      return;
    }
    if (action) {
      setAction(null);
      setDecodeResult(null);
      setDownloadUrl(null);
    }
  };

  const renderActionChooser = () => (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-center font-display text-4xl uppercase tracking-wide text-white">Steganography Suite</h1>
      <p className="mt-3 text-center text-white/70">
        Choose whether you&apos;re embedding a message or extracting one. We support pure LSB steganography and an AI-assisted flow.
      </p>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {(Object.keys(ACTION_COPY) as ActionType[]).map((act) => (
          <button
            key={act}
            onClick={() => setAction(act)}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 text-left shadow transition hover:border-accent hover:shadow-accent/30"
          >
            <h2 className="font-display text-2xl uppercase tracking-wide text-white">{ACTION_COPY[act].title}</h2>
            <p className="mt-2 text-sm text-white/70">{ACTION_COPY[act].description}</p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderModeChooser = () => (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <button onClick={handleBack} className="mb-6 text-sm uppercase tracking-wide text-white/50 hover:text-white">
        ← Choose Different Action
      </button>
      <h2 className="text-center font-display text-3xl uppercase tracking-wide text-white">
        How would you like to {action === 'ENCODE' ? 'encode' : 'decode'}?
      </h2>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {(Object.keys(MODE_COPY) as ModeType[]).map((choice) => (
          <button
            key={choice}
            onClick={() => setMode(choice)}
            className="rounded-3xl border border-white/10 bg-black/40 p-6 text-left shadow transition hover:border-accent hover:shadow-accent/30"
          >
            <h3 className="font-display text-xl uppercase tracking-wide text-white">{MODE_COPY[choice].title}</h3>
            <p className="text-xs uppercase tracking-[0.3em] text-accent/80">{MODE_COPY[choice].subtitle}</p>
            <p className="mt-3 text-sm text-white/70">{MODE_COPY[choice].body}</p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderEncodeForm = () => (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <button onClick={handleBack} className="mb-6 text-sm uppercase tracking-wide text-white/50 hover:text-white">
        ← Change Flow
      </button>
      <ModeBadge mode={mode!} />
      <h1 className="mt-3 font-display text-4xl uppercase tracking-wide text-white">Embed Message</h1>
      <p className="mt-2 text-white/70">
        Upload an image, type a hidden message, and download a steganographic PNG ready to share.
      </p>
      <InfoBanner action="ENCODE" mode={mode!} />

      <form
        onSubmit={handleEncodeSubmit(onEncodeSubmit)}
        className="mt-8 space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl"
      >
        <div>
          <label className="block text-sm font-semibold uppercase tracking-wide text-white/60">Select image</label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:outline-none"
            name={encodeImageField.name}
            ref={encodeImageField.ref}
            onBlur={encodeImageField.onBlur}
           onChange={(event) => {
              const file = (event.target as HTMLInputElement).files?.[0] ?? null;
              encodeImageField.onChange(file);
            }}
          />
          {encodeImageFieldState.error && (
            <p className="mt-1 text-xs text-red-300">{encodeImageFieldState.error.message}</p>
          )}
          <p className="mt-2 text-xs text-white/40">JPEG, PNG, WebP, or SVG up to 15MB. Output is always PNG to preserve the hidden payload.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold uppercase tracking-wide text-white/60">Hidden message</label>
          <textarea
            rows={6}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-accent focus:outline-none"
            placeholder="Type up to 1000 characters..."
            name={encodeMessageField.name}
            ref={encodeMessageField.ref}
            onBlur={encodeMessageField.onBlur}
            onChange={encodeMessageField.onChange}
            value={encodeMessageField.value ?? ''}
          />
          {encodeErrors.message && <p className="mt-1 text-xs text-red-300">{encodeErrors.message.message}</p>}
        </div>

        {encodeMutation.isError && (
          <p className="rounded-xl bg-red-400/10 p-3 text-sm text-red-300">
            {(encodeMutation.error as any)?.response?.data?.error ?? 'Unable to encode image. Try again.'}
          </p>
        )}
        <button
          type="submit"
          disabled={isEncoding}
          className="w-full rounded-full bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-black transition hover:scale-105 disabled:opacity-60"
        >
          {isEncoding ? 'Encoding…' : 'Embed Message'}
        </button>
      </form>

      {downloadUrl && (
        <div className="mt-8 rounded-3xl border border-accent/40 bg-white/5 p-6 shadow-xl">
          <h3 className="font-display text-xl uppercase tracking-wide text-white">Encoded Image Ready</h3>
          <p className="mt-2 text-sm text-white/70">Download the PNG and share it wherever you like.</p>
          <a
            href={downloadUrl}
            download="steganoweb-encoded.png"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-black transition hover:scale-105"
          >
            Download Image
          </a>
        </div>
      )}
    </div>
  );

  const renderDecodeForm = () => (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <button onClick={handleBack} className="mb-6 text-sm uppercase tracking-wide text-white/50 hover:text-white">
        ← Change Flow
      </button>
      <ModeBadge mode={mode!} />
      <h1 className="mt-3 font-display text-4xl uppercase tracking-wide text-white">Decode Message</h1>
      <p className="mt-2 text-white/70">
        Upload any image and we&apos;ll reveal the hidden content. Choose algorithmic decoding for deterministic results or AI for
        best-effort analysis.
      </p>
      <InfoBanner action="DECODE" mode={mode!} />

      <form
        onSubmit={handleDecodeSubmit(onDecodeSubmit)}
        className="mt-8 space-y-6 rounded-3xl border border-white/10 bg-black/50 p-8 shadow-xl"
      >
        <div>
          <label className="block text-sm font-semibold uppercase tracking-wide text-white/60">Upload image</label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:outline-none"
            name={decodeImageField.name}
            ref={decodeImageField.ref}
            onBlur={decodeImageField.onBlur}
           onChange={(event) => {
              const file = (event.target as HTMLInputElement).files?.[0] ?? null;
              decodeImageField.onChange(file);
            }}
          />
          {decodeImageFieldState.error && (
            <p className="mt-1 text-xs text-red-300">{decodeImageFieldState.error.message}</p>
          )}
        </div>

        {decodeMutation.isError && (
          <p className="rounded-xl bg-red-400/10 p-3 text-sm text-red-300">
            {(decodeMutation.error as any)?.response?.data?.error ?? 'Unable to decode image. Try again.'}
          </p>
        )}
        <button
          type="submit"
          disabled={isDecoding}
          className="w-full rounded-full border border-white/30 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:border-accent hover:text-accent disabled:opacity-60"
        >
          {isDecoding ? 'Decoding…' : 'Extract Message'}
        </button>
      </form>

      {decodeResult && (
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
          <h3 className="font-display text-xl uppercase tracking-wide text-white">Decoded Message</h3>
          <p className="mt-2 text-xs uppercase tracking-[0.3em] text-white/50">Method: {decodeResult.method ?? 'Unknown'}</p>
          <p className="mt-3 whitespace-pre-wrap rounded-2xl bg-black/40 p-4 text-white/80">{decodeResult.message}</p>
        </div>
      )}
    </div>
  );

  if (!action) {
    return renderActionChooser();
  }

  if (!mode) {
    return renderModeChooser();
  }

  if (action === 'ENCODE') {
    return renderEncodeForm();
  }

  return renderDecodeForm();
};

export default SteganographyPage;
