import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import Layout from './components/Layout.tsx';
import Feed from './pages/Blog.tsx';
import Changelog from './pages/Changelog.tsx';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/feed" element={<Feed />} />
          <Route path='/changelog' element={<Changelog />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  </React.StrictMode>
);