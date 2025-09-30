export type AuthenticatedUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  emailVerified: boolean;
  credits: number;
  freeEditsUsedAt: Date | null;
  createdAt: Date;
};
