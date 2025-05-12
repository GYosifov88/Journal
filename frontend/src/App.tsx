import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Container, Alert, Box, Typography, Button, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import { checkBackendHealth } from './utils/healthCheck';

// Layout Components
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AuthDebug from './pages/auth/AuthDebug';

// Main Pages
import Dashboard from './pages/Dashboard';
import Trades from './pages/trades/Trades';
import TradeDetails from './pages/trades/TradeDetails';
import NewTrade from './pages/trades/NewTrade';
import Accounts from './pages/accounts/Accounts';
import AccountDetails from './pages/accounts/AccountDetails';
import Goals from './pages/goals/Goals';
import Analysis from './pages/analysis/Analysis';
import NotFound from './pages/NotFound';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Protected Route Component
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  console.log('ProtectedRoute - Auth State:', { user, isAuthenticated });
  
  if (!isAuthenticated || !user) {
    console.log('Redirecting to login - Not authenticated');
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<{
    isChecking: boolean;
    isOnline: boolean;
    message: string;
  }>({
    isChecking: true,
    isOnline: false,
    message: 'Checking backend connectivity...'
  });

  // For debugging - log the initial auth state from localStorage
  useEffect(() => {
    // Clear any existing user data to prevent auto-login
    localStorage.removeItem('user');
    console.log('Cleared any existing user data from localStorage for fresh login');
    
    // Check backend status
    checkBackendConnectivity();
  }, []);
  
  const checkBackendConnectivity = async () => {
    try {
      setBackendStatus(prev => ({ ...prev, isChecking: true }));
      const result = await checkBackendHealth();
      
      setBackendStatus({
        isChecking: false,
        isOnline: result.status === 'success',
        message: result.message
      });
    } catch (error: any) {
      setBackendStatus({
        isChecking: false,
        isOnline: false,
        message: 'Could not connect to backend: ' + error.message
      });
    }
  };

  // If we're still checking or the backend is offline, show a message
  if (backendStatus.isChecking || !backendStatus.isOnline) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <Alert severity={backendStatus.isChecking ? 'info' : 'error'} sx={{ mb: 4 }}>
          {backendStatus.isChecking ? (
            <Box display="flex" alignItems="center">
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Checking connection to backend server...
            </Box>
          ) : (
            <Typography variant="body1">
              {backendStatus.message}
            </Typography>
          )}
        </Alert>
        
        {!backendStatus.isChecking && !backendStatus.isOnline && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Backend Server Appears to be Offline
            </Typography>
            <Typography variant="body1" paragraph>
              Please make sure the backend server is running on http://localhost:8000 and try again.
            </Typography>
            <Button
              variant="contained"
              onClick={checkBackendConnectivity}
              sx={{ mr: 2 }}
            >
              Retry Connection
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => window.location.href = "/auth-debug"}
            >
              Go to Debug Page
            </Button>
          </Box>
        )}
      </Container>
    );
  }

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth-debug" element={<AuthDebug />} />
      </Route>
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/trades" element={<Trades />} />
        <Route path="/trades/new" element={<NewTrade />} />
        <Route path="/trades/:id" element={<TradeDetails />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/accounts/:id" element={<AccountDetails />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/analysis" element={<Analysis />} />
      </Route>
      
      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App; 