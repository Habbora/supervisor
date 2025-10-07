'use client'

import React from 'react';

const NotImplemented: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="text-6xl mb-4">🚧</div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
        Funcionalidade Não Implementada
      </h1>
      <p className="text-lg text-center" style={{ color: 'var(--color-text-secondary)' }}>
        Esta funcionalidade ainda está em desenvolvimento.
        <br />
        Por favor, tente novamente mais tarde.
      </p>
    </div>
  );
};

export default NotImplemented; 