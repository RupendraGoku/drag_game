import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout } from './components/layout/AdminLayout.jsx';
import { Loader } from './components/common/Loader.jsx';
import { ProtectedRoute } from './components/common/ProtectedRoute.jsx';

const CreateGenrePage = lazy(() => import('./pages/CreateGenrePage.jsx').then((module) => ({ default: module.CreateGenrePage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx').then((module) => ({ default: module.DashboardPage })));
const EditGenrePage = lazy(() => import('./pages/EditGenrePage.jsx').then((module) => ({ default: module.EditGenrePage })));
const GenreListPage = lazy(() => import('./pages/GenreListPage.jsx').then((module) => ({ default: module.GenreListPage })));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx').then((module) => ({ default: module.LoginPage })));
const PreviewGenrePage = lazy(() => import('./pages/PreviewGenrePage.jsx').then((module) => ({ default: module.PreviewGenrePage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx').then((module) => ({ default: module.SettingsPage })));

export default function App() {
  return (
    <Suspense fallback={<Loader label="Loading page" />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/genres" element={<GenreListPage />} />
            <Route path="/genres/create" element={<CreateGenrePage />} />
            <Route path="/genres/:id/edit" element={<EditGenrePage />} />
            <Route path="/genres/:id/preview" element={<PreviewGenrePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
