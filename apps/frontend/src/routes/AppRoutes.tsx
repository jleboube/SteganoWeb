import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import SteganographyPage from '../pages/SteganographyPage';
import VerifyEmailPage from '../pages/VerifyEmailPage';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import ComingSoonPage from '../pages/ComingSoonPage';
import APIPage from '../pages/APIPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'verify-email', element: <VerifyEmailPage /> },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'steganography',
        element: (
          <ProtectedRoute requireVerified>
            <SteganographyPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'packages',
        element: (
          <ProtectedRoute>
            <ComingSoonPage />
          </ProtectedRoute>
        )
      },
      { path: 'api', element: <APIPage /> },
      { path: '*', element: <Navigate to="/" replace /> }
    ]
  }
]);
