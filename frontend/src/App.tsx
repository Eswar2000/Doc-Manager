import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { loginRequest } from './auth/msal-config';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import './App.css';
import MainLayout from './components/main-layout';
import AttributesPage from './components/pages/attributes-page';
import EditorPage from './components/pages/editor-page';
import TemplatesPage from './components/pages/templates-page';
import DocGenerationPage from './components/pages/doc-generation-page';
import LoginPage from './components/pages/login-page';

export default function App() {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const handleLogin = async () => {
    try {
      await instance.loginRedirect(loginRequest); 
      // or use loginRedirect() if you prefer redirect flow
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />
        <Route element={
          isAuthenticated ? (
              <MainLayout />
            ) : (
              <Navigate to="/login" replace />
            )
        }>
          <Route path="/" element={<AttributesPage />} />
          <Route path="/attributes" element={<AttributesPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/snippets" element={<EditorPage />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path='/templates/:templateId/generate' element={<DocGenerationPage />} />
        </Route>
      </Routes>

      {/* Toaster for notifications */}
      <Toaster
        richColors
        position="bottom-left"
        closeButton
        duration={3000}
        
      />
    </BrowserRouter>
  )
}