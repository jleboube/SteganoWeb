import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import EmailVerificationGate from '../misc/EmailVerificationGate';

const ProtectedRoute = ({ children, requireVerified = false }: { children: ReactNode; requireVerified?: boolean }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-accent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireVerified && !user.emailVerified) {
    return <EmailVerificationGate email={user.email} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
