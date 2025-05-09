import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authService from '../../services/authService';

// Define types for our state
export interface User {
  id: number;
  username: string;
  email: string;
  access_token: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Helper function to get user from localStorage
const getUserFromStorage = (): User | null => {
  try {
    const user = localStorage.getItem('user');
    console.log('Getting user from storage:', user ? 'Found' : 'Not found');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

// Async thunks for authentication
export const login = createAsyncThunk<
  User,
  { email: string; password: string },
  { rejectValue: { message: string } }
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('Auth slice: logging in with', credentials.email);
      const user = await authService.login(credentials);
      console.log('Auth slice: login successful', user);
      return user;
    } catch (err: any) {
      console.error('Auth slice: login error', err);
      // Ensure we return an object with a message property
      return rejectWithValue({ 
        message: err.response?.data?.detail || err.message || 'Login failed' 
      });
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: { username: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { message: 'Registration failed' });
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await authService.logout();
  } catch (error) {
    console.error('Logout error:', error);
  }
  localStorage.removeItem('user');
  return null;
});

// Initial state
const initialState: AuthState = {
  user: getUserFromStorage(),
  isAuthenticated: !!getUserFromStorage(),
  isLoading: false,
  error: null,
};

// Create slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    // Add manual login action for debugging purposes
    manualLogin(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ? (action.payload as any).message : 'Login failed';
      })
      
      // Register cases
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ? (action.payload as any).message : 'Registration failed';
      })
      
      // Logout case
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

// Export actions
export const { clearError, manualLogin } = authSlice.actions;

// Export reducer
export default authSlice.reducer; 