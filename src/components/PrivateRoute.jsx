import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ user, role, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return <Navigate 
      to={user.role === 'user' ? '/user-dashboard' : '/manager-dashboard'} 
      replace 
    />;
  }

  return children;
}

export default PrivateRoute;