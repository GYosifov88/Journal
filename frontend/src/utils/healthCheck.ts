import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

/**
 * Checks if the backend API is online and responding
 * @returns Promise with the health check result
 */
export const checkBackendHealth = async (): Promise<{ status: string; message: string }> => {
  try {
    console.log('Checking backend health...');
    
    // Try to access the health endpoint
    const response = await axios.get(`${API_BASE_URL}/api/health`, {
      timeout: 5000,
    });
    
    console.log('Health endpoint response:', response.data);
    
    return {
      status: 'success',
      message: `Backend API is online: ${JSON.stringify(response.data)}`,
    };
  } catch (error: any) {
    console.error('Health check failed:', error);
    
    let message = 'Backend API is offline or unreachable';
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      message = `Backend API responded with status ${error.response.status}: ${JSON.stringify(error.response.data)}`;
    } else if (error.request) {
      // The request was made but no response was received
      message = 'Backend API did not respond (timeout or server down)';
    } else {
      // Something happened in setting up the request
      message = `Backend API connection error: ${error.message}`;
    }
    
    return {
      status: 'error',
      message,
    };
  }
};

/**
 * Checks if the test user exists in the backend
 * @returns Promise with check result 
 */
export const checkTestUserExists = async (): Promise<{ exists: boolean; message: string }> => {
  try {
    // Try to login with test credentials
    const params = new URLSearchParams();
    params.append('username', 'test@example.com');
    params.append('password', 'password123');
    
    await axios.post(`${API_BASE_URL}/api/auth/login`, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 5000,
    });
    
    return {
      exists: true,
      message: 'Test user exists and credentials are valid'
    };
  } catch (error: any) {
    console.error('Test user check failed:', error);
    
    if (error.response?.status === 401) {
      return {
        exists: false,
        message: 'Test user exists but credentials are invalid'
      };
    }
    
    return {
      exists: false,
      message: 'Test user check failed: ' + (error.message || 'Unknown error')
    };
  }
}; 