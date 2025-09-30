import type { AuthenticatedUser } from './user.js';

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthenticatedUser;
      apiKeyAuth?: {
        id: string;
        name: string | null;
      };
    }
  }
}

export {};
