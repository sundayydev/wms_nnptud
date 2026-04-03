import { createBrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import CategoryPage from '../pages/category/CategoryPage';

const router = createBrowserRouter([
  // Auth routes
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },

  // Category routes
  {
    path: '/categories',
    element: <CategoryPage />,
  },

  // Default redirect
  {
    path: '/',
    element: <LoginPage />,
  },
]);

export default router;
