import { RouterProvider } from '@tanstack/react-router';
import { router } from './routes';
import '@fontsource/roboto-mono/400.css';
import '@fontsource/roboto-mono/500.css';
import '@fontsource/roboto-mono/700.css';
import './styles/global.css'

export default function App() {
  return <RouterProvider router={router} />;
}