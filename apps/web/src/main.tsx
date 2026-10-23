import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App.tsx';
import { BrowserRouter } from 'react-router';
import AuthProvider from './features/auth/AuthProvider';

// One QueryClient for the whole app: it stores and shares all fetched data
const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Makes TanStack Query available to every component inside */}
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* NEW: every page inside can now read who's logged in */}
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
