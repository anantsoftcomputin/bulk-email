import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { initializeSampleData } from './db/database';
import emailQueueService from './services/emailQueue';
import { useAuthStore } from './store/authStore';
import AuthGuard from './components/auth/AuthGuard';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Groups from './pages/Groups';
import Templates from './pages/Templates';
import Campaigns from './pages/Campaigns';
import Analytics from './pages/Analytics';
import SMTPSettings from './pages/SMTPSettings';
import Settings from './pages/Settings';
import EmailQueue from './pages/EmailQueue';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const { initializeAuth, isAuthenticated } = useAuthStore();

  // Initialize Firebase auth listener
  useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => unsubscribe();
  }, []);

  // Initialize local database and queue when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setDbInitialized(false);
      return;
    }

    const initDB = async () => {
      try {
        await initializeSampleData();
        emailQueueService.startProcessing();
        setDbInitialized(true);
      } catch (error) {
        console.error('Error initializing database:', error);
        setDbInitialized(true);
      }
    };
    initDB();

    return () => {
      emailQueueService.stopProcessing();
    };
  }, [isAuthenticated]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                {!dbInitialized ? (
                  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
                    <div className="text-center">
                      <div className="w-14 h-14 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mx-auto"></div>
                      <p className="mt-6 text-gray-500 font-medium">Initializing workspace...</p>
                    </div>
                  </div>
                ) : (
                  <DashboardLayout />
                )}
              </AuthGuard>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="groups" element={<Groups />} />
            <Route path="templates" element={<Templates />} />
            <Route path="campaigns" element={<Campaigns />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="smtp-settings" element={<SMTPSettings />} />
            <Route path="email-queue" element={<EmailQueue />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
