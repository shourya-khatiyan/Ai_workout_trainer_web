import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * wraps a route that requires authentication.
 * redirects to /signin if the user is not logged in.
 * shows nothing while the auth state is loading.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoggedIn, isLoading } = useUser();

  if (isLoading) return null;

  if (!isLoggedIn) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}
