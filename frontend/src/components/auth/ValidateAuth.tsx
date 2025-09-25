import { validateToken, getTokenFromCookies, User } from '@/lib/auth'
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

interface ValidateAuthProps {
    children: ReactNode;
    fallback?: ReactNode;
}

export default async function ValidateAuth({
    children,
    fallback = <div>Verificando autenticação...</div>
}: ValidateAuthProps) {
    const token = await getTokenFromCookies();
    if (!token) redirect('/login');
    const authResult = await validateToken(token);
    if (!authResult || !authResult.valid) redirect('/login');
    return <>{children}</>;
}
