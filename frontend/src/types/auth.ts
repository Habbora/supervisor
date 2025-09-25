// Tipos relacionados à autenticação
export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
  }
  
  export type UserCreate = Omit<User, "id"> & { 
    password: string 
  };
  
  export interface LoginRequest {
    email: string;
    password: string;
  }
  
  export interface LoginResponse {
    user: User;
    token: string;
  }
  
  export interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
  }