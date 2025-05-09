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
  const response: AxiosResponse = await axios.post(API_URL + 'register', userData);
  return response.data;
};

// Login user
const login = async (userData: LoginData): Promise<User> => {
  console.log('Login attempt for:', userData.email);
  
  // FastAPI OAuth2 password flow requires x-www-form-urlencoded format
  const params = new URLSearchParams();
  params.append('username', userData.email);
  params.append('password', userData.password);
  
  console.log('Sending login request to:', API_URL + 'login');
  
  try {
    // Step 1: Get token
    console.log('Attempting to get token with credentials:', { 
      username: userData.email,
      password: userData.password.substring(0, 3) + '***' // Show only first 3 chars of password for security
    });
    
    const tokenResponse: AxiosResponse<TokenResponse> = await axios.post(API_URL + 'login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    console.log('Token received successfully:', tokenResponse.data);
    
    // Step 2: Get user data using the token
    console.log('Fetching user data from:', USERS_API_URL + 'me');
    const userResponse: AxiosResponse = await axios.get(USERS_API_URL + 'me', {
      headers: {
        'Authorization': `Bearer ${tokenResponse.data.access_token}`
      }
    });
    
    console.log('User data received:', userResponse.data);
    
    // Step 3: Combine token and user data
    const user: User = {
      id: userResponse.data.id,
      username: userResponse.data.username,
      email: userResponse.data.email,
      access_token: tokenResponse.data.access_token
    };
    
    console.log('Login successful, storing user data in localStorage:', user);
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  } catch (error) {
    console.error('Login error:', error);
    
    if (isAxiosError(error)) {
      console.error('API Response:', error.response?.data);
      console.error('Status:', error.response?.status);
      
      // Provide more specific error messages based on the status code
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password. Please check your credentials.');
      } else if (error.response?.status === 404) {
        throw new Error('API endpoint not found. Please check server configuration.');
      } else if (!error.response) {
        throw new Error('Cannot connect to server. Please check that the backend is running.');
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