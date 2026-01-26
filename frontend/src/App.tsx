import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import './App.css';
import MainLayout from './components/main-layout';
import AttributesPage from './components/pages/attributes-page';
import EditorPage from './components/pages/editor-page';
import TemplatesPage from './components/pages/templates-page';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<AttributesPage />} />
          <Route path="/attributes" element={<AttributesPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/snippets" element={<EditorPage />} />
          <Route path="/editor" element={<EditorPage />} />
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