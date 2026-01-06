import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to require authentication for actions
 * Returns a function that checks if user is logged in, and redirects to login if not
 */
export const useRequireAuth = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const requireAuth = (action = 'perform this action') => {
    if (!currentUser) {
      const currentPath = window.location.pathname;
      const shouldProceed = window.confirm(
        `You need to be logged in to ${action}. Would you like to login now?`
      );
      if (shouldProceed) {
        navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
      }
      return false;
    }
    return true;
  };

  return { requireAuth, isAuthenticated: !!currentUser };
};
