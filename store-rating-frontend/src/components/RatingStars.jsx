import React from 'react';
export default function RatingStars({
  value = 0,
  interactive = false,
  onChange,
}) {
  const current = Number(value) || 0;
  return (
    <div
      className={`stars ${interactive ? 'stars-interactive' : ''}`}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={`${current} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          className={n <= current ? 'star active' : 'star'}
          onClick={() => onChange?.(n)}
          aria-label={`${n} stars`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
