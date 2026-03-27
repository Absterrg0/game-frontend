import { Navigate, useLocation } from "react-router-dom";
import Loader from "@/components/shared/Loader";
import { useAuth } from "@/pages/auth/hooks";

export interface ProfileCompleteRouteProps {
  children: React.ReactNode;
}

/**
 * Ensures authenticated users completed profile setup before accessing app pages.
 */
export function ProfileCompleteRoute({ children }: ProfileCompleteRouteProps) {
  const { isAuthenticated, isProfileComplete, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isProfileComplete) {
    return <Navigate to="/information" replace />;
  }

  return <>{children}</>;
}