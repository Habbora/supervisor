import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import { validateToken, getTokenFromCookies } from '@/lib/auth'

interface ValidateAuthProps {
    children: ReactNode;
    fallback?: ReactNode;
}

export default async function ValidateAuth({
    children,
}: ValidateAuthProps) {
    const token = await getTokenFromCookies();
    if (!token) redirect('/login');

    const authResult = await validateToken(token);
    if (!authResult || !authResult.valid) redirect('/login');

    return <>{children}</>;
}
