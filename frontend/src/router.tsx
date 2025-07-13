import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Import all pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { SearchAdvocatesPage } from './pages/client/SearchAdvocatesPage';
import { BookAppointmentPage } from './pages/client/BookAppointmentPage';
import { PostInternshipPage } from './pages/advocate/PostInternshipPage';
import { CaseRequestsPage } from './pages/advocate/CaseRequestsPage';
import { InternshipsPage } from './pages/intern/InternshipsPage';
import { ApplicationsPage } from './pages/intern/ApplicationsPage';
import { MessagesPage } from './pages/MessagesPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: '/',
            element: <HomePage />,
          },
          {
            path: '/dashboard',
            element: <DashboardPage />,
          },
          // Client routes
          {
            element: <ProtectedRoute allowedRoles={['client']} />,
            children: [
              {
                path: '/search-advocates',
                element: <SearchAdvocatesPage />,
              },
              {
                path: '/book-appointment/:advocateId',
                element: <BookAppointmentPage />,
              },
            ],
          },
          // Advocate routes
          {
            element: <ProtectedRoute allowedRoles={['advocate']} />,
            children: [
              {
                path: '/post-internship',
                element: <PostInternshipPage />,
              },
              {
                path: '/case-requests',
                element: <CaseRequestsPage />,
              },
            ],
          },
          // Intern routes
          {
            element: <ProtectedRoute allowedRoles={['intern']} />,
            children: [
              {
                path: '/internships',
                element: <InternshipsPage />,
              },
              {
                path: '/applications',
                element: <ApplicationsPage />,
              },
            ],
          },
          // Shared routes
          {
            path: '/messages',
            element: <MessagesPage />,
          },
          {
            path: '/profile',
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
