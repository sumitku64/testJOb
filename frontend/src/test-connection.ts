import api from './services/api';

export const testBackendConnection = async () => {
  try {
    console.log('Testing backend connection...');
    const response = await api.get('/test');
    console.log('Backend connection successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Backend connection failed:', error);
    throw error;
  }
}; 