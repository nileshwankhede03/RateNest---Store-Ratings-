import React from 'react';
export default function Field({ label, error, hint, ...props }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input className={`input ${error ? 'input-error' : ''}`} {...props} />
      {hint && <small className="field-hint">{hint}</small>}
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}
