import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from './features/auth/authSlice';

import ProtectedRoute from './components/ProtectedRoute';
import LoginPage          from './pages/LoginPage';
import RegisterPage       from './pages/RegisterPage';
import CitizenDashboard   from './pages/CitizenDashboard';
import SubmitComplaintPage from './pages/SubmitComplaintPage';
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import AdminDashboard     from './pages/AdminDashboard';
import AdminComplaintsPage from './pages/AdminComplaintsPage';
import AnalyticsPage      from './pages/AnalyticsPage';

function AppRoutes() {
  const dispatch = useDispatch();
  const { token, user } = useSelector(s => s.auth);

  useEffect(() => { if (token) dispatch(fetchMe()); }, [token, dispatch]);

  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Citizen routes */}
      <Route path="/dashboard" element={<ProtectedRoute><CitizenDashboard /></ProtectedRoute>} />
      <Route path="/submit"    element={<ProtectedRoute><SubmitComplaintPage /></ProtectedRoute>} />
      <Route path="/complaint/:id" element={<ProtectedRoute><ComplaintDetailPage /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin"             element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/complaints"  element={<ProtectedRoute adminOnly><AdminComplaintsPage /></ProtectedRoute>} />
      <Route path="/admin/analytics"   element={<ProtectedRoute adminOnly><AnalyticsPage /></ProtectedRoute>} />

      {/* Root redirect */}
      <Route path="/" element={
        token
          ? (user?.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />)
          : <Navigate to="/login" replace />
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
