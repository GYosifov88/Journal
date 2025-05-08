import axios, { AxiosResponse } from 'axios';
import { User } from '../store/slices/authSlice';

const API_URL = 'http://localhost:8000/api/auth/';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

// Register user
const register = async (userData: RegisterData): Promise<any> => {
  const response: AxiosResponse = await axios.post(API_URL + 'register', userData);
  return response.data;
};

// Login user
const login = async (userData: LoginData): Promise<User> => {
  const formData = new FormData();
  formData.append('username', userData.email);
  formData.append('password', userData.password);
  
  const response: AxiosResponse = await axios.post(API_URL + 'login', formData);
  return response.data;
};

// Logout user
const logout = async (): Promise<void> => {
  try {
    await axios.post(API_URL + 'logout');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Refresh token
const refreshToken = async (): Promise<User | null> => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  const user = JSON.parse(userStr) as User;
  if (!user || !user.access_token) return null;
  
  const config = {
    headers: {
      Authorization: `Bearer ${user.access_token}`,
    },
  };
  
  const response: AxiosResponse = await axios.post(API_URL + 'refresh', {}, config);
  
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