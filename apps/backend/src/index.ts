import app from './app.js';
import env from './config/env.js';
import logger from './lib/logger.js';

const server = app.listen(env.port, () => {
  logger.info({ port: env.port }, 'SteganoWeb backend listening');
});

const shutdown = (signal: NodeJS.Signals) => {
  logger.info({ signal }, 'Received shutdown signal');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
};

['SIGINT', 'SIGTERM'].forEach((sig) => {
  process.on(sig, () => shutdown(sig as NodeJS.Signals));
});

process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled rejection');
});
