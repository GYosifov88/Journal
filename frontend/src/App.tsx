import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from './store';

// Layout Components
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

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
  // For debugging - log the initial auth state from localStorage
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      console.log('User found in localStorage:', JSON.parse(user));
    } else {
      console.log('No user found in localStorage');
    }
  }, []);

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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