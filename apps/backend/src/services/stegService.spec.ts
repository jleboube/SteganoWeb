import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { encodeMessageIntoImage, extractMessageFromImage } from './stegService.js';

describe('stegService', () => {
  it('embeds and extracts a message', async () => {
    const image = await sharp({
      create: {
        width: 50,
        height: 50,
        channels: 3,
        background: { r: 120, g: 110, b: 200 }
      }
    })
      .png()
      .toBuffer();

    const message = 'Hello hidden world!';
    const encoded = await encodeMessageIntoImage(image, message);
    const decoded = await extractMessageFromImage(encoded);

    expect(decoded).toBe(message);
  });

  it('rejects oversized images', async () => {
    const bigBuffer = Buffer.alloc(6 * 1024 * 1024);
    await expect(encodeMessageIntoImage(bigBuffer, 'hi')).rejects.toThrow('Image exceeds 5MB limit.');
  });
});
