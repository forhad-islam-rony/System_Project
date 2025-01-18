import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { token, role } = useContext(AuthContext);
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

    if (!token) {
        return <Navigate to={isAdminRoute ? "/admin/login" : "/login"} replace={true} />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        if (isAdminRoute) {
            return <Navigate to="/admin/login" replace={true} />;
        }
        return <Navigate to="/" replace={true} />;
    }

    return children;
};

export default ProtectedRoute;
