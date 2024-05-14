import { createBrowserRouter } from 'react-router-dom';
import RequireAuthentication from './require-auth.tsx';

import Home from './pages/home.tsx';
import Auth from './pages/auth.tsx';
import Account from './pages/account.tsx';

const router = createBrowserRouter([
    { path: '/', element: <Home /> },
    { path: '/auth', element: <Auth /> },
    { path: '/account', element: <RequireAuthentication element={<Account />} /> },
]);

export default router;
