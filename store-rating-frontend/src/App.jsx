import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import { StoresPage, UsersPage } from './pages/Admin';
import Settings from './pages/Settings';
import Shell from './components/Shell';

/**
 * Keep all session-dependent reads inside this component.
 * Route JSX is evaluated before a wrapper's children are rendered, so
 * writing session.user directly inside <Protected> previously crashed
 * when the app first loaded with session === null.
 */
function PrivateRoute({ session, onLogout, Page, adminOnly = false }) {
  if (!session?.token) {
    return <Navigate to="/login" replace />;
  }

  // A token can exist without a parsed user object in older/local sessions.
  // Keep the layout safe and let role-based pages handle a missing role.
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
      return stored && typeof stored === 'object' ? stored : null;
    } catch {
      return null;
    }
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (session?.token) {
      localStorage.setItem('sr_session', JSON.stringify(session));
      localStorage.setItem('sr_token', session.token);
    } else {
      localStorage.removeItem('sr_session');
      localStorage.removeItem('sr_token');
    }
  }, [session]);

  const login = ({ token, user }) => setSession({ token, user: user || {} });

  const logout = () => {
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
