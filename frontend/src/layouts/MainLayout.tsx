import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Toaster } from 'react-hot-toast';

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Toaster position="top-right" />
    </div>
  );
};
