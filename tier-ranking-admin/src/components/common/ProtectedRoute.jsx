import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader } from './Loader.jsx';
import { useAuth } from '../../hooks/useAuth.js';

export function ProtectedRoute() {
  const { booting, isAuthenticated } = useAuth();
  const location = useLocation();

  if (booting) return <Loader label="Checking session" />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;

  return <Outlet />;
}
