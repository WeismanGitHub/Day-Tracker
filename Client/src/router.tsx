import { createBrowserRouter } from 'react-router-dom';

import Home from './pages/home.tsx';
import Auth from './pages/auth.tsx';

const router = createBrowserRouter([
    { path: '/', element: <Home /> },
    { path: '/auth', element: <Auth /> },
]);

export default router;
