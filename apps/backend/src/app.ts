import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import rateLimit from 'express-rate-limit';
import env from './config/env.js';
import logger from './lib/logger.js';
import passport from './config/passport.js';
import { authenticate, requireAuth, requireVerifiedUser } from './middleware/authMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import stegRoutes from './routes/stegRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import apiKeyRoutes from './routes/apiKeyRoutes.js';
import publicStegRoutes from './routes/publicStegRoutes.js';
import authenticateApiKeyMiddleware from './middleware/apiKeyMiddleware.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandlers.js';

const app = express();

app.set('trust proxy', 1);

const allowedOrigins = new Set<string>();
const normalizedFrontend = env.frontendUrl.replace(/\/$/, '');
allowedOrigins.add(normalizedFrontend);

try {
  const parsed = new URL(normalizedFrontend);
  const host = parsed.hostname;
  if (host.includes('localhost')) {
    allowedOrigins.add(`${parsed.protocol}//127.0.0.1${parsed.port ? `:${parsed.port}` : ''}`);
  }
  if (!host.startsWith('www.') && /^[A-Za-z0-9.-]+$/.test(host)) {
    allowedOrigins.add(`${parsed.protocol}//www.${host}${parsed.port ? `:${parsed.port}` : ''}`);
  }
} catch (error) {
  logger.warn({ err: error }, 'Failed to parse FRONTEND_URL for CORS');
}

app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  })
);
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", env.frontendUrl]
    }
  }
}));
app.use('/api/payments/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(authenticate);
app.use(
  rateLimit({
    windowMs: env.rateLimitWindowMs,
    max: env.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false
  })
);
const pinoLoggerMiddleware = (pinoHttp as unknown as (options: unknown) => express.RequestHandler)({
  logger,
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers[set-cookie]'],
    censor: '[redacted]'
  }
});

app.use(pinoLoggerMiddleware);

app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/steg', stegRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/api-keys', requireAuth, requireVerifiedUser, apiKeyRoutes);
app.use('/api/public/steg', authenticateApiKeyMiddleware, publicStegRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
