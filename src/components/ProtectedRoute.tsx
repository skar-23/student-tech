import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  redirectPath?: string;
  children?: React.ReactNode;
}

export function ProtectedRoute({
  redirectPath = '/auth',
  children,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    // Show loading state while checking authentication
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, redirect to the login page
  if (!user) {
    return <Navigate to={redirectPath} replace />;
  }

  // If authenticated, render the children or outlet
  return children ? <>{children}</> : <Outlet />;
}

export function PublicOnlyRoute({
  redirectPath = '/dashboard',
  children,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    // Show loading state while checking authentication
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If authenticated, redirect to the specified path
  if (user) {
    return <Navigate to={redirectPath} replace />;
  }

  // If not authenticated, render the children or outlet
  return children ? <>{children}</> : <Outlet />;
}