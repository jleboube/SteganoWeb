import sharp from 'sharp';
import env from '../config/env.js';
import { HttpError } from '../middleware/errorHandlers.js';
import { sanitizeMessage } from '../utils/text.js';
import logger from '../lib/logger.js';
import { enhanceImageWithNanoBanana } from './nanoBananaService.js';

const SUPPORTED_FORMATS = ['jpeg', 'png'] as const;

const ensureCapacity = (pixelCount: number, bitLength: number) => {
  const capacity = pixelCount * 3; // using RGB channels only
  if (bitLength > capacity) {
    throw new HttpError(400, 'Message too long for selected image. Try a larger image.');
  }
};

const encodeBitsIntoPixels = (pixels: Uint8Array, bits: number[]) => {
  let bitIndex = 0;
  for (let i = 0; i < pixels.length && bitIndex < bits.length; i += 4) {
    for (let channel = 0; channel < 3 && bitIndex < bits.length; channel += 1) {
      const value = pixels[i + channel];
      pixels[i + channel] = (value & 0xfe) | bits[bitIndex];
      bitIndex += 1;
    }
  }
};

const extractBitsFromPixels = (pixels: Uint8Array, totalBits: number) => {
  const bits: number[] = [];
  for (let i = 0; i < pixels.length && bits.length < totalBits; i += 4) {
    for (let channel = 0; channel < 3 && bits.length < totalBits; channel += 1) {
      bits.push(pixels[i + channel] & 1);
    }
  }
  return bits;
};

const bitsToBuffer = (bits: number[]) => {
  const bytes = new Uint8Array(Math.ceil(bits.length / 8));
  bits.forEach((bit, index) => {
    const byteIndex = Math.floor(index / 8);
    const bitPosition = 7 - (index % 8);
    bytes[byteIndex] |= bit << bitPosition;
  });
  return Buffer.from(bytes);
};

const bufferToBits = (buffer: Buffer) => {
  const bits: number[] = [];
  for (const byte of buffer) {
    for (let bit = 7; bit >= 0; bit -= 1) {
      bits.push((byte >> bit) & 1);
    }
  }
  return bits;
};

const maybeEnhanceWithNanoBanana = async (
  buffer: Buffer,
  enabled: boolean,
  options: { message: string; prompt?: string }
) => {
  if (!enabled) {
    return buffer;
  }

  return enhanceImageWithNanoBanana(buffer, options);
};

export const encodeMessageIntoImage = async (
  inputBuffer: Buffer,
  rawMessage: string,
  options?: { useNanoBanana?: boolean; prompt?: string }
) => {
  if (inputBuffer.length > 15 * 1024 * 1024) {
    throw new HttpError(400, 'Image exceeds 15MB limit.');
  }

  const sanitizedMessage = sanitizeMessage(rawMessage);

  const preprocessed = await maybeEnhanceWithNanoBanana(inputBuffer, Boolean(options?.useNanoBanana), {
    message: sanitizedMessage,
    prompt: options?.prompt
  });

  const image = sharp(preprocessed, { failOn: 'error' }).ensureAlpha();
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height || !metadata.format) {
    throw new HttpError(400, 'Unable to read image metadata');
  }

  if (!SUPPORTED_FORMATS.includes(metadata.format as (typeof SUPPORTED_FORMATS)[number])) {
    throw new HttpError(400, 'Unsupported image format. Use JPEG or PNG.');
  }

  const messageBuffer = Buffer.from(sanitizedMessage, 'utf8');
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32BE(messageBuffer.length, 0);

  const payload = Buffer.concat([lengthBuffer, messageBuffer]);
  const payloadBits = bufferToBits(payload);

  ensureCapacity(metadata.width * metadata.height, payloadBits.length);

  const { data } = await image.raw().toBuffer({ resolveWithObject: true });
  const pixels = new Uint8Array(data);
  encodeBitsIntoPixels(pixels, payloadBits);

  const encodedImage = sharp(pixels, {
    raw: {
      width: metadata.width,
      height: metadata.height,
      channels: 4
    }
  });

  return encodedImage.png({ compressionLevel: 9 }).toBuffer();
};

// Format 1: SteganoWeb format (32-bit length header + message in RGB)
const trySteganoWebFormat = (pixels: Uint8Array, capacity: number): string | null => {
  try {
    const lengthBits = extractBitsFromPixels(pixels, 32);
    const lengthBuffer = bitsToBuffer(lengthBits);
    const messageLength = lengthBuffer.readUInt32BE(0);

    if (messageLength * 8 > capacity || messageLength > 10000 || messageLength === 0) {
      return null;
    }

    const messageBits = extractBitsFromPixels(pixels.slice(0), 32 + messageLength * 8).slice(32);
    const messageBuffer = bitsToBuffer(messageBits).subarray(0, messageLength);
    const message = messageBuffer.toString('utf8');

    // Validate it's printable text
    if (/[\x00-\x08\x0E-\x1F\x7F-\x9F]/.test(message.replace(/[\n\r\t]/g, ''))) {
      return null;
    }

    return message;
  } catch {
    return null;
  }
};

