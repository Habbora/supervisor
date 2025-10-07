export interface IService {
  // Métodos obrigatórios
  initialize(): Promise<void>;
  destroy?(): Promise<void>;
  
  // Estado do serviço
  readonly isInitialized: boolean;
  readonly serviceName: string;
} 