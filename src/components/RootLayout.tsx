import { Outlet } from 'react-router-dom';
import { AuthProvider } from '../lib/auth';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
