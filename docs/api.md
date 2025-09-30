# SteganoWeb API

## Authentication
Generate an API key from the dashboard (API Access card). Send the key with each request via the `X-API-Key` header or `Authorization: Bearer <key>`. Keys inherit your credit balance and daily free edit.

## Base URL
```
https://your-domain/api/public/steg
```

## Endpoints

### POST /encode
Embed a message inside an image.

**Request**
```json
{
  "imageBase64": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "message": "Trust no one.",
  "useNanoBanana": false
}
```

**Response**
```json
{
  "mimeType": "image/png",
  "data": "iVBORw0KGgoAAAANS...",
  "metadata": {
    "usedFreeCredit": false,
    "nanoBananaApplied": false
  }
}
```

### POST /decode
Extract hidden text from a steganographic image.

**Request**
```json
{
  "imageBase64": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

**Response**
```json
{
  "message": "Trust no one."
}
```

## Usage Limits
- Images must be PNG or JPEG, ≤ 5MB after base64 decoding.
- Messages allow up to 1,000 characters (control characters removed).
- Successful encodes consume one credit. Daily free edits and purchased credits both apply.
- Failed or invalid requests do not deduct credits.

## Key Management
- Keys can be generated, listed, and revoked from the dashboard.
- Copy new keys immediately—they are only shown once.
- Revoked keys stop working instantly.
