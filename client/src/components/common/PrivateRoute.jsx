import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, user, allowedRoles }) => {
    if (!user) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default PrivateRoute;
