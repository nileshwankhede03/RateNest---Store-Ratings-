import React, { useState } from 'react';
import Field from '../components/Field';
import { api } from '../services/api';
import { getErrorMessage, validatePassword } from '../utils';
export default function Settings() {
  const [f, setF] = useState({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }),
    [error, setError] = useState(''),
    [success, setSuccess] = useState(''),
    [busy, setBusy] = useState(false);
  const change = (e) => setF({ ...f, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const invalid = validatePassword(f.newPassword);
    if (invalid) return setError(invalid);
    if (f.newPassword !== f.confirmPassword)
      return setError('New password and confirmation do not match.');
    setBusy(true);
    try {
      await api.updatePassword({
        currentPassword: f.currentPassword,
        newPassword: f.newPassword,
      });
      setSuccess('Password updated successfully.');
      setF({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <div className="page-title-row">
        <div>
          <div className="eyebrow">PREFERENCES</div>
          <h1>Account settings</h1>
          <p className="muted">
            Keep your account secure by updating your password.
          </p>
        </div>
      </div>
      <section className="panel settings-panel">
        <div className="panel-heading">
          <div>
            <h2>Change password</h2>
            <p className="muted">
              Choose a strong password you don't use elsewhere.
            </p>
          </div>
          <span className="settings-lock">⌑</span>
        </div>
        <form className="form-stack settings-form" onSubmit={submit}>
          <Field
            label="Current password"
            type="password"
            name="currentPassword"
            value={f.currentPassword}
            onChange={change}
            required
          />
          <Field
            label="New password"
            type="password"
            name="newPassword"
            value={f.newPassword}
            onChange={change}
            required
            hint="8–16 characters, at least one uppercase letter and one special character."
          />
          <Field
            label="Confirm new password"
            type="password"
            name="confirmPassword"
            value={f.confirmPassword}
            onChange={change}
            required
          />
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </section>
    </>
  );
}
