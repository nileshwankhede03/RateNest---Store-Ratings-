import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { roleLabel } from '../utils';

const navByRole = {
  ADMIN: [
    { to: '/dashboard', label: 'Overview', icon: '▦' },
    { to: '/users', label: 'Users', icon: '♙' },
    { to: '/stores-admin', label: 'Stores', icon: '⌂' },
  ],
  USER: [{ to: '/dashboard', label: 'Explore stores', icon: '⌕' }],
  OWNER: [{ to: '/dashboard', label: 'Store overview', icon: '▦' }],
};

export default function Shell({ user, onLogout, children }) {
  const navigate = useNavigate();
  const role = String(user?.role || '').toUpperCase();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">R</span>
          <span>RateNest</span>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav">
          {(navByRole[role] || []).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="profile-mini">
            <div className="avatar">
              {(user?.name || 'U').slice(0, 1).toUpperCase()}
            </div>
            <div className="profile-copy">
              <strong>{user?.name || 'User'}</strong>
              <span>{roleLabel(role)}</span>
            </div>
          </div>
          <button
            className="nav-link plain"
            onClick={() => navigate('/settings')}
          >
            <span className="nav-icon">⚙</span>Account settings
          </button>
          <button className="nav-link plain logout" onClick={onLogout}>
            <span className="nav-icon">↪</span>Log out
          </button>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div>
            <span className="breadcrumb-muted">Workspace</span>
            <span className="breadcrumb-sep">/</span>
            <strong>{roleLabel(role)} portal</strong>
          </div>
          <div className="topbar-right">
            <span className="online-dot"></span>
            <span>Connected workspace</span>
            <div className="avatar avatar-small">
              {(user?.name || 'U').slice(0, 1).toUpperCase()}
            </div>
          </div>
        </header>
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}
