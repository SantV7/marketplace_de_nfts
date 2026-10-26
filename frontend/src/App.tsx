import { RouterProvider } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from './services/queries';
import { router } from './routes';
import '@fontsource/roboto-mono/latin-400.css';
import '@fontsource/roboto-mono/latin-500.css';
import '@fontsource/roboto-mono/latin-700.css';
import './styles/global.css';

export default function App() {
  const client = useQueryClient();
  useSession();
  useEffect(() => {
    const onSessionExpired = () => {
      client.clear();
      const redirect = `${window.location.pathname}${window.location.search}`;
      if (redirect.startsWith('/login') || redirect.startsWith('/register')) return;
      void router.navigate({ to: '/login', search: { redirect } });
    };
    window.addEventListener('kurio:session-expired', onSessionExpired);
    return () => window.removeEventListener('kurio:session-expired', onSessionExpired);
  }, [client]);
  return <RouterProvider router={router} />;
}
