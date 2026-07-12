import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AppProvider } from './context/AppContext';
import { AdminProvider } from './context/AdminContext';

export default function App() {
  return (
    <AppProvider>
      <AdminProvider>
        <RouterProvider router={router} />
      </AdminProvider>
    </AppProvider>
  );
}