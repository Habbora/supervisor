import { Elysia } from 'elysia';
import type { UserRole } from '../types/auth.types';

/**
 * Middleware de autorização por roles
 * Verifica se o usuário tem permissão baseado em sua role
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return new Elysia({ name: 'require-role' })
    .derive(({ user, set }) => {
      if (!user) {
        set.status = 401;
        throw new Error('Authentication required');
      }

      if (!allowedRoles.includes(user.role)) {
        set.status = 403;
        throw new Error('Insufficient permissions');
      }

      return {};
    })
    .as('plugin');
};

/**
 * Middleware específico para operações administrativas
 * Apenas super e admin podem executar
 */
export const requireAdmin = () => requireRole('super', 'admin');

/**
 * Middleware específico para super admin
 * Apenas super pode executar
 */
export const requireSuper = () => requireRole('super');

/**
 * Middleware para qualquer usuário autenticado
 * Todas as roles podem acessar
 */
export const requireAuth = () => requireRole('super', 'admin', 'user', 'viewer');
