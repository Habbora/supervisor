import type { User } from '@prisma/client';

// ═══════════════════════════════════════════════════════════════════
// ENUMS & CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const USER_ROLES = ['super', 'admin', 'user', 'viewer'] as const;
export type UserRole = typeof USER_ROLES[number];

// ═══════════════════════════════════════════════════════════════════
// DTOs (Data Transfer Objects)
// ═══════════════════════════════════════════════════════════════════

export type CreateUserDTO = {
    name: string;
    username: string;
    password: string;
    role?: UserRole;
}

export type UpdateUserDTO = {
    name?: string;
    password?: string;
    role?: UserRole;
}

export interface LoginDTO {
    username: string;
    password: string;
}

// ═══════════════════════════════════════════════════════════════════
// RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════

// Tipo de retorno sem senha (seguro para enviar ao cliente)
export type SafeUser = Omit<User, 'password'>;

// Tipo para autenticação (com token)
export interface AuthResponse {
    user: SafeUser;
    token?: string;
}
