import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Divider, Alert, TextField, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { checkBackendHealth, checkTestUserExists } from '../../utils/healthCheck';
import { manualLogin, logout } from '../../store/slices/authSlice';
import { createTestUser } from '../../utils/authUtils';

const AuthDebug: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const [localStorageUser, setLocalStorageUser] = useState<any>(null);
  const [apiStatus, setApiStatus] = useState<string>('Checking...');
  const [testUserStatus, setTestUserStatus] = useState<string>('Not checked');
  const [isChecking, setIsChecking] = useState<boolean>(false);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        setLocalStorageUser(JSON.parse(userStr));
      } else {
        setLocalStorageUser(null);
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      setLocalStorageUser(null);
    }
  }, []);

  // Check API status on mount
  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    setIsChecking(true);
    try {
      const result = await checkBackendHealth();
      setApiStatus(result.message);
      
      // Also check test user
      const testUserResult = await checkTestUserExists();
      setTestUserStatus(testUserResult.message);
    } catch (error: any) {
      setApiStatus(`Error checking API: ${error.message}`);
    } finally {
      setIsChecking(false);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('user');
    dispatch(logout() as any);
    window.location.reload();
  };

  const fixAuthState = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        dispatch(manualLogin(user));
      }
    } catch (error) {
      console.error('Error fixing auth state:', error);
    }
  };

  const forceLogin = () => {
    try {
      // Create a hardcoded test user
      const testUser = {
        id: 777,
        username: "forceuser",
        email: "force@example.com",
        access_token: "force-login-token-" + Date.now()
      };
      
      // Set in localStorage
      localStorage.setItem('user', JSON.stringify(testUser));
      
      // Update Redux state
      dispatch(manualLogin(testUser));
      
      // Refresh the page
      window.location.reload();
    } catch (error) {
      console.error('Force login failed:', error);
      alert('Force login failed: ' + (error as Error).message);
    }
  };

  const bypassWithUrlParam = () => {
    // Navigate to the dashboard with a special URL parameter that bypasses auth checks
    window.location.href = '/?force_auth=true';
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>Authentication Debug</Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        This page provides tools to diagnose and fix authentication issues
      </Alert>
      
      <Button 
        variant="outlined" 
        onClick={() => navigate('/login')}
        sx={{ mb: 3 }}
      >
        Back to Login
      </Button>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>API Status</Typography>
            <Typography fontWeight={apiStatus.includes('online') ? 'bold' : 'normal'} 
                       color={apiStatus.includes('online') ? 'success.main' : 'error'}>
              {apiStatus}
            </Typography>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={checkApiStatus} 
              disabled={isChecking}
              sx={{ mt: 1 }}
            >
              Refresh Status
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>Test User Status</Typography>
            <Typography fontWeight={testUserStatus.includes('valid') ? 'bold' : 'normal'}
                      color={testUserStatus.includes('valid') ? 'success.main' : 'error'}>
              {testUserStatus}
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Email: test@example.com<br/>
              Password: password123
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#f8d7da', borderLeft: '5px solid #dc3545' }}>
        <Typography variant="h5" gutterBottom color="error">Emergency Force Login</Typography>
        <Typography paragraph>
          Use this only if all other login methods fail. This will bypass all normal authentication.
        </Typography>
        <Button 
          variant="contained" 
          color="error" 
          onClick={forceLogin}
          fullWidth
          size="large"
          sx={{ py: 1.5 }}
        >
          FORCE LOGIN (EMERGENCY OVERRIDE)
        </Button>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>Redux Auth State</Typography>
        <Box component="pre" sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, overflow: 'auto' }}>
          {JSON.stringify(auth, null, 2)}
        </Box>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>LocalStorage User</Typography>
        <Box component="pre" sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, overflow: 'auto' }}>
          {localStorageUser ? JSON.stringify(localStorageUser, null, 2) : 'No user in localStorage'}
        </Box>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#fff3cd', borderLeft: '5px solid #ffc107' }}>
        <Typography variant="h5" gutterBottom sx={{ color: '#856404' }}>URL Parameter Bypass</Typography>
        <Typography paragraph>
          This method adds a special URL parameter that bypasses all auth checks.
        </Typography>
        <Button 
          variant="contained" 
          color="warning" 
          onClick={bypassWithUrlParam}
          fullWidth
          size="large"
          sx={{ py: 1.5 }}
        >
          USE URL PARAMETER BYPASS
        </Button>
      </Paper>
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="h5" gutterBottom>Debug Actions</Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button 
          variant="contained" 
          color="error" 
          onClick={clearAuth}
        >
          Clear Auth Data
        </Button>
        
        <Button 
          variant="contained" 
          color="warning" 
          onClick={fixAuthState}
        >
          Sync Redux with LocalStorage
        </Button>
        
        <Button 
          variant="contained" 
          color="success" 
          onClick={() => navigate('/')}
        >
          Go to Dashboard
        </Button>
      </Box>
      
      <Alert severity="info" sx={{ mt: 3 }}>
        Use this page to debug authentication issues. The buttons above can help fix common auth problems.
      </Alert>
    </Box>
  );
};

export default AuthDebug;