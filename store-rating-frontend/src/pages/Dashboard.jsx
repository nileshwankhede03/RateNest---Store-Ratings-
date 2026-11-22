import React, { useEffect, useMemo, useState } from 'react';
import { api, unwrapList } from '../services/api';
import { formatRating, getErrorMessage } from '../utils';
import RatingStars from '../components/RatingStars';
import Modal from '../components/Modal';
import Field from '../components/Field';

function PageTitle({ eyebrow, title, description, action }) {
  return (
    <div className="page-title-row">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p className="muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
function Stat({ label, value, icon, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}
function AdminHome() {
  const [data, setData] = useState(null),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    api
      .adminDashboard()
      .then(setData)
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);
  const d = data?.data || data || {};
  return (
    <>
      <PageTitle
        eyebrow="ADMINISTRATION"
        title="Overview"
        description="Monitor activity across your store rating platform."
      />
      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <div className="loading-card">Loading dashboard…</div>
      ) : (
        <div className="stats-grid">
          <Stat
            label="Total users"
            value={d.totalUsers ?? d.total_users ?? d.users ?? '—'}
            icon="♙"
            sub="Registered accounts"
          />
          <Stat
            label="Total stores"
            value={d.totalStores ?? d.total_stores ?? d.stores ?? '—'}
            icon="⌂"
            sub="Stores on the platform"
          />
          <Stat
            label="Ratings submitted"
            value={d.totalRatings ?? d.total_ratings ?? d.ratings ?? '—'}
            icon="★"
            sub="Community feedback"
          />
        </div>
      )}
      <div className="welcome-card">
        <div>
          <div className="eyebrow light-eyebrow">PLATFORM HEALTH</div>
          <h2>Your store community, at a glance.</h2>
          <p>
            Manage accounts, onboard stores, and keep the rating experience
            running smoothly.
          </p>
        </div>
        <div className="welcome-art">
          <span>✳</span>
          <span>★</span>
          <span>⌂</span>
        </div>
      </div>
    </>
  );
}
function UserHome({ user }) {
  const [stores, setStores] = useState([]),
    [search, setSearch] = useState(''),
    [loading, setLoading] = useState(true),
    [error, setError] = useState('');
  const [ratingStore, setRatingStore] = useState(null),
    [rating, setRating] = useState(0),
    [busy, setBusy] = useState(false);
  const load = () => {
    setLoading(true);
    api
      .getStores({ search })
      .then((r) => setStores(unwrapList(r)))
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [search]);
  const submit = async () => {
    if (!rating) return setError('Please select a rating from 1 to 5.');
    setBusy(true);
    setError('');
    try {
      await api.submitRating({
        store_id: ratingStore.id ?? ratingStore.store_id,
        rating,
      });
      setRatingStore(null);
      setRating(0);
      load();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageTitle
        eyebrow="DISCOVER"
        title={`Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, ${(user?.name || 'there').split(' ')[0]}.`}
        description="Find a store, see what people think, and share your own experience."
      />
      <div className="toolbar">
        <div className="search-box">
          <span>⌕</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stores by name or address…"
          />
        </div>
        <span className="result-count">{stores.length} stores</span>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <div className="loading-card">Finding stores…</div>
      ) : stores.length ? (
        <div className="store-grid">
          {stores.map((s, i) => (
            <article className="store-card" key={s.id ?? s.store_id ?? i}>
              <div className="store-card-top">
                <div className="store-avatar">
                  {(s.name || 'S').slice(0, 1).toUpperCase()}
                </div>
                <span className="store-tag">VERIFIED LISTING</span>
              </div>
              <h3>{s.name || s.store_name || 'Store'}</h3>
              <p className="store-address">
                {s.address || 'Address not provided'}
              </p>
              <div className="rating-line">
                <strong>
                  {formatRating(
                    s.average_rating ?? s.overall_rating ?? s.rating,
                  )}
                </strong>
                <RatingStars
                  value={Math.round(
                    Number(s.average_rating ?? s.overall_rating ?? s.rating) ||
                      0,
                  )}
                />
                <span className="muted tiny">Overall</span>
              </div>
              <div className="store-card-footer">
                <div>
                  <span className="muted tiny">YOUR RATING</span>
                  <strong>
                    {s.user_rating ??
                      s.userRating ??
                      s.submitted_rating ??
                      'Not rated'}
                  </strong>
                </div>
                <button
                  className="btn btn-outline btn-small"
                  onClick={() => {
                    setRatingStore(s);
                    setRating(
                      Number(
                        s.user_rating ?? s.userRating ?? s.submitted_rating,
                      ) || 0,
                    );
                  }}
                >
                  {' '}
                  {s.user_rating || s.userRating || s.submitted_rating
                    ? 'Edit rating'
                    : 'Rate store'}{' '}
                  <span>→</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">⌂</div>
          <h3>No stores found</h3>
          <p>Try another name or address.</p>
        </div>
      )}
      {ratingStore && (
        <Modal
          title={`Rate ${ratingStore.name || ratingStore.store_name || 'this store'}`}
          onClose={() => setRatingStore(null)}
        >
          <p className="muted">
            How was your experience? Your rating helps others make better
            decisions.
          </p>
          <div className="rating-picker">
            <RatingStars value={rating} interactive onChange={setRating} />
            <strong>{rating ? `${rating} / 5` : 'Select a rating'}</strong>
          </div>
          <div className="modal-actions">
            <button
              className="btn btn-outline"
              onClick={() => setRatingStore(null)}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              disabled={!rating || busy}
              onClick={submit}
            >
              {busy ? 'Saving…' : 'Submit rating'}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
function OwnerHome() {
  const [data, setData] = useState(null),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    api
      .ownerDashboard()
      .then(setData)
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);
  const d = data?.data || data || {};
  const ratings = unwrapList(d);
  const avg = d.averageRating ?? d.average_rating ?? d.rating ?? '—';
  const people = d.ratings || d.users || d.submissions || ratings;
  return (
    <>
      <PageTitle
        eyebrow="STORE OWNER"
        title="Store overview"
        description="See how customers are rating your store and who has shared feedback."
      />
      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <div className="loading-card">Loading store insights…</div>
      ) : (
        <>
          <div className="stats-grid owner-stats">
            <Stat
              label="Average rating"
              value={formatRating(avg)}
              icon="★"
              sub="Across submitted ratings"
            />
            <Stat
              label="Total reviews"
              value={d.totalRatings ?? d.total_ratings ?? people.length}
              icon="☷"
              sub="Customer submissions"
            />
          </div>
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>Customer ratings</h2>
                <p className="muted">
                  People who submitted a rating for your store.
                </p>
              </div>
              <span className="pill">{people.length} reviews</span>
            </div>
            {people.length ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Email</th>
                      <th>Rating</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {people.map((p, i) => (
                      <tr key={p.id ?? i}>
                        <td className="person-cell">
                          <span className="avatar avatar-table">
                            {(p.name || p.user_name || 'U')
                              .slice(0, 1)
                              .toUpperCase()}
                          </span>
                          {p.name || p.user_name || 'Customer'}
                        </td>
                        <td>{p.email || '—'}</td>
                        <td>
                          <span className="rating-number">
                            ★ {p.rating ?? p.user_rating ?? '—'}
                          </span>
                        </td>
                        <td>
                          {p.created_at
                            ? new Date(p.created_at).toLocaleDateString()
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-inline">
                No ratings have been submitted yet.
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
export default function Dashboard({ user }) {
  const role = String(user?.role || '').toUpperCase();
  if (role === 'ADMIN') return <AdminHome />;
  if (role === 'OWNER') return <OwnerHome />;
  return <UserHome user={user} />;
}
