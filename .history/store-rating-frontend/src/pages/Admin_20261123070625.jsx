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
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [modal, setModal] = useState(false);

  // Fetch all users once
  const { items, error, loading, reload } = useLoad(() => api.getUsers(), []);

  // Client-side search and role filtering
  const normalizedSearch = search.trim().toLowerCase();

  const filteredUsers = items.filter((user) => {
    const matchesSearch = [user.name, user.email, user.address, user.id].some(
      (value) =>
        String(value ?? '')
          .toLowerCase()
          .includes(normalizedSearch),
    );

    const matchesRole = !role || user.role === role;

    return matchesSearch && matchesRole;
  });

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
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or address..."
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

        <span className="result-count">{filteredUsers.length} users</span>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <section className="panel">
        {loading ? (
          <div className="loading-card">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⌕</div>

            <h3>
              {search.trim() || role
                ? 'No matching users found'
                : 'No users available'}
            </h3>

            <p>
              {search.trim() || role
                ? `We couldn't find any users matching your search or selected role. Try different filters.`
                : 'There are no registered users yet.'}
            </p>

            {(search || role) && (
              <button
                className="btn btn-outline"
                onClick={() => {
                  setSearch('');
                  setRole('');
                }}
              >
                Clear filters
              </button>
            )}
          </div>
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
                {filteredUsers.map((user, index) => (
                  <tr key={user.id ?? index}>
                    <td className="person-cell">
                      <span className="avatar avatar-table">
                        {(user.name || 'U').slice(0, 1).toUpperCase()}
                      </span>
                      {user.name || '—'}
                    </td>

                    <td>{user.email || '—'}</td>

                    <td className="address-cell">{user.address || '—'}</td>

                    <td>
                      <span className="role-pill">{roleLabel(user.role)}</span>
                    </td>

                    <td>{user.id ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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

  // Also filter on the client so the empty state works even when the API
  // returns the full list without applying the search query.
  const normalizedSearch = search.trim().toLowerCase();
  const filteredStores = normalizedSearch
    ? items.filter((store) =>
        [store.name, store.store_name, store.email, store.address].some(
          (value) =>
            String(value || '')
              .toLowerCase()
              .includes(normalizedSearch),
        ),
      )
    : items;

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
        <span className="result-count">{filteredStores.length} stores</span>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <section className="panel">
        {loading ? (
          <div className="loading-card">Loading stores…</div>
        ) : filteredStores.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⌕</div>
            <h3>
              {normalizedSearch
                ? 'No matching stores found'
                : 'No stores added yet'}
            </h3>
            <p>
              {normalizedSearch
                ? `We couldn't find any stores matching “${search.trim()}”. Try a different name, email or address.`
                : 'Add your first store to get started.'}
            </p>
            {normalizedSearch && (
              <button className="btn btn-outline" onClick={() => setSearch('')}>
                Clear search
              </button>
            )}
          </div>
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
                {filteredStores.map((store, i) => (
                  <tr key={store.id ?? store.store_id ?? i}>
                    <td className="person-cell">
                      <span className="store-avatar small-store">
                        {(store.name || store.store_name || 'S')
                          .slice(0, 1)
                          .toUpperCase()}
                      </span>
                      {store.name || store.store_name || '—'}
                    </td>
                    <td>{store.email || '—'}</td>
                    <td className="address-cell">{store.address || '—'}</td>
                    <td>
                      <span className="rating-number">
                        ★{' '}
                        {store.averageRating ??
                          store.average_rating ??
                          store.overallRating ??
                          store.rating ??
                          '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modal && <StoreForm onClose={() => setModal(false)} onSaved={reload} />}
    </>
  );
}
