import { GoogleGenerativeAI } from '@google/generative-ai';
import env from '../config/env.js';
import logger from '../lib/logger.js';

const DEFAULT_ENCODE_PROMPT =
  'You are an expert steganography assistant. Slightly enhance the provided image so it can conceal the hidden message while keeping the visual content unchanged and natural. Avoid adding any text overlays or obvious artifacts. Preserve aspect ratio and important details. Hidden message: "{{message}}".';

const DEFAULT_DECODE_PROMPT =
  'You are a steganography decoder. Inspect the attached image and reveal any hidden message or secret text that has been encoded in the pixels. If you cannot find a hidden message, respond exactly with the word NO_MESSAGE.';

let cachedClient: GoogleGenerativeAI | null = null;

const getModel = () => {
  if (!env.enableNanoBanana) {
    throw new Error('Nano Banana integration disabled');
  }
  if (!env.nanoBananaApiKey) {
    throw new Error('NANO_BANANA_API_KEY not configured');
  }
  if (!cachedClient) {
    cachedClient = new GoogleGenerativeAI(env.nanoBananaApiKey);
  }
  return cachedClient.getGenerativeModel({ model: env.nanoBananaModel });
};

const extractInlineImage = (parts: unknown): string | null => {
  if (!Array.isArray(parts)) {
    return null;
  }
  for (const part of parts) {
    if (!part || typeof part !== 'object') {
      continue;
    }
    const maybeRecord = part as Record<string, unknown>;
    const inline = maybeRecord.inlineData;
    if (inline && typeof inline === 'object') {
      const inlineRecord = inline as Record<string, unknown>;
      if (typeof inlineRecord.data === 'string') {
        return inlineRecord.data;
      }
    }
  }
  return null;
};

export const enhanceImageWithNanoBanana = async (
  originalBuffer: Buffer,
  options: { message: string; prompt?: string }
) => {
  if (!env.enableNanoBanana) {
    return originalBuffer;
  }

  try {
    const model = getModel();
    const prompt = (options.prompt && options.prompt.length > 0
      ? options.prompt
      : DEFAULT_ENCODE_PROMPT.replace('{{message}}', options.message)).slice(0, 2000);

    let timeoutHandle: NodeJS.Timeout | null = null;
    const generationPromise = model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: originalBuffer.toString('base64'),
                mimeType: 'image/png'
              }
            },
            { text: prompt }
          ]
        }
      ]
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => reject(new Error('Gemini request timed out')), env.nanoBananaTimeoutMs);
    });

    const result = await Promise.race([generationPromise, timeoutPromise]);

    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }

    const candidate = (result as Awaited<typeof generationPromise>).response?.candidates?.[0];
    if (!candidate) {
      throw new Error('Gemini response missing candidates');
    }

    const base64Image = extractInlineImage(candidate.content?.parts ?? []);
    if (!base64Image) {
      throw new Error('Gemini response missing inline image data');
    }

    return Buffer.from(base64Image, 'base64');
  } catch (error) {
    logger.error({ err: error }, 'Gemini enhancement failed, using original image');
    return originalBuffer;
  }
};

export default enhanceImageWithNanoBanana;

export const decodeMessageWithNanoBanana = async (
  imageBuffer: Buffer,
  mimeType: string
): Promise<string | null> => {
  if (!env.enableNanoBanana) {
    return null;
  }

  try {
    const model = getModel();
    const prompt = DEFAULT_DECODE_PROMPT;

    const contents = [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              data: imageBuffer.toString('base64'),
              mimeType: mimeType || 'image/png'
            }
          },
          { text: prompt }
        ]
      }
    ];

    const result = await model.generateContent({ contents });
    const text = result.response?.text()?.trim();
    if (!text) {
      return null;
    }

    const normalized = text.toUpperCase();
    if (normalized.includes('NO_MESSAGE')) {
      return null;
    }

    return text;
  } catch (error) {
    logger.error({ err: error }, 'Gemini decode fallback failed');
    return null;
  }
};
