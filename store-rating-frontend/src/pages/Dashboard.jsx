import React, { useCallback, useEffect, useState } from 'react';
import { api, unwrapList } from '../services/api';
import { formatRating, getErrorMessage } from '../utils';
import RatingStars from '../components/RatingStars';
import Modal from '../components/Modal';

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
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .adminDashboard()
      .then(setData)
      .catch((error) => setError(getErrorMessage(error)))
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

function getOverallRating(store) {
  return store.overallRating ?? null;
}

function getMyRating(store) {
  return (
    store.myRating ??
    store.my_rating ??
    store.user_rating ??
    store.userRating ??
    store.submitted_rating ??
    null
  );
}

function hasRating(value) {
  return value !== null && value !== undefined && value !== '';
}

function UserHome({ user }) {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ratingStore, setRatingStore] = useState(null);
  const [rating, setRating] = useState(0);
  const [busy, setBusy] = useState(false);

  // Fetch stores and refresh the list after a rating is submitted/updated.
  const loadStores = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.getStores({ search });
      const storeList = unwrapList(response);
      setStores(storeList);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadStores();
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [loadStores]);

  const openRatingModal = (store) => {
    const existingRating = getMyRating(store);
    setRatingStore(store);
    setRating(hasRating(existingRating) ? Number(existingRating) : 0);
    setError('');
  };

  const submitRating = async () => {
    if (!ratingStore) return;

    if (!rating || rating < 1 || rating > 5) {
      setError('Please select a rating from 1 to 5.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      await api.submitRating({
        store_id: ratingStore.id ?? ratingStore.store_id,
        rating,
      });

      setRatingStore(null);
      setRating(0);

      // Reload from the GET stores API so the UI displays the latest
      // overallRating and myRating values returned by the backend.
      await loadStores();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12 ? 'morning' : greetingHour < 17 ? 'afternoon' : 'evening';
  const firstName = (user?.name || 'there').split(' ')[0];

  return (
    <>
      <PageTitle
        eyebrow="DISCOVER"
        title={`Good ${greeting}, ${firstName}.`}
        description="Find a store, see what people think, and share your own experience."
      />

      <div className="toolbar">
        <div className="search-box">
          <span>⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search stores by name or address…"
          />
        </div>
        <span className="result-count">{stores.length} stores</span>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-card">Finding stores…</div>
      ) : stores.length > 0 ? (
        <div className="store-grid">
          {stores.map((store, index) => {
            const overallRating = getOverallRating(store);
            const myRating = getMyRating(store);
            const userHasRated = hasRating(myRating);

            return (
              <article
                className="store-card"
                key={store.id ?? store.store_id ?? index}
              >
                <div className="store-card-top">
                  <div className="store-avatar">
                    {(store.name || store.store_name || 'S')
                      .slice(0, 1)
                      .toUpperCase()}
                  </div>
                  <span className="store-tag">VERIFIED LISTING</span>
                </div>

                <h3>{store.name || store.store_name || 'Store'}</h3>
                <p className="store-address">
                  {store.address || 'Address not provided'}
                </p>

                {/* Overall rating from API: overallRating */}
                <div className="rating-line">
                  <strong>{formatRating(overallRating)}</strong>
                  <RatingStars value={Math.round(Number(overallRating) || 0)} />
                  <span className="muted tiny">Overall</span>
                </div>

                {/* Logged-in user's rating from API: myRating */}
                <div className="store-card-footer">
                  <div>
                    <span className="muted tiny">YOUR RATING</span>
                    <strong>{userHasRated ? myRating : 'Not rated'}</strong>
                  </div>

                  <button
                    type="button"
                    className="btn btn-outline btn-small"
                    onClick={() => openRatingModal(store)}
                  >
                    {userHasRated ? 'Edit rating' : 'Rate store'}
                    <span>→</span>
                  </button>
                </div>
              </article>
            );
          })}
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
              type="button"
              className="btn btn-outline"
              onClick={() => setRatingStore(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!rating || busy}
              onClick={submitRating}
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
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .ownerDashboard()
      .then(setData)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const d = data?.data || data || {};
  const ratings = unwrapList(d);
  const averageRating =
    d.averageRating ?? d.average_rating ?? d.overallRating ?? d.rating ?? '—';
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
              value={formatRating(averageRating)}
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

            {people.length > 0 ? (
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
                    {people.map((person, index) => (
                      <tr key={person.id ?? index}>
                        <td className="person-cell">
                          <span className="avatar avatar-table">
                            {(person.name || person.user_name || 'U')
                              .slice(0, 1)
                              .toUpperCase()}
                          </span>
                          {person.name || person.user_name || 'Customer'}
                        </td>
                        <td>{person.email || '—'}</td>
                        <td>
                          <span className="rating-number">
                            ★ {person.rating ?? person.user_rating ?? '—'}
                          </span>
                        </td>
                        <td>
                          {person.created_at
                            ? new Date(person.created_at).toLocaleDateString()
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
