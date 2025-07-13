import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import ConnectionTest from '../components/ConnectionTest';
import RegistrationTest from '../components/RegistrationTest';

export const HomePage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to role-specific dashboard
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900">Welcome to LegalConnect</h1>
      <p className="mt-4 text-lg text-gray-600">
        Connecting clients with legal professionals
      </p>
      <div className="mt-8 max-w-4xl mx-auto space-y-8">
        <ConnectionTest />
        <RegistrationTest />
      </div>
    </div>
  );
}
