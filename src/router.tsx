import { createBrowserRouter } from 'react-router-dom';
import RootLayout from './components/RootLayout';
import AuthGuard from './components/AuthGuard';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MerchantList from './pages/merchants/MerchantList';
import MerchantCreate from './pages/merchants/MerchantCreate';
import MerchantDetail from './pages/merchants/MerchantDetail';
import UserList from './pages/users/UserList';
import AtRiskUsers from './pages/users/AtRiskUsers';
import UserDetail from './pages/users/UserDetail';
import ReservationList from './pages/reservations/ReservationList';
import ReservationDetail from './pages/reservations/ReservationDetail';
import BoxList from './pages/boxes/BoxList';
import BoxDetail from './pages/boxes/BoxDetail';

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
      {
        element: <AuthGuard />,
        children: [
          {
            element: <Layout />,
            children: [
              { index: true, element: <Dashboard /> },
              { path: 'merchants', element: <MerchantList /> },
              { path: 'merchants/new', element: <MerchantCreate /> },
              { path: 'merchants/:id', element: <MerchantDetail /> },
              { path: 'users', element: <UserList /> },
              { path: 'users/at-risk', element: <AtRiskUsers /> },
              { path: 'users/:id', element: <UserDetail /> },
              { path: 'reservations', element: <ReservationList /> },
              { path: 'reservations/:id', element: <ReservationDetail /> },
              { path: 'boxes', element: <BoxList /> },
              { path: 'boxes/:id', element: <BoxDetail /> },
            ],
          },
        ],
      },
    ],
  },
]);

export default router;
