import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Field from '../components/Field';
import { api } from '../services/api';
import {
  getErrorMessage,
  getTokenFromResponse,
  getUserFromResponse,
  validateAddress,
  validateEmail,
  validateName,
  validatePassword,
} from '../utils';

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const validation =
      mode === 'signup'
        ? validateName(form.name) ||
          validateEmail(form.email) ||
          validateAddress(form.address) ||
          validatePassword(form.password)
        : validateEmail(form.email) ||
          (!form.password ? 'Password is required.' : '');
    if (validation) return setError(validation);
    setBusy(true);
    try {
      const data =
        mode === 'login'
          ? await api.login({ email: form.email, password: form.password })
          : await api.signup(form);
      if (mode === 'signup') {
        setMode('login');
        setError('');
        setForm({ ...form, password: '' });
        alert('Account created. Please log in.');
      } else {
        const token = getTokenFromResponse(data);
        const user = getUserFromResponse(data);
        if (!token)
          throw new Error(
            'Login response did not include a token. Check your backend login response.',
          );
        onLogin({ token, user });
        navigate('/dashboard');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="auth-layout">
      <div className="auth-visual">
        <div className="brand brand-light">
          <span className="brand-mark">R</span>
          <span>RateNest</span>
        </div>
        <div className="visual-copy">
          <div className="eyebrow light-eyebrow">A BETTER WAY TO CHOOSE</div>
          <h1>
            Good decisions
            <br />
            start with <em>honest</em>
            <br />
            ratings.
          </h1>
          <p>
            Discover trusted local stores, share your experience, and help your
            community shop smarter.
          </p>
        </div>
        <div className="visual-foot">
          <span>✳</span> Built for customers, owners & administrators
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-form-wrap">
          <div className="eyebrow">
            {mode === 'login' ? 'WELCOME BACK' : 'JOIN RATENEST'}
          </div>
          <h2>
            {mode === 'login'
              ? 'Sign in to your account'
              : 'Create your account'}
          </h2>
          <p className="muted">
            {mode === 'login'
              ? 'Enter your details to continue to your workspace.'
              : 'Create a normal user account to rate and discover stores.'}
          </p>
          <form onSubmit={submit} className="form-stack">
            {mode === 'signup' && (
              <>
                <Field
                  label="Full name"
                  name="name"
                  value={form.name}
                  onChange={update}
                  placeholder="Your full name"
                  maxLength={60}
                />
                <Field
                  label="Address"
                  name="address"
                  value={form.address}
                  onChange={update}
                  placeholder="Street, city, state"
                  maxLength={400}
                />
              </>
            )}
            <Field
              label="Email address"
              type="email"
              name="email"
              value={form.email}
              onChange={update}
              placeholder="you@example.com"
            />
            <Field
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={update}
              placeholder="Enter your password"
            />
            {mode === 'signup' && (
              <small className="field-hint">
                8–16 characters, one uppercase letter and one special character.
                Name must be 20–60 characters.
              </small>
            )}
            {error && <div className="alert alert-error">{error}</div>}
            <button className="btn btn-primary btn-full" disabled={busy}>
              {busy
                ? 'Please wait…'
                : mode === 'login'
                  ? 'Sign in'
                  : 'Create account'}{' '}
              <span>→</span>
            </button>
          </form>
          <div className="auth-switch">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setMode('signup');
                    setError('');
                  }}
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already registered?{' '}
                <button
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                >
                  Sign in
                </button>
              </>
            )}
          </div>
          <div className="auth-note">Secure access · Role-based workspace</div>
        </div>
      </div>
    </div>
  );
}
