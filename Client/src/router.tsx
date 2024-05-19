import { createBrowserRouter } from 'react-router-dom';
import RequireAuthentication from './require-auth.tsx';

import Account from './pages/account.tsx';
import Chart from './pages/chart.tsx';
import Home from './pages/home.tsx';
import Auth from './pages/auth.tsx';

const router = createBrowserRouter([
    { path: '/', element: <RequireAuthentication element={<Home />} /> },
    { path: '/auth', element: <Auth /> },
    { path: '/account', element: <RequireAuthentication element={<Account />} /> },
    { path: '/charts/:chartId', element: <RequireAuthentication element={<Chart />} /> },
]);

export default router;
