import React from 'react';

interface ConnectionErrorScreenProps {
  onRetry: () => void;
}

export const ConnectionErrorScreen: React.FC<ConnectionErrorScreenProps> = ({ onRetry }) => (
  <main className="connection-error" role="alert">
    <div className="connection-error-card">
      <span className="connection-error-mark" aria-hidden="true">!</span>
      <h1>No se pudieron cargar tus datos</h1>
      <p>Comprueba tu conexión. La información escolar permanece en la base de datos y no se guardó una copia en este dispositivo.</p>
      <button type="button" onClick={onRetry}>Reintentar conexión</button>
    </div>
  </main>
);
