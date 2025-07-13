import api from '../services/api';

export const testBackendConnection = async () => {
  try {
    console.log('Testing backend connection...');
    const response = await api.get('/test');
    console.log('✅ Backend connection successful:', response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('❌ Backend connection failed:', error);
    return { 
      success: false, 
      error: error.message,
      details: error.response?.data || error.response?.statusText
    };
  }
};

export const testAuthEndpoint = async () => {
  try {
    console.log('Testing auth endpoint...');
    const response = await api.get('/auth/test-sanitize');
    console.log('✅ Auth endpoint successful:', response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('❌ Auth endpoint failed:', error);
    return { 
      success: false, 
      error: error.message,
      details: error.response?.data || error.response?.statusText
    };
  }
}; 