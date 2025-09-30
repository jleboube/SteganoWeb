import 'dotenv/config';

const required = ['DATABASE_URL', 'JWT_SECRET', 'SESSION_COOKIE_NAME', 'FRONTEND_URL'];

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable ${key}`);
  }
});

const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
  backendBaseUrl: process.env.BACKEND_URL ?? 'http://localhost:4000',
  databaseUrl: process.env.DATABASE_URL as string,
  jwtSecret: process.env.JWT_SECRET as string,
  sessionCookieName: process.env.SESSION_COOKIE_NAME as string,
  sessionCookieSecure: process.env.SESSION_COOKIE_SECURE === 'true',
  sessionCookieDomain: process.env.SESSION_COOKIE_DOMAIN,
  frontendUrl: process.env.FRONTEND_URL as string,
  enablePayments: process.env.ENABLE_PAYMENTS === 'true',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  enableNanoBanana: process.env.ENABLE_NANO_BANANA === 'true',
  nanoBananaApiKey: process.env.NANO_BANANA_API_KEY,
  nanoBananaModel: process.env.NANO_BANANA_MODEL ?? 'models/gemini-2.0-flash',
  nanoBananaTimeoutMs: parseInt(process.env.NANO_BANANA_TIMEOUT_MS ?? '45000', 10),
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? `${15 * 60 * 1000}`, 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10)
};

export default env;
