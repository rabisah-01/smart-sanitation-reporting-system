import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Loader from './Loader';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, token, initialized } = useSelector(s => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (!initialized) return <Loader />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}
