import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { FiLoader } from 'react-icons/fi';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './pages/dashboard';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './components/NotFound';
import RosterPage from './pages/roster';
import StaffPage from './pages/staff';
import LeaveRequestsPage from './pages/leave';
import SettingsPage from './pages/settings';
import LocationsPage from './pages/locations';
import FTEPage from './pages/fte';
import SubscriptionPage from './pages/subscription';
import SubscriptionSuccessPage from './pages/subscription/success';
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-white-900">
    <div className="flex flex-col items-center gap-4">
      <FiLoader className="w-8 h-8 text-blue-500 animate-spin" />
      <p className="text-gray-400">Loading...</p>
    </div>
  </div>
);

const App: React.FC = () => {

  return (
    <AuthProvider>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roster"
            element={
              <ProtectedRoute>
                <RosterPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/staff"
            element={
              <ProtectedRoute>
                <StaffPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leave"
            element={
              <ProtectedRoute>
                <LeaveRequestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/locations"
            element={
              <ProtectedRoute>
                <LocationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fte"
            element={
              <ProtectedRoute>
                <FTEPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscribe"
            element={
              <ProtectedRoute>
                <SubscriptionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscription/success"
            element={
              <ProtectedRoute>
                <SubscriptionSuccessPage />
              </ProtectedRoute>
            }
          />
          {/* Catch all route */}
          {/* Redirect and 404 */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
};

export default App;