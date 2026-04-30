import axios from 'axios';
import { msalInstance } from '../auth/msal-instance';
import { useTenantStore } from '@/stores/tenant-store';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:8000';
const EXCLUDED_TENANT_ROUTES = ["/tenants"];

const getPathname = (config: any) => {
  try {
    return new URL(config.url ?? "", config.baseURL).pathname;
  } catch {
    return config.url ?? "";
  }
};


export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add authorization header with access token & tenant ID with store value
msalInstance.initialize().then(() => {
  api.interceptors.request.use(
    async (config) => {
      const account = msalInstance.getActiveAccount();
      if (account) {
        const tokenResponse = await msalInstance.acquireTokenSilent({
          scopes: [`api://${import.meta.env.VITE_AZURE_CLIENT_ID}/access_as_user`],
          account,
        });
        config.headers['Authorization'] = `Bearer ${tokenResponse.accessToken}`;
      } else {
        console.warn('No active account found. User might not be logged in.');
      }

      // Check if the request URL is in the excluded routes list
      const pathname = getPathname(config);
      const isExcluded = EXCLUDED_TENANT_ROUTES.some(route =>
        pathname.startsWith(route)
      );

      if (isExcluded) {
        return config;
      }

      const { currentTenantId } = useTenantStore.getState();
      if (currentTenantId) {
        config.headers['X-Tenant-Id'] = currentTenantId;
      } else {
        console.warn('Current tenant ID not found. API call may fail.');
      }

      return config;
    }, (error) => Promise.reject(error)
  )
});


// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);