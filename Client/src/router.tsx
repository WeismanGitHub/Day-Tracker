import { createBrowserRouter } from 'react-router-dom';
import { RequireAuthentication } from './helpers.ts';

import Account from './pages/account.tsx';
import Chart from './pages/chart.tsx';
import About from './pages/about.tsx';
import Home from './pages/home.tsx';
import Auth from './pages/auth.tsx';
import Example from './example.tsx';

const router = createBrowserRouter([
    { path: '/', element: <RequireAuthentication element={<Home />} /> },
    { path: '/auth', element: <Auth /> },
    { path: '/about', element: <About /> },
    { path: '/example', element: <Example /> },
    { path: '/account', element: <RequireAuthentication element={<Account />} /> },
    { path: '/charts/:chartId', element: <RequireAuthentication element={<Chart />} /> },
]);

export default router;
