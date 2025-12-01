/**
 * Tipos compartilhados para autenticação
 */

export type UserRole = 'super' | 'admin' | 'user' | 'viewer';

export interface JWTPayload {
  id: string;
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  username: string;
  role: UserRole;
}

export interface AuthContext {
  user: AuthenticatedUser;
  token: string;
}
