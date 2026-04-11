import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useAuthProvider } from './auth/auth-proider.tsx';

const { AuthProvider } = useAuthProvider();


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // retry once on failure
      staleTime: 1000 * 60, // 1 minute data refresh interval
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>
);