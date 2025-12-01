import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import type { JWTPayload } from '../types/auth.types';

/**
 * Middleware de autenticação JWT
 * Verifica e decodifica o token JWT presente no header Authorization
 */
export const authMiddleware = new Elysia({ name: 'auth' })
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      exp: '7d', // Token expira em 7 dias
    })
  )
  .derive(async ({ jwt, headers, set }) => {
    const authHeader = headers.authorization;

    // Verifica se o header Authorization existe
    if (!authHeader) {
      set.status = 401;
      throw new Error('Authorization header is required');
    }

    // Extrai o token (formato: "Bearer <token>")
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    if (!token) {
      set.status = 401;
      throw new Error('Token is required');
    }

    // Verifica e decodifica o token
    const payload = await jwt.verify(token);

    if (!payload) {
      set.status = 401;
      throw new Error('Invalid or expired token');
    }

    // Retorna o usuário autenticado
    return {
      user: {
        id: (payload as JWTPayload).id,
        username: (payload as JWTPayload).username,
        role: (payload as JWTPayload).role,
      },
      token,
    };
  })
  .as('plugin');
