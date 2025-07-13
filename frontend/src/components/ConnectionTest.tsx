import React, { useState } from 'react';
import { testBackendConnection, testAuthEndpoint } from '../utils/connectionTest';

const ConnectionTest: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const testResult = await testBackendConnection();
      if (testResult.success) {
        setResult(JSON.stringify(testResult.data, null, 2));
      } else {
        setResult(`Error: ${testResult.error}\nDetails: ${testResult.details}`);
      }
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testAuthEndpointHandler = async () => {
    setLoading(true);
    try {
      const testResult = await testAuthEndpoint();
      if (testResult.success) {
        setResult(JSON.stringify(testResult.data, null, 2));
      } else {
        setResult(`Error: ${testResult.error}\nDetails: ${testResult.details}`);
      }
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Backend Connection Test</h2>
      <div className="space-y-2">
        <button
          onClick={testConnection}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 mr-2"
        >
          {loading ? 'Testing...' : 'Test Basic Connection'}
        </button>
        <button
          onClick={testAuthEndpointHandler}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Auth Endpoint'}
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

export default ConnectionTest; 