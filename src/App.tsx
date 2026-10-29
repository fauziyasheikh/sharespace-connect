import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { AppProvider, useApp } from './context/AppContext';
import { BrowsePage } from './pages/BrowsePage';
import { LoginPage } from './pages/LoginPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { MyListingsPage } from './pages/MyListingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { ResourcePage } from './pages/ResourcePage';

function RequireAuth({ children }: { children: React.ReactElement }) {
  const { currentUser } = useApp();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppRoutes() {
  const { currentUser } = useApp();

  return (
    <div className="min-h-screen bg-[#F7FBFA] text-[#0F2A2E] dark:bg-[#0B1415] dark:text-[#E6F4F2] transition-colors duration-150 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <BrowsePage />
              </RequireAuth>
            }
          />
          <Route
            path="/bookings"
            element={
              <RequireAuth>
                <MyBookingsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/listings"
            element={
              <RequireAuth>
                <MyListingsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />
          <Route
            path="/resource/:id"
            element={
              <RequireAuth>
                <ResourcePage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to={currentUser ? '/' : '/login'} replace />} />
        </Routes>
      </div>
      <footer className="border-t border-[#0F2A2E]/8 dark:border-[#E6F4F2]/10 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#0F2A2E]/55 dark:text-[#E6F4F2]/55">
          <span>ShareSpace · Use what exists. Share what matters.</span>
          <span>Campus Sharing Network · Connected to Supabase</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
