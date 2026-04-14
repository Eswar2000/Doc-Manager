import axios from 'axios';
import { msalInstance } from '../auth/msal-instance';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add Authorization header with access token
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