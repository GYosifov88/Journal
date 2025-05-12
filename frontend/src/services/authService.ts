import axios, { AxiosResponse, isAxiosError } from 'axios';
import { User } from '../store/slices/authSlice';

// Set up API URL
const API_URL = 'http://localhost:8000/api/auth/';
const USERS_API_URL = 'http://localhost:8000/api/users/';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
}

// Register user
const register = async (userData: RegisterData): Promise<any> => {
  console.log('Registering user:', userData.username);
  try {
    // Use the direct register endpoint
    console.log('Sending registration to direct-register endpoint');
    
    const response: AxiosResponse = await axios.post('http://localhost:8000/direct-register', userData);
    
    console.log('Registration successful, storing user data:', response.status);
    
    // Store user data directly
    const user: User = {
      id: response.data.id,
      username: response.data.username,
      email: response.data.email,
      access_token: response.data.access_token
    };
    
    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify(user));
    
    // Set authorization header for future requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
    
    return user;
  } catch (error) {
    console.error('Registration error:', error);
    
    if (isAxiosError(error)) {
      console.error('API Response:', error.response?.data);
      console.error('Status:', error.response?.status);
      
      // Provide more specific error messages based on the status code
      if (error.response?.status === 400) {
        throw new Error(error.response.data.detail || 'Registration failed. User might already exist.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error during registration. Please try again later.');
      } else if (!error.response) {
        throw new Error('Cannot connect to server. Please check that the backend is running.');
      }
    }
    
    throw error;
  }
};

// Login user
const login = async (userData: LoginData): Promise<User> => {
  console.log('Login attempt for:', userData.email);
  
  // FastAPI OAuth2 password flow requires x-www-form-urlencoded format
  const params = new URLSearchParams();
  params.append('username', userData.email);
  params.append('password', userData.password);
  
  console.log('Sending login request to direct login endpoint');
  
  try {
    // Step 1: Get token from direct login endpoint
    const tokenResponse: AxiosResponse = await axios.post('http://localhost:8000/direct-login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    console.log('Direct login response received:', tokenResponse.status);
    
    if (!tokenResponse.data.access_token) {
      console.error('No access token received in response:', tokenResponse.data);
      throw new Error('Invalid server response: No access token received');
    }
    
    // Create user object directly from direct login response
    const user: User = {
      id: tokenResponse.data.user_id,
      username: tokenResponse.data.username,
      email: tokenResponse.data.email,
      access_token: tokenResponse.data.access_token
    };
    
    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify(user));
    
    // Set default authorization header for future requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenResponse.data.access_token}`;
    
    return user;
  } catch (error) {
    console.error('Login error:', error);
    
    if (isAxiosError(error)) {
      console.error('API Response:', error.response?.data);
      console.error('Status:', error.response?.status);
      console.error('Headers:', error.response?.headers);
      
      // Provide more specific error messages based on the status code
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password. Please check your credentials.');
      } else if (error.response?.status === 404) {
        throw new Error('API endpoint not found. Please check server configuration.');
      } else if (!error.response) {
        throw new Error('Cannot connect to server. Please check that the backend is running.');
      } else {
        throw new Error(`Server error: ${error.response?.data?.detail || 'Unknown error'}`);
      }
    }
    
    throw error;
  }
};

// Logout user
const logout = async (): Promise<void> => {
  try {
    await axios.post(API_URL + 'logout');
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Logout error:', error);
    // Still remove from localStorage even if API call fails
    localStorage.removeItem('user');
  }
};

// Refresh token
const refreshToken = async (): Promise<User | null> => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  const user = JSON.parse(userStr) as User;
  if (!user || !user.access_token) return null;
  
  const response: AxiosResponse<TokenResponse> = await axios.post(API_URL + 'refresh', {}, {
    headers: {
      Authorization: `Bearer ${user.access_token}`,
    },
  });
  
  if (response.data) {
    const updatedUser: User = {
      ...user,
      access_token: response.data.access_token,
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  }
  
  return null;
};

const authService = {
  register,
  login,
  logout,
  refreshToken,
};

export default authService; 