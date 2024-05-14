import { createBrowserRouter } from 'react-router-dom';

import Home from './pages/home.tsx';
import Auth from './pages/auth.tsx';
import Account from './pages/account.tsx';

const router = createBrowserRouter([
    { path: '/', element: <Home /> },
    { path: '/auth', element: <Auth /> },
    { path: '/account', element: <Account /> },
]);

export default router;