// Format 2: Null-byte terminated in Alpha channel (HackerNoon style)
const tryAlphaChannelNullTerminated = (pixels: Uint8Array): string | null => {
  try {
    const bits: number[] = [];

    // Extract from alpha channel (every 4th byte, starting at index 3)
    for (let i = 3; i < pixels.length; i += 4) {
      bits.push(pixels[i] & 1);

      // Stop if we have 8 bits and they form a null byte
      if (bits.length % 8 === 0 && bits.length >= 8) {
        const lastByte = bitsToBuffer(bits.slice(-8))[0];
        if (lastByte === 0) {
          // Found null terminator
          const messageBuffer = bitsToBuffer(bits.slice(0, -8));
          const message = messageBuffer.toString('utf8');

          if (message.length > 0 && message.length < 10000 && !/[\x00-\x08\x0E-\x1F\x7F-\x9F]/.test(message.replace(/[\n\r\t]/g, ''))) {
            return message;
          }
          return null;
        }
      }

      // Safety limit
      if (bits.length > 80000) break;
    }

    return null;
  } catch {
    return null;
  }
};

// Format 3: Null-byte terminated in RGB channels
const tryRGBNullTerminated = (pixels: Uint8Array): string | null => {
  try {
    const bits: number[] = [];

    // Extract from RGB channels
    for (let i = 0; i < pixels.length; i += 4) {
      for (let channel = 0; channel < 3; channel++) {
        bits.push(pixels[i + channel] & 1);

        if (bits.length % 8 === 0 && bits.length >= 8) {
          const lastByte = bitsToBuffer(bits.slice(-8))[0];
          if (lastByte === 0) {
            const messageBuffer = bitsToBuffer(bits.slice(0, -8));
            const message = messageBuffer.toString('utf8');

            if (message.length > 0 && message.length < 10000 && !/[\x00-\x08\x0E-\x1F\x7F-\x9F]/.test(message.replace(/[\n\r\t]/g, ''))) {
              return message;
            }
            return null;
          }
        }

        if (bits.length > 80000) break;
      }
      if (bits.length > 80000) break;
    }

    return null;
  } catch {
    return null;
  }
};

// Format 4: Fixed patterns like "###END###" or similar delimiters
const tryDelimiterFormat = (pixels: Uint8Array): string | null => {
  try {
    const bits: number[] = [];

    // Extract from RGB channels
    for (let i = 0; i < pixels.length && bits.length < 80000; i += 4) {
      for (let channel = 0; channel < 3 && bits.length < 80000; channel++) {
        bits.push(pixels[i + channel] & 1);
      }
    }

    const buffer = bitsToBuffer(bits);
    const text = buffer.toString('utf8', 0, Math.min(buffer.length, 10000));

    // Look for common delimiters
    const delimiters = ['###END###', '<<<END>>>', '---END---', '\x00\x00\x00'];

    for (const delimiter of delimiters) {
      const endIndex = text.indexOf(delimiter);
      if (endIndex > 0 && endIndex < text.length) {
        const message = text.substring(0, endIndex);
        if (!/[\x00-\x08\x0E-\x1F\x7F-\x9F]/.test(message.replace(/[\n\r\t]/g, ''))) {
          return message;
        }
      }
    }

    return null;
  } catch {
    return null;
  }
};

export const extractMessageFromImage = async (inputBuffer: Buffer) => {
  if (inputBuffer.length > 25 * 1024 * 1024) {
    throw new HttpError(400, 'Image exceeds 25MB limit.');
  }

  const image = sharp(inputBuffer).ensureAlpha();
  const metadata = await image.metadata();
  if (!metadata.width || !metadata.height) {
    throw new HttpError(400, 'Unable to read image metadata');
  }

  const { data } = await image.raw().toBuffer({ resolveWithObject: true });
  const pixels = new Uint8Array(data);
  const capacity = metadata.width * metadata.height * 3;

  // Try different formats in order of likelihood
  const formats = [
    { name: 'SteganoWeb', fn: () => trySteganoWebFormat(pixels, capacity) },
    { name: 'Alpha-Null', fn: () => tryAlphaChannelNullTerminated(pixels) },
    { name: 'RGB-Null', fn: () => tryRGBNullTerminated(pixels) },
    { name: 'Delimiter', fn: () => tryDelimiterFormat(pixels) }
  ];

  for (const format of formats) {
    const result = format.fn();
    if (result && result.length > 0) {
      logger.info({ format: format.name }, 'Decoded message using format');
      return result;
    }
  }

  throw new HttpError(400, 'No hidden payload detected or payload corrupted.');
};
