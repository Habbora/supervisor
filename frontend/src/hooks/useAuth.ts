import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuth = (): boolean => {
    try {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      
      return !!(token && user);
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      return false;
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsAuthenticated(false);
      router.replace("/login");
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  useEffect(() => {
    const auth = checkAuth();
    setIsAuthenticated(auth);
    setIsLoading(false);

    // Se não estiver autenticado, apenas limpar localStorage
    // O redirecionamento será feito pelo ProtectedRoute
    if (!auth) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, []);

  // Verificação contínua
  useEffect(() => {
    if (isLoading) return;

    const interval = setInterval(() => {
      const auth = checkAuth();
      if (auth !== isAuthenticated) {
        setIsAuthenticated(auth);
        if (!auth) {
          // Se perdeu autenticação, limpar localStorage
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
    }, 1000); // Verifica a cada 1 segundo

    return () => clearInterval(interval);
  }, [isAuthenticated, isLoading]);

  return {
    isAuthenticated,
    isLoading,
    logout,
    checkAuth
  };
}; 