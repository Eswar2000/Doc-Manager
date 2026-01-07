import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import MainLayout from './components/main-layout';
import AttributesPage from './components/pages/attributes-page';
import EditorPage from './components/pages/editor-page';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<AttributesPage />} />
          <Route path="/attributes" element={<AttributesPage />} />
          <Route path="/snippets" element={<EditorPage mode='snippet' />} />

        </Route>
      </Routes>
    </BrowserRouter>
  )
}