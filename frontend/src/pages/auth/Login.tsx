import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Box, TextField, Button, Typography, Alert, CircularProgress, Divider } from '@mui/material';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';

// Import auth actions
import { login, manualLogin } from '../../store/slices/authSlice';
import { createTestUser } from '../../utils/authUtils';

interface LoginFormValues {
  email: string;
  password: string;
}

// Define error interface for properly typing the payload
interface ApiError {
  message: string;
  [key: string]: any;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const initialValues: LoginFormValues = {
    email: 'test@example.com',
    password: 'password123',
  };

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().required('Password is required'),
  });

  const handleSubmit = async (
    values: LoginFormValues, 
    { setSubmitting }: FormikHelpers<LoginFormValues>
  ) => {
    try {
      setError(null);
      setSuccessMessage(null);
      setIsProcessing(true);
      
      console.log('Attempting login with:', values.email);
      
      // Dispatch the login action
      const resultAction = await dispatch(login(values) as any);
      
      // Check if the login was successful
      if (login.fulfilled.match(resultAction)) {
        console.log('Login successful:', resultAction.payload);
        setSuccessMessage('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else if (login.rejected.match(resultAction)) {
        // Handle login error
        const payload = resultAction.payload as ApiError | undefined;
        const errorMsg = payload?.message || resultAction.error.message || 'Login failed';
        console.error('Login failed:', errorMsg);
        setError(errorMsg);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsProcessing(false);
      setSubmitting(false);
    }
  };

  // Test login function that bypasses the API
  const handleTestLogin = () => {
    try {
      // Create a test user
      const testUser = createTestUser();
      
      // Update Redux state directly
      dispatch(manualLogin(testUser));
      
      setSuccessMessage("Test login successful! Using development bypass mode...");
      
      // Navigate to dashboard after a brief delay
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err: any) {
      console.error('Test login error:', err);
      setError('Test login failed: ' + err.message);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', p: 2 }}>
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        Login
      </Typography>
      
      <Alert severity="info" sx={{ mb: 2 }}>
        Use the pre-filled test credentials or click "Test Login" for quick access
      </Alert>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
      
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form>
            <Field
              as={TextField}
              name="email"
              label="Email"
              fullWidth
              margin="normal"
              error={touched.email && Boolean(errors.email)}
              helperText={touched.email && errors.email}
            />
            
            <Field
              as={TextField}
              name="password"
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              error={touched.password && Boolean(errors.password)}
              helperText={touched.password && errors.password}
            />
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isSubmitting || isProcessing}
              sx={{ mt: 2 }}
            >
              {isProcessing ? <CircularProgress size={24} color="inherit" /> : 'Login'}
            </Button>
            
            <Box mt={2} textAlign="center">
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link to="/register">Register</Link>
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Having trouble? <Link to="/auth-debug">Debug Auth</Link>
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="caption" color="text.secondary" align="center" display="block">
              Development Tools
            </Typography>
            
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              onClick={handleTestLogin}
              sx={{ mt: 1 }}
              size="small"
            >
              Test Login (Redux)
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default Login; 