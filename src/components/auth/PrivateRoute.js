// components/auth/PrivateRoute.jsx
import { useAuth } from './AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { ROLE_PERMISSIONS } from '../../config/rolePermissions';

const PrivateRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Admin and SuperAdmin have full access to all modules
  const currentRole = (user.role || '').toLowerCase();
  if (currentRole === 'admin' || currentRole === 'superadmin') {
    return children;
  }

  // Check role-based permission for current path if defined in ROLE_PERMISSIONS
  const roleName = user.role || 'default';
  const roleAllowedPaths = ROLE_PERMISSIONS[roleName] || ROLE_PERMISSIONS.default;
  if (roleAllowedPaths && roleAllowedPaths.includes(location.pathname)) {
    return children;
  }

  if (requiredRole) {
    const allowed = Array.isArray(requiredRole)
      ? requiredRole.map((r) => r.toLowerCase())
      : [requiredRole.toLowerCase()];

    if (allowed.includes('hr') && (currentRole === 'hr' || currentRole === 'admin' || currentRole === 'superadmin')) {
      return children;
    }

    if (!allowed.includes(currentRole)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default PrivateRoute;