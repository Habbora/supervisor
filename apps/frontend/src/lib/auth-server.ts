// src/lib/auth-server.ts
import { cookies } from 'next/headers';
import { User } from '@/types/auth';

const API_URL = process.env.API_URL || 'http://localhost:4000';

export async function getServerAuth(): Promise<{ user: User | null, token: string | null }> {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
        return { user: null, token: null };
    }

    try {
        const response = await fetch(`${API_URL}/api/v1/auth/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            return { user: null, token: null };
        }

        const data = await response.json();
        return { user: data.user, token };
    } catch (error) {
        console.error('Error validating token:', error);
        return { user: null, token: null };
    }
}