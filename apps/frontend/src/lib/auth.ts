// Arquivo para funções de autenticação do servidor
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || 'http://localhost:4001';

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

export interface AuthResponse {
    user: User;
    valid: boolean;
}

/**
 * Valida o token no servidor
 * @param token - Token JWT para validar
 * @returns Dados do usuário se válido, null se inválido
 */
export async function validateToken(token: string): Promise<AuthResponse | null> {
    try {
        const response = await fetch(`${API_URL}/api/v1/auth/validate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            next: { revalidate: 300 }
        });

        console.log('Teste de response:', response);

        if (!response.ok) {
            return null;
        }

        const data = await response.json();

        return {
            user: data.user,
            valid: true
        };
    } catch (error) {
        console.error('Erro ao validar token:', error);
        return null;
    }
}

/**
 * Pega o token dos cookies (mais seguro que localStorage)
 */
export async function getTokenFromCookies(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get('auth-token')?.value || null;
}

/**
 * Salva o token nos cookies
 */
export async function setTokenInCookies(token: string) {
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
        httpOnly: true, // Não pode ser acessado via JavaScript
        secure: process.env.NODE_ENV === 'production', // HTTPS em produção
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 7 dias
    });
}

/**
 * Hook para usar dados do usuário autenticado
 * (Para usar em Client Components)
 */
export async function getCurrentUser(): Promise<User | null> {
    const token = await getTokenFromCookies();
    if (!token) return null;

    const authResult = await validateToken(token);
    return authResult?.user || null;
}