'use client';

import { useAuth } from "@/hooks/useAuth";

export default function AuthDebug() {
  const { isAuthenticated, isLoading, checkAuth } = useAuth();

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  const user = typeof window !== 'undefined' ? localStorage.getItem("user") : null;

  return (
    <div className="fixed top-4 right-4 bg-black text-white p-4 rounded-lg text-xs z-50">
      <h3 className="font-bold mb-2">Debug Auth:</h3>
      <div>Loading: {isLoading ? 'Sim' : 'Não'}</div>
      <div>Autenticado: {isAuthenticated ? 'Sim' : 'Não'}</div>
      <div>Token: {token ? 'Sim' : 'Não'}</div>
      <div>User: {user ? 'Sim' : 'Não'}</div>
      <button 
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.reload();
        }}
        className="mt-2 bg-red-600 px-2 py-1 rounded text-xs"
      >
        Limpar Auth
      </button>
    </div>
  );
} 