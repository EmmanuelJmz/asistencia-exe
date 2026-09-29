import React from 'react';

interface LoadingScreenProps {
  message: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => (
  <main
    className="loading-screen"
    role="status"
    aria-live="polite"
    aria-busy="true"
    aria-label={message}
  >
    <span className="sr-only">{message}</span>
    <div className="loading-shell" aria-hidden="true">
      <div className="loading-header">
        <div className="loading-mark loading-shimmer" />
        <div className="loading-heading">
          <div className="loading-line loading-shimmer" />
          <div className="loading-line loading-line-short loading-shimmer" />
        </div>
        <div className="loading-control loading-shimmer" />
      </div>
      <div className="loading-nav">
        {[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="loading-nav-item loading-shimmer" />)}
      </div>
      <div className="loading-content">
        <div className="loading-line loading-title loading-shimmer" />
        <div className="loading-stats">
          {[1, 2, 3].map((item) => <div key={item} className="loading-stat loading-shimmer" />)}
        </div>
        <div className="loading-table">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="loading-row">
              <span className="loading-cell loading-cell-short loading-shimmer" />
              <span className="loading-cell loading-shimmer" />
              <span className="loading-cell loading-shimmer" />
              <span className="loading-cell loading-cell-short loading-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </main>
);
