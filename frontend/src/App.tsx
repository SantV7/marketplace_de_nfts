import { RouterProvider } from '@tanstack/react-router';
import { useEffect } from 'react';
import { router } from './routes';
import '@fontsource/roboto-mono/400.css';
import '@fontsource/roboto-mono/500.css';
import '@fontsource/roboto-mono/700.css';
import './styles/global.css';

export default function App() {
  useEffect(() => {
    const onSessionExpired = () => {
      const redirect = `${window.location.pathname}${window.location.search}`;
      if (redirect.startsWith('/login') || redirect.startsWith('/register')) return;
      void router.navigate({ to: '/login', search: { redirect } });
    };
    window.addEventListener('kurio:session-expired', onSessionExpired);
    return () => window.removeEventListener('kurio:session-expired', onSessionExpired);
  }, []);
  return <RouterProvider router={router} />;
}
