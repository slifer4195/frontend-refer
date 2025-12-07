import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export default function ProtectedRoute({ children }) {
  const { loggedIn, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>; // ⏳ Wait until checkLogin completes
  if (!loggedIn) return <Navigate to="/login" replace />;

  return children;
}
