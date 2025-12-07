import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import MenuPage from './pages/MenuPage';
import FunctionalityPage from './pages/FunctionalityPage';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar'; // ✅ import your Navbar

export default function App() {
  return (
    <AuthProvider>
      <Router>
        {/* ✅ Navbar is always visible */}
        <Navbar />

        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ✅ Protected pages */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu"
            element={
              <ProtectedRoute>
                <MenuPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/functionality"
            element={
              <ProtectedRoute>
                <FunctionalityPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
