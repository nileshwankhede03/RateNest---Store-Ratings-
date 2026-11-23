import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import { StoresPage, UsersPage } from './pages/Admin';
import Settings from './pages/Settings';
import Shell from './components/Shell';

function PrivateRoute({ session, onLogout, Page, adminOnly = false }) {
  if (!session?.token) {
    return <Navigate to="/login" replace />;
  }

  const user = session.user || {};
  const role = String(user.role || '').toUpperCase();

  if (adminOnly && role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Shell user={user} onLogout={onLogout}>
      <Page user={user} />
    </Shell>
  );
}

export default function App() {
  const [session, setSession] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('sr_session') || 'null');
      if (stored?.token) {
        localStorage.setItem('sr_token', stored.token);
      }
      return stored && typeof stored === 'object' ? stored : null;
    } catch {
      localStorage.removeItem('sr_session');
      localStorage.removeItem('sr_token');
      return null;
    }
  });

  const navigate = useNavigate();

  // Keep the persisted session in sync with React state.
  useEffect(() => {
    if (session?.token) {
      localStorage.setItem('sr_session', JSON.stringify(session));
      localStorage.setItem('sr_token', session.token);
    } else {
      localStorage.removeItem('sr_session');
      localStorage.removeItem('sr_token');
    }
  }, [session]);

  const login = ({ token, user }) => {
    if (!token) {
      throw new Error(
        'Login response did not include an authentication token.',
      );
    }

    const nextSession = { token, user: user || {} };

    localStorage.setItem('sr_session', JSON.stringify(nextSession));
    localStorage.setItem('sr_token', token);
    setSession(nextSession);
  };

  const logout = () => {
    localStorage.removeItem('sr_session');
    localStorage.removeItem('sr_token');
    setSession(null);
    navigate('/login', { replace: true });
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          session?.token ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Auth onLogin={login} />
          )
        }
      />
      <Route
        path="/signup"
        element={
          session?.token ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Auth onLogin={login} />
          )
        }
      />
      <Route
        path="/"
        element={
          <Navigate to={session?.token ? '/dashboard' : '/login'} replace />
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute session={session} onLogout={logout} Page={Dashboard} />
        }
      />
      <Route
        path="/users"
        element={
          <PrivateRoute
            session={session}
            onLogout={logout}
            Page={UsersPage}
            adminOnly
          />
        }
      />
      <Route
        path="/stores-admin"
        element={
          <PrivateRoute
            session={session}
            onLogout={logout}
            Page={StoresPage}
            adminOnly
          />
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute session={session} onLogout={logout} Page={Settings} />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
