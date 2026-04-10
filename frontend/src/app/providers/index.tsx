import { RouterProvider } from 'react-router-dom';
import { router } from '../router';

/**
 * Global application provider that wraps the app with various contexts (Router, Theme, etc.)
 */
export const AppProvider = () => {
  return (
    <RouterProvider router={router} />
  );
};
