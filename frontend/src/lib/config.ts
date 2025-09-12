// Configurações do backend
export const BACKEND_CONFIG = {
  // URL base do backend
  BASE_URL: process.env.BACKEND_URL || 'http://localhost:4001',
  
  // Timeout das requisições (em ms)
  TIMEOUT: 10000,
  
  // Headers padrão
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Rotas específicas que precisam de tratamento especial
  SPECIAL_ROUTES: {
    // Rotas que não devem ir para o backend
    EXCLUDE: [
      '/api/health',
      '/api/status'
    ] as string[],
    
    // Rotas que precisam de transformação
    TRANSFORM: {
      '/api/controllers': '/api/v1/controllers'
    } as Record<string, string>
  }
} as const;

// Função para obter URL completa do backend
export function getBackendUrl(path: string): string {
  const transformedPath = BACKEND_CONFIG.SPECIAL_ROUTES.TRANSFORM[path] || path;
  return `${BACKEND_CONFIG.BASE_URL}${transformedPath}`;
}
