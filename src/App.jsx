import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement.jsx';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import PublicRoute from './routes/PublicRoutes.jsx';
import { ScrollToTop } from './components/ScrollToTop';
import './App.css';
import { useSelector } from 'react-redux';
import RecoveryQuestion from './pages/RecoveryQuestion.jsx';

const AppRoutes = () => {
  const { user_role } = useSelector((state) => state.auth);
  // console.log("user_role: ", user_role)
  return (
    <Routes>
      {/* ========== PUBLIC ROUTES ========== */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* ========== PROTECTED ROUTES ========== */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute >
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />


      {/* Admin Management */}
      <Route path="/users" element={
        <ProtectedRoute >
          <AdminLayout>
            <UserManagement />
          </AdminLayout>
        </ProtectedRoute>
      } />

      {/* Recovery Question Management */}
      <Route path="/recovery_question" element={
        <ProtectedRoute >
          <AdminLayout>
            <RecoveryQuestion />
          </AdminLayout>
        </ProtectedRoute>
      } />

      {/* ========== REDIRECTS ========== */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
        },
        components: {
          Button: {
            borderRadius: 6,
            controlHeight: 40,
          },
          Card: {
            borderRadius: 8,
          },
        },
      }}
    >
      <Router>
        <ScrollToTop />
        <AppRoutes />
      </Router>
    </ConfigProvider>
  );
};

export default App;
