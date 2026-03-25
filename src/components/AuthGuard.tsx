import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';

export default function AuthGuard() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
