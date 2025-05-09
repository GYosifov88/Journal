import axios from 'axios';

// A utility function to test API endpoints and log detailed errors
export const testEndpoint = async (url, method = 'GET', data = null) => {
  console.log(`Testing ${method} ${url}...`);
  
  try {
    const config = {
      method,
      url,
      data: data ? data : undefined,
      headers: {
        'Content-Type': 'application/json',
      },
      // Get the auth token if available
      ...(localStorage.getItem('user') && {
        headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user')).access_token}`,
        }
      })
    };
    
    const response = await axios(config);
    console.log(`✅ Success: ${method} ${url}`);
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    console.error(`❌ Error: ${method} ${url}`);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
      return { success: false, error: error.response.data, status: error.response.status };
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received');
      console.error('Request:', error.request);
      return { success: false, error: 'No response from server', request: error.request };
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
      return { success: false, error: error.message };
    }
  }
};

// Check all the common endpoints
export const testAllEndpoints = async () => {
  const baseUrl = 'http://localhost:8000';
  
  // Test the health endpoint
  await testEndpoint(`${baseUrl}/api/health`);
  
  // Test account endpoints
  await testEndpoint(`${baseUrl}/api/accounts`);
  
  // Test trade endpoints (various combinations)
  await testEndpoint(`${baseUrl}/api/trades`);
  await testEndpoint(`${baseUrl}/api/accounts/1/trades`);
  await testEndpoint(`${baseUrl}/api/trades/accounts/1/trades`);
  
  // Print the potential trade creation URL
  console.log('Potential trade creation URLs:');
  console.log(`1. ${baseUrl}/api/trades/accounts/1/trades`);
  console.log(`2. ${baseUrl}/api/accounts/1/trades`);
  console.log(`3. ${baseUrl}/accounts/1/trades`);
  console.log(`4. ${baseUrl}/api/trades`);
};

export default { testEndpoint, testAllEndpoints }; 