import React, { useEffect, useState } from 'react';
import { api, unwrapList } from '../services/api';
import { getErrorMessage, roleLabel } from '../utils';
import Modal from '../components/Modal';
import Field from '../components/Field';

function useLoad(loader, deps = []) {
  const [items, setItems] = useState([]),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(true);
  const reload = () => {
    setLoading(true);
    loader()
      .then((r) => setItems(unwrapList(r)))
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    reload();
  }, deps);
  return { items, error, setError, loading, reload };
}
function UserForm({ onClose, onSaved }) {
  const [f, setF] = useState({
      name: '',
      email: '',
      address: '',
      password: '',
      role: 'USER',
    }),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const change = (e) => setF({ ...f, [e.target.name]: e.target.value });
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.createUser(f);
      onSaved();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal title="Add a user" onClose={onClose}>
      <form className="form-stack" onSubmit={save}>
        <Field
          label="Full name"
          name="name"
          value={f.name}
          onChange={change}
          minLength={20}
          maxLength={60}
          required
        />
        <Field
          label="Email"
          name="email"
          type="email"
          value={f.email}
          onChange={change}
          required
        />
        <Field
          label="Address"
          name="address"
          value={f.address}
          onChange={change}
          maxLength={400}
          required
        />
        <Field
          label="Temporary password"
          name="password"
          type="password"
          value={f.password}
          onChange={change}
          required
        />
        <label className="field">
          <span className="field-label">Role</span>
          <select
            className="input"
            name="role"
            value={f.role}
            onChange={change}
          >
            <option value="USER">Normal user</option>
            <option value="ADMIN">Administrator</option>
            <option value="OWNER">Store owner</option>
          </select>
        </label>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Creating…' : 'Create user'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
function StoreForm({ onClose, onSaved }) {
  const [f, setF] = useState({
      name: '',
      email: '',
      address: '',
      owner_id: '',
    }),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const change = (e) => setF({ ...f, [e.target.name]: e.target.value });
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.createStore({
        ...f,
        owner_id: f.owner_id ? Number(f.owner_id) : undefined,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal title="Add a store" onClose={onClose}>
      <form className="form-stack" onSubmit={save}>
        <Field
          label="Store name"
          name="name"
          value={f.name}
          onChange={change}
          required
        />
        <Field
          label="Store email"
          name="email"
          type="email"
          value={f.email}
          onChange={change}
          required
        />
        <Field
          label="Address"
          name="address"
          value={f.address}
          onChange={change}
          maxLength={400}
          required
        />
        <Field
          label="Owner user ID"
          name="owner_id"
          type="number"
          value={f.owner_id}
          onChange={change}
          hint="Create the store owner account first, then enter their user ID."
        />
        {error && <div className="alert alert-error">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Creating…' : 'Create store'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
export function UsersPage() {
  const [search, setSearch] = useState(''),
    [role, setRole] = useState(''),
    [modal, setModal] = useState(false);
  const { items, error, loading, reload } = useLoad(
    () => api.getUsers({ search, role }),
    [search, role],
  );
  return (
    <>
      <div className="page-title-row">
        <div>
          <div className="eyebrow">DIRECTORY</div>
          <h1>Users</h1>
          <p className="muted">
            Manage normal users, store owners, and administrators.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          ＋ Add user
        </button>
      </div>
      <div className="toolbar">
        <div className="search-box">
          <span>⌕</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or address…"
          />
        </div>
        <select
          className="input filter-select"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">All roles</option>
          <option value="USER">Normal user</option>
          <option value="OWNER">Store owner</option>
          <option value="ADMIN">Administrator</option>
        </select>
        <span className="result-count">{items.length} users</span>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <section className="panel">
        {loading ? (
          <div className="loading-card">Loading users…</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Role</th>
                  <th>User ID</th>
                </tr>
              </thead>
              <tbody>
                {items.map((u, i) => (
                  <tr key={u.id ?? i}>
                    <td className="person-cell">
                      <span className="avatar avatar-table">
                        {(u.name || 'U').slice(0, 1).toUpperCase()}
                      </span>
                      {u.name || '—'}
                    </td>
                    <td>{u.email || '—'}</td>
                    <td className="address-cell">{u.address || '—'}</td>
                    <td>
                      <span className="role-pill">{roleLabel(u.role)}</span>
                    </td>
                    <td>{u.id ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!items.length && (
              <div className="empty-inline">No users found.</div>
            )}
          </div>
        )}
      </section>
      {modal && <UserForm onClose={() => setModal(false)} onSaved={reload} />}
    </>
  );
}
export function StoresPage() {
  const [search, setSearch] = useState(''),
    [modal, setModal] = useState(false);
  const { items, error, loading, reload } = useLoad(
    () => api.getStoresAdmin({ search }),
    [search],
  );
  return (
    <>
      <div className="page-title-row">
        <div>
          <div className="eyebrow">DIRECTORY</div>
          <h1>Stores</h1>
          <p className="muted">
            Manage registered stores and their ownership details.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          ＋ Add store
        </button>
      </div>
      <div className="toolbar">
        <div className="search-box">
          <span>⌕</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stores by name, email or address…"
          />
        </div>
        <span className="result-count">{items.length} stores</span>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <section className="panel">
        {loading ? (
          <div className="loading-card">Loading stores…</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Store</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {items.map((s, i) => (
                  <tr key={s.id ?? i}>
                    <td className="person-cell">
                      <span className="store-avatar small-store">
                        {(s.name || 'S').slice(0, 1).toUpperCase()}
                      </span>
                      {s.name || '—'}
                    </td>
                    <td>{s.email || '—'}</td>
                    <td className="address-cell">{s.address || '—'}</td>
                    <td>
                      <span className="rating-number">
                        ★ {s.average_rating ?? s.rating ?? '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!items.length && (
              <div className="empty-inline">No stores found.</div>
            )}
          </div>
        )}
      </section>
      {modal && <StoreForm onClose={() => setModal(false)} onSaved={reload} />}
    </>
  );
}
