import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Loader } from './components/common/Loader.jsx';
import { Navbar } from './components/layout/Navbar.jsx';

const GenresPage = lazy(() => import('./pages/GenresPage.jsx').then((module) => ({ default: module.GenresPage })));
const HomePage = lazy(() => import('./pages/HomePage.jsx').then((module) => ({ default: module.HomePage })));
const HowToPlayPage = lazy(() => import('./pages/HowToPlayPage.jsx').then((module) => ({ default: module.HowToPlayPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx').then((module) => ({ default: module.NotFoundPage })));
const PlayGenrePage = lazy(() => import('./pages/PlayGenrePage.jsx').then((module) => ({ default: module.PlayGenrePage })));

export default function App() {
  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <Navbar />
      <Suspense fallback={<Loader label="Loading page" />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/genres" element={<GenresPage />} />
          <Route path="/how-to-play" element={<HowToPlayPage />} />
          <Route path="/play/:slug" element={<PlayGenrePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </div>
  );
}
