/**
 * Auth utilities for development and debugging
 */

import { User } from '../store/slices/authSlice';

/**
 * Clean up all auth data from localStorage
 */
export const cleanAuthData = (): void => {
  try {
    localStorage.removeItem('user');
    console.log('Auth data cleaned successfully');
  } catch (error) {
    console.error('Error cleaning auth data:', error);
  }
};

/**
 * Create a test user in localStorage for development/debugging
 */
export const createTestUser = (): User => {
  const testUser: User = {
    id: 999,
    username: 'testuser',
    email: 'test@example.com',
    access_token: 'test-token-for-development-only'
  };
  
  try {
    localStorage.setItem('user', JSON.stringify(testUser));
    console.log('Test user created:', testUser);
  } catch (error) {
    console.error('Error creating test user:', error);
  }
  
  return testUser;
};

/**
 * Fix authentication issues between Redux and localStorage
 */
export const fixAuthSync = (): User | null => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      console.log('No user in localStorage to sync');
      return null;
    }
    
    const user = JSON.parse(userStr);
    console.log('Synced user from localStorage:', user);
    return user;
  } catch (error) {
    console.error('Error syncing auth data:', error);
    return null;
  }
};

/**
 * Force a direct bypass of all authentication mechanisms
 * This is a last resort for development when nothing else works
 */
export const forceAuthBypass = (): void => {
  try {
    // Try approach 1: set a test user in localStorage
    const testUser = {
      id: 555,
      username: "bypassuser",
      email: "bypass@example.com",
      access_token: "last-resort-bypass-token-" + new Date().toISOString()
    };
    
    localStorage.setItem('user', JSON.stringify(testUser));
    console.log('Created bypass user in localStorage');
    
    // Navigate to dashboard with special parameter
    window.location.href = '/?force_auth=true';
  } catch (error) {
    console.error('Auth bypass failed:', error);
    
    // If all else fails, try just the URL parameter
    window.location.href = '/?force_auth=true';
  }
}; 