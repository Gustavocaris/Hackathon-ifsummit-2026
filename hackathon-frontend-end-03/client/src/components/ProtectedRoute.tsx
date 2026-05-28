import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types';
import { useLocation } from 'wouter';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

export default function ProtectedRoute({
  children,
  requiredRoles,
}: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }

    if (requiredRoles && user && !requiredRoles.includes(user.perfil)) {
      setLocation('/unauthorized');
    }
  }, [isAuthenticated, user, requiredRoles, setLocation]);

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRoles && user && !requiredRoles.includes(user.perfil)) {
    return null;
  }

  return <>{children}</>;
}
