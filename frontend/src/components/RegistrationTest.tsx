import React, { useState } from 'react';
import { authService } from '../services/auth.service';

const RegistrationTest: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testClientRegistration = async () => {
    setLoading(true);
    try {
      const testData = {
        name: 'Test Client',
        email: `testclient${Date.now()}@example.com`,
        password: 'password123',
        phoneNumber: '1234567890',
        role: 'client' as const,
      };

      const response = await authService.register(testData);
      setResult(`✅ Client registration successful: ${JSON.stringify(response, null, 2)}`);
    } catch (error: any) {
      setResult(`❌ Client registration failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testAdvocateRegistration = async () => {
    setLoading(true);
    try {
      const testData = {
        name: 'Test Advocate',
        email: `testadvocate${Date.now()}@example.com`,
        password: 'password123',
        phoneNumber: '1234567890',
        role: 'advocate' as const,
        specialization: 'Criminal Law',
        experience: 5,
        barCouncilNumber: `BC${Date.now()}`,
        consultationFee: 1000,
      };

      const response = await authService.register(testData);
      setResult(`✅ Advocate registration successful: ${JSON.stringify(response, null, 2)}`);
    } catch (error: any) {
      setResult(`❌ Advocate registration failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testInternRegistration = async () => {
    setLoading(true);
    try {
      const testData = {
        name: 'Test Intern',
        email: `testintern${Date.now()}@example.com`,
        password: 'password123',
        phoneNumber: '1234567890',
        role: 'intern' as const,
        education: {
          currentInstitution: 'Test University',
          degree: 'LLB',
          year: 3,
        },
        resume: 'https://example.com/resume.pdf',
      };

      const response = await authService.register(testData);
      setResult(`✅ Intern registration successful: ${JSON.stringify(response, null, 2)}`);
    } catch (error: any) {
      setResult(`❌ Intern registration failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Registration Test</h2>
      <div className="space-y-2">
        <button
          onClick={testClientRegistration}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 mr-2"
        >
          {loading ? 'Testing...' : 'Test Client Registration'}
        </button>
        <button
          onClick={testAdvocateRegistration}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 mr-2"
        >
          {loading ? 'Testing...' : 'Test Advocate Registration'}
        </button>
        <button
          onClick={testInternRegistration}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Intern Registration'}
        </button>
      </div>
      {result && (
        <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-auto">
          {result}
        </pre>
      )}
    </div>
  );
};

export default RegistrationTest; 